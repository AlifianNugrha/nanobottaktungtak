
import { Suspense } from 'react';
import { getKnowledgeDocs, getAgentsList } from '@/app/actions/knowledge-actions';
import { getCurrentUser } from '@/lib/session'; // Assuming this helper exists
import { redirect } from 'next/navigation';
import { KnowledgeClient } from './knowledge-client';
import prisma from '@/lib/prisma'; // Direct db access for server component

export const metadata = {
    title: 'Knowledge Base - NanoArtif',
    description: 'Manage knowledge documents for your AI agents.',
};

export default async function KnowledgePage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch data
    const docs = await getKnowledgeDocs(user.id);
    const agents = await getAgentsList(user.id);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Knowledge Base (RAG)</h2>
                <div className="flex items-center space-x-2">
                    {/* Action buttons will be in client component */}
                </div>
            </div>

            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                <KnowledgeClient initialDocs={docs} agents={agents} userId={user.id} />
            </div>
        </div>
    );
}
