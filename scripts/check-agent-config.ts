/**
 * Check Agent Configuration
 */

import prisma from '../lib/prisma';

async function checkAgentConfig() {
    try {
        console.log('🔍 CHECKING AGENT CONFIGURATIONS\n');

        const agents = await prisma.agent.findMany({
            orderBy: { createdAt: 'desc' }
        });

        if (agents.length === 0) {
            console.log('❌ No agents found');
            console.log('💡 Create an agent from dashboard first');
            return;
        }

        console.log(`Found ${agents.length} agent(s):\n`);

        agents.forEach((agent, index) => {
            console.log(`${index + 1}. ${agent.name}`);
            console.log(`   ID: ${agent.id}`);
            console.log(`   Description: ${agent.description || 'N/A'}`);
            console.log(`   Role: ${agent.role || 'N/A'}`);

            console.log('\n   📋 CONFIG:');

            if (!agent.config || typeof agent.config !== 'object') {
                console.log('   ❌ No config found or invalid format');
                console.log('   💡 Add config via dashboard or database');
            } else {
                const config = agent.config as any;

                // Check systemPrompt
                if (config.systemPrompt) {
                    console.log(`   ✅ systemPrompt: "${config.systemPrompt.substring(0, 60)}..."`);
                } else {
                    console.log('   ⚠️  systemPrompt: NOT SET (will use default)');
                    console.log(`      Default: "Anda adalah ${agent.name}. ${agent.description || 'Asisten AI yang membantu.'}"`);
                }

                // Check model
                const model = config.model || 'llama-3.3-70b-versatile';
                console.log(`   ${config.model ? '✅' : '⚠️ '} model: ${model}${config.model ? '' : ' (default)'}`);

                // Check temperature
                const temp = config.temperature ?? 0.7;
                console.log(`   ${config.temperature !== undefined ? '✅' : '⚠️ '} temperature: ${temp}${config.temperature !== undefined ? '' : ' (default)'}`);

                // Check maxTokens
                const maxTokens = config.maxTokens || 1024;
                console.log(`   ${config.maxTokens ? '✅' : '⚠️ '} maxTokens: ${maxTokens}${config.maxTokens ? '' : ' (default)'}`);
            }

            console.log('');
        });

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:\n');

        const agentsWithoutConfig = agents.filter(a => !a.config || typeof a.config !== 'object');
        const agentsWithoutPrompt = agents.filter(a => {
            const config = a.config as any;
            return !config?.systemPrompt;
        });

        if (agentsWithoutConfig.length > 0) {
            console.log(`⚠️  ${agentsWithoutConfig.length} agent(s) without config:`);
            agentsWithoutConfig.forEach(a => console.log(`   - ${a.name}`));
            console.log('   → Add config via dashboard or update database\n');
        }

        if (agentsWithoutPrompt.length > 0) {
            console.log(`⚠️  ${agentsWithoutPrompt.length} agent(s) without systemPrompt:`);
            agentsWithoutPrompt.forEach(a => console.log(`   - ${a.name}`));
            console.log('   → Will use default prompt (may not be optimal)\n');
        }

        if (agentsWithoutConfig.length === 0 && agentsWithoutPrompt.length === 0) {
            console.log('✅ All agents have proper configuration!');
            console.log('   Ready to use for AI responses! 🎉');
        }

        console.log('\n📚 For config guide, see: AGENT_CONFIG_GUIDE.md');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAgentConfig();
