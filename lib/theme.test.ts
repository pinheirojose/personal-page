import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTheme, readPref, THEME_INIT } from './theme.ts';

test('resolve', () => {
  assert.equal(resolveTheme('auto', true), 'dark');
  assert.equal(resolveTheme('auto', false), 'light');
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('readPref tolerates broken storage', () => {
  assert.equal(readPref({ getItem: () => { throw new Error('denied'); } }), 'auto');
  assert.equal(readPref({ getItem: () => 'neon' }), 'auto');
  assert.equal(readPref(null), 'auto');
  assert.equal(readPref({ getItem: () => 'dark' }), 'dark');
});

test('init script sets data-theme even when storage throws', () => {
  const attrs: Record<string, string> = {};
  const g = {
    localStorage: { getItem: () => { throw new Error('denied'); } },
    matchMedia: () => ({ matches: false }),
    document: {
      documentElement: { setAttribute: (k: string, v: string) => { attrs[k] = v; }, style: {} },
      querySelector: () => null,
    },
  };
  new Function('window', 'localStorage', 'matchMedia', 'document', THEME_INIT)(g, g.localStorage, g.matchMedia, g.document);
  assert.equal(attrs['data-theme'], 'light');
});
