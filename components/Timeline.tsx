import type { Copy } from '@/lib/i18n';
import { Frame } from './Frame';
import { SectionHead } from './SectionHead';
import '@/styles/timeline.css';

/** Numbered route; renders whatever copy.timeline holds, so a CV update is JSON-only. */
export function Timeline({ copy }: { copy: Copy }) {
  return (
    <Frame id="experience" coord="X 00 · Y 03">
      <SectionHead id="experience" label={copy.experienceEyebrow} title={copy.experienceTitle} />
      <ol className="timeline">
        <span className="timeline__route" aria-hidden="true">
          <span className="timeline__route-fill" />
        </span>
        {copy.timeline.map((role, i) => (
          <li key={role.title} className="timeline__item">
            <span className="timeline__badge mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div className="timeline__body">
              <p className="eyebrow"><time>{role.period}</time></p>
              <h3 className="timeline__role">{role.title}</h3>
              <p className="timeline__org mono">{role.org}</p>
              <p className="prose">{role.summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </Frame>
  );
}
