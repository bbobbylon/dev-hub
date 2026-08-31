import type { ReactNode } from 'react'
import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/Page'

const INK = 'var(--color-neutral-600)'
const MUTED = 'var(--color-neutral-500)'

function Mono({ children }: { children: string }) {
  return (
    <code style={{ background: 'var(--color-neutral-100)', padding: '1px 5px', borderRadius: 5 }}>
      {children}
    </code>
  )
}

/* ── the four diagrams ─────────────────────────────────────────────────── */

const ARRAY_CELLS = [
  { value: '12', index: '[0]', highlighted: false },
  { value: '7', index: '[1]', highlighted: false },
  { value: '31', index: '[2]', highlighted: true },
  { value: '9', index: '[3]', highlighted: false },
  { value: '24', index: '[4]', highlighted: false },
]

function ArrayDiagram() {
  return (
    <svg viewBox="0 0 380 92" style={{ width: '100%', height: 'auto', marginBottom: 14 }} role="img" aria-label="Five numbered array cells; index 2 is highlighted">
      {ARRAY_CELLS.map((cell, i) => {
        const x = 20 + i * 62
        return (
          <g key={cell.index}>
            <rect
              x={x}
              y="18"
              width="56"
              height="44"
              rx="10"
              fill={cell.highlighted ? 'var(--color-accent)' : 'var(--color-accent-200)'}
            />
            <text
              x={x + 28}
              y="45"
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              fill={cell.highlighted ? 'var(--color-bg)' : 'var(--color-accent-700)'}
            >
              {cell.value}
            </text>
            <text
              x={x + 28}
              y="80"
              textAnchor="middle"
              fontSize="11"
              fontWeight={cell.highlighted ? 700 : undefined}
              fill={cell.highlighted ? 'var(--color-accent-700)' : INK}
            >
              {cell.index}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const LIST_NODES = [
  { value: '12', x: 16 },
  { value: '7', x: 136 },
  { value: '31', x: 256 },
]

function LinkedListDiagram() {
  return (
    <svg viewBox="0 0 380 92" style={{ width: '100%', height: 'auto', marginBottom: 14 }} role="img" aria-label="Three linked nodes, each pointing to the next, ending in null">
      <defs>
        <marker id="la" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
          <path d="M0 0L10 5L0 10z" fill={INK} />
        </marker>
      </defs>
      {LIST_NODES.map((n, i) => (
        <g key={n.value}>
          <rect x={n.x} y="24" width="76" height="44" rx="14" fill="var(--color-accent-2-100)" />
          <text
            x={n.x + 28}
            y="51"
            textAnchor="middle"
            fontSize="15"
            fontWeight="700"
            fill="var(--color-accent-2-700)"
          >
            {n.value}
          </text>
          <circle cx={n.x + 62} cy="46" r="6" fill="var(--color-accent-2)" />
          {i < LIST_NODES.length - 1 ? (
            <line
              x1={n.x + 70}
              y1="46"
              x2={n.x + 114}
              y2="46"
              stroke={INK}
              strokeWidth="2.5"
              markerEnd="url(#la)"
            />
          ) : null}
        </g>
      ))}
      <line x1="326" y1="46" x2="356" y2="46" stroke={INK} strokeWidth="2.5" strokeDasharray="4 4" />
      <text x="366" y="51" fontSize="13" fill={INK}>
        ∅
      </text>
      <text x="44" y="14" textAnchor="middle" fontSize="10.5" fill={INK}>
        head
      </text>
    </svg>
  )
}

const BUCKETS = [
  { label: '0 ·', y: 6, filled: false },
  { label: '1 ·', y: 34, filled: false },
  { label: '3 ·', y: 62, filled: true },
  { label: '4 ·', y: 90, filled: false },
]

function HashMapDiagram() {
  return (
    <svg viewBox="0 0 380 120" style={{ width: '100%', height: 'auto', marginBottom: 14 }} role="img" aria-label="A key is hashed to a bucket number, which addresses a slot in the table">
      <defs>
        <marker id="ha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="var(--color-accent-600)" />
        </marker>
      </defs>
      <rect x="10" y="42" width="88" height="34" rx="17" fill="var(--color-accent-200)" />
      <text x="54" y="64" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-accent-700)">
        "ada"
      </text>
      <rect x="128" y="42" width="96" height="34" rx="12" fill="var(--color-neutral-200)" />
      <text x="176" y="64" textAnchor="middle" fontSize="12.5" fill="var(--color-neutral-700)">
        hash("ada")
      </text>
      <line x1="100" y1="59" x2="124" y2="59" stroke="var(--color-accent-600)" strokeWidth="2.5" markerEnd="url(#ha)" />
      <line x1="226" y1="59" x2="252" y2="59" stroke="var(--color-accent-600)" strokeWidth="2.5" markerEnd="url(#ha)" />
      <text x="238" y="46" textAnchor="middle" fontSize="11" fill={INK}>
        → 3
      </text>
      {BUCKETS.map((b) => (
        <g key={b.label}>
          <rect
            x="258"
            y={b.y}
            width="110"
            height="24"
            rx="8"
            fill={b.filled ? 'var(--color-accent)' : 'var(--color-neutral-100)'}
          />
          <text
            x="270"
            y={b.y + 16}
            fontSize="11"
            fill={b.filled ? 'var(--color-accent-200)' : MUTED}
          >
            {b.label}
          </text>
          {b.filled ? (
            <text x="316" y={b.y + 16} fontSize="12" fontWeight="700" fill="var(--color-bg)">
              score: 97
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  )
}

function BstDiagram() {
  return (
    <svg viewBox="0 0 380 130" style={{ width: '100%', height: 'auto', marginBottom: 14 }} role="img" aria-label="A binary search tree rooted at 50, with 30 and 70 below it">
      {[
        [190, 30, 110, 72],
        [190, 30, 270, 72],
        [110, 72, 66, 112],
        [110, 72, 154, 112],
        [270, 72, 314, 112],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth="2.5" />
      ))}

      <circle cx="190" cy="26" r="20" fill="var(--color-accent)" />
      <text x="190" y="32" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--color-bg)">
        50
      </text>

      {[
        [110, '30'],
        [270, '70'],
      ].map(([cx, label]) => (
        <g key={label as string}>
          <circle
            cx={cx as number}
            cy="72"
            r="18"
            fill="var(--color-accent-2-100)"
            stroke="var(--color-accent-2)"
            strokeWidth="2.5"
          />
          <text
            x={cx as number}
            y="77"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="var(--color-accent-2-700)"
          >
            {label}
          </text>
        </g>
      ))}

      {[
        [66, '20'],
        [154, '40'],
        [314, '80'],
      ].map(([cx, label]) => (
        <g key={label as string}>
          <circle cx={cx as number} cy="112" r="16" fill="var(--color-neutral-200)" />
          <text
            x={cx as number}
            y="117"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="var(--color-neutral-700)"
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  )
}

/* ── cards ─────────────────────────────────────────────────────────────── */

interface Structure {
  name: string
  tagline: string
  diagram: ReactNode
  fast: ReactNode
  slow: ReactNode
}

const STRUCTURES: Structure[] = [
  {
    name: 'Array',
    tagline: 'a row of numbered boxes',
    diagram: <ArrayDiagram />,
    fast: (
      <>
        Jump to any index — <Mono>a[2]</Mono> is one hop, O(1)
      </>
    ),
    slow: 'Insert at the front — every box shifts right, O(n)',
  },
  {
    name: 'Linked list',
    tagline: 'a treasure hunt of pointers',
    diagram: <LinkedListDiagram />,
    fast: 'Insert/remove at a known spot — re-aim two pointers, O(1)',
    slow: 'Find item #k — walk the chain from the head, O(n)',
  },
  {
    name: 'Hash map',
    tagline: 'a coat check with math',
    diagram: <HashMapDiagram />,
    fast: (
      <>
        Get/set by key — the hash <em>computes</em> the shelf number, O(1)
      </>
    ),
    slow: '"Smallest key?" — no order at all, scan everything, O(n)',
  },
  {
    name: 'Binary search tree',
    tagline: 'smaller left, bigger right',
    diagram: <BstDiagram />,
    fast: 'Search sorted data — halve at every level, O(log n)',
    slow: 'Insert in sorted order (1,2,3…) — it degrades into a list, O(n)',
  },
]

function Verdict({ tone, label, children }: { tone: 'accent' | 'accent-2'; label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Tag tone={tone} style={{ flex: 'none' }}>
        {label}
      </Tag>
      <span style={{ color: 'var(--color-neutral-800)' }}>{children}</span>
    </div>
  )
}

export default function DataStructuresVisual() {
  useDocumentTitle('Data Structures Visual')

  return (
    <div className="page">
      <TopNav
        note="Page type · Visual field guide (diagram-first)"
        right={<Tag tone="neutral">DATA STRUCTURES</Tag>}
      />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 48px 110px' }}>
        <h1 style={{ fontSize: 42, margin: '0 0 10px', color: 'var(--color-accent-700)' }}>
          A field guide to data shapes
        </h1>
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.65,
            color: 'var(--color-neutral-700)',
            maxWidth: 640,
            margin: '0 0 40px',
          }}
        >
          Four structures, drawn the way you should picture them. Each card answers the same three
          questions: what does it look like, what's instant, what's slow.
        </p>

        <div className="grid grid-2" style={{ gap: 18 }}>
          {STRUCTURES.map((s) => (
            <div
              key={s.name}
              className="card elev-sm"
              style={{ borderRadius: 'var(--radius-lg)', padding: '24px 26px' }}
            >
              <div
                style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}
              >
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 21 }}>{s.name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>{s.tagline}</span>
              </div>
              {s.diagram}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 7,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <Verdict tone="accent-2" label="FAST">
                  {s.fast}
                </Verdict>
                <Verdict tone="accent" label="SLOW">
                  {s.slow}
                </Verdict>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            background: 'var(--color-accent-2-100)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginTop: 26,
          }}
        >
          <Icon name="lightbulb" size={22} color="var(--color-accent-2-700)" style={{ marginTop: 2 }} />
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-neutral-800)' }}>
            <strong>The one-question picker:</strong> need order? Array (by position) or BST
            (sorted). Need lookup by name? Hash map. Need cheap inserts mid-sequence? Linked list.
            Say the need out loud and the structure picks itself.
          </div>
        </div>
      </main>
    </div>
  )
}
