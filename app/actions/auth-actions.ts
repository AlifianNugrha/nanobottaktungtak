
'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from "@/lib/prisma"
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { success: false, error: error.message }
    }

    const { data: { user } } = await supabase.auth.getUser()
    let target = '/dashboard'
    if (user) {
        // Special case for requested owner email
        let role = 'USER';

        // This forces prompt role assignment for this specific user request
        if (user.email === 'fmencraft@gmail.com') {
            role = 'ADMIN';
        }

        // Use upsert to ensure the user record exists in Prisma
        const dbUser = await prisma.user.upsert({
            where: { id: user.id },
            update: {
                // If it is the special user, ensure they are ADMIN on every login
                ...(user.email === 'fmencraft@gmail.com' ? { role: 'ADMIN' } : {})
            },
            create: {
                id: user.id,
                email: user.email!,
                name: user.user_metadata?.full_name || user.email?.split('@')[0],
                role: role as any,
            }
        });

        if (dbUser.role === 'ADMIN') {
            target = '/platform'
        }
        // Redirect PRO_USER and others to dashboard by default
        // else if (dbUser.role === 'PRO_USER') { target = '/dashboard' }
    }

    revalidatePath('/', 'layout')
    redirect(target)
}

export async function signup(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string || email.split('@')[0]

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' }
    }

    const supabase = await createClient()

    // 1. Sign Up with Supabase
    // This sends the email automatically if enabled in Supabase Dashboard
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            },
        },
    })

    if (error) {
        return { success: false, error: error.message }
    }

    // 2. CHECK if verification is required
    // If Supabase returns a user but Session is NULL, it means email confirmation is ON.
    if (data.user && !data.session) {
        return { success: true, verify: true }
    }

    // Fallback: If verification is OFF (Auto-confirmed), proceed to login & Prisma creation immediately
    if (data.user && data.session) {
        try {
            await createPrismaUser(data.user, name);
        } catch (e) {
            console.error(e)
        }
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    }

    return { success: false, error: "Something went wrong during signup." }
}

export async function verifySignup(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const code = formData.get('code') as string

    if (!email || !code) {
        return { success: false, error: 'Code is required' }
    }

    const supabase = await createClient()

    // 1. Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
    })

    if (error) {
        return { success: false, error: error.message }
    }

    // 2. Create User in Prisma (Now that they are verified)
    if (data.user) {
        const name = data.user.user_metadata?.full_name || email.split('@')[0]
        await createPrismaUser(data.user, name);
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}


// Helper to avoid duplicate code
async function createPrismaUser(user: any, name: string) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
        })

        if (!existingUser) {
            await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    name: name,
                    role: 'USER',
                }
            })
        }
    } catch (dbError) {
        console.error('Failed to create user in DB:', dbError)
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function updateUserPassword(password: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating password:", error);
        return { success: false, error: "Failed to update password" };
    }
}

export async function deleteUserAccount() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // Delete from Prisma
        await prisma.user.delete({
            where: { id: user.id }
        });

        // Sign out
        await supabase.auth.signOut();

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting account:", error);
        return { success: false, error: error.message || "Failed to delete account" };
    }
}
