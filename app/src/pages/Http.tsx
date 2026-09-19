/**
 * Route `/http` — Stage 5's first real lesson ("APIs & Databases"), the path's first step off pure
 * Python and into the subject the whole stage is actually about. A bigger jump than any lesson
 * before it, the same way Trees was a bigger jump than the flat structures before it: every prior
 * concept asked "what does this Python code do", and this one asks "what does the server do" —
 * there's no snippet to execute, just a request (or a pair of requests) and the real HTTP rule that
 * decides the outcome. Four predict-the-outcome questions (`QUESTIONS`), three of them landing on a
 * concrete status code rather than a printed value — the shape the coordinator suggested this stage
 * might actually need, used here because it genuinely fits (a status code *is* the value HTTP hands
 * back, the exact same "predict, then reveal" mechanic every lesson before this one has used):
 * `PUT` being idempotent — resending the identical request a second time (a flaky-network retry)
 * changes nothing further, which is exactly why it's safe to retry automatically and `POST` isn't;
 * `401 Unauthorized` vs `403 Forbidden` — a server's two different "no", one meaning "I don't know
 * who you are" (log in) and the other "I know exactly who you are, and it's still no" (permissions),
 * a mix-up `/api-anatomy`'s own status-code strip labels but never explains the distinction between;
 * `PUT` silently deleting fields a client didn't think to resend, because `PUT` means "this is now
 * the *entire* resource," not "update what I sent" — the real-world data-loss bug `PATCH` exists to
 * prevent; and HTTP's statelessness — a successful login a few seconds ago buys a follow-up request
 * nothing at all unless that request carries its own proof (a cookie, a token), because the protocol
 * itself has no memory between requests, full stop. Deliberately did not spend a question on the
 * bare verb-to-purpose mapping (`GET` reads, `POST` creates, `DELETE` removes) or the basic
 * 2xx/4xx/5xx status-code families — `/api-anatomy`'s wire-dump-and-decoder-strip already covers
 * that ground as reference material, and testing it here would repeat a page this stage already
 * links to (`related`) rather than teach past it.
 *
 * Same archetype as every lesson before it (predict-then-reveal question cards, `CodeListing`
 * snippets, a running score, a "try again" reset, `<ConceptComplete>` at the pass mark) — kept
 * deliberately, not by default: a wire-format request/response transcript is exactly as "showable"
 * in a `CodeListing` block as a Python snippet was, so there was no real reason to invent a new page
 * shape for a new subject, only to shift what the prompt asks for (a status code/outcome, not a
 * printed value) the same way `BigO.tsx` shifted it to a complexity class without changing the page
 * around it. `filename`s here are `.http`-style request transcripts, not Python source; `syn.kw`
 * colors the HTTP method, `syn.fn` colors header names, `syn.str` colors string/JSON values, and
 * `syn.cm` carries the scenario's own scene-setting the way a real comment would.
 *
 * This is also the round that graduates Stage 5 out of `Roadmap.tsx`'s fully-locked `laterStages`
 * path and into its own dedicated block — the same restructuring `Arrays.tsx` did for Stage 4 at
 * item 35, this time for real code, not just a comment: `laterStages` filters to `n > 5`, which is
 * now permanently empty (this is a five-stage path; there is no stage 6), so the `LockedTag`
 * component and `NumberNode`'s `'locked'` state — both now unreachable, not just idle — were removed
 * rather than left as code that can never run again. See `Roadmap.tsx`'s own header comment for the
 * full reasoning. `earned` fires once the learner has scored at or above the pass mark, same rule as
 * every lesson before it.
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
    filename: 'put-retry.http',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>PUT</span> /users/42
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>Content-Type:</span> application/json
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            {'{'}
            <span style={syn.str}>"name"</span>: <span style={syn.str}>"Ana"</span>
            {'}'}
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # The network was flaky, so the client retried and sent this exact request twice.
          </span>
        ),
      },
    ],
    prompt: "After this PUT is sent twice in a row, what's true about user 42's record?",
    options: [
      "It now has two entries named 'Ana' — PUT always creates a new resource",
      "It's identical to sending the request once — PUT is idempotent, so repeating it changes nothing further",
      "The second attempt fails with 409 Conflict, since that name is already set",
    ],
    correct: 1,
    explain:
      "PUT means \"replace whatever is at this URL with exactly this representation.\" Sending it once sets user 42's name to Ana; sending the identical request again just sets it to Ana again — already true, so nothing changes. That's what idempotent means: calling an operation N times has the same effect as calling it once. It's exactly why PUT (and GET, and DELETE) are safe to retry automatically when a network blips — a client or a proxy can resend one without knowing whether the first attempt landed, with no risk of a bad double effect. POST doesn't get that guarantee: POST /orders creates a new order every time it's called, so blindly retrying a POST can create two orders or charge a card twice, which is why retry logic has to treat it far more carefully than PUT.",
  },
  {
    filename: 'two-visitors.http',
    code: [
      {
        content: (
          <span style={syn.cm}># Visitor A has no session at all — never logged in this browser.</span>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /account/settings
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # Visitor B is logged in, but their account has no admin role.
          </span>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /admin/dashboard
          </>
        ),
      },
    ],
    prompt: 'What status code does each request come back with?',
    options: [
      "Both come back 403 Forbidden — neither visitor is allowed to see either page",
      "Visitor A gets 401 Unauthorized (no identity to check at all); Visitor B gets 403 Forbidden (a known identity the server is refusing)",
      "Both come back 401 Unauthorized, since neither visitor has admin access",
    ],
    correct: 1,
    explain:
      '401 Unauthorized is a confusingly-named status — it really means "unauthenticated": the server is saying "I don\'t know who you are; log in first." 403 Forbidden means the opposite kind of no: "I know exactly who you are, and the answer is still no." Visitor A has no session at all, so there\'s no identity for the server to check permissions against — 401. Visitor B is a fully authenticated, known user; the server just refuses because that account lacks the admin role — 403. The distinction isn\'t pedantic: the client\'s correct response is different in each case. A 401 means "show a login screen." A 403 means "this user is who they say they are, and logging in again won\'t change the answer" — the fix, if there is one, is a permissions change, not a login form.',
  },
  {
    filename: 'partial-put.http',
    code: [
      {
        content: (
          <span style={syn.cm}>
            # user 42 currently has both a name and an email on file.
          </span>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>PUT</span> /users/42
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>Content-Type:</span> application/json
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            {'{'}
            <span style={syn.str}>"name"</span>: <span style={syn.str}>"Bea"</span>
            {'}'}
          </>
        ),
      },
    ],
    prompt: "The client only wanted to change the name. What does user 42's record look like after this PUT?",
    options: [
      'name: "Bea", email still on file — PUT only touches the fields you actually send',
      'name: "Bea" and nothing else — the email is gone, because PUT replaces the whole resource with exactly what was sent',
      '400 Bad Request — PUT requires every existing field to be present or it rejects the request',
    ],
    correct: 1,
    explain:
      'PUT means "this is now the entire resource at this URL" — whatever body you send *replaces* the whole thing, field for field. Anything the old record had that this request didn\'t include isn\'t preserved; it\'s gone, because as far as PUT is concerned, a field that isn\'t in the new body was never meant to exist. That\'s a real, dangerous gotcha in practice: sending a partial body to PUT because it feels like "update this one field" silently deletes everything else. PATCH is the verb built for exactly this case — a genuine partial update that merges in only the fields you send and leaves the rest untouched. If the client here only wanted to change the name, PATCH /users/42 {"name": "Bea"} was the correct call, not PUT.',
  },
  {
    filename: 'two-in-a-row.http',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>POST</span> /login
          </>
        ),
      },
      {
        content: (
          <>
            {'{'}
            <span style={syn.str}>"username"</span>: <span style={syn.str}>"ana"</span>,{' '}
            <span style={syn.str}>"password"</span>: <span style={syn.str}>"···"</span>
            {'}'}
          </>
        ),
      },
      {
        content: (
          <>
            → <span style={syn.fn}>200 OK</span>
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # A few seconds later, same browser tab — no cookie or token attached.
          </span>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /account/orders
          </>
        ),
      },
    ],
    prompt: 'What happens on the second request?',
    options: [
      "It succeeds — the server remembers Ana just logged in",
      "401 Unauthorized — HTTP is stateless, so nothing about request one is remembered unless request two carries its own proof",
      "It succeeds, because both requests came from the same browser tab",
    ],
    correct: 1,
    explain:
      "HTTP is a stateless protocol by design — every request is handled completely on its own, with zero built-in memory of any request that came before it, even one from the same browser a second earlier. Logging in successfully doesn't leave a trace the server can see on the very next request; the only way request two can prove \"I'm the same Ana who just logged in\" is if it physically carries some piece of evidence along with it — a session cookie, a bearer token, something the login response handed back that this request re-sends. Without that, the server genuinely has no way to connect the two requests, and returns 401. That's why every authenticated request has to carry its own credentials on every single call — the server's \"memory\" only ever exists in what the client resends, never in the browser tab, the connection, or the IP address.",
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

/** Stage 5's first lesson page — four graded predict-the-outcome questions on HTTP behavior. */
export default function Http() {
  useDocumentTitle('HTTP')
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
        right={<Tag tone="accent">APIS &amp; DATABASES · HTTP</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 5 · APIS &amp; DATABASES
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          HTTP
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          No Python to run here — just a request (or two) and the real rule that decides what the
          server does with it. Predict the outcome below before picking an answer; you'll see
          whether you were right either way.
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
            slug="http"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
