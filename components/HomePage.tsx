import { getCopy, type Lang, type Page as PageKind } from '@/lib/i18n';
import { personJsonLd } from '@/lib/seo';
import { Page } from './Page';
import { Hero } from './Hero';

export function HomePage({ lang, page }: { lang: Lang; page: PageKind }) {
  const copy = getCopy(lang);
  return (
    <Page lang={lang} page={page}>
      {page === 'home' && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      )}
      {page === 'home' ? (
        <Hero copy={copy} />
      ) : (
        <div id="top" className="shell" style={{ minHeight: '120vh', paddingTop: 120 }}>
          <h1>{copy.galleryTitle}</h1>
        </div>
      )}
    </Page>
  );
}
