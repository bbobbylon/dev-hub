import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'

/**
 * The bar every page carries. The brand mark is the way back to the gallery —
 * that link is load-bearing in the prototypes, so it stays a real route link.
 */
export function TopNav({
  note,
  links,
  right,
  dark = false,
  to = '/',
}: {
  note?: string
  links?: ReactNode
  right?: ReactNode
  dark?: boolean
  to?: string
}) {
  return (
    <nav className={dark ? 'topnav topnav-dark' : 'topnav'}>
      <Link to={to} className="topnav-brand">
        <Icon name="terminal" size={20} color="var(--color-accent)" />
        Dev Hub
      </Link>
      {links ? <div className="topnav-links">{links}</div> : null}
      {note ? <span className="topnav-note">{note}</span> : null}
      {!links && !note ? <span className="topnav-note" /> : null}
      {right}
    </nav>
  )
}
