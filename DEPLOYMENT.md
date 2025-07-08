# Panduan Deployment ke Vercel

## Langkah-langkah Deployment

### 1. Persiapan Environment Variables

Buat environment variables berikut di Vercel Dashboard:

```
DATABASE_URL=postgresql://username:password@host:port/database
TELEGRAM_BOT_TOKEN=7872550878:AAEu1SGb4OO5bmp7fka9gsrjCyLywgmbT2w
SOLANA_DEPOSIT_WALLET=EE9UQfmRtvTHq4TkawiMdqET4gaia32MuEoCwjCuz1cr
ADMIN_PASSWORD=SecureAdmin2024!
JWT_SECRET=your_random_jwt_secret_key_here
```

### 2. Setup Database PostgreSQL

Gunakan salah satu provider berikut:

#### Option A: Neon (Recommended)
1. Daftar di https://neon.tech
2. Buat database baru
3. Copy connection string ke `DATABASE_URL`

#### Option B: Supabase
1. Daftar di https://supabase.com
2. Buat project baru
3. Ambil connection string dari Settings > Database

#### Option C: PlanetScale
1. Daftar di https://planetscale.com
2. Buat database baru
3. Copy connection string

### 3. Deploy ke Vercel

#### Via Vercel CLI:
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Via Vercel Dashboard:
1. Login ke https://vercel.com
2. Klik "New Project"
3. Import repository ini
4. Set environment variables di Settings
5. Deploy

### 4. Setup Telegram Bot

1. Buka @BotFather di Telegram
2. Gunakan token: `7872550878:AAEu1SGb4OO5bmp7fka9gsrjCyLywgmbT2w`
3. Set webhook:
   ```
   https://api.telegram.org/bot7872550878:AAEu1SGb4OO5bmp7fka9gsrjCyLywgmbT2w/setWebhook?url=https://your-domain.vercel.app/api/telegram/webhook
   ```

### 5. Testing

Setelah deployment:
1. Buka `https://your-domain.vercel.app`
2. Test demo user dengan data realistis
3. Akses admin panel di `/admin` dengan password `SecureAdmin2024!`

### 6. Fitur yang Tersedia

- ✅ Mining system 24 jam
- ✅ 5 social media tasks  
- ✅ 4 boost upgrades
- ✅ 3-level referral system
- ✅ Solana deposit/withdraw
- ✅ Admin panel tersembunyi
- ✅ Demo user dengan data realistis

### 7. Troubleshooting

**Database Error:**
- Pastikan `DATABASE_URL` benar
- Cek koneksi database di Vercel logs

**Telegram Bot Error:**
- Cek webhook URL
- Pastikan token bot benar

**Build Error:**
- Pastikan semua dependencies ter-install
- Cek Vercel build logs

### 8. Admin Access

- URL: `https://your-domain.vercel.app/admin`
- Password: `SecureAdmin2024!`
- Backend endpoint: `/api/secure/admin/auth/9f8a3b2c7d1e5f4g6h8i9j0k`

### 9. Demo Data

Bot include demo user dengan:
- Balance: 15.50 USDT
- Mining rate: 0.12 USDT/hour
- Level: 3
- Completed tasks dan referral earnings

## File Konfigurasi Penting

- `vercel.json` - Konfigurasi Vercel
- `api/index.ts` - Serverless function handler
- `shared/schema.ts` - Database schema
- `server/setup.ts` - Database initialization