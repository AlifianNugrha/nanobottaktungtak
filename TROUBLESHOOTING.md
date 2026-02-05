# 🔧 Kenapa Bot Masih Balas Default Message?

## ❌ Masalah yang Terjadi

Bot terus membalas dengan:
> "Terima kasih atas pesan Anda... Bot ini sedang aktif dan siap membantu 🤖"

Padahal sudah:
- ✅ Buat agent
- ✅ Buat bot
- ✅ Jalankan `fix-whatsapp.ts` berkali-kali

## 🔍 Akar Masalahnya

Ada **2 masalah utama**:

### 1. **WhatsApp Session Terputus**
```
Error: Connection Closed
```
Ini terlihat di terminal logs. WhatsApp session tidak aktif, jadi bot tidak bisa terima/kirim pesan dengan benar.

### 2. **Bot Tidak Terhubung ke Integration yang Aktif**
Setiap kali WhatsApp reconnect, integration baru dibuat dengan ID baru. Tapi bot masih terhubung ke integration ID yang lama.

## ✅ Solusi Permanen

### **Cara 1: Reconnect WhatsApp (Paling Mudah)**

1. **Hapus integration WhatsApp yang lama:**
   - Buka Dashboard → Integrations
   - Hapus semua WhatsApp integration yang ada

2. **Connect WhatsApp baru:**
   - Klik "Connect WhatsApp"
   - Scan QR code
   - **Bot akan otomatis terhubung!** (sudah diperbaiki)

3. **Test:**
   - Kirim pesan WhatsApp
   - Bot akan balas dengan AI! 🎉

### **Cara 2: Pakai Script (Jika Cara 1 Gagal)**

```bash
# 1. Jalankan script
npx tsx scripts/force-link-bots.ts

# 2. Restart dev server
# Ctrl+C untuk stop, lalu:
npm run dev

# 3. Test kirim pesan WhatsApp
```

## 🎯 Yang Sudah Diperbaiki

### 1. **Auto-Linking Bot**
Sekarang saat WhatsApp connect, bot dengan agent akan **otomatis terhubung**. Tidak perlu jalankan script manual lagi!

File: `app/api/whatsapp/session/route.ts`
```typescript
// Auto-link existing bots with agents to this integration
const botsWithAgents = await prisma.bot.findMany({
    where: {
        userId: user.id,
        agentId: { not: null },
        integrationId: null
    }
});

if (botsWithAgents.length > 0) {
    await prisma.bot.update({
        where: { id: botsWithAgents[0].id },
        data: { integrationId: integration.id }
    });
}
```

### 2. **Better Error Handling**
Sekarang ada logging yang lebih jelas untuk debug:
```
Looking for bot with sessionId: [ID]
Integration found: WhatsApp Bot
Bots found: 1
Bot found: wabot
Agent found: mieyama
Generating AI response for: [message]
AI response generated successfully
```

### 3. **API Key Validation**
Bot sekarang cek GROQ_API_KEY sebelum call API:
```typescript
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
    return 'Maaf, konfigurasi AI belum lengkap...';
}
```

## 📋 Checklist Sebelum Test

Pastikan semua ini sudah:

- [ ] **GROQ_API_KEY** ada di `.env`
- [ ] **Dev server running**: `npm run dev`
- [ ] **WhatsApp connected** (status: connected di dashboard)
- [ ] **Ada agent** yang sudah dibuat
- [ ] **Ada bot** dengan agent terhubung
- [ ] **Integration ID** sama dengan session ID yang aktif

## 🔍 Cara Cek Status

### Cek di Terminal:
Saat kirim pesan WhatsApp, harus muncul:
```
Received message from: [nomor]
Message: [pesan]
Looking for bot with sessionId: [ID]
Integration found: WhatsApp Bot
Bots found: 1  ← HARUS > 0
Bot found: [nama bot]
Agent found: [nama agent]
Generating AI response...
AI response generated successfully
```

### Jika "Bots found: 0":
Berarti bot belum terhubung. Solusi:
1. Hapus integration lama
2. Connect WhatsApp baru (auto-link akan jalan)
3. Atau jalankan: `npx tsx scripts/force-link-bots.ts`

## 🚨 Troubleshooting

### Bot masih balas default?
```bash
# 1. Cek logs di terminal
# Lihat apakah "Bots found: 0" atau "Bots found: 1"

# 2. Jika Bots found: 0
npx tsx scripts/force-link-bots.ts

# 3. Restart dev server
npm run dev

# 4. Test lagi
```

### Connection Closed error?
```bash
# WhatsApp session terputus
# Solusi: Reconnect WhatsApp
# 1. Dashboard → Integrations
# 2. Hapus WhatsApp integration lama
# 3. Connect WhatsApp baru
# 4. Scan QR code
```

### GROQ_API_KEY error?
```bash
# 1. Cek .env file
# Pastikan ada: GROQ_API_KEY=gsk_...

# 2. Restart dev server
npm run dev
```

## 🎉 Setelah Perbaikan

Sekarang Anda **TIDAK PERLU** jalankan script manual lagi!

**Workflow baru:**
1. Buat Agent di dashboard ✅
2. Buat Bot di dashboard ✅
3. Connect WhatsApp ✅
4. **Bot otomatis terhubung!** 🎉
5. Test kirim pesan → Bot balas dengan AI! 🤖

---

**TL;DR:**
1. Hapus integration WhatsApp lama
2. Connect WhatsApp baru
3. Bot otomatis terhubung
4. Test! 🚀
