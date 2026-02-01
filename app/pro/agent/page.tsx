// This is a bulk replacement instruction, the tool might not support regex replacement directly in user visible logic but I will do it via ReplacementChunks or just use this description to guide the thought.
// Actually I must use exact match for replace_file_content or use multi_replace.
// Since there are many, I will use multi_replace efficiently or just replace the whole file content if it's easier, but that's expensive token-wise.
// Better to chunk it.

// Let's try replacing specific common patterns.
// "bg-primary" -> "bg-orange-600"
// "text-primary" -> "text-orange-600"
// "border-primary" -> "border-orange-600"
// "shadow-primary" -> "shadow-orange-600"
// "ring-primary" -> "ring-orange-600"

// I will do it for the whole file content since I read it.
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Upload,
  ArrowLeft,
  Bot,
  Trash2,
  Play,
  Send,
  Loader2,
  FileText,
  X,
  Database,
  Settings2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

// Data Dummy Awal
const INITIAL_AGENTS = [
  {
    id: '1',
    name: 'Nexora Sales Pro',
    model: 'GPT-4 Turbo',
    type: 'Sales Assistant',
    prompt: 'Anda adalah sales pro...',
    products: ['MacBook Pro M3']
  },
  {
    id: '2',
    name: 'Technical Support',
    model: 'Claude 3',
    type: 'Expert Help',
    prompt: 'Anda adalah pakar teknis...',
    products: []
  }
];

export default function AgentPage() {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTestAgent, setActiveTestAgent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State Form Lengkap
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    model: 'GPT-4 Turbo',
    type: 'Customer Service',
    prompt: '',
    products: [] as string[]
  });

  // --- FUNGSI NAVIGASI ---
  const openAddMode = () => {
    setFormData({ id: '', name: '', model: 'GPT-4 Turbo', type: 'Customer Service', prompt: '', products: [] });
    setView('add');
  };

  const openEditMode = (agent: any) => {
    setFormData(agent);
    setView('edit');
  };

  // --- FUNGSI LOGIKA ---
  const handleSave = async () => {
    if (!formData.name) return alert("Nama Agent wajib diisi!");
    setIsSaving(true);

    await new Promise(r => setTimeout(r, 800));

    if (view === 'edit') {
      setAgents(agents.map(a => a.id === formData.id ? formData : a));
    } else {
      const newEntry = { ...formData, id: Date.now().toString() };
      setAgents([newEntry, ...agents]);
    }

    setIsSaving(false);
    setView('list');
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus agent ini?')) {
      setAgents(agents.filter(agent => agent.id !== id));
    }
  };

  const addProduct = (name: string) => {
    if (!formData.products.includes(name)) {
      setFormData({ ...formData, products: [...formData.products, name] });
    }
    setSearchQuery('');
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 px-4 pb-20">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          {(view === 'add' || view === 'edit') && (
            <Button variant="outline" size="icon" onClick={() => setView('list')} className="rounded-xl h-10 w-10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {view === 'list' ? 'AI Agents' : view === 'edit' ? 'Edit Agent' : 'Create Agent'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {view === 'list' ? 'Kelola asisten AI milikmu.' : 'Konfigurasi identitas, file, dan katalog produk.'}
            </p>
          </div>
        </div>

        {view === 'list' && (
          <Button onClick={openAddMode} className="bg-orange-600 hover:bg-orange-700 text-white gap-2 h-11 px-6 font-bold shadow-lg shadow-orange-600/20 rounded-xl">
            <Plus className="w-4 h-4" /> Create Agent
          </Button>
        )}
      </div>

      {view === 'list' ? (
        /* --- LIST VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-6 border-border bg-white hover:shadow-xl transition-all relative group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-orange-600/10 rounded-2xl flex items-center justify-center border border-orange-600/20 text-orange-600">
                  <Bot className="w-7 h-7" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(agent.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{agent.name}</h3>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold bg-gray-100 text-muted-foreground px-2 py-0.5 rounded uppercase">{agent.model}</span>
                  <span className="text-[10px] font-bold bg-orange-600/10 text-orange-600 px-2 py-0.5 rounded uppercase">Active</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-3">
                <Button onClick={() => { setActiveTestAgent(agent); setIsTesting(true); }} className="bg-orange-600 text-white font-bold text-xs gap-2 rounded-xl h-10 shadow-sm">
                  <Play className="w-3 h-3 fill-current" /> Test
                </Button>
                <Button onClick={() => openEditMode(agent)} variant="outline" className="text-xs font-bold rounded-xl h-10 border-border hover:bg-gray-50 gap-2">
                  <Settings2 className="w-3.5 h-3.5" /> Settings
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* --- FORM VIEW (ADD/EDIT) --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">

          {/* SISI KIRI: MEDIA & KNOWLEDGE */}
          <div className="space-y-6">
            <Card className="p-6 text-center space-y-4">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest text-center block">Agent Avatar</Label>
              <div className="relative mx-auto w-32 h-32 border-2 border-dashed border-orange-600/20 rounded-[2.5rem] flex flex-col items-center justify-center bg-gray-50 hover:bg-orange-600/5 transition-colors cursor-pointer group">
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-orange-600" />
                <span className="text-[9px] font-bold mt-1 text-muted-foreground group-hover:text-orange-600 uppercase">Upload</span>
              </div>
            </Card>

            <Card className="p-6 space-y-4 border-l-4 border-l-orange-600 shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Knowledge Base</Label>
                <Database className="w-4 h-4 text-orange-600" />
              </div>
              <div className="p-3 bg-white border border-border rounded-xl flex items-center gap-3">
                <FileText className="w-5 h-5 text-orange-600" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold truncate">training_data_v1.pdf</p>
                  <p className="text-[9px] text-muted-foreground">1.2 MB</p>
                </div>
                <X className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-destructive" />
              </div>
              <Button variant="outline" className="w-full border-dashed h-10 text-xs font-bold">+ Add Knowledge File</Button>
            </Card>
          </div>

          {/* SISI KANAN: CONFIGURATION */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Agent Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sales Assistant" className="h-11 rounded-xl bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Model Engine</Label>
                  <Select value={formData.model} onValueChange={(v) => setFormData({ ...formData, model: v })}>
                    <SelectTrigger className="h-11 rounded-xl bg-gray-50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GPT-4 Turbo">GPT-4 Turbo (Best)</SelectItem>
                      <SelectItem value="Claude 3">Claude 3 Sonnet (Fast)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* SEARCH PRODUCT SECTION */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase">Connect to Product Catalog</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search product from your database..."
                    className="pl-10 h-11 rounded-xl bg-gray-50 focus:bg-white transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addProduct(searchQuery)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.products.map(p => (
                    <span key={p} className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/5 text-orange-600 text-[11px] font-bold rounded-full border border-orange-600/10">
                      {p} <X className="w-3 h-3 cursor-pointer" onClick={() => setFormData({ ...formData, products: formData.products.filter(x => x !== p) })} />
                    </span>
                  ))}
                  {formData.products.length === 0 && <p className="text-[11px] text-muted-foreground italic">No products linked yet.</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">System Prompt / Instructions</Label>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Instruksikan bagaimana bot harus bersikap..."
                  className="min-h-[160px] rounded-xl bg-gray-50 p-4 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-12 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all hover:scale-[1.01]">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : view === 'edit' ? 'Update Agent Settings' : 'Deploy New Agent'}
                </Button>
                <Button variant="ghost" onClick={() => setView('list')} className="h-12 px-8 font-bold text-muted-foreground hover:text-destructive">Cancel</Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* DIALOG TEST SIMULATOR */}
      <Dialog open={isTesting} onOpenChange={setIsTesting}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="bg-orange-600 p-6 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">{activeTestAgent?.name}</DialogTitle>
              <p className="text-[10px] opacity-80 uppercase font-bold tracking-widest mt-1">Live Simulator</p>
            </div>
          </div>
          <div className="h-[320px] bg-gray-50 p-6 overflow-y-auto space-y-4">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border text-sm shadow-sm max-w-[85%] leading-relaxed">
              Halo! Saya <strong>{activeTestAgent?.name}</strong>. Coba ketik sesuatu untuk mengetes kepintaran saya!
            </div>
          </div>
          <div className="p-4 bg-white border-t flex gap-2">
            <Input placeholder="Tanya sesuatu..." className="h-12 rounded-xl bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-orange-600" />
            <Button size="icon" className="h-12 w-12 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-600/20"><Send className="w-5 h-5" /></Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}