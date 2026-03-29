'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Zap,
  CheckCircle2,
  Wallet,
  ArrowRight,
  Settings,
  CircleDollarSign,
  ShieldAlert,
  ArrowLeft,
  MessageSquare,
  Target,
  Sparkles,
  Save,
  Loader2,
  Key,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { getPlanStatus } from '@/app/actions/user-actions';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();

  // Check plan status
  useEffect(() => {
    const checkPlan = async () => {
      const res = await getPlanStatus();
      if (res.success && !res.isPro) {
        router.push('/dashboard/upgrade');
      }
    };
    checkPlan();
  }, [router]);

  // --- STATES (SEMUA DATA TETAP TERJAGA) ---
  const [view, setView] = useState<'main' | 'logic'>('main');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAiClosingEnabled, setIsAiClosingEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Data Integrasi Midtrans
  const [midtransKeys, setMidtransKeys] = useState({
    merchantId: '',
    clientKey: '',
    serverKey: '',
    isProduction: false
  });

  // Data Logika Bot
  const [logicConfig, setLogicConfig] = useState({
    triggerKeywords: 'beli, pesan, order, harga, bayar, mau dong',
    closingScript: 'Wah pilihan yang tepat! Ini link pembayarannya ya kak. Pesanan akan langsung kami proses setelah pembayaran terkonfirmasi otomatis.',
    followUpMinutes: '15',
    autoDiscount: false
  });

  // --- HANDLERS ---
  const handleSaveLogic = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    setView('main');
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText("https://api.nexora.ai/hooks/midtrans");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 px-4 pb-20">

      {/* HEADER: Dinamis sesuai View */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          {view === 'logic' && (
            <Button variant="outline" size="icon" onClick={() => setView('main')} className="rounded-xl shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {view === 'main' ? 'Payments & Automation' : 'AI Closing Logic'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {view === 'main' ? 'Kelola integrasi pembayaran dan sistem otomatisasi.' : 'Atur skenario closing otomatis untuk Bot Anda.'}
            </p>
          </div>
        </div>

        {view === 'main' && (
          <div className="flex items-center justify-between w-full sm:w-auto gap-3 bg-primary/5 px-4 py-3 sm:py-2 rounded-2xl border border-primary/10">
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[10px] font-bold text-primary uppercase">AI Closing Mode</span>
              <span className="text-xs font-bold">{isAiClosingEnabled ? 'ACTIVE' : 'DISABLED'}</span>
            </div>
            <Switch checked={isAiClosingEnabled} onCheckedChange={setIsAiClosingEnabled} />
          </div>
        )}
      </div>

      {view === 'main' ? (
        /* --- VIEW UTAMA --- */
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Promo Card: Setup Bot Logic */}
          <Card className="p-1 border-primary/20 bg-gradient-to-br from-primary/5 via-white to-white overflow-hidden shadow-sm">
            <div className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 shrink-0">
                <Zap className="w-8 h-8 fill-current" />
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h2 className="text-xl font-bold">Smart AI Closing</h2>
                <p className="text-sm text-muted-foreground max-w-md">Aktifkan deteksi niat beli dan kirim invoice otomatis ke pelanggan.</p>
              </div>
              <Button onClick={() => setView('logic')} className="rounded-xl h-12 px-6 gap-2 font-bold shadow-md hover:scale-[1.02] transition-transform">
                Setup Bot Logic <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* KOLOM KIRI: PAYMENT GATEWAY & PROTECTION */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" /> Connected Gateways
                </h3>
              </div>

              <Card className="p-6 border-border group hover:border-primary/50 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-500">MIDTRANS</div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${midtransKeys.serverKey ? 'text-green-600 bg-green-50 border-green-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                    {midtransKeys.serverKey ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {midtransKeys.serverKey ? 'CONNECTED' : 'NEEDS SETUP'}
                  </div>
                </div>
                <h4 className="font-bold text-base">Virtual Account & QRIS</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Terima dana otomatis tanpa konfirmasi manual.</p>
                <Button onClick={() => setIsConfigOpen(true)} variant="outline" className="w-full mt-6 rounded-xl h-10 text-xs font-bold gap-2 group-hover:bg-primary group-hover:text-white transition-all">
                  <Settings className="w-3.5 h-3.5" /> Configure API Keys
                </Button>
              </Card>

              {/* ANTI-FRAUD ALERT (Tetap Ada) */}
              <Card className="p-6 border-orange-200 bg-orange-50/50 shadow-none">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0 border border-orange-200">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-orange-900">Anti-Fraud Protection Active</h3>
                    <p className="text-xs text-orange-800/80 leading-relaxed max-w-lg">
                      Sistem memverifikasi pembayaran melalui <strong>Secure Webhooks</strong>. Foto bukti transfer dari user tidak akan mengubah status pesanan secara otomatis.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* KOLOM KANAN: SETTLEMENTS & COMPLIANCE */}
            <div className="space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-primary" /> Settlements
              </h3>
              <Card className="p-6 space-y-4 border-border shadow-sm bg-white">
                {[
                  { date: 'Feb 01, 2026', amount: 'Rp 2.450.000', status: 'Settled' },
                  { date: 'Jan 31, 2026', amount: 'Rp 1.120.000', status: 'Settled' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-border last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-black text-foreground">{item.amount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{item.date}</p>
                    </div>
                    <span className="text-[9px] font-black px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-100 uppercase">
                      {item.status}
                    </span>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs font-bold text-primary h-10">
                  Full History <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </Card>

              <Card className="p-6 bg-slate-900 text-white rounded-[2rem] border-none">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Security</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Semua transaksi menggunakan enkripsi SSL 256-bit dan diawasi oleh OJK.
                </p>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* --- VIEW SETUP LOGIC --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
          <div className="space-y-6">
            <Card className="p-6 bg-primary text-white space-y-4 rounded-[2.5rem] border-none shadow-xl shadow-primary/20">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg leading-tight">Smart Logic</h3>
              <p className="text-xs text-primary-foreground/80 leading-relaxed">
                Bot akan menganalisis percakapan. Jika trigger terdeteksi, invoice akan dibuat secara real-time.
              </p>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-8 space-y-8 shadow-sm">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Trigger Keywords
                  </Label>
                  <Input
                    value={logicConfig.triggerKeywords}
                    onChange={(e) => setLogicConfig({ ...logicConfig, triggerKeywords: e.target.value })}
                    className="h-12 rounded-xl bg-gray-50 font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> Bot Closing Message
                  </Label>
                  <Textarea
                    value={logicConfig.closingScript}
                    onChange={(e) => setLogicConfig({ ...logicConfig, closingScript: e.target.value })}
                    className="min-h-[140px] rounded-2xl bg-gray-50 p-4 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-border">
                <Button onClick={handleSaveLogic} disabled={isSaving} className="flex-1 h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Bot Logic'}
                </Button>
                <Button variant="ghost" onClick={() => setView('main')} className="h-12 px-8 font-bold text-muted-foreground">Discard</Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIG (MIDTRANS) --- */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Key className="w-6 h-6 text-primary" /> Midtrans Keys
            </DialogTitle>
            <DialogDescription className="text-xs pt-2">
              Masukkan kredensial dari dashboard Midtrans Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-border">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold uppercase">Production Mode</Label>
                <p className="text-[10px] text-muted-foreground">Aktifkan untuk uang beneran.</p>
              </div>
              <Switch
                checked={midtransKeys.isProduction}
                onCheckedChange={(val) => setMidtransKeys({ ...midtransKeys, isProduction: val })}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase ml-1">Merchant ID</Label>
                <Input value={midtransKeys.merchantId} onChange={(e) => setMidtransKeys({ ...midtransKeys, merchantId: e.target.value })} className="rounded-xl h-11 bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase ml-1">Server Key</Label>
                <Input type="password" value={midtransKeys.serverKey} onChange={(e) => setMidtransKeys({ ...midtransKeys, serverKey: e.target.value })} className="rounded-xl h-11 bg-gray-50" />
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2 text-center">
              <Label className="text-[10px] font-black text-primary uppercase">Webhook Notification URL</Label>
              <div className="flex gap-2 justify-center items-center bg-white p-2 rounded-lg border border-primary/10">
                <code className="text-[10px] font-mono truncate max-w-[200px]">https://api.nexora.ai/hooks/midtrans</code>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={copyWebhook}>
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-start gap-3">
            <Button onClick={() => setIsConfigOpen(false)} className="flex-1 bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20">
              Save & Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}