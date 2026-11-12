import { getCopy, navFor, SOCIAL, type Lang, type Page } from '@/lib/i18n';

export function Footer({ lang, page }: { lang: Lang; page: Page }) {
  const copy = getCopy(lang);
  return (
    <footer className="footer">
      <div className="shell footer__top">
        <div>
          <p className="footer__name">José Pinheiro</p>
          <p className="eyebrow">{copy.footerRole}</p>
        </div>
        <nav className="footer__links" aria-label={copy.footerAria}>
          <ul>
            {navFor(lang, page).map((item) => (
              <li key={item.href}><a className="link" href={item.href}>{item.label}</a></li>
            ))}
          </ul>
          <ul>
            {SOCIAL.map((s) => (
              <li key={s.href}>
                <a className="link" href={s.href} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn--round footer__top-btn" href="#top" aria-label={copy.backToTop}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" d="M8 13V3.5M3.5 8 8 3.5 12.5 8" />
          </svg>
        </a>
      </div>
      <div className="shell footer__bottom">
        <p className="eyebrow">© {new Date().getFullYear()} JOSÉ PINHEIRO</p>
        <p className="eyebrow" aria-hidden="true">38.57° N · 7.91° W</p>
      </div>
      <div className="footer__wordmark" aria-hidden="true">
        <p>JOSÉ PINHEIRO</p>
      </div>
    </footer>
  );
}
