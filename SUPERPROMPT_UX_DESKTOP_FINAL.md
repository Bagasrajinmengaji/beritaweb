# SUPERPROMPT UX DESKTOP FINAL — AUDIT DAN PENYEMPURNAAN PORTAL LOMBA UMPKU

**Versi:** 2.0 — 11 November 2026  
**Dokumen utama:** `MASTER_SUPERPROMPT_FINAL.md`  
**Fokus:** Desktop/laptop saja pada tahap ini; penyempurnaan proyek existing, **bukan** membuat ulang aplikasi.

> Instruksi ini menjabarkan UX dan UI desktop secara khusus. Untuk keamanan, fitur, status proyek, cleanup, Smart Import, dan tahapan persetujuan, ikuti `MASTER_SUPERPROMPT_FINAL.md`. Hapus asumsi mobile-first dari prompt lama. Jangan melakukan optimasi mobile atau tablet sebagai scope baru, tetapi jangan sengaja merusak fungsi yang sudah ada.

## 1. PERAN DAN TUJUAN

Bertindak sebagai Senior Product Designer, UX Researcher, Frontend Engineer Next.js/React/Tailwind, dan QA Engineer. Selesaikan permasalahan UI/UX berdasarkan screenshot, source code aktual, dan tugas nyata mahasiswa, bukan preferensi estetika AI.

Target pengguna awam harus bisa: menemukan lomba, memahami deadline/biaya/syarat/prodi, membuka pendaftaran resmi, mengirim informasi lomba dalam tiga langkah, membaca status moderasi, dan memperbaiki pengajuan ditolak **tanpa bantuan teknis**.

## 2. SCOPE DAN ATURAN KERJA

1. Target desktop: 1280×720, **1366×768**, 1440×900, **1920×1080**, juga browser zoom dan window resize desktop.
2. Optimasi mobile/tablet **ditunda**. Jangan membuat menu mobile baru, tetapi jangan menghapus breakpoint existing secara membabi buta.
3. Pertahankan warna aksen oranye dan dark/light theme existing. Jangan mengklaim warna tersebut resmi kampus kecuali ada bukti branding.
4. Jangan membuat redesign total, ganti framework, ubah backend/database, atau menghapus fungsi demi estetika.
5. Jangan mengubah API/auth/moderasi demi UX tanpa audit, pembuktian bug, dan izin scope terpisah.
6. Dalam setiap tahap: **audit → usulan perubahan → persetujuan → implementasi terbatas → test → laporan → STOP**.
7. Perlindungan fitur: Voice/Text-to-Speech, AccessibilityWidget, Customer Service, login/Google, form, admin, dark mode, dan fitur lomba existing tidak boleh hilang.

## 3. DESKTOP DESIGN SYSTEM — MINIM AI SLOP

**Arah:** institusional modern, content-first, tidak ramai. Gunakan CSS/Tailwind tokens existing; konsolidasikan komponen yang duplikat hanya bila aman.

**Hindari:** gradient/neon/glow dekoratif, glassmorphism, floating circles, 3D generik, hero raksasa, nested card, banyak shadow, terlalu banyak badge, seluruh teks bold, animasi tanpa fungsi, chart/statistik palsu, kalimat marketing generik, semua elemen diberi ikon.

**Standar kerja:**

- Container utama sekitar 1152–1280px, disesuaikan konten; panjang teks tidak boleh melebar tidak terkendali.
- Body sekitar 14–16px; label 14–16px; helper text sekitar 13–14px dengan kontras baik; heading sekunder proporsional.
- Kartu lomba: poster rasio konsisten, judul terbaca, deadline/status menonjol, prodi dan penyelenggara ringkas, 1 CTA jelas.
- Primary button solid oranye; secondary outline/ghost; destructive merah hanya untuk tindakan benar-benar destruktif.
- Warna status memiliki semantik, bukan hiasan. Border tipis, radius konsisten, shadow seperlunya.
- Semua input punya label permanen, contoh yang wajar, feedback error dekat field. Keyboard, fokus, Escape, dan tombol utama diuji.
- Empty/loading/error state bermakna, bukan placeholder generik atau spinner tanpa ujung.
- Jangan menambah fitur visual yang tidak mengurangi friksi pekerjaan pengguna.

## 4. PRIORITAS UX YANG HARUS DIAUDIT

### U0 — Audit read-only

Periksa beranda, jelajah, detail, tambah lomba, dashboard, login, navbar, widget, dan admin yang relevan. Bandingkan screenshot dengan kode. Dokumentasikan:

- Hirarki konten, keterbacaan, ruang kosong dan penggunaan lebar desktop.
- Konsistensi kartu/form/tombol/font/badge.
- Kemudahan penemuan CTA dan status deadline.
- Form step, field membingungkan, validasi, risiko kehilangan data, hasil submit.
- Dashboard empty/error/loading dan informasi moderasi.
- Interaksi keyboard, modal, Voice/TTS, widget aksesibilitas, chat floating.
- Perbedaan desain aktual dengan screenshot, serta hal yang **tidak bisa** diverifikasi dari screenshot.

Berikan matriks `masalah | halaman | bukti | dampak pada mahasiswa | P0/P1/P2 | perbaikan | risiko regresi`, dan wireframe tekstual ringkas sebelum coding. **JANGAN ubah kode pada U0. STOP.**

### U1 — Beranda desktop

Masalah yang perlu diverifikasi pada screenshot/source:

- Hero terlalu tinggi dan menunda konten penting.
- Satu card kecil membuat ruang kosong kanan tidak proporsional.
- Deadline dan judul kalah menonjol dari dekorasi/whitespace.
- CTA Tambah Informasi Lomba kurang terlihat.

Target:

1. Heading dan search mudah dilihat pada viewport laptop.
2. Hero ringkas, tanpa ornamen tambahan.
3. Satu lomba → pertimbangkan card horizontal/lebar; dua → dua kolom; tiga atau lebih → grid hingga tiga kolom, berdasarkan ruang nyata.
4. Info deadline, penyelenggara, kategori dan prodi jelas; badge tidak berlebihan.
5. CTA `Tambah Informasi Lomba` mudah ditemukan tanpa mengganggu pencarian.
6. Layout seimbang saat 0, 1, 2, banyak lomba; jangan mengarang data dummy untuk mengisi ruang.

Setelah implementasi, tes visual 1280×720, 1366×768, 1440×900, 1920×1080; cek dark/light dan Voice/widget yang hadir secara global. **STOP.**

### U2 — Jelajah Lomba desktop

1. Prioritaskan search, prodi, dan kategori; filter lanjut dapat ditampilkan saat diperlukan.
2. Reset Filter jelas ketika ada filter aktif; gunakan query params yang sesuai source saat ini.
3. Jumlah hasil dan empty state mudah dibaca.
4. Card menonjolkan judul + deadline + status + detail; tampilkan ringkasan prodi dan akses ke daftar lengkap.
5. Atur grid 1/2/3 data secara proporsional; jangan paksakan banyak card kosong.
6. Search Enter, filter, sort, dan pagination harus benar-benar berfungsi dan sinkron dengan API.
7. Jangan mengubah kontrak API tanpa izin.

**STOP setelah tes.**

### U3 — Tambah Lomba desktop (prioritas UX tertinggi)

Form tetap **3 langkah**:

- **Langkah 1 — Informasi Dasar:** judul, penyelenggara, kategori, tingkat lomba, dan tipe individu/tim jika memang terdapat pada source.
- **Langkah 2 — Ketentuan & Sasaran:** deskripsi, persyaratan, prodi relevan, deadline, biaya (gratis/berbayar), informasi lain yang dibutuhkan.
- **Langkah 3 — Poster & Pendaftaran:** poster/preview, URL pendaftaran, kontak/sumber, ringkasan, konfirmasi moderasi.

Perbaikan:

1. Label tetap terlihat; placeholder sebagai contoh, bukan label.
2. Helper text tidak terlalu kecil, hindari jargon; contoh untuk URL dan judul.
3. Tipe peserta dijelaskan: Individu = sendiri, Tim = kelompok, Keduanya = opsi dua jenis.
4. Dropdown wajib mulai dari `Pilih ...`, bukan default yang tampak sudah dipilih tanpa kesadaran.
5. Prodi dipilih mudah tanpa scroll internal panjang; `Semua Prodi` tidak bertabrakan dengan pilihan satuan.
6. Validasi langkah saat klik Lanjut; tunjukkan field salah dan fokuskan ke situ.
7. Cegah kehilangan field ketika back/forward dan submit gagal; jangan membuat tombol draf palsu.
8. Validasi URL, deadline, file size/MIME serta tampilkan preview poster.
9. Pada step akhir, review informasi penting + tombol `Kirim untuk Diperiksa` + penjelasan status pending.
10. Lebar form terbatas dan dapat dipakai pada laptop 1366×768 tanpa modal yang terpotong.

**Smart Import bukan bagian redesign form saat modul backend belum siap.** Rencanakan titik masuk `Isi Otomatis` vs `Isi Manual`, tetapi jangan menampilkan aksi import palsu. Saat Smart Import nanti sudah siap, hasil URL/poster/QR/AI harus mengisi **form yang sama** untuk direview user, bukan membuat alur kedua yang tidak konsisten. **STOP setelah tes.**

### U4 — Dashboard mahasiswa desktop

1. Untuk user dengan 0 pengajuan: tampilkan empty state informatif dan CTA jelas; jangan memberi dominasi visual pada empat kartu angka nol.
2. Setelah ada data: tampilkan statistik total/pending/approved/rejected dan tab status konsisten.
3. Pastikan statistik berasal dari data keseluruhan (bukan 50 pertama); jika backend belum menyediakan, laporkan sebagai perubahan lintas scope.
4. `Perlu Perbaikan`: alasan admin jelas + CTA `Perbaiki Informasi`.
5. Error fetch tidak boleh terlihat seperti zero data; sediakan Retry.
6. Form edit tidak boleh diam-diam membuang prodi/poster/tingkat/field lain yang sudah ada.
7. Edit, hapus, dan modal memiliki keyboard/focus management, konfirmasi yang proporsional, serta UI tidak terlalu sesak.
8. Jangan menyederhanakan dengan menghapus fungsi.

**STOP setelah tes.**

### U5 — Detail lomba + konsistensi global

- Detail menempatkan deadline, biaya, persyaratan, prodi sesuai dan link pendaftaran pada hirarki yang jelas.
- Informasi dari pengirim tidak boleh tampak sebagai verifikasi penuh kebenaran oleh kampus; jelaskan moderasi secara wajar.
- Voice/TTS: tombol `Dengarkan` terlihat dan tidak bersaing dengan CTA pendaftaran; uji stop/pause/resume sesuai yang sudah ada dan support browser.
- Navbar, footer, login, card, badge, dark mode, chat CS, aksesibilitas, ukuran font, modal, status pesan konsisten.
- Chat/aksesibilitas tidak boleh menutupi aksi penting pada viewport desktop 1280×720.
- Hindari copywriting berlebihan; istilah UI Bahasa Indonesia ringkas.

**STOP setelah tes.**

### U6 — QA dan review dengan pengguna awam

Lakukan skenario, jika browser automation dan environment tersedia:

1. Mahasiswa baru menemukan lomba sesuai prodi.
2. Mahasiswa memahami deadline, syarat, dan URL pendaftaran.
3. Mahasiswa mengirim form 3 langkah dan memperbaiki field salah.
4. Mahasiswa kembali ke langkah sebelumnya tanpa kehilangan data.
5. Mahasiswa membaca alasan penolakan dan memperbaiki pengajuan.
6. Mahasiswa memakai Voice/TTS pada detail lomba.
7. Mahasiswa menemukan bantuan Customer Service.

Periksa di resolusi desktop sasaran (terutama 1366×768), zoom 100% dan 125% jika memungkinkan, keyboard, dark/light, loading/error/empty/data banyak. Bila user testing nyata tidak dilakukan, jangan klaim sudah lolos user testing; berikan skrip uji manual yang bisa dilakukan pemilik proyek.

## 5. CLEAN CODE DALAM PEKERJAAN UI

- Audit file `page.tsx` besar, khususnya Create dan Dashboard, namun jangan memecah file hanya karena jumlah baris.
- Pisahkan API service, validasi, uploader, modal, dan kompleksitas state ketika tanggung jawab bercampur.
- Gunakan reusable `CompetitionCard`, `CompetitionForm`, status badge, input, empty/error state jika memang ada manfaat nyata.
- Hindari perubahan backend tersembunyi di PR/refactor UI.
- Simpan struktur semantik HTML, fokus keyboard, dan perubahan minimum pada perilaku.
- Jangan memperkenalkan library baru hanya untuk komponen sederhana.

## 6. FITUR TAMBAHAN — HANYA USULAN, BUKAN AUTO-IMPLEMENT

Pertimbangkan manfaat/risiko/biaya dari: Simpan Draf, bookmark, notifikasi moderasi, pengingat deadline, report informasi salah, deteksi duplikasi. Prioritaskan Smart Import universal dari URL, poster, dan QR hanya pada tahap terpisah sesuai Master. Fitur Voice/TTS yang sudah ada tetap dilindungi.

## 7. STANDAR PENGUJIAN DAN LAPORAN

Setelah satu tahap **yang disetujui**:

- Jalankan lint/typecheck/build bila tersedia; uji alur yang berubah di browser jika alat tersedia.
- Verifikasi tidak ada error console, overlapping modal, scroll horizontal desktop, fokus hilang, atau label sulit dibaca.
- Jelaskan viewport desktop yang benar-benar diperiksa, bukan yang diharapkan.
- Pastikan tidak merusak login, Voice, Customer Service, dark mode, fitur lomba, atau admin.
- Jika ada tes yang gagal/belum dikerjakan, laporkan terang-terangan.

**Format laporan:** tujuan tahap; temuan prioritas; daftar file yang berubah; keputusan UI dan alasannya; hasil tes nyata; screenshot jika ada; regresi/risiko; rekomendasi tahap berikutnya; **STOP dan minta izin**.

## 8. PERINTAH PERTAMA

Mulai dari **U0 — AUDIT UI/UX DESKTOP SAJA**. Baca source aktual dan screenshot yang tersedia, cocokkan dengan kedua dokumen prompt serta `PROJECT_CONTEXT.md`. Berikan temuan berbasis bukti dan urutan perbaikan prioritas. Jangan ubah source code, API, database, atau assets. **STOP, tunggu persetujuan pengguna sebelum U1.**
