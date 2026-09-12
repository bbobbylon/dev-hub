/**
 * Route `/algorithm-visualizer` — a step-through visualization of bubble sort:
 * bars re-color to show which two elements are being compared, pseudocode
 * highlights the line that just ran, and comparison/swap counters update live.
 * `FRAMES` is a hand-authored, pre-computed trace of the whole sort so that
 * stepping backward is just an array index change, not a re-simulation.
 */
import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { ConceptComplete } from '../components/ConceptComplete'

/**
 * Each frame is one comparison of a bubble sort — the array as it stands, which
 * indices are being compared, which are locked in, and which pseudocode line
 * just ran. Pre-computed so stepping backwards is free.
 */
interface Frame {
  a: number[]
  cmp: number[]
  sorted: number[]
  note: string
  /** 1-based pseudocode line; 0 means "between passes", which highlights line 1. */
  line: number
  comparisons: number
  swaps: number
  pass: number
}

// pre-computed bubble-sort trace; each entry is one frame of the step-through
const FRAMES: Frame[] = [
  { a: [5, 2, 8, 3, 6], cmp: [0, 1], sorted: [], note: 'Compare 5 and 2 — 5 > 2, so swap.', line: 2, comparisons: 1, swaps: 0, pass: 1 },
  { a: [2, 5, 8, 3, 6], cmp: [1, 2], sorted: [], note: 'Compare 5 and 8 — already in order, no swap.', line: 2, comparisons: 2, swaps: 1, pass: 1 },
  { a: [2, 5, 8, 3, 6], cmp: [2, 3], sorted: [], note: 'Compare 8 and 3 — 8 > 3, swap.', line: 3, comparisons: 3, swaps: 2, pass: 1 },
  { a: [2, 5, 3, 8, 6], cmp: [3, 4], sorted: [], note: 'Compare 8 and 6 — 8 > 6, swap. 8 reaches the end.', line: 3, comparisons: 4, swaps: 3, pass: 1 },
  { a: [2, 5, 3, 6, 8], cmp: [], sorted: [4], note: 'Pass 1 done — the largest value bubbled to the last slot. It never moves again.', line: 0, comparisons: 4, swaps: 3, pass: 1 },
  { a: [2, 5, 3, 6, 8], cmp: [0, 1], sorted: [4], note: 'Pass 2. Compare 2 and 5 — no swap.', line: 2, comparisons: 5, swaps: 3, pass: 2 },
  { a: [2, 5, 3, 6, 8], cmp: [1, 2], sorted: [4], note: 'Compare 5 and 3 — swap.', line: 3, comparisons: 6, swaps: 4, pass: 2 },
  { a: [2, 3, 5, 6, 8], cmp: [2, 3], sorted: [4], note: 'Compare 5 and 6 — no swap.', line: 2, comparisons: 7, swaps: 4, pass: 2 },
  { a: [2, 3, 5, 6, 8], cmp: [], sorted: [3, 4], note: 'Pass 2 done — 6 locked in.', line: 0, comparisons: 7, swaps: 4, pass: 2 },
  { a: [2, 3, 5, 6, 8], cmp: [], sorted: [0, 1, 2, 3, 4], note: 'Pass 3 makes zero swaps — the array is sorted, so bubble sort stops early.', line: 4, comparisons: 9, swaps: 4, pass: 3 },
]

// lines rendered in the dark pseudocode panel; indices are 1-based against Frame.line
const PSEUDOCODE = [
  'for i in 0 .. n-1:',
  '  for j in 0 .. n-i-2:',
  '    if a[j] > a[j+1]:',
  '      swap(a[j], a[j+1])',
  'stop when a pass makes no swaps',
]

const TOTAL_PASSES = 3

/** The Algorithm Visualizer page mounted at `/algorithm-visualizer` (see file header). */
export default function AlgorithmVisualizer() {
  useDocumentTitle('Algorithm Visualizer')
  // index into FRAMES for the step currently shown
  const [f, setF] = useState(0)

  const frame = FRAMES[f]
  const atEnd = f >= FRAMES.length - 1
  /** Whether pseudocode line `i` (0-based) should be highlighted for the current frame. */
  const isActiveLine = (i: number) => i + 1 === frame.line || (frame.line === 0 && i === 0)

  return (
    <div className="page">
      <TopNav
        note="Page type · Algorithm visualizer"
        right={<Tag tone="accent">DATA STRUCTURES &amp; ALGORITHMS</Tag>}
      />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 48px 100px' }}>
        <h1 style={{ fontSize: 42, margin: '0 0 10px', color: 'var(--color-accent-700)' }}>
          Bubble sort, one comparison at a time
        </h1>
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.6,
            color: 'var(--color-neutral-700)',
            maxWidth: 620,
            margin: '0 0 36px',
          }}
        >
          Step through the algorithm and watch the largest value bubble to the end of each pass. The
          highlighted pseudocode line is the one that just ran.
        </p>

        <div
          className="viz-layout"
          style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}
        >
          {/* bars + transport */}
          <div className="card elev-md" style={{ borderRadius: 'var(--radius-lg)', padding: 28 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 14,
                height: 220,
                marginBottom: 6,
              }}
            >
              {frame.a.map((v, i) => {
                const comparing = frame.cmp.includes(i)
                const sorted = frame.sorted.includes(i)
                const color = comparing
                  ? 'var(--color-accent)'
                  : sorted
                    ? 'var(--color-accent-2)'
                    : 'var(--color-neutral-400)'
                const labelColor = comparing
                  ? 'var(--color-accent-700)'
                  : sorted
                    ? 'var(--color-accent-2-700)'
                    : 'var(--color-neutral-700)'
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        borderRadius: '14px 14px 6px 6px',
                        transition: 'height 0.3s ease, background 0.2s ease',
                        height: v * 26,
                        background: color,
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'ui-monospace, Menlo, monospace',
                        fontSize: 14,
                        fontWeight: 700,
                        color: labelColor,
                      }}
                    >
                      {v}
                    </span>
                  </div>
                )
              })}
            </div>

            <div
              aria-live="polite"
              style={{
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: 14,
                color: 'var(--color-neutral-800)',
                background: 'var(--color-neutral-100)',
                borderRadius: 14,
                padding: '10px 16px',
              }}
            >
              {frame.note}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setF((n) => Math.max(n - 1, 0))}
                disabled={f === 0}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setF((n) => Math.min(n + 1, FRAMES.length - 1))}
                disabled={atEnd}
              >
                {atEnd ? 'Done' : 'Step →'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setF(0)}>
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', gap: 5, marginTop: 16 }}>
              {FRAMES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 999,
                    background: i <= f ? 'var(--color-accent)' : 'var(--color-neutral-300)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* pseudocode + counters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: 'var(--color-neutral-900)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 22px',
              }}
            >
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-neutral-400)',
                  marginBottom: 12,
                }}
              >
                Pseudocode
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                {PSEUDOCODE.map((text, i) => {
                  const active = isActiveLine(i)
                  return (
                    <div
                      key={text}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 8,
                        whiteSpace: 'pre',
                        color: active ? 'var(--color-bg)' : 'var(--color-neutral-400)',
                        background: active ? 'var(--color-accent-700)' : 'transparent',
                      }}
                    >
                      {text}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card" style={{ borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-neutral-700)',
                  marginBottom: 10,
                }}
              >
                Live counters
              </div>
              {[
                ['Comparisons', frame.comparisons],
                ['Swaps', frame.swaps],
                ['Pass', `${frame.pass} of ${TOTAL_PASSES}`],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    padding: '4px 0',
                  }}
                >
                  <span style={{ color: 'var(--color-neutral-700)' }}>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--color-neutral-300)',
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: 'var(--color-neutral-700)',
                }}
              >
                Worst case <strong style={{ fontFamily: 'ui-monospace, monospace' }}>O(n²)</strong> —
                every pair compared. Already-sorted input finishes in one pass:{' '}
                <strong style={{ fontFamily: 'ui-monospace, monospace' }}>O(n)</strong>.
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 14,
                fontSize: 12.5,
                color: 'var(--color-neutral-700)',
                flexWrap: 'wrap',
              }}
            >
              {[
                ['comparing', 'var(--color-accent)'],
                ['sorted', 'var(--color-accent-2)'],
                ['unsorted', 'var(--color-neutral-400)'],
              ].map(([label, color]) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{ width: 11, height: 11, borderRadius: 4, background: color }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <ConceptComplete
          slug="algorithm-visualizer"
          earned={atEnd}
          hint="Step the trace to its final frame and this records itself."
        />

      </main>
    </div>
  )
}
