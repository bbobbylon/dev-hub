/**
 * Full-page screenshots of every route, for proving a refactor changed nothing
 * visually: snapshot before, refactor, snapshot after, compare hashes.
 *
 *   node scripts/snapshot.mjs .snapshots/before
 *   node scripts/snapshot.mjs .snapshots/after
 *   node scripts/snapshot.mjs --compare .snapshots/before .snapshots/after
 *
 * Not part of `npm run verify` or an npm script itself — invoked directly
 * with `node`, as above. Capture modes need `npm run preview` up; --compare
 * only reads previously captured PNGs, so it doesn't. Depends on browser.mjs
 * (BASE, openPage) and routes.mjs (ROUTES).
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { BASE, openPage } from './browser.mjs'
import { ROUTES } from './routes.mjs'

/** Short content hash of a file, used to compare screenshots byte-for-byte. */
const hash = (f) => createHash('sha256').update(readFileSync(f)).digest('hex').slice(0, 16)

if (process.argv[2] === '--compare') {
  // --compare mode: diff two previously captured snapshot directories by hash.
  const [, , , a, b] = process.argv // the two snapshot directories to compare
  const names = readdirSync(a).filter((f) => f.endsWith('.png')) // screenshot filenames to diff
  let differing = 0 // count of screenshots whose hashes don't match
  for (const name of names) {
    const same = hash(`${a}/${name}`) === hash(`${b}/${name}`)
    if (!same) differing++
    console.log(`${same ? 'same' : 'DIFF'} ${name}`)
  }
  console.log(`\n${names.length - differing}/${names.length} pages pixel-identical`)
  process.exit(0)
}

// Capture mode: screenshot every route into the given output directory.
const outDir = process.argv[2]
if (!outDir) throw new Error('usage: snapshot.mjs <out-dir> | --compare <a> <b>')
mkdirSync(outDir, { recursive: true })

const { browser, page } = await openPage()
for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'load' })
  await page.waitForSelector('main, h1', { timeout: 10000 }).catch(() => {})
  // Freeze the drifting-blob and cursor animations so frames are comparable.
  await page.addStyleTag({
    content: '*,*::before,*::after{animation:none!important;transition:none!important}',
  })
  const name = (route === '/' ? 'index' : route.slice(1)) + '.png' // output filename for this route
  await page.screenshot({ path: `${outDir}/${name}`, fullPage: true })
  console.log(`captured ${name}`)
}
await browser.close()
