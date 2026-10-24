import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Portal Berita — Berita Terkini Indonesia',
    template: '%s | Portal Berita',
  },
  description:
    'Portal Berita menyajikan liputan terkini, terpercaya, dan mendalam seputar peristiwa Indonesia dan dunia.',
  keywords: ['berita', 'portal berita', 'berita indonesia', 'berita terkini'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Portal Berita',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col bg-stone-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased">
        <ThemeProvider>
          <Suspense fallback={<div className="h-16 w-full border-b border-stone-200 dark:border-zinc-800" />}>
            <Navbar />
          </Suspense>
          <div className="flex-1">
            {children}
          </div>
          <footer className="mt-auto border-t border-stone-200 dark:border-zinc-800 py-8 text-center text-sm text-stone-500 dark:text-stone-400">
            <p>© 2026 Portal Berita. Seluruh hak cipta dilindungi.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
