import { Suspense, lazy, useEffect } from 'react'
import { useActivityTracker } from './lib/progress'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'

// Eager: the two entry points most navigations land on first.
import PageGallery from './pages/PageGallery'
import NotFound from './pages/NotFound'

// Lazy: the 23 page-sized lessons/tools. A visit only ever needs a handful of
// these, so there's no reason to ship all of them in the initial bundle.
const DevHub = lazy(() => import('./pages/DevHub'))
const CliBasics = lazy(() => import('./pages/CliBasics'))
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

/** Every navigation lands at the top of the new page, as a document would. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  // Counts real time-on-page, which drives the streak and the minutes chart.
  useActivityTracker()
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
