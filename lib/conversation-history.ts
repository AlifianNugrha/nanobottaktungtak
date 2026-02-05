/**
 * Conversation History Module
 * Manages chat history for WhatsApp conversations
 */

import prisma from './prisma';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

const MAX_HISTORY_MESSAGES = 10; // Keep last 10 messages for context

/**
 * Get or create conversation history for a contact
 */
export async function getConversationHistory(
    integrationId: string,
    contactNumber: string
): Promise<Message[]> {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: {
                integrationId_contactNumber: {
                    integrationId,
                    contactNumber
                }
            }
        });

        if (!conversation || !conversation.messages) {
            return [];
        }

        // Return messages as array
        const messages = conversation.messages as any;
        return Array.isArray(messages) ? messages : [];
    } catch (error) {
        console.error('Error getting conversation history:', error);
        return [];
    }
}

/**
 * Save new messages to conversation history
 */
export async function saveMessageToHistory(
    integrationId: string,
    contactNumber: string,
    userMessage: string,
    botResponse: string
): Promise<void> {
    try {
        // Get existing conversation
        const existing = await prisma.conversation.findUnique({
            where: {
                integrationId_contactNumber: {
                    integrationId,
                    contactNumber
                }
            }
        });

        const timestamp = new Date().toISOString();
        const messages = (existing?.messages as unknown as Message[]) || [];

        // Add user message
        messages.push({
            role: 'user',
            content: userMessage,
            timestamp
        });

        // Add bot response
        messages.push({
            role: 'assistant',
            content: botResponse,
            timestamp
        });

        // Keep only last MAX_HISTORY_MESSAGES * 2 (user + assistant pairs)
        const recentMessages = messages.slice(-(MAX_HISTORY_MESSAGES * 2));

        // Upsert conversation
        await prisma.conversation.upsert({
            where: {
                integrationId_contactNumber: {
                    integrationId,
                    contactNumber
                }
            },
            create: {
                integrationId,
                contactNumber,
                messages: recentMessages as any // Cast to any to satisfy Prisma Json input
            },
            update: {
                messages: recentMessages as any, // Cast to any to satisfy Prisma Json input
                updatedAt: new Date()
            }
        });

        console.log(`Saved conversation for ${contactNumber} (${recentMessages.length} messages)`);
    } catch (error) {
        console.error('Error saving conversation:', error);
    }
}

/**
 * Clear conversation history for a contact
 */
export async function clearConversationHistory(
    integrationId: string,
    contactNumber: string
): Promise<void> {
    try {
        await prisma.conversation.delete({
            where: {
                integrationId_contactNumber: {
                    integrationId,
                    contactNumber
                }
            }
        });
        console.log(`Cleared conversation for ${contactNumber}`);
    } catch (error) {
        console.error('Error clearing conversation:', error);
    }
}

/**
 * Format history for AI (Groq format)
 */
export function formatHistoryForAI(history: Message[]): any[] {
    // Only include user and assistant messages (not system)
    return history
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
            role: msg.role,
            content: msg.content
        }));
}

/**
 * Ensure customer exists in the database
 */
export async function ensureCustomerExists(
    userId: string,
    contactNumber: string,
    contactName: string = 'Unknown'
): Promise<void> {
    try {
        // Sanitize phone number (remove @s.whatsapp.net)
        const cleanPhone = contactNumber.replace('@s.whatsapp.net', '');

        // Check if customer exists
        const existing = await prisma.customer.findFirst({
            where: {
                userId,
                phone: cleanPhone
            }
        });

        if (!existing) {
            await prisma.customer.create({
                data: {
                    userId,
                    name: contactName || cleanPhone,
                    phone: cleanPhone,
                    status: 'Lead'
                }
            });
            console.log(`Created new customer record for ${cleanPhone}`);
        } else {
            // Optional: Update name if it was previously just the phone number and now we have a name
            if (existing.name === existing.phone && contactName && contactName !== cleanPhone) {
                await prisma.customer.update({
                    where: { id: existing.id },
                    data: { name: contactName }
                });
            }
        }
    } catch (error) {
        console.error('Error ensuring customer exists:', error);
    }
}

