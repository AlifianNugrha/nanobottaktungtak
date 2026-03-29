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
  Trash2,
  Package,
  ArrowLeft,
  Settings2,
  Loader2,
  X,
  Tags,
  Check
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Data Dummy Awal
const INITIAL_PRODUCTS = [
  { id: '1', name: 'MacBook Pro M3', price: '24.999.000', category: 'Laptop', stock: '12', description: 'Powerful M3 Chip' },
  { id: '2', name: 'iPhone 15 Pro', price: '18.500.000', category: 'Smartphone', stock: '25', description: 'Titanium design' }
];

const INITIAL_CATEGORIES = ['Electronics', 'Laptop', 'Smartphone', 'Accessories', 'General'];

export default function ProductManagerPage() {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State Kategori Baru
  const [newCatInput, setNewCatInput] = useState('');
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // State Form Produk
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    category: 'General',
    stock: '',
    description: ''
  });

  // --- LOGIKA PRODUK ---
  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) return alert("Nama dan Harga wajib diisi!");
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));

    if (view === 'edit') {
      setProducts(products.map(p => p.id === formData.id ? formData : p));
    } else {
      setProducts([{ ...formData, id: Date.now().toString() }, ...products]);
    }
    setIsSaving(false);
    setView('list');
  };

  // --- LOGIKA KATEGORI ---
  const handleAddCategory = () => {
    if (newCatInput && !categories.includes(newCatInput)) {
      setCategories([...categories, newCatInput]);
      setNewCatInput('');
    }
  };

  const deleteCategory = (catToDelete: string) => {
    if (catToDelete === 'General') return alert("Kategori 'General' tidak bisa dihapus.");
    setCategories(categories.filter(c => c !== catToDelete));
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 px-4 pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          {view !== 'list' && (
            <Button variant="outline" size="icon" onClick={() => setView('list')} className="rounded-xl h-10 w-10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {view === 'list' ? 'Product Catalog' : view === 'edit' ? 'Edit Product' : 'New Product'}
            </h1>
            <p className="text-muted-foreground text-sm">Kelola inventaris dan kategori produk Anda.</p>
          </div>
        </div>

        {view === 'list' && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* MODAL MANAGE CATEGORY */}
            <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto gap-2 h-11 px-5 font-bold rounded-xl border-border">
                  <Tags className="w-4 h-4" /> Categories
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] rounded-3xl p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Manage Categories</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="New category name..."
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      className="h-11 rounded-xl bg-gray-50"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <Button onClick={handleAddCategory} className="bg-primary text-white h-11 px-4 rounded-xl">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                    {categories.map(cat => (
                      <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-primary/20 transition-all">
                        <span className="text-sm font-medium">{cat}</span>
                        {cat !== 'General' && (
                          <X className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-destructive" onClick={() => deleteCategory(cat)} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={() => setView('add')} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 font-bold shadow-lg shadow-primary/20 rounded-xl">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </div>
        )}
      </div>

      {view === 'list' ? (
        /* --- LIST VIEW --- */
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 h-11 rounded-xl bg-white border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((product) => (
              <Card key={product.id} className="group overflow-hidden border-border bg-white hover:shadow-xl transition-all">
                <div className="aspect-video bg-gray-50 flex items-center justify-center border-b border-border relative">
                  <Package className="w-10 h-10 text-muted-foreground/30" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded border border-border uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                    <p className="font-bold text-primary">Rp {product.price}</p>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{product.description || 'No description available.'}</p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Stock: {product.stock}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setFormData(product); setView('edit'); }} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                        <Settings2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setProducts(products.filter(p => p.id !== product.id))} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* --- ADD/EDIT FORM --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-6 text-center space-y-4 shadow-sm h-fit">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Product Image</Label>
            <div className="aspect-square w-full max-w-[200px] mx-auto border-2 border-dashed border-primary/20 rounded-[2rem] flex flex-col items-center justify-center bg-gray-50 hover:bg-primary/5 transition-all cursor-pointer group">
              <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
              <span className="text-[10px] font-bold mt-2 text-muted-foreground group-hover:text-primary uppercase">Upload</span>
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card className="p-8 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Product Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mechanical Keyboard" className="h-11 rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="h-11 rounded-xl bg-gray-50/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Price (IDR)</Label>
                  <Input
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 1.500.000" className="h-11 rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0" className="h-11 rounded-xl bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product details..." className="min-h-[120px] rounded-xl bg-gray-50/50 p-4 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button onClick={handleSaveProduct} disabled={isSaving} className="flex-1 h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : view === 'edit' ? 'Update Product' : 'Save Product'}
                </Button>
                <Button variant="ghost" onClick={() => setView('list')} className="h-12 px-8 font-bold text-muted-foreground">Cancel</Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}