'use client';

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Users,
  Clock,
  Edit3,
  Trash2,
  Plus,
  Search,
  ArrowLeft,
  ShieldAlert,
  X,
  CheckCircle,
  AlertTriangle,
  Upload,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
  id: number;
  title: string;
  author?: string | null;
  content: string;
  image: string;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getImageSrc(imagePath: string): string {
  if (!imagePath) return '/placeholder-news.webp';
  if (imagePath.startsWith('http')) return imagePath;
  const base = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://127.0.0.1:8000';
  return `${base}${imagePath}`;
}

// ─── Google Icon SVG ──────────────────────────────────────────────────────────

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Toast Notification ───────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  const isSuccess = type === 'success';
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-white text-sm font-medium toast-enter toast-exit min-w-72 max-w-sm',
        isSuccess ? 'bg-emerald-600' : 'bg-rose-600',
      ].join(' ')}
    >
      {isSuccess
        ? <CheckCircle size={18} aria-hidden="true" />
        : <AlertTriangle size={18} aria-hidden="true" />
      }
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-1 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
        aria-label="Tutup notifikasi"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Admin Dashboard Page ─────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal State: Edit
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal State: Delete
  const [deletingNews, setDeletingNews] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  // ── 1. Fetch News ──
  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(`${API}/news`);
      if (!res.ok) throw new Error('Gagal mengambil daftar berita.');
      const data = (await res.json()) as NewsItem[];
      setNewsList(data);
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : 'Terjadi kesalahan.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    setMounted(true);
    const syncToken = () => {
      const savedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
      setToken(savedToken);

      if (savedToken) {
        fetchNews();
      } else {
        setLoading(false);
      }
    };

    syncToken();
    window.addEventListener('storage', syncToken);
    window.addEventListener('authChange', syncToken);
    return () => {
      window.removeEventListener('storage', syncToken);
      window.removeEventListener('authChange', syncToken);
    };
  }, [fetchNews]);

  // ── 2. Handle Login Google ──
  const handleLoginGoogle = () => {
    window.location.href = `${API}/auth/google`;
  };

  // ── 3. Open Edit Modal ──
  const handleOpenEdit = (item: NewsItem) => {
    setEditingNews(item);
    setEditTitle(item.title);
    setEditAuthor(item.author ?? '');
    setEditContent(item.content);
    setEditImage(null);
  };

  // ── 4. Submit Edit News ──
  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingNews || !token) return;

    if (!editTitle.trim()) {
      setToast({ message: 'Judul berita tidak boleh kosong.', type: 'error' });
      return;
    }

    const textOnly = editContent.replace(/<[^>]*>/g, '').trim();
    if (!textOnly) {
      setToast({ message: 'Konten berita tidak boleh kosong.', type: 'error' });
      return;
    }

    setIsUpdating(true);

    const formData = new FormData();
    formData.append('title', editTitle.trim());
    formData.append('author', editAuthor.trim());
    formData.append('content', editContent.trim());
    if (editImage) {
      formData.append('image', editImage);
    }

    try {
      const res = await fetch(`${API}/news/${editingNews.id}`, {
        method: 'POST', // Laravel routes support POST for multipart file upload
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth_user');
          setToken(null);
          window.dispatchEvent(new Event('authChange'));
          throw new Error('Sesi Anda berakhir. Silakan login kembali.');
        }
        const errData = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errData.message ?? 'Gagal memperbarui berita.');
      }

      const updated = (await res.json()) as { data: NewsItem };

      // Update state real-time
      setNewsList((prev) =>
        prev.map((item) => (item.id === editingNews.id ? updated.data : item))
      );

      setToast({ message: 'Berita berhasil diperbarui!', type: 'success' });
      setEditingNews(null);
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : 'Gagal memperbarui berita.',
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // ── 5. Confirm Delete News ──
  const handleConfirmDelete = async () => {
    if (!deletingNews || !token) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`${API}/news/${deletingNews.id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth_user');
          setToken(null);
          window.dispatchEvent(new Event('authChange'));
          throw new Error('Sesi Anda berakhir. Silakan login kembali.');
        }
        throw new Error('Gagal menghapus berita.');
      }

      // Hapus dari state real-time
      setNewsList((prev) => prev.filter((item) => item.id !== deletingNews.id));
      setToast({ message: 'Berita berhasil dihapus.', type: 'success' });
      setDeletingNews(null);
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── SKELETON LOADING ──
  if (!mounted || loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-pulse">
        <div className="skeleton h-8 w-60 rounded mb-4" />
        <div className="skeleton h-4 w-96 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="skeleton h-28 rounded-xl" />
          <div className="skeleton h-28 rounded-xl" />
          <div className="skeleton h-28 rounded-xl" />
        </div>
        <div className="skeleton h-72 rounded-xl" />
      </main>
    );
  }

  // ── AUTH GUARD (Akses Ditolak) ──
  if (!token) {
    return (
      <main id="main-content" className="mx-auto max-w-lg px-4 sm:px-6 py-16 sm:py-24" role="main">
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <ShieldAlert size={30} aria-hidden="true" />
          </div>

          <h1
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Akses Ditolak
          </h1>

          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
            Halaman Dashboard Admin hanya dapat diakses oleh redaktur yang telah masuk melalui Google SSO.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLoginGoogle}
              className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shadow-sm"
            >
              <GoogleIcon size={18} />
              <span>Login dengan Google</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors py-2"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── FILTER DATA ──
  const filteredNews = newsList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.author && item.author.toLowerCase().includes(q))
    );
  });

  // ── STATS CALCULATION ──
  const totalNews = newsList.length;
  const uniqueAuthors = new Set(
    newsList.map((n) => (n.author && n.author.trim() ? n.author.trim() : 'Redaksi'))
  ).size;
  const latestNewsTitle = newsList[0]?.title ?? 'Belum ada berita';

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main id="main-content" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12" role="main">
        {/* ── Top Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Dashboard Redaksi
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Kelola, edit, dan pantau seluruh artikel berita yang dipublikasikan.
            </p>
          </div>

          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shadow-sm self-start sm:self-auto"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Tulis Berita Baru</span>
          </Link>
        </div>

        {/* ── 2. Ringkasan Statistik (Stats Cards) ── */}
        <section aria-label="Statistik Berita" className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {/* Card 1 */}
          <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <div className="flex items-center gap-3.5 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <FileText size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Total Berita Terbit
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {totalNews}
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Artikel aktif di database portal
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <div className="flex items-center gap-3.5 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <Users size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Penulis Aktif
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {uniqueAuthors}
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Jurnalis & kontributor terdaftar
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <div className="flex items-center gap-3.5 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <Clock size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Berita Terakhir
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {latestNewsTitle}
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {newsList[0] ? formatDate(newsList[0].created_at) : 'Belum ada aktivitas'}
            </p>
          </div>
        </section>

        {/* ── 3. Tabel Manajemen Berita ── */}
        <section
          aria-labelledby="table-heading"
          className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden"
        >
          {/* Table Toolbar */}
          <div className="p-5 border-b border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2
                id="table-heading"
                className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
              >
                Daftar Artikel
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Total {filteredNews.length} dari {newsList.length} berita
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau penulis…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                aria-label="Cari artikel"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-800 dark:text-zinc-200">
              <thead className="bg-stone-50 dark:bg-zinc-950 text-xs uppercase font-semibold text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-5 py-3.5 w-20">
                    Sampul
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Judul Berita
                  </th>
                  <th scope="col" className="px-5 py-3.5 w-44">
                    Penulis
                  </th>
                  <th scope="col" className="px-5 py-3.5 w-36">
                    Tanggal
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right w-32">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/80">
                {filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-stone-500 dark:text-stone-400">
                      {searchQuery
                        ? 'Tidak ada berita yang cocok dengan kata kunci pencarian.'
                        : 'Belum ada berita yang diterbitkan.'}
                    </td>
                  </tr>
                ) : (
                  filteredNews.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Thumbnail */}
                      <td className="px-5 py-4">
                        <div className="relative h-12 w-16 rounded-md overflow-hidden bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-800">
                          <Image
                            src={getImageSrc(item.image)}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized={getImageSrc(item.image).startsWith('http://127')}
                          />
                        </div>
                      </td>

                      {/* Judul */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/news/${item.id}`}
                          className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                          {item.content.replace(/<[^>]*>/g, '').slice(0, 90)}…
                        </p>
                      </td>

                      {/* Penulis */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-medium">
                          <UserIcon size={12} className="text-orange-600 dark:text-orange-400" />
                          {item.author ?? 'Redaksi'}
                        </span>
                      </td>

                      {/* Tanggal */}
                      <td className="px-5 py-4 text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={12} />
                          {formatDate(item.created_at)}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-stone-300 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                            title="Edit Berita"
                            aria-label={`Edit ${item.title}`}
                          >
                            <Edit3 size={14} aria-hidden="true" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingNews(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-stone-300 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            title="Hapus Berita"
                            aria-label={`Hapus ${item.title}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ── MODAL: EDIT BERITA ── */}
      {editingNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200 dark:border-zinc-800">
              <div>
                <h3
                  id="edit-modal-title"
                  className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Edit Berita
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  ID: #{editingNews.id} — Perbarui konten dan informasi artikel.
                </p>
              </div>

              <button
                type="button"
                onClick={() => !isUpdating && setEditingNews(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                aria-label="Tutup form edit"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="space-y-5">
              {/* Judul */}
              <div>
                <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Judul Berita <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 px-3.5 py-2 text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                  disabled={isUpdating}
                  required
                />
              </div>

              {/* Penulis */}
              <div>
                <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Nama Penulis / Redaksi
                </label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  placeholder="Misal: Bagas Pratama"
                  className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 px-3.5 py-2 text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                  disabled={isUpdating}
                />
              </div>

              {/* RichTextEditor */}
              <div>
                <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Konten Berita <span className="text-orange-600">*</span>
                </label>
                <RichTextEditor
                  content={editContent}
                  onChange={(html) => setEditContent(html)}
                  disabled={isUpdating}
                />
              </div>

              {/* Gambar Sampul (Opsional Ganti) */}
              <div>
                <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Ganti Gambar Sampul (Opsional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-24 rounded-lg overflow-hidden border border-stone-200 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-800 shrink-0">
                    <Image
                      src={editImage ? URL.createObjectURL(editImage) : getImageSrc(editingNews.image)}
                      alt="Pratinjau gambar"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-2 rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      <Upload size={14} aria-hidden="true" />
                      <span>{editImage ? editImage.name : 'Pilih Berkas Baru (JPG/PNG/WebP)'}</span>
                    </button>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      Gambar baru otomatis dikonversi ke WebP kualitas 80%.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setEditImage(f);
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => !isUpdating && setEditingNews(null)}
                  disabled={isUpdating}
                  className="rounded-lg border border-stone-300 dark:border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-5 py-2 text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  {isUpdating ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      <span>Menyimpan…</span>
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: KONFIRMASI HAPUS ── */}
      {deletingNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3.5 mb-4 text-red-600 dark:text-red-400">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60">
                <Trash2 size={22} aria-hidden="true" />
              </span>
              <div>
                <h3 id="delete-dialog-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Hapus Berita Ini?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <p className="text-sm text-stone-600 dark:text-stone-300 mb-6 bg-stone-50 dark:bg-zinc-950 p-3 rounded-lg border border-stone-200 dark:border-zinc-800 line-clamp-2">
              "{deletingNews.title}"
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => !isDeleting && setDeletingNews(null)}
                disabled={isDeleting}
                className="rounded-lg border border-stone-300 dark:border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {isDeleting ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    <span>Menghapus…</span>
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
