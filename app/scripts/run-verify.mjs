/**
 * Owns the preview server for `npm run verify` instead of assuming one is
 * already up. Starts `vite preview` via the JS API with `strictPort: true`,
 * runs the four suites (routes, responsive, interactions, a11y) against it in
 * sequence, then always tears the server down — success, failure, or a
 * suite that throws.
 *
 * Fixes BACKLOG item 28: a stale `vite preview` left running from an earlier
 * session used to hold port 4173 silently, `npm run preview` would then
 * happily rebind to 4183 and print that, while browser.mjs's BASE (every
 * suite reads it) stayed pointed at 4173 — so a verify run either couldn't
 * connect or, worse, passed against whatever *that* orphaned server was
 * still serving. `strictPort` turns that into a loud failure at the point
 * the mistake is made, and owning the server here means there's no separate
 * `npm run preview &` step left to forget.
 *
 * VERIFY_BASE_URL (see browser.mjs) opts out of all of this — if it's set,
 * something else is serving that URL and this script doesn't touch it.
 */
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { preview } from 'vite'

// spawnSync would block this process's event loop for the child's entire
// run — including the preview server this same process is hosting, so the
// child's browser could never get a response and every suite would hang on
// its first navigation. Async spawn keeps the loop free to service it.
function run(file) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [file], { stdio: 'inherit' })
    child.on('exit', (code) => resolve(code ?? 1))
  })
}

const SUITES = [
  'scripts/verify-routes.mjs',
  'scripts/verify-responsive.mjs',
  'scripts/verify-interactions.mjs',
  'scripts/audit-a11y.mjs',
]

const owningServer = !process.env.VERIFY_BASE_URL

let server
if (owningServer) {
  if (!existsSync('dist')) {
    console.error('No dist/ build found — run `npm run build` before `npm run verify`.')
    process.exit(1)
  }
  try {
    server = await preview({ preview: { port: 4173, strictPort: true } })
  } catch (err) {
    console.error(`\nCouldn't bind the preview server to port 4173 (strictPort): ${err.message}`)
    console.error('Likely a stale `vite preview` from an earlier session still holding that port —')
    console.error('find and kill it (Windows: `netstat -ano | findstr :4173`, then `taskkill /F /PID <pid>`;')
    console.error('macOS/Linux: `lsof -i:4173`, then `kill <pid>`) and retry.')
    process.exit(1)
  }
  server.printUrls()
} else {
  console.log(`VERIFY_BASE_URL is set — assuming a preview server is already up at ${process.env.VERIFY_BASE_URL}`)
}

let exitCode = 0
try {
  for (const suite of SUITES) {
    console.log(`\n> node ${suite}`)
    const code = await run(suite)
    if (code !== 0) {
      exitCode = code
      break
    }
  }
} finally {
  if (server) await server.close()
}

process.exit(exitCode)
