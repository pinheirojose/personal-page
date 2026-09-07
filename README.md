# personal-page

Personal website built to showcase my work, skills, and projects.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page markup and the logic that drives it. |
| `style.css` | All styling. Design tokens are custom properties on `:root`. |
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
- `<script data-dc-script>` — page content as plain arrays (`PROJECTS`,
  `TIMELINE`, `TOOLBOX`, …) plus the `Component` class holding the small amount
  of state the page needs.

To change content, edit the arrays at the top of the script rather than the
markup. Styling is class-based, so the markup carries almost no inline styles.

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
