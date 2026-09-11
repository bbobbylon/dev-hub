/**
 * Responsive check: no route may scroll horizontally at any supported width,
 * and no element may spill past the viewport. Run via
 * `npm run verify:responsive` (the second leg of `npm run verify`, alongside
 * verify-routes.mjs and verify-interactions.mjs). Run against
 * `npm run preview`. Depends on browser.mjs (BASE, openPage) and routes.mjs
 * (ROUTES).
 *
 * The breakpoints in app.css were written from reasoning about each layout;
 * this is what actually holds them honest.
 */
import { BASE, openPage } from './browser.mjs'
import { ROUTES } from './routes.mjs'

// Viewport widths checked per route — phone/tablet/laptop, matching the
// breakpoints app.css was designed against.
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 900 },
]

/** Slack for sub-pixel rounding in layout maths. */
const TOLERANCE = 1

const { browser, page } = await openPage()
let failures = 0 // count of route/viewport combinations that overflowed

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height })
  const bad = [] // failure descriptions collected for this viewport

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'load' })
    await page.waitForSelector('main, h1', { timeout: 10000 }).catch(() => {})

    const result = await page.evaluate((tol) => {
      const docWidth = document.documentElement.scrollWidth // full document width
      const seen = window.innerWidth + tol // widest right edge that still counts as "in view"
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
      // Top 3 elements poking furthest past the viewport's right edge.
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
