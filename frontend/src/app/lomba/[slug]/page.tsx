'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Building2,
  GraduationCap,
  Tag,
  ExternalLink,
  Phone,
  Globe,
  Share2,
  AlertCircle,
  Volume2,
  Pause,
  Play,
  Square,
  Trophy,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { CompetitionDetail } from '@/types/competition';
import { DeadlineBadge } from '@/components/DeadlineBadge';

function formatDate(isoDate?: string | null): string {
  if (!isoDate) return '-';
  try {
    return new Date(isoDate).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

export default function LombaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [competition, setCompetition] = useState<CompetitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Text-To-Speech (Aksesibilitas Suara)
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Ambil auth token jika ada (agar pemilik bisa preview lomba berstatus pending/rejected)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('auth_token') : null;
    const headers: HeadersInit = { Accept: 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API}/competitions/${slug}`, { headers })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404 || res.status === 403) {
            throw new Error('Informasi lomba tidak ditemukan atau belum disetujui untuk ditampilkan.');
          }
          throw new Error('Gagal memuat informasi lomba.');
        }
        return res.json();
      })
      .then((json) => {
        setCompetition(json.data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Terjadi kendala saat memuat detail lomba.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API, slug]);

  // Audio Speech Reader
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !competition) return;

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

    const plainDescription = competition.description.replace(/<[^>]*>/g, ' ');
    const textToRead = `${competition.title}. Diselenggarakan oleh ${competition.organizer}. Batas pendaftaran hingga ${formatDate(competition.registration_deadline)}. ${plainDescription}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeechState('idle');
    utterance.onerror = () => setSpeechState('idle');

    window.speechSynthesis.speak(utterance);
    setSpeechState('playing');
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeechState('idle');
    }
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    if (navigator.share && competition) {
      navigator.share({
        title: competition.title,
        text: `Info Lomba: ${competition.title} — UMPKU Surakarta`,
        url: window.location.href,
      }).catch(() => null);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
          <div className="h-6 w-36 bg-stone-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-10 w-4/5 bg-stone-200 dark:bg-zinc-800 rounded-xl" />
          <div className="aspect-16/9 w-full bg-stone-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-32 bg-stone-200 dark:bg-zinc-800 rounded-2xl" />
              <div className="h-48 bg-stone-200 dark:bg-zinc-800 rounded-2xl" />
            </div>
            <div className="h-64 bg-stone-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !competition) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Lomba Tidak Tersedia
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {error || 'Informasi lomba tidak ditemukan atau belum disetujui untuk ditampilkan.'}
          </p>
          <div className="pt-2">
            <Link
              href="/lomba"
              className="inline-flex items-center gap-2 min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Katalog Lomba</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const posterSrc = getPosterSrc(competition.poster_url);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-24">
      {/* ── Top Navigation Bar & Breadcrumb ── */}
      <div className="border-b border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3.5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link
            href="/lomba"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Semua Lomba</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Audio Reader Accessibility */}
            <div className="inline-flex items-center gap-1 rounded-xl bg-stone-100 dark:bg-zinc-800 p-1 border border-stone-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={handleToggleSpeech}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg transition-colors"
                title="Dengarkan pembacaan informasi lomba"
              >
                {speechState === 'playing' ? (
                  <>
                    <Pause size={13} className="text-orange-600" />
                    <span>Jeda Suara</span>
                  </>
                ) : speechState === 'paused' ? (
                  <>
                    <Play size={13} className="text-orange-600" />
                    <span>Lanjutkan</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={13} className="text-orange-600" />
                    <span>Dengarkan</span>
                  </>
                )}
              </button>

              {speechState !== 'idle' && (
                <button
                  type="button"
                  onClick={handleStopSpeech}
                  className="p-1 rounded-lg text-stone-500 hover:text-red-500 transition-colors"
                  title="Hentikan audio"
                >
                  <Square size={13} />
                </button>
              )}
            </div>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-orange-500 transition-colors"
            >
              <Share2 size={13} />
              <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* ── Status Moderasi Banner (Jika dibuka oleh pemilik saat status non-approved) ── */}
        {competition.status !== 'approved' && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold text-sm">
                Mode Pratinjau Pengaju ({competition.status.toUpperCase()})
              </p>
              <p className="mt-0.5">
                Lomba ini belum tampil kepada publik umum karena masih berstatus {competition.status}.
                {competition.rejection_reason && (
                  <span className="block mt-1 font-semibold text-red-600 dark:text-red-400">
                    Catatan Admin: {competition.rejection_reason}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── Header Title & Meta ── */}
        <header className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs">
              {competition.competition_level}
            </span>
            {competition.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/50">
                {competition.category.name}
              </span>
            )}
            <DeadlineBadge
              status={competition.registration_status}
              daysRemaining={competition.days_remaining}
              size="md"
            />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            {competition.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Building2 size={15} className="text-orange-500" />
              <span>Diselenggarakan oleh: <strong>{competition.organizer}</strong></span>
            </div>
            {competition.created_at && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-stone-400" />
                <span>Dipublikasikan: {formatDate(competition.created_at)}</span>
              </div>
            )}
          </div>
        </header>

        {/* ── Main Layout: 2 Kolom (Konten Kiri, Sidebar Aksi Kanan) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Kolom Kiri: Poster, Deskripsi, Persyaratan, Prodi */}
          <div className="lg:col-span-2 space-y-8">
            {/* Poster Lomba */}
            <div className="relative aspect-16/9 sm:aspect-16/10 w-full rounded-3xl overflow-hidden bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-800 shadow-md">
              <Image
                src={posterSrc}
                alt={`Poster ${competition.title}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-contain"
                unoptimized={posterSrc.startsWith('http://127')}
              />
            </div>

            {/* Deskripsi Lomba */}
            <section className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 border-b border-stone-100 dark:border-zinc-800 pb-3">
                Deskripsi Kompetisi
              </h2>
              <div className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-line space-y-2">
                {competition.description}
              </div>
            </section>

            {/* Persyaratan Peserta */}
            {competition.requirements && (
              <section className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 border-b border-stone-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Persyaratan & Ketentuan Peserta</span>
                </h2>
                <div className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-line space-y-2">
                  {competition.requirements}
                </div>
              </section>
            )}

            {/* Program Studi Sasaran */}
            {competition.study_programs && competition.study_programs.length > 0 && (
              <section className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 border-b border-stone-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                  <GraduationCap size={20} className="text-orange-500" />
                  <span>Program Studi yang Sesuai (UMPKU Surakarta)</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Kompetisi ini sangat direkomendasikan bagi mahasiswa dari jurusan/program studi berikut:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {competition.study_programs.map((prodi) => (
                    <span
                      key={prodi.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-zinc-800 text-orange-700 dark:text-orange-300 font-semibold text-xs border border-orange-200/60 dark:border-zinc-700"
                    >
                      <CheckCircle2 size={13} className="text-orange-500" />
                      <span>{prodi.name}</span>
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Kolom Kanan (Sidebar Aksi & Detail Kontak) */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Box Aksi Utama */}
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-stone-100 dark:border-zinc-800 pb-3">
                Informasi Pendaftaran
              </h3>

              {/* Status Deadline */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 block">
                  Batas Akhir Pendaftaran:
                </span>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {formatDate(competition.registration_deadline)}
                </p>
                <div className="pt-1">
                  <DeadlineBadge
                    status={competition.registration_status}
                    daysRemaining={competition.days_remaining}
                    size="sm"
                  />
                </div>
              </div>

              {/* Biaya */}
              <div className="space-y-1 border-t border-stone-100 dark:border-zinc-800 pt-4">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <Tag size={12} className="text-orange-500" />
                  <span>Biaya Pendaftaran:</span>
                </span>
                <p className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
                  {competition.registration_fee || 'Gratis'}
                </p>
              </div>

              {/* Tombol Daftar Lomba Utama */}
              <div className="space-y-2 pt-2">
                <a
                  href={competition.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-11 w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all shadow-md active:scale-98"
                >
                  <span>Daftar Lomba Sekarang</span>
                  <ExternalLink size={15} />
                </a>
                <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
                  Tautan resmi menuju form pendaftaran penyelenggara.
                </p>
              </div>
            </div>

            {/* Box Kontak & Sumber Informasi */}
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xs text-xs">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 border-b border-stone-100 dark:border-zinc-800 pb-2">
                Kontak & Sumber
              </h4>

              {competition.contact && (
                <div className="flex items-start gap-2.5 text-stone-700 dark:text-stone-300">
                  <Phone size={14} className="shrink-0 text-orange-500 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Narahubung / Kontak:</span>
                    <span className="text-stone-600 dark:text-stone-400 select-all">{competition.contact}</span>
                  </div>
                </div>
              )}

              {competition.source_url && (
                <div className="flex items-start gap-2.5 text-stone-700 dark:text-stone-300">
                  <Globe size={14} className="shrink-0 text-orange-500 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Sumber Informasi:</span>
                    <a
                      href={competition.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 dark:text-orange-400 hover:underline break-all"
                    >
                      Kunjungi Halaman Asli →
                    </a>
                  </div>
                </div>
              )}

              {/* Pengirim */}
              {competition.author && (
                <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 text-[11px] text-stone-500">
                  <span>Diajukan oleh: {competition.author.name}</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

