import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

/**
 * API endpoint to cleanup stuck WhatsApp integrations
 * DELETE /api/whatsapp/cleanup
 */
export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete all 'connecting' integrations older than 5 minutes
        const result = await prisma.integration.deleteMany({
            where: {
                userId: user.id,
                platform: 'WhatsApp',
                status: 'connecting',
                createdAt: {
                    lt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
                }
            }
        });

        console.log(`[Cleanup API] Deleted ${result.count} stuck integrations for user ${user.id}`);

        return NextResponse.json({
            success: true,
            deletedCount: result.count,
            message: `Cleaned up ${result.count} stuck integration(s)`
        });
    } catch (error: any) {
        console.error('[Cleanup API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET endpoint to check how many stuck integrations exist
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stuckIntegrations = await prisma.integration.findMany({
            where: {
                userId: user.id,
                platform: 'WhatsApp',
                status: 'connecting',
                createdAt: {
                    lt: new Date(Date.now() - 5 * 60 * 1000)
                }
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                status: true
            }
        });

        return NextResponse.json({
            success: true,
            count: stuckIntegrations.length,
            integrations: stuckIntegrations
        });
    } catch (error: any) {
        console.error('[Cleanup API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
