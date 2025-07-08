# USDT Mining Bot - Telegram Mini App

Bot telegram untuk simulasi mining USDT dengan sistem referral, task, dan boost upgrades.

## Fitur Utama

- 🔐 **Login dengan Telegram**: Autentikasi menggunakan Telegram ID
- ⛏️ **Mining System**: Farming USDT dengan sistem 24 jam
- 🎯 **Daily Tasks**: Task harian untuk mendapatkan reward
- 🚀 **Boost System**: Upgrade untuk meningkatkan kecepatan mining
- 👥 **Referral System**: Sistem referral 3 level (10%, 5%, 2%)
- 💰 **Deposit/Withdraw**: Integrasi dengan Solana blockchain
- 📊 **Admin Panel**: Panel admin tersembunyi untuk management

## Deployment ke Vercel

### Prasyarat

1. Akun Vercel (https://vercel.com)
2. Database PostgreSQL (bisa menggunakan Neon, Supabase, atau PlanetScale)
3. Bot Telegram Token
4. Wallet Solana untuk deposit

### Langkah Deployment

1. **Clone atau Fork Repository**
   ```bash
   git clone <repository-url>
   cd usdt-mining-bot
   ```

2. **Setup Environment Variables di Vercel**
   
   Buat file `.env.local` atau set di Vercel Dashboard:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   SOLANA_DEPOSIT_WALLET=your_solana_wallet_address
   ADMIN_PASSWORD=SecureAdmin2024!
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Deploy ke Vercel**
   
   **Option 1: Via Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

   **Option 2: Via Vercel Dashboard**
   - Login ke Vercel Dashboard
   - Klik "New Project"
   - Import repository ini
   - Set environment variables
   - Deploy

4. **Setup Database**
   
   Setelah deployment, database akan otomatis ter-setup dengan demo data.

### Konfigurasi Telegram Bot

1. Buat bot baru di @BotFather
2. Dapatkan token bot
3. Set webhook ke domain Vercel Anda:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.vercel.app/api/telegram/webhook
   ```

### Struktur File Penting

```
├── api/
│   └── index.ts          # Vercel serverless function
├── client/               # Frontend React
├── server/               # Backend Express
├── shared/               # Shared types & schema
├── vercel.json          # Vercel configuration
└── README.md
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `TELEGRAM_BOT_TOKEN` | Token bot Telegram | ✅ |
| `SOLANA_DEPOSIT_WALLET` | Wallet Solana untuk deposit | ✅ |
| `ADMIN_PASSWORD` | Password admin panel | ✅ |
| `JWT_SECRET` | Secret key untuk JWT | ✅ |

### Akses Admin Panel

Admin panel dapat diakses melalui:
- URL: `https://your-domain.vercel.app/admin`
- Password: `SecureAdmin2024!` (atau sesuai `ADMIN_PASSWORD`)

### API Endpoints

- `POST /api/auth/telegram` - Autentikasi user
- `GET /api/user/profile` - Profile user
- `GET /api/tasks` - Daftar tasks
- `POST /api/mining/start` - Mulai mining
- `POST /api/mining/claim` - Claim reward
- `POST /api/deposit/initiate` - Mulai deposit
- `POST /api/withdraw/request` - Request withdraw

### Teknologi yang Digunakan

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **UI**: Tailwind CSS + Radix UI
- **Deployment**: Vercel Serverless Functions

### Troubleshooting

1. **Database connection error**: Pastikan `DATABASE_URL` benar
2. **Telegram bot tidak respond**: Cek webhook dan token
3. **Build error**: Pastikan semua dependencies ter-install
4. **Admin panel tidak bisa akses**: Cek password dan endpoint

### Support

Jika ada masalah dengan deployment, silakan:
1. Cek logs di Vercel Dashboard
2. Pastikan semua environment variables sudah di-set
3. Cek database connection

## Demo

Bot ini sudah include demo user dengan data realistis untuk testing.