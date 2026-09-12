# Architecture — Dev Hub

_Last updated: 2026-09-09 — describes the 25-page app plus the optional `server/` backend, on the
`implement-design-handoff` branch._

This is the file-by-file map of the app: what each file is, what it depends on, what depends
on it, and where it sits in the whole system. For the *narrative* of what was built and why
(the port from the design handoff, the progress system, the verification suites, the a11y
audit), see `app/README.md` — this document complements that one rather than repeating it.
For how the app gets from a laptop to `https://bbobbylon.github.io/dev-hub/`, see
`DEPLOYMENT.md`.

## 1. What this repo is

Dev Hub is a React 19 + TypeScript + Vite 8 single-page app: a coding-fundamentals learning
tool built from a Claude Design HTML/CSS/JS handoff (`project/`, `chats/` at the repo root —
see that root `README.md`). It ships ~25 standalone interactive lesson/tool pages behind one
router, plus a gallery that indexes them, plus a real localStorage-backed progress system the
original design mockups only depicted with hardcoded numbers.

There is no build-time content pipeline: every page's copy, code samples, and quiz questions are
TypeScript literals compiled straight into the page component (or a sibling `data/*.ts` file). The
only persistence *required* to use the app is the browser's own `localStorage` — no backend, no
account, no database. A separate, optional Spring Boot backend (`server/`, §11) exists purely to
sync that same `localStorage` blob across devices for a learner who signs in; the frontend build
this repo ships to GitHub Pages has no backend configured at all, and every feature except
sign-in/cross-device sync works identically with or without one.

## 2. Technology stack

| Layer | Choice |
| --- | --- |
| UI framework | React 19 (function components + hooks only, no class components except `ErrorBoundary`, which React requires to be a class) |
| Language | TypeScript 7 |
| Build tool | Vite 8 (`@vitejs/plugin-react`) |
| Routing | React Router 7, client-side only, one `basename` for the GitHub Pages sub-path |
| Styling | Plain CSS, no framework — a two-layer system (see §5) |
| Persistence | Browser `localStorage`, required for nothing but the app to work; optionally mirrored server-side per account (see below) |
| Verification | A custom Playwright toolchain in `scripts/` (no Jest/Vitest/Playwright-test runner — hand-rolled `.mjs` scripts driven by `npm run verify`) |
| Hosting | GitHub Pages (static), deployed via `.github/workflows/deploy-pages.yml` — see `DEPLOYMENT.md` |
| Backend (optional, §11) | Spring Boot 4 / Java 21 / Maven, `server/` — stateless JWT auth + a one-row-per-user progress sync endpoint. Not deployed anywhere; the GitHub Pages build has none configured. |

## 3. Directory structure

```
repo/
├── README.md              Handoff-bundle instructions for a coding agent (read first, historically)
├── DEPLOYMENT.md           How this got onto GitHub Pages, and how to redeploy/roll back
├── docs/
│   ├── SRS.md              What the app must do and why (requirements, success criteria)
│   ├── ARCHITECTURE.md     This file
│   └── UI-DESIGN.md        The "Organic" design system, components, layouts, a11y
├── chats/                  Design-session transcripts behind the original prototypes
├── project/                The 23 original `.dc.html` Claude Design prototypes + assets
├── server/                 Optional Spring Boot backend — sync only, never required (see §11)
└── app/                    The actual React app (everything below is under here)
    ├── index.html          Vite's HTML entry point — mounts #root, loads fonts, sets favicon
    ├── vite.config.ts      Build config — GitHub Pages sub-path handling (see file comments)
    ├── package.json        Scripts: dev/build/preview/typecheck/verify*/audit* (see §6)
    ├── tsconfig.json        TypeScript compiler config
    ├── src/
    │   ├── main.tsx         Entry: mounts <App> inside <BrowserRouter>
    │   ├── App.tsx          Route table — one <Route> per page, lazy-loaded except the gallery
    │   ├── vite-env.d.ts    Ambient type declarations (Vite client types, CSS module shim)
    │   ├── styles/
    │   │   ├── organic.css  Design-system tokens (colors, type, space, radius, shadow) — verbatim from the handoff
    │   │   └── app.css      App-layer chrome (nav, page frame, grids, keyframes) — reads only from organic.css's tokens
    │   ├── components/      Shared chrome components + hooks (see §4)
    │   ├── data/            Page content extracted into typed data (see §4)
    │   ├── lib/
    │   │   └── progress.ts  The localStorage progress store + useProgress()/useActivityTracker() hooks
    │   ├── assets/
    │   │   └── recursion-poster.svg   Hand-drawn poster frame for Video Lesson, built from the app's own tokens
    │   └── pages/           One component per route — 27 files (see §7)
    └── scripts/             The Playwright verification/audit toolchain — 8 files (see §8)
```

## 4. Shared components, data, and lib (`src/components/`, `src/data/`, `src/lib/`)

Every page composes these directly rather than through a shared page-shell component — that
was tried and dropped (see `app/README.md`'s "How it's organised" section for why).

| File | Exports | What it is | Used by |
| --- | --- | --- | --- |
| `components/TopNav.tsx` | `TopNav` | The sticky top bar every page carries; brand mark links back to the gallery (`/`). Also reads `useAuth()` directly (not a prop threaded through ~27 call sites) to render the signed-in user's name + "Sign out" after the `right` slot, or a "Sign in" link — the latter only when `apiEnabled`, matching `App.tsx`'s conditional account routes. A signed-in user keeps the name + "Sign out" either way, so a token left by an earlier API-enabled build can still be cleared. | Every page |
| `components/Aside.tsx` | `Aside` | The Head First-style tinted callout: icon + kicker + heading + body. | ~6 pages |
| `components/ConceptSidebar.tsx` | `ConceptSidebar`, `SidebarGroup`, `SidebarItem` | The left-hand lesson rail with done/current/locked states; a `SidebarItem` with `state: 'open'` but no `to` silently renders as an unclickable label (the exact bug Shell Scripting's page was built to fix). | CLI Basics, Shell Scripting |
| `components/ConceptComplete.tsx` | `ConceptComplete` | The end-of-lesson panel and the only place a concept gets recorded. Reads `slug` against `data/concepts.ts`, writes via `useProgress().completeConcept`. Two modes by design: pass `earned` and it records the moment the page's own finishing condition fires (guarded on the existing timestamp, so an old completion keeps its original date); omit it — as the static field-guide pages do, having no such moment — and it offers a button instead, with `hint` naming what would have earned it automatically. Renders `aria-label="<label> completion"`, which `verify-interactions.mjs` uses to read a page's state with the panel subtracted. | Every lesson and practice page (17) |
| `components/SectionHead.tsx` | `SectionHead` | The kicker + heading pair that opens most sections. | Most lesson pages |
| `components/CodeListing.tsx` | `CodeListing`, `ListingLine`, `syn` | Dark editor-style code pane with filename chrome, line numbers, and shared syntax-color roles (`syn.kw`/`fn`/`str`/`cm`). | Most lesson pages with code samples |
| `components/CopyPanel.tsx` | `CopyPanel`, `CodeLine`, `commandsOf` | Dark cheat-sheet column with a working copy-to-clipboard button; `commandsOf()` derives the clipboard payload from the same line data that's rendered, so what's shown and what's copied can't drift apart. | CLI Basics, Shell Scripting, Cheat Sheet |
| `components/ImageSlot.tsx` | `ImageSlot` | Renders `src` as an image if given, else a dashed "artwork not supplied" placeholder. | Video Lesson (now has a real `src`) |
| `components/Icon.tsx` | `Icon`, `IconName` | Inline SVG icons (Lucide-derived paths, stroke-width 2.75) by name. | Nearly every page and component |
| `components/ui.tsx` | `Tag`, `TagTone`, `Code`, `Meter` | `Tag` = pill label (gallery cards, quiz results); `Code` = inline code span; `Meter` = labeled progress bar. | Gallery, Roadmap, Progress Dashboard, others |
| `components/useCopy.ts` | `useCopy` | Copy-to-clipboard hook with a transient "Copied!" flag, keyed by string so **one hook instance serves multiple `CopyPanel`s on a page** (not one hook per panel). | CLI Basics, Shell Scripting |
| `components/useDocumentTitle.ts` | `useDocumentTitle` | Sets `document.title` to `"<page> · Dev Hub"`, restoring the previous title on unmount. | Most pages |
| `components/ErrorBoundary.tsx` | `ErrorBoundary` | Class component catching a render crash in one page so it doesn't blank the whole app; resets when `resetKey` (the route pathname) changes. | Wraps the whole `<Routes>` tree in `App.tsx` |
| `data/pages.ts` | `PAGES`, `PageEntry`, `PageGroup`, `GROUP_TITLES` | The page registry — one entry per route (slug/title/kind/tone/blurb/group). Drives `PageGallery`'s cards and search, and (by convention, not by import) must stay in sync with `App.tsx`'s routes and `scripts/routes.mjs`'s `ROUTES`. | `PageGallery` |
| `data/httpDeck.ts` | `CARDS`, `Card`, `DECK_NAME`, `DECK_TAGS` | The "HTTP Essentials" flashcard deck — the one piece of content two pages both need. `Flashcards` renders it; `ProgressDashboard` needs only `DECK_TAGS` to count what's due. The dashboard used to keep its own literal copy of those ids, so editing the deck silently broke its due count with no type error and no failing check. A card's `tag` is also its id in `state.cards`, which is why renaming one orphans a learner's SM-2 schedule for it. | `Flashcards`, `ProgressDashboard` |
| `data/concepts.ts` | `CONCEPTS`, `CONCEPT_BY_SLUG`, `PATH_CONCEPTS`, `conceptsInStage`, `pathDone`, `offPathDone`, the `Concept` type | The registry of the 20 concepts the app can record as complete: slug (the key in `state.concepts`), label, the route that teaches it, its Roadmap stage or `null` when off the five-stage path, and prose for what earns it. Two path concepts carry no `route` — the design names them and no page teaches them. Counting goes through `pathDone`/`offPathDone` rather than `Object.keys(state.concepts).length`, so an off-path concept, a stale key from an older build, or a restored backup can't inflate a figure labelled "Backend path". Reference pages (`Glossary`, `CheatSheet`), `Flashcards` (its own SM-2 state) and the meta pages are deliberately absent. | `ConceptComplete`, `Roadmap`, `ProgressDashboard`, `data/curriculum.ts` |
| `data/curriculum.ts` | `TOTAL_CONCEPTS`, `TOTAL_CHECKPOINTS`, `UPCOMING_STAGES`, `syllabusOf` | The numbers the designs quote about the *course*, as opposed to what the app derives from real data. `TOTAL_CONCEPTS` was a bare `23` in three files; it is now derived from `PATH_CONCEPTS` plus the locked stages' listed concepts, which corrected it to 25 — the Roadmap's prose said 23 while its own chips enumerated 25. **Not `PAGES.length`** — a concept is a unit of the designed path, a page is one of ~26 screens, several of which teach no concept while CLI Basics walks through several. Nor `CONCEPTS.length`, which includes the off-path pages. | `Roadmap`, `ProgressDashboard`, `CourseComplete` |
| `data/cliBasics.ts` | `SIDEBAR`, `ANATOMY`(+`AnatomyKey`, `ANATOMY_ORDER`), `WHY_CLI`, `COMMAND_GROUPS`, `BASH_LINES`, `PS_LINES`, `PIPES_LINES`, `QUIZ`(+`QuizQuestion`), `WALKTHROUGH`(+`WalkStep`) | All content for `pages/CliBasics.tsx`, pulled out of the component so its JSX stays about layout. Not shared with `ShellScripting.tsx`, which keeps its own local copies of similarly-shaped data (including its own `SIDEBAR`) rather than importing from here. | `CliBasics.tsx` only |
| `lib/progress.ts` | `useProgress`, `useActivityTracker`, `streakOf`, `recentMinutes`, `schedule`, `isDue`, `dayKey`, `EMPTY`, plus the `ProgressState`/`QuizRecord`/`CardRecord`/`Rating` types | The entire local persistence layer: a single JSON blob in `localStorage` (key `dev-hub.progress.v1`) holding completed concepts, quiz scores, SM-2 flashcard schedules, milestones, and per-day activity seconds. Synced across tabs via the `storage` event. Knows nothing about the network or accounts — `importState` (a `reset`-shaped replace-all mutator) is the only hook `progressSync.ts` needs to apply a synced copy. | `App.tsx` (activity tracker), every page that records progress, `ProgressDashboard` (reads several helpers directly), `lib/progressSync.ts` |
| `lib/api.ts` | `API_BASE`, `apiEnabled`, `register`, `login`, `fetchProgress`, `saveProgress`, `ApiError` | Thin fetch wrapper for the optional backend (§11); parses its `HttpResponse` envelope and throws `ApiError` (carrying the HTTP status) on failure. `apiEnabled` is `false` whenever `VITE_API_BASE_URL` wasn't set at build time — the GitHub Pages build's normal state. | `lib/auth.tsx`, `lib/progressSync.ts` |
| `lib/auth.tsx` | `AuthProvider`, `useAuth`, `isUnauthorized` | Account state: `{ user, token }` persisted to `localStorage` (`dev-hub.auth.v1`, separate from the progress key), trusted optimistically until a request 401s. `login`/`register` reject immediately with a clear message when `apiEnabled` is `false`, so callers never branch on that flag themselves. Wraps `<App>` in `main.tsx`, not `App.tsx` — same reasoning as `BrowserRouter` living there (no route-tree dependency). | `main.tsx`, `TopNav`, `SignIn`/`SignUp`, `lib/progressSync.ts` |
| `lib/progressSync.ts` | `useProgressSync` | Bridges `lib/auth.tsx` and `lib/progress.ts` without either knowing about the other: on sign-in, pulls the server's saved progress once and overwrites local via `importState` (server wins — no field-level merge); after that, pushes every local change back, debounced ~2s. Every network call is fire-and-forget. A no-op whenever `apiEnabled` is `false` or no one's signed in. | `App.tsx` (mounted once, next to `useActivityTracker`) |
| `lib/progressFile.ts` | `downloadProgress`, `parseProgressFile`, `summarize`, `backupFilename` | The no-account counterpart to `progressSync.ts`: the same `ProgressState` blob, moved by the learner as a dated JSON file instead of by a server. `downloadProgress` hands the browser a Blob to save; `parseProgressFile` treats a restore file as untrusted input and rebuilds every record field by field (dropping anything that doesn't type-check, and refusing a wrong `version` or unparseable JSON with a message written to be shown verbatim), because the dashboard does real arithmetic on these values — `best / total`, `new Date(dueAt)` — where a malformed entry would surface as a crashed render. No network, no auth, so it works on the static deploy. | `ProgressDashboard` |

## 5. Styling system (`src/styles/`)

Two layers, read top-down:

- **`organic.css`** — the design-token source of truth, copied verbatim from the Claude Design
  handoff: color ramps (`--color-neutral-100..900`, `--color-accent-100..900`,
  `--color-accent-2-100..900`), typography, spacing, radius, and shadow tokens, plus a handful
  of base component classes. Because this mirrors an external design system 1:1, it's
  deliberately left uncommented line-by-line beyond its existing header — the tokens are
  self-describing by their ramp position, and heavy annotation would just be noise to diff
  against future handoff updates.
- **`app.css`** — the app layer: page chrome (`.page`, `.topnav`, `.page-header`), grid
  utilities, responsive breakpoints, and keyframes, all built by reading `organic.css`'s
  tokens (no raw hex values). Already carries section-banner comments (`/* — top navigation
  bar — */` etc.) throughout.

Two colors the Organic ramps don't cover (`--code-string`, `--color-amber`) are defined once
here rather than in a third file.

## 6. `package.json` scripts

| Script | Runs | Purpose |
| --- | --- | --- |
| `dev` | `vite` | Local dev server, hot reload, base path `/` |
| `build` | `tsc -b && vite build` | Type-checks then builds the GitHub Pages sub-path bundle into `dist/` |
| `preview` | `vite preview` | Serves the built `dist/` on port 4173, same base path as production |
| `typecheck` | `tsc -b --noEmit` | Type-check only, no emit |
| `verify` | `verify:routes && verify:responsive && verify:interactions && audit:a11y` | The full Playwright verification suite, run against `preview` |
| `verify:routes` / `verify:responsive` / `verify:interactions` | `node scripts/verify-*.mjs` | See §8 |
| `audit:content` / `audit:a11y` | `node scripts/audit-*.mjs` | See §8. `audit:content` is a reviewing aid, not part of `verify`; `audit:a11y` is baselined and *is* the fourth leg of `verify` |

## 7. Pages (`src/pages/`)

Each file below is one default-exported component rendered at the route named in `App.tsx`
(kebab-case of the filename, e.g. `DecoratorPattern.tsx` → `/decorator-pattern`), except
`PageGallery.tsx` (`/`) and `NotFound.tsx` (the `*` catch-all). Every page has its own
in-file header comment now; this table is the cross-file summary.

| File | Route | What it does | Key local state / logic | Depends on | Relation to other pages |
| --- | --- | --- | --- | --- | --- |
| `DecoratorPattern.tsx` | `/decorator-pattern` | Teaches the Decorator pattern via the Starbuzz Coffee example — bold hero, build-your-own-order sandbox, predict-then-run code. | `OrderBuilder`'s `stack` (chosen condiments) drives a live receipt and a nested-constructor string; `PredictThenRun`'s `showOutput` reveals fixed console output. | `TopNav`, `Icon`, `useDocumentTitle`, `streakOf`/`useProgress` (streak chip only) | Self-contained; no shared data with other pages. |
| `QuizMode.tsx` | `/quiz-mode` | A Git Basics exam flow: question palette, per-question feedback, score screen. | `index`/`selected`/`checked`/`results` step through `QUESTIONS`; on completion, calls `useProgress().recordQuiz()` and `completeConcept('git-basics')` if passing. | `TopNav`, `Tag`, `useDocumentTitle`, `useProgress` | Completion screen links to `/roadmap`. |
| `TerminalSimulator.tsx` | `/terminal-simulator` | "Mission 2 · The Lost Log" — a scripted dark-terminal incident walkthrough with an objectives checklist. | `n` counts executed lines of the fixed `SCRIPT` transcript, driving both the replay and the objectives list. | `TopNav`, `Icon`, `useDocumentTitle` | Self-contained; doesn't touch `useProgress`. |
| `ShellScripting.tsx` | `/shell-scripting` | Steps through a `backup.sh` script line by line, showing terminal output and live variable state per step. | `step` indexes into `STEPS`; one `useCopy()` call is shared across two `CopyPanel`s keyed by string. | `ConceptSidebar`, `SectionHead`, `CodeListing`, `CopyPanel`, `Aside`, `Icon`, `ui`, `useCopy`, `useDocumentTitle`, `streakOf`/`useProgress` | Its local `SIDEBAR` hand-duplicates `data/cliBasics.ts`'s `SIDEBAR` (not imported) — added to fix CLI Basics' dead sidebar link; linked from `CliBasics`' sidebar and `Roadmap`'s Stage 1 chip. |
| `CourseComplete.tsx` | `/course-complete` | A completion certificate / stats recap with "where to next" cards. | No hooks besides `useDocumentTitle`; `CERT`/`NEXT_PATHS`/`CONFETTI` are static — **not yet wired to `useProgress()`**, so the certificate stats aren't real, though the two curriculum sizes in them now come from `data/curriculum.ts` rather than being typed out again. | `TopNav`, `Icon`, `Tag`, `data/curriculum.ts` | Both "next path" cards link to `/roadmap`. |
| `ArchitectureDeepDive.tsx` | `/architecture-deep-dive` | A numbered request-journey diagram (browser → load balancer → API → cache/DB → replica) with matching callout cards. | No component state; a local `Node` helper builds the SVG diagram from `LAYER_CARDS`. | `TopNav`, `Aside`, `Tag` | Self-contained. |
| `DebuggingChallenge.tsx` | `/debugging-challenge` | "Case #017" — a Python off-by-one bug hunt with progressive hints and a diff reveal. | `hints` counts revealed `HINTS`; `solved` toggles the fix-diff view over the `SOURCE` listing. | `TopNav`, `CodeListing`/`syn`, `Icon`, `Tag`, `useDocumentTitle` | Self-contained; no `useProgress`. |
| `Glossary.tsx` | `/glossary` | Term cards (definition + "heard at work"/"what it's not" or a code sample). | No state; `ALPHABET` strip and search box are static chrome — only "A" terms currently render. | `TopNav`, `CodeListing`'s `syn`, `Tag`, `useDocumentTitle` | Self-contained. |
| `NotFound.tsx` | `*` (catch-all) | The 404 page for unmatched URLs, instead of silently redirecting to the gallery. | No state. | `TopNav`, `useDocumentTitle` | Links back to `/` and `/dev-hub`. |
| `CliBasics.tsx` | `/cli-basics` | The flagship lesson: a clickable command-anatomy diagram, a self-checking quiz, and a terminal walkthrough. | `AnatomyKey` selection state; `answers: Record<number,number>` for the quiz, which calls `onPass` up to the page when every question is answered correctly and that records the `cli-basics` concept; `step`/`revealed` for the walkthrough. All content comes from `data/cliBasics.ts`. | `ConceptSidebar`, `SectionHead`, `CodeListing`, `CopyPanel`, `Aside`, `Icon`, `ui`, `useCopy`, `useDocumentTitle`, `useProgress`, `data/cliBasics.ts` | Renders three `CopyPanel`s off one shared `useCopy()` call keyed `'bash'\|'ps'\|'pipes'`. Its `SIDEBAR` shape is duplicated (not imported) by `ShellScripting.tsx`. |
| `RebaseHistory.tsx` | `/rebase-history` | Replays a feature branch's rebase onto main via a 5-frame sequence: an SVG commit graph, a mock terminal, and a live-state panel. | `STEPS` drives frame index state; `RebaseGraph` renders the SVG per frame. | `TopNav`, `CodeListing`, `useDocumentTitle` | Shares commit-graph visual language with `GitBranching.tsx` but no shared code; added post-handoff (no prototype). Linked from `Roadmap.tsx`'s stage-2 chips. |
| `DataStructuresVisual.tsx` | `/data-structures-visual` | Four hand-drawn SVG diagrams (array, linked list, hash map, BST), each with a fast/slow verdict. | Fully static — no hooks. | `TopNav`, `Tag`, `useDocumentTitle` | Self-contained. |
| `Roadmap.tsx` | `/roadmap` | A five-stage learning path: stages 1-2 built with real chip grids, stages 3-5 locked placeholders. | Every chip state, stage badge, "next up" marker, Continue link and count is derived from `state.concepts` against `conceptsInStage()`; nothing is hardcoded, and the old `BASELINE_DONE = 8` floor is gone. Chips for concepts with no `route` render unlinked and stay grey. | `TopNav`, `Meter`(`ui`), `useDocumentTitle`, `useProgress`, `data/concepts.ts`, `data/curriculum.ts` | Stage-2 chips link to `/shell-scripting` and `/rebase-history` — the page those two are linked *from*. |
| `AlgorithmVisualizer.tsx` | `/algorithm-visualizer` | Bubble-sort bars synced to pseudocode, with live comparison/swap counters. | A pre-computed `FRAMES: Frame[]` trace lets stepping backward be free; one `useState<number>` indexes into it. | `TopNav`, `CodeListing`, `useDocumentTitle` | Self-contained, no shared data file. |
| `FrameworkComparison.tsx` | `/framework-comparison` | One counter widget shown as React/Vue/Svelte-style code snippets, plus a decision table. | Fully static — no hooks at all. | `TopNav`, `CodeListing`'s `syn`, `useDocumentTitle` | Self-contained. |
| `DevHub.tsx` | `/dev-hub` | An in-universe "product home screen" mockup with its own topic catalog (done/current/locked). | `query` state filters `TOPICS` via `useMemo`. | `TopNav`, `Icon`, `useDocumentTitle` | **Not** the app's real homepage — that's `PageGallery` at `/`. `TOPICS` is unrelated to `data/pages.ts`'s `PAGES`. |
| `RegexLab.tsx` | `/regex-lab` | Pick a regex pattern, watch live matches highlight in sample log lines. | Active `PATTERNS` selection; a `segment()` helper (memoized) computes highlighted spans over fixed `LOG_LINES`. | `TopNav`, `CodeListing`, `useDocumentTitle` | Self-contained. |
| `PageGallery.tsx` | `/` (root) | The app's real, eagerly-loaded homepage: every `PAGES` entry rendered as a card, grouped by `GROUP_TITLES`, filterable by search. | `query` state memoized into `matches`. | `data/pages.ts` (`PAGES`, `GROUP_TITLES`), `Tag` | The only page not lazy-loaded (with `NotFound`) since it's the most common landing point. |
| `ProgressDashboard.tsx` | `/progress-dashboard` | Streaks, a 14-day minutes chart, quiz accuracy, a completion donut, badges, an "up next" queue, and the "Your data" panel (export / import / reset). | Imports `streakOf`, `recentMinutes`, `isDue` directly (not just the hook) to compute derived stats each render (not memoized). Export/import/reset call `downloadProgress`, `parseProgressFile` + `useProgress().importState`, and `reset()` respectively; a `useRef` file input sits behind the Import button, and one `note` state carries the result line under the row. | `TopNav`, `Meter`, `useDocumentTitle`, `lib/progress.ts` (several standalone helpers), `lib/progressFile.ts`, `lib/api.ts` + `lib/auth.tsx` (for the storage blurb) | The single biggest consumer of `lib/progress.ts`, and the only page that acts on the whole blob at once. Links to `/flashcards`, `/quiz-mode`, `/git-branching`. |
| `VideoLesson.tsx` | `/video-lesson` | A mock video player (fixed timestamp/progress, no real `<video>`) with chapters, a synced transcript, and timestamped notes. | No local state/hooks beyond `useDocumentTitle`. | `TopNav`, `ImageSlot`, `CodeListing`'s `syn`, `useDocumentTitle` | Poster uses a real `src` (`src/assets/recursion-poster.svg`), not the empty placeholder. Links to `/quiz-mode`, `/code-playground`. |
| `Flashcards.tsx` | `/flashcards` | Flip cards, rate yourself, and the deck schedules real spaced-repetition reviews. | `index`/`flipped`/`rated` state; a `useMemo` (deliberately empty deps) freezes the due-card set for the session so rating doesn't reshuffle it. | `TopNav`, `useDocumentTitle`, `useProgress` (`rateCard` → `schedule()`), `data/httpDeck.ts` | Shares `state.cards` with `ProgressDashboard`, which links here from its "up next" queue. A session ends on a summary screen rather than looping. |
| `ApiAnatomy.tsx` | `/api-anatomy` | One real-looking HTTP request/response with numbered callouts. | Fully static — no hooks beyond `useDocumentTitle`. | `TopNav`, `Tag`, `useDocumentTitle` | Self-contained. |
| `ProjectBuildAlong.tsx` | `/project-build-along` | A capstone brief (log-watcher CLI): acceptance criteria, file-layout diagram, 5-item milestone checklist. | Milestones persist via `useProgress().toggleMilestone` under `"project-build-along:<index>"` keys; falls back to `INITIAL_DONE` until first interaction so it renders like the original mockup. | `TopNav`, `useDocumentTitle`, `useProgress` | Milestone text references CLI Basics, Regex Lab, and Git Basics concepts. |
| `GitBranching.tsx` | `/git-branching` | Four static SVG commit-graph frames showing one repo at four moments (linear → branch → diverge → merge). | Fully static — no local state. | `TopNav`, `Aside`, `useDocumentTitle` | Storyboard, not an interactive simulator (contrast `RebaseHistory`, which is). Linked from `ProgressDashboard`'s "up next" queue. |
| `BigOPerformance.tsx` | `/big-o-performance` | A growth-curve SVG chart plus complexity cards and a lookup-cost comparison table. | Fully static — no hooks beyond `useDocumentTitle`. | `TopNav`, `useDocumentTitle` | Self-contained. |
| `CodePlayground.tsx` | `/code-playground` | A FizzBuzz code challenge: brief, read-only solution listing, test checklist. | One `useState` (`passed`) flips the checklist and prints a canned output string — "running tests" is fully simulated, not real execution. | `TopNav`, `CodeListing`, `useDocumentTitle` | Self-contained. |
| `CheatSheet.tsx` | `/cheat-sheet` | Git commands in four columns, ordered to mirror a real work session rather than alphabetically. | "Print / PDF" calls `window.print()`; no hooks beyond `useDocumentTitle`. | `TopNav`, `useDocumentTitle` | **Defines its own local `Aside`-like callout instead of importing the shared `components/Aside`** — styled independently of `GitBranching`/`BigOPerformance`'s asides. |
| `SignIn.tsx` | `/sign-in` (only when `apiEnabled`) | Email/password form against the optional backend's `/api/auth/login`. | `email`/`password`/`error`/`busy` state; calls `useAuth().login`, redirects to `/` on success. | `TopNav`, `useDocumentTitle`, `lib/auth.tsx` | Not a lesson — deliberately excluded from `data/pages.ts`'s gallery registry (same reasoning as `DevHub.tsx`/`NotFound.tsx`). Links to `/sign-up`. The route is registered only in a build with `VITE_API_BASE_URL` set; otherwise it falls through to `NotFound`. |
| `SignUp.tsx` | `/sign-up` (only when `apiEnabled`) | Registration form; on success, calls `login` itself and redirects to `/`. | Same shape as `SignIn.tsx` plus `firstName`/`lastName`. | `TopNav`, `useDocumentTitle`, `lib/auth.tsx` | Also excluded from the gallery registry. Links to `/sign-in`. Same conditional registration as `SignIn.tsx`. |

## 8. Verification & audit scripts (`scripts/`)

Plain Node `.mjs` files (no test framework) driven by Playwright, run against `npm run preview`
(port 4173) unless noted otherwise.

| File | npm script | What it does | Depends on |
| --- | --- | --- | --- |
| `browser.mjs` | *(none — imported by others)* | Shared bootstrap: exports `BASE` (the preview URL, overridable via `VERIFY_BASE_URL`) and `openPage()`, which launches Chromium (via `findChromium()`, preferring a pre-installed binary) and returns `{browser, page}` with all non-`BASE`-origin requests blocked. | — |
| `routes.mjs` | *(none — imported by others)* | Pure data: exports `ROUTES`, the flat list of every app route. | — |
| `verify-routes.mjs` | `verify:routes` (1st leg of `verify`) | Loads every `ROUTES` entry, asserting real content, an `<h1>`, no console errors, no horizontal overflow. | `browser.mjs`, `routes.mjs` |
| `verify-responsive.mjs` | `verify:responsive` (2nd leg of `verify`) | Re-checks every route at 390/768/1280px for horizontal overflow, naming offending elements. | `browser.mjs`, `routes.mjs` |
| `verify-interactions.mjs` | `verify:interactions` (3rd leg of `verify`) | The largest script: a sequence of independent, banner-commented check blocks driving real interactions (quiz, flashcards, decorator sandbox, terminal mission, Shell Scripting's step-through, etc.) plus edge-case and persistence checks. | `browser.mjs` only (paths are hardcoded per block, not from `routes.mjs`) |
| `audit-content.mjs` | `audit:content` (not part of `verify`) | Extracts prose from the `.dc.html` prototypes in `../project/` and checks it survived into the mapped React source. Reads files directly — needs no browser or preview server. | Neither `browser.mjs` nor `routes.mjs` |
| `audit-a11y.mjs` | `audit:a11y` (the fourth leg of `verify`) | Checks WCAG text-contrast ratios and accessible names on every interactive control, across all `ROUTES`, then compares the result to `scripts/a11y-baseline.json` and fails only on a regression: a contrast pair not in the baseline, a rise in total failures with no new pair (a new page repeating an accepted bad pair), or any unnamed control. The inherited failures are real and accepted, so a plain pass/fail could only ever say "fail" — and a check that can never pass can't be gated on, which is how the count drifted 31 → 39 unnoticed. `-- --update-baseline` re-records, deliberately and with a reviewable diff. Needs `npm run preview` since it drives a browser. | `browser.mjs`, `routes.mjs`, `a11y-baseline.json` |
| `snapshot.mjs` | *(none — run directly with `node`)* | Capture mode (`node scripts/snapshot.mjs <dir>`) screenshots every route with animations frozen; compare mode (`--compare a b`) diffs two snapshot sets by hash, to prove a refactor was visually neutral. | `browser.mjs`, `routes.mjs` (capture mode only) |

## 9. How a page is wired end-to-end

Adding or changing a routable page touches up to four places, none of which import each other
to enforce consistency — they're kept in sync by convention, which is itself the source of at
least one real bug fixed in this codebase (Shell Scripting's dead sidebar link):

1. **`App.tsx`** — the lazy import and the `<Route path="/slug" element={<Page />} />`. This is
   the only place that actually makes the URL work.
2. **`data/pages.ts`**'s `PAGES` array — the gallery card (slug/title/kind/tone/blurb/group).
   Without an entry here, the page is reachable by URL but invisible in the gallery and its
   search.
3. **`scripts/routes.mjs`**'s `ROUTES` array — without an entry here, `verify:routes` and
   `verify:responsive` never visit the page, and it's silently unverified.
4. **Any other page that links to it** — `ConceptSidebar` items (`to` field) and `Roadmap`
   chips point at a route by string; a typo or a missing `to` doesn't error, it just silently
   renders an unclickable label (see `ConceptSidebar.tsx`'s `SidebarItem.to` doc comment).

## 10. Relationship to the rest of the project

This `app/` directory is the only thing that's actually deployed. The repo root also carries
the original design handoff this was built from — `project/`'s 23 `.dc.html` prototype files
and `chats/`'s design-session transcripts — which are historical reference, not part of the
running app. `scripts/audit-content.mjs` is the one piece of tooling that still reads `project/`
directly, to check that the prose in each prototype survived the port into the corresponding
React page.

Two pages (`RebaseHistory.tsx`, `ShellScripting.tsx`) and the `NotFound.tsx` 404 page have no
corresponding prototype at all — they were added after the port, in the app's own style, to
close gaps the prototypes either named but never designed (Rebase & History) or left as a dead
link (Shell Scripting), or that the prototypes simply didn't need to model (a 404 page has no
place in a static design mockup).

This app is also listed as a portfolio card in a separate, unrelated repo
(`websitehub` — Angular + Spring Boot), which links to the live GitHub Pages URL and shows a
screenshot of the gallery page. That repo has no code dependency on this one; the link is
purely presentational and kept up to date by hand.

## 11. Optional backend (`server/`)

A separate Spring Boot app, built from this machine's `scaffold-spring-backend` skill template and
adapted for Dev Hub. It exists for exactly one reason: letting `lib/progressSync.ts` carry the same
`ProgressState` blob across devices for a learner who signs in. Nothing else in the app depends on
it, and the deployed GitHub Pages build doesn't have one configured at all.

- **Stack:** Spring Boot 4 / Java 21 / Maven, `NamedParameterJdbcTemplate` (no JPA/Flyway — an
  idempotent `schema.sql`, run by hand), stateless JWT auth, package `com.devhub.backend`.
- **`/api/auth/register`, `/api/auth/login`, `/api/auth/profile`** — the template's stock user
  aggregate (`UserQuery`→`UserRowMapper`→`UserRepo`/`Impl`→`UserService`/`Impl`→`AuthController`),
  unmodified beyond the package rename.
- **`/api/progress`** (`GET`/`PUT`, both requiring a Bearer token) — the one addition. A `Progress`
  aggregate following the same layering, storing the frontend's whole `ProgressState` object as an
  opaque JSON column (`user_progress.data`) keyed by `user_id`, rather than modeling quizzes/cards/
  milestones/activity as their own relational tables — a deliberate simplification, since the
  frontend already treats the blob as one versioned unit (`lib/progress.ts`'s `ProgressState`).
  Each request is scoped to the caller's own id via `@AuthenticationPrincipal`, never a client-
  supplied one, so no extra authority rule is needed beyond `SecurityConfig`'s existing
  `anyRequest().authenticated()` catch-all.
- **CORS** is opened for `http://localhost:5173` (dev) and `https://bbobbylon.github.io` (prod),
  alongside the template's other default dev-port origins.
- **Not deployed anywhere.** It builds (`mvn package`) and that's as far as this pass took it — see
  `DEPLOYMENT.md` and `BACKLOG.md` for what standing up a real, hosted instance would require.
- **A build with no backend hides the account layer entirely.** `apiEnabled` (`lib/api.ts`) is
  `false` when `VITE_API_BASE_URL` wasn't set, and on that flag `App.tsx` skips registering
  `/sign-in` and `/sign-up`, `TopNav` drops its "Sign in" link, and `scripts/routes.mjs` stops
  expecting the two routes. The forms' own "Sign-in isn't available in this deployment" guard in
  `lib/auth.tsx` stays as the backstop, but nothing in the UI should reach it. The learner isn't
  left without a way to move progress between browsers either — that's what `lib/progressFile.ts`'s
  export/import is for, and it needs no backend at all.
- **A shared-template bug fixed along the way:** the `scaffold-spring-backend` skill's template
  didn't compile as-is against Spring Boot 4.0.6, because Boot 4 pulls Jackson 3, which moved
  `ObjectMapper`/`JsonNode` out of `com.fasterxml.jackson.databind` into `tools.jackson.databind`
  (annotations like `@JsonInclude` stayed put). `CustomAuthFilter`, `CustomAccessDeniedHandler`, and
  `CustomAuthenticationEntryPoint` all needed that one import fixed. Both this copy and the shared
  template at `~/.claude/skills/scaffold-spring-backend/template/` were corrected, so future
  scaffolds off that skill won't hit the same failure.
