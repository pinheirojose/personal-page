# personal-page

Personal portfolio of José Pinheiro, software engineer.

A lightweight static site with three sections — intro, projects, and contact. No framework or build step by design.

## Tech stack

- HTML5
- CSS3 (custom properties)
- Vanilla JavaScript
- [Font Awesome](https://fontawesome.com/) (icons)
- [Google Fonts](https://fonts.google.com/) (Poppins)

## Project structure

```
personal-page/
├── index.html      # Single-page markup
├── style.css       # Styles and theme tokens
├── script.js       # Nav scroll, hamburger menu, scroll spy
├── images/         # Favicon and local assets
├── vercel.json     # Optional Vercel cache headers
├── netlify.toml    # Optional Netlify publish config
└── README.md
```

## Local development

Open the file directly:

```bash
open index.html
```

Or serve the folder locally (recommended):

```bash
npx serve .
```

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000` (or the port shown by `serve`).

## Deployment

This is a static site — no build command required. Publish the repository root (`.`).

### Vercel

1. Import the GitHub repository at [vercel.com](https://vercel.com).
2. Set **Root Directory** to `.`
3. Leave **Build Command** empty.
4. Set **Output Directory** to `.`
5. Deploy.

Optional cache headers are defined in [`vercel.json`](vercel.json).

### Netlify

1. Import the GitHub repository at [netlify.com](https://netlify.com).
2. Set **Publish directory** to `.`
3. Leave **Build command** empty.
4. Deploy.

Publish settings are also in [`netlify.toml`](netlify.toml).

## Customization

| What to change | Where |
|----------------|-------|
| Name, bio, role | `#home .intro` in `index.html` |
| Project cards | `.card` blocks in `index.html` |
| Social links | `.social-media` anchors (Home and Contact) |
| Colors and fonts | `:root` in `style.css` |
| Hero background | `#home .filter` in `style.css` (or `images/hero.jpg`) |
| Page title and SEO | `<head>` in `index.html` |

## License

All rights reserved.

## Author

[José Pinheiro](https://github.com/pinheirojose)
