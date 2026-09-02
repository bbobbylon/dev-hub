import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { useDocumentTitle } from '../components/useDocumentTitle'

/** Replaces a silent redirect, which hid typo'd URLs rather than explaining them. */
export default function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <div className="page">
      <TopNav note="404" />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '96px 48px 120px' }}>
        <h1 style={{ fontSize: 48, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          No such page.
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--color-neutral-700)',
            margin: '0 0 26px',
          }}
        >
          That address doesn't match any concept, practice page or reference in the hub. The gallery
          lists everything there is.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            Browse the gallery
          </Link>
          <Link to="/dev-hub" className="btn btn-secondary">
            Go to Dev Hub
          </Link>
        </div>
      </main>
    </div>
  )
}
