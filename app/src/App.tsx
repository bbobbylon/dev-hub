import { useEffect } from 'react'
import { useActivityTracker } from './lib/progress'
import { Route, Routes, useLocation } from 'react-router-dom'

import PageGallery from './pages/PageGallery'
import DevHub from './pages/DevHub'
import CliBasics from './pages/CliBasics'
import DecoratorPattern from './pages/DecoratorPattern'
import VideoLesson from './pages/VideoLesson'
import ArchitectureDeepDive from './pages/ArchitectureDeepDive'
import GitBranching from './pages/GitBranching'
import BigOPerformance from './pages/BigOPerformance'
import DataStructuresVisual from './pages/DataStructuresVisual'
import ApiAnatomy from './pages/ApiAnatomy'
import FrameworkComparison from './pages/FrameworkComparison'
import QuizMode from './pages/QuizMode'
import Flashcards from './pages/Flashcards'
import AlgorithmVisualizer from './pages/AlgorithmVisualizer'
import CodePlayground from './pages/CodePlayground'
import TerminalSimulator from './pages/TerminalSimulator'
import DebuggingChallenge from './pages/DebuggingChallenge'
import RegexLab from './pages/RegexLab'
import ProjectBuildAlong from './pages/ProjectBuildAlong'
import CheatSheet from './pages/CheatSheet'
import Glossary from './pages/Glossary'
import Roadmap from './pages/Roadmap'
import ProgressDashboard from './pages/ProgressDashboard'
import CourseComplete from './pages/CourseComplete'
import NotFound from './pages/NotFound'

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

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PageGallery />} />
        <Route path="/dev-hub" element={<DevHub />} />
        <Route path="/cli-basics" element={<CliBasics />} />
        <Route path="/decorator-pattern" element={<DecoratorPattern />} />
        <Route path="/video-lesson" element={<VideoLesson />} />
        <Route path="/architecture-deep-dive" element={<ArchitectureDeepDive />} />
        <Route path="/git-branching" element={<GitBranching />} />
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
    </>
  )
}
