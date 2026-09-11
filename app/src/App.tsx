/**
 * The app's route table. Every path here has three siblings that must be
 * kept in sync when a page is added or removed: the corresponding entry in
 * `data/pages.ts` (drives the gallery card and its slug), the `ROUTES` array
 * in `scripts/routes.mjs` (drives the Playwright verification suites), and
 * the page's own `ConceptSidebar`/`Roadmap` links (which point at a route by
 * string, so a typo there silently renders an unclickable label instead of a
 * broken link — see `ConceptSidebar`'s `SidebarLink`).
 */
import { Suspense, lazy, useEffect } from 'react'
import { useActivityTracker } from './lib/progress'
import { useProgressSync } from './lib/progressSync'
import { apiEnabled } from './lib/api'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'

// Eager: the two entry points most navigations land on first.
import PageGallery from './pages/PageGallery'
import NotFound from './pages/NotFound'

// Lazy: the 25 page-sized lessons/tools. A visit only ever needs a handful of
// these, so there's no reason to ship all of them in the initial bundle.
const DevHub = lazy(() => import('./pages/DevHub'))
const CliBasics = lazy(() => import('./pages/CliBasics'))
const ShellScripting = lazy(() => import('./pages/ShellScripting'))
const DecoratorPattern = lazy(() => import('./pages/DecoratorPattern'))
const VideoLesson = lazy(() => import('./pages/VideoLesson'))
const ArchitectureDeepDive = lazy(() => import('./pages/ArchitectureDeepDive'))
const GitBranching = lazy(() => import('./pages/GitBranching'))
const RebaseHistory = lazy(() => import('./pages/RebaseHistory'))
const BigOPerformance = lazy(() => import('./pages/BigOPerformance'))
const DataStructuresVisual = lazy(() => import('./pages/DataStructuresVisual'))
const ApiAnatomy = lazy(() => import('./pages/ApiAnatomy'))
const FrameworkComparison = lazy(() => import('./pages/FrameworkComparison'))
const QuizMode = lazy(() => import('./pages/QuizMode'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const AlgorithmVisualizer = lazy(() => import('./pages/AlgorithmVisualizer'))
const CodePlayground = lazy(() => import('./pages/CodePlayground'))
const TerminalSimulator = lazy(() => import('./pages/TerminalSimulator'))
const DebuggingChallenge = lazy(() => import('./pages/DebuggingChallenge'))
const RegexLab = lazy(() => import('./pages/RegexLab'))
const ProjectBuildAlong = lazy(() => import('./pages/ProjectBuildAlong'))
const CheatSheet = lazy(() => import('./pages/CheatSheet'))
const Glossary = lazy(() => import('./pages/Glossary'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const ProgressDashboard = lazy(() => import('./pages/ProgressDashboard'))
const CourseComplete = lazy(() => import('./pages/CourseComplete'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))

/** Every navigation lands at the top of the new page, as a document would. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/**
 * The app root: mounted once by `main.tsx` inside a `BrowserRouter`. Wires
 * the global activity tracker, resets scroll on navigation, wraps the whole
 * route tree in one `ErrorBoundary` (keyed on `pathname` so a crash on one
 * page clears itself when you navigate away), and lazy-loads every page
 * except the two most commonly hit first (`PageGallery`, `NotFound`).
 */
export default function App() {
  // Counts real time-on-page, which drives the streak and the minutes chart.
  useActivityTracker()
  // Syncs progress with the optional backend when signed in; a no-op otherwise (see `lib/progressSync.ts`).
  useProgressSync()
  const { pathname } = useLocation()

  return (
    <>
      <ScrollToTop />
      <ErrorBoundary resetKey={pathname}>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<PageGallery />} />
            <Route path="/dev-hub" element={<DevHub />} />
            <Route path="/cli-basics" element={<CliBasics />} />
            <Route path="/shell-scripting" element={<ShellScripting />} />
            <Route path="/decorator-pattern" element={<DecoratorPattern />} />
            <Route path="/video-lesson" element={<VideoLesson />} />
            <Route path="/architecture-deep-dive" element={<ArchitectureDeepDive />} />
            <Route path="/git-branching" element={<GitBranching />} />
            <Route path="/rebase-history" element={<RebaseHistory />} />
            <Route path="/big-o-performance" element={<BigOPerformance />} />
            <Route path="/data-structures-visual" element={<DataStructuresVisual />} />
            <Route path="/api-anatomy" element={<ApiAnatomy />} />
            <Route path="/framework-comparison" element={<FrameworkComparison />} />
            <Route path="/quiz-mode" element={<QuizMode />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/algorithm-visualizer" element={<AlgorithmVisualizer />} />
            <Route path="/code-playground" element={<CodePlayground />} />
            <Route path="/terminal-simulator" element={<TerminalSimulator />} />
            <Route path="/debugging-challenge" element={<DebuggingChallenge />} />
            <Route path="/regex-lab" element={<RegexLab />} />
            <Route path="/project-build-along" element={<ProjectBuildAlong />} />
            <Route path="/cheat-sheet" element={<CheatSheet />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/progress-dashboard" element={<ProgressDashboard />} />
            <Route path="/course-complete" element={<CourseComplete />} />
            {/* Account routes exist only in a build that has a backend to talk to. Without
                VITE_API_BASE_URL — the GitHub Pages deploy — they fall through to NotFound
                rather than rendering a form that can only ever fail on submit. TopNav hides
                its "Sign in" link on the same condition; keep the two in step. */}
            {apiEnabled ? <Route path="/sign-in" element={<SignIn />} /> : null}
            {apiEnabled ? <Route path="/sign-up" element={<SignUp />} /> : null}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
