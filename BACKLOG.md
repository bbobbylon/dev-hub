# Backlog — Dev Hub

_Last updated: 2026-09-13._ Feature ideas and known gaps, roughly ranked. Nothing here is scheduled
— this is a scan of the codebase plus the natural follow-ups from adding the optional account/sync
layer (`docs/ARCHITECTURE.md` §11), for the next time work picks back up.

**Shipped since the last update (2026-09-13):** item 9 — Code Playground's "run tests" now
executes the real solution source in a sandboxed Web Worker and grades the checklist off actual
captured output, instead of a scripted pass; see its entry below for the Python→JavaScript
translation this required. Same day: item 26 — the two contrast pairs that made `audit:a11y` fail
on any API-enabled build were real bugs, not inherited ones, and are fixed rather than baselined:
`TopNav`'s dark variant now sets a base text color, and the sign-in/sign-up cross-links use the
design system's deep accent ramp step for paragraph-size text. Same day: item 21 — both account
pages' subtitle now explains what an account gets you, which incidentally cleared
`verify-routes.mjs`'s general render floor, so their special-cased lower one is gone. Investigated
and corrected rather than shipped: item 20's suggested fix (a conditional dynamic import) was tried
and doesn't actually work — see its entry below for why, and what would.

**Shipped 2026-09-12:** item 27 — `docs/SRS.md` §6 no longer states a fixed
interaction-check count (it had already drifted twice, 95 → 132 → 155 → 170 by hand); it now says
"every check ... passes," which can't go stale. Earlier the same day: item 28 — `npm run verify` now
starts and owns its own preview server (`scripts/run-verify.mjs`, via Vite's JS API with
`strictPort: true`) instead of assuming one is already up on 4173, so a stale server from an earlier
session fails loudly instead of silently taking a different port while the suites keep checking the
wrong one. Earlier the same day: items 29 and 24 — the Progress Dashboard's new
"Your concepts" panel un-marks any concept without returning to its page, and is the only place
"Environment Variables" and "Staging & Commits" can be marked at all, since neither has a lesson
page. Earlier the same day: items 15 and 7 — the Progress Dashboard's badges, weakest-topic
callout, and "up next" queue, plus the Course Complete certificate, now read real state instead of
fixed placeholder content. Earlier still: item 22, a completed concept can now be un-marked, one
concept at a time, instead of a mis-click costing the whole progress blob. Earlier sessions closed
items 6, 14, 16, 17, 18 and 19; each is struck through in place below with what was actually done,
rather than summarised here.

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
7. ~~**`CourseComplete.tsx`'s certificate stats are hardcoded**~~ — **done 2026-09-12.** The name,
   date, and capstone count are now real: a signed-in learner's name from `useAuth()` (or "You" —
   most deployments run with no backend at all, so that's the common case, not a fallback edge
   case), today's date, and whether `project-build-along` is actually recorded in `state.concepts`
   rather than a fixed "Ada Moreno" / "August 30, 2026" / "1 capstone shipped". Deliberately left
   static: the path title ("Terminal & Shell") and the certificate's shareable id. This page isn't
   gated behind actually finishing a path — items 24-25 record why stage 1 can't reach COMPLETE at
   all yet — so there's no real multi-path state for the title to read from, and the id reads as a
   serial-number prop on the template rather than a claim about anyone's progress. Worth revisiting
   once (if) a path can actually be completed: at that point this page probably wants a real gate
   and a title that names *which* path, not just Stage 1's.
8. **`Glossary.tsx` only renders "A" terms** — the alphabet strip is otherwise decorative chrome with
   nothing behind the other 25 letters.
9. ~~**`CodePlayground`'s "running tests" is fully simulated**~~ — **done 2026-09-13.** "Run tests"
   now executes the solution's exact source for real, in a Web Worker (`lib/sandboxRun.ts`, its own
   realm, no DOM, timeout-guarded against infinite loops), and grades all 4 checklist items off the
   `console.log` output that run actually produced — a broken solution genuinely fails here now.
   Translated the exercise from the prototype's Python to JavaScript, since a Worker can only run JS
   without pulling in a WASM runtime (Pyodide) disproportionate to one exercise; the read-only
   listing still shows exactly what's executed. This adds a 5th known `audit:content` extractor
   artifact (the expected-output string is now computed at runtime, not a static literal) —
   documented in `app/README.md`, verified byte-identical to the prototype's output by hand.
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

15. ~~**Half the Progress Dashboard is still hardcoded**~~ — **done 2026-09-12.** All four badges now
    carry a real `earned` condition, computed in-component rather than typed as fixed `true`/
    `false`: Terminal Tamer off every routed Stage-1 concept (`cli-basics`, `shell-scripting` —
    `environment-variables` has no page, so it's excluded rather than blocking the badge forever),
    7-Day Flame off the real `streakOf()` value, Bug Hunter off `debugging-challenge`'s completion,
    First Path off the path percentage reaching 100. The two that used to print an invented stat
    ("2 of 5 cases" — the Debugging Challenge page has exactly one case, never five; "34%") now
    print a real one, and Bug Hunter's icon swaps from a lock to the actual bug icon once earned,
    since a lock reads oddly on something no longer locked.

    "Weakest topic by quiz score" needed a schema change to answer honestly: `QuizRecord` gained
    an optional `topics` field (correct/total per question topic, from the *most recent* attempt,
    not accumulated — a topic you've since nailed shouldn't stay "weakest" forever over one early
    miss), `QuizMode` tallies it from the same `results` array it already had and hands it to
    `recordQuiz`, and a new `weakestTopic()` in `lib/progress.ts` picks the lowest-accuracy one
    (ties break to whichever was recorded first, i.e. question order). `lib/progressFile.ts`'s
    paranoid field-by-field validation covers the new field the same way as everything else —
    drop a malformed topic entry, not the whole quiz record. Before any checkpoint is taken the
    panel says so ("No checkpoints yet" / "Take one →") rather than showing something invented.

    The "up next" queue's other two slots were re-derived rather than patched: the checkpoint slot
    now reads real `Take`/`Retry`/`Review` off `state.quizzes[QUIZ_ID]` against `PASS_MARK` (both
    moved to a new `data/gitBasicsQuiz.ts`, alongside the question bank itself, so the dashboard
    and `QuizMode` share one literal instead of two), and the third slot names the actual next
    not-yet-complete lesson from `data/concepts.ts` (path concepts first, off-path as a fallback,
    skipping `git-basics` since the checkpoint slot already covers it). The per-item minute
    estimates and the panel's "up next — 15 minutes total" header are gone rather than replaced
    with a better guess — no page in the app records how long it takes, so there was nothing
    honest to put there.
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
    fetches them. Tiny (~2 kB gzipped each) and harmless, just untidy. **Tried and corrected
    (2026-09-13):** the suggested fix ("a conditional dynamic import would drop them") doesn't work —
    tested by actually building both ways. Rollup creates a chunk for any `import()` expression it
    finds anywhere in the module graph, regardless of a runtime/build-time condition wrapped around
    it (`apiEnabled ? lazy(() => import('./pages/SignIn')) : null` still emitted `SignIn-*.js`).
    Actually dropping the chunk would need a Vite plugin that rewrites the source before Rollup ever
    parses it, or splitting these two routes out of the main entry's module graph entirely — more
    machinery than ~4 kB gzip combined is worth. Leaving as-is; not attempting again without a
    different approach in mind.
21. ~~**The sign-in and sign-up pages barely say anything.**~~ — **done 2026-09-13.** Both pages'
    subtitle now says what an account actually gets you — progress synced across devices, and that
    it's optional since everything already works from one browser alone — instead of one generic
    line. That was enough to clear `verify-routes.mjs`'s general 200-char floor honestly, so the
    special-cased 100-char floor for these two routes is gone; they're checked like every other
    route now.

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
24. ~~**Two path concepts have no page to earn them on.**~~ — **done 2026-09-12.** "Environment
    Variables" (stage 1) and "Staging & Commits" (stage 2) are still named by the design and taught
    nowhere, so their Roadmap chips still render as a plain unlinked `<span>` rather than a `Link` —
    honest, since no page exists to send a click to. But either can now be marked (and un-marked)
    directly from the Progress Dashboard's new "Your concepts" panel (item 29), so stage 1 can reach
    COMPLETE; building the two lessons for real, or dropping them from the path, is still open.
25. **Completing everything the app has now tops out at 7 of 25 (28%), not 5.** Item 24 means all 7
    path concepts can be marked, not just the 5 with pages, so the Roadmap's bar can now clear a
    quarter — but stages 3-5 are still placeholders, so it's still nowhere near 100% for a learner
    who's genuinely finished every lesson. The other 13 concepts the app teaches sit off the path
    and are counted separately ("+N off-path" under the dashboard tile) rather than inflating it.
    Not wrong, but the path bar is a weak reward until stages 3-5 exist.
26. ~~**`audit:a11y` can never pass in an API-enabled build.**~~ — **done 2026-09-13, differently than
    proposed.** The diagnosis was right that `/sign-in`/`/sign-up` reported `NEW` pairs every
    API-enabled run; the proposed fix (patch the script to accept them) was wrong, because both were
    real bugs, not inherited-and-accepted ones: (1) `TopNav`'s `dark` variant (used only by
    `TerminalSimulator`) never set a base text color, so the "Sign in" link and the signed-in user's
    name/"Sign out" inherited the *light-background* body color onto a dark background — 1.18:1,
    effectively invisible. `.topnav-dark` now sets `color: var(--color-neutral-100)`. (2) The plain
    `<Link>` cross-references ("Sign up" / "Sign in" at the bottom of each form) used the bare
    `a { color: var(--color-accent) }` default — 3.03:1 — instead of the deep ramp step the design
    system already documents for paragraph-size accent text (`app/README.md`'s Accessibility
    section); both now use `--color-accent-700`, matching the `<h1>` on the same pages. Fixed for
    real rather than baselined: `npm run audit:a11y` now passes clean with `VITE_API_BASE_URL` set
    (28/28 routes) exactly as it did without it (26/26), no script changes needed. Same shape as
    item 18 in reverse — that one turned out to be a check that could never pass; this one turned
    out to be two real bugs a baselining fix would have quietly buried instead of catching.

## Found while working (2026-09-12)

Turned up while adding the un-mark control (item 22). Numbered from 27 so earlier references hold.

27. ~~**The interaction-check count is hand-written in `docs/SRS.md` and had already drifted.**~~ —
    **done 2026-09-12.** §6 read "All 95 interaction checks pass" while the suite was on 113 — the
    count moved twice without the prose following, which is item 16's problem in a document instead
    of a component. It's read 132, then 155, and read 170 by the time this was fixed, updated by
    hand each time — proving the point rather than fixing it. Took the drop-the-number option over
    having the script write it somewhere to cite: §6 now says "Every check in
    `scripts/verify-interactions.mjs` passes," which needs no maintenance and can't drift again.
28. ~~**A stale `vite preview` can silently take the port the suites verify against.**~~ — **done
    2026-09-12.** Eleven orphaned preview servers from earlier sessions were holding 4173-4182;
    `npm run preview` reports "Port 4173 is in use, trying another one..." and happily starts on
    4183, while `scripts/browser.mjs` still points `BASE` at 4173 — so a verify run either couldn't
    connect or, worse, passed against whatever *that* server was serving. Took the "better still"
    option over the minimal `--strictPort` one: a new `scripts/run-verify.mjs` (`npm run verify` now
    runs that instead of chaining the four suites directly) starts its own `vite preview` through
    Vite's JS API with `strictPort: true`, runs the suites against it, and always closes it after —
    so a stale port fails loudly at the point the mistake is made, and the README's old two-step
    (`npm run preview &` then `npm run verify`) is down to one. `VERIFY_BASE_URL` still opts out
    entirely for anyone pointing verify at a server they're managing themselves. One trap along the
    way, worth recording: the suites first hung forever rather than erroring, because running them
    with `spawnSync` blocked this script's own event loop — which is what was serving the preview
    server it had just started in the same process — so the child's browser could never get a
    response. Async `spawn` fixed it. Individual suites (`verify:routes` alone, etc.) are unchanged
    and still need a manually-started preview.
29. ~~**Un-marking a concept means going back to its page.**~~ — **done 2026-09-12.** The Progress
    Dashboard now has a "Your concepts" panel, grouped by stage the way the Roadmap is, listing all
    20 registered concepts. A done row offers only "Un-mark" (never "Undo" — `DecoratorPattern`
    already has one, and `verify-interactions.mjs` clicks by name); a not-done row with a `route`
    links to the lesson that earns it, and the two without one (item 24) get a "Mark complete"
    button instead, since there's no page to put one on. 15 new checks (155 → 170), including
    marking and un-marking both routeless concepts (item 24) and un-marking a routed one without
    ever visiting its page.
