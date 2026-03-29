'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  MoreHorizontal
} from 'lucide-react';

// Data Dummy Penjualan
const SALES_DATA = [
  { id: 'ORD-001', customer: 'Budi Santoso', product: 'MacBook Pro M3', amount: '24.999.000', status: 'Completed', date: '2026-02-01' },
  { id: 'ORD-002', customer: 'Siti Aminah', product: 'iPhone 15 Pro', amount: '18.500.000', status: 'Pending', date: '2026-02-01' },
  { id: 'ORD-003', customer: 'Andi Wijaya', product: 'Accessories Bundle', amount: '1.200.000', status: 'Cancelled', date: '2026-01-31' },
  { id: 'ORD-004', customer: 'Rina Rose', product: 'iPad Air', amount: '10.999.000', status: 'Completed', date: '2026-01-31' },
];

export default function SalesMonitoringPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter pencarian
  const filteredSales = SALES_DATA.filter(s =>
    s.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 px-4 pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Monitoring</h1>
          <p className="text-muted-foreground text-sm mt-1">Pantau performa penjualan dan transaksi real-time.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" className="w-full sm:w-auto rounded-xl gap-2 font-bold h-11">
            <Calendar className="w-4 h-4" /> Last 30 Days
          </Button>
          <Button className="w-full sm:w-auto bg-primary text-white rounded-xl gap-2 font-bold h-11 px-6 shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-border shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</p>
              <h2 className="text-3xl font-black mt-1">Rp 55.698k</h2>
              <div className="flex items-center gap-1 text-green-600 text-xs font-bold mt-2">
                <ArrowUpRight className="w-3 h-3" /> +12.5%
                <span className="text-muted-foreground font-normal">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Orders Processed</p>
              <h2 className="text-3xl font-black mt-1">142</h2>
              <div className="flex items-center gap-1 text-green-600 text-xs font-bold mt-2">
                <ArrowUpRight className="w-3 h-3" /> +5.2%
                <span className="text-muted-foreground font-normal">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg. Order Value</p>
              <h2 className="text-3xl font-black mt-1">Rp 1.420k</h2>
              <div className="flex items-center gap-1 text-red-500 text-xs font-bold mt-2">
                <ArrowDownRight className="w-3 h-3" /> -2.1%
                <span className="text-muted-foreground font-normal">vs last month</span>
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
          <h3 className="font-bold text-lg">Recent Transactions</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-9 h-10 rounded-xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="overflow-hidden border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group text-sm">
                    <td className="px-6 py-4 font-mono font-medium text-xs text-primary">{sale.id}</td>
                    <td className="px-6 py-4 font-bold">{sale.customer}</td>
                    <td className="px-6 py-4 text-muted-foreground">{sale.product}</td>
                    <td className="px-6 py-4 font-bold text-foreground">Rp {sale.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sale.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        sale.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ANALYTICS PREVIEW AREA */}
      <Card className="p-8 border-border bg-white shadow-sm border-dashed border-2 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <h4 className="font-bold text-lg">Sales Chart Preview</h4>
        <p className="text-muted-foreground text-sm max-w-sm text-center">
          Area ini bisa kamu integrasikan dengan <strong>Recharts</strong> atau <strong>Chart.js</strong> untuk menampilkan grafik tren harian.
        </p>
      </Card>

    </div>
  );
}