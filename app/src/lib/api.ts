/**
 * Thin fetch wrapper around Dev Hub's optional backend (`server/` at the repo root — a separate
 * Spring Boot app, not part of this static build). Every call parses the backend's `HttpResponse`
 * JSON envelope and throws on failure; a missing `VITE_API_BASE_URL` disables these calls
 * entirely, which is the normal case for the free, backend-free GitHub Pages deploy. See
 * `lib/auth.tsx` (which calls `register`/`login`) and `lib/progressSync.ts` (which calls
 * `fetchProgress`/`saveProgress`).
 */
import type { ProgressState } from './progress'

export const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined
export const apiEnabled = Boolean(API_BASE)

export interface ApiUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role?: string
  permissions?: string
}

interface Envelope<T> {
  timeStamp: string
  statusCode: number
  status: string
  message: string
  data: T
}

/** Thrown for any non-2xx response; `status` lets callers special-case 401 (see `auth.tsx`). */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function send<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  let body: Envelope<T> | undefined
  try {
    body = await res.json()
  } catch {
    /* a non-JSON error body (e.g. a proxy/502 page) — fall through to the generic message below */
  }

  if (!res.ok) {
    throw new ApiError(body?.message || `Request failed (${res.status}).`, res.status)
  }
  return (body as Envelope<T>).data
}

export interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
}

export function register(form: RegisterForm) {
  return send<{ user: ApiUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(form),
  })
}

export function login(email: string, password: string) {
  return send<{ user: ApiUser; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/** `progress` is `{}` when the account has never synced before. */
export function fetchProgress(token: string) {
  return send<{ progress: Partial<ProgressState> }>('/api/progress', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function saveProgress(token: string, state: ProgressState) {
  return send<unknown>('/api/progress', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(state),
  })
}
