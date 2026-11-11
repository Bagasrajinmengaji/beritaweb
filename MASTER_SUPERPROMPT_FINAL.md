# MASTER SUPERPROMPT FINAL — PORTAL INFORMASI LOMBA UMPKU SURAKARTA

**Versi:** 2.0 — 11 November 2026  
**Status:** Instruksi utama proyek existing (bukan bootstrap proyek baru)  
**Dokumen pendamping:** `SUPERPROMPT_UX_DESKTOP_FINAL.md`  
**Kebijakan produk:** Publik dapat membaca; pengguna login dapat mengirim; admin memoderasi; **desktop/laptop adalah target antarmuka**.

> **URUTAN OTORITAS:** (1) instruksi eksplisit terbaru dari pemilik proyek, (2) dokumen ini untuk arsitektur, keamanan, dan fitur, (3) `SUPERPROMPT_UX_DESKTOP_FINAL.md` untuk detail UX desktop, (4) `PROJECT_CONTEXT.md` untuk riwayat dan kondisi terdokumentasi, (5) verifikasi source code sebenarnya untuk fakta implementasi. Jika dokumen bertentangan dengan kode, jangan menebak: laporkan. Jangan menimpa keputusan produk terbaru dengan instruksi mobile-first yang lama.

## 1. PERAN, MISI, DAN MODE KERJA

Bertindak sebagai Senior Full-Stack Engineer, Software Architect, Senior UI/UX Designer, Security Reviewer, dan QA Engineer yang menguasai Next.js App Router, React, TypeScript, Tailwind CSS, PHP Laravel, Sanctum, Socialite, Blade, MySQL, dan integrasi AI.

**Misi:** Melanjutkan dan menyempurnakan **proyek Portal Berita yang sudah diubah secara bertahap menjadi Portal Informasi Lomba Mahasiswa UMPKU Surakarta**. Proyek ini **bukan** proyek baru dari nol. Sebagian fitur lomba mungkin sudah terimplementasi; audit dulu, lalu buat hanya yang belum ada atau belum benar.

**Aturan tidak dapat ditawar:**

1. Buka workspace proyek existing. **Jangan** membuat proyek Next.js/Laravel baru, database baru, atau migrasi ulang seluruh sistem tanpa persetujuan eksplisit.
2. Baca `PROJECT_CONTEXT.md`, dokumen ini, dan `SUPERPROMPT_UX_DESKTOP_FINAL.md`; cocokkan dengan source code aktual.
3. **Satu tahap per persetujuan.** Selesaikan satu tahap, jalankan tes yang benar-benar tersedia, laporkan, lalu **STOP**. Jangan otomatis mengerjakan tahap berikutnya.
4. Jangan menghapus atau mengubah data, file storage, migration historis, autentikasi, atau konfigurasi rahasia hanya agar proyek tampak bersih.
5. Prioritaskan perilaku nyata di aplikasi, bukan mockup, tombol palsu, atau demo statis.
6. Utamakan kesederhanaan UI desktop dan kemudahan penggunaan mahasiswa awam, tanpa AI slop.
7. Perubahan harus kecil, dapat ditinjau, dan dapat dipulihkan. Jangan commit/push tanpa persetujuan.
8. Jangan klaim fitur, screenshot, tes, atau browser check berhasil jika tidak benar-benar dilakukan.

## 2. KONTEKS DAN BATAS TEKNOLOGI

Struktur yang diharapkan (periksa, jangan asumsikan):

```text
beritaweb/
├── frontend/                 # Next.js / React / TypeScript / Tailwind
├── backend1/                 # Laravel API + Blade admin
├── PROJECT_CONTEXT.md       # dokumentasi kondisi sebenarnya; perbarui setelah verifikasi
├── MASTER_SUPERPROMPT_FINAL.md
└── SUPERPROMPT_UX_DESKTOP_FINAL.md
```

- Gunakan versi Next.js, React, Laravel, PHP, dan dependensi yang **benar-benar terpasang**; jangan upgrade massal.
- Pertahankan mekanisme Laravel Sanctum, Google OAuth Socialite, dan admin Blade yang sudah berfungsi.
- Pertahankan database existing (misalnya `berita_db` bila memang masih digunakan) beserta data historis. Jangan pernah `migrate:fresh`, `db:wipe`, `DROP TABLE`, atau menghapus upload existing tanpa izin khusus.
- Base URL lokal yang terdokumentasi: frontend `http://localhost:3000`, backend `http://127.0.0.1:8000`, API `/api`, admin `/admin`. Verifikasi `.env` tanpa mempublikasikan rahasia.
- Jika `PROJECT_CONTEXT.md` masih berisi identitas akun, password, token, atau secret, jangan mengutipnya. Laporkan risiko dan sarankan pemindahan/rotasi yang aman.

## 3. KONSEP BISNIS DAN MODEL AKSES

Nama kerja: **Portal Informasi Lomba Mahasiswa UMPKU Surakarta**; branding sementara **UMPKU Lomba**, kecuali UI existing memakai nama lain yang sudah disetujui.

Tujuan: mahasiswa dapat mencari dan berbagi informasi kompetisi yang relevan dengan program studi mereka. Sumber lomba dapat internal kampus, regional, nasional, antaruniversitas, atau internasional selama relevan bagi mahasiswa UMPKU. Website **bukan** sistem pendaftaran peserta; tombol pendaftaran mengarah ke situs resmi penyelenggara.

**PUBLIC READ — AUTHENTICATED WRITE — ADMIN MODERATION:**

| Peran | Hak utama |
|---|---|
| Pengunjung | Baca beranda, jelajah dan detail lomba approved; cari, filter, buka sumber/pendaftaran; tidak wajib login |
| User login | Hak pengunjung + kirim lomba, unggah poster, lihat dashboard miliknya, edit/revisi miliknya, lihat alasan penolakan |
| Admin | Verifikasi, setujui, tolak dengan alasan, kelola lomba, kategori, program studi, pengguna sesuai izin, serta Customer Service |

Semua otorisasi ditegakkan di **Laravel**, bukan dengan menyembunyikan tombol saja. `user_id`, `status`, dan `reviewed_by` tidak boleh dipercaya dari klien.

**Moderasi** `pending`, `approved`, `rejected` berbeda dari **status pendaftaran** (dibuka, segera ditutup, ditutup berdasarkan deadline waktu `Asia/Jakarta`). Untuk edit pada konten approved, nilai perubahan jangan otomatis menjadi publik: audit dan terapkan mekanisme review versi/revisi yang aman sebelum mengubah kontrak API.

## 4. FITUR YANG DILINDUNGI DARI CLEANUP

Wajib **dipertahankan dan diuji regresinya**, sejauh telah terimplementasi:

- Login, register, logout, akun/profil, Google SSO, Laravel Sanctum, role dan otorisasi.
- Beranda, jelajah lomba, pencarian/filter/pagination, detail lomba, deadline, kategori, rekomendasi prodi.
- Form tambah/edit lomba, poster WebP, dashboard user, alasan penolakan, moderasi Admin Panel Blade.
- **Customer Service chat dua arah** beserta histori dan relasinya; jangan menghapus relasi `news_id` sebelum analisis migrasi.
- **Voice / Text-to-Speech (Web Speech API, bahasa Indonesia)** dan **AccessibilityWidget**. Fitur Voice bukan legacy code. Pada detail lomba, pembacaan dapat meliputi judul, deadline, persyaratan, dan deskripsi; pertahankan kontrol yang sudah ada, evaluasi play/pause/resume/stop sebagai peningkatan bila belum tersedia. Bersihkan speech saat navigasi/unmount; uji dukungan browser dan jangan mengklaim dukungan universal.
- Dark/Light Mode, navigasi, upload, dan interaksi utama yang sudah bekerja.

Jangan membuang implementasi yang sudah selesai hanya karena dokumen lama menyebutnya sebagai tahap rencana. Status fitur harus dibuktikan dari source code dan pengujian.

## 5. DESKTOP-ONLY POLICY — KEPUTUSAN PRODUK TERBARU

**Desktop/laptop adalah target produk. Jangan melakukan optimasi mobile/tablet sebagai scope baru.** Sasaran uji: **1280×720, 1366×768, 1440×900, 1920×1080**, serta perubahan ukuran jendela dan browser zoom desktop.

- Navbar horizontal, layout desktop yang memanfaatkan ruang dengan proporsional; max-width sekitar 1152–1280px bila sesuai.
- Grid lomba menyesuaikan jumlah data: satu kartu dapat horizontal/lebar, dua kartu 2 kolom, tiga+ hingga 3 kolom jika tersedia ruang. Jangan membuat whitespace kosong yang tampak tidak disengaja.
- Form maksimal sekitar 680–800px atau ukuran proporsional; tidak terlalu panjang ke samping.
- Jangan menghapus breakpoint Tailwind yang sudah ada secara massal. Perubahan desktop **tidak boleh sengaja merusak** tampilan lain, tetapi tidak perlu membangun navigasi atau varian khusus mobile baru.
- Optimalkan penggunaan mouse, keyboard, focus, browser zoom, scroll, dan modal pada laptop beresolusi 1366×768.
- Seluruh halaman, termasuk admin, harus mudah dibaca; jangan menggunakan font kecil untuk informasi penting.

## 6. DESIGN SYSTEM DAN ANTI-AI-SLOP

Gaya: **minimal, content-first, fungsional, institusional, ramah mahasiswa awam**. Pertahankan aksen oranye/gelap yang sudah dipakai proyek; jangan menyatakan oranye sebagai warna resmi kampus tanpa verifikasi aset/pedoman.

**Hindari:** gradient dekoratif, glassmorphism, neon/glow, 3D generik, floating ornaments, hero penuh layar, badge berwarna-warni tanpa makna, rounded/shadow berlebihan, card bersarang, grafik/statistik fiktif, copywriting bombastis, animasi tanpa fungsi, dan ikon untuk setiap kalimat.

**Gunakan:** hierarchy tipografi konsisten; body ±14–16px, helper ±13–14px bila relevan; teks/label kontras; whitespace terukur; border sederhana; 1 aksi utama per area; feedback loading/sukses/error; empty state yang mengarahkan tindakan; semua teks UI Bahasa Indonesia jelas. Tidak ada tombol dekoratif atau fitur palsu. Upayakan WCAG 2.2 AA pada alur utama. Pedoman detail di `SUPERPROMPT_UX_DESKTOP_FINAL.md`.

## 7. HALAMAN DAN TARGET PERILAKU

### 7.1 Beranda `/`
- Hero ringkas dengan nilai manfaat, search mudah ditemukan, tautan ke Jelajah Lomba dan CTA Tambah Informasi Lomba.
- Bagian lomba terbaru dan deadline terdekat, berdasarkan data nyata.
- Card memprioritaskan judul, poster, penyelenggara, prodi, deadline, status, detail.
- Layout adaptif terhadap **jumlah** kompetisi, bukan grid 3 kolom kosong.

### 7.2 Jelajah `/lomba`
- Search judul/penyelenggara sesuai kemampuan API, filter utama kategori dan prodi; filter lanjut untuk status/deadline/urutan sesuai kebutuhan.
- Query parameter untuk state filter yang dapat dibagikan, reset filter, hasil kosong yang bermakna, jumlah hasil, pagination server-side.
- Status deadline akurat berdasarkan Asia/Jakarta. Tidak perlu countdown timer setiap kartu.

### 7.3 Detail `/lomba/[slug]`
- Nama lomba, penyelenggara, poster, kategori, tingkat lomba, deskripsi, persyaratan, prodi sesuai, biaya, deadline, sumber, kontak jika ada, pengirim, publikasi.
- CTA `Daftar di Website Penyelenggara` dengan URL tervalidasi dan penanganan lomba yang sudah tutup.
- Integrasikan Voice/TTS yang telah tersedia dan pastikan tidak mengganggu navigasi.

### 7.4 Tambah Lomba `/lomba/tambah`
- Form **tiga langkah**: (1) Informasi Dasar; (2) Ketentuan & Sasaran; (3) Poster & Pendaftaran.
- Kolom sesuai model aktual: judul, penyelenggara, kategori, tingkat, tipe peserta bila tersedia, deskripsi, syarat, deadline, prodi multi-select, biaya, poster, URL pendaftaran, kontak, sumber.
- Label jelas, contoh input wajar, field wajib ditandai, error dekat field, pertahankan data ketika berpindah langkah, ringkasan sebelum kirim.
- Prodi bersumber dari master data aktual kampus; jangan mengarang prodi resmi. `Semua Program Studi` harus ditangani tanpa data kontradiktif.
- Poster JPG/PNG/WebP: validasi MIME/ukuran, preview/replace/remove, konversi aman di backend jika sudah tersedia.
- Hasil kiriman masuk `pending` dan user diberi feedback bahwa perlu verifikasi.
- Draf/auto-save hanya boleh diberi tombol jika benar-benar persisten, dapat dipulihkan, dan telah diuji.

### 7.5 Dashboard `/dashboard`
- Statistik pengajuan berdasar **semua data**, bukan hanya 50 item pertama dari pagination; gunakan ringkasan server/metadata yang sesuai.
- Filter semua/pending/approved/rejected; empty state yang membantu user pertama kali; alasan penolakan + aksi Perbaiki.
- Edit dan hapus harus aman, sesuai Policy dan model revisi. Jika edit form belum mencakup field lomba, audit dan arahkan ke form reusable; jangan membuang field diam-diam.
- Error fetch harus terlihat dan bisa retry; keberadaan token di localStorage bukan bukti sesi valid.

### 7.6 Admin Laravel Blade `/admin`
- Dashboard metrik, antrean moderasi, detail, approve/reject dengan alasan, kelola kategori/prodi, chat CS.
- Jangan mengubah struktur backend/admin tanpa bukti kebutuhan; audit implementasi existing.

### 7.7 Login/Register
- Pertahankan username/email dan Google SSO existing; tampilkan validasi yang jelas; periksa keamanan token OAuth yang diberikan melalui query string bila ada.

## 8. DATA, API, DAN KONSISTENSI

Gunakan struktur existing yang terverifikasi, jangan membuat migration duplikat hanya karena dokumen ini menyebut skema ideal. Domain utama dapat mencakup `competitions`, `categories`, `study_programs`, pivot `competition_study_program`, `users`, dan `customer_service_messages`. Jika belum ada, ajukan migration tambahan yang aman. Jangan membuat prodi fiktif.

Field kompetisi yang diharapkan sepanjang memang didukung model kebutuhan: `id`, `user_id`, `category_id`, `title`, `slug`, `organizer`, `competition_level`, `description`, `requirements`, `registration_deadline`, `registration_url`, `registration_fee`, `contact`, `source_url`, `poster`, `status`, `rejection_reason`, `reviewed_by`, `reviewed_at`, `published_at`, timestamps; penanganan tipe kepesertaan jika sudah ada.

Kontrak API target (verifikasi nama dan metode existing sebelum perubahan):

```http
GET /api/competitions
GET /api/competitions/{slug}
GET /api/categories
GET /api/study-programs
GET /api/my/competitions
POST /api/competitions
PATCH /api/competitions/{id}
```

Admin dapat menggunakan controller Blade internal tanpa memaksa API HTTP. API publik hanya lomba approved. Gunakan Laravel Form Requests, Policies, Resources bila sesuai. Filter, sorting, dan pagination harus konsisten. Tanggal `registration_deadline` tidak boleh disamakan dengan tanggal acara.

## 9. SMART IMPORT UNIVERSAL — TAHAP FITUR TERPISAH

**Tujuan:** pengguna dapat memasukkan **berbagai URL informasi lomba**, **mengunggah poster**, atau **memindai QR pada poster** agar field form terisi otomatis. Bukan hanya Instagram.

**Metode input:**
1. URL halaman web/artikel/pengumuman/pendaftaran yang dapat diakses secara sah (termasuk media sosial bila tersedia akses resmi yang sesuai).
2. Poster JPG/PNG/WebP yang user upload.
3. QR Code di poster gambar, dan opsional QR melalui kamera **desktop** bila benar-benar dibutuhkan dan diizinkan pengguna (bukan prioritas).
4. Caption/teks manual sebagai fallback.

**Pipeline wajib:**
1. Validasi sumber dan format file.
2. Decode QR dengan decoder deterministik (mis. ZXing): jangan memakai AI untuk **menebak** isi QR yang gagal didekode.
3. Jika QR memiliki lebih dari satu URL, tampilkan pilihan; QR tidak selalu link pendaftaran (bisa formulir, informasi, pembayaran, atau tautan lain).
4. Validasi keamanan URL; fetch hanya sumber yang publik dan diizinkan. Jangan bypass login, CAPTCHA, private content, atau pembatasan layanan.
5. Ekstrak metadata dan teks halaman yang tersedia; proses poster memakai AI multimodal/vision.
6. Gabungkan hasil dengan provenance per field; jika data poster/website bertentangan, tampilkan konflik dan minta user memilih.
7. Return JSON berschema ketat; isi yang tidak ditemukan = `null`/kosong. **Jangan halusinasi** deadline, URL, penyelenggara, biaya, atau prodi.
8. Petakan kategori/prodi ke master DB; AI boleh merekomendasikan, tetapi tidak boleh mengklaim persyaratan resmi jika tidak ada bukti.
9. Isi form existing, tandai `Ditemukan`, `Perlu Diperiksa`, `Tidak Ditemukan`, dan biarkan user edit.
10. User tetap harus menekan `Kirim untuk Diperiksa`; status awal `pending`, bukan auto-publish.

**Keamanan teknis:** route import dilindungi Sanctum dan rate limit; pemrosesan server-side, secrets tidak ke frontend; proteksi SSRF (IP internal/loopback/metadata, DNS rebinding, redirect, size dan timeout), MIME, ukuran gambar, HTML tak tepercaya, XSS, prompt injection, model output validation. Gunakan service AI modular; jelaskan biaya layanan jika diperlukan. Kegagalan akses Instagram/situs lain harus menghasilkan fallback yang tetap bisa dipakai, bukan error buntu.

**Target UI:** Dua opsi di atas form: `Isi Otomatis` dan `Isi Manual`. Input URL/poster, tombol pemrosesan yang benar-benar berfungsi hanya ketika backend siap, preview hasil, kemudian tetap menggunakan form tiga langkah. Jangan membuat dashboard AI yang kompleks.

**Urutan sub-tahap (masing-masing STOP):**
- SI-0: audit kesiapan, metode resmi, biaya, security threat model.
- SI-1: upload poster + QR decode gambar + preview URL.
- SI-2: AI Vision poster + structured extraction + fallback.
- SI-3: universal URL extraction dari sumber yang diizinkan.
- SI-4: merge, provenance, conflict review, autofill form.
- SI-5: tes fitur nyata, keamanan, performa, UX desktop.

## 10. LEGACY CODE AUDIT & SAFE CLEANUP

Karena proyek berasal dari Portal Berita, cari referensi `news`, `article`, `author`, route `/create`, News controller/model/API, asset berita, CSS lama, import mati, utility duplikat, relasi CS `news_id`, Blade, migration, dynamic imports, dan fungsi terkait.

**Klasifikasi hasil:** `KEEP`, `REFACTOR`, `SAFE DELETE CANDIDATE`, `ARCHIVE/RETAIN FOR MIGRATION`.

Untuk setiap kandidat hapus laporkan path, fungsi, referensi yang diperiksa, alasan, tingkat kepastian, dampak, risiko, tes yang diperlukan. **Nama file saja bukan bukti bahwa file tidak dipakai.** Migration historis, data, riwayat chat, auth, Voice/TTS, widget aksesibilitas, dan Customer Service bukan kandidat hapus otomatis.

**Eksekusi:** audit read-only → persetujuan → hapus unused imports/dead code yang pasti → tes → persetujuan → cleanup route/asset legacy yang terbukti tidak dipakai → tes → persetujuan → refactor file besar. Jangan gabungkan cleanup, redesign, perubahan database, dan Smart Import dalam satu batch.

## 11. CLEAN CODE — TANPA OVERENGINEERING

- `page.tsx` bertugas menjadi entry point dan composition; pindahkan API, validasi, state rumit, dialog edit/hapus, dan uploader menjadi service/hook/komponen ketika tanggung jawab berbeda.
- File 400+ baris wajib diperiksa; **bukan** otomatis harus dipotong menjadi maksimal N baris. Audit file Create yang sebelumnya ~625 baris dan Dashboard ~716 baris, tetapi verifikasi versi sekarang.
- Pisahkan `CompetitionForm`, `PosterUploader`, `CompetitionList`, `DashboardStats`, modal edit/hapus, dan API service bila masih relevan, bukan hanya untuk mengurangi line count.
- Hindari request API di banyak tempat, state duplikat, `any`, nested JSX kompleks, dan logika bisnis di komponen visual. Jangan memperkenalkan library state global atau Repository Pattern tanpa alasan.
- `URL.createObjectURL` harus dipakai dengan cleanup `URL.revokeObjectURL`; validasi file jangan hanya di UI.
- Backend controller fokus pada transport; FormRequest/Policy/Service sesuai kompleksitas; jangan letakkan semua AI extraction dalam satu controller.
- Refactor harus mempertahankan perilaku, fitur, URL, aksesibilitas, dan kontrak API sampai perubahan eksplisit disetujui.

## 12. KEAMANAN, PRIVASI, DAN KUALITAS

- Otorisasi Laravel server-side, mass assignment control, CSRF sesuai mode auth, rate limit, input validation, sanitasi rich text, upload safe, output encoding, akses URL eksternal aman, error tanpa bocor stack trace.
- Jangan log secrets/token; periksa Google SSO token di URL dan localStorage sebagai risiko, tetapi jangan rewrite autentikasi tanpa rencana regresi.
- Aksesibilitas keyboard, focus modal, Escape, restore focus, label/role, status feedback; Voice/TTS diuji pada browser desktop yang tersedia.
- SEO: metadata, judul, OpenGraph detail, canonical/sitemap khusus lomba approved, tanpa kebocoran pending.
- Kinerja: server pagination, gambar teroptimasi, lazy load, hindari request duplikat dan rerender tidak perlu; jangan mengorbankan akurasi statistik.

## 13. ROADMAP YANG SESUAI KONDISI PROYEK SEKARANG

**Jangan reset progres.** Sebelum tiap tahap, tentukan apakah `SUDAH ADA & LOLOS`, `ADA TAPI PERLU PERBAIKAN`, atau `BELUM ADA`. Tahap lengkap yang sudah benar tidak perlu diimplementasikan ulang.

| Tahap | Tujuan | Batas scope |
|---|---|---|
| A0 | Audit kondisi aktual + pemetaan dokumen | Read-only, laporan |
| A1 | Legacy cleanup aman | Hanya batch disetujui dan diuji |
| A2 | Refactor area bermasalah | Perubahan struktur tanpa regresi |
| U0–U5 | Penyempurnaan UX desktop | Ikuti `SUPERPROMPT_UX_DESKTOP_FINAL.md` |
| F0 | Audit gap fitur inti lomba + keamanan | Rencana saja, tidak rewrite |
| F1 | Tutup gap fitur inti (bila ada) | Database/API/form/dashboard/admin per sub-tahap |
| SI-0–SI-5 | Smart Import universal/QR/AI | Satu sub-tahap per persetujuan |
| QA | Regression, desktop visual QA, security, docs | Laporan akhir, bukan klaim tanpa tes |

Jika pengguna sudah meminta fokus UX, jalankan `U0` terlebih dahulu setelah audit ringan yang diperlukan; jangan memaksa mengulang A0 atau membangun fitur yang sudah selesai. Jangan memulai cleanup dan UX secara bersamaan.

## 14. PENGUJIAN WAJIB

**Frontend:** lint jika tersedia, TypeScript check (`tsc --noEmit` bila sesuai), build, browser interaction yang tersedia, auth, filter/search, form step/persistence/error, dashboard, tema, Voice/TTS, AccessibilityWidget, Customer Service, modal. **Desktop visual:** 1280×720, 1366×768, 1440×900, 1920×1080, termasuk scroll/zoom dan layar kosong/1 item/banyak item. Screenshot jika benar-benar dapat diambil.

**Backend:** `php artisan test`/tes yang relevan; auth, Policy, public approved-only, ownership, moderation, deadline, data validation, upload, pagination/aggregate stats, CS. Jangan mengubah DB real hanya untuk tes; gunakan environment testing terisolasi.

Jika suatu tes tidak tersedia/tidak dapat dijalankan, tulis `TIDAK DIJALANKAN` beserta alasan. Bedakan `lulus`, `gagal`, dan `belum diuji`. Jangan mengklaim support browser universal.

## 15. FORMAT LAPORAN SETIAP TAHAP

1. Nama tahap, tujuan, dan status (`SELESAI & TERVERIFIKASI`, `SELESAI DENGAN CATATAN`, `BELUM SELESAI`).
2. Temuan dan tingkat urgensi, ditautkan ke path atau bukti di source code.
3. Perubahan nyata: path file dibuat/diubah/dihapus, fungsi masing-masing.
4. Dampak pada data, API, auth, moderasi, Voice/TTS, CS, aksesibilitas.
5. Pengujian yang **benar-benar dilakukan**: perintah, hasil, kegagalan.
6. Hasil UX desktop pada viewport yang diuji; screenshot jika tersedia.
7. Risiko, keterbatasan, dan hal yang belum diuji.
8. Rekomendasi batch/tahap berikutnya.
9. **STOP dan tanya izin untuk tahap berikutnya.**

## 16. DEFINITION OF DONE

- Portal publik bisa membaca lomba approved tanpa login.
- User login bisa mengirim dan mengelola miliknya; admin memoderasi; hak akses server aman.
- Judul, prodi, deadline, sumber, link pendaftaran dan status jelas.
- UX desktop beranda, jelajah, detail, form tiga langkah, dashboard, dan admin teruji pada resolusi target.
- Loading, empty, error, validasi, fokus keyboard, tema berfungsi.
- Login/Google SSO, Customer Service, Voice/TTS, aksesibilitas dan data lama yang relevan tidak mengalami regresi.
- Legacy code yang dihapus benar-benar terbukti tak dipakai; migration/riwayat tidak dihapus secara ceroboh.
- Smart Import (bila sudah dijalankan sampai SI-5) mampu memproses poster + QR secara nyata, URL yang dapat diakses sah, menampilkan konflik/field kosong, dan tetap meminta verifikasi user/admin.
- Pengujian dilaporkan secara jujur; `PROJECT_CONTEXT.md` diperbarui **setelah** verifikasi, tanpa secrets.

## 17. PERINTAH PERTAMA UNTUK AGENT

**SEKARANG LAKUKAN AUDIT READ-ONLY**, bukan implementasi: baca dokumentasi dan source code aktual, tunjukkan status fitur yang sudah ada, daftar warisan Portal Berita, risiko hapus, kesiapan UX desktop, status Voice/TTS, dan kesiapan Smart Import. Jika ada tahap yang sudah selesai, jangan ulangi.

Berikan rekomendasi **SATU** tahap terdekat yang paling masuk akal, berdasarkan prioritas user terbaru. **Jangan** mengubah kode, database, konfigurasi, atau file apa pun pada langkah ini. Setelah laporan, **STOP** dan minta persetujuan sebelum melakukan perubahan.
