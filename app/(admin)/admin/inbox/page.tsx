
import { Suspense } from 'react';
import { getInboxConversations } from '@/app/actions/inbox-actions';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { InboxClient } from './inbox-client';
import { MessageSquare } from 'lucide-react';

export const metadata = {
    title: 'Inbox / Live Chat - NanoArtif',
    description: 'Manage real-time customer conversations.',
};

export default async function InboxPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const isPro = user.role === 'PRO_USER' || user.role === 'ADMIN';
    if (!isPro) {
        redirect('/dashboard/upgrade');
    }

    // Fetch initial conversations on server side
    const conversations = await getInboxConversations(user.id);

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col">
            {/* 
         Height calc: 100vh - header height. 
         Ideally, inbox should take full remaining screen height. 
      */}
            <div className="flex-1 flex overflow-hidden">
                <InboxClient initialConversations={conversations} userId={user.id} />
            </div>
        </div>
    );
}
