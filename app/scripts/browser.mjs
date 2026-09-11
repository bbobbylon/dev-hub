/**
 * Shared Playwright bootstrap for this directory's verification and audit
 * scripts. Not an npm script itself — it has no `main` behaviour, only
 * exports consumed by the scripts that drive a browser:
 * verify-routes.mjs, verify-responsive.mjs, verify-interactions.mjs,
 * audit-a11y.mjs and snapshot.mjs (audit-content.mjs doesn't use a browser at
 * all — it diffs static source text). Exports `BASE`, the preview server URL
 * every route is resolved against, and `openPage()`, which every consumer
 * calls to get a `{ browser, page }` pair aimed at that server.
 */
import { existsSync, readdirSync } from 'node:fs'
import { chromium } from 'playwright'

// `npm run build` (no BASE_PATH override) always emits the GitHub Pages
// sub-path build — see vite.config.ts's default — and `npm run preview` now
// serves that same sub-path, so this must match it or every route 404s.
// Override with VERIFY_BASE_URL if you built with a different BASE_PATH.
export const BASE = process.env.VERIFY_BASE_URL ?? 'http://localhost:4173/dev-hub'

/**
 * Prefer the Chromium this environment ships (PLAYWRIGHT_BROWSERS_PATH) over
 * one Playwright would download, and tolerate its revision changing.
 */
function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH
  if (!root || !existsSync(root)) return undefined
  // Highest-numbered chromium-<revision> directory under the browsers root.
  const dir = readdirSync(root)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort()
    .pop()
  if (!dir) return undefined
  const exe = `${root}/${dir}/chrome-linux/chrome` // resolved binary path
  return existsSync(exe) ? exe : undefined
}

/**
 * A page pointed at the preview server, with external requests blocked — the
 * page's own webfonts are off-network here and would otherwise stall `load`.
 */
export async function openPage(viewport = { width: 1280, height: 900 }) {
  const browser = await chromium.launch({ executablePath: findChromium() })
  const page = await browser.newPage({ viewport })
  await page.route('**/*', (route) =>
    route.request().url().startsWith(BASE) ? route.continue() : route.abort(),
  )
  return { browser, page }
}
