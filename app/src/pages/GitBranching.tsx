import type { ReactNode } from 'react'
import { TopNav } from '../components/TopNav'
import { Aside } from '../components/Aside'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const mono = 'ui-monospace, Menlo, monospace'

/* Palette for the commit graphs, pulled from the ramps: terracotta commits sit
   on main, sage commits on the feature branch, neutral for the rails. */
const RAIL = 'var(--color-neutral-400)'
const MAIN_DOT = 'var(--color-accent)'
const BRANCH_DOT = 'var(--color-accent-2)'
const BRANCH_RAIL = 'var(--color-accent-2-400)'
const MERGE_DOT = 'var(--color-accent-700)'
const MAIN_PILL = 'var(--color-accent-200)'
const MAIN_PILL_INK = 'var(--color-accent-700)'
const BRANCH_PILL = 'var(--color-accent-2-100)'
const BRANCH_PILL_INK = 'var(--color-accent-2-700)'
const CAPTION = 'var(--color-neutral-700)'

function Code({ children }: { children: string }) {
  return (
    <code
      style={{
        background: 'var(--color-neutral-100)',
        padding: '1px 6px',
        borderRadius: 5,
        fontFamily: mono,
      }}
    >
      {children}
    </code>
  )
}

/** A rounded label pinned to a commit — the "sticky note" the copy talks about. */
function RefPill({
  x,
  y,
  w,
  label,
  fill,
  ink,
  fontSize = 12,
}: {
  x: number
  y: number
  w: number
  label: string
  fill: string
  ink: string
  fontSize?: number
}) {
  return (
    <>
      <rect x={x} y={y} width={w} height="22" rx="11" fill={fill} />
      <text
        x={x + w / 2}
        y={y + 15}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="700"
        fill={ink}
      >
        {label}
      </text>
    </>
  )
}

interface Frame {
  n: number
  title: string
  body: ReactNode
  graph: ReactNode
  viewBox: string
  emphasised?: boolean
}

const FRAMES: Frame[] = [
  {
    n: 1,
    title: 'One line of history',
    viewBox: '0 0 420 90',
    body: (
      <>
        Three commits on <Code>main</Code>. The branch name is just a sticky note on the newest
        commit.
      </>
    ),
    graph: (
      <>
        <line x1="30" y1="45" x2="390" y2="45" stroke={RAIL} strokeWidth="3" />
        {[60, 150, 240].map((cx) => (
          <circle key={cx} cx={cx} cy="45" r="11" fill={MAIN_DOT} />
        ))}
        <RefPill x={204} y={8} w={74} label="main" fill={MAIN_PILL} ink={MAIN_PILL_INK} />
        {[
          [60, 'a1f'],
          [150, 'b2e'],
          [240, 'c3d'],
        ].map(([cx, sha]) => (
          <text key={sha as string} x={cx as number} y="75" textAnchor="middle" fontSize="11" fill={CAPTION}>
            {sha}
          </text>
        ))}
      </>
    ),
  },
  {
    n: 2,
    title: 'Branching is free',
    viewBox: '0 0 420 90',
    body: (
      <>
        <Code>git switch -c feat/login</Code> adds a second sticky note to the <em>same</em> commit.
        Nothing is copied.
      </>
    ),
    graph: (
      <>
        <line x1="30" y1="45" x2="390" y2="45" stroke={RAIL} strokeWidth="3" />
        {[60, 150, 240].map((cx) => (
          <circle key={cx} cx={cx} cy="45" r="11" fill={MAIN_DOT} />
        ))}
        <RefPill x={204} y={8} w={74} label="main" fill={MAIN_PILL} ink={MAIN_PILL_INK} />
        <RefPill
          x={180}
          y={60}
          w={122}
          label="feat/login ← HEAD"
          fill={BRANCH_PILL}
          ink={BRANCH_PILL_INK}
        />
      </>
    ),
  },
  {
    n: 3,
    title: 'The lines diverge',
    viewBox: '0 0 420 110',
    body: 'You commit twice on the branch (sage). Meanwhile a teammate lands a commit on main (terracotta). Neither disturbs the other.',
    graph: (
      <>
        <line x1="30" y1="40" x2="390" y2="40" stroke={RAIL} strokeWidth="3" />
        <path d="M240 40 Q 265 40 285 62 L 330 80" fill="none" stroke={BRANCH_RAIL} strokeWidth="3" />
        {[60, 150, 240, 330].map((cx) => (
          <circle key={cx} cx={cx} cy="40" r="11" fill={MAIN_DOT} />
        ))}
        <circle cx="285" cy="66" r="11" fill={BRANCH_DOT} />
        <circle cx="330" cy="82" r="11" fill={BRANCH_DOT} />
        <RefPill x={294} y={4} w={74} label="main" fill={MAIN_PILL} ink={MAIN_PILL_INK} />
        <RefPill
          x={345}
          y={72}
          w={70}
          label="feat/login"
          fill={BRANCH_PILL}
          ink={BRANCH_PILL_INK}
          fontSize={11}
        />
      </>
    ),
  },
  {
    n: 4,
    title: 'Merge ties the knot',
    viewBox: '0 0 420 110',
    emphasised: true,
    body: (
      <>
        <Code>git merge feat/login</Code> creates one commit with <strong>two parents</strong>. Both
        histories survive. A conflict only happens if both lines touched the same lines of the same
        file.
      </>
    ),
    graph: (
      <>
        <line x1="30" y1="40" x2="330" y2="40" stroke={RAIL} strokeWidth="3" />
        <path d="M240 40 Q 265 40 285 62 L 330 80" fill="none" stroke={BRANCH_RAIL} strokeWidth="3" />
        <path d="M330 80 Q 370 70 395 44" fill="none" stroke={BRANCH_RAIL} strokeWidth="3" />
        <line x1="330" y1="40" x2="395" y2="40" stroke={RAIL} strokeWidth="3" />
        {[60, 150, 240, 330].map((cx) => (
          <circle key={cx} cx={cx} cy="40" r="11" fill={MAIN_DOT} />
        ))}
        <circle cx="285" cy="66" r="11" fill={BRANCH_DOT} />
        <circle cx="330" cy="82" r="11" fill={BRANCH_DOT} />
        <circle cx="395" cy="40" r="13" fill={MERGE_DOT} />
        <RefPill x={359} y={2} w={74} label="main" fill={MAIN_PILL} ink={MAIN_PILL_INK} />
        <text x="395" y="70" textAnchor="middle" fontSize="11" fill={CAPTION}>
          merge commit
        </text>
      </>
    ),
  },
]

export default function GitBranching() {
  useDocumentTitle('Git Branching')

  return (
    <div className="page">
      <TopNav
        note="Page type · Storyboarded diagram walkthrough"
        right={<Tag tone="accent">VERSION CONTROL</Tag>}
      />

      <main style={{ maxWidth: 980, margin: '0 auto', padding: '48px 48px 110px' }}>
        <h1 style={{ fontSize: 42, margin: '0 0 10px', color: 'var(--color-accent-700)' }}>
          A feature branch, start to merge
        </h1>
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.65,
            color: 'var(--color-neutral-700)',
            maxWidth: 620,
            margin: '0 0 40px',
          }}
        >
          The same repository at four moments. Follow the dots left to right — every dot is a commit,
          every label is the command that created that moment.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {FRAMES.map((f) => (
            <div
              key={f.n}
              className={f.emphasised ? 'card elev-md storyboard-frame' : 'card storyboard-frame'}
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '24px 28px',
                display: 'grid',
                gridTemplateColumns: '64px 1fr 300px',
                gap: 20,
                alignItems: 'center',
                border: f.emphasised ? '2px solid var(--color-accent)' : undefined,
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  color: 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 19,
                }}
              >
                {f.n}
              </span>

              <svg
                viewBox={f.viewBox}
                style={{ width: '100%', height: 'auto' }}
                role="img"
                aria-label={f.title}
                fontFamily="Figtree, system-ui, sans-serif"
              >
                {f.graph}
              </svg>

              <div>
                <div
                  style={{ fontFamily: 'var(--font-heading)', fontSize: 17, marginBottom: 4 }}
                >
                  {f.title}
                </div>
                <div
                  style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-neutral-700)' }}
                >
                  {f.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Aside
          icon="speech"
          kicker="There are no dumb questions"
          heading={'"If branching is so cheap, why do teams fear merges?"'}
          style={{ marginTop: 32 }}
        >
          Because fear grows with divergence. Two lines that drift apart for weeks touch the same
          files; two lines merged daily barely overlap. The cure isn't avoiding branches — it's
          merging often.
        </Aside>
      </main>
    </div>
  )
}
