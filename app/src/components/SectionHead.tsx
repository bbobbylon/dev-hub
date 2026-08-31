import type { ReactNode } from 'react'

/**
 * The kicker + display-heading pair that opens nearly every section in the
 * concept pages. The kicker is the Head First "what am I about to get" label.
 */
export function SectionHead({
  kicker,
  title,
  children,
  titleSize = 24,
  marginBottom = 12,
}: {
  kicker: string
  title: string
  /** Optional lede paragraph beneath the heading. */
  children?: ReactNode
  titleSize?: number
  marginBottom?: number
}) {
  return (
    <>
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-accent-700)',
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {kicker}
      </div>
      <h3 style={{ fontSize: titleSize, margin: `0 0 ${children ? 12 : marginBottom}px` }}>
        {title}
      </h3>
      {children ? (
        <p style={{ fontSize: 14.5, color: 'var(--color-neutral-700)', margin: '0 0 16px' }}>
          {children}
        </p>
      ) : null}
    </>
  )
}
