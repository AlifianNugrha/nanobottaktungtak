
'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"
import { createNotification } from "./notification-actions"

// Validasi input
const BotSchema = z.object({
    name: z.string().min(1, "Nama bot wajib diisi"),
    description: z.string().optional(),
    config: z.any().optional(),
    userId: z.string().min(1, "User ID wajib ada"),
})

export async function getBots() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const [bots, dbUser] = await Promise.all([
            prisma.bot.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true } },
                    agent: { select: { name: true } },
                    integration: true
                }
            }),
            prisma.user.findUnique({ where: { id: user.id } })
        ]);

        const limitMap: Record<string, number> = { 'USER': 1, 'PRO_USER': 5, 'ADMIN': 999 };
        const limit = dbUser ? (limitMap[dbUser.role as string] || 1) : 1;

        return { success: true, data: bots, limit };
    } catch (error) {
        console.error("Gagal mengambil bots:", error);
        return { success: false, error: "Gagal memuat data bot" };
    }
}


export async function createBot(prevState: any, formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // CHECK BOT LIMITS
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (dbUser) {
            const botCount = await prisma.bot.count({ where: { userId: user.id } });
            const botLimit = (dbUser.role === 'PRO_USER' ? 5 : (dbUser.role === 'ADMIN' ? 999 : 1));

            if (botCount >= botLimit) {
                return { success: false, error: `Upgrade to Pro to create more bots (Limit: ${botLimit})` };
            }
        }

        const name = formData.get("name") as string;
        const agentId = formData.get("agentId") as string | null;
        const integrationId = formData.get("integrationId") as string | null;
        const platform = formData.get("platform") as string;

        // Find agent details for fallback display (only if agentId exists)
        let agent = null;
        if (agentId) {
            agent = await prisma.agent.findUnique({
                where: { id: agentId }
            });
        }

        // Verify agent ownership? Optional but good practice
        if (agent && agent.userId !== user.id) {
            console.warn("User trying to link agent that is not theirs (or system agent)")
            // For now we allow if it's a seed agent or system agent, but typical flow implies user agent
        }

        const configData = {
            agentName: agent?.name || 'Unknown Agent',
            platform: platform,
            isActive: true
        };

        const newBot = await prisma.bot.create({
            data: {
                name,
                description: `Bot ${platform} linked to ${agent?.name}`,
                config: configData,
                userId: user.id,
                agentId: agentId,
                integrationId: integrationId || null,
            }
        });

        // NOTIFICATION
        await createNotification(user.id, 'System', 'Bot Created', `Your bot "${name}" has been successfully created.`);

        revalidatePath("/bot-builder");
        revalidatePath("/integration");
        revalidatePath("/dashboard");
        revalidatePath("/notification");
        return { success: true, message: "Bot berhasil dibuat!", bot: newBot };
    } catch (error: any) {
        console.error("Gagal membuat bot:", error);
        return { success: false, error: error.message || "Gagal membuat bot baru" };
    }
}

export async function deleteBot(botId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const bot = await prisma.bot.findUnique({
            where: { id: botId },
            include: { integration: true }
        });

        if (!bot || bot.userId !== user.id) {
            return { success: false, error: "Unauthorized or not found" };
        }

        // DELETE INTEGRATION IF EXISTS
        if (bot.integrationId) {
            try {
                await prisma.integration.delete({
                    where: { id: bot.integrationId }
                });
            } catch (err) {
                console.warn("Failed to delete associated integration:", err);
            }
        }

        await prisma.bot.delete({
            where: { id: botId }
        });

        // NOTIFICATION
        await createNotification(user.id, 'System', 'Bot Deleted', `Your bot "${bot.name}" has been deleted.`);

        revalidatePath("/bot-builder");
        revalidatePath("/integration");
        revalidatePath("/dashboard");
        revalidatePath("/notification");
        return { success: true };
    } catch (error) {
        console.error("Gagal menghapus bot:", error);
        return { success: false, error: "Gagal menghapus bot" };
    }
}

export async function linkBotToIntegration(botId: string, integrationId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const bot = await prisma.bot.findUnique({ where: { id: botId } });
        if (!bot || bot.userId !== user.id) {
            return { success: false, error: "Unauthorized or bot not found" };
        }

        const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
        if (!integration || integration.userId !== user.id) {
            return { success: false, error: "Unauthorized or integration not found" };
        }

        await prisma.bot.update({
            where: { id: botId },
            data: { integrationId }
        });

        revalidatePath("/bot-builder");
        revalidatePath("/integration");
        revalidatePath("/dashboard");
        return { success: true, message: "Bot berhasil dihubungkan dengan integration!" };
    } catch (error) {
        console.error("Gagal menghubungkan bot dengan integration:", error);
        return { success: false, error: "Gagal menghubungkan bot" };
    }
}

export async function getBotWithDetails(botId: string) {
    try {
        const bot = await prisma.bot.findUnique({
            where: { id: botId },
            include: {
                agent: true,
                integration: true,
                user: { select: { name: true, email: true } }
            }
        });
        return { success: true, data: bot };
    } catch (error) {
        console.error("Gagal mengambil detail bot:", error);
        return { success: false, error: "Gagal memuat detail bot" };
    }
}

