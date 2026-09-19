/**
 * The page registry — one entry per route, used by `PageGallery` to render
 * and search the card grid. It is *not* wired automatically to routing:
 * adding a page here does not add a `<Route>` to it, and vice versa. Keep
 * three things in lockstep by hand when a page is added or removed:
 *  - `App.tsx`'s lazy import + `<Route>` (the actual route)
 *  - this file's `PAGES` entry (the gallery card + slug used for search)
 *  - `scripts/routes.mjs`'s `ROUTES` array (what the verification suites visit)
 * `slug` is the single source of truth other files build a route from —
 * `ConceptSidebar`/`Roadmap` links and `App.tsx`'s paths must match it exactly.
 */
import type { TagTone } from '../components/ui'

/** Which section of the gallery (and the Dev Hub landing page) a card sorts into. */
export type PageGroup = 'learn' | 'practice' | 'reference' | 'meta'

export interface PageEntry {
  /** Route path without the leading slash — `App.tsx`'s `<Route path="/${slug}">`. */
  slug: string
  /** Card title in the gallery. */
  title: string
  /** The uppercase archetype label on the card. */
  kind: string
  /** Which `Tag` color the archetype label renders in. */
  tone: TagTone
  /** One-line card description shown under the title. */
  blurb: string
  /** Which gallery section (and Dev Hub landing group) this card belongs to. */
  group: PageGroup
}

/** Section headings the gallery and Dev Hub landing page render above each `PageGroup`. */
export const GROUP_TITLES: Record<PageGroup, string> = {
  learn: 'Learn — concept pages',
  practice: 'Practice — hands-on pages',
  reference: 'Reference — look-it-up pages',
  meta: 'Meta — journey pages',
}

/** Every routable page, grouped by section in render order. */
export const PAGES: PageEntry[] = [
  // ── Learn ───────────────────────────────────────────────────────────────
  {
    slug: 'cli-basics',
    title: 'CLI Basics',
    kind: 'INTERACTIVE LESSON',
    tone: 'accent',
    blurb: 'The flagship concept page: quiz, anatomy clicker, walkthrough.',
    group: 'learn',
  },
  {
    slug: 'shell-scripting',
    title: 'Shell Scripting',
    kind: 'STEP-THROUGH VIZ',
    tone: 'accent',
    blurb: 'Turn a chain of commands into backup.sh — step through what each line actually does.',
    group: 'learn',
  },
  {
    slug: 'python-variables',
    title: 'Variables',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'Four graded Python snippets — predict what prints, then see why.',
    group: 'learn',
  },
  {
    slug: 'control-flow',
    title: 'Control Flow',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'If/elif, range(), while/break, and truthiness — predict what prints, then see why.',
    group: 'learn',
  },
  {
    slug: 'functions',
    title: 'Functions',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'Mutable defaults, kwargs, missing returns, and closures — predict what prints, then see why.',
    group: 'learn',
  },
  {
    slug: 'collections',
    title: 'Collections',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'List aliasing, tuple immutability, dict key collisions, and slice edges — predict what prints, then see why.',
    group: 'learn',
  },
  {
    slug: 'errors',
    title: 'Errors',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'finally overriding a return, an over-broad except, bare except vs. SystemExit, and except ordering — predict what happens, then see why.',
    group: 'learn',
  },
  {
    slug: 'files',
    title: 'Files',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: '"w" mode truncating on open, a one-shot file cursor, binary vs. text, and a closed file after with — predict what happens, then see why.',
    group: 'learn',
  },
  {
    slug: 'arrays',
    title: 'Arrays',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'A shared-reference 2D grid, mutating a list mid-loop, negative index bounds, and string immutability — predict what happens, then see why.',
    group: 'learn',
  },
  {
    slug: 'hash-maps',
    title: 'Hash Maps',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'Unhashable dict keys, [] vs .get(), mutating a dict mid-loop, and insertion order since 3.7 — predict what happens, then see why.',
    group: 'learn',
  },
  {
    slug: 'stacks-queues',
    title: 'Stacks & Queues',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'list.pop(0) degrading to O(n), deque(maxlen) silently dropping items, popleft() vs pop(), and popping empty — predict what happens, then see why.',
    group: 'learn',
  },
  {
    slug: 'trees',
    title: 'Trees',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'Traversal order, a missing recursion base case, a BST degenerating into a chain, and a broken search invariant — predict what happens, then see why.',
    group: 'learn',
  },
  {
    slug: 'big-o',
    title: 'Big-O',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'List vs. set membership, nested loops, string concatenation, and Timsort on already-sorted input — predict the complexity, then see why.',
    group: 'learn',
  },
  {
    slug: 'sorting',
    title: 'Sorting',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'sort() vs. sorted(), sort stability, what key= actually does, and sorting incomparable types — predict what happens, then see why.',
    group: 'learn',
  },
  {
    slug: 'http',
    title: 'HTTP',
    kind: 'PREDICT-THE-VALUE',
    tone: 'accent',
    blurb: 'PUT idempotency, 401 vs. 403, PUT vs. PATCH, and statelessness — predict what the server does, then see why.',
    group: 'learn',
  },
  {
    slug: 'decorator-pattern',
    title: 'Decorator Pattern',
    kind: 'PATTERN DEEP-DIVE',
    tone: 'accent',
    blurb: 'Bold hero, build-your-own-order sandbox, predict-then-run code.',
    group: 'learn',
  },
  {
    slug: 'video-lesson',
    title: 'Video Lesson',
    kind: 'VIDEO + TRANSCRIPT',
    tone: 'accent',
    blurb: 'Player, chapters, synced transcript, timestamped notes.',
    group: 'learn',
  },
  {
    slug: 'architecture-deep-dive',
    title: 'Architecture Deep Dive',
    kind: 'SYSTEM DIAGRAM',
    tone: 'accent',
    blurb: 'Numbered request-journey map with matching callout cards.',
    group: 'learn',
  },
  {
    slug: 'git-branching',
    title: 'Git Branching',
    kind: 'STORYBOARD',
    tone: 'accent',
    blurb: 'The same repo at four moments — commit-graph frames.',
    group: 'learn',
  },
  {
    slug: 'rebase-history',
    title: 'Rebase & History',
    kind: 'STEP-THROUGH VIZ',
    tone: 'accent',
    blurb: 'Merge’s companion — replay a branch onto main and watch the SHAs rewrite.',
    group: 'learn',
  },
  {
    slug: 'big-o-performance',
    title: 'Big-O Performance',
    kind: 'CHART-LED',
    tone: 'accent',
    blurb: 'Growth curves, cost cards, one table that settles interviews.',
    group: 'learn',
  },
  {
    slug: 'data-structures-visual',
    title: 'Data Structures Visual',
    kind: 'FIELD GUIDE',
    tone: 'accent',
    blurb: 'Array, list, hash map, BST — drawn the way you should picture them.',
    group: 'learn',
  },
  {
    slug: 'api-anatomy',
    title: 'API Anatomy',
    kind: 'LABELED DISSECTION',
    tone: 'accent',
    blurb: 'One real request/response with numbered callouts.',
    group: 'learn',
  },
  {
    slug: 'framework-comparison',
    title: 'Framework Comparison',
    kind: 'COMPARISON',
    tone: 'accent',
    blurb: 'Same counter in React, Vue, Svelte + a decision table.',
    group: 'learn',
  },

  // ── Practice ────────────────────────────────────────────────────────────
  {
    slug: 'quiz-mode',
    title: 'Quiz Mode',
    kind: 'CHECKPOINT',
    tone: 'accent-2',
    blurb: 'Focused exam flow: palette, feedback, score screen. Fully working.',
    group: 'practice',
  },
  {
    slug: 'flashcards',
    title: 'Flashcards',
    kind: 'SPACED REPETITION',
    tone: 'accent-2',
    blurb: 'Flip cards, rate yourself, watch the deck schedule reviews.',
    group: 'practice',
  },
  {
    slug: 'algorithm-visualizer',
    title: 'Algorithm Visualizer',
    kind: 'STEP-THROUGH VIZ',
    tone: 'accent-2',
    blurb: 'Bubble sort bars + synced pseudocode + live counters.',
    group: 'practice',
  },
  {
    slug: 'code-playground',
    title: 'Code Playground',
    kind: 'CODE CHALLENGE',
    tone: 'accent-2',
    blurb: 'Brief, editor, test checklist, run-and-pass loop.',
    group: 'practice',
  },
  {
    slug: 'terminal-simulator',
    title: 'Terminal Simulator',
    kind: 'DARK MISSION',
    tone: 'accent-2',
    blurb: 'Immersive incident-debugging mission with objectives.',
    group: 'practice',
  },
  {
    slug: 'debugging-challenge',
    title: 'Debugging Challenge',
    kind: 'BUG HUNT',
    tone: 'accent-2',
    blurb: 'Detective case: buggy code, progressive hints, diff reveal.',
    group: 'practice',
  },
  {
    slug: 'regex-lab',
    title: 'Regex Lab',
    kind: 'LIVE LAB',
    tone: 'accent-2',
    blurb: 'Pick a pattern, watch real matches highlight in log lines.',
    group: 'practice',
  },
  {
    slug: 'project-build-along',
    title: 'Project Build-Along',
    kind: 'CAPSTONE BRIEF',
    tone: 'accent-2',
    blurb: 'Milestone checklist, acceptance criteria, file layout.',
    group: 'practice',
  },

  // ── Reference ───────────────────────────────────────────────────────────
  {
    slug: 'cheat-sheet',
    title: 'Cheat Sheet',
    kind: 'DENSE REFERENCE',
    tone: 'neutral',
    blurb: 'Git in four columns ordered like a real work session.',
    group: 'reference',
  },
  {
    slug: 'glossary',
    title: 'Glossary',
    kind: 'JARGON DECODER',
    tone: 'neutral',
    blurb: 'Definition + "heard at work" + "what it\'s not," per term.',
    group: 'reference',
  },

  // ── Meta ────────────────────────────────────────────────────────────────
  {
    slug: 'dev-hub',
    title: 'Dev Hub Landing',
    kind: 'HOME / CATALOG',
    tone: 'neutral',
    blurb: 'Concept catalog grouped by topic with lock states.',
    group: 'meta',
  },
  {
    slug: 'roadmap',
    title: 'Roadmap',
    kind: 'LEARNING PATH',
    tone: 'neutral',
    blurb: 'Five-stage journey with you-are-here and locked stages.',
    group: 'meta',
  },
  {
    slug: 'progress-dashboard',
    title: 'Progress Dashboard',
    kind: 'STATS DASHBOARD',
    tone: 'neutral',
    blurb: 'Streaks, bar chart, donut, badges, up-next queue.',
    group: 'meta',
  },
  {
    slug: 'course-complete',
    title: 'Course Complete',
    kind: 'CELEBRATION',
    tone: 'neutral',
    blurb: 'Certificate, stamp, stats recap, where-to-next cards.',
    group: 'meta',
  },
]

