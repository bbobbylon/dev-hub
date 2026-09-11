/**
 * Every route the app serves. Not an npm script itself — a data module
 * imported by verify-routes.mjs, verify-responsive.mjs, snapshot.mjs and
 * audit-a11y.mjs, each of which loops over ROUTES to check or capture every
 * page. (verify-interactions.mjs navigates its own hardcoded subset of paths
 * directly and doesn't import this; audit-content.mjs works from prototype
 * filenames instead of routes.) Keep in sync with the router's route table
 * whenever a page is added, renamed, or removed.
 */
export const ROUTES = [
  '/',
  '/dev-hub',
  '/cli-basics',
  '/shell-scripting',
  '/decorator-pattern',
  '/video-lesson',
  '/architecture-deep-dive',
  '/git-branching',
  '/rebase-history',
  '/big-o-performance',
  '/data-structures-visual',
  '/api-anatomy',
  '/framework-comparison',
  '/quiz-mode',
  '/flashcards',
  '/algorithm-visualizer',
  '/code-playground',
  '/terminal-simulator',
  '/debugging-challenge',
  '/regex-lab',
  '/project-build-along',
  '/cheat-sheet',
  '/glossary',
  '/roadmap',
  '/progress-dashboard',
  '/course-complete',
  '/sign-in',
  '/sign-up',
]
