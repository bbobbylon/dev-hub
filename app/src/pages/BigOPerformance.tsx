/**
 * Big-O Performance — route `/big-o-performance`, a chart-led concept page
 * on algorithmic complexity. A single inline-SVG line chart (built from
 * `CURVES`) plots O(1)/O(log n)/O(n)/O(n²) growth against input size; below
 * it, cost cards (`COMPLEXITIES`) and a lookup-cost comparison table
 * (`LOOKUP_COSTS`) restate the same four complexities in prose and in a
 * concrete "is this name in the list?" scenario, meant to settle Big-O
 * interview questions. No interactivity — every value here is static.
 */
import type { ReactNode } from 'react'
import { TopNav } from '../components/TopNav'
import { Aside } from '../components/Aside'
import { Tag, type TagTone } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { ConceptComplete } from '../components/ConceptComplete'

const mono = 'ui-monospace, Menlo, monospace'

/* Each curve gets its own accent step so the four read apart at a glance —
   sage for the cheap ones, terracotta for the expensive ones. */
// Growth-curve paths and labels for the SVG chart, one per complexity class
const CURVES = [
  { label: 'O(n²)', d: 'M50 268 Q 150 240 500 30', color: 'var(--color-accent-600)', y: 30, labelX: 437, labelY: 26 },
  { label: 'O(n)', d: 'M50 268 L 500 130', color: 'var(--color-accent)', y: 130, labelX: 463, labelY: 124 },
  { label: 'O(log n)', d: 'M50 268 Q 120 215 260 200 T 500 185', color: 'var(--color-accent-2)', y: 185, labelX: 440, labelY: 177 },
  { label: 'O(1)', d: 'M50 252 L 500 252', color: 'var(--color-accent-2-700)', y: 252, labelX: 452, labelY: 245 },
]

/** One complexity-class card: its name, a plain-language blurb, and the color it shares with its chart curve. */
interface Complexity {
  name: string
  blurb: ReactNode
  tone: 'accent' | 'accent-2'
  rule: string
}

// Complexity cards rendered beside the growth-curve chart
const COMPLEXITIES: Complexity[] = [
  {
    name: 'O(1) — constant',
    tone: 'accent-2',
    rule: 'var(--color-accent-2-700)',
    blurb: (
      <>
        Same cost at any size. <InlineCode>dict[key]</InlineCode>, array index, hash lookup.
      </>
    ),
  },
  {
    name: 'O(log n) — halving',
    tone: 'accent-2',
    rule: 'var(--color-accent-2)',
    blurb: 'Each step cuts the problem in half. Binary search: 1M items → 20 steps.',
  },
  {
    name: 'O(n) — linear',
    tone: 'accent',
    rule: 'var(--color-accent)',
    blurb: (
      <>
        Touch everything once. Loops, <InlineCode>list.contains</InlineCode>, summing.
      </>
    ),
  },
  {
    name: 'O(n²) — quadratic',
    tone: 'accent',
    rule: 'var(--color-accent-600)',
    blurb: 'Every item against every other. Nested loops, naive duplicate-finding.',
  },
]

// Rows of the "same job, four costs" comparison table
const LOOKUP_COSTS: {
  structure: string
  code: string
  cost: string
  tone: TagTone
  atMillion: string
}[] = [
  { structure: 'Hash set', code: 'name in names_set', cost: 'O(1)', tone: 'accent-2', atMillion: '1 probe' },
  {
    structure: 'Sorted array',
    code: 'binary_search(names)',
    cost: 'O(log n)',
    tone: 'accent-2',
    atMillion: '20 comparisons',
  },
  {
    structure: 'Unsorted list',
    code: 'name in names_list',
    cost: 'O(n)',
    tone: 'accent',
    atMillion: '500,000 avg',
  },
  {
    structure: 'List, checking pairs for dupes',
    code: 'nested for loops',
    cost: 'O(n²)',
    tone: 'accent',
    atMillion: '500 billion',
  },
]

/** Inline monospace snippet used inside a complexity card's blurb. */
function InlineCode({ children }: { children: string }) {
  return (
    <code
      style={{
        background: 'var(--color-bg)',
        padding: '1px 5px',
        borderRadius: 5,
        fontFamily: mono,
      }}
    >
      {children}
    </code>
  )
}

/** Chart-led concept page explaining the four common Big-O growth rates with a chart, cards, and a lookup-cost table. */
export default function BigOPerformance() {
  useDocumentTitle('Big-O Performance')

  return (
    <div className="page">
      <TopNav note="Page type · Chart-led concept page" right={<Tag tone="neutral">ALGORITHMS</Tag>} />

      <main style={{ maxWidth: 1060, margin: '0 auto', padding: '48px 48px 110px' }}>
        <h1 style={{ fontSize: 42, margin: '0 0 10px', color: 'var(--color-accent-700)' }}>
          Big-O: how code slows down as data grows
        </h1>
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.65,
            color: 'var(--color-neutral-700)',
            maxWidth: 640,
            margin: '0 0 36px',
          }}
        >
          Big-O ignores your laptop's speed and asks one question:{' '}
          <strong style={{ color: 'var(--color-text)' }}>
            if the input gets 10× bigger, how much slower does the code get?
          </strong>{' '}
          The chart is the whole story — everything else is examples.
        </p>

        <div
          className="split-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: 22,
            alignItems: 'start',
            marginBottom: 36,
          }}
        >
          <div className="card elev-md" style={{ borderRadius: 'var(--radius-lg)', padding: 28 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-neutral-700)',
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              Operations needed vs. input size
            </div>

            <svg
              viewBox="0 0 520 320"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              fontFamily="Figtree, system-ui, sans-serif"
              role="img"
              aria-label="Growth curves for O(1), O(log n), O(n) and O(n squared) against input size"
            >
              {/* axes */}
              <line x1="50" y1="270" x2="500" y2="270" stroke="var(--color-neutral-400)" strokeWidth="1.5" />
              <line x1="50" y1="270" x2="50" y2="20" stroke="var(--color-neutral-400)" strokeWidth="1.5" />
              <text x="275" y="298" textAnchor="middle" fontSize="13" fill="var(--color-neutral-600)">
                input size n →
              </text>
              <text
                x="22"
                y="145"
                textAnchor="middle"
                fontSize="13"
                fill="var(--color-neutral-600)"
                transform="rotate(-90 22 145)"
              >
                work →
              </text>

              {CURVES.map((c) => (
                <path key={c.label} d={c.d} fill="none" stroke={c.color} strokeWidth="3.5" />
              ))}
              {CURVES.map((c) => (
                <text
                  key={c.label}
                  x={c.labelX}
                  y={c.labelY}
                  fontSize="13.5"
                  fontWeight="700"
                  fill={c.color}
                >
                  {c.label}
                </text>
              ))}
              {CURVES.map((c) => (
                <circle key={c.label} cx="500" cy={c.y} r="5" fill={c.color} />
              ))}
            </svg>

            <div
              style={{
                fontSize: 12.5,
                color: 'var(--color-neutral-700)',
                marginTop: 10,
                lineHeight: 1.5,
              }}
            >
              The gap between the curves <em>is</em> the lesson: at n = 1,000, O(n²) does a million
              operations while O(log n) does ten.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {COMPLEXITIES.map((c) => (
              <div
                key={c.name}
                style={{
                  background: `var(--color-${c.tone}-100)`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  borderLeft: `5px solid ${c.rule}`,
                }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 15,
                    color: `var(--color-${c.tone}-800)`,
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--color-neutral-800)',
                    marginTop: 4,
                  }}
                >
                  {c.blurb}
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: 24, margin: '0 0 14px' }}>
          Same job, four costs: "is this name in the list?"
        </h2>
        <div style={{ overflowX: 'auto', marginBottom: 30 }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Data structure</th>
                <th>Code</th>
                <th>Cost</th>
                <th>1M items ≈</th>
              </tr>
            </thead>
            <tbody>
              {LOOKUP_COSTS.map((row) => (
                <tr key={row.structure}>
                  <td style={{ fontWeight: 600 }}>{row.structure}</td>
                  <td>
                    <code>{row.code}</code>
                  </td>
                  <td>
                    <Tag tone={row.tone}>{row.cost}</Tag>
                  </td>
                  <td>{row.atMillion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Aside tone="neutral">
          <strong>Rule of thumb for interviews:</strong> see a nested loop over the same data? Say
          "O(n²) — can I trade memory for time with a hash map?" That single sentence solves a third
          of all interview problems.
        </Aside>
        <ConceptComplete
          slug="big-o-performance"
          hint="Read the curves and the cost table, then mark it done."
        />

      </main>
    </div>
  )
}
