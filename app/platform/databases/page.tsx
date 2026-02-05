import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, HardDrive, Share2 } from "lucide-react";

export default function DatabasesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Database Health</h1>
                <p className="text-muted-foreground">Database status, replication and backups.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> Primary Cluster</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm">Status</span>
                            <span className="text-sm font-bold text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Online</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm">Connections</span>
                            <span className="text-sm font-bold">452 / 1000</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm">CPU Load</span>
                            <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[25%]"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Share2 className="w-5 h-5 text-primary" /> Read Replica 1</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm">Replication Lag</span>
                            <span className="text-sm font-bold text-green-500">0ms</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm">Connections</span>
                            <span className="text-sm font-bold">890 / 2000</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm">Sync Status</span>
                            <span className="text-sm font-bold text-green-500">Synchronized</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
