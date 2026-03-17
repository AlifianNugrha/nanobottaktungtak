import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ 
            success: false, 
            message: "Tolong masukkan email di URL, contoh: /api/admin/setup?email=emailkamu@gmail.com" 
        }, { status: 400 });
    }

    try {
        // Cek apakah user ada
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Jika user belum pernah login di database ini, kita buatkan dulu
            const newUser = await prisma.user.create({
                data: {
                    email,
                    role: 'ADMIN',
                    subscriptionPlan: 'Pro',
                    maxTokenLimit: 1000000,
                }
            });
            return NextResponse.json({ 
                success: true, 
                message: `User baru ${email} berhasil dibuat sebagai ADMIN & PRO di Supabase`,
                user: newUser 
            });
        }

        // Jika user sudah ada, tinggal update statusnya
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                subscriptionPlan: 'Pro',
                maxTokenLimit: 1000000,
            },
        });

        return NextResponse.json({ 
            success: true, 
            message: `Mantap! Akun ${email} sekarang sudah ADMIN & PRO di Supabase`,
            user: updatedUser 
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
