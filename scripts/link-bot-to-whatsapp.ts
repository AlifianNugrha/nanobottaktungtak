/**
 * Quick Fix Script: Link Bot to WhatsApp Integration
 * 
 * Jalankan script ini untuk menghubungkan bot dengan WhatsApp integration
 * sehingga bot bisa menggunakan AI agent untuk membalas pesan.
 */

import prisma from '../lib/prisma';

async function linkBotToWhatsApp() {
    try {
        console.log('🔍 Mencari integration WhatsApp...');

        // Find WhatsApp integration
        const whatsappIntegration = await prisma.integration.findFirst({
            where: {
                platform: 'WhatsApp',
                status: 'connected'
            }
        });

        if (!whatsappIntegration) {
            console.log('❌ Tidak ada WhatsApp integration yang connected');
            console.log('💡 Silakan connect WhatsApp dulu dari dashboard');
            return;
        }

        console.log('✅ WhatsApp integration ditemukan:', whatsappIntegration.name);
        console.log('   ID:', whatsappIntegration.id);

        // Find bots without integration
        const botsWithoutIntegration = await prisma.bot.findMany({
            where: {
                integrationId: null,
                userId: whatsappIntegration.userId
            },
            include: {
                agent: true
            }
        });

        if (botsWithoutIntegration.length === 0) {
            console.log('ℹ️  Semua bot sudah terhubung dengan integration');

            // Show current bot-integration links
            const linkedBots = await prisma.bot.findMany({
                where: {
                    integrationId: whatsappIntegration.id
                },
                include: {
                    agent: true
                }
            });

            if (linkedBots.length > 0) {
                console.log('\n📋 Bot yang sudah terhubung:');
                linkedBots.forEach(bot => {
                    console.log(`   - ${bot.name} → Agent: ${bot.agent?.name || 'No agent'}`);
                });
            }
            return;
        }

        console.log(`\n🤖 Ditemukan ${botsWithoutIntegration.length} bot tanpa integration:`);
        botsWithoutIntegration.forEach(bot => {
            console.log(`   - ${bot.name} (Agent: ${bot.agent?.name || 'No agent'})`);
        });

        // Link first bot with agent to WhatsApp
        const botToLink = botsWithoutIntegration.find(bot => bot.agentId) || botsWithoutIntegration[0];

        if (!botToLink) {
            console.log('❌ Tidak ada bot yang bisa dihubungkan');
            return;
        }

        console.log(`\n🔗 Menghubungkan bot "${botToLink.name}" dengan WhatsApp...`);

        await prisma.bot.update({
            where: { id: botToLink.id },
            data: { integrationId: whatsappIntegration.id }
        });

        console.log('✅ Bot berhasil dihubungkan!');
        console.log('\n📊 Status:');
        console.log(`   Bot: ${botToLink.name}`);
        console.log(`   Agent: ${botToLink.agent?.name || 'No agent'}`);
        console.log(`   Integration: ${whatsappIntegration.name}`);
        console.log(`   Platform: WhatsApp`);

        if (!botToLink.agentId) {
            console.log('\n⚠️  WARNING: Bot tidak memiliki agent!');
            console.log('   Bot akan menggunakan default reply.');
            console.log('   Untuk menggunakan AI, hubungkan bot dengan agent dari dashboard.');
        } else {
            console.log('\n🎉 Bot siap membalas dengan AI!');
            console.log('   Kirim pesan WhatsApp untuk test.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
linkBotToWhatsApp();
