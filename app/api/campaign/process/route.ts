
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMessage } from '@/lib/whatsapp-service';

// This API is called repeatedly/periodically by the client to process the queue
// Safe way to handle long running processes in Vercel (Client-driven Queue)
export async function POST(req: Request) {
    try {
        const { campaignId } = await req.json();

        if (!campaignId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const campaign = await (prisma as any).campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign || campaign.status !== 'sending') {
            return NextResponse.json({ message: 'Campaign not sending' });
        }

        // Fetch PENDING recipients (Limit 5 per batch to avoid timeout)
        const pendingRecipients = await (prisma as any).campaignRecipient.findMany({
            where: {
                campaignId,
                status: 'pending'
            },
            take: 5
        });

        if (pendingRecipients.length === 0) {
            // Mark campaign as completed if no more pending
            await (prisma as any).campaign.update({
                where: { id: campaignId },
                data: { status: 'completed' }
            });
            return NextResponse.json({ status: 'completed' });
        }

        // Get integration ID (Assume first connected integration for user)
        // In robust app, user selects which number to send from
        const user = await prisma.user.findUnique({
            where: { id: campaign.userId },
            include: { integrations: { where: { status: 'connected' } } }
        });

        const integration = user?.integrations[0];
        if (!integration) {
            return NextResponse.json({ error: 'No active WhatsApp integration found' }, { status: 500 });
        }

        const stats = { sent: 0, failed: 0 };

        // Process Batch
        for (const recipient of pendingRecipients) {
            try {
                // Personalize Message (Replace {{name}})
                const text = campaign.messageTemplate.replace(/{{name}}/g, recipient.customerName || 'Kak');

                // Send Message
                await sendMessage(integration.id, recipient.customerPhone, text);

                // Update Status
                await (prisma as any).campaignRecipient.update({
                    where: { id: recipient.id },
                    data: { status: 'sent', sentAt: new Date() }
                });
                stats.sent++;

                // Random Delay (1-3 seconds) to be safe between batch items
                await new Promise(r => setTimeout(r, 1500));

            } catch (err: any) {
                console.error(`Failed to send to ${recipient.customerPhone}:`, err);
                await (prisma as any).campaignRecipient.update({
                    where: { id: recipient.id },
                    data: { status: 'failed', error: err.message }
                });
                stats.failed++;
            }
        }

        return NextResponse.json({
            status: 'processing',
            processed: stats,
            remaining: await (prisma as any).campaignRecipient.count({ where: { campaignId, status: 'pending' } })
        });

    } catch (error: any) {
        console.error('Campaign process error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
