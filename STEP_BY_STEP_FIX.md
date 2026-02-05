# 🚀 STEP-BY-STEP: Fix WhatsApp Bot (Sekali Jalan!)

## 📋 Persiapan

Pastikan:
- ✅ Dev server running: `npm run dev`
- ✅ GROQ_API_KEY ada di `.env`
- ✅ Ada Agent yang sudah dibuat
- ✅ Ada Bot yang sudah dibuat

---

## 🎯 LANGKAH-LANGKAH

### **Step 1: Clean Up Integration Lama**

Jalankan script ini untuk hapus integration lama:

```bash
npx tsx scripts/clean-setup.ts
```

Script ini akan:
- ✅ Hapus semua WhatsApp integration lama
- ✅ Unlink bot dari integration lama
- ✅ Siapkan database untuk fresh start

**Output yang diharapkan:**
```
🧹 CLEANING OLD WHATSAPP INTEGRATIONS...
Found 1 WhatsApp integration(s):
1. WhatsApp Bot (connected)
   ID: c4703383-342d-4d06-821...

🗑️  Deleting old integrations...
✅ Deleted 1 integration(s)

🔗 Unlinking bots from deleted integrations...
✅ Unlinked 1 bot(s)

🎉 CLEANUP COMPLETE!
```

---

### **Step 2: Connect WhatsApp Baru**

#### **Opsi A: Via Dashboard (Recommended)**

1. **Buka browser** dan pergi ke dashboard
2. **Klik menu "Integrations"** (atau "Integration" di sidebar)
3. **Klik tombol "Connect WhatsApp"** atau "Add Integration"
4. **Scan QR code** yang muncul dengan WhatsApp Anda
5. **Tunggu sampai status berubah jadi "Connected"**

✨ **Bot akan OTOMATIS terhubung!** (tidak perlu script manual)

#### **Opsi B: Via API (Advanced)**

Jika tidak ada UI untuk connect WhatsApp, buat file test:

```bash
# Buat file test-connect.ts
npx tsx scripts/test-connect.ts
```

---

### **Step 3: Verify Setup**

Jalankan script untuk cek apakah semua sudah benar:

```bash
npx tsx scripts/show-integrations.ts
```

**Output yang diharapkan:**
```
📋 WHATSAPP INTEGRATIONS:

1. WhatsApp Bot
   ID: [new-id]
   Status: connected
   Bots linked: 1
     - wabot (Agent: mieyama)
```

Pastikan:
- ✅ Status: **connected**
- ✅ Bots linked: **> 0**
- ✅ Agent ada

---

### **Step 4: Test Bot**

1. **Kirim pesan WhatsApp** ke nomor yang sudah di-scan
2. **Cek terminal logs**, harus muncul:
   ```
   Received message from: [nomor]
   Message: [pesan Anda]
   Looking for bot with sessionId: [ID]
   Integration found: WhatsApp Bot
   Bots found: 1  ← HARUS > 0!
   Bot found: wabot
   Agent found: mieyama
   Generating AI response for: [pesan]
   Using agent: mieyama
   AI response generated successfully
   ```

3. **Bot akan balas dengan AI!** 🎉

---

## 🔍 Troubleshooting

### ❌ Bot masih balas default message?

**Cek logs di terminal:**

```bash
# Jika muncul: "Bots found: 0"
# Berarti bot belum terhubung

# Solusi:
npx tsx scripts/force-link-bots.ts
```

### ❌ Connection Closed error?

```bash
# WhatsApp session terputus
# Solusi: Reconnect WhatsApp

# 1. Clean up
npx tsx scripts/clean-setup.ts

# 2. Connect WhatsApp baru dari dashboard
# 3. Scan QR code
```

### ❌ GROQ_API_KEY error?

```bash
# Cek .env file
# Pastikan ada: GROQ_API_KEY=gsk_...

# Restart dev server:
# Ctrl+C untuk stop
npm run dev
```

### ❌ "No bot with agent found"?

```bash
# Buat bot baru dari dashboard:
# 1. Dashboard → Bots → Create Bot
# 2. Pilih Agent yang sudah ada
# 3. Save

# Bot akan auto-link ke integration!
```

---

## 📊 Quick Commands

```bash
# Cek status integration
npx tsx scripts/show-integrations.ts

# Clean up integration lama
npx tsx scripts/clean-setup.ts

# Force link bot ke integration (jika perlu)
npx tsx scripts/force-link-bots.ts

# Debug session
npx tsx scripts/debug-session.ts

# Restart dev server
npm run dev
```

---

## ✅ Checklist Akhir

Setelah semua langkah, pastikan:

- [ ] Integration status: **connected**
- [ ] Bots linked: **> 0**
- [ ] Agent terhubung
- [ ] GROQ_API_KEY valid
- [ ] Dev server running
- [ ] Terminal logs menunjukkan "Bot found" dan "Agent found"
- [ ] Bot balas dengan AI response (bukan default message)

---

## 🎉 Selesai!

Sekarang bot Anda:
- ✅ Otomatis terhubung saat WhatsApp connect
- ✅ Tidak perlu jalankan script manual
- ✅ Balas dengan AI yang intelligent
- ✅ Siap digunakan!

**Workflow ke depan:**
1. Buat Agent baru (jika perlu)
2. Buat Bot baru (jika perlu)
3. Connect WhatsApp
4. **Bot otomatis terhubung!** ✨
5. Test dan enjoy! 🚀

---

## 📞 Need Help?

Jika masih ada masalah:
1. Cek terminal logs untuk error detail
2. Jalankan `npx tsx scripts/debug-session.ts`
3. Baca `TROUBLESHOOTING.md` untuk solusi lengkap

**Happy chatting with your AI bot! 🤖💬**
