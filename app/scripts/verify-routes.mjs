/**
 * Smoke test: every route renders real content, with no console errors and no
 * horizontal overflow. Run against `npm run preview`.
 */
import { BASE, openPage } from './browser.mjs'
import { ROUTES } from './routes.mjs'


const { browser, page } = await openPage()

let failures = 0
for (const route of ROUTES) {
  const errors = []
  const onError = (e) => errors.push(String(e))
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
  const info = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim() ?? null,
    textLen: document.body.innerText.length,
    hOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }))

  page.off('pageerror', onError)
  page.off('console', onConsole)

  const problems = []
  if (errors.length) problems.push(`console: ${errors.join(' | ').slice(0, 200)}`)
  if (info.textLen < 200) problems.push(`thin render (${info.textLen} chars)`)
  if (!info.h1) problems.push('no <h1>')
  if (info.hOverflow) problems.push('horizontal overflow')

  if (problems.length) { failures++; console.log(`FAIL ${route}\n     ${problems.join('\n     ')}`) }
  else console.log(`ok   ${route.padEnd(26)} "${info.h1.slice(0, 46)}"  [${info.title}]`)
}

console.log(`\n${ROUTES.length - failures}/${ROUTES.length} routes clean`)
await browser.close()
process.exit(failures ? 1 : 0)
