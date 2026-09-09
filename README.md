# personal-page

Personal website built to showcase my work, skills, and projects.

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

## Before going live

- Replace the placeholder contact details (`EMAIL`, `SOCIAL` in the script).
- Point each project's `href` at something real, and swap the striped
  `.project__media` placeholders for actual imagery.
- Wire the contact form to a real endpoint — `submit` currently only
  acknowledges the message locally, nothing is delivered.
- Fill in the real employer names in `TIMELINE` (currently "Company").
