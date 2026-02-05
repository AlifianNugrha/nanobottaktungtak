import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentNotification } from '@/app/actions/payment-actions';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await handlePaymentNotification(body);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
