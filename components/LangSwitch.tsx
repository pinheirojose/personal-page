'use client';

import { pathFor, type Lang, type Page } from '@/lib/i18n';

/** PT / EN as real links (crawlable); the current hash rides along on click. */
export function LangSwitch({ lang, page, label }: { lang: Lang; page: Page; label: string }) {
  const keepHash = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!location.hash) return;
    e.preventDefault();
    location.assign(e.currentTarget.getAttribute('href') + location.hash);
  };
  return (
    <nav className="lang" aria-label={label} data-pos={lang === 'pt' ? 0 : 1}>
      <span className="lang__thumb" aria-hidden="true" />
      {(['pt', 'en'] as const).map((l) => (
        <a
          key={l}
          href={pathFor(l, page)}
          hrefLang={l === 'pt' ? 'pt-PT' : 'en'}
          lang={l === 'pt' ? 'pt-PT' : 'en'}
          aria-current={l === lang ? 'true' : undefined}
          onClick={l === lang ? undefined : keepHash}
        >
          {l.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}
