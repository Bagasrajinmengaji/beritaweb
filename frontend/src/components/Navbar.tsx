'use client';

import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  LogOut,
  LogIn,
  UserPlus,
  Trophy,
  Compass,
  PlusCircle,
  LayoutDashboard,
  Menu,
  X,
  User,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id?: number;
  name: string;
  username?: string | null;
  email: string;
  role?: string | null;
  avatar?: string | null;
}

// ─── Navbar Component ─────────────────────────────────────────────────────────

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  // Tutup menu saat berpindah halaman
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Sinkronisasi auth state dari localStorage
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

  const handleLogout = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');

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

    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('role');
    localStorage.removeItem('user_role');

    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('')
    : '?';

  const userRoleLabel = user?.role === 'admin' ? 'Admin' : 'Mahasiswa';

  const navLinks = [
    { label: 'Beranda', href: '/', icon: Trophy },
    { label: 'Jelajah Lomba', href: '/lomba', icon: Compass },
    { label: 'Tambah Lomba', href: '/lomba/tambah', icon: PlusCircle },
    ...(user ? [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] : []),
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-stone-200 dark:border-zinc-800 bg-stone-50/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors"
      role="banner"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ── Brand Logo ── */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xl group"
            aria-label="Portal Lomba UMPKU — Halaman Utama"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 dark:bg-orange-500 text-white font-bold text-sm select-none shadow-sm group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              <Trophy size={18} />
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] sm:text-base text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Portal Lomba
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-orange-600 dark:text-orange-400 leading-tight">
                UMPKU Surakarta
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation Links ── */}
          <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                    isActive
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 font-semibold'
                      : 'text-stone-600 hover:text-orange-600 dark:text-stone-300 dark:hover:text-orange-400 hover:bg-stone-200/60 dark:hover:bg-zinc-900',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Right Actions (Theme, Auth, Mobile Menu Trigger) ── */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-stone-200/60 dark:hover:bg-zinc-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              title={isDark ? 'Mode terang' : 'Mode gelap'}
            >
              {mounted ? (
                isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />
              ) : (
                <span className="h-4 w-4 rounded-full skeleton" aria-hidden="true" />
              )}
            </button>

            {/* ── Belum Login ── */}
            {mounted && !user && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  id="btn-register-navbar"
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 active:scale-[0.98] transition-all shadow-xs"
                >
                  <UserPlus size={15} aria-hidden="true" />
                  <span>Daftar</span>
                </Link>
                <Link
                  id="btn-login"
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 px-4 py-2 text-sm font-semibold text-white active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shadow-sm"
                >
                  <LogIn size={15} aria-hidden="true" />
                  <span>Masuk</span>
                </Link>
              </div>
            )}

            {/* ── Sudah Login (Desktop User Dropdown) ── */}
            {mounted && user && (
              <div className="relative">
                <button
                  id="btn-user-menu"
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
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
                      className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-orange-600 dark:bg-orange-500 text-white text-xs font-bold select-none border-2 border-orange-500/40 shadow-xs"
                      aria-hidden="true"
                    >
                      {initials}
                    </span>
                  )}
                  <span className="hidden lg:block text-sm font-medium text-zinc-800 dark:text-zinc-200 max-w-28 truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Box */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl transition-all z-50 overflow-hidden"
                    role="menu"
                    aria-label="Menu pengguna"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-800/40">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {user.name}
                        </p>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/50">
                          {userRoleLabel}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Navigasi cepat dalam dropdown */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-zinc-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={14} aria-hidden="true" />
                        <span>Dashboard Pengajuan</span>
                      </Link>
                      <Link
                        href="/lomba/tambah"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-zinc-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <PlusCircle size={14} aria-hidden="true" />
                        <span>Ajukan Lomba Baru</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-stone-100 dark:border-zinc-800 py-1">
                      <button
                        id="btn-logout"
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-visible:outline-none"
                        role="menuitem"
                      >
                        <LogOut size={14} aria-hidden="true" />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Mobile Menu Hamburger Trigger ── */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer / Dropdown ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={[
                    'flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px]',
                    isActive
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-900',
                  ].join(' ')}
                >
                  <Icon size={17} className="text-orange-500" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Auth actions */}
          <div className="pt-3 border-t border-stone-100 dark:border-zinc-800">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2 py-1">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                    <p className="text-xs text-stone-500">{user.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                    {userRoleLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-colors"
                >
                  <LogIn size={15} />
                  <span>Masuk</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:border-orange-500 transition-colors"
                >
                  <UserPlus size={15} />
                  <span>Daftar</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
