'use client';

import { useEffect } from 'react';
import { reveal } from '@/lib/motion/reveal';
import { heroMotion } from '@/lib/motion/hero';
import { timelineMotion } from '@/lib/motion/timeline';

/** Mounted once per page. Everything is visible without it; it only adds motion. */
export function Motion() {
  useEffect(() => {
    const html = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.classList.remove('motion');
      return;
    }
    html.classList.add('motion', 'motion-ready');
    const cleanups = [reveal()];
    let alive = true;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/MotionPathPlugin')])
      .then(([{ gsap }, { ScrollTrigger }, { MotionPathPlugin }]) => {
        if (!alive) return;
        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
        const hero = document.querySelector<HTMLElement>('.hero');
        const list = document.querySelector<HTMLElement>('.timeline');
        if (hero) cleanups.push(heroMotion(hero, gsap, ScrollTrigger));
        if (list) cleanups.push(timelineMotion(list, gsap, ScrollTrigger));
      })
      .catch(() => {
        // GSAP failed to load: show the static drawing and every hidden element.
        html.classList.remove('motion');
      });

    return () => {
      alive = false;
      cleanups.forEach((c) => c());
    };
  }, []);
  return null;
}
