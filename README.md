# MXL Subs

MXL Subs adalah platform web modern untuk menonton konten video =LOVE dengan takarir (subtitle) bahasa Indonesia. Aplikasi ini dibangun dengan fokus pada performa, antarmuka pengguna yang responsif, dan pengalaman streaming yang bersih.

## Fitur Utama

- **Custom Video Player**: Dibangun menggunakan YouTube IFrame API dengan antarmuka kustom yang mendukung integrasi file takarir (.vtt) eksternal.
- **Pengaturan Takarir**: Fitur kalibrasi waktu takarir (delay/offset) yang terintegrasi langsung di dalam menu pemutar video.
- **Penyimpanan Lokal (Local Storage)**: Menyimpan riwayat durasi tontonan (continue watching) dan preferensi pengguna tanpa memerlukan database backend.
- **Sistem Pencarian & Filter**: Pencarian konten berbasis judul dan pemeran, serta penyaringan multi-kategori melalui URL parameter.
- **Desain Responsif**: Antarmuka dioptimalkan secara spesifik untuk perangkat seluler, tablet, dan desktop.

## Tumpukan Teknologi (Tech Stack)

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Ikon**: Lucide React

## Menjalankan Proyek Secara Lokal

Untuk menjalankan aplikasi ini di komputer Anda, ikuti langkah-langkah berikut:

1. Klon repositori ini:
   ```bash
   git clone https://github.com/Shiropan204/Mxlsubs.git
   ```

2. Masuk ke direktori proyek:
   ```bash
   cd Mxlsubs
   ```

3. Instal dependensi:
   ```bash
   npm install
   ```

4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```

5. Buka peramban (browser) dan akses alamat lokal yang tertera pada terminal (umumnya `http://localhost:5173/`).

## Struktur Direktori Utama

- `src/components/`: Kumpulan komponen UI yang dapat digunakan kembali (Layout, YouTubePlayer, dll).
- `src/pages/`: Halaman utama aplikasi (Home, Episode, About, Profile).
- `src/data/`: Data statis untuk episode dan profil anggota.
- `public/subtitles/`: Direktori penyimpanan file takarir format `.vtt`.

## Prosedur Penambahan Episode Baru

Untuk merilis episode baru, lakukan langkah berikut:
1. Simpan file subtitle Anda dengan format `.vtt` ke dalam direktori `public/subtitles/`.
2. Buka file `src/data/episodes.ts`.
3. Tambahkan objek episode baru di urutan teratas array `episodes` beserta metadata yang sesuai (Video ID YouTube, judul, tanggal, dan URL VTT).

## Lisensi & Penyangkalan (Disclaimer)

Repositori ini dibuat khusus untuk keperluan penerjemahan tidak resmi oleh penggemar (fansub). Aplikasi ini memutar video secara legal langsung dari sumber resmi menggunakan YouTube IFrame API (memberikan views/ads kepada pemilik asli). Seluruh hak cipta video, audio, dan aset visual artis adalah milik agensi dan pihak manajemen terkait.
