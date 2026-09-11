/**
 * Every route the app serves. Not an npm script itself — a data module
 * imported by verify-routes.mjs, verify-responsive.mjs, snapshot.mjs and
 * audit-a11y.mjs, each of which loops over ROUTES to check or capture every
 * page. (verify-interactions.mjs navigates its own hardcoded subset of paths
 * directly and doesn't import this; audit-content.mjs works from prototype
 * filenames instead of routes.) Keep in sync with the router's route table
 * whenever a page is added, renamed, or removed.
 *
 * The two account routes are the one conditional pair: `App.tsx` registers
 * `/sign-in` and `/sign-up` only when the build had `VITE_API_BASE_URL` set,
 * so they are only real routes here under the same variable. Export it before
 * both `npm run build` and the verify run, or neither sees them — a build with
 * the variable verified without it would report those two routes as 404s.
 */
const ACCOUNT_ROUTES = process.env.VITE_API_BASE_URL ? ['/sign-in', '/sign-up'] : []

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
  ...ACCOUNT_ROUTES,
]
