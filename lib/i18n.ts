import en from '../locales/en.json' with { type: 'json' };
import pt from '../locales/pt-PT.json' with { type: 'json' };

export type Lang = 'pt' | 'en';
export type Page = 'home' | 'projects';
export type Copy = typeof en;
type RawProject = Copy['projects'][number];
export type Project = RawProject & { number: string; isPrivate: boolean; external: boolean; stack: string[] };

export const EMAIL = 'jbernardopinheiro@gmail.com';
export const SOCIAL = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jose-pinheiro/' },
  { label: 'GitHub', href: 'https://github.com/pinheirojose' },
];
export const SITE = 'https://jose-pinheiro.pt';

const catalog: Record<Lang, Copy> = { en, pt: pt as Copy };

export function getCopy(lang: Lang): Copy {
  const raw = catalog[lang];
  return {
    ...raw,
    projects: raw.projects.map((p) => ({ ...p, image: p.image.replace(/^\.\//, '/') })),
  };
}

export function splitProjects(copy: Copy, perColumn?: number) {
  const byType = (type: string): Project[] =>
    copy.projects
      .filter((p) => p.type === type)
      .map((p, i) => ({
        ...p,
        number: String(i + 1).padStart(2, '0'),
        isPrivate: !p.url,
        external: /^https?:/i.test(p.url),
        stack: p.areas.split(' · '),
      }));
  const professional = byType('professional');
  const personal = byType('personal');
  return {
    professional: perColumn ? professional.slice(0, perColumn) : professional,
    personal: perColumn ? personal.slice(0, perColumn) : personal,
    counts: { professional: professional.length, personal: personal.length },
  };
}

export function eyebrow(raw: string): string {
  const m = raw.match(/^(.*?) \/ (\d+)$/);
  return m ? `${m[2]} / ${m[1]}` : raw;
}

export function pathFor(lang: Lang, page: Page): string {
  const base = lang === 'en' ? '/en' : '';
  return page === 'home' ? base || '/' : `${base}/projects`;
}

export function navFor(lang: Lang, page: Page) {
  const home = pathFor(lang, 'home');
  return getCopy(lang).nav.map((item) => ({
    label: item.label,
    href: page === 'projects' && item.href.startsWith('#') ? home + item.href : item.href,
  }));
}

export function contactLinks(copy: Copy) {
  const hrefs: Record<string, string> = {
    email: 'mailto:' + EMAIL,
    linkedin: SOCIAL[0].href,
    github: SOCIAL[1].href,
  };
  return copy.contactLinks.map((link) => ({
    label: link.label,
    text: link.id === 'email' ? EMAIL : ((link as { text?: string }).text ?? ''),
    href: hrefs[link.id],
    external: link.id !== 'email',
  }));
}
