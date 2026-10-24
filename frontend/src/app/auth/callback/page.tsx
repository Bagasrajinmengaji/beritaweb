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
        className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-base font-medium text-[oklch(0.45_0.007_250)] dark:text-[oklch(0.6_0.006_250)]">
        Memproses login Google…
      </p>
      <p className="text-sm text-[oklch(0.58_0.007_250)] dark:text-[oklch(0.5_0.006_250)]">
        Anda akan dialihkan otomatis.
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main
      id="auth-callback-loading"
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Memproses login Google…"
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"
              aria-hidden="true"
            />
            <p className="text-base font-medium text-[oklch(0.45_0.007_250)] dark:text-[oklch(0.6_0.006_250)]">
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
