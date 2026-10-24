import type { Metadata } from 'next';
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
      <body className="min-h-dvh flex flex-col bg-[oklch(0.985_0.002_250)] dark:bg-[oklch(0.09_0.005_250)] text-[oklch(0.18_0.008_250)] dark:text-[oklch(0.92_0.004_250)] antialiased">
        <ThemeProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <footer className="mt-auto border-t border-black/[0.06] dark:border-white/[0.06] py-8 text-center text-sm text-[oklch(0.55_0.008_250)] dark:text-[oklch(0.55_0.006_250)]">
            <p>© {new Date().getFullYear()} Portal Berita. Seluruh hak cipta dilindungi.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
