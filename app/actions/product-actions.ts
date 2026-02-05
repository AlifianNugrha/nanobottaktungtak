
'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { createNotification } from "./notification-actions"

export async function getProducts() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // Fetch User for Limit
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        const limit = dbUser && (dbUser.role === 'PRO_USER' || dbUser.role === 'ADMIN') ? 9999 : 1;

        const products = await prisma.product.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: products, limit };
    } catch (error) {
        console.error("Gagal mengambil produk:", error);
        return { success: false, error: "Gagal memuat data produk" };
    }
}

export async function createProduct(formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // CHECK PRODUCT LIMITS
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (dbUser) {
            const productCount = await prisma.product.count({ where: { userId: user.id } });
            const limit = dbUser.role === 'PRO_USER' || dbUser.role === 'ADMIN' ? 9999 : 1;

            if (productCount >= limit) {
                return { success: false, error: `Limit Reached! Free plan allows only ${limit} product(s). Upgrade to Pro!` };
            }
        }

        const name = formData.get("name") as string;
        const price = formData.get("price") as string;
        const category = formData.get("category") as string;
        const description = formData.get("description") as string;
        const stock = parseInt(formData.get("stock") as string || "0");
        const image = formData.get("image") as string;

        const product = await prisma.product.create({
            data: {
                name,
                price,
                category,
                description,
                stock,
                image,
                userId: user.id
            }
        });

        revalidatePath("/product-manager");
        revalidatePath("/agent");
        revalidatePath("/notification");

        // NOTIFICATION
        await createNotification(user.id, 'System', 'Product Created', `New product "${name}" has been added to your catalog.`);

        return { success: true, data: product };
    } catch (error: any) {
        console.error("Gagal membuat produk:", error);
        return { success: false, error: error.message };
    }
}

export async function updateProduct(id: string, formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const name = formData.get("name") as string;
        const price = formData.get("price") as string;
        const category = formData.get("category") as string;
        const description = formData.get("description") as string;
        const stock = parseInt(formData.get("stock") as string || "0");
        const image = formData.get("image") as string;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                price,
                category,
                description,
                stock,
                image
            }
        });

        revalidatePath("/product-manager");
        revalidatePath("/agent");
        revalidatePath("/notification");

        // NOTIFICATION
        await createNotification(user.id, 'System', 'Product Updated', `Product "${name}" has been updated.`);

        return { success: true, data: product };
    } catch (error: any) {
        console.error("Gagal update produk:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteProduct(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const product = await prisma.product.findUnique({ where: { id } });

        if (!product || product.userId !== user.id) {
            return { success: false, error: "Unauthorized or not found" };
        }

        await prisma.product.delete({
            where: { id }
        });

        revalidatePath("/product-manager");
        revalidatePath("/agent");
        revalidatePath("/notification");

        // NOTIFICATION
        await createNotification(user.id, 'System', 'Product Deleted', `Product "${product.name}" has been removed from your catalog.`);

        return { success: true };
    } catch (error) {
        console.error("Gagal hapus produk:", error);
        return { success: false, error: "Gagal menghapus produk" };
    }
}
