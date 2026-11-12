import type { gsap as GSAP } from 'gsap';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';

const NEAR = 120; // svg units

/**
 * The hero schematic: draws itself on load, then sends calm pulses along the
 * routes, reacts to the pointer and drifts on scroll. Returns a cleanup.
 */
export function heroMotion(hero: HTMLElement, gsap: typeof GSAP, ScrollTrigger: typeof ST): () => void {
  const svg = hero.querySelector<SVGSVGElement>('.hero-schema');
  if (!svg) return () => {};
  const routes = [...svg.querySelectorAll<SVGPathElement>('.schema-route:not(.schema-route--return)')];
  const pulse = svg.querySelector<SVGGElement>('.schema-pulse')!;
  const nodes = [...svg.querySelectorAll<SVGGElement>('.schema-node')];
  const cleanups: (() => void)[] = [];

  const ctx = gsap.context(() => {
    // ---- 1. draw (≤1.6s): grid → routes → nodes → labels
    gsap.set('.schema-route', { strokeDashoffset: 1 });
    gsap.set('.schema-node', { scale: 0.6, opacity: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
    gsap.set(['.schema-grid', '.schema-label'], { opacity: 0 });
    svg.classList.add('is-live');

    const draw = gsap.timeline({ defaults: { ease: 'power3.out' } });
    draw
      .to('.schema-grid', { opacity: 1, duration: 0.4, ease: 'power1.out' }, 0)
      .to('.schema-route', { strokeDashoffset: 0, duration: 0.55, stagger: 0.1, ease: 'power2.inOut' }, 0.3)
      .to('.schema-node', { scale: 1, opacity: 1, duration: 0.35, stagger: 0.06 }, 0.9)
      .to('.schema-label', { opacity: 1, duration: 0.3, stagger: 0.05 }, 1.1);
    // The INFRA ring is a CSS animation, delayed to 1.3s under html.motion (hero.css).

    // ---- 2. pulses: one at a time, along a random route, with a pause between trips
    let current: gsap.core.Animation | null = null;
    let running = false;
    let last = -1;
    const next = () => {
      let i = Math.floor(Math.random() * routes.length);
      if (i === last) i = (i + 1) % routes.length;
      last = i;
      current = gsap
        .timeline({ onComplete: () => { current = gsap.delayedCall(1.1, next); } })
        .set(pulse, { opacity: 0 })
        .to(pulse, {
          duration: 1.4,
          ease: 'power1.inOut',
          motionPath: { path: routes[i], align: routes[i], alignOrigin: [0.5, 0.5] },
        })
        .to(pulse, { opacity: 1, duration: 0.2 }, 0)
        .to(pulse, { opacity: 0, duration: 0.25 }, 1.15);
    };
    const play = () => {
      if (running || draw.progress() < 1 || document.hidden) return;
      running = true;
      if (current) current.resume();
      else next();
    };
    const stop = () => {
      running = false;
      current?.pause();
    };
    draw.eventCallback('onComplete', play);

    // pause pulses while the hero is off-screen or the tab is hidden
    ScrollTrigger.create({
      trigger: hero,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? play() : stop()),
    });
    const onVis = () => (document.hidden ? stop() : play());
    document.addEventListener('visibilitychange', onVis);
    cleanups.push(() => {
      document.removeEventListener('visibilitychange', onVis);
      current?.kill();
    });

    // ---- 3. scroll: drift and recompose as the hero leaves
    const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(hero.querySelector('.hero__visual'), { y: 80, ease: 'none', scrollTrigger: scrub });
    gsap.to('.schema-grid', { y: 30, opacity: 0.4, ease: 'none', scrollTrigger: { ...scrub } });
  }, svg);

  // ---- 4. pointer: crosshair + nearby nodes brighten (fine pointers only)
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = svg.querySelector<SVGGElement>('.schema-cursor')!;
    const h = cursor.querySelector<SVGLineElement>('.schema-cursor__h')!;
    const v = cursor.querySelector<SVGLineElement>('.schema-cursor__v')!;
    const label = cursor.querySelector<SVGTextElement>('.schema-cursor__label')!;
    const pt = svg.createSVGPoint();
    let raf = 0;
    let cx = 0;
    let cy = 0;
    const paint = () => {
      raf = 0;
      pt.x = cx;
      pt.y = cy;
      const m = svg.getScreenCTM();
      if (!m) return;
      const p = pt.matrixTransform(m.inverse());
      const inside = p.x >= 0 && p.x <= 420 && p.y >= 0 && p.y <= 520;
      cursor.style.opacity = inside ? '1' : '0';
      h.style.transform = `translateY(${p.y}px)`;
      v.style.transform = `translateX(${p.x}px)`;
      label.style.transform = `translate(${p.x}px, ${p.y}px)`;
      label.textContent = `${Math.round(p.x)},${Math.round(p.y)}`;
      for (const n of nodes) {
        const near = Math.hypot(Number(n.dataset.x) - p.x, Number(n.dataset.y) - p.y) < NEAR;
        n.classList.toggle('is-near', inside && near);
      }
    };
    const onMove = (e: PointerEvent) => {
      cx = e.clientX;
      cy = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      cursor.style.opacity = '0';
      nodes.forEach((n) => n.classList.remove('is-near'));
    };
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    });
  }

  return () => {
    cleanups.forEach((c) => c());
    ctx.revert();
    svg.classList.remove('is-live');
  };
}
