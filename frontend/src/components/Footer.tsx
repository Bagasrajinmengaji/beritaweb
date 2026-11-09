import Link from 'next/link';
import { Trophy, Mail, MapPin, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Desc */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 dark:bg-orange-500 text-white font-bold text-sm shadow-xs">
                <Trophy size={18} aria-hidden="true" />
              </span>
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
                Portal Lomba UMPKU
              </span>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-md">
              Pusat informasi kompetisi, kejuaraan, dan peluang prestasi bagi mahasiswa Universitas Muhammadiyah PKU (UMPKU) Surakarta. Temukan lomba sesuai bidang minat dan program studimu.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <MapPin size={14} className="shrink-0 text-orange-500" aria-hidden="true" />
              <span>Surakarta, Jawa Tengah, Indonesia</span>
            </div>
          </div>

          {/* Col 2: Tautan Cepat */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wider uppercase">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <li>
                <Link href="/" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/lomba" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Jelajah Lomba
                </Link>
              </li>
              <li>
                <Link href="/lomba/tambah" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Ajukan Lomba Baru
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Dashboard Pengajuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Kampus & Layanan */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wider uppercase">
              UMPKU Surakarta
            </h4>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <li>
                <a
                  href="https://umpku.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <span>Website Resmi Kampus</span>
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://kemahasiswaan.umpku.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <span>Biro Kemahasiswaan</span>
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </li>
              <li>
                <span className="text-xs text-stone-500">
                  Moderasi resmi oleh Biro Kemahasiswaan & Admin Kampus.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
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

