# Portal Layanan SIAKAD Terpadu

Dashboard portal satu pintu (*single gateway portal*) untuk ekosistem sistem informasi akademik dan tata kelola sekolah. Dirancang modern, responsif (desktop, tablet, mobile), serta terintegrasi langsung dengan API gateway pusat.

## 🌟 Fitur Utama
- **Akses Satu Pintu (Multi-Jenjang):** Akses cepat menuju SIAKAD SMK, SIAKAD SMP, Ujian CBT, Administrasi Guru, dan Inventaris Sarana Prasarana.
- **Sinkronisasi Telemetri Real-Time:** Menampilkan statistik siswa aktif, guru & staf, rombel, dan ketersediaan server secara otomatis dari API pusat.
- **Desain Responsif & Ramping:**
  - Layout desktop & tablet premium dengan efek glassmorphism & ambient glow.
  - Mode mobile ringkas 2-kolom yang nyaman untuk layar smartphone.
- **Mode Gelap / Terang (Dark / Light Theme):** Dilengkapi pemilih tema otomatis dengan penyimpanan lokal (*localStorage*).

## 🚀 Struktur Direktori
```text
├── index.html            # Halaman utama portal
├── assets/
│   ├── css/
│   │   └── style.css     # Sistem desain, tipografi, dan media queries responsif
│   ├── js/
│   │   └── main.js       # Logika pengambilan API, tema, dan navigasi tab
│   └── img/
│       └── hero-banner.jpg # Banner grafis ekosistem sekolah
├── api/
│   └── ping.php          # Backend ping proxy & health-check
└── .gitignore
```

## 🛠️ Instalasi & Menjalankan Lokal
Proyek ini berbasis web statis dengan pendukung PHP proxy sederhana. Anda dapat menjalankannya menggunakan web server lokal seperti **Laravel Herd**, **Valet**, **XAMPP**, atau PHP Built-in Server:

```bash
php -S localhost:8000
```
Buka browser di `http://localhost:8000` atau domain lokal Herd Anda (contoh: `http://dashboard-siakad.test`).

---
&copy; Yayasan Tinta Emas Indonesia. Hak Cipta Dilindungi.
