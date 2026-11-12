import type { Copy, Project } from '@/lib/i18n';

type Props = { project: Project; copy: Copy; level: 3 | 4; priority?: boolean; lcp?: boolean };

export function ProjectCard({ project: p, copy, level, priority = false, lcp = false }: Props) {
  const Title = `h${level}` as 'h3' | 'h4';
  return (
    <article className={priority ? 'work-card crop' : 'work-card crop reveal'}>
      <div className="work-card__media">
        <img
          src={p.image}
          srcSet={`${p.image.replace(/\.webp$/, '-800.webp')} 800w, ${p.image} 1280w`}
          sizes="(min-width: 1280px) 620px, (min-width: 960px) 48vw, 100vw"
          alt={p.alt}
          width={640}
          height={400}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={lcp ? 'high' : 'auto'}
          decoding="async"
        />
        <span className="work-card__index mono" aria-hidden="true">{p.number}</span>
      </div>
      <div className="work-card__body">
        <p className="work-card__meta eyebrow">
          <span>{copy.roleLabel}</span>
          <span className="work-card__role">{p.role}</span>
        </p>
        <Title className="work-card__title">{p.title}</Title>
        <p className="prose work-card__summary">{p.summary}</p>
        <ul className="work-card__stack" aria-label={copy.areasLabel}>
          {p.stack.map((s) => <li key={s} className="pill">{s}</li>)}
        </ul>
        <div className="work-card__foot">
          <p className="work-card__result">
            <span className="eyebrow">{copy.resultLabel}</span>
            {p.result}
          </p>
          {p.url ? (
            <a
              className="btn btn--round work-card__cta"
              href={p.url}
              target={p.external ? '_blank' : undefined}
              rel={p.external ? 'noopener noreferrer' : undefined}
              aria-label={`${copy.viewProject}: ${p.title}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" d="M4 10 10 4M5 4h5v5" />
              </svg>
            </a>
          ) : (
            <p className="work-card__private eyebrow">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path fill="none" stroke="currentColor" strokeWidth="1.2" d="M3 5.5V4a3 3 0 0 1 6 0v1.5M2.5 5.5h7v5h-7z" />
              </svg>
              {copy.privateWork}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
