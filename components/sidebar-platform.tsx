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
    Plus,
    Image,
    Menu,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/actions/auth-actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/components/language-provider';

export function SidebarPlatform() {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();

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
            category: t('System'),
            items: [
                { href: '/platform', label: t('Global Overview'), icon: LayoutDashboard },
                { href: '/platform/analytics', label: t('Platform Stats'), icon: Activity },
            ],
        },
        {
            category: t('Management'),
            items: [
                { href: '/platform/users', label: t('All Users'), icon: Users, badge: '1.2k' },
                { href: '/platform/organizations', label: t('Organizations'), icon: Layers },
                { href: '/platform/subscriptions', label: t('Subscriptions'), icon: CreditCard },
                { href: '/platform/media', label: t('Media Monitoring'), icon: Image },
            ],
        },
        {
            category: t('Infrastructure'),
            items: [
                { href: '/platform/servers', label: t('Nodes Status'), icon: Server },
                { href: '/platform/api-logs', label: t('Traffic Logs'), icon: Terminal },
                { href: '/platform/databases', label: t('Database Health'), icon: Database },
            ],
        },
        {
            category: t('Configuration'),
            items: [
                { href: '/platform/settings', label: t('System Settings'), icon: Settings },
                { href: '/platform/security', label: t('Security & Auth'), icon: Shield },
                { href: '/platform/integration', label: t('Global Plugins'), icon: Globe },
            ],
        },
    ];

    const handleLogout = async () => {
        await logout();
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden h-16 bg-card border-b border-border flex items-center px-4 justify-between sticky top-0 z-30 w-full shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        className="p-2 -ml-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                        onClick={() => setIsOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        <span className="font-bold text-lg tracking-tight text-foreground">NANOBOT</span>
                    </div>
                </div>
            </div>

            <aside className={cn(
                'fixed left-0 top-0 h-[100dvh] w-72 bg-card border-r border-border transition-transform duration-300 z-50 flex flex-col overflow-hidden',
                'md:translate-x-0',
                isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            )}>
                {/* LOGO AREA */}
                <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                            <Shield className="w-6 h-6 text-white dark:text-slate-900" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-foreground">NANOBOT</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest -mt-1 underline decoration-primary decoration-2 underline-offset-4">Platform Admin</span>
                        </div>
                    </div>
                    {/* Close button for mobile inside sidebar */}
                    <button
                        className="md:hidden text-muted-foreground hover:text-foreground"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* SEARCH BAR */}
                <div className="px-5 py-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search platform..."
                            className="w-full bg-secondary border-none rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto scrollbar-hide">
                    {navCategories.map((category, idx) => (
                        <div key={idx} className="space-y-1 mb-6">
                            <h4 className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 opacity-70">
                                {category.category}
                            </h4>
                            {category.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                                        <div className={cn(
                                            "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 mb-1",
                                            isActive
                                                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl shadow-slate-200 scale-[1.02]"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95"
                                        )}>
                                            <item.icon className={cn(
                                                "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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
                        <Link href="/dashboard" className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-dashed border-primary/30 hover:bg-primary/10 transition-colors group">
                            <Zap className="w-5 h-5 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-foreground">Go to Pro View</span>
                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Switch Dashboard</span>
                            </div>
                        </Link>
                    </div>
                </nav>

                {/* USER PROFILE & LOGOUT */}
                <div className="p-4 border-t border-border mt-auto bg-secondary/30">
                    <div className="p-3 rounded-2xl hover:bg-card transition-colors border border-transparent hover:border-border group">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-primary/20 p-0.5">
                                <AvatarImage src="https://github.com/shadcn.png" className="rounded-xl" />
                                <AvatarFallback className="rounded-xl bg-slate-900 text-white font-bold">SA</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-sm font-black text-foreground truncate">Super Admin</span>
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
            </aside>

            {/* Overlay mobile */}
            {isOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />}

            {/* Spacer for Desktop Sidebar */}
            <div className="hidden md:block w-72 shrink-0 transition-all duration-300" />
        </>
    );
}
