
'use server'

import prisma from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"

export async function getDashboardStats() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
        });

        const isAdmin = dbUser?.role === 'ADMIN';
        const userId = user.id;

        let agentCount, botCount, userCount, monthlyGrowth, aiInteractions, totalLeads;

        if (isAdmin) {
            // ADMIN: Fetch GLOBAL stats
            [agentCount, botCount, userCount, aiInteractions, totalLeads] = await Promise.all([
                prisma.agent.count(),
                prisma.bot.count(),
                prisma.user.count(),
                prisma.conversation.count(), // Approx global interactions
                prisma.customer.count()
            ]);

            // Real Data Analytics (Last 30 Days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const [users, bots] = await Promise.all([
                prisma.user.findMany({
                    where: { createdAt: { gte: thirtyDaysAgo } },
                    select: { createdAt: true }
                }),
                prisma.bot.findMany({
                    where: { createdAt: { gte: thirtyDaysAgo } },
                    select: { createdAt: true }
                })
            ]);

            // Group by date
            const groupedData: Record<string, { users: number, bots: number }> = {};

            // Initialize last 30 days with 0
            for (let i = 0; i < 30; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                groupedData[dateStr] = { users: 0, bots: 0 };
            }

            users.forEach(u => {
                const dateStr = u.createdAt.toISOString().split('T')[0];
                if (groupedData[dateStr]) groupedData[dateStr].users++;
            });

            bots.forEach(b => {
                const dateStr = b.createdAt.toISOString().split('T')[0];
                if (groupedData[dateStr]) groupedData[dateStr].bots++;
            });

            // Convert to array and sort
            monthlyGrowth = Object.entries(groupedData)
                .map(([date, data]) => ({
                    name: date.split('-').slice(1).join('/'), // MM/DD format
                    fullDate: date,
                    users: data.users,
                    bots: data.bots
                }))
                .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

        } else {
            // NORMAL USER: Fetch PRIVATE stats
            [agentCount, botCount, aiInteractions, totalLeads] = await Promise.all([
                prisma.agent.count({ where: { userId } }),
                prisma.bot.count({ where: { userId } }),
                prisma.conversation.count({
                    where: { integration: { userId } }
                }),
                prisma.customer.count({ where: { userId } })
            ]);
            userCount = 1; // Just themselves

            // Real Bot Growth for User
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const bots = await prisma.bot.findMany({
                where: { userId, createdAt: { gte: thirtyDaysAgo } },
                select: { createdAt: true }
            });

            const groupedData: Record<string, { bots: number }> = {};
            for (let i = 0; i < 30; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                groupedData[dateStr] = { bots: 0 };
            }

            bots.forEach(b => {
                const dateStr = b.createdAt.toISOString().split('T')[0];
                if (groupedData[dateStr]) groupedData[dateStr].bots++;
            });

            monthlyGrowth = Object.entries(groupedData)
                .map(([date, data]) => ({
                    name: date.split('-').slice(1).join('/'),
                    fullDate: date,
                    bots: data.bots
                }))
                .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
        }

        return {
            success: true,
            data: {
                totalAgents: agentCount,
                totalBots: botCount,
                totalUsers: userCount,
                aiInteractions: aiInteractions || 0,
                totalLeads: totalLeads || 0,
                activeNodes: 3,
                systemStatus: 'Operational',
                monthlyGrowth,
                isAdmin
            }
        };
    } catch (error) {
        console.error("Gagal mengambil stats:", error);
        return { success: false, error: "Gagal memuat statistik" };
    }
}
