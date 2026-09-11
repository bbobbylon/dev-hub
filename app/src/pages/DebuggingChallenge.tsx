/**
 * Route `/debugging-challenge` — "BUG HUNT" detective case ("Case #017") presenting a buggy
 * Python function (`SOURCE`), a fixed number of progressive hints (`HINTS`) revealed one at a
 * time, and a final diff-style reveal of the fix with a takeaway note. All case content is
 * local to this file and self-contained; it does not read or write `useProgress()` and isn't
 * linked from another page's sidebar.
 */
import { useState, type ReactNode } from 'react'
import { TopNav } from '../components/TopNav'
import { CodeListing, syn } from '../components/CodeListing'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const mono = 'ui-monospace, Menlo, monospace'

/** Line 3 is the culprit — it gets tinted once the fix is revealed. */
const SOURCE: { content: ReactNode; suspect?: boolean }[] = [
  {
    content: (
      <>
        <span style={syn.kw}>def</span> <span style={syn.fn}>process_year</span>(invoices):
      </>
    ),
  },
  {
    content: <span style={syn.cm}>{'  # invoices[1] = January … invoices[12] = December'}</span>,
  },
  {
    suspect: true,
    content: (
      <>
        {'  '}
        <span style={syn.kw}>for</span> month <span style={syn.kw}>in</span>{' '}
        <span style={syn.fn}>range</span>(1, 12):
      </>
    ),
  },
  { content: <>{'    invoice = invoices[month]'}</> },
  {
    content: (
      <>
        {'    '}
        <span style={syn.fn}>charge</span>(invoice)
      </>
    ),
  },
  {
    content: (
      <>
        {'    '}
        <span style={syn.fn}>mark_processed</span>(invoice)
      </>
    ),
  },
]

// Progressive hints revealed one per click of "Give me a hint" / "One more hint".
const HINTS: ReactNode[] = [
  <>
    The bug is not in what the loop <em>does</em> — it's in how many times it does it. Count the
    months it actually visits.
  </>,
  <>
    <code style={{ background: 'var(--color-bg)', padding: '1px 6px', borderRadius: 5 }}>
      range(1, 12)
    </code>{' '}
    yields 1, 2, 3 … and stops <em>before</em> the second number. What's the last month it produces?
  </>,
]

/** The Debugging Challenge page — buggy code, progressive hints, then a diff reveal of the fix. */
export default function DebuggingChallenge() {
  useDocumentTitle('Debugging Challenge')

  const [hints, setHints] = useState(0) // number of HINTS revealed so far
  const [solved, setSolved] = useState(false) // whether the fix has been revealed

  return (
    <div className="page">
      <TopNav
        note="Page type · Bug hunt / detective case"
        right={<Tag tone="accent">CASE #017</Tag>}
      />

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          PYTHON · OFF-BY-ONE
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          The case of the missing invoice
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            maxWidth: 620,
            margin: '0 0 28px',
          }}
        >
          Accounting says the December invoice never gets processed. The function below is supposed
          to handle all 12 months — read it like a detective, then reveal hints only when you're
          stuck.
        </p>

        {/* the listing */}
        <div style={{ marginBottom: 22 }}>
          <CodeListing
            filename="process_invoices.py"
            lines={SOURCE.map((l) => ({ content: l.content, highlight: l.suspect && solved }))}
            badge={
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'color-mix(in srgb, var(--color-accent) 25%, transparent)',
                  color: 'var(--color-accent-200)',
                }}
              >
                1 bug hiding below
              </span>
            }
          />
        </div>

        {/* progressive hints */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
          {HINTS.slice(0, hints).map((hint, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 14,
                background: 'var(--color-neutral-100)',
                borderRadius: 16,
                padding: '16px 20px',
                animation: 'pop 0.25s ease',
              }}
            >
              <span
                style={{
                  flex: 'none',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-accent)',
                  fontSize: 15,
                }}
              >
                Hint {i + 1}
              </span>
              <span
                style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-neutral-800)' }}
              >
                {hint}
              </span>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10 }}>
            {hints < HINTS.length && !solved ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setHints((h) => h + 1)}
              >
                {hints === 0 ? 'Give me a hint' : 'One more hint'}
              </button>
            ) : null}
            {!solved ? (
              <button type="button" className="btn btn-primary" onClick={() => setSolved(true)}>
                I found it — show the fix
              </button>
            ) : null}
          </div>
        </div>

        {/* the reveal */}
        {solved ? (
          <div style={{ animation: 'pop 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--color-accent-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="check" size={15} color="var(--color-bg)" />
              </span>
              <h2 style={{ fontSize: 24, margin: 0 }}>Case closed: a classic off-by-one</h2>
            </div>

            <div
              style={{
                background: 'var(--color-neutral-900)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                fontFamily: mono,
                fontSize: 13,
                lineHeight: 1.9,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: 'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                  borderRadius: 8,
                  padding: '2px 12px',
                  color: 'var(--color-accent-200)',
                  whiteSpace: 'pre',
                }}
              >
                - for month in range(1, 12):  # stops at 11 — November!
              </div>
              <div
                style={{
                  background: 'color-mix(in srgb, var(--color-accent-2) 25%, transparent)',
                  borderRadius: 8,
                  padding: '2px 12px',
                  color: 'var(--color-accent-2-200)',
                  whiteSpace: 'pre',
                }}
              >
                + for month in range(1, 13):  # 1 through 12 inclusive
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-accent-2-100)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 22px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--color-accent-2-700)',
                  marginBottom: 6,
                }}
              >
                The takeaway
              </div>
              <div
                style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--color-neutral-800)' }}
              >
                <code style={{ background: 'var(--color-bg)', padding: '1px 6px', borderRadius: 5 }}>
                  range(a, b)
                </code>{' '}
                is half-open: it includes{' '}
                <code style={{ background: 'var(--color-bg)', padding: '1px 6px', borderRadius: 5 }}>
                  a
                </code>
                , excludes{' '}
                <code style={{ background: 'var(--color-bg)', padding: '1px 6px', borderRadius: 5 }}>
                  b
                </code>
                . Off-by-ones cluster at boundaries — whenever a bug report says "the last one is
                missing," check the loop bounds first.
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
