import type { CSSProperties, ReactNode } from 'react'

/* ── tags ──────────────────────────────────────────────────────────────── */

export type TagTone = 'accent' | 'accent-2' | 'neutral' | 'outline'

export function Tag({
  tone = 'accent',
  children,
  style,
}: {
  tone?: TagTone
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <span className={`tag tag-${tone}`} style={style}>
      {children}
    </span>
  )
}

/* ── code ──────────────────────────────────────────────────────────────── */

/**
 * A dark code block. Lines are separate elements rather than raw newlines in a
 * <pre> — the fix the user asked for during the design session, because
 * collapsed whitespace was eating the indentation.
 */
export function CodeBlock({
  lines,
  style,
  children,
}: {
  lines?: ReactNode[]
  style?: CSSProperties
  children?: ReactNode
}) {
  return (
    <div className="code code-block" style={style}>
      {lines
        ? lines.map((line, i) => (
            <div className="ln" key={i}>
              {line === '' ? ' ' : line}
            </div>
          ))
        : children}
    </div>
  )
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="code-inline">{children}</code>
}

/* ── callouts ──────────────────────────────────────────────────────────── */

/** The Head First-style aside: a titled, tinted panel with a soft left rule. */
export function Callout({
  kicker,
  title,
  tone = 'accent',
  children,
  style,
}: {
  kicker?: string
  title?: string
  tone?: 'accent' | 'accent-2' | 'neutral'
  children: ReactNode
  style?: CSSProperties
}) {
  const bg = `var(--color-${tone}-100)`
  const rule = `var(--color-${tone}-${tone === 'neutral' ? '400' : '300'})`
  const ink = `var(--color-${tone}-800)`
  return (
    <aside
      style={{
        background: bg,
        borderLeft: `4px solid ${rule}`,
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        ...style,
      }}
    >
      {kicker ? (
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: `var(--color-${tone}-700)`,
            marginBottom: 6,
          }}
        >
          {kicker}
        </div>
      ) : null}
      {title ? (
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 17,
            color: ink,
            marginBottom: 6,
          }}
        >
          {title}
        </div>
      ) : null}
      <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-neutral-800)' }}>
        {children}
      </div>
    </aside>
  )
}

/* ── layout helpers ────────────────────────────────────────────────────── */

export function Panel({
  children,
  style,
  elevation = 'sm',
}: {
  children: ReactNode
  style?: CSSProperties
  elevation?: 'sm' | 'md' | 'lg' | 'none'
}) {
  return (
    <div
      className={elevation === 'none' ? undefined : `elev-${elevation}`}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'calc(var(--radius-lg) * 1.15)',
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Kicker({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: color ?? 'var(--color-accent-700)',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

/** A labelled meter — used for progress, mastery and confidence rows. */
export function Meter({
  value,
  max = 100,
  tone = 'accent',
  height = 8,
}: {
  value: number
  max?: number
  tone?: 'accent' | 'accent-2'
  height?: number
}) {
  const pct = max === 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      style={{
        height,
        borderRadius: 999,
        background: 'var(--color-neutral-300)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 999,
          background: `var(--color-${tone})`,
          transition: 'width 240ms ease',
        }}
      />
    </div>
  )
}
