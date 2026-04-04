/**
 * Telegram Bot Service
 * Manages Telegram bot sessions using polling (getUpdates)
 */

import TelegramBot from 'node-telegram-bot-api';
import prisma from './prisma';
import { getConversationHistory, saveMessageToHistory, ensureCustomerExists } from './conversation-history';
import { getBotForSession, generateAgentResponse, checkUsageLimit, incrementUsage, incrementTokenUsage } from './ai-response';

export interface TelegramSession {
    sessionId: string;
    bot: TelegramBot;
    botInfo?: TelegramBot.User;
    status: 'connecting' | 'connected' | 'disconnected';
}

const globalForTelegram = global as unknown as { telegramSessions: Map<string, TelegramSession> };
const telegramSessions = globalForTelegram.telegramSessions || new Map<string, TelegramSession>();
if (process.env.NODE_ENV !== 'production') globalForTelegram.telegramSessions = telegramSessions;

/**
 * Create and start a Telegram bot session
 */
export async function createTelegramSession(sessionId: string): Promise<TelegramSession> {
    // 1. Cleanup existing session
    const existing = telegramSessions.get(sessionId);
    if (existing?.bot) {
        try {
            existing.bot.stopPolling();
        } catch (e) { }
    }

    // 2. Get bot token from integration config
    const integration = await prisma.integration.findUnique({
        where: { id: sessionId }
    });

    if (!integration) {
        throw new Error('Integration not found');
    }

    const config = integration.config as any;
    const token = config?.botToken;

    if (!token) {
        throw new Error('Bot token not found in integration config');
    }

    // 3. Create Telegram bot instance with polling
    const bot = new TelegramBot(token, {
        polling: {
            interval: 1000,
            autoStart: false,
            params: {
                timeout: 10
            }
        }
    });

    const session: TelegramSession = {
        sessionId,
        bot,
        status: 'connecting'
    };

    telegramSessions.set(sessionId, session);

    try {
        // 4. Validate token by getting bot info
        const botInfo = await bot.getMe();
        session.botInfo = botInfo;
        session.status = 'connected';

        console.log(`[Telegram ${sessionId}] ✓ Bot connected: @${botInfo.username} (${botInfo.first_name})`);

        // Update integration status
        await prisma.integration.update({
            where: { id: sessionId },
            data: {
                status: 'connected',
                config: {
                    ...config,
                    botUsername: botInfo.username,
                    botName: botInfo.first_name,
                }
            }
        });

        // 5. Setup message handler
        bot.on('message', async (msg) => {
            try {
                await handleTelegramMessage(sessionId, msg);
            } catch (error) {
                console.error(`[Telegram ${sessionId}] Error handling message:`, error);
            }
        });

        // 6. Handle polling errors
        bot.on('polling_error', (error) => {
            console.error(`[Telegram ${sessionId}] Polling error:`, error.message);

            // If token is invalid, stop and mark disconnected
            if (error.message.includes('401') || error.message.includes('ETELEGRAM')) {
                console.log(`[Telegram ${sessionId}] 🚨 Invalid token or bot blocked. Stopping...`);
                session.status = 'disconnected';
                bot.stopPolling();

                prisma.integration.update({
                    where: { id: sessionId },
                    data: { status: 'disconnected' }
                }).catch(() => { });
            }
        });

        // 7. Start polling
        bot.startPolling();
        console.log(`[Telegram ${sessionId}] Polling started`);

    } catch (error: any) {
        console.error(`[Telegram ${sessionId}] Failed to connect:`, error.message);
        session.status = 'disconnected';

        await prisma.integration.update({
            where: { id: sessionId },
            data: { status: 'disconnected' }
        }).catch(() => { });

        telegramSessions.delete(sessionId);
        throw error;
    }

    return session;
}

/**
 * Handle incoming Telegram message
 */
async function handleTelegramMessage(sessionId: string, msg: TelegramBot.Message) {
    const session = telegramSessions.get(sessionId);
    if (!session || session.status !== 'connected') return;

    // Only process text messages
    const messageText = msg.text;
    if (!messageText) return;

    // Ignore commands like /start for now (or handle them specially)
    if (messageText === '/start') {
        await session.bot.sendMessage(msg.chat.id, '👋 Halo! Selamat datang. Silakan kirim pesan Anda dan saya akan membantu.');
        return;
    }

    const chatId = msg.chat.id.toString();
    const contactName = msg.from?.first_name || msg.from?.username || chatId;
    const contactIdentifier = `tg_${chatId}`; // Prefix to distinguish from WhatsApp numbers

    console.log(`[Telegram ${sessionId}] Message from ${contactName} (${chatId}): ${messageText}`);

    // Get bot configuration
    const bot = await getBotForSession(sessionId);

    if (bot && bot.agent) {
        // Save/Ensure Customer Exists
        await ensureCustomerExists(bot.userId, contactIdentifier, contactName);

        // CHECK USAGE LIMIT
        const usageCheck = await checkUsageLimit(bot.userId);
        if (!usageCheck.allowed) {
            console.log(`[Telegram ${sessionId}] Usage limit reached for user ${bot.userId}`);
            await session.bot.sendMessage(msg.chat.id, usageCheck.message || 'Limit reached.');
            return;
        }

        // CHECK IF CONVERSATION IS PAUSED
        const conversationStatus = await prisma.conversation.findUnique({
            where: {
                integrationId_contactNumber: {
                    integrationId: sessionId,
                    contactNumber: contactIdentifier
                }
            },
            select: { isBotPaused: true }
        });

        if (conversationStatus?.isBotPaused) {
            console.log(`[Telegram ${sessionId}] Bot is paused for ${contactIdentifier}. Logging message without replying.`);
            await saveMessageToHistory(sessionId, contactIdentifier, messageText, null, contactName);
            return;
        }

        // Get conversation history
        const history = await getConversationHistory(sessionId, contactIdentifier);
        console.log(`[Telegram ${sessionId}] Conversation history: ${history.length} messages`);

        // Get Customer Context
        const customer = await prisma.customer.findFirst({
            where: { userId: bot.userId, phone: contactIdentifier }
        });

        // Show "typing..." status
        await session.bot.sendChatAction(msg.chat.id, 'typing');

        // Generate AI response
        const { response, tokensUsed } = await generateAgentResponse(bot.agent, messageText, history, customer);

        // INCREMENT USAGE COUNT & TOKENS
        await incrementUsage(bot.userId);
        await incrementTokenUsage(bot.userId, tokensUsed);

        // Save conversation
        await saveMessageToHistory(sessionId, contactIdentifier, messageText, response, contactName);

        // Send response
        await session.bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' }).catch(async () => {
            // Fallback: send without markdown if parsing fails
            await session.bot.sendMessage(msg.chat.id, response);
        });

        console.log(`[Telegram ${sessionId}] Response sent to ${contactName}`);
    } else {
        console.log(`[Telegram ${sessionId}] No AI agent linked. Staying silent for message from ${contactName}`);
    }
}

/**
 * Get active Telegram session
 */
export function getTelegramSession(sessionId: string): TelegramSession | undefined {
    return telegramSessions.get(sessionId);
}

/**
 * Get all active Telegram sessions
 */
export function getAllTelegramSessions(): TelegramSession[] {
    return Array.from(telegramSessions.values());
}

/**
 * Delete/stop a Telegram session
 */
export async function deleteTelegramSession(sessionId: string) {
    const session = telegramSessions.get(sessionId);
    if (session?.bot) {
        try {
            session.bot.stopPolling();
        } catch (e) { }
    }
    telegramSessions.delete(sessionId);
}

/**
 * Send a message to a Telegram chat
 */
export async function sendTelegramMessage(sessionId: string, chatId: string, message: string) {
    const session = telegramSessions.get(sessionId);
    if (!session || session.status !== 'connected') {
        // Try auto-reconnect
        const integration = await prisma.integration.findUnique({ where: { id: sessionId } });
        if (integration?.status === 'connected') {
            createTelegramSession(sessionId).catch(console.error);
            throw new Error('Sistem sedang menghubungkan ulang bot Telegram. Mohon tunggu 5 detik dan coba kirim ulang.');
        }
        throw new Error('Bot Telegram belum terkoneksi / terputus.');
    }

    // Remove the 'tg_' prefix if present to get the actual chat ID
    const actualChatId = chatId.startsWith('tg_') ? chatId.replace('tg_', '') : chatId;

    await session.bot.sendMessage(Number(actualChatId), message, { parse_mode: 'Markdown' }).catch(async () => {
        // Fallback without markdown
        await session.bot.sendMessage(Number(actualChatId), message);
    });
}

/**
 * Restore all existing Telegram sessions on server start
 */
export async function restoreExistingTelegramSessions() {
    try {
        const integrations = await prisma.integration.findMany({
            where: {
                platform: 'Telegram',
                status: 'connected'
            }
        });

        console.log(`[Telegram Service] Found ${integrations.length} Telegram sessions to restore`);

        for (const integration of integrations) {
            console.log(`[Telegram Service] Restoring session: ${integration.id} (${integration.name})`);
            try {
                await createTelegramSession(integration.id);
            } catch (error: any) {
                console.error(`[Telegram Service] Failed to restore ${integration.id}:`, error.message);
            }
        }
    } catch (error) {
        console.error('[Telegram Service] Error restoring sessions:', error);
    }
}

/**
 * Validate a Telegram bot token
 */
export async function validateTelegramToken(token: string): Promise<{ valid: boolean; botInfo?: any; error?: string }> {
    try {
        const tempBot = new TelegramBot(token);
        const botInfo = await tempBot.getMe();
        return { valid: true, botInfo };
    } catch (error: any) {
        return { valid: false, error: error.message };
    }
}
