'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendMessage } from '@/lib/whatsapp-service';

// --- INBOX ACTIONS ---

/**
 * Get all active conversations for a user's integrations
 */
export async function getInboxConversations(userId: string) {
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                integration: {
                    userId: userId,
                    platform: 'WhatsApp' // Filter specifically for WA for now
                }
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                integration: {
                    select: { name: true, platform: true }
                }
            }
        });

        // Enrich with customer data if needed (optional optimization)
        // For now, return raw conversation
        return conversations;
    } catch (error) {
        console.error('Error fetching inbox items:', error);
        return [];
    }
}

/**
 * Get specific conversation details including messages
 */
export async function getConversationDetails(id: string) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                integration: {
                    select: { name: true, platform: true }
                }
            }
        });
        return conversation;
    } catch (error) {
        return null;
    }
}

/**
 * Send a manual message (Human Handoff)
 */
export async function sendManualMessage(conversationId: string, message: string) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { integration: true }
        });

        if (!conversation) throw new Error('Conversation not found');

        // SEND TO WHATSAPP (Via server-side logic)
        // We import sendMessage from whatsapp-service which handles the Baileys socket
        await sendMessage(conversation.integration.id, conversation.contactNumber, message);

        // SAVE TO DB HISTORY
        const msgs: any[] = (conversation.messages as any[]) || [];
        msgs.push({
            role: 'assistant',
            content: message,
            timestamp: new Date().toISOString()
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                messages: msgs,
                lastMessage: message,
                updatedAt: new Date()
            } as any
        });

        revalidatePath('/admin/inbox');
        return { success: true };
    } catch (error: any) {
        console.error('Error sending manual message:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Pause/Resume Bot for a specific conversation
 */
export async function toggleBotStatus(conversationId: string, isPaused: boolean) {
    try {
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { isBotPaused: isPaused } as any
        });
        revalidatePath('/admin/inbox');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
