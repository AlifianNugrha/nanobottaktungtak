'use client';

import { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Dummy Data Agent (Seolah-olah dari page Agents)
const DUMMY_AGENTS = [
  { id: '1', name: 'Nexora Sales Pro' },
  { id: '2', name: 'Technical Support' },
  { id: '3', name: 'Customer Assistant' },
];

// Dummy Data Bot yang sudah dibuat
const INITIAL_BOTS = [
  { id: '1', name: 'Main WA Support', agent: 'Nexora Sales Pro', platform: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
  { id: '2', name: 'Telegram Helpdesk', agent: 'Technical Support', platform: 'Telegram', icon: Send, color: 'text-blue-400' },
];

export default function BotBuilderPage() {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [bots, setBots] = useState(INITIAL_BOTS);
  const [isSaving, setIsSaving] = useState(false);

  // State Form
  const [newBot, setNewBot] = useState({
    name: '',
    agent: '',
    platform: ''
  });

  const handleAddBot = async () => {
    if (!newBot.name || !newBot.agent || !newBot.platform) {
      return alert("Lengkapi data bot dulu!");
    }

    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000)); // Simulasi simpan

    const platformIcons: any = {
      'WhatsApp': { icon: MessageSquare, color: 'text-green-500' },
      'Telegram': { icon: Send, color: 'text-blue-400' },
      'Web Chat': { icon: Globe, color: 'text-primary' }
    };

    const createdBot = {
      id: Date.now().toString(),
      ...newBot,
      ...platformIcons[newBot.platform]
    };

    setBots([createdBot, ...bots]);
    setIsSaving(false);
    setView('list');
    setNewBot({ name: '', agent: '', platform: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus bot ini?')) {
      setBots(bots.filter(b => b.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 px-4 pb-20 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Bot Builder</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Connect your AI Agents to your preferred platforms.
          </p>
        </div>

        {view === 'list' ? (
          <Button onClick={() => setView('add')} className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 font-bold shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Add Bot
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setView('list')} className="gap-2 font-bold">
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
        )}
      </div>

      {view === 'list' ? (
        /* --- LIST BOTS --- */
        <div className="grid grid-cols-1 gap-4">
          {bots.length > 0 ? (
            bots.map((bot) => (
              <Card key={bot.id} className="p-4 border-border bg-white hover:border-primary/30 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={cn("w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-border shadow-sm group-hover:scale-105 transition-transform", bot.color)}>
                      <bot.icon className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-foreground tracking-tight">{bot.name}</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Layers className="w-3.5 h-3.5" />
                          Agent: <span className="text-foreground font-bold">{bot.agent}</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                          {bot.platform}
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
            ))
          ) : (
            <Card className="p-20 border-dashed border-2 text-center bg-gray-50/30">
              <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium italic text-sm">No bots connected yet.</p>
            </Card>
          )}
        </div>
      ) : (
        /* --- ADD BOT FORM --- */
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
                  placeholder="e.g. WhatsApp Customer Service"
                  value={newBot.name}
                  onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                  className="h-12 rounded-xl bg-gray-50 border-border focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Select AI Agent</Label>
                  <Select onValueChange={(v) => setNewBot({ ...newBot, agent: v })}>
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50">
                      <SelectValue placeholder="Choose Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_AGENTS.map(agent => (
                        <SelectItem key={agent.id} value={agent.name}>{agent.name}</SelectItem>
                      ))}
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
                      <SelectItem value="Telegram">Telegram</SelectItem>
                      <SelectItem value="Web Chat">Web Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddBot}
                disabled={isSaving}
                className="flex-1 h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
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