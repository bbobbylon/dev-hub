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
