# Software Requirements Specification — Dev Hub

_Last updated: 2026-09-08 — describes the 25-page app on the `implement-design-handoff` branch._

## 1. Executive Summary

- **Project:** Dev Hub (repo: `devhub`), v1.0 — live since 2026-09-06.
- **Purpose:** a free, self-contained coding-fundamentals learning app — lessons, quizzes,
  spaced-repetition flashcards, and hands-on tools — with real progress tracked entirely in the
  learner's own browser, no account or server required.
- **Stakeholder:** built and maintained by a single developer (Bobby) as a portfolio piece,
  ported from a Claude Design HTML/CSS/JS handoff into a production React app.

## 2. System Overview

**Problem it solves:** the original design handoff was a set of static, non-functional mockups
— every "quiz score" and "4-day streak" shown in them was a hardcoded number. Dev Hub turns
those mockups into a real, working learning tool where progress persists and reflects actual
use, while costing nothing to run or host.

**Users:** anyone learning developer fundamentals — the app assumes no account and no backend,
so it's equally usable by one person across sessions on one device, or by many people trying it
anonymously (progress is per-browser, not shared).

**Main features:**
- 25 standalone interactive lesson/tool pages spanning CLI/shell, Git, algorithms, data
  structures, APIs, architecture, and framework concepts, plus a searchable gallery indexing all
  of them.
- Real progress persistence: quiz scores, SM-2 spaced-repetition flashcard scheduling, milestone
  checklists, streaks, and time-on-page — all local to the browser.
- A Progress Dashboard surfacing that data as a streak, a 14-day activity chart, a completion
  donut, and an "up next" queue.
- A five-stage Roadmap and a Dev Hub landing catalog, both reflecting lock/done/current state.
- A 404 page and end-to-end search, replacing decorative/absent behavior in the original mockups.

## 3. Functional Requirements

- **Gallery & navigation (`PageGallery`, `App.tsx`, `data/pages.ts`)** — every page is reachable
  from one searchable, grouped card gallery at `/`; typing in the search box filters the grid
  live with a real empty state. Unknown URLs render a 404 page (`NotFound.tsx`) rather than
  redirecting silently.
- **Lesson pages (`src/pages/*.tsx`, 25 files)** — each teaches one concept via whatever
  interaction fits it best: a step-through code walkthrough (Shell Scripting, Rebase & History,
  Algorithm Visualizer), a labeled diagram (API Anatomy, Architecture Deep Dive, Data Structures
  Visual), a checkpoint quiz (Quiz Mode, CLI Basics), a spaced-repetition deck (Flashcards), a
  simulated terminal or code editor (Terminal Simulator, Code Playground), or a dense reference
  (Cheat Sheet, Glossary). See `docs/ARCHITECTURE.md` §7 for the full page-by-page breakdown.
- **Quizzes** — a learner answers a fixed question bank one at a time, sees per-question
  feedback and an explanation, and receives a final score; passing a checkpoint marks the
  associated concept complete and records a personal-best score across attempts.
- **Flashcards** — a deck of cards uses real SM-2 spaced repetition (`lib/progress.ts`'s
  `schedule()`): rating a card "again"/"good"/"easy" reschedules its next due date; a study
  session only includes cards currently due, and ends (with a summary) rather than looping the
  last card forever.
- **Milestone checklists (Project Build-Along)** — a fixed list of capstone milestones can be
  checked/unchecked, and the checked state survives a reload.
- **Progress Dashboard** — reads and displays, without any hardcoded numbers: current streak,
  hours studied this week, concepts completed, quiz accuracy, a 14-day minutes-per-day chart, a
  completion donut, and cards due for review; includes a reset control that wipes all progress
  after the learner is told it never leaves the device.
- **Search** — both the Dev Hub landing catalog and the Page Gallery filter their contents live
  against a query string, with an empty state when nothing matches.
- **Copy-to-clipboard** — cheat-sheet code panels (CLI Basics, Shell Scripting) let a learner
  copy the exact runnable command sequence, excluding any display-only comparison lines, with a
  transient "Copied!" acknowledgement.

## 4. Non-Functional Requirements

- **Performance:** every page except the gallery and 404 is code-split via `React.lazy`, so a
  visit only downloads the JS for the page(s) actually viewed (see `docs/ARCHITECTURE.md` §2-3).
- **Availability:** static hosting only (GitHub Pages) — no server-side component can go down.
  A render crash on one page is caught by `ErrorBoundary` and doesn't take down the rest of the
  app.
- **Data durability & privacy:** all progress lives in `localStorage` under one namespaced key
  (`dev-hub.progress.v1`); nothing is transmitted anywhere. This is a deliberate trade-off —
  progress does not sync across devices or browsers, and clearing site data erases it.
- **Accessibility:** every interactive control has an accessible name; keyboard focus is visible
  via the design system's 2px accent ring; tab order follows visual order. Text contrast targets
  WCAG AA (4.5:1) for body-size text on light grounds — see `docs/UI-DESIGN.md` §5 for the
  specific ramp step used and the known, deliberate exceptions (dark-ground code/terminal
  surfaces, and the accent-fill buttons/labels tuned to ~3:1 by the design system itself).
- **Responsiveness:** every route is verified to render with no horizontal overflow at 390px
  (phone), 768px (tablet), and 1280px (laptop) viewport widths.
- **Cost:** $0/month — a pure client-rendered static site with no backend, no database, and no
  paid hosting tier (see `DEPLOYMENT.md`).
- **Fidelity to source design:** every page ported from the original Claude Design handoff
  preserves that handoff's observable content and behavior, verified by an automated
  content-fidelity audit (`npm run audit:content`) rather than manual comparison.

## 5. User Stories

- As a learner, I want to browse all lessons in one searchable place so I can find a topic
  quickly instead of scrolling a long list.
- As a learner, I want my quiz scores and flashcard progress to persist across visits so
  repeated study actually accumulates instead of resetting every time I reopen the app.
- As a learner, I want flashcards to only show me what's actually due today so I'm not wasting
  time re-reviewing cards I already know well.
- As a learner, I want a dashboard that shows my real activity (streak, time studied, accuracy)
  so I have honest feedback on my progress, not a static demo number.
- As a learner, I want to reset my progress and be told exactly what that does (and that it's
  local-only) so I can start over without surprise data loss elsewhere.
- As a returning learner, I want a broken or old link to land me on a helpful 404 page rather
  than silently redirecting somewhere I didn't ask for.

## 6. Success Criteria

- All 26 routes (25 lesson/tool pages + the gallery) render without console errors, at all three
  verified breakpoints — enforced by `npm run verify` before any deploy.
- All 85 interaction checks in `scripts/verify-interactions.mjs` pass, covering every stateful
  page's actual behavior (quiz flow, flashcard scheduling, milestone persistence, step-through
  gating, search, and more).
- The content-fidelity audit (`npm run audit:content`) reports only known, explained extractor
  artifacts — never a genuinely dropped phrase from the original design.
- The accessibility audit (`npm run audit:a11y`) reports zero unnamed interactive controls and a
  documented, non-regressing set of contrast exceptions.
- The live site smoke-tests clean after every deploy: correct card count, working 404 fallback,
  progress surviving a reload, no console errors (see `DEPLOYMENT.md`'s go-live checklist).

## 7. Constraints

- **No backend, no account, no database** — this is a hard design constraint, not a phase-1
  simplification; multi-device progress sync is explicitly out of scope.
- **Static hosting only** — GitHub Pages serves the app from a sub-path
  (`/dev-hub/`), which constrains routing (`BrowserRouter`'s `basename`) and asset URLs
  (`vite.config.ts`'s `base`) — see `DEPLOYMENT.md`.
- **Content fidelity to the design handoff** — pages ported from a `.dc.html` prototype must
  preserve that prototype's observable content/behavior; changes are additions (progress
  persistence, search, a 404 page) layered on top, not replacements of the original design.
- **Single-maintainer project** — no CI-enforced code review process; correctness is enforced by
  the `scripts/` verification toolchain run locally before a push.
