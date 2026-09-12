/**
 * The "HTTP Essentials" flashcard deck — the one piece of content two pages both need.
 *
 * `pages/Flashcards.tsx` renders it. `pages/ProgressDashboard.tsx` needs only the card ids, to
 * count what's due and to name the deck in its "up next" queue. It used to keep its own literal
 * copy of those ids, which meant editing the deck here silently broke the dashboard's due count —
 * no type error, no failing check, just a wrong number. Both now read `DECK_TAGS`, derived from
 * the cards themselves, so the two can't drift.
 *
 * A card's `tag` doubles as its id in `lib/progress.ts`'s `state.cards`, which is why renaming one
 * isn't a cosmetic change: it orphans whatever SM-2 schedule a learner had built up for that card.
 */

/** One flashcard: `tag` doubles as its id in `useProgress()`'s `state.cards`. */
export interface Card {
  tag: string
  front: string
  back: string
  example: string
}

/** Shown on the Flashcards page and in the dashboard's "up next" row. */
export const DECK_NAME = 'HTTP Essentials'

// The HTTP Essentials deck's cards, front/back/example
export const CARDS: Card[] = [
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

/** Every card id in the deck — what `ProgressDashboard` counts `isDue` against. */
export const DECK_TAGS = CARDS.map((c) => c.tag)
