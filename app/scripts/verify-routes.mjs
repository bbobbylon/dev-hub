/**
 * Smoke test: every route renders real content, with no console errors and no
 * horizontal overflow. Run via `npm run verify:routes` (also the first leg of
 * `npm run verify`, alongside verify-responsive.mjs and
 * verify-interactions.mjs). Run against `npm run preview`. Depends on
 * browser.mjs (BASE, openPage) and routes.mjs (ROUTES).
 */
import { BASE, openPage } from './browser.mjs'
import { ROUTES } from './routes.mjs'

// Floor for "did this route actually render?", in characters of body text. Every
// lesson page clears it several times over; a blank or crashed one is ~30 (the
// nav alone). The two account forms are the honest exception — a heading, two
// fields and a button is all they are, ~144 and ~177 chars, so they get a lower
// floor that a broken render still can't reach rather than a blanket exemption.
const MIN_TEXT = 200
const SPARSE = { '/sign-in': 100, '/sign-up': 100 }
const minTextFor = (route) => SPARSE[route] ?? MIN_TEXT

const { browser, page } = await openPage()

let failures = 0 // count of routes that failed at least one check
for (const route of ROUTES) {
  const errors = [] // console/page errors collected for the current route
  const onError = (e) => errors.push(String(e)) // uncaught page exception handler
  // The blocked Google Fonts request above logs ERR_FAILED; that's this
  // harness's doing, not the page's.
  const onConsole = (m) => {
    if (m.type() === 'error' && !m.text().includes('net::ERR_FAILED')) errors.push(m.text())
  }
  page.on('pageerror', onError)
  page.on('console', onConsole)

  // 'load', not 'networkidle' — the Google Fonts request goes through the
  // agent proxy and may never settle, which would hang the run.
  await page.goto(BASE + route, { waitUntil: 'load' })
  await page.waitForSelector('main, h1', { timeout: 10000 }).catch(() => {})
  // Per-route render facts collected in-page, checked against below.
  const info = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim() ?? null,
    textLen: document.body.innerText.length,
    hOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }))

  page.off('pageerror', onError)
  page.off('console', onConsole)

  const problems = [] // human-readable failure descriptions for this route
  if (errors.length) problems.push(`console: ${errors.join(' | ').slice(0, 200)}`)
  if (info.textLen < minTextFor(route)) problems.push(`thin render (${info.textLen} chars)`)
  if (!info.h1) problems.push('no <h1>')
  if (info.hOverflow) problems.push('horizontal overflow')

  if (problems.length) { failures++; console.log(`FAIL ${route}\n     ${problems.join('\n     ')}`) }
  else console.log(`ok   ${route.padEnd(26)} "${info.h1.slice(0, 46)}"  [${info.title}]`)
}

console.log(`\n${ROUTES.length - failures}/${ROUTES.length} routes clean`)
await browser.close()
process.exit(failures ? 1 : 0)
