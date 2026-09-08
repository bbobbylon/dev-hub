import type { ReactNode } from 'react'

// Shared monospace stack for every code-styled surface in this file.
const mono = 'ui-monospace, Menlo, monospace'

/** Syntax roles shared by the code listings — keyword, call, string, comment. */
export const syn = {
  kw: { color: 'var(--color-accent-300)' },
  fn: { color: 'var(--color-accent-2-300)' },
  str: { color: 'var(--code-string)' },
  cm: { color: 'var(--color-neutral-500)' },
} as const

export interface ListingLine {
  content: ReactNode
  /** Tints the row — used to point at the offending line once a bug is revealed. */
  highlight?: boolean
}

/**
 * A dark editor pane: window chrome with a filename, then numbered source
 * lines. Lines are separate elements so leading whitespace survives.
 */
export function CodeListing({
  filename,
  lines,
  badge,
  note,
  gutterWidth = 40,
  fontSize = 13,
  lineHeight = 1.85,
}: {
  filename: string
  lines: ListingLine[]
  /** Pill on the right of the chrome bar. */
  badge?: ReactNode
  /** Muted text on the right of the chrome bar, when there's no badge. */
  note?: string
  gutterWidth?: number
  fontSize?: number
  lineHeight?: number
}) {
  return (
    <div
      className="elev-md"
      style={{
        background: 'var(--color-neutral-900)',
        borderRadius: 'var(--radius-lg)',
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
          {filename}
        </span>
        {badge ? <span style={{ marginLeft: 'auto' }}>{badge}</span> : null}
        {!badge && note ? (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-neutral-500)' }}>
            {note}
          </span>
        ) : null}
      </div>

      <div
        style={{
          padding: `16px ${Math.round(gutterWidth / 5)}px 16px 0`,
          fontFamily: mono,
          fontSize,
          lineHeight,
          color: 'var(--color-neutral-100)',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              background: line.highlight
                ? 'color-mix(in srgb, var(--color-accent) 22%, transparent)'
                : 'transparent',
            }}
          >
            <span
              style={{
                width: gutterWidth,
                textAlign: 'right',
                paddingRight: 14,
                color: 'var(--color-neutral-600)',
                flex: 'none',
              }}
            >
              {i + 1}
            </span>
            <span style={{ whiteSpace: 'pre' }}>{line.content}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
