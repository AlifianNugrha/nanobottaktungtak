# 🤖 Agent Configuration Guide

## ✅ Struktur Config yang Benar

Agent memiliki field `config` (JSON) yang harus berisi:

```json
{
  "systemPrompt": "Instruksi untuk AI tentang peran dan cara menjawab",
  "model": "llama-3.3-70b-versatile",
  "temperature": 0.7,
  "maxTokens": 1024
}
```

---

## 📋 Field-Field Config

### 1. **systemPrompt** (Required)

**Apa itu?**
Instruksi untuk AI tentang bagaimana harus berperilaku dan menjawab.

**Contoh:**
```json
{
  "systemPrompt": "Anda adalah customer service yang ramah dan profesional. Bantu pelanggan dengan sopan dan informatif. Gunakan bahasa Indonesia yang baik dan benar."
}
```

**Tips:**
- ✅ Jelaskan peran AI dengan spesifik
- ✅ Berikan contoh cara menjawab
- ✅ Tentukan tone (formal/casual)
- ✅ Tentukan bahasa yang digunakan
- ❌ Jangan terlalu panjang (max 500 karakter)

---

### 2. **model** (Optional)

**Apa itu?**
Model AI Groq yang akan digunakan.

**Default:** `llama-3.3-70b-versatile`

**Pilihan Model:**
```json
{
  "model": "llama-3.3-70b-versatile"  // Recommended (balanced)
}
```

**Model yang tersedia:**
- `llama-3.3-70b-versatile` - **Recommended** (cepat & pintar)
- `llama-3.1-70b-versatile` - Alternatif
- `mixtral-8x7b-32768` - Untuk konteks panjang
- `gemma2-9b-it` - Lebih cepat, kurang pintar

**Kapan ganti model?**
- Pakai default aja untuk kebanyakan kasus ✅
- Ganti hanya jika ada kebutuhan spesifik

---

### 3. **temperature** (Optional)

**Apa itu?**
Tingkat kreativitas/variasi dalam jawaban (0.0 - 2.0)

**Default:** `0.7`

**Panduan:**
```json
{
  "temperature": 0.3  // Konsisten, formal (customer service)
}
```

| Temperature | Use Case | Contoh |
|-------------|----------|--------|
| 0.0 - 0.3 | Konsisten, formal | Customer service, FAQ bot |
| 0.4 - 0.7 | Balanced | General purpose, chatbot |
| 0.8 - 1.2 | Kreatif, casual | Marketing, sales bot |
| 1.3 - 2.0 | Sangat kreatif | Creative writing (jarang dipakai) |

**Rekomendasi:**
- Customer Service: `0.3`
- Sales Bot: `0.8`
- General Chatbot: `0.7` ✅

---

### 4. **maxTokens** (Optional)

**Apa itu?**
Panjang maksimal respons (dalam tokens, ~1 token = 0.75 kata)

**Default:** `1024` (≈ 768 kata)

**Panduan:**
```json
{
  "maxTokens": 512  // Respons pendek
}
```

| Tokens | Kata (approx) | Use Case |
|--------|---------------|----------|
| 256 | ~192 kata | Jawaban singkat, quick reply |
| 512 | ~384 kata | Balanced (recommended) ✅ |
| 1024 | ~768 kata | Jawaban detail |
| 2048 | ~1536 kata | Penjelasan panjang |

**Rekomendasi:**
- WhatsApp: `512` - `1024` ✅ (orang jarang baca panjang di WA)
- Email: `1024` - `2048`

---

## 🎯 Contoh Config Lengkap

### **1. Customer Service Bot**
```json
{
  "systemPrompt": "Anda adalah customer service Nexora yang ramah dan profesional. Bantu pelanggan dengan pertanyaan mereka tentang produk dan layanan. Selalu sopan, informatif, dan berikan solusi yang jelas. Gunakan bahasa Indonesia yang baik dan benar.",
  "model": "llama-3.3-70b-versatile",
  "temperature": 0.3,
  "maxTokens": 512
}
```

**Karakteristik:**
- ✅ Konsisten (temperature rendah)
- ✅ Respons pendek-sedang
- ✅ Formal dan profesional

---

### **2. Sales Bot**
```json
{
  "systemPrompt": "Anda adalah sales assistant yang persuasif namun tidak agresif. Fokus pada kebutuhan customer dan tawarkan solusi yang tepat. Gunakan bahasa yang friendly, engaging, dan antusias. Akhiri dengan call-to-action yang jelas.",
  "model": "llama-3.3-70b-versatile",
  "temperature": 0.8,
  "maxTokens": 768
}
```

**Karakteristik:**
- ✅ Kreatif (temperature tinggi)
- ✅ Respons sedang-panjang
- ✅ Friendly dan persuasif

---

### **3. General Chatbot**
```json
{
  "systemPrompt": "Anda adalah asisten AI yang membantu menjawab pertanyaan umum. Berikan jawaban yang akurat, jelas, dan mudah dipahami. Gunakan bahasa Indonesia yang santai namun tetap sopan.",
  "model": "llama-3.3-70b-versatile",
  "temperature": 0.7,
  "maxTokens": 1024
}
```

**Karakteristik:**
- ✅ Balanced
- ✅ Respons sedang
- ✅ Casual tapi sopan

---

### **4. FAQ Bot (Singkat)**
```json
{
  "systemPrompt": "Anda adalah bot FAQ yang menjawab pertanyaan dengan singkat dan jelas. Berikan jawaban langsung to the point tanpa basa-basi. Jika tidak tahu, arahkan ke customer service.",
  "model": "llama-3.3-70b-versatile",
  "temperature": 0.2,
  "maxTokens": 256
}
```

**Karakteristik:**
- ✅ Sangat konsisten
- ✅ Respons sangat singkat
- ✅ To the point

---

## 🔧 Cara Setting Config di Dashboard

### **Opsi 1: Via UI (Jika Ada Form)**

1. Buka Dashboard → Agents
2. Create/Edit Agent
3. Isi field:
   - **Name**: Nama agent (misal: "CS Bot")
   - **Description**: Deskripsi singkat
   - **System Prompt**: Copy dari contoh di atas
   - **Model**: llama-3.3-70b-versatile
   - **Temperature**: 0.7
   - **Max Tokens**: 1024
4. Save

### **Opsi 2: Via Database (Manual)**

Jika UI belum ada field untuk config, set manual di database:

```typescript
// Update agent config
await prisma.agent.update({
  where: { id: 'agent-id' },
  data: {
    config: {
      systemPrompt: "Anda adalah...",
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      maxTokens: 1024
    }
  }
});
```

---

## ✅ Validasi Config

### **Cek Config Agent:**

```bash
# Jalankan script untuk cek config
npx tsx scripts/check-agent-config.ts
```

**Output yang diharapkan:**
```
Agent: CS Bot
Config:
  ✅ systemPrompt: "Anda adalah customer service..."
  ✅ model: llama-3.3-70b-versatile
  ✅ temperature: 0.7
  ✅ maxTokens: 1024
```

---

## 🧪 Testing Config

### **Test Respons AI:**

1. **Kirim pesan WhatsApp**
2. **Cek terminal logs:**
   ```
   Using agent: CS Bot
   System prompt: Anda adalah customer service...
   Model: llama-3.3-70b-versatile
   Temperature: 0.7
   ```
3. **Evaluasi respons:**
   - Apakah sesuai dengan system prompt?
   - Apakah tone-nya benar?
   - Apakah panjangnya sesuai?

### **Adjust Config:**

Jika respons tidak sesuai:
- Terlalu formal? → Naikkan temperature
- Terlalu panjang? → Kurangi maxTokens
- Tidak sesuai peran? → Perbaiki systemPrompt

---

## 📊 Best Practices

### ✅ **DO:**
- Gunakan system prompt yang jelas dan spesifik
- Test dengan berbagai pertanyaan
- Adjust temperature sesuai use case
- Gunakan maxTokens yang wajar (512-1024)
- Gunakan model default (llama-3.3-70b-versatile)

### ❌ **DON'T:**
- Jangan system prompt terlalu panjang
- Jangan temperature > 1.0 (kecuali butuh sangat kreatif)
- Jangan maxTokens terlalu kecil (< 256)
- Jangan ganti model tanpa alasan jelas

---

## 🎉 Summary

**Config yang BENAR:**
```json
{
  "systemPrompt": "Instruksi jelas tentang peran AI",
  "model": "llama-3.3-70b-versatile",
  "temperature": 0.7,
  "maxTokens": 1024
}
```

**Bot akan otomatis:**
- ✅ Baca config dari agent
- ✅ Gunakan system prompt
- ✅ Pakai model yang ditentukan
- ✅ Respons sesuai temperature & maxTokens
- ✅ Balas kayak manusia! 🤖

---

**Selamat! Config agent Anda sudah benar! 🎉**
