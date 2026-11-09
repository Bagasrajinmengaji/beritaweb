import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AccessibilityWidget } from '@/components/AccessibilityWidget';
import { CustomerServiceChat } from '@/components/CustomerServiceChat';

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
    default: 'Portal Lomba UMPKU — Informasi Kompetisi Mahasiswa UMPKU Surakarta',
    template: '%s | Portal Lomba UMPKU',
  },
  description:
    'Portal Informasi Lomba resmi Universitas Muhammadiyah PKU (UMPKU) Surakarta. Temukan info kompetisi, cek batas deadline pendaftaran, dan ajukan peluang lomba kemahasiswaan.',
  keywords: ['lomba mahasiswa', 'portal lomba', 'umpku surakarta', 'kompetisi kampus', 'beasiswa dan lomba'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Portal Lomba UMPKU Surakarta',
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
          <AccessibilityWidget />
          <CustomerServiceChat />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
