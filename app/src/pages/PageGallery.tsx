import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { GROUP_TITLES, PAGES, PAGES_BY_GROUP, type PageEntry, type PageGroup } from '../data/pages'

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

function GroupSection({ group }: { group: PageGroup }) {
  return (
    <>
      <h2 className="section-title">{GROUP_TITLES[group]}</h2>
      <div className="grid grid-4">
        {PAGES_BY_GROUP(group).map((page) => (
          <GalleryCard key={page.slug} page={page} />
        ))}
      </div>
    </>
  )
}

export default function PageGallery() {
  useDocumentTitle('Page Gallery')

  return (
    <div className="page">
      <TopNav
        note="Design gallery · every page archetype"
        right={<Tag tone="accent">{PAGES.length} MOCKUPS</Tag>}
      />

      <header className="wrap page-header">
        <h1>Every kind of page your learning app needs</h1>
        <p className="lede">
          20 archetypes plus the three originals, all on the same design system. Click any card —
          pages link back here from their top-left logo.
        </p>
      </header>

      <main className="wrap page-main">
        <GroupSection group="learn" />
        <GroupSection group="practice" />
        <GroupSection group="reference" />
        <GroupSection group="meta" />
      </main>
    </div>
  )
}
