import type { Copy } from '@/lib/i18n';
import { Frame } from './Frame';
import { SectionHead } from './SectionHead';

export function Notes({ copy }: { copy: Copy }) {
  return (
    <Frame id="notes" coord="X 00 · Y 06">
      <SectionHead id="notes" label={copy.notesEyebrow} title={copy.notesTitle} />
      <ul className="notes">
        {copy.notes.map((n, i) => (
          <li key={n.text} className="reveal" style={{ '--i': i } as React.CSSProperties}>
            <span className="notes__idx mono" aria-hidden="true">06.{i + 1}</span>
            <p className={n.aside ? 'note note--interactive' : 'note'} tabIndex={n.aside ? 0 : undefined}>
              {n.text}
              {n.aside && <span className="note__aside">{n.aside}</span>}
            </p>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
