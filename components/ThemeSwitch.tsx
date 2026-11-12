'use client';

import { useEffect, useId, useState } from 'react';
import { applyTheme, readPref, resolveTheme, THEME_KEY, type ThemePref } from '@/lib/theme';

type Labels = { label: string; auto: string; light: string; dark: string };
const PREFS: ThemePref[] = ['auto', 'light', 'dark'];
const EVENT = 'jose:theme';

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Three-position instrument switch: Auto / Light / Dark. Native radios give arrow-key support. */
export function ThemeSwitch({ labels }: { labels: Labels }) {
  const name = useId();
  // Start at 'auto' to match the server render; the real pref is read on mount.
  const [pref, setPref] = useState<ThemePref>('auto');

  useEffect(() => {
    setPref(readPref(storage()));
    // Header and drawer each render a switch; keep them in step.
    const onPref = (e: Event) => setPref((e as CustomEvent<ThemePref>).detail);
    window.addEventListener(EVENT, onPref);
    return () => window.removeEventListener(EVENT, onPref);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => applyTheme(resolveTheme(pref, mq.matches));
    sync();
    if (pref !== 'auto') return;
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [pref]);

  const choose = (next: ThemePref) => {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
    try {
      if (next === 'auto') storage()?.removeItem(THEME_KEY);
      else storage()?.setItem(THEME_KEY, next);
    } catch {
      /* storage blocked: the choice still applies for this visit */
    }
  };

  return (
    <fieldset className="switch" data-pos={PREFS.indexOf(pref)}>
      <legend className="sr-only">{labels.label}</legend>
      <span className="switch__thumb" aria-hidden="true" />
      {PREFS.map((p) => (
        <label key={p} className="switch__opt">
          <input
            type="radio"
            name={name}
            value={p}
            checked={pref === p}
            onChange={() => choose(p)}
            className="sr-only"
          />
          <span>{labels[p]}</span>
        </label>
      ))}
    </fieldset>
  );
}
