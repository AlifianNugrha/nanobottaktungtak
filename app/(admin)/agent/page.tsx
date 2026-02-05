
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  ArrowLeft,
  Bot,
  Trash2,
  Play,
  Send,
  Loader2,
  Settings2,
  X,
  Database,
  Upload,
  FileText,
  Search,
  Check,
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { getAgents, createAgent, updateAgent, deleteAgent } from '@/app/actions/agent-actions';
import { getProducts } from '@/app/actions/product-actions';

export default function AgentPage() {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [agents, setAgents] = useState<any[]>([]);
  const [limit, setLimit] = useState(99);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTestAgent, setActiveTestAgent] = useState<any>(null);
  const [testMessages, setTestMessages] = useState<{ role: string, content: string }[]>([]);
  const [testInput, setTestInput] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State Form
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    model: 'llama-3.3-70b-versatile',
    prompt: '',
    products: [] as any[],
    knowledge: [] as any[]
  });

  // Product Form State
  const [productInput, setProductInput] = useState({
    name: '',
    description: '',
    image: '',
    price: ''
  });

  // Import Catalog State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [selectedImportIds, setSelectedImportIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const openImportModal = async () => {
    const res = await getProducts();
    if (res.success) {
      setCatalogProducts(res.data || []);
      setIsImportOpen(true);
      setSelectedImportIds([]);
    }
  };

  const handleImport = () => {
    const productsToAdd = catalogProducts
      .filter(p => selectedImportIds.includes(p.id))
      .map(p => ({
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image
      }));

    setFormData({ ...formData, products: [...formData.products, ...productsToAdd] });
    setIsImportOpen(false);
  };

  const toggleImportSelection = (id: string) => {
    if (selectedImportIds.includes(id)) {
      setSelectedImportIds(selectedImportIds.filter(x => x !== id));
    } else {
      setSelectedImportIds([...selectedImportIds, id]);
    }
  };

  const fetchAgents = async () => {
    setIsLoading(true);
    const res = await getAgents();
    if (res.success) {
      setAgents(res.data || []);
      // @ts-ignore
      setLimit(res.limit || 1);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name) return alert("Nama Agent wajib diisi!");
    setIsSaving(true);

    const fData = new FormData();
    fData.append('name', formData.name);
    fData.append('model', formData.model);
    fData.append('prompt', formData.prompt);
    fData.append('products', JSON.stringify(formData.products));
    fData.append('knowledge', JSON.stringify(formData.knowledge));

    let res;
    if (view === 'edit') {
      res = await updateAgent(formData.id, fData);
    } else {
      res = await createAgent(null, fData);
    }

    if (res.success) {
      fetchAgents();
      setView('list');
    } else {
      alert(res.error || "Gagal menyimpan agent");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus agent ini?')) {
      const res = await deleteAgent(id);
      if (res.success) {
        fetchAgents();
      } else {
        alert(res.error || "Gagal menghapus agent");
      }
    }
  };

  const openAddMode = () => {
    setFormData({ id: '', name: '', model: 'llama-3.3-70b-versatile', prompt: '', products: [], knowledge: [] });
    setView('add');
  };

  const openEditMode = (agent: any) => {
    const config = agent.config as any || {};
    setFormData({
      id: agent.id,
      name: agent.name,
      model: config.model || 'llama-3.3-70b-versatile',
      prompt: config.instructions || '',
      products: config.products || [],
      knowledge: config.knowledge || []
    });
    setView('edit');
  };

  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);

  const addProduct = () => {
    if (!productInput.name) return;

    const newProduct = {
      name: productInput.name,
      description: productInput.description,
      image: productInput.image,
      price: productInput.price
    };

    if (editingProductIndex !== null) {
      const newProducts = [...formData.products];
      newProducts[editingProductIndex] = newProduct;
      setFormData({ ...formData, products: newProducts });
      setEditingProductIndex(null);
    } else {
      setFormData({ ...formData, products: [...formData.products, newProduct] });
    }

    setProductInput({ name: '', description: '', image: '', price: '' });
  };

  const handleEditProduct = (idx: number) => {
    const product = formData.products[idx];
    if (typeof product === 'object') {
      setProductInput({
        name: product.name,
        description: product.description || '',
        image: product.image || '',
        price: product.price || ''
      });
      setEditingProductIndex(idx);
    }
  };

  const removeProduct = (idx: number) => {
    const newProducts = [...formData.products];
    newProducts.splice(idx, 1);
    setFormData({ ...formData, products: newProducts });
    if (editingProductIndex === idx) {
      setEditingProductIndex(null);
      setProductInput({ name: '', description: '', image: '', price: '' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 px-4 pb-20">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          {(view === 'add' || view === 'edit') && (
            <Button variant="outline" size="icon" onClick={() => setView('list')} className="rounded-xl h-10 w-10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {view === 'list' ? 'AI Agents' : view === 'edit' ? 'Edit Agent' : 'Create Agent'}
              </h1>
              {view === 'list' && (
                <>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${agents.length >= limit ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                    {agents.length} / {limit > 900 ? '∞' : limit} Used
                  </span>
                  {agents.length >= limit && (
                    <Link href="/admin/pricing" className="ml-2 text-[10px] font-black text-[#1E90FF] uppercase tracking-wider hover:underline flex items-center gap-1 animate-pulse">
                      Upgrade to Pro <Sparkles className="w-3 h-3" />
                    </Link>
                  )}
                </>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              {view === 'list' ? 'Manage your AI assistants.' : 'Configure identity, knowledge, and products.'}
            </p>
          </div>
        </div>

        {view === 'list' && (
          <Button
            onClick={openAddMode}
            disabled={agents.length >= limit}
            className={`text-white gap-2 h-11 px-6 font-bold shadow-lg rounded-xl transition-all ${agents.length >= limit ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' : 'bg-[#1E90FF] hover:bg-[#187bcd] shadow-[#1E90FF]/20'}`}
          >
            {agents.length >= limit ? 'Limit Reached' : <><Plus className="w-4 h-4" /> Create Agent</>}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#1E90FF]" />
        </div>
      ) : view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {agents.length > 0 ? agents.map((agent) => (
            <Card key={agent.id} className="p-6 border-border bg-white hover:shadow-xl transition-all relative group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-[#1E90FF]/10 rounded-2xl flex items-center justify-center border border-[#1E90FF]/20 text-[#1E90FF]">
                  <Bot className="w-7 h-7" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(agent.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{agent.name}</h3>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold bg-gray-100 text-muted-foreground px-2 py-0.5 rounded uppercase">{(agent.config as any)?.model === 'llama-3.3-70b-versatile' ? 'Llama 3.3' : (agent.config as any)?.model || 'Llama 3.3'}</span>
                  <span className="text-[10px] font-bold bg-[#1E90FF]/10 text-[#1E90FF] px-2 py-0.5 rounded uppercase">Active</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-3">
                <Button onClick={() => { setActiveTestAgent(agent); setIsTesting(true); setTestMessages([]); }} className="bg-[#1E90FF] text-white font-bold text-xs gap-2 rounded-xl h-10 shadow-sm">
                  <Play className="w-3 h-3 fill-current" /> Test
                </Button>
                <Button onClick={() => openEditMode(agent)} variant="outline" className="text-xs font-bold rounded-xl h-10 border-border hover:bg-gray-50 gap-2">
                  <Settings2 className="w-3.5 h-3.5" /> Settings
                </Button>
              </div>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center">
              <Bot className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">No agents found. Create your first agent!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <Card className="p-6 text-center space-y-4">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest text-center block">Agent Avatar</Label>
              <div className="relative mx-auto w-32 h-32 border-2 border-dashed border-[#1E90FF]/20 rounded-[2.5rem] flex flex-col items-center justify-center bg-gray-50 hover:bg-[#1E90FF]/5 transition-colors cursor-pointer group">
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-[#1E90FF]" />
                <span className="text-[9px] font-bold mt-1 text-muted-foreground group-hover:text-[#1E90FF] uppercase">Upload</span>
              </div>
            </Card>
            <Card className="p-6 space-y-4 border-l-4 border-l-[#1E90FF] shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Knowledge Base</Label>
                <Database className="w-4 h-4 text-[#1E90FF]" />
              </div>
              <div className="space-y-2">
                {formData.knowledge && formData.knowledge.length > 0 ? formData.knowledge.map((file, idx) => (
                  <div key={idx} className="p-3 bg-white border border-border rounded-xl flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#1E90FF]" />
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
                  id="knowledge-upload"
                  className="hidden"
                  accept=".pdf,.txt,.md"
                  onChange={async (e) => {
                    if (!e.target.files?.length) return;
                    const file = e.target.files[0];
                    const data = new FormData();
                    data.append('file', file);
                    const btn = document.getElementById('btn-upload-text');
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
                  className="w-full border-dashed h-10 text-xs font-bold font-jakarta"
                  onClick={() => document.getElementById('knowledge-upload')?.click()}
                >
                  <span id="btn-upload-text">+ Add Knowledge File</span>
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Agent Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sales Pro" className="h-11 rounded-xl bg-gray-50 font-jakarta"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Model Engine</Label>
                  <Select value={formData.model} onValueChange={(v) => setFormData({ ...formData, model: v })}>
                    <SelectTrigger className="h-11 rounded-xl bg-gray-50 font-jakarta"><SelectValue /></SelectTrigger>
                    <SelectContent className="font-jakarta">
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

              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-bold uppercase">Agent Products</Label>
                      <p className="text-[10px] text-muted-foreground">Select products this agent can recommend.</p>
                    </div>
                    <Button onClick={openImportModal} size="sm" className="h-8 text-xs gap-2 font-bold bg-[#1E90FF] text-white hover:bg-[#187bcd] shadow-sm shadow-[#1E90FF]/20 rounded-lg">
                      <Database className="w-3.5 h-3.5" /> Select from Catalog
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-border">
                  <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => {
                    const el = document.getElementById('manual-product-form');
                    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                  }}>
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground hover:text-[#1E90FF] transition-colors">Or Add Manual Item (Optional)</Label>
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div id="manual-product-form" style={{ display: 'none' }} className="space-y-3 pt-2 border-t border-dashed border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Product Name"
                        className="bg-white"
                        value={productInput.name}
                        onChange={(e) => setProductInput({ ...productInput, name: e.target.value })}
                      />
                      <Input
                        placeholder="Price (e.g. Rp 50.000)"
                        className="bg-white"
                        value={productInput.price}
                        onChange={(e) => setProductInput({ ...productInput, price: e.target.value })}
                      />
                    </div>
                    <Input
                      placeholder="Image URL (https://...)"
                      className="bg-white"
                      value={productInput.image}
                      onChange={(e) => setProductInput({ ...productInput, image: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Short Description"
                        className="bg-white flex-1"
                        value={productInput.description}
                        onChange={(e) => setProductInput({ ...productInput, description: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && addProduct()}
                      />
                      <Button onClick={addProduct} size="icon" className={`text-white shrink-0 rounded-lg ${editingProductIndex !== null ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1E90FF]'}`}>
                        {editingProductIndex !== null ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </Button>
                      {editingProductIndex !== null && (
                        <Button onClick={() => { setEditingProductIndex(null); setProductInput({ name: '', description: '', image: '', price: '' }); }} size="icon" variant="ghost" className="shrink-0 rounded-lg">
                          <X className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {formData.products.map((p, idx) => {
                    const isObj = typeof p === 'object';
                    const isEditing = editingProductIndex === idx;
                    return (
                      <div key={idx} className={`flex items-start gap-3 p-3 bg-white border rounded-xl group relative ${isEditing ? 'border-blue-500 ring-1 ring-blue-500' : 'border-border'}`}>
                        {isObj && p.image ? (
                          <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#1E90FF]/10 flex items-center justify-center text-[#1E90FF] font-bold text-xs uppercase">
                            {isObj && p.name ? p.name.substring(0, 2) : (typeof p === 'string' ? p.substring(0, 2) : '??')}
                          </div>
                        )}
                        <div className="flex-1 min-w-0 pr-16">
                          <h4 className="font-bold text-sm truncate">{isObj ? p.name : p}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{isObj ? p.description : 'No description'}</p>
                          {isObj && p.price && <p className="text-[10px] font-bold text-[#1E90FF] mt-0.5">{p.price}</p>}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg pl-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(idx)}
                            className="h-6 w-6 text-muted-foreground hover:text-blue-600"
                          >
                            <Settings2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProduct(idx)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {formData.products.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4 italic">No products added yet.</p>
                  )}
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
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50 font-jakarta"><SelectValue placeholder="Pilih sifat AI..." /></SelectTrigger>
                  <SelectContent className="font-jakarta">
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
                <Label className="text-xs font-bold uppercase">System Prompt</Label>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Define behavior..."
                  className="min-h-[160px] rounded-xl bg-gray-50 p-4 resize-none leading-relaxed font-jakarta"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-12 bg-[#1E90FF] text-white font-bold rounded-xl shadow-lg shadow-[#1E90FF]/20 font-jakarta">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : view === 'edit' ? 'Update Agent' : 'Create Agent'}
                </Button>
                <Button variant="ghost" onClick={() => setView('list')} className="h-12 px-8 font-bold text-muted-foreground font-jakarta">Cancel</Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={isTesting} onOpenChange={setIsTesting}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <div className="bg-[#1E90FF] p-6 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white font-jakarta">{activeTestAgent?.name}</DialogTitle>
              <p className="text-[10px] opacity-80 uppercase font-bold tracking-widest mt-1 font-jakarta">Live Simulator</p>
            </div>
          </div>
          <div className="h-[320px] bg-gray-50 p-6 overflow-y-auto font-jakarta flex flex-col gap-3">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border text-sm shadow-sm max-w-[85%] self-start">
              Hello! I am {activeTestAgent?.name}. Test my capabilities here.
            </div>
            {testMessages.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-2xl text-sm shadow-sm max-w-[85%] ${msg.role === 'user' ? 'bg-[#1E90FF] text-white self-end rounded-tr-none' : 'bg-white border self-start rounded-tl-none'}`}>
                {msg.content}
              </div>
            ))}
            {isTestLoading && (
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border text-sm shadow-sm max-w-[85%] self-start flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#1E90FF]" /> Thinking...
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t flex gap-2">
            <Input
              placeholder="Type something..."
              className="h-12 rounded-xl bg-gray-50 border-none font-jakarta"
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
                            model: (activeTestAgent.config as any)?.model || 'llama-3.3-70b-versatile',
                            prompt: (activeTestAgent.config as any)?.instructions || ''
                          },
                          products: (activeTestAgent.config as any)?.products || []
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
              className="h-12 w-12 bg-[#1E90FF] text-white rounded-xl"
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
                        model: (activeTestAgent.config as any)?.model || 'llama-3.3-70b-versatile',
                        prompt: (activeTestAgent.config as any)?.instructions || ''
                      },
                      products: (activeTestAgent.config as any)?.products || []
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
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50/50">
            <DialogTitle className="text-lg font-bold">Import from Catalog</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Select products to add to your agent's knowledge base.</p>
          </div>
          <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
            {catalogProducts.length > 0 ? catalogProducts.map(product => (
              <div
                key={product.id}
                className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${selectedImportIds.includes(product.id) ? 'border-[#1E90FF] bg-[#1E90FF]/5' : 'border-border hover:border-gray-300'}`}
                onClick={() => toggleImportSelection(product.id)}
              >
                <Checkbox checked={selectedImportIds.includes(product.id)} />
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-white" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#1E90FF]/10 flex items-center justify-center text-[#1E90FF] font-bold text-xs">
                    {product.name.substring(0, 2)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-sm">{product.name}</h4>
                    <span className="text-xs font-bold text-[#1E90FF]">Rp {product.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>No products found in catalog.</p>
                <Button variant="link" className="text-[#1E90FF] h-auto p-0 text-xs" onClick={() => window.open('/product-manager', '_blank')}>Go to Product Manager</Button>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-border bg-gray-50/50 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsImportOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button onClick={handleImport} className="bg-[#1E90FF] text-white rounded-xl font-bold px-6">
              Import ({selectedImportIds.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}