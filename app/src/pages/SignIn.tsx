/**
 * Route `/sign-in` — the optional backend account sign-in form. Only meaningful when the app was
 * built with `VITE_API_BASE_URL` set (see `lib/api.ts`'s `apiEnabled`); otherwise `useAuth().login`
 * rejects immediately with a clear message, shown right here like any other sign-in failure. On
 * success, redirects to `/` and lets `lib/progressSync.ts` (mounted in `App.tsx`) pull whatever
 * progress is already saved on the account.
 */
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { useAuth } from '../lib/auth'

export default function SignIn() {
  useDocumentTitle('Sign in')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <TopNav note="Account · Sign in" />
      <main style={{ maxWidth: 400, margin: '0 auto', padding: '72px 24px 120px' }}>
        <h1 style={{ fontSize: 32, margin: '0 0 8px', color: 'var(--color-accent-700)' }}>
          Sign in
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', margin: '0 0 28px' }}>
          Sign in to sync your progress across devices.
        </p>
        <form onSubmit={submit} className="card elev-sm" style={{ padding: 24 }}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p style={{ fontSize: 13, color: 'var(--color-accent-700)', margin: 0 }}>{error}</p>
          ) : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 18 }}>
          Don't have an account? <Link to="/sign-up">Sign up</Link>
        </p>
      </main>
    </div>
  )
}
