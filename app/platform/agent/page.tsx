
'use client';

import { useState, useEffect } from 'react';
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
import { getAgents, createAgent, deleteAgent } from '@/app/actions/agent-actions';

export default function AgentPage() {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTestAgent, setActiveTestAgent] = useState<any>(null);
  const [testMessages, setTestMessages] = useState<{ role: string, content: string }[]>([]);
  const [testInput, setTestInput] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  //State Form
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    model: 'llama-3.3-70b-versatile',
    type: 'Customer Service',
    prompt: '',
    products: [] as string[],
    knowledge: [] as any[]
  });

  // Load Agents
  useEffect(() => {
    fetchAgents();
  }, [view]);

  const fetchAgents = async () => {
    setIsLoading(true);
    const res = await getAgents();
    if (res.success && res.data) {
      setAgents(res.data);
    }
    setIsLoading(false);
  }

  // --- FUNGSI NAVIGASI ---
  const openAddMode = () => {
    setFormData({ id: '', name: '', model: 'llama-3.3-70b-versatile', type: 'Customer Service', prompt: '', products: [], knowledge: [] });
    setView('add');
  };

  const openEditMode = (agent: any) => {
    // Parsing config json if needed
    const config = agent.config || {};
    setFormData({
      id: agent.id,
      name: agent.name,
      model: config.model || 'llama-3.3-70b-versatile',
      type: agent.role || 'Custom Agent',
      prompt: config.instructions || '',
      products: config.products || [],
      knowledge: config.knowledge || []
    });
    setView('edit');
  };

  // --- FUNGSI LOGIKA ---
  const handleSave = async () => {
    if (!formData.name) return alert("Nama Agent wajib diisi!");
    setIsSaving(true);

    // Form Data for Server Action
    const data = new FormData();
    data.append('name', formData.name);
    data.append('model', formData.model);
    data.append('prompt', formData.prompt);
    // Products and Knowledge aren't in form data for platform yet, assuming 'createAgent' handles them from config
    // Actually createAgent expects 'products' stringified if it uses the same action
    data.append('products', JSON.stringify(formData.products));
    data.append('knowledge', JSON.stringify(formData.knowledge));

    // Note: Edit mode not fully implemented in server action yet for this demo step, just Create.
    if (view === 'add') {
      const res = await createAgent(null, data);
      if (!res.success) {
        alert(res.error);
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    setView('list');
    fetchAgents();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus agent ini?')) {
      // Optimistic
      const prev = [...agents];
      setAgents(agents.filter(agent => agent.id !== id));

      const res = await deleteAgent(id);
      if (!res.success) {
        setAgents(prev);
        alert("Gagal menghapus agent");
      }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
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
          <Button onClick={openAddMode} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 font-bold shadow-lg shadow-primary/20 rounded-xl">
            <Plus className="w-4 h-4" /> Create Agent
          </Button>
        )}
      </div>

      {view === 'list' ? (
        /* --- LIST VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {isLoading ? (
            <div className="col-span-3 flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : agents.length > 0 ? (
            agents.map((agent) => {
              const config = agent.config || {};
              return (
                <Card key={agent.id} className="p-6 border-border bg-white hover:shadow-xl transition-all relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary">
                      <Bot className="w-7 h-7" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(agent.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">{agent.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold bg-gray-100 text-muted-foreground px-2 py-0.5 rounded uppercase">{config.model || 'GPT-4'}</span>
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">Active</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-3">
                    <Button onClick={() => { setActiveTestAgent(agent); setIsTesting(true); setTestMessages([]); }} className="bg-primary text-white font-bold text-xs gap-2 rounded-xl h-10 shadow-sm">
                      <Play className="w-3 h-3 fill-current" /> Test
                    </Button>
                    <Button onClick={() => openEditMode(agent)} variant="outline" className="text-xs font-bold rounded-xl h-10 border-border hover:bg-gray-50 gap-2">
                      <Settings2 className="w-3.5 h-3.5" /> Settings
                    </Button>
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="col-span-3 text-center py-10 text-muted-foreground">No agents found. Create one!</div>
          )}
        </div>
      ) : (
        /* --- FORM VIEW (ADD/EDIT) --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">

          {/* SISI KIRI: MEDIA & KNOWLEDGE */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4 border-l-4 border-l-primary shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Knowledge Base</Label>
                <Database className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Knowledge Base</Label>
                <Database className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-2">
                {formData.knowledge && formData.knowledge.length > 0 ? formData.knowledge.map((file, idx) => (
                  <div key={idx} className="p-3 bg-white border border-border rounded-xl flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold truncate">{file.name}</p>
                      <p className="text-[9px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <X className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-red-500" onClick={() => {
                      const newK = [...formData.knowledge];
                      newK.splice(idx, 1);
                      setFormData({ ...formData, knowledge: newK });
                    }} />
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground bg-gray-50 p-4 rounded-xl text-center italic">No documents uploaded.</p>
                )}
              </div>
              <div className="relative">
                <input
                  type="file"
                  id="knowledge-upload-platform"
                  className="hidden"
                  accept=".pdf,.txt,.md"
                  onChange={async (e) => {
                    if (!e.target.files?.length) return;
                    const file = e.target.files[0];
                    const data = new FormData();
                    data.append('file', file);
                    const btn = document.getElementById('btn-upload-text-platform');
                    if (btn) btn.innerText = 'Uploading...';

                    try {
                      const res = await fetch('/api/knowledge/upload', { method: 'POST', body: data });
                      const result = await res.json();
                      if (result.success) {
                        setFormData(prev => ({ ...prev, knowledge: [...prev.knowledge, result.file] }));
                      } else {
                        alert('Upload failed');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Upload error');
                    } finally {
                      if (btn) btn.innerText = '+ Add Knowledge File';
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full border-dashed h-10 text-xs font-bold"
                  onClick={() => document.getElementById('knowledge-upload-platform')?.click()}
                >
                  <span id="btn-upload-text-platform">+ Add Knowledge File</span>
                </Button>
              </div>
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
                      <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B (Latest & Best)</SelectItem>
                      <SelectItem value="llama-3.1-70b-versatile">Llama 3.1 70B (Stable)</SelectItem>
                      <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B (Super Fast)</SelectItem>
                      <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B (Long Context)</SelectItem>
                      <SelectItem value="gemma2-9b-it">Google Gemma 2 9B</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Legacy)</SelectItem>
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
                    <span key={p} className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary text-[11px] font-bold rounded-full border border-primary/10">
                      {p} <X className="w-3 h-3 cursor-pointer" onClick={() => setFormData({ ...formData, products: formData.products.filter(x => x !== p) })} />
                    </span>
                  ))}
                  {formData.products.length === 0 && <p className="text-[11px] text-muted-foreground italic">No products linked yet.</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Personality / Gaya Bicara</Label>
                <Select onValueChange={(val) => {
                  const templates: Record<string, string> = {
                    'professional': 'Anda adalah asisten profesional. Gunakan bahasa yang baku, sopan, efisien, dan objektif. Fokus pada memberikan solusi yang tepat dan akurat.',
                    'friendly': 'Anda adalah asisten yang ramah dan bersahabat. Gunakan bahasa yang santai namun tetap sopan (seperti "Kak", "Gan"). Gunakan sedikit emoticon untuk mencairkan suasana.',
                    'cheerful': 'Anda adalah asisten yang sangat ceria dan antusias! 🌟 Gunakan bahasa yang penuh semangat, banyak tanda seru, dan emoticon yang relevan. Buat pengguna merasa senang berinteraksi dengan Anda.',
                    'empathetic': 'Anda adalah customer service yang sabar dan penuh empati. Selalu validasi perasaan pelanggan terlebih dahulu (contoh: "Saya mengerti kekecewaan Kakak"). Prioritaskan kenyamanan pelanggan.',
                    'humorous': 'Anda adalah asisten yang lucu dan santai. Jangan terlalu kaku. Gunakan humor yang sopan dan bahasa gaul yang sedang tren jika relevan. Anggap pengguna sebagai teman dekat.'
                  };
                  if (templates[val]) {
                    setFormData({ ...formData, prompt: templates[val] });
                  }
                }}>
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50"><SelectValue placeholder="Pilih sifat AI..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">👔 Profesional & Formal</SelectItem>
                    <SelectItem value="friendly">😊 Ramah & Sahabat</SelectItem>
                    <SelectItem value="cheerful">🤩 Ceria & Enerjik</SelectItem>
                    <SelectItem value="empathetic">🤗 Penuh Empati (CS)</SelectItem>
                    <SelectItem value="humorous">🤪 Lucu & Gaul</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">Memilih opsi di atas akan mengisi otomatis Instruksi Dasar di bawah.</p>
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
                <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]">
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
          <div className="bg-primary p-6 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">{activeTestAgent?.name}</DialogTitle>
              <p className="text-[10px] opacity-80 uppercase font-bold tracking-widest mt-1">Live Simulator</p>
            </div>
          </div>
          <div className="h-[320px] bg-gray-50 p-6 overflow-y-auto font-jakarta flex flex-col gap-3">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border text-sm shadow-sm max-w-[85%] self-start leading-relaxed">
              Halo! Saya <strong>{activeTestAgent?.name}</strong>. Coba ketik sesuatu untuk mengetes kepintaran saya!
            </div>
            {testMessages.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-2xl text-sm shadow-sm max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-white self-end rounded-tr-none' : 'bg-white border self-start rounded-tl-none'}`}>
                {msg.content}
              </div>
            ))}
            {isTestLoading && (
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border text-sm shadow-sm max-w-[85%] self-start flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Thinking...
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t flex gap-2">
            <Input
              placeholder="Tanya sesuatu..."
              className="h-12 rounded-xl bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isTestLoading) {
                  const send = async () => {
                    if (!testInput.trim()) return;
                    const updatedMessages = [...testMessages, { role: 'user', content: testInput }];
                    setTestMessages(updatedMessages);
                    setTestInput('');
                    setIsTestLoading(true);

                    try {
                      const res = await fetch('/api/chat/test', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          messages: updatedMessages,
                          config: {
                            model: activeTestAgent.config?.model || 'llama-3.3-70b-versatile',
                            prompt: activeTestAgent.config?.instructions || ''
                          },
                          products: activeTestAgent.config?.products || []
                        })
                      });
                      const data = await res.json();
                      if (data.reply) {
                        setTestMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsTestLoading(false);
                    }
                  };
                  send();
                }
              }}
            />
            <Button
              size="icon"
              className="h-12 w-12 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
              disabled={isTestLoading}
              onClick={async () => {
                if (!testInput.trim()) return;
                const updatedMessages = [...testMessages, { role: 'user', content: testInput }];
                setTestMessages(updatedMessages);
                setTestInput('');
                setIsTestLoading(true);

                try {
                  const res = await fetch('/api/chat/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      messages: updatedMessages,
                      config: {
                        model: activeTestAgent.config?.model || 'llama-3.3-70b-versatile',
                        prompt: activeTestAgent.config?.instructions || ''
                      },
                      products: activeTestAgent.config?.products || []
                    })
                  });
                  const data = await res.json();
                  if (data.reply) {
                    setTestMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsTestLoading(false);
                }
              }}
            >
              {isTestLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}