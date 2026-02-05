'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, TrendingUp, Loader2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSubscriptionStats } from "@/app/actions/platform-actions";

export default function SubscriptionsPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getSubscriptionStats();
            if (res.success && res.data) {
                setStats(res.data);
            }
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Subscriptions</h1>
                <p className="text-muted-foreground">Monitor revenue and plan subscriptions.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Est. Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">${stats?.totalRevenue?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground font-medium">Based on active Pro plans</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Pro Subscribers</CardTitle>
                        <CreditCard className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">{stats?.PRO_USER || 0}</div>
                        <p className="text-xs text-muted-foreground font-medium">Active Pro Plans</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Free Users</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">{stats?.USER || 0}</div>
                        <p className="text-xs text-muted-foreground font-medium">Potential upgrades</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-slate-200">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Subscription Overview</h3>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">System Healthy</h4>
                            <p className="text-xs text-slate-500">Subscription processing is active. Total {stats?.PRO_USER + stats?.USER} accounts managed.</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
