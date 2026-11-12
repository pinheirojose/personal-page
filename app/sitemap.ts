import type { MetadataRoute } from 'next';
import { pathFor, SITE } from '@/lib/i18n';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return (['home', 'projects'] as const).flatMap((page) =>
    (['pt', 'en'] as const).map((lang) => ({
      url: SITE + pathFor(lang, page),
      alternates: { languages: { 'pt-PT': SITE + pathFor('pt', page), en: SITE + pathFor('en', page) } },
    })),
  );
}
