'use client';

import { useState, useRef, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, AlertTriangle, X } from 'lucide-react';

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

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Client-side validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Validation ──
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Judul berita wajib diisi.';
    else if (title.trim().length < 5) errs.title = 'Judul minimal 5 karakter.';
    if (!content.trim()) errs.content = 'Konten berita wajib diisi.';
    else if (content.trim().length < 20) errs.content = 'Konten minimal 20 karakter.';
    if (!image) errs.image = 'Gambar wajib diunggah.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) return;

      setIsSubmitting(true);
      setToast(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (image) formData.append('image', image);

      const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

      try {
        const res = await fetch(`${API}/news`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        });

        if (!res.ok) {
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
        }, 2000);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan.';
        setToast({ message, type: 'error' });
        setIsSubmitting(false);
      }
    },
    [title, content, image, router],
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

            {/* Content */}
            <div>
              <label
                htmlFor="news-content"
                className="block text-sm font-semibold text-[oklch(0.28_0.008_250)] dark:text-[oklch(0.85_0.005_250)] mb-1.5"
              >
                Konten Berita <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <textarea
                id="news-content"
                rows={8}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (fieldErrors.content) setFieldErrors((p) => ({ ...p, content: '' }));
                }}
                placeholder="Tuliskan isi berita secara lengkap dan akurat…"
                className={`${inputClass('content')} resize-y min-h-40`}
                aria-required="true"
                aria-describedby={fieldErrors.content ? 'content-error' : undefined}
                disabled={isSubmitting}
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
