import { Trophy, MapPin, ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
          {/* Kolom Kiri: Brand & Deskripsi */}
          <div className="max-w-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 dark:bg-orange-500 text-white font-bold text-sm shadow-xs">
                <Trophy size={18} aria-hidden="true" />
              </span>
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
                Portal Lomba UMPKU
              </span>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Pusat informasi kompetisi, kejuaraan, dan peluang prestasi bagi mahasiswa Universitas Muhammadiyah PKU (UMPKU) Surakarta. Temukan lomba sesuai bidang minat dan program studimu.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 pt-1">
              <MapPin size={14} className="shrink-0 text-orange-500" aria-hidden="true" />
              <span>Surakarta, Jawa Tengah, Indonesia</span>
            </div>
          </div>

          {/* Kolom Kanan: Tautan Resmi Kampus */}
          <div className="space-y-3 md:text-right shrink-0">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-wider uppercase">
              UMPKU Surakarta
            </h4>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400 md:flex md:flex-col md:items-end">
              <li>
                <a
                  href="https://umpku.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <span>Website Resmi Kampus</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://kemahasiswaan.umpku.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <span>Biro Kemahasiswaan</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
              <li className="pt-1">
                <span className="text-xs text-stone-500 dark:text-stone-400 block max-w-xs">
                  Moderasi resmi oleh Biro Kemahasiswaan & Admin Kampus.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
          <p>© {new Date().getFullYear()} UMPKU Surakarta. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-1">
            <span>Dikelola untuk Kemajuan Prestasi Mahasiswa</span>
            <Heart size={12} className="text-red-500 fill-red-500" aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  );
}
