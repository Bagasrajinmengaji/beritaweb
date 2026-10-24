'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
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
          // gagal parse user, abaikan — token tetap tersimpan
        }
      }
    }

    router.replace('/');
  }, [router, searchParams]);

  return (
    <main
      id="auth-callback-loading"
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Memproses login Google…"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Spinner */}
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
    </main>
  );
}
