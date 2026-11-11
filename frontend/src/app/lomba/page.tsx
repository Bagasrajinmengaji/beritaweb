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
  ChevronDown,
  ChevronUp,
  X,
  SearchX,
  PlusCircle,
  GraduationCap,
  Layers,
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

  // Toggle filter lanjutan (Desktop & Mobile)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    Boolean(initialLevel || initialDeadlineStatus || (initialSort && initialSort !== 'newest'))
  );

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

  // 2. Sinkronkan state internal saat URL query berubah (back/forward atau navigasi dari luar)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setStudyProgram(searchParams.get('study_program') || '');
    setLevel(searchParams.get('level') || '');
    setDeadlineStatus(searchParams.get('deadline_status') || '');
    setSort(searchParams.get('sort') || 'newest');
    setPage(parseInt(searchParams.get('page') || '1', 10));

    if (searchParams.get('level') || searchParams.get('deadline_status') || (searchParams.get('sort') && searchParams.get('sort') !== 'newest')) {
      setShowAdvancedFilters(true);
    }
  }, [searchParams]);

  // 3. Fetch data lomba sesuai filter
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

  // Helper pembaruan query URL
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

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    applyFilters({ search: '', page: 1 });
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

  // Cek apakah filter lanjutan aktif
  const advancedCount =
    (level ? 1 : 0) +
    (deadlineStatus ? 1 : 0) +
    (sort && sort !== 'newest' ? 1 : 0);

  const hasActiveFilters = Boolean(
    search || category || studyProgram || level || deadlineStatus || (sort && sort !== 'newest')
  );

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-20">
      {/* ── Header Katalog Ringkas ── */}
      <section className="border-b border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 sm:py-8">
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
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                Temukan lomba yang sesuai dengan bidang keahlian dan program studi sasaranmu di UMPKU Surakarta.
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

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* ── Kotak Filter Terstruktur (Utama & Lanjutan) ── */}
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 space-y-4">
          {/* Baris 1: Pencarian Cepat dengan Tombol Reset Instan */}
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
                placeholder="Cari judul lomba, penyelenggara, atau kata kunci..."
                className="w-full min-h-11 pl-10 pr-10 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-md"
                  aria-label="Hapus teks pencarian"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Cari</span>
            </button>
          </form>

          {/* Baris 2: Filter Utama (Program Studi & Kategori Bidang) */}
          <div className="pt-3 border-t border-stone-100 dark:border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              {/* Filter 1: Program Studi Sasaran (Paling Utama bagi Mahasiswa) */}
              <div className="lg:col-span-5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  <GraduationCap size={14} className="text-orange-500" />
                  <span>Program Studi Sasaran</span>
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
                  <option value="">Semua Program Studi (Semua Mahasiswa)</option>
                  {studyPrograms.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Kategori Lomba */}
              <div className="lg:col-span-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  <Layers size={14} className="text-orange-500" />
                  <span>Kategori Bidang</span>
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
                  <option value="">Semua Kategori Bidang</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tombol Toggle Filter Lanjutan */}
              <div className="lg:col-span-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters((prev) => !prev)}
                  className={`w-full min-h-11 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                    showAdvancedFilters || advancedCount > 0
                      ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300'
                      : 'border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal size={14} />
                    <span>Filter Lanjutan</span>
                    {advancedCount > 0 && (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-orange-600 text-white">
                        {advancedCount}
                      </span>
                    )}
                  </span>
                  {showAdvancedFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Baris 3: Panel Filter Lanjutan (Collapsible) */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-dashed border-stone-200 dark:border-zinc-800 space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Tingkat Kompetisi */}
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

                {/* Urutkan Berdasarkan */}
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

                {/* Filter Biaya Pendaftaran Cepat (Gratis / Semua) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Biaya Pendaftaran
                  </label>
                  <div className="flex items-center gap-2 h-11">
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      Tersedia lomba gratis & berbayar dengan hadiah menarik
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Pendaftaran (Pills dengan Warna Status Standar) */}
              <div className="pt-3 border-t border-stone-100 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 mr-1">
                    Batas Pendaftaran:
                  </span>
                  {[
                    { label: 'Semua Status', value: '' },
                    { label: 'Pendaftaran Dibuka', value: 'dibuka' },
                    { label: 'Segera Ditutup (< 7 Hari)', value: 'segera' },
                    { label: 'Pendaftaran Ditutup', value: 'ditutup' },
                  ].map((s) => {
                    const isSelected = deadlineStatus === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          setDeadlineStatus(s.value);
                          setPage(1);
                          applyFilters({ deadline_status: s.value, page: 1 });
                        }}
                        className={`min-h-10 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? s.value === 'ditutup'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : s.value === 'segera'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : s.value === 'dibuka'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-orange-600 text-white shadow-xs'
                            : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Active Filter Chips (Pills Filter Aktif dengan tombol hapus satu per satu) ── */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2 bg-stone-100/70 dark:bg-zinc-900/60 border border-stone-200/80 dark:border-zinc-800 p-3 rounded-2xl">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">
              Filter Aktif:
            </span>

            {/* Chip Pencarian */}
            {search.trim() && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-200 transition-colors"
                title="Hapus filter pencarian ini"
              >
                <span>Kata Kunci: &ldquo;{search}&rdquo;</span>
                <X size={12} />
              </button>
            )}

            {/* Chip Prodi */}
            {studyProgram && (
              <button
                type="button"
                onClick={() => {
                  setStudyProgram('');
                  applyFilters({ study_program: '', page: 1 });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700 hover:border-red-400 hover:text-red-600 transition-colors"
                title="Hapus filter prodi ini"
              >
                <span>
                  Prodi: {studyPrograms.find((p) => p.slug === studyProgram)?.name || studyProgram}
                </span>
                <X size={12} />
              </button>
            )}

            {/* Chip Kategori */}
            {category && (
              <button
                type="button"
                onClick={() => {
                  setCategory('');
                  applyFilters({ category: '', page: 1 });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700 hover:border-red-400 hover:text-red-600 transition-colors"
                title="Hapus filter kategori ini"
              >
                <span>
                  Kategori: {categories.find((c) => c.slug === category)?.name || category}
                </span>
                <X size={12} />
              </button>
            )}

            {/* Chip Tingkat */}
            {level && (
              <button
                type="button"
                onClick={() => {
                  setLevel('');
                  applyFilters({ level: '', page: 1 });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700 hover:border-red-400 hover:text-red-600 transition-colors"
                title="Hapus filter tingkat ini"
              >
                <span>Tingkat: {level}</span>
                <X size={12} />
              </button>
            )}

            {/* Chip Status Deadline */}
            {deadlineStatus && (
              <button
                type="button"
                onClick={() => {
                  setDeadlineStatus('');
                  applyFilters({ deadline_status: '', page: 1 });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700 hover:border-red-400 hover:text-red-600 transition-colors"
                title="Hapus filter status ini"
              >
                <span>
                  Status:{' '}
                  {deadlineStatus === 'segera'
                    ? 'Segera Ditutup'
                    : deadlineStatus === 'dibuka'
                    ? 'Pendaftaran Dibuka'
                    : 'Pendaftaran Ditutup'}
                </span>
                <X size={12} />
              </button>
            )}

            {/* Tombol Reset Semua */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer ml-auto"
            >
              <RotateCcw size={12} />
              <span>Reset Semua</span>
            </button>
          </div>
        )}

        {/* ── Informasi Jumlah Temuan Lomba ── */}
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
          /* Empty State yang Membimbing Pengguna */
          <div className="rounded-3xl border border-dashed border-stone-300 dark:border-zinc-800 p-12 text-center space-y-4 bg-white/50 dark:bg-zinc-900/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-500">
              <SearchX size={28} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Tidak ada lomba yang sesuai dengan filter pencarian.
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Coba gunakan kata kunci yang lebih umum atau kosongkan filter program studi dan status pendaftaran.
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

        {/* ── Pagination Navigasi ── */}
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
