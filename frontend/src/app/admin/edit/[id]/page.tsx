'use client';

import { useState, useEffect, useCallback, useRef, use, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertTriangle,
  X,
  ShieldAlert,
  Save,
  Image as ImageIcon,
  LogIn,
} from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id?: number;
  name: string;
  email: string;
  role?: string | null;
  avatar?: string | null;
}

interface NewsDetail {
  id: number;
  user_id?: number | null;
  title: string;
  author?: string | null;
  content: string;
  image: string;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getImageSrc(imagePath: string): string {
  if (!imagePath) return '/placeholder-news.webp';
  if (imagePath.startsWith('http')) return imagePath;
  const base = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://127.0.0.1:8000';
  return `${base}${imagePath}`;
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
      {isSuccess ? (
        <CheckCircle size={18} aria-hidden="true" />
      ) : (
        <AlertTriangle size={18} aria-hidden="true" />
      )}
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

// ─── Edit Page Component ──────────────────────────────────────────────────────

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [currentImage, setCurrentImage] = useState<string>('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  // ── 1. Fetch News Detail ──
  const fetchNewsDetail = useCallback(
    async (newsId: string, activeToken: string) => {
      try {
        const res = await fetch(`${API}/news/${newsId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Berita tidak ditemukan.');
          throw new Error('Gagal mengambil data berita.');
        }

        const data = (await res.json()) as NewsDetail;
        setNews(data);
        setTitle(data.title);
        setAuthor(data.author ?? '');
        setContent(data.content);
        setCurrentImage(data.image);

        // Ownership check
        const savedUserRaw = localStorage.getItem('user') || localStorage.getItem('auth_user');
        const savedRole = localStorage.getItem('role') || localStorage.getItem('user_role');
        let userObj: AuthUser | null = null;
        if (savedUserRaw) {
          try {
            userObj = JSON.parse(savedUserRaw) as AuthUser;
          } catch {
            userObj = null;
          }
        }
        const userRole = savedRole || userObj?.role || 'user';

        if (userRole !== 'admin' && data.user_id && userObj?.id && data.user_id !== userObj.id) {
          setUnauthorizedError('Anda hanya dapat mengedit berita buatan sendiri.');
        }
      } catch (err: unknown) {
        setToast({
          message: err instanceof Error ? err.message : 'Terjadi kesalahan.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [API]
  );

  // ── 2. Auth & Initialization ──
  useEffect(() => {
    setMounted(true);
    const activeToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('user') || localStorage.getItem('auth_user');
    const roleRaw = localStorage.getItem('role') || localStorage.getItem('user_role');

    setToken(activeToken);

    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw) as AuthUser;
        if (roleRaw) parsed.role = roleRaw;
        setCurrentUser(parsed);
      } catch {
        setCurrentUser(null);
      }
    }

    if (activeToken && id) {
      fetchNewsDetail(id, activeToken);
    } else {
      setLoading(false);
    }
  }, [id, fetchNewsDetail]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveNewImage = () => {
    setNewImage(null);
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
      setNewImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── 3. Handle Submit Update ──
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!title.trim()) {
      setToast({ message: 'Judul berita tidak boleh kosong.', type: 'error' });
      return;
    }

    const textOnly = content.replace(/<[^>]*>/g, '').trim();
    if (!textOnly) {
      setToast({ message: 'Konten berita tidak boleh kosong.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    try {
      let res: Response;

      if (newImage) {
        // Jika ada unggahan gambar baru, gunakan multipart form data
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('author', author.trim());
        formData.append('content', content.trim());
        formData.append('image', newImage);
        formData.append('_method', 'PUT');

        res = await fetch(`${API}/news/${id}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // Jika hanya memperbarui teks, kirim request PUT langsung
        res = await fetch(`${API}/news/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            author: author.trim(),
            content: content.trim(),
          }),
        });
      }

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Anda hanya dapat mengedit berita buatan sendiri.');
        }
        if (res.status === 401) {
          throw new Error('Sesi Anda berakhir. Silakan login kembali.');
        }
        const errData = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errData.message ?? 'Gagal memperbarui berita.');
      }

      setToast({ message: 'Berita berhasil diperbarui! Mengalihkan...', type: 'success' });

      // Redirect kembali ke Dashboard Admin
      setTimeout(() => {
        router.push('/admin');
      }, 1200);
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : 'Gagal memperbarui berita.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 4. Render Guards ──
  if (!mounted || loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-pulse">
        <div className="skeleton h-8 w-48 rounded mb-6" />
        <div className="skeleton h-12 w-full rounded-xl mb-4" />
        <div className="skeleton h-48 w-full rounded-2xl mb-4" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </main>
    );
  }

  // Auth Guard: Belum Login
  if (!token) {
    return (
      <main className="mx-auto max-w-lg px-4 sm:px-6 py-20 text-center">
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <ShieldAlert size={30} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Akses Ditolak
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
            Anda harus masuk ke akun untuk mengedit artikel berita.
          </p>
          <Link
            href={`/login?redirect=/admin/edit/${id}`}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 text-white font-semibold py-2.5 hover:bg-orange-700 transition-colors shadow-sm"
          >
            <LogIn size={16} />
            <span>Masuk ke Akun</span>
          </Link>
        </div>
      </main>
    );
  }

  // Ownership Guard: Bukan pemilik dan bukan admin
  if (unauthorizedError) {
    return (
      <main className="mx-auto max-w-lg px-4 sm:px-6 py-20 text-center">
        <div className="rounded-2xl border border-rose-200 dark:border-rose-950 bg-rose-50/50 dark:bg-zinc-900 p-8 shadow-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
            <ShieldAlert size={30} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Akses Dibatasi
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
            {unauthorizedError}
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard Redaksi
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main id="main-content" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12" role="main">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Kembali ke Dashboard</span>
          </Link>

          <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300">
            ID Berita: #{id}
          </span>
        </div>

        {/* Page Title */}
        <div className="mb-8 border-b border-stone-200 dark:border-zinc-800 pb-5">
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Edit Publikasi Berita
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Perbarui judul, gambar sampul, atau konten artikel menggunakan TipTap Editor.
          </p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul Berita */}
          <div>
            <label
              htmlFor="edit-news-title"
              className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2"
            >
              Judul Berita <span className="text-orange-600">*</span>
            </label>
            <input
              id="edit-news-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul berita editorial..."
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-base font-medium transition-colors shadow-xs"
            />
          </div>

          {/* Penulis (Opsional / Editable) */}
          <div>
            <label
              htmlFor="edit-news-author"
              className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2"
            >
              Nama Penulis / Redaksi
            </label>
            <input
              id="edit-news-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nama jurnalis atau tim redaksi..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm transition-colors shadow-xs"
            />
          </div>

          {/* Gambar Sampul (Sampul Sekarang & Opsi Ganti) */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
              Gambar Sampul Berita
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gambar Sekarang */}
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 font-medium">
                  Sampul Saat Ini:
                </p>
                <div className="relative h-44 w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700">
                  {currentImage ? (
                    <Image
                      src={getImageSrc(currentImage)}
                      alt={title || 'Sampul berita'}
                      fill
                      className="object-cover"
                      unoptimized={getImageSrc(currentImage).startsWith('http://127')}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-400">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Gambar Baru */}
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 font-medium">
                  Unggah Gambar Baru (Opsional):
                </p>

                {newImagePreview ? (
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border-2 border-orange-500 bg-stone-50 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={newImagePreview}
                      alt="Preview gambar baru"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveNewImage}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                      aria-label="Batalkan gambar baru"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-3 py-1 text-[11px] text-white truncate">
                      {newImage?.name} ({(newImage ? newImage.size / 1024 : 0).toFixed(0)} KB)
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed border-stone-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-500 bg-stone-50/50 dark:bg-zinc-950/30 cursor-pointer transition-colors p-4 text-center"
                  >
                    <Upload size={26} className="text-stone-400 dark:text-stone-500 mb-2" />
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Pilih gambar pengganti
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      JPEG, PNG, WebP (Maks 5MB)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  id="new-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Isi Konten Berita (TipTap WYSIWYG) */}
          <div>
            <label
              htmlFor="edit-news-content"
              className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2"
            >
              Isi Konten Berita <span className="text-orange-600">*</span>
            </label>
            <RichTextEditor
              content={content}
              onChange={(html) => setContent(html)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-zinc-800">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
            >
              Batal
            </Link>

            <button
              id="btn-save-edit"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-6 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Menyimpan Perubahan…</span>
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
