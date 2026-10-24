'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');

    if (token) {
      localStorage.setItem('auth_token', token);

      if (userRaw) {
        try {
          const user = JSON.parse(decodeURIComponent(userRaw));
          localStorage.setItem('auth_user', JSON.stringify(user));
        } catch {
          // ignore parsing error
        }
      }
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
