
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Bot,
  Plus,
  MessageSquare,
  Send,
  Globe,
  Trash2,
  Layers,
  ChevronRight,
  Settings2,
  Loader2,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createBot, getBots, deleteBot } from '@/app/actions/bot-actions';
import { getAgents } from '@/app/actions/agent-actions';

export default function BotBuilderPage() {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [bots, setBots] = useState<any[]>([]);
  const [limit, setLimit] = useState(99);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State Form
  const [newBot, setNewBot] = useState({
    name: '',
    agentId: '',
    platform: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [botsRes, agentsRes] = await Promise.all([
      getBots(),
      getAgents()
    ]);

    if (botsRes.success) {
      setBots(botsRes.data as any[]);
      // @ts-ignore
      setLimit(botsRes.limit || 1);
    }
    if (agentsRes.success) setAgents(agentsRes.data as any[]);

    setIsLoading(false);
  };

  const handleCreateBot = async () => {
    if (!newBot.name || !newBot.agentId || !newBot.platform) {
      return alert("Lengkapi data bot dulu!");
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append('name', newBot.name);
    formData.append('agentId', newBot.agentId);
    formData.append('platform', newBot.platform);

    const result = await createBot(null, formData);

    setIsSaving(false);
    if (result.success) {
      setView('list');
      setNewBot({ name: '', agentId: '', platform: '' });
      fetchData(); // Refresh list
    } else {
      alert(result.error || "Gagal membuat bot");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus bot ini?')) {
      const result = await deleteBot(id);
      if (result.success) {
        fetchData();
      } else {
        alert(result.error || "Gagal menghapus bot");
      }
    }
  };

  const getPlatformIcon = (platform: string | null) => {
    const icons: any = {
      'WhatsApp': { icon: MessageSquare, color: 'text-green-500' },
      'Telegram': { icon: Send, color: 'text-blue-400' },
      'Website': { icon: Globe, color: 'text-primary' }
    };
    return icons[platform || ''] || { icon: Bot, color: 'text-gray-500' };
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 px-4 pb-20 animate-in fade-in duration-500 font-jakarta">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Bot Builder</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${bots.length >= limit ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
              {bots.length} / {limit > 900 ? '∞' : limit} Used
            </span>
            {bots.length >= limit && (
              <Link href="/admin/pricing" className="ml-2 text-[10px] font-black text-[#1E90FF] uppercase tracking-wider hover:underline flex items-center gap-1 animate-pulse">
                Upgrade to Pro <Sparkles className="w-3 h-3" />
              </Link>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Connect your AI Agents to your preferred platforms.
          </p>
        </div>

        {view === 'list' ? (
          <Button
            onClick={() => setView('add')}
            disabled={bots.length >= limit}
            className={`text-white gap-2 h-11 px-6 font-bold shadow-lg rounded-xl transition-all ${bots.length >= limit ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
          >
            {bots.length >= limit ? 'Limit Reached' : <><Plus className="w-4 h-4" /> Add Bot</>}
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setView('list')} className="gap-2 font-bold">
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : view === 'list' ? (
        <div className="grid grid-cols-1 gap-4">
          {bots.length > 0 ? (
            bots.map((bot) => {
              const config = bot.config as any || {};
              const { icon: Icon, color } = getPlatformIcon(config.platform);

              return (
                <Card key={bot.id} className="p-4 border-border bg-white hover:border-primary/30 transition-all group rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={cn("w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-border shadow-sm group-hover:scale-105 transition-transform", color)}>
                        <Icon className="w-7 h-7" />
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-foreground tracking-tight">{bot.name}</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Layers className="w-3.5 h-3.5" />
                            Agent: <span className="text-foreground font-bold">{bot.agent?.name || 'Unknown'}</span>
                          </div>
                          <span className="text-gray-300">|</span>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                            {config.platform || 'General'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(bot.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-xl">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="p-20 border-dashed border-2 text-center bg-gray-50/30 rounded-[2.5rem]">
              <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium italic text-sm">No bots connected yet.</p>
            </Card>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-8 space-y-8 bg-white border-border shadow-2xl shadow-black/[0.02] rounded-[2rem]">
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Configure New Bot</h2>
              <p className="text-sm text-muted-foreground">Link an AI personality to a messaging platform.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Bot Name</Label>
                <Input
                  placeholder="e.g. WhatsApp Support"
                  value={newBot.name}
                  onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                  className="h-12 rounded-xl bg-gray-50 border-border focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Select AI Agent</Label>
                  <Select onValueChange={(v) => setNewBot({ ...newBot, agentId: v })}>
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50">
                      <SelectValue placeholder="Choose Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.length > 0 ? (
                        agents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-center text-muted-foreground">No agents found</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Platform</Label>
                  <Select onValueChange={(v) => setNewBot({ ...newBot, platform: v })}>
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50">
                      <SelectValue placeholder="Choose Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateBot}
                disabled={isSaving}
                className="flex-1 h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Bot Instance'}
              </Button>
              <Button variant="ghost" onClick={() => setView('list')} className="flex-1 h-12 text-destructive font-bold hover:bg-destructive/10 rounded-xl">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}