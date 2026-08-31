import { useState } from 'react'
import { Link } from 'react-router-dom'

import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { useDocumentTitle } from '../components/Page'

/* ── content ───────────────────────────────────────────────────────────── */

const CONDIMENTS = {
  soy: { label: 'Soy', delta: 0.1 },
  whip: { label: 'Whip', delta: 0.1 },
  mocha: { label: 'Mocha', delta: 0.2 },
} as const

type CondimentKey = keyof typeof CONDIMENTS

const BASE_COST = 0.89

/** The receipt shown in the "core idea" panel — a fixed worked example. */
const WORKED_RECEIPT = [
  { label: 'House Blend', running: '0.89', lead: true },
  { label: '+ Soy', running: '0.99' },
  { label: '+ Whip', running: '1.09' },
  { label: '+ Mocha', running: '1.29', last: true },
]

const FAMILIAR_STACKS = [
  {
    title: "Java's I/O stack",
    blurb: 'Each stream wraps the last, adding one job — buffering, then typed reads.',
    layers: ['FileInputStream', 'Buffered', 'DataInputStream'],
  },
  {
    title: "Spring Security's filter chain",
    blurb:
      'Each filter wraps the request, layering in auth, headers, and session state before the controller ever sees it.',
    layers: ['Request', 'AuthFilter', 'SecurityWrapper'],
  },
  {
    title: 'A CIAM REST client',
    blurb:
      'Logging, metrics, and circuit-breaking layered over the real client — none of them touch it.',
    layers: ['RealClient', 'CircuitBreaker', 'LoggingClient'],
  },
]

/** Main.java, line by line — `comment` renders dimmed at the end of the line. */
const JAVA_SOURCE: { text: string; comment?: string }[] = [
  { text: 'public class Main {' },
  { text: '  static abstract class Beverage {' },
  { text: '    abstract String getDescription();' },
  { text: '    abstract double cost();' },
  { text: '  }' },
  { text: '  static class Espresso extends Beverage {' },
  { text: '    String getDescription() { return "Espresso"; }' },
  { text: '    double cost() { return 1.99; }' },
  { text: '  }' },
  { text: '  static abstract class CondimentDecorator extends Beverage {' },
  { text: '    Beverage wrapped;', comment: '// IS-A Beverage, HAS-A Beverage' },
  { text: '    CondimentDecorator(Beverage b) { wrapped = b; }' },
  { text: '  }' },
  { text: '  static class Mocha extends CondimentDecorator {' },
  { text: '    Mocha(Beverage b) { super(b); }' },
  { text: '    String getDescription() { return wrapped.getDescription() + ", Mocha"; }' },
  { text: '    double cost() { return wrapped.cost() + 0.20; }', comment: '// delegate then add' },
  { text: '  }' },
  { text: '  static class Whip extends CondimentDecorator {' },
  { text: '    Whip(Beverage b) { super(b); }' },
  { text: '    String getDescription() { return wrapped.getDescription() + ", Whip"; }' },
  { text: '    double cost() { return wrapped.cost() + 0.10; }' },
  { text: '  }' },
  { text: '  public static void main(String[] args) {' },
  { text: '    Beverage order = new Whip(new Mocha(new Mocha(new Espresso())));' },
  { text: '    System.out.println(order.getDescription());' },
  { text: '    System.out.printf("total: $%.2f%n", order.cost());' },
  { text: '    ', comment: '// Add your own decorator (Soy? Caramel?) and re-run.' },
  { text: '  }' },
  { text: '}' },
]

/* ── small shared bits ─────────────────────────────────────────────────── */

const mono = 'ui-monospace, Menlo, monospace'

function InlineCode({ children, on = 'bg' }: { children: string; on?: 'bg' | 'surface' | 'dark' }) {
  const background =
    on === 'dark'
      ? 'color-mix(in srgb, #000 25%, transparent)'
      : on === 'surface'
        ? 'var(--color-surface)'
        : 'var(--color-bg)'
  return (
    <code
      style={{
        background,
        padding: on === 'surface' ? '1px 6px' : '2px 6px',
        borderRadius: on === 'surface' ? 5 : 6,
        fontFamily: mono,
        color: on === 'dark' ? 'var(--color-bg)' : undefined,
      }}
    >
      {children}
    </code>
  )
}

function ReceiptRow({
  label,
  amount,
  style,
}: {
  label: string
  amount: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: mono,
        fontSize: 14,
        padding: '5px 0',
        color: 'var(--color-neutral-700)',
        ...style,
      }}
    >
      <span>{label}</span>
      <span>{amount}</span>
    </div>
  )
}

/* ── the live "build your own order" sandbox ───────────────────────────── */

function OrderBuilder() {
  const [stack, setStack] = useState<CondimentKey[]>([])

  let running = BASE_COST
  const rows = stack.map((key, i) => {
    running += CONDIMENTS[key].delta
    return { key: `${key}-${i}`, label: CONDIMENTS[key].label, running: running.toFixed(2) }
  })

  const constructorExpr = stack.reduce(
    (expr, key) => `new ${CONDIMENTS[key].label}(${expr})`,
    'new HouseBlend()',
  )
  const description = `House Blend${stack.map((key) => `, ${CONDIMENTS[key].label}`).join('')}`

  const addButton = (key: CondimentKey) => (
    <button
      key={key}
      type="button"
      onClick={() => setStack((s) => [...s, key])}
      style={{
        cursor: 'pointer',
        padding: '10px 18px',
        borderRadius: 999,
        border: 'none',
        fontFamily: 'var(--font-heading)',
        fontSize: 13,
        background: 'var(--color-accent-2)',
        color: 'var(--color-bg)',
      }}
    >
      + {CONDIMENTS[key].label} · ${CONDIMENTS[key].delta.toFixed(2)}
    </button>
  )

  const secondaryButton = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '10px 18px',
        borderRadius: 999,
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-divider)',
        fontFamily: 'var(--font-heading)',
        fontSize: 13,
      }}
    >
      {label}
    </button>
  )

  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent-2-700)"
          strokeWidth={2.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <h3 style={{ fontSize: 22, margin: 0 }}>Build your own order</h3>
      </div>
      <p style={{ fontSize: 14.5, color: 'var(--color-neutral-700)', margin: '0 0 18px' }}>
        Start from a House Blend and click condiments to wrap it, one decorator at a time. Watch the
        constructor call and the total build together.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {(Object.keys(CONDIMENTS) as CondimentKey[]).map(addButton)}
        {secondaryButton('Undo', () => setStack((s) => s.slice(0, -1)))}
        {secondaryButton('Reset', () => setStack([]))}
      </div>

      <div className="decorator-sandbox" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'calc(32px * 1.15)',
            padding: '20px 22px',
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-600)',
              marginBottom: 10,
            }}
          >
            Description &amp; running cost
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 14,
              color: 'var(--color-text)',
              borderBottom: '1px solid var(--color-divider)',
              padding: '5px 0 8px',
              marginBottom: 8,
            }}
          >
            "{description}"
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ReceiptRow label="House Blend" amount="$0.89" style={{ fontSize: 13.5, padding: '4px 0' }} />
            {rows.map((r) => (
              <ReceiptRow
                key={r.key}
                label={`+ ${r.label}`}
                amount={`$${r.running}`}
                style={{ fontSize: 13.5, padding: '4px 0', animation: 'pop 0.25s ease' }}
              />
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 700,
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--color-divider)',
              color: 'var(--color-accent-700)',
            }}
          >
            <span>Total</span>
            <span>${running.toFixed(2)}</span>
          </div>
        </div>

        <div
          style={{
            background: 'var(--color-neutral-900)',
            borderRadius: 'calc(32px * 1.15)',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
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
            Constructor call
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 13,
              color: 'var(--color-accent-200)',
              lineHeight: 1.6,
              wordBreak: 'break-all',
              flex: 1,
            }}
          >
            {constructorExpr}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── predict-then-run code runner ──────────────────────────────────────── */

function PredictThenRun() {
  const [showOutput, setShowOutput] = useState(false)

  return (
    <section style={{ marginBottom: 24 }}>
      <div
        style={{
          marginBottom: 16,
          background: 'var(--color-accent-100)',
          borderRadius: 20,
          padding: '16px 20px',
        }}
      >
        <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--color-accent-800)' }}>
          <strong
            style={{
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontSize: 11,
              display: 'block',
              marginBottom: 4,
            }}
          >
            Predict first
          </strong>
          Espresso is <InlineCode>$1.99</InlineCode>, mocha adds <InlineCode>$0.20</InlineCode>, whip
          adds <InlineCode>$0.10</InlineCode>. Trace the wrapped calls before running it — what
          description and total print?
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-neutral-900)',
          borderRadius: 'calc(32px * 1.15)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: 'color-mix(in srgb, var(--color-neutral-100) 6%, transparent)',
          }}
        >
          <span
            style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--color-accent-600)' }}
          />
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: 'var(--color-accent-2-600)',
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: 'var(--color-neutral-400)',
              fontFamily: mono,
              marginLeft: 6,
            }}
          >
            Main.java
          </span>
        </div>
        <div
          style={{
            padding: '18px 20px',
            fontFamily: mono,
            fontSize: 12.5,
            lineHeight: 1.75,
            color: 'var(--color-neutral-100)',
            overflowX: 'auto',
          }}
        >
          {JAVA_SOURCE.map((line, i) => (
            <div key={i} style={{ whiteSpace: 'pre' }}>
              {line.text}
              {line.comment ? (
                <span style={{ color: 'var(--color-neutral-400)' }}>{line.comment}</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setShowOutput(true)}
          style={{
            cursor: 'pointer',
            padding: '11px 22px',
            borderRadius: 999,
            border: 'none',
            fontFamily: 'var(--font-heading)',
            fontSize: 14,
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
          }}
        >
          ▶ Run
        </button>
        <button
          type="button"
          onClick={() => setShowOutput(false)}
          style={{
            cursor: 'pointer',
            padding: '11px 22px',
            borderRadius: 999,
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-divider)',
            fontFamily: 'var(--font-heading)',
            fontSize: 14,
          }}
        >
          ↺ Reset
        </button>
      </div>

      {showOutput ? (
        <div
          style={{
            marginTop: 16,
            background: 'var(--color-neutral-900)',
            borderRadius: 20,
            padding: '16px 20px',
            fontFamily: mono,
            fontSize: 13,
            color: 'var(--color-accent-2-200)',
            animation: 'pop 0.3s ease',
          }}
        >
          <div>Espresso, Mocha, Mocha, Whip</div>
          <div>total: $2.49</div>
        </div>
      ) : null}
    </section>
  )
}

/* ── page ──────────────────────────────────────────────────────────────── */

export default function DecoratorPattern() {
  useDocumentTitle('Decorator Pattern')

  return (
    <div className="page">
      <TopNav
        to="/dev-hub"
        links={
          <>
            <Link to="/dev-hub">Concepts</Link>
            <Link to="/decorator-pattern" className="is-active">
              Design Patterns
            </Link>
            <Link to="/code-playground">Playground</Link>
          </>
        }
        right={
          <span className="chip">
            <Icon name="flame" size={13} color="var(--color-accent-700)" /> 4 day streak
          </span>
        }
      />

      {/* terracotta hero with drifting blobs */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--color-accent-700)',
          padding: '56px 56px 72px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'var(--color-accent-600)',
            opacity: 0.55,
            animation: 'floatBlob 7s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -90,
            right: 220,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'var(--color-accent-2-600)',
            opacity: 0.45,
            animation: 'floatBlob 9s ease-in-out infinite reverse',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 800 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              letterSpacing: '0.1em',
              padding: '6px 14px',
              borderRadius: 999,
              background: 'color-mix(in srgb, #fff 14%, transparent)',
              color: 'var(--color-accent-100)',
              marginBottom: 18,
            }}
          >
            DESIGN PATTERNS · CH. 3
          </span>
          <h1
            style={{
              fontSize: 56,
              lineHeight: 1.02,
              margin: '0 0 18px',
              color: 'var(--color-bg)',
            }}
          >
            The Decorator Pattern — Starbuzz Coffee
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.65,
              color: 'var(--color-accent-100)',
              maxWidth: 640,
              margin: 0,
            }}
          >
            Starbuzz's menu has a handful of beverages and a pile of condiments — milk, mocha, soy,
            whip. Model every combination as a subclass and you get a class explosion: hundreds of{' '}
            <InlineCode on="dark">HouseBlendWithSoyAndMochaAndWhip</InlineCode> classes. Decorator
            wraps a drink in condiment objects that each add their own cost, so any order is built at
            runtime by nesting wrappers.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 56px 120px' }}>
        {/* core idea */}
        <section
          className="elev-md"
          style={{
            background: 'var(--color-neutral-200)',
            borderRadius: 'calc(32px * 1.15)',
            padding: '32px 36px',
            marginBottom: 36,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent-700)"
              strokeWidth={2.75}
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="4.5" />
              <circle cx="12" cy="12" r="0.6" fill="var(--color-accent-700)" />
            </svg>
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent-700)',
                fontWeight: 700,
              }}
            >
              Core idea
            </span>
          </div>
          <h2
            style={{
              fontSize: 27,
              lineHeight: 1.25,
              margin: '0 0 16px',
              color: 'var(--color-text)',
            }}
          >
            What is the Decorator pattern — and why is it the pattern behind Java's InputStream
            chain?
          </h2>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.7,
              color: 'var(--color-neutral-800)',
              margin: '0 0 24px',
            }}
          >
            The Decorator pattern attaches additional responsibilities to an object dynamically, as
            an alternative to subclassing. Each decorator implements the same interface as the thing
            it wraps, delegates to it, and adds its own behavior on top:
          </p>

          <div className="grid grid-2" style={{ gap: 20 }}>
            <div style={{ background: 'var(--color-bg)', borderRadius: 20, padding: '18px 20px' }}>
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-neutral-600)',
                  marginBottom: 12,
                }}
              >
                Order total — built one wrap at a time
              </div>
              {WORKED_RECEIPT.map((row) => (
                <ReceiptRow
                  key={row.label}
                  label={row.label}
                  amount={`$${row.running}`}
                  style={{
                    ...(row.lead ? { color: 'var(--color-text)' } : null),
                    ...(row.last
                      ? { padding: '5px 0 12px', borderBottom: '1px solid var(--color-divider)' }
                      : null),
                  }}
                />
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  paddingTop: 10,
                  color: 'var(--color-accent-700)',
                }}
              >
                <span>Total</span>
                <span>$1.29</span>
              </div>
            </div>

            <div>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: 'var(--color-neutral-800)',
                  margin: '0 0 14px',
                }}
              >
                Each condiment only knows its own delta and the object it wraps —{' '}
                <InlineCode>Mocha.cost()</InlineCode> returns{' '}
                <InlineCode>wrapped.cost() + 0.20</InlineCode>. Stack four wrappers and the
                constructor nests the same way the receipt does:
              </p>
              <div
                style={{
                  background: 'var(--color-neutral-900)',
                  borderRadius: 16,
                  padding: '14px 16px',
                  borderLeft: '4px solid var(--color-accent)',
                  fontFamily: mono,
                  fontSize: 12.5,
                  color: 'var(--color-accent-200)',
                  overflowX: 'auto',
                }}
              >
                new Mocha(new Whip(new Soy(new HouseBlend())))
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 24,
              padding: '16px 20px',
              background: 'var(--color-bg)',
              borderRadius: 16,
              borderLeft: '4px solid var(--color-accent)',
            }}
          >
            <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-neutral-800)' }}>
              <strong style={{ color: 'var(--color-text)' }}>Open/Closed Principle:</strong> classes
              should be open for extension but closed for modification. Every condiment is a new
              class added beside <InlineCode on="surface">Beverage</InlineCode> — nothing about{' '}
              <InlineCode on="surface">HouseBlend</InlineCode> ever changes.
            </div>
          </div>
        </section>

        {/* the same shape elsewhere */}
        <section style={{ marginBottom: 40 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--color-neutral-700)',
              fontFamily: 'var(--font-body)',
              margin: '0 0 16px',
            }}
          >
            The same shape, three places you already use it
          </h3>
          <div className="grid grid-3" style={{ gap: 14 }}>
            {FAMILIAR_STACKS.map((stack) => (
              <div
                key={stack.title}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'calc(32px * 1.15)',
                  padding: '18px 20px',
                }}
              >
                <div
                  style={{ fontFamily: 'var(--font-heading)', fontSize: 16, marginBottom: 8 }}
                >
                  {stack.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--color-neutral-700)',
                    lineHeight: 1.5,
                    marginBottom: 14,
                  }}
                >
                  {stack.blurb}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    fontFamily: mono,
                    fontSize: 11.5,
                  }}
                >
                  {stack.layers.map((layer, i) => {
                    const outermost = i === stack.layers.length - 1
                    return (
                      <div key={layer} style={{ display: 'contents' }}>
                        <span
                          style={{
                            padding: '5px 9px',
                            borderRadius: 8,
                            background: outermost
                              ? 'var(--color-accent-700)'
                              : 'var(--color-bg)',
                            color: outermost ? 'var(--color-bg)' : 'var(--color-accent-700)',
                            fontWeight: outermost ? 700 : undefined,
                          }}
                        >
                          {layer}
                        </span>
                        {outermost ? null : (
                          <span style={{ textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                            ↓
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <OrderBuilder />
        <PredictThenRun />
      </main>
    </div>
  )
}
