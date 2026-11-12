import type { Copy } from '@/lib/i18n';
import { Frame } from './Frame';
import { SectionHead } from './SectionHead';

export function Toolbox({ copy }: { copy: Copy }) {
  const track = (
    <div className="marquee__group">
      {copy.toolbox.map((g) => (
        <span key={g.label} className="marquee__set">
          <span className="marquee__label">{g.label}</span>
          <span className="marquee__arrow">▸</span>
          {g.items.map((t) => (
            <span key={t} className="marquee__item">{t}</span>
          ))}
        </span>
      ))}
    </div>
  );
  return (
    <Frame id="toolbox" coord="X 00 · Y 04" className="section--toolbox">
      <SectionHead id="toolbox" label={copy.toolboxEyebrow} title={copy.toolboxTitle} />
      {/* Readable, grouped list for assistive tech; the marquee below is decoration. */}
      <div className="sr-only">
        {copy.toolbox.map((g) => (
          <div key={g.label}>
            <h3>{g.label}</h3>
            <ul className="toolbox__list">
              {g.items.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="marquee reveal" aria-hidden="true">
        <div className="marquee__track">
          {track}
          {track}
        </div>
      </div>
    </Frame>
  );
}
