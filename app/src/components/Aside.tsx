import type { CSSProperties, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

/**
 * The Head First-style aside: a tinted panel with an icon in the margin, an
 * optional small-caps kicker ("There are no dumb questions", "Brain power"),
 * an optional bold question, then the body.
 *
 * Six pages hand-rolled this same block; the props below are exactly the axes
 * on which those six actually differed.
 */
export function Aside({
  tone = 'accent-2',
  icon = 'lightbulb',
  kicker,
  heading,
  children,
  /** The two CLI Basics asides sit on the slightly rounder radius. */
  rounder = false,
  /** "Brain power" sets its reflection prompt in italic at 15px. */
  emphasis = false,
  /** Prototypes set this to either 1.55 or 1.6; preserved rather than unified. */
  lineHeight = 1.6,
  style,
}: {
  tone?: 'accent' | 'accent-2' | 'neutral'
  icon?: IconName
  kicker?: string
  heading?: string
  children: ReactNode
  rounder?: boolean
  emphasis?: boolean
  lineHeight?: number
  style?: CSSProperties
}) {
  // Neutral asides sit on the pale ground with plain body ink; the accent ones
  // tint both the panel and the kicker.
  const background = tone === 'neutral' ? 'var(--color-neutral-100)' : `var(--color-${tone}-100)`
  const accentInk = tone === 'neutral' ? 'var(--color-accent-700)' : `var(--color-${tone}-700)`

  return (
    <aside
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        background,
        borderRadius: rounder ? 'calc(var(--radius-lg) * 1.1)' : 'var(--radius-lg)',
        padding: '20px 24px',
        ...style,
      }}
    >
      <Icon name={icon} size={22} color={accentInk} style={{ marginTop: 2 }} />
      <div>
        {kicker ? (
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: accentInk,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            {kicker}
          </div>
        ) : null}
        {heading ? (
          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>{heading}</div>
        ) : null}
        <div
          style={{
            fontSize: emphasis ? 15 : 14,
            lineHeight,
            fontStyle: emphasis ? 'italic' : undefined,
            color: 'var(--color-neutral-800)',
          }}
        >
          {children}
        </div>
      </div>
    </aside>
  )
}
