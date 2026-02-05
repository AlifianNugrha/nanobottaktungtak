import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, UserCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Security & Auth</h1>
                <p className="text-muted-foreground">Manage system-wide security policies and logs.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auth Attempts</CardTitle>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,345</div>
                        <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">23</div>
                        <p className="text-xs text-muted-foreground">Action required</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Security Audit Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="bg-secondary/50 p-2 rounded-full">
                                        <Shield className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Policy Update: Password Complexity</p>
                                        <p className="text-xs text-muted-foreground">Updated by Admin via Console</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-foreground">10 mins ago</p>
                                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Success</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
