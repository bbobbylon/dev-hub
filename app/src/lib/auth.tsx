/**
 * Account state for Dev Hub's optional backend sign-in (`server/` at the repo root). `AuthProvider`
 * wraps the app in `main.tsx` — it has no router dependency, the same reason `BrowserRouter` lives
 * there rather than in `App.tsx`. `useAuth()` is how any component reads or changes the account.
 *
 * Persists `{ user, token }` to localStorage under `dev-hub.auth.v1`, guarded exactly like
 * `lib/progress.ts`'s `read()`/`write()` (private-mode browsers throw on storage access). A stored
 * token is trusted optimistically on load rather than re-validated against the server; it's only
 * dropped once a request comes back 401 (see `isUnauthorized`, used by `lib/progressSync.ts`).
 *
 * When `apiEnabled` is false (no `VITE_API_BASE_URL` — the normal static-deploy case), `login`/
 * `register` reject immediately with a clear message, so callers never need to branch on that flag
 * themselves.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ApiError,
  apiEnabled,
  login as apiLogin,
  register as apiRegister,
  type ApiUser,
  type RegisterForm,
} from './api'

const KEY = 'dev-hub.auth.v1'

interface StoredAuth {
  user: ApiUser
  token: string
}

function read(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as StoredAuth) : null
  } catch {
    return null
  }
}

function write(auth: StoredAuth | null) {
  try {
    if (auth) localStorage.setItem(KEY, JSON.stringify(auth))
    else localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable — sign-in still works for this tab, it just won't persist */
  }
}

const DISABLED_MESSAGE = "Sign-in isn't available in this deployment."

interface AuthValue {
  user: ApiUser | null
  token: string | null
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (form: RegisterForm) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(read)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => write(auth), [auth])

  const logout = useCallback(() => {
    setAuth(null)
    setError(null)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!apiEnabled) {
      setError(DISABLED_MESSAGE)
      throw new Error(DISABLED_MESSAGE)
    }
    try {
      const { user, token } = await apiLogin(email, password)
      setAuth({ user, token })
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed.'
      setError(message)
      throw err
    }
  }, [])

  const register = useCallback(
    async (form: RegisterForm) => {
      if (!apiEnabled) {
        setError(DISABLED_MESSAGE)
        throw new Error(DISABLED_MESSAGE)
      }
      try {
        await apiRegister(form)
        await login(form.email, form.password)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed.'
        setError(message)
        throw err
      }
    },
    [login],
  )

  const value = useMemo<AuthValue>(
    () => ({ user: auth?.user ?? null, token: auth?.token ?? null, error, login, register, logout }),
    [auth, error, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Reads the current account plus `login`/`register`/`logout`. Must be used under `AuthProvider`. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

/** True when `err` is a 401 from the backend — callers use this to drop a stale token. */
export const isUnauthorized = (err: unknown) => err instanceof ApiError && err.status === 401
