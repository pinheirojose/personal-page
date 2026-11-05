"""WCAG contrast of every text colour token against the page backgrounds.

    python3 tools/contrast.py

Reads :root from style.css, prints a table, exits 1 if any pair is below 4.5:1.
"""
import pathlib
import re
import sys

CSS = pathlib.Path(__file__).resolve().parent.parent / 'style.css'
TEXT = ['--ink', '--ink-muted', '--ink-faint', '--sage', '--accent-text']
BACKGROUNDS = ['--bg', '--bg-sunken']
# Extra (text, background) pairs: the accent button's small label.
PAIRS = [('--bg', '--accent-text')]
MIN = 4.5


def luminance(hex_):
    rgb = [int(hex_.lstrip('#')[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a, b):
    hi, lo = sorted([luminance(a), luminance(b)], reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def main():
    root = re.search(r':root\s*{(.*?)}', CSS.read_text(), re.S).group(1)
    tokens = dict(re.findall(r'(--[\w-]+):\s*(#[0-9A-Fa-f]{6})\s*;', root))
    pairs = [(t, b) for t in TEXT for b in BACKGROUNDS] + PAIRS
    failed = 0
    print(f'{"text":14} {"background":14} {"ratio":>6}')
    for text, bg in pairs:
        if text not in tokens or bg not in tokens:
            print(f'{text:14} {bg:14} {"missing":>6}  FAIL')
            failed += 1
            continue
        r = ratio(tokens[text], tokens[bg])
        ok = r >= MIN
        failed += not ok
        print(f'{text:14} {bg:14} {r:6.2f}  {"ok" if ok else "FAIL"}')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
