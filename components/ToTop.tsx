'use client';

import { useEffect, useState } from 'react';

export function ToTop({ label }: { label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let tick = 0;
    const onScroll = () => {
      if (tick) return;
      tick = requestAnimationFrame(() => {
        tick = 0;
        setShow(window.scrollY > window.innerHeight * 0.6);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(tick);
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('.header__mark')?.focus({ preventScroll: true });
  };

  return (
    <button
      className={`to-top${show ? ' is-visible' : ''}`}
      type="button"
      onClick={toTop}
      aria-label={label}
      title={label}
      tabIndex={show ? 0 : -1}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" d="M8 13V3.5M3.5 8 8 3.5 12.5 8" />
      </svg>
    </button>
  );
}
