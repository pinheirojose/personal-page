import type { Copy } from '@/lib/i18n';
import { HeroSchema } from './HeroSchema';
import { Readout } from './Readout';
import '@/styles/hero.css';

export function Hero({ copy }: { copy: Copy }) {
  return (
    <>
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero__grid" aria-hidden="true" />
        <p className="hero__ghost" aria-hidden="true">JOSÉ</p>
        <div className="shell hero__inner">
          <div className="hero__text">
            <p className="eyebrow hero__eyebrow">
              <span className="hero__eyebrow-node" aria-hidden="true" />
              {copy.heroEyebrow}
            </p>
            <h1 className="hero__title" id="hero-title">{copy.heroTitle}</h1>
            <p className="hero__tagline">
              {copy.taglineBefore} <em className="mark">{copy.taglineMark}</em>
              {copy.taglineAfter}
            </p>
            <p className="prose hero__lead">{copy.heroLead}</p>
            <div className="hero__actions">
              <a className="btn btn--solid" href="#projects">{copy.seeWork}</a>
              <a className="btn btn--outline" href="#contact">{copy.talk}</a>
            </div>
          </div>
          <div className="hero__visual">
            <HeroSchema />
          </div>
        </div>
      </section>
      <Readout copy={copy} />
    </>
  );
}
