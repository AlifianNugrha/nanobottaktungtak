'use client';

import React, { useState, useActionState, useRef, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';
import { login, signup } from '@/app/actions/auth-actions';
import Image from 'next/image';

function SubmitButton({ mode, pending }: { mode: 'login' | 'signup', pending: boolean }) {
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full bg-[#1E90FF] hover:bg-[#187bcd] text-white h-12 rounded-xl font-bold shadow-lg shadow-[#1E90FF]/30 transition-all active:scale-[0.98] group"
        >
            {pending ? (
                <span className="flex items-center gap-2">Processing...</span>
            ) : (
                <span className="flex items-center gap-2">
                    {mode === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
            )}
        </Button>
    )
}

const initialState = {
    error: '',
    success: false
}

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 1;
            // Force play to ensure autoplay works even if attribute fails
            videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
        }
    }, []);

    // WRAPPER ACTION untuk mengatasi bug state binding
    const authAction = async (prevState: any, formData: FormData) => {
        const mode = formData.get('auth_mode');
        if (mode === 'signup') {
            return await signup(prevState, formData);
        } else {
            return await login(prevState, formData);
        }
    };

    const [state, formAction, isPending] = useActionState(authAction, initialState);

    return (
        <div className="min-h-screen grid lg:grid-cols-2">

            {/* LEFT SIDE: FORM */}
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-32 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-900 relative animate-in slide-in-from-left-10 duration-700 overflow-hidden">

                {/* Background Decoration (Blobs) for Glass Effect */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />


                <div className="w-full max-w-sm mx-auto space-y-8 mt-10 lg:mt-0 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10">

                    {/* Header Text Only */}
                    <div className="space-y-4 text-center lg:text-left">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                                {mode === 'login' ? 'Welcome Back!' : 'Start Building.'}
                            </h1>
                            <p className="text-blue-100 font-medium">
                                {mode === 'login' ? 'Enter your details to access your workspace.' : 'Join NanoArtif and automate your sales.'}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form action={formAction} className="space-y-6">
                        <input type="hidden" name="auth_mode" value={mode} />
                        {mode === 'signup' && (
                            <div className="space-y-2 animate-in slide-in-from-top-4 fade-in duration-300">
                                <label className="text-xs font-bold uppercase text-blue-100 tracking-wider ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-[#1E90FF] transition-colors" />
                                    <Input
                                        name="name"
                                        type="text"
                                        required
                                        className="pl-12 h-12 bg-white border-transparent focus:border-white focus:ring-4 focus:ring-white/20 rounded-xl transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="nama anda"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-blue-100 tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-[#1E90FF] transition-colors" />
                                <Input
                                    name="email"
                                    type="email"
                                    required
                                    className="pl-12 h-12 bg-white border-transparent focus:border-white focus:ring-4 focus:ring-white/20 rounded-xl transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-blue-100 tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-[#1E90FF] transition-colors" />
                                <Input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    className="pl-12 pr-12 h-12 bg-white border-transparent focus:border-white focus:ring-4 focus:ring-white/20 rounded-xl transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-slate-400 hover:text-[#1E90FF] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {state?.error && (
                            <div className="p-4 bg-red-500/10 border border-red-200/20 rounded-xl text-sm text-white font-bold flex items-center gap-3 animate-in shake backdrop-blur-sm">
                                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                                {state.error}
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-bold shadow-lg shadow-black/20 transition-all active:scale-[0.98] group border border-slate-800"
                            >
                                {isPending ? (
                                    <span className="flex items-center gap-2">Processing...</span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {mode === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Footer Toggle */}
                    <div className="text-center">
                        <p className="text-sm font-medium text-blue-100">
                            {mode === 'login' ? "New here?" : "Already member?"}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="ml-2 text-white font-bold hover:text-white/80 underline underline-offset-4 focus:outline-none transition-all"
                            >
                                {mode === 'login' ? 'Create Account' : 'Login Now'}
                            </button>
                        </p>
                    </div>

                    <div className="pt-8 border-t border-white/10 text-center lg:text-left">
                        <p className="text-[10px] text-blue-200 font-medium uppercase tracking-widest">
                            © 2026 NanoArtif Inc. Secure & Encrypted.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: VIDEO */}
            <div className="hidden lg:block relative w-full h-full overflow-hidden bg-black">
                <video
                    ref={videoRef}
                    src="/login-bg.mp4"
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            </div>
        </div>
    );
}
