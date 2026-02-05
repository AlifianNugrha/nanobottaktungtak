
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Users, BarChart3, Settings, Menu, X,
    ShoppingCart, CreditCard, Package, Bot, Zap, Plug,
    Bell, Sparkles, Lock, LucideIcon, LogOut
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/actions/auth-actions';

export function SidebarFree() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
    };

    interface NavItem {
        href: string;
        label: string;
        icon: LucideIcon;
        premium?: boolean;
        isLocked?: boolean;
    }

    interface NavCategory {
        category: string;
        items: NavItem[];
    }

    const navCategories: NavCategory[] = [
        {
            category: 'Premium Access',
            items: [{ href: '/admin/pricing', label: 'Upgrade to Pro', icon: Sparkles, premium: true }],
        },
        {
            category: 'Overview',
            items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
        },
        {
            category: 'Core',
            items: [
                { href: '/agent', label: 'Agent', icon: Zap },
                { href: '/bot-builder', label: 'Bot Builder', icon: Bot },
                { href: '/integration', label: 'Integration', icon: Plug },
            ],
        },
        {
            category: 'Management',
            items: [
                { href: '/customer', label: 'Customers', icon: Users },
                { href: '/product-manager', label: 'Products', icon: Package },
            ],
        },
        {
            category: 'Sales & Finance',
            items: [
                { href: '/sales-monitoring', label: 'Sales Monitoring', icon: ShoppingCart },
                { href: '/payment', label: 'Payments', icon: CreditCard, isLocked: true },
            ],
        },
        {
            category: 'Analytics',
            items: [
                { href: '/ai-analytic', label: 'AI Analytics', icon: BarChart3, isLocked: true },
            ],
        },
        {
            category: 'System',
            items: [
                { href: '/notification', label: 'Notifications', icon: Bell },
                { href: '/settings', label: 'Settings', icon: Settings },
            ],
        },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg border border-border"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <aside className={cn(
                'fixed left-0 top-0 h-[100dvh] w-72 bg-white border-r border-border transition-transform duration-300 z-40 flex flex-col overflow-hidden',
                'md:translate-x-0',
                isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            )}>
                {/* Branding */}
                <div className="p-6 border-b border-border bg-white shrink-0">
                    <div className="flex items-center justify-center w-full">
                        <div className="w-full flex justify-center items-center pointer-events-none select-none">
                            <img src="/logo.png" alt="NanoArtif" className="w-full h-auto object-contain max-h-12" />
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-5 space-y-7 overflow-y-auto scrollbar-hide overscroll-contain">
                    {navCategories.map((category, idx) => (
                        <div key={category.category}>
                            <h3 className="text-xs font-black text-muted-foreground/50 px-3 mb-3 uppercase tracking-[0.2em]">
                                {category.category}
                            </h3>
                            <div className="space-y-1.5">
                                {category.items.map(({ href, label, icon: Icon, premium, isLocked }) => {
                                    const isActive = pathname === href;
                                    return (
                                        <Link
                                            key={href}
                                            href={isLocked ? '/admin/pricing' : href}
                                            onClick={() => setIsOpen(false)}
                                            scroll={false}
                                            className={cn(
                                                'flex items-center gap-4 px-4 h-12 transition-all duration-200 rounded-xl relative group outline-none select-none',
                                                isActive
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : premium
                                                        ? 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200'
                                                        : isLocked
                                                            ? 'opacity-40 grayscale hover:bg-transparent cursor-not-allowed'
                                                            : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'
                                            )}
                                        >
                                            <Icon className={cn(
                                                "w-5 h-5 shrink-0",
                                                isActive ? "text-white" : premium ? "text-orange-600 animate-bounce-slow" : "text-muted-foreground/70"
                                            )} />
                                            <span className={cn("text-[14px] font-bold tracking-tight whitespace-nowrap", premium && "uppercase font-black")}>
                                                {label}
                                            </span>
                                            {isLocked && <Lock className="ml-auto w-4 h-4 text-muted-foreground/60" />}
                                        </Link>
                                    );
                                })}
                            </div>
                            {idx === 0 && <div className="mt-8 border-b border-border/50 mx-2" />}
                        </div>
                    ))}
                </nav>

                {/* Bottom Area - Free Plan Badge */}
                <div className="p-5 border-t bg-gray-50/50 shrink-0 mt-auto">
                    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-border shadow-sm mb-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Current Plan</span>
                            <span className="text-[13px] font-black text-primary">
                                FREE PLAN
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-black">US</div>
                        <div className="flex-1 overflow-hidden text-left">
                            <p className="text-[14px] font-bold truncate leading-none mb-1">User Nanobot</p>
                            <p className="text-[10px] text-muted-foreground truncate uppercase font-medium tracking-tighter">Free Account</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-gray-100 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay mobile */}
            {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsOpen(false)} />}
            <div className="md:ml-72" />
        </>
    );
}
