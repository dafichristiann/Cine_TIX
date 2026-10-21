# Dokumen Rencana Revisi, Arsitektur Alur & Checklist Proyek CineTix

Dokumen ini memuat arsitektur sistem, rancangan alur bisnis bioskop modern, eliminasi elemen *slop* visual, integrasi autentikasi email berbasis SMTP, penambahan fitur standar bioskop, serta checklist progres implementasi.

---

## 1. Arsitektur Sistem & Alur Bisnis (Workflow)

```
[ Pengguna / Browser ]
        │
        ├──────── (1) Autentikasi SMTP (OTP / Verifikasi Email) ────────┐
        │                                                               │
        ├──────── (2) Eksplorasi Film, Bioskop, & Jadwal ──────────────┤
        │                                                               │
        ├──────── (3) Pemilihan Kursi Real-Time (Lock 15 Menit) ───────┤
        │                                                               │
        ├──────── (4) Tambahan F&B (Makanan & Minuman Bioskop) ────────┤
        │                                                               │
        ├──────── (5) Klaim Kode Promo / Voucher Diskon ───────────────┤
        │                                                               │
        ├──────── (6) Checkout & Pembayaran (Multi-Metode) ────────────┤
        │                                                               │
        └──────── (7) E-Tiket Digital (QR Code & Notifikasi Email) ─────┘
                                        │
                                        ▼
                            [ Backend API: NestJS ]
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
    [ Database PostgreSQL ]     [ Layanan SMTP Email ]     [ Background Timer ]
    (Prisma ORM: Bioskop,       (Nodemailer: OTP,          (Auto-release kursi &
     Film, Studio, Kursi,        Tiket, Konfirmasi)         pemesanan kedaluwarsa)
     F&B, Promo, Transaksi)
```

### Rincian Alur Pengguna:
1. **Autentikasi Profesional (SMTP)**:
   - Pengguna mendaftar atau login dengan email.
   - Sistem mengirimkan 6-digit kode OTP resmi via SMTP ke inbox pengguna (`POST /auth/send-otp`).
   - Verifikasi OTP mengembalikan JWT token terenkripsi (`POST /auth/verify-otp`).
   - Fallback otomatis: jika server SMTP belum diisi kredensial di lingkungan lokal, kode OTP tercatat di log konsol untuk kemudahan pengujian developer.

2. **Katalog Film & Pemilihan Bioskop**:
   - Filter berdasarkan kota, nama bioskop, genre, dan rating usia (SU, R13+, D17+, D21+).
   - Penanda film "Sedang Tayang" (*Now Showing*) dan "Segera Hadir" (*Coming Soon*).

3. **Reservasi Kursi Interaktif**:
   - Layar bioskop (*curved cinema screen*) dengan ambient glow sinematik.
   - Status kursi: Tersedia, Dipilih, dan Terisi.
   - Penguncian status kursi secara atomik (mencegah *race condition* atau *double booking*).

4. **Add-on Concession (F&B / Snack & Minuman)**:
   - Paket kombo popcorn karamel, minuman dingin, dan nachos keju bioskop (`GET /cinema-features/concessions`).
   - Terintegrasi langsung ke dalam rincian pesanan dan total invoice.

5. **Sistem Promo & Diskon**:
   - Input voucher kode promo (contoh: `CINETIX10`, `POPCORNFREE`, `HEMAT20`) via `POST /cinema-features/promo/validate`.
   - Kalkulasi subtotal, diskon promo, dan biaya layanan secara transparan.

6. **Checkout & Pembayaran**:
   - Pilihan metode: QRIS Digital, Transfer Virtual Account, atau Kartu Pembayaran.
   - Simulasi pembayaran instan untuk verifikasi status lunas.

7. **E-Tiket & Boarding Pass**:
   - Tiket digital bergaya *boarding pass* elegan dengan QR Code scanable (`qrcode.react`).
   - Ringkasan nomor kursi, studio, tanggal, jam tayang, dan barcode tiket.
   - Pengiriman salinan tiket digital ke email pengguna via SMTP Mailer.

---

## 2. Standar Desain Visual (Anti-Slop & Cinema Aesthetic)

- **Eliminasi Emoji 100%**: Menghapus seluruh emoji kasual (`🍿`, `🎬`, `💳`, `⚡`, `🎟️`, `🕒`, dsb) dari antarmuka dan menggantinya dengan ikon SVG presisi dari `lucide-react` dan tipografi profesional.
- **Palet Warna Sinematik**:
  - Background: Obsidian Dark (`#0A0B0E`, `#111319`, `#0D0F15`).
  - Aksen: Golden Cinema Amber (`#F59E0B`, `#D97706`).
  - Netral: Slate (`#64748B`, `#94A3B8`, `#E2E8F0`).
  - Tipografi: Inter / System Sans dengan kontras tajam, rasio harmonis, dan *tracking* teratur.
- **Struktur Kartu & Kontainer**: Border subtil (`border-slate-800/80`), tanpa *gradient slop* norak atau elemen murahan.

---

## 3. Checklist Implementasi & Progres

### A. Autentikasi & Email SMTP
- [x] Inisialisasi konfigurasi `.env` untuk SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
- [x] Implementasi modul `MailModule` dan `MailService` di NestJS menggunakan `nodemailer` (lengkap dengan HTML template profesional dan development console fallback).
- [x] Endpoint backend `POST /auth/send-otp` untuk pengiriman kode verifikasi login/registrasi.
- [x] Endpoint backend `POST /auth/verify-otp` untuk validasi kode dan pembuatan session JWT.
- [x] Halaman login/register frontend dengan alur verifikasi email OTP profesional bersanding dengan password tab.
- [x] Pengiriman tanda terima e-tiket berformat HTML ke email saat pembayaran sukses via `PembayaranService`.

### B. Fitur Standar Bioskop (Backend & Frontend)
- [x] **Katalog Makanan & Minuman (F&B / Concessions)**:
  - Modul `CinemaFeaturesModule`, `CinemaFeaturesController`, dan `CinemaFeaturesService` (`GET /cinema-features/concessions`).
  - Komponen pemilihan kuantitas F&B interaktif sebelum pembayaran di halaman Checkout.
- [x] **Sistem Voucher / Kode Promo**:
  - Endpoint validasi promo `POST /cinema-features/promo/validate` dengan kalkulasi diskon persentase dan nominal.
  - Field input promo di halaman Checkout dengan kalkulasi diskon otomatis dan pesan konfirmasi.
- [x] **Filter Bioskop & Lokasi Kota**:
  - Selektor kota dan cabang bioskop pada halaman Beranda dan Katalog Film.
- [x] **E-Tiket Modern dengan QR Code**:
  - Generator QR Code digital (`QRCodeSVG` dari `qrcode.react`) untuk tiket lunas.
  - Tampilan *Cinema Pass* dengan kode QR scanable di menu Tiket Saya.

### C. Pembenahan Visual & Eliminasi Slop (Anti-Slop Polish - Refrensi: 21 Cineplex, TIX ID, CGV)
- [x] Pembersihan menyeluruh 100% karakter emoji di seluruh frontend dan backend source code.
- [x] Adopsi paradigma antarmuka bioskop resmi Indonesia:
  - Top Navigation Bar dengan pemilih kota terintegrasi (`Layout.tsx`).
  - Hero banner promo carousel dinamis (`Home.tsx`).
  - Poster rasio standar 2:3 dengan badge klasifikasi usia resmi (SU, 13+, 17+, 21+) (`FilmCard.tsx`).
  - Halaman jadwal terstruktur: Tanggal (Pills selector) -> Cabang Bioskop -> Tipe Studio -> Jam Tayang tombol langsung ke denah kursi (`Jadwal.tsx`).
  - Matriks denah kursi bioskop interaktif (`Kursi.tsx`).
  - Check-out pemesanan dengan F&B Concessions dan voucher promo (`Checkout.tsx`).
  - Boarding pass digital dengan scannable QR Code (`MyTickets.tsx`).
- [x] Penggantian dengan icon sistem berbasis SVG yang konsisten dan minimalis (`lucide-react`).
- [x] Desain ulang halaman Beranda (*Hero section*, *Film grid*, dan alur panduan).
- [x] Desain ulang layout pemilihan kursi dan simulator proyektor layar.
- [x] Peningkatan tampilan responsive dan status empty/loading state.
- [x] **Riset & Harmonisasi Sistem Palet Warna (Luxury Noir & Imperial Champagne Gold)**:
  - Analisis warna otentik bioskop Indonesia bersama sub-agent UI Designer (Cinema XXI, The Premiere, TIX ID, CGV).
  - Mengeliminasi benturan warna (orange jenuh/kuning neon/abu-abu belang) dan menggantinya dengan palet terstruktur:
    - *Canvas & Surfaces*: `--color-canvas-base` (`#080C14`), `--color-canvas-card` (`#0E1424`), `--color-canvas-elevated` (`#131C31`), `--color-canvas-floating` (`#1A253F`).
    - *Borders*: `--color-border-subtle` (`#1E293B`), `--color-border-elevated` (`#27354F`).
    - *Primary Brand*: Imperial Champagne Gold (`#D4AF37`) dengan level kontras WCAG AA/AAA.
    - *Typography Neutrals*: `--color-text-headline` (`#F8FAFC`), `--color-text-body` (`#CBD5E1`), `--color-text-muted` (`#8493A8`), `--color-text-on-gold` (`#060A12`).
    - *Semantic Status*: Terpilih (Gold Satin), Tersedia (Elevated Slate), Terisi/Sold (Charcoal Muted), Sukses (`#34D399`), Bahaya (`#FB7185`).
  - Refactoring menyeluruh token Tailwind CSS di `index.css`, `Layout.tsx`, `FilmCard.tsx`, `Home.tsx`, `Film.tsx`, `Jadwal.tsx`, `Kursi.tsx`, `Checkout.tsx`, `MyTickets.tsx`, `UserMenu.tsx`, `Login.tsx`, `Register.tsx`, dan `AdminDashboard.tsx`.
- [x] **Fitur Otentikasi Google / Gmail (OTP + Magic Link "Ya, Ini Saya")**:
  - Modal otentikasi Google dengan validasi domain `@gmail.com` / `@googlemail.com` di `Login.tsx` & `Register.tsx`.
  - Endpoint `POST /auth/google/request`, `POST /auth/google/verify-otp`, dan `POST /auth/google/verify-link`.
  - Template email HTML bioskop resmi CineTix dengan 6-digit kode OTP dan tombol tindakan instan *"Ya, Ini Saya (Konfirmasi Masuk)"*.
  - Auto-provisioning akun baru (otomatis membuat akun member aktif jika email belum terdaftar tanpa pengisian formulir manual).
  - Halaman penerima Magic Link `/auth/magic-link` (`MagicLinkVerify.tsx`) untuk verifikasi otomatis 1-klik dari inbox Gmail.

### D. Pengujian Akhir & Verifikasi (Quality Assurance)
- [x] Pengujian unit test backend: **17 test suites, 18 tests passing (100%)**.
- [x] Pengujian e2e test backend: **Passing**.
- [x] Pengujian build frontend Vite + TypeScript: **Build sukses tanpa error**.
- [x] Pengujian alur registrasi/login email OTP via SMTP endpoint: **Teruji via HTTP POST**.
- [x] Pengujian F&B catalog dan promo code validation: **Teruji via HTTP GET/POST**.
- [x] Verifikasi render halaman tanpa galat dan responsive di desktop/mobile.
