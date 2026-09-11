import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { apiEnabled } from '../lib/api'
import { useAuth } from '../lib/auth'

/**
 * The bar every page carries. The brand mark is the way back to the gallery —
 * that link is load-bearing in the prototypes, so it stays a real route link.
 * Also reads `useAuth()` itself (rather than taking an account prop threaded
 * through every one of the ~27 call sites) to render a "Sign in" link or the
 * signed-in user's name — see `lib/auth.tsx`.
 *
 * The "Sign in" link appears only in a build with a backend behind it
 * (`apiEnabled`); `App.tsx` drops the `/sign-in` and `/sign-up` routes on the
 * same condition, so a backend-free build offers no path to a form that could
 * only fail. A signed-in user still gets their name and a "Sign out" either
 * way — that's how a token stored by an earlier, API-enabled build gets
 * cleared rather than stranded.
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
  const { user, logout } = useAuth()

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
      {user ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
          {user.firstName}
          <button type="button" onClick={logout} className="bare" style={{ textDecoration: 'underline' }}>
            Sign out
          </button>
        </span>
      ) : apiEnabled ? (
        <Link to="/sign-in" style={{ fontSize: 13.5, color: 'inherit' }}>
          Sign in
        </Link>
      ) : null}
    </nav>
  )
}
