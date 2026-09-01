/**
 * Responsive check: no route may scroll horizontally at any supported width,
 * and no element may spill past the viewport. Run against `npm run preview`.
 *
 * The breakpoints in app.css were written from reasoning about each layout;
 * this is what actually holds them honest.
 */
import { BASE, openPage } from './browser.mjs'
import { ROUTES } from './routes.mjs'

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 900 },
]

/** Slack for sub-pixel rounding in layout maths. */
const TOLERANCE = 1

const { browser, page } = await openPage()
let failures = 0

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height })
  const bad = []

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'load' })
    await page.waitForSelector('main, h1', { timeout: 10000 }).catch(() => {})

    const result = await page.evaluate((tol) => {
      const docWidth = document.documentElement.scrollWidth
      const seen = window.innerWidth + tol
      if (docWidth <= seen) return null
      // Name the widest offenders so a failure points at real markup. Skip
      // anything inside a deliberately scrollable container.
      const scrollable = (el) => {
        for (let n = el.parentElement; n; n = n.parentElement) {
          const ov = getComputedStyle(n).overflowX
          if (ov === 'auto' || ov === 'scroll') return true
        }
        return false
      }
      const culprits = [...document.querySelectorAll('*')]
        .filter((el) => !scrollable(el))
        .map((el) => ({ el, right: el.getBoundingClientRect().right }))
        .filter((x) => x.right > seen)
        .sort((a, b) => b.right - a.right)
        .slice(0, 3)
        .map(
          (x) =>
            `${x.el.tagName.toLowerCase()}${x.el.className ? '.' + String(x.el.className).split(' ')[0] : ''} → ${Math.round(x.right)}px`,
        )
      return { docWidth, culprits }
    }, TOLERANCE)

    if (result) {
      failures++
      bad.push(`  ${route} — doc ${result.docWidth}px vs ${vp.width}px\n     ${result.culprits.join('\n     ')}`)
    }
  }

  console.log(
    bad.length
      ? `FAIL ${vp.name} (${vp.width}px) — ${bad.length}/${ROUTES.length} routes overflow:\n${bad.join('\n')}`
      : `ok   ${vp.name} (${vp.width}px) — all ${ROUTES.length} routes fit`,
  )
}

console.log(`\n${failures === 0 ? 'no overflow at any width' : `${failures} route/viewport combinations overflow`}`)
await browser.close()
process.exit(failures ? 1 : 0)
