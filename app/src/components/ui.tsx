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

export function Code({ children }: { children: ReactNode }) {
  return <code className="code-inline">{children}</code>
}

/* ── meters ────────────────────────────────────────────────────────────── */

/** A labelled progress meter — used for the roadmap's path completion. */
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
