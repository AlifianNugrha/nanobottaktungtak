import { NextRequest, NextResponse } from 'next/server';
import { createWhatsAppSession, getSession } from '@/lib/whatsapp-service';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, botId } = await req.json();

        // Create integration record
        const integration = await prisma.integration.create({
            data: {
                platform: 'WhatsApp',
                name: name || 'WhatsApp Bot',
                status: 'connecting',
                userId: user.id,
                config: {}
            }
        });

        // 1. If explicit botId provided, link to valid bot
        if (botId) {
            const targetBot = await prisma.bot.findUnique({ where: { id: botId } });
            if (targetBot && targetBot.userId === user.id) {
                console.log(`Linking specific bot ${botId} to integration ${integration.id}`);
                await prisma.bot.update({
                    where: { id: botId },
                    data: { integrationId: integration.id }
                });
            }
        }
        // 2. Otherwise auto-link logic
        else {
            const botsWithAgents = await prisma.bot.findMany({
                where: {
                    userId: user.id,
                    agentId: { not: null },
                    integrationId: null
                }
            });

            if (botsWithAgents.length > 0) {
                console.log(`Auto-linking ${botsWithAgents.length} bot(s) to integration ${integration.id}`);
                await prisma.bot.update({
                    where: { id: botsWithAgents[0].id },
                    data: { integrationId: integration.id }
                });
            } else {
                console.log('No unlinked bots found. Creating new bot for this integration...');
                const defaultAgent = await prisma.agent.findFirst({
                    where: { userId: user.id },
                    orderBy: { createdAt: 'desc' }
                });

                await prisma.bot.create({
                    data: {
                        name: `${name || 'WhatsApp'} Bot`,
                        description: 'Auto-created via Integration',
                        userId: user.id,
                        agentId: defaultAgent?.id || null,
                        integrationId: integration.id,
                        config: { isActive: true, platform: 'WhatsApp' }
                    }
                });
            }
        }

        // Create Baileys session
        const session = await createWhatsAppSession(integration.id);

        return NextResponse.json({
            success: true,
            integrationId: integration.id,
            sessionId: session.sessionId
        });
    } catch (error: any) {
        console.error('Error creating WhatsApp session:', error);
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

        const session = getSession(sessionId);

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({
            sessionId: session.sessionId,
            status: session.status,
            qr: session.qr
        });
    } catch (error: any) {
        console.error('Error getting session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
