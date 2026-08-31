import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { useDocumentTitle } from '../components/Page'

interface ScriptLine {
  cwd: string
  cmd: string
  out: string
}

const SCRIPT: ScriptLine[] = [
  { cwd: '~', cmd: 'cd /var/log/payments', out: '' },
  {
    cwd: '/var/log/payments',
    cmd: 'ls -la',
    out: 'total 48M\n-rw-r--r--  app.log      44M\n-rw-r--r--  app.log.1     2M\n-rw-r--r--  audit.log     1M',
  },
  { cwd: '/var/log/payments', cmd: 'grep -c ERROR app.log', out: '312' },
  {
    cwd: '/var/log/payments',
    cmd: 'tail -3 app.log',
    out: '02:14:07 ERROR PaymentWriter: write failed\n02:14:07 ERROR java.io.IOException: No space left on device\n02:14:08 FATAL service stopped',
  },
  {
    cwd: '/var/log/payments',
    cmd: 'df -h /',
    out: 'Filesystem  Size  Used  Avail  Use%\n/dev/sda1   40G   40G   0G     100%  ← the disk is full',
  },
]

/** `at` is the command count at which the objective is satisfied. */
const OBJECTIVES = [
  { title: 'Get to the log directory', hint: 'cd /var/log/payments', at: 1 },
  { title: 'See what is in it (and how big)', hint: 'ls -la', at: 2 },
  { title: 'Count the errors', hint: 'grep -c ERROR app.log', at: 3 },
  { title: 'Read the last lines before the crash', hint: 'tail -3 app.log', at: 4 },
  { title: 'Confirm the root cause', hint: 'df -h /', at: 5 },
]

const mono = 'ui-monospace, Menlo, monospace'

function Prompt({ cwd }: { cwd: string }) {
  return (
    <>
      <span style={{ color: 'var(--color-accent-2-300)' }}>dev@prod</span>
      <span style={{ color: 'var(--color-neutral-500)' }}>:</span>
      <span style={{ color: 'var(--color-accent-300)' }}>{cwd}</span>
      <span style={{ color: 'var(--color-neutral-400)' }}>$ </span>
    </>
  )
}

export default function TerminalSimulator() {
  useDocumentTitle('Terminal Simulator')
  const [n, setN] = useState(0)

  const executed = SCRIPT.slice(0, n)
  const complete = n >= SCRIPT.length
  const cwd = n === 0 ? '~' : '/var/log/payments'

  return (
    <div className="page page-dark" style={{ display: 'flex', flexDirection: 'column' }}>
      <TopNav
        dark
        note="Page type · Immersive terminal mission (dark)"
        right={
          <span
            style={{
              fontSize: 12,
              padding: '5px 12px',
              borderRadius: 999,
              background: 'color-mix(in srgb, var(--color-neutral-100) 10%, transparent)',
              color: 'var(--color-accent-200)',
            }}
          >
            MISSION 2 · THE LOST LOG
          </span>
        }
      />

      <div
        className="mission-layout"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          maxWidth: 1220,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <section style={{ padding: '36px 32px' }}>
          {/* The mission title is chrome in the design; keep it as the page's
              heading for anyone navigating by structure. */}
          <h1 className="sr-only">Mission 2 · The Lost Log</h1>
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid color-mix(in srgb, var(--color-neutral-100) 12%, transparent)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 18px',
                background: 'color-mix(in srgb, var(--color-neutral-100) 7%, transparent)',
              }}
            >
              {['var(--color-accent-600)', 'var(--color-amber)', 'var(--color-accent-2-600)'].map(
                (c) => (
                  <span
                    key={c}
                    style={{ width: 10, height: 10, borderRadius: '50%', background: c }}
                  />
                ),
              )}
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--color-neutral-400)',
                  fontFamily: mono,
                  marginLeft: 8,
                }}
              >
                dev@prod-server: ~
              </span>
            </div>

            <div
              style={{
                padding: '20px 22px',
                fontFamily: mono,
                fontSize: 13.5,
                lineHeight: 1.85,
                minHeight: 340,
                background: 'color-mix(in srgb, #000 25%, transparent)',
              }}
            >
              <div style={{ color: 'var(--color-neutral-400)' }}>
                # A service crashed overnight. Find the error in its logs.
              </div>
              {executed.map((l, i) => (
                <div key={i} style={{ animation: 'pop 0.3s ease' }}>
                  <div>
                    <Prompt cwd={l.cwd} />
                    <span style={{ color: 'var(--color-bg)' }}>{l.cmd}</span>
                  </div>
                  {l.out ? (
                    <div style={{ color: 'var(--color-neutral-300)', whiteSpace: 'pre-wrap' }}>
                      {l.out}
                    </div>
                  ) : null}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Prompt cwd={cwd} />
                <span
                  style={{
                    display: 'inline-block',
                    width: 9,
                    height: 18,
                    background: 'var(--color-accent-200)',
                    marginLeft: 4,
                    animation: 'blink 1.1s infinite',
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 18,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {!complete ? (
              <button
                type="button"
                onClick={() => setN((v) => Math.min(v + 1, SCRIPT.length))}
                style={{
                  cursor: 'pointer',
                  padding: '12px 22px',
                  borderRadius: 999,
                  border: 'none',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 14,
                  background: 'var(--color-accent)',
                  color: 'var(--color-neutral-900)',
                }}
              >
                Type it for me →{' '}
                <span style={{ fontFamily: mono, fontSize: 13 }}>{SCRIPT[n].cmd}</span>
              </button>
            ) : (
              <span
                style={{
                  fontSize: 14,
                  padding: '10px 20px',
                  borderRadius: 999,
                  background: 'var(--color-accent-2)',
                  color: 'var(--color-neutral-900)',
                  fontFamily: 'var(--font-heading)',
                  animation: 'pop 0.3s ease',
                }}
              >
                Mission complete — the culprit was a full disk
              </span>
            )}
            <button
              type="button"
              onClick={() => setN(0)}
              style={{
                cursor: 'pointer',
                padding: '12px 20px',
                borderRadius: 999,
                background: 'transparent',
                color: 'var(--color-neutral-400)',
                border: '1px solid color-mix(in srgb, var(--color-neutral-100) 20%, transparent)',
                fontFamily: 'var(--font-heading)',
                fontSize: 13,
              }}
            >
              Restart mission
            </button>
          </div>
        </section>

        <aside
          style={{
            borderLeft: '1px solid color-mix(in srgb, var(--color-neutral-100) 10%, transparent)',
            padding: '36px 26px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-400)',
              marginBottom: 14,
            }}
          >
            Mission objectives
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {OBJECTIVES.map((o) => {
              const done = n >= o.at
              return (
                <div key={o.title} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      flex: 'none',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1,
                      background: done ? 'var(--color-accent-2)' : 'transparent',
                      border: `2px solid ${done ? 'var(--color-accent-2)' : 'var(--color-neutral-600)'}`,
                    }}
                  >
                    {done ? <Icon name="check" size={11} color="var(--color-neutral-900)" /> : null}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: done ? 'var(--color-bg)' : 'var(--color-neutral-400)',
                      }}
                    >
                      {o.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--color-neutral-500)',
                        fontFamily: mono,
                        marginTop: 2,
                      }}
                    >
                      {o.hint}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              marginTop: 26,
              padding: '16px 18px',
              borderRadius: 16,
              background: 'color-mix(in srgb, var(--color-neutral-100) 6%, transparent)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-accent-200)',
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Field note
            </div>
            <div
              style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-neutral-300)' }}
            >
              Real incident debugging is exactly this loop: orient (
              <span style={{ fontFamily: mono }}>pwd</span>,{' '}
              <span style={{ fontFamily: mono }}>ls</span>), narrow (
              <span style={{ fontFamily: mono }}>grep</span>), then read the evidence (
              <span style={{ fontFamily: mono }}>tail</span>,{' '}
              <span style={{ fontFamily: mono }}>df</span>).
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
