'use client';

import { useState, useRef } from 'react';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/app/actions/product-actions';
import { useEffect } from 'react';
import { useLanguage } from '@/components/language-provider';
import imageCompression from 'browser-image-compression';

// Data Dummy Awal
const INITIAL_PRODUCTS: any[] = [];

const INITIAL_CATEGORIES = ['Electronics', 'Laptop', 'Smartphone', 'Accessories', 'General'];

export default function ProductManagerPage() {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [limit, setLimit] = useState(999);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State Kategori Baru
  const [newCatInput, setNewCatInput] = useState('');
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Import Supabase Client
  const { supabase } = require('@/lib/supabase-client');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // 1. Compress Image
      const options = {
        maxSizeMB: 0.5, // 500KB Max
        maxWidthOrHeight: 1200, // 1200px Max dimensions
        useWebWorker: true,
      };
      
      let finalFile: File = file;
      try {
        if (file.type.startsWith('image/')) {
          const compressedBlob = await imageCompression(file, options);
          finalFile = new File([compressedBlob], file.name, { type: compressedBlob.type });
          console.log(`[Compression] Original: ${(file.size/1024/1024).toFixed(2)} MB -> Compressed: ${(finalFile.size/1024/1024).toFixed(2)} MB`);
        }
      } catch (compErr) {
        console.warn('Image compression failed, using original.', compErr);
      }

      // 2. Upload to Supabase Storage (Bucket: 'products')
      const fileName = `${Date.now()}-${finalFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const { data, error } = await supabase
        .storage
        .from('products')
        .upload(fileName, finalFile);

      if (error) {
        console.error('Supabase Upload Error:', error);
        alert(t("Failed to upload image: ") + error.message);
        setIsUploading(false);
        return;
      }

      // 2. Get Public URL
      const { data: publicUrlData } = supabase
        .storage
        .from('products')
        .getPublicUrl(fileName);

      if (publicUrlData) {
        setFormData({ ...formData, image: publicUrlData.publicUrl });
      }

    } catch (err) {
      console.error(err);
      alert(t('Terjadi kesalahan saat upload.'));
    }
    setIsUploading(false);
  };

  // State Form Produk
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    category: 'General',
    stock: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await getProducts();
    if (res.success) {
      setProducts(res.data || []);
      // @ts-ignore
      setLimit(res.limit || 1);
    }
  };

  // --- LOGIKA PRODUK ---
  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) return alert(t("Name and Price are required!"));
    setIsSaving(true);

    const fData = new FormData();
    fData.append('name', formData.name);
    fData.append('price', formData.price);
    fData.append('category', formData.category);
    fData.append('stock', formData.stock);
    fData.append('description', formData.description);
    fData.append('image', formData.image);

    let res;
    if (view === 'edit') {
      res = await updateProduct(formData.id, fData);
    } else {
      res = await createProduct(fData);
    }

    if (res.success) {
      fetchProducts();
      setView('list');
      setFormData({ id: '', name: '', price: '', category: 'General', stock: '', description: '', image: '' });
    } else {
      alert(res.error || t("Failed to save product"));
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("Delete this product?"))) {
      const res = await deleteProduct(id);
      if (res.success) {
        fetchProducts();
      } else {
        alert(res.error || t("Failed to delete product"));
      }
    }
  };

  // --- LOGIKA KATEGORI ---
  const handleAddCategory = () => {
    if (newCatInput && !categories.includes(newCatInput)) {
      setCategories([...categories, newCatInput]);
      setNewCatInput('');
    }
  };

  const deleteCategory = (catToDelete: string) => {
    if (catToDelete === 'General') return alert(t("Category 'General' cannot be deleted."));
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
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {view === 'list' ? t('Product Catalog') : view === 'edit' ? t('Edit Product') : t('New Product')}
              </h1>
              {view === 'list' && (
                <>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${products.length >= limit ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                    {products.length} / {limit > 900 ? '∞' : limit} {t('Used')}
                  </span>
                  {products.length >= limit && (
                    <Link href="/dashboard/upgrade" className="ml-2 text-[10px] font-black text-[#1E90FF] uppercase tracking-wider hover:underline flex items-center gap-1 animate-pulse">
                      Upgrade to Pro <Sparkles className="w-3 h-3" />
                    </Link>
                  )}
                </>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{t('Manage your catalog and categories.')}</p>
          </div>
        </div>

        {view === 'list' && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* MODAL MANAGE CATEGORY */}
            <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto gap-2 h-11 px-5 font-bold rounded-xl border-border">
                  <Tags className="w-4 h-4" /> {t('Categories')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] rounded-3xl p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">{t('Manage Categories')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("New category name...")}
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      className="h-11 rounded-xl bg-gray-50"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <Button onClick={handleAddCategory} className="bg-[#1E90FF] text-white h-11 px-4 rounded-xl">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                    {categories.map(cat => (
                      <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-[#1E90FF]/20 transition-all">
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

            <Button
              onClick={() => setView('add')}
              disabled={products.length >= limit}
              className={`w-full sm:w-auto text-white gap-2 h-11 px-6 font-bold rounded-xl transition-colors ${products.length >= limit ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-[#1E90FF] hover:bg-[#187bcd]'}`}
            >
              {products.length >= limit ? t('Limit Reached') : <><Plus className="w-4 h-4" /> {t('Add Product')}</>}
            </Button>
          </div>
        )}
      </div>

      {view === 'list' ? (
        /* --- LIST VIEW --- */
        <div className="space-y-6">
          {products.length >= limit && limit < 100 && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between mb-6 relative overflow-hidden group">
              <div className="relative z-10 mb-4 md:mb-0">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1">{t('Unlock Unlimited Products! 🚀')}</h3>
                <p className="text-blue-100 text-sm font-medium opacity-90">{t('Upgrade to PRO plan to upload unlimited products and boost your sales.')}</p>
              </div>
              <Button onClick={() => window.location.href = '/dashboard/upgrade'} className="relative z-10 bg-white text-blue-600 font-bold hover:bg-gray-50 border-2 border-transparent hover:border-blue-200">
                {t('Upgrade Now ⚡')}
              </Button>
              {/* Decoration */}
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            </div>
          )}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("Search products...")}
              className="pl-10 h-11 rounded-xl bg-white border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
              products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((product) => (
                <Card key={product.id} className="group overflow-hidden border-border bg-white transition-colors hover:border-primary/30">
                  <div className="aspect-video bg-gray-50 flex items-center justify-center border-b border-border relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-10 h-10 text-muted-foreground/30" />
                    )}
                    <span className="absolute top-3 left-3 bg-white/95 text-[10px] font-bold px-2 py-1 rounded border border-border uppercase tracking-wider z-10">
                      {product.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                      <p className="font-bold text-primary">Rp {product.price}</p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{product.description || t('No description available.')}</p>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('Stock')}: {product.stock}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setFormData(product); setView('edit'); }} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">{t('No products found.')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('Start by adding a new product to your catalog.')}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- ADD/EDIT FORM --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-6 text-center space-y-4 shadow-sm h-fit">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t('Product Image')}</Label>
            <div className="aspect-square w-full max-w-[200px] mx-auto border-2 border-dashed border-primary/20 rounded-[2rem] flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative mb-4">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                  <Upload className="w-10 h-10 mb-2 opacity-20" />
                  <span className="text-[10px] font-bold uppercase opacity-50">{t('No Image Selected')}</span>
                </div>
              )}
            </div>

            {/* Hidden Input File */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />

            {/* Explicit Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-primary text-white font-bold rounded-xl"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('Uploading...')}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> {t('Choose Image')}
                  </>
                )}
              </Button>

              {formData.image && (
                <Button
                  variant="outline"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="w-full text-destructive hover:bg-destructive/10 border-destructive/20 font-bold rounded-xl"
                >
                  {t('Remove Image')}
                </Button>
              )}
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card className="p-8 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">{t('Product Name')}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mechanical Keyboard" className="h-11 rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">{t('Category')}</Label>
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
                  <Label className="text-xs font-bold uppercase">{t('Price (IDR)')}</Label>
                  <Input
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 1.500.000" className="h-11 rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">{t('Stock')}</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0" className="h-11 rounded-xl bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">{t('Description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("Product details...")} className="min-h-[120px] rounded-xl bg-gray-50/50 p-4 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button onClick={handleSaveProduct} disabled={isSaving} className="flex-1 h-12 bg-primary text-white font-bold rounded-xl">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : view === 'edit' ? t('Update Product') : t('Save Product')}
                </Button>
                <Button variant="ghost" onClick={() => setView('list')} className="h-12 px-8 font-bold text-muted-foreground">{t('Cancel')}</Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}