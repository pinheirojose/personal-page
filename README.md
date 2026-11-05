# personal-page

Personal website built to showcase my work, skills, and projects.

Live site: [https://josepinheiro.vercel.app/](https://josepinheiro.vercel.app/)

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page markup. |
| `style.css` | All styling. Design tokens are custom properties on `:root`. |
| `locales/pt-PT.json` | Portuguese copy (default). |
| `locales/en.json` | English copy. |
| `boot.js` | Loads locale files and `page.js`, then starts the runtime. |
| `page.js` | Page behaviour (`Component`). |
| `script.js` | Generated `dc-runtime` bundle. Do not edit by hand. |

## Running it

The page needs to be served over HTTP (the runtime pulls React from a CDN), so
opening the file directly with `file://` will not work:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## How `index.html` is put together

- `<head>` — metadata, Google Fonts and `style.css`.
- `<x-dc>` — the template. `sc-for` loops render the repeated sections and
  `sc-if` gates the hero illustration and contact form.
- `locales/*.json` — all user-facing copy, keyed by BCP 47 language tag
  (`pt-PT`, `en`).
- `boot.js` — fetches those catalogs onto `window.__I18N__`, then loads
  `page.js` into `<script data-dc-script>` before `script.js` boots.
- `page.js` — behaviour only (`Component`). The runtime evals it as
  `class Component extends DCLogic` (it is not a normal browser script).

To change wording, edit the locale JSON rather than the markup. Styling is
class-based, so the markup carries almost no inline styles.

One runtime quirk: interpolated `{{ … }}` values render wrapped in an HTML
`<span>`, so they cannot be used inside an SVG `<text>` element — they come out
invisible.

## Deploying

The site is static (no build step) and is hosted on Vercel. Pushing to `main`
deploys it.

## Notes

- Contact details (`EMAIL`, `SOCIAL`) live at the top of `page.js`.
- The contact form posts to [FormSubmit](https://formsubmit.co/), which forwards
  messages to `EMAIL`. The first submission from a new address requires
  confirming the activation email FormSubmit sends.
- Projects, timeline and all other copy live in `locales/*.json`. Projects sit in two
  columns, professional on the left and personal on the right, in the order
  they appear in the file. The home page shows the first `HOME_PER_COLUMN` of
  each; `projects.html` shows all of them. Each project needs
  `"type": "personal"` or `"professional"` and a short `tags` list.
- Project images go in `images/`. Prefer WebP around 1600px wide; the cards
  display at 640×400.
