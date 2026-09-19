/**
 * Route `/functions` — Stage 3's third real lesson ("A First Language: Python"), continuing
 * straight on from `/control-flow`: four predict-the-value questions (`QUESTIONS`) on the four
 * function gotchas that show up in almost every Python interview — a mutable default argument
 * that survives across calls, keyword arguments that reorder freely, a function that computes
 * something but forgets to `return` it, and a closure that captures the *variable* a loop reuses
 * rather than the value it held at each iteration. Same archetype as `PythonVariables.tsx` and
 * `ControlFlow.tsx` on purpose (predict-then-reveal question cards, `CodeListing` snippets, a
 * running score, a "try again" reset): Stage 3 established the pattern for its own subject, so
 * this reuses it rather than inventing a third Python-lesson shape. `earned` fires once the
 * learner has scored at or above the pass mark, same rule as every other lesson on this stage.
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
    filename: 'cart.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>def</span> add_item(item, cart=[]):
          </>
        ),
      },
      { content: <>{'    '}cart.append(item)</> },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>return</span> cart
          </>
        ),
      },
      { content: <></> },
      { content: <>add_item(<span style={syn.str}>"apple"</span>)</> },
      { content: <>result = add_item(<span style={syn.str}>"banana"</span>)</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(result)
          </>
        ),
      },
    ],
    prompt: 'What does print(result) show?',
    options: ["['banana']", "['apple', 'banana']", "['apple']"],
    correct: 1,
    explain:
      "cart=[] only runs once — the moment Python reads the def, not once per call — so every call that doesn't pass its own cart shares that exact same list. The first add_item(\"apple\") call already put \"apple\" in it; the second call's \"banana\" lands in the same list right alongside it. Never use a mutable value (a list, dict, or set) as a default argument unless you mean to share it.",
  },
  {
    filename: 'greet.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>def</span> greet(greeting, name):
          </>
        ),
      },
      {
        content: (
          <>{'    '}<span style={syn.kw}>return</span> greeting + <span style={syn.str}>", "</span> + name + <span style={syn.str}>"!"</span></>
        ),
      },
      { content: <></> },
      {
        content: (
          <><span style={syn.fn}>print</span>(greet(name=<span style={syn.str}>"Ana"</span>, greeting=<span style={syn.str}>"Hi"</span>))</>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: ['Hi, Ana!', 'Ana, Hi!', 'TypeError — greeting and name must be positional here'],
    correct: 0,
    explain:
      "Keyword arguments are matched by name, not by position — greeting=\"Hi\" fills the greeting parameter and name=\"Ana\" fills name, no matter what order you write them in the call. That's the whole point of naming them: greet(\"Hi\", \"Ana\") and greet(name=\"Ana\", greeting=\"Hi\") call the function identically.",
  },
  {
    filename: 'square.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>def</span> square(n):
          </>
        ),
      },
      { content: <>{'    '}result = n * n</> },
      { content: <></> },
      { content: <>value = square(4)</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(value)
          </>
        ),
      },
    ],
    prompt: 'What does print(value) show?',
    options: ['16', 'None', 'NameError — result is not defined'],
    correct: 1,
    explain:
      "square computes result but never returns it, so calling square(4) hands value the function's default return value — None — not the 16 it calculated. result existed for a moment inside the function and then was gone the instant the function ended; there's no error, just a quietly wrong answer, which is exactly why this bug survives to production.",
  },
  {
    filename: 'closures.py',
    code: [
      { content: <>funcs = []</> },
      {
        content: (
          <>
            <span style={syn.kw}>for</span> i <span style={syn.kw}>in</span> range(3):
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}funcs.append(<span style={syn.kw}>lambda</span>: i)
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(funcs[0]())
          </>
        ),
      },
    ],
    prompt: 'What does print(funcs[0]()) show?',
    options: ['0', '2', "Three different lambdas, each remembering its own i"],
    correct: 1,
    explain:
      "A lambda doesn't capture i's value at creation — it captures the variable i itself, looked up fresh each time the lambda actually runs. All three lambdas share that one variable, and by the time any of them is called, the loop has already finished with i left at 2. Even funcs[0], the \"first\" one appended, sees the same final i as the other two. The fix is a default argument — lambda i=i: i — which copies the current value in at creation instead of looking it up later.",
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

/** Stage 3's third lesson page — four graded predict-the-value questions on Python functions. */
export default function Functions() {
  useDocumentTitle('Functions')
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
        right={<Tag tone="accent">PYTHON · FUNCTIONS</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 3 · A FIRST LANGUAGE
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Functions
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          A function bundles up control flow you'd otherwise repeat — but Python's own rules for
          arguments, return values, and what a nested function remembers have sharp edges of their
          own. Predict what each snippet below prints before picking an answer; you'll see whether
          you were right either way.
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
            slug="functions"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
