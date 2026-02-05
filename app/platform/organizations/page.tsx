'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { getOrganizationsData } from "@/app/actions/platform-actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getOrganizationsData();
            if (res.success && res.data) {
                setOrganizations(res.data);
            }
            setIsLoading(false);
        };
        load();
    }, []);

    // Filter out users without company name just in case, though action handles it
    // eslint-disable-next-line
    const companies = organizations.filter(u => u.companyName);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Organizations</h1>
                    <p className="text-muted-foreground">Manage all registered organizations and workspaces.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search organizations..."
                        className="pl-8 bg-card"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Total Organizations</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">{companies.length}</div>
                        <p className="text-xs text-muted-foreground">Registered Companies</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-slate-200">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Organization List</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Resources</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell>
                                </TableRow>
                            ) : companies.length > 0 ? (
                                companies.map((org) => (
                                    <TableRow key={org.id}>
                                        <TableCell className="font-bold text-slate-800">{org.companyName}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{org.name || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">{org.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 text-xs">
                                                <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold">{org._count.agents} Agents</span>
                                                <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold">{org._count.bots} Bots</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs font-medium">
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No organizations found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
