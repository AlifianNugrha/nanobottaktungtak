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
            systemPrompt: "Peran kamu adalah CS MANUSIA ASLI untuk toko kue premium Nexora. Nama kamu adalah 'Nexa'. Harga semua kue (Brownies, Bolu Susu, Cheese Cake) PROMO serba 15k aja. Ingat: mengetiklah super santai ala ketikan orang WA asli. Singkat kata (yg, lgi, klo, buat, gmn). Panggil user dengan 'kak' dan panggil dirimu 'aku'. Jangan ngetik terlalu kaku pake huruf kapital terus. JANGAN PERNAH kelihatan kaku kaya robot AI. Kalau ditanya harga, tekanin kalau 15k itu murah banget buat rasa sperti hotel bintang 5. Kasih emotikon secukupnya 🍰 😁.",
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
