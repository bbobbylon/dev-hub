/**
 * Route `/architecture-deep-dive` — "SYSTEM DIAGRAM" page tracing one payment request through a
 * typical web backend (browser → load balancer → API server → cache/database → replica) as a
 * numbered inline SVG map, with matching explanatory cards below (`LAYER_CARDS`) for the three
 * non-obvious stops. The diagram is hand-built with the local `Node` helper rather than any
 * shared diagram component, and its content is self-contained — not shared with any other page.
 */
import { TopNav } from '../components/TopNav'
import { Aside } from '../components/Aside'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const INK = 'var(--color-neutral-700)'
const SURFACE = 'var(--color-neutral-200)'
const SAGE_SURFACE = 'var(--color-accent-2-100)'

/** One box on the request-journey map. */
function Node({
  x,
  y,
  w = 120,
  h = 80,
  rx = 22,
  fill = SURFACE,
  badge,
  badgeFill,
  title,
  titleFill = 'var(--color-text)',
  titleWeight = 600,
  caption,
  captionFill = INK,
  titleSize = 15,
  captionSize = 11.5,
}: {
  x: number
  y: number
  w?: number
  h?: number
  rx?: number
  fill?: string
  badge?: number
  badgeFill?: string
  title: string
  titleFill?: string
  titleWeight?: number
  caption: string
  captionFill?: string
  titleSize?: number
  captionSize?: number
}) {
  const cx = x + w / 2
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} />
      {badge !== undefined ? (
        <>
          <circle cx={cx} cy={y - 12} r="15" fill={badgeFill} />
          <text
            x={cx}
            y={y - 7}
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="var(--color-bg)"
          >
            {badge}
          </text>
        </>
      ) : null}
      <text
        x={cx}
        y={y + 35}
        textAnchor="middle"
        fontSize={titleSize}
        fontWeight={titleWeight}
        fill={titleFill}
      >
        {title}
      </text>
      <text x={cx} y={y + 56} textAnchor="middle" fontSize={captionSize} fill={captionFill}>
        {caption}
      </text>
    </g>
  )
}

// The explanatory cards rendered below the SVG diagram, one per non-trivial numbered stop.
const LAYER_CARDS = [
  {
    n: 2,
    name: 'Load balancer',
    tone: 'accent' as const,
    question: 'Question it answers: "which server?"',
    body: 'Traffic is split across many identical API servers so no one machine drowns. If one dies, it stops receiving requests — users never notice.',
    emphasised: false,
  },
  {
    n: 3,
    name: 'API server',
    tone: 'accent' as const,
    question: 'Question it answers: "is this allowed?"',
    body: "Authenticates you, validates the amount, checks the card isn't blocked — then orchestrates: cache first, database for the decision that counts.",
    emphasised: true,
  },
  {
    n: 5,
    name: 'Cache',
    tone: 'accent-2' as const,
    question: 'Question it answers: "do we already know?"',
    body: 'Answers in microseconds from memory. The dashed arrow means "try me first" — a cache miss falls through to the database.',
    emphasised: false,
  },
]

/** The Architecture Deep Dive page — the request-journey SVG diagram plus its layer cards. */
export default function ArchitectureDeepDive() {
  useDocumentTitle('Architecture Deep Dive')

  return (
    <div className="page">
      <TopNav
        note="Page type · System diagram deep-dive"
        right={<Tag tone="neutral">SYSTEM DESIGN</Tag>}
      />

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 48px 110px' }}>
        <h1 style={{ fontSize: 42, margin: '0 0 10px', color: 'var(--color-accent-700)' }}>
          What happens when you click "Pay"
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
          One request's journey through a typical web backend. Click a numbered stop on the map, then
          read its card below — each layer exists to answer one question.
        </p>

        <div
          className="card elev-md"
          style={{ borderRadius: 'var(--radius-lg)', padding: 34, marginBottom: 26 }}
        >
          <svg
            viewBox="0 0 920 300"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            fontFamily="Figtree, system-ui, sans-serif"
            role="img"
            aria-label="Request path: browser to load balancer to API server to database, with a cache consulted first and a read replica"
          >
            <defs>
              <marker
                id="arr"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0L10 5L0 10z" fill={INK} />
              </marker>
            </defs>

            {/* the solid path through the request */}
            <line x1="150" y1="150" x2="240" y2="150" stroke={INK} strokeWidth="2.5" markerEnd="url(#arr)" />
            <line x1="360" y1="150" x2="450" y2="150" stroke={INK} strokeWidth="2.5" markerEnd="url(#arr)" />
            <line x1="570" y1="150" x2="660" y2="150" stroke={INK} strokeWidth="2.5" markerEnd="url(#arr)" />
            <line x1="720" y1="190" x2="720" y2="235" stroke={INK} strokeWidth="2.5" markerEnd="url(#arr)" />
            {/* dashed = "ask the cache first" */}
            <line
              x1="660"
              y1="120"
              x2="580"
              y2="60"
              stroke={INK}
              strokeWidth="2.5"
              strokeDasharray="6 5"
              markerEnd="url(#arr)"
            />

            <Node x={30} y={110} badge={1} badgeFill="var(--color-accent)" title="Browser" caption="POST /charge" />
            <Node x={240} y={110} badge={2} badgeFill="var(--color-accent)" title="Load balancer" caption="picks a server" />
            <Node
              x={450}
              y={110}
              fill="var(--color-accent)"
              badge={3}
              badgeFill="var(--color-accent-700)"
              title="API server"
              titleFill="var(--color-bg)"
              titleWeight={700}
              caption="validates + decides"
              captionFill="var(--color-accent-200)"
            />
            <Node x={660} y={110} badge={4} badgeFill="var(--color-accent)" title="Database" caption="the truth lives here" />

            {/* read replica — no badge, it isn't a numbered stop */}
            <Node
              x={660}
              y={235}
              h={55}
              rx={18}
              fill={SAGE_SURFACE}
              title="Replica"
              titleFill="var(--color-accent-2-700)"
              titleSize={13.5}
              caption="reads only"
              captionFill="var(--color-accent-2-600)"
              captionSize={11}
            />

            <Node
              x={460}
              y={18}
              h={55}
              rx={18}
              fill={SAGE_SURFACE}
              title="Cache"
              titleFill="var(--color-accent-2-700)"
              titleSize={13.5}
              caption="asked first, dashed"
              captionFill="var(--color-accent-2-600)"
              captionSize={11}
            />
            {/* the cache badge sits tighter than the others */}
            <circle cx="520" cy="10" r="13" fill="var(--color-accent-2)" />
            <text x="520" y="14.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-bg)">
              5
            </text>
          </svg>
        </div>

        <div className="grid grid-3" style={{ gap: 14, marginBottom: 34 }}>
          {LAYER_CARDS.map((c) => (
            <div
              key={c.n}
              className="card"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                border: c.emphasised ? '2px solid var(--color-accent)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: `var(--color-${c.tone})`,
                    color: 'var(--color-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  {c.n}
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{c.name}</span>
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: `var(--color-${c.tone}-700)`,
                  fontWeight: 700,
                  marginBottom: 5,
                }}
              >
                {c.question}
              </div>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--color-neutral-800)',
                  margin: 0,
                }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>

        <Aside>
          <strong>Trace it yourself:</strong> the numbers are the order for a cache-miss payment.
          Now re-trace the same click assuming the cache <em>has</em> the user's session — which
          stops disappear? (Answer: 4's read; the write still happens. Money always hits the
          database.)
        </Aside>
      </main>
    </div>
  )
}
