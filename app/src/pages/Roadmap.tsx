/**
 * Route `/roadmap` — the five-stage backend-developer learning path, showing
 * "you are here" states and progress toward `TOTAL_CONCEPTS` via
 * `useProgress()`. Stage 2's chip grid links out to individual lesson pages,
 * including `/shell-scripting` and `/rebase-history` — this page is one of
 * the places those two link from. All five stages have at least one real,
 * built concept now (stage 3 and stage 4 have all six of their own; stage 5
 * has five — HTTP item 41, REST item 42, SQL Basics item 43, Joins item 44,
 * Auth item 45) — no stage on this page is a fully locked
 * placeholder any more, and the `LockedTag`/locked-`NumberNode` machinery a
 * fully-locked stage used to need is gone rather than left idle: once stage
 * 5 has a real concept, `UPCOMING_STAGES.filter((s) => s.n > 5)` is
 * permanently empty (this is a five-stage path; there is no stage 6), so the
 * block that used to render it could never run again either. See
 * `PartialStage`'s own comment for the rest of this round's restructuring.
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
 * **Stages 3, 4 and 5 share one JSX shape, now a real `PartialStage`
 * component (item 41) instead of the hand-duplicated blocks items 35-40 each
 * kept in place.** The file's own comment named the exact trigger for making
 * that call — "two data points don't yet justify it; revisit once stage 5
 * needs the same shape too, not before" — and stage 5 needing it, for real,
 * is what this round is. Each stage renders a chip grid for its real
 * concepts plus a `NotBuiltChip` for whatever's still unbuilt, with a
 * `"N OF total"` `Tag` instead of stage 2's card treatment or stage 1's
 * complete-checkmark state.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { streakOf, useProgress } from '../lib/progress'
import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { Meter, Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { TOTAL_CONCEPTS, UPCOMING_STAGES } from '../data/curriculum'
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

/** The circular numbered node on the stage rail. Every stage is unlocked now (item 41), so it's
 *  always filled — the dimmed 'locked' variant this used to support was removed alongside
 *  `LockedTag`, since neither had anything left to render once stage 5 got a real concept. */
function NumberNode({ n }: { n: number }) {
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
        background: 'var(--color-accent)',
        color: 'var(--color-bg)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {n}
    </div>
  )
}

/**
 * A fully-derived "N of total" stage block — extracted at item 41 (Stage 5's first concept, HTTP)
 * per the trigger the file header names: stages 3 and 4 each had this exact shape hand-duplicated
 * since item 35, and a third repetition for stage 5 is what the original comment was waiting for.
 * Renders the stage's real concept chips, a `NotBuiltChip` for whatever's still unbuilt, and
 * `RelatedLessons` when the `UPCOMING_STAGES` entry names any — unconditionally, even once a stage
 * is fully built, since those pages stay genuinely useful review material rather than pointers to
 * unbuilt content (see `data/curriculum.ts`'s own reasoning). `connector` is `'none'` only for
 * whichever stage is currently the last block on the page — right now, stage 5.
 */
function PartialStage({
  n,
  title,
  done,
  built,
  upcoming,
  chipState,
  connector,
}: {
  n: number
  title: string
  done: number
  built: Concept[]
  upcoming: (typeof UPCOMING_STAGES)[number]
  chipState: (c: Concept) => 'done' | 'next' | 'todo'
  connector: 'neutral' | 'none'
}) {
  return (
    <div style={{ display: 'flex', gap: 22 }}>
      <StageRail connector={connector} node={<NumberNode n={n} />} />
      <div style={{ flex: 1, paddingBottom: connector === 'none' ? 0 : 34 }}>
        <div
          style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}
        >
          <h2 style={{ fontSize: 24, margin: 0 }}>{title}</h2>
          <Tag tone="neutral">
            {done} OF {built.length + upcoming.concepts.length}
          </Tag>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {built.map((c) => (
            <Chip key={c.slug} label={c.label} state={chipState(c)} to={c.route} />
          ))}
          {upcoming.concepts.map((label) => (
            <NotBuiltChip key={label} label={label} />
          ))}
        </div>
        {'related' in upcoming ? <RelatedLessons items={upcoming.related} /> : null}
      </div>
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
  const stage5 = conceptsInStage(5)
  const isDone = (c: Concept) => Boolean(state.concepts[c.slug])
  // Exactly one chip on the page reads as "next up": the earliest concept in path order that
  // isn't done and has a page to do it on. Concepts with no `route` can't be next — nothing
  // would happen if you clicked them. Stage 4 joined this search in item 35, stage 5 in item 41;
  // until every routed concept in the stages before it is done, nextUp never reaches it, same as
  // stage 3 never used to be reached before stage 1-2 were both finished.
  const nextUp = [...stage1, ...stage2, ...stage3, ...stage4, ...stage5].find(
    (c) => !isDone(c) && c.route,
  )
  /** done / next / todo for one chip, from the learner's actual record. */
  const chipState = (c: Concept) => (isDone(c) ? 'done' : c === nextUp ? 'next' : 'todo')
  const stage1Done = stage1.filter(isDone).length
  const stage2Done = stage2.filter(isDone).length
  const stage3Done = stage3.filter(isDone).length
  const stage4Done = stage4.filter(isDone).length
  const stage5Done = stage5.filter(isDone).length
  // Stages 3-5's remaining not-yet-built syllabus items — everything left in UPCOMING_STAGES's
  // n:3/n:4/n:5 entries (stage 3 and stage 4's are empty now; see that file for why the entries
  // stay rather than being deleted).
  const stage3Upcoming = UPCOMING_STAGES.find((s) => s.n === 3)!
  const stage4Upcoming = UPCOMING_STAGES.find((s) => s.n === 4)!
  const stage5Upcoming = UPCOMING_STAGES.find((s) => s.n === 5)!

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
                  <NumberNode n={1} />
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
            <StageRail connector="neutral" node={<NumberNode n={2} />} />
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
          <PartialStage
            n={3}
            title="3 · A First Language: Python"
            done={stage3Done}
            built={stage3}
            upcoming={stage3Upcoming}
            chipState={chipState}
            connector="neutral"
          />

          {/* stage 4 — fully built: all six real concepts, nothing left not-yet-built */}
          <PartialStage
            n={4}
            title="4 · Data Structures & Algorithms"
            done={stage4Done}
            built={stage4}
            upcoming={stage4Upcoming}
            chipState={chipState}
            connector="neutral"
          />

          {/* stage 5 — its first five real concepts (HTTP item 41, REST item 42, SQL Basics
              item 43, Joins item 44, Auth item 45); the last block on the page now, so its rail
              connector stops here instead of continuing down. */}
          <PartialStage
            n={5}
            title="5 · APIs & Databases"
            done={stage5Done}
            built={stage5}
            upcoming={stage5Upcoming}
            chipState={chipState}
            connector="none"
          />
        </div>
      </main>
    </div>
  )
}
