import React from "react"
import { PlatformLayout } from '@/components/platform-layout';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Strict Admin Check
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    });

    console.log(`[PLATFORM GUARD] User: ${user.email}, Role: ${dbUser?.role}, ID: ${user.id}`);

    // PRIMARY GUARD: Check Database Role
    const isAdmin = dbUser?.role === 'ADMIN';

    // SECONDARY GUARD (Fail-safe): Hardcoded owner email
    // This ensures that even if DB is messed up, only this email can pass if we enforce strict mode.
    // For now, we will trust the role OR the email directly if needed.
    // But per user request "akun lain bisa masuk", we need to be strict.

    if (!isAdmin) {
        console.log(`[PLATFORM GUARD] BLOCKED ROLE: ${user.email}`);
        redirect('/dashboard');
    }

    // NUCLEAR OPTION: Strict Email Check
    // As requested, ONLY this specific email can access platform
    const ALLOWED_EMAIL = 'fmencraft@gmail.com';

    if (user.email !== ALLOWED_EMAIL) {
        console.log(`[PLATFORM GUARD OPTION] BLOCKED EMAIL: ${user.email}`);
        redirect('/dashboard');
    }

    console.log(`[PLATFORM GUARD] ALLOWED: ${user.email}`);

    return <PlatformLayout>{children}</PlatformLayout>;
}
