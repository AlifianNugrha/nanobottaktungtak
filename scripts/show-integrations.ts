/**
 * Show Current Integrations
 */

import prisma from '../lib/prisma';

async function showIntegrations() {
    try {
        const integrations = await prisma.integration.findMany({
            where: { platform: 'WhatsApp' },
            include: {
                bots: {
                    include: {
                        agent: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('📋 WHATSAPP INTEGRATIONS:\n');

        if (integrations.length === 0) {
            console.log('❌ No WhatsApp integrations found');
            console.log('\n✅ Good! You can create a fresh one from dashboard.');
            return;
        }

        integrations.forEach((int, index) => {
            console.log(`${index + 1}. ${int.name}`);
            console.log(`   ID: ${int.id}`);
            console.log(`   Status: ${int.status}`);
            console.log(`   Created: ${int.createdAt}`);
            console.log(`   Bots linked: ${int.bots.length}`);

            if (int.bots.length > 0) {
                int.bots.forEach(bot => {
                    console.log(`     - ${bot.name} (Agent: ${bot.agent?.name || 'NO AGENT'})`);
                });
            }
            console.log('');
        });

        console.log('\n💡 RECOMMENDATIONS:');
        console.log('   1. Delete all old integrations from dashboard');
        console.log('   2. Create fresh WhatsApp integration');
        console.log('   3. Bot will auto-link (no script needed!)');
        console.log('\n   Or run: npx tsx scripts/delete-old-integrations.ts');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

showIntegrations();
