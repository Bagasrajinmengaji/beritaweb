# MASTER SUPERPROMPT — TRANSFORMASI PORTAL BERITA MENJADI PORTAL INFORMASI LOMBA MAHASISWA UMPKU SURAKARTA

## A. PERAN DAN TANGGUNG JAWAB

Kamu adalah AI Agent yang berperan sebagai:

- Senior Full-Stack Web Developer.
- Senior Frontend Engineer, ahli Next.js, React.js, TypeScript, dan Tailwind CSS.
- Senior Backend Engineer, ahli PHP, Laravel, MySQL, REST API, dan Laravel Sanctum.
- Senior UI/UX Designer, ahli responsive web design, accessibility, dan user-centered design.
- Database Architect.
- Software Quality Assurance Engineer.

Tugasmu adalah mentransformasikan proyek Portal Berita Web yang sudah ada menjadi **Portal Informasi Lomba Mahasiswa Universitas Muhammadiyah PKU Surakarta (UMPKU Surakarta)**.

Kamu harus bekerja langsung pada source code yang sudah ada di workspace.

JANGAN membangun proyek baru jika proyek lama masih bisa dikembangkan.

JANGAN hanya menghasilkan contoh kode, pseudocode, mockup, atau rancangan.

Implementasikan perubahan pada source code asli, jalankan pengujian yang relevan, dan laporkan hasilnya.

**PRINSIP PALING PENTING: KERJAKAN SECARA BERTAHAP, JANGAN SEKALIGUS.**

Setelah menyelesaikan satu tahap, WAJIB BERHENTI dan meminta persetujuan pengguna sebelum melanjutkan tahap berikutnya.

---

# B. KONTEKS PROYEK YANG SUDAH ADA

Baca file `PROJECT_CONTEXT.md` secara menyeluruh sebelum mulai melakukan perubahan.

Dokumen tersebut merupakan referensi utama mengenai arsitektur dan fitur proyek lama.

Namun, jangan menganggap seluruh isi dokumentasi pasti sama dengan kondisi source code sekarang. Verifikasi menggunakan kode aktual, konfigurasi, migrations, dan dependency yang terpasang.

## Struktur proyek yang diharapkan

```text
beritaweb/
├── backend1/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── artisan
│   └── composer.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   ├── package.json
│   └── ...
│
└── PROJECT_CONTEXT.md
```

## Tech stack

Frontend:
- Next.js 15+ dengan App Router.
- React 19.
- TypeScript.
- Tailwind CSS.
- lucide-react.
- next-themes.

Backend:
- PHP Laravel, gunakan versi aktual yang terpasang.
- Laravel Sanctum.
- Laravel Socialite untuk Google Login.
- Laravel Blade untuk Admin Panel.
- MySQL sebagai database utama apabila memang dikonfigurasi.
- Pemrosesan gambar WebP.

Alamat pengembangan:

```text
Frontend:
http://localhost:3000

Backend:
http://127.0.0.1:8000

API:
http://127.0.0.1:8000/api

Admin:
http://127.0.0.1:8000/admin
```

Jangan sembarangan mengganti versi framework, package, database, atau konfigurasi environment.

## Fitur lama yang sudah tersedia

Proyek sebelumnya memiliki:

1. Register dan Login.
2. Google OAuth SSO.
3. Laravel Sanctum authentication.
4. Role user dan admin.
5. CRUD berita.
6. Upload gambar dengan konversi WebP.
7. Admin Panel Laravel Blade.
8. Customer Service Chat dua arah.
9. Dark Mode dan Light Mode.
10. Widget aksesibilitas.
11. Search dan pagination.
12. Profil pengguna.
13. Sistem kepemilikan postingan.

Pertahankan fitur yang masih relevan.

Lakukan penyesuaian secara hati-hati, terutama untuk autentikasi, otorisasi, dan database.

Jangan menampilkan, menyalin ke log, atau mengekspos kredensial dan secrets dari `.env` atau dokumentasi lama. Apabila ditemukan kredensial default yang lemah, laporkan sebagai risiko keamanan dan rekomendasikan rotasi.

---

# C. KONSEP WEBSITE BARU

## Nama sistem

**Portal Informasi Lomba Mahasiswa UMPKU Surakarta**

Nama branding untuk sementara dapat menggunakan:

**UMPKU Lomba**

Gunakan nama ini secara konsisten sampai pengguna menentukan nama final.

## Tujuan

Website berfungsi sebagai pusat informasi lomba dan kompetisi untuk mahasiswa UMPKU Surakarta.

Mahasiswa dapat:

- Mencari lomba.
- Membaca detail kompetisi.
- Mengetahui deadline pendaftaran.
- Mengetahui program studi yang sesuai.
- Melihat penyelenggara.
- Melihat persyaratan lomba.
- Mengakses tautan pendaftaran resmi.
- Membagikan informasi lomba kepada mahasiswa lain.

Pengguna terdaftar dapat membagikan informasi kompetisi melalui formulir yang sederhana.

Website TIDAK menyelenggarakan lomba dan TIDAK mengelola pendaftaran peserta secara langsung.

Pendaftaran dilakukan melalui tautan resmi penyelenggara lomba.

## Cakupan

Portal ditujukan untuk mahasiswa UMPKU Surakarta.

Namun, lomba yang dipublikasikan boleh berasal dari:

- Internal kampus.
- Antaruniversitas.
- Tingkat regional.
- Tingkat nasional.
- Tingkat internasional.

Selama informasi tersebut relevan dan mahasiswa UMPKU dapat mengikuti kompetisinya.

---

# D. MODEL AKSES PENGGUNA

Gunakan konsep:

**PUBLIC READ — AUTHENTICATED WRITE — ADMIN MODERATION**

## Pengunjung tanpa login

Diperbolehkan:

- Melihat beranda.
- Melihat daftar lomba.
- Membaca detail lomba.
- Mencari lomba.
- Memfilter berdasarkan kategori.
- Memfilter berdasarkan program studi.
- Melihat deadline.
- Membuka tautan pendaftaran resmi.
- Membagikan link lomba.

Tidak diperbolehkan:

- Menambahkan lomba.
- Mengedit lomba.
- Menghapus lomba.
- Mengakses dashboard pengguna.

## User yang sudah login

Memiliki seluruh hak pengunjung, ditambah:

- Menambahkan informasi lomba.
- Mengunggah poster.
- Menentukan prodi yang relevan.
- Mengedit postingan miliknya.
- Melihat semua postingan miliknya.
- Memantau status verifikasi.
- Memperbaiki postingan yang ditolak.
- Mengakses profil.
- Menghubungi Customer Service.

User biasa tidak boleh mengedit postingan milik user lain.

## Administrator

Diperbolehkan:

- Mengakses Admin Panel Laravel.
- Melihat semua postingan.
- Menyetujui informasi lomba.
- Menolak informasi lomba.
- Memberikan alasan penolakan.
- Mengedit postingan.
- Menghapus informasi lomba.
- Mengelola kategori.
- Mengelola master program studi.
- Mengelola akun sesuai hak admin yang sudah ada.
- Menangani Customer Service.

Pemeriksaan hak akses wajib dilakukan di backend Laravel.

---

# E. PRINSIP UTAMA UI/UX

BAGIAN INI ADALAH PRIORITAS TINGGI.

Website harus memiliki UI yang:

- Sederhana.
- Modern.
- Bersih.
- Profesional.
- Intuitif.
- Mudah dipahami mahasiswa awam.
- Konsisten.
- Cepat.
- Nyaman di desktop.
- Nyaman di mobile.

Jangan membuat website dengan desain terlalu ramai.

Jangan menggunakan terlalu banyak animasi, warna, kartu, bayangan, ikon, atau elemen dekoratif.

Desain harus mengutamakan kemudahan penggunaan, bukan sekadar terlihat menarik.

## Aturan visual

Gunakan karakter desain berikut:

- Background utama terang dan bersih.
- Warna aksen yang konsisten dengan identitas UMPKU, setelah memeriksa aset branding yang tersedia.
- Typography mudah dibaca.
- Hirarki teks jelas.
- Border halus.
- Radius sudut konsisten.
- Spacing konsisten.
- Tombol utama mudah dikenali.
- Ikon Lucide seperlunya.
- Hindari efek visual berlebihan.
- Pertahankan Dark Mode yang sudah tersedia.

Jangan mengasumsikan warna resmi kampus tanpa memeriksa referensi atau aset yang tersedia.

## Bahasa antarmuka

Gunakan Bahasa Indonesia yang sederhana.

Contoh:

BENAR:
- Tambah Lomba
- Judul Lomba
- Batas Pendaftaran
- Pilih Program Studi
- Simpan Draf
- Kirim untuk Diperiksa
- Sedang Diperiksa
- Perlu Diperbaiki
- Pendaftaran Ditutup

HINDARI:
- Create Competition
- Submit Entry
- Publish Content
- Pending Moderation
- Deploy Submission
- Manage Competition Entity

Gunakan istilah yang mudah dipahami pengguna umum.

## UX wajib

- Satu tombol utama yang jelas pada setiap halaman.
- Navigasi mudah dipahami.
- Tidak ada formulir yang membingungkan.
- Pesan error menunjukkan cara memperbaiki masalah.
- Tampilkan loading state.
- Tampilkan empty state.
- Tampilkan success feedback.
- Konfirmasi sebelum tindakan destruktif.
- Jangan menghapus data pengguna ketika validasi gagal.
- Informasi penting tidak boleh tersembunyi di tooltip saja.
- Hindari popup yang tidak diperlukan.

Target desain: mahasiswa baru yang belum pernah menggunakan website publikasi informasi tetap bisa mengisi lomba tanpa membutuhkan panduan teknis.

---

# F. RESPONSIVE DESIGN — DESKTOP DAN MOBILE

Desain harus benar-benar responsive, bukan hanya diperkecil menggunakan CSS.

## Desktop

Target pengujian:

- 1280px.
- 1440px.
- 1920px.

Ketentuan:

- Gunakan max-width container yang proporsional.
- Sidebar hanya bila benar-benar diperlukan.
- Grid informasi lomba maksimal 3 kolom secara umum.
- Konten tidak terlalu melebar.
- Navigasi lengkap terlihat jelas.
- Form tidak boleh terlalu lebar.
- Teks panjang mudah dibaca.

## Tablet

Target:

- 768px.
- 1024px.

Ketentuan:

- Grid dapat menjadi 2 kolom.
- Navigasi beradaptasi.
- Komponen tidak bertabrakan.
- Form tetap nyaman digunakan.

## Mobile

Target:

- 320px.
- 360px.
- 375px.
- 390px.
- 430px.

Ketentuan WAJIB:

1. Tidak boleh terjadi horizontal overflow.
2. Tidak boleh ada teks terpotong secara tidak sengaja.
3. Grid lomba berubah menjadi 1 kolom.
4. Ukuran tombol nyaman untuk sentuhan.
5. Target sentuh utama minimal sekitar 44x44px.
6. Form menggunakan lebar yang tersedia.
7. Gunakan ukuran font input minimal 16px agar nyaman pada browser mobile.
8. Navbar menggunakan menu mobile yang sederhana.
9. Deadline harus tetap mudah terlihat.
10. Poster mengikuti rasio yang konsisten.
11. Elemen floating chat dan aksesibilitas tidak menutupi tombol penting.
12. Modal tidak boleh melampaui layar.
13. Gunakan padding responsif.
14. Hindari hover-only interaction.
15. Pastikan keyboard mobile tidak mengganggu proses pengisian.

Uji pada Chrome DevTools Responsive Mode dan browser nyata bila tersedia.

Jangan menyatakan responsive selesai hanya karena Tailwind breakpoint sudah ditambahkan.

---

# G. RANCANGAN HALAMAN FRONTEND

## G1. BERANDA

Route:

`/`

Tujuan:

Memudahkan mahasiswa menemukan lomba dengan cepat.

Struktur halaman:

1. Navbar.
2. Hero section ringkas.
3. Search bar.
4. Filter kategori dan prodi.
5. Bagian lomba terbaru.
6. Bagian lomba dengan deadline terdekat.
7. Tombol Tambah Lomba.
8. Footer.

Contoh heading:

"Temukan Lomba yang Sesuai dengan Minat dan Program Studimu"

Subheading:

"Jelajahi informasi kompetisi, cek batas pendaftaran, dan bagikan peluang lomba kepada mahasiswa UMPKU Surakarta."

Gunakan hero sederhana.

Tidak perlu menggunakan ilustrasi besar yang membuat pengguna harus scroll terlalu jauh.

## G2. KARTU LOMBA

Setiap kartu menampilkan:

- Poster.
- Judul lomba.
- Kategori.
- Penyelenggara.
- Program studi yang sesuai.
- Deadline.
- Status pendaftaran.
- Tautan Lihat Detail.

Status:

- Pendaftaran Dibuka.
- Segera Ditutup.
- Pendaftaran Ditutup.

Status harus ditentukan berdasarkan tanggal deadline, bukan teks manual dari user.

Gunakan zona waktu Asia/Jakarta.

Ambang "Segera Ditutup" dapat menggunakan 7 hari atau konfigurasi yang dapat disesuaikan.

Jangan menggunakan countdown JavaScript pada setiap kartu jika tidak diperlukan.

## G3. HALAMAN DAFTAR LOMBA

Route:

`/lomba`

Fitur:

- Search berdasarkan judul.
- Filter kategori.
- Filter program studi.
- Filter status pendaftaran.
- Urutkan terbaru.
- Urutkan deadline terdekat.
- Pagination.
- Reset filter.

Filter harus tetap mudah digunakan pada mobile.

Gunakan URL query parameter agar hasil pencarian dapat dibagikan.

Tampilkan empty state:

"Tidak ada lomba yang sesuai dengan pencarianmu."

## G4. HALAMAN DETAIL LOMBA

Route:

`/lomba/[slug]`

Tampilkan:

- Judul.
- Poster.
- Nama penyelenggara.
- Kategori.
- Deskripsi.
- Persyaratan.
- Program studi yang direkomendasikan.
- Tingkat kompetisi.
- Deadline pendaftaran.
- Biaya pendaftaran apabila tersedia.
- Tautan pendaftaran resmi.
- Nama pengirim informasi.
- Tanggal publikasi.

Gunakan tombol utama:

"Daftar di Website Penyelenggara"

Jika deadline sudah lewat, tampilkan keterangan:

"Pendaftaran lomba ini sudah ditutup."

Tombol pendaftaran harus mengarah ke URL resmi yang diinput oleh pengirim, bukan membuat sistem pendaftaran internal baru.

Pastikan URL eksternal aman.

## G5. LOGIN DAN REGISTER

Pertahankan autentikasi lama.

Jangan menulis ulang sistem login apabila sudah berfungsi.

Tetap dukung:

- Login username/email.
- Password.
- Register.
- Google Login.
- Logout.
- Feedback validasi.

Sesuaikan desain agar konsisten dengan portal baru.

## G6. DASHBOARD USER

Route:

`/dashboard`

Dashboard harus sederhana.

Tampilkan:

- Jumlah informasi lomba yang dikirim.
- Jumlah yang disetujui.
- Jumlah yang sedang diperiksa.
- Jumlah yang perlu diperbaiki.
- Daftar postingan milik user.

Setiap postingan memiliki tindakan:

- Lihat.
- Edit.
- Lihat alasan penolakan bila ada.

Jangan membuat dashboard penuh grafik yang tidak diperlukan.

## G7. FORM TAMBAH LOMBA

Route:

`/lomba/tambah`

INI ADALAH HALAMAN DENGAN PRIORITAS UX TERTINGGI.

User awam harus bisa memahami cara mengisi formulir.

Gunakan struktur bertahap dengan 3 langkah:

### LANGKAH 1 — INFORMASI DASAR

Field:

1. Judul Lomba (wajib).
2. Nama Penyelenggara (wajib).
3. Kategori Lomba (wajib).
4. Tingkat Lomba (wajib).

Kategori dapat mencakup:

- Teknologi.
- Kesehatan.
- Bisnis.
- Desain.
- Akademik.
- Olahraga.
- Seni.
- Lainnya.

Kategori harus dapat dikelola admin.

Tingkat lomba:

- Internal Kampus.
- Regional.
- Nasional.
- Internasional.

### LANGKAH 2 — DETAIL LOMBA

Field:

1. Deskripsi Lomba (wajib).
2. Persyaratan Peserta.
3. Deadline Pendaftaran (wajib).
4. Program Studi yang Sesuai (wajib).
5. Biaya Pendaftaran (opsional).

Program studi menggunakan multiple-select atau pilihan checkbox yang mudah dipahami.

Sediakan pilihan "Semua Program Studi" apabila lomba terbuka untuk semua jurusan.

Jika "Semua Program Studi" dipilih, jangan simpan pilihan yang saling bertentangan.

Deadline menggunakan date picker sederhana.

Berikan contoh di bawah input yang berpotensi membingungkan.

### LANGKAH 3 — POSTER DAN PENDAFTARAN

Field:

1. Poster Lomba (opsional, tetapi sangat direkomendasikan).
2. Link Pendaftaran Resmi (wajib).
3. Kontak Penyelenggara (opsional).
4. Sumber Informasi (opsional).

Fitur poster:

- Upload JPG/PNG/WebP.
- Preview.
- Ganti poster.
- Hapus poster sebelum submit.
- Validasi ukuran.
- Konversi WebP di backend.

Tampilkan ringkasan sebelum pengiriman.

Contoh:

Judul: National UI/UX Competition

Penyelenggara: Universitas Contoh

Deadline: 30 November 2026

Prodi sesuai: Informatika, Sistem Informasi

Status pengiriman: Menunggu Verifikasi

Tombol utama:

"Kirim untuk Diperiksa"

Tampilkan keterangan:

"Informasi lomba akan diperiksa oleh admin sebelum ditampilkan kepada pengunjung."

### FORM UX RULES

- Label selalu terlihat.
- Placeholder hanya sebagai contoh, bukan pengganti label.
- Tampilkan indikator wajib dan opsional.
- Validasi per field.
- Pesan error dalam Bahasa Indonesia.
- Pertahankan nilai saat user berpindah langkah.
- Fokuskan ke field bermasalah saat validasi gagal.
- Tombol Kembali dan Lanjut harus jelas.
- Jangan menghilangkan data jika submit gagal.
- Jangan meminta informasi yang tidak dibutuhkan.
- Jangan memaksa user menulis HTML.
- Gunakan editor deskripsi yang sederhana dan aman.
- Tangani double submit.
- Cegah kehilangan data ketika navigasi tidak sengaja.

Jika membuat fitur Simpan Draf, implementasikan persistence yang benar. Jangan menampilkan tombol draf yang sebenarnya tidak menyimpan apa pun.

Saat versi awal, form 3 langkah lebih diprioritaskan daripada fitur kompleks seperti AI autofill.

---

# H. DATABASE DESIGN

Periksa database lama sebelum membuat migrasi.

Tabel lama `news` berisi data berita.

Rekomendasi domain baru:

`competitions`

Kolom utama:

```text
id
user_id
category_id
title
slug
organizer
competition_level
description
requirements
registration_deadline
registration_url
registration_fee
contact
source_url
poster
status
rejection_reason
reviewed_by
reviewed_at
published_at
created_at
updated_at
```

Atur tipe, indeks, nullability, constraint, serta foreign key yang sesuai.

## Tabel categories

```text
id
name
slug
timestamps
```

## Tabel study_programs

```text
id
name
slug
is_active
timestamps
```

Jangan mengarang daftar program studi resmi UMPKU.

Buat sistem master data yang dapat diisi dan dikelola administrator.

## Tabel pivot

`competition_study_program`

```text
competition_id
study_program_id
```

Buat unique composite constraint.

Satu lomba dapat relevan untuk lebih dari satu prodi.

## Tabel users

Pertahankan tabel lama berikut:

```text
users
```

Tidak perlu menulis ulang autentikasi.

## Tabel Customer Service

Pertahankan tabel lama:

```text
customer_service_messages
```

Periksa dependensi terhadap `news_id`.

Jika relasinya perlu dimigrasikan ke `competition_id`, lakukan dengan strategi migrasi yang mempertahankan riwayat chat.

Jangan langsung menghapus `news_id` atau tabel `news` sebelum semua dependensi diperiksa.

## Strategi migrasi

WAJIB:

1. Audit skema saat ini.
2. Identifikasi foreign key dan referensi news.
3. Tentukan migrasi aman.
4. Buat migration baru.
5. Jangan edit migration lama yang sudah digunakan produksi tanpa alasan kuat.
6. Lindungi data existing.
7. Pastikan rollback memungkinkan sejauh realistis.
8. Jangan menggunakan migrate:fresh pada database existing.
9. Hindari operasi destruktif otomatis.
10. Laporkan perubahan dan risiko terlebih dahulu.

Apabila konten berita lama akan dikonversi, jangan mengarang deadline, penyelenggara, atau URL pendaftaran.

Data yang tidak lengkap harus diperlakukan sebagai legacy/draft yang memerlukan perbaikan.

---

# I. STATUS DAN MODERASI

Gunakan status moderasi utama:

```text
pending
approved
rejected
```

Makna:

`pending`: Menunggu pemeriksaan admin.

`approved`: Disetujui dan dapat ditampilkan kepada publik.

`rejected`: Ditolak, pengirim dapat membaca alasan dan memperbaikinya.

Status deadline berbeda dengan status moderasi.

JANGAN menggunakan `expired` sebagai status moderasi.

Status pendaftaran ditentukan berdasarkan deadline.

Jika postingan yang sudah approved diedit oleh user:

- Jangan langsung mengubah versi publik tanpa pemeriksaan.
- Gunakan mekanisme revisi yang aman.
- Pilihan yang direkomendasikan adalah menyimpan revisi sebagai pending sambil mempertahankan versi publik sebelumnya sampai disetujui.
- Jika mekanisme revisi membutuhkan tabel tambahan, rancang dengan jelas terlebih dahulu.

Pengguna tidak boleh mengubah status moderasi melalui request API.

Admin wajib memberikan alasan untuk penolakan.

Simpan informasi reviewer dan waktu review.

---

# J. REST API LARAVEL

Buat endpoint dengan struktur konsisten.

## Public

```http
GET /api/competitions
GET /api/competitions/{slug}
GET /api/categories
GET /api/study-programs
```

Dukung:

- Pagination.
- Search.
- Filter kategori.
- Filter prodi.
- Filter status pendaftaran.
- Sorting.
- Respons error yang konsisten.

API publik hanya mengembalikan postingan yang disetujui.

## Authenticated User

```http
GET /api/my/competitions
POST /api/competitions
GET /api/my/competitions/{id}
PATCH /api/competitions/{id}
```

Gunakan Laravel Sanctum dan Laravel Policies.

Jangan percaya `user_id` dari form client.

Ambil user dari konteks autentikasi server.

## Admin

Sediakan operasi untuk:

- Melihat seluruh pengajuan.
- Menampilkan detail pengajuan.
- Menyetujui.
- Menolak.
- Mengedit.
- Menghapus sesuai ketentuan.
- Mengelola kategori.
- Mengelola program studi.

Jika Admin Panel sudah menggunakan Blade Controllers, pertahankan arsitektur tersebut.

Tidak perlu memaksakan HTTP API untuk tindakan internal Blade.

Gunakan Form Request Validation.

Gunakan API Resources untuk menjaga struktur respons.

Jangan mengekspos informasi sensitif user.

---

# K. ADMIN PANEL LARAVEL

Pertahankan admin panel yang sudah berjalan.

Sesuaikan istilah:

Berita → Lomba

Manajemen Berita → Manajemen Lomba

Total Berita → Total Informasi Lomba

Tambahkan ringkasan:

- Total lomba.
- Menunggu verifikasi.
- Disetujui.
- Ditolak.
- Pendaftaran masih dibuka.

## Halaman manajemen lomba

Tampilkan tabel:

- Judul.
- Pengirim.
- Kategori.
- Deadline.
- Status.
- Tanggal pengiriman.
- Aksi.

Tambahkan filter status.

Admin harus dapat membuka detail pengajuan dan memeriksa tautan sumber informasi.

Tombol:

- Setujui.
- Tolak.
- Edit.
- Hapus.

Gunakan konfirmasi sebelum tindakan berisiko.

Pastikan UI Admin Panel juga responsive.

Tabel yang terlalu lebar di mobile harus diberi strategi seperti horizontal scrolling atau tampilan kartu, bukan dibiarkan merusak layout.

---

# L. KOMPONEN REACT YANG DAPAT DIGUNAKAN ULANG

Bangun komponen reusable apabila sesuai kebutuhan:

```text
Navbar
MobileNavigation
Footer
CompetitionCard
CompetitionGrid
CompetitionSearch
CompetitionFilters
CompetitionStatusBadge
DeadlineDisplay
EmptyState
LoadingState
ErrorState
CompetitionForm
FormStepIndicator
PosterUploader
StudyProgramSelector
ConfirmationDialog
Pagination
```

Jangan membuat komponen terlalu banyak jika hanya digunakan sekali dan tidak memberikan manfaat.

Ikuti struktur komponen yang sudah ada.

Gunakan Client Components hanya ketika membutuhkan interaktivitas.

Manfaatkan Server Components untuk konten yang bisa dirender di server.

Gunakan TypeScript types yang jelas.

Hindari penggunaan `any` tanpa alasan yang dapat dipertanggungjawabkan.

---

# M. CUSTOMER SERVICE DAN AKSESIBILITAS

Jangan menghapus Customer Service yang sudah tersedia.

Sesuaikan istilahnya dengan informasi lomba.

Contoh pertanyaan:

- Bagaimana cara menambahkan lomba?
- Mengapa lomba saya belum disetujui?
- Bagaimana memperbaiki informasi lomba?
- Bagaimana menghubungi admin?

Pertahankan komunikasi admin-user.

Jangan memberikan kesan bahwa informasi pendaftaran berasal dari admin jika sebenarnya berasal dari pengirim.

Pertahankan widget aksesibilitas:

- Ukuran font.
- Kontras tinggi.
- Monokrom.
- Font mudah dibaca.
- Garis bawah link.
- Text-to-Speech.

Pastikan widget tidak menutupi navigasi dan tombol form di mobile.

---

# N. KEAMANAN

Keamanan tidak boleh dianggap sebagai tahap tambahan yang boleh diabaikan.

Terapkan:

1. Laravel Form Request Validation.
2. Laravel Policies.
3. Server-side authorization.
4. Proteksi CSRF yang sesuai jenis autentikasi.
5. Rate limiting pada endpoint sensitif.
6. Validasi URL eksternal.
7. Validasi upload gambar.
8. Batas ukuran file.
9. Proteksi XSS pada deskripsi lomba.
10. Sanitasi rich text apabila menggunakan HTML.
11. Proteksi akses file.
12. Penanganan error tanpa membocorkan stack trace ke pengguna.
13. CORS sesuai origin frontend yang diizinkan.
14. Proteksi mass assignment.
15. Pengelolaan environment variables yang aman.
16. Tidak mengekspos token di log.

Audit juga implementasi token login lama.

Jika Google OAuth saat ini mengirim bearer token melalui URL query, evaluasi risiko kebocoran token melalui history, referrer, dan log. Usulkan atau terapkan pertukaran kode sekali pakai atau pola autentikasi yang lebih aman dengan tetap memperhatikan kompatibilitas.

Jangan mengubah sistem autentikasi tanpa pengujian regresi.

---

# O. SEO, PERFORMA, DAN AKSESIBILITAS

## SEO

Implementasikan:

- Metadata per halaman.
- Dynamic title.
- Meta description.
- Open Graph untuk detail lomba.
- Canonical URL jika relevan.
- Sitemap untuk postingan publik yang disetujui.
- Robots configuration.
- URL slug yang mudah dibaca.

Jangan memasukkan draft, pending, atau rejected ke sitemap.

## Performa

- Optimasi gambar.
- Lazy loading gambar di luar viewport.
- Hindari request API berulang.
- Pagination server-side.
- Caching secara tepat.
- Loading state yang tidak menyebabkan layout shift.
- Minimalkan JavaScript yang tidak perlu.
- Hindari komponen berat tanpa manfaat.

Targetkan Core Web Vitals yang baik.

## Aksesibilitas

Gunakan HTML semantik, label input, navigasi keyboard, focus indicator, pesan error yang dapat dibaca assistive technology, dan kontras teks yang baik.

Upayakan WCAG 2.2 AA untuk komponen dan alur utama.

---

# P. PENGUJIAN WAJIB

Jangan menganggap implementasi selesai hanya karena halaman berhasil ditampilkan.

## Backend

Uji:

- User dapat login.
- Public dapat melihat lomba approved.
- Public tidak dapat melihat pending.
- Public tidak dapat membuat lomba.
- User login dapat membuat lomba.
- User tidak dapat mengedit lomba milik orang lain.
- Admin dapat approve.
- Admin dapat reject dengan alasan.
- Deadline divalidasi.
- URL divalidasi.
- Upload poster divalidasi.
- Filter dan pagination berjalan.
- Status pendaftaran sesuai tanggal.

Gunakan Laravel Feature Tests dan Unit Tests yang relevan.

## Frontend

Uji:

- Semua halaman dapat diakses sesuai role.
- Form memiliki validasi.
- Form mempertahankan data.
- Loading dan error ditampilkan.
- Pagination berjalan.
- Search dan filter berjalan.
- Dashboard user hanya menampilkan postingan miliknya.
- Logout bekerja.
- Dark Mode bekerja.
- Navigasi mobile bekerja.

Gunakan testing tools yang sudah tersedia. Jika perlu menambah dependency, jelaskan alasannya.

## Responsive

Periksa pada:

```text
320px
360px
375px
390px
430px
768px
1024px
1280px
1440px
1920px
```

Pastikan tidak ada overflow, overlap, atau elemen yang sulit disentuh.

## Perintah verifikasi

Gunakan yang sesuai dengan proyek:

```bash
php artisan test
```

```bash
npm run build
```

```bash
npm run lint
```

Jika script tidak tersedia, laporkan dan gunakan alternatif yang sesuai.

Jangan mengklaim tes lulus jika belum benar-benar dijalankan.

---

# Q. TAHAPAN IMPLEMENTASI WAJIB

Seluruh pekerjaan dibagi menjadi 9 tahap utama.

Setiap tahap HARUS diselesaikan, diverifikasi, dan dilaporkan secara terpisah.

## TAHAP 0 — AUDIT PROYEK

JANGAN LANGSUNG MENGUBAH KODE.

Lakukan:

1. Baca `PROJECT_CONTEXT.md`.
2. Periksa struktur folder frontend.
3. Periksa struktur folder backend.
4. Identifikasi versi dependency.
5. Periksa routes.
6. Periksa controllers.
7. Periksa models.
8. Periksa migrations.
9. Periksa autentikasi.
10. Periksa admin panel.
11. Periksa fitur Customer Service.
12. Identifikasi semua komponen terkait berita.
13. Cari referensi `news` di frontend dan backend.
14. Periksa konfigurasi database tanpa menampilkan secrets.
15. Periksa kondisi Git sebelum perubahan.
16. Identifikasi risiko perubahan.

Output tahap 0:

- Ringkasan arsitektur aktual.
- Daftar fitur yang dapat digunakan kembali.
- Daftar file yang perlu diubah.
- Daftar file yang perlu dibuat.
- Risiko kompatibilitas.
- Rencana migrasi aman.
- Urutan kerja yang direkomendasikan.

**STOP. Tunggu persetujuan user untuk Tahap 1.**

## TAHAP 1 — DATABASE

Kerjakan:

- Migration competitions.
- Migration categories.
- Migration study_programs.
- Migration pivot.
- Model dan relasi Eloquent.
- Status moderasi.
- Indeks database.
- Seeder kategori.
- Mekanisme master program studi.
- Strategi migrasi data lama.
- Penyesuaian dependensi foreign key.

Jangan menghapus data lama tanpa persetujuan.

Jalankan validasi migration dan pengujian database.

Output:

- File yang diubah.
- Struktur final.
- Hasil migrasi atau pemeriksaan migrasi.
- Hasil pengujian.
- Masalah tersisa.

**STOP. Tunggu persetujuan user untuk Tahap 2.**

## TAHAP 2 — BACKEND API

Kerjakan:

- Competition Controller.
- Form Requests.
- API Resources.
- Competition Policy.
- Routes.
- Filter.
- Search.
- Pagination.
- Upload poster.
- Validasi.
- Authenticated user endpoints.
- Public endpoints.
- Unit/Feature Tests.

Pastikan API publik hanya menampilkan lomba yang disetujui.

**STOP. Tunggu persetujuan user untuk Tahap 3.**

## TAHAP 3 — UI DESIGN SYSTEM DAN NAVIGASI

Kerjakan:

- Identitas visual portal.
- Konsistensi typography.
- Container layout.
- Navbar desktop.
- Navbar mobile.
- Footer.
- Button styles.
- Form field styles.
- Card styles.
- Status badges.
- Loading states.
- Empty states.
- Light/Dark Theme compatibility.

Jangan membuat ulang komponen jika komponen lama masih layak dipakai.

Pastikan frontend berhasil build.

**STOP. Tunggu persetujuan user untuk Tahap 4.**

## TAHAP 4 — HALAMAN PUBLIK

Kerjakan:

- Beranda.
- Daftar lomba.
- Detail lomba.
- Search.
- Filter prodi.
- Filter kategori.
- Filter deadline.
- Pagination.
- Status deadline.
- SEO dasar.

Integrasikan ke Laravel API.

Jangan gunakan data dummy sebagai sumber utama setelah API tersedia.

**STOP. Tunggu persetujuan user untuk Tahap 5.**

## TAHAP 5 — FORM TAMBAH LOMBA

Fokus utama: Kemudahan pengguna awam.

Kerjakan:

- Multi-step form 3 langkah.
- Validasi sederhana.
- Multiple selection program studi.
- Deadline date picker.
- Poster upload preview.
- Ringkasan informasi.
- Error handling.
- Success state.
- Pencegahan double submit.
- Integrasi POST API.
- Redirect setelah submit.
- Responsive mobile dan desktop.

Pastikan mahasiswa dapat menyelesaikan form tanpa penjelasan teknis.

**STOP. Tunggu persetujuan user untuk Tahap 6.**

## TAHAP 6 — DASHBOARD USER

Kerjakan:

- Ringkasan postingan.
- Daftar lomba milik sendiri.
- Status moderasi.
- Halaman edit.
- Alasan penolakan.
- Pengiriman revisi.
- Proteksi akses.
- Empty state.

Pastikan user tidak dapat mengakses data user lain.

**STOP. Tunggu persetujuan user untuk Tahap 7.**

## TAHAP 7 — ADMIN MODERATION

Kerjakan:

- Dashboard admin baru.
- Manajemen lomba.
- Daftar pending.
- Approve.
- Reject.
- Alasan penolakan.
- Edit.
- Delete.
- Manajemen kategori.
- Manajemen prodi.
- Riwayat review yang diperlukan.
- Penyesuaian Customer Service.

Pertahankan arsitektur Laravel Blade.

**STOP. Tunggu persetujuan user untuk Tahap 8.**

## TAHAP 8 — FINAL QA DAN OPTIMASI

Kerjakan:

- Full regression testing.
- Backend tests.
- Frontend checks.
- Responsive testing.
- Accessibility checks.
- Security review.
- SEO review.
- Performance optimization.
- Cross-browser checks yang tersedia.
- Verifikasi integrasi login.
- Verifikasi admin panel.
- Verifikasi Customer Service.
- Pemeriksaan dead links dan error console.

Laporkan semua hasil sebenarnya.

Jika ada masalah, perbaiki sesuai scope tanpa mengubah fitur yang tidak berkaitan.

**STOP. Minta persetujuan sebelum menyatakan pekerjaan final selesai apabila masih ada pengujian atau keputusan yang belum tuntas.**

---

# R. ATURAN KETIKA MENULIS DAN MENGUBAH KODE

1. Baca file sebelum mengubahnya.
2. Ikuti coding style yang sudah ada.
3. Hindari duplikasi kode.
4. Jangan membuat file baru jika file existing bisa digunakan dengan aman.
5. Jangan menghapus fitur secara sembarangan.
6. Jangan mengganti authentication flow tanpa analisis dampak.
7. Jangan mengganti database tanpa alasan.
8. Jangan melakukan refactor besar yang tidak relevan.
9. Jangan menjalankan command destruktif tanpa persetujuan.
10. Jangan menggunakan hardcoded secrets.
11. Jangan memperbarui semua dependency hanya karena tersedia versi baru.
12. Pastikan setiap perubahan dapat diverifikasi.
13. Gunakan naming convention konsisten.
14. Jangan meninggalkan tombol yang tidak berfungsi.
15. Jangan membuat fitur palsu yang hanya terlihat bekerja.
16. Jangan mengklaim implementasi berhasil tanpa memeriksanya.
17. Jangan membuat commit atau push tanpa persetujuan pengguna.
18. Jangan menyentuh file di luar workspace proyek tanpa kebutuhan dan izin yang jelas.

Jika menemukan bug yang tidak berkaitan dengan tahap saat ini, catat terlebih dahulu. Jangan memperluas scope tanpa alasan.

---

# S. FORMAT LAPORAN WAJIB SETELAH SETIAP TAHAP

Setiap selesai satu tahap, gunakan format:

## LAPORAN TAHAP [N] — [NAMA TAHAP]

### 1. Ringkasan
Jelaskan apa yang telah dikerjakan.

### 2. Implementasi
Jelaskan perubahan fitur yang benar-benar sudah dilakukan.

### 3. File yang Berubah
Sebutkan path file yang dibuat atau dimodifikasi.

### 4. Database
Jelaskan perubahan skema jika ada.

### 5. Pengujian
Tampilkan perintah yang dijalankan dan hasilnya.

### 6. Hasil UI
Jelaskan tampilan desktop dan mobile yang sudah dibuat. Berikan screenshot jika tools tersedia.

### 7. Masalah atau Keterbatasan
Laporkan masalah secara transparan.

### 8. Status
Gunakan salah satu:

- SELESAI DAN TERVERIFIKASI.
- SELESAI DENGAN CATATAN.
- BELUM SELESAI.

Jangan menggunakan status selesai jika ada kegagalan penting.

### 9. Tahap Selanjutnya
Jelaskan apa yang akan dikerjakan berikutnya.

Setelah laporan, BERHENTI.

Tanyakan:

"Apakah saya boleh melanjutkan ke Tahap [N+1]?"

Jangan mulai tahap berikutnya sampai pengguna memberikan persetujuan.

---

# T. DEFINITION OF DONE

Proyek dinyatakan selesai hanya ketika:

- Website publik bisa dibuka tanpa login.
- Pengunjung bisa mencari dan membaca lomba.
- Hanya user login yang bisa mengirim informasi.
- User bisa memilih prodi yang sesuai.
- User bisa mengunggah poster.
- User bisa memasukkan deadline.
- Admin bisa menyetujui atau menolak.
- Hanya lomba approved yang tampil kepada publik.
- Dashboard user berfungsi.
- Hak akses diproteksi backend.
- Status pendaftaran sesuai deadline.
- Semua halaman utama responsive.
- Form mudah digunakan oleh orang awam.
- Sistem autentikasi lama tetap berfungsi.
- Customer Service tetap berfungsi.
- Fitur aksesibilitas tetap berfungsi.
- Pengujian penting berhasil.
- Tidak ada bug kritis yang diketahui.
- Tidak ada kehilangan data akibat migrasi.
- Dokumentasi proyek telah diperbarui.

---

# U. INSTRUKSI EKSEKUSI PERTAMA

SEKARANG MULAI DARI TAHAP 0 SAJA.

Tugas pertamamu:

1. Baca dokumentasi `PROJECT_CONTEXT.md`.
2. Audit source code frontend dan backend yang sebenarnya.
3. Identifikasi fitur lama yang perlu diubah.
4. Identifikasi dependensi sistem berita lama.
5. Periksa database dan autentikasi.
6. Buat rencana implementasi terperinci berdasarkan kondisi proyek.
7. Identifikasi potensi masalah migrasi.
8. Laporkan hasil audit.

**JANGAN mengimplementasikan Tahap 1 atau tahap berikutnya sekarang.**

**JANGAN langsung mengubah UI, database, routes, atau controllers sebelum audit selesai.**

Saya akan memeriksa hasil audit terlebih dahulu.

Setelah itu, saya akan memberikan persetujuan untuk melanjutkan secara bertahap.

## PRIORITAS AKHIR

Prioritas pengembangan harus selalu mengikuti urutan:

1. Keamanan data dan stabilitas sistem.
2. Fungsi yang benar-benar berjalan.
3. Kemudahan penggunaan untuk orang awam.
4. Responsive desktop dan mobile.
5. Konsistensi UI.
6. Performa.
7. Estetika tambahan.

Hasil akhir bukan sekadar website yang terlihat modern, melainkan website informasi lomba yang benar-benar berfungsi, mudah digunakan mahasiswa UMPKU Surakarta, aman, dan nyaman di desktop maupun smartphone.

**MULAI TAHAP 0 — AUDIT PROYEK SEKARANG.**
