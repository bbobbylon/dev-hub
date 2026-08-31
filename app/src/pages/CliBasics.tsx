import { useState } from 'react'
import { Link } from 'react-router-dom'

import { TopNav } from '../components/TopNav'
import { ConceptSidebar } from '../components/ConceptSidebar'
import { CopyPanel, commandsOf } from '../components/CopyPanel'
import { SectionHead } from '../components/SectionHead'
import { Icon } from '../components/Icon'
import { Code } from '../components/ui'
import { useCopy } from '../components/useCopy'
import { useDocumentTitle } from '../components/Page'
import {
  ANATOMY,
  ANATOMY_ORDER,
  BASH_LINES,
  COMMAND_GROUPS,
  PIPES_LINES,
  PS_LINES,
  QUIZ,
  SIDEBAR,
  WALKTHROUGH,
  WHY_CLI,
  type AnatomyKey,
} from '../data/cliBasics'

/* ── the clickable command anatomy ─────────────────────────────────────── */

function CommandAnatomy() {
  const [selected, setSelected] = useState<AnatomyKey>('command')
  const def = ANATOMY[selected]

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHead kicker="Try it — click a part" title="Anatomy of a CLI command">
        A command is typically <Code>[command] [flags/options] [arguments]</Code>. Click each part
        of the example below.
      </SectionHead>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 16,
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: 19,
          flexWrap: 'wrap',
        }}
      >
        {ANATOMY_ORDER.map((key) => {
          const active = key === selected
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              aria-pressed={active}
              style={{
                cursor: 'pointer',
                padding: '10px 16px',
                borderRadius: 12,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                color: active ? 'var(--color-bg)' : 'var(--color-text)',
                border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`,
              }}
            >
              {ANATOMY[key].token}
            </button>
          )
        })}
      </div>

      <div
        style={{
          background: 'var(--color-neutral-200)',
          borderRadius: 20,
          padding: '16px 20px',
          minHeight: 60,
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-accent-700)',
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {def.label}
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5 }}>{def.text}</div>
      </div>
    </section>
  )
}

/* ── the quiz: answer once, then the row locks and explains itself ─────── */

function QuickQuiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({})

  const answer = (qi: number, oi: number) => {
    if (answers[qi] !== undefined) return
    setAnswers((prev) => ({ ...prev, [qi]: oi }))
  }

  return (
    <section style={{ marginBottom: 52 }}>
      <SectionHead kicker="Check yourself" title="Quick quiz" marginBottom={16} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {QUIZ.map((q, qi) => {
          const chosen = answers[qi]
          const answered = chosen !== undefined
          const correct = answered && chosen === q.correct

          return (
            <div
              key={q.question}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'calc(var(--radius-lg) * 1.15)',
                padding: '20px 22px',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{q.question}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((text, oi) => {
                  let style: React.CSSProperties = {
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1.5px solid var(--color-divider)',
                  }
                  if (answered) {
                    if (oi === q.correct) {
                      style = {
                        background: 'var(--color-accent-2-100)',
                        color: 'var(--color-accent-2-700)',
                        border: '1.5px solid var(--color-accent-2-600)',
                      }
                    } else if (oi === chosen) {
                      style = {
                        background: 'var(--color-accent-100)',
                        color: 'var(--color-accent-700)',
                        border: '1.5px solid var(--color-accent-600)',
                      }
                    } else {
                      style = { ...style, opacity: 0.5 }
                    }
                  }
                  return (
                    <button
                      key={text}
                      type="button"
                      onClick={() => answer(qi, oi)}
                      disabled={answered}
                      style={{
                        textAlign: 'left',
                        cursor: answered ? 'default' : 'pointer',
                        padding: '10px 14px',
                        borderRadius: 12,
                        fontFamily: 'inherit',
                        fontSize: 14,
                        ...style,
                      }}
                    >
                      {text}
                    </button>
                  )
                })}
              </div>
              {answered ? (
                <div style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.5 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: correct ? 'var(--color-accent-2-700)' : 'var(--color-accent-700)',
                    }}
                  >
                    {correct ? 'Correct.' : 'Not quite.'}{' '}
                  </span>
                  {q.explanation}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ── the terminal walkthrough: reveal output, then advance ─────────────── */

function Walkthrough() {
  const [step, setStep] = useState(0)
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})

  return (
    <section style={{ marginBottom: 24 }}>
      <SectionHead kicker="Let's use this for real" title="Find every huge log file">
        A step-by-step terminal walkthrough. Reveal each command's output before moving to the next
        step.
      </SectionHead>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {WALKTHROUGH.map((s, i) => {
          const isCurrent = i === step
          const isPast = i < step
          const isFuture = i > step
          const isRevealed = !!revealed[i]

          return (
            <div key={s.command} style={{ display: 'flex', gap: 16, opacity: isFuture ? 0.4 : 1 }}>
              <div
                style={{
                  flex: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg)',
                  }}
                >
                  {isPast ? <Icon name="check" size={14} color="var(--color-bg)" /> : i + 1}
                </div>
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    background: 'var(--color-divider)',
                    minHeight: 24,
                  }}
                />
              </div>

              <div style={{ flex: 1, paddingBottom: 28 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{s.instruction}</div>
                <div
                  style={{
                    background: 'var(--color-neutral-900)',
                    borderRadius: 16,
                    padding: '12px 16px',
                    fontFamily: 'ui-monospace, Menlo, monospace',
                    fontSize: 13,
                    color: 'var(--color-accent-200)',
                  }}
                >
                  $ {s.command}
                </div>

                {isRevealed ? (
                  <>
                    <div
                      style={{
                        background: 'var(--color-neutral-800)',
                        borderRadius: '0 0 16px 16px',
                        marginTop: -4,
                        padding: '12px 16px',
                        fontFamily: 'ui-monospace, Menlo, monospace',
                        fontSize: 13,
                        color: 'var(--color-neutral-100)',
                        whiteSpace: 'pre-wrap',
                        animation: 'pop 0.25s ease',
                      }}
                    >
                      {s.output}
                    </div>
                    <div
                      style={{
                        fontSize: 13.5,
                        color: 'var(--color-neutral-700)',
                        marginTop: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      {s.explain}
                    </div>
                  </>
                ) : null}

                {isCurrent && !isRevealed ? (
                  <button
                    type="button"
                    onClick={() => setRevealed((prev) => ({ ...prev, [i]: true }))}
                    style={{
                      marginTop: 10,
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: 999,
                      background: 'var(--color-accent)',
                      color: 'var(--color-bg)',
                      border: 'none',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 13,
                    }}
                  >
                    Run it →
                  </button>
                ) : null}

                {isCurrent && isRevealed && i < WALKTHROUGH.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((n) => n + 1)}
                    style={{
                      marginTop: 10,
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: 999,
                      background: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-divider)',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 13,
                    }}
                  >
                    Next step →
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ── page ──────────────────────────────────────────────────────────────── */

export default function CliBasics() {
  useDocumentTitle('CLI Basics')
  const { copied, copy } = useCopy()

  return (
    <div className="page">
      <TopNav
        to="/dev-hub"
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

      <div
        className="lesson-layout"
        style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '260px 1fr' }}
      >
        <ConceptSidebar groups={SIDEBAR} />

        <main style={{ padding: '48px 56px 120px', maxWidth: 800 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.05em',
                padding: '4px 11px',
                borderRadius: 999,
                background: 'var(--color-accent-2-100)',
                color: 'var(--color-accent-2-700)',
              }}
            >
              BEGINNER
            </span>
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.05em',
                padding: '4px 11px',
                borderRadius: 999,
                background: 'var(--color-neutral-100)',
                color: 'var(--color-neutral-700)',
              }}
            >
              15 MIN READ
            </span>
          </div>

          <h1
            style={{
              fontSize: 52,
              lineHeight: 1.05,
              margin: '0 0 16px',
              color: 'var(--color-accent-700)',
            }}
          >
            CLI Basics
          </h1>

          <p
            style={{
              fontSize: 17,
              lineHeight: 1.65,
              color: 'var(--color-neutral-700)',
              maxWidth: 640,
              margin: '0 0 36px',
            }}
          >
            The command line is just a <strong style={{ color: 'var(--color-text)' }}>conversation</strong>:
            the shell prints a <em>prompt</em>, you type a command, it runs and prints the result,
            then prompts again. Master a dozen commands — move around, look at files, create and
            delete things, and ask for help — and you can drive any machine. This page shows them in{' '}
            <strong style={{ color: 'var(--color-text)' }}>Bash</strong>,{' '}
            <strong style={{ color: 'var(--color-text)' }}>PowerShell</strong>, and{' '}
            <strong style={{ color: 'var(--color-text)' }}>CMD</strong> together.
          </p>

          {/* the spoken "big question" bubble */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              background: 'var(--color-neutral-200)',
              borderRadius: 'calc(var(--radius-lg) * 1.1)',
              padding: '22px 26px',
              marginBottom: 44,
            }}
          >
            <div
              style={{
                flex: 'none',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="terminal" size={19} color="var(--color-bg)" />
            </div>
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.45,
                fontWeight: 700,
                color: 'var(--color-accent-700)',
                margin: '2px 0 0',
              }}
            >
              What is the command line — and why does every developer eventually need to know at
              least 12 commands that work on any machine?
            </p>
          </div>

          <section style={{ marginBottom: 40 }}>
            <SectionHead kicker="The idea" title="What is the CLI, really?" />
            <p
              style={{
                fontSize: 15.5,
                lineHeight: 1.7,
                color: 'var(--color-neutral-800)',
                margin: 0,
              }}
            >
              The command-line interface (CLI) is a text-based way to interact with an operating
              system and its programs. Instead of clicking icons in a GUI, you type commands that
              the shell interprets and executes. The shell is the program that accepts your
              commands, figures out which program to run, runs it, and shows you the output. On
              Linux/macOS the default shell is usually Bash or Zsh. On Windows, PowerShell is the
              modern shell, with CMD (cmd.exe) being the legacy option.
            </p>
          </section>

          <section style={{ marginBottom: 40 }}>
            <SectionHead kicker="Motivation" title="Why learn the CLI at all?" marginBottom={16} />
            <div className="grid grid-2" style={{ gap: 14 }}>
              {WHY_CLI.map((item) => (
                <div
                  key={item.n}
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'calc(var(--radius-lg) * 1.15)',
                    padding: '16px 18px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 20,
                      color: 'var(--color-accent)',
                      marginBottom: 6,
                    }}
                  >
                    {item.n}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div
                    style={{ fontSize: 13, color: 'var(--color-neutral-700)', lineHeight: 1.5 }}
                  >
                    {item.body}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <CommandAnatomy />

          <section style={{ marginBottom: 40 }}>
            <SectionHead kicker="Reference" title="The 12 commands you must know" marginBottom={16} />
            {COMMAND_GROUPS.map((group) => (
              <div key={group.title}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--color-neutral-600)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 8,
                  }}
                >
                  {group.title}
                </div>
                <div className="grid grid-3" style={{ gap: 10, marginBottom: 20 }}>
                  {group.commands.map((c) => (
                    <div
                      key={c.name}
                      style={{
                        background: 'var(--color-surface)',
                        borderRadius: 16,
                        padding: '12px 14px',
                      }}
                    >
                      <code style={{ color: 'var(--color-accent-700)', fontWeight: 700 }}>
                        {c.name}
                      </code>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: 'var(--color-neutral-700)',
                          marginTop: 4,
                        }}
                      >
                        {c.blurb}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section style={{ marginBottom: 40 }}>
            <SectionHead kicker="Every command answers with one" title="Exit codes" />
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: 'var(--color-neutral-800)',
                margin: '0 0 16px',
              }}
            >
              Every command exits with a numeric code. In scripts and CI/CD, exit codes chain
              commands — <Code>command1 &amp;&amp; command2</Code> runs command2 ONLY if command1
              succeeded. CI/CD pipelines fail the build if any command exits non-zero.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--color-accent-2-100)',
                  color: 'var(--color-accent-2-700)',
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                0 = success
              </span>
              <span style={{ color: 'var(--color-neutral-500)', fontSize: 14 }}>vs.</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--color-accent-100)',
                  color: 'var(--color-accent-700)',
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                anything else = error
              </span>
            </div>
          </section>

          {/* "no dumb questions" aside */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              background: 'var(--color-accent-2-100)',
              borderRadius: 'calc(var(--radius-lg) * 1.1)',
              padding: '20px 24px',
              marginBottom: 44,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent-2-700)"
              strokeWidth={2.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flex: 'none', marginTop: 2 }}
              aria-hidden="true"
            >
              <path d="M12 22a9 9 0 1 0-9-9 8.9 8.9 0 0 0 1.3 4.6L3 22l4.6-1.3A9 9 0 0 0 12 22Z" />
            </svg>
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent-2-700)',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                There are no dumb questions
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>
                "Do I need to memorize every flag?"
              </div>
              <div
                style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}
              >
                No. Muscle memory comes from repetition, not memorization. Run the commands in the
                walkthrough below a few times and the common ones will stick — keep{' '}
                <Code>man</Code> or <Code>--help</Code> open for the rest.
              </div>
            </div>
          </div>

          <section style={{ marginBottom: 44 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent-700)',
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Cheat sheet — Bash, PowerShell, and general pipes/exit codes side by side
            </div>
            <div className="grid grid-3" style={{ gap: 14 }}>
              <CopyPanel
                title="Navigation + file ops · Bash"
                lines={BASH_LINES}
                copied={copied === 'bash'}
                onCopy={() => copy(commandsOf(BASH_LINES), 'bash')}
              />
              <CopyPanel
                title="Navigation + file ops · PowerShell"
                lines={PS_LINES}
                copied={copied === 'ps'}
                onCopy={() => copy(commandsOf(PS_LINES), 'ps')}
              />
              <CopyPanel
                title="Pipes, redirection, exit codes"
                lines={PIPES_LINES}
                copied={copied === 'pipes'}
                onCopy={() => copy(commandsOf(PIPES_LINES), 'pipes')}
              />
            </div>
          </section>

          {/* Brain Power prompt */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              background: 'var(--color-accent-100)',
              borderRadius: 'calc(var(--radius-lg) * 1.1)',
              padding: '20px 24px',
              marginBottom: 52,
            }}
          >
            <Icon
              name="lightbulb"
              size={22}
              color="var(--color-accent-700)"
              style={{ marginTop: 2 }}
            />
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent-700)',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Brain power
              </div>
              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  color: 'var(--color-neutral-800)',
                }}
              >
                Before you keep scrolling: what single command would you run to find every{' '}
                <span style={{ fontStyle: 'normal' }}>
                  <Code>.log</Code>
                </span>{' '}
                file larger than 10MB inside{' '}
                <span style={{ fontStyle: 'normal' }}>
                  <Code>/var</Code>
                </span>
                ? Take a guess — the walkthrough below builds up to the real answer, one step at a
                time.
              </div>
            </div>
          </div>

          <QuickQuiz />

          <Walkthrough />

          <div
            style={{
              border: '2px dashed var(--color-neutral-400)',
              borderRadius: 24,
              padding: 24,
              textAlign: 'center',
              color: 'var(--color-neutral-600)',
              fontSize: 13,
            }}
          >
            Your existing full step-by-step playthrough component mounts here — restyle it with the
            same tokens (rounded terminal panels, accent-2 for success states) used above.
          </div>
        </main>
      </div>
    </div>
  )
}
