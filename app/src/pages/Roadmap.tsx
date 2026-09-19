/**
 * Route `/roadmap` — the five-stage backend-developer learning path, showing
 * "you are here" and locked-stage states and progress toward `TOTAL_CONCEPTS`
 * via `useProgress()`. Stage 2's chip grid links out to individual lesson
 * pages, including `/shell-scripting` and `/rebase-history` — this page is
 * one of the places those two link from. Stage 5 (`UPCOMING_STAGES`'s `n: 5`
 * entry, via `laterStages`) is the only stage still a fully locked
 * placeholder with no page behind any of it; stages 1-4 each have at least
 * one real, built concept now (stage 3 and stage 4 both have all six of their own).
 *
 * Every chip state, stage badge and count on this page is derived from
 * `state.concepts` against `data/concepts.ts`; none of it is hardcoded. It
 * used to be: the chips were fixed done/next/todo literals and the headline
 * count was floored at a `BASELINE_DONE = 8` that existed purely because
 * `completeConcept()` had one call site in the whole app and the real number
 * was almost always 0. Two of stage 1 and 2's seven concepts still have no
 * page to earn them on (`data/concepts.ts`, entries with no `route`), so
 * `Chip` renders them as a plain `<span>` rather than a `Link` even once
 * marked done — that marking happens from the Progress Dashboard's concept
 * list instead, since there is nowhere on this page to click through to.
 *
 * **Stage 3 and stage 4 share one JSX shape, hand-duplicated rather than
 * extracted into a component (item 35).** Both render a chip grid for their
 * real concepts plus a `NotBuiltChip` for each remaining syllabus item, with
 * a `"N OF total"` `Tag` instead of stage 2's card treatment or stage 1/5's
 * lock/complete states. Two data points don't yet justify a shared
 * `PartialStage` component over two ~20-line blocks that read fine in place;
 * revisit that call once stage 5 needs the same shape too, not before.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { streakOf, useProgress } from '../lib/progress'
import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { Meter, Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { TOTAL_CONCEPTS, UPCOMING_STAGES, syllabusOf } from '../data/curriculum'
import { type Concept, conceptsInStage, pathDone } from '../data/concepts'

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

/** A neutral `Tag` with a lock icon, used for a fully-unbuilt stage's "NOT YET BUILT" label. */
function LockedTag({ children }: { children: string }) {
  return (
    <Tag tone="neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <Icon name="lock" size={11} />
      {children}
    </Tag>
  )
}

/** A syllabus item with no page behind it yet — deliberately not a `Chip`: nothing to click. */
function NotBuiltChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 16px',
        borderRadius: 999,
        fontSize: 13.5,
        border: '1px dashed var(--color-neutral-300)',
        color: 'var(--color-neutral-700)',
      }}
    >
      {label}
      <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>· not built yet</span>
    </span>
  )
}

/** Real, relevant pages that exist off this path — a pointer, not a path concept. */
function RelatedLessons({ items }: { items: readonly { label: string; route: string }[] }) {
  return (
    <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--color-neutral-700)' }}>
      Related lessons already on the site:{' '}
      {items.map((item, i) => (
        <span key={item.route}>
          <Link to={item.route} style={{ color: 'var(--color-accent-700)' }}>
            {item.label}
          </Link>
          {i < items.length - 1 ? ', ' : ''}
        </span>
      ))}
    </div>
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

/** The Roadmap page mounted at `/roadmap` (see file header). */
export default function Roadmap() {
  useDocumentTitle('Roadmap')
  const { state } = useProgress()
  const doneCount = pathDone(state.concepts) // path concepts recorded complete, counted against the registry
  const pct = Math.round((doneCount / TOTAL_CONCEPTS) * 100)
  const streak = streakOf(state.activity)

  const stage1 = conceptsInStage(1)
  const stage2 = conceptsInStage(2)
  const stage3 = conceptsInStage(3)
  const stage4 = conceptsInStage(4)
  const isDone = (c: Concept) => Boolean(state.concepts[c.slug])
  // Exactly one chip on the page reads as "next up": the earliest concept in path order that
  // isn't done and has a page to do it on. Concepts with no `route` can't be next — nothing
  // would happen if you clicked them. Stage 4 joined this search in item 35; until every routed
  // concept in stages 1-3 is done, nextUp never reaches it, same as stage 3 never used to be
  // reached before stage 1-2 were both finished.
  const nextUp = [...stage1, ...stage2, ...stage3, ...stage4].find((c) => !isDone(c) && c.route)
  /** done / next / todo for one chip, from the learner's actual record. */
  const chipState = (c: Concept) => (isDone(c) ? 'done' : c === nextUp ? 'next' : 'todo')
  const stage1Done = stage1.filter(isDone).length
  const stage2Done = stage2.filter(isDone).length
  const stage3Done = stage3.filter(isDone).length
  const stage4Done = stage4.filter(isDone).length
  // Stage 3 and stage 4's remaining not-yet-built syllabus items — everything left in
  // UPCOMING_STAGES's n:3/n:4 entries (stage 3's is empty now; see that file for why the entry
  // stays rather than being deleted). Stage 5's is read inside `laterStages` below instead, since
  // it has no built concepts yet to pair it with.
  const stage3Upcoming = UPCOMING_STAGES.find((s) => s.n === 3)!
  const stage4Upcoming = UPCOMING_STAGES.find((s) => s.n === 4)!
  const laterStages = UPCOMING_STAGES.filter((s) => s.n > 4)

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
          Five stages, {TOTAL_CONCEPTS} concepts. Finish a stage to unlock the next — the path
          remembers where you left off.
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
          {/* stage 1 — complete once all three of its concepts are */}
          <div style={{ display: 'flex', gap: 22 }}>
            <StageRail
              connector={stage1Done === stage1.length ? 'accent-2' : 'neutral'}
              node={
                stage1Done === stage1.length ? (
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
                ) : (
                  <NumberNode n={1} state="current" />
                )
              }
            />
            <div style={{ flex: 1, paddingBottom: 34 }}>
              <div
                style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}
              >
                <h2 style={{ fontSize: 24, margin: 0 }}>1 · Terminal &amp; Shell</h2>
                {stage1Done === stage1.length ? (
                  <Tag tone="accent-2">COMPLETE</Tag>
                ) : (
                  <Tag tone="neutral">
                    {stage1Done} OF {stage1.length}
                  </Tag>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {stage1.map((c) => (
                  <Chip key={c.slug} label={c.label} state={chipState(c)} to={c.route} />
                ))}
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
                  Git is the tool every team assumes you know. {stage2Done} of {stage2.length}{' '}
                  concepts down in this stage.
                </p>
                <div className="grid grid-2" style={{ gap: 10 }}>
                  {stage2.map((c) => (
                    <Chip
                      key={c.slug}
                      label={c === nextUp ? `${c.label} — next up` : c.label}
                      state={chipState(c)}
                      to={c.route}
                      block
                    />
                  ))}
                </div>
                {nextUp?.route ? (
                  <Link to={nextUp.route} className="btn btn-primary" style={{ marginTop: 16 }}>
                    Continue — {nextUp.label}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* stage 3 — fully built: all six real concepts, nothing left not-yet-built */}
          <div style={{ display: 'flex', gap: 22 }}>
            <StageRail connector="neutral" node={<NumberNode n={3} state="current" />} />
            <div style={{ flex: 1, paddingBottom: 34 }}>
              <div
                style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}
              >
                <h2 style={{ fontSize: 24, margin: 0 }}>3 · A First Language: Python</h2>
                <Tag tone="neutral">
                  {stage3Done} OF {stage3.length + stage3Upcoming.concepts.length}
                </Tag>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {stage3.map((c) => (
                  <Chip key={c.slug} label={c.label} state={chipState(c)} to={c.route} />
                ))}
                {stage3Upcoming.concepts.map((label) => (
                  <NotBuiltChip key={label} label={label} />
                ))}
              </div>
            </div>
          </div>

          {/* stage 4 — fully built: all six real concepts, nothing left not-yet-built. Same shape
              stage 3's block above; see the file header comment for why this is a hand-duplicated
              block, not a shared one, and why `related` still renders below even now. */}
          <div style={{ display: 'flex', gap: 22 }}>
            <StageRail connector="neutral" node={<NumberNode n={4} state="current" />} />
            <div style={{ flex: 1, paddingBottom: 34 }}>
              <div
                style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}
              >
                <h2 style={{ fontSize: 24, margin: 0 }}>4 · Data Structures &amp; Algorithms</h2>
                <Tag tone="neutral">
                  {stage4Done} OF {stage4.length + stage4Upcoming.concepts.length}
                </Tag>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {stage4.map((c) => (
                  <Chip key={c.slug} label={c.label} state={chipState(c)} to={c.route} />
                ))}
                {stage4Upcoming.concepts.map((label) => (
                  <NotBuiltChip key={label} label={label} />
                ))}
              </div>
              {'related' in stage4Upcoming ? <RelatedLessons items={stage4Upcoming.related} /> : null}
            </div>
          </div>

          {/* stage 5 — fully locked, but honestly pointed at real related content */}
          {laterStages.map((stage, i) => {
            const last = i === laterStages.length - 1
            return (
            <div key={stage.n} style={{ display: 'flex', gap: 22 }}>
              <StageRail
                connector={last ? 'none' : 'neutral'}
                node={<NumberNode n={stage.n} state="locked" />}
              />
              <div style={{ flex: 1, paddingBottom: last ? 0 : 34, opacity: 0.65 }}>
                <div
                  style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}
                >
                  <h2 style={{ fontSize: 22, margin: 0, color: 'var(--color-neutral-700)' }}>
                    {stage.title}
                  </h2>
                  <LockedTag>{stage.lock}</LockedTag>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', margin: 0 }}>
                  {syllabusOf(stage)}
                </p>
                {'related' in stage ? <RelatedLessons items={stage.related} /> : null}
              </div>
            </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
