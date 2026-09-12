# Backlog — Dev Hub

_Last updated: 2026-09-12._ Feature ideas and known gaps, roughly ranked. Nothing here is scheduled
— this is a scan of the codebase plus the natural follow-ups from adding the optional account/sync
layer (`docs/ARCHITECTURE.md` §11), for the next time work picks back up.

**Shipped since the last update (2026-09-12):** item 22 — a completed concept can now be
un-marked, one concept at a time, instead of a mis-click costing the whole progress blob. Earlier
sessions closed items 6, 14, 16, 17, 18 and 19; each is struck through in place below with what
was actually done, rather than summarised here.

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

6. ~~**Most lesson pages never call `useProgress()` at all.**~~ — **done 2026-09-11.** The
   diagnosis, kept because it explains the shape of the fix: `completeConcept()` had exactly *one*
   call site in the entire app (`QuizMode.tsx`, on a passing score, for `git-basics`), so "concepts
   done" could only ever read 0 or 1 of 23 — which is why `Roadmap.tsx` floored its count at the
   design's `BASELINE_DONE = 8` rather than showing the truth.

   Now: `data/concepts.ts` is a registry of all 20 concepts the app can teach — slug, label, the
   route that teaches it, its Roadmap stage (or `null` for the ones off the five-stage path), and
   the action that earns it. Each of those pages ends with a shared `<ConceptComplete>` panel that
   either records the concept the moment the page's own condition fires (walkthrough stepped to the
   end, tests run green, mission finished, quick quiz aced) or offers a button where the page has
   no such moment. `BASELINE_DONE` is gone, and every chip, stage badge and count on the Roadmap is
   derived from `state.concepts`. Counting goes through `pathDone()`/`offPathDone()` rather than
   `Object.keys(state.concepts).length`, so an off-path concept can't move a figure labelled
   "Backend path" — that invariant plus completion-survives-reload and reset-doesn't-un-complete
   are pinned by 18 new checks in `verify-interactions.mjs` (113 total).

   Deliberately *not* wired: `Glossary` and `CheatSheet` are look-it-up references you never
   "finish", and `Flashcards` already has its own SM-2 state in `state.cards`. See items 24-26 for
   what this exposed.
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
16. ~~**`TOTAL_CONCEPTS = 23` is a hardcoded denominator**~~ — **done 2026-09-11.** It turned out to
    be written three times, not once: `ProgressDashboard.tsx`, `Roadmap.tsx`, and as the string
    `'23 concepts'` in `CourseComplete.tsx`'s certificate. All three now read `data/curriculum.ts`,
    which also records *why* it isn't `PAGES.length` — a concept is a unit of the designed path, a
    page is one of ~26 screens. The numerator arrived with item 6, and the denominator turned out
    to be wrong: see item 23.
17. ~~**`DECK` duplicates the Flashcards deck's tags**~~ — **done 2026-09-11.** The deck moved to
    `data/httpDeck.ts`; `Flashcards` renders `CARDS`, the dashboard counts `DECK_TAGS` derived from
    them, and the "(HTTP deck)" label now comes from `DECK_NAME` too.
18. ~~**The a11y audit has no regression guard.**~~ — **done 2026-09-11**, but the reason first
    recorded here was wrong and is worth correcting rather than quietly deleting. The claim was that
    `audit:a11y` "always exits 0". It never did: it exits 1 whenever it finds anything. The real
    problem was the opposite — with 39 accepted inherited failures it could only ever exit 1, so it
    could never pass, could never be gated on, and therefore wasn't in `npm run verify` and wasn't
    in CI. A check nobody can run is indistinguishable from one that doesn't fail, which is how the
    count drifted 31→39 unnoticed. Now baselined in `app/scripts/a11y-baseline.json`: the audit
    fails on a new contrast pair, on a rise in total failures with no new pair (the "new page
    repeats an accepted pair" case, i.e. the one that actually happened), or on any unnamed control,
    and it's the fourth leg of `npm run verify`. Both failure paths were tested by deliberately
    injecting each. **Still open:** put the newer pages (Shell Scripting is the worst at 7 lines)
    through the same `-700` ramp treatment the original pass applied, and shrink the baseline as
    that lands.
19. ~~**The workflow's actions all target deprecated Node 20.**~~ — **done 2026-09-11.** Bumped to
    `checkout@v7`, `configure-pages@v6`, `setup-node@v7`, `upload-pages-artifact@v5` and
    `deploy-pages@v5`, and the build's own `node-version` from 22 to 24 to match what development
    actually runs on. One breaking change came with it and is called out in the workflow: since
    `upload-pages-artifact@v4`, hidden files are excluded from the artifact — harmless today
    (`app/dist` is `index.html` plus `assets/`), but a future `.nojekyll` would need
    `include-hidden-files: true`.
20. **`SignIn`/`SignUp` chunks still ship in a backend-free build.** They're `lazy()`-declared in
    `App.tsx` whether or not the routes are registered, so Rollup emits both chunks and nothing ever
    fetches them. Tiny (~2 kB gzipped each) and harmless, just untidy — a conditional dynamic import
    would drop them.
21. **The sign-in and sign-up pages barely say anything.** They're the two routes that trip
    `verify-routes.mjs`'s render floor (144 and 177 chars) — a heading, two fields, a button, and no
    explanation of what an account actually gets you, which is the one question someone on that page
    has. Fixing the copy would also remove the need for their special-cased floor.

## Found while working (2026-09-11, second pass)

Turned up while wiring concept completion (item 6). Numbered from 22 so earlier references hold.

22. ~~**A completed concept can't be un-completed.**~~ — **done 2026-09-12.** Both halves of the
    suggested fix, since each needed the other: `lib/progress.ts` grew `clearConcept(slug)` (it
    *deletes* the key rather than storing an undo timestamp — every counter tests for the slug's
    presence, so an un-completed concept has to look exactly like one that was never completed),
    and `<ConceptComplete>` offers it as "Un-mark complete". Labelled that, not "Undo", because
    `DecoratorPattern` already has an Undo button for its own condiment stack and two of them on
    one page would be ambiguous to a learner and to `verify-interactions.mjs` alike.

    Two things the naive version gets wrong, both now pinned by checks that were made to fail
    first. (1) **Un-marking on a still-earned page bounces straight back**: the panel's
    record-on-`earned` effect re-fires on the very next render when the walkthrough is still on its
    last frame, so the un-mark sets a local flag that suppresses it for as long as `earned` stays
    true, cleared when `earned` goes false so a fresh earning records again. (2) That turned what
    had been a habit into a contract — **`earned` must describe a moment in this visit, not a state
    the store remembers** — and `ProjectBuildAlong` was the one page breaking it: its condition was
    the persisted "every milestone ticked", so leaving and returning re-recorded the concept. It
    now passes the transition (`allDone && wasIncomplete`) instead.

    `QuizMode` was the other gap: `git-basics` was recorded by a bare `completeConcept()` call with
    no panel on the page, so the one concept behind a checkpoint was the one concept with no way
    back. It now renders `<ConceptComplete earned={passed}>` below the score card — but only once
    an attempt has passed, or an earlier one did (which keeps the un-mark reachable after a failed
    retry), since the quiz rather than the learner is the authority on that concept. Un-marking it
    leaves the attempt and the personal best intact, which is the whole point of not reaching for
    Reset progress. Interactions 113 → 132.
23. **The Roadmap said 23 concepts while listing 25, and had for the whole port.** The prose read
    "Five stages, twenty-three concepts"; the chips enumerated 3 + 4 for the built stages and "— 6
    concepts" for each of the three locked ones. Fixed by deriving `TOTAL_CONCEPTS` from the list
    rather than restating it (`UPCOMING_STAGES` in `data/curriculum.ts`), so the two can't disagree
    again — but worth recording that a hand-written total was wrong by two for as long as it was
    hand-written, which is the argument for item 16's whole approach.
24. **Two path concepts have no page to earn them on.** "Environment Variables" (stage 1) and
    "Staging & Commits" (stage 2) are named by the design and taught nowhere, so they now render as
    permanently grey unlinked chips — honest, but it means stage 1 can never reach COMPLETE. Either
    build the two lessons or drop them from the path.
25. **Completing everything the app has tops out at 5 of 25 (20%).** Only 5 of the 7 path concepts
    have pages (item 24) and stages 3-5 are placeholders, so the Roadmap's bar is capped at a fifth
    even for a learner who finishes every lesson. The other 13 concepts the app teaches sit off the
    path and are counted separately ("+N off-path" under the dashboard tile) rather than inflating
    it. Not wrong, but the path bar is a weak reward until stages 3-5 exist.
26. **`audit:a11y` can never pass in an API-enabled build.** `a11y-baseline.json` was recorded over
    the 26-route configuration, so `/sign-in` and `/sign-up`'s own contrast pairs are absent from
    it and report as `NEW` every time — a guaranteed FAIL whenever `VITE_API_BASE_URL` is set. The
    script already declines to compare *totals* across differing route counts; it needs the same
    treatment for pairs (a second baseline, or recording the auth pages' pairs unconditionally).
    Same shape as item 18: a check that can't pass in one configuration is one nobody runs there.

## Found while working (2026-09-12)

Turned up while adding the un-mark control (item 22). Numbered from 27 so earlier references hold.

27. **The interaction-check count is hand-written in `docs/SRS.md` and had already drifted.** §6 read
    "All 95 interaction checks pass" while the suite was on 113 — the count moved twice without the
    prose following, which is item 16's problem in a document instead of a component. It reads 132
    now, and will be wrong again the next time a check is added. Either drop the number ("every
    check in `verify-interactions.mjs` passes" needs no maintenance) or have the script write it
    somewhere the docs can cite.
28. **A stale `vite preview` can silently take the port the suites verify against.** Eleven orphaned
    preview servers from earlier sessions were holding 4173-4182; `npm run preview` reports "Port
    4173 is in use, trying another one..." and happily starts on 4183, while `scripts/browser.mjs`
    still points `BASE` at 4173 — so a verify run either can't connect or, worse, passes against
    whatever *that* server is serving. `vite preview --strictPort` would turn it into a loud failure
    at the point the mistake is made; a `verify` that started and owned its own preview would be
    better still.
29. **Un-marking a concept means going back to its page.** `<ConceptComplete>` is the only place
    `clearConcept()` is wired, so tidying up a wrongly-recorded concept means navigating to the page
    that recorded it — fine for a mis-click you notice immediately, awkward for cleaning up several.
    The Progress Dashboard has the whole record in hand and no per-concept view; a list there, next
    to "Your data", would be the natural home (and would cover `environment-variables` and
    `staging-commits`, which no page can reach at all — see item 24).
