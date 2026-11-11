'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Building2, GraduationCap, Tag, ArrowRight } from 'lucide-react';
import { CompetitionListItem } from '@/types/competition';
import { DeadlineBadge } from './DeadlineBadge';

interface CompetitionCardProps {
  competition: CompetitionListItem;
  index?: number;
}

function formatDate(isoDate: string): string {
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

export function CompetitionCard({ competition, index = 0 }: CompetitionCardProps) {
  const posterSrc = getPosterSrc(competition.poster_url);

  return (
    <article className="group card-lift rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all duration-200 flex flex-col shadow-xs hover:shadow-md">
      {/* ── Poster & Badges ── */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100 dark:bg-zinc-800">
        <Image
          src={posterSrc}
          alt={`Poster lomba ${competition.title}`}
          fill
          loading={index < 4 ? 'eager' : 'lazy'}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover img-zoom"
          unoptimized={posterSrc.startsWith('http://127')}
        />
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

        {/* Level badge (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-900/80 backdrop-blur-md text-white border border-white/20 shadow-xs">
            {competition.competition_level}
          </span>
        </div>

        {/* Category badge (Bottom Left overlay) */}
        {competition.category && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-600/90 text-white backdrop-blur-md shadow-xs">
              {competition.category.name}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-5">
        {/* Status Deadline */}
        <div className="mb-3">
          <DeadlineBadge
            status={competition.registration_status}
            daysRemaining={competition.days_remaining}
            size="sm"
          />
        </div>

        {/* Title */}
        <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-lg leading-snug line-clamp-2 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          <Link
            href={`/lomba/${competition.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
          >
            {competition.title}
          </Link>
        </h3>

        {/* Penyelenggara */}
        <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 mb-3">
          <Building2 size={13} className="shrink-0 text-orange-500" aria-hidden="true" />
          <span className="truncate font-medium">{competition.organizer}</span>
        </div>

        {/* Program Studi Sasaran */}
        {competition.study_programs && competition.study_programs.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-stone-600 dark:text-stone-400 mb-4 bg-stone-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-stone-200/60 dark:border-zinc-800">
            <GraduationCap size={14} className="shrink-0 text-orange-500 mt-0.5" aria-hidden="true" />
            <div className="flex flex-wrap gap-1">
              {competition.study_programs.slice(0, 2).map((prodi) => (
                <span
                  key={prodi.id}
                  className="inline-block bg-white dark:bg-zinc-700 px-2 py-0.5 rounded text-[11px] font-medium text-zinc-700 dark:text-zinc-200 border border-stone-200 dark:border-zinc-600"
                >
                  {prodi.name}
                </span>
              ))}
              {competition.study_programs.length > 2 && (
                <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium text-orange-600 dark:text-orange-400">
                  +{competition.study_programs.length - 2} prodi lainnya
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer Info (Biaya & Deadline) */}
        <div className="mt-auto pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1">
            <Tag size={12} className="text-orange-500" aria-hidden="true" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {competition.registration_fee || 'Gratis'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-stone-600 dark:text-stone-300">
            <Calendar size={13} className="text-orange-500" aria-hidden="true" />
            <time dateTime={competition.registration_deadline}>
              Batas: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDate(competition.registration_deadline)}</span>
            </time>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/lomba/${competition.slug}`}
          className="mt-4 w-full min-h-11 flex items-center justify-center gap-2 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <span>Lihat Detail Lomba</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

