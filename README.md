# personal-page

Personal website built to showcase my work, skills, and projects.

Live site: [https://jose-pinheiro.pt/](https://jose-pinheiro.pt/)

Next.js (App Router, TypeScript) exported as a fully static site (`output: 'export'`).
No server code: Vercel serves the files in `out/`.

## Running it

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
npm test           # unit tests (lib/*.test.ts, Node's built-in runner)
python3 tools/check.py      # Playwright smoke checks against out/ (build first)
python3 tools/contrast.py   # WCAG contrast of the colour tokens, both themes
```

`tools/` needs Python 3 with `playwright` installed. It isn't deployed.

## Where things live

| Path | What it is |
| --- | --- |
| `locales/pt-PT.json`, `locales/en.json` | All copy. Same keys in both. Edit wording here, not in components. |
| `app/(pt)/…` | Portuguese routes: `/` and `/projects`. |
| `app/(en)/en/…` | English routes: `/en` and `/en/projects`. |
| `app/sitemap.ts`, `app/robots.ts` | Generated `sitemap.xml` and `robots.txt`. |
| `components/` | One file per section (Hero, About, Projects, Timeline, Toolbox, Notes, Contact) plus the header/footer chrome. |
| `lib/i18n.ts` | Loads copy, splits projects into columns, builds URLs, contact links. Email and social links live here. |
| `lib/seo.ts` | Per-page metadata (canonical, hreflang, Open Graph) and JSON-LD. |
| `lib/theme.ts` | Auto / Light / Dark logic and the no-flash head script. |
| `lib/motion/` | Hero schematic animation, timeline scroll drawing, section reveals. |
| `styles/tokens.css` | Design tokens. Dark is the default; light overrides the same names. |
| `public/images/` | Project images (WebP, about 1280px wide; cards show them at 640×400), favicons, `og.png`. |
| `vercel.json` | Clean URLs and redirects from the old `?lang=` and `.html` links. |

## Content notes

- Projects sit in two columns, professional left and personal right, in file
  order. Home shows the first 2 of each; `/projects` shows all. Each project
  needs `"type"`, `areas` (shown as stack pills, split on ` · `) and a one-sentence `alt`.
- The experience timeline renders every entry in `timeline`, numbered in order.
- The readout strip's "10+" comes from `readout.yearsValue`; the project count is
  counted from `projects`.
- The contact form posts to [FormSubmit](https://formsubmit.co/). The first
  submission from a new address needs the activation email confirmed.

## Theme and motion

- The theme follows the OS (`prefers-color-scheme`) and switches live; a manual
  Light or Dark choice is stored in `localStorage` under `jose-theme`.
- With `prefers-reduced-motion`, everything is shown static. If JavaScript or
  GSAP fails, the page still shows everything.

## Deploying

Hosted on Vercel; pushing to `main` deploys it.
