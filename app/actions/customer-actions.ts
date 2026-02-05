'use server';

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, data: [] };

    try {
        const customers = await prisma.customer.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: customers };
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        return { success: false, data: [] };
    }
}

export async function createCustomer(formData: { name: string; email: string; phone: string; status: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.customer.create({
            data: {
                userId: user.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                status: formData.status
            }
        });
        revalidatePath('/customer');
        return { success: true };
    } catch (error) {
        console.error("Failed to create customer:", error);
        return { success: false, error: "Failed to create customer" };
    }
}

export async function updateCustomer(id: string, formData: { name: string; email: string; phone: string; status: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.customer.update({
            where: { id: id, userId: user.id },
            data: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                status: formData.status
            }
        });
        revalidatePath('/customer');
        return { success: true };
    } catch (error) {
        console.error("Failed to update customer:", error);
        return { success: false, error: "Failed to update customer" };
    }
}

export async function deleteCustomer(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.customer.delete({
            where: { id: id, userId: user.id }
        });
        revalidatePath('/customer');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete customer:", error);
        return { success: false, error: "Failed to delete customer" };
    }
}
