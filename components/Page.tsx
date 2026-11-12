import { getCopy, type Lang, type Page as PageKind } from '@/lib/i18n';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToTop } from "./ToTop";
import { Motion } from "./Motion";
import '@/styles/chrome.css';

export function Page({ lang, page, children }: { lang: Lang; page: PageKind; children: React.ReactNode }) {
  const copy = getCopy(lang);
  return (
    <>
      <a className="skip-link" href="#main">{copy.skip}</a>
      <Header lang={lang} page={page} />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer lang={lang} page={page} />
      <ToTop label={copy.backToTop} />
      <Motion />
    </>
  );
}
