import makeWASocket, {
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import prisma from './prisma';
import { getConversationHistory, saveMessageToHistory, formatHistoryForAI, ensureCustomerExists } from './conversation-history';
import { DatabaseSessionStore } from './whatsapp-session-store';
import { getBotForSession, generateAgentResponse, checkUsageLimit, incrementUsage, incrementTokenUsage } from './ai-response';

export interface WhatsAppSession {
    sessionId: string;
    sock: any;
    qr?: string;
    status: 'connecting' | 'connected' | 'disconnected';
}

const globalForWhatsApp = global as unknown as { activeSessions: Map<string, WhatsAppSession> };
const activeSessions = globalForWhatsApp.activeSessions || new Map<string, WhatsAppSession>();
if (process.env.NODE_ENV !== 'production') globalForWhatsApp.activeSessions = activeSessions;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Reverted to simple file-based auth for local stability
 */
export async function createWhatsAppSession(sessionId: string) {
    const sessionDir = path.join(process.cwd(), 'baileys-sessions', sessionId);

    // 1. Cleanup existing socket if any
    const existing = activeSessions.get(sessionId);
    if (existing?.sock) {
        try {
            existing.sock.ev.removeAllListeners('connection.update');
            existing.sock.ev.removeAllListeners('creds.update');
            existing.sock.ev.removeAllListeners('messages.upsert');
            existing.sock.end(undefined);
        } catch (e) { }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['NanoArtif', 'Chrome', '110.0.0'],
        connectTimeoutMs: 60000,
        retryRequestDelayMs: 5000,
        keepAliveIntervalMs: 30000,
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
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log(`[Session ${sessionId}] Connection closed (Status: ${statusCode}). Should reconnect:`, shouldReconnect);

            if (statusCode === DisconnectReason.badSession || statusCode === 401) {
                console.log(`[Session ${sessionId}] 🚨 Unrecoverable error (Bad Session). Clearing session data.`);
                const sessionDir = path.join(process.cwd(), 'baileys-sessions', sessionId);
                if (fs.existsSync(sessionDir)) {
                    fs.rmSync(sessionDir, { recursive: true, force: true });
                }
                activeSessions.delete(sessionId);

                await prisma.integration.update({
                    where: { id: sessionId },
                    data: { status: 'disconnected' }
                }).catch(() => { });
                return;
            }

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
                    const exists = await prisma.integration.findUnique({ where: { id: sessionId } });
                    if (exists) {
                        await prisma.integration.update({
                            where: { id: sessionId },
                            data: { status: 'disconnected' }
                        });
                    }
                } catch (error: any) {
                    console.error(`[Session ${sessionId}] Failed to update status:`, error.message);
                }
            }
        } else if (connection === 'open') {
            session.status = 'connected';
            session.qr = undefined;
            console.log(`[Session ${sessionId}] ✓ WhatsApp connected successfully!`);

            // Update integration status to 'connected'
            try {
                const exists = await prisma.integration.findUnique({ where: { id: sessionId } });
                if (exists) {
                    await prisma.integration.update({
                        where: { id: sessionId },
                        data: { status: 'connected' }
                    });
                    console.log(`[Session ${sessionId}] Status updated to 'connected' in database`);
                } else {
                    console.log(`[Session ${sessionId}] Integration record gone, stopping session.`);
                    activeSessions.delete(sessionId);
                    sock.logout();
                    return;
                }
            } catch (error: any) {
                console.error(`[Session ${sessionId}] Failed to update status:`, error.message);
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
                const contactName = msg.pushName || from.split('@')[0];
                await ensureCustomerExists(bot.userId, from, contactName);

                // CHECK USAGE LIMIT
                const usageCheck = await checkUsageLimit(bot.userId);
                if (!usageCheck.allowed) {
                    console.log(`Usage limit reached for user ${bot.userId}`);
                    await sock.sendMessage(from, { text: usageCheck.message || 'Limit reached.' });
                    return;
                }

                // CHECK IF CONVERSATION IS PAUSED
                const conversationStatus = await prisma.conversation.findUnique({
                    where: {
                        integrationId_contactNumber: {
                            integrationId: sessionId,
                            contactNumber: from
                        }
                    },
                    select: { isBotPaused: true }
                });

                if (conversationStatus?.isBotPaused) {
                    console.log(`[Session ${sessionId}] Bot is paused for ${from}. Logging message without replying.`);
                    await saveMessageToHistory(sessionId, from, messageText, null, contactName);
                    return;
                }

                // Get conversation history
                const history = await getConversationHistory(sessionId, from);
                console.log(`Conversation history: ${history.length} messages`);

                // Get Customer Context (Long-term memory)
                const cleanPhone = from.replace('@s.whatsapp.net', '');
                const customer = await prisma.customer.findFirst({
                    where: { userId: bot.userId, phone: cleanPhone }
                });

                // Show "typing..." status
                await sock.sendPresenceUpdate('composing', from);

                // Use AI agent to generate response with history & customer info
                const { response, tokensUsed } = await generateAgentResponse(bot.agent, messageText, history, customer);

                // INCREMENT USAGE COUNT & TOKENS
                await incrementUsage(bot.userId);
                await incrementTokenUsage(bot.userId, tokensUsed);

                // Stop "typing..." status
                await sock.sendPresenceUpdate('paused', from);

                // Save conversation
                await saveMessageToHistory(sessionId, from, messageText, response, contactName);

                // Split response into multiple bubbles if delimiter exists
                const bubbles = response.split('\n\n\n').filter(b => b.trim().length > 0);
                console.log(`[Session ${sessionId}] Response split into ${bubbles.length} bubbles`);

                for (let i = 0; i < bubbles.length; i++) {
                    const bubble = bubbles[i];
                    
                    // Show "typing..." status for each bubble
                    await sock.sendPresenceUpdate('composing', from);
                    
                    // Add a small natural delay between bubbles (except the first one which already had a delay from processing)
                    if (i > 0) {
                        // Delay proportional to text length (but min 1.5s, max 3s)
                        const bubbleDelay = Math.min(Math.max(bubble.length * 20, 1500), 3000);
                        await delay(bubbleDelay);
                    }

                    // Check for image tag in this specific bubble
                    const imageMatch = bubble.match(/\[IMAGE:\s*(.*?)\]/i);

                    if (imageMatch && imageMatch[1]) {
                        let imageUrl = imageMatch[1].trim();
                        const caption = bubble.replace(/\[IMAGE:\s*.*?\]/i, '').trim();

                        try {
                            let imageSource: any = { url: imageUrl };

                            // Handle local file uploads (relative path)
                            if (imageUrl.startsWith('/')) {
                                const localPath = path.join(process.cwd(), 'public', imageUrl);
                                if (fs.existsSync(localPath)) {
                                    const fileBuffer = fs.readFileSync(localPath);
                                    imageSource = fileBuffer;
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
                            await sock.sendMessage(from, { text: caption || bubble });
                        }
                    } else {
                        // Send text response for this bubble
                        await sock.sendMessage(from, { text: bubble.trim() });
                    }

                    // Stop "typing..." status
                    await sock.sendPresenceUpdate('paused', from);
                }
            } else {
                // If no agent is configured, stay silent. 
                // This allows the user to use WhatsApp for manual chat or broadcast only.
                console.log(`[Session ${sessionId}] No AI agent linked. Staying silent for message from ${from}`);
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

/**
 * Restore all sessions that should be active
 */
export async function restoreExistingSessions() {
    try {
        const integrations = await prisma.integration.findMany({
            where: {
                platform: 'WhatsApp',
                status: 'connected'
            }
        });

        console.log(`[Service] Found ${integrations.length} sessions to restore`);

        for (const integration of integrations) {
            console.log(`[Service] Restoring session: ${integration.id} (${integration.name})`);
            await createWhatsAppSession(integration.id);
        }
    } catch (error) {
        console.error('[Service] Error restoring sessions:', error);
    }
}

export async function sendMessage(sessionId: string, to: string, message: string) {
    const session = activeSessions.get(sessionId);
    if (!session || session.status !== 'connected') {
        // Coba auto-reconnect jika di database statusnya connected
        const integration = await prisma.integration.findUnique({ where: { id: sessionId } });
        if (integration?.status === 'connected') {
            createWhatsAppSession(sessionId).catch(console.error);
            throw new Error('Sistem sedang menghubungkan ulang bot ke WhatsApp secara otomatis. Mohon tunggu 5 detik dan coba kirim ulang.');
        }
        throw new Error('Bot WhatsApp belum terkoneksi / terputus.');
    }

    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    await session.sock.sendMessage(jid, { text: message });
}

