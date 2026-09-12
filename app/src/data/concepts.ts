/**
 * The concept registry — the single answer to "what counts as a concept, and what marks one done?"
 *
 * Before this file existed, `completeConcept()` had exactly one call site in the whole app
 * (`QuizMode.tsx`, on a passing score), so `state.concepts` could only ever hold 0 or 1 entries
 * while the Roadmap and Progress Dashboard both rendered it as "N of 23". The Roadmap papered over
 * that by flooring its display at a hardcoded `BASELINE_DONE = 8`. This registry is BACKLOG item 6:
 * every concept the app can actually teach, the page that teaches it, and the action that records
 * it, so that the count means what the label says.
 *
 * **Two different questions, two different numbers.** `TOTAL_CONCEPTS` is the *designed* backend
 * path — five Roadmap stages — and only `stage`d concepts count toward it. The off-path concepts
 * (`stage: null`) are real pages teaching real things, but they are not steps on that path, so
 * completing Regex Lab must not move the "Backend path" bar. Both surfaces count with the helpers
 * below rather than with `Object.keys(state.concepts).length`, which counts everything — including
 * keys written by an older build or restored from someone else's backup file.
 *
 * **A concept is not a page.** Several pages teach no concept and are deliberately absent here:
 * the reference pages (`/glossary`, `/cheat-sheet`) are look-it-up surfaces you never "finish";
 * `/flashcards` has its own SM-2 state in `state.cards`; `/quiz-mode` is a checkpoint that
 * completes `git-basics` rather than being a concept itself; and the meta pages (Dev Hub, Roadmap,
 * the dashboard, the gallery, 404, sign-in) teach nothing. Two path concepts have no page at all
 * yet — they are listed with no `route` so the Roadmap can show them honestly as unreachable
 * rather than pretending they are done.
 *
 * Adding a concept means: an entry here, a `<ConceptComplete slug="…">` on its page, and — if it
 * is on the path — a Roadmap chip, which reads its state from `conceptsInStage()` automatically.
 */

/** One unit of learning the app can record as complete. */
export interface Concept {
  /** Key in `useProgress()`'s `state.concepts`. Stable — renaming one orphans a learner's record. */
  slug: string
  /** Display name. For path concepts this is the Roadmap chip's label, verbatim. */
  label: string
  /** Route that teaches it, or `undefined` when the path names a concept this app has no page for. */
  route?: string
  /** Roadmap stage (1-2 are built; 3-5 are locked placeholders), or `null` when off the path. */
  stage: 1 | 2 | null
  /** What records it — prose for the next reader, kept in step with the page's `<ConceptComplete>`. */
  earnedBy: string
}

/**
 * Every concept, path concepts first in Roadmap order. `slug` matches the teaching page's route
 * slug wherever there is one, except `git-basics`, which predates this file and is recorded by the
 * quiz rather than by a page of its own.
 */
export const CONCEPTS: Concept[] = [
  // ── Stage 1 · Terminal & Shell ──────────────────────────────────────────
  {
    slug: 'cli-basics',
    label: 'CLI Basics',
    route: '/cli-basics',
    stage: 1,
    earnedBy: 'answering every quick-quiz question correctly',
  },
  {
    slug: 'shell-scripting',
    label: 'Shell Scripting',
    route: '/shell-scripting',
    stage: 1,
    earnedBy: 'stepping the backup.sh walkthrough to its last line',
  },
  {
    slug: 'environment-variables',
    label: 'Environment Variables',
    stage: 1,
    earnedBy: 'nothing yet — the path names this concept but no page teaches it',
  },

  // ── Stage 2 · Version Control ───────────────────────────────────────────
  {
    slug: 'git-basics',
    label: 'Git Basics',
    route: '/quiz-mode',
    stage: 2,
    earnedBy: 'scoring at or above the pass mark on the checkpoint quiz',
  },
  {
    slug: 'staging-commits',
    label: 'Staging & Commits',
    stage: 2,
    earnedBy: 'nothing yet — the path names this concept but no page teaches it',
  },
  {
    slug: 'git-branching',
    label: 'Branching & Merging',
    route: '/git-branching',
    stage: 2,
    earnedBy: 'reading the four storyboard frames and marking it done',
  },
  {
    slug: 'rebase-history',
    label: 'Rebase & History',
    route: '/rebase-history',
    stage: 2,
    earnedBy: 'stepping the rebase walkthrough to its last frame',
  },

  // ── Off the five-stage path ─────────────────────────────────────────────
  {
    slug: 'decorator-pattern',
    label: 'Decorator Pattern',
    route: '/decorator-pattern',
    stage: null,
    earnedBy: 'revealing the predict-then-run output',
  },
  {
    slug: 'video-lesson',
    label: 'Video Lesson',
    route: '/video-lesson',
    stage: null,
    earnedBy: 'watching it through and marking it done',
  },
  {
    slug: 'architecture-deep-dive',
    label: 'Architecture Deep Dive',
    route: '/architecture-deep-dive',
    stage: null,
    earnedBy: 'tracing the request journey and marking it done',
  },
  {
    slug: 'big-o-performance',
    label: 'Big-O Performance',
    route: '/big-o-performance',
    stage: null,
    earnedBy: 'reading the growth curves and marking it done',
  },
  {
    slug: 'data-structures-visual',
    label: 'Data Structures Visual',
    route: '/data-structures-visual',
    stage: null,
    earnedBy: 'reading all four field-guide entries and marking it done',
  },
  {
    slug: 'api-anatomy',
    label: 'API Anatomy',
    route: '/api-anatomy',
    stage: null,
    earnedBy: 'working through the numbered callouts and marking it done',
  },
  {
    slug: 'framework-comparison',
    label: 'Framework Comparison',
    route: '/framework-comparison',
    stage: null,
    earnedBy: 'comparing all three implementations and marking it done',
  },
  {
    slug: 'algorithm-visualizer',
    label: 'Algorithm Visualizer',
    route: '/algorithm-visualizer',
    stage: null,
    earnedBy: 'stepping the bubble-sort trace to its final frame',
  },
  {
    slug: 'code-playground',
    label: 'Code Playground',
    route: '/code-playground',
    stage: null,
    earnedBy: 'running the tests green',
  },
  {
    slug: 'terminal-simulator',
    label: 'Terminal Simulator',
    route: '/terminal-simulator',
    stage: null,
    earnedBy: 'running every command in the mission',
  },
  {
    slug: 'debugging-challenge',
    label: 'Debugging Challenge',
    route: '/debugging-challenge',
    stage: null,
    earnedBy: 'revealing the fix',
  },
  {
    slug: 'regex-lab',
    label: 'Regex Lab',
    route: '/regex-lab',
    stage: null,
    earnedBy: 'trying every pattern against the log lines',
  },
  {
    slug: 'project-build-along',
    label: 'Project Build-Along',
    route: '/project-build-along',
    stage: null,
    earnedBy: 'ticking every capstone milestone',
  },
]

/** Lookup by slug, for the page components that record their own completion. */
export const CONCEPT_BY_SLUG: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.slug, c]),
)

/** The concepts on the five-stage backend path — what `TOTAL_CONCEPTS` is the denominator for. */
export const PATH_CONCEPTS = CONCEPTS.filter((c) => c.stage !== null)

/** The concepts a given built Roadmap stage lists, in chip order. */
export function conceptsInStage(stage: 1 | 2): Concept[] {
  return CONCEPTS.filter((c) => c.stage === stage)
}

/**
 * How many *path* concepts are recorded complete. Counts against the registry rather than the
 * record's key count, so an off-path concept — or a stale key from an older build, or one restored
 * from a backup file written by a newer one — can't inflate the path percentage.
 */
export function pathDone(concepts: Record<string, string>): number {
  return PATH_CONCEPTS.filter((c) => concepts[c.slug]).length
}

/** How many concepts are recorded complete away from the path — the dashboard's second number. */
export function offPathDone(concepts: Record<string, string>): number {
  return CONCEPTS.filter((c) => c.stage === null && concepts[c.slug]).length
}
