'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ExternalLink,
  Edit3,
  Trash2,
  AlertCircle,
  Calendar,
  Building2,
  Tag,
  Lock,
  ArrowRight,
  RefreshCw,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { CompetitionDetail, Category, StudyProgram } from '@/types/competition';

function formatDate(isoDate?: string | null): string {
  if (!isoDate) return '-';
  try {
    return new Date(isoDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

function getPosterSrc(posterPath?: string | null): string {
  if (!posterPath) return '/placeholder-news.webp';
  if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
    return posterPath;
  }
  const base = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://127.0.0.1:8000';
  return `${base}/${posterPath.replace(/^\/+/, '')}`;
}

export default function UserDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  // State Data
  const [competitions, setCompetitions] = useState<CompetitionDetail[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // State Modal Edit / Perbaikan
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<CompetitionDetail | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category_id: '',
    organizer: '',
    description: '',
    requirements: '',
    registration_deadline: '',
    registration_url: '',
    registration_fee: '',
    contact: '',
    source_url: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // State Modal Konfirmasi Hapus
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  // 1. Cek autentikasi
  useEffect(() => {
    const savedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user') || localStorage.getItem('auth_user');

    if (!savedToken) {
      setIsLoggedIn(false);
      return;
    }

    setToken(savedToken);
    setIsLoggedIn(true);

    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUserName(u.name || '');
      } catch {
        setUserName('');
      }
    }

    // Ambil master kategori untuk modal edit
    fetch(`${API}/categories`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((json) => setCategories(json.data || []))
      .catch((err) => console.error(err));
  }, [API]);

  // 2. Fetch daftar pengajuan milik user
  const fetchMyCompetitions = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch(`${API}/my/competitions?per_page=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Gagal mengambil daftar pengajuan lomba.');
      const json = await res.json();
      setCompetitions(json.data || []);
    } catch (err) {
      console.error('Error fetching my competitions:', err);
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchMyCompetitions();
    }
  }, [isLoggedIn, token, fetchMyCompetitions]);

  // Statistik Ringkasan
  const totalCount = competitions.length;
  const pendingCount = competitions.filter((c) => c.status === 'pending').length;
  const approvedCount = competitions.filter((c) => c.status === 'approved').length;
  const rejectedCount = competitions.filter((c) => c.status === 'rejected').length;

  // Filter sesuai Tab yang aktif
  const filteredCompetitions = competitions.filter((c) => {
    if (activeTab === 'all') return true;
    return c.status === activeTab;
  });

  // Buka Modal Edit
  const handleOpenEdit = (comp: CompetitionDetail) => {
    setEditingComp(comp);
    setEditFormData({
      title: comp.title,
      category_id: comp.category?.id ? comp.category.id.toString() : '',
      organizer: comp.organizer,
      description: comp.description || '',
      requirements: comp.requirements || '',
      registration_deadline: comp.registration_deadline || '',
      registration_url: comp.registration_url || '',
      registration_fee: comp.registration_fee || '',
      contact: comp.contact || '',
      source_url: comp.source_url || '',
    });
    setEditError(null);
    setEditModalOpen(true);
  };

  // Submit Update / Perbaikan
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComp || !token) return;

    if (!editFormData.title.trim()) {
      setEditError('Judul lomba wajib diisi.');
      return;
    }
    if (!editFormData.registration_url.trim()) {
      setEditError('Tautan pendaftaran resmi wajib diisi.');
      return;
    }

    const sanitizeUrl = (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return '';
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    };

    const payload = {
      ...editFormData,
      registration_url: sanitizeUrl(editFormData.registration_url),
      source_url: editFormData.source_url ? sanitizeUrl(editFormData.source_url) : '',
    };

    setIsUpdating(true);
    setEditError(null);

    try {
      const res = await fetch(`${API}/competitions/${editingComp.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Gagal menyimpan perubahan.');
      }

      setEditModalOpen(false);
      setEditingComp(null);
      setToastMessage('Perubahan berhasil dikirimkan kembali ke Admin untuk diverifikasi ulang.');
      setTimeout(() => setToastMessage(null), 4000);
      fetchMyCompetitions();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan perbaikan.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Konfirmasi & Eksekusi Hapus
  const handleConfirmDelete = async () => {
    if (!deletingId || !token) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`${API}/competitions/${deletingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Gagal menghapus informasi lomba.');

      setDeleteModalOpen(false);
      setDeletingId(null);
      fetchMyCompetitions();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus pengajuan lomba.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Layar Jika Belum Login ───
  if (isLoggedIn === false) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Akses Dashboard Terbatas
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Silakan masuk ke akun mahasiswa Anda untuk melihat riwayat dan status verifikasi lomba yang telah Anda ajukan.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shadow-xs"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-24">
      {/* ── Top Header Dashboard ── */}
      <section className="border-b border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Dashboard Mahasiswa UMPKU
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
                Pengajuan Informasi Lomba Saya
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                Selamat datang, <strong>{userName || 'Mahasiswa'}</strong>. Pantau status kurasi dan publikasi kompetisi yang Anda kirimkan.
              </p>
            </div>

            <Link
              href="/lomba/tambah"
              className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <PlusCircle size={16} />
              <span>Ajukan Lomba Baru</span>
            </Link>
          </div>

          {/* ── Kartu Statistik Ringkasan ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-8">
            {/* Total */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/80 dark:border-zinc-700 space-y-1">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Total Pengajuan
              </span>
              <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {totalCount}
              </p>
            </div>

            {/* Pending */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-1">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} />
                <span>Menunggu Verifikasi</span>
              </span>
              <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                {pendingCount}
              </p>
            </div>

            {/* Approved */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Disetujui & Tayang</span>
              </span>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {approvedCount}
              </p>
            </div>

            {/* Rejected */}
            <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 space-y-1">
              <span className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                <XCircle size={12} />
                <span>Perlu Perbaikan</span>
              </span>
              <p className="text-2xl font-extrabold text-red-700 dark:text-red-400">
                {rejectedCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Area: Tab Filter & List Kartu ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Toast Notifikasi Sukses */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tab Filter Status */}
        <div className="flex border-b border-stone-200 dark:border-zinc-800 gap-1 overflow-x-auto pb-px">
          {[
            { id: 'all', label: 'Semua', count: totalCount },
            { id: 'pending', label: 'Menunggu Verifikasi', count: pendingCount },
            { id: 'approved', label: 'Disetujui', count: approvedCount },
            { id: 'rejected', label: 'Perlu Perbaikan', count: rejectedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`min-h-11 px-4 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-orange-600 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* List Card Pengajuan */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-stone-200 dark:bg-zinc-800 rounded-3xl" />
            ))}
          </div>
        ) : filteredCompetitions.length > 0 ? (
          <div className="space-y-4">
            {filteredCompetitions.map((comp) => {
              const posterSrc = getPosterSrc(comp.poster_url);

              return (
                <article
                  key={comp.id}
                  className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-orange-500/40 transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                >
                  <div className="flex gap-4 items-start flex-1 min-w-0">
                    {/* Poster thumbnail */}
                    <div className="relative h-20 w-24 sm:h-24 sm:w-32 rounded-2xl overflow-hidden bg-stone-100 dark:bg-zinc-800 shrink-0 border border-stone-200/60 dark:border-zinc-700">
                      <Image
                        src={posterSrc}
                        alt={comp.title}
                        fill
                        className="object-cover"
                        unoptimized={posterSrc.startsWith('http://127')}
                      />
                    </div>

                    {/* Informasi Lomba */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Moderasi Badge */}
                        {comp.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 size={12} />
                            <span>Disetujui & Tayang</span>
                          </span>
                        )}
                        {comp.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <Clock size={12} />
                            <span>Menunggu Verifikasi</span>
                          </span>
                        )}
                        {comp.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                            <XCircle size={12} />
                            <span>Perlu Perbaikan</span>
                          </span>
                        )}

                        <span className="text-[11px] font-medium text-stone-500">
                          {comp.competition_level}
                        </span>
                        {comp.category && (
                          <span className="text-[11px] text-stone-400">• {comp.category.name}</span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1">
                        {comp.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Building2 size={13} className="text-orange-500" />
                          <span>{comp.organizer}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          <span>Batas: {formatDate(comp.registration_deadline)}</span>
                        </span>
                      </div>

                      {/* Box Alasan Penolakan dari Admin (Jika Ditolak) */}
                      {comp.status === 'rejected' && comp.rejection_reason && (
                        <div className="mt-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                          <AlertTriangle size={15} className="shrink-0 text-red-600 mt-0.5" />
                          <div>
                            <span className="font-bold">Catatan Verifikator:</span>
                            <p className="mt-0.5">{comp.rejection_reason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 dark:border-zinc-800 shrink-0">
                    {/* Lihat Publik jika approved */}
                    {comp.status === 'approved' && (
                      <Link
                        href={`/lomba/${comp.slug}`}
                        className="min-h-11 px-3.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-orange-500 flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink size={13} />
                        <span>Lihat Publik</span>
                      </Link>
                    )}

                    {/* Edit / Perbaiki */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(comp)}
                      className={`min-h-11 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        comp.status === 'rejected'
                          ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                          : 'border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-orange-500'
                      }`}
                    >
                      <Edit3 size={13} />
                      <span>{comp.status === 'rejected' ? 'Perbaiki Sekarang' : 'Edit'}</span>
                    </button>

                    {/* Hapus */}
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingId(comp.id);
                        setDeleteModalOpen(true);
                      }}
                      className="min-h-11 px-3 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1"
                      title="Hapus pengajuan lomba"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State Tab */
          <div className="rounded-3xl border border-dashed border-stone-300 dark:border-zinc-800 p-12 text-center space-y-4 bg-white/50 dark:bg-zinc-900/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-400">
              <Trophy size={28} />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
              Tidak ada pengajuan pada tab ini
            </h3>
            <p className="text-sm text-stone-500 max-w-sm mx-auto">
              {activeTab === 'all'
                ? 'Anda belum pernah mengajukan informasi lomba. Mulai bagikan peluang lomba pertama Anda!'
                : `Belum ada informasi lomba dengan status ${activeTab}.`}
            </p>
            <div className="pt-2">
              <Link
                href="/lomba/tambah"
                className="inline-flex items-center gap-2 min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shadow-xs"
              >
                <PlusCircle size={16} />
                <span>Ajukan Lomba Baru</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Edit / Perbaikan Lomba (Mobile Optimized) ── */}
      {editModalOpen && editingComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header (Sticky) */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 px-5 py-4 bg-stone-50/50 dark:bg-zinc-950/40 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Edit3 size={18} className="text-orange-600" />
                  <span>{editingComp.status === 'rejected' ? 'Perbaiki Pengajuan Lomba' : 'Edit Informasi Lomba'}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Perubahan akan otomatis dikirimkan kembali ke admin untuk verifikasi ulang.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Tutup form edit"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form id="editCompForm" onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Highlight Catatan Penolakan jika ada */}
              {editingComp.status === 'rejected' && editingComp.rejection_reason && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-300">
                    <AlertTriangle size={16} />
                    <span>Catatan Verifikator yang Perlu Diperbaiki:</span>
                  </div>
                  <p className="leading-relaxed pl-5 font-medium">{editingComp.rejection_reason}</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 pl-5 pt-0.5">
                    Silakan sesuaikan kolom yang bersangkutan di bawah ini, lalu klik &ldquo;Kirim Ulang Verifikasi&rdquo;.
                  </p>
                </div>
              )}

              {editError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Judul */}
              <div>
                <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  Judul Kompetisi / Lomba *
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              </div>

              {/* Kategori & Penyelenggara */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                    Kategori Bidang *
                  </label>
                  <select
                    value={editFormData.category_id}
                    onChange={(e) => setEditFormData({ ...editFormData, category_id: e.target.value })}
                    className="w-full min-h-11 px-3 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                    Penyelenggara *
                  </label>
                  <input
                    type="text"
                    value={editFormData.organizer}
                    onChange={(e) => setEditFormData({ ...editFormData, organizer: e.target.value })}
                    className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Biaya & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                    Biaya Pendaftaran
                  </label>
                  <input
                    type="text"
                    value={editFormData.registration_fee}
                    onChange={(e) => setEditFormData({ ...editFormData, registration_fee: e.target.value })}
                    placeholder="Gratis atau Rp 50.000"
                    className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                    Batas Akhir Pendaftaran (Deadline) *
                  </label>
                  <input
                    type="date"
                    value={editFormData.registration_deadline}
                    onChange={(e) => setEditFormData({ ...editFormData, registration_deadline: e.target.value })}
                    className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  Deskripsi Lengkap *
                </label>
                <textarea
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full p-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* Persyaratan & Ketentuan */}
              <div>
                <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  Persyaratan & Ketentuan Peserta
                </label>
                <textarea
                  rows={3}
                  value={editFormData.requirements}
                  onChange={(e) => setEditFormData({ ...editFormData, requirements: e.target.value })}
                  placeholder="Contoh: Mahasiswa aktif S1/D3, KTM aktif, maksimal 3 orang per tim..."
                  className="w-full p-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Link Pendaftaran & Kontak */}
              <div>
                <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  Link Formulir Pendaftaran Resmi *
                </label>
                <input
                  type="text"
                  value={editFormData.registration_url}
                  onChange={(e) => setEditFormData({ ...editFormData, registration_url: e.target.value })}
                  placeholder="https://bit.ly/daftar-lomba atau link resmi"
                  className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                    Kontak Narahubung
                  </label>
                  <input
                    type="text"
                    value={editFormData.contact}
                    onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                    className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                    placeholder="0812-xxxx-xxxx (WA)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                    Sumber Informasi / Web Penyelenggara
                  </label>
                  <input
                    type="text"
                    value={editFormData.source_url}
                    onChange={(e) => setEditFormData({ ...editFormData, source_url: e.target.value })}
                    className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer (Sticky) */}
            <div className="p-4 sm:px-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-950/80 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="min-h-11 px-4 rounded-xl border border-stone-300 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="editCompForm"
                disabled={isUpdating}
                className="min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>Kirim Ulang Verifikasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600">
              <Trash2 size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Hapus Pengajuan Lomba?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Tindakan ini permanen. Informasi lomba dan file poster yang tersimpan akan dihapus dari server.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="min-h-11 rounded-xl border border-stone-300 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-stone-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="min-h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <span>Ya, Hapus</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

