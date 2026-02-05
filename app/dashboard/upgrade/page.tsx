'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap } from 'lucide-react';
import { createPaymentToken } from '@/app/actions/payment-actions';
import { useState, useEffect } from 'react';

export default function UpgradePage() {
    const [isLoading, setIsLoading] = useState(false);

    // Load Midtrans Snap.js
    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://app.sandbox.midtrans.com/snap/snap.js`;
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleUpgrade = async (plan: 'pro_monthly' | 'pro_yearly') => {
        setIsLoading(true);
        const result = await createPaymentToken(plan);

        if (result.success && result.token) {
            // Redirect to Midtrans payment page
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
                        <Crown className="w-12 h-12 text-yellow-400" />
                        Upgrade to Pro
                    </h1>
                    <p className="text-xl text-slate-300">Unlock unlimited potential for your business</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Monthly Plan */}
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:scale-105 transition-transform">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white flex items-center gap-2">
                                <Zap className="w-6 h-6 text-blue-400" />
                                Pro Monthly
                            </CardTitle>
                            <div className="text-4xl font-bold text-white mt-4">
                                Rp 100,000
                                <span className="text-lg text-slate-400 font-normal">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ul className="space-y-3">
                                {[
                                    '100,000 AI Tokens/month',
                                    'Unlimited Bots & Agents',
                                    'Advanced Analytics',
                                    'Priority Support',
                                    'Custom Branding',
                                    'API Access'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-slate-300">
                                        <Check className="w-5 h-5 text-green-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                onClick={() => handleUpgrade('pro_monthly')}
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
                            >
                                {isLoading ? 'Processing...' : 'Get Pro Monthly'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Yearly Plan */}
                    <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500 backdrop-blur-sm hover:scale-105 transition-transform relative">
                        <div className="absolute -top-4 right-4 bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                            SAVE 17%
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl text-white flex items-center gap-2">
                                <Crown className="w-6 h-6 text-yellow-400" />
                                Pro Yearly
                            </CardTitle>
                            <div className="text-4xl font-bold text-white mt-4">
                                Rp 1,000,000
                                <span className="text-lg text-slate-400 font-normal">/year</span>
                            </div>
                            <p className="text-sm text-slate-400">~Rp 83,333/month (Save 2 months!)</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ul className="space-y-3">
                                {[
                                    '100,000 AI Tokens/month',
                                    'Unlimited Bots & Agents',
                                    'Advanced Analytics',
                                    'Priority Support',
                                    'Custom Branding',
                                    'API Access',
                                    '+ 2 Months FREE'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-white">
                                        <Check className="w-5 h-5 text-yellow-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                onClick={() => handleUpgrade('pro_yearly')}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 text-lg"
                            >
                                {isLoading ? 'Processing...' : 'Get Pro Yearly'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center text-slate-400 text-sm">
                    <p>Secure payment powered by Midtrans • Cancel anytime</p>
                </div>
            </div>
        </div>
    );
}
