
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function getCurrentUser() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        // Optional: Fetch detail from Prisma if needed, but for ID it's enough
        // const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

        return {
            id: user.id,
            email: user.email
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}
