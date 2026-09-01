import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { ImageSlot } from '../components/ImageSlot'
import { syn } from '../components/CodeListing'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const mono = 'ui-monospace, Menlo, monospace'

const CHAPTERS = [
  { at: '00:00', title: "Why loops aren't always enough", state: 'done' as const },
  { at: '03:58', title: 'Base case & recursive case', state: 'current' as const },
  { at: '05:40', title: 'Visualizing the call stack', state: 'todo' as const },
  { at: '08:12', title: 'Factorial, line by line', state: 'todo' as const },
  { at: '10:30', title: 'When NOT to use recursion', state: 'todo' as const },
]

/** Chapter marks along the scrubber, as a percentage of the runtime. */
const CHAPTER_MARKS = [12, 46, 74]
const PROGRESS_PCT = 33

const COUNTDOWN_SOURCE: ReactNode[] = [
  <>
    <span style={syn.kw}>def</span> <span style={syn.fn}>countdown</span>(n):
  </>,
  <>
    {'  '}
    <span style={syn.kw}>if</span> n == 0: <span style={syn.kw}>return</span>
    {'  '}
    <span style={syn.cm}># base case</span>
  </>,
  <>
    {'  '}
    <span style={syn.fn}>print</span>(n)
  </>,
  <>
    {'  '}
    <span style={syn.fn}>countdown</span>(n - 1){'  '}
    <span style={syn.cm}># shrink the problem</span>
  </>,
]

const AFTER_VIDEO = [
  {
    to: '/quiz-mode',
    label: 'Take the 5-question checkpoint',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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
    to: '/code-playground',
    label: 'Write factorial() yourself',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
]

function PanelLabel({ children, tone = 'neutral' }: { children: string; tone?: 'neutral' | 'accent-2' }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: tone === 'accent-2' ? 'var(--color-accent-2-700)' : 'var(--color-neutral-600)',
        fontWeight: 700,
        marginBottom: tone === 'accent-2' ? 8 : 12,
      }}
    >
      {children}
    </div>
  )
}

export default function VideoLesson() {
  useDocumentTitle('Video Lesson')

  return (
    <div className="page">
      <TopNav
        note="Page type · Video lesson + transcript"
        right={<Tag tone="accent">LESSON 7 · RECURSION</Tag>}
      />

      <main
        className="split-layout"
        style={{
          maxWidth: 1160,
          margin: '0 auto',
          padding: '40px 48px 110px',
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: 28,
          alignItems: 'start',
        }}
      >
        <section>
          {/* player */}
          <div
            className="elev-lg"
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'var(--color-neutral-900)',
            }}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
              <ImageSlot placeholder="Drop the lesson still / poster frame here" />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  className="elev-lg"
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="var(--color-bg)"
                    style={{ marginLeft: 4 }}
                    aria-hidden="true"
                  >
                    <path d="M6 4l14 8-14 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <span
                style={{ fontSize: 12, color: 'var(--color-neutral-400)', fontFamily: mono }}
              >
                04:12 / 12:38
              </span>
              <div
                style={{
                  flex: 1,
                  height: 7,
                  borderRadius: 999,
                  background: 'color-mix(in srgb, var(--color-neutral-100) 15%, transparent)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: `${PROGRESS_PCT}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: 'var(--color-accent)',
                  }}
                />
                {CHAPTER_MARKS.map((left) => (
                  <span
                    key={left}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      top: -3,
                      width: 3,
                      height: 13,
                      borderRadius: 2,
                      background: 'var(--color-accent-2-300)',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>1.25×</span>
            </div>
          </div>

          <h1
            style={{
              fontSize: 32,
              margin: '24px 0 8px',
              color: 'var(--color-accent-700)',
            }}
          >
            Recursion: the function that calls itself
          </h1>
          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.65,
              color: 'var(--color-neutral-700)',
              margin: '0 0 22px',
            }}
          >
            Follow along — the transcript highlights as the video plays, and every code snippet shown
            on screen appears beside the paragraph where it's discussed.
          </p>

          {/* transcript — the active paragraph is tinted */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', gap: 16, padding: '14px 18px', borderRadius: 16 }}>
              <span
                style={{
                  flex: 'none',
                  fontFamily: mono,
                  fontSize: 12,
                  color: 'var(--color-neutral-500)',
                  width: 44,
                }}
              >
                02:40
              </span>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: 'var(--color-neutral-700)',
                  margin: 0,
                }}
              >
                …so instead of a loop that counts down, imagine handing the problem to a slightly
                smaller version of itself. That handoff is the whole trick.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 16,
                padding: '14px 18px',
                borderRadius: 16,
                background: 'var(--color-accent-100)',
              }}
            >
              <span
                style={{
                  flex: 'none',
                  fontFamily: mono,
                  fontSize: 12,
                  color: 'var(--color-accent-700)',
                  width: 44,
                  fontWeight: 700,
                }}
              >
                04:12
              </span>
              <div>
                <p
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.65,
                    color: 'var(--color-neutral-900)',
                    margin: '0 0 10px',
                  }}
                >
                  <strong>Every recursive function needs two parts.</strong> The base case — when to
                  stop — and the recursive case, which shrinks the problem. Forget the base case and
                  you get a stack overflow: the function calls itself forever.
                </p>
                <div
                  style={{
                    background: 'var(--color-neutral-900)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontFamily: mono,
                    fontSize: 12.5,
                    lineHeight: 1.7,
                    overflowX: 'auto',
                  }}
                >
                  {COUNTDOWN_SOURCE.map((line, i) => (
                    <div key={i} style={{ whiteSpace: 'pre', color: 'var(--color-neutral-100)' }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, padding: '14px 18px', borderRadius: 16 }}>
              <span
                style={{
                  flex: 'none',
                  fontFamily: mono,
                  fontSize: 12,
                  color: 'var(--color-neutral-500)',
                  width: 44,
                }}
              >
                05:03
              </span>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: 'var(--color-neutral-700)',
                  margin: 0,
                }}
              >
                Watch the call stack build up on screen: countdown(3) waits for countdown(2), which
                waits for countdown(1)… then they all unwind in reverse order.
              </p>
            </div>
          </div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            className="card elev-md"
            style={{ borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}
          >
            <PanelLabel>Chapters</PanelLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {CHAPTERS.map((c) => {
                const current = c.state === 'current'
                return (
                  <div
                    key={c.at}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      padding: '9px 12px',
                      borderRadius: 12,
                      fontSize: 13.5,
                      background: current ? 'var(--color-accent-100)' : undefined,
                      fontWeight: current ? 700 : undefined,
                      color: current ? 'var(--color-accent-800)' : 'var(--color-neutral-700)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11.5,
                        color: current ? 'var(--color-accent-700)' : 'var(--color-neutral-500)',
                      }}
                    >
                      {c.at}
                    </span>
                    {c.title}
                    {c.state === 'done' ? (
                      <Icon
                        name="check"
                        size={13}
                        color="var(--color-accent-2-600)"
                        style={{ marginLeft: 'auto' }}
                      />
                    ) : null}
                    {current ? (
                      <span
                        style={{
                          marginLeft: 'auto',
                          flex: 'none',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--color-accent)',
                        }}
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-accent-2-100)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
            }}
          >
            <PanelLabel tone="accent-2">Your notes · auto-timestamped</PanelLabel>
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--color-neutral-800)',
                marginBottom: 8,
              }}
            >
              <span
                style={{ fontFamily: mono, fontSize: 11, color: 'var(--color-accent-2-700)' }}
              >
                04:20
              </span>{' '}
              — base case first, ALWAYS. stack overflow = missing base case
            </div>
            <input
              className="input"
              type="text"
              placeholder="Add a note at 04:12…"
              style={{ width: '100%', fontSize: 13 }}
              aria-label="Add a timestamped note"
            />
          </div>

          <div className="card" style={{ borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
            <PanelLabel>After the video</PanelLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AFTER_VIDEO.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    fontSize: 13.5,
                    color: 'var(--color-accent-700)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
