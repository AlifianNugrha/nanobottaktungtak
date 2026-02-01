'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import {
  Plug,
  ChevronDown,
  MessageSquare,
  Send,
  Globe,
  Plus,
  ArrowRight,
  Settings2,
  Lock,
  Loader2,
  QrCode,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DUMMY_INTEGRATIONS = [
  { id: '1', platform: 'WhatsApp', name: 'CS Utama WA', status: 'Active', icon: MessageSquare, color: 'text-green-500' },
  { id: '2', platform: 'Telegram', name: 'Bot Telegram Nexora', status: 'Active', icon: Send, color: 'text-blue-400' },
  { id: '3', platform: 'Website', name: 'Landing Page Widget', status: 'Active', icon: Globe, color: 'text-orange-600' },
];

export default function IntegrationPage() {
  const [integrations] = useState(DUMMY_INTEGRATIONS);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [configStep, setConfigStep] = useState<'input' | 'qr' | 'success'>('input');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const platforms = [
    { id: 'wa', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
    { id: 'tg', label: 'Telegram', icon: Send, color: 'text-blue-400' },
    { id: 'web', label: 'Website', icon: Globe, color: 'text-orange-600' },
  ];

  // Ganti fungsi lama dengan ini
  const handleAction = (type: 'connect' | 'qr') => {
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      if (type === 'qr') {
        // Jika klik Generate QR, baru munculin gambar QR
        setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Nexora-Session-12345");
        setConfigStep('qr');
      } else {
        // Jika klik Connect, langsung ke layar sukses
        setConfigStep('success');
      }
    }, 1500);
  };

  const resetModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setTimeout(() => {
        setConfigStep('input');
        setQrCodeUrl(null);
      }, 300);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 px-4 sm:px-6 lg:px-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Integrations</h1>
          <p className="text-muted-foreground text-sm">Manage your chatbot connections.</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-lg shadow-orange-600/20 h-11 px-6 font-bold">
              <Plus className="w-4 h-4" />
              Add New
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
            <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Platform</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {platforms.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => { setSelectedPlatform(p.label); setIsModalOpen(true); }}
                className="gap-3 cursor-pointer py-2.5 rounded-lg"
              >
                <p.icon className={cn("w-4 h-4", p.color)} />
                <span className="font-semibold text-sm">{p.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Integrated List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider ml-1">Active Connections</h3>
        <div className="grid grid-cols-1 gap-4">
          {integrations.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-all border-border group bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl bg-gray-50 group-hover:bg-orange-600/5 transition-colors", item.color)}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{item.platform} • {item.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-orange-600"><ExternalLink className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* --- POP-UP MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={resetModal}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-orange-600 p-8 text-white relative">
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                {selectedPlatform === 'WhatsApp' ? <QrCode className="w-6 h-6" /> : <Settings2 className="w-6 h-6" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{configStep === 'qr' ? 'Scan QR Code' : `Connect ${selectedPlatform}`}</DialogTitle>
                <DialogDescription className="text-orange-100 text-xs font-medium">Link your chatbot in seconds.</DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white">
            {configStep === 'input' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1 tracking-widest">Bot Identity</Label>
                    <Input placeholder={`e.g. My ${selectedPlatform} Bot`} className="h-12 bg-gray-50 rounded-xl px-4" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1 tracking-widest">Access Token / API Key</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••••••" className="h-12 pl-12 bg-gray-50 rounded-xl" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Tombol Connect (Selalu ada) */}
                  <Button
                    onClick={() => handleAction('connect')}
                    disabled={isSaving}
                    className="w-full h-12 bg-orange-600 font-bold text-white rounded-xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connect'}
                  </Button>

                  {/* Tombol Generate QR Khusus WhatsApp */}
                  {selectedPlatform === 'WhatsApp' && (
                    <Button
                      onClick={() => handleAction('qr')}
                      disabled={isSaving}
                      variant="outline"
                      className="w-full h-12 border-border font-bold text-foreground rounded-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      Generate QR Code
                    </Button>
                  )}
                </div>
              </div>
            )}

            {configStep === 'qr' && (
              <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <div className="p-4 bg-white border-2 border-orange-600/10 rounded-[2.5rem] shadow-xl mb-6 relative group">
                  <img src={qrCodeUrl!} alt="QR" className="w-52 h-52 rounded-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/80 transition-opacity rounded-[2.5rem] backdrop-blur-sm">
                    <RefreshCw className="w-6 h-6 text-orange-600 animate-spin-slow" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Scan with your phone</h3>
                <p className="text-xs text-center text-muted-foreground mb-8 px-4 leading-relaxed">
                  Open WhatsApp &gt; Settings &gt; Linked Devices to scan this code.
                </p>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setConfigStep('input')}>Back</Button>
                  <Button className="flex-1 h-12 bg-orange-600 text-white font-bold rounded-xl" onClick={() => setConfigStep('success')}>I've Scanned</Button>
                </div>
              </div>
            )}

            {configStep === 'success' && (
              <div className="flex flex-col items-center py-6 text-center animate-in zoom-in">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Success!</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-8 px-4">Your {selectedPlatform} chatbot is now active and ready.</p>
                <Button className="w-full h-12 bg-foreground text-white font-bold rounded-xl shadow-lg" onClick={() => resetModal(false)}>Finish</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}