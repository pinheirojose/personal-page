import { getCopy, navFor, pathFor, type Lang, type Page } from '@/lib/i18n';
import { LangSwitch } from './LangSwitch';
import { MobileMenu } from './MobileMenu';
import { ThemeSwitch } from './ThemeSwitch';

export function Header({ lang, page }: { lang: Lang; page: Page }) {
  const copy = getCopy(lang);
  const nav = navFor(lang, page);
  const home = pathFor(lang, 'home');
  const controls = (
    <>
      <LangSwitch lang={lang} page={page} label={copy.langLabel} />
      <ThemeSwitch labels={copy.theme} />
    </>
  );
  return (
    <header className="header">
      <div className="shell header__bar">
        <a className="header__mark" href={page === 'home' ? '#top' : home}>
          <span className="header__node" aria-hidden="true" />
          José Pinheiro
        </a>
        <nav className="header__nav" aria-label={copy.navAria}>
          <ul>
            {nav.slice(1).map((item) => (
              <li key={item.href}>
                <a className="link" href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header__controls">{controls}</div>
        <a className="btn btn--outline header__cta" href={page === 'home' ? '#contact' : home + '#contact'}>
          {copy.talk}
        </a>
        <MobileMenu nav={nav} openLabel={copy.menuOpen} closeLabel={copy.menuClose}>
          {controls}
        </MobileMenu>
      </div>
    </header>
  );
}
