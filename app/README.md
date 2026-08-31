# Dev Hub

A React implementation of the **Coding Learning App Redesign** handed off from Claude Design
(see `../README.md`, `../chats/`, and the `.dc.html` prototypes in `../project/`).

All 23 designed pages are implemented, plus the gallery that indexes them.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run preview    # serve the build on :4173
```

## Verifying it

Two Playwright suites, both run against `npm run preview` on port 4173:

```bash
npm run preview &        # must be up first
npm run verify           # routes + interactions
```

- `verify:routes` — loads all 24 routes, asserting each renders real content, has an `<h1>`,
  logs no console errors, and doesn't overflow horizontally.
- `verify:interactions` — drives every page that carried state in the prototypes (quiz flow and
  scoring, flashcard flip/rate, sort stepping, regex matching, terminal mission, hint reveal,
  decorator cost arithmetic, walkthrough gating, milestone checklist, test runner) and asserts the
  ported behaviour matches.

Both block outbound requests, so the Google Fonts link is not fetched during verification. The
running app still loads Caprasimo and Figtree normally.

## How it's organised

```
src/
  styles/organic.css   Verbatim copy of the handoff design system's stylesheet — the
                       source of truth for every colour, font, space, radius and shadow.
  styles/app.css       App layer: page chrome, grids, responsive rules, keyframes.
                       Reads only from the tokens above.
  components/          Shared chrome lifted out of the prototypes (see below).
  data/                Page content extracted from the prototypes as typed data.
  pages/               One component per designed page.
  data/pages.ts        The page registry — drives both the gallery and the route table.
```

### Components

| Component | What it is |
| --- | --- |
| `TopNav` | The sticky bar every page carries; the brand mark routes back to the gallery. |
| `Page` | Standard light page: nav + display heading + lede + main column. |
| `ConceptSidebar` | The lesson rail with done / current / locked states. |
| `SectionHead` | The kicker + heading pair that opens each concept section. |
| `CodeListing` | Dark editor pane with a filename, line numbers, and `syn` syntax roles. |
| `CopyPanel` | Dark cheat-sheet column with a working copy button. |
| `ImageSlot` | Placeholder for artwork not yet supplied (the video poster frame). |
| `Icon` | Lucide paths at stroke-width 2.75, per the design system. |
| `ui.tsx` | `Tag`, `Callout`, `Panel`, `Meter`, `CodeBlock`, `Code`, `Kicker`. |

## Notes on the port

- The prototypes are Claude Design canvas artboards: content wrapped in `<x-dc>`/`<helmet>`, with
  interactivity expressed as a `class Component extends DCLogic` plus `<sc-if>` / `<sc-for>`
  template bindings resolved at runtime by `support.js`. None of that scaffolding survives here —
  each state machine was re-expressed with React hooks, preserving the observable behaviour.
- The three earliest pages (Dev Hub, CLI Basics, Decorator Pattern) inlined their own copy of the
  design tokens under shorter names (`--accent` rather than `--color-accent`). The values were
  identical to the design system's, so everything now reads from `organic.css`.
- Two colours the Organic ramps don't cover — the sand used for string literals and the amber
  terminal traffic light — are defined once in `app.css` as `--code-string` / `--color-amber`.
- Two pages had no `<h1>` in the prototype. Flashcards now promotes its deck name; Terminal
  Simulator carries a visually hidden one. Neither changes the rendered design.
- `CLI Basics` keeps the labelled mount point for the user's existing step-by-step playthrough
  component, as the design intends.
- `Video Lesson`'s poster frame is still an empty slot — pass `src` to `ImageSlot` once there's a
  real still, as flagged in the design session.
