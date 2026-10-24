'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, AlertTriangle, Volume2, Pause, Play, Square } from 'lucide-react';

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

const SKELETON_WIDTHS = ['94%', '88%', '96%', '85%', '91%', '78%'];

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
        {SKELETON_WIDTHS.map((width, i) => (
          <div key={i} className="skeleton h-4 rounded" style={{ width }} />
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
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');

  // Bersihkan audio speech saat berpindah halaman
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !news) return;

    if (speechState === 'playing') {
      window.speechSynthesis.pause();
      setSpeechState('paused');
      return;
    }

    if (speechState === 'paused') {
      window.speechSynthesis.resume();
      setSpeechState('playing');
      return;
    }

    window.speechSynthesis.cancel();

    // Buat teks bacaan dari judul dan konten
    const cleanContent = news.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const textToSpeak = `${news.title}. Penulis: ${news.author || 'Redaksi'}. ${cleanContent}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.includes('ID'));
    if (idVoice) utterance.voice = idVoice;

    utterance.onstart = () => setSpeechState('playing');
    utterance.onend = () => setSpeechState('idle');
    utterance.onerror = () => setSpeechState('idle');
    utterance.onpause = () => setSpeechState('paused');
    utterance.onresume = () => setSpeechState('playing');

    window.speechSynthesis.speak(utterance);
    setSpeechState('playing');
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeechState('idle');
    }
  };

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
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg px-0.5"
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
            className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400 underline underline-offset-2 hover:no-underline"
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
          <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-950/60 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300 tracking-wide uppercase mb-5 border border-orange-200/50 dark:border-orange-900/50">
            Berita
          </span>

          {/* Title */}
          <h1
            id="article-title"
            className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {news.title}
          </h1>

          {/* Meta & Audio Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-stone-500 dark:text-stone-400 mb-8 pb-6 border-b border-stone-200 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <User size={14} aria-hidden="true" className="text-orange-600 dark:text-orange-400" />
                <span>{news.author ?? 'Redaksi Portal Berita'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} aria-hidden="true" className="text-orange-600 dark:text-orange-400" />
                <time dateTime={news.created_at}>{formatDate(news.created_at)}</time>
              </span>
            </div>

            {/* Audio / TTS Button */}
            <div className="flex items-center gap-2">
              <button
                id="btn-listen-article"
                type="button"
                onClick={handleToggleSpeech}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer',
                  speechState === 'playing'
                    ? 'bg-orange-600 text-white hover:bg-orange-700 animate-pulse'
                    : speechState === 'paused'
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400',
                ].join(' ')}
                aria-label={
                  speechState === 'playing'
                    ? 'Jeda pembacaan berita'
                    : speechState === 'paused'
                    ? 'Lanjutkan pembacaan berita'
                    : 'Dengarkan pembacaan berita ini'
                }
              >
                {speechState === 'playing' ? (
                  <>
                    <Pause size={14} fill="currentColor" />
                    <span>Jeda Suara</span>
                  </>
                ) : speechState === 'paused' ? (
                  <>
                    <Play size={14} fill="currentColor" />
                    <span>Lanjutkan Suara</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={14} />
                    <span>Dengarkan Berita</span>
                  </>
                )}
              </button>

              {speechState !== 'idle' && (
                <button
                  type="button"
                  onClick={handleStopSpeech}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors"
                  title="Hentikan pembacaan"
                  aria-label="Hentikan pembacaan suara"
                >
                  <Square size={12} fill="currentColor" />
                </button>
              )}
            </div>
          </div>

          {/* Cover image */}
          <div className="relative w-full rounded-2xl overflow-hidden mb-10 shadow-lg border border-stone-200 dark:border-zinc-800">
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
            className="prose dark:prose-invert max-w-none text-zinc-900 dark:text-zinc-100 prose-a:text-orange-600 dark:prose-a:text-orange-400 mt-8 leading-relaxed text-base sm:text-lg"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </article>
      )}
    </main>
  );
}
