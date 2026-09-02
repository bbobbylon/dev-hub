/**
 * Real, persisted learner progress.
 *
 * Every "progress" figure in the designs was hardcoded — a fixed 4-day streak,
 * a fixed 8-of-23, a fixed minutes chart. This is the store that makes them
 * true: quiz scores, flashcard scheduling, milestones and per-day activity,
 * kept in localStorage and shared across tabs.
 *
 * Deliberately dependency-free and synchronous. It is a single small JSON blob
 * per browser; there is no server and no account.
 */
import { useCallback, useEffect, useState } from 'react'

const KEY = 'dev-hub.progress.v1'

export type Rating = 'again' | 'good' | 'easy'

export interface QuizRecord {
  best: number
  total: number
  attempts: number
  lastAt: string
}

export interface CardRecord {
  /** Multiplier driving how fast the interval grows; SM-2's "ease factor". */
  ease: number
  /** Days until the next review — 0 means "again, this session". */
  intervalDays: number
  dueAt: string
  lastRating: Rating
}

export interface ProgressState {
  version: 1
  /** slug → ISO timestamp the concept was completed. */
  concepts: Record<string, string>
  /** quiz id → best score and attempt history. */
  quizzes: Record<string, QuizRecord>
  /** card id → spaced-repetition schedule. */
  cards: Record<string, CardRecord>
  /** "<page>:<index>" → checked. */
  milestones: Record<string, boolean>
  /** "YYYY-MM-DD" → seconds spent with a page visible. */
  activity: Record<string, number>
}

export const EMPTY: ProgressState = {
  version: 1,
  concepts: {},
  quizzes: {},
  cards: {},
  milestones: {},
  activity: {},
}

/* ── storage ───────────────────────────────────────────────────────────── */

/** Private-mode browsers throw on access, so every touch is guarded. */
function read(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as ProgressState
    if (parsed.version !== 1) return EMPTY
    return { ...EMPTY, ...parsed }
  } catch {
    return EMPTY
  }
}

function write(state: ProgressState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable or full — progress is a nicety, never a blocker */
  }
}

/** Subscribers in this tab; the storage event covers other tabs. */
const listeners = new Set<(s: ProgressState) => void>()

function update(fn: (s: ProgressState) => ProgressState) {
  const next = fn(read())
  write(next)
  listeners.forEach((l) => l(next))
}

/* ── dates ─────────────────────────────────────────────────────────────── */

export const dayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000)

/**
 * Consecutive days with activity, counting back from today. Yesterday still
 * counts as alive so the streak doesn't die before the day is over.
 */
export function streakOf(activity: Record<string, number>, today = new Date()): number {
  const active = (d: Date) => (activity[dayKey(d)] ?? 0) > 0
  let start = 0
  if (!active(today)) {
    if (!active(addDays(today, -1))) return 0
    start = 1
  }
  let streak = 0
  for (let i = start; ; i++) {
    if (!active(addDays(today, -i))) break
    streak++
  }
  return streak
}

/** Minutes per day for the last `days` days, oldest first. */
export function recentMinutes(activity: Record<string, number>, days = 14, today = new Date()) {
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(today, -(days - 1 - i))
    return { date: d, minutes: Math.round((activity[dayKey(d)] ?? 0) / 60) }
  })
}

/* ── spaced repetition ─────────────────────────────────────────────────── */

const MIN_EASE = 1.3

/** SM-2, trimmed to the three ratings the deck UI actually offers. */
export function schedule(prev: CardRecord | undefined, rating: Rating, now = new Date()): CardRecord {
  const ease = prev?.ease ?? 2.5
  const interval = prev?.intervalDays ?? 0

  if (rating === 'again') {
    return {
      ease: Math.max(MIN_EASE, ease - 0.2),
      intervalDays: 0,
      dueAt: now.toISOString(),
      lastRating: rating,
    }
  }
  const grown =
    interval === 0 ? (rating === 'easy' ? 5 : 2) : Math.round(interval * ease * (rating === 'easy' ? 1.3 : 1))
  return {
    ease: rating === 'easy' ? ease + 0.15 : ease,
    intervalDays: grown,
    dueAt: addDays(now, grown).toISOString(),
    lastRating: rating,
  }
}

export const isDue = (card: CardRecord | undefined, now = new Date()) =>
  !card || new Date(card.dueAt) <= now

/* ── the hook ──────────────────────────────────────────────────────────── */

export function useProgress() {
  const [state, setState] = useState<ProgressState>(read)

  useEffect(() => {
    listeners.add(setState)
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setState(read())
    }
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(setState)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const completeConcept = useCallback((slug: string) => {
    update((s) =>
      s.concepts[slug] ? s : { ...s, concepts: { ...s.concepts, [slug]: new Date().toISOString() } },
    )
  }, [])

  const recordQuiz = useCallback((id: string, score: number, total: number) => {
    update((s) => {
      const prev = s.quizzes[id]
      return {
        ...s,
        quizzes: {
          ...s.quizzes,
          [id]: {
            best: Math.max(prev?.best ?? 0, score),
            total,
            attempts: (prev?.attempts ?? 0) + 1,
            lastAt: new Date().toISOString(),
          },
        },
      }
    })
  }, [])

  const rateCard = useCallback((id: string, rating: Rating) => {
    update((s) => ({ ...s, cards: { ...s.cards, [id]: schedule(s.cards[id], rating) } }))
  }, [])

  const toggleMilestone = useCallback((id: string, value?: boolean) => {
    update((s) => ({ ...s, milestones: { ...s.milestones, [id]: value ?? !s.milestones[id] } }))
  }, [])

  const addActivity = useCallback((seconds: number) => {
    update((s) => {
      const k = dayKey()
      return { ...s, activity: { ...s.activity, [k]: (s.activity[k] ?? 0) + seconds } }
    })
  }, [])

  const reset = useCallback(() => update(() => EMPTY), [])

  return { state, completeConcept, recordQuiz, rateCard, toggleMilestone, addActivity, reset }
}

/**
 * Counts time with the tab visible, in coarse ticks, so the streak and the
 * minutes chart reflect real use rather than a hardcoded number.
 */
export function useActivityTracker(tickSeconds = 15) {
  const { addActivity } = useProgress()
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') addActivity(tickSeconds)
    }, tickSeconds * 1000)
    return () => clearInterval(id)
  }, [addActivity, tickSeconds])
}
