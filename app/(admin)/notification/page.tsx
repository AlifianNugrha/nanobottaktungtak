'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Bell,
  CircleDollarSign,
  Zap,
  Info,
  CheckCheck,
  ChevronRight,
  Search,
  Loader2,
  Trash2,
  X
} from 'lucide-react';
import { getNotifications, markAllRead, deleteNotifications } from '@/app/actions/notification-actions';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    setIsLoading(true);
    const res = await getNotifications();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
    setIsLoading(false);
  };

  const handleMarkAllRead = async () => {
    const res = await markAllRead();
    if (res.success) {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'All') return notifications;
    if (activeTab === 'Unread') return notifications.filter(n => !n.isRead);
    if (activeTab === 'Sales') return notifications.filter(n => n.type === 'Sales');
    return notifications.filter(n => n.type === activeTab);
  }, [activeTab, notifications]);

  // Bulk Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredNotifications.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(iid => iid !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} notifications?`)) return;

    setIsDeleting(true);
    const res = await deleteNotifications(selectedIds);
    if (res.success) {
      setNotifications(notifications.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
    }
    setIsDeleting(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 px-4 sm:px-0">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-xs mt-1">Pusat aktivitas real-time sistem Anda.</p>
        </div>
        <div className="flex flex-col w-full sm:flex-row sm:w-auto gap-2 sm:items-center">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="w-full sm:w-auto h-10 rounded-xl px-5 text-xs font-bold shadow-lg"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Trash2 className="w-3.5 h-3.5 mr-2" />}
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button
            onClick={handleMarkAllRead}
            disabled={isLoading || notifications.filter(n => !n.isRead).length === 0}
            className="w-full sm:w-auto h-10 rounded-xl px-5 text-xs font-bold bg-[#1E90FF] text-white shadow-lg shadow-[#1E90FF]/20 disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-2" /> Mark All Read
          </Button>
        </div>
      </div>

      {/* TABS & TOOLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 w-full md:w-fit rounded-2xl border border-gray-200/50 backdrop-blur-sm overflow-x-auto scrollbar-hide">
          {['All', 'Unread', 'Sales', 'System', 'AI Bot'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedIds([]); }}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === tab
                ? 'bg-white text-[#1E90FF] shadow-sm scale-[1.02]'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab}
              {tab === 'Unread' && notifications.filter(n => !n.isRead).length > 0 && (
                <span className="ml-2 bg-[#1E90FF] text-white px-1.5 py-0.5 rounded-md text-[9px]">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Global Checkbox */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl">
            <Checkbox
              checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-xs font-bold cursor-pointer select-none">Select All</label>
          </div>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E90FF]" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => (
            <div key={n.id} className="group flex items-center gap-3">
              <div className={`transition-all duration-300 ${selectedIds.includes(n.id) ? 'opacity-100 w-auto' : 'opacity-0 w-0 -ml-2 group-hover:opacity-100 group-hover:w-auto group-hover:ml-0'}`}>
                <Checkbox
                  checked={selectedIds.includes(n.id)}
                  onCheckedChange={(checked) => handleSelectOne(n.id, checked as boolean)}
                />
              </div>

              <Card
                onClick={() => !selectedIds.length && handleSelectOne(n.id, !selectedIds.includes(n.id))} // Optional: Click card to select if not in selection mode, or whatever UX preference
                className={`flex-1 p-0 overflow-hidden border-none shadow-sm transition-all hover:translate-x-1 cursor-pointer ${selectedIds.includes(n.id) ? 'ring-2 ring-[#1E90FF] ring-offset-2' : ''} ${!n.isRead ? 'bg-white' : 'bg-gray-50/40 opacity-80'
                  }`}
              >
                <div className="flex items-stretch min-h-[60px] sm:min-h-[85px]">
                  <div className={`w-1 ${n.isRead ? 'bg-gray-200' :
                    n.type === 'Sales' ? 'bg-green-500' : 'bg-[#1E90FF]'
                    }`} />

                  <div className="flex-1 p-3 sm:p-5 flex items-center gap-3 sm:gap-5">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-gray-50' : 'bg-transparent'
                      }`}>
                      {n.type === 'Sales' ? <CircleDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /> :
                        n.type === 'System' ? <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> :
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E90FF]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${!n.isRead ? 'text-[#1E90FF]' : 'text-muted-foreground'}`}>
                          {n.type}
                        </span>
                        <span className="text-[9px] text-muted-foreground/60">• {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                      </div>
                      <h4 className={`text-[13px] font-bold truncate ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">{n.message}</p>
                    </div>

                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#1E90FF] animate-pulse" />}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this notification?')) {
                          deleteNotifications([n.id]).then(() => {
                            setNotifications(current => current.filter(item => item.id !== n.id));
                          })
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
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