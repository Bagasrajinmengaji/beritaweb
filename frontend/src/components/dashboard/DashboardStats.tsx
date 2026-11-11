import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface DashboardStatsProps {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export function DashboardStats({
  totalCount,
  pendingCount,
  approvedCount,
  rejectedCount,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-8">
      {/* Total */}
      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/80 dark:border-zinc-700 space-y-1">
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          Total Pengajuan
        </span>
        <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
          {totalCount}
        </p>
      </div>

      {/* Pending */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-1">
        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
          <Clock size={12} />
          <span>Menunggu Verifikasi</span>
        </span>
        <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
          {pendingCount}
        </p>
      </div>

      {/* Approved */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1">
        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 size={12} />
          <span>Disetujui & Tayang</span>
        </span>
        <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
          {approvedCount}
        </p>
      </div>

      {/* Rejected */}
      <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 space-y-1">
        <span className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
          <XCircle size={12} />
          <span>Perlu Perbaikan</span>
        </span>
        <p className="text-2xl font-extrabold text-red-700 dark:text-red-400">
          {rejectedCount}
        </p>
      </div>
    </div>
  );
}

