/**
 * Flashcards — route `/flashcards`, a spaced-repetition deck ("HTTP
 * Essentials"). Flip a card, rate yourself again/good/easy, and the rating
 * feeds `useProgress().rateCard`, which runs the real SM-2 `schedule()` from
 * `src/lib/progress.ts` to set the card's next due date. A session studies
 * only the cards `isDue` right now (falling back to the full deck if nothing
 * is due yet), fixes that set for the session so rating one card doesn't
 * reshuffle it, and ends with a summary screen instead of looping the last
 * card. The Progress Dashboard reads this same `state.cards` data to show a
 * due count and links here from its "up next" queue.
 *
 * The deck's content lives in `data/httpDeck.ts`, not here, because the
 * dashboard needs the card ids too and used to keep its own copy of them.
 */
import { useMemo, useState } from 'react'
import { isDue, useProgress } from '../lib/progress'
import { CARDS, DECK_NAME } from '../data/httpDeck'
import { TopNav } from '../components/TopNav'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

/** Self-rating a learner can give a card after flipping it. */
type Rating = 'again' | 'good' | 'easy'

// The three rating buttons shown under a flipped card, with their display intervals
const RATINGS: { kind: Rating; label: string; interval: string; border: string; background: string; color: string }[] = [
  {
    kind: 'again',
    label: 'Again',
    interval: '< 1 min',
    border: 'var(--color-accent-600)',
    background: 'var(--color-accent-100)',
    color: 'var(--color-accent-700)',
  },
  {
    kind: 'good',
    label: 'Good',
    interval: '2 days',
    border: 'var(--color-neutral-400)',
    background: 'var(--color-neutral-100)',
    color: 'var(--color-neutral-800)',
  },
  {
    kind: 'easy',
    label: 'Easy',
    interval: '5 days',
    border: 'var(--color-accent-2-600)',
    background: 'var(--color-accent-2-100)',
    color: 'var(--color-accent-2-700)',
  },
]

/** Spaced-repetition flashcard session: flip, rate, and repeat through the cards due today. */
export default function Flashcards() {
  useDocumentTitle('Flashcards')
  const { state, rateCard } = useProgress()

  const [index, setIndex] = useState(0) // position of the current card within `session`
  const [flipped, setFlipped] = useState(false) // whether the current card is showing its back
  const [rated, setRated] = useState<Rating[]>([]) // ratings given so far this session, in order

  // The session is the cards actually due now, fixed when the page loads so
  // rating one doesn't reshuffle the deck under you.
  const session = useMemo(
    () => {
      const due = CARDS.filter((c) => isDue(state.cards[c.tag]))
      return due.length ? due : CARDS
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const card = session[Math.min(index, session.length - 1)]
  const finished = index >= session.length

  /** Records a rating for the current card, persists it via `rateCard`, and advances to the next. */
  const rate = (kind: Rating) => {
    rateCard(card.tag, kind)
    setIndex((i) => i + 1)
    setFlipped(false)
    setRated((r) => [...r, kind])
  }

  /** Resets the session back to the first card with no ratings, for "Study again". */
  const restart = () => {
    setIndex(0)
    setFlipped(false)
    setRated([])
  }

  /** Color for the progress dot at session index `di` — rated, current, or upcoming. */
  const dotColor = (di: number) => {
    if (di < rated.length)
      return rated[di] === 'again' ? 'var(--color-accent-600)' : 'var(--color-accent-2)'
    return di === index ? 'var(--color-accent)' : 'var(--color-neutral-300)'
  }

  const dueNow = CARDS.filter((c) => isDue(state.cards[c.tag])).length
  const mastered = CARDS.filter((c) => (state.cards[c.tag]?.intervalDays ?? 0) >= 5).length

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
      <TopNav
        note="Page type · Flashcards / spaced repetition"
        right={<Tag tone="accent-2">{dueNow} due today</Tag>}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px 64px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 560 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <h1 style={{ fontSize: 16, margin: 0, color: 'var(--color-accent-700)' }}>
              {DECK_NAME} deck
            </h1>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>
              Card {Math.min(index + 1, session.length)} of {session.length}
            </span>
          </div>

          {finished ? (
            <div
              className="card elev-lg"
              style={{
                borderRadius: 'var(--radius-lg)',
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                padding: 40,
                textAlign: 'center',
                animation: 'pop 0.25s ease',
              }}
            >
              <Tag tone="accent-2">SESSION COMPLETE</Tag>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 30, lineHeight: 1.2 }}>
                {rated.length} card{rated.length === 1 ? '' : 's'} reviewed
              </div>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--color-neutral-700)',
                  margin: 0,
                  maxWidth: 380,
                }}
              >
                {dueNow === 0
                  ? 'Nothing else is due right now — the deck will resurface these as their intervals come round.'
                  : `${dueNow} card${dueNow === 1 ? '' : 's'} still due.`}
              </p>
              <button type="button" className="btn btn-secondary" onClick={restart}>
                Study again
              </button>
            </div>
          ) : (
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="bare"
            style={{ display: 'block', width: '100%', cursor: 'pointer' }}
            aria-label={flipped ? 'Show question' : 'Show answer'}
          >
            {!flipped ? (
              <div
                className="card elev-lg"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  minHeight: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 14,
                  padding: 40,
                  animation: 'pop 0.22s ease',
                }}
              >
                <Tag tone="accent">{card.tag}</Tag>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 34,
                    lineHeight: 1.2,
                    textAlign: 'center',
                    color: 'var(--color-text)',
                  }}
                >
                  {card.front}
                </div>
                <span
                  style={{
                    fontSize: 12.5,
                    color: 'var(--color-neutral-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 1 1-9-9" />
                    <polyline points="21 3 21 9 15 9" />
                  </svg>
                  tap to flip
                </span>
              </div>
            ) : (
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  minHeight: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  padding: 40,
                  background: 'var(--color-accent-700)',
                  boxShadow: 'var(--shadow-lg)',
                  animation: 'pop 0.22s ease',
                }}
              >
                <div
                  style={{
                    fontSize: 16.5,
                    lineHeight: 1.65,
                    textAlign: 'center',
                    color: 'var(--color-accent-100)',
                    maxWidth: 420,
                  }}
                >
                  {card.back}
                </div>
                <div
                  style={{
                    fontFamily: 'ui-monospace, Menlo, monospace',
                    fontSize: 13,
                    color: 'var(--color-bg)',
                    background: 'color-mix(in srgb, #000 25%, transparent)',
                    padding: '8px 14px',
                    borderRadius: 10,
                  }}
                >
                  {card.example}
                </div>
              </div>
            )}
          </button>
          )}

          {!finished && flipped ? (
            <div
              className="grid grid-3"
              style={{ gap: 10, marginTop: 18, animation: 'pop 0.25s ease' }}
            >
              {RATINGS.map((r) => (
                <button
                  key={r.kind}
                  type="button"
                  onClick={() => rate(r.kind)}
                  style={{
                    cursor: 'pointer',
                    padding: 13,
                    borderRadius: 999,
                    border: `2px solid ${r.border}`,
                    background: r.background,
                    color: r.color,
                    fontFamily: 'var(--font-heading)',
                    fontSize: 14,
                  }}
                >
                  {r.label}
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: 11,
                      fontWeight: 400,
                      marginTop: 2,
                    }}
                  >
                    {r.interval}
                  </span>
                </button>
              ))}
            </div>
          ) : finished ? null : (
            <div
              style={{
                textAlign: 'center',
                marginTop: 18,
                fontSize: 13,
                color: 'var(--color-neutral-700)',
              }}
            >
              Rate yourself after flipping — honest ratings drive the review schedule.
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 26 }}>
            {session.map((c, di) => (
              <span
                key={c.tag}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: dotColor(di),
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--color-neutral-300)',
          padding: '16px 32px',
          display: 'flex',
          gap: 22,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12.5,
          color: 'var(--color-neutral-700)',
        }}
      >
        <span>
          <strong style={{ color: 'var(--color-accent-2-700)' }}>{mastered}</strong> mastered
        </span>
        <span>
          <strong style={{ color: 'var(--color-accent-700)' }}>{dueNow}</strong> due today
        </span>
        <span>
          <strong style={{ color: 'var(--color-neutral-800)' }}>
            {CARDS.length - Object.keys(state.cards).filter((k) => CARDS.some((c) => c.tag === k)).length}
          </strong>{' '}
          not yet seen
        </span>
      </div>
    </div>
  )
}
