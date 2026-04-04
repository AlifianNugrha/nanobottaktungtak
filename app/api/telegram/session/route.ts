import { NextRequest, NextResponse } from 'next/server';
import { createTelegramSession, getTelegramSession, validateTelegramToken } from '@/lib/telegram-service';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { botToken, name, botId } = await req.json();

        if (!botToken) {
            return NextResponse.json({ error: 'Bot token is required' }, { status: 400 });
        }

        // 1. Validate token
        const validation = await validateTelegramToken(botToken);
        if (!validation.valid) {
            return NextResponse.json({
                error: `Token tidak valid: ${validation.error}. Pastikan token dari @BotFather benar.`
            }, { status: 400 });
        }

        // 2. CLEANUP: Delete old stuck 'connecting' Telegram integrations
        const oldConnecting = await prisma.integration.findMany({
            where: {
                userId: user.id,
                platform: 'Telegram',
                status: 'connecting',
                createdAt: { lt: new Date(Date.now() - 10 * 60 * 1000) }
            }
        });

        if (oldConnecting.length > 0) {
            console.log(`[Telegram Cleanup] Deleting ${oldConnecting.length} stuck integrations`);
            await prisma.integration.deleteMany({
                where: { id: { in: oldConnecting.map(i => i.id) } }
            });
        }

        // 3. Check if bot already connected with same token
        const existingIntegration = await prisma.integration.findFirst({
            where: {
                userId: user.id,
                platform: 'Telegram',
                status: 'connected',
            }
        });

        // Check if token is the same as existing
        if (existingIntegration) {
            const existingConfig = existingIntegration.config as any;
            if (existingConfig?.botToken === botToken) {
                return NextResponse.json({
                    error: 'Bot Telegram ini sudah terhubung sebelumnya.'
                }, { status: 409 });
            }
        }

        // 4. Reuse existing integration for botId if applicable
        let integration;
        if (botId) {
            const existingBot = await prisma.bot.findUnique({
                where: { id: botId },
                include: { integration: true }
            });

            if (existingBot?.integration && existingBot.integration.platform === 'Telegram') {
                console.log(`[Telegram] Reusing existing integration ${existingBot.integration.id}`);
                integration = existingBot.integration;

                await prisma.integration.update({
                    where: { id: integration.id },
                    data: {
                        status: 'connecting',
                        config: {
                            ...(integration.config as any),
                            botToken,
                            botUsername: validation.botInfo?.username,
                            botName: validation.botInfo?.first_name,
                        }
                    }
                });
            }
        }

        // 5. Create new integration if none found
        if (!integration) {
            integration = await prisma.integration.create({
                data: {
                    platform: 'Telegram',
                    name: name || `Telegram @${validation.botInfo?.username || 'Bot'}`,
                    status: 'connecting',
                    userId: user.id,
                    config: {
                        botToken,
                        botUsername: validation.botInfo?.username,
                        botName: validation.botInfo?.first_name,
                    }
                }
            });
            console.log(`[Telegram] Created new integration ${integration.id}`);
        }

        // 6. Link bot if provided
        if (botId) {
            const targetBot = await prisma.bot.findUnique({ where: { id: botId } });
            if (targetBot && targetBot.userId === user.id) {
                await prisma.bot.update({
                    where: { id: botId },
                    data: { integrationId: integration.id }
                });
            }
        } else {
            // Auto-link to unlinked bot
            const unlinkedBots = await prisma.bot.findMany({
                where: {
                    userId: user.id,
                    agentId: { not: null },
                    integrationId: null
                }
            });

            if (unlinkedBots.length > 0) {
                await prisma.bot.update({
                    where: { id: unlinkedBots[0].id },
                    data: { integrationId: integration.id }
                });
            } else {
                // Create new bot
                const defaultAgent = await prisma.agent.findFirst({
                    where: { userId: user.id },
                    orderBy: { createdAt: 'desc' }
                });

                await prisma.bot.create({
                    data: {
                        name: `${name || 'Telegram'} Bot`,
                        description: 'Auto-created via Telegram Integration',
                        userId: user.id,
                        agentId: defaultAgent?.id || null,
                        integrationId: integration.id,
                        config: { isActive: true, platform: 'Telegram' }
                    }
                });
            }
        }

        // 7. Start Telegram session
        const session = await createTelegramSession(integration.id);

        return NextResponse.json({
            success: true,
            integrationId: integration.id,
            sessionId: session.sessionId,
            botUsername: session.botInfo?.username,
            botName: session.botInfo?.first_name,
            status: session.status
        });
    } catch (error: any) {
        console.error('Error creating Telegram session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const session = getTelegramSession(sessionId);

        if (!session) {
            // Check DB status
            const integration = await prisma.integration.findUnique({
                where: { id: sessionId }
            });

            return NextResponse.json({
                sessionId,
                status: integration?.status || 'disconnected',
                botUsername: (integration?.config as any)?.botUsername,
                botName: (integration?.config as any)?.botName,
            });
        }

        return NextResponse.json({
            sessionId: session.sessionId,
            status: session.status,
            botUsername: session.botInfo?.username,
            botName: session.botInfo?.first_name,
        });
    } catch (error: any) {
        console.error('Error getting Telegram session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const { deleteTelegramSession } = await import('@/lib/telegram-service');
        await deleteTelegramSession(sessionId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
