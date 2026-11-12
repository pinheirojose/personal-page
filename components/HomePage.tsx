import { getCopy, type Lang, type Page as PageKind } from '@/lib/i18n';
import { personJsonLd } from '@/lib/seo';
import { Page } from './Page';

export function HomePage({ lang, page }: { lang: Lang; page: PageKind }) {
  const copy = getCopy(lang);
  return (
    <Page lang={lang} page={page}>
      {page === 'home' && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      )}
      <div id="top" className="shell" style={{ minHeight: '120vh', paddingTop: 120 }}>
        <h1>{page === 'home' ? copy.heroTitle : copy.galleryTitle}</h1>
      </div>
    </Page>
  );
}
