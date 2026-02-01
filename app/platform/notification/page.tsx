'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CircleDollarSign,
  Zap,
  Info,
  CheckCheck,
  ChevronRight,
  Search
} from 'lucide-react';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'Sales', title: 'New Order #882', desc: 'Dana Rp 1.200.000 masuk via QRIS', time: 'Just now', unread: true },
    { id: 2, type: 'System', title: 'Server Healthy', desc: 'Integrasi Midtrans berjalan optimal', time: '12m ago', unread: true },
    { id: 3, type: 'AI Bot', title: 'Handover Required', desc: 'User "Andi" butuh bantuan admin', time: '1h ago', unread: false },
    { id: 4, type: 'Sales', title: 'Payment Success #881', desc: 'Dana Rp 450.000 masuk via VA BCA', time: '3h ago', unread: false },
  ]);

  const [activeTab, setActiveTab] = useState('All');

  // Logic Filter Sales & Unread
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'All') return notifications;
    if (activeTab === 'Unread') return notifications.filter(n => n.unread);
    if (activeTab === 'Sales') return notifications.filter(n => n.type === 'Sales');
    return notifications.filter(n => n.type === activeTab);
  }, [activeTab, notifications]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">

      {/* HEADER: Judul Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-xs mt-1">Pusat aktivitas real-time sistem Anda.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
            className="h-10 rounded-xl px-5 text-xs font-bold bg-primary text-white shadow-lg shadow-primary/20"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-2" /> Mark All Read
          </Button>
        </div>
      </div>

      {/* --- FILTER KATEGORI (DI ATAS / HORIZONTAL) --- */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 w-fit rounded-2xl border border-gray-200/50 backdrop-blur-sm">
        {['All', 'Unread', 'Sales', 'System', 'AI Bot'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === tab
              ? 'bg-white text-primary shadow-sm scale-[1.02]'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab}
            {/* Badge angka untuk Unread */}
            {tab === 'Unread' && notifications.filter(n => n.unread).length > 0 && (
              <span className="ml-2 bg-primary text-white px-1.5 py-0.5 rounded-md text-[9px]">
                {notifications.filter(n => n.unread).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* --- LIST NOTIFIKASI (VERTIKAL) --- */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => (
            <Card
              key={n.id}
              className={`p-0 overflow-hidden border-none shadow-sm transition-all hover:translate-x-1 cursor-pointer ${n.unread ? 'bg-white' : 'bg-gray-50/40 opacity-80'
                }`}
            >
              <div className="flex items-stretch min-h-[85px]">
                {/* Status Indicator Bar */}
                <div className={`w-1 ${!n.unread ? 'bg-gray-200' :
                  n.type === 'Sales' ? 'bg-green-500' : 'bg-primary'
                  }`} />

                <div className="flex-1 p-5 flex items-center gap-5">
                  {/* Icon bulat minimalis */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.unread ? 'bg-gray-50' : 'bg-transparent'
                    }`}>
                    {n.type === 'Sales' ? <CircleDollarSign className="w-5 h-5 text-green-600" /> :
                      n.type === 'System' ? <Info className="w-5 h-5 text-blue-600" /> :
                        <Zap className="w-5 h-5 text-orange-600" />}
                  </div>

                  {/* Teks Konten */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${n.unread ? 'text-primary' : 'text-muted-foreground'}`}>
                        {n.type}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60">• {n.time}</span>
                    </div>
                    <h4 className={`text-[13px] font-bold truncate ${n.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">{n.desc}</p>
                  </div>

                  {/* Titik Unread */}
                  {n.unread && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}

                  <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/20">
            <Bell className="w-10 h-10 text-gray-200 mb-2" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Kategori ini kosong</p>
          </div>
        )}
      </div>

    </div>
  );
}