'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Eye, EyeOff, LogIn, ArrowLeft, ShieldCheck, Newspaper } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

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
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fillAdminCredentials = () => {
    setUsername('bagasganteng');
    setPassword('987654321');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim() || !password) {
      setError('Harap masukkan username dan password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Username atau password salah.');
      }

      // Simpan credentials ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('auth_token', data.token);

      const userObj = {
        id: data.user.id,
        name: data.user.name,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
      };

      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('auth_user', JSON.stringify(userObj));
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('user_role', data.user.role);

      window.dispatchEvent(new Event('authChange'));
      window.dispatchEvent(new Event('storage'));

      setSuccess('Login berhasil! Mengarahkan...');

      setTimeout(() => {
        if (redirectTo) {
          router.push(redirectTo);
        } else if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }, 700);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan saat masuk. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-6 sm:p-8 shadow-xl backdrop-blur-md">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/40 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300 mb-3">
          <Newspaper size={13} className="text-orange-600 dark:text-orange-400" />
          <span>PORTAL BERITA RESMI</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Masuk ke Akun Anda
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          Akses portal berita, dashboard kurasi, dan publikasi artikel terkini.
        </p>
      </div>

      {/* Admin Quick Fill Helper */}
      <div className="mb-5 rounded-xl border border-orange-200/80 dark:border-orange-900/40 bg-orange-50/70 dark:bg-orange-950/30 p-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-orange-800 dark:text-orange-300">
            <ShieldCheck size={15} />
            <span>Akun Admin Penguji</span>
          </div>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="rounded-md bg-orange-600 dark:bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors shadow-sm"
          >
            Gunakan Akun Ini
          </button>
        </div>
        <p className="mt-1.5 text-stone-600 dark:text-stone-300 text-[11px]">
          Username: <code className="font-mono font-semibold text-orange-700 dark:text-orange-400">bagasganteng</code> &bull; Password: <code className="font-mono font-semibold text-orange-700 dark:text-orange-400">987654321</code>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-start gap-2"
        >
          <span className="font-bold">&bull;</span>
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2.5 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2"
        >
          <span className="font-bold">&bull;</span>
          <span>{success}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="username-input"
            className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5"
          >
            Username atau Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
              <User size={16} />
            </div>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="bagasganteng atau email..."
              required
              autoComplete="username"
              className="w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password-input"
            className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
              <Lock size={16} />
            </div>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 pl-10 pr-10 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 focus:outline-none"
              title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          id="btn-submit-login"
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold py-2.5 px-4 text-sm shadow-md shadow-orange-600/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Memverifikasi...</span>
            </>
          ) : (
            <>
              <LogIn size={16} />
              <span>Masuk ke Akun</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-stone-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-white dark:bg-zinc-900 px-3 text-stone-400 dark:text-stone-500 font-medium">
            atau lanjutkan dengan
          </span>
        </div>
      </div>

      {/* Google Login Button */}
      <button
        id="btn-google-login"
        type="button"
        onClick={handleGoogleLogin}
        className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 active:scale-[0.98] transition-all shadow-sm"
      >
        <GoogleIcon size={18} />
        <span>Masuk dengan Google</span>
      </button>

      {/* Back to Home */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Kembali ke Halaman Utama</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-stone-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <span className="text-sm text-stone-500">Memuat halaman login...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
