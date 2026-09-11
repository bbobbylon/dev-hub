/**
 * Route `/sign-up` — creates a backend account, then signs straight in (see `lib/auth.tsx`'s
 * `register`, which calls `login` itself on success) and redirects to `/`. Same `apiEnabled`
 * caveat as `SignIn.tsx`: with no `VITE_API_BASE_URL` configured, `register` rejects immediately
 * with a clear message instead of attempting a request.
 */
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { useAuth } from '../lib/auth'

export default function SignUp() {
  useDocumentTitle('Sign up')
  const { register } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email || !password) {
      setError('Fill in every field.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await register({ firstName, lastName, email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <TopNav note="Account · Sign up" />
      <main style={{ maxWidth: 400, margin: '0 auto', padding: '72px 24px 120px' }}>
        <h1 style={{ fontSize: 32, margin: '0 0 8px', color: 'var(--color-accent-700)' }}>
          Sign up
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', margin: '0 0 28px' }}>
          Create an account to sync your progress across devices.
        </p>
        <form onSubmit={submit} className="card elev-sm" style={{ padding: 24 }}>
          <div className="grid grid-2" style={{ gap: 16 }}>
            <div className="field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                className="input"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                className="input"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p style={{ fontSize: 13, color: 'var(--color-accent-700)', margin: 0 }}>{error}</p>
          ) : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 18 }}>
          Already have an account? <Link to="/sign-in">Sign in</Link>
        </p>
      </main>
    </div>
  )
}
