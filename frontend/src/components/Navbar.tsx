'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, LogOut, PenLine, LayoutDashboard, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  name: string;
  username?: string | null;
  email: string;
  role?: string | null;
  avatar?: string | null;
}

// ─── Google icon SVG ──────────────────────────────────────────────────────────

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  // Baca auth state dari localStorage
  const syncAuth = useCallback(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('user') || localStorage.getItem('auth_user');
    const storedRole = localStorage.getItem('role') || localStorage.getItem('user_role');
    if (token && userRaw) {
      try {
        const parsed = JSON.parse(userRaw) as AuthUser;
        if (!parsed.role && storedRole) {
          parsed.role = storedRole;
        }
        setUser(parsed);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    syncAuth();

    window.addEventListener('storage', syncAuth);
    window.addEventListener('authChange', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('authChange', syncAuth);
    };
  }, [syncAuth]);

  const isDark = resolvedTheme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    // 1. Ambil token dari localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');

    // 2. Kirim request POST ke endpoint logout dengan Authorization Bearer
    if (token) {
      try {
        await fetch(`${API}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }

    // 3. Hapus token dan data user dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('role');
    localStorage.removeItem('user_role');

    // 4. Perbarui state auth Navbar dan redirect pengguna kembali ke halaman utama (/)
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  // User initials sebagai fallback avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('')
    : '?';

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-stone-200 dark:border-zinc-800 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg group"
            aria-label="Portal Berita — Halaman Utama"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 dark:bg-orange-500 text-white font-bold text-sm select-none shadow-sm group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              PB
            </span>
            <span className="hidden sm:block font-semibold text-[15px] text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Portal Berita
            </span>
          </Link>

          {/* Right side actions */}
          <nav aria-label="Navigasi Utama" className="flex items-center gap-2">
            {/* Home link */}
            <Link
              href="/"
              className={[
                'hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                pathname === '/'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 font-semibold'
                  : 'text-stone-600 hover:text-orange-600 dark:text-stone-300 dark:hover:text-orange-400 hover:bg-stone-200/60 dark:hover:bg-zinc-900',
              ].join(' ')}
              aria-current={pathname === '/' ? 'page' : undefined}
            >
              Beranda
            </Link>

            {/* Dashboard link (Khusus user yang sudah login) */}
            {mounted && user && (
              <Link
                href="/admin"
                className={[
                  'hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                  pathname === '/admin'
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 font-semibold'
                    : 'text-stone-600 hover:text-orange-600 dark:text-stone-300 dark:hover:text-orange-400 hover:bg-stone-200/60 dark:hover:bg-zinc-900',
                ].join(' ')}
                aria-current={pathname === '/admin' ? 'page' : undefined}
              >
                Dashboard
              </Link>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-stone-200/60 dark:hover:bg-zinc-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              title={isDark ? 'Mode terang' : 'Mode gelap'}
            >
              {mounted ? (
                isDark
                  ? <Sun size={18} aria-hidden="true" />
                  : <Moon size={18} aria-hidden="true" />
              ) : (
                <span className="h-4 w-4 rounded-full skeleton" aria-hidden="true" />
              )}
            </button>

            {/* ── Belum Login ── */}
            {mounted && !user && (
              <Link
                id="btn-login"
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/40 px-3.5 py-2 text-sm font-semibold text-orange-700 dark:text-orange-300 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shadow-sm"
              >
                <LogIn size={15} aria-hidden="true" />
                <span>Masuk</span>
              </Link>
            )}

            {/* ── Sudah Login ── */}
            {mounted && user && (
              <>
                {/* Tulis berita CTA */}
                <Link
                  href="/create"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 shadow-sm"
                >
                  <PenLine size={14} aria-hidden="true" />
                  Tulis Berita
                </Link>

                {/* Avatar + dropdown trigger */}
                <div className="relative group">
                  <button
                    id="btn-user-menu"
                    type="button"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    aria-label={`Menu pengguna — ${user.name}`}
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                  >
                    {user.avatar && !avatarError ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={34}
                        height={34}
                        className="rounded-full object-cover border-2 border-orange-500/40"
                        onError={() => setAvatarError(true)}
                        unoptimized
                      />
                    ) : (
                      <span
                        className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-orange-600 dark:bg-orange-500 text-white text-xs font-bold select-none border-2 border-orange-500/40"
                        aria-hidden="true"
                      >
                        {initials}
                      </span>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-zinc-800 dark:text-zinc-200 max-w-28 truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown menu */}
                  <div
                    className={[
                      'absolute right-0 top-full mt-2 w-52 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl transition-all duration-150 origin-top-right z-50',
                      userMenuOpen
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:pointer-events-auto',
                    ].join(' ')}
                    role="menu"
                    aria-label="Menu pengguna"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-stone-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {user.name}
                        </p>
                        <span
                          className={[
                            'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                            user.role === 'admin'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                              : 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-stone-300',
                          ].join(' ')}
                        >
                          {user.role === 'admin' ? 'Admin' : 'Penulis'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Dashboard Admin Link */}
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors duration-100 focus-visible:outline-none"
                      role="menuitem"
                    >
                      <LayoutDashboard size={14} aria-hidden="true" />
                      Dashboard Admin
                    </Link>

                    {/* Tulis Berita Link */}
                    <Link
                      href="/create"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors duration-100 focus-visible:outline-none"
                      role="menuitem"
                    >
                      <PenLine size={14} aria-hidden="true" />
                      Tulis Berita
                    </Link>

                    {/* Logout */}
                    <button
                      id="btn-logout"
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-100 rounded-b-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset"
                      role="menuitem"
                    >
                      <LogOut size={14} aria-hidden="true" />
                      Keluar
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Skeleton saat mounting */}
            {!mounted && (
              <span className="h-8 w-28 rounded-lg skeleton" aria-hidden="true" />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
