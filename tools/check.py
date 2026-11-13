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


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 64  # default 5 overflows when Chromium opens many parallel connections


def serve():
    handler = functools.partial(CleanUrlHandler, directory=str(OUT))
    srv = Server(('localhost', PORT), handler)
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


def tools_text(copy):
    return ' '.join(t for g in copy['toolbox'] for t in g['items'])


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


@check
async def check_keyboard_nav(browser):
    for path in ['/', '/en/projects']:
        ctx, page, _ = await open_page(browser, path, viewport=(390, 844))
        await page.focus('.nav-toggle')
        await page.keyboard.press('Enter')
        await page.wait_for_selector('#mobile-menu.is-open')
        assert await page.evaluate("!!document.activeElement.closest('#mobile-menu')"), f'{path} focus not in menu'
        await page.keyboard.press('Escape')
        await page.wait_for_selector('#mobile-menu:not(.is-open)', state='attached')
        assert await page.evaluate("document.activeElement.classList.contains('nav-toggle')"), f'{path} focus not back'
        assert await page.get_attribute('.nav-toggle', 'aria-expanded') == 'false'
        await ctx.close()
    ctx, page, _ = await open_page(browser, '/', viewport=(1280, 800))
    await page.keyboard.press('Tab')
    assert await page.evaluate("document.activeElement.classList.contains('skip-link')"), 'first tab not skip link'
    assert await page.locator('main#main').count() == 1
    links = await page.eval_on_selector_all('.header__controls .lang a', 'as => as.map(a => [a.getAttribute("href"), a.getAttribute("aria-current")])')
    assert links == [['/', 'true'], ['/en', None]], links
    await ctx.close()


@check
async def check_theme_switch(browser):
    ctx, page, _ = await open_page(browser, '/', color_scheme='light')
    assert await page.get_attribute('html', 'data-theme') == 'light', 'auto follows OS light'
    await page.emulate_media(color_scheme='dark')
    await page.wait_for_function("document.documentElement.dataset.theme === 'dark'")
    await page.click('.header .switch__opt:has-text("Claro")')
    assert await page.get_attribute('html', 'data-theme') == 'light'
    await page.reload()
    assert await page.get_attribute('html', 'data-theme') == 'light', 'manual choice remembered'
    await ctx.close()
    # storage blocked: page still renders in auto, no errors
    ctx = await browser.new_context(color_scheme='dark')
    await ctx.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('denied')}})")
    page = await ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.goto(BASE + '/')
    await page.click('.header .switch__opt:has-text("Claro")')
    theme = await page.get_attribute('html', 'data-theme')
    await ctx.close()
    assert theme == 'light' and not errors, (theme, errors)


@check
async def check_hero(browser):
    for path in ['/', '/en']:
        copy = copy_for(path)
        ctx, page, _ = await open_page(browser, path)
        assert (await page.inner_text('h1')).strip() == copy['heroTitle'], f'{path} h1'
        assert await page.locator('svg.hero-schema[aria-hidden=true] .schema-node').count() == 5, f'{path} nodes'
        readout = await page.inner_text('.readout')
        n = f"{len(copy['projects']):02d}"
        assert 'Évora' in readout and '10+' in readout and n in readout, f'{path} readout {readout!r}'
        assert copy['locationNote'] in readout and copy['readout']['projectsNote'] in readout, f'{path} readout notes'
        labels = await page.eval_on_selector_all('.readout dt', 'ds => ds.map(d => d.textContent.trim())')
        r = copy['readout']
        assert labels == [r['years'], r['projects'], r['sectors'], r['base'], r['time']], f'{path} order {labels}'
        assert all(x in readout for x in r['sectorsList']) and 'v2.0' not in readout, f'{path} sectors'
        await page.wait_for_timeout(1500)
        clock = (await page.inner_text('.readout time')).strip()
        assert __import__('re').fullmatch(r'\d{2}:\d{2}:\d{2}', clock), f'{path} clock {clock!r}'
        assert 'open to work' not in readout.lower() and 'disponível' not in readout.lower()
        await ctx.close()


@check
async def check_sections(browser):
    for path in ['/', '/en']:
        copy = copy_for(path)
        ctx, page, _ = await open_page(browser, path)
        assert await page.locator('#about .pillars > li').count() == 3, f'{path} pillars'
        assert await page.locator('#notes li').count() == 4, f'{path} notes'
        assert await page.locator('#toolbox h3').count() == len(copy['toolbox']), f'{path} toolbox groups'
        assert 'Oracle Forms' in tools_text(copy) and 'Maven' in tools_text(copy), f'{path} CV tools missing'
        tools = await page.eval_on_selector_all('#toolbox .toolbox__list li', 'ls => ls.map(l => l.textContent.trim())')
        assert tools == [t for g in copy['toolbox'] for t in g['items']], f'{path} tools {tools}'
        assert await page.locator('#notes [tabindex="0"]').count() == 1, f'{path} focusable note'
        await ctx.close()
    ctx, page, _ = await open_page(browser, '/', reduced_motion='reduce')
    anim = await page.eval_on_selector('.marquee__track', 'e => getComputedStyle(e).animationName')
    await ctx.close()
    assert anim == 'none', f'reduced motion marquee {anim}'


@check
async def check_projects(browser):
    for path in PAGES:
        copy = copy_for(path)
        ctx, page, _ = await open_page(browser, path)
        cols = await page.eval_on_selector_all(
            '.showcase__col', 'cs => cs.map(c => [...c.querySelectorAll(".work-card__index")].map(i => i.textContent.trim()))')
        per = [sum(p['type'] == t for p in copy['projects']) for t in ('professional', 'personal')]
        if path in ('/', '/en'):
            per = [min(2, n) for n in per]
        assert cols == [[f'{i + 1:02d}' for i in range(n)] for n in per], f'{path} columns {cols}'
        imgs = await page.eval_on_selector_all('.work-card img', 'is => is.map(i => [i.alt, i.getAttribute("width"), i.getAttribute("height")])')
        assert all(a.strip() and w and h for a, w, h in imgs), f'{path} imgs {imgs}'
        rels = await page.eval_on_selector_all('.work-card a[target=_blank]', 'as => as.map(a => a.rel)')
        assert rels and all('noopener' in r for r in rels), f'{path} rels {rels}'
        assert await page.locator('.work-card', has_text=copy['privateWork']).count() >= 1, f'{path} private'
        if path in ('/', '/en'):
            more = await page.get_attribute('.projects__more a', 'href')
            assert more == ('/projects' if path == '/' else '/en/projects'), more
        else:
            assert (await page.inner_text('h1')).strip() == copy['galleryTitle']
        await ctx.close()


@check
async def check_timeline(browser):
    for path in ['/', '/en']:
        n = len(copy_for(path)['timeline'])
        ctx, page, _ = await open_page(browser, path)
        badges = await page.eval_on_selector_all('#experience .timeline > li .timeline__badge', 'bs => bs.map(b => b.textContent.trim())')
        await ctx.close()
        assert badges == [f'{i + 1:02d}' for i in range(n)], f'{path} {badges}'


async def fill_form(page):
    await page.fill('#contact input[name=name]', 'Ana Test')
    await page.fill('#contact input[name=email]', 'ana@example.com')
    await page.fill('#contact textarea[name=message]', 'Hello there')


@check
async def check_form_states(browser):
    copy = copy_for('/en')
    ctx, page, _ = await open_page(browser, '/en')
    hits, status = [], {'code': 500}

    async def handle(route):
        hits.append(route.request.post_data_json)
        await asyncio.sleep(0.3)
        body = '{"success":"true"}' if status['code'] == 200 else '{}'
        await route.fulfill(status=status['code'], body=body, content_type='application/json')

    await page.route('https://formsubmit.co/**', handle)
    await fill_form(page)
    submit = page.locator('#contact button[type=submit]')
    await submit.dblclick()
    await page.wait_for_selector(f'#contact .form__status:has-text("{copy["sendFail"]}")')
    assert len(hits) == 1, f'{len(hits)} requests on double click'
    assert hits[0]['email'] == 'ana@example.com' and hits[0]['_captcha'] == 'false', hits[0]
    assert await submit.is_enabled(), 'button stays disabled after error'
    status['code'] = 200
    await submit.click()
    await page.wait_for_selector(f'#contact .form__status:has-text("{copy["sentThanks"]}")')
    assert await submit.is_disabled(), 'button enabled after success'
    await ctx.close()
    # honeypot filled: nothing sent
    ctx, page, _ = await open_page(browser, '/en')
    hits.clear()
    await page.route('https://formsubmit.co/**', handle)
    await fill_form(page)
    await page.evaluate("document.querySelector('#contact input[name=_honey]').value = 'bot'")
    await page.click('#contact button[type=submit]')
    await page.wait_for_timeout(500)
    await ctx.close()
    assert hits == [], 'honeypot sent a request'
    # contact strip
    ctx, page, _ = await open_page(browser, '/')
    strip = await page.inner_text('#contact .contact-strip')
    await ctx.close()
    assert 'jbernardopinheiro@gmail.com' in strip and 'Évora' in strip, strip
    assert locale_json('pt-PT')['locationNote'] in strip, strip


VISIBLE_SEL = '.reveal, article, .timeline__body, .hero__title, .schema-label'


@check
async def check_no_js_visible(browser):
    ctx, page, _ = await open_page(browser, '/', java_script_enabled=False)
    hidden = await page.eval_on_selector_all(VISIBLE_SEL, 'es => es.filter(e => getComputedStyle(e).opacity !== "1").length')
    await ctx.close()
    assert hidden == 0, f'{hidden} elements hidden without JS'


@check
async def check_reduced_motion(browser):
    ctx, page, _ = await open_page(browser, '/', reduced_motion='reduce')
    await page.wait_for_timeout(1500)
    assert not await page.evaluate("document.documentElement.classList.contains('motion')"), 'motion class set'
    assert await page.eval_on_selector('.schema-pulse', 'e => getComputedStyle(e).opacity') == '0'
    offs = await page.eval_on_selector_all('.schema-route', 'rs => rs.map(r => parseFloat(getComputedStyle(r).strokeDashoffset))')
    hidden = await page.eval_on_selector_all(VISIBLE_SEL, 'es => es.filter(e => getComputedStyle(e).opacity !== "1").length')
    await ctx.close()
    assert all(o == 0 for o in offs), offs
    assert hidden == 0, f'{hidden} hidden with reduced motion'


@check
async def check_motion_runs(browser):
    ctx, page, errors = await open_page(browser, '/')
    await page.wait_for_timeout(2500)
    assert await page.evaluate("document.documentElement.classList.contains('motion')"), 'no motion class'
    labels = await page.eval_on_selector_all('.schema-label', 'ls => ls.map(l => getComputedStyle(l).opacity)')
    assert labels == ['1'] * 5, labels
    await page.wait_for_function(
        "parseFloat(getComputedStyle(document.querySelector('.schema-pulse')).opacity) > 0", timeout=6000)
    await page.evaluate("document.querySelector('#experience').scrollIntoView({behavior: 'instant'})")
    await page.wait_for_timeout(1200)
    lit = await page.locator('.timeline__badge.is-lit').count()
    await page.evaluate("document.querySelector('#contact').scrollIntoView({behavior: 'instant'})")
    await page.wait_for_timeout(800)
    hidden = await page.eval_on_selector_all('#contact .reveal', 'es => es.filter(e => getComputedStyle(e).opacity !== "1").length')
    await ctx.close()
    assert lit >= 1, 'no timeline badge lit after scrolling'
    assert hidden == 0, f'{hidden} contact reveals still hidden'
    assert not errors, errors


@check
async def check_no_overflow(browser):
    bad = []
    for path in PAGES:
        for scheme in ['dark', 'light']:
            ctx, page, _ = await open_page(browser, path, viewport=(360, 740), color_scheme=scheme)
            await page.wait_for_timeout(300)
            sw = await page.evaluate('document.documentElement.scrollWidth')
            wide = await page.evaluate("""() => [...document.querySelectorAll('main *, header *, footer *')]
                .filter(e => { const r = e.getBoundingClientRect(); return r.right > 361 && getComputedStyle(e).position !== 'fixed'
                  && !e.closest('[aria-hidden=true], .marquee, .sr-only'); })
                .slice(0, 3).map(e => e.className || e.tagName)""")
            await ctx.close()
            if sw > 360 or wide:
                bad.append((path, scheme, sw, wide))
    assert not bad, bad


@check
async def check_schema_grid_persists(browser):
    """The schematic's grid must stay visible after scrolling away and back."""
    ctx, page, _ = await open_page(browser, '/')
    await page.wait_for_timeout(2000)  # draw finished
    grid_opacity = """() => { let e = document.querySelector('.schema-grid'), o = 1;
        for (; e && e.tagName !== 'svg'; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
        return o; }"""
    before = await page.evaluate(grid_opacity)
    for y in (200, 600, 0):
        await page.mouse.wheel(0, y - await page.evaluate('scrollY'))
        await page.wait_for_timeout(400)
    await page.evaluate('scrollTo(0, 0)')
    await page.wait_for_timeout(600)
    after = await page.evaluate(grid_opacity)
    await ctx.close()
    assert before > 0.95 and after > 0.95, f'grid opacity before={before:.2f} after scroll={after:.2f}'


@check
async def check_training(browser):
    for path in ['/', '/en']:
        copy = copy_for(path)
        ctx, page, _ = await open_page(browser, path)
        order = await page.eval_on_selector_all('main > section[id]', 'ss => ss.map(s => s.id)')
        values = await page.eval_on_selector_all('#training .training__value', 'vs => vs.map(v => v.textContent.trim())')
        await ctx.close()
        assert order.index('training') == order.index('experience') + 1, order
        assert values == [t['value'] for t in copy['training']], values


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
