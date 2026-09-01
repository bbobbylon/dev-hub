import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

/* ── data ──────────────────────────────────────────────────────────────── */

const MINUTES = [25, 0, 40, 22, 15, 0, 30, 45, 20, 0, 35, 28, 24, 31]
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAILY_GOAL = 20
const CHART_CEILING = 45

const STATS = [
  {
    label: 'Streak',
    value: '4',
    unit: 'days',
    note: 'Best: 11 — keep going',
    noteColor: 'var(--color-accent-2-700)',
    valueColor: 'var(--color-accent-700)',
  },
  {
    label: 'This week',
    value: '3.2',
    unit: 'hours',
    note: 'Goal: 4 h · 80% there',
    valueColor: 'var(--color-accent-700)',
  },
  {
    label: 'Concepts done',
    value: '8',
    unit: 'of 23',
    note: 'Backend path · 34%',
    valueColor: 'var(--color-accent-700)',
  },
  {
    label: 'Quiz accuracy',
    value: '86%',
    note: 'First-try, last 30 days',
    valueColor: 'var(--color-accent-2-700)',
  },
]

const PATH_BREAKDOWN = [
  { color: 'var(--color-accent-2)', label: '8 mastered' },
  { color: 'var(--color-accent)', label: '2 in progress' },
  { color: 'var(--color-neutral-400)', label: '13 locked' },
]

/* Donut geometry: r=46 → circumference ≈ 289; 34% ≈ 98 of it. */
const DONUT_R = 46
const DONUT_CIRCUMFERENCE = Math.round(2 * Math.PI * DONUT_R)
const PATH_PCT = 34
const DONUT_FILLED = Math.round((PATH_PCT / 100) * DONUT_CIRCUMFERENCE)

interface Badge {
  name: ReactNode
  icon: ReactNode
  earned: boolean
  tone: 'accent' | 'accent-2' | 'neutral'
}

const BADGES: Badge[] = [
  {
    name: 'Terminal Tamer',
    earned: true,
    tone: 'accent',
    icon: <Icon name="terminal" size={26} color="var(--color-accent-700)" />,
  },
  {
    name: '7-Day Flame',
    earned: true,
    tone: 'accent-2',
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-accent-2-700)"
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
    ),
  },
  {
    name: (
      <>
        Bug Hunter
        <br />2 of 5 cases
      </>
    ),
    earned: false,
    tone: 'neutral',
    icon: <Icon name="lock" size={24} color="var(--color-neutral-500)" />,
  },
  {
    name: (
      <>
        First Path
        <br />
        34%
      </>
    ),
    earned: false,
    tone: 'neutral',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-neutral-500)"
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M15.5 13 17 22l-5-3-5 3 1.5-9" />
      </svg>
    ),
  },
]

const UP_NEXT = [
  {
    to: '/flashcards',
    label: '5 flashcards due (HTTP deck)',
    time: '4 min',
    accented: true,
    icon: (
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
    ),
  },
  {
    to: '/quiz-mode',
    label: 'Retry: exit codes checkpoint',
    time: '5 min',
    accented: false,
    icon: (
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
    ),
  },
  {
    to: '/git-branching',
    label: 'Continue: Branching & Merging',
    time: '6 min',
    accented: false,
    icon: (
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
    ),
  },
]

/* ── small pieces ──────────────────────────────────────────────────────── */

function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-neutral-600)',
        fontWeight: 700,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  )
}

/* ── page ──────────────────────────────────────────────────────────────── */

export default function ProgressDashboard() {
  useDocumentTitle('Progress Dashboard')

  return (
    <div className="page">
      <TopNav
        note="Page type · Personal stats dashboard"
        right={<Tag tone="accent">4-DAY STREAK</Tag>}
      />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 48px 110px' }}>
        <h1 style={{ fontSize: 38, margin: '0 0 6px', color: 'var(--color-accent-700)' }}>
          Nice pace, Ada
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
                  <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>{s.unit}</span>
                ) : null}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: s.noteColor ?? 'var(--color-neutral-600)',
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
              {MINUTES.map((m, i) => (
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
                  <span style={{ fontSize: 10, color: 'var(--color-neutral-500)' }}>
                    {DAY_LABELS[i]}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 14,
                fontSize: 12,
                color: 'var(--color-neutral-600)',
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
              <svg width="110" height="110" viewBox="0 0 110 110" role="img" aria-label={`${PATH_PCT}% of the path complete`}>
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
                  {PATH_PCT}%
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
              <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginBottom: 8 }}>
                Weakest topic by quiz score
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ fontSize: 14, fontWeight: 700 }}>Exit codes</span>
                <Link
                  to="/quiz-mode"
                  style={{
                    fontSize: 13,
                    color: 'var(--color-accent-700)',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Review →
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
                      color: b.earned ? 'var(--color-neutral-700)' : 'var(--color-neutral-500)',
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
            <PanelLabel>Up next — 15 minutes total</PanelLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {UP_NEXT.map((item) => (
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
                  <span
                    style={{
                      fontSize: 12,
                      color: item.accented
                        ? 'var(--color-accent-700)'
                        : 'var(--color-neutral-600)',
                    }}
                  >
                    {item.time}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
