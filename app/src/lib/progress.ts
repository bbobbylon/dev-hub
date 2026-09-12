/**
 * Real, persisted learner progress.
 *
 * Every "progress" figure in the designs was hardcoded — a fixed 4-day streak,
 * a fixed 8-of-23, a fixed minutes chart. This is the store that makes them
 * true: quiz scores, flashcard scheduling, milestones and per-day activity,
 * kept in localStorage and shared across tabs.
 *
 * Deliberately dependency-free and synchronous. It is a single small JSON blob per browser, with
 * no notion of a server or an account itself — an *optional* cross-device sync layer for signed-in
 * users lives entirely outside this file, in `lib/progressSync.ts`, which reads `state` from
 * `useProgress()` and writes it back via `importState` below rather than this file importing any
 * networking or auth code.
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

/** Persists `state`, silently giving up if storage is unavailable or full. */
function write(state: ProgressState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable or full — progress is a nicety, never a blocker */
  }
}

/** Subscribers in this tab; the storage event covers other tabs. */
const listeners = new Set<(s: ProgressState) => void>()

/** Applies `fn` to the current state, persists the result, and notifies every `useProgress` instance in this tab. */
function update(fn: (s: ProgressState) => ProgressState) {
  const next = fn(read())
  write(next)
  listeners.forEach((l) => l(next))
}

/* ── dates ─────────────────────────────────────────────────────────────── */

/** The `activity` record key for a given day, local time, as `YYYY-MM-DD`. */
export const dayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** `d` shifted by `n` days (negative to go backward). */
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

/** A card with no schedule yet is always due; otherwise due once `dueAt` has passed. */
export const isDue = (card: CardRecord | undefined, now = new Date()) =>
  !card || new Date(card.dueAt) <= now

/* ── the hook ──────────────────────────────────────────────────────────── */

/**
 * The main entry point every page uses to read and mutate progress. Returns
 * the current `state` plus one mutator per kind of progress event; each
 * mutator persists immediately and re-renders every component using this
 * hook (in this tab via `listeners`, in other tabs via the `storage` event).
 */
export function useProgress() {
  // Re-rendered whenever this tab's or another tab's progress changes.
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

  /** Marks a concept complete (first time only — later calls are no-ops). */
  const completeConcept = useCallback((slug: string) => {
    update((s) =>
      s.concepts[slug] ? s : { ...s, concepts: { ...s.concepts, [slug]: new Date().toISOString() } },
    )
  }, [])

  /**
   * Un-completes a concept — `completeConcept`'s inverse, behind `<ConceptComplete>`'s Undo.
   *
   * Without it the only way back from a mis-clicked "Mark complete" was the dashboard's Reset
   * progress, which also wipes quiz scores, flashcard schedules and milestones (BACKLOG item 22).
   * Deletes the key rather than storing a timestamp of the undo: `pathDone()` and every chip in
   * the Roadmap test for the slug's *presence*, so an un-completed concept has to look exactly
   * like one that was never completed.
   */
  const clearConcept = useCallback((slug: string) => {
    update((s) => {
      if (!s.concepts[slug]) return s
      const concepts = { ...s.concepts }
      delete concepts[slug]
      return { ...s, concepts }
    })
  }, [])

  /** Records one quiz attempt, keeping the personal-best score. */
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

  /** Rates a flashcard and reschedules it via SM-2 (see `schedule`). */
  const rateCard = useCallback((id: string, rating: Rating) => {
    update((s) => ({ ...s, cards: { ...s.cards, [id]: schedule(s.cards[id], rating) } }))
  }, [])

  /** Sets a milestone's checked state, or toggles it if `value` is omitted. */
  const toggleMilestone = useCallback((id: string, value?: boolean) => {
    update((s) => ({ ...s, milestones: { ...s.milestones, [id]: value ?? !s.milestones[id] } }))
  }, [])

  /** Adds `seconds` to today's activity total — called by `useActivityTracker`'s tick. */
  const addActivity = useCallback((seconds: number) => {
    update((s) => {
      const k = dayKey()
      return { ...s, activity: { ...s.activity, [k]: (s.activity[k] ?? 0) + seconds } }
    })
  }, [])

  /** Wipes all progress back to `EMPTY` — used by the Progress Dashboard's reset control. */
  const reset = useCallback(() => update(() => EMPTY), [])

  /** Replaces the whole state — used by `lib/progressSync.ts` to apply a synced server copy. */
  const importState = useCallback((next: ProgressState) => update(() => ({ ...EMPTY, ...next })), [])

  return {
    state,
    completeConcept,
    clearConcept,
    recordQuiz,
    rateCard,
    toggleMilestone,
    addActivity,
    reset,
    importState,
  }
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
