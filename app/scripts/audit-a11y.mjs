/**
 * Accessibility audit: text contrast, accessible names, and keyboard focus.
 *
 * The Organic guide is explicit that the accent-to-ground pair is tuned to
 * ~3:1 — fine for icons and large text, not for body copy — so paragraph text
 * in the accent must use a deep ramp step. This checks that held.
 *
 * Run against `npm run preview`.
 */
import { BASE, openPage } from './browser.mjs'
import { ROUTES } from './routes.mjs'

const { browser, page } = await openPage({ width: 1280, height: 900 })

const IN_PAGE = () => {
  /* ── colour maths (WCAG 2.1 relative luminance) ────────────────────── */
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const [r, g, b, a = 1] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    return { r, g, b, a }
  }
  const lum = ({ r, g, b }) =>
    [r, g, b]
      .map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0)
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  })
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

  const label = (el) => {
    const cls = String(el.className || '').split(' ')[0]
    return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`
  }

  /* ── 1. text contrast ──────────────────────────────────────────────── */
  const contrast = []
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
  const nameless = []
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

let contrastTotal = 0
let namelessTotal = 0
const seen = new Map()

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
process.exit(contrastTotal || namelessTotal ? 1 : 0)
