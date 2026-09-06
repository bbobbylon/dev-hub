import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { GROUP_TITLES, PAGES, type PageEntry, type PageGroup } from '../data/pages'

function GalleryCard({ page }: { page: PageEntry }) {
  return (
    <Link to={`/${page.slug}`} className="card elev-sm link-card">
      <div style={{ padding: '2px 4px' }}>
        <Tag tone={page.tone}>{page.kind}</Tag>
        <div className="link-card-title">{page.title}</div>
        <div className="link-card-body">{page.blurb}</div>
      </div>
    </Link>
  )
}

function GroupSection({ group, pages }: { group: PageGroup; pages: PageEntry[] }) {
  if (pages.length === 0) return null
  return (
    <>
      <h2 className="section-title">{GROUP_TITLES[group]}</h2>
      <div className="grid grid-4">
        {pages.map((page) => (
          <GalleryCard key={page.slug} page={page} />
        ))}
      </div>
    </>
  )
}

export default function PageGallery() {
  useDocumentTitle('Page Gallery')
  const [query, setQuery] = useState('')

  // 23 archetypes is more than fits on a screen; filtering beats scrolling.
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PAGES
    return PAGES.filter((p) =>
      [p.title, p.kind, p.blurb].some((f) => f.toLowerCase().includes(q)),
    )
  }, [query])
  const inGroup = (g: PageGroup) => matches.filter((p) => p.group === g)

  return (
    <div className="page">
      <TopNav
        note="Design gallery · every page archetype"
        right={<Tag tone="accent">{matches.length} OF {PAGES.length}</Tag>}
      />

      <header className="wrap page-header">
        <h1>Every kind of page your learning app needs</h1>
        <p className="lede">
          21 archetypes plus the three originals, all on the same design system. Click any card —
          pages link back here from their top-left logo.
        </p>
        <input
          type="search"
          className="input"
          placeholder="Filter pages… e.g. quiz, diagram, dark"
          aria-label="Filter pages"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 420, marginTop: 18 }}
        />
      </header>

      <main className="wrap page-main">
        <GroupSection group="learn" pages={inGroup('learn')} />
        <GroupSection group="practice" pages={inGroup('practice')} />
        <GroupSection group="reference" pages={inGroup('reference')} />
        <GroupSection group="meta" pages={inGroup('meta')} />

        {matches.length === 0 ? (
          <p style={{ fontSize: 15, color: 'var(--color-neutral-700)', marginTop: 28 }}>
            No page matches “{query}”.
          </p>
        ) : null}
      </main>
    </div>
  )
}
