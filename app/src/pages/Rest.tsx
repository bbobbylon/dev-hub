/**
 * Route `/rest` — Stage 5's second lesson ("APIs & Databases"), continuing straight on from
 * `/http`. HTTP taught the protocol's own rules (verbs, status codes, statelessness) in the
 * abstract; REST is the layer on top — a set of *conventions* for how a URL should be shaped and
 * which HTTP verb a given action should use, so an API is predictable to a client that has never
 * seen it before. Checked `/api-anatomy` first, same as HTTP's own build note did — its wire-dump
 * already covers bare verb-to-purpose mapping (`GET` reads, `POST` creates) and the 2xx/4xx/5xx
 * status families, so none of the four questions here re-teach that ground. Four predict-the-outcome
 * questions (`QUESTIONS`), each a genuinely REST-specific design convention rather than a repeat of
 * HTTP's own four gotchas: **resource-oriented URLs** — a path should name a resource with a noun
 * (`/users/55/reviews`), not restate the action as a verb (`/getReviewsForUser/55`) the HTTP method
 * already carries, and nesting expresses a "belongs to" relationship directly in the URL's shape
 * rather than requiring a client to read documentation to learn it; **collection vs. single-item
 * response shape** — `/books/9999` names one specific resource, so a well-designed API answers a
 * missing one with `404`, not a `200` dressed up as `{}` or `[]` (the latter is the *correct* empty
 * shape, but only for a collection endpoint like `/books?author=missing`, never for a single-item
 * one — mixing the two shapes on the same kind of route is what makes an API's contract
 * unpredictable from client code); **query parameters vs. one-path-per-view** — sorting or paging a
 * collection asks for a different *view* of the same resource, not a new resource, which is exactly
 * what `?sort=&page=` exists for, contrasted with the real anti-pattern of inventing a distinct URL
 * per sort order and page number; and **POST-to-a-collection vs. PUT-to-a-known-URL for creation**
 * — who decides the new resource's id, and what a flaky-network retry does about it. That last one
 * deliberately revisits PUT's idempotency, which `/http`'s own first question already established
 * from the "resend the same PUT" side — but from a new, REST-specific angle: which verb a client
 * should even *reach for* when creating a resource, and the concrete difference a retry makes under
 * each choice (a second POST silently makes a second user; a second identical PUT does not), not a
 * repeat of "does resending PUT change anything further."
 *
 * Same archetype as every lesson before it (predict-then-reveal question cards, `CodeListing`
 * snippets, a running score, a "try again" reset, `<ConceptComplete>` at the pass mark) — and, like
 * every Stage 4/5 round since Arrays, this needed no `Roadmap.tsx` change: `PartialStage` is fully
 * derived from `conceptsInStage(5)` and `UPCOMING_STAGES`'s `n: 5` entry, so removing `'REST'` from
 * the latter's `concepts` array is the entire wiring change that page needs. `filename`s here are
 * `.http`-style request transcripts, same convention `/http` used — REST is a set of conventions
 * *for* HTTP, not a different wire format, so there was no reason to invent a new code-listing style
 * for it. `earned` fires once the learner has scored at or above the pass mark, same rule as every
 * lesson before it.
 */
import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { CodeListing, syn, type ListingLine } from '../components/CodeListing'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { ConceptComplete } from '../components/ConceptComplete'

/** One predict-the-outcome question: a request transcript, three choices, and the real reasoning either way. */
interface Question {
  filename: string
  code: ListingLine[]
  prompt: string
  options: string[]
  correct: number
  explain: string
}

const QUESTIONS: Question[] = [
  {
    filename: 'endpoint-design.http',
    code: [
      {
        content: (
          <span style={syn.cm}># Goal: fetch every review user 55 has written.</span>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /getReviewsForUser/55
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /users/55/reviews
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>POST</span> /reviews/search
          </>
        ),
      },
      {
        content: (
          <>
            {'{'}
            <span style={syn.str}>"userId"</span>: 55{'}'}
          </>
        ),
      },
    ],
    prompt: "Which of these three is the RESTful way to ask for user 55's reviews?",
    options: [
      'GET /getReviewsForUser/55 — the path spells out exactly what the request does',
      "GET /users/55/reviews — the path names two resources and nests one under the other",
      'POST /reviews/search with {"userId": 55} in the body — keeps the search logic out of the URL entirely',
    ],
    correct: 1,
    explain:
      "REST names resources with nouns in the URL path — the HTTP verb already says what to do, so baking a verb into the path itself, like getReviewsForUser, is redundant with GET and is a giveaway of an RPC-style API wearing HTTP as a costume. Nesting /users/55/reviews expresses \"these reviews belong to this user\" directly in the URL's own structure — no separate documentation needed to explain the relationship, and it's exactly the shape a REST-aware client, cache, or router already expects to see. The third option smuggles a lookup into a POST body: POST doesn't mean \"look something up,\" so a response to it isn't cacheable and isn't safe to retry automatically the way a GET's response is — the same reason a client can't just resend a POST after a network blip without risk, which is where this stage's own HTTP lesson picks the story back up. And it doesn't even dodge the real problem: the thing being fetched, a user's reviews, still deserved a real URL of its own.",
  },
  {
    filename: 'missing-book.http',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /books/9999
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}># Book 9999 has never existed in this catalog.</span>
        ),
      },
    ],
    prompt: 'What should a well-designed REST API send back here?',
    options: [
      '200 OK with an empty object {} — safer than an error, so client code never has to handle a failure case',
      '200 OK with [] — the same empty shape /books would return for a search with zero matches',
      '404 Not Found, with a body describing the error — the URL names one specific resource, and nothing lives there',
    ],
    correct: 2,
    explain:
      "/books/9999 names one specific resource, not a search or a list — so REST's own status-code vocabulary already has the honest answer: 404 means nothing lives at this URL. The first two options both dress up the exact same fact — there is no book 9999 — as if the request had actually succeeded, which forces every caller to inspect the body just to learn whether the call \"worked,\" defeating the entire reason status codes exist. The second option makes a more specific mistake: [] is the correct empty-result shape, but for a collection endpoint like GET /books?author=missing, not a single-item one — mixing those two shapes on the same kind of route is exactly what makes an API's contract unpredictable from the client's side, since the same parsing code now has to guess which shape it's looking at.",
  },
  {
    filename: 'catalog-paging.http',
    code: [
      { content: <span style={syn.cm}># Design 1</span> },
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /products/sorted-by-price/page-2
          </>
        ),
      },
      { content: <></> },
      { content: <span style={syn.cm}># Design 2</span> },
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /products?sort=price&amp;page=2
          </>
        ),
      },
    ],
    prompt: 'Which is the RESTful way to ask for page 2 of the product list, sorted by price?',
    options: [
      'Design 1 — every sort order and page number gets its own resource-shaped path',
      "Design 2 — /products is still the one resource; sort and page are modifiers on how it's represented, passed as query parameters",
      "They're equivalent — REST doesn't distinguish between a path segment and a query parameter",
    ],
    correct: 1,
    explain:
      "/products names exactly one resource — the product collection. Asking for it sorted a certain way, or a certain page of it, doesn't create a new resource; it asks for a different view of the same one, which is precisely what query parameters exist for. Design 1 treats every sort order and page number as if each were its own permanent resource living at its own URL — /products/sorted-by-price/page-2, /products/sorted-by-name/page-3, and on — which balloons into an unbounded number of \"resources\" that are all really the same list, and breaks outright the moment a caller wants to combine two filters nobody thought to hardcode a path for (sorted by price, in-stock only, say). Query parameters exist to keep a resource's identity — the path — separate from a caller's requested view of it, exactly the separation Design 1 collapses.",
  },
  {
    filename: 'create-user.http',
    code: [
      { content: <span style={syn.cm}># Design A</span> },
      {
        content: (
          <>
            <span style={syn.kw}>POST</span> /users
          </>
        ),
      },
      {
        content: (
          <>
            {'{'}
            <span style={syn.str}>"name"</span>: <span style={syn.str}>"Priya"</span>
            {'}'}
          </>
        ),
      },
      {
        content: (
          <>
            → <span style={syn.fn}>201 Created</span>, Location: /users/91
          </>
        ),
      },
      { content: <></> },
      { content: <span style={syn.cm}># Design B</span> },
      {
        content: (
          <>
            <span style={syn.kw}>PUT</span> /users/91
          </>
        ),
      },
      {
        content: (
          <>
            {'{'}
            <span style={syn.str}>"name"</span>: <span style={syn.str}>"Priya"</span>
            {'}'}
          </>
        ),
      },
      {
        content: (
          <>
            → <span style={syn.fn}>201 Created</span>
          </>
        ),
      },
    ],
    prompt:
      "Both created user 91. What actually differs, and what happens if the client's connection blips and it resends the identical request?",
    options: [
      'No real difference — POST and PUT are interchangeable for creating a resource',
      'Design A: the server invented the id (91) and reported it back; resending the same POST creates a second, different user. Design B: the client already named the URL and id; resending the identical PUT just leaves user 91 exactly as is.',
      'Design B is invalid — PUT can only update a resource that already exists, never create one',
    ],
    correct: 1,
    explain:
      "POST targets a collection (/users) and hands the server the job of inventing a new identity for whatever gets created — that's exactly why the response needs a Location header pointing at the URL the server just made up. Because every POST means \"make a new one,\" resending it isn't safe: two identical POSTs make two different users with two different ids, which is exactly why POST isn't idempotent. PUT flips that: the client supplies the full URL, id included, so PUT /users/91 means \"make user 91 be exactly this,\" whether user 91 existed a moment ago or not — sending it once creates the user, and resending the identical request just reconfirms the same state, no duplicate, because PUT is idempotent. That's the same guarantee /http's own first question established from PUT's replace side — now it's the reason to reach for PUT over POST at all, whenever the client can name the id itself. The third option is a common misconception: PUT creating a brand-new resource is completely valid REST — it's just less common in practice, since most clients don't know a resource's id before the server has created it, which is exactly why POST-to-a-collection is the more common creation pattern in the wild.",
  },
]

const PASS_MARK = 3

/** One question card: the request transcript, three answer choices, and the reveal once picked. */
function QuestionCard({
  q,
  picked,
  onPick,
}: {
  q: Question
  picked: number | null
  onPick: (i: number) => void
}) {
  const answered = picked !== null
  const correct = picked === q.correct

  return (
    <div className="card" style={{ borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}>
      <CodeListing filename={q.filename} lines={q.code} gutterWidth={32} fontSize={13.5} />
      <p
        style={{
          fontSize: 14.5,
          fontWeight: 600,
          color: 'var(--color-text)',
          margin: '16px 0 12px',
        }}
      >
        {q.prompt}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: answered ? 14 : 0 }}>
        {q.options.map((opt, i) => {
          const isPicked = picked === i
          const isRight = answered && i === q.correct
          const isWrongPick = answered && isPicked && !isRight
          return (
            <button
              key={opt}
              type="button"
              onClick={() => !answered && onPick(i)}
              disabled={answered}
              style={{
                textAlign: 'left',
                cursor: answered ? 'default' : 'pointer',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13.5,
                fontFamily: 'ui-monospace, Menlo, monospace',
                border: isRight
                  ? '2px solid var(--color-accent-2)'
                  : isWrongPick
                    ? '2px solid var(--color-accent)'
                    : '1px solid var(--color-neutral-300)',
                background: isRight
                  ? 'var(--color-accent-2-100)'
                  : isWrongPick
                    ? 'var(--color-accent-100)'
                    : 'var(--color-bg)',
                color: 'var(--color-text)',
              }}
            >
              {opt}
              {isRight ? ' ✓' : isWrongPick ? ' ✗' : ''}
            </button>
          )
        })}
      </div>
      {answered ? (
        <div
          style={{
            display: 'flex',
            gap: 10,
            background: correct ? 'var(--color-accent-2-100)' : 'var(--color-neutral-100)',
            borderRadius: 14,
            padding: '12px 16px',
            fontSize: 13.5,
            lineHeight: 1.6,
            color: 'var(--color-neutral-800)',
            animation: 'pop 0.25s ease',
          }}
        >
          <Icon
            name={correct ? 'check' : 'x'}
            size={15}
            color={correct ? 'var(--color-accent-2-700)' : 'var(--color-neutral-700)'}
          />
          <span>{q.explain}</span>
        </div>
      ) : null}
    </div>
  )
}

/** Stage 5's second lesson page — four graded predict-the-outcome questions on REST conventions. */
export default function Rest() {
  useDocumentTitle('REST')
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null))

  const score = answers.filter((a, i) => a === QUESTIONS[i].correct).length
  const attempted = answers.filter((a) => a !== null).length
  const earned = score >= PASS_MARK

  const pick = (qIndex: number, optIndex: number) =>
    setAnswers((prev) => prev.map((v, i) => (i === qIndex ? optIndex : v)))
  const reset = () => setAnswers(QUESTIONS.map(() => null))

  return (
    <div className="page">
      <TopNav
        note="Page type · Concept lesson · APIs"
        right={<Tag tone="accent">APIS &amp; DATABASES · REST</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 5 · APIS &amp; DATABASES
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          REST
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          HTTP is the protocol; REST is the set of conventions for using it well — how a URL should
          be shaped, and which verb a given action should reach for. Predict what a well-designed API
          does below, then see why.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 22,
            fontSize: 13.5,
            color: 'var(--color-neutral-700)',
          }}
        >
          <span aria-live="polite">
            Score: {score} of {QUESTIONS.length} correct
            {attempted < QUESTIONS.length ? ` (${attempted} answered)` : ''}
          </span>
          {attempted > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={reset}>
              ↺ Try again
            </button>
          ) : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {QUESTIONS.map((q, i) => (
            <QuestionCard key={q.filename} q={q} picked={answers[i]} onPick={(opt) => pick(i, opt)} />
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <ConceptComplete
            slug="rest"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
