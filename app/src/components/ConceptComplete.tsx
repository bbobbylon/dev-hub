/**
 * The end-of-lesson completion panel — the one place a concept gets recorded as done.
 *
 * Every page that teaches a concept in `data/concepts.ts` ends with one of these. It reads and
 * writes `useProgress().state.concepts`, which is what the Roadmap's stage chips and the Progress
 * Dashboard's "Backend path" figure count. Before this component existed those surfaces counted a
 * record that only `QuizMode` ever wrote to, which is BACKLOG item 6.
 *
 * Two ways a concept gets recorded, and the distinction is deliberate:
 *
 *  - **Earned.** Pass `earned` and the panel records the concept the moment it turns true — the
 *    walkthrough hit its last step, the tests ran green, the mission finished. The page already
 *    knows when the learner did the thing, so it shouldn't make them click a second button to say
 *    so. `completeConcept()` is a no-op after the first call, so re-renders are free.
 *  - **Asserted.** Until then (and on the static pages, which have no such moment and pass no
 *    `earned`) the panel offers a button. The learner is the authority on whether they've read a
 *    field guide; this is a personal tracker in `localStorage`, so the only person a premature
 *    click misleads is the person clicking. `ProjectBuildAlong`'s milestone checkboxes already set
 *    that precedent.
 *
 * `hint` is what the page would rather they did — shown next to the button so "mark complete"
 * never looks like the intended path on a page that has a real one.
 */
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../lib/progress'
import { CONCEPT_BY_SLUG } from '../data/concepts'
import { Icon } from './Icon'

export function ConceptComplete({
  slug,
  earned,
  hint,
}: {
  /** Which concept this page teaches — a `slug` from `data/concepts.ts`. */
  slug: string
  /**
   * The page's own "they did it" condition. Omit on pages with no such moment; the panel then
   * offers only the button.
   */
  earned?: boolean
  /** What earns it automatically, e.g. "Step the walkthrough to the last line". */
  hint?: string
}) {
  const { state, completeConcept } = useProgress()
  const concept = CONCEPT_BY_SLUG[slug]
  const completedAt = state.concepts[slug]

  // Record as soon as the page says it was earned. Guarded on `completedAt` so a learner who
  // finished this months ago keeps their original date instead of having it reset on every visit.
  useEffect(() => {
    if (earned && !completedAt) completeConcept(slug)
  }, [earned, completedAt, completeConcept, slug])

  const done = Boolean(completedAt)
  const label = concept?.label ?? slug

  return (
    <section
      aria-label={`${label} completion`}
      style={{
        marginTop: 40,
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        background: done ? 'var(--color-accent-2-100)' : 'var(--color-neutral-100)',
        border: `1px solid ${done ? 'var(--color-accent-2)' : 'var(--color-divider)'}`,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          flex: 'none',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: done ? 'var(--color-accent-2)' : 'var(--color-neutral-300)',
        }}
      >
        <Icon
          name="check"
          size={16}
          color={done ? 'var(--color-bg)' : 'var(--color-neutral-700)'}
        />
      </div>

      <div style={{ flex: 1, minWidth: 220 }}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 16,
            color: done ? 'var(--color-accent-2-700)' : 'var(--color-text)',
          }}
        >
          {done ? `${label} — complete` : `Finished with ${label}?`}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-neutral-700)', marginTop: 3 }}>
          {done ? (
            <>
              Recorded {formatDay(completedAt)}. It counts on your{' '}
              <Link to="/roadmap" style={{ color: 'var(--color-accent-700)' }}>
                roadmap
              </Link>{' '}
              and{' '}
              <Link to="/progress-dashboard" style={{ color: 'var(--color-accent-700)' }}>
                progress dashboard
              </Link>
              .
            </>
          ) : (
            (hint ?? 'Marking it complete adds it to your roadmap and progress dashboard.')
          )}
        </div>
      </div>

      {done ? null : (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ flex: 'none' }}
          onClick={() => completeConcept(slug)}
        >
          Mark complete
        </button>
      )}
    </section>
  )
}

/** Renders the stored ISO timestamp as a plain local date, falling back to it verbatim if unparseable. */
function formatDay(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
