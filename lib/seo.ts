import type { Metadata } from 'next';
import { getCopy, pathFor, SITE, SOCIAL, type Lang, type Page } from './i18n';

// Link-preview image per language. Bump the file name when it changes:
// WhatsApp, LinkedIn and Facebook cache previews by image URL.
const ogImage = (lang: Lang) => `/images/og-${lang}.png`;

export function pageMetadata(lang: Lang, page: Page): Metadata {
  const copy = getCopy(lang);
  const title = page === 'home' ? copy.docTitle : copy.galleryDocTitle;
  const description = page === 'home' ? copy.docDescription : copy.galleryLead;
  const url = pathFor(lang, page);
  return {
    metadataBase: new URL(SITE),
    title,
    description,
    alternates: {
      canonical: url,
      languages: { 'pt-PT': pathFor('pt', page), en: pathFor('en', page), 'x-default': pathFor('pt', page) },
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'José Pinheiro',
      locale: copy.ogLocale,
      alternateLocale: lang === 'en' ? 'pt_PT' : 'en_GB',
      images: [{ url: ogImage(lang), width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', images: [ogImage(lang)] },
    referrer: 'strict-origin-when-cross-origin',
    icons: {
      // Google Search wants /favicon.ico or an icon sized in multiples of 48px.
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/images/favicon.svg', type: 'image/svg+xml' },
        { url: '/images/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/images/favicon.png', type: 'image/png', sizes: '32x32' },
      ],
      apple: '/images/apple-touch-icon.png',
    },
  };
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'José Pinheiro',
    jobTitle: 'Software Engineer',
    url: SITE + '/',
    sameAs: SOCIAL.map((s) => s.href),
  };
}
