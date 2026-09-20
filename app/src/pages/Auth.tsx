/**
 * Route `/auth` — Stage 5's fifth lesson ("APIs & Databases"), continuing straight on from `/http`
 * and `/rest`: those two taught the protocol and its conventions in the abstract, and both leaned on
 * "the request needs to prove who's asking" without ever explaining what that proof actually is, how
 * it should be kept, or what happens once it needs to be taken back. Checked for overlap before
 * writing a single question, the same discipline every Stage 5 round before this one has used:
 * `grep`ped `Http.tsx` for its own second question first — confirmed it's exactly "401 Unauthorized
 * vs. 403 Forbidden," identity-absent vs. identity-known-but-refused, and nothing about tokens,
 * sessions, or how a server actually verifies anyone — so none of the four questions below repeat
 * that ground; also read `/api-anatomy`, which mentions "the token is your ID card" and shows an
 * `Authorization: Bearer eyJhbGci…` header but never explains what's inside that token or what makes
 * it trustworthy, and `Glossary.tsx`'s existing JWT entry ("signed, self-contained… anyone can read
 * it, they just can't forge a valid signature for it"), which this lesson's second question turns
 * from a stated fact into something the learner watches actually happen and fails to forge, rather
 * than repeating it as a second flat definition.
 *
 * **Four predict-the-outcome questions (`QUESTIONS`), each verified by tracing the real mechanism
 * through step by step, not assumed** — the standing instruction for this round was explicit that a
 * plausible-sounding security claim isn't good enough, it has to be correct: **why a fast hash is
 * the wrong tool for a password** — `sha256(password)` isn't reversed by an attacker who gets a
 * leaked table, it's guessed-and-checked, and SHA-256 is deliberately fast (built for cheap
 * checksums, not secrecy), so a GPU burns through billions of guesses a second against it; a
 * purpose-built password hash (bcrypt/scrypt/Argon2) is deliberately *slow* and tunable, multiplying
 * an attacker's total cost across every guess while one real login barely notices the extra
 * milliseconds — genuinely new ground, since no prior lesson on the path has touched password
 * storage at all. **A JWT is signed, not encrypted** — its header and payload are just base64,
 * reversible by anyone holding the token with no secret required (this is what makes "the token is
 * your ID card" in `/api-anatomy` and the Glossary's JWT entry true, not a contradiction of them);
 * the third segment is a signature computed once, at issue time, over exactly those bytes, using a
 * secret only the server holds, so editing the decoded payload and sending it back fails the
 * server's own signature check — proof of no tampering since signing, not secrecy of contents, is
 * the actual guarantee. **Cookie-held sessions vs. a manually-attached bearer token trade one attack
 * surface for a different one, not a strictly safer one for a strictly riskier one** — a browser
 * auto-attaches a cookie to any request aimed at that cookie's domain regardless of which page
 * triggered it (the CSRF mechanism, real whenever `SameSite`/a CSRF-token check isn't in the way);
 * a bearer token a page's own JS must read from storage and attach by hand isn't auto-sent that way,
 * so the identical forged cross-site form arrives at the server with nothing attached — but that
 * same JS-readable storage is exactly what an XSS bug on the *real* site could read directly and
 * exfiltrate outright, a theft an `httpOnly` cookie is specifically built to block. **"Revoking" a
 * JWT before it expires needs something bolted on beside the token itself, because the server can't
 * unsign what it already issued** — the direct, deliberate payoff of question 2's signing fact,
 * called back explicitly: a stateless JWT scheme that only checks signature + `exp` (the entire
 * reason to skip a per-request database hit) has no mechanism that would even notice an account's
 * password changed after the token was signed, so a stolen token keeps working for every minute it
 * has left, full stop — real fixes (a server-side revoked-id denylist, or short-lived access tokens
 * paired with a refresh step that *does* hit the database) each reintroduce some version of the
 * lookup JWTs exist to avoid, rather than the token scheme quietly handling it on its own.
 *
 * The four are a deliberate arc, not four unrelated facts, the same shape `Joins.tsx`'s own four
 * questions used: Q1 is how a server ever gets to trust a request in the first place (password
 * verification); Q2 establishes what the token that trust produces actually is and isn't; Q3 asks
 * where that token should live once issued, given two real, opposite-shaped threats; Q4 uses Q2's
 * signing fact from a new angle to show why undoing a JWT is harder than it looks. `filename`s stay
 * `.http`, the convention `/http` and `/rest` established — every scenario here is fundamentally a
 * request/response exchange (a signup, a login, a forged cross-site POST), so there was no reason to
 * invent a new code-listing convention the way `/sql-basics` did for genuinely different content.
 * `syn.kw` colors the HTTP method, `syn.fn` colors header names, `syn.str` colors string/JSON/token
 * values, and `syn.cm` carries each scenario's own `#` scene-setting — the exact roles `/http`'s own
 * build note assigned them.
 *
 * Same archetype as every lesson before it (predict-then-reveal question cards, `CodeListing`
 * snippets, a running score, a "try again" reset, `<ConceptComplete>` at the pass mark), and, like
 * every Stage 4/5 round since Arrays, this needed no `Roadmap.tsx` *logic* change: `PartialStage` is
 * fully derived from `conceptsInStage(5)` and `UPCOMING_STAGES`'s `n: 5` entry, so removing `'Auth'`
 * from the latter's `concepts` array — the array itself, not just the prose describing it — is the
 * entire wiring change that page needs. `earned` fires once the learner has scored at or above the
 * pass mark, same rule as every lesson before it.
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
    filename: 'store-password.http',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>POST</span> /signup
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
            <span style={syn.str}>"username"</span>: <span style={syn.str}>"ana"</span>,{' '}
            <span style={syn.str}>"password"</span>: <span style={syn.str}>"hunter2"</span>
            {'}'}
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # Server-side, never sent over the wire: stored_hash = sha256(password)
          </span>
        ),
      },
      {
        content: (
          <span style={syn.cm}>
            # Reasoning: "it's a cryptographic hash, so the raw password is never stored, and a hash
            can't be reversed."
          </span>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # Six months later, the users table — one stored_hash per account — leaks in a breach.
          </span>
        ),
      },
    ],
    prompt:
      'Is storing sha256(password) instead of the raw password enough to protect these accounts once that table leaks?',
    options: [
      "Yes — SHA-256 can't be reversed, so even with every hash in hand there's no way back to the original passwords",
      'No — SHA-256 is a fast, general-purpose hash built for cheap checksums; an attacker never needs to reverse anything, just hash billions of guesses a second and compare, which cracks weak or common passwords almost immediately',
      'No — SHA-256 itself is a broken algorithm with known collisions, the same flaw MD5 has',
    ],
    correct: 1,
    explain:
      '"Reversed" is the wrong mental model for what an attacker does with a leaked hash table — they never invert sha256 at all. They guess: pick a candidate password, hash it the identical way, and see if it matches a row. SHA-256 is deliberately fast — it exists for tasks like checking a download didn\'t get corrupted, where speed is the entire point — and that same speed is a gift to the attacker: consumer GPU hardware computes billions of SHA-256 hashes a second, so a dictionary of common passwords burns through the whole leaked table in minutes, cracking every "hunter2" and "password1" in it whether or not the algorithm is technically reversible. The third option names a real fact, just about the wrong algorithm — MD5 has practical collision attacks; SHA-256 does not, and a collision isn\'t how password cracking works anyway. The actual problem is a fast hash used somewhere speed is a liability. The right tool is a password hashing function built to be deliberately slow and tunable — bcrypt, scrypt, Argon2 — with a cost factor that makes one guess take on the order of 100ms instead of nanoseconds. That multiplies the attacker\'s total cracking time by the same factor across billions of guesses, while a real login — which only ever computes one hash, once — barely notices the extra 100ms. (These functions also bake in a per-password salt, which stops two users who happen to share a password from producing the same hash and defeats a precomputed lookup table — a real second protection, but the fast-vs-slow gap above is the bigger reason sha256(password) alone was never enough.)',
  },
  {
    filename: 'decode-jwt.http',
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
            <span style={syn.str}>"password"</span>: <span style={syn.str}>"correct-password"</span>
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
      {
        content: (
          <>
            <span style={syn.fn}>Authorization:</span>{' '}
            <span style={syn.str}>
              Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbmEiLCJyb2xlIjoidXNlciJ9.4fA9c8B1
            </span>
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # Ana pastes just the middle segment into a plain base64 decoder — no login, no secret
            key, nothing —
          </span>
        ),
      },
      {
        content: (
          <span style={syn.cm}>
            {'# and it prints {"sub": "ana", "role": "user"}.'}
          </span>
        ),
      },
    ],
    prompt:
      'Could Ana read that without ever touching the server\'s secret key, exactly like she just did? And if she edits the decoded JSON to say "role": "admin", re-encodes it, and sends that edited token back on her next request — will the server accept it?',
    options: [
      "No to both — JWTs are encrypted, so she can't read the payload or usefully change it without the secret",
      "Yes to both — it's just base64 text, so reading it is free and sending the edited version back works fine as long as the JSON is still valid",
      "Yes she can read it — base64 is an encoding, not encryption, reversible by anyone with no key needed — but no, she can't get the edited version accepted: the server recomputes the signature over her edited payload, and it won't match the token's real third segment, which only the actual secret could have produced",
    ],
    correct: 2,
    explain:
      'A JWT is three base64url segments joined by dots — header.payload.signature. The first two are just base64: an encoding, not encryption, and an encoding is reversible by definition, by anyone, with no key required — that\'s exactly what Ana just did with a plain decoder, the same thing jwt.io does under the hood. So reading it needs nothing secret, which is a real property of JWTs, not a flaw: it means a JWT must never carry something that has to stay secret from the person holding it — no raw passwords, no card numbers — because "holding the token" and "able to read the token" are the same thing. The third segment is different: it\'s a signature (HMAC or RSA, depending on the algorithm), computed once, at issue time, by the server, over exactly the bytes of the first two segments, using a secret only the server holds. When a later request comes in, the server recomputes that same signature over whatever header+payload it was just handed and compares it to the token\'s third segment. Ana can edit the decoded payload\'s JSON all she wants, but she has no way to produce a new, valid signature for her edited version without that secret — so the token she sends back pairs a changed payload with a signature that was computed over the old one. The server\'s recomputed signature won\'t match, and it rejects the token outright. That\'s the actual guarantee a JWT gives: not secrecy of its contents, but proof the contents haven\'t changed since a party holding the secret signed them. "Signed, not encrypted" is the one sentence worth memorizing — signed means tamper-evident and freely readable; encrypted would mean the opposite of both, and a JWT is never that.',
  },
  {
    filename: 'csrf-vs-xss.http',
    code: [
      { content: <span style={syn.cm}># api.example, at login:</span> },
      {
        content: (
          <>
            <span style={syn.fn}>Set-Cookie:</span> sid=abc123; SameSite=None
          </>
        ),
      },
      {
        content: (
          <span style={syn.cm}>
            # (SameSite=None because a storefront widget embeds this API cross-origin; no separate
            CSRF token is checked either)
          </span>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # evil.example silently auto-submits a hidden form the instant Ana opens the page — no
            click needed.
          </span>
        ),
      },
      {
        content: <span style={syn.cm}># The browser sends it as an ordinary cross-site POST:</span>,
      },
      {
        content: (
          <>
            <span style={syn.kw}>POST</span> https://api.example/transfer
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>Cookie:</span> sid=abc123
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>Content-Type:</span> application/x-www-form-urlencoded
          </>
        ),
      },
      { content: <></> },
      { content: <>to=attacker&amp;amount=500</> },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # Now suppose api.example had issued a bearer token at login instead — kept in
            localStorage, attached
          </span>
        ),
      },
      {
        content: (
          <span style={syn.cm}>
            # by the site's own JS as an Authorization header on every real call — and evil.example
            tried
          </span>
        ),
      },
      { content: <span style={syn.cm}># the identical forged form against that design:</span> },
      {
        content: (
          <>
            <span style={syn.kw}>POST</span> https://api.example/transfer
          </>
        ),
      },
      {
        content: (
          <span style={syn.cm}>
            # (no Authorization header — a plain &lt;form&gt; can't set one, and evil.example's
            script has no
          </span>
        ),
      },
      {
        content: <span style={syn.cm}># access to read api.example's localStorage to find it either)</span>,
      },
    ],
    prompt:
      'Under the cookie design above, does the forged transfer go through? And would the identical forged form succeed against the bearer-token design too?',
    options: [
      'Yes to both — a cross-site request works the same way no matter where the credential is kept',
      "Yes under the cookie design — the browser attaches any cookie it holds for api.example to a request headed there, no matter which page triggered it. No under the bearer-token design — a plain HTML form can't set a custom Authorization header, and evil.example's script can't read api.example's localStorage either, so the forged request arrives with no credential attached at all",
      'No to both — modern browsers refuse to send any cross-site POST at all, regardless of credential type',
    ],
    correct: 1,
    explain:
      "This is CSRF, and it's real here because the cookie was explicitly configured SameSite=None with no CSRF token check — the exact gap SameSite=Strict/Lax or a token the forged form can't supply exists to close. The browser doesn't care that evil.example, not api.example, triggered the request; it just sees \"a request headed to api.example\" and attaches whatever cookie it's holding for that domain, so the forged transfer succeeds carrying Ana's real session, and she never clicked anything. The bearer-token design is immune to this specific attack for two separate reasons stacking together: a plain HTML `<form>` submission can only send a small allowed set of content types and can't set arbitrary headers like Authorization, and even if it could, evil.example's JavaScript has no access to read api.example's localStorage — that's the same-origin policy doing its job. So the forged request under that design arrives with nothing proving who sent it, and the server rejects it. But bearer-token storage isn't simply \"safer\" — it trades this weakness for a different one: if api.example itself ever has an XSS hole (some unescaped input that lets an attacker's own script run inside api.example's real page), that script runs with exactly the access a real page there has, including reading localStorage directly and exfiltrating the whole token to the attacker's own server — not just riding along for one request while the tab happens to be open, but stealing something reusable from anywhere, anytime, until it expires. A cookie marked httpOnly specifically blocks that half: JS on the page, malicious or not, can't read its value via document.cookie, so an XSS bug there can still misuse the live session while the page is open but can't walk off with the credential itself. Neither location is strictly safer — a cookie is exposed to CSRF unless SameSite/CSRF-token protections are in place, and a manually-attached token is exposed to outright theft if the site ever has an XSS bug — which is why real systems defend against both causes (SameSite + CSRF tokens; strict output-escaping and a CSP to keep XSS from happening in the first place) rather than picking a storage location and calling the problem solved.",
  },
  {
    filename: 'revoke-attempt.http',
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
            <span style={syn.str}>"password"</span>: <span style={syn.str}>"correct-password"</span>
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
      {
        content: (
          <>
            <span style={syn.fn}>Authorization:</span>{' '}
            <span style={syn.str}>Bearer eyJhbGci…</span> (exp: 6 hours from now)
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # The auth middleware only checks this token's signature and its exp claim — never a
            database —
          </span>
        ),
      },
      {
        content: (
          <span style={syn.cm}>
            # which is the whole point of using a JWT instead of a session id: no per-request DB
            lookup.
          </span>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # Two hours later: Ana's unlocked laptop is stolen with this token still cached in the
            app.
          </span>
        ),
      },
      {
        content: (
          <span style={syn.cm}># She immediately changes her password from her phone.</span>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /account/orders
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>Authorization:</span> <span style={syn.str}>Bearer eyJhbGci…</span>{' '}
            (the same stolen token, 4 hours still left on it)
          </>
        ),
      },
    ],
    prompt:
      "Does the stolen token stop working the moment Ana changes her password — or does it keep working until it naturally expires?",
    options: [
      'It stops immediately — changing the password invalidates every token that was issued under the old one',
      "It keeps working, exactly as before, until the exp claim's 4 remaining hours run out — nothing about changing the password touches a token that's already signed and already out in the world",
      "It stops within a minute or two, since a JWT automatically re-validates itself against the account's current password hash in the background",
    ],
    correct: 1,
    explain:
      "This is question 2's signing fact cutting the other way. A JWT proves who someone is with a signature computed once, at login, over data fixed at that exact moment — and the middleware here, by design, never looks anything up again after that: not the account's current password, not whether it's still active, nothing. That's the entire tradeoff for skipping a database hit on every request. So when Ana changes her password, nothing happens to the token already out in the world: its signature is still valid, its exp claim still says 4 hours from now, and the middleware has no mechanism that would even notice the password changed, let alone act on it. The stolen token keeps working exactly as it did a moment ago, for the full 4 hours, regardless of anything Ana does to her account in the meantime. The third option imagines a background re-validation loop plain JWTs simply don't have — nothing \"re-checks\" a JWT against anything; it's either a valid signature + an unexpired exp, or it isn't, full stop, the same all-or-nothing check every request gets. This is the real, well-known downside of stateless JWTs: \"revoking\" one before it expires needs something bolted on beside the token scheme itself, because the server can't unsign what it already issued. Two real fixes exist, and both reintroduce some version of the lookup JWTs were built to avoid: a small server-side denylist of revoked token ids, checked on every request (blunt but effective, at the direct cost of the \"no DB hit\" benefit); or very short-lived access tokens — minutes, not hours — paired with a refresh token that IS checked against the database on every use, which caps how much damage a stolen access token can do to that short refresh interval instead of to its full original lifetime.",
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

/** Stage 5's fifth lesson page — four graded predict-the-outcome questions on auth mechanics. */
export default function Auth() {
  useDocumentTitle('Auth')
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
        right={<Tag tone="accent">APIS &amp; DATABASES · AUTH</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 5 · APIS &amp; DATABASES
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Auth
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          HTTP's own lesson showed you a request either carries proof of who's asking or gets a flat
          401 — it never said what that proof actually is, how it should be kept, or what happens
          once it needs to be taken back. Auth is all three. Predict what actually happens in each
          scenario below, then see why.
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
            slug="auth"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
