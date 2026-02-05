'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

/**
 * Get AI Analytics data from database
 */
export async function getAIAnalytics() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        const isPro = dbUser?.role === 'PRO_USER' || dbUser?.role === 'ADMIN';

        if (!isPro) {
            return { success: false, error: 'Pro subscription required' };
        }

        // Get all conversations for this user
        const conversations = await prisma.conversation.findMany({
            where: {
                integration: {
                    userId: user.id
                }
            },
            include: {
                integration: true
            }
        });

        // Calculate total messages (from all conversations)
        let totalMessages = 0;
        let totalConversations = conversations.length;

        conversations.forEach(conv => {
            const messages = conv.messages as any[];
            totalMessages += messages.length;
        });

        // Get total customers
        const totalCustomers = await prisma.customer.count({
            where: { userId: user.id }
        });

        // Get sales data for conversion tracking
        const sales = await prisma.sale.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        const completedSales = sales.filter(s => s.status === 'Completed').length;
        const totalSales = sales.length;
        const conversionRate = totalConversations > 0
            ? ((completedSales / totalConversations) * 100).toFixed(1)
            : '0.0';

        // Calculate sentiment (simplified - based on conversation activity)
        // In real app, you'd use NLP to analyze message sentiment
        const avgSentiment = totalMessages > 0 ? 'Positive' : 'Neutral';

        // Calculate chat resolution rate (simplified)
        // Assume conversations with >2 messages are "resolved"
        const resolvedConversations = conversations.filter(conv => {
            const messages = conv.messages as any[];
            return messages.length >= 2;
        }).length;

        const resolutionRate = totalConversations > 0
            ? ((resolvedConversations / totalConversations) * 100).toFixed(1)
            : '0.0';

        // Conversion funnel data
        const totalLeads = totalCustomers;
        const leadsIdentified = Math.floor(totalCustomers * 0.6); // 60% identified as leads
        const paymentLinks = completedSales + Math.floor(completedSales * 0.5); // Some pending
        const closedDeals = completedSales;

        // Top intents (simplified - based on common patterns)
        // In real app, you'd use NLP to extract intents from messages
        const topIntents = [
            { intent: 'Product Inquiry', count: Math.floor(totalMessages * 0.4), pct: '40%' },
            { intent: 'Price Check', count: Math.floor(totalMessages * 0.25), pct: '25%' },
            { intent: 'Order Status', count: Math.floor(totalMessages * 0.20), pct: '20%' },
            { intent: 'Support', count: Math.floor(totalMessages * 0.15), pct: '15%' },
        ];

        return {
            success: true,
            data: {
                // Top metrics
                metrics: {
                    resolutionRate: `${resolutionRate}%`,
                    avgSentiment,
                    conversionRate: `${conversionRate}%`,
                    totalMessages: totalMessages > 1000
                        ? `${(totalMessages / 1000).toFixed(1)}k`
                        : totalMessages.toString()
                },
                // Conversion funnel
                funnel: [
                    { label: 'Total Conversations', value: totalConversations.toLocaleString(), width: 'w-full', color: 'bg-primary' },
                    { label: 'Leads Identified', value: leadsIdentified.toLocaleString(), width: 'w-[65%]', color: 'bg-primary/70' },
                    { label: 'Payment Link Generated', value: paymentLinks.toLocaleString(), width: 'w-[40%]', color: 'bg-primary/50' },
                    { label: 'Closing / Paid', value: closedDeals.toLocaleString(), width: 'w-[25%]', color: 'bg-primary/30' },
                ],
                // Top intents
                topIntents,
                // AI Insight (generated based on data)
                aiInsight: generateAIInsight(totalMessages, totalCustomers, completedSales)
            }
        };
    } catch (error: any) {
        console.error('Error fetching AI analytics:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate AI insight based on real data
 */
function generateAIInsight(totalMessages: number, totalCustomers: number, completedSales: number) {
    if (totalMessages === 0) {
        return {
            title: "Belum ada data percakapan",
            recommendation: "Mulai connect WhatsApp bot Anda untuk mendapatkan insight AI yang powerful!"
        };
    }

    if (completedSales === 0) {
        return {
            title: `Anda memiliki ${totalCustomers} customer potensial dari ${totalMessages} pesan`,
            recommendation: "Aktifkan fitur payment link dan product recommendation untuk meningkatkan konversi!"
        };
    }

    const conversionRate = ((completedSales / totalCustomers) * 100).toFixed(0);

    if (parseInt(conversionRate) < 10) {
        return {
            title: `Conversion rate Anda ${conversionRate}% - masih bisa ditingkatkan!`,
            recommendation: "Optimalkan response time bot dan tambahkan knowledge base untuk jawaban yang lebih akurat."
        };
    }

    return {
        title: `Performa bagus! ${completedSales} sales dari ${totalCustomers} customers (${conversionRate}%)`,
        recommendation: "Pertahankan momentum dengan broadcast campaign dan loyalty program untuk repeat customers."
    };
}
