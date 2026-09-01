/**
 * Content-fidelity audit. For each design prototype, pull out every substantial
 * run of prose and check it survived into the corresponding React source.
 *
 * Compares against source (not the rendered page) on purpose: interactive pages
 * only render one quiz question or one flashcard at a time, so the rest of the
 * copy lives in data the DOM never shows at once.
 *
 * Not a test — a reviewing aid. Report what it flags, then read those by eye.
 */
import { readFileSync, readdirSync } from 'node:fs'

const PROTO_DIR = '../project'
const SRC = 'src'

/** Prototype file → the source files its copy should land in. */
const MAP = {
  'Page Gallery': ['pages/PageGallery.tsx', 'data/pages.ts'],
  'Dev Hub': ['pages/DevHub.tsx'],
  'CLI Basics': ['pages/CliBasics.tsx', 'data/cliBasics.ts'],
  'Decorator Pattern': ['pages/DecoratorPattern.tsx'],
  'Video Lesson': ['pages/VideoLesson.tsx'],
  'Architecture Deep Dive': ['pages/ArchitectureDeepDive.tsx'],
  'Git Branching': ['pages/GitBranching.tsx'],
  'Big O Performance': ['pages/BigOPerformance.tsx'],
  'Data Structures Visual': ['pages/DataStructuresVisual.tsx'],
  'API Anatomy': ['pages/ApiAnatomy.tsx'],
  'Framework Comparison': ['pages/FrameworkComparison.tsx'],
  'Quiz Mode': ['pages/QuizMode.tsx'],
  Flashcards: ['pages/Flashcards.tsx'],
  'Algorithm Visualizer': ['pages/AlgorithmVisualizer.tsx'],
  'Code Playground': ['pages/CodePlayground.tsx'],
  'Terminal Simulator': ['pages/TerminalSimulator.tsx'],
  'Debugging Challenge': ['pages/DebuggingChallenge.tsx'],
  'Regex Lab': ['pages/RegexLab.tsx'],
  'Project Build-Along': ['pages/ProjectBuildAlong.tsx'],
  'Cheat Sheet': ['pages/CheatSheet.tsx'],
  Glossary: ['pages/Glossary.tsx'],
  Roadmap: ['pages/Roadmap.tsx'],
  'Progress Dashboard': ['pages/ProgressDashboard.tsx'],
  'Course Complete': ['pages/CourseComplete.tsx'],
}

const entities = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

/** Quotes and dashes drift between HTML, JS string literals and JSX. */
const normalize = (s) =>
  entities(s)
    .replace(/[‘’'`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

/** Reject CSS declarations, code fragments and other non-prose. */
const isProse = (s) =>
  !/var\(--|=>|this\.|[{};]|<\/|style:|background:|color:/.test(s) &&
  /[a-z]{3}\s+[a-z]{3}/i.test(s)

/** Visible prose from a prototype: markup and the DCLogic block stripped. */
function prototypeText(file) {
  let html = readFileSync(file, 'utf8')
  const logic = html.match(/<script type="text\/x-dc"[\s\S]*?<\/script>/)?.[0] ?? ''
  html = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
  // One chunk per text node — tags become breaks, not spaces, so a phrase is
  // something that really was written as one continuous run of copy.
  const markup = html
    .replace(/\{\{[^}]*\}\}/g, ' ') // template holes aren't copy
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map(normalize)
  // Copy living in the DCLogic data arrays rather than the markup. Quote
  // pairing can straddle code, so keep only what reads as prose.
  const strings = [...logic.matchAll(/'((?:[^'\\]|\\.)*?)'|"((?:[^"\\]|\\.)*?)"/g)]
    .map((m) => normalize((m[1] ?? m[2]).replace(/\\'/g, "'").replace(/\\n/g, ' ')))
    .filter(isProse)
  return [...markup, ...strings].filter(isProse).join('\n')
}

/** React source flattened so JSX-split prose reads as continuous text. */
function sourceText(files) {
  return files
    .map((f) => {
      const src = readFileSync(`${SRC}/${f}`, 'utf8')
      // Copy also rides in props (note=, placeholder=, title=…) and in the
      // escaped newlines of multi-line data strings, so keep both.
      const attrs = [
        ...src.matchAll(/\b\w+="([^"]{12,})"/g), // note="…"
        ...src.matchAll(/\b\w+=\{'([^']{12,})'\}/g), // heading={'…'}
        ...src.matchAll(/\b\w+=\{"([^"]{12,})"\}/g), // heading={"…"}
      ]
        .map((m) => m[1])
        .join('\n')
      const unescaped = src.replace(/\\n/g, ' ').replace(/\\'/g, "'")
      const body = unescaped
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ') // JSX comments
        .replace(/\{'\s*'\}/g, ' ') // explicit JSX spaces
        .replace(/\{'([^']*)'\}/g, '$1') // {'…'} literals
        .replace(/style=\{\{[^}]*\}\}/g, ' ') // inline style objects
        .replace(/<[^>]+>/g, ' ') // JSX tags
      return `${body}\n${attrs}`
    })
    .map(normalize)
    .join('\n')
}

/** Chunks long enough that a match can't be coincidence. */
function phrases(text) {
  return [
    ...new Set(
      text
        .split(/\n|(?<=[.?!])\s+(?=[A-Z"'(])/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 45),
    ),
  ]
}

const files = readdirSync(PROTO_DIR).filter((f) => f.endsWith('.dc.html'))
let missingTotal = 0
const report = []

for (const file of files) {
  const name = file.replace('.dc.html', '')
  const targets = MAP[name]
  if (!targets) {
    report.push(`?    ${name} — no mapping`)
    continue
  }
  const proto = phrases(prototypeText(`${PROTO_DIR}/${file}`))
  const src = sourceText(targets)
  const missing = proto.filter((p) => !src.includes(p))
  missingTotal += missing.length
  if (missing.length) {
    report.push(`MISS ${name} — ${missing.length}/${proto.length} phrases not found:`)
    for (const m of missing) report.push(`       "${m.slice(0, 150)}"`)
  } else {
    report.push(`ok   ${name.padEnd(24)} ${proto.length} phrases all present`)
  }
}

console.log(report.join('\n'))
console.log(`\n${missingTotal} phrase(s) to review across ${files.length} prototypes`)
