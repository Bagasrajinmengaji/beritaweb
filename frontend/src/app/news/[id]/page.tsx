'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, AlertTriangle } from 'lucide-react';

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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getImageSrc(imagePath: string): string {
  if (!imagePath) return '/placeholder-news.webp';
  if (imagePath.startsWith('http')) return imagePath;
  const base = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://127.0.0.1:8000';
  return `${base}${imagePath}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-6" aria-busy="true" aria-label="Memuat detail berita…">
      <div className="skeleton h-5 w-20 rounded-full" />
      <div className="skeleton h-10 w-full rounded" />
      <div className="skeleton h-10 w-3/4 rounded" />
      <div className="flex gap-4">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-4 w-36 rounded" />
      </div>
      <div className="skeleton aspect-video w-full rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-4 rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

    fetch(`${API}/news/${id}`)
      .then(async (res) => {
        if (res.status === 404) throw new Error('Berita tidak ditemukan.');
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json() as Promise<NewsItem>;
      })
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat berita.');
        setLoading(false);
      });
  }, [id]);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
      role="main"
    >
      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-0.5"
          aria-label="Kembali ke halaman utama"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Kembali ke Beranda
        </Link>
      </div>

      {/* ── Loading ── */}
      {loading && <DetailSkeleton />}

      {/* ── Error ── */}
      {!loading && error && (
        <div
          role="alert"
          className="max-w-3xl mx-auto rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-6 py-6 text-center"
        >
          <AlertTriangle
            size={32}
            className="mx-auto mb-3 text-red-500 dark:text-red-400"
            aria-hidden="true"
          />
          <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Berita tidak dapat dimuat</p>
          <p className="text-sm text-red-600 dark:text-red-500 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-300 underline underline-offset-2 hover:no-underline"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </div>
      )}

      {/* ── Content ── */}
      {!loading && !error && news && (
        <article className="max-w-3xl mx-auto" aria-labelledby="article-title">
          {/* Category badge */}
          <span className="inline-flex items-center rounded-full bg-brand-500/10 dark:bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300 tracking-wide uppercase mb-5">
            Berita
          </span>

          {/* Title */}
          <h1
            id="article-title"
            className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {news.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[oklch(0.55_0.007_250)] dark:text-[oklch(0.55_0.006_250)] mb-8 pb-6 border-b border-black/6 dark:border-white/6">
            <span className="flex items-center gap-1.5">
              <User size={14} aria-hidden="true" />
              <span>{news.author ?? 'Redaksi Portal Berita'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} aria-hidden="true" />
              <time dateTime={news.created_at}>{formatDate(news.created_at)}</time>
            </span>
          </div>

          {/* Cover image */}
          <div className="relative w-full rounded-2xl overflow-hidden mb-10 shadow-lg">
            <Image
              src={getImageSrc(news.image)}
              alt={news.title}
              width={1200}
              height={630}
              priority
              className="w-full object-cover max-h-125"
              unoptimized={getImageSrc(news.image).startsWith('http://127')}
            />
          </div>

          {/* Body */}
          <div
            className="prose dark:prose-invert max-w-none text-lg leading-relaxed mt-8"
            dangerouslySetInnerHTML={{ __html: news.content.replace(/\n/g, '<br/>') }}
          />
        </article>
      )}
    </main>
  );
}
