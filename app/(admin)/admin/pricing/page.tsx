'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Check,
    Zap,
    ShieldCheck,
    MessageCircle,
    BarChart3,
    Headphones,
    Sparkles,
    ArrowRight
} from 'lucide-react';

export default function PricingPage() {
    const [loading, setLoading] = useState(false);

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-12">

            {/* HEADER */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" /> Upgrade Your Power
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-foreground">Pilih Paket Penjualan Anda</h1>
                <p className="text-muted-foreground text-sm max-w-md mx-auto italic">
                    Mulai dengan gratis atau buka potensi penuh AI untuk otomatisasi closing 24/7.
                </p>
            </div>

            {/* PRICING CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* PAKET BIASA */}
                <Card className="p-8 border-border shadow-sm hover:shadow-md transition-all rounded-[2.5rem] flex flex-col space-y-8 relative overflow-hidden bg-white">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground">Biasa (Starter)</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black tracking-tight">Rp 0</span>
                            <span className="text-xs font-bold text-muted-foreground">/ bulan</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Cocok untuk mencoba fitur dasar AI.</p>
                    </div>

                    <div className="space-y-4 flex-1">
                        {[
                            { label: '500 Chat/bulan', active: true },
                            { label: 'Basic AI Response', active: true },
                            { label: 'Manual Payment Link', active: true },
                            { label: 'Advanced Analytics', active: false },
                            { label: 'Auto Closing Midtrans', active: false },
                        ].map((feature, i) => (
                            <div key={i} className={`flex items-center gap-3 text-xs ${feature.active ? 'text-foreground font-bold' : 'text-muted-foreground/50'}`}>
                                {feature.active ? <Check className="w-4 h-4 text-primary" /> : <div className="w-4 h-4" />}
                                {feature.label}
                            </div>
                        ))}
                    </div>

                    <Button variant="outline" className="w-full h-12 rounded-2xl font-black text-[11px] uppercase tracking-widest border-border hover:bg-gray-50">
                        Current Plan
                    </Button>
                </Card>

                {/* PAKET PRO (HIGHLIGHTED) */}
                <Card className="p-8 border-primary/20 shadow-2xl shadow-primary/10 rounded-[2.5rem] flex flex-col space-y-8 relative overflow-hidden bg-white ring-2 ring-primary">
                    {/* Badge Best Value */}
                    <div className="absolute top-0 right-0 bg-primary text-white px-6 py-2 rounded-bl-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em]">
                        RECOMMENDED
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                            <Zap className="w-3 h-3 fill-current" /> Nexora Plus
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black tracking-tight text-primary">Rp 299.000</span>
                            <span className="text-xs font-bold text-muted-foreground">/ bulan</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Otomatisasi penuh untuk bisnis skala besar.</p>
                    </div>

                    <div className="space-y-4 flex-1">
                        {[
                            { label: 'Unlimited Chat AI', icon: MessageCircle },
                            { label: 'Smart Closing Logic (Auto)', icon: Zap },
                            { label: 'Midtrans Integration', icon: ShieldCheck },
                            { label: 'Deep AI Analytics', icon: BarChart3 },
                            { label: 'Priority Support 24/7', icon: Headphones },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs text-foreground font-bold">
                                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <feature.icon className="w-3.5 h-3.5" />
                                </div>
                                {feature.label}
                            </div>
                        ))}
                    </div>

                    <Button className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform">
                        Upgrade to Pro <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Card>

            </div>

            {/* FOOTER INFO */}
            <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] pt-10 border-t border-border">
                Secure payment processed by Midtrans • Cancel anytime
            </p>

        </div>
    );
}