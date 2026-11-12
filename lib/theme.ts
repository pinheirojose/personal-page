export type ThemePref = 'auto' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'jose-theme';
export const THEME_COLOR: Record<Theme, string> = { dark: '#0B0C0E', light: '#F3F3EE' };
const PREFS: ThemePref[] = ['auto', 'light', 'dark'];

export function resolveTheme(pref: ThemePref, systemDark: boolean): Theme {
  if (pref === 'auto') return systemDark ? 'dark' : 'light';
  return pref;
}

export function readPref(storage: Pick<Storage, 'getItem'> | null): ThemePref {
  try {
    const v = storage?.getItem(THEME_KEY);
    return PREFS.includes(v as ThemePref) ? (v as ThemePref) : 'auto';
  } catch {
    return 'auto';
  }
}

/** Sets the resolved theme on <html> and the browser chrome colour. */
export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

// Runs in <head> before paint. Kept dependency-free: it is inlined as a string.
export const THEME_INIT = `(function(){var p='auto';try{var v=localStorage.getItem('${THEME_KEY}');if(v==='light'||v==='dark')p=v}catch(e){}var t=p==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'${THEME_COLOR.dark}':'${THEME_COLOR.light}')})();`;
