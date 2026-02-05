
import { Suspense } from 'react';
import { getCampaigns } from '@/app/actions/campaign-actions';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { CampaignListClient } from './campaign-list-client';

export const metadata = {
    title: 'Broadcast Campaigns - NanoArtif',
    description: 'Manage WhatsApp marketing campaigns.',
};

export default async function CampaignPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const campaigns = await getCampaigns(user.id);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Campaigns & Broadcast</h2>
            </div>
            <CampaignListClient campaigns={campaigns} userId={user.id} />
        </div>
    );
}
