# Solusi WhatsApp Session Persistence di Railway

## Masalah
WhatsApp bot yang di-hosting di Railway tidak bisa maintain connection setelah scan QR code. Setiap kali Railway restart container (deployment baru, auto-restart, dll), session WhatsApp hilang dan harus scan QR code lagi.

## Penyebab
1. **Session tersimpan di memory** - `activeSessions` adalah Map yang hilang saat container restart
2. **Tidak ada auto-restore** - Meskipun session data tersimpan di database, tidak ada mekanisme untuk restore saat server startup
3. **Railway adalah stateless platform** - File system dan memory tidak persisten

## Solusi yang Sudah Diimplementasikan

### 1. Database Session Store ✓
Session WhatsApp disimpan di database PostgreSQL (bukan file system):
- File: `lib/whatsapp-session-store.ts`
- Model: `WhatsAppSession` di Prisma schema
- Data tersimpan: credentials, keys, dan session state

### 2. Auto-Restore Mechanism ✓
Session otomatis di-restore saat server startup:
- File: `lib/server-init.ts` - Initialization script
- File: `lib/whatsapp-service.ts` - Function `restoreExistingSessions()`
- Import di: `app/layout.tsx` - Auto-run on server start

### 3. Enhanced Connection Handling ✓
Status connection di-sync dengan database:
- Update status integration saat QR generated → `connecting`
- Update status integration saat connected → `connected`
- Update status integration saat disconnected → `disconnected`
- Auto-reconnect dengan delay 3 detik jika connection drop

### 4. Manual Restore API ✓
Endpoint untuk manual trigger restore (debugging):
- Endpoint: `POST /api/whatsapp/restore`
- Gunakan jika perlu force restore session

## Cara Kerja

### Saat Pertama Kali Connect:
1. User create WhatsApp integration
2. QR code di-generate
3. User scan QR code dengan WhatsApp
4. Session credentials disimpan ke database
5. Status integration → `connected`

### Saat Railway Restart:
1. Server startup → `server-init.ts` auto-run
2. `restoreExistingSessions()` dipanggil
3. Ambil semua session dari database
4. Recreate WhatsApp connection untuk setiap session
5. Baileys auto-login menggunakan saved credentials
6. **TIDAK PERLU SCAN QR CODE LAGI** ✓

### Saat Connection Drop:
1. Baileys detect connection close
2. Check apakah user logout atau connection issue
3. Jika connection issue → auto-reconnect setelah 3 detik
4. Jika user logout → hapus session, status → `disconnected`

## Testing di Railway

### 1. Deploy ke Railway
```bash
git add .
git commit -m "Add WhatsApp session persistence"
git push
```

### 2. Scan QR Code (Pertama Kali)
- Buka dashboard → Integrations → WhatsApp
- Scan QR code
- Tunggu sampai status → `connected`

### 3. Test Persistence
**Opsi A: Force Restart Railway**
- Buka Railway dashboard
- Klik "Restart" pada deployment
- Tunggu server restart
- Cek logs: harus ada `[Session Restore] Found X sessions in database`
- Status integration harus tetap `connected`
- **Test kirim pesan WhatsApp** → bot harus reply tanpa scan QR lagi

**Opsi B: Deploy Ulang**
- Push code baru ke Railway
- Tunggu deployment selesai
- Cek logs untuk session restore
- Test bot

### 4. Monitor Logs
Cari log messages berikut di Railway logs:
```
[Server Init] Starting server initialization...
[Server Init] Restoring WhatsApp sessions...
[Session Restore] Found X sessions in database
[Session Restore] Restoring session: xxx-xxx-xxx
[Session xxx] ✓ WhatsApp connected successfully!
[Session xxx] Status updated to 'connected' in database
```

## Troubleshooting

### Jika Session Tidak Restore:
1. **Cek Railway Logs**
   - Apakah ada error saat restore?
   - Apakah `server-init.ts` dijalankan?

2. **Cek Database**
   ```sql
   SELECT * FROM "WhatsAppSession";
   ```
   - Apakah ada data session?
   - Apakah `sessionData` tidak null?

3. **Manual Trigger Restore**
   - Call API: `POST /api/whatsapp/restore`
   - Cek response dan logs

4. **Cek Integration Status**
   ```sql
   SELECT id, name, status FROM "Integration" WHERE platform = 'WhatsApp';
   ```

### Jika QR Code Tidak Muncul:
1. Hapus session lama dari database
2. Hapus integration dan buat baru
3. Scan QR code fresh

### Jika Bot Tidak Reply:
1. Cek apakah session status = `connected`
2. Cek logs saat terima message
3. Pastikan bot punya agent yang di-link
4. Cek GROQ_API_KEY di environment variables

## Environment Variables yang Dibutuhkan
```env
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

## Files yang Diubah/Dibuat
1. ✓ `lib/whatsapp-service.ts` - Added `restoreExistingSessions()`
2. ✓ `lib/whatsapp-session-store.ts` - Database session store
3. ✓ `lib/server-init.ts` - **BARU** - Auto-restore on startup
4. ✓ `app/layout.tsx` - Import server-init
5. ✓ `app/api/whatsapp/restore/route.ts` - **BARU** - Manual restore endpoint

## Next Steps
1. Deploy ke Railway
2. Test scan QR code
3. Test restart Railway
4. Monitor logs
5. Jika berhasil, session akan persist! 🎉
