/**
 * Runs a JavaScript source string in a real Web Worker — its own realm, no DOM, no access to
 * this page's state — and captures `console.log` calls as output lines. Used by
 * `CodePlayground` so "Run tests" grades what the code actually produces instead of a
 * hardcoded pass. A run that throws, or never finishes, resolves as a failure rather than
 * hanging the page.
 */
export interface SandboxResult {
  ok: boolean
  lines: string[]
  error?: string
}

// Runs inside the worker: shadows `console` with something that records rather than logs to
// the (nonexistent, in a worker) devtools console, then executes the posted source against it.
const WORKER_BODY = `
self.onmessage = (e) => {
  const lines = []
  const log = (...args) => lines.push(args.map(String).join(' '))
  try {
    const run = new Function('console', e.data)
    run({ log })
    self.postMessage({ ok: true, lines })
  } catch (err) {
    self.postMessage({ ok: false, lines, error: err instanceof Error ? err.message : String(err) })
  }
}
`

export function runInSandbox(source: string, timeoutMs = 2000): Promise<SandboxResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER_BODY], { type: 'application/javascript' }))
    const worker = new Worker(url)
    let settled = false

    const finish = (result: SandboxResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      worker.terminate()
      URL.revokeObjectURL(url)
      resolve(result)
    }

    const timer = setTimeout(
      () => finish({ ok: false, lines: [], error: `Timed out after ${timeoutMs}ms — infinite loop?` }),
      timeoutMs,
    )

    worker.onmessage = (e) => finish(e.data as SandboxResult)
    worker.onerror = (e) => finish({ ok: false, lines: [], error: e.message })
    worker.postMessage(source)
  })
}
