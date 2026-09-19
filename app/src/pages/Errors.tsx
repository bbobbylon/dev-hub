/**
 * Route `/errors` — Stage 3's fifth real lesson ("A First Language: Python"), continuing straight
 * on from `/collections`: four predict-the-value questions (`QUESTIONS`) on the exception-handling
 * gotchas that separate "read the try/except docs once" from "spent an afternoon chasing a bug they
 * caused": a `finally` block's own `return` silently overriding the value `try` already returned, a
 * broad `except Exception:` swallowing an unrelated bug (a `TypeError` from the wrong argument type)
 * alongside the failure it was actually written to catch, a bare `except:` catching `SystemExit` —
 * something a properly-scoped `except Exception:` would never touch, because `SystemExit` inherits
 * from `BaseException`, not `Exception` — and an `except` clause ordered after a more general one
 * that can now never run, with no error to warn you it's dead code. Same archetype as
 * `PythonVariables.tsx`, `ControlFlow.tsx`, `Functions.tsx`, and `Collections.tsx` on purpose
 * (predict-then-reveal question cards, `CodeListing` snippets, a running score, a "try again"
 * reset): Stage 3 established the pattern for its own subject, so this reuses it rather than
 * inventing a fifth Python-lesson shape. `earned` fires once the learner has scored at or above the
 * pass mark, same rule as every other lesson on this stage.
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
    filename: 'finally.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>def</span> compute():
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>try</span>:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>return</span> 1
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>finally</span>:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>return</span> 2
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(compute())
          </>
        ),
      },
    ],
    prompt: 'What does print(compute()) show?',
    options: ['1', '2', 'RuntimeError — a function cannot return twice'],
    correct: 1,
    explain:
      "finally always runs, even after try has already hit a return — that part isn't the surprise. The surprise is that finally's own return wins: Python evaluates return 1, but before compute() actually hands that back, it runs the finally block, sees a second return, and that value replaces the first one entirely. The 1 never escapes the function. Only ever put a return inside finally when you truly mean to override whatever try decided — most of the time you don't, and this is exactly how a \"cleanup\" block quietly eats a function's real result.",
  },
  {
    filename: 'divide.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>def</span> safe_divide(a, b):
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>try</span>:
          </>
        ),
      },
      { content: <>{'        '}return a / b</> },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>except</span> Exception:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>return</span> <span style={syn.kw}>None</span>
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(safe_divide(10, 0))
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(safe_divide(10, <span style={syn.str}>"0"</span>))
          </>
        ),
      },
    ],
    prompt: 'What do the two print() calls show?',
    options: ['None then None', 'None then a TypeError traceback', '0.0 then None'],
    correct: 0,
    explain:
      "except Exception: doesn't just catch the ZeroDivisionError this function was written for — it catches everything else under Exception too, including the TypeError that 10 / \"0\" raises (you can't divide a number by a string). Both calls fail, and both get silently rewritten to None, so the caller can't tell \"you divided by zero\" from \"you passed an entirely wrong type.\" A narrower except ZeroDivisionError: would have let that TypeError escape as a loud, real traceback pointing straight at the actual bug — catching Exception this broadly instead turns a caller's mistake into the exact same quiet wrong answer as a legitimate zero.",
  },
  {
    filename: 'shutdown.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>import</span> sys
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>def</span> run():
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>try</span>:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            sys.exit(<span style={syn.str}>"fatal error"</span>)
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>except</span>:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}print(<span style={syn.str}>"recovered"</span>)
          </>
        ),
      },
      { content: <></> },
      { content: <>run()</> },
      {
        content: (
          <>
            print(<span style={syn.str}>"still running"</span>)
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: [
      'fatal error, then the program exits',
      'recovered, then still running',
      "Nothing — sys.exit() always terminates immediately",
    ],
    correct: 1,
    explain:
      "sys.exit() doesn't kill the process directly — it raises SystemExit, and SystemExit (like KeyboardInterrupt) inherits from BaseException, not Exception. A bare except: with no class named after it catches BaseException, the broadest thing there is, so it swallows the SystemExit right along with everything else: prints \"recovered\", and execution just carries on past the exit that was supposed to end the program. Write except Exception: instead and sys.exit() sails straight through untouched — which is almost always what you want. This is exactly why bare except: is dangerous: it can't tell \"a real bug worth catching\" from \"the program is trying to shut down.\"",
  },
  {
    filename: 'order.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>try</span>:
          </>
        ),
      },
      { content: <>{'    '}result = [1, 2, 3][10]</> },
      {
        content: (
          <>
            <span style={syn.kw}>except</span> Exception:
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}print(<span style={syn.str}>"general handler"</span>)
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>except</span> IndexError:
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}print(<span style={syn.str}>"specific handler"</span>)
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: [
      'general handler',
      'specific handler',
      'SyntaxError — a specific except cannot follow a general one',
    ],
    correct: 0,
    explain:
      "Python checks except clauses top to bottom and runs the first one that matches — it never keeps looking further down for a \"better\" fit. IndexError is a subclass of Exception, so the first clause, except Exception:, already matches the list index out of range and runs. except IndexError: below it is dead code that can never fire, and Python raises no error to warn you — the file parses and runs exactly as written. Always list the more specific exception types first and the general ones last, or a broad early clause will silently swallow every specific case you wrote underneath it.",
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

/** Stage 3's fifth lesson page — four graded predict-the-value questions on Python error handling. */
export default function Errors() {
  useDocumentTitle('Errors')
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
        right={<Tag tone="accent">PYTHON · ERRORS</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 3 · A FIRST LANGUAGE
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Errors
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          try/except looks simple until it isn't: a finally can quietly override the value you
          thought you'd already returned, a catch-all except can swallow a bug that has nothing to
          do with what you meant to handle, and the order you write your except clauses in actually
          decides which ones ever run. Predict what each snippet below prints (or does) before
          picking an answer; you'll see whether you were right either way.
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
            slug="errors"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
