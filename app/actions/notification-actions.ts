'use server';

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, data: [] };

    try {
        const notifs = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return { success: true, data: notifs };
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return { success: false, data: [] };
    }
}

export async function createNotification(userId: string, type: string, title: string, message: string) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                isRead: false
            }
        });
        revalidatePath('/notification');
        return { success: true };
    } catch (error) {
        console.error("Failed to create notification:", error);
        return { success: false };
    }
}

export async function markAllRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    try {
        await prisma.notification.updateMany({
            where: { userId: user.id, isRead: false },
            data: { isRead: true }
        });
        revalidatePath('/notification');
        return { success: true };
    } catch (error) {
        console.error("Failed to mark notifications read:", error);
        return { success: false };
    }
}

export async function deleteNotifications(ids: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    try {
        await prisma.notification.deleteMany({
            where: {
                id: { in: ids },
                userId: user.id
            }
        });
        revalidatePath('/notification');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete notifications:", error);
        return { success: false, error: 'Failed to delete' };
    }
}
