import { splitProjects, type Copy } from '@/lib/i18n';
import { ProjectCard } from './ProjectCard';
import '@/styles/projects.css';

// priorityFirst: the gallery's first row is on screen at load: no lazy image, no reveal.
type Props = { copy: Copy; perColumn?: number; level: 2 | 3; priorityFirst?: boolean };

export function ProjectGrid({ copy, perColumn, level, priorityFirst = false }: Props) {
  const split = splitProjects(copy, perColumn);
  const ColTitle = `h${level}` as 'h2' | 'h3';
  return (
    <div className="showcase">
      {(['professional', 'personal'] as const).map((type) => (
        <section key={type} className={`showcase__col showcase__col--${type}`} aria-labelledby={`col-${type}`}>
          <div className="col-head">
            <span className="col-head__dot" aria-hidden="true" />
            <ColTitle className="col-head__title eyebrow" id={`col-${type}`}>{copy.projectTypes[type]}</ColTitle>
            <span className="col-head__count mono">{String(split.counts[type]).padStart(2, '0')}</span>
          </div>
          <div className="showcase__list">
            {split[type].map((p, i) => (
              <ProjectCard
                key={p.title}
                project={p}
                copy={copy}
                level={(level + 1) as 3 | 4}
                priority={priorityFirst && i === 0}
                lcp={priorityFirst && i === 0 && type === 'professional'}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
