'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPlatformStats() {
    try {
        const totalUsers = await prisma.user.count();
        const totalAgents = await prisma.agent.count();
        const totalBots = await prisma.bot.count();
        const totalIntegrations = await prisma.integration.count();

        // Count PRO users
        const proUsers = await prisma.user.count({
            where: { role: 'PRO_USER' }
        });

        // Recent users for growth (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsersLast30Days = await prisma.user.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo
                }
            }
        });

        return {
            success: true,
            data: {
                totalUsers,
                totalAgents,
                totalBots,
                totalIntegrations,
                proUsers,
                newUsersLast30Days
            }
        };
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        return { success: false, error: 'Failed to fetch stats' };
    }
}

export async function getOrganizationsData() {
    try {
        // Since we don't have a dedicated Organization table, 
        // we'll group users by companyName
        const usersWithCompany = await prisma.user.findMany({
            where: {
                companyName: {
                    not: null
                }
            },
            select: {
                id: true,
                companyName: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        agents: true,
                        bots: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group logic or just return list
        return { success: true, data: usersWithCompany };
    } catch (error) {
        return { success: false, error: 'Failed to fetch organizations' };
    }
}

export async function getSubscriptionStats() {
    try {
        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: {
                role: true
            }
        });

        const stats = {
            USER: 0,
            PRO_USER: 0,
            ADMIN: 0
        };

        usersByRole.forEach(group => {
            if (group.role in stats) {
                stats[group.role as keyof typeof stats] = group._count.role;
            }
        });

        const totalRevenue = stats.PRO_USER * 29; // Assuming $29/mo

        return { success: true, data: { ...stats, totalRevenue } };
    } catch (error) {
        return { success: false, error: 'Failed to fetch subscription stats' };
    }
}

export async function getMediaStats() {
    try {
        // Count products with images
        const productsWithImages = await prisma.product.count({
            where: {
                image: {
                    not: null
                }
            }
        });

        // Count agents with avatars
        const agentsWithAvatars = await prisma.agent.count({
            where: {
                avatar: {
                    not: null
                }
            }
        });

        return {
            success: true,
            data: {
                productsWithImages,
                agentsWithAvatars,
                totalItems: productsWithImages + agentsWithAvatars
            }
        };
    } catch (error) {
        return { success: false, error: 'Failed to fetch media stats' };
    }
}

export async function checkDatabaseHealth() {
    try {
        const start = Date.now();
        // Simple query to check connection
        await prisma.$queryRaw`SELECT 1`;
        const duration = Date.now() - start;

        return {
            success: true,
            status: 'Healthy',
            latency: duration
        };
    } catch (error) {
        return { success: false, error: 'Database Unreachable' };
    }
}

// DELETE USER ACTION
import { createClient } from '@/utils/supabase/server';

export async function deleteUserById(userId: string) {
    try {
        // 1. Delete from Prisma (Cascade will handle related data if configured, otherwise might need manual cleanup)
        await prisma.user.delete({
            where: { id: userId }
        });

        // 2. Delete from Supabase Auth (Optional but recommended for clean cleanup)
        // Note: This requires SERVICE_ROLE_KEY if run server-side, 
        // OR acts on behalf of the logged-in admin if they have permissions.
        // Standard admin client might not be able to delete other users unless it's a Service Role client.
        // For now, let's try standard client, if fails, we rely on Prisma delete.
        // Ideally: use createServiceRoleClient() for admin actions. 

        try {
            const supabase = await createClient(); // Try with current admin session
            const { error } = await supabase.auth.admin.deleteUser(userId);
            if (error) {
                console.log("Supabase Auth delete warning (might need service role):", error.message);
            }
        } catch (authError) {
            console.log("Supabase Auth delete skipped:", authError);
        }

        revalidatePath('/platform');
        return { success: true };
    } catch (error: any) {
        console.error("Delete user error:", error);
        return { success: false, error: error.message };
    }
}

// UPGRADE USER TO PRO ACTION
export async function grantProAccess(userId: string, durationDays: number = 30) {
    try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);

        await prisma.user.update({
            where: { id: userId },
            data: {
                role: 'PRO_USER',
                subscriptionPlan: 'Pro',
                maxTokenLimit: 100000,
                subscriptionStart: startDate,
                subscriptionEnd: endDate
            }
        });

        revalidatePath('/platform');
        return { success: true };
    } catch (error: any) {
        console.error("Grant Pro error:", error);
        return { success: false, error: error.message };
    }
}
