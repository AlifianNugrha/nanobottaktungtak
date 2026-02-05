'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Check,
    Zap,
    ShieldCheck,
    MessageCircle,
    BarChart3,
    Headphones,
    Sparkles,
    ArrowRight,
    Loader2,
    Crown,
    Building2,
    Infinity
} from 'lucide-react';
import { upgradeToPro } from '@/app/actions/user-actions';

export default function PricingPage() {
    const [loading, setLoading] = useState(false);
    const [isYearly, setIsYearly] = useState(false);
    const router = useRouter();

    const handleUpgrade = async () => {
        setLoading(true);
        const res = await upgradeToPro();
        if (res.success) {
            alert("Selamat! Anda sekarang adalah member PRO.");
            router.push('/dashboard');
            setTimeout(() => window.location.reload(), 500);
        } else {
            alert(res.error || "Gagal upgrade ke pro");
        }
        setLoading(false);
    }

    const plans = [
        {
            name: 'Starter',
            price: '0',
            duration: '/mo',
            desc: 'Untuk bisnis yang baru mulai.',
            features: [
                '1 AI Bot (WhatsApp)',
                '1 Agent Personality',
                'Limit 1 Product',
                'Basic Analytics',
                'Community Support'
            ],
            buttonText: 'Current Plan',
            disabled: true,
            highlight: false
        },
        {
            name: 'Pro',
            price: isYearly ? '1.500.000' : '149.000',
            duration: isYearly ? '/year' : '/mo',
            desc: 'Paling pas untuk toko online aktif.',
            features: [
                '5 AI Bots (WA, Web, IG)',
                '10 Agent Personalities',
                'Unlimited Products 🚀',
                'Send Product Images 📸',
                'Access Customer CRM',
                'Priority Support'
            ],
            buttonText: 'Upgrade to Pro',
            disabled: false,
            highlight: true,
            onAction: handleUpgrade
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            duration: '',
            desc: 'Solusi skala besar untuk korporat.',
            features: [
                'Unlimited Bots & Agents',
                'White-label Solution',
                'Custom Knowledge Base (PDF)',
                'Dedicated Account Manager',
                'SLA Guarantee 99.9%'
            ],
            buttonText: 'Contact Sales',
            disabled: false,
            highlight: false,
            onAction: () => window.open('https://wa.me/6281234567890', '_blank')
        }
    ];

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

            {/* HEADER */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[11px] font-black uppercase tracking-widest border border-primary/20">
                    <Sparkles className="w-3 h-3" /> Upgrade Your Business
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground max-w-2xl mx-auto leading-tight">
                    Pilih Paket yang Pas Buat Cuan
                </h1>
                <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
                    Otomatisasi jualan kamu 24/7. Hemat biaya admin, naikkan omset.
                </p>

                {/* TOGGLE YEARLY */}
                <div className="flex items-center justify-center gap-4 pt-4">
                    <span className={`text-sm font-bold ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
                    <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                    <span className={`text-sm font-bold ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Yearly <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">HEMAT 20%</span>
                    </span>
                </div>
            </div>

            {/* PRICING CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                {plans.map((plan, i) => (
                    <Card key={i} className={`p-8 border rounded-[2.5rem] flex flex-col space-y-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-2
                        ${plan.highlight
                            ? 'border-primary shadow-2xl shadow-primary/20 bg-white ring-4 ring-primary/5 z-10 scale-105 md:scale-110'
                            : 'border-border shadow-sm hover:shadow-xl bg-gray-50/50'
                        }
                    `}>
                        {plan.highlight && (
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-purple-600" />
                        )}
                        {plan.highlight && (
                            <div className="absolute top-6 right-6 text-primary">
                                <Crown className="w-6 h-6 fill-current" />
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                {plan.name}
                                {plan.highlight && <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">Popular</span>}
                            </h3>
                            <div className="flex items-baseline gap-1">
                                {plan.price !== 'Custom' && <span className="text-sm font-bold text-muted-foreground">Rp</span>}
                                <span className={`font-black tracking-tighter text-foreground ${plan.price === 'Custom' ? 'text-4xl' : 'text-5xl'}`}>{plan.price}</span>
                                <span className="text-xs font-bold text-muted-foreground">{plan.duration}</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">{plan.desc}</p>
                        </div>

                        <div className="space-y-4 flex-1 pt-4 border-t border-dashed border-gray-200">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-sm">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-primary text-white' : 'bg-green-500/10 text-green-600'}`}>
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span className={`font-bold ${plan.highlight ? 'text-gray-900' : 'text-gray-600'}`}>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={plan.onAction}
                            disabled={plan.disabled || (loading && plan.highlight)}
                            className={`w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs transition-all
                                ${plan.highlight
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-[1.02]'
                                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                                }
                            `}
                        >
                            {loading && plan.highlight ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {plan.buttonText}
                        </Button>
                    </Card>
                ))}

            </div>

            {/* TRUST BADGE */}
            <div className="max-w-2xl mx-auto text-center space-y-6 pt-10 border-t">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trusted by 500+ Businesses</p>
                <div className="flex justify-center gap-8 opacity-40 grayscale">
                    {/* Placeholder Logos */}
                    <div className="font-black text-xl">TOKO<span className="text-primary">PEDIA</span></div>
                    <div className="font-black text-xl">SHOPEE</div>
                    <div className="font-black text-xl">LAZADA</div>
                    <div className="font-black text-xl">TIKTOK</div>
                </div>
            </div>

        </div>
    );
}
