/**
 * Behavioural test: drives every page that carried DCLogic state in the design
 * prototypes, asserting the ported React state machines behave the same.
 * Run via `npm run verify:interactions` (the third leg of `npm run verify`,
 * alongside verify-routes.mjs and verify-responsive.mjs). Run against
 * `npm run preview`. Depends only on browser.mjs (BASE, openPage) — routes
 * are hardcoded per check below rather than sourced from routes.mjs, since
 * each block targets one specific page and interaction, not every route.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BASE, openPage } from './browser.mjs'

const { browser, page } = await openPage({ width: 1440, height: 1000 })

const results = [] // every check's { name, pass, detail }, for the final tally
/** Records one named assertion's outcome and prints it immediately. */
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
}
// Pages are code-split (React.lazy) — 'load' fires once the shell script has
// loaded, before the route's own chunk has been fetched and mounted. Waiting
// for real content is what makes every body() read right after go() reliable.
/** Navigates to a route and waits for its lazy-loaded content to mount. */
const go = async (path) => {
  await page.goto(BASE + path, { waitUntil: 'load' })
  await page.waitForSelector('main, h1', { timeout: 10_000 }).catch(() => {})
}

// Progress persists in localStorage now, so any block whose expectations
// depend on a fresh learner must say so explicitly — otherwise an earlier
// block's ratings and scores leak into it.
/** Clears persisted progress (quiz scores, flashcard schedule, milestones). */
const resetProgress = async () => {
  await page.goto(BASE + '/', { waitUntil: 'load' })
  await page.evaluate(() => localStorage.clear())
}
await resetProgress()
/** Snapshot of the current page's visible text, for asserting rendered state. */
const body = () => page.evaluate(() => document.body.innerText)

// A lesson page's <ConceptComplete> panel is deliberately *not* part of that page's own state
// machine: stepping a walkthrough to its end records the concept, and the walkthrough's Reset
// button rewinds the walkthrough without un-learning it. The before/after comparisons below are
// about the walkthrough, so they read the page with the panel's text subtracted — and then assert
// separately that the panel did *not* rewind.
/** Page text minus the concept-completion panel, for "did Reset restore the start state?" checks. */
const bodyMinusCompletion = () =>
  page.evaluate(() => {
    const panel = document.querySelector('section[aria-label$="completion"]')
    const text = document.body.innerText
    return panel ? text.replace(panel.innerText, '') : text
  })

// An earned completion lands one tick behind the click that earns it: the page's own state
// updates, an effect in <ConceptComplete> sees `earned` turn true, and only then does the panel
// re-render. A body() read on the next line is a read of the frame before that, so wait for the
// panel instead of snapshotting and hoping.
/** Resolves true once this page's completion panel reports `label` recorded, false if it never does. */
const completed = (label) =>
  page
    .getByText(`${label} — complete`)
    .first()
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false)

/** The inverse: resolves true once the panel is back to offering `label`, false if it never does. */
const notCompleted = (label) =>
  page
    .getByText(`Finished with ${label}?`)
    .first()
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false)

/* ── Quiz Mode: full 5-question run, scoring, restart ─────────────────── */
await go('/quiz-mode')
await page.getByRole('button', { name: /Check answer/ }).isDisabled()
  .then((d) => check('quiz: Check is disabled before choosing', d))
for (let q = 0; q < 5; q++) {
  await page.getByRole('button', { name: /^B\s/ }).first().click() // always pick option B
  await page.getByRole('button', { name: 'Check answer' }).click()
  const txt = await body()
  if (q === 0) check('quiz: feedback appears after checking', /Correct\.|Not quite/.test(txt))
  await page.getByRole('button', { name: /Next question|See results/ }).click()
}
const quizEnd = await body()
// B is correct on Q1–Q3, wrong on Q4–Q5 → 3/5, below the 4/5 pass mark.
check('quiz: score screen shows 3/5', quizEnd.includes('3/5'), quizEnd.match(/\d\/5/)?.[0])
check('quiz: sub-pass verdict shown', quizEnd.includes('Worth another pass'))
check(
  'quiz: verdict names the pass mark',
  quizEnd.includes('you only need 4 of 5'),
)
await page.getByRole('button', { name: 'Retry the quiz' }).click()
check('quiz: restart returns to Q1', (await body()).includes('Question 1 of 5'))

/* ── Flashcards: flip + rate advances the deck ────────────────────────── */
await go('/flashcards')
check('cards: starts on the front', (await body()).includes('tap to flip'))
await page.getByRole('button', { name: 'Show answer' }).click()
check('cards: flip reveals the answer', (await body()).includes('404 Not Found'))
await page.getByRole('button', { name: /Good/ }).click()
check('cards: rating advances to card 2', (await body()).includes('Card 2 of 5'))

/* ── Algorithm Visualizer: stepping changes the frame + counters ──────── */
await go('/algorithm-visualizer')
check('viz: Back disabled at frame 1', await page.getByRole('button', { name: '← Back' }).isDisabled())
const viz0 = await bodyMinusCompletion()
await page.getByRole('button', { name: 'Step →' }).click()
const viz1 = await body()
check('viz: stepping changes the note', viz0 !== viz1)
for (let i = 0; i < 8; i++) await page.getByRole('button', { name: 'Step →' }).click()
const vizEnd = await body()
check('viz: reaches the sorted end state', vizEnd.includes('the array is sorted'))
check('viz: final counters read 9 / 4', vizEnd.includes('9') && vizEnd.includes('Swaps'))
check('viz: reaching the end records the concept', await completed('Algorithm Visualizer'))
await page.getByRole('button', { name: 'Reset' }).click()
check('viz: reset returns to frame 1', (await bodyMinusCompletion()) === viz0)
check('viz: reset does not un-complete the concept', (await body()).includes('Algorithm Visualizer — complete'))

/* ── Rebase & History: stepping replays commits, ends linear ──────────── */
await go('/rebase-history')
check('rebase: Back disabled at step 1', await page.getByRole('button', { name: '← Back' }).isDisabled())
const rebase0 = await bodyMinusCompletion()
for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Step →' }).click()
const rebaseEnd = await body()
check('rebase: reaches the done state', rebaseEnd.includes('Rebase complete'))
check('rebase: replay count reads 2 of 2', rebaseEnd.includes('2 of 2'))
check('rebase: Step disabled at the end', await page.getByRole('button', { name: 'Done' }).isDisabled())
check('rebase: reaching the end records the concept', await completed('Rebase & History'))
await page.getByRole('button', { name: 'Reset' }).click()
check('rebase: reset returns to step 1', (await bodyMinusCompletion()) === rebase0)

/* ── Shell Scripting: stepping through backup.sh reveals terminal + vars ── */
await go('/shell-scripting')
check('shell: Back disabled at step 1', await page.getByRole('button', { name: '← Back' }).isDisabled())
const shell0 = await bodyMinusCompletion()
check('shell: STAMP unknown before stepping', shell0.includes('STAMP') && !shell0.includes('20260907'))
for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Step →' }).click()
const shellEnd = await body()
check('shell: final step reveals the echo output', shellEnd.includes('Backed up to backups/devhub-20260907.tar.gz'))
check('shell: Step disabled at the end', await page.getByRole('button', { name: 'Done' }).isDisabled())
check('shell: reaching the end records the concept', await completed('Shell Scripting'))
await page.getByRole('button', { name: 'Reset' }).click()
check('shell: reset returns to step 1', (await bodyMinusCompletion()) === shell0)

/* ── Regex Lab: real matching, counts change per pattern ──────────────── */
await go('/regex-lab')
const digits = await body()
// 4 digit-runs per line × 4 lines (e.g. 10, 42, 07, 3).
check('regex: \\d+ finds 16 matches', digits.includes('16 MATCHES'), digits.match(/\d+ MATCHES/)?.[0])
await page.getByRole('button', { name: 'ERROR|WARN' }).click()
const levels = await body()
check('regex: ERROR|WARN finds 3', levels.includes('3 MATCHES'), levels.match(/\d+ MATCHES/)?.[0])
await page.getByRole('button', { name: '\\w+@\\w+\\.dev' }).click()
const emails = await body()
check('regex: email pattern finds 2', emails.includes('2 MATCHES'), emails.match(/\d+ MATCHES/)?.[0])

/* ── Terminal Simulator: mission advances and completes ───────────────── */
await go('/terminal-simulator')
for (let i = 0; i < 5; i++) await page.getByRole('button', { name: /Type it for me/ }).click()
const mission = await body()
check('terminal: mission completes', mission.includes('Mission complete'))
check('terminal: final evidence printed', mission.includes('the disk is full'))
await page.getByRole('button', { name: 'Restart mission' }).click()
check('terminal: restart clears the log', !(await body()).includes('Mission complete'))

/* ── Debugging Challenge: progressive hints then the diff ─────────────── */
await go('/debugging-challenge')
await page.getByRole('button', { name: 'Give me a hint' }).click()
check('debug: hint 1 revealed', (await body()).includes('how many times it does it'))
await page.getByRole('button', { name: 'One more hint' }).click()
check('debug: hint 2 revealed', (await body()).includes('stops'))
await page.getByRole('button', { name: /show the fix/ }).click()
const solved = await body()
check('debug: diff revealed', solved.includes('range(1, 13)'))
check('debug: takeaway shown', solved.includes('half-open'))

/* ── Decorator Pattern: the order builder computes cost + constructor ─── */
await go('/decorator-pattern')
await page.getByRole('button', { name: /\+ Mocha/ }).click()
await page.getByRole('button', { name: /\+ Whip/ }).click()
const order = await body()
// 0.89 + 0.20 + 0.10
check('decorator: total is $1.19', order.includes('$1.19'))
check(
  'decorator: constructor nests outermost-last',
  order.includes('new Whip(new Mocha(new HouseBlend()))'),
)
check('decorator: description tracks the stack', order.includes('House Blend, Mocha, Whip'))
await page.getByRole('button', { name: 'Undo' }).click()
check('decorator: undo pops one wrapper', (await body()).includes('$1.09'))
await page.getByRole('button', { name: 'Reset', exact: true }).click()
check('decorator: reset returns to base', (await body()).includes('$0.89'))
await page.getByRole('button', { name: '▶ Run' }).click()
check('decorator: predict-then-run prints output', (await body()).includes('total: $2.49'))

/* ── CLI Basics: anatomy clicker, quiz lock, walkthrough gating ───────── */
await go('/cli-basics')
check('cli: anatomy starts on the command', (await body()).includes('ls is the command'))
await page.getByRole('button', { name: '-la' }).click()
check('cli: clicking -la swaps the definition', (await body()).includes('long format'))
await page.getByRole('button', { name: '/var/log' }).click()
check('cli: clicking the arg swaps again', (await body()).includes('the thing the command acts on'))
await page.getByRole('button', { name: 'pwd', exact: true }).click()
check('cli: quiz answer locks in', (await body()).includes('print working directory'))
check(
  'cli: answered options disable',
  // nth(1) — nth(0) is the "ls" token in the anatomy clicker above.
  await page.getByRole('button', { name: 'ls', exact: true }).nth(1).isDisabled(),
)
// The cheat-sheet copy buttons must hand over a runnable snippet — the
// PowerShell $LASTEXITCODE line is shown for contrast but must not be copied.
await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
await page.getByRole('button', { name: 'Copy Pipes, redirection, exit codes' }).click()
const clip = await page.evaluate(() => navigator.clipboard.readText()) // text the copy button placed on the clipboard
check('cli: copy payload is 9 lines', clip.split('\n').length === 9, `${clip.split('\n').length}`)
check('cli: copy payload omits $LASTEXITCODE', !clip.includes('$LASTEXITCODE'))
check('cli: copy payload keeps the bash lines', clip.includes('ls /var/log; echo "exit: $?"'))
check('cli: copy acknowledges', (await body()).includes('Copied!'))

check('cli: step 2 hidden until step 1 runs', !(await body()).includes('Next step'))
await page.getByRole('button', { name: 'Run it →' }).click()
const walk = await body()
check('cli: output revealed', walk.includes('/home/dev'))
check('cli: Next step now offered', walk.includes('Next step'))

/* ── Project Build-Along: checklist toggles drive the % ───────────────── */
await go('/project-build-along')
check('build: starts at 40% built', (await body()).includes('40% BUILT'))
await page.getByRole('button', { name: /Add --filter PATTERN/ }).click()
check('build: checking a milestone → 60%', (await body()).includes('60% BUILT'))
await page.getByRole('button', { name: /Print the last 10 lines/ }).click()
check('build: unchecking → 40%', (await body()).includes('40% BUILT'))

/* ── Code Playground: run tests really executes the solution in a worker ──── */
await go('/code-playground')
check('playground: idle before running', (await body()).includes('Output appears here'))
await page.getByRole('button', { name: '▶ Run tests' }).click()
await page.getByText('ALL 4 TESTS PASSED').waitFor({ timeout: 5_000 })
const ran = await body()
check('playground: tests pass', ran.includes('ALL 4 TESTS PASSED'))
check('playground: real output printed', ran.includes('FizzBuzz'))
check('playground: all 4 checks individually graded true', ran.includes('✓ Prints 15 lines') && ran.includes('✓ 15 → FizzBuzz'))
await page.getByRole('button', { name: 'Clear output' }).click()
check('playground: clear resets', (await body()).includes('Output appears here'))

/* ── Glossary: real search + letter-group filtering, honest term count ──── */
await go('/glossary')
let g = await body()
check('glossary: honest term count badge', g.includes('36 TERMS') && !g.includes('142 TERMS'))
check(
  'glossary: opens on group A',
  g.includes('API') && g.includes('Argument') && g.includes('Async') && g.includes('4 of 36 terms'),
)
check('glossary: does not show a term from another group', !g.includes('Backend'))
await page.getByRole('button', { name: 'B', exact: true }).click()
g = await body()
check(
  'glossary: switching group filters the list',
  g.includes('Backend') && g.includes('Boolean') && g.includes('Branch') && !g.includes('Argument'),
)
check('glossary: group B count is real', g.includes('3 of 36 terms'))
await page.getByLabel('Search terms').fill('JWT')
g = await body()
check(
  'glossary: search filters across all groups',
  g.includes('Search results') && g.includes('1 of 36 terms') && g.includes('JSON Web Token'),
)
check('glossary: search hides non-matching terms', !g.includes('Backend'))
await page.getByLabel('Search terms').fill('zzzzznotaterm')
check('glossary: no-match state is honest, not empty', (await body()).includes('No terms match'))
await page.getByRole('button', { name: 'A', exact: true }).click()
g = await body()
check('glossary: clicking a group clears the search', g.includes('4 of 36 terms') && g.includes('API'))

/* ── Python Variables: 4 graded predict-the-value questions (item 10) ─── */
await resetProgress()
await go('/python-variables')
let pv = await body()
check('python variables: starts unanswered', pv.includes('Score: 0 of 4 correct'))
await page.getByRole('button', { name: "<class 'str'>" }).click()
await page.getByRole('button', { name: '3', exact: true }).click()
await page.getByRole('button', { name: '2 1', exact: true }).click()
pv = await body()
check('python variables: three correct reaches the pass mark', pv.includes('Score: 3 of 4 correct'))
check('python variables: earns completion at the pass mark', await completed('Variables'))
await page.getByRole('button', { name: '0', exact: true }).click()
pv = await body()
check(
  'python variables: a wrong pick still shows the real explanation',
  pv.includes('count += 1 is shorthand'),
)
await page.getByRole('button', { name: '↺ Try again' }).click()
check('python variables: try again resets the score', (await body()).includes('Score: 0 of 4 correct'))

/* ── Control Flow: 4 graded predict-the-value questions, Stage 3's 2nd lesson (item 30) ── */
await resetProgress()
await go('/control-flow')
let cf = await body()
check('control flow: starts unanswered', cf.includes('Score: 0 of 4 correct'))
await page.getByRole('button', { name: 'B', exact: true }).click()
await page.getByRole('button', { name: '6', exact: true }).click()
// Q2's wrong option and Q3's correct option are both the bare text "3" — Q2's card renders
// first, so the second match is Q3's.
await page.getByRole('button', { name: '3', exact: true }).nth(1).click()
cf = await body()
check('control flow: three correct reaches the pass mark', cf.includes('Score: 3 of 4 correct'))
check('control flow: earns completion at the pass mark', await completed('Control Flow'))
await page.getByRole('button', { name: 'has items', exact: true }).click()
cf = await body()
check(
  'control flow: a wrong pick still shows the real explanation',
  cf.includes('always falsy'),
)
await page.getByRole('button', { name: '↺ Try again' }).click()
check('control flow: try again resets the score', (await body()).includes('Score: 0 of 4 correct'))

/* ── Functions: 4 graded predict-the-value questions, Stage 3's 3rd lesson (item 31) ── */
await resetProgress()
await go('/functions')
let fn = await body()
check('functions: starts unanswered', fn.includes('Score: 0 of 4 correct'))
await page.getByRole('button', { name: "['apple', 'banana']", exact: true }).click()
await page.getByRole('button', { name: 'Hi, Ana!', exact: true }).click()
await page.getByRole('button', { name: 'None', exact: true }).click()
fn = await body()
check('functions: three correct reaches the pass mark', fn.includes('Score: 3 of 4 correct'))
check('functions: earns completion at the pass mark', await completed('Functions'))
await page.getByRole('button', { name: '0', exact: true }).click()
fn = await body()
check(
  'functions: a wrong pick still shows the real explanation',
  fn.includes('the loop has already finished'),
)
await page.getByRole('button', { name: '↺ Try again' }).click()
check('functions: try again resets the score', (await body()).includes('Score: 0 of 4 correct'))

/* ── Collections: 4 graded predict-the-value questions, Stage 3's 4th lesson (item 32) ── */
await resetProgress()
await go('/collections')
let co = await body()
check('collections: starts unanswered', co.includes('Score: 0 of 4 correct'))
await page.getByRole('button', { name: '[1, 2, 3, 4]', exact: true }).click()
await page
  .getByRole('button', { name: "TypeError — a tuple can't be changed after it's created", exact: true })
  .click()
await page.getByRole('button', { name: "{'a': 3, 'b': 2}", exact: true }).click()
co = await body()
check('collections: three correct reaches the pass mark', co.includes('Score: 3 of 4 correct'))
check('collections: earns completion at the pass mark', await completed('Collections'))
await page.getByRole('button', { name: 'IndexError — 10 is out of range', exact: true }).click()
co = await body()
check(
  'collections: a wrong pick still shows the real explanation',
  co.includes('Slicing is forgiving'),
)
await page.getByRole('button', { name: '↺ Try again' }).click()
check('collections: try again resets the score', (await body()).includes('Score: 0 of 4 correct'))

/* ── Errors: 4 graded predict-the-value questions, Stage 3's 5th lesson (item 33) ── */
await resetProgress()
await go('/errors')
let er = await body()
check('errors: starts unanswered', er.includes('Score: 0 of 4 correct'))
await page.getByRole('button', { name: '2', exact: true }).click()
await page.getByRole('button', { name: 'None then None', exact: true }).click()
await page.getByRole('button', { name: 'recovered, then still running', exact: true }).click()
er = await body()
check('errors: three correct reaches the pass mark', er.includes('Score: 3 of 4 correct'))
check('errors: earns completion at the pass mark', await completed('Errors'))
await page.getByRole('button', { name: 'specific handler', exact: true }).click()
er = await body()
check(
  'errors: a wrong pick still shows the real explanation',
  er.includes('dead code that can never fire'),
)
await page.getByRole('button', { name: '↺ Try again' }).click()
check('errors: try again resets the score', (await body()).includes('Score: 0 of 4 correct'))

/* ── Files: 4 graded predict-the-value questions, Stage 3's 6th and final lesson (item 34) ── */
await resetProgress()
await go('/files')
let fi = await body()
check('files: starts unanswered', fi.includes('Score: 0 of 4 correct'))
await page
  .getByRole('button', { name: 'an empty string — the file has nothing in it', exact: true })
  .click()
await page.getByRole('button', { name: '3 0', exact: true }).click()
await page.getByRole('button', { name: 'False', exact: true }).click()
fi = await body()
check('files: three correct reaches the pass mark', fi.includes('Score: 3 of 4 correct'))
check('files: earns completion at the pass mark', await completed('Files'))
await page
  .getByRole('button', { name: 'It writes "hello world" to out.txt', exact: true })
  .click()
fi = await body()
check(
  'files: a wrong pick still shows the real explanation',
  fi.includes('I/O operation on closed file'),
)
await page.getByRole('button', { name: '↺ Try again' }).click()
check('files: try again resets the score', (await body()).includes('Score: 0 of 4 correct'))

/* ── Arrays: 4 graded predict-the-value questions, Stage 4's 1st lesson (item 35) ── */
await resetProgress()
await go('/arrays')
let ar = await body()
check('arrays: starts unanswered', ar.includes('Score: 0 of 4 correct'))
await page
  .getByRole('button', { name: '[[1, 0, 0], [1, 0, 0], [1, 0, 0]]', exact: true })
  .click()
await page.getByRole('button', { name: '[4, 8]', exact: true }).click()
await page
  .getByRole('button', { name: 'IndexError — list index out of range', exact: true })
  .click()
ar = await body()
check('arrays: three correct reaches the pass mark', ar.includes('Score: 3 of 4 correct'))
check('arrays: earns completion at the pass mark', await completed('Arrays'))
await page.getByRole('button', { name: 'cat', exact: true }).click()
ar = await body()
check(
  'arrays: a wrong pick still shows the real explanation',
  ar.includes('does not support item assignment'),
)
await page.getByRole('button', { name: '↺ Try again' }).click()
check('arrays: try again resets the score', (await body()).includes('Score: 0 of 4 correct'))

/* ── Hash Maps: 4 graded predict-the-value questions, Stage 4's 2nd lesson (item 36) ── */
await resetProgress()
await go('/hash-maps')
let hm = await body()
check('hash maps: starts unanswered', hm.includes('Score: 0 of 4 correct'))
await page
  .getByRole('button', { name: "TypeError: unhashable type: 'list'", exact: true })
  .click()
await page.getByRole('button', { name: "KeyError: 'carol'", exact: true }).click()
await page
  .getByRole('button', { name: 'RuntimeError: dictionary changed size during iteration', exact: true })
  .click()
hm = await body()
check('hash maps: three correct reaches the pass mark', hm.includes('Score: 3 of 4 correct'))
check('hash maps: earns completion at the pass mark', await completed('Hash Maps'))
await page
  .getByRole('button', { name: "['a', 'm', 'z'] — dicts sort their keys alphabetically", exact: true })
  .click()
hm = await body()
check(
  'hash maps: a wrong pick still shows the real explanation',
  hm.includes('insertion order and sorted order are not the same guarantee'),
)
await page.getByRole('button', { name: '↺ Try again' }).click()
check('hash maps: try again resets the score', (await body()).includes('Score: 0 of 4 correct'))

/* ── Stacks & Queues: 4 graded predict-the-value questions, Stage 4's 3rd lesson (item 37) ── */
await resetProgress()
await go('/stacks-queues')
let sq = await body()
check('stacks & queues: starts unanswered', sq.includes('Score: 0 of 4 correct'))
await page
  .getByRole('button', { name: 'O(n) — every remaining element shifts left by one', exact: true })
  .click()
await page
  .getByRole('button', { name: 'deque([2, 3, 4], maxlen=3) — 1 is silently dropped', exact: true })
  .click()
await page.getByRole('button', { name: 'third', exact: true }).click()
sq = await body()
check('stacks & queues: three correct reaches the pass mark', sq.includes('Score: 3 of 4 correct'))
check('stacks & queues: earns completion at the pass mark', await completed('Stacks & Queues'))
await page
  .getByRole('button', {
    name: '"profile" then "home", then history.pop() outside the loop returns None',
    exact: true,
  })
  .click()
sq = await body()
check(
  'stacks & queues: a wrong pick still shows the real explanation',
  sq.includes('pop from empty list'),
)
await page.getByRole('button', { name: '↺ Try again' }).click()
check('stacks & queues: try again resets the score', (await body()).includes('Score: 0 of 4 correct'))

/* ── Roadmap: all six Stage 3 concepts, Stage 4's first three (items 10, 30-37) ── */
await resetProgress()
await go('/roadmap')
let rm = await body()
check(
  'roadmap: stage 3 shows all six real concepts',
  rm.includes('Variables') &&
    rm.includes('Control Flow') &&
    rm.includes('Functions') &&
    rm.includes('Collections') &&
    rm.includes('Errors') &&
    rm.includes('Files'),
)
check(
  'roadmap: stage 4 shows all three of its real concepts',
  rm.includes('Arrays') && rm.includes('Hash Maps') && rm.includes('Stacks & Queues'),
)
check(
  'roadmap: stage 3 has nothing left not-yet-built; stage 4 still has three',
  (rm.match(/not built yet/g) ?? []).length === 3,
)
check('roadmap: stage 3 count reflects real + not-built', rm.includes('0 OF 6'))
check(
  'roadmap: stage 4 points at real related lessons',
  rm.includes('Data Structures Visual') && rm.includes('Big-O Performance') && rm.includes('Algorithm Visualizer'),
)
check('roadmap: stage 5 points at API Anatomy', rm.includes('API Anatomy'))
check('roadmap: stage 5 still reads not yet built', (rm.match(/NOT YET BUILT/g) ?? []).length === 1)

await page.getByRole('link', { name: 'Variables' }).click()
await page.waitForURL('**/python-variables')
check('roadmap: the Variables chip really links to the lesson', page.url().endsWith('/python-variables'))
await page.getByRole('button', { name: "<class 'str'>" }).click()
await page.getByRole('button', { name: '3', exact: true }).click()
await page.getByRole('button', { name: '2 1', exact: true }).click()
await go('/roadmap')
rm = await body()
check('roadmap: completing it moves the stage-3 count', rm.includes('1 OF 6'))
check('roadmap: it also moves the path total', rm.includes('1 of 25 concepts'))

await page.getByRole('link', { name: 'Control Flow' }).click()
await page.waitForURL('**/control-flow')
check('roadmap: the Control Flow chip really links to the lesson', page.url().endsWith('/control-flow'))
await page.getByRole('button', { name: 'B', exact: true }).click()
await page.getByRole('button', { name: '6', exact: true }).click()
// Same "3"/"3" collision as the dedicated block above — Q3's is the second match.
await page.getByRole('button', { name: '3', exact: true }).nth(1).click()
await go('/roadmap')
rm = await body()
check('roadmap: completing both moves the stage-3 count again', rm.includes('2 OF 6'))
check('roadmap: it also moves the path total again', rm.includes('2 of 25 concepts'))

await page.getByRole('link', { name: 'Functions' }).click()
await page.waitForURL('**/functions')
check('roadmap: the Functions chip really links to the lesson', page.url().endsWith('/functions'))
await page.getByRole('button', { name: "['apple', 'banana']", exact: true }).click()
await page.getByRole('button', { name: 'Hi, Ana!', exact: true }).click()
await page.getByRole('button', { name: 'None', exact: true }).click()
await go('/roadmap')
rm = await body()
check('roadmap: completing all three moves the stage-3 count a third time', rm.includes('3 OF 6'))
check('roadmap: it also moves the path total a third time', rm.includes('3 of 25 concepts'))

await page.getByRole('link', { name: 'Collections' }).click()
await page.waitForURL('**/collections')
check('roadmap: the Collections chip really links to the lesson', page.url().endsWith('/collections'))
await page.getByRole('button', { name: '[1, 2, 3, 4]', exact: true }).click()
await page
  .getByRole('button', { name: "TypeError — a tuple can't be changed after it's created", exact: true })
  .click()
await page.getByRole('button', { name: "{'a': 3, 'b': 2}", exact: true }).click()
await go('/roadmap')
rm = await body()
check('roadmap: completing all four moves the stage-3 count a fourth time', rm.includes('4 OF 6'))
check('roadmap: it also moves the path total a fourth time', rm.includes('4 of 25 concepts'))

await page.getByRole('link', { name: 'Errors' }).click()
await page.waitForURL('**/errors')
check('roadmap: the Errors chip really links to the lesson', page.url().endsWith('/errors'))
await page.getByRole('button', { name: '2', exact: true }).click()
await page.getByRole('button', { name: 'None then None', exact: true }).click()
await page.getByRole('button', { name: 'recovered, then still running', exact: true }).click()
await go('/roadmap')
rm = await body()
check('roadmap: completing all five moves the stage-3 count a fifth time', rm.includes('5 OF 6'))
check('roadmap: it also moves the path total a fifth time', rm.includes('5 of 25 concepts'))

await page.getByRole('link', { name: 'Files' }).click()
await page.waitForURL('**/files')
check('roadmap: the Files chip really links to the lesson', page.url().endsWith('/files'))
await page
  .getByRole('button', { name: 'an empty string — the file has nothing in it', exact: true })
  .click()
await page.getByRole('button', { name: '3 0', exact: true }).click()
await page.getByRole('button', { name: 'False', exact: true }).click()
await go('/roadmap')
rm = await body()
check('roadmap: completing all six moves the stage-3 count to full', rm.includes('6 OF 6'))
check('roadmap: it also moves the path total a sixth time', rm.includes('6 of 25 concepts'))
check(
  'roadmap: Stage 3 has no not-built chips left; Stage 4 still has its three',
  (rm.match(/not built yet/g) ?? []).length === 3,
)

await page.getByRole('link', { name: 'Arrays' }).click()
await page.waitForURL('**/arrays')
check('roadmap: the Arrays chip really links to the lesson', page.url().endsWith('/arrays'))
await page
  .getByRole('button', { name: '[[1, 0, 0], [1, 0, 0], [1, 0, 0]]', exact: true })
  .click()
await page.getByRole('button', { name: '[4, 8]', exact: true }).click()
await page
  .getByRole('button', { name: 'IndexError — list index out of range', exact: true })
  .click()
await go('/roadmap')
rm = await body()
check('roadmap: completing Arrays moves the stage-4 count', rm.includes('1 OF 6'))
check('roadmap: it also moves the path total a seventh time', rm.includes('7 of 25 concepts'))
check(
  'roadmap: completing Arrays does not consume a stage-4 not-built chip',
  (rm.match(/not built yet/g) ?? []).length === 3,
)

await page.getByRole('link', { name: 'Hash Maps' }).click()
await page.waitForURL('**/hash-maps')
check('roadmap: the Hash Maps chip really links to the lesson', page.url().endsWith('/hash-maps'))
await page
  .getByRole('button', { name: "TypeError: unhashable type: 'list'", exact: true })
  .click()
await page.getByRole('button', { name: "KeyError: 'carol'", exact: true }).click()
await page
  .getByRole('button', { name: 'RuntimeError: dictionary changed size during iteration', exact: true })
  .click()
await go('/roadmap')
rm = await body()
check('roadmap: completing Hash Maps moves the stage-4 count again', rm.includes('2 OF 6'))
check('roadmap: it also moves the path total an eighth time', rm.includes('8 of 25 concepts'))
check(
  'roadmap: completing Hash Maps does not consume a stage-4 not-built chip either',
  (rm.match(/not built yet/g) ?? []).length === 3,
)

await page.getByRole('link', { name: 'Stacks & Queues' }).click()
await page.waitForURL('**/stacks-queues')
check(
  'roadmap: the Stacks & Queues chip really links to the lesson',
  page.url().endsWith('/stacks-queues'),
)
await page
  .getByRole('button', { name: 'O(n) — every remaining element shifts left by one', exact: true })
  .click()
await page
  .getByRole('button', { name: 'deque([2, 3, 4], maxlen=3) — 1 is silently dropped', exact: true })
  .click()
await page.getByRole('button', { name: 'third', exact: true }).click()
await go('/roadmap')
rm = await body()
check('roadmap: completing Stacks & Queues moves the stage-4 count a third time', rm.includes('3 OF 6'))
check('roadmap: it also moves the path total a ninth time', rm.includes('9 of 25 concepts'))
check(
  'roadmap: completing Stacks & Queues does not consume a stage-4 not-built chip',
  (rm.match(/not built yet/g) ?? []).length === 3,
)

/* ── Gallery navigation: a card actually routes, logo comes back ──────── */
// Client-side routing changes the URL before React commits the new DOM, so
// each step waits for the render — not just the address — before asserting.
// "Dev Hub" also matches two links on the gallery (brand + catalog card), so
// the brand is addressed by its class.
await go('/')
await page.getByRole('link', { name: /Quiz Mode/ }).click()
await page.waitForURL('**/quiz-mode')
await page.getByRole('heading', { level: 1 }).waitFor()
check('nav: gallery card routes to the page', page.url().endsWith('/quiz-mode'))
await page.locator('.topnav-brand').click()
// The router basename (GitHub Pages' sub-path) means the gallery's real
// pathname is BASE's own path plus a trailing slash, not bare "/".
const galleryPath = new URL(BASE + '/').pathname
await page.waitForURL((u) => new URL(u).pathname === galleryPath)
check('nav: brand mark returns to the gallery', new URL(page.url()).pathname === galleryPath)

/* ── Command palette: Ctrl+K opens it from anywhere, filters, navigates ── */
await go('/quiz-mode')
await page.keyboard.press('Control+k')
const paletteInput = page.getByPlaceholder('Jump to a page…')
check('palette: Ctrl+K opens it from any page', await paletteInput.isVisible())
await paletteInput.fill('glossary')
let paletteText = await body()
check(
  'palette: filtering narrows to the matching page',
  paletteText.includes('Glossary') && !paletteText.includes('CLI Basics'),
)
await page.keyboard.press('Enter')
await page.waitForURL('**/glossary')
check('palette: Enter navigates to the highlighted result', page.url().endsWith('/glossary'))
check('palette: navigating closes it', !(await paletteInput.isVisible()))

await page.keyboard.press('Control+k')
check('palette: reopening starts from a blank query', (await paletteInput.inputValue()) === '')
await paletteInput.fill('zzz-not-a-real-page')
paletteText = await body()
check('palette: an unmatched query shows the honest empty state', paletteText.includes('No page matches'))
await page.keyboard.press('Escape')
check('palette: Escape closes it', !(await paletteInput.isVisible()))

/* ── Boundaries: the paths the happy-path checks never reach ─────────── */

// Quiz, all correct. Answers are B,B,B,A,A — this exercises the pass branch
// and the unlock message, which no other check touches.
await go('/quiz-mode')
for (const letter of ['B', 'B', 'B', 'A', 'A']) {
  await page.getByRole('button', { name: new RegExp(`^${letter}\\s`) }).first().click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: /Next question|See results/ }).click()
}
const aced = await body()
check('quiz edge: perfect run scores 5/5', aced.includes('5/5'))
check('quiz edge: pass verdict shown', aced.includes('Checkpoint passed!'))
check('quiz edge: unlock message shown', aced.includes('Branching & Merging is unlocked'))

// Quiz, skipping everything — every answer recorded wrong, no crash.
await go('/quiz-mode')
for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Skip' }).click()
const skipped = await body()
check('quiz edge: skipping all scores 0/5', skipped.includes('0/5'))

// Decorator sandbox at the empty boundary — Undo/Reset with nothing stacked.
await go('/decorator-pattern')
await page.getByRole('button', { name: 'Undo' }).click()
await page.getByRole('button', { name: 'Reset', exact: true }).click()
const empty = await body()
check('decorator edge: empty stack survives undo/reset', empty.includes('$0.89'))
check('decorator edge: description is the bare drink', empty.includes('"House Blend"'))

// Milestones at both extremes.
await go('/project-build-along')
const boxes = page.getByRole('button', { name: /covered in:/ }) // every milestone checkbox
const total = await boxes.count()
for (let i = 0; i < total; i++) {
  const b = boxes.nth(i)
  if ((await b.getAttribute('aria-pressed')) === 'true') await b.click()
}
check('build edge: all unchecked → 0%', (await body()).includes('0% BUILT'))
for (let i = 0; i < total; i++) await boxes.nth(i).click()
check('build edge: all checked → 100%', (await body()).includes('100% BUILT'))

// Flashcards to the end of the deck — the session now completes rather than
// looping on the last card. Needs a fresh deck: the happy-path check above
// rated one card, which schedules it out of today's session.
await resetProgress()
await go('/flashcards')
for (let i = 0; i < 5; i++) {
  await page.getByRole('button', { name: /Show (answer|question)/ }).click()
  await page.getByRole('button', { name: /Easy/ }).click()
}
const deckEnd = await body()
check('cards edge: session completes at deck end', deckEnd.includes('SESSION COMPLETE'))
check('cards edge: reports how many were reviewed', deckEnd.includes('5 cards reviewed'))
check('cards edge: nothing left due after rating all easy', deckEnd.includes('0 due today'))
await page.getByRole('button', { name: 'Study again' }).click()
check('cards edge: study again restarts the deck', (await body()).includes('tap to flip'))

/* ── Persistence, search and 404 — the features behind the mockups ────── */

await resetProgress()

// Quiz scores survive a reload and accumulate into a personal best.
await go('/quiz-mode')
for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Skip' }).click()
await go('/progress-dashboard')
const dash = await body()
check('progress: dashboard reads the recorded attempt', dash.includes('0%'))
check('progress: streak is computed, not hardcoded', !dash.includes('4 days'))

// A second attempt is remembered alongside the first.
await go('/quiz-mode')
for (const letter of ['B', 'B', 'B', 'A', 'A']) {
  await page.getByRole('button', { name: new RegExp(`^${letter}\\s`) }).first().click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: /Next question|See results/ }).click()
}
await page.getByText(/Best so far/).waitFor({ timeout: 10_000 }).catch(() => {})
check('progress: personal best across attempts shown', (await body()).includes('Best so far 5/5'))

// Milestones persist across a reload.
await go('/project-build-along')
await page.getByRole('button', { name: /Add --filter PATTERN/ }).click()
const afterToggle = await body()
await go('/project-build-along')
check(
  'progress: milestones survive a reload',
  (await body()).match(/(\d+)% BUILT/)?.[1] === afterToggle.match(/(\d+)% BUILT/)?.[1],
)

// Dev Hub search was decorative in the mockup.
await go('/dev-hub')
await page.getByLabel('Search concepts').fill('hash')
const searched = await body()
check('search: Dev Hub filters to matches', searched.includes('Hash Maps'))
check('search: non-matches are hidden', !searched.includes('Shell Scripting'))
await page.getByLabel('Search concepts').fill('zzzz')
check('search: empty state explains itself', (await body()).includes('Nothing matches'))

// Gallery filter across all 26 archetypes.
await go('/')
await page.getByLabel('Filter pages').fill('dark')
const gallery = await body()
check('search: gallery filters', gallery.includes('Terminal Simulator'))
check('search: gallery hides non-matches', !gallery.includes('Cheat Sheet'))

// Unknown URLs used to silently redirect to the gallery.
await go('/does-not-exist')
const missing = await body()
check('404: unknown route explains itself', missing.includes('No such page'))
check('404: offers a way back', missing.includes('Browse the gallery'))

/* ── Backup file: export, restore, and the files that get refused ────── */

// Something worth backing up: a perfect quiz run, which the dashboard's
// "Quiz accuracy" tile reports on and an empty state demonstrably doesn't.
await resetProgress()
await go('/quiz-mode')
for (const letter of ['B', 'B', 'B', 'A', 'A']) {
  await page.getByRole('button', { name: new RegExp(`^${letter}\\s`) }).first().click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: /Next question|See results/ }).click()
}

await go('/progress-dashboard')
// The click and the listener are started together: the download event can
// fire before an awaited click resolves.
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 15_000 }),
  page.getByRole('button', { name: 'Export backup' }).click(),
])
const backupPath = await download.path()
const suggested = download.suggestedFilename()
check(
  'backup: export offers a dated filename',
  /^dev-hub-progress-\d{4}-\d{2}-\d{2}\.json$/.test(suggested),
  suggested,
)
check('backup: export says so on screen', (await body()).includes('Saved dev-hub-progress-'))
const exported = JSON.parse(readFileSync(backupPath, 'utf8'))
check('backup: file is a version-1 state', exported.version === 1)
check(
  'backup: file carries the quiz that was just aced',
  Object.values(exported.quizzes ?? {}).some((q) => q.best === 5),
)

// Wipe, then restore from that same file.
await resetProgress()
await go('/progress-dashboard')
check('backup: dashboard is empty before the restore', (await body()).includes('No checkpoints yet'))
page.once('dialog', (d) => d.accept())
await page.locator('input[type=file]').setInputFiles(backupPath)
await page.getByText(/^Restored /).waitFor({ timeout: 10_000 }).catch(() => {})
const restored = await body()
check('backup: import reports what it restored', /Restored .*quiz/.test(restored))
check('backup: the restored quiz is live again', restored.includes('Best score, per checkpoint'))

// A file from some other app, and a file that isn't JSON at all. Both are
// refused by name rather than crashing the page — and neither one prompts,
// since parsing fails before there's anything to confirm.
const foreignPath = join(tmpdir(), 'dev-hub-foreign-backup.json')
writeFileSync(foreignPath, JSON.stringify({ version: 99, concepts: {} }))
await page.locator('input[type=file]').setInputFiles(foreignPath)
await page.getByText(/version 99/).waitFor({ timeout: 10_000 }).catch(() => {})
check('backup: a foreign version is refused', (await body()).includes('version 99'))

const junkPath = join(tmpdir(), 'dev-hub-junk-backup.json')
writeFileSync(junkPath, 'this is not json')
await page.locator('input[type=file]').setInputFiles(junkPath)
await page.getByText(/valid JSON/).waitFor({ timeout: 10_000 }).catch(() => {})
check('backup: a non-JSON file is refused', (await body()).includes('valid JSON'))
check(
  'backup: a refused import leaves progress alone',
  (await body()).includes('Best score, per checkpoint'),
)

// Reset clears everything.
await go('/progress-dashboard')
page.once('dialog', (d) => d.accept())
await page.getByRole('button', { name: 'Reset progress' }).click()
await go('/quiz-mode')
for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Skip' }).click()
check('progress: reset clears the personal best', !(await body()).includes('Best so far'))

/* ── Concept completion: what the Roadmap and dashboard actually count ── */
// BACKLOG item 6. Before this, completeConcept() had a single call site and the Roadmap floored
// its count at a hardcoded 8 to hide that "N of 23" was always "0 of 23". These checks pin down
// the things that made the number meaningless: that it moves at all, that it survives a reload,
// that a concept with no page can't be quietly counted, and — the one most likely to be broken by
// a later change — that an off-path concept doesn't move a figure labelled "Backend path".
await resetProgress()
await go('/roadmap')
const road0 = await body()
check('concepts: roadmap starts at 0 of 25', road0.includes('0 of 25 concepts'))
check('concepts: stage 1 reports its real fraction', road0.includes('0 OF 3'))
check('concepts: a page-less concept is still listed', road0.includes('Environment Variables'))
check('concepts: the first routed concept is next up', road0.includes('Continue — CLI Basics'))

// A static lesson page has no earned moment, so the panel's own button is the way to complete it.
await go('/api-anatomy')
check('concepts: a static page offers the button', (await body()).includes('Finished with API Anatomy?'))
await page.getByRole('button', { name: 'Mark complete' }).click()
check('concepts: marking it says so', await completed('API Anatomy'))
await go('/api-anatomy')
check('concepts: it survives a reload', (await body()).includes('API Anatomy — complete'))

// API Anatomy sits off the five-stage path, so the path figure must not budge for it.
await go('/roadmap')
check('concepts: an off-path concept leaves the path count alone', (await body()).includes('0 of 25 concepts'))
await go('/progress-dashboard')
const dash1 = await body()
check('concepts: the dashboard agrees the path is untouched', dash1.includes('0\nof 25'))
check('concepts: the dashboard counts it off-path instead', dash1.includes('+1 off-path'))

// A path concept, earned rather than asserted: the CLI Basics quick quiz answered perfectly.
await go('/cli-basics')
for (const option of [
  'pwd',
  'It failed — 2 identifies the kind of error',
  'Lists files, then filters to ones matching ".java"',
]) {
  await page.getByRole('button', { name: option, exact: true }).click()
}
check('concepts: acing the quick quiz records CLI Basics', await completed('CLI Basics'))
await go('/roadmap')
const road1 = await body()
check('concepts: the path count moved to 1', road1.includes('1 of 25 concepts'))
check('concepts: stage 1 now reads 1 of 3', road1.includes('1 OF 3'))
check('concepts: next up advanced past it', road1.includes('Continue — Shell Scripting'))

/* ── Un-marking: completion's inverse (BACKLOG item 22) ───────────────── */
// `completeConcept()` used to be write-once with no inverse, so the only way back from a mis-clicked
// "Mark complete" was the dashboard's Reset progress — which also wipes quiz scores, flashcard
// schedules and milestones. Four things have to hold: the panel offers the inverse, it sticks on a
// page still sitting in its earned state, the counts reverse, and nothing else in the blob moves.

// The plain case: an asserted, off-path concept, completed near the top of this block.
await go('/api-anatomy')
await page.getByRole('button', { name: 'Un-mark complete' }).click()
check('un-mark: the panel offers completion again', await notCompleted('API Anatomy'))
check('un-mark: it says what just happened', (await body()).includes('Un-marked'))
await go('/api-anatomy')
check('un-mark: it survives a reload', await notCompleted('API Anatomy'))
await go('/progress-dashboard')
check('un-mark: the dashboard drops the off-path count', !(await body()).includes('off-path'))

// The case the naive implementation gets wrong: the trace is still on its final frame, so
// <ConceptComplete>'s record-on-earned effect would re-record this on the very next render unless
// un-marking suppresses it for as long as `earned` stays true.
await go('/algorithm-visualizer')
for (let i = 0; i < 9; i++) await page.getByRole('button', { name: 'Step →' }).click()
check('un-mark: the trace records the concept first', await completed('Algorithm Visualizer'))
await page.getByRole('button', { name: 'Un-mark complete' }).click()
check('un-mark: it sticks on a still-earned page', await notCompleted('Algorithm Visualizer'))
check(
  'un-mark: the earned effect does not re-record it',
  !(await completed('Algorithm Visualizer')),
)

// The one page whose earned condition comes from the store rather than session state: every
// milestone ticked stays ticked across a visit, so un-marking here only sticks because the page
// hands the panel a transition instead of that state. Leaving and coming back is the whole test.
await go('/project-build-along')
const marks = page.getByRole('button', { name: /covered in:/ })
const markCount = await marks.count()
for (let i = 0; i < markCount; i++) {
  const m = marks.nth(i)
  if ((await m.getAttribute('aria-pressed')) !== 'true') await m.click()
}
check('un-mark: ticking every milestone records the capstone', await completed('Project Build-Along'))
await page.getByRole('button', { name: 'Un-mark complete' }).click()
check('un-mark: the capstone un-marks', await notCompleted('Project Build-Along'))
await go('/project-build-along')
check('un-mark: a revisit with the list still full does not re-record it',
  await notCompleted('Project Build-Along'))

// A path concept: the count and the "next up" marker both have to rewind.
await go('/cli-basics')
await page.getByRole('button', { name: 'Un-mark complete' }).click()
check('un-mark: a path concept un-marks too', await notCompleted('CLI Basics'))
await go('/roadmap')
const road2 = await body()
check('un-mark: the path count went back to 0', road2.includes('0 of 25 concepts'))
check('un-mark: stage 1 reads 0 of 3 again', road2.includes('0 OF 3'))
check('un-mark: next up rewound to it', road2.includes('Continue — CLI Basics'))

// The checkpoint quiz records git-basics through the same panel rather than a bare
// completeConcept() call, so it un-marks like anything else — and the attempt itself, the thing
// Reset progress would have taken with it, has to still be there afterwards.
await go('/quiz-mode')
for (const letter of ['B', 'B', 'B', 'A', 'A']) {
  await page.getByRole('button', { name: new RegExp(`^${letter}\\s`) }).first().click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: /Next question|See results/ }).click()
}
check('un-mark: acing the checkpoint passes it', (await body()).includes('Checkpoint passed!'))
check('un-mark: the checkpoint records git-basics', await completed('Git Basics'))
await page.getByRole('button', { name: 'Un-mark complete' }).click()
check('un-mark: the checkpoint concept un-marks', await notCompleted('Git Basics'))
await go('/roadmap')
check('un-mark: the path count is back to 0 again', (await body()).includes('0 of 25 concepts'))
await go('/progress-dashboard')
check(
  'un-mark: the quiz attempt itself survived',
  (await body()).includes('Best score, per checkpoint'),
)

/* ── Dashboard: real badges, weakest topic, up next (BACKLOG items 15 & 7) ─ */
// Before this, all four badges were fixed true/false, "weakest topic" was pinned to "Exit codes"
// (not even a real question topic), and "up next" was a fixed template with only the flashcard
// count swapped in live. Every value below now comes from state a step earlier drove for real.
await resetProgress()
await go('/progress-dashboard')
const dashStart = await body()
check('dashboard: no checkpoint yet reads honestly', dashStart.includes('No checkpoints yet'))
check('dashboard: weakest-topic link offers to take one, not review', dashStart.includes('Take one →'))
check('dashboard: checkpoint slot offers to take it', dashStart.includes('Take: Git Basics checkpoint'))
check('dashboard: concept slot recommends the first lesson', dashStart.includes('Continue: CLI Basics'))
check('dashboard: Terminal Tamer starts at 0 of 2 lessons', dashStart.includes('0 of 2 lessons'))
check('dashboard: 7-Day Flame starts at 0 of 7 days', dashStart.includes('0 of 7 days'))
check('dashboard: Bug Hunter names what earns it', dashStart.includes('Debugging Challenge'))
check(
  'dashboard: First Path shows the real (capped) percentage, not 34%',
  dashStart.includes('0%') && !dashStart.includes('34%'),
)

// Solving the one real "case" earns Bug Hunter — a lock reads oddly on something just solved, so
// the icon swaps too, but that's not visible to body(); the subtitle change is what's checked.
await go('/debugging-challenge')
await page.getByRole('button', { name: 'Give me a hint' }).click()
await page.getByRole('button', { name: 'One more hint' }).click()
await page.getByRole('button', { name: /show the fix/ }).click()
check('dashboard-setup: solving it records the concept', await completed('Debugging Challenge'))
await go('/progress-dashboard')
check('dashboard: Bug Hunter earns on solving the case', (await body()).includes('Case closed'))

// A sub-pass attempt (same "always B" run used above): correct on MENTAL MODEL/STAGING/BRANCHES,
// wrong on UNDO/COLLABORATION — a real tie at 0% accuracy, broken to whichever topic the question
// bank asks first.
await go('/quiz-mode')
for (let q = 0; q < 5; q++) {
  await page.getByRole('button', { name: /^B\s/ }).first().click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: /Next question|See results/ }).click()
}
check('dashboard-setup: the sub-pass attempt scores 3/5', (await body()).includes('3/5'))
await go('/progress-dashboard')
const dashSubPass = await body()
check('weakest topic: names Undo, not the fake Exit codes', dashSubPass.includes('Undo'))
check('weakest topic: review link appears once a checkpoint exists', dashSubPass.includes('Review →'))
check(
  'up next: checkpoint offers a retry below the pass mark',
  dashSubPass.includes('Retry: Git Basics checkpoint'),
)

// CLI Basics done: Terminal Tamer's count moves and the concept slot advances past it.
await go('/cli-basics')
for (const option of [
  'pwd',
  'It failed — 2 identifies the kind of error',
  'Lists files, then filters to ones matching ".java"',
]) {
  await page.getByRole('button', { name: option, exact: true }).click()
}
check('dashboard-setup: CLI Basics records', await completed('CLI Basics'))
await go('/progress-dashboard')
const dashCli = await body()
check('dashboard: Terminal Tamer counts the first lesson', dashCli.includes('1 of 2 lessons'))
check('dashboard: concept slot advances to Shell Scripting', dashCli.includes('Continue: Shell Scripting'))

// Shell Scripting done too: both routed Stage-1 lessons complete, so Terminal Tamer earns, and
// the concept slot skips past the un-taught Environment Variables, the checkpoint (its own slot),
// and the un-taught Staging & Commits to land on Branching & Merging.
await go('/shell-scripting')
for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Step →' }).click()
check('dashboard-setup: Shell Scripting records', await completed('Shell Scripting'))
await go('/progress-dashboard')
const dashShell = await body()
check('dashboard: Terminal Tamer earns at 2 of 2 lessons', dashShell.includes('2 of 2 lessons'))
check(
  'dashboard: concept slot skips page-less concepts and the checkpoint',
  dashShell.includes('Continue: Branching & Merging'),
)

// A perfect retake overwrites the topic breakdown: every topic now reads 100%, so there is no
// real "weakest" one left — the tie-break (first topic in question order) is what decides it, not
// an arbitrary object-iteration accident, and the checkpoint slot moves from Retry to Review.
await go('/quiz-mode')
for (const letter of ['B', 'B', 'B', 'A', 'A']) {
  await page.getByRole('button', { name: new RegExp(`^${letter}\\s`) }).first().click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: /Next question|See results/ }).click()
}
check('dashboard-setup: the retake is a perfect 5/5', (await body()).includes('Checkpoint passed!'))
await go('/progress-dashboard')
const dashPerfect = await body()
check('weakest topic: an all-correct attempt still names one topic', dashPerfect.includes('Mental Model'))
check(
  'up next: a passed checkpoint offers Review, not Retry',
  dashPerfect.includes('Review: Git Basics checkpoint'),
)
/* ── Dashboard: per-concept list (BACKLOG items 29 & 24) ──────────────── */
// Before this, `clearConcept()` was only ever wired behind a concept's own <ConceptComplete>
// panel, so un-marking meant finding that page again — and `environment-variables`/
// `staging-commits`, which the path names but no page teaches, could never be marked at all. The
// dashboard's "Your concepts" list fixes both from one place.
await resetProgress()
await go('/progress-dashboard')
const concepts0 = await body()
// Group headings render through the same uppercase-transform PanelLabel style as "BADGES" and "UP
// NEXT" above, so `innerText` — which reflects computed CSS, not the DOM's literal text — reads
// them shouting too.
check(
  'concepts panel: groups the way the Roadmap does',
  concepts0.includes('STAGE 1 · TERMINAL & SHELL') &&
    concepts0.includes('STAGE 2 · VERSION CONTROL') &&
    concepts0.includes('OFF THE PATH'),
)
check(
  'concepts panel: only the two routeless concepts read as unreachable',
  (concepts0.match(/No lesson page — mark it yourself/g) ?? []).length === 2,
)
check(
  'concepts panel: exactly two Mark complete buttons exist',
  (await page.getByRole('button', { name: /^Mark .+ complete$/ }).count()) === 2,
)

// Marking the two routeless path concepts directly — the only way either can ever be earned.
await page.getByRole('button', { name: 'Mark Environment Variables complete' }).click()
check(
  'concepts panel: Environment Variables offers Un-mark once marked',
  await page
    .getByRole('button', { name: 'Un-mark Environment Variables' })
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false),
)
await page.getByRole('button', { name: 'Mark Staging & Commits complete' }).click()
check(
  'concepts panel: Staging & Commits offers Un-mark once marked',
  await page
    .getByRole('button', { name: 'Un-mark Staging & Commits' })
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false),
)
check(
  'concepts panel: both rows show a completion date',
  (await body()).match(/Done \w+ \d{1,2}, \d{4}/g)?.length === 2,
)

await go('/roadmap')
const road3 = await body()
check('concepts panel: stage 1 counts the routeless concept — 1 OF 3', road3.includes('1 OF 3'))
check(
  'concepts panel: stage 2 counts the routeless concept — 1 of 4',
  road3.includes('1 of 4 concepts down in this stage'),
)
check('concepts panel: the path total counts both — 2 of 25 concepts', road3.includes('2 of 25 concepts'))

// The other half of item 29: un-marking a *routed* concept from the dashboard, never visiting its
// page for either the completion or the undo.
await go('/cli-basics')
for (const option of [
  'pwd',
  'It failed — 2 identifies the kind of error',
  'Lists files, then filters to ones matching ".java"',
]) {
  await page.getByRole('button', { name: option, exact: true }).click()
}
check('concepts panel setup: CLI Basics records from its own page', await completed('CLI Basics'))
await go('/progress-dashboard')
check(
  'concepts panel: a routed concept can be un-marked without visiting its page',
  await page
    .getByRole('button', { name: 'Un-mark CLI Basics' })
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false),
)
await page.getByRole('button', { name: 'Un-mark CLI Basics' }).click()
check(
  'concepts panel: CLI Basics offers Go to lesson again',
  await page
    .getByRole('link', { name: 'Go to the CLI Basics lesson' })
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false),
)
await go('/cli-basics')
check(
  "concepts panel: the un-mark reached CLI Basics's own panel too",
  await notCompleted('CLI Basics'),
)

// Clean up the two routeless concepts so this section leaves no state behind.
await go('/progress-dashboard')
await page.getByRole('button', { name: 'Un-mark Environment Variables' }).click()
await page.getByRole('button', { name: 'Un-mark Staging & Commits' }).click()
check(
  'concepts panel: un-marking both restores the two Mark complete buttons',
  await page
    .getByRole('button', { name: /^Mark .+ complete$/ })
    .nth(1)
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false),
)
await go('/roadmap')
check('concepts panel: the path total is back to 0', (await body()).includes('0 of 25 concepts'))
await resetProgress()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} interaction checks passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
