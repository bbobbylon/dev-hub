import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { useDocumentTitle } from '../components/Page'

type Status = 'done' | 'current' | 'locked'

interface Concept {
  title: string
  blurb: string
  status: Status
  to?: string
}

interface Topic {
  title: string
  concepts: Concept[]
}

const TOPICS: Topic[] = [
  {
    title: 'Terminal & Shell',
    concepts: [
      {
        title: 'CLI Basics',
        blurb: 'The dozen commands that drive any machine, in Bash, PowerShell and CMD.',
        status: 'done',
        to: '/cli-basics',
      },
      {
        title: 'Shell Scripting',
        blurb: 'Turn a chain of commands into a script you can run any time.',
        status: 'current',
      },
      {
        title: 'Environment Variables',
        blurb: 'Configuration that lives outside your code.',
        status: 'locked',
      },
    ],
  },
  {
    title: 'Version Control',
    concepts: [
      {
        title: 'Git Basics',
        blurb: 'Commits, branches, and a mental model for what git actually tracks.',
        status: 'locked',
      },
      {
        title: 'Branching & Merging',
        blurb: 'Why merges conflict, and how to resolve them without fear.',
        status: 'locked',
      },
    ],
  },
  {
    title: 'Data Structures',
    concepts: [
      {
        title: 'Arrays & Lists',
        blurb: 'The two shapes almost every other structure builds on.',
        status: 'locked',
      },
      {
        title: 'Hash Maps',
        blurb: "Constant-time lookup, and why it isn't magic.",
        status: 'locked',
      },
    ],
  },
]

const STATUS_LABEL: Record<Status, string> = {
  done: 'BEGINNER',
  current: 'IN PROGRESS',
  locked: 'LOCKED',
}

const STATUS_TAG: Record<Status, { background: string; color: string }> = {
  done: { background: 'var(--color-accent-2-100)', color: 'var(--color-accent-2-700)' },
  current: { background: 'var(--color-accent-100)', color: 'var(--color-accent-700)' },
  locked: { background: 'var(--color-neutral-100)', color: 'var(--color-neutral-700)' },
}

function StatusMark({ status }: { status: Status }) {
  if (status === 'done') return <Icon name="check" size={18} color="var(--color-accent-2-600)" />
  if (status === 'current')
    return (
      <span
        style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }}
      />
    )
  return <Icon name="lock" size={16} color="var(--color-neutral-600)" />
}

function ConceptCard({ concept }: { concept: Concept }) {
  const body = (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 999,
            ...STATUS_TAG[concept.status],
          }}
        >
          {STATUS_LABEL[concept.status]}
        </span>
        <StatusMark status={concept.status} />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 19,
          color: 'var(--color-text)',
          marginBottom: 6,
        }}
      >
        {concept.title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
        {concept.blurb}
      </div>
    </>
  )

  const style = {
    display: 'block',
    background: 'var(--color-surface)',
    borderRadius: 'calc(32px * 1.15)',
    padding: 20,
    textDecoration: 'none',
    color: 'inherit',
    ...(concept.status === 'locked'
      ? { opacity: 0.55 }
      : { boxShadow: 'var(--shadow-sm)' }),
  } as const

  return concept.to ? (
    <Link to={concept.to} className="link-card" style={style}>
      {body}
    </Link>
  ) : (
    <div style={style}>{body}</div>
  )
}

export default function DevHub() {
  useDocumentTitle('Dev Hub')

  return (
    <div className="page">
      <TopNav
        links={
          <>
            <Link to="/dev-hub" className="is-active">
              Concepts
            </Link>
            <Link to="/roadmap">Roadmap</Link>
            <Link to="/code-playground">Playground</Link>
          </>
        }
        right={
          <span className="chip">
            <Icon name="flame" size={13} color="var(--color-accent-700)" /> 4 day streak
          </span>
        }
      />

      <header className="wrap" style={{ padding: '64px 56px 40px', maxWidth: 1160 }}>
        <h1
          style={{
            fontSize: 44,
            lineHeight: 1.1,
            margin: '0 0 12px',
            color: 'var(--color-accent-700)',
          }}
        >
          Learn to code, one concept at a time
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--color-neutral-700)',
            maxWidth: 560,
            margin: '0 0 24px',
          }}
        >
          Short, brain-friendly lessons — each one a question, a real example, a quiz, and a
          hands-on walkthrough you run yourself.
        </p>
        <input
          type="search"
          className="input"
          placeholder="Search concepts… e.g. pipes, recursion, git rebase"
          style={{ maxWidth: 480 }}
          aria-label="Search concepts"
        />
      </header>

      <main className="wrap" style={{ padding: '0 56px 100px' }}>
        {TOPICS.map((topic) => {
          const done = topic.concepts.filter((c) => c.status === 'done').length
          return (
            <section key={topic.title} style={{ marginBottom: 44 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <h2 style={{ fontSize: 22, margin: 0 }}>{topic.title}</h2>
                <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>
                  {done} of {topic.concepts.length} done
                </span>
              </div>
              <div className="grid grid-3" style={{ gap: 16 }}>
                {topic.concepts.map((c) => (
                  <ConceptCard key={c.title} concept={c} />
                ))}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
