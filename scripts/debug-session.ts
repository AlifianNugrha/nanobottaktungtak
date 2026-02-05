/**
 * Debug WhatsApp Session
 * Check active sessions and database state
 */

import prisma from '../lib/prisma';

async function debugSession() {
    try {
        console.log('🔍 DEBUGGING WHATSAPP SESSION\n');

        // Get all integrations
        const integrations = await prisma.integration.findMany({
            where: { platform: 'WhatsApp' },
            include: {
                bots: {
                    include: {
                        agent: true
                    }
                }
            }
        });

        console.log('📋 INTEGRATIONS:');
        integrations.forEach(int => {
            console.log(`\n  Integration: ${int.name}`);
            console.log(`  ID: ${int.id}`);
            console.log(`  Status: ${int.status}`);
            console.log(`  Bots linked: ${int.bots.length}`);

            int.bots.forEach(bot => {
                console.log(`    - Bot: ${bot.name}`);
                console.log(`      Agent: ${bot.agent?.name || 'NO AGENT'}`);
                console.log(`      Bot ID: ${bot.id}`);
                console.log(`      Integration ID: ${bot.integrationId}`);
            });
        });

        // Check for bots without integration
        const orphanBots = await prisma.bot.findMany({
            where: {
                integrationId: null
            },
            include: {
                agent: true
            }
        });

        if (orphanBots.length > 0) {
            console.log('\n⚠️  ORPHAN BOTS (no integration):');
            orphanBots.forEach(bot => {
                console.log(`  - ${bot.name} (Agent: ${bot.agent?.name || 'NO AGENT'})`);
            });
        }

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');

        const connectedIntegration = integrations.find(i => i.status === 'connected');
        if (!connectedIntegration) {
            console.log('  ❌ No connected WhatsApp integration found');
            console.log('  → Connect WhatsApp from dashboard');
        } else {
            console.log(`  ✅ Connected integration: ${connectedIntegration.name}`);
            console.log(`     Session ID should be: ${connectedIntegration.id}`);

            if (connectedIntegration.bots.length === 0) {
                console.log('  ❌ No bots linked to this integration');
                console.log('  → Run: npx tsx scripts/fix-whatsapp.ts');
            } else {
                const botWithAgent = connectedIntegration.bots.find(b => b.agentId);
                if (!botWithAgent) {
                    console.log('  ❌ No bot with agent found');
                    console.log('  → Link bot to an agent from dashboard');
                } else {
                    console.log(`  ✅ Bot with agent: ${botWithAgent.name}`);
                    console.log(`     Agent: ${botWithAgent.agent?.name}`);
                    console.log('\n  🎉 Everything looks good!');
                    console.log('     If bot still replies with default message:');
                    console.log('     1. Restart dev server');
                    console.log('     2. Check terminal logs when message arrives');
                    console.log('     3. Look for "Looking for bot with sessionId: [ID]"');
                    console.log(`     4. Session ID should be: ${connectedIntegration.id}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugSession();
