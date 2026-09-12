/**
 * Content-fidelity audit. For each design prototype, pull out every substantial
 * run of prose and check it survived into the corresponding React source.
 *
 * Compares against source (not the rendered page) on purpose: interactive pages
 * only render one quiz question or one flashcard at a time, so the rest of the
 * copy lives in data the DOM never shows at once.
 *
 * Not a test — a reviewing aid. Report what it flags, then read those by eye.
 * Run via `npm run audit:content` — not part of `npm run verify` and not
 * dependent on `npm run preview` being up, since it reads files directly
 * rather than driving a browser (so it doesn't use browser.mjs or routes.mjs;
 * see audit-a11y.mjs for the sibling audit that does).
 */
import { readFileSync, readdirSync } from 'node:fs'

const PROTO_DIR = '../project' // design-handoff .dc.html prototypes, outside app/
const SRC = 'src' // ported React source root, resolved relative to app/

/**
 * Prototype file → the source files its copy should land in.
 *
 * Several entries list a `data/` module alongside the page: content extracted out of a component
 * (CLI Basics' lesson data, the HTTP flashcard deck, the curriculum's own numbers) still has to be
 * found somewhere, or this audit reports it as dropped copy. Moving prose out of a page means
 * adding its new home here in the same change.
 */
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
  Flashcards: ['pages/Flashcards.tsx', 'data/httpDeck.ts'],
  'Algorithm Visualizer': ['pages/AlgorithmVisualizer.tsx'],
  'Code Playground': ['pages/CodePlayground.tsx'],
  'Terminal Simulator': ['pages/TerminalSimulator.tsx'],
  'Debugging Challenge': ['pages/DebuggingChallenge.tsx'],
  'Regex Lab': ['pages/RegexLab.tsx'],
  'Project Build-Along': ['pages/ProjectBuildAlong.tsx'],
  'Cheat Sheet': ['pages/CheatSheet.tsx'],
  Glossary: ['pages/Glossary.tsx'],
  Roadmap: ['pages/Roadmap.tsx', 'data/curriculum.ts'],
  'Progress Dashboard': ['pages/ProgressDashboard.tsx', 'data/curriculum.ts', 'data/httpDeck.ts'],
  'Course Complete': ['pages/CourseComplete.tsx', 'data/curriculum.ts'],
}

/**
 * Prototype phrases the source deliberately *composes* rather than spelling out, listed per
 * prototype. A grep over source can't find a string that only exists once React has run, so
 * without this the audit would report working copy as dropped — and the usual way that gets
 * "fixed" is putting the literal back, undoing the deduplication that motivated it.
 *
 * This is not a suppression list. Each phrase is still checked, just piece by piece: every
 * segment either side of a `·` separator has to appear in the source, so dropping one of the six
 * concept labels still fails. `stale` at the bottom of this file flags entries no prototype asks
 * for any more, so the excuse dies with the copy it covered.
 */
const COMPOSED = {
  // Roadmap.tsx builds each locked stage's syllabus line from `UPCOMING_STAGES[n].concepts` in
  // data/curriculum.ts — the same array TOTAL_CONCEPTS is counted from, which is the point: the
  // page claimed "twenty-three concepts" while listing 25 for as long as the two were separate.
  Roadmap: [
    'Variables · Control flow · Functions · Collections · Errors · Files — 6 concepts',
    'Arrays · Hash maps · Stacks & queues · Trees · Big-O · Sorting — 6 concepts',
    'HTTP · REST · SQL basics · Joins · Auth · Deploy — 6 concepts.',
  ],
}

/** The separately-findable pieces of a composed phrase — its `·`-separated items, suffix stripped. */
const partsOf = (phrase) =>
  phrase
    .replace(/ — \d+ concepts[.]?$/, '')
    .split(' · ')
    .map((part) => part.trim())
    .filter(Boolean)

/** Decode the small set of HTML entities the prototypes actually use. */
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

const files = readdirSync(PROTO_DIR).filter((f) => f.endsWith('.dc.html')) // every design prototype
let missingTotal = 0 // running count of phrases flagged as dropped, across all prototypes
const report = [] // human-readable output lines, printed together at the end

for (const file of files) {
  const name = file.replace('.dc.html', '') // prototype name, doubles as the MAP key
  const targets = MAP[name] // source files this prototype's copy should appear in
  if (!targets) {
    report.push(`?    ${name} — no mapping`)
    continue
  }
  const proto = phrases(prototypeText(`${PROTO_DIR}/${file}`)) // prototype's prose, chunked into phrases
  const src = sourceText(targets) // ported React source, flattened to plain text
  const composed = COMPOSED[name] ?? [] // phrases this page assembles at runtime (see COMPOSED)
  // A phrase counts as present if the source spells it out, or — when it's a listed composed
  // phrase — if every one of its pieces is there.
  const missing = proto.filter(
    (p) =>
      !src.includes(p) &&
      !(composed.includes(p) && partsOf(p).every((part) => src.includes(part))),
  )
  missingTotal += missing.length
  if (missing.length) {
    report.push(`MISS ${name} — ${missing.length}/${proto.length} phrases not found:`)
    for (const m of missing) report.push(`       "${m.slice(0, 150)}"`)
  } else {
    report.push(`ok   ${name.padEnd(24)} ${proto.length} phrases all present`)
  }
}

console.log(report.join('\n'))
// A COMPOSED entry for a phrase no prototype carries any more is dead weight that would quietly
// keep excusing copy nobody checks. Name it so it gets deleted alongside the copy it covered.
const protoPhrases = new Set(files.flatMap((f) => phrases(prototypeText(`${PROTO_DIR}/${f}`))))
const stale = Object.entries(COMPOSED).flatMap(([proto, list]) =>
  list.filter((p) => !protoPhrases.has(p)).map((p) => `${proto}: "${p.slice(0, 90)}"`),
)
if (stale.length) {
  console.log('\nstale COMPOSED entr(ies) — no prototype has this copy any more:')
  for (const line of stale) console.log(`       ${line}`)
}

console.log(`\n${missingTotal} phrase(s) to review across ${files.length} prototypes`)
