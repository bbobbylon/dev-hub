import { Link } from 'react-router-dom'
import { Icon } from './Icon'

export interface SidebarItem {
  label: string
  /** 'current' is the page you're on, 'open' is reachable, 'locked' is greyed. */
  state: 'current' | 'open' | 'locked'
  to?: string
}

export interface SidebarGroup {
  title: string
  items: SidebarItem[]
}

/**
 * The concept rail on the left of a lesson page. Gamified per the design
 * session: done / current / locked read at a glance.
 */
export function ConceptSidebar({ groups, top = 57 }: { groups: SidebarGroup[]; top?: number }) {
  return (
    <aside
      style={{
        position: 'sticky',
        top,
        alignSelf: 'start',
        height: `calc(100vh - ${top}px)`,
        overflowY: 'auto',
        padding: '28px 20px',
        borderRight: '1px solid var(--color-divider)',
      }}
    >
      {groups.map((group, gi) => (
        <div key={group.title}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-700)',
              margin: gi === 0 ? '0 8px 8px' : '24px 8px 8px',
            }}
          >
            {group.title}
          </div>
          {group.items.map((item) => (
            <SidebarLink key={item.label} item={item} />
          ))}
        </div>
      ))}
    </aside>
  )
}

function SidebarLink({ item }: { item: SidebarItem }) {
  const base = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 999,
    fontSize: 14,
    marginBottom: 2,
    textDecoration: 'none',
  } as const

  const style =
    item.state === 'current'
      ? {
          ...base,
          background: 'var(--color-accent-100)',
          color: 'var(--color-accent-700)',
          fontWeight: 600,
        }
      : item.state === 'open'
        ? { ...base, color: 'var(--color-text)' }
        : { ...base, color: 'var(--color-neutral-700)', opacity: 0.6 }

  const mark =
    item.state === 'current' ? (
      <span
        style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent-700)' }}
      />
    ) : item.state === 'open' ? (
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          border: '1.5px solid var(--color-neutral-400)',
        }}
      />
    ) : (
      <Icon name="lock" size={13} />
    )

  const content = (
    <>
      {mark}
      {item.label}
      {item.state === 'locked' ? <span className="sr-only"> (locked)</span> : null}
    </>
  )

  if (item.to && item.state !== 'locked') {
    return (
      <Link to={item.to} style={style} aria-current={item.state === 'current' ? 'page' : undefined}>
        {content}
      </Link>
    )
  }
  return (
    <div style={style} aria-current={item.state === 'current' ? 'page' : undefined}>
      {content}
    </div>
  )
}
