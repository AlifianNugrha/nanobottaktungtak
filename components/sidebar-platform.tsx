'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Shield,
    Activity,
    CreditCard,
    Settings,
    LogOut,
    ChevronRight,
    Command,
    Monitor,
    Database,
    Search,
    Zap,
    Bell,
    Layers,
    Terminal,
    Server,
    Globe,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItem {
    href: string;
    label: string;
    icon: any;
    badge?: string;
}

interface NavCategory {
    category: string;
    items: NavItem[];
}

const navCategories: NavCategory[] = [
    {
        category: 'System',
        items: [
            { href: '/platform', label: 'Global Overview', icon: LayoutDashboard },
            { href: '/platform/analytics', label: 'Platform Stats', icon: Activity },
        ],
    },
    {
        category: 'Management',
        items: [
            { href: '/platform/users', label: 'All Users', icon: Users, badge: '1.2k' },
            { href: '/platform/organizations', label: 'Organizations', icon: Layers },
            { href: '/platform/subscriptions', label: 'Subscriptions', icon: CreditCard },
        ],
    },
    {
        category: 'Infrastructure',
        items: [
            { href: '/platform/servers', label: 'Nodes Status', icon: Server },
            { href: '/platform/api-logs', label: 'Traffic Logs', icon: Terminal },
            { href: '/platform/databases', label: 'Database Health', icon: Database },
        ],
    },
    {
        category: 'Configuration',
        items: [
            { href: '/platform/settings', label: 'System Settings', icon: Settings },
            { href: '/platform/security', label: 'Security & Auth', icon: Shield },
            { href: '/platform/integrations', label: 'Global Plugins', icon: Globe },
        ],
    },
];

export function SidebarPlatform() {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        router.replace('/login');
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="hidden md:flex w-72 flex-col bg-white border-r border-border h-screen sticky top-0 transition-all duration-300">
            {/* LOGO AREA */}
            <div className="p-6 border-b border-border bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-slate-900">NEXORA</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest -mt-1 underline decoration-primary decoration-2 underline-offset-4">Platform Admin</span>
                    </div>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="px-5 py-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search platform..."
                        className="w-full bg-gray-100 border-none rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                </div>
            </div>

            {/* NAVIGATION */}
            <ScrollArea className="flex-1 px-4 py-2 space-y-8 scrollbar-hide">
                {navCategories.map((category, idx) => (
                    <div key={idx} className="space-y-1 mb-6">
                        <h4 className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 opacity-70">
                            {category.category}
                        </h4>
                        {category.items.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={cn(
                                        "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 mb-1",
                                        isActive
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]"
                                            : "text-muted-foreground hover:text-slate-900 hover:bg-slate-50 active:scale-95"
                                    )}>
                                        <item.icon className={cn(
                                            "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-slate-900"
                                        )} />
                                        <span className="text-sm font-bold flex-1 tracking-tight">{item.label}</span>
                                        {item.badge && (
                                            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-md border border-primary/20">
                                                {item.badge}
                                            </span>
                                        )}
                                        {isActive && (
                                            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ))}

                {/* PRO VIEW QUICK ACCESS */}
                <div className="px-4 py-4 mt-6">
                    <Link href="/pro" className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-dashed border-primary/30 hover:bg-primary/10 transition-colors group">
                        <Zap className="w-5 h-5 text-primary" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">Go to Pro View</span>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Switch Dashboard</span>
                        </div>
                    </Link>
                </div>
            </ScrollArea>

            {/* USER PROFILE & LOGOUT */}
            <div className="p-4 border-t border-border mt-auto bg-gray-50/50">
                <div className="p-3 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-border group">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-primary/20 p-0.5">
                            <AvatarImage src="https://github.com/shadcn.png" className="rounded-xl" />
                            <AvatarFallback className="rounded-xl bg-slate-900 text-white font-bold">SA</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-sm font-black text-slate-900 truncate">Super Admin</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">System Access</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
