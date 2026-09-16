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
 * designed backend-developer path; a page is one of this app's ~26 interactive screens, several of
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
 * **Stage 3 has four real concepts now** — `Variables` → `python-variables` (BACKLOG item 10),
 * `Control Flow` → `control-flow` (item 30; the design's own syllabus wrote it lower-case,
 * "Control flow", as one of six items in a single placeholder string, while the built page titles
 * it "Control Flow" like every other multi-word built label on the site), `Functions` →
 * `functions` (item 31), and `Collections` → `collections` (item 32) — all in `data/concepts.ts`,
 * so it isn't purely a placeholder anymore. `concepts` here lists only what's *left* to build in
 * that stage, two of the original six. Stages 4 and 5 remain fully unbuilt.
 * `related` names existing off-path pages (`stage: null` in `data/concepts.ts`) whose content
 * genuinely overlaps a locked stage's syllabus, so a learner who reaches it isn't left with
 * nothing real to do — verified by reading each page, not guessed from its title. They are
 * pointers, not path concepts: linking one here doesn't move `TOTAL_CONCEPTS` or its stage's count.
 */
export const UPCOMING_STAGES = [
  {
    n: 3,
    title: '3 · A First Language: Python',
    lock: 'IN PROGRESS',
    concepts: ['Errors', 'Files'],
  },
  {
    n: 4,
    title: '4 · Data Structures & Algorithms',
    lock: 'NOT YET BUILT',
    concepts: ['Arrays', 'Hash maps', 'Stacks & queues', 'Trees', 'Big-O', 'Sorting'],
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
 * Concepts in the designed backend-developer path, across all five Roadmap stages: the two built
 * stages' registry entries plus the three locked stages' listed placeholders.
 */
export const TOTAL_CONCEPTS =
  PATH_CONCEPTS.length + UPCOMING_STAGES.reduce((n, s) => n + s.concepts.length, 0)

/**
 * Graded checkpoints in that same path — quoted on the completion certificate. Still a literal:
 * unlike the concepts there is no list anywhere to derive it from, since the app has exactly one
 * checkpoint (`/quiz-mode`) and the other thirteen are part of the designed course, not this build.
 */
export const TOTAL_CHECKPOINTS = 14
