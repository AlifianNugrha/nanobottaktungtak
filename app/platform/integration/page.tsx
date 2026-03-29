'use client';

import { useState, useEffect } from 'react';
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
import { getBots } from '@/app/actions/bot-actions';

// No dummy data needed
export default function IntegrationPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeIntegrationId, setActiveIntegrationId] = useState<string | null>(null);

  // Configuration Steps
  const [configStep, setConfigStep] = useState<'input' | 'qr' | 'success'>('input');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Data State
  const [fetchedIntegrations, setFetchedIntegrations] = useState<any[]>([]);
  const [allBots, setAllBots] = useState<any[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const platforms = [
    { id: 'wa', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
    { id: 'web', label: 'Website', icon: Globe, color: 'text-primary' },
  ];

  // Fetch data on mount
  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    const res = await getBots();
    if (res.success) {
      // Filter: Only show bots that have an integrationId OR are platform-specific (created via integration page)
      const integratedBots = (res.data || []).filter((b: any) => b.integrationId || b.config?.platform === 'WhatsApp' || b.config?.platform === 'Website');
      setFetchedIntegrations(integratedBots);

      // Store ALL bots separately for the dropdown selection
      setAllBots(res.data || []);
    } else {
      console.error("Failed to fetch bots:", res.error);
    }
    setIsLoading(false);
  };

  const resetModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setTimeout(() => {
        setConfigStep('input');
        setQrCodeUrl(null);
        setSelectedBotId("");
        setActiveIntegrationId(null);
      }, 300);
    }
  };

  const checkSessionStatus = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/whatsapp/session?sessionId=${sessionId}`);
      const data = await res.json();

      if (data.status === 'connected') {
        setConfigStep('success');
      } else if (data.qr) {
        if (!data.qr.startsWith('http') && !data.qr.startsWith('data:')) {
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.qr)}`);
        } else {
          setQrCodeUrl(data.qr);
        }
        setConfigStep('qr');
      } else {
        // If connecting but no QR yet, show the QR page (which has a loader)
        if (data.status === 'connecting') {
          setConfigStep('qr');
        }
      }
      setIsSaving(false);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  const handleOpenSettings = async (bot: any) => {
    if (!bot.integrationId) return;

    setSelectedPlatform('WhatsApp');
    setActiveIntegrationId(bot.integrationId);
    setIsModalOpen(true);
    setIsSaving(true);

    await checkSessionStatus(bot.integrationId);
  };


  const handleCreateSession = async () => {
    if (!selectedBotId) {
      alert("Please select a bot first!");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/whatsapp/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'WhatsApp Connection', botId: selectedBotId })
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        setIsModalOpen(false);
        fetchIntegrations();
      } else {
        alert(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert("Network or Server Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 px-4 sm:px-6 lg:px-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Integrations</h1>
          <p className="text-muted-foreground text-sm">Manage your chatbot connections.</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20 h-11 px-6 font-bold rounded-xl">
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
          {fetchedIntegrations.map((bot) => {
            // Map DB bot structure to UI structure
            const platform = (bot.config as any)?.platform;
            const status = (bot.config as any)?.status || 'Active';
            const isConnected = status === 'Active' || status === 'Connected';
            const statusColor = isConnected ? 'bg-emerald-500' : 'bg-gray-300';
            const statusText = isConnected ? 'Online' : 'Offline';

            // Determine Icon
            let Icon = MessageSquare;
            let color = 'text-green-500';
            if (platform === 'Website') { Icon = Globe; color = 'text-primary'; }

            return (
              <Card key={bot.id} className="p-4 hover:shadow-md transition-all border-border group bg-white rounded-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full min-w-0">
                    <div className={cn("p-3 rounded-2xl bg-gray-50 group-hover:bg-primary/5 transition-colors shrink-0", color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-foreground truncate w-full">{bot.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-nowrap w-full min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor} ${isConnected ? 'animate-pulse' : ''}`} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter truncate block flex-1 min-w-0">
                          {platform || 'API'} • {statusText}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto justify-end mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full sm:w-auto text-muted-foreground hover:text-primary"
                      onClick={() => handleOpenSettings(bot)}
                    >
                      <Settings2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-full sm:w-auto text-muted-foreground hover:text-primary"><ExternalLink className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="w-full sm:w-8 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
          {fetchedIntegrations.length === 0 && !isLoading && (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
              No active integrations found.
            </div>
          )}
        </div>
      </div>

      {/* --- POP-UP MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={resetModal}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-primary p-8 text-white relative">
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                {selectedPlatform === 'WhatsApp' ? <QrCode className="w-6 h-6" /> : <Settings2 className="w-6 h-6" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{configStep === 'qr' ? 'Scan QR Code' : `Connect ${selectedPlatform}`}</DialogTitle>
                <DialogDescription className="text-primary-foreground/70 text-xs font-medium">Link your chatbot in seconds.</DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white min-h-[300px]">
            {isSaving && (
              <div className="flex flex-col items-center justify-center h-full py-10">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Connecting to server...</p>
              </div>
            )}

            {!isSaving && configStep === 'input' && !activeIntegrationId && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                {selectedPlatform === 'WhatsApp' ? (
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase">Select Bot to Connect</Label>

                    <select
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={(e) => setSelectedBotId(e.target.value)}
                      value={selectedBotId}
                    >
                      <option value="">Choose a bot from Builder...</option>
                      {allBots.filter((b: any) => !b.integrationId).map((bot: any) => (
                        <option key={bot.id} value={bot.id}>
                          {bot.name} ({bot.agent?.name || 'No Agent'})
                        </option>
                      ))}
                    </select>

                    {allBots.filter((b: any) => !b.integrationId).length === 0 && (
                      <div className="p-3 text-xs text-center text-muted-foreground">No unlinked bots available. Create one in Bot Builder first.</div>
                    )}

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600">
                        Tips: Link a Bot to generate a connection slot.
                      </p>
                    </div>

                    <Button
                      onClick={handleCreateSession}
                      disabled={isSaving}
                      className="w-full h-12 bg-primary font-bold text-white rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Connection & Link Bot'}
                    </Button>
                  </div>
                ) : (
                  // Generic / Website placeholder logic
                  <div className="space-y-4">
                    <p className="text-sm">Website Widget configuration is available in the main Admin dashboard.</p>
                    <Button onClick={() => setIsModalOpen(false)} variant="outline">Close</Button>
                  </div>
                )}
              </div>
            )}

            {!isSaving && configStep === 'qr' && (
              <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <div className="p-4 bg-white border-2 border-primary/10 rounded-[2.5rem] shadow-xl mb-6 relative group">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR" className="w-52 h-52 rounded-2xl" />
                  ) : (
                    <div className="w-52 h-52 flex flex-col items-center justify-center bg-gray-50 rounded-2xl text-muted-foreground gap-2">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-medium">Waiting for QR...</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/80 transition-opacity rounded-[2.5rem] backdrop-blur-sm">
                    <RefreshCw className="w-6 h-6 text-primary animate-spin-slow" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Scan with your phone</h3>
                <p className="text-xs text-center text-muted-foreground mb-8 px-4 leading-relaxed">
                  Open WhatsApp &gt; Settings &gt; Linked Devices to scan this code.
                </p>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setConfigStep('input')}>Back</Button>
                  <Button className="flex-1 h-12 bg-primary text-white font-bold rounded-xl" onClick={() => setConfigStep('success')}>I've Scanned</Button>
                </div>
              </div>
            )}

            {!isSaving && configStep === 'success' && (
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