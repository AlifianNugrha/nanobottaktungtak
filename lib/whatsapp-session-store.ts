import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Database-based session store for Baileys
 * This replaces file-based storage to work on stateless platforms like Railway
 */
export class DatabaseSessionStore {
    private sessionId: string;

    constructor(sessionId: string) {
        this.sessionId = sessionId;
    }

    /**
     * Save auth state to database
     */
    async saveState(state: any) {
        try {
            const serialized = JSON.stringify(state);

            await prisma.whatsAppSession.upsert({
                where: { sessionId: this.sessionId },
                update: {
                    sessionData: serialized,
                    updatedAt: new Date()
                },
                create: {
                    sessionId: this.sessionId,
                    sessionData: serialized
                }
            });

            console.log(`[Session] Saved for ${this.sessionId}`);
        } catch (error) {
            console.error('[Session] Save error:', error);
            throw error;
        }
    }

    /**
     * Load auth state from database
     */
    async loadState(): Promise<any | null> {
        try {
            const session = await prisma.whatsAppSession.findUnique({
                where: { sessionId: this.sessionId }
            });

            if (!session) {
                console.log(`[Session] No existing session for ${this.sessionId}`);
                return null;
            }

            const state = JSON.parse(session.sessionData);
            console.log(`[Session] Loaded for ${this.sessionId}`);
            return state;
        } catch (error) {
            console.error('[Session] Load error:', error);
            return null;
        }
    }

    /**
     * Delete session from database
     */
    async deleteState() {
        try {
            await prisma.whatsAppSession.delete({
                where: { sessionId: this.sessionId }
            });
            console.log(`[Session] Deleted for ${this.sessionId}`);
        } catch (error) {
            console.error('[Session] Delete error:', error);
        }
    }

    /**
     * Check if session exists
     */
    async exists(): Promise<boolean> {
        const session = await prisma.whatsAppSession.findUnique({
            where: { sessionId: this.sessionId }
        });
        return !!session;
    }
}
