'use client';

import { useState, useRef, useCallback, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';

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

// ─── Toast ────────────────────────────────────────────────────────────────────

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
        isSuccess
          ? 'bg-[oklch(0.42_0.15_145)]'
          : 'bg-[oklch(0.42_0.18_25)]',
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

// ─── Image Preview ────────────────────────────────────────────────────────────

function ImagePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const src = URL.createObjectURL(file);
  return (
    <div className="relative mt-3 rounded-xl overflow-hidden border border-black/8 dark:border-white/8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Preview gambar yang akan diunggah"
        className="w-full object-cover max-h-56"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Hapus gambar yang dipilih"
      >
        <X size={14} aria-hidden="true" />
      </button>
      <p className="px-3 py-1.5 text-xs text-[oklch(0.55_0.007_250)] dark:text-[oklch(0.55_0.006_250)] bg-black/5 dark:bg-white/5">
        {file.name} — {(file.size / 1024).toFixed(0)} KB
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Client-side validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem('auth_token');
    setToken(savedToken);
  }, []);

  const handleLoginGoogle = () => {
    window.location.href = `${API}/auth/google`;
  };

  // ── Validation ──
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Judul berita wajib diisi.';
    else if (title.trim().length < 5) errs.title = 'Judul minimal 5 karakter.';
    const textOnly = content.replace(/<[^>]*>/g, '').trim();
    if (!textOnly) errs.content = 'Konten berita wajib diisi.';
    else if (textOnly.length < 20) errs.content = 'Konten minimal 20 karakter.';
    if (!image) errs.image = 'Gambar wajib diunggah.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) return;

      const activeToken = localStorage.getItem('auth_token');
      if (!activeToken) {
        setToast({
          message: 'Sesi Anda telah berakhir. Silakan login kembali.',
          type: 'error',
        });
        setToken(null);
        return;
      }

      setIsSubmitting(true);
      setToast(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (image) formData.append('image', image);

      try {
        const res = await fetch(`${API}/news`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${activeToken}`,
          },
          body: formData,
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setToken(null);
            throw new Error('Sesi login telah habis. Silakan login dengan Google kembali.');
          }
          const errData = (await res.json().catch(() => ({}))) as {
            message?: string;
            errors?: Record<string, string[]>;
          };
          const serverMsg =
            errData.errors
              ? Object.values(errData.errors).flat().join(' ')
              : (errData.message ?? `HTTP ${res.status}`);
          throw new Error(serverMsg);
        }

        setToast({ message: 'Berita berhasil diterbitkan!', type: 'success' });

        setTimeout(() => {
          router.push('/');
        }, 1500);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan.';
        setToast({ message, type: 'error' });
        setIsSubmitting(false);
      }
    },
    [title, content, image, router, API],
  );

  // ── Drag-and-drop ──
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && /image\/(jpeg|jpg|png|webp)/.test(file.type)) {
      setImage(file);
      setFieldErrors((prev) => ({ ...prev, image: '' }));
    }
  }, []);

  const inputClass = (field: string) =>
    [
      'w-full rounded-lg border px-4 py-2.5 text-sm bg-white dark:bg-[oklch(0.16_0.007_250)] text-[oklch(0.18_0.008_250)] dark:text-[oklch(0.92_0.004_250)] placeholder:text-[oklch(0.65_0.006_250)] dark:placeholder:text-[oklch(0.5_0.005_250)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[oklch(0.52_0.18_240)] focus:border-transparent',
      fieldErrors[field]
        ? 'border-red-400 dark:border-red-700'
        : 'border-black/12 dark:border-white/12',
    ].join(' ');

  // Loading skeleton state sebelum mounted
  if (!mounted) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14 animate-pulse">
        <div className="skeleton h-5 w-24 rounded mb-8" />
        <div className="rounded-2xl border border-black/6 dark:border-white/6 p-8 space-y-6">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-4 w-72 rounded" />
          <div className="skeleton h-10 w-full rounded" />
          <div className="skeleton h-32 w-full rounded" />
        </div>
      </main>
    );
  }

  // ── Proteksi Halaman: Jika Belum Login ──
  if (!token) {
    return (
      <main id="main-content" className="mx-auto max-w-lg px-4 sm:px-6 py-16 sm:py-24" role="main">
        <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-surface-50 dark:bg-[oklch(0.13_0.006_250)] p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <ShieldAlert size={30} aria-hidden="true" />
          </div>

          <h1
            className="text-2xl font-bold text-[oklch(0.18_0.008_250)] dark:text-[oklch(0.92_0.004_250)] mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Akses Terbatas
          </h1>

          <p className="text-sm text-[oklch(0.45_0.007_250)] dark:text-[oklch(0.6_0.006_250)] leading-relaxed mb-6">
            Anda harus login dengan Google untuk menulis dan menerbitkan berita di Portal Berita.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLoginGoogle}
              className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[oklch(0.18_0.008_250)] px-4 py-3 text-sm font-semibold text-[oklch(0.18_0.008_250)] dark:text-white hover:bg-black/4 dark:hover:bg-white/6 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-sm"
            >
              <GoogleIcon size={18} />
              <span>Masuk dengan Google</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200 transition-colors py-2"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Form Tulis Berita (User Sudah Login) ──
  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main id="main-content" className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14" role="main">
        {/* Back */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-0.5"
            aria-label="Kembali ke halaman utama"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Kembali
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-black/6 dark:border-white/6 bg-surface-50 dark:bg-[oklch(0.13_0.006_250)] shadow-sm px-6 py-8 sm:px-8">
          <div className="mb-7">
            <h1
              className="text-2xl font-bold text-[oklch(0.18_0.008_250)] dark:text-[oklch(0.92_0.004_250)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tulis Berita Baru
            </h1>
            <p className="mt-1 text-sm text-[oklch(0.55_0.007_250)] dark:text-[oklch(0.55_0.006_250)]">
              Isi formulir di bawah ini untuk menerbitkan berita ke portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="news-title"
                className="block text-sm font-semibold text-[oklch(0.28_0.008_250)] dark:text-[oklch(0.85_0.005_250)] mb-1.5"
              >
                Judul Berita <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="news-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: '' }));
                }}
                placeholder="Masukkan judul berita yang menarik…"
                className={inputClass('title')}
                aria-required="true"
                aria-describedby={fieldErrors.title ? 'title-error' : undefined}
                disabled={isSubmitting}
                maxLength={255}
              />
              {fieldErrors.title && (
                <p id="title-error" role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} aria-hidden="true" />
                  {fieldErrors.title}
                </p>
              )}
            </div>

            {/* Content WYSIWYG */}
            <div>
              <label
                className="block text-sm font-semibold text-[oklch(0.28_0.008_250)] dark:text-[oklch(0.85_0.005_250)] mb-1.5"
              >
                Konten Berita <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <RichTextEditor
                content={content}
                onChange={(html) => {
                  setContent(html);
                  if (fieldErrors.content) setFieldErrors((p) => ({ ...p, content: '' }));
                }}
                disabled={isSubmitting}
                hasError={Boolean(fieldErrors.content)}
              />
              {fieldErrors.content && (
                <p id="content-error" role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} aria-hidden="true" />
                  {fieldErrors.content}
                </p>
              )}
            </div>

            {/* Image upload */}
            <div>
              <label
                htmlFor="news-image"
                className="block text-sm font-semibold text-[oklch(0.28_0.008_250)] dark:text-[oklch(0.85_0.005_250)] mb-1.5"
              >
                Gambar Sampul <span aria-hidden="true" className="text-red-500">*</span>
              </label>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                role="button"
                tabIndex={isSubmitting ? -1 : 0}
                aria-label="Area unggah gambar — klik atau seret gambar ke sini"
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isSubmitting) {
                    fileInputRef.current?.click();
                  }
                }}
                className={[
                  'cursor-pointer flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:border-brand-500/50 hover:bg-brand-500/2',
                  fieldErrors.image
                    ? 'border-red-400 dark:border-red-700 bg-red-50/50 dark:bg-red-950/10'
                    : 'border-black/12 dark:border-white/12 bg-black/1 dark:bg-white/1',
                ].join(' ')}
              >
                <Upload
                  size={28}
                  className="text-[oklch(0.65_0.007_250)] dark:text-[oklch(0.5_0.006_250)]"
                  aria-hidden="true"
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-[oklch(0.35_0.008_250)] dark:text-[oklch(0.75_0.006_250)]">
                    {image ? image.name : 'Klik atau seret gambar ke sini'}
                  </p>
                  <p className="mt-1 text-xs text-[oklch(0.58_0.007_250)] dark:text-[oklch(0.5_0.006_250)]">
                    Didukung: JPG, JPEG, PNG, WEBP — Maks. 5 MB
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                id="news-image"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-hidden="true"
                disabled={isSubmitting}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImage(file);
                  if (file) setFieldErrors((p) => ({ ...p, image: '' }));
                }}
              />

              {/* Helper text */}
              <p className="mt-2 text-xs text-[oklch(0.58_0.007_250)] dark:text-[oklch(0.5_0.006_250)]">
                Gambar akan otomatis dikonversi ke format <strong className="font-semibold">WebP</strong> (kualitas 80%) oleh sistem backend.
              </p>

              {fieldErrors.image && (
                <p id="image-error" role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} aria-hidden="true" />
                  {fieldErrors.image}
                </p>
              )}

              {/* Preview */}
              {image && (
                <ImagePreview file={image} onRemove={() => { setImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} />
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-semibold text-sm py-3 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-50 dark:focus-visible:ring-offset-[oklch(0.13_0.006_250)] shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Menerbitkan Berita…
                </>
              ) : (
                'Terbitkan Berita'
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
