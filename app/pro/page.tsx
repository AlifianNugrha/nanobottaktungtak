'use client';

import { Card } from '@/components/ui/card';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, TrendingUp, Activity, Zap, FileText, Crown, DollarSign, ArrowUpRight } from 'lucide-react';

const proData = [
    { month: 'Jan', profit: 4000, revenue: 2400 },
    { month: 'Feb', profit: 3000, revenue: 1398 },
    { month: 'Mar', profit: 2000, revenue: 9800 },
    { month: 'Apr', profit: 2780, revenue: 3908 },
    { month: 'May', profit: 1890, revenue: 4800 },
    { month: 'Jun', profit: 2390, revenue: 3800 },
];

export default function ProDashboard() {
    const stats = [
        { title: 'Total Revenue', value: '$120,543', change: '+22.5%', icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-600/10' },
        { title: 'Pro Users', value: '1,243', change: '+12.2%', icon: Crown, color: 'text-orange-600', bg: 'bg-orange-600/10' },
        { title: 'Conversion Rate', value: '8.4%', change: '+5.1%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-600/10' },
        { title: 'Server Load', value: '45%', change: '-2.3%', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-600/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Pro Dashboard</h1>
                        <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Premium</span>
                    </div>
                    <p className="text-muted-foreground">Advanced analytics and premium controls.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium shadow-sm">
                        Last 30 Days
                    </div>
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2">
                        Download Report <FileText className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="p-6 bg-white border-border shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                                    <h3 className="text-2xl font-black mt-2 group-hover:text-orange-600 transition-colors">{stat.value}</h3>
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-0.5">
                                            <ArrowUpRight className="w-3 h-3" /> {stat.change}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">vs prev period</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 p-6 bg-white border-border shadow-sm">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold">Revenue Overview</h3>
                            <p className="text-xs text-muted-foreground">Comparison of Profit vs Revenue</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={proData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fillOpacity={0} fill="transparent" strokeDasharray="5 5" />
                            <Legend />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="col-span-1 p-6 bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-xl shadow-orange-600/20">
                    <h3 className="text-lg font-bold mb-2">Pro Insights</h3>
                    <p className="text-orange-100 text-sm mb-6">Your growth is outpacing the market average by 15%.</p>

                    <div className="space-y-4">
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">User Retention</span>
                                <span className="font-bold">92%</span>
                            </div>
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[92%]"></div>
                            </div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">AI Usage</span>
                                <span className="font-bold">8.4k req</span>
                            </div>
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[65%]"></div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-3 bg-white text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors">
                        View Full Report
                    </button>
                </Card>
            </div>
        </div>
    );
}
