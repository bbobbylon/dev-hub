/**
 * Global "jump to any page" palette (BACKLOG item 12) — Cmd/Ctrl+K opens it
 * from anywhere in the app, since the gallery's own search box only helps
 * once you're already there. Mounted once by `App.tsx` alongside the route
 * tree rather than owned by any one page, so the shortcut works no matter
 * what's currently rendered; renders nothing at all while closed, so it adds
 * no new element to any route's own a11y surface.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { Tag } from './ui'
import { PAGES, type PageEntry } from '../data/pages'

const MAX_RESULTS = 8

/** Pages whose title, kind, blurb or slug contain every word of `query`, capped to `MAX_RESULTS`. */
function search(query: string): PageEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return PAGES.slice(0, MAX_RESULTS)
  const words = q.split(/\s+/)
  const matches = PAGES.filter((p) => {
    const haystack = `${p.title} ${p.kind} ${p.blurb} ${p.slug}`.toLowerCase()
    return words.every((w) => haystack.includes(w))
  })
  return matches.slice(0, MAX_RESULTS)
}

export function CommandPalette() {
  const [open, setOpenState] = useState(false)
  // Mirrors `open` synchronously, so the global toggle below always knows the
  // current state without a stale closure — React state updates aren't
  // readable until the next render.
  const openRef = useRef(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const returnFocusTo = useRef<HTMLElement | null>(null)
  const navigate = useNavigate()

  const matches = useMemo(() => search(query), [query])

  function setOpen(next: boolean) {
    openRef.current = next
    setOpenState(next)
  }

  function close() {
    setOpen(false)
    returnFocusTo.current?.focus()
  }

  function goTo(page: PageEntry) {
    navigate(`/${page.slug}`)
    close()
  }

  // The global open shortcut — always listening, on every route, whether the
  // palette is open or not. Resets query/selection in the same synchronous
  // handler that opens it, so there's no render in between where the dialog
  // is visible but still showing the previous session's leftover query.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const willOpen = !openRef.current
        if (willOpen) {
          returnFocusTo.current = document.activeElement as HTMLElement | null
          setQuery('')
          setActiveIndex(0)
        }
        setOpen(willOpen)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Focus the search input once it's actually rendered into the DOM.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Arrow keys move the highlighted row, Enter opens it, Escape closes — only
  // wired up while the palette actually has something to navigate.
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, matches.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const page = matches[activeIndex]
        if (page) goTo(page)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, matches, activeIndex])

  if (!open) return null

  return (
    <div
      className="dialog-backdrop"
      style={{ alignItems: 'flex-start', paddingTop: '12vh', zIndex: 100 }}
      onClick={close}
    >
      <div
        className="dialog elev-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Jump to a page"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(560px, 100%)', padding: 0, gap: 0, overflow: 'hidden' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-divider)',
          }}
        >
          <Icon name="search" size={18} color="var(--color-neutral-700)" />
          <input
            ref={inputRef}
            type="text"
            style={{
              flex: 1,
              border: 0,
              outline: 'none',
              background: 'transparent',
              font: 'inherit',
              fontSize: 15,
              color: 'var(--color-text)',
            }}
            placeholder="Jump to a page…"
            aria-label="Jump to a page"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
          />
          <kbd
            style={{
              fontSize: 11,
              color: 'var(--color-neutral-700)',
              border: '1px solid var(--color-divider)',
              borderRadius: 6,
              padding: '2px 6px',
            }}
          >
            Esc
          </kbd>
        </div>

        <div
          role="listbox"
          aria-label="Matching pages"
          style={{ maxHeight: '52vh', overflowY: 'auto', padding: 'var(--space-2)' }}
        >
          {matches.length === 0 ? (
            <p style={{ padding: 'var(--space-3)', fontSize: 13.5, color: 'var(--color-neutral-700)' }}>
              No page matches "{query}".
            </p>
          ) : (
            matches.map((page, i) => (
              <button
                key={page.slug}
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                className="bare"
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => goTo(page)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: i === activeIndex ? 'var(--color-accent-100)' : 'transparent',
                }}
              >
                <Tag tone={page.tone}>{page.kind}</Tag>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5 }}>{page.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-neutral-700)' }}>
                  /{page.slug}
                </span>
              </button>
            ))
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 14,
            padding: '10px 18px',
            borderTop: '1px solid var(--color-divider)',
            fontSize: 11.5,
            color: 'var(--color-neutral-700)',
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  )
}
