'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign } from '@/app/actions/campaign-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Megaphone, Calendar, ChevronRight, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { deleteCampaign } from '@/app/actions/campaign-actions';

export function CampaignListClient({ campaigns, userId }: { campaigns: any[], userId: string }) {
    const { t } = useLanguage();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [template, setTemplate] = useState('Halo {{name}}, kami ada promo spesial untuk Anda! 🎁');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleCreate() {
        if (!name || !template) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('messageTemplate', template);
        formData.append('userId', userId);

        const result = await createCampaign(formData);

        if (result.success) {
            toast.success(t('Campaign created successfully!'));
            setIsDialogOpen(false);
            router.push(`/admin/campaign/${result.campaignId}`); // Redirect to detail
        } else {
            toast.error('Error: ' + result.error);
        }
        setIsLoading(false);
    }

    async function handleDelete(campaignId: string, campaignName: string, e: React.MouseEvent) {
        e.preventDefault(); // Prevent navigation to detail page
        e.stopPropagation();

        if (!confirm(`Delete campaign "${campaignName}"? This action cannot be undone.`)) {
            return;
        }

        const result = await deleteCampaign(campaignId);

        if (result.success) {
            toast.success(t('Campaign deleted successfully!'));
            router.refresh(); // Refresh the page to update the list
        } else {
            toast.error('Error: ' + result.error);
        }
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <p className="text-sm text-slate-500">{t('Total Campaign')}</p>
                    <p className="text-2xl font-bold">{campaigns.length}</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#1E90FF] hover:bg-[#187bcd] text-white gap-2 shadow-lg shadow-blue-500/20">
                            <Plus className="h-4 w-4" />
                            {t('Create New Campaign')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('Create New Broadcast')}</DialogTitle>
                            <DialogDescription>
                                {t('Start WhatsApp marketing campaign.')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('Campaign Name')}</label>
                                <Input
                                    placeholder={t('Example: Ramadhan Promo')}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('Message Template')}</label>
                                <Textarea
                                    placeholder="Halo..."
                                    className="h-32"
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                />
                                <p className="text-xs text-slate-500">
                                    {t('Use {{name}} to greet customer by name automatically.')}
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>{t('Cancel')}</Button>
                            <Button onClick={handleCreate} disabled={isLoading} className="bg-[#1E90FF] text-white">
                                {isLoading ? t('Processing...') : t('Create Draft')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((camp) => (
                    <Link key={camp.id} href={`/admin/campaign/${camp.id}`} className="block group">
                        <Card className="h-full hover:border-[#1E90FF]/50 hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {camp.name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => handleDelete(camp.id, camp.name, e)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                                        title="Delete campaign"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <Megaphone className="h-4 w-4 text-muted-foreground group-hover:text-[#1E90FF]" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground mt-2 line-clamp-2 italic bg-slate-50 p-2 rounded border border-slate-100 mb-4">
                                    "{camp.messageTemplate}"
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <Users className="w-3 h-3" />
                                        <span>{(camp as any)._count?.recipients || 0} {t('Recipients')}</span>
                                    </div>
                                    <Badge variant="outline" className={
                                        camp.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                            camp.status === 'sending' ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' :
                                                'bg-slate-100 text-slate-700'
                                    }>
                                        {camp.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
