/**
 * Shared AI Response Generator
 * Used by both WhatsApp and Telegram services
 */

import prisma from './prisma';
import Groq from 'groq-sdk';
import path from 'path';
import fs from 'fs';

// === GET BOT FOR SESSION ===
export async function getBotForSession(sessionId: string) {
    try {
        console.log('Looking for bot with sessionId:', sessionId);

        const integration = await prisma.integration.findUnique({
            where: { id: sessionId },
            include: {
                bots: {
                    where: {
                        agentId: { not: null }
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

// === GENERATE AI RESPONSE ===
export async function generateAgentResponse(agent: any, userMessage: string, history: any[] = [], customer: any = null): Promise<{ response: string; tokensUsed: number }> {
    try {
        const config = agent.config || {};
        
        let apiKey = process.env.GROQ_API_KEY;
        let isUsingCustomKey = false;
        
        if ((config.useCustomKey === 'true' || config.useCustomKey === true) && config.customGroqKey) {
            apiKey = config.customGroqKey;
            isUsingCustomKey = true;
            console.log(`[BYOK] Agent ${agent.name} is using Custom Groq API Key`);
        }

        if (!apiKey) {
            console.error('GROQ_API_KEY not found in environment variables AND no custom key provided');
            return { response: 'Maaf, konfigurasi AI belum lengkap. Silakan hubungi administrator.', tokensUsed: 0 };
        }

        const groq = new Groq({ apiKey });

        // FETCH REAL-TIME PRODUCTS
        const dbProducts = await prisma.product.findMany({
            where: { userId: agent.userId }
        });

        let systemPrompt = config.instructions || `Anda adalah ${agent.name}. Asisten toko yang ramah.`;

        // Inject CUSTOMER PROFILE
        if (customer) {
            systemPrompt += `\n\n=== 👤 KONTEKS CUSTOMER (REFERENSI DATA) ===
- Nama Terdaftar: ${customer.name || 'Belum tahu'}
- No. Telp: ${customer.phone}

PENTING: Nama di atas adalah data dari database. Jika di dalam percakapan (Chat History) user memperkenalkan diri dengan nama lain (misal: "Nama saya Bapak Rangga"), kamu WAJIB menggunakan nama yang disebut user di chat tersebut. Abaikan data database jika berbeda dengan pengakuan user di chat.`;
        }

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
            // Legacy File Support
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

            systemPrompt += `\n\n=== 🔴 DATABASE PRODUK TOKO (LIVE) ===\nBerikut ini adalah katalog produk yang bisa Anda tawarkan kepada pelanggan:\n\n${productContext}\n\n[PANDUAN MENGIRIM GAMBAR PENTING]:\nJika pelanggan meminta melihat gambar suatu produk, ATAU kamu sedang merekomendasikan produk yang memiliki ImageURL valid (bukan KOSONG), kamu SANGAT DISARANKAN melampirkan gambar dengan menyisipkan format persis seperti ini di balasanmu:\n[IMAGE: (paste url di sini)]\n\nContoh yang Benar:\n"Tentu kak, ini fotonya ya:\n[IMAGE: https://xxx]\nHarganya cuma 10 ribu lho."`;
            console.log(`Injecting ${dbProducts.length} products into AI Context.`);
        } else {
            systemPrompt += `\n\n=== INFO ===\nSaat ini stok toko sedang kosong. Jika user tanya produk, minta maaf dan bilang stok belum update.`;
        }

        console.log('Generating AI response for:', userMessage);
        console.log('Using agent:', agent.name);
        console.log('History messages:', history.length);

        // Format history for AI
        const historyMessages = history
            .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
            .map((msg: any) => ({ role: msg.role, content: msg.content }));

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...historyMessages,
                { role: 'user', content: userMessage }
            ],
            model: agent.config?.model || 'llama-3.3-70b-versatile',
            temperature: agent.config?.temperature || 0.7,
            max_tokens: agent.config?.maxTokens || 1024,
        });

        const response = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses pesan Anda saat ini.';
        const tokensUsed = isUsingCustomKey ? 0 : (completion.usage?.total_tokens || Math.ceil((JSON.stringify(history).length + userMessage.length + response.length) / 4));
        console.log(`AI response generated successfully (${tokensUsed} tokens used${isUsingCustomKey ? ' - BYOK bypassed platform deduction' : ''})`);
        return { response, tokensUsed };
    } catch (error: any) {
        console.error('Error generating AI response:', error);
        console.error('Error details:', error.message);

        let fallback: string;
        if (error.message?.includes('API key')) {
            fallback = 'Maaf, terjadi masalah dengan konfigurasi API. Silakan hubungi administrator.';
        } else if (error.message?.includes('rate limit')) {
            fallback = 'Maaf, sistem sedang sibuk. Silakan coba lagi dalam beberapa saat.';
        } else {
            fallback = 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.';
        }
        return { response: fallback, tokensUsed: 0 };
    }
}

// === USAGE LIMIT HELPERS ===

export async function checkUsageLimit(userId: string): Promise<{ allowed: boolean, message?: string }> {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { allowed: false, message: 'User not found' };

        // CHECK SUBSCRIPTION EXPIRY — Auto-downgrade if expired
        if (user.role === 'PRO_USER' && user.subscriptionEnd) {
            const now = new Date();
            if (now > new Date(user.subscriptionEnd)) {
                console.log(`[Subscription] PRO expired for user ${userId}. Auto-downgrading to Free.`);
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        role: 'USER',
                        subscriptionPlan: 'Free',
                        maxTokenLimit: 5000,
                        currentTokenUsage: 0,
                    }
                });
                // After downgrade, continue with Free limits
                return { allowed: true };
            }
        }

        // Admin and Pro users -> Unlimited
        if (user.role === 'ADMIN' || user.role === 'PRO_USER') {
            return { allowed: true };
        }

        // Free User Logic — Daily Message Limit
        const LIMIT = 30;
        const now = new Date();
        const lastDate = new Date(user.lastMessageAt);

        if (lastDate.toDateString() !== now.toDateString()) {
            await prisma.user.update({
                where: { id: userId },
                data: { aiMessageCount: 0, lastMessageAt: now }
            });
            return { allowed: true };
        }

        if ((user as any).aiMessageCount >= LIMIT) {
            return {
                allowed: false,
                message: '⚠️ *Limit Harian Tercapai*\n\nMaaf, kuota bot harian Anda (Free Tier) sudah habis (Maks 30 chat/hari)\n\nUpgrade ke *PRO* untuk unlimited chat 🚀'
            };
        }

        // Free User Token Limit Check
        if ((user.currentTokenUsage || 0) >= (user.maxTokenLimit || 5000)) {
            return {
                allowed: false,
                message: '⚠️ *Token Limit Tercapai*\n\nMaaf, kuota token Anda sudah habis\n\nUpgrade ke *PRO* untuk 100K token/bulan 🚀'
            };
        }

        return { allowed: true };
    } catch (error) {
        console.error('Error checking usage limit:', error);
        return { allowed: true };
    }
}

export async function incrementUsage(userId: string) {
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

// === TOKEN USAGE TRACKING ===
export async function incrementTokenUsage(userId: string, tokensUsed: number) {
    if (tokensUsed <= 0) return;
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                currentTokenUsage: { increment: tokensUsed }
            }
        });
        console.log(`[Token Usage] User ${userId}: +${tokensUsed} tokens`);
    } catch (error) {
        console.error('Error incrementing token usage:', error);
    }
}
