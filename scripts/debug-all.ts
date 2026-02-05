/**
 * Debug: Show ALL Integrations
 */

import prisma from '../lib/prisma';

async function debugAll() {
    try {
        console.log('🔍 ALL INTEGRATIONS IN DB:\n');

        const integrations = await prisma.integration.findMany();

        if (integrations.length === 0) {
            console.log('❌ TOTAL INTEGRATIONS: 0');
            console.log('💡 Penyebab: Anda belum berhasil connect WhatsApp di dashboard.');
            console.log('💡 Solusi: Pergi ke halaman Integrations, klik Connect WhatsApp, dan scan QR.');
        } else {
            integrations.forEach(int => {
                console.log(`- Name: ${int.name}`);
                console.log(`  Platform: '${int.platform}'`); // Check exact string
                console.log(`  Status: ${int.status}`);
                console.log(`  ID: ${int.id}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugAll();
