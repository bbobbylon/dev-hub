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
 * designed backend-developer path; a page is one of this app's ~31 interactive screens, several of
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
 * `NotBuiltChip`s, which is exactly the honest "nothing left to build here" state. Stage 5 remains
 * fully unbuilt; Stage 4 no longer is (see below).
 * `related` names existing off-path pages (`stage: null` in `data/concepts.ts`) whose content
 * genuinely overlaps a locked stage's syllabus, so a learner who reaches it isn't left with
 * nothing real to do — verified by reading each page, not guessed from its title. They are
 * pointers, not path concepts: linking one here doesn't move `TOTAL_CONCEPTS` or its stage's count.
 *
 * **Stage 4 has four real concepts now** — `Arrays` → `arrays` (item 35; the round that gave
 * Stage 4 its own dedicated block in `Roadmap.tsx`, the same "some built, some not" shape Stage 3
 * had, instead of the fully-locked `laterStages` path it used to share with a stage that had no
 * real concepts yet), `Hash Maps` → `hash-maps` (item 36; the design's own syllabus wrote it
 * lower-case, "Hash maps", as one of six items in a single placeholder string, while the built
 * page titles it "Hash Maps" like every other multi-word built label on the site — the same
 * distinction `Control Flow` drew against its own design placeholder, "Control flow"),
 * `Stacks & Queues` → `stacks-queues` (item 37; the design's placeholder wrote it lower-case too,
 * "Stacks & queues" — the route drops the "&" and hyphenates the two words directly, the same
 * pattern `Rebase & History` → `rebase-history` and `Branching & Merging` → `git-branching`
 * already set; the built label keeps the "&", also matching that pair), and `Trees` → `trees`
 * (item 38; single word, no casing footnote needed, same as `Errors`/`Files`/`Arrays`).
 * `related` stays on the `n: 4` entry below even with four real concepts now — the three linked
 * pages (`Data Structures Visual`, `Big-O Performance`, `Algorithm Visualizer`) are still
 * genuinely useful supplementary reading for the rest of the stage's still-unbuilt syllabus.
 */
export const UPCOMING_STAGES = [
  {
    n: 3,
    title: '3 · A First Language: Python',
    // `lock` is never rendered for stage 3 — `Roadmap.tsx`'s stage-3 block is hardcoded to show a
    // "N OF 6" `Tag` instead of `<LockedTag>{stage.lock}</LockedTag>` (that's `laterStages`' job,
    // stage 5 only, now that stage 4 has its own dedicated block too) — but the field is kept
    // honest anyway, now that all six concepts are real.
    lock: 'BUILT',
    concepts: [],
  },
  {
    n: 4,
    title: '4 · Data Structures & Algorithms',
    // Same story as stage 3's `lock` above, one round earlier in its own lifecycle: never rendered
    // once a stage has its own dedicated block, kept honest anyway.
    lock: 'IN PROGRESS',
    concepts: ['Big-O', 'Sorting'],
    related: [
      { label: 'Data Structures Visual', route: '/data-structures-visual' },
      { label: 'Big-O Performance', route: '/big-o-performance' },
      { label: 'Algorithm Visualizer', route: '/algorithm-visualizer' },
    ],
  },
  {
    n: 5,
    title: '5 · APIs & Databases',
    lock: 'NOT YET BUILT',
    concepts: ['HTTP', 'REST', 'SQL basics', 'Joins', 'Auth', 'Deploy'],
    tail: '. Ends with the capstone project.',
    related: [{ label: 'API Anatomy', route: '/api-anatomy' }],
  },
] as const

/** The one-line syllabus the Roadmap prints under a locked stage's heading. */
export function syllabusOf(stage: (typeof UPCOMING_STAGES)[number]): string {
  const list = `${stage.concepts.join(' · ')} — ${stage.concepts.length} concepts`
  return 'tail' in stage ? list + stage.tail : list
}

/**
 * Concepts in the designed backend-developer path, across all five Roadmap stages: every built
 * concept's `data/concepts.ts` registry entry (`PATH_CONCEPTS`) plus every not-yet-built one's
 * `UPCOMING_STAGES` placeholder — added together regardless of which stages currently sit in
 * which pile, so the total stays put as a concept moves from one to the other (stage 1/2 fully
 * built, stage 3 fully built, stage 4 four concepts in, stage 5 not started, as of item 38).
 */
export const TOTAL_CONCEPTS =
  PATH_CONCEPTS.length + UPCOMING_STAGES.reduce((n, s) => n + s.concepts.length, 0)

/**
 * Graded checkpoints in that same path — quoted on the completion certificate. Still a literal:
 * unlike the concepts there is no list anywhere to derive it from, since the app has exactly one
 * checkpoint (`/quiz-mode`) and the other thirteen are part of the designed course, not this build.
 */
export const TOTAL_CHECKPOINTS = 14
