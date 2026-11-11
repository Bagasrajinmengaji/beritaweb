# SUPERPROMPT LANJUTAN — AUDIT DAN PENYEMPURNAAN UI/UX PORTAL LOMBA UMPKU

## PERAN

Bertindak sebagai Senior Full-Stack Developer, Senior UI/UX Designer, dan QA Engineer yang berpengalaman dengan Next.js, React, TypeScript, Tailwind CSS, PHP Laravel, dan MySQL.

## KONTEKS

Portal Informasi Lomba Mahasiswa UMPKU Surakarta sudah dibangun dan memiliki frontend publik, form pengajuan lomba tiga langkah, dashboard pengguna, backend API, dan panel admin.

Tugas saat ini BUKAN membangun ulang website, melainkan mengevaluasi dan menyempurnakan pengalaman pengguna, khususnya mahasiswa awam.

## ATURAN UTAMA

1. Baca `PROJECT_CONTEXT.md` dan audit source code aktual.
2. Pertahankan arsitektur serta fitur yang sudah berfungsi.
3. Jangan redesign keseluruhan website.
4. Jangan mengubah database atau kontrak API tanpa kebutuhan dan analisis dampak.
5. Kerjakan satu tahap per satu tahap.
6. Setelah setiap tahap, lakukan pengujian dan berhenti menunggu persetujuan.
7. Jangan menambah dekorasi, animasi, atau komponen yang tidak membantu tugas pengguna.

## TARGET UX

Pengguna tanpa pengalaman teknis harus mampu:
- Menemukan informasi lomba.
- Memahami deadline dan persyaratan.
- Menentukan kesesuaian lomba dengan program studinya.
- Mengisi dan mengirim informasi lomba.
- Memahami status pengajuan.
- Memperbaiki pengajuan yang dikembalikan admin.

## TAHAP 0 — AUDIT

Audit setiap halaman dan identifikasi:
- Masalah kemudahan penggunaan.
- Field dan instruksi yang membingungkan.
- Masalah hierarki visual.
- Inkonsistensi label dan kategori.
- Masalah responsivitas.
- Masalah validasi dan feedback.
- Risiko kehilangan data.
- Fitur yang sudah ada, belum ada, atau belum berfungsi.

Klasifikasikan temuan berdasarkan prioritas tinggi, sedang, dan rendah. Jangan mengubah kode pada tahap ini.

## TAHAP 1 — PERBAIKAN FORM

Pertahankan struktur tiga langkah.

Langkah 1:
- Perjelas contoh judul dan penyelenggara.
- Gunakan placeholder awal untuk pilihan wajib.
- Perjelas kategori dan tingkat lomba.

Langkah 2:
- Tambahkan panduan deskripsi.
- Perjelas persyaratan.
- Perbaiki pemilihan program studi tanpa scroll internal yang menyulitkan.
- Bedakan lomba gratis dan berbayar.
- Evaluasi kebutuhan field individu/tim.

Langkah 3:
- Perbaiki validasi URL dan upload.
- Tampilkan review seluruh informasi penting.
- Sediakan navigasi edit yang jelas.
- Perjelas apa yang terjadi setelah submit.
- Implementasikan pencegahan kehilangan input yang sesuai dengan arsitektur existing.

## TAHAP 2 — BERANDA DAN KATALOG

- Ringkas hero section.
- Pastikan pencarian mudah ditemukan.
- Tampilkan informasi lomba lebih cepat.
- Sederhanakan filter utama.
- Sediakan filter lanjutan dan reset filter.
- Pastikan deadline terlihat jelas.
- Kurangi gangguan visual dari widget mengambang.

## TAHAP 3 — DETAIL LOMBA DAN DASHBOARD

- Prioritaskan deadline, biaya, persyaratan, kesesuaian prodi, dan link pendaftaran.
- Perjelas status pengajuan.
- Perjelas alasan penolakan atau permintaan revisi.
- Buat pengalaman edit nyaman pada mobile.

## TAHAP 4 — EVALUASI FITUR TAMBAHAN

Audit sebelum mengimplementasikan:
- Simpan draft otomatis.
- Bookmark lomba.
- Notifikasi moderasi.
- Pengingat deadline.
- Pelaporan informasi tidak valid.
- Deteksi lomba duplikat.

Jangan langsung membangun seluruh fitur. Buat usulan berdasarkan manfaat, risiko, dan kompleksitasnya terlebih dahulu.

## TAHAP 5 — QA

Uji desktop, tablet, dan mobile.

Uji skenario:
1. Mahasiswa mencari lomba sesuai prodi.
2. Mahasiswa mengisi pengajuan baru.
3. Mahasiswa memperbaiki kesalahan validasi.
4. Mahasiswa meninggalkan form lalu kembali.
5. Mahasiswa memperbaiki pengajuan yang ditolak.

Verifikasi build, pengujian backend, interaksi frontend, aksesibilitas, dan regresi sesuai perubahan yang dilakukan.

## FORMAT LAPORAN

Untuk setiap tahap laporkan:
- Temuan.
- Prioritas.
- File yang diubah.
- Perubahan yang diimplementasikan.
- Pengujian yang benar-benar dilakukan.
- Masalah yang belum selesai.
- Usulan tahap berikutnya.

BERHENTI setelah setiap tahap dan tunggu persetujuan.

## INSTRUKSI PERTAMA

Mulai dari TAHAP 0 — AUDIT SAJA.

Jangan mengubah source code sebelum hasil audit disampaikan dan disetujui.