'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  RotateCcw,
  ZoomIn,
  Contrast,
  ZapOff,
  Eye,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
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
  const [ttsState, setTtsState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [ttsSupported, setTtsSupported] = useState(true);

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

  // Inisialisasi saat pertama kali mount
  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      setTtsSupported('speechSynthesis' in window);
    }

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
      // fallback
    }
    applyPrefsToDOM(DEFAULT_PREFS);
  }, [applyPrefsToDOM]);

  // Bersihkan speech synthesis saat unmount atau reload
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update preferensi & simpan ke localStorage
  const updatePref = <K extends keyof A11yPrefs>(key: K, value: A11yPrefs[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      applyPrefsToDOM(next);
      return next;
    });
  };

  // Reset preferensi
  const handleReset = () => {
    setPrefs(DEFAULT_PREFS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    applyPrefsToDOM(DEFAULT_PREFS);
    handleStopTTS();
  };

  // Tutup dengan Escape atau klik luar
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

  // ─── Text-to-Speech (TTS) Logic ──────────────────────────────────────────────

  const getTextToRead = (): string => {
    if (typeof window === 'undefined') return '';

    // 1. Cek apakah ada teks yang sedang diseleksi oleh pengguna
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 3) {
      return selection;
    }

    // 2. Cek apakah berada di halaman detail berita
    const articleTitle = document.querySelector('#article-title')?.textContent?.trim() || '';
    const articleBody = document.querySelector('article .prose')?.textContent?.trim() || '';
    if (articleTitle || articleBody) {
      return `${articleTitle}. ${articleBody}`;
    }

    // 3. Fallback: Baca judul halaman utama dan cuplikan konten
    const mainTitle = document.querySelector('h1')?.textContent?.trim() || '';
    const paragraphs = Array.from(document.querySelectorAll('main p'))
      .map((p) => p.textContent?.trim() || '')
      .filter((t) => t.length > 20)
      .slice(0, 5)
      .join('. ');

    return `${mainTitle}. ${paragraphs}`.trim();
  };

  const handlePlayTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const text = getTextToRead();
    if (!text) {
      alert('Tidak menemukan teks artikel untuk dibacakan pada halaman ini.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Cari suara berbahasa Indonesia jika tersedia
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.includes('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onstart = () => setTtsState('playing');
    utterance.onend = () => setTtsState('idle');
    utterance.onerror = () => setTtsState('idle');
    utterance.onpause = () => setTtsState('paused');
    utterance.onresume = () => setTtsState('playing');

    window.speechSynthesis.speak(utterance);
    setTtsState('playing');
  };

  const handlePauseResumeTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (ttsState === 'playing') {
      window.speechSynthesis.pause();
      setTtsState('paused');
    } else if (ttsState === 'paused') {
      window.speechSynthesis.resume();
      setTtsState('playing');
    }
  };

  const handleStopTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setTtsState('idle');
  };

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
        aria-label="Buka Menu Aksesibilitas (Ukuran teks, kontras, pembaca layar)"
        className={[
          'fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/50',
          'bg-orange-600 hover:bg-orange-700 text-white active:scale-95 cursor-pointer',
          isOpen ? 'ring-4 ring-orange-500/40 scale-105' : 'hover:scale-105',
        ].join(' ')}
      >
        <UniversalAccessIcon size={20} />
        <span className="font-semibold text-xs tracking-wide">
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
          className="fixed bottom-22 left-6 z-50 w-88 sm:w-96 max-h-[85vh] overflow-y-auto rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl"
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
                  Sesuaikan tampilan & dengarkan berita
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
            {/* 1. Pembaca Teks Berita (Text-to-Speech / TTS) */}
            <div className="rounded-xl border border-orange-200 dark:border-orange-900/50 p-3.5 bg-orange-50/50 dark:bg-orange-950/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-orange-900 dark:text-orange-200 text-xs">
                  <Volume2 size={15} className="text-orange-600 dark:text-orange-400" />
                  Pembaca Teks (Text-to-Speech)
                </span>
                <span
                  className={[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                    ttsState === 'playing'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : ttsState === 'paused'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-stone-200 text-stone-700 dark:bg-zinc-800 dark:text-stone-300',
                  ].join(' ')}
                >
                  {ttsState === 'playing' ? 'Sedang Membaca' : ttsState === 'paused' ? 'Dijeda' : 'Siap'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 mb-3">
                Dengarkan isi artikel berita atau teks yang Anda pilih secara otomatis.
              </p>

              {ttsSupported ? (
                <div className="flex items-center gap-2">
                  {ttsState === 'idle' ? (
                    <button
                      id="btn-tts-play"
                      type="button"
                      onClick={handlePlayTTS}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 text-xs shadow-sm active:scale-95 transition-all"
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Baca Berita Ini</span>
                    </button>
                  ) : (
                    <>
                      <button
                        id="btn-tts-pause"
                        type="button"
                        onClick={handlePauseResumeTTS}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 text-xs shadow-sm active:scale-95 transition-all"
                      >
                        {ttsState === 'playing' ? (
                          <>
                            <Pause size={13} fill="currentColor" />
                            <span>Jeda</span>
                          </>
                        ) : (
                          <>
                            <Play size={13} fill="currentColor" />
                            <span>Lanjutkan</span>
                          </>
                        )}
                      </button>
                      <button
                        id="btn-tts-stop"
                        type="button"
                        onClick={handleStopTTS}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 font-semibold py-2 px-3 text-xs text-zinc-800 dark:text-zinc-200 active:scale-95 transition-all"
                      >
                        <Square size={12} fill="currentColor" />
                        <span>Hentikan</span>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-red-500">
                  Browser Anda tidak mendukung fitur Web Speech API.
                </p>
              )}
            </div>

            {/* 2. Ukuran Teks */}
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
                    medium: 'Sedang (118%)',
                    large: 'Besar (136%)',
                  };
                  return (
                    <button
                      key={size}
                      id={`btn-a11y-size-${size}`}
                      type="button"
                      onClick={() => updatePref('textSize', size)}
                      className={[
                        'flex flex-col items-center justify-center py-2 px-2 rounded-xl border text-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer',
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

            {/* 3. Mode Kontras Tinggi */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-zinc-800 p-3 bg-stone-50/60 dark:bg-zinc-950/40">
              <div className="pr-2">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <Contrast size={14} className="text-orange-600 dark:text-orange-400" />
                  Mode Kontras Tinggi
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Latar hitam pekat (#000), teks kuning tajam (#FF0), judul putih
                </p>
              </div>
              <button
                id="btn-a11y-contrast"
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

            {/* 4. Kurangi Animasi (Reduced Motion) */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-zinc-800 p-3 bg-stone-50/60 dark:bg-zinc-950/40">
              <div className="pr-2">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <ZapOff size={14} className="text-orange-600 dark:text-orange-400" />
                  Kurangi Animasi
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Menonaktifkan animasi & efek gerak di seluruh layar
                </p>
              </div>
              <button
                id="btn-a11y-motion"
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

            {/* 5. Focus Indicator Jelas */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-zinc-800 p-3 bg-stone-50/60 dark:bg-zinc-950/40">
              <div className="pr-2">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <Eye size={14} className="text-orange-600 dark:text-orange-400" />
                  Focus Indicator Jelas
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Garis tepi oranye tebal saat navigasi keyboard (Tab)
                </p>
              </div>
              <button
                id="btn-a11y-focus"
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
              id="btn-a11y-reset"
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400 py-1 px-2.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
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
