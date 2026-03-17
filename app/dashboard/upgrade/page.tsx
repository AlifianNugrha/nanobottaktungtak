'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Check,
    Crown,
    Zap,
    Sparkles,
    Loader2,
    Building2,
    Infinity,
    CheckCircle2,
    X,
    ArrowRight
} from 'lucide-react';
import { createPaymentToken } from '@/app/actions/payment-actions';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function UpgradePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isYearly, setIsYearly] = useState(false);

    // Load Midtrans Snap.js
    useEffect(() => {
        const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
        const script = document.createElement('script');
        script.src = isProduction 
            ? 'https://app.midtrans.com/snap/snap.js' 
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
        document.body.appendChild(script);

        return () => {
            const existingScript = document.querySelector('script[src*="snap.js"]');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, []);

    const handleUpgrade = async (plan: 'pro_monthly' | 'pro_yearly') => {
        setIsLoading(true);
        const result = await createPaymentToken(plan);

        if (result.success && result.token) {
            // @ts-ignore
            window.snap.pay(result.token, {
                onSuccess: function (result: any) {
                    window.location.href = '/dashboard/payment/success';
                },
                onPending: function (result: any) {
                    window.location.href = '/dashboard/payment/pending';
                },
                onError: function (result: any) {
                    window.location.href = '/dashboard/payment/error';
                },
                onClose: function () {
                    setIsLoading(false);
                }
            });
        } else {
            alert('Failed to create payment: ' + result.error);
            setIsLoading(false);
        }
    };

    const plans = [
        {
            name: 'Starter',
            price: '0',
            duration: '/mo',
            desc: 'Untuk bisnis yang baru mulai.',
            features: [
                { text: '1 AI Bot (WhatsApp)', active: true },
                { text: '1 Agent Personality', active: true },
                { text: 'Limit 1 Product', active: true },
                { text: 'Basic Analytics', active: true },
                { text: 'Live Chat / Inbox', active: false },
                { text: 'Campaign / Broadcast', active: false },
                { text: 'Unlimited Products', active: false },
            ],
            buttonText: 'Current Plan',
            disabled: true,
            highlight: false
        },
        {
            name: 'Pro',
            price: isYearly ? '1.000.000' : '100.000',
            duration: isYearly ? '/year' : '/mo',
            desc: 'Paling pas untuk toko online aktif.',
            features: [
                { text: '5 AI Bots (WA, Web, IG)', active: true },
                { text: '10 Agent Personalities', active: true },
                { text: 'Live Chat / Inbox 💬', active: true },
                { text: 'Campaign / Broadcast 📢', active: true },
                { text: 'Unlimited Products 🚀', active: true },
                { text: 'Send Product Images 📸', active: true },
                { text: 'AI Analytics Dashboard', active: true },
                { text: 'Priority Support', active: true }
            ],
            buttonText: isYearly ? 'Get Pro Yearly' : 'Get Pro Monthly',
            disabled: false,
            highlight: true,
            onAction: () => handleUpgrade(isYearly ? 'pro_yearly' : 'pro_monthly')
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            duration: '',
            desc: 'Solusi skala besar untuk korporat.',
            features: [
                { text: 'Unlimited Bots & Agents', active: true },
                { text: 'White-label Solution', active: true },
                { text: 'Custom Knowledge Base (PDF)', active: true },
                { text: 'Dedicated Account Manager', active: true },
                { text: 'SLA Guarantee 99.9%', active: true }
            ],
            buttonText: 'Contact Sales',
            disabled: false,
            highlight: false,
            onAction: () => window.open('https://wa.me/6281234567890', '_blank')
        }
    ];

    return (
        <div className="relative min-h-screen bg-background font-jakarta">
            {/* Background Blobs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

            <div className="max-w-6xl mx-auto py-6 px-4 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                {/* HEADER */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground max-w-2xl mx-auto leading-[0.9] py-1">
                        Pilih Paket <span className="text-primary italic">Pas Buat Cuan.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed font-medium">
                        Otomatisasi bisnis Anda 24/7. Hemat biaya admin, naikkan omset dengan robot cerdas.
                    </p>

                    {/* TOGGLE YEARLY */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                        <span className={cn(
                            "text-[12px] font-black transition-colors uppercase",
                            !isYearly ? "text-foreground" : "text-muted-foreground opacity-50"
                        )}>Monthly</span>
                        <div className="relative flex items-center">
                            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="scale-110" />
                            {isYearly && (
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <span className="bg-green-500 text-white text-[9px] px-2.5 py-0.5 rounded-full font-black animate-bounce shadow-lg shadow-green-500/20">
                                        SAVE Rp 200rb
                                    </span>
                                </div>
                            )}
                        </div>
                        <span className={cn(
                            "text-[12px] font-black transition-colors uppercase",
                            isYearly ? "text-foreground" : "text-muted-foreground opacity-50"
                        )}>Yearly</span>
                    </div>
                </div>

                {/* PRICING CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
                    {plans.map((plan, i) => (
                        <Card key={i} className={cn(
                            "p-6 border rounded-[2rem] flex flex-col space-y-6 relative overflow-hidden transition-all duration-500 group bg-card",
                            plan.highlight
                                ? "border-primary shadow-xl shadow-primary/20 ring-4 ring-primary/5 z-10 scale-100 md:scale-105"
                                : "border-border shadow-lg shadow-black/[0.01] hover:shadow-xl hover:shadow-black/[0.03] opacity-95 hover:opacity-100"
                        )}>
                            {plan.highlight && (
                                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-foreground tracking-tight uppercase">
                                        {plan.name}
                                    </h3>
                                    {plan.highlight && (
                                        <div className="p-1.5 bg-primary/10 rounded-lg">
                                            <Crown className="w-5 h-5 text-primary fill-primary/20 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-1">
                                        {plan.price !== 'Custom' && <span className="text-xl font-black text-foreground/40">Rp</span>}
                                        <span className={cn(
                                            "font-black tracking-tighter text-foreground leading-none",
                                            plan.price === 'Custom' ? "text-3xl" : "text-4xl"
                                        )}>{plan.price}</span>
                                        <span className="text-xs font-black text-muted-foreground italic uppercase">{plan.duration}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground font-bold italic">{plan.desc}</p>
                                </div>
                            </div>

                            <div className="space-y-3.5 flex-1 pt-6 border-t border-dashed border-border/60">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className={cn(
                                        "flex items-center gap-3 text-[13px] transition-opacity",
                                        !feature.active && "opacity-40"
                                    )}>
                                        <div className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-inner",
                                            feature.active
                                                ? (plan.highlight ? "bg-primary text-white" : "bg-primary/20 text-primary")
                                                : "bg-muted text-muted-foreground"
                                        )}>
                                            {feature.active ? <Check className="w-3 h-3 stroke-[4]" /> : <X className="w-3 h-3 stroke-[4]" />}
                                        </div>
                                        <span className={cn(
                                            "font-bold tracking-tight",
                                            feature.active ? "text-foreground" : "text-muted-foreground line-through decoration-muted-foreground/50"
                                        )}>
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={plan.onAction}
                                disabled={plan.disabled || (isLoading && plan.highlight)}
                                className={cn(
                                    "w-full h-12 rounded-xl font-black uppercase tracking-[0.1em] text-[11px] transition-all duration-300",
                                    plan.highlight
                                        ? "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                                        : "bg-secondary border border-border text-foreground hover:bg-secondary/80 hover:border-primary/40"
                                )}
                            >
                                {isLoading && plan.highlight ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {plan.buttonText}
                            </Button>
                        </Card>
                    ))}
                </div>


                <div className="text-center text-muted-foreground/50 text-[9px] font-bold uppercase tracking-widest">
                    <p>Secure payment powered by Midtrans • Cancel anytime</p>
                </div>
            </div>
        </div>
    );
}
