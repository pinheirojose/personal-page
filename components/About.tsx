import type { Copy } from '@/lib/i18n';
import { Frame } from './Frame';
import { SectionHead } from './SectionHead';

// Card photos, cropped and sized offline (800/1400 WebP). Decorative: the card text carries the meaning.
const PHOTOS = [
  { name: 'build', w: 1400, h: 1050 },
  { name: 'solve', w: 1400, h: 788 },
  { name: 'deliver', w: 1400, h: 788 },
];

const GLYPHS: Record<string, React.ReactNode> = {
  0: <path d="M4 15h7v5H4zM13 15h7v5h-7zM8.5 8h7v5h-7zM8.5 3h7" />, // stacked blocks
  1: <path d="M12 3v5M12 16v5M3 12h5M16 12h5M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />, // crosshair
  2: <path d="M3 12h11M10 8l4 4-4 4M17 5h4v14h-4" />, // arrow into a box
};

export function About({ copy }: { copy: Copy }) {
  return (
    <Frame id="about" coord="X 00 · Y 01">
      <SectionHead id="about" label={copy.aboutEyebrow} title={copy.aboutTitle} />
      <div className="about__copy reveal">
        <p className="lede">{copy.aboutLede}</p>
        <p className="prose">{copy.aboutBody}</p>
      </div>
      <ul className="pillars">
        {copy.pillars.map((p, i) => (
          <li key={p.label} className="pillar crop reveal" style={{ '--i': i } as React.CSSProperties}>
            <div className="pillar__media">
              <img
                src={`/images/pillars/${PHOTOS[i].name}-800.webp`}
                srcSet={`/images/pillars/${PHOTOS[i].name}-800.webp 800w, /images/pillars/${PHOTOS[i].name}-1400.webp 1400w`}
                sizes={i === 0 ? '(min-width: 960px) 720px, 100vw' : '(min-width: 960px) 540px, (min-width: 720px) 50vw, 100vw'}
                width={PHOTOS[i].w}
                height={PHOTOS[i].h}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span className="pillar__tile" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22">{GLYPHS[i]}</svg>
              </span>
              <span className="pillar__id mono" aria-hidden="true">P-0{i + 1}</span>
            </div>
            <div className="pillar__body">
              <h3 className="eyebrow eyebrow--accent pillar__label">{p.label}</h3>
              <p className="pillar__text">{p.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
