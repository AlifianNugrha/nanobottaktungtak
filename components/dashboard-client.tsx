
'use client';

import { Card } from '@/components/ui/card';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Users, TrendingUp, Activity, Zap, Bot, Crown, ArrowRight, MessageSquare, Settings } from 'lucide-react';
import { getDashboardStats } from '@/app/actions/dashboard-actions';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useLanguage } from './language-provider';

const dashboardData = [
    { month: 'Jan', users: 2400, revenue: 2210, engagement: 2290 },
    { month: 'Feb', users: 3398, revenue: 2210, engagement: 2000 },
    { month: 'Mar', users: 2800, revenue: 9800, engagement: 2290 },
    { month: 'Apr', users: 3908, revenue: 3908, engagement: 2000 },
    { month: 'May', users: 4800, revenue: 4800, engagement: 2181 },
    { month: 'Jun', users: 3800, revenue: 3800, engagement: 2500 },
];

export function DashboardClient({ isPro, userName, userEmail, companyName, userImage }: { isPro: boolean; userName: string; userEmail: string; companyName: string; userImage?: string }) {
    const { t } = useLanguage();
    const [statsData, setStatsData] = useState({
        totalAgents: 0,
        totalBots: 0,
        activeNodes: 0,
        systemStatus: t('Loading...'),
        monthlyGrowth: [] as any[],
        isAdmin: false
    });

    useEffect(() => {
        async function load() {
            const res = await getDashboardStats();
            if (res.success && res.data) {
                // @ts-ignore
                setStatsData(res.data);
            }
        }
        load();
    }, []);

    // Stats data
    const stats = [
        {
            title: t('AI Agents'),
            value: statsData.totalAgents.toString(),
            change: '+100%',
            icon: Users,
            color: 'text-[#1E90FF]',
        },
        {
            title: t('Active Bots'),
            value: statsData.totalBots.toString(),
            change: '+100%',
            icon: Bot,
            color: 'text-[#1E90FF]',
        },
        {
            title: t('AI Interactions'),
            // @ts-ignore
            value: (statsData.aiInteractions || 0).toString(),
            change: t('Real-time'),
            icon: Zap,
            color: 'text-[#1E90FF]',
        },
        {
            title: t('Total Leads'),
            // @ts-ignore
            value: (statsData.totalLeads || 0).toString(),
            change: t('Active'),
            icon: TrendingUp,
            color: 'text-[#1E90FF]',
        },
    ];


    return (
        <div className="max-w-7xl mx-auto w-full space-y-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('Dashboard')}</h1>
                        {isPro && (
                            <div className="bg-[#1E90FF] text-white text-[10px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1 shadow-lg shadow-[#1E90FF]/20">
                                <Crown className="w-3 h-3" /> Pro
                            </div>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {isPro ? t("Advanced analytics overview for your Pro workspace.") : t("Welcome back! Here's your analytics overview.")}
                    </p>
                </div>

                {/* Profile Card Summary */}
                <div className="bg-white p-3 rounded-2xl border border-border shadow-sm flex items-center gap-4 min-w-[300px]">
                    <div className="w-12 h-12 bg-[#1E90FF] rounded-xl flex items-center justify-center text-white font-bold text-lg uppercase shadow-lg shadow-[#1E90FF]/20 overflow-hidden">
                        {userImage ? (
                            <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                            userName ? userName.substring(0, 2) : t('US')
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm text-foreground truncate">{userName}</p>
                        <p className="text-xs text-muted-foreground truncate">{companyName || t('No Company')}</p>
                    </div>
                    <div className="text-[10px] font-bold uppercase text-[#1E90FF] bg-[#1E90FF]/10 px-2 py-1 rounded-lg">
                        {t('You')}
                    </div>
                </div>
            </div>


            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className="p-6 bg-white border-border hover:border-primary/30 transition-all duration-300 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold text-foreground tracking-tight">
                                        {stat.value}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <span className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                                            {stat.change}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground lowercase">{t('vs last month')}</span>
                                    </div>
                                </div>
                                <div className="p-2 rounded-xl bg-primary/5 text-primary">
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                {/* Growth Line Chart */}
                <Card className="p-6 bg-white border-border shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-foreground">{statsData.isAdmin ? t('User Growth') : t('Bot Usage Growth')}</h3>
                        <p className="text-xs text-muted-foreground">{t('Real-time accumulation data')}</p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={statsData.monthlyGrowth}>
                            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }}
                            />
                            <Legend iconType="circle" />
                            <Line
                                type="monotone"
                                dataKey={statsData.isAdmin ? "users" : "bots"}
                                stroke="var(--primary)"
                                strokeWidth={3}
                                dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name={statsData.isAdmin ? t("New Users") : t("Bots Created")}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Revenue Bar Chart */}
                <Card className="p-6 bg-white border-border shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-foreground">{statsData.isAdmin ? t('System Volume') : t('Bot Interactions')}</h3>
                        <p className="text-xs text-muted-foreground">{t('Activity metrics')}</p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statsData.monthlyGrowth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend iconType="circle" />
                            <Bar dataKey="bots" name={t("Active Bots")} fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}
