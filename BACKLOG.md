# Backlog — Dev Hub

_Last updated: 2026-09-11._ Feature ideas and known gaps, roughly ranked. Nothing here is scheduled
— this is a scan of the codebase plus the natural follow-ups from adding the optional account/sync
layer (`docs/ARCHITECTURE.md` §11), for the next time work picks back up.

**Shipped since the last update (2026-09-11):** the account UI is now gated on `apiEnabled`, so a
backend-free build has no `/sign-in` route and no "Sign in" link rather than a form that fails on
submit; and item 14, export/import progress as a JSON file (`app/src/lib/progressFile.ts`), which
was the cheap answer to "I want my progress on another browser" that doesn't need item 1 first.

## Backend / account

1. **Host the backend somewhere real.** `server/` builds (`mvn package`) but isn't deployed — sign-in
   only works when `VITE_API_BASE_URL` points at a running instance. Needs a host (Railway/Render/
   Fly.io free tier, or paid) plus a real MySQL instance — the first place this stops being
   $0/month — and `VITE_API_BASE_URL` wired into `.github/workflows/deploy-pages.yml` as a build-time
   variable. See `DEPLOYMENT.md`'s "optional backend is not deployed" section. Note that setting
   that variable also switches the account routes back on (and `scripts/routes.mjs` with them), so
   the sign-in/sign-up pages need a real smoke test the first time a deploy carries it.
2. **Real merge on sign-in, not "server wins."** `lib/progressSync.ts` currently overwrites local
   progress wholesale with whatever the server has on sign-in. Fine for one device, lossy for two —
   studying on a phone, then signing into the same account on a laptop with different local
   progress, silently drops whichever side didn't just pull. A field-level merge (e.g. per-quiz
   `lastAt`, per-card `dueAt`, latest wins) would fix this; not attempted yet since it needs real
   usage to know which conflicts actually matter.
3. **JWT hardening.** Single access token only, no refresh/rotation, no MFA — the scaffold template's
   documented gap, inherited as-is. Fine for a portfolio project; worth revisiting if this ever holds
   anything more sensitive than lesson progress.
4. **No automated backend tests.** The template ships none and this pass didn't add any either. At
   minimum, `ProgressServiceImpl`'s JSON-validation branch and the auth flow are worth covering.
5. **Thin account UX.** No password change, no account deletion, no "last synced" indicator. Sign
   in/up/out is the whole surface today.

## Content gaps (pre-existing, found while reviewing the app for this pass)

6. **Most lesson pages never call `useProgress()` at all** — `TerminalSimulator`,
   `DebuggingChallenge`, `ApiAnatomy`, `GitBranching`, `BigOPerformance`, `DataStructuresVisual`,
   `FrameworkComparison`, `RegexLab`, `CodePlayground`, `AlgorithmVisualizer`,
   `ArchitectureDeepDive`, `Glossary`, and `CheatSheet` don't mark their concept complete or record
   any activity beyond the global time-on-page tracker. The Roadmap/Progress Dashboard's completion
   counts only reflect a handful of pages (`CliBasics`, `QuizMode`, `DecoratorPattern`,
   `ProjectBuildAlong`, `Flashcards`) — wiring `completeConcept()` into the rest would make "concepts
   completed" mean what it claims to.
7. **`CourseComplete.tsx`'s certificate stats are hardcoded**, not read from `useProgress()` — per
   `docs/ARCHITECTURE.md` §7, this was already known and never fixed.
8. **`Glossary.tsx` only renders "A" terms** — the alphabet strip is otherwise decorative chrome with
   nothing behind the other 25 letters.
9. **`CodePlayground`'s "running tests" is fully simulated** — a canned pass output, no real
   execution. Real in-browser execution (a sandboxed `Function`/Web Worker) would make the pass/fail
   state honest instead of scripted.
10. **`Roadmap.tsx` stages 3–5 are locked placeholders** with no content behind them yet — the
    five-stage journey only has two real stages.

## Nice-to-haves (not gaps, just ideas)

11. **Dark mode / theme toggle** — no theming beyond the one "Organic" light palette today.
12. **A command palette** (Cmd/Ctrl+K) for jumping to any page — today's only navigation aid is the
    gallery's own search box.
13. **Unit tests for the pure logic** — `lib/progress.ts`'s `schedule()` (SM-2) and `streakOf()` are
    both pure functions with real edge cases (ease floor, day boundaries) and no test coverage;
    today's verification is all Playwright e2e, nothing at the function level.
14. ~~**Export/import progress as a downloadable JSON file**~~ — **done 2026-09-11.** The Progress
    Dashboard's "Your data" panel exports a dated `dev-hub-progress-YYYY-MM-DD.json` and reads one
    back; `lib/progressFile.ts` validates a restore field by field. Ten checks in
    `verify-interactions.mjs` cover the round trip and the refusals. What's still missing is a
    *merge* on import (it replaces, exactly like item 2's server-wins sync) and any way to import
    from the pages themselves rather than the dashboard.

## Found while working (2026-09-11)

Noticed in passing while gating the account UI and adding the backup file — none of it blocked that
work, all of it is real. Numbered from 15 so the references above stay valid.

15. **Half the Progress Dashboard is still hardcoded**, which is item 7's problem on a bigger page.
    `BADGES` always shows "Terminal Tamer" and "7-Day Flame" as earned and "Bug Hunter · 2 of 5
    cases" / "First Path · 34%" as fixed text; "Weakest topic by quiz score" is pinned to "Exit
    codes" regardless of the actual scores in `state.quizzes`; and `UP_NEXT_TEMPLATE`'s labels and
    "4 min"/"5 min"/"6 min" estimates are fixed, with only the flashcard due count swapped in live.
    The stat tiles, chart and donut around them are all real, which makes the fake parts *more*
    conspicuous, not less.
16. **`TOTAL_CONCEPTS = 23` is a hardcoded denominator** in `ProgressDashboard.tsx`, driving both
    "Concepts done · of 23" and the completion donut, while the app now ships 25 pages. Worth
    deciding whether 23 is a deliberate count of *concepts* (distinct from pages) or just drift —
    and if the former, saying so in a comment, because nothing in the file explains the number.
17. **`DECK` duplicates the Flashcards deck's tags** as a literal array in the dashboard, purely to
    compute "cards due". Change the deck in `Flashcards.tsx` and the dashboard's due count silently
    goes wrong. The deck should be one exported list both pages read.
18. **The a11y audit has no regression guard.** `audit:a11y` prints its count and always exits 0, so
    new pages quietly add contrast failures — it went 31→39 across 20 pairs between passes, entirely
    from pages added since the ramp fix, and nobody noticed until this session. A `--max` threshold
    or a checked-in baseline file would make `docs/SRS.md`'s "documented, non-regressing set of
    contrast exceptions" actually enforced instead of aspirational. The related content fix is to
    put the newer pages (Shell Scripting is the worst at 7 lines) through the same `-700` ramp
    treatment the original pass applied.
19. **The workflow's actions all target deprecated Node 20.** Every deploy now logs a warning that
    `actions/checkout@v4`, `configure-pages@v5`, `setup-node@v4`, `upload-artifact@v4` and
    `deploy-pages@v4` are being force-run on Node 24. They still work; bump them before a runner
    change makes it a failure instead of an annotation.
20. **`SignIn`/`SignUp` chunks still ship in a backend-free build.** They're `lazy()`-declared in
    `App.tsx` whether or not the routes are registered, so Rollup emits both chunks and nothing ever
    fetches them. Tiny (~2 kB gzipped each) and harmless, just untidy — a conditional dynamic import
    would drop them.
21. **The sign-in and sign-up pages barely say anything.** They're the two routes that trip
    `verify-routes.mjs`'s render floor (144 and 177 chars) — a heading, two fields, a button, and no
    explanation of what an account actually gets you, which is the one question someone on that page
    has. Fixing the copy would also remove the need for their special-cased floor.
