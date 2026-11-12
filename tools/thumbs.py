"""Make the 800×500 card variant (<name>-800.webp) of every project image.

    python3 tools/thumbs.py

Cards use srcset with the original (1280px) and this variant, so phones download
far fewer bytes. Re-run after adding or replacing a project image.
"""
import json
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
images = {p['image'] for p in json.loads((ROOT / 'locales/en.json').read_text())['projects']}
for rel in sorted(images):
    src = ROOT / 'public' / rel.lstrip('./')
    dst = src.with_name(src.stem + '-800.webp')
    with Image.open(src) as im:
        # Centre-crop to the card's 16:10 frame, the same crop object-fit: cover shows.
        w, h = im.size
        ch = min(h, round(w * 10 / 16))
        cw = min(w, round(ch * 16 / 10))
        box = ((w - cw) // 2, (h - ch) // 2, (w - cw) // 2 + cw, (h - ch) // 2 + ch)
        im.convert('RGB').crop(box).resize((800, 500), Image.LANCZOS).save(dst, 'WEBP', quality=78, method=6)
    print(f'{dst.name}: {dst.stat().st_size // 1024} KB')
