'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Activity, Cpu, HardDrive } from "lucide-react";
import { useEffect, useState } from "react";
import { checkDatabaseHealth } from "@/app/actions/platform-actions";

export default function ServersPage() {
    const [dbStatus, setDbStatus] = useState<any>({ status: 'Indeterminate', latency: 0 });

    useEffect(() => {
        const check = async () => {
            const res = await checkDatabaseHealth();
            if (res.success) {
                setDbStatus(res);
            } else {
                setDbStatus({ status: 'Error', latency: -1 });
            }
        };
        const interval = setInterval(check, 5000);
        check();
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Nodes Status</h1>
                <p className="text-muted-foreground">Live monitoring of server infrastructure.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Database Node</CardTitle>
                        <Server className={`h-4 w-4 ${dbStatus.status === 'Healthy' ? 'text-green-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">{dbStatus.status}</div>
                        <p className="text-xs text-muted-foreground font-medium">{dbStatus.latency}ms latency</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">CPU Usage</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">45%</div>
                        <p className="text-xs text-muted-foreground font-medium">Average load (Est)</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Memory</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">12GB</div>
                        <p className="text-xs text-muted-foreground font-medium">Of 32GB total</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Storage</CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">2.4TB</div>
                        <p className="text-xs text-muted-foreground font-medium">Total used space</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-6 bg-white shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-slate-500" /> US-East Node 1 (Primary Application)</h3>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-blue-500 w-[65%] animate-pulse"></div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">CPU Load: 65%</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-6 bg-white shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-slate-500" /> Database Cluster (PostgreSQL)</h3>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div className={`h-full w-[20%] transition-all duration-300 ${dbStatus.latency > 100 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Load: {dbStatus.latency > 0 ? (Math.min(dbStatus.latency / 5, 100)).toFixed(0) : 0}%</p>
                </div>
            </div>
        </div>
    )
}
