import type { ReactNode } from 'react'
import { TopNav } from '../components/TopNav'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/Page'

const mono = 'ui-monospace, Menlo, monospace'

interface Entry {
  cmd: string
  what: string
}

const START: Entry[] = [
  { cmd: 'git init', what: 'new repo in this folder' },
  { cmd: 'git clone URL', what: 'copy an existing repo' },
  { cmd: 'git remote -v', what: 'where push/pull go' },
]

const DAILY: Entry[] = [
  { cmd: 'git status', what: "what changed, what's staged" },
  { cmd: 'git add -p', what: 'stage hunk by hunk — review as you go' },
  { cmd: 'git commit -m "msg"', what: 'snapshot the staged set' },
  { cmd: 'git pull --rebase', what: "get teammates' commits first" },
  { cmd: 'git push', what: 'publish your commits' },
]

const BRANCHES: Entry[] = [
  { cmd: 'git switch -c feat/x', what: 'create + move to a branch' },
  { cmd: 'git switch main', what: 'jump back' },
  { cmd: 'git merge feat/x', what: 'weave a branch into this one' },
  { cmd: 'git branch -d feat/x', what: 'delete merged branch' },
  { cmd: 'git log --oneline --graph', what: 'see the shape of history' },
]

const OH_NO: Entry[] = [
  { cmd: 'git restore file', what: 'discard unstaged edits' },
  { cmd: 'git restore --staged file', what: 'un-stage, keep edits' },
  { cmd: 'git commit --amend', what: 'fix the last commit / message' },
  { cmd: 'git revert SHA', what: 'undo publicly, safely' },
  { cmd: 'git reflog', what: 'the "undelete" of last resort' },
]

/** `inverted` is the terracotta-filled "Oh no" column. */
function ColumnHead({ n, title, inverted = false }: { n: number; title: string; inverted?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: inverted ? 'var(--color-bg)' : 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-heading)',
          fontSize: 13,
          color: inverted ? 'var(--color-accent-700)' : 'var(--color-bg)',
        }}
      >
        {n}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 16,
          color: inverted ? 'var(--color-bg)' : undefined,
        }}
      >
        {title}
      </span>
    </div>
  )
}

function Entries({ entries, inverted = false }: { entries: Entry[]; inverted?: boolean }) {
  return (
    <>
      {entries.map((e, i) => (
        <div key={e.cmd}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              color: inverted ? 'var(--color-accent-200)' : 'var(--color-accent-700)',
              fontWeight: 700,
            }}
          >
            {e.cmd}
          </div>
          <div
            style={{
              fontSize: 12,
              color: inverted ? 'var(--color-accent-100)' : 'var(--color-neutral-700)',
              margin: i === entries.length - 1 ? '2px 0 0' : '2px 0 10px',
            }}
          >
            {e.what}
          </div>
        </div>
      ))}
    </>
  )
}

function Aside({
  tone,
  label,
  children,
}: {
  tone: 'accent' | 'accent-2'
  label: string
  children: ReactNode
}) {
  return (
    <div
      style={{
        background: `var(--color-${tone}-100)`,
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
          color: `var(--color-${tone}-700)`,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>
        {children}
      </div>
    </div>
  )
}

function DangerCode({ children }: { children: string }) {
  return (
    <code
      style={{
        background: 'var(--color-bg)',
        padding: '1px 6px',
        borderRadius: 5,
        fontFamily: mono,
      }}
    >
      {children}
    </code>
  )
}

export default function CheatSheet() {
  useDocumentTitle('Cheat Sheet')

  return (
    <div className="page">
      <TopNav
        note="Page type · Dense reference / cheat sheet"
        right={
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
            onClick={() => window.print()}
          >
            Print / PDF
          </button>
        }
      />

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '44px 48px 100px' }}>
        <div
          style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 6, flexWrap: 'wrap' }}
        >
          <h1 style={{ fontSize: 40, margin: 0, color: 'var(--color-accent-700)' }}>
            Git cheat sheet
          </h1>
          <Tag tone="neutral">THE 80% YOU USE DAILY</Tag>
        </div>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-600)', margin: '0 0 32px' }}>
          Pin this. Column order follows a real working session: set up → daily loop → branches →
          fixing mistakes.
        </p>

        <div className="grid grid-4" style={{ gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
              <ColumnHead n={1} title="Start" />
              <Entries entries={START} />
            </div>
            <Aside tone="accent-2" label="Mnemonic">
              <strong>A</strong>dd → <strong>C</strong>ommit → <strong>P</strong>ush. "
              <em>All Cats Pounce.</em>" That's the daily loop.
            </Aside>
          </div>

          <div className="card" style={{ borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
            <ColumnHead n={2} title="Daily loop" />
            <Entries entries={DAILY} />
          </div>

          <div className="card" style={{ borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
            <ColumnHead n={3} title="Branches" />
            <Entries entries={BRANCHES} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: 'var(--color-accent-700)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
              }}
            >
              <ColumnHead n={4} title="Oh no" inverted />
              <Entries entries={OH_NO} inverted />
            </div>
            <Aside tone="accent" label="Danger zone">
              <DangerCode>reset --hard</DangerCode> and <DangerCode>push --force</DangerCode> destroy
              work. Never on shared branches.
            </Aside>
          </div>
        </div>
      </main>
    </div>
  )
}
