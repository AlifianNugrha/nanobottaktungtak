'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved) setLanguage(saved);
        setMounted(true);
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    // Simple dictionary
    const dictionary: Record<Language, Record<string, string>> = {
        en: {
            "Dashboard": "Dashboard",
            "Agent": "Agent",
            "Bot Builder": "Bot Builder",
            "Integration": "Integration",
            "Customers": "Customers",
            "Products": "Products",
            "Sales Monitoring": "Sales Monitoring",
            "Payments": "Payments",
            "AI Analytics": "AI Analytics",
            "Notifications": "Notifications",
            "Settings": "Settings",
            "Platform Dashboard": "Platform Dashboard",
            "Premium Access": "Premium Access",
            "Overview": "Overview",
            "Core": "Core",
            "Management": "Management",
            "Sales & Finance": "Sales & Finance",
            "Analytics": "Analytics",
            "System": "System",
            "Super Admin": "Super Admin",
            "Status": "Status",
            "FREE PLAN": "FREE PLAN",
            "PRO PLAN": "PRO PLAN",
            "Free Workspace": "Free Workspace",
            "Pro Workspace": "Pro Workspace",
            "Upgrade to Pro": "Upgrade to Pro",
            "Pro Feature Active": "Pro Feature Active",
            "Global Overview": "Global Overview",
            "Platform Stats": "Platform Stats",
            "All Users": "All Users",
            "Organizations": "Organizations",
            "Subscriptions": "Subscriptions",
            "Media Monitoring": "Media Monitoring",
            "Nodes Status": "Nodes Status",
            "Traffic Logs": "Traffic Logs",
            "Database Health": "Database Health",
            "System Settings": "System Settings",
            "Security & Auth": "Security & Auth",
            "Global Plugins": "Global Plugins"
        },
        id: {
            "Dashboard": "Dasbor",
            "Agent": "Agen",
            "Bot Builder": "Pembuat Bot",
            "Integration": "Integrasi",
            "Customers": "Pelanggan",
            "Products": "Produk",
            "Sales Monitoring": "Pantau Penjualan",
            "Payments": "Pembayaran",
            "AI Analytics": "Analitik AI",
            "Notifications": "Notifikasi",
            "Settings": "Pengaturan",
            "Platform Dashboard": "Dasbor Platform",
            "Premium Access": "Akses Premium",
            "Overview": "Ringkasan",
            "Core": "Inti",
            "Management": "Manajemen",
            "Sales & Finance": "Keuangan",
            "Analytics": "Analitik",
            "System": "Sistem",
            "Super Admin": "Super Admin",
            "Status": "Status",
            "FREE PLAN": "PAKET GRATIS",
            "PRO PLAN": "PAKET PRO",
            "Free Workspace": "Ruang Kerja Gratis",
            "Pro Workspace": "Ruang Kerja Pro",
            "Upgrade to Pro": "Upgrade ke Pro",
            "Pro Feature Active": "Fitur Pro Aktif",
            "Global Overview": "Ringkasan Global",
            "Platform Stats": "Statistik Platform",
            "All Users": "Semua Pengguna",
            "Organizations": "Organisasi",
            "Subscriptions": "Langganan",
            "Media Monitoring": "Pantauan Media",
            "Nodes Status": "Status Node",
            "Traffic Logs": "Log Trafik",
            "Database Health": "Kesehatan Database",
            "System Settings": "Pengaturan Sistem",
            "Security & Auth": "Keamanan & Autentikasi",
            "Global Plugins": "Plugin Global",

            // Inbox / Live Chat
            "Inbox": "Kotak Masuk",
            "Search contacts...": "Cari kontak...",
            "No conversations yet.": "Belum ada percakapan.",
            "No messages yet": "Belum ada pesan",
            "Bot Paused (Manual Mode)": "Bot Dijeda (Mode Manual)",
            "Bot Active": "Bot Aktif",
            "Resume Bot": "Lanjutkan Bot",
            "Pause Bot": "Jeda Bot",
            "Bot is paused. You are replying manually.": "Bot sedang dijeda. Anda membalas secara manual.",
            "Bot is active. Manual reply will override bot.": "Bot sedang aktif. Balasan manual akan meng-override bot.",
            "Type a reply...": "Ketik balasan...",
            "Select a conversation to start chatting": "Pilih percakapan untuk memulai obrolan",
            "Failed to send message": "Gagal mengirim pesan",
            "Bot paused": "Bot dijeda",
            "Bot activated": "Bot diaktifkan",
            "Failed to change bot status": "Gagal mengubah status bot",
            "Back": "Kembali",

            // Campaign / Broadcast
            "Total Campaign": "Total Kampanye",
            "Create New Campaign": "Buat Kampanye Baru",
            "Create New Broadcast": "Buat Broadcast Baru",
            "Start WhatsApp marketing campaign.": "Mulai kampanye marketing WhatsApp.",
            "Campaign Name": "Nama Kampanye",
            "Example: Ramadhan Promo": "Contoh: Promo Ramadhan",
            "Message Template": "Template Pesan",
            "Use {{name}} to greet customer by name automatically.": "Gunakan {{name}} untuk menyapa nama customer secara otomatis.",
            "Cancel": "Batal",
            "Processing...": "Memproses...",
            "Create Draft": "Buat Draft",
            "Campaign created successfully!": "Kampanye berhasil dibuat!",
            "Recipients": "Penerima"
        }
    };

    const t = (key: string) => {
        if (!mounted) return key; // Return key initial render to avoid mismatch if needed, or default
        return dictionary[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
