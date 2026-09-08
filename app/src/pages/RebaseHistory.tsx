/**
 * Route `/rebase-history` — a step-through visualizer replaying a feature
 * branch being rebased onto main, showing its commits get new SHAs as they're
 * reapplied. Companion to the Git Branching page's merge-flow visualization
 * (same repo, same commit graph, same colour roles) but was added later, with
 * no prototype of its own — built to match that page's style. Linked from the
 * Roadmap's stage 2 chip list.
 */
import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { Code, Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { Aside } from '../components/Aside'

const mono = 'ui-monospace, Menlo, monospace'

/* Same palette family as Git Branching — this page picks up exactly where
   that one's "the lines diverge" frame left off, so the colours have to
   match: terracotta for main, sage for the feature branch. A darker
   terracotta (accent-700) marks a replayed commit — the same "this dot is
   new and load-bearing" role it plays as the merge-commit colour there. */
const RAIL = 'var(--color-neutral-400)'
const MAIN_DOT = 'var(--color-accent)'
const BRANCH_DOT = 'var(--color-accent-2)'
const BRANCH_RAIL = 'var(--color-accent-2-400)'
const REPLAY_DOT = 'var(--color-accent-700)'
const GHOST = 'var(--color-neutral-400)'
const MAIN_PILL = 'var(--color-accent-200)'
const MAIN_PILL_INK = 'var(--color-accent-700)'
const BRANCH_PILL = 'var(--color-accent-2-100)'
const BRANCH_PILL_INK = 'var(--color-accent-2-700)'
const CAPTION = 'var(--color-neutral-700)'

/** A rounded label pinned to a commit. */
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
      <text x={x + w / 2} y={y + 15} textAnchor="middle" fontSize={fontSize} fontWeight="700" fill={ink}>
        {label}
      </text>
    </>
  )
}

/* ── the graph, built up in layers rather than five hand-drawn SVGs — the
   five frames are really one picture with things added (and, at the end,
   faded), so drawing it that way is what keeps them from drifting apart. ── */

const M = [40, 120, 200, 280] // main commits, pre-existing through "you are here"
const RAIL_Y = 44 // the y-coordinate of main's horizontal rail
const F1 = { x: 240, y: 68 } // original position of the first feature commit
const F2 = { x: 280, y: 90 } // original position of the second feature commit
const F1_PRIME = 340 // x-coordinate where the replayed F1 lands on main's rail
const F2_PRIME = 400 // x-coordinate where the replayed F2 lands on main's rail

/** Draws the commit graph for the given `step`, layering queued/replayed/orphaned commits onto one base picture rather than swapping five separate SVGs. */
function RebaseGraph({ step }: { step: number }) {
  const queued = step >= 1
  const gotF1Prime = step >= 2
  const gotF2Prime = step >= 3
  const done = step >= 4
  const railEnd = gotF2Prime ? F2_PRIME + 20 : gotF1Prime ? F1_PRIME + 20 : M[3] + 20

  return (
    <svg
      viewBox="0 0 460 130"
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label="Commit graph showing the feature branch being rebased onto main"
      fontFamily="Figtree, system-ui, sans-serif"
    >
      <line x1="20" y1={RAIL_Y} x2={railEnd} y2={RAIL_Y} stroke={RAIL} strokeWidth="3" />

      {M.map((x) => (
        <circle key={x} cx={x} cy={RAIL_Y} r="11" fill={MAIN_DOT} />
      ))}

      {/* the original feature commits — solid until the rebase starts queuing
          them as patches, then faded; ghosted once they're orphaned */}
      <path
        d={`M${M[2]} ${RAIL_Y} Q ${M[2] + 25} ${RAIL_Y} ${F1.x - 20} ${F1.y - 14} L ${F1.x} ${F1.y}`}
        fill="none"
        stroke={BRANCH_RAIL}
        strokeWidth="3"
        strokeDasharray={queued ? '5 5' : undefined}
        opacity={done ? 0.3 : 1}
      />
      <path
        d={`M${F1.x} ${F1.y} L ${F2.x} ${F2.y}`}
        fill="none"
        stroke={BRANCH_RAIL}
        strokeWidth="3"
        strokeDasharray={queued ? '5 5' : undefined}
        opacity={done ? 0.3 : 1}
      />
      <circle cx={F1.x} cy={F1.y} r="11" fill={done ? GHOST : BRANCH_DOT} opacity={queued && !done ? 0.45 : 1} />
      <circle cx={F2.x} cy={F2.y} r="11" fill={done ? GHOST : BRANCH_DOT} opacity={queued && !done ? 0.45 : 1} />

      {!done ? (
        <RefPill
          x={F2.x + 10}
          y={F2.y - 4}
          w={112}
          label="feature ← HEAD"
          fill={BRANCH_PILL}
          ink={BRANCH_PILL_INK}
          fontSize={11}
        />
      ) : (
        <text x={(F1.x + F2.x) / 2} y={F2.y + 24} textAnchor="middle" fontSize="10.5" fill={CAPTION}>
          orphaned — eligible for GC
        </text>
      )}

      {/* replayed commits, appended to the end of main's rail */}
      {gotF1Prime ? (
        <>
          <path
            d={`M${F1.x} ${F1.y} Q ${(F1.x + F1_PRIME) / 2} ${F1.y} ${F1_PRIME} ${RAIL_Y}`}
            fill="none"
            stroke={GHOST}
            strokeWidth="2"
            strokeDasharray="3 4"
          />
          <circle cx={F1_PRIME} cy={RAIL_Y} r="11" fill={REPLAY_DOT} />
          <text x={F1_PRIME} y={RAIL_Y - 20} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={REPLAY_DOT}>
            F1&apos;
          </text>
        </>
      ) : null}
      {gotF2Prime ? (
        <>
          <path
            d={`M${F2.x} ${F2.y} Q ${(F2.x + F2_PRIME) / 2 + 20} ${F2.y - 10} ${F2_PRIME} ${RAIL_Y}`}
            fill="none"
            stroke={GHOST}
            strokeWidth="2"
            strokeDasharray="3 4"
          />
          <circle cx={F2_PRIME} cy={RAIL_Y} r="11" fill={REPLAY_DOT} />
          <text x={F2_PRIME} y={RAIL_Y - 20} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={REPLAY_DOT}>
            F2&apos;
          </text>
        </>
      ) : null}

      <RefPill
        x={M[3] - 24}
        y={RAIL_Y - 36}
        w={68}
        label="main"
        fill={MAIN_PILL}
        ink={MAIN_PILL_INK}
        fontSize={12}
      />
      {done ? (
        <RefPill
          x={F2_PRIME - 46}
          y={RAIL_Y - 36}
          w={112}
          label="feature ← HEAD"
          fill={BRANCH_PILL}
          ink={BRANCH_PILL_INK}
          fontSize={11}
        />
      ) : null}
    </svg>
  )
}

/* ── steps ─────────────────────────────────────────────────────────────── */

/** One frame of the rebase replay: the caption shown and the "live state" panel's values at that point. */
interface Step {
  title: string
  note: string
  live: { head: string; mainTip: string; featureTip: string; replayed: string }
}

// drives the graph, caption, terminal, and live-state panel as the learner steps through
const STEPS: Step[] = [
  {
    title: 'Where we left off',
    note: 'Same repo as the merge story: main landed one more commit while feature grew two of its own. This time, replay feature onto main instead of tying them together.',
    live: { head: 'feature', mainTip: 'M4', featureTip: 'F2 (original)', replayed: '0 of 2' },
  },
  {
    title: 'git rebase main begins',
    note: 'Git finds the last commit the two branches share, then lifts F1 and F2 off the branch and holds them as two patches waiting to be reapplied.',
    live: { head: 'feature', mainTip: 'M4', featureTip: '(detached — rebase in progress)', replayed: '0 of 2' },
  },
  {
    title: 'Patch 1 replays',
    note: 'F1’s diff is applied on top of M4, as a brand-new commit — same change, same message, a different parent and therefore a different SHA.',
    live: { head: 'feature', mainTip: 'M4', featureTip: "F1' (new SHA)", replayed: '1 of 2' },
  },
  {
    title: 'Patch 2 replays',
    note: 'F2’s diff applies on top of F1’, the same way. Two patches queued, two patches replayed.',
    live: { head: 'feature', mainTip: 'M4', featureTip: "F2' (new SHA)", replayed: '2 of 2' },
  },
  {
    title: 'Rebase complete',
    note: 'feature now points at F2’ and sits directly after main — one straight line, no merge commit. The original F1 and F2 are unreachable from any ref; git will garbage-collect them.',
    live: { head: 'feature', mainTip: 'M4 (unchanged)', featureTip: "F2' — linear with main", replayed: '2 of 2 · done' },
  },
]

// the mock terminal pane; lines are revealed up to the current step
const TERMINAL_LINES = [
  '$ git log --oneline --graph --all',
  '$ git rebase main',
  'Applying: add password reset link',
  'Applying: hash reset tokens before saving',
  'Successfully rebased and updated refs/heads/feature.',
]

// rows of the "merge vs. rebase" comparison table
const COMPARISON = [
  {
    axis: 'History shape',
    merge: 'Preserves the branch — the graph shows how it actually happened.',
    rebase: 'Rewritten into one straight line, as if it happened in order.',
  },
  {
    axis: 'New commit created',
    merge: 'Yes — a merge commit with two parents.',
    rebase: 'No — existing commits are replayed, not combined.',
  },
  {
    axis: 'Original SHAs',
    merge: 'Untouched.',
    rebase: 'Rewritten — every replayed commit gets a new SHA.',
  },
  {
    axis: 'Safe on a shared branch',
    merge: 'Always.',
    rebase: 'Only before anyone else has pulled it.',
  },
  {
    axis: 'Command',
    merge: 'git merge feature',
    rebase: 'git rebase main',
  },
]

/** The Rebase & History step-through visualizer mounted at `/rebase-history` (see file header). */
export default function RebaseHistory() {
  useDocumentTitle('Rebase & History')
  // index into STEPS for the frame currently shown
  const [step, setStep] = useState(0)

  const frame = STEPS[step]
  const atEnd = step >= STEPS.length - 1

  return (
    <div className="page">
      <TopNav note="Page type · Step-through commit visualizer" right={<Tag tone="accent">VERSION CONTROL</Tag>} />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 48px 110px' }}>
        <h1 style={{ fontSize: 42, margin: '0 0 10px', color: 'var(--color-accent-700)' }}>
          A feature branch, start to rebase
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
          The companion to <Code>git merge</Code>: same diverged history, a different way to bring it
          back together. Step through the replay and watch the SHAs change.
        </p>

        <div
          className="viz-layout"
          style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}
        >
          <div className="card elev-md" style={{ borderRadius: 'var(--radius-lg)', padding: 28 }}>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 17,
                marginBottom: 14,
                color: 'var(--color-accent-700)',
              }}
            >
              {step + 1}. {frame.title}
            </div>

            <RebaseGraph step={step} />

            <div
              aria-live="polite"
              style={{
                minHeight: 66,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: 14,
                lineHeight: 1.5,
                color: 'var(--color-neutral-800)',
                background: 'var(--color-neutral-100)',
                borderRadius: 14,
                padding: '12px 18px',
                marginTop: 14,
              }}
            >
              {frame.note}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep((n) => Math.max(n - 1, 0))}
                disabled={step === 0}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep((n) => Math.min(n + 1, STEPS.length - 1))}
                disabled={atEnd}
              >
                {atEnd ? 'Done' : 'Step →'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', gap: 5, marginTop: 16 }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 999,
                    background: i <= step ? 'var(--color-accent)' : 'var(--color-neutral-300)',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--color-neutral-700)', flexWrap: 'wrap', marginTop: 18 }}>
              {[
                ['on main', MAIN_DOT],
                ['on feature (original)', BRANCH_DOT],
                ['replayed (new SHA)', REPLAY_DOT],
                ['orphaned', GHOST],
              ].map(([label, color]) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 4, background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--color-neutral-900)', borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-neutral-400)',
                  marginBottom: 12,
                }}
              >
                Terminal
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: mono, fontSize: 12.5, lineHeight: 1.6 }}>
                {TERMINAL_LINES.slice(0, step + 1).map((line, i) => (
                  <div
                    key={line}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 8,
                      color: i === step ? 'var(--color-bg)' : 'var(--color-neutral-400)',
                      background: i === step ? 'var(--color-accent-700)' : 'transparent',
                    }}
                  >
                    {line}
                  </div>
                ))}
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
                Live state
              </div>
              {[
                ['HEAD', frame.live.head],
                ['main tip', frame.live.mainTip],
                ['feature tip', frame.live.featureTip],
                ['Commits replayed', frame.live.replayed],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5, padding: '5px 0' }}
                >
                  <span style={{ color: 'var(--color-neutral-700)' }}>{label}</span>
                  <strong style={{ fontFamily: mono, fontSize: 12.5, textAlign: 'right' }}>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Aside icon="zap" tone="accent" kicker="The golden rule" style={{ marginTop: 32 }}>
          Never rebase a branch someone else has already pulled. Every replayed commit gets a new SHA, so
          rewriting shared history forces everyone who already based work on the old commits to reconcile
          the divergence by hand. Rebase freely on a branch that's still just yours; merge once it's shared.
        </Aside>

        <h2 style={{ fontSize: 24, margin: '40px 0 14px' }}>Same problem, two different fixes</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th></th>
                <th>git merge</th>
                <th>git rebase</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.axis}>
                  <td style={{ fontWeight: 600 }}>{row.axis}</td>
                  <td>{row.axis === 'Command' ? <Code>{row.merge}</Code> : row.merge}</td>
                  <td>{row.axis === 'Command' ? <Code>{row.rebase}</Code> : row.rebase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
