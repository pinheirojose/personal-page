import type { Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeScript } from './ThemeScript';
import type { Lang } from '@/lib/i18n';
import '@/styles/globals.css';

// Self-hosted at build time; the Latin subset covers PT and EN.
const sans = Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap', preload: false });

export const viewport: Viewport = { themeColor: '#0B0C0E', colorScheme: 'dark light' };

export function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html
      lang={lang === 'en' ? 'en' : 'pt-PT'}
      data-theme="dark"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      {/* Extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body> before hydration. */}
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
