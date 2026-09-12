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
 * Roadmap stages 3-5: locked placeholders with no pages behind them. Their concepts are listed
 * rather than counted so that the count can't drift from the list the page renders — the syllabus
 * line under each stage heading is built from `concepts` below, not written out by hand.
 */
export const UPCOMING_STAGES = [
  {
    n: 3,
    title: '3 · A First Language: Python',
    lock: 'UNLOCKS AT STAGE 2',
    concepts: ['Variables', 'Control flow', 'Functions', 'Collections', 'Errors', 'Files'],
  },
  {
    n: 4,
    title: '4 · Data Structures & Algorithms',
    lock: 'LOCKED',
    concepts: ['Arrays', 'Hash maps', 'Stacks & queues', 'Trees', 'Big-O', 'Sorting'],
  },
  {
    n: 5,
    title: '5 · APIs & Databases',
    lock: 'LOCKED',
    concepts: ['HTTP', 'REST', 'SQL basics', 'Joins', 'Auth', 'Deploy'],
    tail: '. Ends with the capstone project.',
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
