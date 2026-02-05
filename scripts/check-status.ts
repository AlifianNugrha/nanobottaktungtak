/**
 * Check Database Status Script
 * Melihat status integration, bot, dan agent
 */

import prisma from '../lib/prisma';

async function checkStatus() {
    try {
        console.log('📊 Checking Database Status...\n');

        // Check integrations
        const integrations = await prisma.integration.findMany({
            orderBy: { createdAt: 'desc' }
        });

        console.log('🔌 INTEGRATIONS:');
        if (integrations.length === 0) {
            console.log('   ❌ Tidak ada integration');
        } else {
            integrations.forEach(int => {
                console.log(`   - ${int.name} (${int.platform})`);
                console.log(`     Status: ${int.status}`);
                console.log(`     ID: ${int.id}`);
                console.log(`     User: ${int.userId}`);
                console.log('');
            });
        }

        // Check bots
        const bots = await prisma.bot.findMany({
            include: {
                agent: true,
                integration: true
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('\n🤖 BOTS:');
        if (bots.length === 0) {
            console.log('   ❌ Tidak ada bot');
        } else {
            bots.forEach(bot => {
                console.log(`   - ${bot.name}`);
                console.log(`     ID: ${bot.id}`);
                console.log(`     Agent: ${bot.agent?.name || '❌ No agent'}`);
                console.log(`     Integration: ${bot.integration?.name || '❌ No integration'}`);
                console.log(`     User: ${bot.userId}`);
                console.log('');
            });
        }

        // Check agents
        const agents = await prisma.agent.findMany({
            orderBy: { createdAt: 'desc' }
        });

        console.log('\n🧠 AGENTS:');
        if (agents.length === 0) {
            console.log('   ❌ Tidak ada agent');
        } else {
            agents.forEach(agent => {
                console.log(`   - ${agent.name}`);
                console.log(`     ID: ${agent.id}`);
                console.log(`     Role: ${agent.role || 'No role'}`);
                console.log(`     User: ${agent.userId}`);
                console.log('');
            });
        }

        // Summary
        console.log('\n📋 SUMMARY:');
        console.log(`   Integrations: ${integrations.length}`);
        console.log(`   Bots: ${bots.length}`);
        console.log(`   Agents: ${agents.length}`);

        const connectedIntegrations = integrations.filter(i => i.status === 'connected');
        const linkedBots = bots.filter(b => b.integrationId && b.agentId);

        console.log(`\n   ✅ Connected Integrations: ${connectedIntegrations.length}`);
        console.log(`   ✅ Fully Linked Bots (with agent + integration): ${linkedBots.length}`);

        if (linkedBots.length > 0) {
            console.log('\n🎉 READY TO USE:');
            linkedBots.forEach(bot => {
                console.log(`   ✅ ${bot.name}`);
                console.log(`      → Agent: ${bot.agent?.name}`);
                console.log(`      → Integration: ${bot.integration?.name}`);
            });
        } else {
            console.log('\n⚠️  ACTION NEEDED:');
            if (integrations.length === 0) {
                console.log('   1. Create WhatsApp integration from dashboard');
            } else if (connectedIntegrations.length === 0) {
                console.log('   1. Connect WhatsApp (scan QR code)');
            }
            if (agents.length === 0) {
                console.log('   2. Create an AI agent');
            }
            if (bots.length === 0) {
                console.log('   3. Create a bot and link it to agent + integration');
            } else {
                const botsNeedingAgent = bots.filter(b => !b.agentId);
                const botsNeedingIntegration = bots.filter(b => !b.integrationId);

                if (botsNeedingAgent.length > 0) {
                    console.log(`   2. Link ${botsNeedingAgent.length} bot(s) to an agent`);
                }
                if (botsNeedingIntegration.length > 0) {
                    console.log(`   3. Link ${botsNeedingIntegration.length} bot(s) to integration`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkStatus();
