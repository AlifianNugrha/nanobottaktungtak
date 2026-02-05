'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSales() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const sales = await prisma.sale.findMany({
            where: { userId: user.id },
            orderBy: { date: 'desc' },
            take: 50
        });

        // Convert Decimal to number/string for client serialization
        const serializedSales = sales.map(s => ({
            ...s,
            amount: s.amount.toString(),
            date: s.date.toISOString().split('T')[0] // Format YYYY-MM-DD
        }));

        return { success: true, data: serializedSales };
    } catch (error) {
        console.error('Error fetching sales:', error);
        return { success: false, error: 'Failed to fetch sales' };
    }
}

export async function getSalesStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const sales = await prisma.sale.findMany({
            where: { userId: user.id }
        });

        const totalRevenue = sales.reduce((acc, curr) => acc + curr.amount.toNumber(), 0);
        const totalOrders = sales.length;

        // Average Order Value
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                avgOrderValue
            }
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { success: false, error: 'Failed to fetch stats' };
    }
}

export async function createSale(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const customerName = formData.get('customerName') as string;
    const productName = formData.get('productName') as string;
    const amount = formData.get('amount') as string;
    const status = formData.get('status') as string || 'Pending';
    const dateStr = formData.get('date') as string; // Optional, ISO string

    if (!customerName || !productName || !amount) {
        return { success: false, error: 'Missing required fields' };
    }

    try {
        await prisma.sale.create({
            data: {
                userId: user.id,
                customerName,
                productName,
                amount: Number(amount),
                status,
                date: dateStr ? new Date(dateStr) : new Date()
            }
        });

        revalidatePath('/sales-monitoring');
        return { success: true };
    } catch (error) {
        console.error('Error creating sale:', error);
        return { success: false, error: 'Failed to create sale' };
    }
}

export async function deleteSale(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.sale.delete({
            where: { id, userId: user.id }
        });
        revalidatePath('/sales-monitoring');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
