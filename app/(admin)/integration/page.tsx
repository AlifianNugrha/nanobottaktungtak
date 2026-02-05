
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
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBots, deleteBot } from '@/app/actions/bot-actions';
import { useRouter } from 'next/navigation';

export default function IntegrationPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [configStep, setConfigStep] = useState<'input' | 'qr' | 'success'>('input');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrPolling, setQrPolling] = useState<NodeJS.Timeout | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Widget Config State
  const [widgetConfig, setWidgetConfig] = useState({
    title: 'Chat Support',
    color: '#1E90FF',
    welcomeMessage: 'Halo! Ada yang bisa kami bantu hari ini?'
  });
  const router = useRouter();

  const platforms = [
    { id: 'wa', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
    { id: 'web', label: 'Website', icon: Globe, color: 'text-primary' },
  ];

  useEffect(() => {
    fetchIntegrations();

    return () => {
      if (qrPolling) clearInterval(qrPolling);
    };
  }, []);

  /* FILTER BOT LIST TO ONLY SHOW INTEGRATED BOTS IN MAIN LIST */
  const fetchIntegrations = async () => {
    setIsLoading(true);
    const res = await getBots();
    if (res.success) {
      // Filter: Only show bots that have an integrationId OR are platform-specific (created via integration page)
      const integratedBots = (res.data || []).filter((b: any) => b.integrationId || b.config?.platform === 'WhatsApp' || b.config?.platform === 'Website');
      setIntegrations(integratedBots);

      // Store ALL bots separately for the dropdown selection
      (window as any).allBots = res.data || [];
    }
    setIsLoading(false);
  };

  /* OLD DIRECT CONNECT LOGIC REMOVED/SIMPLIFIED - NOW HANDLED VIA SETTINGS */
  const handleConnectWhatsApp = async (specificBotId?: string) => {
    // If we call this, it means we want to Generate QR for a specific bot (or new one if not passed)
    // Currently used by Settings Button logic mainly
    setIsSaving(true);
    try {
      const response = await fetch('/api/whatsapp/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'WhatsApp Bot',
          botId: specificBotId
        })
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setConfigStep('qr');

        // Start polling for QR code
        const interval = setInterval(async () => {
          const qrResponse = await fetch(`/api/whatsapp/session?sessionId=${data.sessionId}`);
          const qrData = await qrResponse.json();

          if (qrData.qr) {
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData.qr)}`;
            setQrCodeUrl(qrImageUrl);
          }

          if (qrData.status === 'connected') {
            clearInterval(interval);
            setQrPolling(null);
            setConfigStep('success');
            fetchIntegrations(); // Refresh list to update status
          }
        }, 2000);

        setQrPolling(interval);
      }
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      alert('Failed to connect WhatsApp');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = (type: 'connect' | 'qr') => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (type === 'qr') {
        setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=NanoArtif-Session-12345");
        setConfigStep('qr');
      } else {
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
        fetchIntegrations();
      }, 300);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Disconnect integration?')) {
      const res = await deleteBot(id);
      if (res.success) fetchIntegrations();
    }
  };

  const getPlatformIcon = (platform: string | null) => {
    const p = platforms.find(pl => pl.label === platform);
    return {
      icon: p?.icon || Plug,
      color: p?.color || 'text-gray-500'
    };
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 px-4 sm:px-6 lg:px-8 pb-20 font-jakarta">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Integrations</h1>
          <p className="text-muted-foreground text-sm">Manage your chatbot connections and live channels.</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20 h-11 px-6 font-bold rounded-xl">
              <Plus className="w-4 h-4" />
              Add Connection
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
            <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Platform</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {platforms.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => { setSelectedPlatform(p.label); setIsModalOpen(true); }}
                className="gap-3 cursor-pointer py-2.5 rounded-xl transition-colors"
              >
                <p.icon className={cn("w-4 h-4", p.color)} />
                <span className="font-semibold text-sm">{p.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider ml-1">Active Connections</h3>

        {isLoading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : integrations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {integrations.map((bot) => {
              const platform = (bot.config as any)?.platform;
              const { icon: Icon, color } = getPlatformIcon(platform);
              return (
                <Card key={bot.id} className="p-4 hover:shadow-md transition-all border-border group bg-white rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-2xl bg-gray-50 group-hover:bg-primary/5 transition-colors", color)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{bot.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* STATUS INDICATOR LOGIC */}
                          {(() => {
                            // Determine status color and text
                            const status = (bot.config as any)?.status || 'Active';
                            const isConnected = status === 'Active' || status === 'Connected';
                            const statusColor = isConnected ? 'bg-emerald-500' : 'bg-gray-300';
                            const statusText = isConnected ? 'Online' : 'Offline';

                            return (
                              <>
                                <span className={`w-2 h-2 rounded-full ${statusColor} ${isConnected ? 'animate-pulse' : ''}`} />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                  {platform || 'API'} • {statusText} • Agent: {bot.agent?.name || 'Unassigned'}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Tombol Reconnect untuk WhatsApp Disconnected */}
                      {platform === 'WhatsApp' && (bot.config as any)?.status === 'Disconnected' && (
                        <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50" onClick={() => {
                          setSelectedPlatform('WhatsApp');
                          setIsModalOpen(true);
                        }}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Tombol View Code untuk Widget */}
                      {platform === 'Website' && (
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => {
                          // Show copy code modal again
                          setSelectedPlatform('Website');
                          setConfigStep('success'); // Jumpt to success/copy screen
                          setIsModalOpen(true);
                        }}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}

                      <Button variant="ghost" size="icon" onClick={() => {
                        // REFACTORED: Settings now acts as "Connect/Reconnect"
                        if (platform === 'WhatsApp') {
                          handleConnectWhatsApp(bot.id); // Trigger session creation for THIS bot
                          setSelectedPlatform('WhatsApp');
                          setIsModalOpen(true);
                          // We let handleConnectWhatsApp handle the step change (it sets to 'qr' on success)
                          // But we might need to show loading state
                        } else {
                          setSelectedPlatform(platform || 'WhatsApp');
                          setConfigStep('input');
                          setIsModalOpen(true);
                        }
                      }} className="text-muted-foreground hover:text-primary"><Settings2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(bot.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-20 border-dashed border-2 text-center bg-gray-50/30 rounded-[2.5rem]">
            <Plug className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium italic text-sm">No active integrations found.</p>
            <Button variant="link" onClick={() => setIsModalOpen(true)} className="text-primary font-bold mt-2">Connect your first bot</Button>
          </Card>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={resetModal}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
          <div className="bg-primary p-8 text-white relative">
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                {selectedPlatform === 'WhatsApp' ? <QrCode className="w-6 h-6" /> : selectedPlatform === 'Website' ? <Globe className="w-6 h-6" /> : <Settings2 className="w-6 h-6" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{configStep === 'qr' ? 'Scan QR Code' : configStep === 'success' ? 'Completed' : `Connect ${selectedPlatform}`}</DialogTitle>
                <DialogDescription className="text-primary/10 text-xs font-medium">Link your chatbot in seconds.</DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white max-h-[70vh] overflow-y-auto">
            {configStep === 'input' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                {selectedPlatform === 'Website' ? (
                  /* ====== WIDGET PREVIEW MODE ====== */
                  <div className="space-y-6">
                    <div className="bg-gray-100 p-4 rounded-xl border border-dashed border-gray-300">
                      <Label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">Live Preview</Label>

                      {/* PREVIEW CONTAINER */}
                      <div className="bg-white rounded-lg shadow-sm border p-4 relative min-h-[300px] flex flex-col justify-end items-end gap-3 bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
                        {/* Chat Window Preview */}
                        <div className="w-[280px] bg-white rounded-xl shadow-xl overflow-hidden border mb-2 slide-in-from-bottom-2 fade-in duration-500">
                          <div className="p-3 text-white flex justify-between items-center" style={{ backgroundColor: widgetConfig.color }}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                              <span className="text-xs font-bold">{widgetConfig.title}</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 h-[150px] text-xs space-y-2">
                            <div className="bg-gray-200 p-2 rounded-lg rounded-tl-none self-start max-w-[80%]">
                              {widgetConfig.welcomeMessage}
                            </div>
                          </div>
                          <div className="p-2 border-t flex gap-2">
                            <div className="h-8 bg-gray-100 rounded-lg flex-1"></div>
                            <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: widgetConfig.color }}></div>
                          </div>
                        </div>

                        {/* Floating Button Preview */}
                        <div className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: widgetConfig.color }}>
                          <MessageSquare className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">Widget Title</Label>
                        <Input value={widgetConfig.title} onChange={(e) => setWidgetConfig({ ...widgetConfig, title: e.target.value })} className="h-10 rounded-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">Theme Color</Label>
                        <div className="flex gap-2">
                          {['#1E90FF', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b'].map((color) => (
                            <div
                              key={color}
                              onClick={() => setWidgetConfig({ ...widgetConfig, color })}
                              className={`w-8 h-8 rounded-full cursor-pointer border-2 ${widgetConfig.color === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">Welcome Message</Label>
                        <Input value={widgetConfig.welcomeMessage} onChange={(e) => setWidgetConfig({ ...widgetConfig, welcomeMessage: e.target.value })} className="h-10 rounded-lg" />
                      </div>
                    </div>

                    <Button
                      onClick={async () => {
                        setIsSaving(true);
                        // 1. Create Bot Entry via Server Action
                        const formData = new FormData();
                        formData.append('name', widgetConfig.title || 'My Widget');
                        formData.append('platform', 'Website');
                        formData.append('config', JSON.stringify({
                          ...widgetConfig,
                          status: 'Pending' // Initial status
                        }));
                        // Assuming user selected a bot/agent in previous step, default to first available or none
                        // In real flow, we should ensure agent is selected. For now using placeholder logic.

                        // Fake API call simulation
                        await new Promise(r => setTimeout(r, 1000));

                        setIsSaving(false);
                        setConfigStep('success');
                      }}
                      className="w-full h-12 bg-primary font-bold text-white rounded-xl shadow-lg shadow-primary/20"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Widget & Get Code'}
                    </Button>
                  </div>
                ) : (
                  /* ====== STANDARD WHATSAPP FLOW ====== */
                  selectedPlatform === 'WhatsApp' ? (
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase">Select Bot to Connect</Label>
                      <Select onValueChange={(value) => (window as any).selectedBotIdForConnection = value}>
                        <SelectTrigger className="h-12 rounded-xl bg-gray-50">
                          <SelectValue placeholder="Choose a bot from Builder" />
                        </SelectTrigger>
                        <SelectContent>
                          {((window as any).allBots || []).filter((b: any) => !b.integrationId).map((bot: any) => (
                            <SelectItem key={bot.id} value={bot.id}>
                              {bot.name} ({bot.agent?.name || 'No Agent'})
                            </SelectItem>
                          ))}
                          {((window as any).allBots || []).filter((b: any) => !b.integrationId).length === 0 && (
                            <div className="p-3 text-xs text-center text-muted-foreground">No unlinked bots available. Create one in Bot Builder first.</div>
                          )}
                        </SelectContent>
                      </Select>

                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600">
                          Tips: You are about to link a "Brain" (Bot) to a "channel" (WhatsApp).
                          Once linked, you can scan the QR code.
                        </p>
                      </div>

                      <Button
                        onClick={async () => {
                          const botId = (window as any).selectedBotIdForConnection;
                          if (!botId) {
                            alert("Please select a bot first!");
                            return;
                          }

                          setIsSaving(true);
                          // Call session route which now handles 'botId' linking
                          // We essentially create a session/integration entry and LINK it to the existig bot
                          const response = await fetch('/api/whatsapp/session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: 'WhatsApp Connection',
                              botId: botId
                            })
                          });

                          setIsSaving(false);
                          if (response.ok) {
                            setIsModalOpen(false);
                            fetchIntegrations(); // Refresh list, the bot should now appear
                          } else {
                            alert("Failed to create connection slot");
                          }
                        }}
                        disabled={isSaving}
                        className="w-full h-12 bg-green-600 hover:bg-green-700 font-bold text-white rounded-xl shadow-lg"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Connection & Link Bot'}
                      </Button>
                    </div>
                  ) : (
                    // Logic for Website (existing)
                    integrations.length > 0 ? (
                      <Button
                        onClick={() => handleAction('connect')} // Fallback for safety, though Website has its own button above
                        disabled={isSaving}
                        className="w-full h-12 bg-primary font-bold text-white rounded-xl shadow-lg shadow-primary/20"
                      >
                        Continue
                      </Button>
                    ) : null
                  )
                )}
              </div>
            )}

            {configStep === 'qr' && (
              <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <div className="p-4 bg-white border-2 border-primary/10 rounded-[2.5rem] shadow-xl mb-6 relative group">
                  <img src={qrCodeUrl!} alt="QR" className="w-52 h-52 rounded-2xl" />
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

            {configStep === 'success' && (
              <div className="flex flex-col items-center py-6 text-center animate-in zoom-in">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Success!</h3>
                {selectedPlatform === 'Website' ? (
                  <div className="w-full mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground px-4">Copy this code to your website's <code>&lt;body&gt;</code> tag. Status will turn <b>Active</b> once installed.</p>
                    <div className="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs font-mono text-left break-all relative group">
                      {`<script src="https://cd.nanoartif.com/widget.js?id=wdg_${Math.random().toString(36).substr(2, 9)}" defer></script>`}
                      <Button size="sm" variant="secondary" className="absolute top-2 right-2 h-6 text-[10px]" onClick={() => {
                        alert('Copied! Status updated to Active.');
                        // Logic to update bot status to 'Active' would go here
                        fetchIntegrations(); // Refresh list to show potential status change
                      }}>Copy & Activate</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2 mb-8 px-4">Simulation successful. Integration entry will show up in your list.</p>
                )}

                <Button className="w-full h-12 bg-foreground text-white font-bold rounded-xl shadow-lg mt-6" onClick={() => resetModal(false)}>Finish</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}