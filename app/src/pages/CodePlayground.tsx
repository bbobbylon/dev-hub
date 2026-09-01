import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { CodeListing, syn } from '../components/CodeListing'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const mono = 'ui-monospace, Menlo, monospace'

const SOLUTION = [
  {
    content: (
      <>
        <span style={syn.kw}>for</span> i <span style={syn.kw}>in</span>{' '}
        <span style={syn.fn}>range</span>(1, 16):
      </>
    ),
  },
  {
    content: (
      <>
        {'  '}
        <span style={syn.kw}>if</span> i % 15 == 0:
      </>
    ),
  },
  {
    content: (
      <>
        {'    '}
        <span style={syn.fn}>print</span>(<span style={syn.str}>"FizzBuzz"</span>)
      </>
    ),
  },
  {
    content: (
      <>
        {'  '}
        <span style={syn.kw}>elif</span> i % 3 == 0:
      </>
    ),
  },
  {
    content: (
      <>
        {'    '}
        <span style={syn.fn}>print</span>(<span style={syn.str}>"Fizz"</span>)
      </>
    ),
  },
  {
    content: (
      <>
        {'  '}
        <span style={syn.kw}>elif</span> i % 5 == 0:
      </>
    ),
  },
  {
    content: (
      <>
        {'    '}
        <span style={syn.fn}>print</span>(<span style={syn.str}>"Buzz"</span>)
      </>
    ),
  },
  {
    content: (
      <>
        {'  '}
        <span style={syn.kw}>else</span>:
      </>
    ),
  },
  {
    content: (
      <>
        {'    '}
        <span style={syn.fn}>print</span>(i)
      </>
    ),
  },
]

const TESTS = [
  'Prints 15 lines',
  '3, 6, 9, 12 → Fizz',
  '5, 10 → Buzz',
  '15 → FizzBuzz',
]

const EXPECTED_OUTPUT =
  '1  2  Fizz  4  Buzz  Fizz  7  8  Fizz  Buzz  11  Fizz  13  14  FizzBuzz'

function BriefCode({ children }: { children: string }) {
  return (
    <code style={{ background: 'var(--color-neutral-100)', padding: '1px 6px', borderRadius: 6 }}>
      {children}
    </code>
  )
}

export default function CodePlayground() {
  useDocumentTitle('Code Playground')
  const [passed, setPassed] = useState(false)

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
            PYTHON · LOOPS
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
            {TESTS.map((t) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  fontSize: 13.5,
                  color: passed ? 'var(--color-accent-2-700)' : 'var(--color-neutral-500)',
                }}
              >
                <Icon name="check" size={14} />
                {t}
              </div>
            ))}
          </div>
        </aside>

        <section
          style={{ display: 'flex', flexDirection: 'column', padding: '36px 40px', gap: 16 }}
        >
          <CodeListing
            filename="solution.py"
            lines={SOLUTION}
            note="editable in the real app"
            gutterWidth={44}
            fontSize={13.5}
            lineHeight={1.8}
          />

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={() => setPassed(true)}>
              ▶ Run tests
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setPassed(false)}>
              Clear output
            </button>
            {passed ? (
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
            {passed ? (
              <div style={{ animation: 'pop 0.25s ease' }}>
                <div style={{ color: 'var(--color-neutral-400)' }}>$ python solution.py</div>
                <div style={{ color: 'var(--color-neutral-100)', whiteSpace: 'pre-wrap' }}>
                  {EXPECTED_OUTPUT}
                </div>
                <div style={{ color: 'var(--color-accent-2-300)', marginTop: 8 }}>
                  ✓ prints 15 lines&nbsp;&nbsp;✓ Fizz on multiples of 3&nbsp;&nbsp;✓ Buzz on
                  multiples of 5&nbsp;&nbsp;✓ FizzBuzz on 15
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-neutral-500)' }}>
                Output appears here. Run the tests when you think the solution is right.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
