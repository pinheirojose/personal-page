import type { Copy } from '@/lib/i18n';
import { Frame } from './Frame';
import { SectionHead } from './SectionHead';

/** Training and community: three instrument-style readouts with a short note each. */
export function Training({ copy }: { copy: Copy }) {
  return (
    <Frame id="training" coord="X 00 · Y 04">
      <SectionHead id="training" label={copy.trainingEyebrow} title={copy.trainingTitle} lead={copy.trainingLead} />
      <ul className="training">
        {copy.training.map((t, i) => (
          <li key={t.title} className="training__cell reveal" style={{ '--i': i } as React.CSSProperties}>
            <p className="training__value mono">{t.value}</p>
            <p className="eyebrow eyebrow--accent">{t.label}</p>
            <h3 className="training__title">{t.title}</h3>
            <p className="eyebrow"><time>{t.period}</time></p>
            <p className="prose training__text">{t.text}</p>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
