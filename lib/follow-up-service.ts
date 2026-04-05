import prisma from './prisma';
import { getBotForSession, generateFollowUpResponse, incrementUsage, incrementTokenUsage } from './ai-response';
import { getSession as getWhatsAppSession } from './whatsapp-service';
import { getTelegramSession } from './telegram-service';
import { saveMessageToHistory } from './conversation-history';

/**
 * Main function to check and send follow-ups
 * Should be called periodically (e.g., every 10 minutes)
 */
export async function checkAndSendFollowUps() {
    console.log('[Follow-up Service] Starting periodic check...');

    try {
        // 1. Find conversations that haven't been updated for at least 1 hour
        // and haven't received a follow-up yet.
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000);

        const staleConversations = await (prisma.conversation as any).findMany({
            where: {
                updatedAt: {
                    lt: oneHourAgo,
                    gt: twoHoursAgo
                },
                lastFollowUpAt: null,
                isBotPaused: false
            },
            include: {
                integration: true
            }
        });

        console.log(`[Follow-up Service] Found ${staleConversations.length} candidate conversations`);

        for (const conv of staleConversations) {
            try {
                const messages = (conv.messages as any) || [];
                if (messages.length === 0) continue;

                const lastMessage = messages[messages.length - 1];

                if (lastMessage.role !== 'assistant') {
                    console.log(`[Follow-up Service] Skipping ${conv.contactNumber} - Last message was from user.`);
                    continue;
                }

                const bot = await getBotForSession(conv.integrationId);
                if (!bot || !bot.agent) {
                    console.log(`[Follow-up Service] No active bot/agent for integration ${conv.integrationId}`);
                    continue;
                }

                console.log(`[Follow-up Service] Processing follow-up for ${conv.contactNumber} (${conv.integration.platform})`);

                const cleanPhone = conv.contactNumber.replace('@s.whatsapp.net', '').replace('tg_', '');
                const recentSale = await prisma.sale.findFirst({
                    where: {
                        userId: (bot as any).userId,
                        OR: [
                            { customerName: conv.contactName || undefined }
                        ],
                        status: 'Completed',
                        createdAt: {
                            gt: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    }
                });

                if (recentSale) {
                    console.log(`[Follow-up Service] Skipping ${conv.contactNumber} - Found recent completed sale.`);
                    await (prisma.conversation as any).update({
                        where: { id: conv.id },
                        data: { lastFollowUpAt: new Date() }
                    });
                    continue;
                }

                const { response, tokensUsed } = await generateFollowUpResponse(bot.agent, messages);

                if (!response) {
                    console.log(`[Follow-up Service] AI skipped follow-up (conclusion detected) for ${conv.contactNumber}`);
                    await (prisma.conversation as any).update({
                        where: { id: conv.id },
                        data: { lastFollowUpAt: new Date() }
                    });
                    continue;
                }

                let sent = false;
                if (conv.integration.platform === 'WhatsApp') {
                    const session = getWhatsAppSession(conv.integrationId);
                    if (session?.status === 'connected') {
                        const bubbles = response.split('\n\n\n').filter(b => b.trim().length > 0);
                        for (const bubble of bubbles) {
                            await session.sock.sendMessage(conv.contactNumber, { text: bubble.trim() });
                        }
                        sent = true;
                    }
                } else if (conv.integration.platform === 'Telegram') {
                    const session = getTelegramSession(conv.integrationId);
                    if (session?.status === 'connected') {
                        const chatId = conv.contactNumber.replace('tg_', '');
                        const bubbles = response.split('\n\n\n').filter(b => b.trim().length > 0);
                        for (const bubble of bubbles) {
                            await session.bot.sendMessage(chatId, bubble.trim(), { parse_mode: 'Markdown' }).catch(() => {
                                session.bot.sendMessage(chatId, bubble.trim());
                            });
                        }
                        sent = true;
                    }
                }

                if (sent) {
                    console.log(`[Follow-up Service] ✓ Follow-up sent to ${conv.contactNumber}`);
                    
                    await (prisma.conversation as any).update({
                        where: { id: conv.id },
                        data: { lastFollowUpAt: new Date() }
                    });

                    await saveMessageToHistory(conv.integrationId, conv.contactNumber, '(System Follow-up)', response, conv.contactName || 'Customer');
                    
                    await incrementUsage((bot as any).userId);
                    await incrementTokenUsage((bot as any).userId, tokensUsed);
                }

            } catch (convError) {
                console.error(`[Follow-up Service] Error processing conversation ${conv.id}:`, convError);
            }
        }
    } catch (error) {
        console.error('[Follow-up Service] Critical error in periodic check:', error);
    }
}
