/**
 * Route `/sql-basics` — Stage 5's third lesson ("APIs & Databases"), the path's first step into a
 * subject with no prior page anywhere on the site: grepped `src/pages/` and `src/data/` for "SQL"
 * first (same discipline REST's own build note used checking `/api-anatomy`) and the only hit was
 * `curriculum.ts`'s own `UPCOMING_STAGES` placeholder string — no existing lesson to avoid
 * duplicating, and no prior SQL content this page's four questions could accidentally repeat.
 * That also means this round has nothing to build *on top of* the way REST built on HTTP; instead
 * the four questions were chosen to stay deliberately single-table, since `Joins` is the very next
 * name in Stage 5's own remaining syllabus (`['Joins', 'Auth', 'Deploy']` after this round) — a
 * `JOIN` never appears in any of the four code listings below, so that lesson still has real,
 * untaught ground to stand on rather than a rerun of what this one already covered.
 *
 * Four predict-the-outcome questions (`QUESTIONS`), each a different way SQL looks like it did
 * one thing but quietly did another — the throughline the whole lesson keeps coming back to is
 * that **SQL fails silently far more often than it errors loudly**, which is a genuinely different
 * kind of trap than anything HTTP or REST taught (a wrong verb or a missing `Location` header is at
 * least visible in the response; a query that runs clean and returns the wrong rows announces
 * nothing at all): **NULL comparison** — `WHERE phone = NULL` matches zero rows, not the rows where
 * `phone` really is NULL, because SQL's three-valued logic means any comparison *to* NULL (even
 * `NULL = NULL`) evaluates to UNKNOWN rather than TRUE, and a `WHERE` clause keeps only rows where
 * the condition is TRUE — `UNKNOWN` gets silently dropped exactly like `FALSE` would, with no error
 * to flag that the query could never have matched anything; **`DELETE`/`UPDATE` with no `WHERE`
 * clause** — the clause isn't optional syntax narrowing an already-scoped statement, it's the *only*
 * thing that ever scopes one, so leaving it off targets every row in the table, no confirmation
 * asked; **`COUNT(*)` vs. `COUNT(column)`** — `COUNT(*)` counts rows regardless of content while
 * `COUNT(column)` (like every other aggregate — `SUM`, `AVG`, `MAX`, `MIN`) silently skips rows
 * where that column is NULL, the same NULL-skipping behavior from the first question showing up in
 * a completely different kind of statement; and **`WHERE` vs. `HAVING`** — SQL has a real, fixed
 * logical processing order (`FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY`) that
 * doesn't match the order the clauses are typed in, so `WHERE COUNT(*) > 3` is a genuine error in
 * every mainstream engine: `WHERE` runs before grouping even happens, so there's no aggregate value
 * yet for it to compare against — `HAVING` is the clause built to filter *after* aggregation. That
 * last question deliberately revisits `WHERE`'s row-by-row job from the first two questions, but
 * from the "which clause should even run this check" angle, the same kind of second-look REST's own
 * fourth question took at `PUT`'s idempotency from `/http`'s first one.
 *
 * Same archetype as every lesson before it (predict-then-reveal question cards, `CodeListing`
 * snippets, a running score, a "try again" reset, `<ConceptComplete>` at the pass mark) — and, like
 * every Stage 4/5 round since Arrays, this needed no `Roadmap.tsx` change: `PartialStage` is fully
 * derived from `conceptsInStage(5)` and `UPCOMING_STAGES`'s `n: 5` entry, so removing `'SQL basics'`
 * from the latter's `concepts` array is the entire wiring change that page needs — and it has to be
 * a real edit to the array itself, not just the doc-comment prose above it (the exact bug a prior
 * round in this session shipped and caught only by re-deriving `TOTAL_CONCEPTS` from a throwaway
 * script rather than trusting the comment matched the code below it). `filename`s here are `.sql`
 * files rather than `.http` transcripts — a new code-listing convention for a new kind of code, the
 * same call `/http` made switching from Python snippets to wire-format requests. `syn.kw` colors SQL
 * keywords (`SELECT`, `WHERE`, `DELETE`, `GROUP BY`, `HAVING`, ...), `syn.fn` colors aggregate
 * function calls (`COUNT(*)`, `COUNT(rating)`), `syn.str` colors string literals, and `syn.cm`
 * carries each scenario's own scene-setting the way a real `--` comment would. `earned` fires once
 * the learner has scored at or above the pass mark, same rule as every lesson before it.
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
    filename: 'null-phone-lookup.sql',
    code: [
      {
        content: (
          <span style={syn.cm}>
            -- customers table, 5 rows. "phone" was never collected for 2 of them, so it's NULL.
          </span>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>SELECT</span> name <span style={syn.kw}>FROM</span> customers{' '}
            <span style={syn.kw}>WHERE</span> phone = <span style={syn.kw}>NULL</span>;
          </>
        ),
      },
    ],
    prompt: 'How many rows does this query return?',
    options: [
      '2 — every customer whose phone column really is NULL',
      "0 — not the two you'd expect, not any other row, and nothing warns you why",
      "An error — you can't put NULL on the right side of an = comparison",
    ],
    correct: 1,
    explain:
      "SQL doesn't treat NULL as \"empty\" or \"zero\" — it means unknown, and that turns every comparison into three-valued logic: a condition evaluates to TRUE, FALSE, or UNKNOWN, never just true-or-false. Comparing anything to NULL with = — even NULL = NULL — evaluates to UNKNOWN, not TRUE, because SQL genuinely can't say two unknowns are equal to each other. A WHERE clause keeps a row only when its condition is TRUE; UNKNOWN gets dropped exactly the way FALSE would, silently, with no error and no warning that the comparison could never have matched anything. That's what makes this the single most common SQL beginner trap: the query is completely valid syntax, it runs clean, and it comes back empty — which reads exactly like \"nobody matches,\" not \"this query can never match anybody.\" The fix is a different operator entirely, not a different value: WHERE phone IS NULL (or IS NOT NULL) is how SQL actually asks the question. Keep this rule in your back pocket for Joins, the very next concept on this path — a LEFT JOIN's unmatched side comes back as NULL too, and this exact silent-empty-result behavior is the first thing that trips people up about it.",
  },
  {
    filename: 'unscoped-delete.sql',
    code: [
      {
        content: (
          <span style={syn.cm}>
            -- orders table: 811 real customer orders, plus one leftover test row, id 4021.
          </span>
        ),
      },
      {
        content: <span style={syn.cm}>-- Goal: remove just the test row.</span>,
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>DELETE</span> <span style={syn.kw}>FROM</span> orders;
          </>
        ),
      },
    ],
    prompt: "The WHERE clause got left off by mistake. What's in the orders table after this runs?",
    options: [
      'Nothing changes — a bare DELETE with no WHERE refuses to run, by design',
      'Only the single most recently inserted row is gone — test row 4021',
      "Nothing at all — every one of the 812 rows is deleted, not just the test one",
    ],
    correct: 2,
    explain:
      "A WHERE clause isn't optional narrowing bolted onto an already-scoped statement — it's the only thing that ever scopes one. DELETE FROM orders, on its own, means exactly what it says: delete every row from orders. There's no confirmation prompt, no built-in \"are you sure this looks like all of them\" safety net, and no partial-credit version where SQL guesses you probably meant just the one row — it does precisely what the statement says, for every row that exists. This is one of the most infamous real mistakes in the language: it's why the habit worth building here, before you ever run a DELETE or UPDATE against anything real, is to first run the exact same filter as a SELECT — SELECT * FROM orders WHERE id = 4021 — read the rows it actually matches, and only then swap SELECT * for DELETE once you've confirmed the WHERE clause is scoped the way you think it is. The first question's NULL trap and this one share the same root shape: SQL runs exactly what you typed, not what you meant, and it never tells you the two don't match.",
  },
  {
    filename: 'null-safe-count.sql',
    code: [
      {
        content: (
          <span style={syn.cm}>
            -- reviews table: 5 rows. One was left with no star rating, so "rating" is NULL there.
          </span>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>SELECT</span> <span style={syn.fn}>COUNT(*)</span> <span style={syn.kw}>FROM</span> reviews;
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>SELECT</span> <span style={syn.fn}>COUNT(rating)</span> <span style={syn.kw}>FROM</span> reviews;
          </>
        ),
      },
    ],
    prompt: 'What do the two COUNT queries return?',
    options: [
      'Both return 5 — COUNT always counts rows, full stop',
      'COUNT(*) returns 5 (every row exists); COUNT(rating) returns 4 (the NULL rating is skipped)',
      'Both return 4 — a COUNT never counts a row that has any NULL column at all',
    ],
    correct: 1,
    explain:
      "COUNT(*) counts rows the way its name suggests — it doesn't look inside any particular column, so all 5 rows count, full stop. COUNT(rating) is a different question: it counts how many rows have a non-NULL value in that column, so the one review with no star rating gets silently skipped — 4, not 5. This isn't unique to COUNT: every aggregate function works this way. SUM(rating), AVG(rating), MAX(rating) all quietly ignore NULL rows rather than treating a missing rating as 0 or erroring out, which is exactly the same NULL-skipping rule from the first question, resurfacing in an aggregate instead of a WHERE clause. The practical danger: AVG(rating) computes the average over 4 real ratings, not 5, so it's genuinely correct math — but a dashboard that also prints COUNT(*) reviews next to it now shows two different denominators on the same page without saying so, and nothing about either query is wrong; they're just answering two different questions that happen to look identical at a glance.",
  },
  {
    filename: 'group-filter.sql',
    code: [
      {
        content: (
          <span style={syn.cm}>
            -- Goal: find only the customers who've placed more than 3 orders.
          </span>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>SELECT</span> customer_id, <span style={syn.fn}>COUNT(*)</span> <span style={syn.kw}>AS</span> order_count
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>FROM</span> orders
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>GROUP BY</span> customer_id
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>WHERE</span> <span style={syn.fn}>COUNT(*)</span> &gt; 3;
          </>
        ),
      },
    ],
    prompt: 'What happens when this query runs?',
    options: [
      'It runs fine, returning only the customers with more than 3 orders',
      "It errors out — WHERE can't filter on COUNT(*); that's what HAVING is for",
      'It runs, but silently ignores the WHERE line and returns every customer',
    ],
    correct: 1,
    explain:
      "SQL has a real, fixed order it actually evaluates a query's clauses in, and it doesn't match the order you type them: FROM, then WHERE, then GROUP BY, then HAVING, then SELECT, then ORDER BY. WHERE does its job — keeping or dropping individual rows — before GROUP BY has even run, which means at the point WHERE is evaluated, the rows haven't been grouped yet and COUNT(*) has no value to compare against at all; there's nothing to be greater than 3. That's not a style problem SQL politely works around — every mainstream engine rejects it outright, because WHERE is built to test one row at a time, never a group. HAVING exists specifically for this: it runs after GROUP BY, once each group's aggregate values (like COUNT(*)) actually exist, so GROUP BY customer_id HAVING COUNT(*) > 3 is the correct version of this exact query. Same lesson as the DELETE question, from a different angle: the clause names in your head aren't the order SQL runs them in, and the fix, both times, is checking what a clause can actually see at the moment it runs — not just what its name suggests it should do.",
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

/** Stage 5's third lesson page — four graded predict-the-outcome questions on single-table SQL basics. */
export default function SqlBasics() {
  useDocumentTitle('SQL Basics')
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
        right={<Tag tone="accent">APIS &amp; DATABASES · SQL BASICS</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 5 · APIS &amp; DATABASES
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          SQL Basics
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          SQL reads like plain English, which is exactly why it's so easy to write a query that
          runs without a single error and still returns the wrong answer. Predict what each query
          below actually does, then see why.
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
            slug="sql-basics"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
