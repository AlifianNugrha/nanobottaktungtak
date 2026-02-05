# Fix: Banyak WhatsApp Integration "Connecting" di Database

## Masalah
Di database Supabase, terdapat banyak sekali integration WhatsApp dengan status "connecting" yang menumpuk. Ini terjadi karena:
1. Setiap kali user coba connect WhatsApp, sistem membuat integration baru
2. Integration lama yang gagal connect tidak dihapus otomatis
3. Tidak ada mekanisme cleanup untuk integration yang stuck

## Solusi yang Diimplementasikan

### 1. ✅ Auto-Cleanup Saat Create Integration

**File:** `app/api/whatsapp/session/route.ts`

Setiap kali user create WhatsApp connection, sistem akan:
- **Hapus integration lama** yang stuck di "connecting" lebih dari 10 menit
- **Reuse existing integration** jika bot sudah punya integration (instead of creating new)
- **Hanya create new** jika memang belum ada integration

**Kode:**
```typescript
// CLEANUP: Delete old stuck 'connecting' integrations
const oldConnectingIntegrations = await prisma.integration.findMany({
    where: {
        userId: user.id,
        platform: 'WhatsApp',
        status: 'connecting',
        createdAt: {
            lt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes
        }
    }
});

if (oldConnectingIntegrations.length > 0) {
    console.log(`[Cleanup] Deleting ${oldConnectingIntegrations.length} stuck integrations`);
    await prisma.integration.deleteMany({
        where: { id: { in: oldConnectingIntegrations.map(i => i.id) } }
    });
}

// Reuse existing integration if bot already has one
if (botId) {
    const existingBot = await prisma.bot.findUnique({
        where: { id: botId },
        include: { integration: true }
    });

    if (existingBot?.integration && existingBot.integration.platform === 'WhatsApp') {
        integration = existingBot.integration;
        // Update status to regenerate QR
        await prisma.integration.update({
            where: { id: integration.id },
            data: { status: 'connecting' }
        });
    }
}
```

---

### 2. ✅ Manual Cleanup API Endpoint

**File:** `app/api/whatsapp/cleanup/route.ts` (BARU)

API endpoint untuk cleanup manual:
- **DELETE /api/whatsapp/cleanup** - Hapus semua stuck integrations (>5 menit)
- **GET /api/whatsapp/cleanup** - Cek berapa banyak stuck integrations

**Usage:**
```bash
# Check stuck integrations
GET /api/whatsapp/cleanup

# Delete stuck integrations
DELETE /api/whatsapp/cleanup
```

---

### 3. ✅ Cleanup Button di UI

**File:** `app/(admin)/integration/page.tsx`

Tambah button "Cleanup" di header Integration page:
- Warna orange untuk indicate caution
- Confirm dialog sebelum delete
- Show berapa banyak yang di-delete
- Auto-refresh list setelah cleanup

**Lokasi:** Header Integration page, sebelah kiri tombol "Add Connection"

---

## Cara Menggunakan

### Auto-Cleanup (Otomatis)
Tidak perlu lakukan apa-apa. Setiap kali create WhatsApp connection baru, sistem akan otomatis cleanup integration lama yang stuck.

### Manual Cleanup (Jika Perlu)
1. Buka Integration page
2. Klik tombol **"Cleanup"** (warna orange) di header
3. Confirm dialog
4. Sistem akan delete semua integration stuck >5 menit
5. Alert akan show berapa banyak yang di-delete

---

## Testing

### Test Auto-Cleanup:
1. Buka Supabase → Table `integrations`
2. Cek berapa banyak WhatsApp integration dengan status "connecting"
3. Buka Integration page → Create new WhatsApp connection
4. Cek console log: `[Cleanup] Deleting X stuck integrations`
5. Refresh Supabase → Integration lama harus hilang

### Test Manual Cleanup:
1. Buka Integration page
2. Klik button "Cleanup"
3. Confirm
4. Alert: `✓ Cleaned up X stuck integration(s)`
5. Cek Supabase → Stuck integrations harus hilang

### Test Reuse Integration:
1. Create WhatsApp connection untuk Bot A
2. Tutup modal (jangan scan QR)
3. Klik Settings pada Bot A lagi
4. Console log: `[Reuse] Using existing integration xxx`
5. **Tidak ada integration baru** di database

---

## Monitoring

### Console Logs:
```
[Cleanup] Deleting 5 stuck 'connecting' integrations
[Reuse] Using existing integration abc-123 for bot xyz-456
[Create] Created new integration def-789
```

### Database Check:
```sql
-- Check stuck integrations
SELECT id, name, status, createdAt, updatedAt 
FROM "Integration" 
WHERE platform = 'WhatsApp' 
AND status = 'connecting'
AND "createdAt" < NOW() - INTERVAL '5 minutes';

-- Count by status
SELECT status, COUNT(*) 
FROM "Integration" 
WHERE platform = 'WhatsApp'
GROUP BY status;
```

---

## Files yang Diubah/Dibuat

### Modified:
1. ✅ `app/api/whatsapp/session/route.ts`
   - Auto-cleanup logic
   - Reuse existing integration
   - Better logging

2. ✅ `app/(admin)/integration/page.tsx`
   - Added cleanup button
   - Added handleCleanup function

### Created:
3. ✅ `app/api/whatsapp/cleanup/route.ts` - **BARU**
   - Manual cleanup endpoint
   - GET to check stuck count
   - DELETE to cleanup

4. ✅ `INTEGRATION_CLEANUP_FIX.md` - **BARU**
   - Dokumentasi lengkap

---

## Hasil

### Sebelum:
- ❌ Database penuh dengan integration "connecting" yang stuck
- ❌ Setiap create connection = integration baru
- ❌ Tidak ada cara untuk cleanup

### Sesudah:
- ✅ Auto-cleanup integration lama saat create baru
- ✅ Reuse existing integration instead of creating duplicate
- ✅ Manual cleanup button di UI
- ✅ API endpoint untuk cleanup
- ✅ Database tetap bersih

---

## Next Steps

1. **Deploy ke Railway** - Push changes
2. **Test di production** - Verify cleanup works
3. **Monitor database** - Check integration count over time
4. **Optional:** Add scheduled job untuk cleanup otomatis setiap hari

---

## Kesimpulan

✅ **Problem SOLVED!** Database tidak akan lagi penuh dengan integration "connecting" yang stuck. Sistem sekarang:
- Auto-cleanup integration lama
- Reuse existing integration
- Provide manual cleanup option
- Keep database clean and organized

🎉 **Database Supabase sekarang akan tetap bersih!**
