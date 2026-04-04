import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram-service';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId, chatId, message } = await req.json();

        if (!sessionId || !chatId || !message) {
            return NextResponse.json(
                { error: 'sessionId, chatId, dan message wajib diisi' },
                { status: 400 }
            );
        }

        await sendTelegramMessage(sessionId, chatId, message);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error sending Telegram message:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
