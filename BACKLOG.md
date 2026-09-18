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
