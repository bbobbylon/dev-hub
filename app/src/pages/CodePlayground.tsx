/**
 * Code Playground — route `/code-playground`, a code-challenge page (FizzBuzz, challenge 4 of
 * 12): a brief, a read-only `CodeListing` showing the solution, and a test checklist. "Run
 * tests" really runs `SOURCE_JS` — the exact source the listing displays — in a Web Worker
 * (`lib/sandboxRun.ts`, its own realm, no DOM access), then grades each checklist item off the
 * `console.log` output that run actually produced. The listing itself is still read-only (the
 * "editable in the real app" note is honest about that), but the pass/fail state is not
 * scripted: a broken solution would genuinely fail here.
 *
 * The prototype's exercise was written as Python pseudocode; a browser can't execute that
 * without a large WASM runtime (Pyodide), which is disproportionate for one exercise, so this
 * pass translated the same FizzBuzz logic to JavaScript — the language a Worker can actually run.
 */
import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { CodeListing, syn } from '../components/CodeListing'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { ConceptComplete } from '../components/ConceptComplete'
import { runInSandbox, type SandboxResult } from '../lib/sandboxRun'

const mono = 'ui-monospace, Menlo, monospace'

// The real source executed by "Run tests" — kept as plain text (rather than only the
// syntax-highlighted JSX below) because it has to be exactly what runs, not just what's shown.
const SOURCE_JS = `for (let i = 1; i <= 15; i++) {
  if (i % 15 === 0) console.log("FizzBuzz")
  else if (i % 3 === 0) console.log("Fizz")
  else if (i % 5 === 0) console.log("Buzz")
  else console.log(i)
}`

// Syntax-highlighted rendering of the exact lines in SOURCE_JS, for the read-only listing.
const SOLUTION = [
  {
    content: (
      <>
        <span style={syn.kw}>for</span> (<span style={syn.kw}>let</span> i = 1; i {'<='} 15;
        i++) {'{'}
      </>
    ),
  },
  {
    content: (
      <>
        {'  '}
        <span style={syn.kw}>if</span> (i % 15 === 0) <span style={syn.fn}>console.log</span>(
        <span style={syn.str}>"FizzBuzz"</span>)
      </>
    ),
  },
  {
    content: (
      <>
        {'  '}
        <span style={syn.kw}>else if</span> (i % 3 === 0) <span style={syn.fn}>console.log</span>
        (<span style={syn.str}>"Fizz"</span>)
      </>
    ),
  },
  {
    content: (
      <>
        {'  '}
        <span style={syn.kw}>else if</span> (i % 5 === 0) <span style={syn.fn}>console.log</span>
        (<span style={syn.str}>"Buzz"</span>)
      </>
    ),
  },
  {
    content: (
      <>
        {'  '}
        <span style={syn.kw}>else</span> <span style={syn.fn}>console.log</span>(i)
      </>
    ),
  },
  { content: <>{'}'}</> },
]

// Test-checklist labels shown in the sidebar; each is graded independently off real output — see checksFor().
const TESTS = ['Prints 15 lines', '3, 6, 9, 12 → Fizz', '5, 10 → Buzz', '15 → FizzBuzz']

/** One boolean per TESTS entry, computed from the sandbox's actual captured output lines. */
function checksFor(lines: string[]): boolean[] {
  return [
    lines.length === 15,
    [2, 5, 8, 11].every((i) => lines[i] === 'Fizz'),
    [4, 9].every((i) => lines[i] === 'Buzz'),
    lines[14] === 'FizzBuzz',
  ]
}

/** Inline monospace snippet used in the challenge brief. */
function BriefCode({ children }: { children: string }) {
  return (
    <code style={{ background: 'var(--color-neutral-100)', padding: '1px 6px', borderRadius: 6 }}>
      {children}
    </code>
  )
}

/** Code-challenge page: a brief, a solution listing, and a real sandboxed run-tests loop. */
export default function CodePlayground() {
  useDocumentTitle('Code Playground')
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [result, setResult] = useState<SandboxResult | null>(null)

  const checks = result?.ok ? checksFor(result.lines) : TESTS.map(() => false)
  const allPassed = result?.ok === true && checks.every(Boolean)

  const run = async () => {
    setStatus('running')
    setResult(await runInSandbox(SOURCE_JS))
    setStatus('done')
  }

  const clear = () => {
    setStatus('idle')
    setResult(null)
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
      <TopNav
        note="Page type · Code playground / challenge"
        right={<Tag tone="neutral">CHALLENGE 4 OF 12</Tag>}
      />

      <div
        className="playground-layout"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          maxWidth: 1240,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <aside
          style={{ borderRight: '1px solid var(--color-neutral-300)', padding: '36px 28px' }}
        >
          <Tag tone="accent" style={{ marginBottom: 12, display: 'inline-flex' }}>
            JAVASCRIPT · LOOPS
          </Tag>
          <h1 style={{ fontSize: 30, margin: '10px 0 12px', color: 'var(--color-accent-700)' }}>
            FizzBuzz
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.65,
              color: 'var(--color-neutral-800)',
              margin: '0 0 18px',
            }}
          >
            Print numbers 1–15. For multiples of 3 print <BriefCode>Fizz</BriefCode>, multiples of 5
            print <BriefCode>Buzz</BriefCode>, multiples of both print{' '}
            <BriefCode>FizzBuzz</BriefCode>.
          </p>

          <div
            style={{
              background: 'var(--color-accent-100)',
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--color-accent-700)',
                marginBottom: 5,
              }}
            >
              Why the order matters
            </div>
            <div
              style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}
            >
              Check "both" first. If you test{' '}
              <code style={{ background: 'var(--color-bg)', padding: '1px 5px', borderRadius: 5 }}>
                % 3
              </code>{' '}
              before{' '}
              <code style={{ background: 'var(--color-bg)', padding: '1px 5px', borderRadius: 5 }}>
                % 15
              </code>
              , the number 15 prints "Fizz" and never reaches your FizzBuzz branch.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TESTS.map((t, i) => {
              const on = status === 'done' && checks[i]
              return (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    fontSize: 13.5,
                    color: on ? 'var(--color-accent-2-700)' : 'var(--color-neutral-700)',
                  }}
                >
                  <Icon name="check" size={14} />
                  {t}
                </div>
              )
            })}
          </div>
        </aside>

        <section
          style={{ display: 'flex', flexDirection: 'column', padding: '36px 40px', gap: 16 }}
        >
          <CodeListing
            filename="solution.js"
            lines={SOLUTION}
            note="editable in the real app"
            gutterWidth={44}
            fontSize={13.5}
            lineHeight={1.8}
          />

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={run}
              disabled={status === 'running'}
            >
              {status === 'running' ? 'Running…' : '▶ Run tests'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={clear}>
              Clear output
            </button>
            {allPassed ? (
              <Tag tone="accent-2" style={{ animation: 'pop 0.3s ease' }}>
                ALL {TESTS.length} TESTS PASSED
              </Tag>
            ) : null}
          </div>

          <div
            aria-live="polite"
            style={{
              background: 'var(--color-neutral-900)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              minHeight: 120,
              fontFamily: mono,
              fontSize: 12.5,
              lineHeight: 1.7,
            }}
          >
            {status === 'done' && result ? (
              <div style={{ animation: 'pop 0.25s ease' }}>
                <div style={{ color: 'var(--color-neutral-400)' }}>$ node solution.js</div>
                {result.ok ? (
                  <>
                    <div style={{ color: 'var(--color-neutral-100)', whiteSpace: 'pre-wrap' }}>
                      {result.lines.join('  ')}
                    </div>
                    <div
                      style={{
                        color: allPassed ? 'var(--color-accent-2-300)' : 'var(--color-accent-300)',
                        marginTop: 8,
                      }}
                    >
                      {TESTS.map((t, i) => `${checks[i] ? '✓' : '✗'} ${t}`).join('  ')}
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--color-accent-300)' }}>
                    {result.error ?? 'The sandbox reported an error.'}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--color-neutral-500)' }}>
                {status === 'running'
                  ? 'Running in a sandboxed worker…'
                  : 'Output appears here. Run the tests when you think the solution is right.'}
              </div>
            )}
          </div>
          <ConceptComplete
            slug="code-playground"
            earned={allPassed}
            hint="Run the tests green and this records itself."
          />

        </section>
      </div>
    </div>
  )
}
