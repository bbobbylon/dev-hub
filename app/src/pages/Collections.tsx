/**
 * Route `/collections` — Stage 3's fourth real lesson ("A First Language: Python"), continuing
 * straight on from `/functions`: four predict-the-value questions (`QUESTIONS`) on the collection
 * gotchas that separate "read the docs once" from "got burned by it": `b = a` aliasing a list
 * instead of copying it, a tuple refusing the mutation a list would allow, a dict literal silently
 * keeping only the last value for a repeated key, and a slice tolerating out-of-range bounds that
 * plain indexing never would. Same archetype as `PythonVariables.tsx`, `ControlFlow.tsx`, and
 * `Functions.tsx` on purpose (predict-then-reveal question cards, `CodeListing` snippets, a
 * running score, a "try again" reset): Stage 3 established the pattern for its own subject, so
 * this reuses it rather than inventing a fourth Python-lesson shape. `earned` fires once the
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
    filename: 'alias.py',
    code: [
      { content: <>a = [1, 2, 3]</> },
      { content: <>b = a</> },
      { content: <>b.append(4)</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(a)
          </>
        ),
      },
    ],
    prompt: 'What does print(a) show?',
    options: ['[1, 2, 3]', '[1, 2, 3, 4]', 'TypeError — a is being modified while assigned'],
    correct: 1,
    explain:
      "b = a doesn't copy the list — it just gives the same list object a second name. b.append(4) mutates that one shared object, so a sees the change too. This is the flip side of the Variables lesson's b = a question: that one used an immutable int, where reassigning a couldn't touch b. Here the object itself is mutable, so a method call through either name changes what both see.",
  },
  {
    filename: 'point.py',
    code: [
      { content: <>point = (1, 2)</> },
      { content: <>point[0] = 5</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(point)
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: ['(5, 2)', '(1, 2)', "TypeError — a tuple can't be changed after it's created"],
    correct: 2,
    explain:
      "Tuples are immutable — once (1, 2) exists, no slot inside it can be reassigned. A list would let you write point[0] = 5 without complaint; a tuple raises TypeError the instant you try. That's the whole reason to reach for a tuple instead of a list: a promise, enforced by the interpreter itself, that this collection won't change out from under you.",
  },
  {
    filename: 'lookup.py',
    code: [
      {
        content: (
          <>
            d = {'{'}<span style={syn.str}>"a"</span>: 1, <span style={syn.str}>"b"</span>: 2,{' '}
            <span style={syn.str}>"a"</span>: 3{'}'}
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(d)
          </>
        ),
      },
    ],
    prompt: 'What does print(d) show?',
    options: [
      "{'a': 1, 'b': 2, 'a': 3}",
      "{'a': 3, 'b': 2}",
      "SyntaxError — a dict can't repeat a key",
    ],
    correct: 1,
    explain:
      'A dict literal can\'t hold two entries for the same key — Python builds the pairs left to right, and the second "a": 3 silently overwrites the first "a": 1 while the dict is still being built. Only the last value written under a repeated key survives, and there\'s no error: it\'s exactly as if you\'d written d["a"] = 1 and then, later, d["a"] = 3.',
  },
  {
    filename: 'edges.py',
    code: [
      { content: <>nums = [10, 20, 30]</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(nums[1:10])
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: ['[20, 30]', 'IndexError — 10 is out of range', '[20, 30, None, None, None, None, None]'],
    correct: 0,
    explain:
      "Slicing and indexing play by different rules: nums[10] on a 3-item list raises IndexError, but a slice never does — nums[1:10] just clamps its end to however much list actually exists and hands back whatever's there. Slice a list into nothing at all (nums[10:20]) and you still just get [], not an error. Slicing is forgiving in a way plain indexing never is.",
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

/** Stage 3's fourth lesson page — four graded predict-the-value questions on Python collections. */
export default function Collections() {
  useDocumentTitle('Collections')
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
        right={<Tag tone="accent">PYTHON · COLLECTIONS</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 3 · A FIRST LANGUAGE
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Collections
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          Lists, tuples, and dicts don't all play by the same rules — some let you mutate them in
          place, some flatly refuse, and slicing tolerates edges that plain indexing never would.
          Predict what each snippet below prints (or raises) before picking an answer; you'll see
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
            slug="collections"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
