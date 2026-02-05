
'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { createNotification } from "./notification-actions"

export async function getIntegrations() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const integrations = await prisma.integration.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: integrations };
    } catch (error) {
        console.error("Gagal mengambil integrations:", error);
        return { success: false, error: "Gagal memuat data integration" };
    }
}

export async function createIntegration(prevState: any, formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const platform = formData.get("platform") as string;
        const name = formData.get("name") as string;

        const newIntegration = await prisma.integration.create({
            data: {
                platform,
                name,
                status: 'connecting',
                userId: user.id,
                config: {
                    createdAt: new Date().toISOString()
                }
            }
        });

        revalidatePath("/integration");
        revalidatePath("/bot-builder");
        revalidatePath("/dashboard");
        revalidatePath("/notification");

        // NOTIFICATION
        await createNotification(user.id, 'System', 'Integration Added', `New integration added: ${platform} (${name}).`);

        return { success: true, message: "Integration created successfully", integration: newIntegration };
    } catch (error: any) {
        console.error("Gagal membuat integration:", error);
        return { success: false, error: error.message || "Failed to create integration" };
    }
}

export async function updateIntegrationStatus(id: string, status: string, config?: any) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const integration = await prisma.integration.findUnique({ where: { id } })
        if (!integration || integration.userId !== user.id) {
            return { success: false, error: "Unauthorized or not found" }
        }

        const updatedIntegration = await prisma.integration.update({
            where: { id },
            data: {
                status,
                config: config || integration.config
            }
        });

        // NOTIFICATION
        if (status === 'connected') {
            await createNotification(user.id, 'System', 'Integration Connected', `Integration with ${integration.platform} is now CONNECTED.`);
        } else if (status === 'disconnected') {
            await createNotification(user.id, 'System', 'Integration Disconnected', `Integration with ${integration.platform} has been disconnected.`);
        }

        revalidatePath("/integration");
        revalidatePath("/bot-builder");
        revalidatePath("/dashboard");
        revalidatePath("/notification");

        return { success: true, message: "Integration updated successfully", integration: updatedIntegration };
    } catch (error: any) {
        console.error("Gagal update integration:", error);
        return { success: false, error: error.message || "Failed to update integration" };
    }
}

export async function deleteIntegration(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const integration = await prisma.integration.findUnique({ where: { id } })
        if (!integration || integration.userId !== user.id) {
            return { success: false, error: "Unauthorized or not found" }
        }

        await prisma.integration.delete({ where: { id } });

        revalidatePath("/integration");
        revalidatePath("/bot-builder");
        revalidatePath("/dashboard");
        revalidatePath("/notification");

        // NOTIFICATION
        await createNotification(user.id, 'System', 'Integration Deleted', `Integration with ${integration.platform} has been deleted.`);

        return { success: true };
    } catch (error) {
        console.error("Gagal delete integration:", error);
        return { success: false, error: "Gagal menghapus integration" };
    }
}
