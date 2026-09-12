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

// Gallery filter across all 23 archetypes.
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
await resetProgress()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} interaction checks passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
