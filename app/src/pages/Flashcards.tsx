import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/Page'

interface Card {
  tag: string
  front: string
  back: string
  example: string
}

const CARDS: Card[] = [
  {
    tag: 'STATUS CODES',
    front: '404 vs 403 — what is the difference?',
    back: '404 Not Found: the resource does not exist (or the server hides it). 403 Forbidden: it exists, the server knows who you are, and you still may not have it.',
    example: 'GET /admin → 403',
  },
  {
    tag: 'METHODS',
    front: 'Which HTTP methods are idempotent?',
    back: 'GET, PUT, DELETE, HEAD. Calling them N times has the same effect as once. POST is not idempotent — each call may create a new resource.',
    example: 'PUT /users/7 {name:"Ada"}',
  },
  {
    tag: 'HEADERS',
    front: 'What does Content-Type tell the receiver?',
    back: 'How to parse the body — its MIME type. The server is not guessing: send JSON with the wrong Content-Type and many APIs will reject it.',
    example: 'Content-Type: application/json',
  },
  {
    tag: 'CACHING',
    front: 'What does a 304 response contain?',
    back: 'No body at all. "Not Modified" tells the client its cached copy is still valid, saving the transfer.',
    example: 'If-None-Match: "abc123" → 304',
  },
  {
    tag: 'STATE',
    front: 'Why is HTTP called stateless?',
    back: 'Each request stands alone — the server keeps no memory between them. Sessions are rebuilt per-request from cookies or tokens carried by the client.',
    example: 'Cookie: session=xyz',
  },
]

type Rating = 'again' | 'good' | 'easy'

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

export default function Flashcards() {
  useDocumentTitle('Flashcards')

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [rated, setRated] = useState<Rating[]>([])

  const card = CARDS[index]

  const rate = (kind: Rating) => {
    setIndex((i) => Math.min(i + 1, CARDS.length - 1))
    setFlipped(false)
    setRated((r) => [...r, kind])
  }

  const dotColor = (di: number) => {
    if (di < rated.length)
      return rated[di] === 'again' ? 'var(--color-accent-600)' : 'var(--color-accent-2)'
    return di === index ? 'var(--color-accent)' : 'var(--color-neutral-300)'
  }

  const due = CARDS.length - Math.min(rated.length, CARDS.length - 1)

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
      <TopNav
        note="Page type · Flashcards / spaced repetition"
        right={<Tag tone="accent-2">{due} due today</Tag>}
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
              HTTP Essentials deck
            </h1>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>
              Card {index + 1} of {CARDS.length}
            </span>
          </div>

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
                    color: 'var(--color-neutral-500)',
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

          {flipped ? (
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
          ) : (
            <div
              style={{
                textAlign: 'center',
                marginTop: 18,
                fontSize: 13,
                color: 'var(--color-neutral-500)',
              }}
            >
              Rate yourself after flipping — honest ratings drive the review schedule.
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 26 }}>
            {CARDS.map((c, di) => (
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
          color: 'var(--color-neutral-600)',
        }}
      >
        <span>
          <strong style={{ color: 'var(--color-accent-2-700)' }}>12</strong> mastered
        </span>
        <span>
          <strong style={{ color: 'var(--color-accent-700)' }}>5</strong> due today
        </span>
        <span>
          <strong style={{ color: 'var(--color-neutral-800)' }}>9</strong> new this week
        </span>
      </div>
    </div>
  )
}
