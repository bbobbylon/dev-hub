/**
 * Accessibility audit: text contrast, accessible names, and keyboard focus.
 *
 * The Organic guide is explicit that the accent-to-ground pair is tuned to
 * ~3:1 — fine for icons and large text, not for body copy — so paragraph text
 * in the accent must use a deep ramp step. This checks that held.
 *
 * Run via `npm run audit:a11y` — the fourth leg of `npm run verify`. Unlike
 * audit-content.mjs it drives a real browser, so it needs `npm run preview`
 * up. Depends on browser.mjs (BASE, openPage) and routes.mjs (ROUTES), and
 * loops over every route like verify-routes.mjs/verify-responsive.mjs do.
 *
 * **Baselined.** The prototypes arrived with contrast failures this port
 * deliberately inherited (see app/README.md's accessibility section), so a
 * plain pass/fail could only ever say "fail" — and a check that can never
 * pass is one nobody can gate on, which is exactly how the count drifted from
 * 31 to 39 between passes with nobody noticing. Instead, `a11y-baseline.json`
 * records the accepted set and this script fails only on a *regression*:
 *
 *   - any contrast pair not in the baseline, or
 *   - more total failures than the baseline records, which catches a new page
 *     repeating an already-accepted bad pair, or
 *   - any unnamed interactive control at all (that count is 0 and stays 0).
 *
 * Fixing something is never a failure — it's reported as a nudge to re-record.
 * `npm run audit:a11y -- --update-baseline` rewrites the file; do that as a
 * deliberate act with a reviewable diff, not to make a red run go green.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { BASE, openPage } from './browser.mjs'
import { ROUTES } from './routes.mjs'

const BASELINE_PATH = fileURLToPath(new URL('./a11y-baseline.json', import.meta.url))
const UPDATING = process.argv.includes('--update-baseline')

const { browser, page } = await openPage({ width: 1280, height: 900 })

const IN_PAGE = () => {
  /* ── colour maths (WCAG 2.1 relative luminance) ────────────────────── */
  // Parse a computed rgb()/rgba() string into {r,g,b,a} components.
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const [r, g, b, a = 1] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    return { r, g, b, a }
  }
  // WCAG 2.1 relative luminance of an opaque {r,g,b} colour.
  const lum = ({ r, g, b }) =>
    [r, g, b]
      .map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0)
  // Alpha-composite a (possibly translucent) foreground over an opaque background.
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  })
  // WCAG contrast ratio between two opaque colours (always >= 1).
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (l1 + 0.05) / (l2 + 0.05)
  }

  /** Walk up for the first non-transparent background, compositing as we go. */
  const bgOf = (el) => {
    let acc = null
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor)
      if (!c || c.a === 0) continue
      acc = acc ? over(acc, c) : c
      if (acc.a >= 1) return acc
    }
    return acc ?? { r: 255, g: 255, b: 255, a: 1 }
  }

  // Short "tag.first-class" label for identifying an element in a report line.
  const label = (el) => {
    const cls = String(el.className || '').split(' ')[0]
    return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`
  }

  /* ── 1. text contrast ──────────────────────────────────────────────── */
  const contrast = [] // failing { el, text, ratio, required, size } entries for this page
  for (const el of document.querySelectorAll('*')) {
    // Only elements that directly render text.
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim()
    if (text.length < 2) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) continue
    // Screen-reader-only text is clipped to 1px and never painted, so its
    // contrast is meaningless.
    if (rect.width <= 1 || rect.height <= 1 || cs.clip !== 'auto') continue

    const fg = parse(cs.color)
    if (!fg) continue
    const bg = bgOf(el)
    const r = ratio(over(fg, bg), bg)

    const size = parseFloat(cs.fontSize)
    const weight = +cs.fontWeight || 400
    // WCAG "large text": >=24px, or >=18.66px when bold.
    const large = size >= 24 || (size >= 18.66 && weight >= 700)
    const required = large ? 3 : 4.5

    if (r < required) {
      contrast.push({
        el: label(el),
        text: text.slice(0, 48),
        ratio: +r.toFixed(2),
        required,
        size: +size.toFixed(1),
      })
    }
  }

  /* ── 2. interactive elements without an accessible name ────────────── */
  const nameless = [] // labels of controls this page failed to name
  for (const el of document.querySelectorAll('a, button, input, select, textarea')) {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) continue
    const name = (
      el.getAttribute('aria-label') ||
      el.textContent.trim() ||
      el.getAttribute('title') ||
      el.getAttribute('placeholder') ||
      (el.labels?.length ? el.labels[0].textContent.trim() : '')
    ).trim()
    if (!name) nameless.push(label(el))
  }

  return { contrast, nameless }
}

let contrastTotal = 0 // sum of contrast failures across all routes (duplicates included)
let namelessTotal = 0 // sum of unnamed-control failures across all routes
const seen = new Map() // distinct failing (element, ratio, size) triples → which routes hit them

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'load' })
  await page.waitForSelector('main, h1', { timeout: 10000 }).catch(() => {})
  const { contrast, nameless } = await page.evaluate(IN_PAGE)

  contrastTotal += contrast.length
  namelessTotal += nameless.length

  // Collapse duplicates — the same token pair repeats across many pages.
  for (const c of contrast) {
    const key = `${c.el}|${c.ratio}|${c.size}`
    if (!seen.has(key)) seen.set(key, { ...c, routes: [] })
    seen.get(key).routes.push(route)
  }

  if (contrast.length || nameless.length) {
    console.log(
      `${route} — ${contrast.length} contrast, ${nameless.length} unnamed` +
        nameless.map((n) => `\n     unnamed: ${n}`).join(''),
    )
  }
}

console.log('\n── distinct contrast failures, worst first ──')
for (const c of [...seen.values()].sort((a, b) => a.ratio - b.ratio)) {
  console.log(
    `  ${c.ratio}:1 (needs ${c.required}) ${c.size}px  ${c.el}  "${c.text}"\n     on ${c.routes.length} route(s): ${c.routes.slice(0, 4).join(', ')}${c.routes.length > 4 ? '…' : ''}`,
  )
}
console.log(
  `\n${contrastTotal} contrast failure(s) across ${seen.size} distinct pairs; ${namelessTotal} unnamed control(s)`,
)

await browser.close()

/* ── baseline comparison ───────────────────────────────────────────────── */

/** The shape written to disk: enough to re-identify a pair, plus what it cost. */
const snapshot = () => ({
  note:
    'Accepted contrast failures inherited from the design prototypes. Regenerate with ' +
    '`npm run audit:a11y -- --update-baseline` (with the preview server up) only as a ' +
    'deliberate, reviewed change. See app/README.md, "Accessibility".',
  routes: ROUTES.length,
  contrastTotal,
  pairs: Object.fromEntries(
    [...seen.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, c]) => [key, { el: c.el, text: c.text, ratio: c.ratio, required: c.required, size: c.size }]),
  ),
})

if (UPDATING) {
  writeFileSync(BASELINE_PATH, JSON.stringify(snapshot(), null, 2) + '\n')
  console.log(`\nbaseline rewritten: ${seen.size} pairs, ${contrastTotal} failures, ${ROUTES.length} routes`)
  process.exit(namelessTotal ? 1 : 0)
}

let baseline
try {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
} catch {
  console.log('\nNo a11y-baseline.json — run with --update-baseline to record the accepted set.')
  process.exit(1)
}

const added = [...seen.keys()].filter((k) => !(k in baseline.pairs))
const fixed = Object.keys(baseline.pairs).filter((k) => !seen.has(k))
// The account routes are only in ROUTES when VITE_API_BASE_URL is set (see routes.mjs),
// so a run over a different route set can't be compared on totals — only on new pairs.
const comparable = baseline.routes === ROUTES.length
const grew = comparable && contrastTotal > baseline.contrastTotal

for (const k of added) {
  const c = seen.get(k)
  console.log(`\nNEW  ${c.ratio}:1 (needs ${c.required}) ${c.size}px  ${c.el}  "${c.text}"\n     on: ${c.routes.join(', ')}`)
}
if (fixed.length) {
  console.log(`\nFixed since the baseline (re-record to lock it in): ${fixed.join(', ')}`)
}
if (grew) {
  console.log(
    `\nTotal failures rose ${baseline.contrastTotal} → ${contrastTotal} with no new pair — a page is ` +
      'repeating an already-accepted bad pair. Fix it, or re-record deliberately.',
  )
}
if (!comparable) {
  console.log(
    `\n(Baseline was recorded over ${baseline.routes} routes, this run saw ${ROUTES.length} — ` +
      'comparing new pairs only, not totals.)',
  )
}

const regressed = added.length > 0 || grew || namelessTotal > 0
console.log(
  regressed
    ? '\nFAIL — accessibility regressed against the baseline.'
    : `\nok — no regression (${contrastTotal} accepted failures across ${seen.size} pairs).`,
)
process.exit(regressed ? 1 : 0)
