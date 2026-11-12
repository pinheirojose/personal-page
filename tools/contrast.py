"""WCAG contrast of every text token against the backgrounds, in both themes.

    python3 tools/contrast.py

Reads :root (dark) and :root[data-theme='light'] from styles/tokens.css,
prints a table, exits 1 if any pair is below 4.5:1.
"""
import pathlib
import re
import sys

CSS = pathlib.Path(__file__).resolve().parent.parent / 'styles' / 'tokens.css'
TEXT = ['--ink', '--ink-muted', '--accent']
BACKGROUNDS = ['--bg', '--surface', '--surface-2']
# Text sitting on a solid accent fill (lit timeline badge, hovered buttons).
PAIRS = [('--accent-ink', '--accent')]
MIN = 4.5


def luminance(hex_):
    rgb = [int(hex_.lstrip('#')[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a, b):
    hi, lo = sorted([luminance(a), luminance(b)], reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def block(css, selector):
    body = re.search(re.escape(selector) + r'\s*{(.*?)}', css, re.S).group(1)
    return dict(re.findall(r'(--[\w-]+):\s*(#[0-9A-Fa-f]{6})\s*;', body))


def main():
    css = CSS.read_text()
    themes = {'dark': block(css, ':root'), 'light': block(css, ":root[data-theme='light']")}
    pairs = [(t, b) for t in TEXT for b in BACKGROUNDS] + PAIRS
    failed = 0
    print(f'{"theme":6} {"text":12} {"background":12} {"ratio":>6}')
    for theme, tokens in themes.items():
        for text, bg in pairs:
            if text not in tokens or bg not in tokens:
                print(f'{theme:6} {text:12} {bg:12} {"missing":>6}  FAIL')
                failed += 1
                continue
            r = ratio(tokens[text], tokens[bg])
            ok = r >= MIN
            failed += not ok
            print(f'{theme:6} {text:12} {bg:12} {r:6.2f}  {"ok" if ok else "FAIL"}')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
