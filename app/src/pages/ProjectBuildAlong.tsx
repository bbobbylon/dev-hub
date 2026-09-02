import { useProgress } from '../lib/progress'
import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const mono = 'ui-monospace, Menlo, monospace'

const MILESTONES = [
  {
    title: '1 · Print the last 10 lines of a file',
    desc: 'Argument parsing + tail. Error message and exit 1 if the file is missing.',
    ref: 'CLI Basics',
  },
  {
    title: '2 · Follow the file as it grows',
    desc: 'The live loop — new lines appear as they are written.',
    ref: 'CLI Basics · pipes',
  },
  {
    title: '3 · Add --filter PATTERN',
    desc: 'Only lines matching the pattern pass through. Pipe through your grep wrapper.',
    ref: 'Regex Lab',
  },
  {
    title: '4 · Exit codes + stderr',
    desc: 'Errors to stderr, meaningful exit codes — make it scriptable by others.',
    ref: 'CLI Basics · exit codes',
  },
  {
    title: '5 · README + ship it',
    desc: 'Write usage docs, init a repo, commit history that tells the story.',
    ref: 'Git Basics',
  },
]

const INITIAL_DONE = [true, true, false, false, false]

function Criterion({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 9 }}>
      <span style={{ color: 'var(--color-accent)' }}>◆</span>
      <span>{children}</span>
    </div>
  )
}

function Mono({ children }: { children: string }) {
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

const PAGE = 'project-build-along'

export default function ProjectBuildAlong() {
  useDocumentTitle('Project Build-Along')
  const { state, toggleMilestone } = useProgress()

  // Falls back to the design's starting state until the learner touches a box,
  // so a first visit still looks like the mockup rather than an empty list.
  const touched = MILESTONES.some((_, i) => `${PAGE}:${i}` in state.milestones)
  const done = MILESTONES.map((_, i) =>
    touched ? !!state.milestones[`${PAGE}:${i}`] : INITIAL_DONE[i],
  )

  const toggle = (i: number) => {
    if (!touched) {
      // Seed every box from the design defaults so the first click doesn't
      // silently clear the others.
      MILESTONES.forEach((_, j) => toggleMilestone(`${PAGE}:${j}`, j === i ? !INITIAL_DONE[j] : INITIAL_DONE[j]))
      return
    }
    toggleMilestone(`${PAGE}:${i}`)
  }

  const pct = Math.round((done.filter(Boolean).length / done.length) * 100)

  return (
    <div className="page">
      <TopNav
        note="Page type · Capstone project brief"
        right={<Tag tone="accent-2">{pct}% BUILT</Tag>}
      />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent" style={{ display: 'inline-flex', marginBottom: 14 }}>
          CAPSTONE · TERMINAL &amp; SHELL PATH
        </Tag>
        <h1 style={{ fontSize: 42, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Build: a log-watching CLI tool
        </h1>
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            maxWidth: 640,
            margin: '0 0 34px',
          }}
        >
          No tutorial hand-holding here — a real brief, acceptance criteria, and milestones you check
          off yourself. Everything you need was covered in the last five concepts; each milestone
          links back if you're stuck.
        </p>

        <div
          className="split-layout"
          style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22, alignItems: 'start' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MILESTONES.map((m, i) => {
              const isDone = done[i]
              return (
                <button
                  key={m.title}
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={isDone}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-lg)',
                    fontFamily: 'var(--font-body)',
                    background: isDone
                      ? 'var(--color-accent-2-100)'
                      : 'var(--color-neutral-100)',
                    border: `2px solid ${isDone ? 'var(--color-accent-2)' : 'var(--color-neutral-300)'}`,
                  }}
                >
                  <span
                    style={{
                      flex: 'none',
                      width: 26,
                      height: 26,
                      borderRadius: 9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1,
                      background: isDone ? 'var(--color-accent-2)' : 'var(--color-bg)',
                      border: `2px solid ${isDone ? 'var(--color-accent-2)' : 'var(--color-neutral-400)'}`,
                    }}
                  >
                    {isDone ? <Icon name="check" size={14} color="var(--color-bg)" /> : null}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 15,
                        fontWeight: 700,
                        color: isDone ? 'var(--color-accent-2-800)' : 'var(--color-text)',
                        textDecoration: isDone ? 'line-through' : undefined,
                      }}
                    >
                      {m.title}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: 'var(--color-neutral-700)',
                        marginTop: 3,
                      }}
                    >
                      {m.desc}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        marginTop: 8,
                        fontSize: 11.5,
                        color: 'var(--color-accent-700)',
                        fontWeight: 600,
                      }}
                    >
                      ↩ covered in: {m.ref}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              className="card elev-md"
              style={{ borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-neutral-700)',
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                Definition of done
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 9,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: 'var(--color-neutral-800)',
                }}
              >
                <Criterion>
                  <Mono>watchlog app.log</Mono> follows the file live, like tail -f
                </Criterion>
                <Criterion>
                  <Mono>--filter ERROR</Mono> shows only matching lines
                </Criterion>
                <Criterion>
                  Exit code 1 when the file doesn't exist, with a clear message on stderr
                </Criterion>
                <Criterion>A README with install + usage — someone else can run it</Criterion>
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-neutral-900)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
              }}
            >
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-neutral-400)',
                  marginBottom: 10,
                }}
              >
                Suggested file layout
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 12.5,
                  lineHeight: 1.9,
                  color: 'var(--color-neutral-100)',
                }}
              >
                <div>watchlog/</div>
                <div>
                  ├── <span style={{ color: 'var(--color-accent-2-300)' }}>watchlog.sh</span>{' '}
                  <span style={{ color: 'var(--color-neutral-500)' }}># entry point</span>
                </div>
                <div>
                  ├── <span style={{ color: 'var(--color-accent-2-300)' }}>lib/filter.sh</span>{' '}
                  <span style={{ color: 'var(--color-neutral-500)' }}># grep wrapper</span>
                </div>
                <div>
                  ├── <span style={{ color: 'var(--color-accent-2-300)' }}>test/run_tests.sh</span>
                </div>
                <div>
                  └── <span style={{ color: 'var(--color-accent-2-300)' }}>README.md</span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-accent-100)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--color-accent-700)',
                  marginBottom: 6,
                }}
              >
                Stuck for 20+ minutes?
              </div>
              <div
                style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}
              >
                That's the productive kind of stuck. Re-read the linked concept, try one more
                approach, <em>then</em> peek at the reference solution below.
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: 10, fontSize: 12.5 }}
              >
                Reveal reference solution
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
