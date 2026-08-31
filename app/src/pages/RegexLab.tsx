import { useMemo, useState } from 'react'
import { TopNav } from '../components/TopNav'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/Page'

const mono = 'ui-monospace, Menlo, monospace'

/** Each pattern is a real RegExp — the highlighting below is actual matching. */
const PATTERNS = [
  {
    label: '\\d+',
    regex: /\d+/g,
    explanation:
      '\\d means "any digit," + means "one or more in a row." Together: every unbroken run of digits — IDs, ports, timestamps, amounts.',
  },
  {
    label: 'ERROR|WARN',
    regex: /ERROR|WARN/g,
    explanation:
      'The pipe | is "or." The engine tries ERROR first, then WARN, at every position. Great for log-level filtering.',
  },
  {
    label: '\\w+@\\w+\\.dev',
    regex: /\w+@\w+\.dev/g,
    explanation:
      '\\w+ grabs the name, @ is literal, \\w+ the domain, \\. is a real dot (escaped — a bare . means "anything"), then the literal dev.',
  },
]

const LOG_LINES = [
  '10:42:07 WARN  user ada@shop.dev retried 3 times',
  '10:42:11 ERROR payment 8127 declined for bob@pay.dev',
  '10:43:02 INFO  heartbeat ok on port 8080',
  '10:44:56 ERROR timeout after 3000 ms',
]

const DECODER = [
  { symbol: '\\d', meaning: 'any digit 0–9' },
  { symbol: '\\w', meaning: 'letter, digit, or _' },
  { symbol: '+', meaning: 'one or more of it' },
  { symbol: '*', meaning: 'zero or more' },
  { symbol: '[abc]', meaning: 'one of a, b, or c' },
  { symbol: '^ $', meaning: 'start · end of line' },
  { symbol: '.', meaning: 'any single character' },
  { symbol: '( )', meaning: 'capture a group' },
]

interface Segment {
  text: string
  match: boolean
}

/** Split a line into alternating plain / matched segments. */
function segment(text: string, regex: RegExp): Segment[] {
  const parts: Segment[] = []
  let last = 0
  // A fresh RegExp per call keeps the global lastIndex from leaking between lines.
  const rx = new RegExp(regex.source, regex.flags)
  for (const m of text.matchAll(rx)) {
    const at = m.index ?? 0
    if (at > last) parts.push({ text: text.slice(last, at), match: false })
    parts.push({ text: m[0], match: true })
    last = at + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), match: false })
  return parts
}

export default function RegexLab() {
  useDocumentTitle('Regex Lab')
  const [active, setActive] = useState(0)

  const pattern = PATTERNS[active]

  const { lines, matchCount } = useMemo(() => {
    const segmented = LOG_LINES.map((text) => segment(text, pattern.regex))
    return {
      lines: segmented,
      matchCount: segmented.reduce((n, parts) => n + parts.filter((p) => p.match).length, 0),
    }
  }, [pattern])

  return (
    <div className="page">
      <TopNav note="Page type · Live pattern lab" right={<Tag tone="neutral">REGEX · LEVEL 1</Tag>} />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 48px 110px' }}>
        <h1 style={{ fontSize: 42, margin: '0 0 10px', color: 'var(--color-accent-700)' }}>
          Regex lab: watch the pattern hunt
        </h1>
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.65,
            color: 'var(--color-neutral-700)',
            maxWidth: 620,
            margin: '0 0 30px',
          }}
        >
          A regex is a description of text you're looking for. Pick a pattern below and watch what it
          catches in the same log lines — the highlights update instantly.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {PATTERNS.map((p, i) => {
            const on = i === active
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={on}
                style={{
                  cursor: 'pointer',
                  padding: '11px 18px',
                  borderRadius: 999,
                  fontFamily: mono,
                  fontSize: 13.5,
                  fontWeight: 600,
                  background: on ? 'var(--color-accent)' : 'var(--color-neutral-100)',
                  color: on ? 'var(--color-bg)' : 'var(--color-text)',
                  border: `2px solid ${on ? 'var(--color-accent)' : 'var(--color-neutral-300)'}`,
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        <div
          className="card elev-md"
          style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24, padding: 0 }}
        >
          <div
            style={{
              padding: '12px 20px',
              background: 'var(--color-neutral-100)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderBottom: '1px solid var(--color-neutral-300)',
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--color-neutral-600)',
              }}
            >
              Pattern
            </span>
            <code style={{ fontSize: 15, color: 'var(--color-accent-700)', fontWeight: 700 }}>
              {pattern.label}
            </code>
            <Tag tone="accent-2" style={{ marginLeft: 'auto' }}>
              {matchCount} MATCHES
            </Tag>
          </div>

          <div
            style={{
              padding: '20px 22px',
              fontFamily: mono,
              fontSize: 13.5,
              lineHeight: 2.1,
              color: 'var(--color-neutral-800)',
            }}
          >
            {lines.map((parts, li) => (
              <div key={li} style={{ whiteSpace: 'pre-wrap' }}>
                {parts.map((seg, si) => (
                  <span
                    key={si}
                    style={
                      seg.match
                        ? {
                            background: 'var(--color-accent-200)',
                            color: 'var(--color-accent-800)',
                            borderRadius: 6,
                            padding: '1px 3px',
                            fontWeight: 700,
                          }
                        : undefined
                    }
                  >
                    {seg.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: 'var(--color-accent-100)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 22px',
            marginBottom: 26,
            animation: 'pop 0.3s ease',
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'var(--color-accent-700)',
              marginBottom: 6,
            }}
          >
            How this pattern reads, symbol by symbol
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--color-neutral-800)' }}>
            {pattern.explanation}
          </div>
        </div>

        <h2 style={{ fontSize: 22, margin: '0 0 14px' }}>Pocket decoder</h2>
        <div className="grid grid-4" style={{ gap: 10 }}>
          {DECODER.map((d) => (
            <div
              key={d.symbol}
              style={{
                background: 'var(--color-neutral-100)',
                borderRadius: 14,
                padding: '12px 14px',
              }}
            >
              <code style={{ color: 'var(--color-accent-700)', fontWeight: 700 }}>{d.symbol}</code>
              <div style={{ fontSize: 12, color: 'var(--color-neutral-700)', marginTop: 3 }}>
                {d.meaning}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
