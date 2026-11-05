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
    try:
        await page.wait_for_function("document.querySelector('#dc-root h1')?.textContent.trim().length > 0")
    except Exception:
        state = await page.evaluate("({react: !!window.React, dom: !!window.ReactDOM, i18n: !!window.__I18N__,"
                                    " scripts: [...document.scripts].map(s => s.src.split('/').pop())})")
        raise AssertionError(f'{path} never rendered: {state} console={errors[:5]}')
    await page.evaluate('document.fonts.ready')  # web fonts shift layout when they land
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


async def html_lang(browser, path='/', **kw):
    ctx, page, _ = await open_page(browser, path, **kw)
    lang = await page.evaluate('document.documentElement.lang')
    await ctx.close()
    return lang


@check
async def check_lang_browser_en(browser):
    assert await html_lang(browser, locale='en-GB') == 'en'


@check
async def check_lang_browser_pt(browser):
    assert await html_lang(browser, locale='pt-PT') == 'pt-PT'


@check
async def check_lang_param_wins(browser):
    assert await html_lang(browser, '/?lang=en', locale='pt-PT') == 'en'
    assert await html_lang(browser, '/?lang=pt', locale='en-GB', lang='en') == 'pt-PT'


@check
async def check_lang_stored_wins(browser):
    assert await html_lang(browser, locale='en-GB', lang='pt-PT') == 'pt-PT'


@check
async def check_lang_param_survives_navigation(browser):
    ctx, page, _ = await open_page(browser, '/?lang=en', locale='pt-PT')
    await page.click('.projects__more a')
    await page.wait_for_url('**/projects.html')
    await page.wait_for_function("document.querySelector('#dc-root h1')?.textContent.trim().length > 0")
    lang = await page.evaluate('document.documentElement.lang')
    await ctx.close()
    assert lang == 'en', lang


@check
async def check_lang_param_invalid_ignored(browser):
    assert await html_lang(browser, '/?lang=fr', locale='en-GB') == 'en'
    assert await html_lang(browser, '/?lang=', locale='pt-PT') == 'pt-PT'


@check
async def check_lang_switch_keeps_hash_and_params(browser):
    ctx, page, _ = await open_page(browser, '/?utm_source=x#projects', locale='pt-PT')
    await page.click('.lang__btn:has-text("EN")')
    await page.wait_for_function("document.documentElement.lang === 'en'")
    url = page.url
    await ctx.close()
    assert url == BASE + '/?utm_source=x&lang=en#projects', url


@check
async def check_hreflang_links(browser):
    for path in PAGES:
        ctx, page, _ = await open_page(browser, path)
        links = await page.eval_on_selector_all(
            'link[rel=alternate][hreflang]', 'ls => Object.fromEntries(ls.map(l => [l.hreflang, l.href]))')
        await ctx.close()
        want = {'pt-PT': PAGE_URL[path] + '?lang=pt', 'en': PAGE_URL[path] + '?lang=en', 'x-default': PAGE_URL[path]}
        assert links == want, f'{path}: {links}'


ACCENT_TEXT = 'rgb(168, 75, 43)'  # --accent-text #A84B2B


@check
async def check_accent_text_applied(browser):
    ctx, page, _ = await open_page(browser, '/', lang='en')
    css = lambda sel, prop: page.eval_on_selector(sel, f'e => getComputedStyle(e).{prop}')
    for sel in ['.eyebrow--accent', '.work-card__cta', '.header__cta']:
        assert await css(sel, 'color') == ACCENT_TEXT, f'{sel} {await css(sel, "color")}'
    base_a = await page.evaluate("""() => { const a = document.createElement('a'); a.href = '#';
        document.querySelector('main').append(a); return getComputedStyle(a).color; }""")
    assert base_a == ACCENT_TEXT, f'a {base_a}'
    assert await css('.mark', 'color') == 'rgb(198, 93, 58)', '.mark keeps --accent'
    delivery = page.locator('.hero__visual text', has_text='DELIVERY')
    assert await delivery.get_attribute('fill') == '#5A6854'
    assert await delivery.get_attribute('font-weight') is None
    await ctx.close()


@check
async def check_note_aside_focusable(browser):
    ctx, page, _ = await open_page(browser, '/', lang='en')
    notes = page.locator('.note[tabindex="0"]')
    assert await notes.count() == 1, f'{await notes.count()} focusable notes'
    aside = notes.locator('.note__aside')
    assert await aside.evaluate('e => getComputedStyle(e).opacity') == '0', 'aside hidden before focus'
    await notes.focus()
    await page.keyboard.press('Shift+Tab')  # bring keyboard modality so :focus-visible applies
    await page.keyboard.press('Tab')
    await page.wait_for_timeout(500)
    assert await page.evaluate("document.activeElement.classList.contains('note--interactive')")
    assert await aside.evaluate('e => getComputedStyle(e).opacity') == '1', 'aside visible on focus'
    await ctx.close()
    ctx, page, _ = await open_page(browser, '/', lang='en', has_touch=True, is_mobile=True, viewport=(390, 844))
    op = await page.locator('.note--interactive .note__aside').evaluate('e => getComputedStyle(e).opacity')
    await ctx.close()
    assert op == '1', f'touch: aside opacity {op}'


@check
async def check_field_focus_no_shift(browser):
    ctx, page, _ = await open_page(browser, '/', lang='en')
    field = page.locator('.field input[name=name]')
    # Layout, not viewport position: focusing scrolls the page.
    layout = "e => [e.offsetHeight, e.closest('.field').nextElementSibling.offsetTop]"
    before = await field.evaluate(layout)
    border0 = await field.evaluate('e => getComputedStyle(e).borderBottomColor')
    await field.focus()
    await page.wait_for_timeout(100)
    after = await field.evaluate(layout)
    style = await field.evaluate('e => { const s = getComputedStyle(e); return [s.borderBottomWidth, s.borderBottomColor]; }')
    await ctx.close()
    assert border0 == 'rgb(138, 134, 126)', f'rest border {border0}'  # --rule-strong
    assert style == ['2px', ACCENT_TEXT], style
    assert before == after, (before, after)


VAGUE_TOOLS = ['APIs', 'Deployment', 'Publicação', 'Web technologies', 'Tecnologias web',
               'Cloud platforms', 'Plataformas cloud', 'Integration tools', 'Ferramentas de integração']


@check
async def check_content_fixes(browser):
    for tag in ['pt-PT', 'en']:
        data = locale_json(tag)
        raw = json.dumps(data, ensure_ascii=False)
        assert 'PLACEHOLDER' not in raw and 'ESPAÇO RESERVADO' not in raw, f'{tag} placeholder caption'
        for group in data['toolbox']:
            assert 4 <= len(group['items']) <= 6, f'{tag} {group["label"]} has {len(group["items"])}'
            assert not set(group['items']) & set(VAGUE_TOOLS), f'{tag} vague: {group["items"]}'
        items = {i for g in data['toolbox'] for i in g['items']}
        assert {'Linux', 'TypeScript', 'MySQL'} <= items, f'{tag} missing tools'
        personal = next(p for p in data['projects'] if p['image'].endswith(('personal-page.png', 'personal-page.webp')))
        assert personal['url'] == 'https://github.com/pinheirojose/personal-page', personal['url']
    assert locale_json('pt-PT')['footerRole'] == 'ENGENHEIRO DE SOFTWARE · LÍDER TÉCNICO'
    assert locale_json('en')['footerRole'] == 'SOFTWARE ENGINEER · TECH LEAD'
    assert 'Está a olhar para ela' in json.dumps(locale_json('pt-PT'), ensure_ascii=False)
    for path in PAGES:
        for lang in ['pt-PT', 'en']:
            ctx, page, _ = await open_page(browser, path, lang=lang)
            alts = await page.eval_on_selector_all('#dc-root .work-card img', 'is => is.map(i => i.alt)')
            await ctx.close()
            assert alts and all(a.strip() and '/' not in a for a in alts), f'{path} {lang}: {alts}'


PRELOADS = {
    './script.js': 'script',
    './vendor/react.production.min.js': 'script',
    './vendor/react-dom.production.min.js': 'script',
    './page.js': 'fetch',
    './locales/pt-PT.json': 'fetch',
    './locales/en.json': 'fetch',
}


@check
async def check_perf_loading(browser):
    assert 'no-store' not in (ROOT / 'boot.js').read_text(), 'boot.js still uses no-store'
    for tag in ['pt-PT', 'en']:
        for p in locale_json(tag)['projects']:
            assert p['image'].endswith('.webp') and (ROOT / p['image']).exists(), p['image']
    assert not list((ROOT / 'images').glob('*.png')) or {f.name for f in (ROOT / 'images').glob('*.png')} <= {
        'favicon.png', 'og.png', 'apple-touch-icon.png'}, 'leftover project PNGs'
    for path in PAGES:
        ctx = await browser.new_context(locale='en-GB', viewport={'width': 1440, 'height': 900})
        page = await ctx.new_page()
        urls, warnings = [], []
        page.on('request', lambda r: urls.append(r.url))
        page.on('console', lambda m: warnings.append(m.text) if m.type in ('warning', 'error') else None)
        await page.goto(BASE + path)
        await page.wait_for_function("document.querySelector('#dc-root h1')?.textContent.trim().length > 0")
        links = await page.eval_on_selector_all('link[rel=preload]', 'ls => ls.map(l => [l.getAttribute("href"), l.as, l.crossOrigin])')
        await page.wait_for_timeout(3500)  # Chrome reports unused preloads after ~3s
        await ctx.close()
        got = {h: a for h, a, _ in links}
        assert got == PRELOADS, f'{path} preloads {got}'
        assert all(c == 'anonymous' for h, a, c in links if a == 'fetch'), f'{path} fetch preloads need crossorigin'
        assert not [u for u in urls if 'unpkg.com' in u], f'{path} still hits unpkg'
        assert not [w for w in warnings if 'preload' in w.lower()], f'{path}: {warnings}'


COLUMN_INDEXES = """() => [...document.querySelectorAll('#dc-root .showcase__col')]
    .map(c => [...c.querySelectorAll('.work-card__index')].map(i => i.textContent.trim()))"""


@check
async def check_no_card_badges(browser):
    for path in PAGES:
        ctx, page, _ = await open_page(browser, path, lang='en')
        n = await page.locator('#dc-root .work-card .badge').count()
        dots = await page.locator('#dc-root .col-head .badge__dot').count()
        await ctx.close()
        assert n == 0 and dots == 2, f'{path}: {n} badges, {dots} column dots'


@check
async def check_column_numbering(browser):
    ctx, page, _ = await open_page(browser, '/', lang='en')
    home = await page.evaluate(COLUMN_INDEXES)
    await page.click('.lang__btn:has-text("PT")')
    await page.wait_for_function("document.documentElement.lang === 'pt-PT'")
    home_pt = await page.evaluate(COLUMN_INDEXES)
    await ctx.close()
    assert home == [['01', '02'], ['01', '02']] == home_pt, (home, home_pt)
    ctx, page, _ = await open_page(browser, '/projects.html', lang='en')
    gallery = await page.evaluate(COLUMN_INDEXES)
    await ctx.close()
    for col in gallery:
        assert col == [f'{i + 1:02d}' for i in range(len(col))], gallery
    assert all('number' not in p for t in ['pt-PT', 'en'] for p in locale_json(t)['projects']), 'locales still have number'


@check
async def check_hero_visual_hidden_mobile(browser):
    for (w, h), want in [((390, 844), False), ((1440, 900), True)]:
        ctx, page, _ = await open_page(browser, '/', lang='en', viewport=(w, h))
        visible = await page.locator('#dc-root .hero__visual').is_visible()
        await ctx.close()
        assert visible == want, f'{w}px hero visual visible={visible}'


@check
async def check_no_contact_cta(browser):
    ctx, page, _ = await open_page(browser, '/', lang='en')
    n = await page.locator('#dc-root .contact-cta').count()
    await ctx.close()
    assert n == 0, f'{n} contact CTAs'


@check
async def check_menu_focus(browser):
    ctx, page, _ = await open_page(browser, '/', lang='en', viewport=(390, 844))
    await page.click('.nav-toggle')
    await page.wait_for_selector('#mobile-menu.is-open')
    on_open = await page.evaluate("document.activeElement === document.querySelector('#mobile-menu a')")
    await page.keyboard.press('Escape')
    await page.wait_for_selector('#mobile-menu:not(.is-open)', state='attached')
    on_close = await page.evaluate("document.activeElement?.classList.contains('nav-toggle')")
    await ctx.close()
    assert on_open, 'focus not on first drawer link after opening'
    assert on_close, 'focus not back on .nav-toggle after Escape'


@check
async def check_escape_closed_menu_keeps_focus(browser):
    ctx, page, _ = await open_page(browser, '/', lang='en', viewport=(390, 844))
    await page.focus('#dc-root .hero__actions a')
    await page.keyboard.press('Escape')
    await page.wait_for_timeout(100)
    still = await page.evaluate("document.activeElement === document.querySelector('#dc-root .hero__actions a')")
    await ctx.close()
    assert still, 'Escape with the menu closed moved focus'


@check
async def check_lang_buttons_36(browser):
    for w, h in [(1440, 900), (390, 844)]:
        ctx, page, _ = await open_page(browser, '/', lang='en', viewport=(w, h))
        heights = await page.eval_on_selector_all('#dc-root .lang__btn', 'bs => bs.map(b => b.getBoundingClientRect().height)')
        await ctx.close()
        assert all(x >= 36 for x in heights), f'{w}px lang buttons {heights}'


@check
async def check_header_height_unchanged(browser):
    # Heights before Phase 6: the 38px pill sets desktop, the 40px menu toggle sets mobile.
    for (w, h), want in [((1440, 900), 67), ((390, 844), 69)]:
        ctx, page, _ = await open_page(browser, '/', lang='en', viewport=(w, h))
        hh = await page.evaluate("document.querySelector('#dc-root .header').getBoundingClientRect().height")
        await ctx.close()
        assert hh == want, f'{w}px header {hh}, want {want}'


async def scroll_through(page):
    """Scroll top → bottom so reveals and lazy images fire, then wait for images."""
    height = await page.evaluate('document.documentElement.scrollHeight')
    for y in range(0, height, 500):
        await page.evaluate(f'scrollTo(0, {y})')
        await page.wait_for_timeout(60)
    await page.wait_for_timeout(900)
    await page.wait_for_function("[...document.querySelectorAll('#dc-root img')].every(i => i.complete && i.naturalWidth > 0)")


@check
async def check_final_matrix(browser):
    out = ROOT / 'tmp-audit'
    out.mkdir(exist_ok=True)
    for path in PAGES:
        for lang in ['pt-PT', 'en']:
            for w, h in [(1440, 900), (390, 844)]:
                label = f'{path.strip("/").removesuffix(".html") or "index"}-{lang}-{w}'
                ctx, page, errors = await open_page(browser, path, lang=lang, viewport=(w, h))
                form_posts = []
                await page.route('**/formsubmit.co/**', lambda r: (form_posts.append(r.request.url), r.abort()))
                await scroll_through(page)
                overflow = await page.evaluate('document.documentElement.scrollWidth - innerWidth')
                assert overflow <= 0, f'{label}: horizontal scroll {overflow}px'

                # back-to-top: visible after scrolling, returns to the top
                top = page.locator('#dc-root .to-top')
                await page.wait_for_selector('#dc-root .to-top.is-visible')
                await top.click()
                try:
                    await page.wait_for_function('scrollY < 5', timeout=5000)
                except Exception:
                    raise AssertionError(f'{label}: back-to-top left scrollY at {await page.evaluate("scrollY")}')

                # contact form: empty submit sends nothing and flags the fields
                if path == '/':
                    await page.locator('#dc-root .form button[type=submit]').click()
                    await page.wait_for_timeout(200)
                    invalid = await page.eval_on_selector_all('#dc-root .form :invalid', 'es => es.map(e => e.name)')
                    assert set(invalid) >= {'name', 'email', 'message'}, f'{label} invalid {invalid}'
                    assert not form_posts, f'{label}: empty form posted'

                # mobile menu opens and closes
                if w < 720:
                    await page.click('.nav-toggle')
                    assert await page.locator('#mobile-menu').is_visible(), f'{label} menu did not open'
                    await page.click('.nav-toggle')
                    assert not await page.locator('#mobile-menu').is_visible(), f'{label} menu did not close'

                # Full-page shots resize the viewport, which makes ScrollTrigger refresh
                # (save scroll → 0 → restore); taken last so it can't undo the back-to-top scroll.
                await page.evaluate('scrollTo(0, 0)')
                await page.screenshot(path=str(out / f'{label}.png'), full_page=True)

                # language toggle flips the page
                other = 'EN' if lang == 'pt-PT' else 'PT'
                await page.click(f'.lang__btn:has-text("{other}")')
                want = 'en' if other == 'EN' else 'pt-PT'
                await page.wait_for_function(f"document.documentElement.lang === '{want}'")
                await page.wait_for_timeout(300)
                await ctx.close()
                assert not errors, f'{label}: console errors {errors}'


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
