export function CompetitionCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 animate-pulse flex flex-col shadow-xs"
      aria-busy="true"
      aria-label="Memuat kartu lomba…"
    >
      {/* Poster Skeleton */}
      <div className="aspect-16/10 w-full bg-stone-200 dark:bg-zinc-800 relative" />

      {/* Body Skeleton */}
      <div className="p-5 space-y-3 flex flex-col flex-1">
        {/* Status Badge */}
        <div className="h-5 w-28 bg-stone-200 dark:bg-zinc-800 rounded-full" />

        {/* Title lines */}
        <div className="h-5 w-full bg-stone-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-5 w-3/4 bg-stone-200 dark:bg-zinc-800 rounded-md" />

        {/* Organizer */}
        <div className="h-4 w-1/2 bg-stone-200 dark:bg-zinc-800 rounded-md" />

        {/* Prodi Box */}
        <div className="h-10 w-full bg-stone-100 dark:bg-zinc-800/60 rounded-xl" />

        {/* Footer info */}
        <div className="mt-auto pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-between">
          <div className="h-4 w-16 bg-stone-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-24 bg-stone-200 dark:bg-zinc-800 rounded" />
        </div>

        {/* Button */}
        <div className="h-11 w-full bg-stone-200 dark:bg-zinc-800 rounded-xl mt-2" />
      </div>
    </div>
  );
}

