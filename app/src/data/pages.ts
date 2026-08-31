import type { TagTone } from '../components/ui'

export type PageGroup = 'learn' | 'practice' | 'reference' | 'meta'

export interface PageEntry {
  slug: string
  /** Card title in the gallery. */
  title: string
  /** The uppercase archetype label on the card. */
  kind: string
  tone: TagTone
  blurb: string
  group: PageGroup
}

export const GROUP_TITLES: Record<PageGroup, string> = {
  learn: 'Learn — concept pages',
  practice: 'Practice — hands-on pages',
  reference: 'Reference — look-it-up pages',
  meta: 'Meta — journey pages',
}

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

export const PAGES_BY_GROUP = (group: PageGroup) => PAGES.filter((p) => p.group === group)
