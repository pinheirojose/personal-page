import { getCopy, type Lang, type Page as PageKind } from '@/lib/i18n';
import { personJsonLd } from '@/lib/seo';
import { Page } from './Page';
import { Hero } from './Hero';
import { About } from './About';
import { Notes } from './Notes';
import { Toolbox } from './Toolbox';
import { Projects, Gallery } from './Projects';
import '@/styles/sections.css';

export function HomePage({ lang, page }: { lang: Lang; page: PageKind }) {
  const copy = getCopy(lang);
  return (
    <Page lang={lang} page={page}>
      {page === 'home' && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      )}
      {page === 'home' ? (
        <>
          <Hero copy={copy} />
          <About copy={copy} />
          <Projects copy={copy} lang={lang} />
          <Toolbox copy={copy} />
          <Notes copy={copy} />
        </>
      ) : (
        <Gallery copy={copy} lang={lang} />
      )}
    </Page>
  );
}
