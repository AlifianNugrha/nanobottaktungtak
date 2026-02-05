import makeWASocket, {
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    BufferJSON,
    initAuthCreds,
    AuthenticationCreds,
    SignalDataTypeMap
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import prisma from './prisma';
import Groq from 'groq-sdk';
import { getConversationHistory, saveMessageToHistory, formatHistoryForAI, ensureCustomerExists } from './conversation-history';
import { DatabaseSessionStore } from './whatsapp-session-store';

export interface WhatsAppSession {
    sessionId: string;
    sock: any;
    qr?: string;
    status: 'connecting' | 'connected' | 'disconnected';
}

const activeSessions = new Map<string, WhatsAppSession>();

// Flag to track if sessions have been restored
let sessionsRestored = false;

/**
 * Restore all existing WhatsApp sessions from database on server startup
 * This ensures sessions persist across Railway deployments
 */
export async function restoreExistingSessions() {
    if (sessionsRestored) {
        console.log('[Session Restore] Already restored, skipping...');
        return;
    }

    try {
        console.log('[Session Restore] Starting session restoration...');

        // Get all integrations that have WhatsApp sessions in database
        const sessions = await prisma.whatsAppSession.findMany({
            select: {
                sessionId: true,
                updatedAt: true
            }
        });

        console.log(`[Session Restore] Found ${sessions.length} sessions in database`);

        // Restore each session
        for (const session of sessions) {
            try {
                console.log(`[Session Restore] Restoring session: ${session.sessionId}`);

                // Check if session is already active
                if (activeSessions.has(session.sessionId)) {
                    console.log(`[Session Restore] Session ${session.sessionId} already active, skipping...`);
                    continue;
                }

                // Recreate the WhatsApp connection
                await createWhatsAppSession(session.sessionId);

                // Small delay to prevent overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`[Session Restore] Failed to restore session ${session.sessionId}:`, error);
            }
        }

        sessionsRestored = true;
        console.log('[Session Restore] Session restoration complete');
    } catch (error) {
        console.error('[Session Restore] Error during session restoration:', error);
    }
}

// Database-backed auth state (replaces useMultiFileAuthState)
async function useDatabaseAuthState(store: DatabaseSessionStore, savedState: any) {
    let creds: AuthenticationCreds;
    let keys: any = {};

    if (savedState) {
        creds = savedState.creds;
        keys = savedState.keys || {};
    } else {
        creds = initAuthCreds();
    }

    const saveCreds = async () => {
        await store.saveState({ creds, keys });
    };

    return {
        state: { creds, keys },
        saveCreds
    };
}

export async function createWhatsAppSession(sessionId: string) {
    const sessionStore = new DatabaseSessionStore(sessionId);

    // Load or initialize auth state
    const savedState = await sessionStore.loadState();
    const { state, saveCreds } = await useDatabaseAuthState(sessionStore, savedState);

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: ['Nexora Bot', 'Chrome', '1.0.0'],
    });

    const session: WhatsAppSession = {
        sessionId,
        sock,
        status: 'connecting'
    };

    activeSessions.set(sessionId, session);

    // QR Code handler
    sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        console.log(`[Connection Update] Session ${sessionId}:`, {
            connection,
            qr: qr ? 'QR Generated' : 'No QR',
            lastDisconnect: lastDisconnect ? 'Yes' : 'No'
        });

        if (qr) {
            session.qr = qr;
            session.status = 'connecting';

            // Update integration status to 'connecting'
            try {
                const exists = await prisma.integration.findUnique({ where: { id: sessionId } });
                if (!exists) {
                    console.log(`[Session ${sessionId}] Integration missing, stopping session.`);
                    activeSessions.delete(sessionId);
                    sock.logout();
                    return;
                }

                await prisma.integration.update({
                    where: { id: sessionId },
                    data: { status: 'connecting' }
                });
                console.log(`[Session ${sessionId}] Status updated to 'connecting' in database`);
            } catch (error: any) {
                console.error(`[Session ${sessionId}] Failed to update status:`, error.message);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log(`[Session ${sessionId}] Connection closed. Should reconnect:`, shouldReconnect);

            if (shouldReconnect) {
                console.log(`[Session ${sessionId}] Attempting to reconnect...`);

                // Update status to 'disconnected' temporarily
                try {
                    const exists = await prisma.integration.findUnique({ where: { id: sessionId } });
                    if (!exists) {
                        console.log(`[Session ${sessionId}] Integration record gone, stopping reconnect loop.`);
                        activeSessions.delete(sessionId);
                        return;
                    }

                    await prisma.integration.update({
                        where: { id: sessionId },
                        data: { status: 'disconnected' }
                    });
                } catch (error: any) {
                    console.error(`[Session ${sessionId}] Failed to update status:`, error.message);
                    if (error.code === 'P2025') {
                        activeSessions.delete(sessionId);
                        return;
                    }
                }

                // Wait a bit before reconnecting
                setTimeout(() => {
                    createWhatsAppSession(sessionId);
                }, 3000);
            } else {
                console.log(`[Session ${sessionId}] Logged out, not reconnecting`);
                session.status = 'disconnected';
                activeSessions.delete(sessionId);

                // Update integration status to 'disconnected'
                try {
                    await prisma.integration.update({
                        where: { id: sessionId },
                        data: { status: 'disconnected' }
                    });
                } catch (error) {
                    console.error(`[Session ${sessionId}] Failed to update status:`, error);
                }
            }
        } else if (connection === 'open') {
            session.status = 'connected';
            session.qr = undefined;
            console.log(`[Session ${sessionId}] ✓ WhatsApp connected successfully!`);

            // Update integration status to 'connected'
            try {
                await prisma.integration.update({
                    where: { id: sessionId },
                    data: { status: 'connected' }
                });
                console.log(`[Session ${sessionId}] Status updated to 'connected' in database`);
            } catch (error) {
                console.error(`[Session ${sessionId}] Failed to update status:`, error);
            }
        }
    });

    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);

    // Message handler - Listen for incoming messages
    sock.ev.on('messages.upsert', async (m: any) => {
        try {
            const msg = m.messages[0];
            if (!msg.message) return; // Ignore if no message content
            if (msg.key.fromMe) return; // Ignore messages sent by the bot itself

            const messageText = msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                '';

            if (!messageText) return; // Ignore if no text content

            const from = msg.key.remoteJid;

            // IGNORE GROUP MESSAGES
            if (from.endsWith('@g.us')) {
                console.log('Ignoring group message from:', from);
                return;
            }

            console.log('Received message from:', from);
            console.log('Message:', messageText);

            // Get bot configuration from database
            const bot = await getBotForSession(sessionId);

            if (bot && bot.agent) {
                // Save/Ensure Customer Exists
                const contactName = msg.pushName || from.replace('@s.whatsapp.net', '');
                await ensureCustomerExists(bot.userId, from, contactName);

                // CHECK USAGE LIMIT
                const usageCheck = await checkUsageLimit(bot.userId);
                if (!usageCheck.allowed) {
                    console.log(`Usage limit reached for user ${bot.userId}`);
                    await sock.sendMessage(from, { text: usageCheck.message || 'Limit reached.' });
                    return;
                }

                // Get conversation history
                const history = await getConversationHistory(sessionId, from);
                console.log(`Conversation history: ${history.length} messages`);

                // Show "typing..." status
                await sock.sendPresenceUpdate('composing', from);

                // Use AI agent to generate response with history
                const response = await generateAgentResponse(bot.agent, messageText, history);

                // INCREMENT USAGE COUNT
                await incrementUsage(bot.userId);

                // Stop "typing..." status
                await sock.sendPresenceUpdate('paused', from);

                // Save conversation
                await saveMessageToHistory(sessionId, from, messageText, response);

                // Check for image tag in response
                const imageMatch = response.match(/\[IMAGE:\s*(.*?)\]/i);

                if (imageMatch && imageMatch[1]) {
                    let imageUrl = imageMatch[1].trim();
                    const caption = response.replace(/\[IMAGE:\s*.*?\]/i, '').trim();

                    try {
                        let imageSource: any = { url: imageUrl };

                        // Handle local file uploads (relative path)
                        if (imageUrl.startsWith('/')) {
                            const localPath = path.join(process.cwd(), 'public', imageUrl);
                            if (fs.existsSync(localPath)) {
                                const fileBuffer = fs.readFileSync(localPath);
                                imageSource = fileBuffer; // Baileys accepts buffer directly
                            } else {
                                const fullUrl = new URL(imageUrl, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').toString();
                                imageSource = { url: fullUrl };
                            }
                        }

                        await sock.sendMessage(from, {
                            image: imageSource,
                            caption: caption
                        });
                    } catch (imgError) {
                        console.error('Failed to send image, falling back to text:', imgError);
                        await sock.sendMessage(from, { text: caption || response });
                    }
                } else {
                    // Send text response
                    await sock.sendMessage(from, { text: response });
                }
            } else {
                // Default auto-reply if no agent configured
                const defaultReply = `Terima kasih atas pesan Anda: "${messageText}"\n\nBot ini sedang aktif dan siap membantu! 🤖`;
                await sock.sendMessage(from, { text: defaultReply });
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    return session;
}

export function getSession(sessionId: string): WhatsAppSession | undefined {
    return activeSessions.get(sessionId);
}

export function getAllSessions(): WhatsAppSession[] {
    return Array.from(activeSessions.values());
}

export async function deleteSession(sessionId: string) {
    const session = activeSessions.get(sessionId);
    if (session) {
        await session.sock?.logout();
        activeSessions.delete(sessionId);
    }

    // Delete from database
    const sessionStore = new DatabaseSessionStore(sessionId);
    await sessionStore.deleteState();
}

export async function sendMessage(sessionId: string, to: string, message: string) {
    const session = activeSessions.get(sessionId);
    if (!session || session.status !== 'connected') {
        throw new Error('Session not connected');
    }

    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    await session.sock.sendMessage(jid, { text: message });
}

// Helper function to get bot configuration for a session
async function getBotForSession(sessionId: string) {
    try {
        console.log('Looking for bot with sessionId:', sessionId);

        const integration = await prisma.integration.findUnique({
            where: { id: sessionId },
            include: {
                bots: {
                    where: {
                        agentId: { not: null } // Only get bots with agents
                    },
                    include: {
                        agent: true
                    },
                    take: 1
                }
            }
        });

        console.log('Integration found:', integration?.name);
        console.log('Bots found:', integration?.bots?.length);

        if (integration?.bots?.[0]) {
            console.log('Bot found:', integration.bots[0].name);
            console.log('Agent found:', integration.bots[0].agent?.name);
        } else {
            console.log('No bot with agent found for this integration');
        }

        return integration?.bots?.[0] || null;
    } catch (error) {
        console.error('Error getting bot for session:', error);
        return null;
    }
}


// Helper function to generate AI response using agent configuration
async function generateAgentResponse(agent: any, userMessage: string, history: any[] = []): Promise<string> {
    try {
        // Check if API key exists
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error('GROQ_API_KEY not found in environment variables');
            return 'Maaf, konfigurasi AI belum lengkap. Silakan hubungi administrator.';
        }

        const groq = new Groq({
            apiKey: apiKey
        });

        // FETCH REAL-TIME PRODUCTS
        // Only fetch products belonging to the agent's owner
        const dbProducts = await prisma.product.findMany({
            where: {
                userId: agent.userId
            }
        });

        const config = agent.config || {};
        let systemPrompt = config.instructions || `Anda adalah ${agent.name}. Asisten toko yang ramah.`;

        // Inject KNOWLEDGE BASE
        // Inject KNOWLEDGE BASE (RAG Lite)
        const knowledgeDocs = await (prisma as any).knowledgeDoc.findMany({
            where: { agentId: agent.id }
        });

        if (knowledgeDocs.length > 0) {
            let knowledgeText = '\n\n=== 📚 KNOWLEDGE BASE (DOKUMEN PENTING) ===\nGunakan informasi berikut untuk menjawab pertanyaan user secara akurat:\n';

            for (const doc of knowledgeDocs) {
                knowledgeText += `\n--- [Topik: ${doc.title}] ---\n${doc.content}\n`;
            }
            systemPrompt += knowledgeText;
            console.log(`Injecting ${knowledgeDocs.length} knowledge docs into AI Context.`);
        } else {
            // Legacy File Support (Optional fallback)
            const knowledgeFiles = config.knowledge || [];
            if (knowledgeFiles.length > 0) {
                let knowledgeText = '\n\n=== 📚 KNOWLEDGE BASE (FILE) ===\n';
                for (const file of knowledgeFiles) {
                    try {
                        const filePath = path.join(process.cwd(), 'public', file.path);
                        if (fs.existsSync(filePath)) {
                            const content = fs.readFileSync(filePath, 'utf-8');
                            knowledgeText += `\n--- [Dokumen: ${file.name}] ---\n${content}\n`;
                        }
                    } catch (e) { console.error('Error reading knowledge file:', file.path); }
                }
                systemPrompt += knowledgeText;
            }
        }

        // Inject LIVE product knowledge
        if (dbProducts.length > 0) {
            const productContext = dbProducts.map((p: any) => {
                return `- ID: ${p.id}\n  Nama: ${p.name}\n  Deskripsi: ${p.description || 'Tidak ada info'}\n  Harga: Rp ${p.price}\n  Stok: ${p.stock}\n  ImageURL: ${p.image || 'KOSONG'}`;
            }).join('\n\n');

            systemPrompt += `\n\n=== 🔴 DATABASE PRODUK TOKO (LIVE) ===\nKamu HANYA menjual produk-produk di bawah ini. HARAM hukumnya merekomendasikan produk di luar daftar ini.\n\n${productContext}\n\n=== 🔴 ATURAN MUTLAK ===\n1. KNOWLEDGE BATAS: Kamu TIDAK TAHU produk lain selain yang ada di daftar di atas. Jika user tanya produk yang tidak ada di daftar, jawab jujur: "Maaf kak, item itu lagi kosong/gak ada. Tapi aku ada rekomendasi lain nih..."\n2. SARAN PRODUK: Kalau user minta rekomendasi, pilih DARI DAFTAR DI ATAS. Jangan ngarang.\n3. FORMAT GAMBAR (PENTING): Jika ingin mengirim foto produk, SANGAT WAJIB menuliskan kode ini di akhir pesan: [IMAGE: URL_GAMBAR_DARI_DATA]. JANGAN menampilkan link gambar secara langsung di teks. JANGAN pakai markdown image syntax (![]()).\n4. GAYA BICARA: Santai, gaul, akrab (pake "kak", "gan", "siap").\n5. HARGA: Sebutkan harga sesuai data.`;

            console.log(`Injecting ${dbProducts.length} products into AI Context.`);
        } else {
            systemPrompt += `\n\n=== INFO ===\nSaat ini stok toko sedang kosong. Jika user tanya produk, minta maaf dan bilang stok belum update.`;
        }

        console.log('Generating AI response for:', userMessage);
        console.log('Using agent:', agent.name);
        console.log('History messages:', history.length);

        // Format history for AI
        const historyMessages = formatHistoryForAI(history);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                ...historyMessages,  // Include conversation history
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            model: agent.config?.model || 'llama-3.3-70b-versatile',
            temperature: agent.config?.temperature || 0.7,
            max_tokens: agent.config?.maxTokens || 1024,
        });

        const response = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses pesan Anda saat ini.';
        console.log('AI response generated successfully');
        return response;
    } catch (error: any) {
        console.error('Error generating AI response:', error);
        console.error('Error details:', error.message);

        // Return user-friendly error message
        if (error.message?.includes('API key')) {
            return 'Maaf, terjadi masalah dengan konfigurasi API. Silakan hubungi administrator.';
        } else if (error.message?.includes('rate limit')) {
            return 'Maaf, sistem sedang sibuk. Silakan coba lagi dalam beberapa saat.';
        } else {
            return 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.';
        }
    }
}

// === USAGE LIMIT HELPERS ===

async function checkUsageLimit(userId: string): Promise<{ allowed: boolean, message?: string }> {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { allowed: false, message: 'User not found' };

        // Admin and Pro users -> Unlimited
        if (user.role === 'ADMIN' || user.role === 'PRO_USER') {
            return { allowed: true };
        }

        // Free User Logic
        const LIMIT = 50; // Free limit per day
        const now = new Date();
        const lastDate = new Date(user.lastMessageAt);

        // Reset if new day (simple check: different date string)
        if (lastDate.toDateString() !== now.toDateString()) {
            // Reset counter
            await prisma.user.update({
                where: { id: userId },
                data: { aiMessageCount: 0, lastMessageAt: now }
            });
            return { allowed: true };
        }

        if ((user as any).aiMessageCount >= LIMIT) {
            return {
                allowed: false,
                message: '⚠️ *Limit Harian Tercapai*\n\nMaaf, kuota bot harian Anda (Free Tier) sudah habis (Maks 50 chat/hari).\n\nUpgrade ke *PRO* untuk unlimited chat! 🚀'
            };
        }

        return { allowed: true };
    } catch (error) {
        console.error('Error checking usage limit:', error);
        return { allowed: true };
    }
}

async function incrementUsage(userId: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                aiMessageCount: { increment: 1 },
                lastMessageAt: new Date()
            } as any
        });
    } catch (error) {
        console.error('Error incrementing usage:', error);
    }
}


