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

There are now two Playwright suites, both run against `npm run preview` on port 4173:

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

There's also a content-fidelity audit — a reviewing aid rather than a test, so it isn't part of
`npm run verify`:

```bash
npm run audit:content    # needs no server
```

It pulls every substantial run of prose out of each `.dc.html` prototype and checks it survived
into the corresponding React source. It currently reports **3 phrases to review, all known
extractor artifacts**, not omissions:

- Two CLI Basics entries are the prototype's flat clipboard payload strings. Here those are derived
  from the `CodeLine` arrays via `commandsOf()`, so the copy exists line by line rather than as one
  blob. The payloads are asserted byte-for-byte against the prototype in `verify:interactions`.
- One Quiz Mode entry is a sentence that's now a template literal (`you only need ${PASS_MARK} of
  ${QUESTIONS.length}`). The rendered wording is asserted in `verify:interactions`.

If that count rises, something was dropped — go read what it flags.

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
| `Aside` | The Head First tinted aside — icon, kicker, question, body. Used by six pages. |
| `ConceptSidebar` | The lesson rail with done / current / locked states. |
| `SectionHead` | The kicker + heading pair that opens each concept section. |
| `CodeListing` | Dark editor pane with a filename, line numbers, and `syn` syntax roles. |
| `CopyPanel` | Dark cheat-sheet column with a working copy button. |
| `ImageSlot` | Placeholder for artwork not yet supplied (the video poster frame). |
| `Icon` | Lucide paths at stroke-width 2.75, per the design system. |
| `ui.tsx` | `Tag`, `Code`, `Meter`. |
| `useDocumentTitle` | Names the tab after the page, restores on unmount. |

Every page composes its own chrome directly rather than through a page-shell component. That was
tried and dropped: each design wants a different nav, hero and column layout, so the shell earned
nothing and hid what each page actually does.

### Proving a refactor changed nothing

`scripts/snapshot.mjs` full-page-screenshots every route and compares hashes, so a refactor can be
shown to be visually neutral rather than assumed to be:

```bash
node scripts/snapshot.mjs .snapshots/before
# …refactor…
node scripts/snapshot.mjs .snapshots/after
node scripts/snapshot.mjs --compare .snapshots/before .snapshots/after
```

It disables animations before capturing so frames are comparable. The `Aside` consolidation above
was verified this way: 24/24 pixel-identical.

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
