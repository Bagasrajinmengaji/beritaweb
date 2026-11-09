'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  RotateCcw,
  Trophy,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  SearchX,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import {
  CompetitionListItem,
  Category,
  StudyProgram,
  PaginationMeta,
} from '@/types/competition';
import { CompetitionCard } from '@/components/CompetitionCard';
import { CompetitionCardSkeleton } from '@/components/CompetitionCardSkeleton';

function LombaKatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parameter dari URL query
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialProdi = searchParams.get('study_program') || '';
  const initialLevel = searchParams.get('level') || '';
  const initialDeadlineStatus = searchParams.get('deadline_status') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  // Filter Form State
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [studyProgram, setStudyProgram] = useState(initialProdi);
  const [level, setLevel] = useState(initialLevel);
  const [deadlineStatus, setDeadlineStatus] = useState(initialDeadlineStatus);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  // Mobile Filter Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Master Data & Result State
  const [categories, setCategories] = useState<Category[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  // 1. Ambil master data Kategori & Prodi untuk dropdown filter
  useEffect(() => {
    Promise.all([
      fetch(`${API}/categories`).then((r) => (r.ok ? r.json() : { data: [] })),
      fetch(`${API}/study-programs`).then((r) => (r.ok ? r.json() : { data: [] })),
    ])
      .then(([catRes, prodiRes]) => {
        setCategories(catRes.data || []);
        setStudyPrograms(prodiRes.data || []);
      })
      .catch((err) => console.error('Error fetching master filters:', err));
  }, [API]);

  // 2. Fetch data lomba sesuai filter saat query berubah
  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    if (studyProgram) params.set('study_program', studyProgram);
    if (level) params.set('level', level);
    if (deadlineStatus) params.set('deadline_status', deadlineStatus);
    if (sort) params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());
    params.set('per_page', '12');

    try {
      const res = await fetch(`${API}/competitions?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal mengambil data katalog lomba.');
      const json = await res.json();
      setCompetitions(json.data || []);
      if (json.meta) {
        setMeta(json.meta);
      }
    } catch (err) {
      console.error('Error loading competitions:', err);
      setError('Terjadi kendala saat memuat data lomba. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [API, search, category, studyProgram, level, deadlineStatus, sort, page]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  // Update URL parameters saat filter diterapkan
  const applyFilters = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([k, v]) => {
      if (v) {
        params.set(k, v.toString());
      } else {
        params.delete(k);
      }
    });

    router.push(`/lomba?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    applyFilters({
      search: search.trim(),
      category,
      study_program: studyProgram,
      level,
      deadline_status: deadlineStatus,
      sort,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setStudyProgram('');
    setLevel('');
    setDeadlineStatus('');
    setSort('newest');
    setPage(1);
    router.push('/lomba');
  };

  const hasActiveFilters = Boolean(
    search || category || studyProgram || level || deadlineStatus || sort !== 'newest'
  );

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-20">
      {/* ── Header Katalog ── */}
      <section className="border-b border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">
                <Trophy size={14} aria-hidden="true" />
                <span>Katalog Informasi Lomba</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Jelajahi Peluang & Kompetisi
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                Temukan lomba yang sesuai dengan bidang keahlian dan program studi sasaranmu.
              </p>
            </div>

            <Link
              href="/lomba/tambah"
              className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shadow-xs shrink-0 self-start md:self-auto"
            >
              <PlusCircle size={16} aria-hidden="true" />
              <span>Ajukan Info Lomba</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* ── Search Bar & Filter Controls ── */}
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs mb-8 space-y-4">
          {/* Baris 1: Pencarian Teks & Tombol Filter Mobile */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan judul lomba, penyelenggara..."
                className="w-full min-h-11 pl-10 pr-4 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <button
              type="submit"
              className="min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shrink-0"
            >
              Cari
            </button>

            {/* Toggle Filter di Mobile */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen((prev) => !prev)}
              className="md:hidden min-h-11 px-3.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 font-medium text-sm flex items-center gap-1.5 shrink-0"
              aria-label="Filter"
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
            </button>
          </form>

          {/* Baris 2: Filter Dropdown (Desktop & Expandable Mobile) */}
          <div className={`${mobileFilterOpen ? 'block' : 'hidden'} md:block pt-3 border-t border-stone-100 dark:border-zinc-800`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Filter Kategori */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Kategori Lomba
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                    applyFilters({ category: e.target.value, page: 1 });
                  }}
                  className="w-full min-h-11 px-3 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Program Studi */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Program Studi Sasaran
                </label>
                <select
                  value={studyProgram}
                  onChange={(e) => {
                    setStudyProgram(e.target.value);
                    setPage(1);
                    applyFilters({ study_program: e.target.value, page: 1 });
                  }}
                  className="w-full min-h-11 px-3 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Semua Program Studi</option>
                  {studyPrograms.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Tingkat Kompetisi */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Tingkat Kompetisi
                </label>
                <select
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setPage(1);
                    applyFilters({ level: e.target.value, page: 1 });
                  }}
                  className="w-full min-h-11 px-3 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Semua Tingkat</option>
                  <option value="Internasional">Internasional</option>
                  <option value="Nasional">Nasional</option>
                  <option value="Provinsi">Provinsi</option>
                  <option value="Regional">Regional</option>
                  <option value="Internal Kampus">Internal Kampus</option>
                </select>
              </div>

              {/* Urutkan (Sorting) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Urutkan Berdasarkan
                </label>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    applyFilters({ sort: e.target.value, page: 1 });
                  }}
                  className="w-full min-h-11 px-3 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="newest">Paling Baru Ditambahkan</option>
                  <option value="deadline_asc">Deadline Paling Dekat</option>
                  <option value="deadline_desc">Deadline Paling Lama</option>
                  <option value="title_asc">Judul Lomba (A - Z)</option>
                </select>
              </div>
            </div>

            {/* Baris 3: Pills Status Deadline & Tombol Reset */}
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">
                  Status Pendaftaran:
                </span>
                {[
                  { label: 'Semua Status', value: '' },
                  { label: 'Pendaftaran Dibuka', value: 'dibuka' },
                  { label: 'Segera Ditutup', value: 'segera' },
                  { label: 'Pendaftaran Ditutup', value: 'ditutup' },
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      setDeadlineStatus(s.value);
                      setPage(1);
                      applyFilters({ deadline_status: s.value, page: 1 });
                    }}
                    className={`min-h-11 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      deadlineStatus === s.value
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="min-h-11 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                  <RotateCcw size={12} />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Informasi Jumlah Temuan ── */}
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-6 px-1">
          <span>
            Menampilkan <strong>{competitions.length}</strong> dari <strong>{meta.total}</strong> informasi lomba
          </span>
          {meta.last_page > 1 && (
            <span>
              Halaman {meta.current_page} dari {meta.last_page}
            </span>
          )}
        </div>

        {/* ── Grid Lomba ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CompetitionCardSkeleton key={i} />
            ))}
          </div>
        ) : competitions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((comp, idx) => (
              <CompetitionCard key={comp.id} competition={comp} index={idx} />
            ))}
          </div>
        ) : (
          /* Empty State Sesuai Superprompt */
          <div className="rounded-3xl border border-dashed border-stone-300 dark:border-zinc-800 p-12 text-center space-y-4 bg-white/50 dark:bg-zinc-900/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-500">
              <SearchX size={28} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Tidak ada lomba yang sesuai dengan pencarianmu.
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Coba gunakan kata kunci yang lebih umum atau sesuaikan filter program studi dan status pendaftaran.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 transition-colors shadow-xs"
              >
                <RotateCcw size={13} />
                <span>Reset Semua Filter</span>
              </button>
            )}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && meta.last_page > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              onClick={() => {
                const newPage = meta.current_page - 1;
                setPage(newPage);
                applyFilters({ page: newPage });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="min-h-11 px-4 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-orange-500 transition-colors flex items-center gap-1 shadow-xs"
            >
              <ChevronLeft size={14} />
              <span>Sebelumnya</span>
            </button>

            <span className="px-4 text-xs font-semibold text-stone-600 dark:text-stone-400">
              {meta.current_page} / {meta.last_page}
            </span>

            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => {
                const newPage = meta.current_page + 1;
                setPage(newPage);
                applyFilters({ page: newPage });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="min-h-11 px-4 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-orange-500 transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Selanjutnya</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function LombaKatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 p-8">
          <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
            <div className="h-20 bg-stone-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CompetitionCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <LombaKatalogContent />
    </Suspense>
  );
}

