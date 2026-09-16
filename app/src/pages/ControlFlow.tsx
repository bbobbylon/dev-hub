/**
 * Route `/control-flow` — Stage 3's second real lesson ("A First Language: Python"), continuing
 * straight on from `/python-variables`: four predict-the-value questions (`QUESTIONS`) on if/elif,
 * `range()`, `while`/`break`, and truthy/falsy values — the four control-flow gotchas that trip up
 * someone who has only ever seen the happy path. Same archetype as `PythonVariables.tsx` on
 * purpose (predict-then-reveal question cards, `CodeListing` snippets, a running score, a "try
 * again" reset): Stage 3 established the pattern for its own subject, so this reuses it rather than
 * inventing a second Python-lesson shape. `earned` fires once the learner has scored at or above
 * the pass mark, same rule as `PythonVariables` and `QuizMode`.
 */
import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { CodeListing, syn, type ListingLine } from '../components/CodeListing'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { ConceptComplete } from '../components/ConceptComplete'

/** One predict-the-value question: a snippet, three choices, and the real reasoning either way. */
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
    filename: 'grade.py',
    code: [
      { content: <>score = 85</> },
      {
        content: (
          <>
            <span style={syn.kw}>if</span> score &gt;= 90:
          </>
        ),
      },
      { content: <>{'    '}grade = <span style={syn.str}>"A"</span></> },
      {
        content: (
          <>
            <span style={syn.kw}>elif</span> score &gt;= 80:
          </>
        ),
      },
      { content: <>{'    '}grade = <span style={syn.str}>"B"</span></> },
      {
        content: (
          <>
            <span style={syn.kw}>elif</span> score &gt;= 70:
          </>
        ),
      },
      { content: <>{'    '}grade = <span style={syn.str}>"C"</span></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(grade)
          </>
        ),
      },
    ],
    prompt: 'What does print(grade) show?',
    options: ['B', 'C', 'Both B and C — the interpreter prints every branch that matches'],
    correct: 0,
    explain:
      "An elif chain stops at the first true branch and skips the rest, even if a later condition would also be true. score >= 80 is checked before score >= 70 and matches first, so grade becomes \"B\" and the chain never even evaluates the elif below it.",
  },
  {
    filename: 'total.py',
    code: [
      { content: <>total = 0</> },
      {
        content: (
          <>
            <span style={syn.kw}>for</span> i <span style={syn.kw}>in</span> range(1, 4):
          </>
        ),
      },
      { content: <>{'    '}total += i</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(total)
          </>
        ),
      },
    ],
    prompt: 'What does print(total) show?',
    options: ['6', '10', '3'],
    correct: 0,
    explain:
      'range(1, 4) counts 1, 2, 3 — the stop value is never included, so this is three loops, not four. total adds 1, then 2, then 3, landing on 6. Reading range(1, 4) as "up to and including 4" is the single most common off-by-one bug in a beginner\'s first loop.',
  },
  {
    filename: 'countdown.py',
    code: [
      { content: <>n = 0</> },
      {
        content: (
          <>
            <span style={syn.kw}>while</span> <span style={syn.kw}>True</span>:
          </>
        ),
      },
      { content: <>{'    '}n += 1</> },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>if</span> n == 3:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>break</span>
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(n)
          </>
        ),
      },
    ],
    prompt: 'What does print(n) show?',
    options: ['This never runs — while True loops forever', '3', '2'],
    correct: 1,
    explain:
      'while True has no condition of its own, but break exits the loop the instant it runs — it doesn\'t wait for the loop to "check" anything first. n counts 1, 2, 3; the moment n == 3 is true, break fires immediately, and control falls straight through to the print() below the loop.',
  },
  {
    filename: 'cart.py',
    code: [
      { content: <>items = []</> },
      {
        content: (
          <>
            <span style={syn.kw}>if</span> items:
          </>
        ),
      },
      { content: <>{'    '}print(<span style={syn.str}>"has items"</span>)</> },
      { content: <><span style={syn.kw}>else</span>:</> },
      { content: <>{'    '}print(<span style={syn.str}>"empty"</span>)</> },
    ],
    prompt: 'What prints?',
    options: ['has items', 'empty', "TypeError — a list can't go in an if"],
    correct: 1,
    explain:
      "A list doesn't need to be a bool to sit in an if — Python asks whether it's truthy instead, and an empty list, string, or dict is always falsy. items is [], so if items is the same as if False, and control goes to the else branch.",
  },
]

const PASS_MARK = 3

/** One question card: the snippet, three answer choices, and the reveal once picked. */
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

/** Stage 3's second lesson page — four graded predict-the-value questions on Python control flow. */
export default function ControlFlow() {
  useDocumentTitle('Control Flow')
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
        note="Page type · Concept lesson · Python fundamentals"
        right={<Tag tone="accent">PYTHON · CONTROL FLOW</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 3 · A FIRST LANGUAGE
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Control Flow
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          Now that a name can hold a value, control flow decides which lines actually run:
          if/elif/else picks a branch, for/while repeat one, and Python asks "is this truthy?"
          more often than you'd expect. Predict what each snippet below prints before picking an
          answer; you'll see whether you were right either way.
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
            slug="control-flow"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
