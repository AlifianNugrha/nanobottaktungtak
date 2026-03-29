'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendManualMessage, toggleBotStatus } from '@/app/actions/inbox-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Phone, MoreVertical, PauseCircle, PlayCircle, Bot, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '@/components/language-provider';

function formatWhatsAppNumber(jid: string) {
    if (!jid) return 'Unknown';
    // Hapus domain (@s.whatsapp.net, @lid, @newsletter, etc)
    let num = jid.split('@')[0];
    
    // Jika tidak mengandung huruf (murni angka nomor HP)
    if (/^\d+$/.test(num)) {
        if (num.startsWith('62')) {
            // Format Indo: +62 8xx-xxxx-xxxx
            return '+' + num.slice(0, 2) + ' ' + num.slice(2, 5) + '-' + num.slice(5, 9) + '-' + num.slice(9);
        }
        return '+' + num; // Negara lain
    }
    
    return num; // Untuk JID aneh seperti username
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface Conversation {
    id: string;
    contactNumber: string;
    contactName: string | null;
    messages: any; // Prisma Json
    isBotPaused: boolean;
    lastMessage: string | null;
    updatedAt: Date;
    integration: {
        name: string;
        platform: string;
    };
    unreadCount: number;
}

export function InboxClient({ initialConversations, userId }: { initialConversations: any[], userId: string }) {
    const { t } = useLanguage();
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    const selectedConversation = conversations.find(c => c.id === selectedId);

    const filteredConversations = conversations.filter(conv => {
        const displayName = conv.contactName || formatWhatsAppNumber(conv.contactNumber);
        const q = searchQuery.toLowerCase();
        return displayName.toLowerCase().includes(q) || 
            conv.contactNumber.toLowerCase().includes(q) || 
            (conv.lastMessage && conv.lastMessage.toLowerCase().includes(q));
    });

    // Auto-scroll to bottom of chat
    useEffect(() => {
        setMounted(true);
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedId, selectedConversation?.messages]);

    // Polling simulation for Real-time update (naive approach)
    // In production, use Pusher / Socket.io / Supabase Realtime
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
            // Note: This refresh is heavy. Ideally we fetch data silently via an API handler.
            // keeping it simple for now. 
        }, 5000);

        return () => clearInterval(interval);
    }, [router]);

    // Sync props to state on refresh
    useEffect(() => {
        setConversations(initialConversations);
    }, [initialConversations]);


    async function handleSend() {
        if (!messageInput.trim() || !selectedId) return;

        const currentMsg = messageInput;
        setMessageInput(''); // Optimistic clear
        setIsSending(true);

        const result = await sendManualMessage(selectedId, currentMsg);

        if (result.success) {
            // Optimistic update of local state
            setConversations(prev => prev.map(c => {
                if (c.id === selectedId) {
                    const newMsgs = [...(c.messages as Message[]), {
                        role: 'assistant',
                        content: currentMsg,
                        timestamp: new Date().toISOString()
                    }];
                    return {
                        ...c,
                        messages: newMsgs,
                        lastMessage: currentMsg,
                        updatedAt: new Date()
                    };
                }
                return c;
            }));
        } else {
            toast.error(t('Failed to send message'));
            setMessageInput(currentMsg); // Revert
        }
        setIsSending(false);
    }

    async function handleToggleBot() {
        if (!selectedId || !selectedConversation) return;
        const newPaused = !selectedConversation.isBotPaused;
        
        // Optimistic UI update
        setConversations(prev => prev.map(c => 
            c.id === selectedId ? { ...c, isBotPaused: newPaused } : c
        ));

        const result = await toggleBotStatus(selectedId, newPaused);
        if (result.success) {
            toast.success(newPaused ? t('Bot paused. You can now reply manually.') : t('Bot resumed. AI will respond automatically.'));
        } else {
            // Revert on failure
            setConversations(prev => prev.map(c => 
                c.id === selectedId ? { ...c, isBotPaused: !newPaused } : c
            ));
            toast.error(t('Failed to toggle bot status'));
        }
    }

    return (
        <div className="flex w-full h-full bg-white border-0 md:border border-slate-200 shadow-none md:shadow-sm rounded-none md:rounded-xl overflow-hidden m-0">

            {/* LEFT: Contact List */}
            <div className={`w-full md:w-80 flex flex-col border-r border-slate-200 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-bold text-lg mb-4">{t('Inbox')}</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder={t('Search contacts...')} 
                            className="pl-9 bg-white" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="divide-y divide-slate-100">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                {t('No conversations yet.')}
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedId(conv.id)}
                                    className={cn(
                                        "p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-3",
                                        selectedId === conv.id ? "bg-blue-50/60 border-l-4 border-[#1E90FF]" : "border-l-4 border-transparent"
                                    )}
                                >
                                    <Avatar>
                                        <AvatarFallback className="bg-[#1E90FF]/10 text-[#1E90FF] font-bold text-xs uppercase">
                                            {(conv.contactName || conv.contactNumber.split('@')[0]).slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-sm truncate">
                                                {conv.contactName || formatWhatsAppNumber(conv.contactNumber)}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {mounted ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate line-clamp-1">
                                            {conv.lastMessage || t('No messages yet')}
                                        </p>
                                    </div>
                                    {conv.isBotPaused && (
                                        <PauseCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: Chat Window */}
            {selectedConversation ? (
                <div className={`flex-1 flex flex-col ${selectedId ? 'flex' : 'hidden md:flex'}`}>

                    {/* Header Chat */}
                    <div className="h-16 border-b border-slate-200 flex items-center justify-between px-2 sm:px-6 bg-white shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setSelectedId(null)}>
                                <span className="sr-only">{t('Back')}</span>
                                ⬅
                            </Button>
                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs uppercase">
                                    {(selectedConversation.contactName || selectedConversation.contactNumber.split('@')[0]).slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-sm truncate w-full">
                                    {selectedConversation.contactName || formatWhatsAppNumber(selectedConversation.contactNumber)}
                                </h3>
                                <div className="flex items-center gap-1.5 truncate">
                                    <span className={cn("w-2 h-2 rounded-full shrink-0", selectedConversation.isBotPaused ? "bg-amber-500" : "bg-green-500")} />
                                    <span className="text-[10px] text-slate-500 font-medium truncate">
                                        {selectedConversation.isBotPaused ? t('Bot Paused (Manual Mode)') : t('Bot Active')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn("gap-1 sm:gap-2 text-xs", selectedConversation.isBotPaused ? "text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border-green-200" : "text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200")}
                                onClick={handleToggleBot}
                            >
                                {selectedConversation.isBotPaused ? (
                                    <>
                                        <PlayCircle className="w-3.5 h-3.5 shrink-0" /> <span className="hidden sm:inline">{t('Resume Bot')}</span><span className="sm:hidden">Resume</span>
                                    </>
                                ) : (
                                    <>
                                        <PauseCircle className="w-3.5 h-3.5 shrink-0" /> <span className="hidden sm:inline">{t('Pause Bot')}</span><span className="sm:hidden">Pause</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-4 scroll-smooth" ref={scrollRef}>
                        {((selectedConversation.messages as any[]) || []).map((msg, idx) => {
                            const isUser = msg.role === 'user';
                            return (
                                <div key={idx} className={cn("flex w-full", isUser ? "justify-start" : "justify-end")}>
                                    <div className={cn(
                                        "max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words overflow-hidden",
                                        isUser ? "bg-white border border-slate-100 text-slate-800 rounded-bl-sm" : "bg-[#1E90FF] text-white rounded-br-sm"
                                    )}>
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                        <span className={cn("text-[9px] block mt-1 opacity-70", isUser ? "text-right" : "text-left")}>
                                            {mounted ? new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                        {selectedConversation.isBotPaused ? (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 p-2 rounded-lg text-xs text-amber-700 mb-2">
                                <PauseCircle className="w-3 h-3" />
                                {t('Bot is paused. You are replying manually.')}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-2 rounded-lg text-xs text-blue-700 mb-2">
                                <Bot className="w-3 h-3" />
                                {t('Bot is active. Manual reply will override bot.')}
                            </div>
                        )}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                placeholder={t('Type a reply...')}
                                className="flex-1 bg-slate-50"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                            />
                            <Button type="submit" disabled={isSending || !messageInput.trim()} className="bg-[#1E90FF] hover:bg-[#187bcd] text-white w-10 h-10 p-0 rounded-lg shrink-0">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>

                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50/50 flex-col text-slate-400">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-10 h-10 opacity-50" />
                    </div>
                    <p>{t('Select a conversation to start chatting')}</p>
                </div>
            )}
        </div>
    );
}
