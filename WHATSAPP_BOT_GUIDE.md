# WhatsApp Bot Auto-Reply Guide

## ✅ Fitur yang Sudah Ditambahkan

Bot WhatsApp Anda sekarang sudah bisa **membalas chat otomatis**! 🎉

### Cara Kerja:

1. **Message Handler Aktif**
   - Bot sekarang mendengarkan semua pesan masuk melalui event `messages.upsert`
   - Mengabaikan pesan dari bot sendiri (fromMe)
   - Mengabaikan pesan tanpa teks (gambar/video saja)

2. **Dua Mode Balasan:**

   **Mode 1: Dengan AI Agent (Rekomendasi)**
   - Jika bot terhubung dengan Agent AI, bot akan menggunakan Groq API
   - Respons disesuaikan dengan konfigurasi agent (personality, role, dll)
   - Menggunakan model: `llama-3.3-70b-versatile` (default)

   **Mode 2: Auto-Reply Sederhana**
   - Jika tidak ada agent terkonfigurasi, bot akan membalas dengan pesan default
   - Format: "Terima kasih atas pesan Anda: [pesan user]. Bot ini sedang aktif dan siap membantu! 🤖"

## 🔧 Cara Menggunakan

### 1. Hubungkan WhatsApp
```
1. Buka dashboard admin
2. Pergi ke halaman Integrations
3. Klik "Connect WhatsApp"
4. Scan QR code dengan WhatsApp Anda
```

### 2. Buat Agent AI (Opsional tapi Direkomendasikan)
```
1. Pergi ke halaman Agents
2. Klik "Create New Agent"
3. Isi:
   - Name: Nama bot Anda
   - Description: Deskripsi peran bot
   - System Prompt: Instruksi untuk AI
   - Model: llama-3.3-70b-versatile (default)
   - Temperature: 0.7 (kreativitas)
   - Max Tokens: 1024 (panjang respons)
```

### 3. Hubungkan Bot dengan Agent
```
1. Pergi ke halaman Bots
2. Klik "Create Bot" atau edit bot yang ada
3. Pilih Integration: WhatsApp yang sudah terhubung
4. Pilih Agent: Agent AI yang sudah dibuat
5. Save
```

### 4. Test Bot
```
1. Kirim pesan WhatsApp ke nomor yang terhubung
2. Bot akan otomatis membalas!
```

## 📝 Contoh Konfigurasi Agent

### Customer Service Bot
```json
{
  "name": "CS Nexora",
  "description": "Customer service assistant untuk Nexora",
  "systemPrompt": "Anda adalah customer service Nexora yang ramah dan profesional. Bantu pelanggan dengan pertanyaan mereka tentang produk dan layanan kami. Selalu sopan dan informatif.",
  "model": "llama-3.3-70b-versatile",
  "temperature": 0.7,
  "maxTokens": 1024
}
```

### Sales Bot
```json
{
  "name": "Sales Bot",
  "description": "Sales assistant untuk closing deals",
  "systemPrompt": "Anda adalah sales assistant yang persuasif namun tidak agresif. Fokus pada kebutuhan customer dan tawarkan solusi yang tepat. Gunakan bahasa yang friendly dan engaging.",
  "model": "llama-3.3-70b-versatile",
  "temperature": 0.8,
  "maxTokens": 1024
}
```

## 🔍 Monitoring & Debugging

### Cek Logs di Terminal
Bot akan menampilkan log setiap kali menerima pesan:
```
Received message from: 6281234567890@s.whatsapp.net
Message: Halo, apakah produk X tersedia?
```

### Error Handling
- Jika Groq API error, bot akan membalas dengan pesan error yang sopan
- Jika database error, bot akan tetap membalas dengan default message
- Semua error di-log ke console untuk debugging

## ⚙️ Environment Variables

Pastikan file `.env` Anda memiliki:
```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
```

## 🚀 Tips untuk Performa Optimal

1. **Gunakan Agent AI** untuk respons yang lebih natural dan kontekstual
2. **Atur temperature** sesuai kebutuhan:
   - 0.3-0.5: Konsisten, formal (customer service)
   - 0.6-0.8: Balanced (general purpose)
   - 0.8-1.0: Kreatif, casual (marketing/sales)
3. **Test berbagai prompt** untuk menemukan yang paling sesuai
4. **Monitor logs** untuk melihat performa dan error

## 📞 Troubleshooting

### Bot tidak membalas?
1. Cek apakah WhatsApp session masih connected
2. Cek logs di terminal untuk error
3. Pastikan GROQ_API_KEY valid (jika pakai agent)
4. Restart dev server: `npm run dev`

### Respons terlalu lambat?
1. Kurangi max_tokens (misal: 512)
2. Gunakan model yang lebih cepat
3. Cek koneksi internet

### Respons tidak sesuai?
1. Perbaiki system prompt di agent config
2. Adjust temperature
3. Tambahkan contoh/examples di prompt

---

**Selamat! Bot WhatsApp Anda sekarang sudah bisa chat balik! 🎉**
