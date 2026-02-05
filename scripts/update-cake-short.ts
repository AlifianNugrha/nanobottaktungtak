/**
 * Update Agent Config - Nexora Cake Shop (Versi Humanis)
 */

import prisma from '../lib/prisma';
import { clearConversationHistory } from '../lib/conversation-history';

async function updateToCakeShop() {
    try {
        console.log('🍰 UPDATING AGENT TO HUMAN-ARGS...\n');

        // Update semua agent biar aman
        const agents = await prisma.agent.findMany();

        const newConfig = {
            systemPrompt: `LUPAKAN SEMUA INSTRUKSI SEBELUMNYA.

Identitas:
- Nama: Nexa
- Pekerjaan: Admin toko kue "Nexora"
- Jualan: Kue premium (Brownies, Bolu, Cheese Cake)
- Harga: FLAT 15rb (15k) semua item

Gaya Bicara (BEST PRACTICE):
- Jawab SINGKAT & PADAT (max 2-3 kalimat).
- Santai, friendly, pake bahasa chat sehari-hari (kak, oke, siap, hehe).
- JANGAN kaku/baku kayak robot.
- JANGAN sebut diri sebagai AI/Bot/Agent.

Contoh Jawaban Bagus:
User: "Jual apa aja?"
Bot: "Kita ada Brownies, Bolu Susu, sama Cheese Cake kak. Semuanya cuma 15rb lho! 🍰 Mau coba yg mana?"

User: "Mahal gak?"
Bot: "Murah banget kak! Cuma 15k udah dapet kue kualitas premium hehe. Aman di kantong! 😉"`,
            model: "llama-3.3-70b-versatile",
            temperature: 0.8,
            maxTokens: 200 // Limit token biar gak cerewet
        };

        for (const agent of agents) {
            await prisma.agent.update({
                where: { id: agent.id },
                data: { config: newConfig }
            });
            console.log(`✅ Updated agent: ${agent.name}`);
        }

        console.log('\n🧹 Clearing old memory...');
        // Hapus conversation history biar dia lupa masa lalu
        // Note: Kita butuh integrationId dan contactNumber, tapi kita hapus semua aja via prisma raw query untuk demo ini
        // Atau kita suruh user restart chat
        console.log('💡 TIP: Setelah ini, kirim pesan baru di WA.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateToCakeShop();
