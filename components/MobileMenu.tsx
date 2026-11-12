'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  nav: { label: string; href: string }[];
  openLabel: string;
  closeLabel: string;
  children: React.ReactNode; // lang + theme switches
};

const WIDE = '(min-width: 1080px)';

export function MobileMenu({ nav, openLabel, closeLabel, children }: Props) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    drawer.current?.querySelector('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggle.current?.focus();
    };
    const mq = window.matchMedia(WIDE);
    const onWide = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onWide);
    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onWide);
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggle}
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="nav-toggle__bars" aria-hidden="true" />
      </button>
      <div ref={drawer} id="mobile-menu" className={`drawer${open ? ' is-open' : ''}`}>
        <ul className="drawer__nav">
          {nav.map((item, i) => (
            <li key={item.href} style={{ '--i': i } as React.CSSProperties}>
              <a href={item.href} onClick={() => setOpen(false)}>
                <span className="drawer__idx" aria-hidden="true">{String(i).padStart(2, '0')}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="drawer__controls">{children}</div>
      </div>
    </>
  );
}
