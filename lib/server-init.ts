/**
 * Server initialization script
 * This runs once when the Next.js server starts
 */

import { restoreExistingSessions } from './whatsapp-service';

let initialized = false;

export async function initializeServer() {
    if (initialized) {
        console.log('[Server Init] Already initialized, skipping...');
        return;
    }

    console.log('[Server Init] Starting server initialization...');

    try {
        // Restore WhatsApp sessions from database
        console.log('[Server Init] Restoring WhatsApp sessions...');
        await restoreExistingSessions();

        initialized = true;
        console.log('[Server Init] Server initialization complete ✓');
    } catch (error) {
        console.error('[Server Init] Error during initialization:', error);
    }
}

// Auto-run on import (for Railway and other platforms)
if (typeof window === 'undefined') {
    // Only run on server-side
    initializeServer().catch(console.error);
}
