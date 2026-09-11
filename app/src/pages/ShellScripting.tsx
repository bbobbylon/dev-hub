/**
 * Route `/shell-scripting` — "STEP-THROUGH VIZ" that walks through a fixed `backup.sh` bash
 * script line by line, pairing the highlighted `SCRIPT` lines with a terminal transcript and a
 * live variable-state panel driven by `STEPS`. It was added later to fix a dead sidebar link
 * from CLI Basics; its `SIDEBAR` constant hand-duplicates `src/data/cliBasics.ts`'s `SIDEBAR`
 * rather than importing it (see the comment above `SIDEBAR` below), so the two lists must be
 * kept in sync by hand. Also renders a `CopyPanel` cheat sheet (`CHEAT_LEFT`/`CHEAT_RIGHT`) and
 * a closing `Aside` discussion prompt.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { streakOf, useProgress } from '../lib/progress'
import { TopNav } from '../components/TopNav'
import { ConceptSidebar, type SidebarGroup } from '../components/ConceptSidebar'
import { SectionHead } from '../components/SectionHead'
import { CodeListing, type ListingLine, syn } from '../components/CodeListing'
import { CopyPanel, commandsOf, type CodeLine } from '../components/CopyPanel'
import { useCopy } from '../components/useCopy'
import { Aside } from '../components/Aside'
import { Icon } from '../components/Icon'
import { Code, Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const mono = 'ui-monospace, Menlo, monospace'

/* Same sidebar data CLI Basics uses, with Shell Scripting now the current
   stop and a real link back to it — it used to be an 'open' item with no
   `to`, which the sidebar renders as unreachable regardless of its state. */
const SIDEBAR: SidebarGroup[] = [
  {
    title: 'Terminal & Shell',
    items: [
      { label: 'CLI Basics', state: 'open', to: '/cli-basics' },
      { label: 'Shell Scripting', state: 'current' },
      { label: 'Environment Variables', state: 'locked' },
    ],
  },
  {
    title: 'Version Control',
    items: [
      { label: 'Git Basics', state: 'locked' },
      { label: 'Branching & Merging', state: 'locked' },
    ],
  },
]

/* ── the script, walked through five times as it "runs" ──────────────────── */

// The backup.sh source, rendered in the CodeListing pane with the current step's lines highlighted.
const SCRIPT: ListingLine[] = [
  { content: <><span style={syn.cm}>#!/usr/bin/env bash</span></> },
  { content: <><span style={syn.kw}>set</span> -e</> },
  { content: <></> },
  { content: <><span style={syn.fn}>NAME</span>=<span style={syn.str}>"devhub"</span></> },
  { content: <><span style={syn.fn}>STAMP</span>=$(date +%Y%m%d)</> },
  { content: <><span style={syn.fn}>DEST</span>=<span style={syn.str}>"backups/${'{NAME}'}-${'{STAMP}'}.tar.gz"</span></> },
  { content: <></> },
  { content: <><span style={syn.kw}>if</span> [ ! -d <span style={syn.str}>"backups"</span> ]; <span style={syn.kw}>then</span></> },
  { content: <>{'  '}mkdir backups</> },
  { content: <><span style={syn.kw}>fi</span></> },
  { content: <></> },
  { content: <>tar -czf <span style={syn.str}>"$DEST"</span> src/</> },
  { content: <><span style={syn.fn}>echo</span> <span style={syn.str}>"Backed up to $DEST"</span></> },
]

/** One walkthrough frame: which SCRIPT lines it highlights, its explanation, and the resulting variable/terminal state. */
interface Step {
  title: string
  note: string
  lines: number[]
  terminal?: string
  state: { name: string; stamp: string; dest: string; backupsDir: string }
}

// The five-step walkthrough driving the highlighted lines, terminal output, and variables panel.
const STEPS: Step[] = [
  {
    title: 'Name the interpreter, then bail out on the first error',
    note: 'Line 1 tells the OS which program should run this file — without it, "./backup.sh" would try to execute the text as a command. set -e is the safety net: the moment any line fails, the whole script stops instead of plowing ahead with a half-finished backup.',
    lines: [0, 1],
    terminal: '$ ./backup.sh',
    state: { name: '—', stamp: '—', dest: '—', backupsDir: 'not checked yet' },
  },
  {
    title: 'Build the file name once, in three small pieces',
    note: '$(date +%Y%m%d) is command substitution — bash runs date and drops its output straight into STAMP. Wrapping the pieces as ${NAME} and ${STAMP} keeps the dash and dot that follow from being read as part of the variable name.',
    lines: [3, 4, 5],
    state: { name: '"devhub"', stamp: '20260907', dest: 'backups/devhub-20260907.tar.gz', backupsDir: 'not checked yet' },
  },
  {
    title: 'Only create what does not already exist',
    note: '[ ! -d "backups" ] asks "is this not a directory?" — the ! negates the test. Quoting "backups" is a habit that pays off the day a path has a space in it. Since the folder is missing, the body between then and fi runs.',
    lines: [7, 8, 9],
    state: { name: '"devhub"', stamp: '20260907', dest: 'backups/devhub-20260907.tar.gz', backupsDir: 'created' },
  },
  {
    title: 'Quote the variable, every time',
    note: 'tar -czf "$DEST" src/ — create, gzip, this filename. Drop the quotes around $DEST and a space anywhere in the path would split it into two arguments; tar would read the second half as another file to archive.',
    lines: [11],
    state: { name: '"devhub"', stamp: '20260907', dest: 'backups/devhub-20260907.tar.gz', backupsDir: 'created' },
  },
  {
    title: 'Say so — silence is ambiguous',
    note: "tar itself prints nothing on success. The closing echo is the only signal a human (or a cron job's log) gets that the backup actually happened, rather than having exited early on some earlier failure.",
    lines: [12],
    terminal: 'Backed up to backups/devhub-20260907.tar.gz',
    state: { name: '"devhub"', stamp: '20260907', dest: 'backups/devhub-20260907.tar.gz', backupsDir: 'created' },
  },
]

// Left CopyPanel: commands to make a script executable and run it.
const CHEAT_LEFT: CodeLine[] = [
  { text: 'chmod +x backup.sh', comment: '# make it runnable' },
  { text: './backup.sh' },
  { comment: '# not "backup.sh" — bash won\'t search . by default' },
]

// Right CopyPanel: common `[ ]` test conditions.
const CHEAT_RIGHT: CodeLine[] = [
  { text: '[ -f "$FILE" ]', comment: '# file exists?' },
  { text: '[ -d "$DIR" ]', comment: '# directory exists?' },
  { text: '[ -z "$VAR" ]', comment: '# string is empty?' },
  { text: '[ "$A" = "$B" ]', comment: '# strings equal — spaces required' },
]

/** The Shell Scripting step-through page — walks `SCRIPT` via `STEPS`, plus a reference cheat sheet. */
export default function ShellScripting() {
  useDocumentTitle('Shell Scripting')
  const { state } = useProgress()
  const streak = streakOf(state.activity)
  const { copied, copy } = useCopy() // shared copy-to-clipboard state for both CopyPanels below

  const [step, setStep] = useState(0) // index into STEPS for the current walkthrough frame
  const frame = STEPS[step]
  const atEnd = step >= STEPS.length - 1
  const highlighted = new Set(frame.lines)

  return (
    <div className="page">
      <TopNav
        to="/dev-hub"
        links={
          <>
            <Link to="/dev-hub">Concepts</Link>
            <Link to="/roadmap">Roadmap</Link>
            <Link to="/code-playground">Playground</Link>
          </>
        }
        right={
          <span className="chip">
            <Icon name="flame" size={13} color="var(--color-accent-700)" /> {streak} day streak
          </span>
        }
      />

      <div
        className="lesson-layout"
        style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '260px 1fr' }}
      >
        <ConceptSidebar groups={SIDEBAR} />

        <main style={{ padding: '48px 56px 120px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <Tag tone="accent-2">BEGINNER</Tag>
            <Tag tone="neutral">10 MIN READ</Tag>
          </div>

          <h1 style={{ fontSize: 52, lineHeight: 1.05, margin: '0 0 16px', color: 'var(--color-accent-700)' }}>
            Shell Scripting
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--color-neutral-700)', maxWidth: 660, margin: '0 0 40px' }}>
            CLI Basics was one command at a time. The moment you type the{' '}
            <em>same chain of commands</em> twice, it belongs in a file you can run instead —
            that file is a shell script.
          </p>

          <SectionHead kicker="Step through it" title="Reading backup.sh" marginBottom={16}>
            Five commands, one script. Step through each one and watch what the shell actually
            does with it.
          </SectionHead>

          <div
            className="viz-layout"
            style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, alignItems: 'start', marginBottom: 44 }}
          >
            <div>
              <CodeListing
                filename="backup.sh"
                note={`step ${step + 1} of ${STEPS.length}`}
                lines={SCRIPT.map((line, i) => ({ ...line, highlight: highlighted.has(i) }))}
              />

              <div
                aria-live="polite"
                style={{
                  marginTop: 14,
                  padding: '14px 18px',
                  borderRadius: 14,
                  background: 'var(--color-neutral-100)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  {step + 1}. {frame.title}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--color-neutral-800)' }}>
                  {frame.note}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
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

              <div style={{ display: 'flex', gap: 5, marginTop: 14 }}>
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
                  {STEPS.slice(0, step + 1)
                    .map((s) => s.terminal)
                    .filter((line): line is string => Boolean(line))
                    .map((line, i, arr) => (
                      <div
                        key={line}
                        style={{
                          padding: '3px 10px',
                          borderRadius: 8,
                          color: i === arr.length - 1 ? 'var(--color-bg)' : 'var(--color-neutral-400)',
                          background: i === arr.length - 1 ? 'var(--color-accent-700)' : 'transparent',
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
                  Variables right now
                </div>
                {[
                  ['NAME', frame.state.name],
                  ['STAMP', frame.state.stamp],
                  ['DEST', frame.state.dest],
                  ['backups/', frame.state.backupsDir],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5, padding: '5px 0' }}>
                    <span style={{ color: 'var(--color-neutral-700)' }}>{label}</span>
                    <strong style={{ fontFamily: mono, fontSize: 12, textAlign: 'right', wordBreak: 'break-all' }}>
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Aside icon="zap" tone="accent" kicker="The habit that saves you" style={{ marginBottom: 40 }}>
            Quote every variable that might hold a path: <Code>"$DEST"</Code>, not <Code>$DEST</Code>.
            Without the quotes, a space or a blank value silently changes how many arguments the
            next command sees — one of the most common ways a working script breaks on someone
            else's machine.
          </Aside>

          <SectionHead kicker="Reference" title="Two things you'll type constantly" marginBottom={16} />
          <div className="grid grid-2" style={{ gap: 16, marginBottom: 40 }}>
            <CopyPanel
              title="Making a script runnable"
              lines={CHEAT_LEFT}
              copied={copied === 'runnable'}
              onCopy={() => copy(commandsOf(CHEAT_LEFT), 'runnable')}
            />
            <CopyPanel
              title="Conditions inside [ ]"
              lines={CHEAT_RIGHT}
              copied={copied === 'conditions'}
              onCopy={() => copy(commandsOf(CHEAT_RIGHT), 'conditions')}
            />
          </div>

          <Aside tone="accent-2" icon="brain" kicker="Brain power" rounder emphasis>
            backup.sh always names the archive after today's date. Run it twice in one day and the
            second run silently overwrites the first. What's the smallest change to STAMP that would
            let it run more than once a day without collisions?
          </Aside>
        </main>
      </div>
    </div>
  )
}
