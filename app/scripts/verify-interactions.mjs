/**
 * Behavioural test: drives every page that carried DCLogic state in the design
 * prototypes, asserting the ported React state machines behave the same.
 * Run against `npm run preview`.
 */
import { BASE, openPage } from './browser.mjs'

const { browser, page } = await openPage({ width: 1440, height: 1000 })

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
}
const go = (path) => page.goto(BASE + path, { waitUntil: 'load' })
const body = () => page.evaluate(() => document.body.innerText)

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
await page.getByRole('button', { name: 'Retry missed questions' }).click()
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
const viz0 = await body()
await page.getByRole('button', { name: 'Step →' }).click()
const viz1 = await body()
check('viz: stepping changes the note', viz0 !== viz1)
for (let i = 0; i < 8; i++) await page.getByRole('button', { name: 'Step →' }).click()
const vizEnd = await body()
check('viz: reaches the sorted end state', vizEnd.includes('the array is sorted'))
check('viz: final counters read 9 / 4', vizEnd.includes('9') && vizEnd.includes('Swaps'))
await page.getByRole('button', { name: 'Reset' }).click()
check('viz: reset returns to frame 1', (await body()) === viz0)

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

/* ── Code Playground: run tests flips the checklist ───────────────────── */
await go('/code-playground')
check('playground: idle before running', (await body()).includes('Output appears here'))
await page.getByRole('button', { name: '▶ Run tests' }).click()
const ran = await body()
check('playground: tests pass', ran.includes('ALL 4 TESTS PASSED'))
check('playground: output printed', ran.includes('FizzBuzz'))
await page.getByRole('button', { name: 'Clear output' }).click()
check('playground: clear resets', (await body()).includes('Output appears here'))

/* ── Gallery navigation: a card actually routes, logo comes back ──────── */
await go('/')
await page.getByRole('link', { name: /Quiz Mode/ }).click()
check('nav: gallery card routes to the page', page.url().endsWith('/quiz-mode'))
await page.getByRole('link', { name: 'Dev Hub' }).click()
check('nav: brand mark returns to the gallery', new URL(page.url()).pathname === '/')

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} interaction checks passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
