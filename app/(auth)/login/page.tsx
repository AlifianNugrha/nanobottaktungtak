'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Bot, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Cek jika sudah pernah login, langsung ke dashboard
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            router.push('/dashboard');
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        await new Promise(r => setTimeout(r, 800));

        // Logic Redirect Berdasarkan Email
        if (password === 'password123') {
            localStorage.setItem('isLoggedIn', 'true');
            if (email.includes('pro')) {
                router.push('/pro');
            } else if (email.includes('admin') || email.includes('platform')) {
                router.push('/platform');
            } else {
                router.push('/dashboard');
            }
        } else {
            alert('Password salah!');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Dekorasi Hijau Halus */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />

            <Card className="w-full max-w-md border-border shadow-xl shadow-black/[0.02] p-8 bg-white/80 backdrop-blur-sm">
                <div className="text-center mb-10">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                        <Bot className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground mt-1">Sign in to Nexora Admin</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-11 bg-gray-50/50 border-border focus:ring-primary/20"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 h-11 bg-gray-50/50 border-border focus:ring-primary/20"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-white h-11 font-bold shadow-md shadow-primary/20 transition-all active:scale-[0.98]">
                        {isLoading ? 'Verifying...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Demo Accounts (Pass: password123)</p>
                    <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                        <span>free@nexora.com</span>
                        <span>pro@nexora.com</span>
                        <span>admin@nexora.com</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}