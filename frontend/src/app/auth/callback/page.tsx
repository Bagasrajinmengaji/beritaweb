'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');
    const paramRole = searchParams.get('role');
    const paramName = searchParams.get('name');
    const paramEmail = searchParams.get('email');
    const paramId = searchParams.get('id');

    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token);

      let user: { id?: number; name: string; email: string; role: string; avatar?: string | null } = {
        name: paramName || 'Pengguna',
        email: paramEmail || 'user@portalberita.com',
        role: paramRole || 'user',
      };

      if (paramId) {
        user.id = Number(paramId);
      }

      if (userRaw) {
        try {
          const parsed = JSON.parse(decodeURIComponent(userRaw));
          user = { ...user, ...parsed };
        } catch {
          // ignore parsing error
        }
      }

      if (paramRole) {
        user.role = paramRole;
      }

      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);
      localStorage.setItem('user_role', user.role);

      window.dispatchEvent(new Event('authChange'));
      window.dispatchEvent(new Event('storage'));
    }

    router.replace('/');
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span
        className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
        Memproses login Google…
      </p>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Anda akan dialihkan otomatis.
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main
      id="auth-callback-loading"
      className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-zinc-950"
      role="status"
      aria-label="Memproses login Google…"
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
              aria-hidden="true"
            />
            <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
              Menghubungkan…
            </p>
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </main>
  );
}
