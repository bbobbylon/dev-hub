import { existsSync, readdirSync } from 'node:fs'
import { chromium } from 'playwright'

export const BASE = process.env.VERIFY_BASE_URL ?? 'http://localhost:4173'

/**
 * Prefer the Chromium this environment ships (PLAYWRIGHT_BROWSERS_PATH) over
 * one Playwright would download, and tolerate its revision changing.
 */
function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH
  if (!root || !existsSync(root)) return undefined
  const dir = readdirSync(root)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort()
    .pop()
  if (!dir) return undefined
  const exe = `${root}/${dir}/chrome-linux/chrome`
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
