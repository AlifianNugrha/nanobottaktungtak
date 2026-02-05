/**
 * Fix WhatsApp Integration Status
 * Update status integration menjadi 'connected' dan link dengan bot
 */

import prisma from '../lib/prisma';

async function fixWhatsAppIntegration() {
    try {
        // Find WhatsApp integration
        const integration = await prisma.integration.findFirst({
            where: { platform: 'WhatsApp' }
        });

        if (!integration) {
            console.log('❌ Tidak ada WhatsApp integration. Buat dulu dari dashboard.');
            return;
        }

        console.log('✅ Integration ditemukan:', integration.name);
        console.log('   Status saat ini:', integration.status);

        // Update status to connected if not already
        if (integration.status !== 'connected') {
            await prisma.integration.update({
                where: { id: integration.id },
                data: { status: 'connected' }
            });
            console.log('✅ Status diupdate menjadi: connected');
        }

        // Find bot with agent
        const bot = await prisma.bot.findFirst({
            where: {
                agentId: { not: null },
                userId: integration.userId
            },
            include: { agent: true }
        });

        if (!bot) {
            console.log('❌ Tidak ada bot dengan agent. Buat bot dulu dari dashboard.');
            return;
        }

        console.log('✅ Bot ditemukan:', bot.name);
        console.log('   Agent:', bot.agent?.name);

        // Link bot to integration
        if (bot.integrationId !== integration.id) {
            await prisma.bot.update({
                where: { id: bot.id },
                data: { integrationId: integration.id }
            });
            console.log('✅ Bot dihubungkan dengan integration');
        } else {
            console.log('✅ Bot sudah terhubung dengan integration');
        }

        console.log('\n🎉 SETUP COMPLETE!');
        console.log('   Bot:', bot.name);
        console.log('   Agent:', bot.agent?.name);
        console.log('   Integration:', integration.name);
        console.log('\n💬 Kirim pesan WhatsApp untuk test!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixWhatsAppIntegration();
