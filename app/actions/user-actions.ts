'use server';

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification-actions";

export async function updateProfile(formData: { name: string; companyName: string; image?: string }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return { success: false, error: "Unauthorized" };
        }

        // Update user in database, or create if doesn't exist (Upsert)
        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                name: formData.name,
                companyName: formData.companyName,
                image: formData.image,
            },
            create: {
                id: user.id,
                email: user.email,
                name: formData.name,
                companyName: formData.companyName,
                image: formData.image,
                role: 'USER', // Default role
            }
        });

        // Revalidate paths to refresh data
        revalidatePath('/dashboard');
        revalidatePath('/settings');
        revalidatePath('/', 'layout'); // Refresh layout to update sidebar

        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function upgradeToPro() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.user.upsert({
            where: { id: user.id },
            update: { role: 'PRO_USER' },
            create: {
                id: user.id,
                email: user.email,
                role: 'PRO_USER',
            }
        });

        // Create Notification
        await createNotification(
            user.id,
            'System',
            'Upgrade Successful',
            'You have successfully upgraded to the Pro plan. Enjoy full access!'
        );

        revalidatePath('/', 'layout');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error("Error upgrading to pro:", error);
        return { success: false, error: "Failed to upgrade" };
    }
}

export async function getUsers() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // Ideally check if user.role === 'ADMIN' here

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                subscriptionPlan: true,
                subscriptionStart: true,
                subscriptionEnd: true,
                maxTokenLimit: true,
                currentTokenUsage: true,
            }
        });

        // Transform data to match UI expectations
        const formattedUsers = users.map(u => ({
            ...u,
            joinDate: u.createdAt.toLocaleDateString(),
            status: 'Active' // Hardcoded for now as it's not in schema
        }));

        return { success: true, data: formattedUsers };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}

export async function getPlanStatus() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, isPro: false };

        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        const isPro = dbUser?.role === 'PRO_USER' || dbUser?.role === 'ADMIN';

        return { success: true, isPro };
    } catch (error) {
        console.error("Error checking plan status:", error);
        return { success: false, isPro: false };
    }
}
