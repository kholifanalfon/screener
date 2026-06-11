# High-Level Feature Plan: Aplikasi Screener Saham & AI Trading Assistant

## 1. Ringkasan (Overview)
Aplikasi berbasis **Progressive Web App (PWA)** yang dirancang untuk membantu trader mengambil keputusan yang lebih baik dan cepat melalui fitur screener saham, visualisasi data pasar, dan analisis cerdas menggunakan teknologi **Gemini AI**.

## 2. Fitur Utama (Core Features)

### A. Integrasi Data Saham (API Finnhub / Yahoo Finance)
- **Data Real-time & Historis**: Mengambil data pergerakan harga saham terkini, grafik candlestick interaktif (harian/mingguan/bulanan), dan volume perdagangan.
- **Screener Saham Terpusat**: Kemampuan untuk memfilter ribuan saham berdasarkan berbagai indikator:
  - *Teknikal*: RSI, MACD, Moving Average (MA), Bollinger Bands.
  - *Fundamental*: P/E Ratio, Market Cap, Volume Rata-rata.
- **Watchlist & Portfolio**: Fitur bagi pengguna untuk membuat dan menyimpan daftar pantauan saham personal.

### B. Analisis Cerdas Berbasis AI (Integrasi Gemini AI)
- **AI Stock Summary**: Meringkas kondisi suatu saham (Bullish, Bearish, Sideways) secara instan menggunakan data real-time API yang diproses oleh Gemini AI.
- **Analisis Sentimen & Risiko**: AI akan menganalisis tren, memberikan peringatan risiko, dan menyoroti level *support & resistance* berdasarkan pergerakan terkini.
- **Asisten Chat Trading (AI Chatbot)**: Fitur chat interaktif di mana pengguna dapat bertanya langsung kepada AI mengenai prospek saham tertentu (Contoh: *"Bagaimana prospek teknikal saham AAPL hari ini berdasarkan indikator MACD?"*).

### C. Autentikasi & Keamanan (Sistem Login, Session, & Middleware)
- **Sistem Login Lengkap**: Registrasi, login, lupa kata sandi, serta perlindungan terhadap *brute-force*.
- **Manajemen Session**: Menggunakan sistem *session* (misalnya via *HTTP-only cookies*) agar pengguna tetap masuk dengan aman, serta mendukung pengelolaan sesi (logout dari semua perangkat).
- **Proteksi Middleware**: Middleware di level server/router untuk memastikan rute penting (Dashboard, Screener, AI Chat, Watchlist) **hanya bisa diakses oleh pengguna yang sudah login**. Mencegah akses tidak sah secara langsung.

### D. Progressive Web App (PWA)
- **Aplikasi "Installable"**: Pengguna dapat menambahkan aplikasi ini ke *homescreen* (Layar Utama) HP Android, iOS, maupun Desktop (Windows/Mac) dan menggunakannya layaknya aplikasi *native* tanpa harus mengunduh dari App Store.
- **Dukungan Offline & Caching**: Implementasi *Service Worker* untuk menyimpan *cache* aset UI, font, dan riwayat data saham terakhir. Hal ini memastikan performa aplikasi yang cepat dan tetap dapat dibuka meskipun sinyal internet sedang buruk.

---

## 3. Struktur Menu Aplikasi

Untuk mendukung alur pengguna yang intuitif, aplikasi akan memiliki navigasi menu utama berikut:
- **Dashboard**: Ringkasan pasar, *top gainers/losers*, dan *AI insights* harian.
- **Saham (Screener & Chart)**: Halaman utama untuk memfilter saham, melihat grafik, dan data finansial.
- **Portofolio**: Halaman khusus untuk mencatat dan melacak performa investasi pengguna (posisi beli/jual dan profit/loss).
- **Recap (Trading Journal)**: Halaman riwayat transaksi (*trading*) untuk evaluasi masa lalu dan mencatat jurnal/catatan analisis.
- **Master User (Admin)**: Halaman manajemen khusus admin untuk mengelola akses pengguna, *role*, dan memantau aktivitas sistem.
- **Master Saham (Admin)**: Halaman *registry* saham (*master data*) untuk mengelola daftar kode ticker, nama perusahaan, dan sektor yang didukung dalam sistem.
- **Pengaturan (Settings)**: Halaman konfigurasi preferensi pengguna dan sistem, meliputi pengaturan kunci API (*API Keys*), default batas TP/SL (*Take Profit / Stop Loss*), pemilihan model AI, dan pengaturan Target Index sebagai *benchmark*.

---

## 4. Rekomendasi Teknologi (Tech Stack)

Berdasarkan panduan *Advanced Software Engineering* (`GUIDELINES.md`), aplikasi ini akan menggunakan arsitektur **Monorepo** dengan pemisahan tegas antara Frontend dan Backend (*End-to-End Type Safety*).

- **Frontend**: **React + TypeScript (Vite)**
  - *State Management*: Zustand & TanStack Query (Custom Hooks Facade Pattern).
  - *Styling*: Tailwind CSS & Shadcn UI.
  - *Form & Validation*: React Hook Form + Zod.
  - *Routing*: React Router (Pendekatan Feature-Driven / Co-Located Architecture).
- **Backend**: **Express + Bun**
  - *Validation & Middleware*: Zod & Jose (untuk Auth).
  - *Logging*: Pino.
  - *Arsitektur*: Modular/Feature-Driven Architecture (Controller, Service, Repository).
- **Database & ORM**: **PostgreSQL** dengan **Drizzle ORM** (didukung oleh Enterprise Connection Pooling seperti PgBouncer/Supavisor).
- **Dokumentasi API**: Docusaurus & Scalar (`@scalar/express-api-reference`).
- **Integrasi Pihak Ketiga**:
  - *Data Market*: Finnhub API atau Yahoo Finance API.
  - *AI Engine*: Google Gemini API (`@google/generative-ai`).

---

## 5. Tahapan Pengembangan (Implementation Phases)

1. **Fase 1: Konfigurasi PWA & Skema Database Dasar**
   - Mengonfigurasi plugin PWA pada Frontend Vite (`vite-plugin-pwa`).
   - Memastikan koneksi ke Database PostgreSQL & inisialisasi skema dengan Drizzle ORM.
   - Memastikan *Environment Variables* terpusat sudah siap untuk fitur Screener.

2. **Fase 2: Autentikasi & Core Backend Modul**
   - Implementasi Modul Auth (Login, Register) di Backend menggunakan Jose & Zod.
   - Setup Middleware keamanan di Backend.
   - Implementasi state autentikasi (Zustand) dan proteksi rute (React Router) di Frontend.

3. **Fase 3: Integrasi Data & Screener Saham**
   - Pembuatan Modul Saham di Backend (menyambungkan API Finnhub/Yahoo Finance).
   - Membangun UI Dashboard, Grafik Saham, dan tabel Screener dengan Shadcn UI.
   - Fasad API di Frontend dengan TanStack Query untuk performa *caching* dan re-fetching data yang efisien.

4. **Fase 4: Keajaiban AI (Integrasi Gemini)**
   - Menyambungkan Google Gemini API di Layer Service Backend.
   - Menulis *System Prompt* khusus untuk menganalisis data saham teknikal & fundamental.
   - Membangun antarmuka Chatbot/Hasil Analisis AI di Frontend.

5. **Fase 5: UI/UX Polish, Testing & Deployment**
   - Pengujian Backend dengan `bun test` dan Frontend dengan Vitest, RTL, & MSW.
   - Optimalisasi PWA (Offline Support & Caching).
   - *Containerization* menggunakan Docker dan *deploy* ke production via GHCR (GitHub Container Registry).
