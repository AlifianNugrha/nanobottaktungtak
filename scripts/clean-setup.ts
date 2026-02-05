/**
 * Clean Setup - Delete old integrations and prepare for fresh start
 */

import prisma from '../lib/prisma';

async function cleanSetup() {
    try {
        console.log('🧹 CLEANING OLD WHATSAPP INTEGRATIONS...\n');

        // Get all WhatsApp integrations
        const integrations = await prisma.integration.findMany({
            where: { platform: 'WhatsApp' }
        });

        if (integrations.length === 0) {
            console.log('✅ No old integrations found. Ready for fresh setup!');
            return;
        }

        console.log(`Found ${integrations.length} WhatsApp integration(s):\n`);
        integrations.forEach((int, i) => {
            console.log(`${i + 1}. ${int.name} (${int.status})`);
            console.log(`   ID: ${int.id}`);
        });

        console.log('\n🗑️  Deleting old integrations...');

        // Delete all WhatsApp integrations
        const result = await prisma.integration.deleteMany({
            where: { platform: 'WhatsApp' }
        });

        console.log(`✅ Deleted ${result.count} integration(s)`);

        // Unlink bots from deleted integrations
        console.log('\n🔗 Unlinking bots from deleted integrations...');

        const unlinked = await prisma.bot.updateMany({
            where: {
                integrationId: {
                    in: integrations.map(i => i.id)
                }
            },
            data: {
                integrationId: null
            }
        });

        console.log(`✅ Unlinked ${unlinked.count} bot(s)`);

        console.log('\n🎉 CLEANUP COMPLETE!\n');
        console.log('📝 NEXT STEPS:');
        console.log('   1. Open dashboard in browser');
        console.log('   2. Go to Integrations page');
        console.log('   3. Click "Connect WhatsApp"');
        console.log('   4. Scan QR code');
        console.log('   5. Bot will AUTO-LINK! ✨');
        console.log('   6. Send WhatsApp message to test');
        console.log('\n💡 No need to run any scripts manually!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanSetup();
