# Redesign prompt: jose-pinheiro.pt

Paste everything below the line into Claude Code, opened in `~/work/projects/personal-page`. This file and the reference screenshots are also in that folder under `docs/redesign/`.

---

You are redesigning my personal portfolio, live at https://jose-pinheiro.pt (Vercel). Treat this as a premium product launch, not a reskin. Work on a new branch `redesign` and do not push or deploy until I approve.

## Skills to use

Load and follow these, in this order, before writing code:

1. `superpowers:brainstorming` then `superpowers:writing-plans` to turn this brief into a plan I approve.
2. `ui-ux-pro-max` for the design system: tokens, type scale, spacing, components, light and dark themes.
3. `lemo-opuscar` for the visual direction and layout composition.
4. `emil-design-eng` (Emil Kowalski) plus `animation-vocabulary`, `improve-animations` and `transitions-dev` for every interaction and transition.
5. `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-react`, `gsap-performance` for scroll and hero motion.
6. `vercel:nextjs` and `vercel:react-best-practices` for the app.
7. Before you say you are done: `review-animations`, `animation-performance`, `design-review`, `break-ui` and `superpowers:verification-before-completion`.

## Who it is for

Both recruiters/companies hiring and freelance clients, equally. In 10 seconds a visitor should know what I do, see proof (projects), and find how to reach me. The site is a working sample of my standards: it must be fast, accessible and flawless on mobile.

## Direction

Modern, industrial, minimal, animated, premium. A mix of three flavors, in this priority:

1. **Technical drawing / blueprint (main).** Fine construction grid, registration and crop marks at section corners, coordinates and measurement ticks as quiet decoration, dimension lines, section numbers like `01 / ABOUT`.
2. **Hardware / instrument panel (second).** Monospace labels, small status indicators (a live "available for work" dot, local Lisbon time, build/version tag), readout-style metadata on cards (year, stack, role), toggles that feel like physical switches.
3. **Swiss / brutalist (accent only).** Big confident headlines, hard 1px rules, strict grid, generous whitespace. No raw-for-the-sake-of-raw ugliness.

## References

Screenshots are in `docs/redesign/references/`. Look at all four images before proposing anything. Take ideas from them; do not copy any of them.

- `01-codea-dark-red.png` (Codea): black canvas, one hot accent, a huge low-contrast ghost word behind the hero, numbered process timeline with accent number badges alternating left and right, dark cards with a small icon tile, accent glow at the bottom of the page.
- `02-sonali-light-minimal.png` (Sonali): the light-theme model. Off-white paper, slate ink, a thick short rule above a heavy grotesk headline, square-cornered solid button, outlined header button, hairline rule under the header. Calm and confident.
- `03-alex-morgan-dark-stats.png` (Alex Morgan): stats strip with vertical dividers, project cards (thumbnail, title, stack line, link), contact strip split into labelled columns (email / location / button), circular back-to-top in the footer.
- `04-alex-mercer-grid-red.png` (Alex Mercer, the closest to what I want): square tiled grid texture in the hero, tech-logo strip, staggered two-column project grid with tag pills and round arrow buttons, tiny letter-spaced eyebrows above headings ("WORK", "EXPERIENCE"), bento cards for "why work with me", and a giant name wordmark across the footer bleeding off the edges.

Use from them:
- Dark theme as the lead look: near-black canvas, one accent, very restrained colour. Light theme follows Sonali's paper-and-slate calm.
- The **staggered two-column project grid** from Alex Mercer. It fits my existing split perfectly: professional on the left, personal on the right, the right column offset down. Cards get a mono metadata row (year, role, stack as small pills) and a round arrow button that animates on hover.
- **Tiny letter-spaced mono eyebrows** with section numbers (`01 / ABOUT`) above big, tight headlines.
- A **square blueprint grid texture** in the hero (Alex Mercer's tiled grid, but drawn as thin lines, not glossy tiles) that the hero schema sits on.
- A **ghost wordmark**: a huge low-contrast word behind the hero or above the footer, and my name as a **giant footer wordmark** bleeding off the edges.
- A **stats / readout strip** under the hero in instrument style (for example: years in production, projects shipped, based in Lisbon, current local time, availability dot). Use only real numbers from the copy; do not invent figures. Ask me if a number is missing.
- **Toolbox as a slow marquee strip** of tech names in mono (Alex Mercer's logo strip), pausing on hover and static with reduced motion.
- **Experience as a numbered timeline** (Codea's alternating numbered steps), drawn progressively on scroll. This is a good candidate for the second big motion moment.
- **Contact as a split strip** (Alex Morgan): labelled columns for email, location and form, with a strong single CTA.
- The **three pillars** (Build / Solve / Deliver) as a small bento of cards.

Do not take from them: stock portraits or any photo of a person (I have none; the hero schema replaces the portrait), testimonials, skill percentage bars, FAQ, carousels, red/violet accents, glossy 3D tiles, purple gradients.

Never: glassmorphism or frosted blur panels, purple/pink gradients, 3D blobs, stock illustrations, emoji as icons, generic "AI template" look.

## Color and theme

- Light and dark themes with a toggle in the header (instrument-style switch). Design dark first: dark is the default on a first visit, the toggle switches to light, the choice is remembered, and there is no flash of the wrong theme on load.
- Dark: near-black graphite (around #0B0C0E) with steel greys for rules and secondary text, not pure black. Light: off-white paper and slate ink, like the Sonali reference.
- One accent: **electric blue**, used sparingly (live signals, active states, the hero's moving pulses, focus rings, a soft glow at the very bottom of the page like the Codea reference). Most references use red; I want blue instead. Check contrast; use a darker blue for small text on light.
- Everything comes from CSS custom-property tokens, so both themes are token swaps.

## Typography

Grotesk sans for headings and body (keep Geist unless the design system finds a clearly better grotesk) plus a monospace for labels, metadata, numbers and the hero schema (Geist Mono or IBM Plex Mono). Tight, large display headings; comfortable body measure (60 to 72ch). Fluid type scale with `clamp()`.

## The hero schema (keep it, evolve it)

The current hero has an SVG diagram: five nodes CODE, DATA, INFRA, DELIVERY, PEOPLE joined by curved paths on a dot grid, with a dashed accent path animating and a pulsing ring on INFRA. It's the part of the site I like most. Make it the signature of the site:

- Redraw it as a precise technical schematic: crisp nodes with mono labels and small coordinate/ID readouts, orthogonal or carefully curved routes, crosshair and tick marks on the grid.
- On load, the schema draws itself (grid, then routes, then nodes, then labels), under ~1.6s total.
- Electric-blue signal pulses travel along the routes between nodes, continuously and calmly.
- It reacts to the cursor (nodes near the pointer brighten, a faint crosshair follows on desktop) and to scroll (it subtly parallaxes and recomposes as you leave the hero).
- Its visual language (grid, nodes, routes, mono labels) carries through the site: section dividers, the experience timeline, card corners.
- Works in both themes, is decorative (`aria-hidden`), pauses when off-screen, and with `prefers-reduced-motion` shows the final static drawing.

## Motion

Subtle and refined everywhere, plus one or two big moments (the hero schema is one; pick at most one more, for example a pinned projects intro or the experience timeline drawing itself as you scroll).
- Short durations (150 to 300ms for UI, longer only for the big moments), custom ease-out curves, no bouncy or slow fades.
- Micro-interactions on buttons, links, cards, theme and language toggles, nav, and the contact form states.
- Only animate transform and opacity; 60fps on a mid-range phone; respect `prefers-reduced-motion` everywhere.

## Content and structure

Keep every current section and all current copy (it was just rewritten and approved):
- Home: hero, about, projects (two columns, professional and personal, first 2 of each), experience, toolbox, notes, contact with the FormSubmit form.
- Projects page: full gallery, same two-column split.
- No case-study pages for now.
- Keep PT-PT (default) and EN with the language toggle, loading copy from the existing `locales/pt-PT.json` and `locales/en.json` (same keys, so copy edits stay in one place).
- Keep the floating back-to-top button, SEO meta, JSON-LD, sitemap, robots, favicon, and `images/`.

## Stack

You may migrate from the current static setup (custom dc-runtime, `page.js`, `boot.js`) to **Next.js (App Router, TypeScript)** if it makes the redesign cleaner. Hard constraint: it must run only on Vercel with no other backend or service. Prefer fully static output (SSG). Self-host fonts with `next/font`. Keep dependencies few (GSAP is fine; no heavy UI kits). PT and EN can be routes (`/` and `/en`) or a client toggle; pick the better one for SEO and explain why. Keep the contact form posting to FormSubmit.

## Quality bar

- Lighthouse 95+ on Performance, Accessibility, Best Practices and SEO, on mobile.
- WCAG AA contrast in both themes, visible focus states, full keyboard navigation, semantic landmarks.
- Flawless from 360px to wide desktop; no horizontal scroll.
- No layout shift from fonts, images or the theme.

## Process

1. Read the current site (index.html, projects.html, style.css, page.js, locales) and look at every image in `docs/redesign/references/`.
2. Present a short design direction for approval: palette for both themes, type pairing, grid, the hero schema concept, and the second big motion moment. Wait for my OK.
3. Build on branch `redesign`. Commit in small steps.
4. Run it locally, screenshot every section in both themes on desktop and mobile, and run the review skills listed above. Fix what they find.
5. Show me the screenshots and a summary. Do not push or deploy until I approve.
