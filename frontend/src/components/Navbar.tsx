'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/',       label: 'Beranda' },
  { href: '/create', label: 'Tulis Berita' },
];

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-black/[0.06] dark:border-white/[0.06] bg-[oklch(0.985_0.002_250)]/90 dark:bg-[oklch(0.09_0.005_250)]/90 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.52_0.18_240)] rounded-lg"
            aria-label="Portal Berita — Halaman Utama"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.52_0.18_240)] text-white font-bold text-sm select-none"
              aria-hidden="true"
            >
              PB
            </span>
            <span className="hidden sm:block font-semibold text-[15px] text-[oklch(0.18_0.008_250)] dark:text-[oklch(0.92_0.004_250)] tracking-tight">
              Portal Berita
            </span>
          </Link>

          {/* Nav + actions */}
          <nav aria-label="Navigasi Utama" className="flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.52_0.18_240)]',
                    isActive
                      ? 'bg-[oklch(0.52_0.18_240)]/10 text-[oklch(0.44_0.20_240)] dark:text-[oklch(0.76_0.11_240)]'
                      : 'text-[oklch(0.37_0.18_240)/0.75] hover:text-[oklch(0.37_0.18_240)] dark:text-[oklch(0.76_0.11_240)/0.65] dark:hover:text-[oklch(0.86_0.07_240)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-[oklch(0.44_0.20_240)] dark:text-[oklch(0.76_0.11_240)] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.52_0.18_240)]"
              aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              title={isDark ? 'Mode terang' : 'Mode gelap'}
            >
              {mounted ? (
                isDark
                  ? <Sun size={18} aria-hidden="true" />
                  : <Moon size={18} aria-hidden="true" />
              ) : (
                <span className="h-[18px] w-[18px] rounded-full skeleton" aria-hidden="true" />
              )}
            </button>

            {/* CTA */}
            <Link
              href="/create"
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-[oklch(0.52_0.18_240)] px-4 py-2 text-sm font-semibold text-white hover:bg-[oklch(0.44_0.20_240)] active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.52_0.18_240)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.985_0.002_250)] dark:focus-visible:ring-offset-[oklch(0.09_0.005_250)] shadow-sm"
            >
              <span aria-hidden="true" className="text-base leading-none">+</span>
              <span>Tulis Berita</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
