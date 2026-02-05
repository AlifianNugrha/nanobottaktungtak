
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Get current role
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    // Toggle Role
    const newRole = dbUser?.role === 'USER' ? 'PRO_USER' : 'USER';

    await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole as any }
    });

    return NextResponse.json({
        success: true,
        message: `Role switched from ${dbUser?.role} to ${newRole}. Refresh halaman dashboard untuk melihat efeknya!`,
        currentRole: newRole
    });
}
