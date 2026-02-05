'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MoreVertical,
  Trash2,
  Settings2,
  ArrowLeft,
  Loader2,
  Calendar,
  UserPlus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/app/actions/customer-actions';
import { format } from 'date-fns';

export default function CustomerPage() {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State Form
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    status: 'Lead'
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    const res = await getCustomers();
    if (res.success && res.data) {
      setCustomers(res.data);
    } else if (res.error === "Pro subscription required") {
      window.location.href = '/dashboard/upgrade';
      return;
    }
    setIsLoading(false);
  };

  // --- LOGIKA ---
  const handleSave = async () => {
    if (!formData.name) return alert("Nama wajib diisi!");
    setIsSaving(true);

    let res;
    if (view === 'edit') {
      res = await updateCustomer(formData.id, formData);
    } else {
      res = await createCustomer(formData);
    }

    setIsSaving(false);

    if (res.success) {
      setView('list');
      loadCustomers(); // Reload data
    } else {
      alert("Gagal menyimpan: " + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus data pelanggan ini?')) {
      const res = await deleteCustomer(id);
      if (res.success) {
        loadCustomers();
      } else {
        alert("Gagal menghapus");
      }
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 px-4 pb-20">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          {view !== 'list' && (
            <Button variant="outline" size="icon" onClick={() => setView('list')} className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {view === 'list' ? 'Customers' : view === 'edit' ? 'Edit Profile' : 'New Customer'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {view === 'list' ? 'Kelola database dan interaksi pelanggan Anda.' : 'Tambahkan informasi detail pelanggan baru.'}
            </p>
          </div>
        </div>

        {view === 'list' && (
          <Button onClick={() => { setFormData({ id: '', name: '', email: '', phone: '', status: 'Lead' }); setView('add'); }} className="bg-[#1E90FF] hover:bg-[#187bcd] text-white gap-2 h-11 px-6 font-bold shadow-lg shadow-[#1E90FF]/20 rounded-xl">
            <UserPlus className="w-4 h-4" /> Add Customer
          </Button>
        )}
      </div>

      {view === 'list' ? (
        /* --- LIST VIEW --- */
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center gap-4 bg-white border-border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 bg-white border-border shadow-sm">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Active Leads</p>
                <p className="text-2xl font-bold">{customers.filter(c => c.status === 'Active').length}</p>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              className="pl-10 h-11 rounded-xl bg-white border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Customer Table/List */}
          <Card className="overflow-hidden border-border shadow-sm bg-white min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#1E90FF]" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full py-20 text-muted-foreground">
                <Users className="w-10 h-10 mb-2 opacity-20" />
                <p>Belum ada data pelanggan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">Contact</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">Joined Date</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#1E90FF] border border-border">
                              {c.name.charAt(0)}
                            </div>
                            <span className="font-bold text-sm">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" /> {c.email || '-'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" /> {c.phone || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${c.status === 'Active' ? 'bg-green-100 text-green-700' :
                            c.status === 'Lead' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                          {format(new Date(c.createdAt), 'dd MMM yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => { setFormData(c); setView('edit'); }} className="h-8 w-8 text-muted-foreground hover:text-[#1E90FF]">
                              <Settings2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* --- ADD/EDIT FORM --- */
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-8 space-y-6 shadow-sm border-border">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe" className="h-11 rounded-xl bg-gray-50"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Email Address</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com" className="h-11 rounded-xl bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812..." className="h-11 rounded-xl bg-gray-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Customer Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead (Prospect)</SelectItem>
                    <SelectItem value="Active">Active (Customer)</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-12 bg-[#1E90FF] hover:bg-[#187bcd] text-white font-bold rounded-xl shadow-lg shadow-[#1E90FF]/20">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : view === 'edit' ? 'Update Profile' : 'Add to Database'}
              </Button>
              <Button variant="ghost" onClick={() => setView('list')} className="h-12 px-8 font-bold text-muted-foreground">Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Komponen Check sederhana untuk statistik
function Check(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}