import { NextRequest, NextResponse } from 'next/server';
import { restoreExistingSessions } from '@/lib/whatsapp-service';
import { createClient } from '@/utils/supabase/server';

/**
 * API endpoint to restore WhatsApp sessions from database
 * This should be called on server startup or manually when needed
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[API] Restoring WhatsApp sessions...');
        await restoreExistingSessions();

        return NextResponse.json({
            success: true,
            message: 'Sessions restored successfully'
        });
    } catch (error: any) {
        console.error('[API] Error restoring sessions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
