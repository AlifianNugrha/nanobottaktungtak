
'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"
import { createNotification } from "./notification-actions"

export async function getAgents() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const [agents, dbUser] = await Promise.all([
            prisma.agent.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.findUnique({ where: { id: user.id } })
        ]);

        const limitMap: Record<string, number> = { 'USER': 1, 'PRO_USER': 10, 'ADMIN': 999 };
        const limit = dbUser ? (limitMap[dbUser.role as string] || 1) : 1;

        return { success: true, data: agents, limit };
    } catch (error) {
        console.error("Gagal mengambil agents:", error);
        return { success: false, error: "Gagal memuat data agent" };
    }
}

export async function createAgent(prevState: any, formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // Ensure user exists in database first & Get Role
        const dbUser = await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
                id: user.id,
                email: user.email!,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                role: 'USER'
            }
        });

        // CHECK AGENT LIMITS
        const agentCount = await prisma.agent.count({ where: { userId: user.id } });
        const userLimit = (dbUser.role === 'PRO_USER' ? 10 : (dbUser.role === 'ADMIN' ? 999 : 1));

        if (agentCount >= userLimit) {
            return { success: false, error: `Upgrade to Pro to create more agents (Limit: ${userLimit})` };
        }

        const name = formData.get("name") as string;
        const model = formData.get("model") as string;
        const prompt = formData.get("prompt") as string;

        const products = JSON.parse(formData.get("products") as string || "[]");
        const knowledge = JSON.parse(formData.get("knowledge") as string || "[]");

        const newAgent = await prisma.agent.create({
            data: {
                name,
                role: 'Custom Agent',
                description: `Powered by ${model}`,
                userId: user.id,
                config: {
                    model: model,
                    instructions: prompt,
                    products: products,
                    knowledge: knowledge
                }
            }
        });

        revalidatePath("/agent");
        revalidatePath("/bot-builder");
        revalidatePath("/dashboard");
        revalidatePath("/notification");

        // NOTIFICATION
        await createNotification(user.id, 'System', 'Agent Created', `Your agent "${name}" has been successfully created.`);

        return { success: true, message: "Agent created successfully", agent: newAgent };
    } catch (error: any) {
        console.error("Gagal membuat agent:", error);
        return { success: false, error: error.message || "Failed to create agent" };
    }
}

export async function updateAgent(id: string, formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const name = formData.get("name") as string;
        const model = formData.get("model") as string;
        const prompt = formData.get("prompt") as string;
        const products = JSON.parse(formData.get("products") as string || "[]");
        const knowledge = JSON.parse(formData.get("knowledge") as string || "[]");

        // Ensure user owns the agent
        const agent = await prisma.agent.findUnique({ where: { id } })
        if (!agent || agent.userId !== user.id) {
            return { success: false, error: "Unauthorized or not found" }
        }

        const updatedAgent = await prisma.agent.update({
            where: { id },
            data: {
                name,
                description: `Powered by ${model}`,
                config: {
                    model: model,
                    instructions: prompt,
                    products: products,
                    knowledge: knowledge
                }
            }
        });

        revalidatePath("/agent");
        revalidatePath("/bot-builder");
        revalidatePath("/dashboard");
        revalidatePath("/notification");

        // NOTIFICATION
        await createNotification(user.id, 'System', 'Agent Updated', `Your agent "${name}" has been successfully updated.`);

        return { success: true, message: "Agent updated successfully", agent: updatedAgent };
    } catch (error: any) {
        console.error("Gagal update agent:", error);
        return { success: false, error: error.message || "Failed to update agent" };
    }
}

export async function deleteAgent(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // Ensure user owns the agent
        const agent = await prisma.agent.findUnique({ where: { id } })
        if (!agent || agent.userId !== user.id) {
            return { success: false, error: "Unauthorized or not found" }
        }

        await prisma.agent.delete({ where: { id } });
        revalidatePath("/agent");
        revalidatePath("/bot-builder");
        revalidatePath("/dashboard");
        revalidatePath("/notification");

        // NOTIFICATION
        await createNotification(user.id, 'System', 'Agent Deleted', `Your agent "${agent.name}" has been deleted.`);
        return { success: true };
    } catch (error) {
        console.error("Gagal delete agent:", error);
        return { success: false, error: "Gagal menghapus agent" };
    }
}
