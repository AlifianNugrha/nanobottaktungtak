/**
 * Force Link All Bots to WhatsApp Integration
 */

import prisma from '../lib/prisma';

async function forceLinkBots() {
    try {
        // Get WhatsApp integration
        const integration = await prisma.integration.findFirst({
            where: { platform: 'WhatsApp' }
        });

        if (!integration) {
            console.log('❌ No WhatsApp integration found');
            return;
        }

        console.log('✅ Integration:', integration.name);
        console.log('   ID:', integration.id);
        console.log('   Status:', integration.status);

        // Get all bots with agents for this user
        const bots = await prisma.bot.findMany({
            where: {
                userId: integration.userId,
                agentId: { not: null }
            },
            include: {
                agent: true
            }
        });

        console.log(`\n📋 Found ${bots.length} bot(s) with agents:`);

        for (const bot of bots) {
            console.log(`\n  Bot: ${bot.name}`);
            console.log(`  Agent: ${bot.agent?.name}`);
            console.log(`  Current integration: ${bot.integrationId || 'NONE'}`);

            if (bot.integrationId !== integration.id) {
                await prisma.bot.update({
                    where: { id: bot.id },
                    data: { integrationId: integration.id }
                });
                console.log(`  ✅ Linked to integration: ${integration.id}`);
            } else {
                console.log(`  ✅ Already linked`);
            }
        }

        // Verify
        console.log('\n🔍 VERIFICATION:');
        const linkedBots = await prisma.bot.findMany({
            where: {
                integrationId: integration.id,
                agentId: { not: null }
            },
            include: {
                agent: true
            }
        });

        console.log(`✅ ${linkedBots.length} bot(s) now linked to ${integration.name}:`);
        linkedBots.forEach(bot => {
            console.log(`   - ${bot.name} → ${bot.agent?.name}`);
        });

        console.log('\n🎉 DONE!');
        console.log('   Integration ID:', integration.id);
        console.log('   This should match the sessionId in logs');
        console.log('\n💡 Next steps:');
        console.log('   1. Send WhatsApp message');
        console.log('   2. Check terminal for:');
        console.log(`      "Looking for bot with sessionId: ${integration.id}"`);
        console.log('   3. Should see: "Bot found: [bot name]"');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

forceLinkBots();
