/**
 * Optional cross-device sync for signed-in users, layered on top of `lib/progress.ts` without that
 * file knowing anything about it. Mounted once in `App.tsx`, next to `useActivityTracker()`.
 *
 * On sign-in, pulls the server's saved copy and overwrites local state with it — server wins, the
 * simplest defensible default; a real merge strategy (reconciling per-quiz/per-card records instead
 * of replacing the whole blob) is a follow-up, not attempted here. After that, every local change is
 * pushed back to the server, debounced so the activity tracker's frequent ticks don't spam the
 * network. Every network call is fire-and-forget: a failure here is a missed sync, never a crash —
 * the same "never a blocker" philosophy `lib/progress.ts` applies to storage failures.
 */
import { useEffect, useRef } from 'react'
import { apiEnabled, fetchProgress, saveProgress } from './api'
import { isUnauthorized, useAuth } from './auth'
import { useProgress, type ProgressState } from './progress'

const PUSH_DELAY_MS = 2000

export function useProgressSync() {
  const { token, logout } = useAuth()
  const { state, importState } = useProgress()
  const pulledForToken = useRef<string | null>(null)
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextPush = useRef(false)

  useEffect(() => {
    if (!token) pulledForToken.current = null
  }, [token])

  // Pull once per sign-in.
  useEffect(() => {
    if (!apiEnabled || !token || pulledForToken.current === token) return
    pulledForToken.current = token
    fetchProgress(token)
      .then(({ progress }) => {
        if (progress && Object.keys(progress).length > 0) {
          // The next local-state effect run is this same import landing, not a new local edit.
          skipNextPush.current = true
          importState(progress as ProgressState)
        }
      })
      .catch((err) => {
        if (isUnauthorized(err)) logout()
        else console.warn('Dev Hub: could not load synced progress.', err)
      })
  }, [token, importState, logout])

  // Push on every local change, debounced.
  useEffect(() => {
    if (!apiEnabled || !token) return
    if (skipNextPush.current) {
      skipNextPush.current = false
      return
    }
    if (pushTimer.current) clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => {
      saveProgress(token, state).catch((err) => {
        if (isUnauthorized(err)) logout()
        else console.warn('Dev Hub: could not sync progress.', err)
      })
    }, PUSH_DELAY_MS)
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current)
    }
  }, [state, token, logout])
}
