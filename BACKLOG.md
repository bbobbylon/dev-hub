# Backlog — Dev Hub

_Last updated: 2026-09-13._ Feature ideas and known gaps, roughly ranked. Nothing here is scheduled
— this is a scan of the codebase plus the natural follow-ups from adding the optional account/sync
layer (`docs/ARCHITECTURE.md` §11), for the next time work picks back up.

**Shipped since the last update (2026-09-13):** item 12 — a global Cmd/Ctrl+K command palette
(`src/components/CommandPalette.tsx`) now jumps straight to any page from anywhere in the app,
filtering the same `data/pages.ts` catalog the gallery's own search box does; see its entry below
for the one real bug (a one-frame stale-query flash on reopen) caught and fixed before it shipped.
Same day: item 10 (partial) — Stage 3 of the Roadmap has its first real concept, Variables
(`/python-variables`, four graded predict-the-value questions), and Stages 3–5's remaining
eighteen concepts now read as honest "not yet built" chips or point at real, already-shipped
lessons that genuinely cover that syllabus, instead of a blank "locked"; see its entry below for
exactly what's built versus what's still open. Same day: item 8 — the Glossary went from 3
mocked-up "A" terms and fake "142 TERMS"/"Show 11 more" chrome to 36 real, authored terms with a
genuinely working search box and A–Z group filter; see its entry below for what stayed faithful to
the prototype and what's new content. Same day: item 9 — Code Playground's "run tests" now
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
8. ~~**`Glossary.tsx` only renders "A" terms**~~ — **done 2026-09-13.** The prototype
   (`project/Glossary.dc.html`) itself only ever mocked up 3 term cards behind a "142 TERMS" badge
   and a "Show 11 more" button — both decorative chrome, not un-ported content — so this was a real
   content-authoring pass, not a code fix: 36 genuine terms now span the alphabet (kept API/Argument/
   Async's original copy verbatim), grouped into the same 9 jump-strip chips the prototype drew
   (A/B/C/D individually, E–H/I–L/M–P/Q–T/U–Z grouped), each backed by a real filter over the
   `letters` it covers. The search box filters live across term name, definition, category and
   pronunciation. The term-count badge and the "N of 36 terms" line both read `TERMS.length` — no
   more "142 TERMS", and the fake "Show 11 more" button is gone rather than wired to a lie. 9 new
   checks in `verify-interactions.mjs` (171 → 180) cover the default group, switching groups,
   searching, the honest no-match state, and clearing a search by picking a group.
9. ~~**`CodePlayground`'s "running tests" is fully simulated**~~ — **done 2026-09-13.** "Run tests"
   now executes the solution's exact source for real, in a Web Worker (`lib/sandboxRun.ts`, its own
   realm, no DOM, timeout-guarded against infinite loops), and grades all 4 checklist items off the
   `console.log` output that run actually produced — a broken solution genuinely fails here now.
   Translated the exercise from the prototype's Python to JavaScript, since a Worker can only run JS
   without pulling in a WASM runtime (Pyodide) disproportionate to one exercise; the read-only
   listing still shows exactly what's executed. This adds a 5th known `audit:content` extractor
   artifact (the expected-output string is now computed at runtime, not a static literal) —
   documented in `app/README.md`, verified byte-identical to the prototype's output by hand.
10. ~~**`Roadmap.tsx` stages 3–5 are locked placeholders**~~ — **partially done 2026-09-13.**
    A full 18-concept build across Python, data structures/algorithms, and APIs/databases was out
    of scope for one pass, so this shipped a bounded, honest slice rather than either skipping it
    or faking completeness: Stage 3 has its first real concept, and Stages 3–5's remaining concepts
    are labelled for exactly what they are instead of a blank "locked."

    **Variables** (`/python-variables`, `data/concepts.ts`'s `python-variables`, `stage: 3`) is a
    real graded lesson: four predict-the-value questions (reassignment/`type()`, value-copy vs.
    aliasing, tuple-swap, augmented assignment), each locking on first pick with a real correct/
    incorrect explanation. Scoring 3 of 4 earns the concept via `<ConceptComplete>`, same as every
    other checkpoint. `stage: 1 | 2 | null` widened to `1 | 2 | 3 | null` in `data/concepts.ts` —
    the only path-affecting change — and `data/curriculum.ts`'s `UPCOMING_STAGES[2].concepts`
    dropped "Variables" so `TOTAL_CONCEPTS` stays exactly 25 (one item moved from the placeholder
    list into the real registry, not added on top of it).

    Stage 3's other five concepts (Control flow, Functions, Collections, Errors, Files) still show
    as dashed "not built yet" chips, not real pages — `Roadmap.tsx`'s new `NotBuiltChip`. Stages 4
    and 5 are still fully locked and unbuilt, but each now points at real, already-shipped off-path
    lessons whose content genuinely overlaps that stage's syllabus (verified by reading each page,
    not guessed from its title): Stage 4 → Data Structures Visual, Big-O Performance, Algorithm
    Visualizer; Stage 5 → API Anatomy. These are `related` pointers in `data/curriculum.ts`, listed
    not counted — following one doesn't move `TOTAL_CONCEPTS` or any stage's progress count, since
    none of those four pages were reclassified onto the path (an earlier plan to do exactly that
    was worked through and abandoned once it turned out to break the 25-concept invariant via a
    many-to-one collapse of syllabus names into single existing pages).

    Added `/python-variables` to `App.tsx`, `scripts/routes.mjs`, and `data/pages.ts` (26th
    lesson/tool page, 27th route counting the gallery); 13 new checks in `verify-interactions.mjs`
    (181 → 194) cover the lesson's scoring/reset and the Roadmap's stage-3 count, its real links,
    and the two "not yet built" stages. Doc counts swept across `docs/SRS.md`, `docs/UI-DESIGN.md`,
    `docs/ARCHITECTURE.md`, and `app/README.md`. **Still open:** Stage 3's other five concepts, and
    all of Stages 4 and 5 (twelve concepts total) remain unbuilt.

## Nice-to-haves (not gaps, just ideas)

11. **Dark mode / theme toggle** — no theming beyond the one "Organic" light palette today.
12. ~~**A command palette** (Cmd/Ctrl+K) for jumping to any page~~ — **done 2026-09-13.**
    `src/components/CommandPalette.tsx`, mounted once in `App.tsx` alongside the route tree rather
    than composed into any one page, so the shortcut works from every route. Filters
    `data/pages.ts`'s `PAGES` catalog by title/kind/blurb/slug (same idea as the gallery's own
    filter, generalized to work before you're on the gallery), arrow keys move the highlighted
    result, Enter navigates, Escape or a backdrop click closes. Renders nothing at all while
    closed, so it adds no new element to any route's own a11y surface — `npm run audit:a11y`
    stayed at its exact baseline (39 failures across 20 pairs). Built on the handoff's own
    `.dialog`/`.dialog-backdrop` classes in `organic.css`, which no page had used until now. One
    real bug caught before it shipped: the first version cleared the search query in a `useEffect`
    keyed on `open`, which left a one-frame flash of the *previous* session's query visible on
    reopen (caught by a Playwright check asserting the palette starts blank, not by eye) — fixed by
    resetting query/selection synchronously in the same keydown handler that opens it, so React
    batches both into one render. 7 new checks in `verify-interactions.mjs` (170 → 177).
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

    **Investigated 2026-09-16 — the premise didn't hold, same shape as item 26's own correction of
    this item.** Every one of Shell Scripting's contrast failures (and every other newer page's) was
    checked individually against `app/README.md`'s "what remains, and why it wasn't changed" list,
    not assumed. All but one turned out to already be the accepted accent-fill chrome category —
    cream-on-terracotta `.btn-primary`, terracotta `.btn-ghost` text, accent-tinted badges, dark-on-
    `accent-2` chips — tuned to ~3:1 on purpose; running the `-700` treatment on those would only
    silence a real, documented, brand-level tradeoff, not fix anything. Applying it anyway would have
    been guessing at a new fix instead of reproducing the real one.

    The one genuine bug was a different shape entirely: `CodeListing`'s line-number gutter (shared by
    Shell Scripting, Code Playground, Debugging Challenge, Python Variables) set
    `color: var(--color-neutral-600)` on the pane's `--color-neutral-900` background — 3.29:1, needs
    4.5. This is the *dark-ground* case item 26 fixed for `.topnav-dark`, not the *light-ground* case
    the original `-700` pass fixed: darkening a token further on a dark background only fails harder
    (the original pass tried exactly that in five places and reverted all five — see the
    `34bc710` commit), so the fix is a *lighter* explicit step, same idea as `.topnav-dark`'s override.
    Moved to `--color-neutral-500` (4.90:1) — the least-lightened step that clears the bar, matching
    the same chrome bar's "note" text one row up. It only ever showed up in the audit on Shell
    Scripting because that page's 13-line script is the only one whose gutter reaches a two-digit
    line number — the audit's own contrast check skips text under 2 characters, so single-digit
    gutter numbers on the other three pages were failing the exact same way, invisibly. Fixing the
    shared component fixes all four pages at once, not just the one the audit could see.

    Re-recorded the baseline deliberately (`npm run audit:a11y -- --update-baseline`, reviewed diff):
    **39 → 35 failures, 20 → 19 pairs** (removed `span|3.29|13`; also corrected the baseline's stale
    `routes: 26` to `27` — `/python-variables` was added after the baseline was last recorded and had
    gone unreflected there since). `npm run verify` green after: 27/27 routes, no overflow at any
    width, 201/201 interaction checks, a11y clean with zero regression.
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

## Found while working (2026-09-16)

Turned up while adding Stage 3's second lesson. Numbered from 30 so earlier references hold.

30. ~~**Stage 3 had only one real concept; the other five were still honest placeholders.**~~ —
    **done 2026-09-16.** Added `/control-flow` ("Control Flow"), continuing straight on from
    `/python-variables` — the same four-question predict-the-value archetype (`CodeListing`
    snippets, three answer choices, a real explanation on reveal, a running score, a "try again"
    reset), reused rather than reinvented: if/elif exclusivity (an `elif` chain stops at the first
    true branch even when a later one would also match), `range()`'s exclusive stop (the single
    most common off-by-one in a beginner's first loop), `while True` + `break` (the loop doesn't
    wait to "check" anything — `break` exits the instant it runs), and the truthiness of an empty
    list (`if items` asks "is this truthy?", not "is this a bool?"). `data/concepts.ts` gained a
    `control-flow` entry (`stage: 3`); `data/curriculum.ts`'s `UPCOMING_STAGES` lost `'Control
    flow'` from Stage 3's not-yet-built list — four of the original six now, not five — so
    `TOTAL_CONCEPTS` (still 25, derived, never hand-edited) and the Roadmap's stage-3 chips/counts
    moved without touching `Roadmap.tsx` at all, which was the point of building those off a
    registry in the first place (item 6). Registered the same way every other page is (`App.tsx`'s
    lazy import + route, `data/pages.ts`'s gallery card, `scripts/routes.mjs`), and
    `verify-interactions.mjs` gained a dedicated block mirroring Python Variables' own (starts
    unanswered, three-correct reaches the pass mark, earns completion, a wrong pick still shows the
    real explanation, try-again resets) plus three more checks in the Roadmap block (the chip
    really links to the lesson, and completing both concepts moves the stage-3 count and the path
    total a second time). 201 → 209 interaction checks. Every control has real accessible text (no
    icon-only buttons), so the a11y baseline this session's earlier fix (item 18) shrank to
    35 failures / 19 pairs did not move: still 35/19 after the new page, confirmed by re-running
    `npm run audit:a11y` clean both before and after.

    One real bug surfaced writing the interaction checks, not the lesson itself: Q2's plausible
    wrong answer ("3" — the loop's final `i`, not the accumulated `total`) and Q3's correct answer
    ("3" — the value `break` catches `n` at) are the same bare string, so
    `getByRole('button', { name: '3', exact: true })` matches both cards at once once Q2 is
    answered and disabled but still rendered. Fixed with `.nth(1)` (Q2's card renders first), not by
    watering down either answer choice — both are the more useful wrong/right answer for what they
    teach.

    `audit:content` (not part of `npm run verify`, but read after every content change per its own
    instructions) flagged one new MISS: the Roadmap's composed placeholder-syllabus check
    (`COMPOSED` in `scripts/audit-content.mjs`) matches each `·`-separated piece case-sensitively,
    and the prototype's original six-item Stage 3 line spelled it lower-case, `"Control flow"` — the
    built page titles it `"Control Flow"`, Title Case like every other multi-word built label on the
    site (`"Branching & Merging"`, `"Big-O Performance"`, …), so the exact-case match broke. Not a
    content gap — resolved by naming both casings explicitly in `curriculum.ts`'s own doc comment
    (the design's placeholder wrote it lower-case; the built page's label is Title Case on purpose)
    rather than either lower-casing the real page's title or adding a permanent excuse to
    `app/README.md`'s "known extractor artifacts" list. Also caught, one door down: the Page
    Gallery's hand-written lede (`"N archetypes plus the three originals"`) had already been stale
    since `/python-variables` shipped — its own bump from 22 to 23 was skipped at the time, which
    `README.md`'s matching explanation bullet had been silently carrying ever since. Fixed both:
    `PageGallery.tsx` now reads 24 (22, plus the missed Variables bump, plus this session's Control
    Flow), and the README bullet names the gap rather than quietly absorbing it. `docs/SRS.md`,
    `docs/ARCHITECTURE.md`, and `app/README.md`'s route/page counts (28 routes, 27 lesson/tool
    pages) and `app/README.md`'s registered-concept count (22) were swept in the same commit, same
    as item 10's precedent. `docs/SRS.md`'s interaction-check line was already non-numeric (item 27)
    and needed no change.

    `npm run verify` green after: 28/28 routes, no overflow at any width, 209/209 interaction
    checks, a11y clean with zero regression (35/19, unchanged). `npm run typecheck` clean.
31. ~~**Stage 3 had two real concepts; the other four were still honest placeholders.**~~ — **done
    2026-09-16.** Re-checked `curriculum.ts`/`concepts.ts` before starting rather than assuming:
    Stage 3's `UPCOMING_STAGES` list was still `['Functions', 'Collections', 'Errors', 'Files']`,
    nothing had shifted since item 30. Added `/functions` ("Functions"), Stage 3's third lesson,
    continuing straight on from Control Flow — the same four-question predict-the-value archetype
    again, no new page shape invented: a mutable default argument (`cart=[]` is created once, at
    def time, and every call that skips its own cart shares that same list — the single most common
    "gotcha" question in a Python interview), keyword-argument reordering (matched by name, not
    position, so `greet(name="Ana", greeting="Hi")` and `greet("Hi", "Ana")` call identically), a
    missing `return` (the function computes a value, forgets to hand it back, and the caller gets
    `None` with no error at all — "a quietly wrong answer, which is exactly why this bug survives to
    production"), and a closure over a loop variable (`funcs.append(lambda: i)` doesn't capture
    `i`'s *value* at each iteration, only the variable itself — all three lambdas share it, and by
    the time any one is called the loop has already finished with `i` at its last value, 2, not the
    0/1/2 a learner expects). Wired in everywhere the last two lessons were: `App.tsx`'s lazy
    import + route, `concepts.ts` (`stage: 3`), `curriculum.ts`'s `UPCOMING_STAGES` (`'Functions'`
    dropped — three of the original six left now), `data/pages.ts`'s gallery card,
    `scripts/routes.mjs`. `Roadmap.tsx` again needed zero changes — its chips, stage badges and
    `TOTAL_CONCEPTS` (still 25) are fully derived, which is the entire point of items 6 and 30.

    `verify-interactions.mjs` gained a dedicated block mirroring the other two lessons' own (starts
    unanswered, three-correct reaches the pass mark, earns completion, a wrong pick still shows the
    real explanation, try-again resets), plus a third Roadmap-block completion flow (the Functions
    chip really links to the lesson, and completing all three concepts moves the stage-3 count and
    the path total a third time — `"3 OF 6"`, `"3 of 25 concepts"`). 209 → 217 interaction checks.
    Every control carries real visible text; the a11y baseline (35 failures / 19 pairs, from item
    18) did not move — confirmed by re-running `npm run audit:a11y` clean before and after.

    Checked the same two things item 30 flagged, since both are the kind of drift that repeats
    silently otherwise: `audit:content` stayed at its baseline 5 known artifacts (`"Functions"` was
    already spelled the same way in both the design's placeholder array and the built page's label,
    so no new case-sensitivity MISS this time — Control Flow's mismatch was the exception, not the
    rule). The Page Gallery's hand-written archetype count, though, needed bumping again on the
    same schedule as before — `PageGallery.tsx`'s lede and its matching `README.md` bullet both
    moved 24 → 25 for this lesson shipping, and `docs/SRS.md`, `docs/ARCHITECTURE.md`, and
    `app/README.md`'s route/page/concept counts (29 routes, 28 lesson/tool pages, 23 registered
    concepts) were swept in the same commit, same precedent as items 10 and 30.

    `npm run verify` green after: 29/29 routes, no overflow at any width, 217/217 interaction
    checks, a11y clean with zero regression (35/19, unchanged). `npm run typecheck` clean,
    `audit:content` at its 5-artifact baseline.
32. ~~**Stage 3 had three real concepts; the other three were still honest placeholders.**~~ —
    **done 2026-09-16.** Re-checked `curriculum.ts`/`concepts.ts` first, per the standing rule:
    Stage 3's `UPCOMING_STAGES` was still `['Collections', 'Errors', 'Files']`, nothing had
    shifted since item 31. Added `/collections` ("Collections"), Stage 3's fourth lesson,
    continuing straight on from Functions — same archetype, no new page shape, four gotchas picked
    to cover distinct collection behaviors with no overlap against the three lessons before it:
    `b = a` **aliasing** a list instead of copying it (the direct, deliberate contrast with the
    Variables lesson's own `b = a` question — that one used an immutable int, where reassigning
    couldn't touch the alias; this one uses a mutable list, where a method call through either name
    changes what both see), a **tuple's immutability** enforced as a real `TypeError` where a list
    would have silently allowed the same assignment, a **dict literal's repeated key** silently
    keeping only the last value written (not a `SyntaxError` — Python builds the pairs left to
    right and the second write simply overwrites the first), and a **slice tolerating out-of-range
    bounds** that plain indexing never would (`nums[1:10]` on a 3-item list just clamps, `nums[10]`
    raises `IndexError`). Deliberately did *not* reach for `*args`/`**kwargs` or `in` on a list vs.
    a set from the coordinator's candidate list — both are real gotchas, but neither is a
    *collection* gotcha specifically (the first is a function-call-signature feature, the second a
    performance property with identical correctness either way), and the four chosen already cover
    reference semantics, type-level mutability enforcement, dict key uniqueness, and slice-vs-index
    bounds — four genuinely different behaviors, not four flavors of one.

    Wired in everywhere the last three lessons were: `App.tsx`'s lazy import + route,
    `concepts.ts` (`stage: 3`), `curriculum.ts`'s `UPCOMING_STAGES` (`'Collections'` dropped — two
    of the original six left now: `Errors`, `Files`), `data/pages.ts`'s gallery card,
    `scripts/routes.mjs`. `Roadmap.tsx` again needed zero changes.

    `verify-interactions.mjs` gained a dedicated block mirroring the other three lessons, plus a
    fourth Roadmap-block completion flow (`"4 OF 6"`, `"4 of 25 concepts"`). Checked for option-text
    collisions across all four questions before writing the clicks (none this time — no `.nth()`
    needed). 217 → 225 interaction checks. A11y baseline (35/19, item 18) did not move.

    Same two drift checks as the last two rounds: `audit:content` stayed at its 5-artifact
    baseline (no case-sensitivity mismatch — "Collections" is one word, spelled the same in the
    design's placeholder and the built label, same as "Functions" and unlike "Control Flow"). The
    Page Gallery's hand-written archetype count moved 25 → 26 on schedule (`PageGallery.tsx`'s lede
    + its `README.md` bullet), and `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s
    route/page/concept counts (30 routes, 29 lesson/tool pages, 24 registered concepts) were swept
    in the same commit.

    `npm run verify` green after: 30/30 routes, no overflow at any width, 225/225 interaction
    checks, a11y clean with zero regression (35/19, unchanged). `npm run typecheck` clean,
    `audit:content` at its 5-artifact baseline.

## Found while working (2026-09-18)

33. ~~**Stage 3 had four real concepts; the other two were still honest placeholders.**~~ — **done
    2026-09-18.** Re-checked `curriculum.ts`/`concepts.ts` first, per the standing rule, rather than
    trusting the task description's summary: Stage 3's `UPCOMING_STAGES` was still `['Errors',
    'Files']`, nothing had shifted since item 32. Added `/errors` ("Errors"), Stage 3's fifth
    lesson, continuing straight on from Collections — same archetype, no new page shape, four
    exception-handling gotchas picked from the candidate list to cover distinct behaviors with no
    overlap against any of the four lessons before it: a `finally` block's own `return` **silently
    overriding** the value `try` already returned (`finally` doesn't just run after a `return` —
    if it has a `return` of its own, that one wins and the original value never leaves the
    function), a broad `except Exception:` **swallowing an unrelated bug** alongside the failure it
    was actually written for (a `TypeError` from a caller passing the wrong argument type gets
    silently rewritten to the exact same fallback as a legitimate `ZeroDivisionError`, so the
    caller can't tell "expected failure" from "you called this wrong"), a bare `except:` **catching
    `SystemExit`** that a properly-scoped `except Exception:` never would (`SystemExit` and
    `KeyboardInterrupt` inherit from `BaseException`, not `Exception` — a bare `except:` catches
    `BaseException`, so it can swallow a program's own attempt to shut down), and an `except`
    clause **ordered after a more general one**, making it permanently unreachable with no error to
    say so (Python matches top to bottom and stops at the first hit; a specific class listed below
    a broader one is silent dead code, not a `SyntaxError`). Deliberately skipped exception
    chaining/`raise ... from` and "re-raising losing the traceback" from the candidate list — both
    are real, but neither has an observable *printed value* difference to predict (the difference
    lives in the traceback object, which this archetype's "predict what prints" format can't ask
    about honestly without inventing a fake `__cause__`-reading snippet); the four chosen already
    cover four genuinely different mechanisms (return-vs-cleanup control flow, catch-clause
    granularity, the `BaseException`/`Exception` split, and except-clause evaluation order) rather
    than four flavors of one.

    Wired in everywhere the last four lessons were: `App.tsx`'s lazy import + route (plus its
    "N page-sized lessons/tools" header comment, 29 → 30), `concepts.ts` (`stage: 3`),
    `curriculum.ts`'s `UPCOMING_STAGES` (`'Errors'` dropped — one of the original six left now:
    `Files`), `data/pages.ts`'s gallery card, `scripts/routes.mjs`. `Roadmap.tsx` again needed zero
    changes — fully derived, same as every round since item 30.

    `verify-interactions.mjs` gained a dedicated block mirroring the other four lessons (starts
    unanswered, three-correct reaches the pass mark, earns completion, a wrong pick still shows the
    real explanation, try-again resets), plus a fifth Roadmap-block completion flow (`"5 OF 6"`,
    `"5 of 25 concepts"`) and an update to the "lists the rest as not built yet" check, which now
    looks for `Files` instead of the now-built `Errors`. Checked for option-text collisions across
    all four questions before writing the clicks — none this time (`'1'`, `'2'`, `'None then
    None'`, `'fatal error, then the program exits'`, `'general handler'`, etc. are all unique on
    the page), no `.nth()` needed. 225 → 233 interaction checks.

    A real gotcha surfaced by the verify run itself, not the lesson content: `npm run verify` reads
    `dist/`, not the dev server, and doesn't rebuild it — the first run after adding the page failed
    every route with a "thin render" on `/errors` alone (it 404'd inside the SPA) because `dist/`
    was still the pre-Errors build. `npm run build` before `npm run verify` fixed it; worth stating
    plainly since the failure mode (a real page, a real route registered, a real 404) looks exactly
    like a routing bug and nothing in the failure output says "stale build."

    Same two drift checks as the last three rounds: `audit:content` stayed at its 5-artifact
    baseline (Errors has no design prototype to diff against, same as every Stage 3 lesson so far —
    the `MAP` in `audit-content.mjs` only covers ported pages). The Page Gallery's hand-written
    archetype count moved 26 → 27 on schedule (`PageGallery.tsx`'s lede + comment, `README.md`'s
    matching bullet). While sweeping `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s
    route/page/concept counts (31 routes, 30 lesson/tool pages, 25 registered concepts), found two
    more counts that had drifted silently for several rounds and were never part of the sweep
    pattern items 30-32 actually touched: both docs' own "_Last updated: … describes the N-page
    app_" header lines (stuck at "25-page"/"26-page" since 2026-09-09/09-13, three lessons behind),
    `docs/SRS.md`'s "`data/concepts.ts` registers all 20" line (stuck since before item 10 —_20_
    was never even right for four lessons ago), and `docs/ARCHITECTURE.md`'s `data/concepts.ts` /
    `data/curriculum.ts` table-row counts ("21 concepts", "~29 screens"). Fixed all of them to the
    real current numbers rather than perpetuating the miss, same call item 30 made on the Page
    Gallery lede — these are the kind of drift that compounds silently if each round only touches
    the one line its own diff happened to graze. Left `docs/SRS.md`'s "`src/pages/*.tsx`, 25 files"
    line alone: that one counts a different, ambiguous set (all files under `src/pages/`, not
    `PAGES.length`), already 34 today, and guessing at its intended definition risked writing a new
    wrong number rather than fixing the old one — flagging it here instead. Also left
    `docs/ARCHITECTURE.md` §7's page-by-page table alone: it has never had rows for `PythonVariables`/
    `ControlFlow`/`Functions`/`Collections` either, a pre-existing gap that predates item 10 and is
    a real, separate backfill job, not a count to sweep.

    `npm run verify` green after: 31/31 routes, no overflow at any width, 233/233 interaction
    checks, a11y clean with zero regression (35/19, unchanged). `npm run typecheck` clean,
    `audit:content` at its 5-artifact baseline.

    **Stage 3 is now 5 of 6 concepts built — only Files is left.** Given the remaining time/budget
    in this session, Files was deliberately not started in the same pass: picking four genuinely
    distinct, non-overlapping file-I/O gotchas (context managers vs. forgetting `.close()`, modes,
    encoding, iterating a file twice without seeking back, etc.) and writing/verifying them to the
    same bar deserves its own full pass rather than a rushed sixth lesson tacked onto this one — the
    established per-lesson pattern (dedicated interactions block, Roadmap flow update, docs sweep,
    full `npm run verify`) is itself the reason each of items 30-33 stayed one lesson per round.

34. ~~**Stage 3 had five real concepts; Files was still the last honest placeholder.**~~ — **done
    2026-09-18. This completes Stage 3: all six of its originally-placeholder concepts are now
    real, graded lessons — the first Roadmap stage after Stage 1 and 2 to reach that state.**
    Re-checked `curriculum.ts`/`concepts.ts` first rather than trusting item 33's own closing note:
    Stage 3's `UPCOMING_STAGES` was still `['Files']`, nothing had shifted. Added `/files`
    ("Files"), Stage 3's sixth and final lesson, continuing straight on from Errors — same
    archetype, no new page shape, four file-I/O gotchas picked to cover distinct mechanisms with no
    overlap against any of the five lessons before it: mode `"w"` **truncating a file to zero
    bytes the instant `open()` runs** — not when something is written, and not only if anything
    ever is (`f.close()` doesn't need to happen first; the data is already gone before a single
    character is written, and the file itself still exists, just empty — not a
    `FileNotFoundError`); a file object being **a one-shot cursor**, so a second
    `f.readlines()`/`.read()` without `f.seek(0)` comes back empty rather than the same content
    again (not a `RuntimeError` — reading twice is legal, it just starts from wherever the cursor
    already is); binary mode (`"rb"`) handing back **`bytes`, not `str`**, so `content == "OK"` is
    quietly `False` even when the bytes and the string "look" identical printed (not a `TypeError`
    — comparing two different types with `==` never raises, it just isn't equal); and a `with`
    block's **guaranteed close** meaning the file object it named is unusable the instant code
    steps outside the block — a real `ValueError: I/O operation on closed file`, not a silent
    no-op and not a `NameError` (`with` doesn't create its own scope, so the name `f` is still
    valid — it's the file behind it that's dead). Deliberately did *not* reach for "forgetting to
    call `.close()` at all" as a fifth angle from the candidate list (context managers, modes,
    encoding, iterating twice): it's the same underlying lesson as the `with`-block question (a
    file needs closing, and not closing it has consequences), so it would have doubled up on
    question 4's point rather than teaching a fifth distinct thing — the four chosen already cover
    truncation timing, cursor/iterator exhaustion, the `bytes`/`str` type split, and resource
    lifecycle (open → auto-close → dead handle), four genuinely different mechanisms rather than
    four flavors of one.

    Wired in everywhere the last five lessons were: `App.tsx`'s lazy import + route (+ its
    page-count header comment, 30 → 31), `concepts.ts` (`stage: 3`), `data/pages.ts`'s gallery
    card, `scripts/routes.mjs`. `curriculum.ts`'s `UPCOMING_STAGES` needed a real structural change
    this time, not just dropping a string: Stage 3's `n: 3` entry's `concepts` array is now `[]`
    (the last item, `'Files'`, removed) rather than the entry being deleted outright — `Roadmap.tsx`
    still looks it up unconditionally (`stage3Upcoming = UPCOMING_STAGES.find((s) => s.n === 3)!`)
    for its `.concepts.length`/`.map`, and an empty array renders zero `NotBuiltChip`s, which is
    exactly the honest "nothing left to build" state without needing that lookup rewritten. Also
    corrected the entry's `lock` field from `'IN PROGRESS'` to `'BUILT'` for the same reason item
    30's Page Gallery fix and item 33's docs sweep existed — even though `lock` is never actually
    *rendered* for stage 3 (`Roadmap.tsx`'s stage-3 block always shows a `"N OF 6"` `Tag` instead of
    `<LockedTag>{stage.lock}</LockedTag>`, which is `laterStages`' job for stages 4-5 only), leaving
    a dead field holding a now-false value is exactly the kind of drift that compounds silently
    later. `Roadmap.tsx` itself again needed zero changes — fully derived, same as every round
    since item 30, and this round is the proof: it correctly renders "6 OF 6" and zero not-built
    chips for Stage 3 purely from the data changing shape, no template logic touched.

    `verify-interactions.mjs` gained a dedicated block mirroring the other five lessons (starts
    unanswered, three-correct reaches the pass mark, earns completion, a wrong pick still shows the
    real explanation, try-again resets), plus a sixth and final Roadmap-block completion flow. That
    flow needed one real change beyond the usual per-lesson pattern: the "lists the rest as not
    built yet" check couldn't just swap which concept name it looks for (there's nothing left to
    name) — it's now `!rm.includes('not built yet')`, asserting the exact string that
    `NotBuiltChip` renders appears nowhere on the page at all, confirmed safe with a repo-wide grep
    (`NotBuiltChip` is its only source). Added one extra check beyond the routine three-per-round
    pattern items 30-33 established (chip-links-to-lesson, stage count moves, path total moves): a
    second, explicit "no not-built chips left" assertion right after the sixth completion, since
    this round's actual milestone — Stage 3 reaching zero remaining placeholders — deserved its own
    named check rather than riding along inside the "six real concepts" one. Checked for
    option-text collisions across all four questions before writing the clicks — none this time
    (`'keep this text'`, `'3 0'`, `'False'`, `'It writes "hello world" to out.txt'`, etc. are all
    unique on the page), no `.nth()` needed. 233 → 242 interaction checks (5 dedicated + 4 Roadmap,
    one more than the usual +3 for the reason above).

    `audit:content` stayed at its 5-artifact baseline (Files has no design prototype to diff
    against, same as every Stage 3 lesson). The Page Gallery's hand-written archetype count moved
    27 → 28 on schedule (`PageGallery.tsx`'s lede + comment, `README.md`'s matching bullet + its
    "N archetypes" history line). Swept `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s
    route/page/concept counts (32 routes, 31 lesson/tool pages, 26 registered concepts) — including
    both docs' "Last updated … describes the N-page app" header lines this time, since item 33
    already re-anchored them to today's date and it would have been the exact same one-round-behind
    drift item 33 called out if left untouched again. Also caught and fixed one more instance of
    that same drift pattern, this time inside the app's own source rather than `docs/`:
    `data/curriculum.ts`'s own doc comment said "~26 interactive screens" — stale since before item
    30, never swept because it isn't `docs/SRS.md`/`docs/ARCHITECTURE.md`/`app/README.md` and so
    was never in scope for the usual three-file sweep — corrected to ~31. `docs/SRS.md`'s ambiguous
    "`src/pages/*.tsx`, 25 files" line and `docs/ARCHITECTURE.md` §7's page-by-page table (still
    missing rows for all six Stage 3 lessons) are unchanged from item 33's write-up: both remain
    real, separate, pre-existing gaps rather than counts this sweep pattern actually touches.

    `npm run verify` green after: 32/32 routes, no overflow at any width, 242/242 interaction
    checks, a11y clean with zero regression (35/19, unchanged). `npm run typecheck` clean,
    `audit:content` at its 5-artifact baseline. Hit the same `dist/` snag item 33 flagged and this
    time ran `npm run build` *before* `npm run verify` from the start, confirming the fix generalizes.

    **Stage 3 is complete: 6 of 6 concepts, Variables through Files, all real graded lessons.**
    `data/curriculum.ts`'s `UPCOMING_STAGES` still carries an `n: 3` entry with an empty
    `concepts: []` (see above for why it wasn't deleted), so the Roadmap correctly shows Stage 3 as
    `"6 OF 6"` with no dashed not-built chips at all — the same honest, fully-derived rendering
    every earlier round in this series relied on, now exercised at the boundary case (zero
    remaining) for the first time. Stage 4 (Data Structures & Algorithms) and Stage 5 (APIs &
    Databases) remain fully unbuilt, twelve concepts between them — the next real work on the
    Roadmap, whenever it's picked up, starts there.

35. ~~**Stage 4 (Data Structures & Algorithms) had no real concepts at all — everything in it was
    still an honest placeholder.**~~ — **done 2026-09-18.** Re-checked `curriculum.ts` first
    rather than guessing a starting point: Stage 4's `n: 4` entry listed
    `['Arrays', 'Hash maps', 'Stacks & queues', 'Trees', 'Big-O', 'Sorting']`, in that order —
    `Arrays` is both the coordinator's guess and the list's own first item, so no judgment call was
    actually needed here. Added `/arrays` ("Arrays"), Stage 4's first lesson, on a new stage rather
    than a Stage 3 continuation — same predict-the-value/predict-the-behavior archetype (the
    coordinator explicitly named both; this page uses the second half of that pairing more than
    Stage 3 ever did, since "what actually happens" fits a data-structure question better than a
    literal `print()` value for two of the four). Four array-specific gotchas, picked to go past
    what `Data Structures Visual`'s own array diagram already states (its one-line "fast: O(1)
    index / slow: O(n) insert-at-front" verdict) rather than re-testing the same two facts at
    greater length, and with no overlap against Stage 3's own six lessons (especially
    `Collections.tsx`, the nearest thing to a prior round on this exact subject):
    **`[[0] * 3] * 3`'s "2D array"** secretly holds three references to the *same* inner list, not
    three independent rows — `[0] * 3` runs once, and the outer `* 3` just repeats that one result,
    so mutating "row 0" mutates all three (the fix is a list comprehension, which calls `[0] * 3`
    three separate times); **`.remove()`ing from a list while a `for` loop is still walking it**
    desyncs the loop's internal position counter from the now-shorter list and silently *skips*
    elements — traced concretely (`[2, 4, 6, 8]` "removing every even number" leaves `[4, 8]`
    behind) rather than asserted, and deliberately contrasted with a dict/set, which Python
    actually detects and raises `RuntimeError` for, unlike a list, which raises nothing at all;
    **negative indexing is bounded exactly like positive indexing** — `arr[-len(arr) - 1]` is a
    real `IndexError`, not an infinite backward wrap, extending (not repeating) Collections'
    slice-vs-index distinction into the negative direction specifically, a dimension that lesson
    never tested; and **a string is an immutable array of characters** — readable by index
    (`word[0]`), never writable by index (`word[0] = "b"` raises `TypeError`), the mutable/immutable
    contrast Collections drew for tuples, redrawn here for the type this stage actually cares
    about. Deliberately did not reach for "appending is amortized O(1) because of over-allocation"
    as a fifth angle — Python exposes no ordinary observable value that reveals *when* a resize
    happens, so there's no honest way to phrase it as a predict-the-value question without
    reaching for non-standard introspection a beginner lesson has no business showing.

    **This round needed a real `Roadmap.tsx` change, the first one since item 10 — every Stage 3
    round through item 34 genuinely needed none.** Stage 4 had never had Stage 3's dedicated
    "some built, some not" block; it was still rendered through the fully-locked, no-chips
    `laterStages` path (opacity-dimmed, a `LockedTag`, one syllabus sentence, `related` links, and
    nothing clickable). Giving Stage 4 a real concept meant it needed that same treatment Stage 3
    got at item 10 — its own block, a chip grid, done/next/todo state — so `Roadmap.tsx` gained:
    `stage4 = conceptsInStage(4)`, `stage4Done`, `stage4Upcoming` (mirroring stage 3's own),
    `nextUp`'s search now includes stage 4 (so "Continue" correctly cascades into Arrays once
    stage 1-3 are ever fully done — untested territory before this round, since no existing test
    completes that many concepts in one session; confirmed by grep that none do, so this was a safe
    extension, not a guess), and a new stage-4 JSX block hand-duplicated from stage 3's own rather
    than extracted into a shared component — two data points don't justify that abstraction yet;
    the file's own header comment says so explicitly and names the real trigger (stage 5 needing
    the same shape) for revisiting the call. `laterStages` now filters to `n > 4` (stage 5 only).
    `data/concepts.ts`'s `Concept.stage` type widened from `1 | 2 | 3 | null` to
    `1 | 2 | 3 | 4 | null`, and `conceptsInStage`'s parameter type to match — both one-line, but
    both required, unlike every Stage 3 round where the type already covered the stage in question.
    Also corrected `curriculum.ts`'s `n: 4` entry's dead-but-inaccurate `lock: 'NOT YET BUILT'` to
    `'IN PROGRESS'`, same reasoning as item 34's fix to stage 3's own `lock` field (never actually
    *rendered* once a stage has its own dedicated block — `laterStages` is the only reader of
    `stage.lock` — but a dead field holding a false value is exactly the drift that compounds
    silently later).

    `verify-interactions.mjs` gained a dedicated Arrays block mirroring the other six lessons
    (starts unanswered, three-correct reaches the pass mark, earns completion, a wrong pick still
    shows the real explanation, try-again resets) plus a real structural change to the Roadmap
    block, not just an appended chip-completion step: the "nothing left not-yet-built" checks
    (there were two, bracketing the six-lesson Stage 3 chain) could no longer assert plain absence
    of the string `"not built yet"` once Stage 4's own five `NotBuiltChip`s exist on the same
    page — both became count-based (`(rm.match(/not built yet/g) ?? []).length === 5`), asserting
    Stage 3's zero and Stage 4's five *together*, which is the actually-true invariant now.
    Same fix for the ALL-CAPS `"NOT YET BUILT"` `LockedTag` count — it moved from `=== 2` (stages 4
    and 5, both still in `laterStages`) to `=== 1` (stage 5 only, since stage 4 graduated out).
    Then the sixth Roadmap chip-chain step (Files) got a seventh: click through to Arrays, answer
    its first three questions correctly, and confirm three things at once — the stage-4 count
    reads `"1 OF 6"`, the path total reads `"7 of 25 concepts"`, and the not-built count is *still*
    exactly 5 (completing Arrays doesn't consume one of Stage 4's remaining `NotBuiltChip`s, since
    Arrays was never among them — a real, non-obvious invariant worth its own assertion rather than
    an assumption). Checked for option-text collisions across all four questions before writing the
    clicks — none, no `.nth()` needed. 242 → 252 interaction checks (5 dedicated + 5 Roadmap, one
    more than the usual +4-ish for the reason above: two renamed/refactored checks plus three
    genuinely new ones for the Arrays chip-chain step).

    `audit:content` stayed at its 5-artifact baseline — worth double-checking this round
    specifically, since `Arrays` moved out of `curriculum.ts`'s literal `concepts: [...]` array
    (which is how `COMPOSED.Roadmap`'s `'Arrays · Hash maps · Stacks & queues · Trees · Big-O ·
    Sorting — 6 concepts'` entry used to find the word "Arrays" in source) and into
    `data/concepts.ts` instead. It kept passing because `curriculum.ts`'s own doc comment
    (updated this round to explain Stage 4's transition, matching every Stage-3 round's own
    doc-comment updates) happens to name "Arrays" in prose — confirmed by re-running
    `npm run audit:content` after the change rather than assuming the coincidence would hold.
    The Page Gallery's hand-written archetype count moved 28 → 29 on schedule. Swept
    `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s route/page/concept counts (33
    routes, 32 lesson/tool pages, 27 registered concepts). Also fixed `docs/ARCHITECTURE.md` §7's
    `Roadmap.tsx` table row, which had said "stages 1-2 built with real chip grids, stages 3-5
    locked placeholders" since before item 10 and was never corrected across any Stage 3 round —
    genuinely wrong for the entire time Stage 3 was partially or fully built, not just this round's
    doing, but this round's own real `Roadmap.tsx` change was the reason it finally got noticed and
    fixed rather than compounding further. `docs/SRS.md`'s ambiguous "`src/pages/*.tsx`, N files"
    line and the same table's still-missing per-lesson rows for all six Stage 3 pages remain
    unfixed, per item 33/34's own reasoning — real, pre-existing, separate gaps.

    `npm run verify` green after: 33/33 routes, no overflow at any width, 252/252 interaction
    checks, a11y clean with zero regression (35/19, unchanged). `npm run typecheck` clean,
    `audit:content` at its 5-artifact baseline. Ran `npm run build` before `npm run verify` from
    the start this time (the `dist/`-staleness snag items 33/34 flagged) — no repeat of that
    failure mode.

    **Stage 4 now has 1 of 6 concepts built: Arrays.** Five remain (Hash maps, Stacks & queues,
    Trees, Big-O, Sorting), plus Stage 5 (APIs & Databases) still fully unbuilt behind it. Unlike
    every Stage 3 round, later Stage-4 concepts won't need another `Roadmap.tsx` structural change
    — the dedicated block, the widened types, and `nextUp`'s extended search are all in place now,
    so the remaining rounds on this stage should look exactly like a Stage 3 round did: a lesson
    page, a data entry, a wiring sweep, zero `Roadmap.tsx` changes.

36. ~~**Stage 4 had one real concept (Arrays); Hash Maps was still an honest placeholder.**~~ —
    **done 2026-09-18. `Roadmap.tsx` needed zero changes this round, confirming item 35's own
    prediction** — Stage 4's dedicated block, `data/concepts.ts`'s widened `Concept.stage` type,
    and `nextUp`'s extended search all already cover "however many real concepts
    `conceptsInStage(4)` returns," so this round looked exactly like a Stage 3 round again: a
    lesson page, a data entry, a wiring sweep. Re-checked `curriculum.ts` first rather than
    trusting the coordinator's own suggested next step: Stage 4's `n: 4` entry listed `['Hash
    maps', 'Stacks & queues', 'Trees', 'Big-O', 'Sorting']`, Hash maps first, matching the ask.
    Added `/hash-maps` ("Hash Maps") — the design's own syllabus wrote it lower-case, "Hash maps",
    the same casing distinction `Control Flow` drew against its own placeholder, footnoted the same
    way in `curriculum.ts`'s doc comment. Four dict-specific gotchas, all from the coordinator's own
    candidate list, checked against Arrays and Collections for overlap before writing them: an
    **unhashable key** — `cache[[1, 2]] = "result"` raises `TypeError: unhashable type: 'list'` —
    deliberately drawn as the flip side of Collections' own tuple-immutability question, since a
    tuple's immutability is exactly what makes it hashable and a list's mutability is exactly what
    makes it not; **`[]` lookup demanding the key exist**, raising `KeyError` where `.get()` would
    quietly return `None` or a supplied default — a distinction with no prior lesson anywhere on
    the site; **mutating a dict mid-iteration**, which Python actively detects and raises
    `RuntimeError: dictionary changed size during iteration` for — the coordinator's own suggested
    "good contrast if you haven't already drawn it" against Arrays' `.remove()`-during-a-loop
    question, drawn explicitly in the explanation text (a dict fails loud, a list fails quiet,
    which makes the dict version the easier bug to actually catch); and the **insertion-order
    guarantee** Python's dict has carried as a real language feature since 3.7, traced concretely
    (`d["z"]`, `d["a"]`, `d["m"]` inserted in that order comes back in that exact order, not
    alphabetical) against the common assumption that hash maps have no defined order at all.
    Deliberately did not add a fifth angle beyond the coordinator's four candidates — they already
    cover four genuinely distinct mechanisms (hashability, access-method strictness, iteration
    safety, ordering) with no overlap among themselves or against Arrays/Collections.

    Wired in everywhere Arrays was: `App.tsx`'s lazy import + route (+ page-count comment),
    `data/concepts.ts` (`stage: 4`), `data/pages.ts`'s gallery card, `scripts/routes.mjs`.
    `curriculum.ts`'s `UPCOMING_STAGES` lost `'Hash maps'` from Stage 4's remaining list (four of
    the original six left now: Stacks & queues, Trees, Big-O, Sorting), and its doc comment gained
    the same "two real concepts now" treatment Stage 3's own comment got at each of its six rounds
    — including catching and fixing two mentions that would have gone stale otherwise mid-edit:
    `TOTAL_CONCEPTS`'s own comment ("stage 4 one concept in" → "two concepts in") and a leftover
    "Stage 4 and 5 remain fully unbuilt" sentence one paragraph above the new Stage-4 writeup, which
    would have directly contradicted it two lines later.

    `verify-interactions.mjs` gained a dedicated Hash Maps block mirroring the other seven lessons,
    plus a real fix to the Roadmap block, not just an appended step: the not-built-chip counts that
    item 35 made count-based specifically so a second Stage-4 concept wouldn't need another
    plain-absence rewrite — `(rm.match(/not built yet/g) ?? []).length === 5` — dropped to `=== 4`
    in **both** places it appears (the pre-chain check and the mid-chain check right after Files'
    six completions), since that count reflects how many Stage-4 syllabus items are still
    *unbuilt pages*, not learner progress — it's already 4 the instant Hash Maps ships as a real
    page, before anyone has clicked into either Stage-4 lesson. The "stage 4 shows its first real
    concept" check became "shows both its real concepts" (`rm.includes('Arrays') &&
    rm.includes('Hash Maps')`), and the six-lesson Files chip-chain gained an eighth step after
    Arrays: complete Hash Maps, confirm the stage-4 count reads `"2 OF 6"`, the path total reads
    `"8 of 25 concepts"`, and the not-built count is *still* exactly 4 (same non-obvious invariant
    item 35 first asserted for Arrays, now confirmed a second time for a different concept — proof
    it generalizes, not a coincidence specific to Arrays). Checked for option-text collisions across
    all four questions before writing the clicks — none, no `.nth()` needed. 252 → 261 interaction
    checks (5 dedicated + 4 Roadmap).

    `audit:content` stayed at its 5-artifact baseline — the coordinator specifically flagged this
    as worth double-checking since content-location keeps shifting between files round to round,
    so it was re-run rather than assumed. "Hash maps" moved out of `curriculum.ts`'s literal
    `concepts: [...]` array (its home for the `COMPOSED.Roadmap` phrase check since before item 10)
    into `data/concepts.ts` instead; it kept passing for the same reason item 35's "Arrays" case
    did — `curriculum.ts`'s own updated doc comment names "Hash maps" (lower-case, matching the
    design placeholder's exact spelling, not the built page's Title Case) in prose, which is all
    the piece-by-piece composed check actually needs. Confirmed with a fresh `npm run
    audit:content` run after the edit, not by re-using item 35's reasoning without checking.
    The Page Gallery's archetype count moved 29 → 30 on schedule. Swept `docs/SRS.md`,
    `docs/ARCHITECTURE.md`, and `app/README.md`'s route/page/concept counts (34 routes, 33
    lesson/tool pages, 28 registered concepts), including `docs/ARCHITECTURE.md`'s `Roadmap.tsx`
    table row (fixed last round to say "stage 4 its first, item 35" — updated to name both
    concepts and both items rather than going stale again one round later).

    `npm run verify` green after: 34/34 routes, no overflow at any width, 261/261 interaction
    checks, a11y clean with zero regression (35/19, unchanged). `npm run typecheck` clean,
    `audit:content` at its 5-artifact baseline (re-verified, not assumed). Ran `npm run build`
    before `npm run verify` from the start, per the standing fix for the `dist/`-staleness snag.

    **Stage 4 now has 2 of 6 concepts built: Arrays, Hash Maps.** Four remain (Stacks & queues,
    Trees, Big-O, Sorting), plus Stage 5 still fully unbuilt behind it. `git status` confirms
    `Roadmap.tsx` was untouched this round — the architecture item 35 built is already generic
    enough to carry Stage 4 the rest of the way without another structural change.

37. ~~**Stage 4 had two real concepts (Arrays, Hash Maps); Stacks & Queues was still an honest
    placeholder.**~~ — **done 2026-09-18. Second consecutive round confirming item 35's
    prediction: `Roadmap.tsx` needed zero changes again.** Re-checked `curriculum.ts` first: Stage
    4's `n: 4` entry listed `['Stacks & queues', 'Trees', 'Big-O', 'Sorting']`, Stacks & queues
    first, matching the ask. Added `/stacks-queues` ("Stacks & Queues") — the design's placeholder
    wrote it lower-case, "Stacks & queues"; the route drops the "&" and hyphenates the two words
    directly (`stacks-queues`), the same pattern `Rebase & History` → `rebase-history` and
    `Branching & Merging` → `git-branching` already set, and the built label keeps the "&", also
    matching that pair — footnoted the same way in `curriculum.ts`'s doc comment.

    Four gotchas, all touched on in the coordinator's own candidate list but consolidated with
    real editorial judgment rather than taken as a literal four-item checklist: `list.pop(0)`
    costing O(n) because every remaining element has to shift left to close the gap, the reason a
    "queue" built from a plain list silently degrades as it grows rather than failing loudly;
    `deque(maxlen=N)` silently dropping the oldest element once full instead of growing or
    raising — the entire point of `maxlen`, but a dangerous default if you expected an error;
    `append()` + `pop()` giving a stack (LIFO) where `append()` + `popleft()` gives a queue
    (FIFO) — the classic stack-vs-queue mixup, and neither call raises anything to catch it; and
    popping an empty structure raising a real `IndexError: pop from empty list`, deliberately
    contrasted in the same snippet with the safe `while stack:` draining pattern that correctly
    empties the same structure one line earlier. Deliberately did **not** spend a full, separate
    question on "`list.append()`/`list.pop()` is a genuinely O(1) stack" as the coordinator's own
    candidate list suggested as a fourth-or-fifth angle — it's the *positive* half of the same fact
    `pop(0)`'s cost teaches negatively, and it's already load-bearing inside that question's own
    explanation (which spells out the append/pop() vs pop(0) contrast explicitly, then names
    `deque.popleft()` as the fix). Repeating it as its own question would have taught the same idea
    twice instead of a fourth genuinely distinct one — the same "don't pad the count, pick four
    that don't overlap" standard every round since item 32 has applied to itself.

    Wired in everywhere Hash Maps was: `App.tsx`'s lazy import + route (+ page-count comment),
    `data/concepts.ts` (`stage: 4`), `data/pages.ts`'s gallery card, `scripts/routes.mjs`.
    `curriculum.ts`'s `UPCOMING_STAGES` lost `'Stacks & queues'` from Stage 4's remaining list
    (three left now: Trees, Big-O, Sorting), and both of its doc comments picked up the same
    "N concepts now" bump `TOTAL_CONCEPTS`'s own comment has gotten every round since item 35 —
    checked both this time rather than just the one the previous round's diff happened to touch.

    `verify-interactions.mjs` gained a dedicated Stacks & Queues block mirroring the other eight
    lessons, plus the now-familiar Roadmap-block fix: the not-built-chip counts dropped from `4` to
    `3` in **all three** places they appear (the pre-chain check, the mid-chain check after Files,
    and the post-Arrays/Hash-Maps check) — confirmed by grep rather than trusting memory of where
    item 36 left them, since missing one of three would have shipped a red `npm run verify` the
    instant that specific assertion ran. The "stage 4 shows its real concepts" check grew a third
    name (`rm.includes('Stacks & Queues')`), and the Hash Maps chip-chain step gained a ninth:
    complete Stacks & Queues, confirm the stage-4 count reads `"3 OF 6"`, the path total reads
    `"9 of 25 concepts"`, and the not-built count is *still* exactly 3 — the same non-obvious
    invariant confirmed a third time now, for a third different concept. Checked for option-text
    collisions across all four questions before writing the clicks — none, no `.nth()` needed.
    261 → 270 interaction checks (5 dedicated + 4 Roadmap, the same shape every Stage-4 round has
    had since item 36).

    `audit:content` stayed at its 5-artifact baseline — double-checked again per the coordinator's
    standing ask, since "Stacks & queues" moved out of `curriculum.ts`'s literal array into
    `data/concepts.ts`, the same relocation Arrays and Hash Maps each went through, and it kept
    passing for the identical reason both of theirs did: `curriculum.ts`'s own updated doc comment
    names "Stacks & queues" (lower-case, ampersand kept, matching the design placeholder's exact
    spelling) in prose. Confirmed with a fresh `npm run audit:content` run, third time in a row this
    has been checked rather than assumed. The Page Gallery's archetype count moved 30 → 31 on
    schedule. Swept `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s route/page/concept
    counts (35 routes, 34 lesson/tool pages, 29 registered concepts), including
    `docs/ARCHITECTURE.md`'s `Roadmap.tsx` table row again — now naming all three Stage-4 concepts
    and their item numbers, kept current every round since item 35 rather than left to go stale the
    way it did for years before that.

    `npm run verify` green after: 35/35 routes, no overflow at any width, 270/270 interaction
    checks, a11y clean with zero regression (35/19, unchanged). `npm run typecheck` clean,
    `audit:content` at its 5-artifact baseline (re-verified). Ran `npm run build` before
    `npm run verify` from the start, per the standing fix for the `dist/`-staleness snag.

    **Stage 4 now has 3 of 6 concepts built: Arrays, Hash Maps, Stacks & Queues.** Three remain
    (Trees, Big-O, Sorting), plus Stage 5 still fully unbuilt behind it. `git status` confirms
    `Roadmap.tsx` was untouched for the second round running — the architecture item 35 built keeps
    proving out as generic enough to carry the rest of Stage 4 without another structural change.

## Found while working (2026-09-19)

38. ~~**Stage 4 had three real concepts (Arrays, Hash Maps, Stacks & Queues); Trees was still an
    honest placeholder.**~~ — **done 2026-09-19. Third consecutive round confirming item 35's
    prediction: `Roadmap.tsx` needed zero changes again.** Picked up mid-round after a prior
    session was cut off by a rate limit (not a real error — since reset) right after the lesson
    content and all wiring diffs were already written but never verified or committed. Rather than
    trust that hand-off summary, re-read `Trees.tsx` in full and diffed every wiring file
    (`App.tsx`, `data/concepts.ts`, `data/curriculum.ts`, `data/pages.ts`, `PageGallery.tsx`,
    `scripts/routes.mjs`, `scripts/verify-interactions.mjs`) against `HashMaps.tsx`/
    `StacksQueues.tsx`'s own archetype — all of it was genuinely complete and internally
    consistent (route, concept entry, curriculum removal, gallery card, archetype count, route
    registration, and a full dedicated interaction-test block with option-text that actually
    matches `Trees.tsx`'s own `QUESTIONS` array), so nothing needed rewriting, only verifying.
    Re-checked `curriculum.ts` first anyway, per the standing rule: Stage 4's `n: 4` entry listed
    `['Trees', 'Big-O', 'Sorting']`, Trees first, matching the ask. `/trees` ("Trees") is a single
    word — no casing-footnote needed in `curriculum.ts`'s doc comment, unlike Hash Maps' or Stacks
    & Queues' own.

    Four gotchas, and the first lesson on this path built on a genuinely recursive structure — every
    prior Stage 3/4 concept was a flat sequence or mapping, and there's no built-in tree type, so
    every question defines its own minimal `Node` class the way any two real scripts about trees
    would: in-order traversal (left, node, right) producing sorted output for a BST, where the exact
    same tree in pre-order gives a completely different sequence (the explanation draws that
    contrast rather than spending a second question re-testing "order changes the output" a
    different way); a recursive `height()` with no base case for `None` raising `AttributeError` on
    the simplest possible input, a single leaf, rather than overflowing the stack — the single most
    common bug in a first tree-recursion function, and often the very first error a beginner sees on
    this topic; inserting already-sorted values into a BST degenerating it into a straight
    right-leaning chain, an O(log n) structure silently becoming O(n) with no error to announce it,
    which is why real-world BSTs (AVL, red-black) rebalance themselves and a plain one doesn't
    promise to; and a BST search trusting an ordering invariant it never actually checks, so a tree
    built without maintaining that invariant gives a confidently *wrong* negative — not a crash, not
    an obviously-broken answer, just a value that's really there, silently unreachable by the one
    search path that assumes it wouldn't be. Deliberately did **not** spend a full question on
    "mutating a node's children mid-traversal" (one of the coordinator's own candidates) — every
    clean version tried either wasn't actually buggy (both swap-then-recurse and recurse-then-swap
    invert a tree correctly) or needed enough scaffolding to set up a real bug that it would have
    taught less per word than the invariant-violation angle above, which reaches a genuinely
    surprising, verifiable wrong answer in four honest lines.

    Wired in everywhere Stacks & Queues was: `App.tsx`'s lazy import + route (+ page-count comment,
    34 → 35), `data/concepts.ts` (`stage: 4`), `data/pages.ts`'s gallery card, `scripts/routes.mjs`.
    `curriculum.ts`'s `UPCOMING_STAGES` lost `'Trees'` from Stage 4's remaining list (two left now:
    Big-O, Sorting), and both of its doc comments picked up the same "N concepts now" bump
    `TOTAL_CONCEPTS`'s own comment has gotten every round since item 35.

    `verify-interactions.mjs` gained a dedicated Trees block mirroring the other nine lessons
    (starts unanswered, three-correct reaches the pass mark, earns completion, a wrong pick still
    shows the real explanation, try-again resets), plus the now-familiar Roadmap-block fix: the
    not-built-chip counts dropped from `3` to `2` in **all three** places they appear, confirmed by
    grep rather than trusting memory of where item 37 left them. The "stage 4 shows its real
    concepts" check grew a fourth name (`rm.includes('Trees')`), and the chip-chain gained a tenth
    step: complete Trees, confirm the stage-4 count reads `"4 OF 6"`, the path total reads
    `"10 of 25 concepts"`, and the not-built count is *still* exactly 2. Checked the already-written
    option-text against `Trees.tsx`'s actual `QUESTIONS` array for collisions before trusting the
    hand-off's clicks — all four matched exactly (`'[1, 2, 3]'`, the `AttributeError` string, the
    right-leaning-chain string, and the wrong `bst_search` pick with its "on the wrong side" reveal
    text). 270 → 279 interaction checks (5 dedicated + 4 Roadmap, the same shape every Stage-4 round
    has had since item 36).

    `audit:content` stayed at its 5-artifact baseline — confirmed with a fresh `npm run
    audit:content` run rather than assumed from the hand-off. The Page Gallery's archetype count
    moved 31 → 32 on schedule (already correctly written in the uncommitted diff; verified against
    `PAGES.length`, not just read). Swept `docs/SRS.md`, `docs/ARCHITECTURE.md`, and
    `app/README.md`'s route/page/concept counts (36 routes, 35 lesson/tool pages, 30 registered
    concepts), including `docs/ARCHITECTURE.md`'s `Roadmap.tsx` table row again — now naming all
    four Stage-4 concepts and their item numbers — plus a stale `~34`/`30-file` drift check: the
    `data/concepts.ts`-row concept count and the "~N screens" figure in the `TOTAL_CONCEPTS` row
    both needed the same bump every round since item 35 gets them, and both got it; the unrelated
    "pages/ … 30 files" line in §3's directory tree has been stale since long before this lesson
    (27 → 30 at some earlier, undated point, never touched by items 35-37 either) and was left alone
    rather than folded into this round's scope.

    `npm run build` run first (the standing fix for the `dist/`-staleness snag), confirming
    `Trees-C6R3RaLw.js` built — the exact same chunk hash the interrupted session's last message
    named, proof the content hadn't drifted across the gap. `npm run verify` green after: 36/36
    routes, no overflow at any width, 279/279 interaction checks, a11y clean with zero regression
    (35/19, unchanged — `npm run verify`'s own a11y leg noted it saw 36 routes against a 30-route
    baseline and compared new pairs only, exactly the mechanism BACKLOG item 26 built for this).
    `npm run typecheck` clean, `audit:content` at its 5-artifact baseline (re-verified).

    **Stage 4 now has 4 of 6 concepts built: Arrays, Hash Maps, Stacks & Queues, Trees.** Two remain
    (Big-O, Sorting), plus Stage 5 still fully unbuilt behind it. `git status` confirms `Roadmap.tsx`
    was untouched for the third round running — the architecture item 35 built keeps proving out as
    generic enough to carry the rest of Stage 4 without another structural change.

39. ~~**Stage 4 had four real concepts (Arrays, Hash Maps, Stacks & Queues, Trees); Big-O was
    still an honest placeholder.**~~ — **done 2026-09-19. Fourth consecutive round confirming
    item 35's prediction: `Roadmap.tsx` needed zero changes again.** Re-checked `curriculum.ts`
    first: Stage 4's `n: 4` entry listed `['Big-O', 'Sorting']`, Big-O first, matching the ask.
    Added `/big-o` ("Big-O") — the hyphen was already in the design's own placeholder, so the
    route just lower-cases it, no ampersand or casing footnote needed. Deliberately distinct from
    the existing off-path `Big-O Performance` → `big-o-performance` (`related` link, a static
    chart-and-table reference page, not a graded lesson, and not part of `conceptsInStage(4)`'s
    count) — checked both `App.tsx` and `data/concepts.ts` for a name collision before adding
    anything, found none.

    A genuinely different shape of question from every lesson before it: rather than predict a
    printed value, each of the four asks the learner to name a complexity class — the same
    multiple-choice-of-growth-rates format Stacks & Queues' own first question (`list.pop(0)`'s
    O(n) cost) already used once, now the whole lesson's format. Four mechanisms, none overlapping
    a prior lesson: `x in a_list` walking element by element (O(n), worst case touching everything)
    versus `x in a_set` computing one hash and jumping straight to a bucket (O(1)) — the same
    hash-table mechanism Hash Maps' own unhashable-list question ran into from the opposite side,
    now named explicitly in Big-O terms rather than left implicit, and the exact contrast the
    coordinator's own candidate list asked to be "extended explicitly to complexity terms"; two
    nested loops multiplying their costs rather than adding them, so a function built from two
    individually-ordinary-looking `for` loops is O(n²), not O(n) — the "each loop looks small" trap
    named directly in the prompt, with a callback to the previous question's set trick as the
    genuinely-O(n) fix; string concatenation inside a loop being O(n²) in total because a Python
    `str` is immutable and every `+=` copies everything accumulated so far into a brand-new string,
    contrasted with `''.join()`'s genuinely O(n) single-pass-and-copy — the same string immutability
    Arrays' own indexing question already established, now shown to have a second, costlier
    consequence; and `list.sort()`/`sorted()` being O(n log n) as one of the most confidently
    memorized rules in the whole topic, with a real, narrow exception: Timsort's actual best case is
    O(n) on input that's already one sorted run, which an already-sorted list always is. Deliberately
    did **not** spend a question on `list.pop(0)`'s O(n) cost or `deque.popleft()`'s O(1) fix —
    Stacks & Queues already taught that exact contrast in this exact vocabulary; repeating it here
    would have taught the same fact a second time wearing a Big-O label instead of a fourth
    genuinely new one.

    Wired in everywhere Trees was: `App.tsx`'s lazy import + route (+ page-count comment, 35 → 36),
    `data/concepts.ts` (`stage: 4`), `data/pages.ts`'s gallery card, `scripts/routes.mjs`.
    `curriculum.ts`'s `UPCOMING_STAGES` lost `'Big-O'` from Stage 4's remaining list (one left now:
    Sorting), and both of its doc comments picked up the same "N concepts now" bump `TOTAL_CONCEPTS`'s
    own comment has gotten every round since item 35.

    `verify-interactions.mjs` gained a dedicated Big-O block mirroring the other ten lessons (starts
    unanswered, three-correct reaches the pass mark, earns completion, a wrong pick still shows the
    real explanation, try-again resets), plus the now-familiar Roadmap-block fix — this time a real
    subtlety, not just a number bump: Stage 4's own related-links list already prints the text
    "Big-O Performance" on the same Roadmap page, so a plain `rm.includes('Big-O')` substring check
    would have passed even if the Big-O concept chip itself never rendered. Used an exact-match
    `page.getByRole('link', { name: 'Big-O', exact: true })` count instead, and left a comment
    explaining why, rather than let a coincidental substring collision quietly weaken the check the
    way `.nth()` collisions have been called out before. The not-built-chip count dropped from `2`
    to `1` in **all seven** places it appears — one more site than any prior round, since Big-O was
    itself one of the two concepts that count was tracking — confirmed by grep rather than trusting
    memory of where item 38 left them. The "stage 4 shows its real concepts" check grew a fifth
    name via that same exact-link check, and the Trees chip-chain step gained an eleventh: complete
    Big-O, confirm the stage-4 count reads `"5 OF 6"`, the path total reads `"11 of 25 concepts"`,
    and the not-built count is *still* exactly 1. Checked all twelve option strings across the four
    questions for collisions, both against each other and against the Stage-4 related-links text,
    before writing the clicks. 279 → 288 interaction checks (5 dedicated + 4 Roadmap, the same shape
    every Stage-4 round has had since item 36).

    `audit:content` stayed at its 5-artifact baseline — confirmed with a fresh `npm run
    audit:content` run. The Page Gallery's archetype count moved 32 → 33 on schedule. Swept
    `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s route/page/concept counts — this
    round's actual `npm run verify` output (`37/37 routes clean`) caught that the routes total had
    already ticked over from the figure written down mid-round (36) to 37 by the time Big-O's route
    was live, a reminder to read the count off the tool's own output rather than compute it by hand
    (36 lesson/tool pages, 37 routes total, 31 registered concepts), including
    `docs/ARCHITECTURE.md`'s `Roadmap.tsx` table row again — now naming all five Stage-4 concepts
    and their item numbers.

    `npm run build` run first (the standing fix for the `dist/`-staleness snag), confirming
    `BigO-d5d52y7e.js` built. `npm run verify` green after: 37/37 routes, no overflow at any width,
    288/288 interaction checks, a11y clean with zero regression (35/19, unchanged). `npm run
    typecheck` clean, `audit:content` at its 5-artifact baseline (re-verified).

    **Stage 4 now has 5 of 6 concepts built: Arrays, Hash Maps, Stacks & Queues, Trees, Big-O.** One
    remains (Sorting), plus Stage 5 still fully unbuilt behind it. `git status` confirms
    `Roadmap.tsx` was untouched for the fourth round running — the architecture item 35 built keeps
    proving out as generic enough to carry the rest of Stage 4 without another structural change.

40. ~~**Stage 4 had five real concepts (Arrays, Hash Maps, Stacks & Queues, Trees, Big-O); Sorting
    was still an honest placeholder.**~~ — **done 2026-09-19. Same shape as item 34's Stage 3
    completion.** Re-checked `curriculum.ts` first: Stage 4's `n: 4` entry listed `['Sorting']`,
    the sole remaining item, matching the ask. Added `/sorting` ("Sorting") — single word, no
    casing footnote needed, same as `Trees`/`Errors`/`Files`/`Arrays`.

    Four gotchas, none overlapping a prior lesson and none re-teaching Big-O's own `.sort()`
    complexity coverage (double-checked its fourth question before picking these, per the
    coordinator's explicit ask): `list.sort()` mutating the list in place and returning `None` —
    not the sorted list — so the classic `x = nums.sort()` bug leaves `x` empty while `nums` really
    is sorted, contrasted with `sorted()`'s genuinely new list that leaves the original untouched;
    sort *stability* — when two elements tie under the sort key, Python's sort keeps them in their
    original relative order rather than picking arbitrarily, which is exactly what makes a "sort by
    A, then stably sort by B" multi-key technique reliable; `key=` transforming what's *compared*
    without ever touching the actual values, contrasted with the genuinely surprising default —
    Python compares strings by raw code point, so every capital letter sorts before every lowercase
    one, not the dictionary order `key=str.lower` fixes; and sorting a list of genuinely
    incomparable types (`int` and `str` together) raising `TypeError` outright rather than silently
    guessing an order — Python 3 refuses to invent an answer to "is 3 less than 'two'?", unlike
    Python 2's old cross-type ordering. All four are behavior questions, not complexity ones — the
    coordinator's note left room to extend the predict-the-complexity shape "where it fits," and
    none of these four naturally needed it, so all four stayed on what each call actually *does*.

    Wired in everywhere Big-O was: `App.tsx`'s lazy import + route (+ page-count comment, 36 → 37),
    `data/concepts.ts` (`stage: 4`), `data/pages.ts`'s gallery card, `scripts/routes.mjs`.
    `curriculum.ts`'s `UPCOMING_STAGES` needed the same real structural change item 34 made for
    Stage 3's own completion, not just a string drop: Stage 4's `n: 4` entry's `concepts` array is
    now `[]` rather than the entry being deleted outright (`Roadmap.tsx` still looks it up
    unconditionally for `.concepts.length`/`.map`), and its `lock` field corrected `'IN PROGRESS'`
    → `'BUILT'`, mirroring Stage 3's own correction exactly. Unlike Stage 3, Stage 4's entry keeps
    its `related` array (`Data Structures Visual`, `Big-O Performance`, `Algorithm Visualizer`) —
    `Roadmap.tsx` renders it unconditionally once `'related' in stage4Upcoming`, and those three
    pages stay genuinely useful review/depth material now that the syllabus itself is covered, not
    pointers to unbuilt content. Both `curriculum.ts` doc-comment paragraphs (Stage 4's and
    `TOTAL_CONCEPTS`'s) were rewritten to the same "is fully built now" phrasing Stage 3's own
    paragraph uses, not just bumped in place.

    **A real staleness bug caught and fixed, not just a number bump.** `Roadmap.tsx`'s own stage-4
    JSX comment had read "one real concept built (Arrays, item 35), the rest of its syllabus
    honestly not-yet-built" since item 35 — and every round since (items 36-39, including this
    session's own Trees and Big-O rounds) reported "zero Roadmap.tsx changes" truthfully for the
    file's *logic*, which never needed touching, while that comment silently drifted further wrong
    each time a concept was added. No gate catches this — `tmp_vcheck`-style scripts don't exist
    here, and `verify-interactions.mjs` tests behavior, not comment accuracy. Caught it by rereading
    the file directly rather than trusting the "no changes needed" streak, and fixed it the same way
    item 34 fixed Stage 3's analogous comment when *that* stage completed: "stage 4 — fully built:
    all six real concepts, nothing left not-yet-built." Also updated the file's top-of-file docblock
    ("stage 3 has all six of its own" → "stage 3 and stage 4 both have all six of their own") for
    the same reason — true either way, but no longer the most accurate true statement available.
    This is a comment-only diff to `Roadmap.tsx`, not a logic change — the "Roadmap.tsx needed zero
    changes" streak was always about behavior, and stays intact in that sense, but it's worth being
    honest that the file itself was not, in fact, left alone for four rounds.

    `verify-interactions.mjs` gained a dedicated Sorting block mirroring the other eleven lessons,
    plus the Roadmap chip-chain's final step. This round hit the same boundary case item 34 hit for
    Stage 3: with Sorting built, Stage 4's own not-built-chip count also drops to zero, and since
    Stage 3 was already at zero, the *entire app* now has no "not built yet" chip anywhere. Rather
    than track a shrinking number through the whole chain, converted all seven of the file's
    `(rm.match(/not built yet/g) ?? []).length === 1` checks — the ones item 39 left matched on `1`
    — to `!rm.includes('not built yet')`, the exact operator item 34 switched Stage 3's own checks
    to at its own zero-remaining boundary, and wrote the new eighth check (right after Sorting's own
    completion, the actual milestone moment) directly in that same style rather than as a `=== 0`
    that would need converting again next round — confirmed by grep that no `.length === N` variant
    of this check survives anywhere in the file. The "stage 4 shows its real concepts" check grew a sixth
    name, and the Big-O chip-chain step gained a twelfth: complete Sorting, confirm the stage-4
    count reads `"6 OF 6"`, the path total reads `"12 of 25 concepts"`, and — the actual milestone —
    `!rm.includes('not built yet')` now holds app-wide. Checked all twelve Sorting option strings
    for collisions against each other before writing the clicks — none, no `.nth()` needed. 288 →
    297 interaction checks (5 dedicated + 4 Roadmap, the same shape every Stage-4 round has had
    since item 36 — the seven converted `not built yet` assertions changed existing checks' logic
    without adding new ones; only the dedicated block and the four Roadmap chip-chain steps do).

    `audit:content` stayed at its 5-artifact baseline — confirmed with a fresh `npm run
    audit:content` run. The Page Gallery's archetype count moved 33 → 34 on schedule. Swept
    `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s route/page/concept counts (37
    lesson/tool pages, 38 routes total, 32 registered concepts), including
    `docs/ARCHITECTURE.md`'s `Roadmap.tsx` table row again — now saying stage 3 *and* stage 4 are
    both fully built, all six concepts each, rather than counting Stage 4's real concepts as a
    fraction.

    `npm run build` run first (the standing fix for the `dist/`-staleness snag), confirming
    `Sorting-A0cuWgRm.js` built. `npm run verify` green after: 38/38 routes, no overflow at any
    width, 297/297 interaction checks, a11y clean with zero regression (35/19, unchanged — the a11y
    audit's own note confirmed it compared against a 38-route run, up from 30 at baseline recording,
    new pairs only). `npm run typecheck` clean, `audit:content` at its 5-artifact baseline
    (re-verified).

    **Stage 4 is now complete: 6 of 6 concepts (Arrays, Hash Maps, Stacks & Queues, Trees, Big-O,
    Sorting) are real, graded lessons** — the third Roadmap stage to reach that state, after Stage
    1/2 and Stage 3 (item 34). Only Stage 5 (APIs & Databases) remains fully unbuilt: six concepts
    (HTTP, REST, SQL basics, Joins, Auth, Deploy) plus the capstone project, all still honestly
    reading "not yet built" behind its own `laterStages` lock. That is the next real work whenever
    picked up.

41. ~~**Stage 5 (APIs & Databases) was still fully unbuilt — six concepts, no real page behind any
    of them.**~~ — **done 2026-09-19. Stage 5's first real concept, and the round that graduates it
    out of `Roadmap.tsx`'s locked-stage path for good.** Re-checked `curriculum.ts` first, per the
    standing rule, rather than trusting the coordinator's own summary of the syllabus: Stage 5's
    `n: 5` entry listed `['HTTP', 'REST', 'SQL basics', 'Joins', 'Auth', 'Deploy']`, HTTP first,
    confirming both the exact list and the order. Added `/http` ("HTTP") — the design's own
    placeholder wrote it all-caps as the acronym it is, and the built label keeps that rather than
    title-casing it, the same "keep the real spelling" call `Big-O` made for its own hyphen.

    **A genuinely different question shape, used because it fits, not by default.** Every prior
    Stage 3/4 lesson asked "what does this Python code do"; HTTP has no code to run — just a
    request (or two) and the real protocol rule that decides the outcome, so three of the four
    questions land on a status code instead of a printed value, the same predict-then-reveal
    mechanic every lesson has used, aimed at what HTTP actually hands back. Checked `/api-anatomy`
    first (Stage 5's own `related` reference page) to avoid re-teaching its wire-dump-and-decoder
    strip's ground — bare verb-to-purpose mapping and the 2xx/4xx/5xx families are already covered
    there as static reference material, so none of the four went there. Four gotchas instead: `PUT`
    being idempotent — resending an identical request a second time changes nothing further, which
    is exactly why it's safe to retry automatically and `POST` isn't; `401 Unauthorized` ("I don't
    know who you are; log in") vs `403 Forbidden` ("I know exactly who you are, and it's still no")
    — a distinction `/api-anatomy`'s own status strip labels but never explains; `PUT` silently
    deleting fields a client didn't resend, because `PUT` replaces the *entire* resource rather than
    merging in what was sent — the real data-loss bug `PATCH` exists to prevent; and HTTP's
    statelessness — a login a few seconds ago buys a follow-up request nothing at all unless it
    carries its own proof (a cookie, a token), because the protocol itself has no memory between
    requests. `CodeListing` stayed the presentation shell (a `.http`-style request transcript is as
    "showable" in it as a Python snippet was), coloring HTTP methods/headers/JSON with the same
    `syn.kw`/`syn.fn`/`syn.str`/`syn.cm` keys rather than inventing a new component for a new
    subject — the same minimal-necessary shift `BigO.tsx` made to its prompt wording without
    touching the page shape around it.

    **The real second half of this round: graduating Stage 5 out of the locked-stage path, the way
    the coordinator asked — "the same way Stage 4 did on Arrays," except Stage 5 is the *last*
    stage, so this round also had to retire the machinery that shape existed for.** Widened
    `Concept.stage`'s type and `conceptsInStage()`'s signature from `1 | 2 | 3 | 4` to include `5`
    (a real, previously-missing gap — nothing had needed a stage-5 concept before this round, so it
    had never been caught). `curriculum.ts`'s `n: 5` entry lost `'HTTP'` from its `concepts` array
    and its `lock` moved `'NOT YET BUILT'` → `'IN PROGRESS'`, the exact same value Stage 4's own
    entry held from item 35 through item 39 before it hit `'BUILT'` at item 40. In `Roadmap.tsx`:
    `laterStages = UPCOMING_STAGES.filter((s) => s.n > 4)` — the array that used to render Stage 5's
    fully-locked block — becomes `filter((s) => s.n > 5)` once Stage 5 leaves it, and in a five-stage
    path that's now *permanently* empty; there is no stage 6 coming. Rather than leave a `.map()`
    over a guaranteed-forever-empty array sitting in the file (the same "dead field" drift item 34's
    own `lock` fix warned about, one level up), removed `laterStages` entirely, along with
    `LockedTag` (now had nothing left to render) and `NumberNode`'s `'locked'` state (every stage is
    unlocked now, so it always renders `'current'` — simplified to drop the prop rather than keep an
    always-true branch alive).

    **Extracted the `PartialStage` component the file's own comment had been waiting to write.**
    Stage 3 and Stage 4's "N of total" block had been hand-duplicated since item 35, with a comment
    explicitly naming the trigger for changing that: *"two data points don't yet justify a shared
    component... revisit that call once stage 5 needs the same shape too, not before."* Stage 5
    needing it, for real, is what this round is — so rather than hand-duplicate a third ~20-line
    block, extracted `PartialStage(n, title, done, built, upcoming, chipState, connector)` and
    rewired all three stages through it. One real behavior preserved deliberately, not by accident:
    `connector` is `'none'` only for whichever stage is currently *last* on the page (now stage 5,
    where stage 4 used to be) — the same `paddingBottom: last ? 0 : 34` treatment the old
    `laterStages` block gave its own last item, now correctly following whichever stage is actually
    last rather than being hardcoded to one. Roadmap chunk size dropped 8.28 kB → 7.04 kB in the
    build output despite the new component, net evidence the removal outweighed the addition.

    **One real bug caught before it shipped, not after.** First pass wrote `title="4 · Data
    Structures &amp; Algorithms"` as a plain string prop to `PartialStage` — copied straight from
    the old JSX children text, where `&amp;` is a real HTML entity React decodes. As a plain TS
    string literal passed through `{title}` interpolation, it isn't: it would have rendered the
    literal five characters `&amp;` on the page instead of `&`, invisible to every automated gate
    (renders fine, no console error, no broken link) and only catchable by actually reading the
    rendered text — caught by rereading the diff before running anything, not by a test failing.
    Fixed to a literal `&` in both `title` props (stage 4 and stage 5) before the first build.

    **Stage 5's `tail` (`". Ends with the capstone project."`) needed a real decision, not a silent
    drop.** `PartialStage`'s shape, inherited from Stage 3/4's own block, has no slot for a trailing
    sentence — neither of them ever needed one. Dropping `tail` silently while wiring Stage 5 into
    that shape would have been a real information-loss regression introduced *by this round*, not
    inherited staleness from an earlier one, so it needed handling, not skipping. Folded the same
    information into `related` instead — added `Project Build-Along` (the app's one capstone-shaped
    concept, `stage: null` in `data/concepts.ts`, already routing to `/project-build-along`)
    alongside the existing `API Anatomy` — reusing the `related`-lessons mechanism Stage 4's own
    graduation already proved survives a stage finishing, rather than inventing a one-off feature
    for a single sentence. `syllabusOf()` (the function that used to print `tail`) lost its only
    caller in the same edit and was removed as dead code alongside `laterStages`.

    Wired in everywhere Sorting was: `App.tsx`'s lazy import + route (+ page-count comment, 37 →
    38), `data/concepts.ts` (`stage: 5`, plus the new `// ── Stage 5 · APIs & Databases (one concept
    built so far)` section header), `data/pages.ts`'s gallery card, `scripts/routes.mjs`.

    `verify-interactions.mjs` gained a dedicated HTTP block mirroring the other twelve lessons, plus
    a real reworking of the Roadmap section rather than a routine chip-chain append. The app-wide
    "not built yet" count, which had briefly hit true zero at item 40 (both Stage 3 and Stage 4
    fully built, nothing else in the path yet), is no longer zero — Stage 5 contributes five
    (`REST`, `SQL basics`, `Joins`, `Auth`, `Deploy`) — so every one of the eight
    `!rm.includes('not built yet')` checks item 40 had just switched to were reverted to counting
    `(rm.match(/not built yet/g) ?? []).length === 5`, the exact style used before item 40's
    boundary case, now with a new constant. Also removed the now-permanently-false "stage 5 still
    reads not yet built" (`NOT YET BUILT` tag) check outright — that uppercase tag came from
    `LockedTag`, which no longer exists — rather than adjust it to assert something that isn't true
    anymore. Added an exact-match `page.getByRole('link', { name: 'HTTP', exact: true })` count for
    the "stage 5 shows its first real concept" check, the same defensive habit `Big-O`'s own
    collision-avoidance established, even though no current collision exists for "HTTP" — cheap
    insurance against a future one a plain substring couldn't catch. The "stage 5 points at" check
    grew to require both `API Anatomy` and `Project Build-Along`. New chip-chain step: complete
    HTTP, confirm the stage-5 count reads `"1 OF 6"`, the path total reads `"13 of 25 concepts"`,
    and the not-built count is *still* exactly 5 — the same invariant proven for Stage 4's own
    concepts now proven for Stage 5's first. Checked all twelve HTTP option strings for collisions
    against each other before writing the clicks — none, no `.nth()` needed. 297 → 306 interaction
    checks (5 dedicated + 4 Roadmap, the same shape every new-lesson round has had since item 36).

    `audit:content` stayed at its 5-artifact baseline — confirmed with a fresh `npm run
    audit:content` run. The Page Gallery's archetype count moved 34 → 35 on schedule. Swept
    `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s route/page/concept counts (38
    lesson/tool pages, 39 routes total, 33 registered concepts — read the routes figure off `npm run
    verify`'s own `39/39 routes clean` output rather than hand-computed, the same lesson item 40
    flagged), including `docs/ARCHITECTURE.md`'s `Roadmap.tsx` table row and its `data/curriculum.ts`
    row (which still named the now-removed `syllabusOf` in its exports list — caught and fixed
    while sweeping, not left for a future round to find stale).

    `npm run build` run first (the standing fix for the `dist/`-staleness snag), confirming
    `Http-CE_PgNn7.js` built and that `Roadmap`'s own chunk got smaller, not bigger, despite the new
    component. `npm run verify` green after: 39/39 routes, no overflow at any width, 306/306
    interaction checks, a11y clean with zero regression (35/19, unchanged). `npm run typecheck`
    clean — including through the `Concept.stage`/`conceptsInStage()` type-widening and the full
    `Roadmap.tsx` rewrite — and `audit:content` at its 5-artifact baseline (re-verified).

    **Stage 5 now has 1 of 6 concepts built: HTTP.** Five remain (`REST`, `SQL basics`, `Joins`,
    `Auth`, `Deploy`), plus the capstone project still ahead of it. No stage on the Roadmap is a
    fully locked placeholder any more — the last one graduated this round. `git status` confirms
    `Roadmap.tsx` *was* touched this time, deliberately: a real component extraction and a dead-code
    removal, not the "zero changes" streak items 36-39 reported, because this round is exactly the
    boundary case that streak's own precedent (item 35, item 34) always said would eventually need
    one.

42. ~~**Stage 5's second concept, REST, was still an honest placeholder** (`['SQL basics', 'Joins',
    'Auth', 'Deploy']` was all that remained of Stage 5's original six-item syllabus once HTTP
    shipped at item 41, but `REST` itself hadn't moved yet).~~ — **done 2026-09-19.** Picked up
    after a session-wide rate limit killed the agent that had written `Rest.tsx`'s full lesson
    content (401 lines, four predict-the-outcome questions) but crashed before wiring the page into
    anything — no route, no `App.tsx` entry, no `data/concepts.ts`/`curriculum.ts` registration, no
    interaction tests, no docs. Rather than trust that hand-off, re-read `Rest.tsx` in full end to
    end first: genuinely REST-specific content, not a re-skin of HTTP's own four gotchas — checked
    against `/api-anatomy` and `/http` by the file's own header comment, same discipline item 41
    used — so it needed wiring, not rewriting.

    Four gotchas, all design conventions REST layers on top of HTTP rather than protocol rules HTTP
    already owns: **resource-oriented URLs** — `/users/55/reviews` names two resources and nests
    one under the other, versus `/getReviewsForUser/55` baking a verb into the path that `GET`
    already carries; **collection vs. single-item response shape** — `/books/9999` names one
    specific resource, so a missing one is `404`, never a `200` dressed up as `{}` or `[]` (the
    empty-array shape is *correct*, but only for a collection endpoint, never a single-item one —
    mixing the two is what makes a client's parsing code have to guess); **query parameters vs. one
    path per view** — `/products?sort=price&page=2` asks for a different view of the one `/products`
    resource, versus inventing a distinct URL per sort order and page number, which balloons
    unboundedly and breaks the moment two filters need combining; and **POST-to-a-collection vs.
    PUT-to-a-known-URL for creation** — who invents the new resource's id, and what a retried,
    identical request does under each choice (a second `POST` makes a second user; a second
    identical `PUT` does not) — deliberately revisiting `PUT`'s idempotency from item 41's own first
    question, but from the "which verb should a client even reach for" angle rather than repeating
    "does resending PUT change anything further." `CodeListing` stayed the presentation shell,
    `.http`-style request transcripts exactly like `/http` used — REST is a set of conventions *for*
    HTTP, not a different wire format, so there was no reason to invent a new listing style.

    Wired in everywhere HTTP was: `App.tsx`'s lazy import + route (+ page-count comment, 38 → 39),
    `scripts/routes.mjs`, `data/pages.ts`'s gallery card, `data/concepts.ts` (`stage: 5`, folded
    into the existing "Stage 5 · APIs & Databases" section header rather than a new one), and
    `PageGallery.tsx`'s archetype count (35 → 36). **One real bug caught by rerunning the totals,
    not by reading the diff** — the first pass edited `curriculum.ts`'s doc-comment prose to say
    Stage 5 now has "two real concepts" but never actually removed `'REST'` from the `n: 5` entry's
    `concepts` array itself, so `TOTAL_CONCEPTS` silently computed 26 instead of 25 and four
    `concepts:` roadmap-panel checks failed with a stale "0 of 25" baseline. Caught by running a
    throwaway `npx tsx -e` script printing `PATH_CONCEPTS.length`/the `UPCOMING_STAGES` sum/
    `TOTAL_CONCEPTS` directly rather than trusting the doc comment matched the array below it —
    the exact class of drift `docs/ARCHITECTURE.md`'s own `TOTAL_CONCEPTS` history (23 → 25) was
    written to warn about. Fixed by actually editing the array; reran the same script to confirm
    25 before rerunning the suites.

    `verify-interactions.mjs` gained a dedicated REST block mirroring HTTP's own (start unanswered,
    three correct reaches the pass mark, earns completion, a wrong pick shows the real explanation,
    try again resets), plus a Roadmap chip-chain step following HTTP's: complete REST, confirm the
    stage-5 count reads `"2 OF 6"`, the path total reads `"14 of 25 concepts"`, and the not-built
    count is *still* exactly 4 (REST completing is a progress event, not a build event — it doesn't
    touch `UPCOMING_STAGES.concepts`, which already dropped to 4 the moment the page was wired in).
    All nine of item 41's `(rm.match(/not built yet/g) ?? []).length === 5` checks — spanning the
    whole Stage 3/4 chip-chain, not just the Stage 5 ones — reverted to `=== 4`, since the "not
    built yet" count reflects what's *coded*, not what a given moment in the test's simulated
    progress has *earned*, so it drops for the entire file the instant REST has a real page, not
    just from REST's own completion step onward. Added an exact-match `page.getByRole('link', {
    name: 'REST', exact: true })` count, the same collision-avoidance habit `HTTP`/`Big-O`
    established. 306 → 316 interaction checks (6 dedicated + 4 Roadmap, one more than item 41's own
    5+4 split since this round's dedicated block also gained the wrong-pick coverage HTTP's had from
    the start).

    `audit:content` stayed at its 5-artifact baseline — confirmed with a fresh `npm run
    audit:content` run, unrelated to REST. Swept `docs/SRS.md`, `docs/ARCHITECTURE.md`, and
    `app/README.md`'s route/page/concept counts (39 lesson/tool pages, 40 routes total, 34
    registered concepts — read the routes figure off `npm run verify`'s own `40/40 routes clean`
    output, the same lesson item 40 and item 41 both already flagged), including
    `docs/ARCHITECTURE.md`'s `Roadmap.tsx` table row (now naming both HTTP and REST, "four remain"
    not "five") and a stale `Roadmap.tsx` inline comment still reading "its first real concept
    (HTTP, item 41)".

    `npm run build` run first, confirming `Rest-C_Re3WIu.js` built alongside `Http-D0dcO-xO.js`.
    `npm run verify` green after: 40/40 routes, no overflow at any width, 316/316 interaction
    checks, a11y clean with zero regression (35/19, unchanged). `npm run typecheck` clean.
    `audit:content` at its 5-artifact baseline (re-verified).

    **Stage 5 now has 2 of 6 concepts built: HTTP, REST.** Four remain (`SQL basics`, `Joins`,
    `Auth`, `Deploy`), plus the capstone project still ahead of it. `Roadmap.tsx` itself needed no
    further change this round — `PartialStage`, extracted at item 41 specifically so a later
    Stage-5 concept wouldn't need one, held up on its very first use.

43. ~~**Stage 5's third concept, SQL basics, was still an honest placeholder** (`['SQL basics',
    'Joins', 'Auth', 'Deploy']` was all that remained of Stage 5's original six-item syllabus once
    HTTP and REST shipped at items 41-42).~~ — **done 2026-09-20.** Confirmed the exact next item
    against `BACKLOG.md`'s own most recent entries first, per the standing rule, then re-read
    `curriculum.ts` fresh rather than trusting the task hand-off's own summary: Stage 5's `n: 5`
    entry listed `['SQL basics', 'Joins', 'Auth', 'Deploy']`, SQL basics first, confirming both the
    list and the order. Grepped `src/pages/` and `src/data/` for "SQL" before writing a line of
    lesson content, per the standing instruction — the only hit was `curriculum.ts`'s own
    placeholder string, so this is genuinely new subject matter on the path, not a duplicate of an
    existing page.

    **No prior lesson to build on or avoid repeating, unlike REST building on HTTP — so the scoping
    decision was what to leave OUT, not what not to re-teach.** `Joins` is the very next name in
    Stage 5's own remaining syllabus, so every one of the four questions was kept deliberately
    single-table: no `JOIN` appears anywhere in any of the four `.sql` listings, so that lesson
    still has real, untaught ground to stand on rather than a rerun of this one. Four gotchas, all
    built around the same throughline — SQL fails silently far more often than it errors loudly,
    a genuinely different kind of trap than anything HTTP or REST taught, where a wrong verb or a
    missing header is at least visible in the response: **NULL comparison** — `WHERE phone = NULL`
    matches zero rows, not the rows where `phone` really is NULL, because SQL's three-valued logic
    means any comparison *to* NULL (even `NULL = NULL`) evaluates to UNKNOWN rather than TRUE, and
    a `WHERE` clause drops an UNKNOWN row exactly like a FALSE one, silently, with no error to say
    the query could never have matched anything — the fix is `IS NULL`, a different operator
    entirely, not a different value; **`DELETE`/`UPDATE` with no `WHERE` clause** — the clause isn't
    optional syntax narrowing an already-scoped statement, it's the only thing that ever scopes one,
    so leaving it off targets every row in the table, no confirmation asked and no partial-credit
    guess at what you probably meant; **`COUNT(*)` vs. `COUNT(column)`** — `COUNT(*)` counts every
    row regardless of content, while `COUNT(column)` (like every other aggregate — `SUM`, `AVG`,
    `MAX`, `MIN`) silently skips rows where that column is NULL, the first question's NULL-skipping
    rule resurfacing in a completely different kind of statement; and **`WHERE` vs. `HAVING`** — SQL
    has a real, fixed logical processing order (`FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT`
    → `ORDER BY`) that doesn't match the order the clauses are typed in, so `WHERE COUNT(*) > 3` is
    a genuine error in every mainstream engine, since `WHERE` runs before grouping even happens and
    there's no aggregate value yet to compare against — `HAVING` exists specifically to filter after
    aggregation, deliberately revisiting `WHERE`'s row-by-row job from the second question, but from
    the "which clause can even see this value" angle, the same kind of second look REST's own fourth
    question took at `PUT`'s idempotency from HTTP's first. `filename`s here switch to `.sql` files
    rather than `.http` transcripts — a new code-listing convention for a new kind of code, the same
    call `/http` made switching from Python snippets to wire-format requests in the first place;
    `syn.kw` colors SQL keywords, `syn.fn` colors aggregate function calls (`COUNT(*)`), `syn.str`
    colors string literals, and `syn.cm` carries each scenario's own `--` comment.

    Wired in everywhere REST was: `App.tsx`'s lazy import + route (+ page-count comment, 39 → 40),
    `scripts/routes.mjs`, `data/pages.ts`'s gallery card, `data/concepts.ts` (`stage: 5`, folded
    into the existing "Stage 5 · APIs & Databases" section header rather than a new one), and
    `PageGallery.tsx`'s archetype count (36 → 37). **Verified the array edit, not just the comment,
    before running anything** — the standing instruction called out that a prior round in this
    session shipped exactly this bug (editing `curriculum.ts`'s doc-comment prose while leaving the
    stale entry in the `concepts` array itself), so this round ran the throwaway `npx tsx -e` script
    up front, immediately after the edit, rather than after a failing test caught it: printed
    `PATH_CONCEPTS.length` (22), the `UPCOMING_STAGES` sum (3), and `TOTAL_CONCEPTS` (25) directly
    from the real modules, confirming the array itself had actually lost `'SQL basics'` rather than
    trusting the prose above it said so. **A second stale comment caught the same way — by rereading
    the file rather than assuming a prior round's sweep was complete** — `Roadmap.tsx`'s own JSX
    comment above the stage-5 `PartialStage` call still read "its first two real concepts (HTTP item
    41, REST item 42)"; corrected to "its first three real concepts (HTTP item 41, REST item 42, SQL
    Basics item 43)" before the first build, the same class of drift item 40's "one real concept
    built (Arrays, item 35)" comment and item 42's own stale find both already warned about.

    `verify-interactions.mjs` gained a dedicated SQL Basics block mirroring REST's own (start
    unanswered, three correct reaches the pass mark, earns completion, a wrong pick shows the real
    explanation, try again resets), plus a Roadmap chip-chain step following REST's: complete SQL
    Basics, confirm the stage-5 count reads `"3 OF 6"`, the path total reads `"15 of 25 concepts"`,
    and the not-built count is *still* exactly 3 (SQL Basics completing is a progress event, not a
    build event — it doesn't touch `UPCOMING_STAGES.concepts`, which already dropped to 3 the moment
    the page was wired in). All ten of item 42's `(rm.match(/not built yet/g) ?? []).length === 4`
    checks — spanning the whole Stage 3/4 chip-chain, not just the Stage 5 ones — reverted to
    `=== 3`, the same "it drops for the entire file the instant the page exists, not just from its
    own completion step onward" rule item 42 established for the identical situation. Added an
    exact-match `page.getByRole('link', { name: 'SQL Basics', exact: true })` count for the "stage 5
    shows its third real concept" check, the same collision-avoidance habit every prior lesson round
    has used. 316 → 326 interaction checks (5 dedicated + 4 Roadmap, one fewer than REST's own 6+4
    split since REST's dedicated block had grown a wrong-pick check HTTP's didn't originally have —
    this round's dedicated block already included one from the start, matching REST's shape exactly
    rather than growing into it).

    `audit:content` stayed at its 5-artifact baseline — confirmed with a fresh `npm run
    audit:content` run, unrelated to SQL Basics (it has no `.dc.html` prototype, same as HTTP and
    REST before it). Swept `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s
    route/page/concept counts (40 lesson/tool pages, 41 routes total, 35 registered concepts — read
    the routes figure off `npm run verify`'s own `41/41 routes clean` output rather than
    hand-computed, the same lesson item 40, 41 and 42 all already flagged), including
    `docs/ARCHITECTURE.md`'s `Roadmap.tsx` table row (now naming HTTP, REST and SQL Basics, "three
    remain" not "four").

    `npm run build` run first, confirming `SqlBasics-D01UVHvk.js` built alongside `Http-CtaQCNoO.js`
    and `Rest-CHeiMU8d.js`. `npm run verify` green after: 41/41 routes, no overflow at any width,
    326/326 interaction checks, a11y clean with zero regression (35/19, unchanged). `npm run
    typecheck` clean. `audit:content` at its 5-artifact baseline (re-verified).

    **Stage 5 now has 3 of 6 concepts built: HTTP, REST, SQL Basics.** Three remain (`Joins`,
    `Auth`, `Deploy`), plus the capstone project still ahead of it. `Roadmap.tsx` itself needed no
    further change this round beyond the stale JSX comment above — `PartialStage`, extracted at item
    41 specifically so a later Stage-5 concept wouldn't need one, held up on its third use in a row.

44. ~~**Stage 5's fourth concept, Joins, was still an honest placeholder** (`['Joins', 'Auth',
    'Deploy']` was all that remained of Stage 5's original six-item syllabus once HTTP, REST and SQL
    Basics shipped at items 41-43).~~ — **done 2026-09-20.** Confirmed the exact next item against
    `BACKLOG.md`'s own most recent entries first (item 43's closing line names `Joins` as the next of
    the three remaining), then re-read `curriculum.ts` fresh rather than trusting the task hand-off's
    own summary: Stage 5's `n: 5` entry listed `['Joins', 'Auth', 'Deploy']`, `Joins` first, confirming
    both the list and the order.

    **SQL Basics' own four questions were deliberately kept single-table, so Joins is the path's
    first lesson to reach across more than one table at once.** Re-read `SqlBasics.tsx` fresh first,
    per the standing instruction, and confirmed by grep that no `JOIN` keyword appears anywhere in any
    of its four `.sql` listings — so nothing here risks repeating it, and the scoping question was
    "what's the most genuine ground a JOIN lesson can stand on," not "what do I need to avoid." Every
    one of the four gotchas was **verified against a real SQL engine before being written** — Python's
    bundled `sqlite3` module, not just reasoned through by hand, since the standing instruction was
    explicit that the four had to be "verified by thinking through the actual SQL semantics, not
    assumed," and running the real thing is strictly stronger than that. **INNER JOIN vs. LEFT JOIN
    row-count** — a `customers` table (5 rows, one with zero orders) joined to `orders` with
    `INNER JOIN` returns 4 rows, not 5: the customer with no orders has nothing to pair with and
    produces no row at all, not a row with blanks — that's the detail a plausible wrong answer
    conflates, imagining `INNER JOIN` also NULL-pads the way `LEFT JOIN` does. `LEFT JOIN` on the
    identical query returns 5, correctly padding her missing columns with NULL. **The classic "LEFT
    JOIN, then WHERE on the right table's column" trap** — and this one isn't a coincidence: SQL
    Basics' own first question closed by naming this exact page as where it would resurface ("a LEFT
    JOIN's unmatched side comes back as NULL too, and this exact silent-empty-result behavior is the
    first thing that trips people up about it"), so Joins' second question is that payoff, verified
    two ways rather than one — the actual row count (`LEFT JOIN` + `WHERE o.status = 'shipped'`
    returns 2 rows, not 5), and that swapping in `INNER JOIN` on the identical query produces a
    byte-identical result set, proving the `LEFT` accomplished nothing once that `WHERE` clause was in
    play. **Many-to-many fan-out inflating an aggregate** — joining two separate one-to-many relations
    (`orders`, `reviews`) directly to the same `customers` row multiplies instead of adding: a
    customer with 3 real orders and 2 real reviews gets `COUNT(o.id)`/`COUNT(r.id)` back as 6 and 6,
    not 3 and 2, because the join produces one combined row per (order, review) *pair* with no way to
    know the two are unrelated to each other. Verified the fix too — `COUNT(DISTINCT o.id)` correctly
    returns 3. **LEFT JOIN + IS NULL as a deliberate anti-join** — the constructive flip side of
    question 1, and it explicitly reuses question 1's exact dataset ("Same customers/orders as
    question 1") so the payoff lands as a callback rather than a fresh scenario: `WHERE o.id IS NULL`
    correctly isolates the one customer with no match, and only works because `IS NULL` is a dedicated
    operator built to test for NULL itself, unlike `=`, which falls into the same UNKNOWN trap
    question 2 covers. Verified that swapping in `INNER JOIN` here returns nothing, proving `LEFT
    JOIN` isn't optional for this pattern, it's the entire mechanism. `filename`s stay `.sql`, the
    convention SQL Basics established; `syn.kw` now also colors join types (`INNER JOIN`, `LEFT
    JOIN`, `ON`) alongside the existing SQL keywords.

    Wired in everywhere SQL Basics was: `App.tsx`'s lazy import + route (+ page-count comment, 40 →
    41), `scripts/routes.mjs`, `data/pages.ts`'s gallery card, `data/concepts.ts` (`stage: 5`, folded
    into the existing "Stage 5 · APIs & Databases" section header rather than a new one), and
    `PageGallery.tsx`'s archetype count (37 → 38). **Verified the array edit, not just the comment,
    before running anything** — same discipline item 43 established after the exact bug shipped once
    earlier this session: ran the throwaway `npx tsx -e` script immediately after editing
    `curriculum.ts`, printing `PATH_CONCEPTS.length` (23), the `UPCOMING_STAGES` sum (2), and
    `TOTAL_CONCEPTS` (25) directly from the real modules, confirming the array itself had actually
    lost `'Joins'` rather than trusting the prose above it said so. **A third stale comment caught the
    same way — by rereading the file rather than assuming a prior round's sweep was complete** —
    `Roadmap.tsx`'s own top-of-file comment still read "stage 5 has its first, HTTP, item 41," never
    updated across items 42 or 43 even though the file's *other* stale comment (the JSX one directly
    above the `PartialStage` call) was corrected both times; both are now accurate, closing the drift
    the task hand-off flagged as having "needed correcting twice already."

    `verify-interactions.mjs` gained a dedicated Joins block mirroring SQL Basics' own (start
    unanswered, three correct reaches the pass mark, earns completion, a wrong pick shows the real
    explanation, try again resets), plus a Roadmap chip-chain step following SQL Basics': complete
    Joins, confirm the stage-5 count reads `"4 OF 6"`, the path total reads `"16 of 25 concepts"`, and
    the not-built count is *still* exactly 2 (Joins completing is a progress event, not a build event
    — it doesn't touch `UPCOMING_STAGES.concepts`, which already dropped to 2 the moment the page was
    wired in). All eleven of item 43's `(rm.match(/not built yet/g) ?? []).length === 3` checks —
    spanning the whole Stage 3/4 chip-chain, not just the Stage 5 ones — reverted to `=== 2`, the same
    "it drops for the entire file the instant the page exists, not just from its own completion step
    onward" rule item 43 established for the identical situation. Added an exact-match
    `page.getByRole('link', { name: 'Joins', exact: true })` count for the "stage 5 shows its fourth
    real concept" check, the same collision-avoidance habit every prior lesson round has used. 326 →
    336 interaction checks (5 dedicated + 5 Roadmap — one more than SQL Basics' own 5+4 split, since
    this round's Roadmap block needed both a chip-link check and its own completion step, matching the
    shape every stage-5 concept before it has grown into).

    `audit:content` stayed at its 5-artifact baseline — confirmed with a fresh `npm run
    audit:content` run, unrelated to Joins (it has no `.dc.html` prototype, same as HTTP, REST and SQL
    Basics before it). Swept `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s
    route/page/concept counts (41 lesson/tool pages, 42 routes total, 36 registered concepts — read
    the routes figure off a direct `verify:routes` run's own `42/42 routes clean` output rather than
    hand-computed, the same lesson items 40 through 43 all already flagged), including
    `docs/ARCHITECTURE.md`'s `Roadmap.tsx` table row (now naming HTTP, REST, SQL Basics and Joins,
    "two remain" not "three").

    `npm run build` run first, confirming `Joins-CkhVAjJB.js` built alongside `Http-B6KkIsf0.js`,
    `Rest-DmbV349A.js` and `SqlBasics-DcTpJeHu.js`. `npm run verify` green after: 42/42 routes, no
    overflow at any width, 336/336 interaction checks, a11y clean with zero regression (35 failures
    across 19 pairs, unchanged). `npm run typecheck` clean. `audit:content` at its 5-artifact baseline
    (re-verified).

    **Stage 5 now has 4 of 6 concepts built: HTTP, REST, SQL Basics, Joins.** Two remain (`Auth`,
    `Deploy`), plus the capstone project still ahead of it. `Roadmap.tsx` itself needed no further
    logic change this round beyond the two stale comments above — `PartialStage`, extracted at item 41
    specifically so a later Stage-5 concept wouldn't need one, held up on its fourth use in a row.

45. ~~**Stage 5's fifth concept, Auth, was still an honest placeholder** (`['Auth', 'Deploy']` was
    all that remained of Stage 5's original six-item syllabus once HTTP, REST, SQL Basics and Joins
    shipped at items 41-44).~~ — **done 2026-09-20.** Confirmed the exact next item against
    `BACKLOG.md`'s own most recent entries first (item 44's closing line names `Auth` as the next of
    the two remaining), then re-read `curriculum.ts` fresh rather than trusting the task hand-off's
    own summary: Stage 5's `n: 5` entry listed `['Auth', 'Deploy']`, `Auth` first, confirming both.

    **HTTP and REST both leaned on "the request needs to prove who's asking" without ever explaining
    what that proof actually is, so Auth is the lesson that finally answers it — and had real overlap
    to check for first.** Re-read `Http.tsx` fresh, per the standing instruction, and grepped it for
    its own second question: confirmed it's exactly 401 Unauthorized vs. 403 Forbidden
    (identity-absent vs. identity-known-but-refused), with nothing about tokens, sessions, or how a
    server actually verifies anyone — so none of this round's four questions repeat that ground. Also
    read `/api-anatomy` first (which mentions "the token is your ID card" and shows an `Authorization:
    Bearer eyJhbGci…` header but never explains what's inside it or what makes it trustworthy) and
    `Glossary.tsx`'s existing JWT entry ("signed, self-contained… anyone can read it, they just can't
    forge a valid signature for it") — this round's second question turns that stated glossary fact
    into something the learner watches actually happen and fails to forge, rather than repeating it as
    a second flat definition. Every one of the four gotchas was **verified by tracing the real
    mechanism through step by step**, the standing instruction's bar for a security claim specifically:
    a plausible-sounding security fact isn't good enough on its own, it has to be correct.

    **Why a fast hash is the wrong tool for a password** — genuinely new ground, since no prior lesson
    on the path had touched password storage at all. `sha256(password)` isn't reversed by an attacker
    who gets a leaked users table, it's guessed-and-checked: pick a candidate, hash it the identical
    way, compare. SHA-256 is deliberately fast (built for cheap checksums, not secrecy), so consumer
    GPU hardware burns through billions of guesses a second against it, cracking every weak password in
    a leaked table in minutes regardless of whether the algorithm is technically reversible. A
    purpose-built password hash (bcrypt/scrypt/Argon2) is deliberately *slow* and tunable, multiplying
    an attacker's total cost across every guess by the same factor, while one real login barely notices
    the extra milliseconds. **A JWT is signed, not encrypted** — its header and payload are just
    base64, reversible by anyone holding the token with no secret required, which is exactly what makes
    "the token is your ID card" and the Glossary's JWT entry true rather than contradicted. The third
    segment is a signature computed once, at issue time, over exactly those bytes, using a secret only
    the server holds — editing the decoded payload (`"role": "admin"`) and sending it back fails the
    server's own recomputed-signature check, because "signed" means tamper-evident and freely readable,
    the opposite of what "encrypted" would mean. **Cookie-held sessions vs. a manually-attached bearer
    token trade one attack surface for a different one, not a strictly safer one for a strictly
    riskier one** — a browser auto-attaches a cookie to any request aimed at that cookie's domain
    regardless of which page triggered it (the CSRF mechanism, real whenever `SameSite`/a CSRF-token
    check isn't in the way); a bearer token a page's own JS must read from storage and attach by hand
    isn't auto-sent that way, so the identical forged cross-site form arrives with nothing attached —
    but that same JS-readable storage is exactly what an XSS bug on the *real* site could read directly
    and exfiltrate outright, a theft an `httpOnly` cookie is specifically built to block. Both halves
    of this one were checked against real mechanics, not assumed: a plain HTML `<form>` submission
    genuinely can't set a custom `Authorization` header (only a small allowed set of content types),
    and same-origin policy genuinely blocks `evil.example`'s script from reading `api.example`'s
    `localStorage`. **"Revoking" a JWT before it expires needs something bolted on beside the token
    itself, because the server can't unsign what it already issued** — the direct, deliberate payoff of
    question 2's signing fact, called back explicitly the same way Joins' own fourth question called
    back its first: a stateless JWT scheme that only checks signature + `exp` (the entire reason to
    skip a per-request database hit) has no mechanism that would even notice an account's password
    changed after the token was signed, so a stolen token keeps working for every minute it has left,
    full stop. Real fixes — a server-side revoked-id denylist, or short-lived access tokens paired with
    a refresh step that *does* hit the database — each reintroduce some version of the lookup JWTs
    exist to avoid, rather than the token scheme quietly handling it on its own.

    The four are a deliberate arc, the same shape Joins' own four questions used: Q1 is how a server
    ever gets to trust a request in the first place (password verification); Q2 establishes what the
    token that trust produces actually is and isn't; Q3 asks where that token should live once issued,
    given two real, opposite-shaped threats; Q4 uses Q2's signing fact from a new angle to show why
    undoing a JWT is harder than it looks. `filename`s stay `.http`, the convention `/http` and `/rest`
    established — every scenario here is fundamentally a request/response exchange (a signup, a login,
    a forged cross-site POST), so there was no reason to invent a new code-listing convention the way
    `/sql-basics` did for genuinely different content.

    Wired in everywhere Joins was: `App.tsx`'s lazy import + route (+ page-count comment, 41 → 42),
    `scripts/routes.mjs`, `data/pages.ts`'s gallery card, `data/concepts.ts` (`stage: 5`, folded into
    the existing "Stage 5 · APIs & Databases" section header rather than a new one), and
    `PageGallery.tsx`'s archetype count (38 → 39). **Verified the array edit, not just the comment,
    before running anything** — same discipline items 43 and 44 both established: ran the throwaway
    `npx tsx -e` script immediately after editing `curriculum.ts`, printing `PATH_CONCEPTS.length`
    (24), the `UPCOMING_STAGES` sum (1), and `TOTAL_CONCEPTS` (25) directly from the real modules,
    confirming the array itself had actually lost `'Auth'` rather than trusting the prose above it said
    so. Checked `Roadmap.tsx`'s two known stale-comment spots explicitly this time, per the task's own
    flag that one of the two had been missed on two of the last three rounds — both the top-of-file
    doc comment ("stage 5 has four — HTTP item 41, REST item 42, SQL Basics item 43, Joins item 44")
    and the JSX comment directly above the `PartialStage` call ("its first four real concepts") were
    stale and are now both corrected to five, Auth item 45.

    `verify-interactions.mjs` gained a dedicated Auth block mirroring Joins' own (start unanswered,
    three correct reaches the pass mark, earns completion, a wrong pick shows the real explanation, try
    again resets), plus a Roadmap chip-chain step following Joins': complete Auth, confirm the stage-5
    count reads `"5 OF 6"`, the path total reads `"17 of 25 concepts"`, and the not-built count is
    *still* exactly 1 (Deploy) — Auth completing is a progress event, not a build event, and Deploy was
    already the only name left in `UPCOMING_STAGES.concepts` the moment Auth's page was wired in. All
    twelve of item 44's `(rm.match(/not built yet/g) ?? []).length === 2` checks — spanning the whole
    Stage 3/4 chip-chain, not just the Stage 5 ones — reverted to `=== 1`, the same "it drops for the
    entire file the instant the page exists, not just from its own completion step onward" rule items
    43 and 44 both established. Added an exact-match `page.getByRole('link', { name: 'Auth', exact:
    true })` count for the "stage 5 shows its fifth real concept" check, the same collision-avoidance
    habit every prior lesson round has used. 336 → 346 interaction checks (5 dedicated + 5 Roadmap —
    matching Joins' own 5+5 split exactly).

    `audit:content` stayed at its 5-artifact baseline — confirmed with a fresh `npm run audit:content`
    run, unrelated to Auth (it has no `.dc.html` prototype, same as HTTP, REST, SQL Basics and Joins
    before it). Swept `docs/SRS.md`, `docs/ARCHITECTURE.md`, and `app/README.md`'s route/page/concept
    counts (42 lesson/tool pages, 43 routes total, 37 registered concepts — read the routes figure off
    a direct `verify:routes` run's own `43/43 routes clean` output rather than hand-computed, the same
    lesson items 40 through 44 all already flagged), including `docs/ARCHITECTURE.md`'s `Roadmap.tsx`
    table row (now naming HTTP, REST, SQL Basics, Joins and Auth, "one remains" not "two").

    `npm run build` run first, confirming `Auth-J6iwLzOL.js` built alongside `Http-Rskc57O2.js`,
    `Rest-DDUu6D2r.js`, `SqlBasics-nn5bIe_x.js` and `Joins-Bnu4eoqb.js`. `npm run verify` green after:
    43/43 routes, no overflow at any width, 346/346 interaction checks, a11y clean with zero regression
    (35 failures across 19 pairs, unchanged — the baseline note now reads "this run saw 43" routes,
    up from 42, with no new pair). `npm run typecheck` clean. `audit:content` at its 5-artifact
    baseline (re-verified).

    **Stage 5 now has 5 of 6 concepts built: HTTP, REST, SQL Basics, Joins, Auth.** One remains
    (`Deploy`), plus the capstone project still ahead of it. `Roadmap.tsx` itself needed no further
    logic change this round beyond the two stale comments above — `PartialStage`, extracted at item 41
    specifically so a later Stage-5 concept wouldn't need one, held up on its fifth use in a row.
