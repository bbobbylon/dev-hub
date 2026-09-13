/**
 * Progress Dashboard — route `/progress-dashboard`, a personal stats
 * dashboard. It is the single biggest consumer of `src/lib/progress.ts`:
 * besides the `useProgress()` hook it imports the standalone helpers
 * `streakOf`, `recentMinutes`, and `isDue` directly to derive a streak
 * counter, a 14-day minutes bar chart, a path-completion donut, quiz
 * accuracy, badges, and an "up next" queue that links out to Flashcards,
 * Quiz Mode, and Git Branching.
 *
 * It also owns the only controls that touch the whole progress blob at once — the "Your data"
 * panel at the bottom: export a backup (`lib/progressFile.ts`), import one back over the top of
 * the current state, and reset, which calls `useProgress().reset()` and wipes the localStorage
 * progress every other page in the app reads from.
 */
import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { isDue, recentMinutes, streakOf, useProgress, weakestTopic } from '../lib/progress'
import { downloadProgress, parseProgressFile, summarize } from '../lib/progressFile'
import { apiEnabled } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { TOTAL_CONCEPTS } from '../data/curriculum'
import { CONCEPTS, CONCEPT_BY_SLUG, conceptsInStage, offPathDone, PATH_CONCEPTS, pathDone } from '../data/concepts'
import { DECK_NAME, DECK_TAGS } from '../data/httpDeck'
import { PASS_MARK, QUIZ_ID } from '../data/gitBasicsQuiz'

/* ── data ──────────────────────────────────────────────────────────────── */

// Minutes/day threshold that colors a chart bar as "hit goal"
const DAILY_GOAL = 20
// Bar-chart y-axis ceiling, in minutes
const CHART_CEILING = 45
// Target weekly hours shown in the "This week" stat's note
const WEEKLY_GOAL_HOURS = 4
// Single-letter weekday labels under the minutes bar chart
const DAY_INITIAL = ['S', 'M', 'T', 'W', 'T', 'F', 'S']


/* Donut geometry: r=46 → circumference ≈ 289; 34% ≈ 98 of it. */
const DONUT_R = 46
const DONUT_CIRCUMFERENCE = Math.round(2 * Math.PI * DONUT_R)

/** One badge tile in the "Badges" panel; `earned` swaps a dashed ring for a solid one. */
interface Badge {
  name: ReactNode
  icon: ReactNode
  earned: boolean
  tone: 'accent' | 'accent-2' | 'neutral'
}

// Badge icon shapes are fixed (the original design's art); only the stroke color follows real
// `earned` state, matching the ring around it — accent-colored and solid when earned, neutral and
// dashed when not. Bug Hunter's icon also swaps shape outright: a lock reads oddly once the thing
// it's "locking" has actually been done.
function terminalTamerIcon(earned: boolean) {
  return <Icon name="terminal" size={26} color={earned ? 'var(--color-accent-700)' : 'var(--color-neutral-500)'} />
}

function flameIcon(earned: boolean) {
  const color = earned ? 'var(--color-accent-2-700)' : 'var(--color-neutral-500)'
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="m4.9 4.9 2.9 2.9" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="m16.2 7.8 2.9-2.9" />
    </svg>
  )
}

function bugHunterIcon(earned: boolean) {
  return earned ? (
    <Icon name="bug" size={24} color="var(--color-accent-700)" />
  ) : (
    <Icon name="lock" size={24} color="var(--color-neutral-500)" />
  )
}

function firstPathIcon(earned: boolean) {
  const color = earned ? 'var(--color-accent-2-700)' : 'var(--color-neutral-500)'
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.5 13 17 22l-5-3-5 3 1.5-9" />
    </svg>
  )
}

// "Up next" queue icons — unlike the icons above, these don't change with state: they name the
// slot (flashcards / checkpoint / next lesson), not an earned/unearned status.
const FLASHCARDS_ICON = (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--color-accent-700)"
    strokeWidth={2.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="6" width="16" height="12" rx="3" />
    <path d="M22 8v10a2 2 0 0 1-2 2H8" />
  </svg>
)

const QUIZ_ICON = (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--color-neutral-700)"
    strokeWidth={2.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)

const CONTINUE_ICON = (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--color-neutral-700)"
    strokeWidth={2.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M6 9v3a3 3 0 0 0 3 3h6" />
  </svg>
)

/* ── small pieces ──────────────────────────────────────────────────────── */

/** `QuizMode`'s question topics are shouty constants ("MENTAL MODEL") for the palette tags; this
 *  page shows one in prose, so it reads as a label instead. */
const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

/** Small uppercase label heading a dashboard panel. */
function PanelLabel({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </div>
  )
}

/* ── page ──────────────────────────────────────────────────────────────── */

/** Stats dashboard: streak, weekly minutes, path completion, badges, and next actions, all derived from real `useProgress()` state. */
export default function ProgressDashboard() {
  useDocumentTitle('Progress Dashboard')
  const { state, reset, importState } = useProgress()
  const { user } = useAuth()

  // The file picker behind the "Import backup" button, and the one-line result shown under it.
  const fileRef = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null)

  /** Reads the chosen file, validates it, and — once confirmed — replaces all progress with it. */
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Cleared immediately so picking the same file twice in a row still fires a change event.
    e.target.value = ''
    if (!file) return
    try {
      const next = parseProgressFile(await file.text())
      const summary = summarize(next)
      if (!confirm(`Replace your current progress with ${summary} from ${file.name}?`)) {
        setNote(null)
        return
      }
      importState(next)
      setNote({ text: `Restored ${summary}.`, ok: true })
    } catch (err) {
      setNote({ text: err instanceof Error ? err.message : 'That file could not be read.', ok: false })
    }
  }

  // Where progress actually lives right now, which depends on both the build and the account.
  const storageNote = !apiEnabled
    ? 'Progress is stored in this browser only — nothing leaves the device. Export a backup before clearing site data or switching browsers.'
    : user
      ? 'Progress is saved in this browser and synced to your account. A file backup still works if you ever sign out for good.'
      : 'Progress is stored in this browser. Sign in to sync it across devices, or keep a file backup.'

  const days = recentMinutes(state.activity, 14) // last 14 days' minutes, oldest first
  const streak = streakOf(state.activity) // consecutive active days counting back from today
  const weekMinutes = days.slice(-7).reduce((n, d) => n + d.minutes, 0) // minutes across the last 7 of those days
  // Counted against the concept registry, not `Object.keys(...).length`: the record also holds
  // concepts that sit off the five-stage path, and those must not move a figure labelled
  // "Backend path". They get their own line under the tile instead.
  const conceptsDone = pathDone(state.concepts)
  const extraDone = offPathDone(state.concepts)
  const attempts = Object.values(state.quizzes)
  const accuracy = attempts.length
    ? Math.round(
        (attempts.reduce((n, q) => n + q.best / q.total, 0) / attempts.length) * 100,
      )
    : 0
  const pathPct = Math.round((conceptsDone / TOTAL_CONCEPTS) * 100)
  const cardsDue = DECK_TAGS.filter((tag) => isDue(state.cards[tag])).length

  // Stat tiles rendered across the top of the page
  const STATS = [
    {
      label: 'Streak',
      value: String(streak),
      unit: streak === 1 ? 'day' : 'days',
      note: streak > 0 ? 'Keep it going' : 'Start today',
      noteColor: 'var(--color-accent-2-700)',
      valueColor: 'var(--color-accent-700)',
    },
    {
      label: 'This week',
      value: (weekMinutes / 60).toFixed(1),
      unit: 'hours',
      note: `Goal: ${WEEKLY_GOAL_HOURS} h · ${Math.min(100, Math.round((weekMinutes / 60 / WEEKLY_GOAL_HOURS) * 100))}% there`,
      valueColor: 'var(--color-accent-700)',
    },
    {
      label: 'Concepts done',
      value: String(conceptsDone),
      unit: `of ${TOTAL_CONCEPTS}`,
      note: extraDone
        ? `Backend path · ${pathPct}% · +${extraDone} off-path`
        : `Backend path · ${pathPct}%`,
      valueColor: 'var(--color-accent-700)',
    },
    {
      label: 'Quiz accuracy',
      value: `${accuracy}%`,
      note: attempts.length ? 'Best score, per checkpoint' : 'No checkpoints yet',
      valueColor: 'var(--color-accent-2-700)',
    },
  ]

  // Donut legend rows: mastered / due / not-started, in that ring order
  const PATH_BREAKDOWN = [
    { color: 'var(--color-accent-2)', label: `${conceptsDone} mastered` },
    { color: 'var(--color-accent)', label: `${cardsDue} due for review` },
    {
      color: 'var(--color-neutral-400)',
      label: `${TOTAL_CONCEPTS - conceptsDone} not started`,
    },
  ]

  const DONUT_FILLED = Math.round((pathPct / 100) * DONUT_CIRCUMFERENCE) // arc length, in stroke-dasharray units, for the completed slice

  // The topic that most needs review, across every checkpoint's most-recent attempt. `null` until
  // a checkpoint has actually been taken — there's no real answer to "weakest topic" before then.
  const weakTopic = weakestTopic(state.quizzes)

  // Real badge conditions, derived from the same state the rest of the page reads. Each replaces
  // a badge the design shipped with a fixed earned/unearned value and, for two of the four, a
  // fixed stat line ("2 of 5 cases", "34%") with no data behind it. All four now carry a second
  // line of real progress rather than just the two that used to fake one — earned is otherwise
  // only a border style (dashed → solid), which a screen reader and a script reading page text
  // can't see, so leaving two badges with no textual difference at all would just move the
  // "hardcoded" problem into an accessibility one.
  const stage1Routed = conceptsInStage(1).filter((c) => c.route)
  const stage1Done = stage1Routed.filter((c) => state.concepts[c.slug]).length
  const terminalTamerEarned = stage1Routed.length > 0 && stage1Done === stage1Routed.length
  const flameEarned = streak >= 7
  const debuggingConcept = CONCEPT_BY_SLUG['debugging-challenge']
  const bugHunterEarned = Boolean(debuggingConcept && state.concepts[debuggingConcept.slug])
  const firstPathEarned = pathPct >= 100

  const BADGES: Badge[] = [
    {
      name: (
        <>
          Terminal Tamer
          <br />
          {stage1Done} of {stage1Routed.length} lessons
        </>
      ),
      earned: terminalTamerEarned,
      tone: 'accent',
      icon: terminalTamerIcon(terminalTamerEarned),
    },
    {
      name: (
        <>
          7-Day Flame
          <br />
          {flameEarned ? `${streak}-day streak` : `${streak} of 7 days`}
        </>
      ),
      earned: flameEarned,
      tone: 'accent-2',
      icon: flameIcon(flameEarned),
    },
    {
      name: (
        <>
          Bug Hunter
          <br />
          {bugHunterEarned ? 'Case closed' : (debuggingConcept?.label ?? 'Debugging Challenge')}
        </>
      ),
      earned: bugHunterEarned,
      tone: bugHunterEarned ? 'accent' : 'neutral',
      icon: bugHunterIcon(bugHunterEarned),
    },
    {
      name: (
        <>
          First Path
          <br />
          {firstPathEarned ? 'Complete' : `${pathPct}%`}
        </>
      ),
      earned: firstPathEarned,
      tone: firstPathEarned ? 'accent-2' : 'neutral',
      icon: firstPathIcon(firstPathEarned),
    },
  ]

  // "Up next" queue: three real recommendations instead of a fixed template. Each entry used to
  // carry an invented minute estimate ("4 min", summing to a fake "15 minutes total" header) —
  // dropped rather than replaced, since no page anywhere in the app records how long it takes.
  const quizRecord = state.quizzes[QUIZ_ID]
  const quizVerb = !quizRecord ? 'Take' : quizRecord.best < PASS_MARK ? 'Retry' : 'Review'
  // The next not-yet-complete lesson with a page: path concepts first (Roadmap order), skipping
  // `git-basics` since the checkpoint above already covers it, then off-path concepts.
  const nextConcept =
    PATH_CONCEPTS.find((c) => c.route && c.slug !== QUIZ_ID && !state.concepts[c.slug]) ??
    CONCEPTS.find((c) => c.stage === null && c.route && !state.concepts[c.slug])

  const upNext = [
    {
      to: '/flashcards',
      label: `${cardsDue} flashcard${cardsDue === 1 ? '' : 's'} due (${DECK_NAME})`,
      accented: true,
      icon: FLASHCARDS_ICON,
    },
    {
      to: '/quiz-mode',
      label: `${quizVerb}: Git Basics checkpoint`,
      accented: false,
      icon: QUIZ_ICON,
    },
    nextConcept
      ? {
          to: nextConcept.route as string,
          label: `Continue: ${nextConcept.label}`,
          accented: false,
          icon: CONTINUE_ICON,
        }
      : {
          to: '/roadmap',
          label: 'Every lesson with a page is done — nice work',
          accented: false,
          icon: CONTINUE_ICON,
        },
  ]

  return (
    <div className="page">
      <TopNav
        note="Page type · Personal stats dashboard"
        right={<Tag tone="accent">{streak}-DAY STREAK</Tag>}
      />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 48px 110px' }}>
        <h1 style={{ fontSize: 38, margin: '0 0 6px', color: 'var(--color-accent-700)' }}>
          Nice pace
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--color-neutral-700)', margin: '0 0 30px' }}>
          Your week in learning — streaks, minutes, and what to hit next.
        </p>

        {/* stat tiles */}
        <div className="grid grid-4" style={{ gap: 14, marginBottom: 22 }}>
          {STATS.map((s) => (
            <div
              key={s.label}
              className="card elev-sm"
              style={{ borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}
            >
              <PanelLabel>{s.label}</PanelLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 34,
                    color: s.valueColor,
                  }}
                >
                  {s.value}
                </span>
                {s.unit ? (
                  <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>{s.unit}</span>
                ) : null}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: s.noteColor ?? 'var(--color-neutral-700)',
                  marginTop: 6,
                }}
              >
                {s.note}
              </div>
            </div>
          ))}
        </div>

        {/* minutes bar chart + path donut */}
        <div
          className="split-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: 14,
            marginBottom: 22,
            alignItems: 'start',
          }}
        >
          <div
            className="card elev-sm"
            style={{ borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}
          >
            <PanelLabel>Minutes per day, last two weeks</PanelLabel>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150 }}>
              {days.map(({ minutes: m, date }, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div
                    title={`${m} min`}
                    style={{
                      width: '100%',
                      borderRadius: '8px 8px 4px 4px',
                      height: `${Math.max(4, Math.round((m / CHART_CEILING) * 100))}%`,
                      background:
                        m >= DAILY_GOAL ? 'var(--color-accent)' : 'var(--color-neutral-300)',
                    }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--color-neutral-700)' }}>
                    {DAY_INITIAL[date.getDay()]}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 14,
                fontSize: 12,
                color: 'var(--color-neutral-700)',
                marginTop: 12,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-accent)' }}
                />
                hit daily goal ({DAILY_GOAL} min)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: 'var(--color-neutral-300)',
                  }}
                />
                under goal
              </span>
            </div>
          </div>

          <div
            className="card elev-sm"
            style={{ borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}
          >
            <PanelLabel>Path completion</PanelLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <svg width="110" height="110" viewBox="0 0 110 110" role="img" aria-label={`${pathPct}% of the path complete`}>
                <circle
                  cx="55"
                  cy="55"
                  r={DONUT_R}
                  fill="none"
                  stroke="var(--color-neutral-300)"
                  strokeWidth="12"
                />
                <circle
                  cx="55"
                  cy="55"
                  r={DONUT_R}
                  fill="none"
                  stroke="var(--color-accent-2)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${DONUT_FILLED} ${DONUT_CIRCUMFERENCE - DONUT_FILLED}`}
                  transform="rotate(-90 55 55)"
                />
                <text
                  x="55"
                  y="61"
                  textAnchor="middle"
                  fontFamily="Caprasimo, serif"
                  fontSize="22"
                  fill="var(--color-accent-2-700)"
                >
                  {pathPct}%
                </text>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                {PATH_BREAKDOWN.map((b) => (
                  <span
                    key={b.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: 'var(--color-neutral-800)',
                    }}
                  >
                    <span
                      style={{ width: 9, height: 9, borderRadius: '50%', background: b.color }}
                    />
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px solid var(--color-neutral-300)',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--color-neutral-700)', marginBottom: 8 }}>
                Weakest topic by quiz score
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  {weakTopic ? titleCase(weakTopic.topic) : 'No checkpoints yet'}
                </span>
                <Link
                  to="/quiz-mode"
                  style={{
                    fontSize: 13,
                    color: 'var(--color-accent-700)',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {weakTopic ? 'Review →' : 'Take one →'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* badges + up next */}
        <div className="grid grid-2" style={{ gap: 14, alignItems: 'start' }}>
          <div
            className="card elev-sm"
            style={{ borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}
          >
            <PanelLabel>Badges</PanelLabel>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {BADGES.map((b, i) => (
                <div key={i} style={{ textAlign: 'center', width: 86 }}>
                  <div
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: '50%',
                      background: `var(--color-${b.tone}-100)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 6px',
                      border: b.earned
                        ? `2px solid var(--color-${b.tone})`
                        : '2px dashed var(--color-neutral-400)',
                    }}
                  >
                    {b.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 11.5,
                      color: b.earned ? 'var(--color-neutral-700)' : 'var(--color-neutral-700)',
                      lineHeight: 1.3,
                      display: 'block',
                    }}
                  >
                    {b.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="card elev-sm"
            style={{ borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}
          >
            <PanelLabel>Up next</PanelLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upNext.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: item.accented
                      ? 'var(--color-accent-100)'
                      : 'var(--color-neutral-100)',
                    textDecoration: 'none',
                  }}
                >
                  {item.icon}
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: item.accented
                        ? 'var(--color-accent-800)'
                        : 'var(--color-neutral-800)',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        {/* backup, restore, reset — everything that acts on the whole progress blob at once */}
        <div
          className="card elev-sm"
          style={{ borderRadius: 'var(--radius-lg)', padding: '22px 24px', marginTop: 22 }}
        >
          <PanelLabel>Your data</PanelLabel>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <p
              style={{
                fontSize: 12.5,
                color: 'var(--color-neutral-700)',
                margin: 0,
                maxWidth: 480,
                lineHeight: 1.5,
              }}
            >
              {storageNote}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 12.5 }}
                onClick={() =>
                  setNote({ text: `Saved ${downloadProgress(state)}.`, ok: true })
                }
              >
                Export backup
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 12.5 }}
                onClick={() => fileRef.current?.click()}
              >
                Import backup
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 12.5 }}
                onClick={() => {
                  if (confirm('Clear all saved progress? This cannot be undone.')) {
                    reset()
                    setNote({ text: 'Progress cleared.', ok: true })
                  }
                }}
              >
                Reset progress
              </button>
            </div>
          </div>
          {/* Driven by the button above rather than shown directly, so the row keeps its
              three matching buttons; named for the a11y audit, which checks every input. */}
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            aria-label="Progress backup file"
            onChange={onFile}
            style={{ display: 'none' }}
          />
          {note ? (
            <p
              role="status"
              style={{
                fontSize: 12.5,
                margin: '14px 0 0',
                color: note.ok ? 'var(--color-accent-2-700)' : 'var(--color-accent-700)',
              }}
            >
              {note.text}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  )
}
