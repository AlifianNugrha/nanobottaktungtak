'use server';

import midtransClient from 'midtrans-client';
import { createClient } from '@/utils/supabase/server';
import { grantProAccess } from './platform-actions';

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

export async function createPaymentToken(plan: 'pro_monthly' | 'pro_yearly') {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Define pricing
        const pricing = {
            pro_monthly: {
                price: 100000, // Rp 100,000
                name: 'Pro Plan - 1 Month',
                duration: 30
            },
            pro_yearly: {
                price: 1000000, // Rp 1,000,000 (save 2 months)
                name: 'Pro Plan - 1 Year',
                duration: 365
            }
        };

        const selectedPlan = pricing[plan];

        // Create transaction parameter
        const parameter = {
            transaction_details: {
                // Midtrans max order_id length is 50. ID format: PR-{shortUser}-{timestamp}
                order_id: `PR-${user.id.substring(0, 8)}-${Date.now()}`,
                gross_amount: selectedPlan.price
            },
            item_details: [{
                id: plan,
                price: selectedPlan.price,
                quantity: 1,
                name: selectedPlan.name
            }],
            customer_details: {
                email: user.email,
                first_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            },
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/payment/success`,
                error: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/payment/error`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/payment/pending`
            }
        };

        // Create transaction token
        const transaction = await snap.createTransaction(parameter);

        return {
            success: true,
            token: transaction.token,
            redirect_url: transaction.redirect_url
        };
    } catch (error: any) {
        console.error('Payment token creation error:', error);
        return { success: false, error: error.message };
    }
}

// Webhook handler for Midtrans notification
export async function handlePaymentNotification(notificationJson: any) {
    try {
        // @ts-ignore
        const statusResponse = await (snap as any).transaction.notification(notificationJson);

        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

        // Extract user ID from order_id (format: PRO-{userId}-{timestamp})
        const userId = orderId.split('-')[1];

        // Determine duration from order_id
        const plan = orderId.includes('yearly') ? 365 : 30;

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                // Payment successful, grant Pro access
                await grantProAccess(userId, plan);
                return { success: true, message: 'Payment successful, Pro access granted' };
            }
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            // Payment failed
            return { success: false, message: 'Payment failed or cancelled' };
        } else if (transactionStatus === 'pending') {
            // Payment pending
            return { success: true, message: 'Payment pending' };
        }

        return { success: true, message: 'Notification processed' };
    } catch (error: any) {
        console.error('Payment notification error:', error);
        return { success: false, error: error.message };
    }
}
