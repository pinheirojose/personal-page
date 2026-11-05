"""Playwright smoke checks for the site. Not deployed (.vercelignore).

    python3 tools/check.py              # run every check
    python3 tools/check.py seo_head     # run named checks

Serves the repo on :8765, prints PASS/FAIL per check, exits 1 on any failure.
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
PORT = 8765
BASE = f'http://localhost:{PORT}'
PAGES = ['/', '/projects.html']
CHECKS = {}


def check(fn):
    CHECKS[fn.__name__.removeprefix('check_')] = fn
    return fn


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(('localhost', PORT), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


async def open_page(browser, path='/', lang=None, locale='pt-PT', viewport=(1440, 900), **ctx_opts):
    """Fresh context. `lang` pre-seeds localStorage; returns (ctx, page, errors)."""
    ctx = await browser.new_context(locale=locale, viewport={'width': viewport[0], 'height': viewport[1]}, **ctx_opts)
    if lang:
        await ctx.add_init_script(f"localStorage.setItem('jose-lang', {json.dumps(lang)})")
    page = await ctx.new_page()
    errors = []
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.goto(BASE + path)
    await page.wait_for_function("document.querySelector('h1')?.textContent.trim().length > 0")
    return ctx, page, errors


def locale_json(tag):
    return json.loads((ROOT / 'locales' / f'{tag}.json').read_text())


def shape(v, path='$'):
    """Key/shape fingerprint: objects by key, arrays element-wise, scalars by type."""
    if isinstance(v, dict):
        return {k: shape(x, f'{path}.{k}') for k, x in v.items()}
    if isinstance(v, list):
        return [shape(x, f'{path}[{i}]') for i, x in enumerate(v)]
    return type(v).__name__


# ---------- checks ----------

@check
async def check_no_console_errors(browser):
    for path in PAGES:
        for lang in ['pt-PT', 'en']:
            ctx, page, errors = await open_page(browser, path, lang=lang)
            await page.wait_for_timeout(800)
            await ctx.close()
            assert not errors, f'{path} {lang}: {errors}'


@check
async def check_locale_keys_identical(browser):
    pt, en = shape(locale_json('pt-PT')), shape(locale_json('en'))
    assert pt == en, 'pt-PT and en differ in keys/shape'


SITE = 'https://josepinheiro.vercel.app'
PAGE_URL = {'/': SITE + '/', '/projects.html': SITE + '/projects.html'}


def image_size(rel):
    from PIL import Image
    with Image.open(ROOT / rel) as im:
        return im.size


@check
async def check_seo_head(browser):
    for path in PAGES:
        for lang in ['pt-PT', 'en']:
            ctx, page, _ = await open_page(browser, path, lang=lang)
            meta = lambda sel: page.eval_on_selector(sel, 'e => e.getAttribute("content") || e.getAttribute("href")')
            assert await meta('link[rel=canonical]') == PAGE_URL[path], f'{path} canonical'
            assert await meta('meta[property="og:url"]') == PAGE_URL[path], f'{path} og:url'
            assert await meta('meta[property="og:image"]') == SITE + '/images/og.png', f'{path} og:image'
            assert await meta('meta[property="og:image:width"]') == '1200'
            assert await meta('meta[property="og:image:height"]') == '630'
            assert await meta('meta[property="og:site_name"]') == 'José Pinheiro'
            assert await meta('meta[name="twitter:card"]') == 'summary_large_image'
            assert await meta('link[rel=apple-touch-icon]') == './images/apple-touch-icon.png'
            assert 'José Pinheiro' in await page.title(), f'{path} {lang} title: {await page.title()}'
            assert 'JOSÉ PINHEIRO' in await page.inner_text('.footer__copy'), f'{path} footer copy'
            assert await page.inner_text('.footer__name') == 'José Pinheiro', f'{path} footer name'
            if path == '/':
                ld = json.loads(await page.inner_text('script[type="application/ld+json"]'))
                assert ld['@type'] == 'Person' and ld['name'] == 'José Pinheiro' and len(ld['sameAs']) == 2, ld
                desc = await meta('meta[name=description]')
                assert 'DevOps' not in desc and ('production' in desc or 'produção' in desc), desc
            await ctx.close()
    assert image_size('images/og.png') == (1200, 630)
    assert (ROOT / 'images/og.png').stat().st_size < 150_000, 'og.png too big'
    assert image_size('images/apple-touch-icon.png') == (180, 180)
    for f in ['robots.txt', 'sitemap.xml']:
        assert (ROOT / f).exists(), f
    assert 'Sitemap: https://josepinheiro.vercel.app/sitemap.xml' in (ROOT / 'robots.txt').read_text()
    sm = (ROOT / 'sitemap.xml').read_text()
    assert all(f'<loc>{u}</loc>' in sm for u in PAGE_URL.values()), 'sitemap urls'


# ---------- runner ----------

async def main(names):
    unknown = [n for n in names if n not in CHECKS]
    if unknown:
        sys.exit(f'unknown checks: {unknown}; have {list(CHECKS)}')
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
