'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addRecipientsFromCustomers, launchCampaign } from '@/app/actions/campaign-actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Users, Send, CheckCircle, XCircle, Clock, Play, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function CampaignDetailClient({ campaign, userId }: { campaign: any, userId: string }) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState({
        total: campaign.recipients?.length || 0,
        sent: campaign.recipients?.filter((r: any) => r.status === 'sent').length || 0,
        failed: campaign.recipients?.filter((r: any) => r.status === 'failed').length || 0,
        pending: campaign.recipients?.filter((r: any) => r.status === 'pending').length || 0
    });

    // Auto-refresh stats when campaign is sending
    useEffect(() => {
        if (campaign.status === 'sending') {
            const interval = setInterval(() => {
                router.refresh();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [campaign.status, router]);

    // Process Queue (Client-driven polling)
    useEffect(() => {
        if (campaign.status === 'sending' && !isProcessing) {
            processQueue();
        }
    }, [campaign.status]);

    async function processQueue() {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/campaign/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: campaign.id })
            });

            const data = await res.json();

            if (data.status === 'completed') {
                toast.success('Campaign selesai! 🎉');
                router.refresh();
                setIsProcessing(false);
            } else if (data.status === 'processing') {
                // Continue polling
                setTimeout(() => processQueue(), 5000); // 5 sec delay between batches
            }
        } catch (error) {
            console.error('Queue processing error:', error);
            setIsProcessing(false);
        }
    }

    async function handleAddRecipients() {
        const result = await addRecipientsFromCustomers(campaign.id, userId);
        if (result.success) {
            toast.success(`${result.count} customer ditambahkan!`);
            router.refresh();
        } else {
            toast.error('Error: ' + result.error);
        }
    }

    async function handleLaunch() {
        if (!confirm('Yakin ingin mengirim campaign ini? Proses tidak bisa dibatalkan.')) return;

        const result = await launchCampaign(campaign.id);
        if (result.success) {
            toast.success('Campaign dimulai! Pesan sedang dikirim...');
            router.refresh();
        } else {
            toast.error('Gagal memulai campaign');
        }
    }

    const progress = stats.total > 0 ? ((stats.sent + stats.failed) / stats.total) * 100 : 0;

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/campaign">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{campaign.name}</h1>
                    <p className="text-sm text-slate-500 mt-1">Campaign ID: {campaign.id.slice(0, 8)}</p>
                </div>
                <Badge variant="outline" className={
                    campaign.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        campaign.status === 'sending' ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' :
                            campaign.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-slate-100 text-slate-700'
                }>
                    {campaign.status.toUpperCase()}
                </Badge>
            </div>

            {/* Warning Banner */}
            {campaign.status === 'draft' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-amber-900">Peringatan Penting</p>
                        <p className="text-amber-700 mt-1">
                            WhatsApp dapat memblokir nomor yang mengirim pesan massal terlalu cepat.
                            Sistem kami sudah menambahkan delay otomatis, namun tetap gunakan dengan bijak.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Target</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Terkirim</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gagal</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Bar */}
            {campaign.status === 'sending' && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Progress Pengiriman</span>
                                <span className="text-muted-foreground">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                Sedang memproses... Jangan tutup halaman ini.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Message Template */}
            <Card>
                <CardHeader>
                    <CardTitle>Template Pesan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm whitespace-pre-wrap">
                        {campaign.messageTemplate}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
                {campaign.status === 'draft' && stats.total === 0 && (
                    <Button onClick={handleAddRecipients} variant="outline" className="gap-2">
                        <Users className="w-4 h-4" />
                        Tambah Target dari Customer
                    </Button>
                )}

                {campaign.status === 'draft' && stats.total > 0 && (
                    <Button onClick={handleLaunch} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                        <Play className="w-4 h-4" />
                        Mulai Kirim Campaign
                    </Button>
                )}
            </div>

            {/* Recipients Table */}
            {stats.total > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Penerima</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {campaign.recipients.map((recipient: any) => (
                                <div key={recipient.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{recipient.customerName}</p>
                                        <p className="text-xs text-muted-foreground">{recipient.customerPhone}</p>
                                    </div>
                                    <Badge variant="outline" className={
                                        recipient.status === 'sent' ? 'bg-green-50 text-green-700 border-green-200' :
                                            recipient.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-slate-100 text-slate-700'
                                    }>
                                        {recipient.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
