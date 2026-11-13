import type { Copy } from '@/lib/i18n';
import { Clock } from './Clock';

export function Readout({ copy }: { copy: Copy }) {
  const cells = [
    { k: copy.readout.years, v: copy.readout.yearsValue },
    {
      k: copy.readout.projects,
      v: (
        <>
          {String(copy.projects.length).padStart(2, '0')}
          <span className="readout__note">{copy.readout.projectsNote}</span>
        </>
      ),
    },
    {
      k: copy.readout.sectors,
      wide: true,
      v: (
        <ul className="readout__list">
          {copy.readout.sectorsList.map((s) => <li key={s}>{s}</li>)}
        </ul>
      ),
    },
    {
      k: copy.readout.base,
      v: (
        <>
          {copy.location}
          <span className="readout__note">{copy.locationNote}</span>
        </>
      ),
    },
    { k: copy.readout.time, v: <Clock /> },
  ];
  return (
    <div className="readout">
      <dl className="shell readout__grid">
        {cells.map((c, i) => (
          <div key={i} className={'wide' in c ? 'readout__cell readout__cell--wide' : 'readout__cell'}>
            <dt className="eyebrow">{c.k}</dt>
            <dd>{c.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
