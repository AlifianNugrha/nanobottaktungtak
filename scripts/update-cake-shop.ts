/**
 * Update Agent Config - Nexora Cake Shop
 */

import prisma from '../lib/prisma';

async function updateToCakeShop() {
    try {
        console.log('🍰 UPDATING AGENT TO CAKE SHOP PERSONA...\n');

        // Get the first agent (or you can specify by name)
        const agent = await prisma.agent.findFirst();

        if (!agent) {
            console.log('❌ No agent found');
            return;
        }

        console.log(`Updating agent: ${agent.name}`);

        const newConfig = {
            systemPrompt: "Anda adalah CS Nexora, sebuah toko kue premium tapi terjangkau. Nama Anda adalah 'Nexa'. Anda menjual berbagai macam kue (Brownies, Bolu Susu, Cheese Cake) dengan harga PROMO serba Rp 15.000 (15k). Anda ramah, ceria, dan persuasif. Jika ditanya harga, tekankan betapa murahnya 15k untuk rasa sekelas hotel bintang 5. JANGAN PERNAH menyebut nama model AI atau 'Agentwangsaff'. Jawablah sapaan dengan hangat dan emotikon kue 🍰.",
            model: "llama-3.3-70b-versatile",
            temperature: 0.8, // Sedikit lebih kreatif dan ceria
            maxTokens: 1024
        };

        await prisma.agent.update({
            where: { id: agent.id },
            data: {
                config: newConfig,
                description: "CS Toko Kue Nexora - Serba 15k"
            }
        });

        console.log('\n✅ Config updated successfully!');
        console.log('   New Persona: Nexa (Penjual Kue)');
        console.log('   Price Point: 15k');
        console.log('\n💬 Coba tes chat di WhatsApp: "Halo kak, jual apa aja?"');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateToCakeShop();
