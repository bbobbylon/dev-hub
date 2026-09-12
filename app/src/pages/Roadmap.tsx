/**
 * Route `/roadmap` — the five-stage backend-developer learning path, showing
 * "you are here" and locked-stage states and progress toward `TOTAL_CONCEPTS`
 * via `useProgress()`. Stage 2's chip grid links out to individual lesson
 * pages, including `/shell-scripting` and `/rebase-history` — this page is
 * one of the places those two link from. Stages 3-5 (`UPCOMING`) are locked
 * placeholders with no pages behind them yet.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { streakOf, useProgress } from '../lib/progress'
import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { Meter, Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { TOTAL_CONCEPTS } from '../data/curriculum'

/** The design's starting point, used until the learner completes anything. */
const BASELINE_DONE = 8

/** A concept chip inside a stage: done, next up, or not started. */
function Chip({
  label,
  state,
  to,
  block = false,
}: {
  label: string
  state: 'done' | 'next' | 'todo'
  to?: string
  /** Stage 2 lays its chips out in a grid; stage 1 uses inline pills. */
  block?: boolean
}) {
  const base = {
    display: block ? 'flex' : 'inline-flex',
    alignItems: 'center',
    gap: block ? 8 : 7,
    padding: block ? '11px 15px' : '9px 16px',
    borderRadius: block ? 14 : 999,
    fontSize: 13.5,
    textDecoration: 'none',
  } as const

  const style =
    state === 'done'
      ? {
          ...base,
          background: 'var(--color-accent-2-100)',
          color: 'var(--color-accent-2-700)',
          fontWeight: 600,
        }
      : state === 'next'
        ? {
            ...base,
            background: 'var(--color-accent-100)',
            color: 'var(--color-accent-700)',
            fontWeight: 700,
            border: '2px solid var(--color-accent)',
          }
        : {
            ...base,
            background: 'var(--color-neutral-100)',
            color: 'var(--color-neutral-700)',
          }

  const mark =
    state === 'done' ? (
      <Icon name="check" size={13} />
    ) : state === 'next' ? (
      <span
        style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }}
      />
    ) : null

  const content = (
    <>
      {mark}
      {label}
    </>
  )

  return to ? (
    <Link to={to} style={style}>
      {content}
    </Link>
  ) : (
    <span style={style}>{content}</span>
  )
}

/** The rail: a numbered node plus the connector down to the next stage. */
function StageRail({
  node,
  connector,
}: {
  node: ReactNode
  connector: 'accent-2' | 'neutral' | 'none'
}) {
  return (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 44,
      }}
    >
      {node}
      {connector !== 'none' ? (
        <div
          style={{
            width: 3,
            flex: 1,
            minHeight: 30,
            background:
              connector === 'accent-2' ? 'var(--color-accent-2)' : 'var(--color-neutral-300)',
          }}
        />
      ) : null}
    </div>
  )
}

/** A neutral `Tag` with a lock icon, used for the "LOCKED" / "UNLOCKS AT STAGE 2" labels. */
function LockedTag({ children }: { children: string }) {
  return (
    <Tag tone="neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <Icon name="lock" size={11} />
      {children}
    </Tag>
  )
}

/** The circular numbered node on the stage rail; filled when `state` is 'current', dimmed when 'locked'. */
function NumberNode({ n, state }: { n: number; state: 'current' | 'locked' }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-heading)',
        fontSize: 18,
        background: state === 'current' ? 'var(--color-accent)' : 'var(--color-neutral-300)',
        color: state === 'current' ? 'var(--color-bg)' : 'var(--color-neutral-700)',
        boxShadow: state === 'current' ? 'var(--shadow-md)' : undefined,
      }}
    >
      {n}
    </div>
  )
}

/** Stages 3–5 share one shape: dimmed heading, lock tag, one-line syllabus. */
const UPCOMING = [
  {
    n: 3,
    title: '3 · A First Language: Python',
    lock: 'UNLOCKS AT STAGE 2',
    syllabus: 'Variables · Control flow · Functions · Collections · Errors · Files — 6 concepts',
    last: false,
  },
  {
    n: 4,
    title: '4 · Data Structures & Algorithms',
    lock: 'LOCKED',
    syllabus: 'Arrays · Hash maps · Stacks & queues · Trees · Big-O · Sorting — 6 concepts',
    last: false,
  },
  {
    n: 5,
    title: '5 · APIs & Databases',
    lock: 'LOCKED',
    syllabus:
      'HTTP · REST · SQL basics · Joins · Auth · Deploy — 6 concepts. Ends with the capstone project.',
    last: true,
  },
]

/** The Roadmap page mounted at `/roadmap` (see file header). */
export default function Roadmap() {
  useDocumentTitle('Roadmap')
  const { state } = useProgress()
  const completed = Object.keys(state.concepts).length // concepts actually recorded as done
  const doneCount = Math.max(BASELINE_DONE, completed) // never regress below the design's baseline
  const pct = Math.round((doneCount / TOTAL_CONCEPTS) * 100)
  const streak = streakOf(state.activity)

  return (
    <div className="page">
      <TopNav
        note="Page type · Learning roadmap"
        right={<Tag tone="accent">{streak}-day streak</Tag>}
      />

      <header style={{ maxWidth: 960, margin: '0 auto', padding: '56px 48px 8px' }}>
        <Tag tone="accent-2" style={{ marginBottom: 14, display: 'inline-flex' }}>
          BACKEND PATH
        </Tag>
        <h1
          style={{
            fontSize: 46,
            lineHeight: 1.05,
            margin: '10px 0 12px',
            color: 'var(--color-accent-700)',
          }}
        >
          Your road to backend developer
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--color-neutral-700)',
            maxWidth: 560,
            margin: '0 0 10px',
          }}
        >
          Five stages, twenty-three concepts. Finish a stage to unlock the next — the path remembers
          where you left off.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '18px 0 6px' }}>
          <div style={{ flex: 1, maxWidth: 320 }}>
            <Meter value={doneCount} max={TOTAL_CONCEPTS} tone="accent-2" height={10} />
          </div>
          <span
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-2-700)' }}
          >
            {doneCount} of {TOTAL_CONCEPTS} concepts · {pct}%
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 48px 120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* stage 1 — complete */}
          <div style={{ display: 'flex', gap: 22 }}>
            <StageRail
              connector="accent-2"
              node={
                <div
                  className="elev-sm"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'var(--color-accent-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="check" size={20} color="var(--color-bg)" />
                </div>
              }
            />
            <div style={{ flex: 1, paddingBottom: 34 }}>
              <div
                style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}
              >
                <h2 style={{ fontSize: 24, margin: 0 }}>1 · Terminal &amp; Shell</h2>
                <Tag tone="accent-2">COMPLETE</Tag>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Chip label="CLI Basics" state="done" to="/cli-basics" />
                <Chip label="Shell Scripting" state="done" to="/shell-scripting" />
                <Chip label="Environment Variables" state="done" />
              </div>
            </div>
          </div>

          {/* stage 2 — you are here */}
          <div style={{ display: 'flex', gap: 22 }}>
            <StageRail connector="neutral" node={<NumberNode n={2} state="current" />} />
            <div style={{ flex: 1, paddingBottom: 34 }}>
              <div
                className="card elev-md"
                style={{ padding: '22px 24px', borderRadius: 'var(--radius-lg)' }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}
                >
                  <h2 style={{ fontSize: 24, margin: 0 }}>2 · Version Control</h2>
                  <Tag tone="accent">YOU ARE HERE</Tag>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--color-neutral-700)',
                    margin: '0 0 16px',
                    lineHeight: 1.55,
                  }}
                >
                  Git is the tool every team assumes you know. Two concepts down, two to go in this
                  stage.
                </p>
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <Chip label="Git Basics" state="done" block />
                  <Chip label="Staging & Commits" state="done" block />
                  <Chip label="Branching & Merging — next up" state="next" block />
                  <Chip label="Rebase & History" state="todo" to="/rebase-history" block />
                </div>
                <Link to="/git-branching" className="btn btn-primary" style={{ marginTop: 16 }}>
                  Continue — Branching &amp; Merging
                </Link>
              </div>
            </div>
          </div>

          {/* stages 3–5 — locked */}
          {UPCOMING.map((stage) => (
            <div key={stage.n} style={{ display: 'flex', gap: 22 }}>
              <StageRail
                connector={stage.last ? 'none' : 'neutral'}
                node={<NumberNode n={stage.n} state="locked" />}
              />
              <div style={{ flex: 1, paddingBottom: stage.last ? 0 : 34, opacity: 0.65 }}>
                <div
                  style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}
                >
                  <h2 style={{ fontSize: 22, margin: 0, color: 'var(--color-neutral-700)' }}>
                    {stage.title}
                  </h2>
                  <LockedTag>{stage.lock}</LockedTag>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', margin: 0 }}>
                  {stage.syllabus}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
