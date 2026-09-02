# Dev Hub

A React implementation of the **Coding Learning App Redesign** handed off from Claude Design
(see `../README.md`, `../chats/`, and the `.dc.html` prototypes in `../project/`).

All 23 designed pages are implemented, plus the gallery that indexes them — and the progress the
mockups only depicted is now real.

## Beyond the mockups

The designs showed a learner's progress as fixed numbers: a 4-day streak, 8 of 23 concepts, a
hardcoded minutes chart. Nothing was recorded, so a refresh erased everything. `src/lib/progress.ts`
makes it true — a small localStorage store, shared across tabs via the `storage` event, with no
server and no account.

- **Quiz scores persist**, accumulating a personal best across attempts; passing a checkpoint marks
  the concept complete.
- **Flashcards run real spaced repetition** (SM-2, trimmed to the three ratings the deck offers).
  A session studies only what's actually due and then *ends*, instead of looping on the last card.
  The "due today" and "mastered" counts are computed, not decorative.
- **Milestones persist** on the capstone brief.
- **The Progress Dashboard reads live data** — streak, hours this week, concepts completed, quiz
  accuracy, the 14-day minutes chart and the completion donut all derive from real activity.
- **Time on page is tracked** in coarse ticks while the tab is visible, which is what makes the
  streak and the chart honest.
- **Search works.** The Dev Hub's search box was decorative; it now filters the catalog, and the
  gallery gained a filter across all 23 archetypes. Both have empty states.
- **Unknown URLs get a 404 page** instead of silently redirecting to the gallery.
- **Progress can be reset** from the dashboard, with a note that data never leaves the device.

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
- `verify:responsive` — re-checks every route at 390 / 768 / 1280px for horizontal overflow, and
  names the offending elements when it finds any. The breakpoints in `app.css` were written from
  reasoning about each layout; this is what holds them honest.
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

### Accessibility

```bash
npm run audit:a11y       # needs the preview server
```

Checks WCAG text contrast, accessible names on every control, and reports what it finds.

**Passing:** every interactive control has an accessible name (0 unnamed), keyboard focus draws the
design system's 2px accent ring on all of them, and tab order follows the visual order.

**Contrast:** muted body text was promoted from the `-500`/`-600` ramp steps to `-700`, applying
the design system's own rule — *"for paragraph-size text in the accent use a deep ramp step rather
than the accent itself"* — to the neutral ramp, which the prototypes had not done. That took the
audit from 137 failures across 51 colour pairs down to **31 across 18**, with zero new failures
introduced (verified by diffing the failure sets before and after). Tokens on dark grounds — the
terminal, code panes, gutters — were deliberately left alone, since darkening them would *reduce*
contrast.

Measured against the two light grounds, the ramp splits cleanly at step 700:

| token | on `--color-bg` | on `--color-surface` | body text (4.5:1) |
| --- | --- | --- | --- |
| `neutral-500` | 2.42:1 | 2.15:1 | fails |
| `neutral-600` | 3.61:1 | 3.21:1 | fails |
| `neutral-700` | 5.53:1 | 4.92:1 | passes |
| `accent` | 3.03:1 | 2.69:1 | fails |
| `accent-700` | 5.72:1 | 5.09:1 | passes |
| `accent-2-600` | 3.53:1 | 3.14:1 | fails |
| `accent-2-700` | 5.43:1 | 4.82:1 | passes |

**What remains, and why it wasn't changed:** all 18 surviving pairs are the accent fill itself —
cream-on-terracotta primary buttons, `.btn-ghost` accent text, accent-tinted labels on accent
panels, and the terminal's accent-on-dark. They measure 2.7–3.9:1, which is precisely the ~3:1 the
Organic guide says the accent pair is tuned to ("enough for icons, large text and interface chrome,
not for body copy"). Clearing them means changing the accent colour itself — a brand decision, not
a porting one.

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
