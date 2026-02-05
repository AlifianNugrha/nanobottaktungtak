'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, FileVideo, Music, HardDrive, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getMediaStats } from "@/app/actions/platform-actions";

export default function MediaPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getMediaStats();
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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Media Monitoring</h1>
                <p className="text-muted-foreground">Manage uploaded files and storage usage.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Product Images</CardTitle>
                        <Image className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">{stats?.productsWithImages || 0}</div>
                        <p className="text-xs text-muted-foreground font-medium">Files linked to products</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Agent Avatars</CardTitle>
                        <FileVideo className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">{stats?.agentsWithAvatars || 0}</div>
                        <p className="text-xs text-muted-foreground font-medium">Profile images</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Total Files</CardTitle>
                        <Music className="h-4 w-4 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">{stats?.totalItems || 0}</div>
                        <p className="text-xs text-muted-foreground font-medium">Indexed media assets</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-xl border border-dashed border-border p-8 py-16 text-center bg-card flex flex-col items-center justify-center">
                <HardDrive className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Media Storage Overview</h3>
                <p className="text-muted-foreground max-w-md mb-6">Scanning completed for {stats?.totalItems} media files across the platform.</p>
                <Button variant="outline" className="font-bold">Refresh Storage Scan</Button>
            </div>
        </div>
    )
}
