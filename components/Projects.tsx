import { pathFor, type Copy, type Lang } from '@/lib/i18n';
import { Frame } from './Frame';
import { SectionHead } from './SectionHead';
import { ProjectGrid } from './ProjectGrid';

export function Projects({ copy, lang }: { copy: Copy; lang: Lang }) {
  return (
    <Frame id="projects" coord="X 00 · Y 02">
      <SectionHead id="projects" label={copy.projectsEyebrow} title={copy.projectsTitle} lead={copy.projectsLead} />
      <ProjectGrid copy={copy} perColumn={2} level={3} />
      <p className="projects__more">
        <a className="btn btn--outline" href={pathFor(lang, 'projects')}>
          {copy.allProjects} <span aria-hidden="true">→</span>
        </a>
      </p>
    </Frame>
  );
}

export function Gallery({ copy, lang }: { copy: Copy; lang: Lang }) {
  return (
    <section id="top" className="gallery" aria-labelledby="gallery-title">
      <div className="shell">
        <p className="gallery__back">
          <a className="link eyebrow" href={pathFor(lang, 'home')}>{copy.backHome}</a>
        </p>
        <SectionHead id="gallery" label={copy.galleryEyebrow} title={copy.galleryTitle} lead={copy.galleryLead} as="h1" />
        <ProjectGrid copy={copy} level={2} />
      </div>
    </section>
  );
}
