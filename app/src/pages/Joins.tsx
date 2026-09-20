/**
 * Route `/joins` — Stage 5's fourth lesson ("APIs & Databases"), the natural next step after SQL
 * Basics: every one of that lesson's four questions was deliberately kept single-table (`grep`ped
 * for `JOIN` across its four `.sql` listings before writing this page — zero hits), so `Joins` is
 * where a query first has to reach across two or more tables at once, and every question here
 * checks something SQL Basics genuinely never touched: no `WHERE phone = NULL`-style equality trap
 * reappears verbatim, no bare `DELETE`, no `COUNT(*)` vs `COUNT(column)` repeat, no `WHERE` vs
 * `HAVING` repeat — those four stay SQL Basics' own ground.
 *
 * **Four predict-the-outcome questions (`QUESTIONS`), every one verified against a real SQLite
 * engine before it was written** (Python's bundled `sqlite3` module, not assumed by hand — the
 * standing instruction for this round was explicit that the four gotchas must be "verified by
 * thinking through the actual SQL semantics, not assumed," and running the real thing is stronger
 * than thinking it through): **INNER JOIN vs LEFT JOIN row-count** — a `customers` table joined to
 * `orders` with `INNER JOIN` returns 4 rows, not 5, because the one customer with zero orders
 * (Robin) has nothing to pair with and produces no row at all — not a row with blanks, an *absent*
 * row; `LEFT JOIN` on the identical query returns 5, keeping Robin with every `orders` column
 * `NULL`. This is the foundational contrast the other three all lean on. **The classic "LEFT JOIN,
 * then WHERE on the right table's column" trap** — SQL Basics' own first question closed by
 * flagging this exact page as where it would resurface ("a LEFT JOIN's unmatched side comes back
 * as NULL too, and this exact silent-empty-result behavior is the first thing that trips people up
 * about it"), and this question is that payoff, not a coincidence: `LEFT JOIN orders o ON …  WHERE
 * o.status = 'shipped'` looks like it should keep every customer and just show `NULL` for the ones
 * with no shipped order, but `WHERE` runs *after* the join and has no memory of why a row exists —
 * it sees `NULL = 'shipped'` as the same `UNKNOWN`-drops-silently rule as always and removes it,
 * so the two customers `LEFT JOIN` specifically exists to protect vanish anyway. Verified this one
 * two ways, not one: the actual row count (2, not 5), and that swapping in `INNER JOIN` on the
 * identical query produces a byte-identical result set — proof the `LEFT` accomplished nothing once
 * that `WHERE` was in play. **Many-to-many fan-out inflating an aggregate** — joining two separate
 * one-to-many relations (`orders`, `reviews`) directly to the same `customers` row multiplies rather
 * than adds: a customer with 3 real orders and 2 real reviews gets `COUNT(o.id)` and
 * `COUNT(r.id)` back as 6 and 6, not 3 and 2, because the join produces one combined row per
 * (order, review) *pair* with no way to know the two are unrelated to each other — both only relate
 * back to the customer. Verified the fix too: `COUNT(DISTINCT o.id)` correctly returns 3. **The
 * LEFT JOIN + IS NULL anti-join** — the deliberate, constructive flip side of the first question:
 * once you know `LEFT JOIN` pads an unmatched row with `NULL`, `WHERE o.id IS NULL` becomes a
 * precise "give me every customer who never matched anything" query — correctly isolating Robin,
 * verified — and it only works because `IS NULL` is a different operator from `=`, built specifically
 * to test for `NULL` itself rather than falling into the same `UNKNOWN` trap the second question's
 * `WHERE o.status = 'shipped'` did. Swapping in `INNER JOIN` here (also verified) returns nothing,
 * since a customer with no match never gets a row for `IS NULL` to catch — which is exactly why this
 * pattern requires `LEFT JOIN` specifically, the same requirement question 1 established.
 *
 * The four questions are a deliberate arc, not four unrelated facts: Q1 shows the row-count gap a
 * plain `LEFT JOIN` creates; Q2 shows that gap being silently erased by a careless `WHERE`; Q3 shows
 * a different kind of miscount, multiplication instead of a dropped row, once a second join enters
 * the picture; Q4 shows the Q1 gap used *on purpose* to answer a real question ("who never ordered")
 * instead of being an accident to guard against. `customers`/`orders` recur across Q1, Q2 and Q4 —
 * Q4 explicitly reuses Q1's exact dataset ("Same customers/orders as question 1") so the anti-join
 * payoff lands as a callback, not a fresh scenario — while Q3 introduces its own `reviews` table,
 * since the fan-out bug needs a second child relation Q1/Q2/Q4's two-table story has no room for.
 *
 * Same archetype as every lesson before it (predict-then-reveal question cards, `CodeListing`
 * snippets, a running score, a "try again" reset, `<ConceptComplete>` at the pass mark), and, like
 * SQL Basics, needed no `Roadmap.tsx` logic change: `PartialStage` is fully derived from
 * `conceptsInStage(5)` and `UPCOMING_STAGES`'s `n: 5` entry, so removing `'Joins'` from the latter's
 * `concepts` array — the array itself, not just the prose describing it — is the entire wiring
 * change that page needs. `filename`s stay `.sql`, the convention SQL Basics established; `syn.kw`
 * colors SQL keywords and join types (`INNER JOIN`, `LEFT JOIN`, `ON`, `WHERE`, `GROUP BY`, `AS`),
 * `syn.fn` colors the aggregate calls (`COUNT(o.id)`), `syn.str` colors the one string literal
 * (`'shipped'`, `'Deshawn'`), and `syn.cm` carries each scenario's own `--` comment. `earned` fires
 * once the learner has scored at or above the pass mark, same rule as every lesson before it.
 */
import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { CodeListing, syn, type ListingLine } from '../components/CodeListing'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { ConceptComplete } from '../components/ConceptComplete'

/** One predict-the-outcome question: a SQL transcript, three choices, and the real reasoning either way. */
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
    filename: 'inner-vs-left.sql',
    code: [
      {
        content: (
          <span style={syn.cm}>
            -- customers table, 5 rows. Robin has never placed an order.
          </span>
        ),
      },
      {
        content: (
          <span style={syn.cm}>-- orders table, 4 rows — one per customer who actually has.</span>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>SELECT</span> c.name, o.total
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>FROM</span> customers c
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>INNER JOIN</span> orders o <span style={syn.kw}>ON</span> c.id
            = o.customer_id;
          </>
        ),
      },
    ],
    prompt: 'How many rows does this return, and what happened to Robin?',
    options: [
      "5 rows — every customer appears once, and Robin's o.total column is NULL",
      "4 rows — Robin never appears at all; INNER JOIN only keeps rows where both sides found a match",
      "4 rows — one of the four is Robin's, with her o.total shown as NULL since she has no orders",
    ],
    correct: 1,
    explain:
      "INNER JOIN only produces a row when the ON condition finds a match on both sides. Robin has zero rows in orders, so there is nothing for the join to pair her with — not a row with blank columns, no row at all. That's the detail both wrong answers miss: they both imagine Robin's row surviving with orders' columns padded NULL, which is LEFT JOIN's behavior, not INNER JOIN's. Run the exact same query with LEFT JOIN instead and you'd get 5 rows back, Robin included, her o.total genuinely NULL — that's the contrast worth memorizing: INNER JOIN can make rows disappear entirely when there's no match on the other side; LEFT JOIN keeps every row from the table on its left no matter what, and only pads the columns it couldn't fill. Keep that row-count gap in mind — question 4 on this page turns it into a deliberate technique instead of an accident to watch out for.",
  },
  {
    filename: 'left-join-where-trap.sql',
    code: [
      {
        content: (
          <span style={syn.cm}>
            -- customers table, 5 rows (Ana, Bo, Cy, Deshawn, Robin).
          </span>
        ),
      },
      {
        content: (
          <span style={syn.cm}>
            -- orders table, 3 rows: Ana shipped, Bo pending, Cy shipped. Deshawn and Robin have
            none.
          </span>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>SELECT</span> c.name, o.status
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>FROM</span> customers c
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>LEFT JOIN</span> orders o <span style={syn.kw}>ON</span> c.id =
            o.customer_id
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>WHERE</span> o.status = <span style={syn.str}>'shipped'</span>;
          </>
        ),
      },
    ],
    prompt:
      "This uses LEFT JOIN specifically so every customer would show up, even the ones with no shipped order. How many rows does it actually return?",
    options: [
      "5 rows — LEFT JOIN keeps every customer, and o.status is just NULL for whoever has none",
      "3 rows — Ana, Bo and Cy, since they're the only three who've placed any order at all",
      "2 rows — Ana and Cy only; the LEFT JOIN never actually saves anyone WHERE was going to drop",
    ],
    correct: 2,
    explain:
      "LEFT JOIN on its own would return all 5 customers — Deshawn and Robin included, both with o.status NULL. But WHERE runs after the join has already happened, one row at a time, with no memory of why any particular row exists. o.status = 'shipped' checks Bo's 'pending' (FALSE — dropped, so the second answer is wrong too, Bo doesn't survive either) and checks Deshawn's and Robin's NULL (UNKNOWN, the exact same three-valued-logic rule SQL Basics' first lesson covered — dropped just as silently). What's left is only Ana and Cy. Swap LEFT JOIN for INNER JOIN in this exact query and you get the identical two rows back — the LEFT JOIN accomplished nothing once that WHERE clause was in play, which is the whole trap: writing LEFT JOIN doesn't protect a row from being filtered by a later WHERE on the very column that made it need the LEFT JOIN in the first place. The real fix is moving the condition into the ON clause instead — LEFT JOIN orders o ON c.id = o.customer_id AND o.status = 'shipped' — which decides what counts as a match before the LEFT JOIN's \"keep it anyway\" guarantee kicks in, correctly returning all 5 customers with Bo, Deshawn and Robin's status genuinely NULL.",
  },
  {
    filename: 'fan-out-count.sql',
    code: [
      {
        content: <span style={syn.cm}>-- Deshawn has placed 3 orders and written 2 reviews.</span>,
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>SELECT</span> c.name, <span style={syn.fn}>COUNT(o.id)</span>{' '}
            <span style={syn.kw}>AS</span> order_count, <span style={syn.fn}>COUNT(r.id)</span>{' '}
            <span style={syn.kw}>AS</span> review_count
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>FROM</span> customers c
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>JOIN</span> orders o <span style={syn.kw}>ON</span> o.customer_id
            = c.id
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>JOIN</span> reviews r <span style={syn.kw}>ON</span>{' '}
            r.customer_id = c.id
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>WHERE</span> c.name = <span style={syn.str}>'Deshawn'</span>
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>GROUP BY</span> c.name;
          </>
        ),
      },
    ],
    prompt:
      "Deshawn really has 3 orders and 2 reviews. What does this query actually report for order_count and review_count?",
    options: [
      'order_count 3, review_count 2 — exactly what\'s really sitting in each table',
      'order_count 6, review_count 6 — joining two child tables to the same parent multiplies every order against every review',
      "order_count 3, review_count 6 — orders is joined first so it counts correctly; review_count is the one that gets multiplied",
    ],
    correct: 1,
    explain:
      "Joining orders straight to customers pairs each of Deshawn's 3 orders with his one customer row — 3 rows so far. Joining reviews to that same customers row does the same thing again: each of his 2 reviews gets paired with every one of those 3 order-rows, because the join has no way to know an order and a review aren't related to each other — both only connect back to the customer, never to each other. The result is 3 × 2 = 6 combined rows, one per (order, review) pair, and COUNT(o.id)/COUNT(r.id) are counting rows in that 6-row result, not rows in the original tables — so both come back 6, not a mismatched 3-and-6 or the honest 3-and-2 either option imagines. This is the classic \"fan-out\": joining two independent one-to-many relationships off the same row multiplies instead of adding, and it gets worse, not better, the more real orders or reviews Deshawn has. The fix, when you actually need both real counts side by side, is COUNT(DISTINCT o.id) and COUNT(DISTINCT r.id) — counting distinct ids collapses the duplicated pairs back down to 3 and 2, since each real order id and review id only needs to be counted once no matter how many rows it got fanned into.",
  },
  {
    filename: 'find-the-missing.sql',
    code: [
      {
        content: (
          <span style={syn.cm}>
            -- Same customers/orders as question 1 — Robin has never placed an order.
          </span>
        ),
      },
      {
        content: (
          <span style={syn.cm}>-- Goal: find every customer who's never ordered anything.</span>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>SELECT</span> c.name
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>FROM</span> customers c
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>LEFT JOIN</span> orders o <span style={syn.kw}>ON</span> c.id =
            o.customer_id
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>WHERE</span> o.id <span style={syn.kw}>IS NULL</span>;
          </>
        ),
      },
    ],
    prompt:
      "What does this return, and why does it have to be LEFT JOIN specifically — not INNER JOIN?",
    options: [
      "Every customer — o.id IS NULL ends up true for every row here, since id is just a label rather than real data",
      "Nothing — comparing anything to NULL is always UNKNOWN, so IS NULL can never actually come back true either",
      "Just Robin — LEFT JOIN pads her row with NULL because nothing matched, and IS NULL is the one comparison built to actually detect that",
    ],
    correct: 2,
    explain:
      "This is question 1's row-count gap put to deliberate use. LEFT JOIN gives every customer a row regardless of whether orders had a match, filling every column that would've come from orders — including o.id — with NULL when there wasn't one. o.id IS NULL is then a precise test for exactly that: \"this row's right side never matched anything,\" which is true for Robin and false for everyone else, since a real matched order always has a real, non-NULL id. The second answer's reasoning sounds right but proves too much: yes, = turns any NULL comparison into UNKNOWN (the same rule question 2 and SQL Basics' own first lesson both cover) — but IS NULL isn't =, it's a dedicated operator built specifically to ask \"is this NULL?\" and answer TRUE or FALSE, never UNKNOWN, which is exactly why it's the right tool here and = never would be. And this only works with LEFT JOIN: swap in INNER JOIN on the identical query and Robin never gets a row in the first place, so there's nothing left for WHERE o.id IS NULL to catch — the query comes back completely empty, proving LEFT JOIN isn't optional here, it's the entire mechanism. This LEFT JOIN + IS NULL shape is the standard real-world way to answer \"which customers never ordered,\" \"which posts have zero comments\" — anything phrased as absence rather than presence.",
  },
]

const PASS_MARK = 3

/** One question card: the SQL transcript, three answer choices, and the reveal once picked. */
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

/** Stage 5's fourth lesson page — four graded predict-the-outcome questions on multi-table JOINs. */
export default function Joins() {
  useDocumentTitle('Joins')
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
        note="Page type · Concept lesson · Databases"
        right={<Tag tone="accent">APIS &amp; DATABASES · JOINS</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 5 · APIS &amp; DATABASES
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Joins
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          SQL Basics kept every query pointed at one table. Real schemas don't stay that tidy — a
          customer's data lives in one table, their orders in another, their reviews in a third —
          and JOIN is how you ask for several of them at once. Predict what each join actually
          returns below, then see why.
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
            slug="joins"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
