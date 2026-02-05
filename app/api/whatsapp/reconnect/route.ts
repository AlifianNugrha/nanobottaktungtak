
import { NextRequest, NextResponse } from 'next/server';
import { createWhatsAppSession, getSession } from '@/lib/whatsapp-service';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { integrationId } = await req.json();

        if (!integrationId) {
            return NextResponse.json({ error: 'Integration ID required' }, { status: 400 });
        }

        // Verify ownership
        const integration = await prisma.integration.findUnique({
            where: { id: integrationId }
        });

        if (!integration || integration.userId !== user.id) {
            return NextResponse.json({ error: 'Integration not found or unauthorized' }, { status: 404 });
        }

        // Create/Refresh Baileys session
        const session = await createWhatsAppSession(integration.id);

        return NextResponse.json({
            success: true,
            sessionId: session.sessionId,
            status: session.status
        });
    } catch (error: any) {
        console.error('Error reconnecting WhatsApp session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
