/**
 * The curriculum's own sizes — the numbers the designs quote about the *course*, as opposed to the
 * numbers this app can derive from real data.
 *
 * `TOTAL_CONCEPTS` was written as a bare `23` in three separate places (`Roadmap.tsx`,
 * `ProgressDashboard.tsx`, and `CourseComplete.tsx`'s certificate stats), which is how a shared
 * figure quietly becomes three figures. It lives here once instead.
 *
 * **It is not `PAGES.length`, and shouldn't be swapped for it.** A concept is a unit of the
 * designed backend-developer path; a page is one of this app's ~26 interactive screens, several of
 * which (the gallery, Dev Hub, the 404, sign-in) teach no concept at all, while a single page like
 * CLI Basics walks through several. The two numbers move independently and adding a page is not
 * meant to change this one.
 *
 * The honest caveat: `state.concepts` can only ever reach 1 today, because `completeConcept()` has
 * exactly one call site in the whole app (`QuizMode.tsx`, on a passing score). Until that's wired
 * into the rest of the lessons — BACKLOG.md item 6 — "N of 23" is a denominator waiting for a
 * numerator, which is also why `Roadmap.tsx` floors its count at the design's `BASELINE_DONE`.
 */

/** Concepts in the designed backend-developer path, across all five Roadmap stages. */
export const TOTAL_CONCEPTS = 23

/** Graded checkpoints in that same path — quoted on the completion certificate. */
export const TOTAL_CHECKPOINTS = 14
