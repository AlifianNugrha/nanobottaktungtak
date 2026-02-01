'use client';

import { Card } from '@/components/ui/card';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Server, Activity, Shield, Users, Terminal, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

const systemData = [
    { time: '00:00', cpu: 45, memory: 60 },
    { time: '04:00', cpu: 55, memory: 65 },
    { time: '08:00', cpu: 85, memory: 80 },
    { time: '12:00', cpu: 75, memory: 70 },
    { time: '16:00', cpu: 65, memory: 65 },
    { time: '20:00', cpu: 50, memory: 60 },
];

const trafficData = [
    { name: 'API Calls', value: 45000 },
    { name: 'Web Traffic', value: 12000 },
    { name: 'Database', value: 8500 },
];

const COLORS = ['#0f172a', '#3b82f6', '#64748b'];

export default function PlatformDashboard() {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-xl">
                            <Server className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Nodes</p>
                            <h3 className="text-2xl font-black text-slate-900">24/24</h3>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-500">
                        <span>US-East1: 12</span>
                        <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Stable</span>
                    </div>
                </Card>

                <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-xl">
                            <Activity className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Latency</p>
                            <h3 className="text-2xl font-black text-slate-900">42ms</h3>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-500">
                        <span>Avg Load: 65%</span>
                        <span className="text-blue-600 flex items-center gap-1"><Activity className="w-3 h-3" /> Optimal</span>
                    </div>
                </Card>

                <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-xl">
                            <Shield className="w-6 h-6 text-slate-700" />
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

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Traffic Chart */}
                <Card className="col-span-1 lg:col-span-2 p-6 border-slate-200 shadow-sm">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Resource Usage</h3>
                        <div className="flex gap-2 text-xs font-medium bg-slate-100 p-1 rounded-lg">
                            <span className="px-2 py-1 bg-white shadow-sm rounded">CPU</span>
                            <span className="px-2 py-1 text-slate-500">Memory</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={systemData}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} fontSize={12} />
                            <YAxis axisLine={false} tickLine={false} fontSize={12} />
                            <Tooltip />
                            <Legend />
                            <Line type="step" dataKey="cpu" stroke="#0f172a" strokeWidth={2} dot={false} />
                            <Line type="step" dataKey="memory" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Traffic Distribution */}
                <Card className="col-span-1 p-6 border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Traffic Sources</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={trafficData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {trafficData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-500">Total requests per second</p>
                        <p className="text-xl font-black text-slate-900">84.2k/s</p>
                    </div>
                </Card>
            </div>

            {/* Logs Terminal Preview */}
            <Card className="bg-[#1e1e1e] border-slate-800 p-4 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
                <div className="flex items-center gap-2 mb-3 border-b border-gray-700 pb-2">
                    <Terminal className="text-gray-400 w-4 h-4" />
                    <span className="text-gray-400">System Logs</span>
                </div>
                <div className="space-y-1.5 text-gray-300">
                    <p><span className="text-blue-400">[INFO]</span> Service 'auth-worker-01' started successfully.</p>
                    <p><span className="text-green-400">[SUCCESS]</span> Database migration completed in 1.2s.</p>
                    <p><span className="text-yellow-400">[WARN]</span> High latency detected on node us-east-4 (120ms).</p>
                    <p><span className="text-blue-400">[INFO]</span> Scaling up worker pool to handle incoming load...</p>
                    <p className="animate-pulse">_</p>
                </div>
            </Card>
        </div>
    );
}
