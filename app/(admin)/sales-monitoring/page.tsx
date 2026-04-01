'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  Calendar,
  MoreHorizontal,
  Plus,
  Loader2,
  Trash2,
  RefreshCcw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSales, getSalesStats, createSale, deleteSale } from '@/app/actions/sales-actions';
import { useLanguage } from '@/components/language-provider';

export default function SalesMonitoringPage() {
  const { t } = useLanguage();
  const [sales, setSales] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form State
  const [newSale, setNewSale] = useState({
    customerName: '',
    productName: '',
    amount: '',
    status: 'Completed'
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [salesRes, statsRes] = await Promise.all([
      getSales(),
      getSalesStats()
    ]);

    if (salesRes.success) {
      setSales(salesRes.data || []);
    }

    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data);
    }
    setIsLoading(false);
  };

  const handleCreateSale = async () => {
    if (!newSale.customerName || !newSale.productName || !newSale.amount) {
      return alert(t("Please fill all fields"));
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append('customerName', newSale.customerName);
    formData.append('productName', newSale.productName);
    formData.append('amount', newSale.amount);
    formData.append('status', newSale.status);

    const res = await createSale(formData);

    setIsSaving(false);
    if (res.success) {
      setIsAddOpen(false);
      setNewSale({ customerName: '', productName: '', amount: '', status: 'Completed' });
      fetchData();
    } else {
      alert(t("Failed to create sale"));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("Delete this transaction?"))) {
      await deleteSale(id);
      fetchData();
    }
  };

  const filteredSales = sales.filter(s =>
    s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (!mounted) return <div className="p-8 text-center text-slate-500">{t('Loading data...')}</div>;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 px-4 pb-20 animate-in fade-in duration-500 font-jakarta">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Sales Monitoring')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('Real-time transaction data from database.')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full sm:w-auto bg-[#1E90FF] text-white rounded-xl gap-2 font-bold h-11 px-6 shadow-lg shadow-[#1E90FF]/20 hover:bg-[#187bcd]"
                suppressHydrationWarning
              >
                <Plus className="w-4 h-4" /> {t('Add Transaction')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 font-jakarta">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{t('New Transaction')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold text-muted-foreground">{t('Customer Name')}</Label>
                  <Input
                    value={newSale.customerName}
                    onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="h-11 rounded-xl bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold text-muted-foreground">{t('Product')}</Label>
                  <Input
                    value={newSale.productName}
                    onChange={(e) => setNewSale({ ...newSale, productName: e.target.value })}
                    placeholder="e.g. Premium Plan"
                    className="h-11 rounded-xl bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">{t('Amount (IDR)')}</Label>
                    <Input
                      type="number"
                      value={newSale.amount}
                      onChange={(e) => setNewSale({ ...newSale, amount: e.target.value })}
                      placeholder="0"
                      className="h-11 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">{t('Status')}</Label>
                    <Select value={newSale.status} onValueChange={(v) => setNewSale({ ...newSale, status: v })}>
                      <SelectTrigger className="h-11 rounded-xl bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Completed">{t('Completed')}</SelectItem>
                        <SelectItem value="Pending">{t('Pending')}</SelectItem>
                        <SelectItem value="Cancelled">{t('Cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">{t('Cancel')}</Button>
                <Button onClick={handleCreateSale} disabled={isSaving} className="bg-[#1E90FF] text-white rounded-xl font-bold px-6">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('Save Transaction')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon" onClick={fetchData} className="rounded-xl h-11 w-full sm:w-11" title={t("Refresh Data")}>
            <RefreshCcw className={`w-4 h-4 mr-2 sm:mr-0 ${isLoading ? 'animate-spin' : ''}`} /> <span className="sm:hidden">{t('Refresh Data')}</span>
          </Button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-border shadow-sm relative overflow-hidden group hover:border-[#1E90FF]/30 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('Total Revenue')}</p>
              <h2 className="text-3xl font-black mt-1">{formatIDR(stats.totalRevenue)}</h2>
              <div className="flex items-center gap-1 text-green-600 text-xs font-bold mt-2">
                <ArrowUpRight className="w-3 h-3" /> {t('Real-time')}
              </div>
            </div>
            <div className="w-12 h-12 bg-[#1E90FF]/10 rounded-2xl flex items-center justify-center text-[#1E90FF]">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-border shadow-sm group hover:border-blue-400 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('Orders Processed')}</p>
              <h2 className="text-3xl font-black mt-1">{stats.totalOrders}</h2>
              <div className="flex items-center gap-1 text-green-600 text-xs font-bold mt-2">
                <ArrowUpRight className="w-3 h-3" /> {t('Updated')}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-border shadow-sm group hover:border-orange-400 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('Avg. Order Value')}</p>
              <h2 className="text-3xl font-black mt-1">{formatIDR(stats.avgOrderValue)}</h2>
              <div className="flex items-center gap-1 text-muted-foreground text-xs font-bold mt-2">
                <TrendingUp className="w-3 h-3" /> {t('Calculated')}
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg">{t('Recent Transactions')}</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("Search orders...")}
              className="pl-9 h-10 rounded-xl bg-white border-border focus:ring-[#1E90FF]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="overflow-hidden border-border bg-white shadow-sm min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">{t('Order ID')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">{t('Date')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">{t('Customer')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">{t('Product')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">{t('Amount')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">{t('Status')}</th>
                  <th className="px-6 py-4 text-right">{t('Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#1E90FF]" />
                      {t('Loading data...')}
                    </td>
                  </tr>
                ) : filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group text-sm">
                      <td className="px-6 py-4 font-mono font-medium text-xs text-primary truncate max-w-[100px]" title={sale.id}>
                        {sale.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {sale.date}
                      </td>
                      <td className="px-6 py-4 font-bold">{sale.customerName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{sale.productName}</td>
                      <td className="px-6 py-4 font-bold text-foreground">{formatIDR(Number(sale.amount))}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sale.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          sale.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {t(sale.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      {t('No sales data found.')} <br />
                      <span className="text-xs cursor-pointer text-[#1E90FF] hover:underline" onClick={() => setIsAddOpen(true)}>{t('Add your first transaction')}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}