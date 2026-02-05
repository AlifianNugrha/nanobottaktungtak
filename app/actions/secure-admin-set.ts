'use server';

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function setAdminByEmail(email: string) {
    try {
        const supabase = await createClient();
        // Check if caller is authenticated (optional, but good for logs)
        const { data: { user } } = await supabase.auth.getUser();
        console.log(`Initial Setup Action called by: ${user?.email || 'Anonymous'}`);

        // Find user by email
        const targetUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!targetUser) {
            return { success: false, error: `User with email ${email} not found. Please sign up first.` };
        }

        // Update role
        await prisma.user.update({
            where: { email: email },
            data: { role: 'ADMIN' }
        });

        console.log(`SUCCESS: User ${email} promoted to ADMIN.`);
        return { success: true, message: `User ${email} is now an ADMIN.` };
    } catch (error: any) {
        console.error("Failed to set admin:", error);
        return { success: false, error: error.message };
    }
}
