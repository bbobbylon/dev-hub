/**
 * The curriculum's own sizes — the numbers the designs quote about the *course*, as opposed to the
 * numbers this app can derive from real data.
 *
 * `TOTAL_CONCEPTS` was written as a bare `23` in three separate places (`Roadmap.tsx`,
 * `ProgressDashboard.tsx`, and `CourseComplete.tsx`'s certificate stats), which is how a shared
 * figure quietly becomes three figures. It lives here once instead — and it is no longer a literal
 * at all, because it turned out 23 was wrong.
 *
 * **Why the number moved from 23 to 25.** The Roadmap's prose said "Five stages, twenty-three
 * concepts" while the same page enumerated 3 + 4 chips for the two built stages and "— 6 concepts"
 * for each of the three locked ones: 25. A page that contradicts itself two paragraphs apart is
 * the same class of bug as the same constant living in three files, so the enumeration — the half
 * that is actually a list of things — now produces the number, and the prose reads from it.
 *
 * **It is not `PAGES.length`, and shouldn't be swapped for it.** A concept is a unit of the
 * designed backend-developer path; a page is one of this app's ~38 interactive screens, several of
 * which (the gallery, Dev Hub, the 404, sign-in) teach no concept at all, while a single page like
 * CLI Basics walks through several. Nor is it `CONCEPTS.length` from `data/concepts.ts`: that
 * registry also holds the pages sitting *off* the five-stage path (Regex Lab, the Decorator
 * Pattern, the debugging challenge), which teach real things but are not steps on this path and
 * must not move its percentage. `PATH_CONCEPTS` is the overlapping part, and the locked stages
 * make up the rest.
 */
import { PATH_CONCEPTS } from './concepts'

/**
 * Roadmap stages 3-5's *not-yet-built* concepts — named in the design but with no page behind
 * them. Listed rather than counted so the count can't drift from the list the page renders — the
 * syllabus line under each stage heading is built from `concepts` below, not written out by hand.
 *
 * **Stage 3 is fully built now, all six of its original concepts real** — `Variables` →
 * `python-variables` (BACKLOG item 10), `Control Flow` → `control-flow` (item 30; the design's own
 * syllabus wrote it lower-case, "Control flow", as one of six items in a single placeholder
 * string, while the built page titles it "Control Flow" like every other multi-word built label on
 * the site), `Functions` → `functions` (item 31), `Collections` → `collections` (item 32),
 * `Errors` → `errors` (item 33), and `Files` → `files` (item 34) — all in `data/concepts.ts`, so
 * `UPCOMING_STAGES`'s own `n: 3` entry now lists an empty `concepts` array rather than being
 * deleted outright: `Roadmap.tsx` still looks it up unconditionally (`stage3Upcoming =
 * UPCOMING_STAGES.find((s) => s.n === 3)!`) to read its `.concepts.length`/`.map`, and removing the
 * entry would need that lookup rewritten for no real gain — an empty list renders zero
 * `NotBuiltChip`s, which is exactly the honest "nothing left to build here" state.
 * `related` names existing off-path pages (`stage: null` in `data/concepts.ts`) whose content
 * genuinely overlaps a stage's syllabus, so a learner who reaches it isn't left with nothing real
 * to do — verified by reading each page, not guessed from its title. They are pointers, not path
 * concepts: linking one here doesn't move `TOTAL_CONCEPTS` or its stage's count.
 *
 * **Stage 4 is fully built now too, all six of its original concepts real** — `Arrays` → `arrays`
 * (item 35; the round that gave Stage 4 its own dedicated block in `Roadmap.tsx`, the same "some
 * built, some not" shape Stage 3 had, instead of the fully-locked `laterStages` path it used to
 * share with a stage that had no real concepts yet), `Hash Maps` → `hash-maps` (item 36; the
 * design's own syllabus wrote it lower-case, "Hash maps", as one of six items in a single
 * placeholder string, while the built page titles it "Hash Maps" like every other multi-word built
 * label on the site — the same distinction `Control Flow` drew against its own design placeholder,
 * "Control flow"), `Stacks & Queues` → `stacks-queues` (item 37; the design's placeholder wrote it
 * lower-case too, "Stacks & queues" — the route drops the "&" and hyphenates the two words
 * directly, the same pattern `Rebase & History` → `rebase-history` and `Branching & Merging` →
 * `git-branching` already set; the built label keeps the "&", also matching that pair), `Trees` →
 * `trees` (item 38; single word, no casing footnote needed, same as `Errors`/`Files`/`Arrays`),
 * `Big-O` → `big-o` (item 39; the hyphen was already in the design's own placeholder, so the
 * route just lower-cases it — no ampersand or casing footnote needed either. Not to be confused
 * with the off-path `Big-O Performance` → `big-o-performance` pointer in `related` below, a
 * separate static reference page, not this graded lesson), and `Sorting` → `sorting` (item 40;
 * single word, no casing footnote needed either, same as `Trees`/`Errors`/`Files`/`Arrays`) — all
 * in `data/concepts.ts`, so `UPCOMING_STAGES`'s own `n: 4` entry now lists an empty `concepts`
 * array rather than being deleted outright, the exact same reasoning Stage 3's `n: 3` entry above
 * already established.
 * `related` stays on this now-fully-built entry anyway — the three linked pages
 * (`Data Structures Visual`, `Big-O Performance`, `Algorithm Visualizer`) are still genuinely
 * useful review and depth material once the six graded lessons cover the syllabus itself, not
 * pointers to unbuilt content anymore; nothing about `Roadmap.tsx`'s render logic forces `related`
 * to disappear just because a stage finished, and cutting it would only make the page less useful
 * for no real reason.
 *
 * **Stage 5 has its first two real concepts now** — `HTTP` → `http` (item 41; the design's own
 * placeholder wrote it all-caps as an acronym, and the built label keeps that acronym rather than
 * title-casing it to "Http", the same "keep the real-world spelling" call `Big-O` made for its own
 * hyphen) and `REST` → `rest` (item 42; same all-caps-acronym reasoning). This is the round that
 * graduated Stage 5 out of `Roadmap.tsx`'s fully-locked `laterStages` path and into its own
 * `PartialStage` block, the same restructuring `Arrays.tsx` did for Stage 4 at item 35 — except
 * this time it also retired the locked-stage machinery outright, since Stage 5 was the *last* stage
 * still using it (there is no stage 6 in a five-stage path), so nothing was left that could ever
 * render through it again. See `Roadmap.tsx`'s own header comment for the rest of that story.
 * Stage 5's `tail` (`". Ends with the capstone project."`) didn't survive that move — the
 * `PartialStage` shape Stage 3/4 already established has no slot for one, and inventing a
 * Stage-5-only feature for a single sentence wasn't worth it when `related` already does the same
 * job: `Project Build-Along` (the app's one capstone-shaped concept, `stage: null` in
 * `data/concepts.ts`) was added there instead, alongside `API Anatomy`, so the pointer survives
 * through the same, already-proven mechanism rather than a new one-off feature. Four remain
 * (`SQL basics`, `Joins`, `Auth`, `Deploy`).
 */
export const UPCOMING_STAGES = [
  {
    n: 3,
    title: '3 · A First Language: Python',
    // `lock` is never rendered for stage 3 — `Roadmap.tsx`'s `PartialStage` shows a "N OF 6" `Tag`
    // instead of a locked-stage treatment — but the field is kept honest anyway, now that all six
    // concepts are real.
    lock: 'BUILT',
    concepts: [],
  },
  {
    n: 4,
    title: '4 · Data Structures & Algorithms',
    // Same story as stage 3's `lock` above — kept honest even though nothing renders it.
    lock: 'BUILT',
    concepts: [],
    related: [
      { label: 'Data Structures Visual', route: '/data-structures-visual' },
      { label: 'Big-O Performance', route: '/big-o-performance' },
      { label: 'Algorithm Visualizer', route: '/algorithm-visualizer' },
    ],
  },
  {
    n: 5,
    title: '5 · APIs & Databases',
    // Same story again — not fully built yet (four of six remain), but no longer "not yet built"
    // either, now that HTTP and REST are real. Matches the exact 'IN PROGRESS' value Stage 4's own
    // entry held from item 35 through item 39, before it became 'BUILT' at item 40.
    lock: 'IN PROGRESS',
    concepts: ['SQL basics', 'Joins', 'Auth', 'Deploy'],
    related: [
      { label: 'API Anatomy', route: '/api-anatomy' },
      { label: 'Project Build-Along', route: '/project-build-along' },
    ],
  },
] as const

/**
 * Concepts in the designed backend-developer path, across all five Roadmap stages: every built
 * concept's `data/concepts.ts` registry entry (`PATH_CONCEPTS`) plus every not-yet-built one's
 * `UPCOMING_STAGES` placeholder — added together regardless of which stages currently sit in
 * which pile, so the total stays put as a concept moves from one to the other (stage 1/2 fully
 * built, stage 3 fully built, stage 4 fully built, stage 5 one concept in, as of item 41).
 */
export const TOTAL_CONCEPTS =
  PATH_CONCEPTS.length + UPCOMING_STAGES.reduce((n, s) => n + s.concepts.length, 0)

/**
 * Graded checkpoints in that same path — quoted on the completion certificate. Still a literal:
 * unlike the concepts there is no list anywhere to derive it from, since the app has exactly one
 * checkpoint (`/quiz-mode`) and the other thirteen are part of the designed course, not this build.
 */
export const TOTAL_CHECKPOINTS = 14
