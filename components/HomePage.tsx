import { getCopy, type Lang, type Page } from '@/lib/i18n';
import { personJsonLd } from '@/lib/seo';

/** Temporary page body; replaced section by section in later tasks. */
export function HomePage({ lang, page }: { lang: Lang; page: Page }) {
  const copy = getCopy(lang);
  return (
    <main id="main">
      {page === 'home' && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      )}
      <h1>{page === 'home' ? copy.heroTitle : copy.galleryTitle}</h1>
    </main>
  );
}
