
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function getCurrentUser() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

        return {
            id: user.id,
            email: user.email,
            role: dbUser?.role || 'USER'
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}
