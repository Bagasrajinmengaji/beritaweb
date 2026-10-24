'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  RotateCcw,
  ZoomIn,
  Contrast,
  ZapOff,
  Eye,
  Check,
} from 'lucide-react';

// ─── Universal Accessibility Icon SVG ──────────────────────────────────────────
function UniversalAccessIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="4.5" r="2.5" />
      <path d="m4 8.5 8 1.5 8-1.5" />
      <path d="M12 10v6" />
      <path d="m8 21 4-5 4 5" />
    </svg>
  );
}

// ─── Preferences Interface ────────────────────────────────────────────────────
interface A11yPrefs {
  textSize: 'normal' | 'medium' | 'large';
  highContrast: boolean;
  reduceMotion: boolean;
  enhancedFocus: boolean;
}

const DEFAULT_PREFS: A11yPrefs = {
  textSize: 'normal',
  highContrast: false,
  reduceMotion: false,
  enhancedFocus: false,
};

const STORAGE_KEY = 'portalberita_a11y_prefs';

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Terapkan preferensi ke elemen <html>
  const applyPrefsToDOM = useCallback((newPrefs: A11yPrefs) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Ukuran Teks
    root.classList.remove('a11y-font-medium', 'a11y-font-large');
    if (newPrefs.textSize === 'medium') {
      root.classList.add('a11y-font-medium');
    } else if (newPrefs.textSize === 'large') {
      root.classList.add('a11y-font-large');
    }

    // 2. High Contrast
    if (newPrefs.highContrast) {
      root.classList.add('a11y-high-contrast');
    } else {
      root.classList.remove('a11y-high-contrast');
    }

    // 3. Reduced Motion
    if (newPrefs.reduceMotion) {
      root.classList.add('a11y-reduce-motion');
    } else {
      root.classList.remove('a11y-reduce-motion');
    }

    // 4. Enhanced Focus Indicator
    if (newPrefs.enhancedFocus) {
      root.classList.add('a11y-enhanced-focus');
    } else {
      root.classList.remove('a11y-enhanced-focus');
    }
  }, []);

  // Baca preferensi dari localStorage saat pertama kali dimuat
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<A11yPrefs>;
        const merged: A11yPrefs = { ...DEFAULT_PREFS, ...parsed };
        setPrefs(merged);
        applyPrefsToDOM(merged);
        return;
      }
    } catch {
      // fallback ke default
    }
    applyPrefsToDOM(DEFAULT_PREFS);
  }, [applyPrefsToDOM]);

  // Update preferensi & simpan ke localStorage
  const updatePref = <K extends keyof A11yPrefs>(key: K, value: A11yPrefs[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota error
      }
      applyPrefsToDOM(next);
      return next;
    });
  };

  // Reset semua preferensi ke default
  const handleReset = () => {
    setPrefs(DEFAULT_PREFS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    applyPrefsToDOM(DEFAULT_PREFS);
  };

  // Tutup dengan tombol Escape atau klik luar
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <aside aria-label="Alat Bantu Aksesibilitas" className="relative">
      {/* ── Floating Action Button (Sudut Kiri Bawah) ── */}
      <button
        ref={triggerRef}
        id="btn-accessibility-widget"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="accessibility-menu-panel"
        aria-label="Buka Menu Aksesibilitas (Ukuran teks, kontras, animasi)"
        className={[
          'fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full px-3.5 py-3 shadow-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/50',
          'bg-orange-600 hover:bg-orange-700 text-white active:scale-95',
          isOpen ? 'ring-4 ring-orange-500/40 scale-105' : 'hover:scale-105',
        ].join(' ')}
      >
        <UniversalAccessIcon size={20} />
        <span className="hidden sm:inline font-semibold text-xs tracking-wide">
          Aksesibilitas
        </span>
      </button>

      {/* ── Popover Panel Menu ── */}
      {isOpen && (
        <div
          ref={popoverRef}
          id="accessibility-menu-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-panel-title"
          className="fixed bottom-22 left-6 z-50 w-84 sm:w-96 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <UniversalAccessIcon size={18} />
              </div>
              <div>
                <h2
                  id="a11y-panel-title"
                  className="text-sm font-bold text-zinc-900 dark:text-zinc-100"
                >
                  Menu Aksesibilitas
                </h2>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Sesuaikan tampilan untuk kemudahan Anda
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label="Tutup menu aksesibilitas"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4 py-4 text-xs">
            {/* 1. Ukuran Teks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <ZoomIn size={14} className="text-orange-600 dark:text-orange-400" />
                  Ukuran Teks
                </span>
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 capitalize">
                  {prefs.textSize}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'medium', 'large'] as const).map((size) => {
                  const isActive = prefs.textSize === size;
                  const labelMap = {
                    normal: 'Normal (100%)',
                    medium: 'Sedang (115%)',
                    large: 'Besar (130%)',
                  };
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updatePref('textSize', size)}
                      className={[
                        'flex flex-col items-center justify-center py-2 px-2 rounded-xl border text-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                        isActive
                          ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 font-bold shadow-xs'
                          : 'border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300 hover:border-orange-300 dark:hover:border-zinc-700',
                      ].join(' ')}
                      aria-pressed={isActive}
                    >
                      <span className={size === 'large' ? 'text-base font-bold' : size === 'medium' ? 'text-sm font-semibold' : 'text-xs'}>
                        A
                      </span>
                      <span className="text-[10px] mt-0.5">{labelMap[size]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Mode Kontras Tinggi */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-zinc-800 p-3 bg-stone-50/60 dark:bg-zinc-950/40">
              <div className="pr-2">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <Contrast size={14} className="text-orange-600 dark:text-orange-400" />
                  Mode Kontras Tinggi
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Latar hitam pekat, teks kontras tinggi (kuning/putih tajam)
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.highContrast}
                onClick={() => updatePref('highContrast', !prefs.highContrast)}
                className={[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                  prefs.highContrast ? 'bg-orange-600' : 'bg-stone-300 dark:bg-zinc-700',
                ].join(' ')}
              >
                <span
                  className={[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                    prefs.highContrast ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>

            {/* 3. Kurangi Animasi (Reduced Motion) */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-zinc-800 p-3 bg-stone-50/60 dark:bg-zinc-950/40">
              <div className="pr-2">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <ZapOff size={14} className="text-orange-600 dark:text-orange-400" />
                  Kurangi Animasi
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Menonaktifkan animasi & transisi gerak di layar
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.reduceMotion}
                onClick={() => updatePref('reduceMotion', !prefs.reduceMotion)}
                className={[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                  prefs.reduceMotion ? 'bg-orange-600' : 'bg-stone-300 dark:bg-zinc-700',
                ].join(' ')}
              >
                <span
                  className={[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                    prefs.reduceMotion ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>

            {/* 4. Focus Indicator Jelas */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-zinc-800 p-3 bg-stone-50/60 dark:bg-zinc-950/40">
              <div className="pr-2">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <Eye size={14} className="text-orange-600 dark:text-orange-400" />
                  Focus Indicator Jelas
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Garis tepi oranye tebal saat bernavigasi keyboard (Tab)
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.enhancedFocus}
                onClick={() => updatePref('enhancedFocus', !prefs.enhancedFocus)}
                className={[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                  prefs.enhancedFocus ? 'bg-orange-600' : 'bg-stone-300 dark:bg-zinc-700',
                ].join(' ')}
              >
                <span
                  className={[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                    prefs.enhancedFocus ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>
          </div>

          {/* Footer: Reset Button */}
          <div className="pt-3 border-t border-stone-200 dark:border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400 py-1 px-2.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Kembalikan ke Default
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
