/**
 * Route `/python-variables` — Stage 3's first real lesson ("A First Language: Python"): four
 * predict-the-value questions (`QUESTIONS`), each a short Python snippet plus three answer
 * choices. Answering locks that question in and reveals whether it was right, alongside a real
 * explanation — genuinely graded, not a scripted reveal. `earned` fires once the learner has
 * scored at or above the pass mark, the same rule `QuizMode` uses for its own checkpoint.
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
    filename: 'snippet_1.py',
    code: [
      { content: <>x = 5</> },
      { content: <>x = <span style={syn.str}>"five"</span></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(<span style={syn.fn}>type</span>(x))
          </>
        ),
      },
    ],
    prompt: 'What does print(type(x)) show?',
    options: [
      "<class 'int'>",
      "<class 'str'>",
      "A TypeError — x was already an int",
    ],
    correct: 1,
    explain:
      "Python variables aren't declared with a type — assignment just binds the name x to whatever value comes next. Reassigning x to \"five\" makes it a string; there's no error, and no memory of what x used to hold.",
  },
  {
    filename: 'snippet_2.py',
    code: [
      { content: <>a = 3</> },
      { content: <>b = a</> },
      { content: <>a = 10</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(b)
          </>
        ),
      },
    ],
    prompt: 'What does print(b) show?',
    options: ['3', '10', 'A NameError — b was never really set'],
    correct: 0,
    explain:
      'b = a copies the value 3 into b at that moment. Numbers are immutable in Python, so later pointing a at something else has no effect on b — the two names were never linked, just equal once.',
  },
  {
    filename: 'snippet_3.py',
    code: [
      { content: <>x, y = 1, 2</> },
      { content: <>x, y = y, x</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(x, y)
          </>
        ),
      },
    ],
    prompt: 'What does print(x, y) show?',
    options: ['1 2', '2 1', '2 2'],
    correct: 1,
    explain:
      'Python builds the whole right-hand side — (y, x), the old values — before assigning anything to x or y. That makes this the standard swap idiom; no temporary variable needed.',
  },
  {
    filename: 'snippet_4.py',
    code: [
      { content: <>count = 0</> },
      { content: <>count += 1</> },
      { content: <>count += 1</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(count)
          </>
        ),
      },
    ],
    prompt: 'What does print(count) show?',
    options: ['0', '1', '2'],
    correct: 2,
    explain:
      'count += 1 is shorthand for count = count + 1 — each line rebinds count to one more than it currently held, so two of them add up.',
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

/** Stage 3's first lesson page — four graded predict-the-value questions on Python variables. */
export default function PythonVariables() {
  useDocumentTitle('Variables')
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
        right={<Tag tone="accent">PYTHON · VARIABLES</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 3 · A FIRST LANGUAGE
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Variables
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          A Python variable is just a name bound to a value — there's no type keyword, and the same
          name can hold an int one line and a string the next. Predict what each snippet below
          prints before picking an answer; you'll see whether you were right either way.
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
            slug="python-variables"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
