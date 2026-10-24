'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';

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
    month: 'long',
    year: 'numeric',
  });
}

function excerpt(text: string, maxLength = 160) {
  const plainText = text.replace(/<[^>]*>/g, '').trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trimEnd() + '…';
}

function getImageSrc(imagePath: string): string {
  if (!imagePath) return '/placeholder-news.webp';
  if (imagePath.startsWith('http')) return imagePath;
  const base = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://127.0.0.1:8000';
  return `${base}${imagePath}`;
}

// ─── Skeleton Components ──────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-stone-200/70 dark:bg-zinc-800/70 animate-pulse">
      <div className="aspect-video sm:aspect-21/9 skeleton" />
      <div className="p-6 sm:p-8 space-y-4">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-9 w-4/5 rounded" />
        <div className="skeleton h-9 w-3/5 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="flex gap-4 pt-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 animate-pulse">
      <div className="aspect-16/10 skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-5 w-4/5 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-28 rounded pt-2" />
      </div>
    </div>
  );
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({ news }: { news: NewsItem }) {
  const src = getImageSrc(news.image);

  return (
    <article className="group relative rounded-2xl overflow-hidden bg-zinc-900 shadow-xl border border-stone-200/30 dark:border-zinc-800">
      {/* Image */}
      <div className="relative aspect-video sm:aspect-21/9 w-full overflow-hidden">
        <Image
          src={src}
          alt={news.title}
          fill
          priority
          className="object-cover img-zoom brightness-75 dark:brightness-60"
          sizes="(max-width: 768px) 100vw, 90vw"
          unoptimized={src.startsWith('http://127')}
        />
        {/* overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
      </div>

      {/* Content overlaid on image */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
        {/* Category badge */}
        <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-600 dark:bg-orange-500 px-3.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
          <TrendingUp size={12} aria-hidden="true" />
          Berita Utama
        </span>

        {/* Title */}
        <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight line-clamp-3 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          <Link
            href={`/news/${news.id}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-lg"
          >
            <span className="hover:text-orange-300 transition-colors">{news.title}</span>
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-stone-200 text-base leading-relaxed line-clamp-2 mb-4 max-w-2xl">
          {excerpt(news.content)}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-stone-300 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <User size={13} aria-hidden="true" className="text-orange-400" />
            {news.author ?? 'Redaksi'}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} aria-hidden="true" className="text-orange-400" />
            <time dateTime={news.created_at}>{formatDate(news.created_at)}</time>
          </span>
        </div>
      </div>

      {/* Read more arrow */}
      <Link
        href={`/news/${news.id}`}
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-orange-600 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label={`Baca berita: ${news.title}`}
      >
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ news, index }: { news: NewsItem; index: number }) {
  const src = getImageSrc(news.image);

  return (
    <article className="group card-lift rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:border-orange-500/40 transition-colors flex flex-col">
      {/* Image */}
      <div className="relative aspect-16/10 overflow-hidden bg-stone-100 dark:bg-zinc-800">
        <Image
          src={src}
          alt={news.title}
          fill
          loading={index < 3 ? 'eager' : 'lazy'}
          className="object-cover img-zoom"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={src.startsWith('http://127')}
        />
      </div>

      <div className="flex flex-col flex-1 p-5">
        {/* Category badge */}
        <span className="mb-2.5 inline-flex w-fit items-center rounded-full bg-orange-100 dark:bg-orange-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700 dark:text-orange-300 tracking-wide uppercase border border-orange-200/50 dark:border-orange-900/50">
          Berita
        </span>

        {/* Title */}
        <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base leading-snug line-clamp-2 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Link
            href={`/news/${news.id}`}
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
          >
            {news.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
          {excerpt(news.content, 120)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs pt-3 border-t border-stone-100 dark:border-zinc-800">
          <span className="flex items-center gap-1 font-medium">
            <User size={11} aria-hidden="true" className="text-orange-600 dark:text-orange-400" />
            {news.author ?? 'Redaksi'}
          </span>
          <time dateTime={news.created_at} className="flex items-center gap-1">
            <Calendar size={11} aria-hidden="true" />
            {formatDate(news.created_at)}
          </time>
        </div>
      </div>
    </article>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <BookOpen size={40} className="text-stone-400 dark:text-stone-600" aria-hidden="true" />
      <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
        Belum ada berita tersedia.
      </p>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Mulai dengan menambahkan berita pertama Anda.
      </p>
      <Link
        href="/create"
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 shadow-sm"
      >
        Tulis Berita Pertama
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

    fetch(`${API}/news`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json() as Promise<NewsItem[]>;
      })
      .then((data) => {
        setNewsList(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat berita.');
        setLoading(false);
      });
  }, []);

  const [hero, ...rest] = newsList;

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14" role="main">
      {/* ── Loading ── */}
      {loading && (
        <div aria-busy="true" aria-label="Memuat berita…">
          <HeroSkeleton />
          <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Daftar berita">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </section>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-6 py-5 text-red-700 dark:text-red-400"
        >
          <p className="font-semibold mb-1">Tidak dapat memuat berita</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-medium underline underline-offset-2 hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* ── Content ── */}
      {!loading && !error && (
        <>
          {newsList.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Hero */}
              {hero && (
                <section aria-label="Berita Utama">
                  <HeroCard news={hero} />
                </section>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <section className="mt-10 sm:mt-14" aria-labelledby="latest-heading">
                  <h2
                    id="latest-heading"
                    className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 pb-3 border-b border-stone-200 dark:border-zinc-800"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Berita Terbaru
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((item, i) => (
                      <NewsCard key={item.id} news={item} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
