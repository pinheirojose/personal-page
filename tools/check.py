"""Playwright smoke checks for the built site. Not deployed (.vercelignore).

    npm run build && python3 tools/check.py          # run every check
    python3 tools/check.py seo_head hero             # run named checks

Serves out/ on :8765 the way Vercel cleanUrls does, prints PASS/FAIL per check,
exits 1 on any failure.
"""
import asyncio
import functools
import http.server
import json
import pathlib
import sys
import threading

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'out'
PORT = 8765
BASE = f'http://localhost:{PORT}'
SITE = 'https://jose-pinheiro.pt'
PAGES = ['/', '/projects', '/en', '/en/projects']
LANG_OF = {'/': 'pt-PT', '/projects': 'pt-PT', '/en': 'en', '/en/projects': 'en'}
CHECKS = {}


def check(fn):
    CHECKS[fn.__name__.removeprefix('check_')] = fn
    return fn


class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    """/en -> en.html, /en/projects -> en/projects.html, like Vercel cleanUrls."""

    def translate_path(self, path):
        clean = path.split('?', 1)[0].split('#', 1)[0]
        base = pathlib.Path(super().translate_path(clean))
        if base.is_file():
            return str(base)
        for cand in (base.with_name(base.name + '.html'), base / 'index.html'):
            if cand.is_file():
                return str(cand)
        return str(base)

    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(CleanUrlHandler, directory=str(OUT))
    srv = http.server.ThreadingHTTPServer(('localhost', PORT), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


async def open_page(browser, path='/', viewport=(1440, 900), theme=None, **ctx_opts):
    """Fresh context; returns (ctx, page, errors). `theme` pre-seeds the stored preference."""
    ctx = await browser.new_context(viewport={'width': viewport[0], 'height': viewport[1]}, **ctx_opts)
    if theme:
        await ctx.add_init_script(f"try{{localStorage.setItem('jose-theme', {json.dumps(theme)})}}catch(e){{}}")
    page = await ctx.new_page()
    errors = []
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.goto(BASE + path)
    await page.wait_for_load_state('networkidle')
    await page.evaluate('document.fonts.ready')
    return ctx, page, errors


def locale_json(tag):
    return json.loads((ROOT / 'locales' / f'{tag}.json').read_text())


def copy_for(path):
    return locale_json(LANG_OF[path])


# ---------- checks ----------

@check
async def check_no_console_errors(browser):
    for path in PAGES:
        ctx, page, errors = await open_page(browser, path)
        await page.wait_for_timeout(800)
        await ctx.close()
        assert not errors, f'{path}: {errors[:3]}'


@check
async def check_seo_head(browser):
    for path in PAGES:
        ctx, page, _ = await open_page(browser, path)
        assert await page.evaluate('document.documentElement.lang') == LANG_OF[path], f'{path} lang'
        canon = await page.eval_on_selector_all('link[rel=canonical]', 'ls => ls.map(l => l.href)')
        assert canon == [SITE + path], f'{path} canonical {canon}'
        alts = await page.eval_on_selector_all(
            'link[rel=alternate][hreflang]', 'ls => Object.fromEntries(ls.map(l => [l.hreflang, l.href]))')
        home = path in ('/', '/en')
        want = {'pt-PT': SITE + ('/' if home else '/projects'), 'en': SITE + ('/en' if home else '/en/projects')}
        want['x-default'] = want['pt-PT']
        assert alts == want, f'{path} hreflang {alts}'
        og = await page.eval_on_selector('meta[property="og:image"]', 'e => e.content')
        assert og == SITE + '/images/og.png', f'{path} og:image {og}'
        assert 'José Pinheiro' in await page.title(), f'{path} title'
        if home:
            ld = json.loads(await page.inner_text('script[type="application/ld+json"]'))
            assert ld['@type'] == 'Person' and len(ld['sameAs']) == 2, ld
        await ctx.close()
    for f in ['robots.txt', 'sitemap.xml']:
        assert (OUT / f).exists(), f
    sm = (OUT / 'sitemap.xml').read_text()
    assert all(f'<loc>{SITE}{p}</loc>' in sm for p in PAGES), sm


@check
async def check_legacy_redirects(browser):
    rules = json.loads((ROOT / 'vercel.json').read_text())['redirects']
    got = [(r['source'], (r.get('has') or [{}])[0].get('value'), r['destination'], r['permanent']) for r in rules]
    want = [('/', 'en', '/en', True),
            ('/projects.html', 'en', '/en/projects', True),
            ('/projects.html', None, '/projects', True),
            ('/index.html', None, '/', True)]
    assert got == want, got


async def main(names):
    unknown = [n for n in names if n not in CHECKS]
    if unknown:
        sys.exit(f'unknown checks: {unknown}; have {list(CHECKS)}')
    if not (OUT / 'index.html').exists():
        sys.exit('out/ missing: run npm run build first')
    srv = serve()
    failed = 0
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for name in names or CHECKS:
            try:
                await CHECKS[name](browser)
                print(f'PASS {name}')
            except Exception as e:  # report every failure, keep going
                failed += 1
                print(f'FAIL {name}: {e}'.splitlines()[0][:300])
        await browser.close()
    srv.shutdown()
    print(f'{len(names or CHECKS) - failed}/{len(names or CHECKS)} passed')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    asyncio.run(main(sys.argv[1:]))
