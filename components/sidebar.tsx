
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BarChart3, Settings, Menu, X,
  ShoppingCart, CreditCard, Package, Bot, Zap, Plug,
  Bell, Sparkles, Lock, ArrowUpRight, LucideIcon, LogOut, Crown, BookOpen, MessageSquare, Megaphone
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/actions/auth-actions';
import { useLanguage } from './language-provider';

export function Sidebar({ isPro, userName, role, userEmail }: { isPro: boolean; userName: string; role?: string; userEmail?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

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
      category: t('Premium Access'),
      items: [{ href: isPro ? '/dashboard' : '/dashboard/upgrade', label: isPro ? t('Pro Feature Active') : t('Upgrade to Pro'), icon: Sparkles, premium: true }],
    },
    {
      category: t('Overview'),
      items: [{ href: '/dashboard', label: t('Dashboard'), icon: LayoutDashboard }],
    },
    {
      category: t('Core'),
      items: [
        { href: '/admin/inbox', label: t('Live Chat / Inbox'), icon: MessageSquare, isLocked: !isPro },
        { href: '/agent', label: t('Agent'), icon: Zap },
        { href: '/admin/knowledge', label: t('Knowledge Base'), icon: BookOpen },
        { href: '/bot-builder', label: t('Bot Builder'), icon: Bot },
        { href: '/integration', label: t('Integration'), icon: Plug },
      ],
    },
    {
      category: t('Management'),
      items: [
        { href: '/customer', label: t('Customers'), icon: Users, isLocked: !isPro },
        { href: '/product-manager', label: t('Products'), icon: Package },
      ],
    },
    {
      category: t('Sales & Finance'),
      items: [
        { href: '/admin/campaign', label: t('Campaign / Broadcast'), icon: Megaphone, isLocked: !isPro },
        { href: '/sales-monitoring', label: t('Sales Monitoring'), icon: ShoppingCart },
        { href: '/payment', label: t('Payments'), icon: CreditCard, isLocked: !isPro },
      ],
    },
    {
      category: t('Analytics'),
      items: [
        { href: '/ai-analytic', label: t('AI Analytics'), icon: BarChart3, isLocked: !isPro },
      ],
    },
    {
      category: t('System'),
      items: [
        { href: '/notification', label: t('Notifications'), icon: Bell },
        { href: '/settings', label: t('Settings'), icon: Settings },
      ],
    },
    ...(role === 'ADMIN' && userEmail === 'fmencraft@gmail.com' ? [{
      category: t('Super Admin'),
      items: [
        { href: '/platform', label: t('Platform Dashboard'), icon: Lock, premium: true },
      ],
    }] : []),
  ];

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
            <img src="/logo.png" alt="NanoArtif" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg tracking-tight">NanoArtif</span>
          </div>
        </div>
      </div>

      <aside className={cn(
        'fixed left-0 top-0 h-[100dvh] w-64 bg-card border-r border-border transition-transform duration-300 z-50 flex flex-col overflow-hidden',
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Branding */}
        <div className="p-4 border-b border-border bg-card shrink-0 flex items-center justify-between">
          <div className="flex items-center justify-center w-full">
            <div className="w-full flex justify-center items-center pointer-events-none select-none">
              <img src="/logo.png" alt="NanoArtif" className="w-full h-auto object-contain max-h-12" />
            </div>
          </div>
          {/* Close button for mobile inside sidebar */}
          <button
            className="md:hidden absolute right-4 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Area Utama yang bisa di scroll */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto scrollbar-hide overscroll-contain">
          {navCategories.map((category, idx) => (
            <div key={category.category}>
              <h3 className="text-[10px] font-black text-muted-foreground/50 px-3 mb-2 uppercase tracking-[0.2em]">
                {category.category}
              </h3>
              <div className="space-y-1.5">
                {category.items.map(({ href, label, icon: Icon, premium, isLocked }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={isLocked ? '/dashboard/upgrade' : href}
                      onClick={() => setIsOpen(false)}
                      scroll={false}
                      className={cn(
                        'flex items-center gap-3 px-3 h-10 transition-all duration-200 rounded-lg relative group outline-none select-none',
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : premium
                            ? 'bg-gradient-to-r from-[#1E90FF]/10 to-[#1E90FF]/20 text-[#1E90FF] border border-[#1E90FF]/20'
                            : isLocked
                              ? 'opacity-40 grayscale hover:bg-transparent'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 shrink-0",
                        isActive ? "text-white" : premium ? "text-[#1E90FF] animate-bounce-slow" : "text-muted-foreground/70"
                      )} />
                      <span className={cn("text-[14px] font-bold tracking-tight whitespace-nowrap", premium && "uppercase font-black")}>
                        {label}
                      </span>
                      {isLocked && <Lock className="ml-auto w-4 h-4 text-muted-foreground/60" />}
                    </Link>
                  );
                })}
              </div>
              {idx === 0 && <div className="mt-4 border-b border-border/50 mx-2" />}
            </div>
          ))}
        </nav>

        {/* Area Bawah Tetap (Fixed Bottom) */}
        <div className="p-4 border-t border-border bg-secondary/50 shrink-0 mt-auto">
          <div className="flex items-center justify-between px-3 py-2.5 bg-card rounded-xl border border-border shadow-sm mb-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">{t('Status')}</span>
              <span className={cn("text-[13px] font-black", isPro ? "text-[#1E90FF]" : "text-primary")}>
                {t(isPro ? 'PRO PLAN' : 'FREE PLAN')}
              </span>
            </div>
            {isPro && <Crown className="w-5 h-5 text-[#1E90FF]" />}
          </div>

          <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black uppercase">
              {userName.substring(0, 2)}
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-[14px] font-bold truncate leading-none mb-1 text-foreground">{userName}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase font-medium tracking-tighter">
                {t(isPro ? 'Pro Workspace' : 'Free Workspace')}
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Spacer for Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 transition-all duration-300" />
    </>
  );
} 