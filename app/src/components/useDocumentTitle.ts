import { useEffect } from 'react'

/** Names the browser tab after the page, and restores it on the way out. */
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
