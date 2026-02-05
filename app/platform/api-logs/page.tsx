import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ApiLogsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Traffic Logs</h1>
                <p className="text-muted-foreground">Real-time API usage and error tracking.</p>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden font-mono text-xs md:text-sm">
                <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center">
                    <span className="font-bold flex items-center gap-2"><Terminal className="w-4 h-4" /> Live Stream</span>
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                <div className="p-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4 p-3 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                            <span className="text-muted-foreground w-24 shrink-0">12:45:{10 + i}</span>
                            <span className={i % 3 === 0 ? "text-red-500 font-bold w-16 shrink-0" : "text-green-500 font-bold w-16 shrink-0"}>
                                {i % 3 === 0 ? '500' : '200'}
                            </span>
                            <span className="text-foreground truncate flex-1">
                                {i % 3 === 0 ? 'GET /api/v1/unknown-endpoint - Internal Server Error' : 'POST /api/v1/auth/session - OK'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
