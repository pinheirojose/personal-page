import type { Copy } from '@/lib/i18n';
import { Clock } from './Clock';

export const BUILD_TAG = 'v2.0 · 2026';

export function Readout({ copy }: { copy: Copy }) {
  const cells = [
    { k: copy.readout.years, v: copy.readout.yearsValue },
    { k: copy.readout.projects, v: String(copy.projects.length).padStart(2, '0') },
    { k: copy.readout.base, v: copy.location },
    { k: copy.readout.time, v: <Clock /> },
    { k: copy.readout.build, v: BUILD_TAG },
  ];
  return (
    <div className="readout">
      <dl className="shell readout__grid">
        {cells.map((c, i) => (
          <div key={i} className="readout__cell">
            <dt className="eyebrow">{c.k}</dt>
            <dd>{c.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
