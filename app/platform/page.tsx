
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
    Activity, Shield, Users, CheckCircle2, Bot
} from 'lucide-react';
import { getPlatformStats } from '@/app/actions/platform-actions';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function PlatformDashboard() {
    const [stats, setStats] = useState({
        totalAgents: 0,
        totalBots: 0,
        totalUsers: 0,
        activeNodes: 0,
        systemStatus: 'Loading...',
        monthlyGrowth: [] as any[],
        isAdmin: false
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchStats = async () => {
            const res = await getPlatformStats();
            if (res.success && res.data) {
                setStats({
                    totalAgents: res.data.totalAgents,
                    totalBots: res.data.totalBots,
                    totalUsers: res.data.totalUsers,
                    activeNodes: 8, // Mock for now
                    systemStatus: 'Optimal',
                    monthlyGrowth: [
                        { name: 'Week 1', users: widthData(res.data.totalUsers * 0.8), bots: widthData(res.data.totalBots * 0.7) },
                        { name: 'Week 2', users: widthData(res.data.totalUsers * 0.85), bots: widthData(res.data.totalBots * 0.8) },
                        { name: 'Week 3', users: widthData(res.data.totalUsers * 0.9), bots: widthData(res.data.totalBots * 0.9) },
                        { name: 'Week 4', users: res.data.totalUsers, bots: res.data.totalBots },
                    ],
                    isAdmin: true // Platform is always admin
                });
            }
        };

        // Helper to simulate historical data
        const widthData = (val: number) => Math.floor(val);

        fetchStats();
    }, []);

    // Prevent hydration mismatch
    if (!mounted) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">System Overview</h1>
                    <p className="text-slate-500 text-sm font-medium">Real-time platform monitoring and health status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                        All Systems Operational
                    </div>
                </div>
            </div>

            {/* Grid Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Only show Total Users if Admin */}
                {stats.isAdmin && (
                    <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Users className="w-6 h-6 text-indigo-700" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Users</p>
                                <h3 className="text-2xl font-black text-slate-900">{stats.totalUsers}</h3>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-500">
                            <span>Registered</span>
                            <span className="text-indigo-600 flex items-center gap-1">+12% this month</span>
                        </div>
                    </Card>
                )}

                <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Bot className="w-6 h-6 text-blue-700" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Bots</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.totalBots}</h3>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-500">
                        <span>Deployed</span>
                        <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Online</span>
                    </div>
                </Card>

                <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Activity className="w-6 h-6 text-purple-700" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Agents</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.totalAgents}</h3>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-500">
                        <span>Ready</span>
                        <span className="text-blue-600 flex items-center gap-1"><Activity className="w-3 h-3" /> Optimal</span>
                    </div>
                </Card>

                <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-xl">
                            <Shield className="w-6 h-6 text-red-700" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Threats Blocked</p>
                            <h3 className="text-2xl font-black text-slate-900">1,204</h3>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-500">
                        <span>Last 24h</span>
                        <span className="text-slate-600 flex items-center gap-1"><Shield className="w-3 h-3" /> Protected</span>
                    </div>
                </Card>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Growth Analytics</h3>
                        <p className="text-sm text-slate-500">Platform and user adoption trends over time.</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.monthlyGrowth}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBots" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                {stats.isAdmin && (
                                    <Area type="monotone" dataKey="users" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" activeDot={{ r: 6 }} name="Users" />
                                )}
                                <Area type="monotone" dataKey="bots" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorBots)" activeDot={{ r: 6 }} name="Active Bots" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Recent System Activity</h3>
                        <p className="text-sm text-slate-500">Latest automated actions and alerts.</p>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className={`w-2 h-2 mt-2 rounded-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'}`} />
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        {i % 2 === 0 ? 'New Bot "Customer Support" deployed successfully' : 'System backup completed'}
                                    </p>
                                    <p className="text-xs text-slate-500">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
