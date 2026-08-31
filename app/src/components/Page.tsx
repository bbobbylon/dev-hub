import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { TopNav } from './TopNav'

/**
 * Standard light page: sticky nav, an optional header block (display heading +
 * lede), then the main column. Pages that need a bespoke hero pass `header` as
 * a node instead of title/lede.
 */
export function Page({
  title,
  lede,
  header,
  navNote,
  navLinks,
  navRight,
  documentTitle,
  children,
  wide = true,
}: {
  title?: string
  lede?: ReactNode
  header?: ReactNode
  navNote?: string
  navLinks?: ReactNode
  navRight?: ReactNode
  documentTitle?: string
  children: ReactNode
  wide?: boolean
}) {
  useDocumentTitle(documentTitle ?? title)
  const wrap = wide ? 'wrap' : 'wrap-narrow'

  return (
    <div className="page">
      <TopNav note={navNote} links={navLinks} right={navRight} />
      {header ??
        (title ? (
          <header className={`${wrap} page-header`}>
            <h1>{title}</h1>
            {lede ? <p className="lede">{lede}</p> : null}
          </header>
        ) : null)}
      <main className={`${wrap} page-main`}>{children}</main>
    </div>
  )
}

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = `${title} · Dev Hub`
    return () => {
      document.title = previous
    }
  }, [title])
}
