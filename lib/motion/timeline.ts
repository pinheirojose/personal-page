import type { gsap as GSAP } from 'gsap';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';

/** The experience route draws with the scroll; each badge lights as the line reaches it. */
export function timelineMotion(list: HTMLElement, gsap: typeof GSAP, ScrollTrigger: typeof ST): () => void {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      '.timeline__route-fill',
      { scaleY: 0 },
      { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: 0.3 } },
    );
    list.querySelectorAll<HTMLElement>('.timeline__item').forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          item.querySelector('.timeline__badge')?.classList.add('is-lit');
          item.querySelector('.timeline__body')?.classList.add('is-in');
        },
      });
    });
  }, list);
  return () => ctx.revert();
}
