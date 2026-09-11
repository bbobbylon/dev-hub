# UI/UX Design Documentation — Dev Hub

_Last updated: 2026-09-08 — describes the 25-page app on the `implement-design-handoff` branch._

Dev Hub's visual language is "Organic" — the design system handed off from the original Claude
Design prototypes (`../project/`) and ported verbatim into `app/src/styles/organic.css`. This
document describes that system as it exists in code today; for the narrative of *how* it got
ported and what changed along the way, see `app/README.md`.

## 1. Design System

**Color** — three ramps, each with 9 steps (100 lightest → 900 darkest), generated in OKLCH on
one shared lightness scale so the same step number reads as the same visual weight across roles:

| Role | Base | Ramp |
| --- | --- | --- |
| Neutral | `#a19786` (500) | `--color-neutral-100..900` |
| Accent (terracotta) | `#d67f48` (500) | `--color-accent-100..900` |
| Accent-2 (sage) | `#8fa073` (500) | `--color-accent-2-100..900` |

Plus flat roles: `--color-bg` (`#f5ead8`), `--color-surface` (`#ebddc5`), `--color-text`
(`#201e1d`), `--color-divider` (16%-mixed text color). Two roles the ramps don't cover —
string-literal sand and terminal amber — are added once in `app.css` as `--code-string` /
`--color-amber` rather than extending the ramp system for a two-off need.

**Typography** — `--font-heading` (Caprasimo, loaded via Google Fonts `<link>` in `index.html`
for headings and UI chrome) and `--font-body` (Figtree, for body copy). Heading sizes are fixed
per level (`h1` 42px down to `h6` 13px, uppercase + letter-spaced), not fluid/clamped.

**Spacing** — a `--space-1` (4.4px) through `--space-8` (35.2px) scale, each step ~1.32× the
last rather than a round-number scale.

**Radius & elevation** — `--radius-sm/md/lg` (8/16/28px); `--shadow-sm/md/lg` are ink-tinted
(`color-mix` against the near-black text color) rather than plain black, so shadows read as
part of the same warm palette instead of a generic drop-shadow.

**Icons** — Lucide-derived SVG paths (`components/Icon.tsx`), stroke-width 2.75 uniformly, one
icon traced by hand (`lightbulb`) to match the prototype's narrower bulb rather than stock
Lucide.

## 2. Component Library

Defined in `app/src/components/` (full API in `docs/ARCHITECTURE.md` §4) and composed directly
into each page — there is no shared page-shell/layout component; that was tried and dropped
because each of the 25 pages wants a meaningfully different nav/hero/column arrangement, and a
shared shell ended up hiding more than it saved.

| Component | Role |
| --- | --- |
| `TopNav` | Sticky top bar, present on every page; brand mark links home. |
| `Aside` | The "Head First"-style tinted callout (icon + kicker + question + body). |
| `ConceptSidebar` | Left-hand lesson rail: done / current / locked states, gamified per the original design. |
| `SectionHead` | Kicker + display heading opening a section. |
| `CodeListing` | Dark editor-style pane: filename chrome, line numbers, syntax-color roles. |
| `CopyPanel` | Dark cheat-sheet column with a working copy button. |
| `ImageSlot` | Real `<img>` when `src` is given, else a dashed "not supplied" placeholder. |
| `Tag` / `Code` / `Meter` (`ui.tsx`) | Pill label, inline code span, labeled progress bar. |

One inconsistency worth knowing about rather than silently "fixing": `CheatSheet.tsx` defines
its own local callout box instead of importing the shared `Aside`, so it doesn't automatically
pick up any future change to `Aside`'s styling.

## 3. Layout Patterns

- **Page frame:** `.page` (light) / `.page-dark` (dark ground, used by mission/terminal-style
  pages) sets the base background; `.wrap` / `.wrap-narrow` cap content width (1160px / 940px).
- **Lesson layout:** a CSS grid pairing `ConceptSidebar` (sticky, scrolls independently) with a
  main content column — collapses to a single stacked column under 900px, with the sidebar
  becoming static and gaining a bottom border instead of a right one.
- **Card grids:** `.grid-2/3/4` step down responsively (`grid-4`→2 cols under 1040px, `grid-3`→2
  under 900px, all→1 col under 680px). Grid children get `min-width: 0` deliberately, since a
  wide `white-space: pre` code block would otherwise widen its whole track and force the page to
  scroll horizontally — code blocks carry their own `overflow-x` instead.
- **Responsive breakpoints:** 390px (phone), 768px (tablet), 1280px (laptop) — the three widths
  `scripts/verify-responsive.mjs` checks every route against for horizontal overflow. The CSS
  breakpoints themselves sit at 680/860/900/1040px, chosen per-component from where each layout
  actually breaks rather than snapped to the three verification widths.
- **Navigation structure:** flat, not hierarchical — every page is one level deep off the
  gallery (`/`), reachable by card, search, or (for lesson pages) a `ConceptSidebar`/`Roadmap`
  link. There is no breadcrumb; the `TopNav` brand mark is the only "go back up" affordance.

## 4. User Flows

- **Browse → learn:** gallery search/filter → open a lesson page → work through its
  interaction (quiz, walkthrough, sandbox) → progress is recorded automatically.
- **Study loop:** Flashcards → rate a card → SM-2 reschedules it → Progress Dashboard reflects
  the updated due count and streak → dashboard's "up next" queue suggests where to go next.
- **Checkpoint loop:** lesson page's quiz → score screen → passing marks the concept complete →
  Roadmap's stage progress bar and the Dev Hub landing catalog's lock states update accordingly.
- **Recovery flow:** an unknown or stale URL → 404 page → explicit links back to the gallery or
  the Dev Hub landing page, rather than a silent redirect.

## 5. Accessibility (A11y)

**Target:** WCAG AA (4.5:1) for body-size text on light grounds; audited automatically via
`npm run audit:a11y` rather than manually.

**Passing today:** every interactive control has an accessible name (0 unnamed), keyboard focus
shows the design system's 2px accent ring (`:focus-visible`) on all of them, and tab order
follows visual order.

**Contrast — what changed:** muted body text was promoted from the `-500`/`-600` neutral ramp
steps to `-700`, applying the design system's own documented rule for accent text ("for
paragraph-size text use a deep ramp step, not the accent itself") to the neutral ramp as well,
which the original prototypes hadn't done. That took the audit from 137 failures across 51 color
pairs down to 31 across 18, with zero new failures introduced.

| Token | on `--color-bg` | on `--color-surface` | 4.5:1 body text |
| --- | --- | --- | --- |
| `neutral-600` | 3.61:1 | 3.21:1 | fails |
| `neutral-700` | 5.53:1 | 4.92:1 | **passes** |
| `accent` | 3.03:1 | 2.69:1 | fails |
| `accent-700` | 5.72:1 | 5.09:1 | **passes** |
| `accent-2-600` | 3.53:1 | 3.14:1 | fails |
| `accent-2-700` | 5.43:1 | 4.82:1 | **passes** |

**Known, deliberate exceptions (not regressions):** the remaining ~19 failing pairs are the
accent *fill* itself — cream-on-terracotta primary buttons, `.btn-ghost` accent text,
accent-tinted labels on accent panels, and the terminal's accent-on-dark — measuring 2.7–3.9:1,
which matches the ~3:1 the design system says that pair is tuned for ("enough for icons, large
text and interface chrome, not body copy"). Fixing these means changing the accent color itself,
a brand decision out of scope for a port. Dark-ground surfaces (code panes, the terminal, line
gutters) were also left alone, since darkening an already-dark token would reduce contrast, not
improve it.

## 6. Styling Conventions

- Two-layer stylesheet: `organic.css` (tokens + base component classes, verbatim copy of the
  handoff — don't hand-edit values here without updating the source design system) and `app.css`
  (app-specific chrome, reading only `organic.css`'s custom properties — no raw hex values).
- Component styling is inline `style={{ }}` objects reading CSS custom properties (e.g.
  `background: 'var(--color-accent-100)'`), not CSS Modules or styled-components — consistent
  with the handoff's own plain-CSS-on-plain-HTML approach.
- `prefers-reduced-motion: reduce` disables all animation/transition globally — respected by the
  `pop`/`floatBlob`/`blink` keyframes used across a few pages.
- Class names for shared chrome (`.page`, `.topnav`, `.card`, `.chip`, `.code-block`) live in
  `app.css`; one-off page-specific layout is inline style rather than a dedicated class, since
  each page's layout is used exactly once.

## 7. Screenshot/Mockup References

The original design mockups are the 23 `.dc.html` files under `../project/` at the repo root
(Claude Design canvas artboards — see that directory's own structure and `../chats/` for the
design-session transcripts behind them). There is no external Figma/Adobe XD file; the `.dc.html`
prototypes *are* the design reference, and `npm run audit:content` checks the shipped app's
prose against them directly rather than against a separate design tool.
