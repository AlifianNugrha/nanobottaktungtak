
import { Suspense } from 'react';
import { getCampaignDetails } from '@/app/actions/campaign-actions';
import { getCurrentUser } from '@/lib/session';
import { redirect, notFound } from 'next/navigation';
import { CampaignDetailClient } from './campaign-detail-client';
import prisma from '@/lib/prisma';

export const metadata = {
    title: 'Campaign Details - NanoArtif',
};

// Next.js 15 params are async
type Props = {
    params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: Props) {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const { id } = await params;
    const campaign = await getCampaignDetails(id);

    // Check for active integrations
    const integrationsRes = await prisma.integration.findMany({
        where: { userId: user.id, platform: 'WhatsApp', status: 'connected' }
    });

    if (!campaign) {
        notFound();
    }

    return (
        <div className="flex-1 p-8 pt-6">
            <CampaignDetailClient
                campaign={campaign}
                userId={user.id}
                hasActiveBot={integrationsRes.length > 0}
            />
        </div>
    );
}
