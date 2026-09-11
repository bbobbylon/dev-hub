import { Component, type ReactNode } from 'react'
import { TopNav } from './TopNav'

interface Props {
  children: ReactNode
  /** Changing this (e.g. the route pathname) clears a caught error automatically. */
  resetKey?: unknown
}

interface State {
  error: Error | null
}

/**
 * Catches a render crash in one page so it doesn't blank the whole app —
 * there's no server here to fall back on, just 25 hand-built interactive
 * pages, and a bug in one shouldn't take out the other 24.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  /** React's hook for catching a render error thrown anywhere below this boundary. */
  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  /** Clears a caught error once `resetKey` changes (App.tsx passes the route pathname). */
  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  /** Renders the fallback screen while an error is caught, otherwise the real children. */
  render() {
    if (this.state.error) {
      return (
        <div className="page">
          <TopNav note="Error" />
          <main style={{ maxWidth: 640, margin: '0 auto', padding: '96px 48px 120px' }}>
            <h1 style={{ fontSize: 48, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
              Something broke.
            </h1>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                color: 'var(--color-neutral-700)',
                margin: '0 0 26px',
              }}
            >
              This page hit an error rather than rendering. Your saved progress is untouched — it
              lives in localStorage, not in this page. Try another page, or reload this one.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {/* A hard navigation, not a router Link — the crash may have left
                  the app's React state unfit to render even the target page. */}
              <a href={import.meta.env.BASE_URL} className="btn btn-primary">
                Browse the gallery
              </a>
              <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                Reload this page
              </button>
            </div>
          </main>
        </div>
      )
    }
    return this.props.children
  }
}
