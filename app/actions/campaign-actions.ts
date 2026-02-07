'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Create a new campaign draft
 */
export async function createCampaign(formData: FormData) {
    const name = formData.get('name') as string;
    const messageTemplate = formData.get('messageTemplate') as string;
    const userId = formData.get('userId') as string;

    if (!name || !messageTemplate || !userId) {
        return { success: false, error: 'Missing Required Fields' };
    }

    try {
        const campaign = await (prisma as any).campaign.create({
            data: {
                name,
                messageTemplate,
                status: 'draft',
                userId
            }
        });

        revalidatePath('/admin/campaign');
        return { success: true, campaignId: campaign.id };
    } catch (error: any) {
        console.error('Error creating campaign:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all campaigns for a user
 */
export async function getCampaigns(userId: string) {
    try {
        const campaigns = await (prisma as any).campaign.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { recipients: true }
                }
            }
        });
        return campaigns;
    } catch (error) {
        return [];
    }
}

/**
 * Get campaign details with recipients
 */
export async function getCampaignDetails(id: string) {
    try {
        const campaign = await (prisma as any).campaign.findUnique({
            where: { id },
            include: {
                recipients: true
            }
        });
        return campaign;
    } catch (error) {
        return null;
    }
}

/**
 * Add recipients to campaign from Customer list
 */
export async function addRecipientsFromCustomers(campaignId: string, userId: string) {
    try {
        // Fetch all customers for this user
        // In real app, you might want to filter by tags/segment
        const customers = await prisma.customer.findMany({
            where: { userId }
        });

        if (customers.length === 0) return { success: false, error: 'No customers found' };

        const recipientData = customers.map(c => ({
            campaignId,
            customerName: c.name,
            customerPhone: c.phone,
            status: 'pending'
        }));

        // Batch insert recipients
        await (prisma as any).campaignRecipient.createMany({
            data: recipientData,
            skipDuplicates: true
        });

        revalidatePath(`/admin/campaign/${campaignId}`);
        return { success: true, count: customers.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Add manual recipients to campaign
 */
export async function addManualRecipients(campaignId: string, phoneNumbersString: string) {
    try {
        // Split by comma or newline and clean up
        const lines = phoneNumbersString.split(/[\n,]+/).map(line => line.trim()).filter(line => line.length > 0);

        if (lines.length === 0) return { success: false, error: 'No phone numbers provided' };

        const recipientData = lines.map(line => {
            // Support "Name:Phone" or just "Phone"
            let name = null;
            let phone = line;

            if (line.includes(':')) {
                const parts = line.split(':');
                name = parts[0].trim();
                phone = parts[1].trim();
            }

            // Basic phone cleaning (remove non-digits, simplify for WA)
            phone = phone.replace(/\D/g, '');
            if (!phone.startsWith('62') && phone.startsWith('0')) {
                phone = '62' + phone.substring(1);
            }

            return {
                campaignId,
                customerName: name,
                customerPhone: phone,
                status: 'pending'
            };
        }).filter(r => r.customerPhone.length > 5); // Filter out obviously invalid numbers

        // Batch insert recipients
        await (prisma as any).campaignRecipient.createMany({
            data: recipientData,
            skipDuplicates: true
        });

        revalidatePath(`/admin/campaign/${campaignId}`);
        return { success: true, count: recipientData.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Remove a single recipient
 */
export async function removeRecipient(recipientId: string, campaignId: string) {
    try {
        await (prisma as any).campaignRecipient.delete({
            where: { id: recipientId }
        });
        revalidatePath(`/admin/campaign/${campaignId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Clear all recipients from a campaign
 */
export async function clearRecipients(campaignId: string) {
    try {
        await (prisma as any).campaignRecipient.deleteMany({
            where: { campaignId }
        });
        revalidatePath(`/admin/campaign/${campaignId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * START CAMPAIGN (This is tricky in Server Actions due to timeout)
 * For MVP, we will trigger it, but backend processing should ideally be a background job
 * Here we will just set status to 'sending' and the client will call a process API
 */
export async function launchCampaign(campaignId: string) {
    try {
        await (prisma as any).campaign.update({
            where: { id: campaignId },
            data: { status: 'sending', scheduledAt: new Date() }
        });
        revalidatePath('/admin/campaign');
        revalidatePath(`/admin/campaign/${campaignId}`);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

/**
 * Update campaign settings (like delays)
 */
export async function updateCampaignSettings(campaignId: string, data: { minDelay?: number, maxDelay?: number }) {
    try {
        await (prisma as any).campaign.update({
            where: { id: campaignId },
            data
        });
        revalidatePath(`/admin/campaign/${campaignId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string) {
    try {
        // Delete campaign (recipients will be cascade deleted due to schema)
        await (prisma as any).campaign.delete({
            where: { id: campaignId }
        });

        revalidatePath('/admin/campaign');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting campaign:', error);
        return { success: false, error: error.message };
    }
}
