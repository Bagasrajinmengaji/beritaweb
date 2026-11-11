'use client';

import { AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { RegistrationStatus } from '@/types/competition';

interface DeadlineBadgeProps {
  status: RegistrationStatus | string;
  daysRemaining?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DeadlineBadge({
  status,
  daysRemaining,
  showIcon = true,
  size = 'md',
  className = '',
}: DeadlineBadgeProps) {
  const isOpened = status === 'Pendaftaran Dibuka';
  const isClosingSoon = status === 'Segera Ditutup';
  const isClosed = status === 'Pendaftaran Ditutup';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size];

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  }[size];

  // Warna sesuai instruksi khusus: Pendaftaran Ditutup menggunakan warna MERAH
  const colorClasses = isOpened
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
    : isClosingSoon
    ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70 animate-pulse'
    : 'bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/60';

  const displayText = isClosingSoon && typeof daysRemaining === 'number' && daysRemaining > 0
    ? `Segera Ditutup (${daysRemaining} hari lagi)`
    : status;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs select-none transition-colors ${sizeClasses} ${colorClasses} ${className}`}
      role="status"
      aria-label={`Status pendaftaran: ${displayText}`}
    >
      {showIcon && (
        <>
          {isOpened && <CheckCircle2 size={iconSizes} className="shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
          {isClosingSoon && <AlertTriangle size={iconSizes} className="shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />}
          {isClosed && <XCircle size={iconSizes} className="shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />}
        </>
      )}
      <span className="truncate">{displayText}</span>
    </span>
  );
}

