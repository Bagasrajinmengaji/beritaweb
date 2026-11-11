'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Trophy,
  Flame,
  ArrowRight,
  PlusCircle,
  Sparkles,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { CompetitionListItem, Category } from '@/types/competition';
import { CompetitionCard } from '@/components/CompetitionCard';
import { CompetitionCardSkeleton } from '@/components/CompetitionCardSkeleton';

export default function HomePage() {
  const router = useRouter();

  // State pencarian
  const [searchQuery, setSearchQuery] = useState('');

  // State data dari API
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestCompetitions, setLatestCompetitions] = useState<CompetitionListItem[]>([]);
  const [closingSoonCompetitions, setClosingSoonCompetitions] = useState<CompetitionListItem[]>([]);

  // State loading & error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch kategori, lomba terbaru, dan lomba segera berakhir secara paralel
      const [catRes, latestRes, closingRes] = await Promise.all([
        fetch(`${API}/categories`).then((r) => (r.ok ? r.json() : { data: [] })),
        fetch(`${API}/competitions?per_page=6&sort=newest`).then((r) =>
          r.ok ? r.json() : { data: [] }
        ),
        fetch(`${API}/competitions?per_page=4&sort=deadline_asc&deadline_status=segera`).then((r) =>
          r.ok ? r.json() : { data: [] }
        ),
      ]);

      setCategories(catRes.data || []);
      setLatestCompetitions(latestRes.data || []);
      setClosingSoonCompetitions(closingRes.data || []);
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      setError('Gagal memuat data informasi lomba. Pastikan server backend sudah berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/lomba?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/lomba');
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-16">
      {/* ── 1. Hero Section Ringkas & Padat Sesuai Superprompt ── */}
      <section className="relative overflow-hidden border-b border-stone-200 dark:border-zinc-800 bg-linear-to-b from-orange-50/60 via-stone-50 to-stone-50 dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950 pt-6 pb-8 sm:pt-10 sm:pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 sm:space-y-4">
            {/* Pill Kampus */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/70 border border-orange-200 dark:border-orange-800/60 text-orange-800 dark:text-orange-300 text-xs font-semibold shadow-2xs">
              <Sparkles size={13} className="text-orange-600 dark:text-orange-400" />
              <span>Pusat Prestasi Mahasiswa UMPKU Surakarta</span>
            </div>

            {/* Heading Sesuai Superprompt */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
              Temukan Lomba yang Sesuai dengan{' '}
              <span className="text-orange-600 dark:text-orange-500">Minat & Program Studimu</span>
            </h1>

            {/* Subheading Sesuai Superprompt */}
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Jelajahi informasi kompetisi, cek batas deadline pendaftaran, dan temukan peluang prestasi kemahasiswaan UMPKU Surakarta.
            </p>

            {/* ── 2. Search Bar Cepat & Responsif Mobile ── */}
            <form onSubmit={handleSearchSubmit} className="pt-2 sm:pt-3 max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-md rounded-2xl bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all p-1.5">
                <Search size={18} className="ml-2.5 sm:ml-3 text-stone-400 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul lomba, penyelenggara, atau kata kunci..."
                  className="w-full px-2 sm:px-3 py-2 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none"
                  aria-label="Cari informasi lomba"
                />
                <button
                  type="submit"
                  className="min-h-10 sm:min-h-11 px-3.5 sm:px-5 rounded-xl bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm transition-colors duration-150 shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <span className="hidden xs:inline sm:inline">Cari Lomba</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            </form>

            {/* ── 3. Quick Category Pills ── */}
            {categories.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium mr-1">
                  Kategori Populer:
                </span>
                {categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/lomba?category=${cat.slug}`}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors shadow-2xs"
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  href="/lomba"
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline px-2 py-1"
                >
                  Lihat Semua →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Content Container ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-12 sm:space-y-14">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-red-700 dark:text-red-300 text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors shrink-0"
            >
              <RefreshCw size={12} />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {/* ── 4. Section: Lomba Segera Berakhir (Deadline Terdekat) ── */}
        {(loading || closingSoonCompetitions.length > 0) && (
          <section aria-labelledby="heading-closing-soon">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Flame size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="heading-closing-soon"
                    className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
                  >
                    Segera Ditutup
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                    Batas pendaftaran kurang dari 7 hari. Jangan lewatkan kesempatan ini!
                  </p>
                </div>
              </div>

              <Link
                href="/lomba?deadline_status=segera"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline"
              >
                <span>Lihat Semua</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <CompetitionCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {closingSoonCompetitions.map((comp, idx) => (
                  <CompetitionCard key={comp.id} competition={comp} index={idx} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 5. Section: Lomba Terbaru ── */}
        <section aria-labelledby="heading-latest">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                <Trophy size={18} aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="heading-latest"
                  className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
                >
                  Informasi Lomba Terbaru
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  Peluang kompetisi yang baru disetujui dan siap kamu ikuti.
                </p>
              </div>
            </div>

            <Link
              href="/lomba"
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline"
            >
              <span>Jelajah Semua ({latestCompetitions.length})</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CompetitionCardSkeleton key={i} />
              ))}
            </div>
          ) : latestCompetitions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestCompetitions.map((comp, idx) => (
                <CompetitionCard key={comp.id} competition={comp} index={idx} />
              ))}
            </div>
          ) : (
            /* Empty State Sesuai Superprompt */
            <div className="rounded-3xl border border-dashed border-stone-300 dark:border-zinc-800 p-12 text-center space-y-4 bg-white/50 dark:bg-zinc-900/50">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                <Trophy size={28} />
              </div>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                Belum ada informasi lomba yang tersedia
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                Punya info lomba tingkat regional, nasional, atau internasional? Bagikan ke teman-teman mahasiswa sekarang.
              </p>
              <Link
                href="/lomba/tambah"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shadow-xs"
              >
                <PlusCircle size={16} />
                <span>Ajukan Lomba Pertama</span>
              </Link>
            </div>
          )}
        </section>

        {/* ── 6. CTA Banner Mahasiswa: Bagikan Info Lomba ── */}
        <section className="relative rounded-3xl overflow-hidden bg-linear-to-r from-orange-600 to-amber-600 text-white p-8 sm:p-12 shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
              <Sparkles size={13} />
              <span>Kontribusi Mahasiswa</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Punya Informasi Lomba Menarik? Bagikan ke Mahasiswa Lain!
            </h2>
            <p className="text-orange-100 text-sm sm:text-base leading-relaxed">
              Bantu rekan-rekan mahasiswa UMPKU Surakarta menemukan peluang prestasi dan kejuaraan. Setiap pengajuan akan diverifikasi oleh admin sebelum tampil kepada publik.
            </p>
            <div className="pt-2">
              <Link
                href="/lomba/tambah"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold text-sm transition-all shadow-md active:scale-98"
              >
                <PlusCircle size={18} />
                <span>Tambah Informasi Lomba Sekarang</span>
              </Link>
            </div>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-20 top-0 h-40 w-40 rounded-full bg-amber-400/20 blur-xl" />
        </section>
      </div>
    </main>
  );
}
