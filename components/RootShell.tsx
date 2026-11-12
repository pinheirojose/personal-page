import type { Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeScript } from './ThemeScript';
import type { Lang } from '@/lib/i18n';
import '@/styles/globals.css';

export const viewport: Viewport = { themeColor: '#0B0C0E', colorScheme: 'dark light' };

export function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html
      lang={lang === 'en' ? 'en' : 'pt-PT'}
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
