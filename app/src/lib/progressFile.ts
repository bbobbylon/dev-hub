/**
 * Manual backup and restore of learner progress, as a JSON file the browser downloads and the
 * learner hands back later.
 *
 * This is the no-account counterpart to `lib/progressSync.ts`: same blob, same shape, but moved by
 * the person rather than by a server, so it works on the static GitHub Pages deploy where there is
 * no backend at all (see `lib/api.ts`'s `apiEnabled`). The Progress Dashboard is the only caller —
 * its Export/Import controls sit next to the reset button, because "back this up first" is the
 * thing you want one click away from "wipe it".
 *
 * `parseProgressFile` is deliberately paranoid. A restore file is untrusted input — it has been
 * sitting in a downloads folder, possibly hand-edited — and the dashboard does real arithmetic on
 * these values (`q.best / q.total`, `new Date(card.dueAt)`, minute sums), so a malformed entry
 * would surface as a crashed render rather than a bad number. Every record is therefore rebuilt
 * field by field and anything that doesn't type-check is dropped, not coerced.
 */
import { EMPTY, type CardRecord, type ProgressState, type QuizRecord, type Rating } from './progress'

/** Written into every export; `parseProgressFile` refuses anything else. Matches `ProgressState['version']`. */
const FILE_VERSION = 1

const RATINGS: Rating[] = ['again', 'good', 'easy']
const DAY = /^\d{4}-\d{2}-\d{2}$/

/* ── export ────────────────────────────────────────────────────────────── */

/** `dev-hub-progress-2026-09-11.json` — dated so successive backups don't overwrite each other. */
export function backupFilename(now = new Date()): string {
  const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return `dev-hub-progress-${d}.json`
}

/**
 * Hands the browser `state` as a file to save. Returns the filename offered, which the caller
 * shows in its confirmation note.
 */
export function downloadProgress(state: ProgressState, now = new Date()): string {
  const name = backupFilename(now)
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  // Appended before clicking: a detached anchor's click is ignored in some browsers.
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Deferred — revoking synchronously can cancel the download that just started.
  setTimeout(() => URL.revokeObjectURL(url), 0)
  return name
}

/* ── import ────────────────────────────────────────────────────────────── */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** True for a string that `new Date()` can actually parse — `dueAt` drives the flashcard queue. */
const isDateString = (v: unknown): v is string =>
  typeof v === 'string' && !Number.isNaN(new Date(v).getTime())

/**
 * Keeps only the entries of `raw` that `pick` accepts (and, where given, whose key `keyOk`
 * accepts). The generic shape means one loop covers all five record types, each with its own
 * per-entry validator below.
 */
function pickEntries<T>(
  raw: unknown,
  pick: (value: unknown) => T | undefined,
  keyOk?: (key: string) => boolean,
): Record<string, T> {
  if (!isRecord(raw)) return {}
  const out: Record<string, T> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (keyOk && !keyOk(key)) continue
    const kept = pick(value)
    if (kept !== undefined) out[key] = kept
  }
  return out
}

const pickQuiz = (v: unknown): QuizRecord | undefined => {
  if (!isRecord(v)) return undefined
  const { best, total, attempts, lastAt } = v
  // `total` guards the dashboard's `best / total` accuracy average against a divide-by-zero NaN.
  if (!isFiniteNumber(best) || !isFiniteNumber(total) || total <= 0) return undefined
  return {
    best,
    total,
    attempts: isFiniteNumber(attempts) ? attempts : 1,
    lastAt: isDateString(lastAt) ? lastAt : new Date().toISOString(),
  }
}

const pickCard = (v: unknown): CardRecord | undefined => {
  if (!isRecord(v)) return undefined
  const { ease, intervalDays, dueAt, lastRating } = v
  if (!isFiniteNumber(ease) || !isFiniteNumber(intervalDays) || !isDateString(dueAt)) return undefined
  return {
    ease,
    intervalDays,
    dueAt,
    lastRating: RATINGS.includes(lastRating as Rating) ? (lastRating as Rating) : 'good',
  }
}

/**
 * Parses one backup file's text into a state safe to hand to `useProgress().importState`.
 *
 * Throws an `Error` whose message is written to be shown to the learner verbatim — the dashboard
 * prints it next to the Import button rather than interpreting it.
 */
export function parseProgressFile(text: string): ProgressState {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error("That file isn't valid JSON — pick a file exported from Dev Hub.")
  }
  if (!isRecord(raw)) throw new Error("That doesn't look like a Dev Hub progress file.")
  if (raw.version !== FILE_VERSION) {
    throw new Error(
      `That file says version ${String(raw.version)}; this app reads version ${FILE_VERSION} backups.`,
    )
  }

  return {
    ...EMPTY,
    concepts: pickEntries(raw.concepts, (v) => (isDateString(v) ? (v as string) : undefined)),
    quizzes: pickEntries(raw.quizzes, pickQuiz),
    cards: pickEntries(raw.cards, pickCard),
    milestones: pickEntries(raw.milestones, (v) => (typeof v === 'boolean' ? v : undefined)),
    // Keys here are `dayKey()` output, and the streak/chart look days up by that exact string —
    // any other key would be dead weight that never matches a day.
    activity: pickEntries(
      raw.activity,
      (v) => (isFiniteNumber(v) && v >= 0 ? v : undefined),
      (k) => DAY.test(k),
    ),
  }
}

/**
 * One-line inventory of a state — "12 concepts, 3 quizzes, 5 cards" — used in the import
 * confirmation so the learner sees what they're about to replace their progress with, counted
 * after validation rather than as the file claims.
 */
export function summarize(state: ProgressState): string {
  const parts = [
    [Object.keys(state.concepts).length, 'concept'],
    [Object.keys(state.quizzes).length, 'quiz', 'quizzes'],
    [Object.keys(state.cards).length, 'flashcard'],
    [Object.keys(state.activity).length, 'day of activity', 'days of activity'],
  ] as const
  const said = parts
    .filter(([n]) => n > 0)
    .map(([n, one, many]) => `${n} ${n === 1 ? one : (many ?? `${one}s`)}`)
  return said.length ? said.join(', ') : 'no saved progress'
}
