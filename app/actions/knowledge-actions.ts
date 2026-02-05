'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function getAuthUser() {
    // You might need to adjust this based on your actual auth implementation
    // For now, I'll assume we pass userId or handle it via a helper
    // If you use standard next-auth:
    // const session = await auth();
    // return session?.user;
    return null; // Placeholder if not strictly checking here
}

export async function createKnowledgeDoc(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const agentId = formData.get('agentId') as string;
    const fileType = formData.get('fileType') as string || 'text';

    if (!title || !content || !agentId) {
        throw new Error('Missing required fields');
    }

    try {
        await (prisma as any).knowledgeDoc.create({
            data: {
                title,
                content,
                fileType,
                agentId,
            },
        });
        revalidatePath('/knowledge');
        return { success: true };
    } catch (error) {
        console.error('Error creating knowledge doc:', error);
        return { success: false, error: 'Failed to create document' };
    }
}

export async function deleteKnowledgeDoc(id: string) {
    try {
        await (prisma as any).knowledgeDoc.delete({
            where: { id },
        });
        revalidatePath('/knowledge');
        return { success: true };
    } catch (error) {
        console.error('Error deleting knowledge doc:', error);
        return { success: false, error: 'Failed to delete document' };
    }
}

export async function getKnowledgeDocs(userId: string) {
    try {
        const docs = await (prisma as any).knowledgeDoc.findMany({
            where: {
                agent: {
                    userId: userId
                }
            },
            include: {
                agent: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return docs;
    } catch (error) {
        console.error('Error fetching docs:', error);
        return [];
    }
}

export async function getAgentsList(userId: string) {
    try {
        return await prisma.agent.findMany({
            where: { userId },
            select: { id: true, name: true }
        });
    } catch (error) {
        return [];
    }
}
