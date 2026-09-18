/**
 * Route `/files` — Stage 3's sixth and final real lesson ("A First Language: Python"), continuing
 * straight on from `/errors`: four predict-the-value questions (`QUESTIONS`) on the file-I/O
 * gotchas that separate "read the `open()` docs once" from "lost real data because of them": mode
 * `"w"` truncating a file to zero bytes the instant it's *opened* — not when something is actually
 * written, and not only if anything ever is — a file object being a one-shot cursor, so reading it
 * a second time without rewinding returns nothing rather than the same content again, binary mode
 * handing back `bytes` instead of `str` (so a `bytes == str` comparison is quietly `False`, never
 * `True` and never an error), and a `with` block's guaranteed close meaning the file object it
 * named is unusable — a real `ValueError`, not a silent no-op — the instant code steps outside it.
 * Deliberately did not reach for "forgetting to call `.close()` at all" as a fifth angle: it's the
 * same underlying lesson as the `with`-block question (a file needs closing, and not closing it
 * has consequences), so it would have doubled up on question 4's point rather than teaching a
 * fifth distinct thing. Same archetype as `PythonVariables.tsx`, `ControlFlow.tsx`, `Functions.tsx`,
 * `Collections.tsx`, and `Errors.tsx` on purpose (predict-then-reveal question cards, `CodeListing`
 * snippets, a running score, a "try again" reset): Stage 3 established the pattern for its own
 * subject, so this reuses it rather than inventing a sixth Python-lesson shape. `earned` fires once
 * the learner has scored at or above the pass mark, same rule as every other lesson on this stage —
 * and completing it is what finally moves Stage 3 to 6 of 6, the first fully-built stage on the
 * Roadmap since Stage 1 and 2.
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
    filename: 'mode.py',
    code: [
      {
        content: (
          <span style={syn.cm}># notes.txt already contains:</span>
        ),
      },
      {
        content: (
          <span style={syn.cm}>#     keep this text</span>
        ),
      },
      {
        content: (
          <>
            f = <span style={syn.fn}>open</span>(<span style={syn.str}>"notes.txt"</span>,{' '}
            <span style={syn.str}>"w"</span>)
          </>
        ),
      },
      { content: <>f.close()</> },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(<span style={syn.fn}>open</span>(
            <span style={syn.str}>"notes.txt"</span>).read())
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: [
      'keep this text',
      'an empty string — the file has nothing in it',
      'FileNotFoundError — notes.txt was deleted, not emptied',
    ],
    correct: 1,
    explain:
      "Opening a file in \"w\" mode truncates it to zero bytes the instant open() runs — not when you write, and not only if you actually write something. f.close() didn't need to happen for that to occur; the truncation was a side effect of opening the file for writing, before a single character was ever written to it. The file itself still exists (open() doesn't delete files, only their contents), so it isn't a FileNotFoundError either — reading it back just returns an empty string. This is the classic \"I meant to append and used 'w' by mistake\" bug: the original data was already gone the moment the file was opened, regardless of whether the program went on to write anything new or crashed before it got the chance.",
  },
  {
    filename: 'cursor.py',
    code: [
      {
        content: (
          <span style={syn.cm}># log.txt already contains three lines:</span>
        ),
      },
      { content: <span style={syn.cm}>#     one</span> },
      { content: <span style={syn.cm}>#     two</span> },
      { content: <span style={syn.cm}>#     three</span> },
      {
        content: (
          <>
            <span style={syn.kw}>with</span> <span style={syn.fn}>open</span>(
            <span style={syn.str}>"log.txt"</span>) <span style={syn.kw}>as</span> f:
          </>
        ),
      },
      { content: <>{'    '}first = f.readlines()</> },
      { content: <>{'    '}second = f.readlines()</> },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(<span style={syn.fn}>len</span>(first),{' '}
            <span style={syn.fn}>len</span>(second))
          </>
        ),
      },
    ],
    prompt: 'What does print(len(first), len(second)) show?',
    options: ['3 3', '3 0', 'RuntimeError — a file cannot be read twice'],
    correct: 1,
    explain:
      "A file object tracks its own read position internally, like a cursor. The first f.readlines() call reads every line in the file and leaves that cursor sitting at the very end. The second call starts from wherever the cursor currently is — the end — so there's nothing left to read: it comes back an empty list, not a second copy of the same three lines and not an error. Reading a file is a one-way trip unless you explicitly rewind the cursor yourself with f.seek(0).",
  },
  {
    filename: 'binary.py',
    code: [
      { content: <span style={syn.cm}># data.txt contains: OK</span> },
      {
        content: (
          <>
            <span style={syn.kw}>with</span> <span style={syn.fn}>open</span>(
            <span style={syn.str}>"data.txt"</span>, <span style={syn.str}>"rb"</span>){' '}
            <span style={syn.kw}>as</span> f:
          </>
        ),
      },
      { content: <>{'    '}content = f.read()</> },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(content == <span style={syn.str}>"OK"</span>)
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: ['True', 'False', "TypeError — bytes can't be compared to str"],
    correct: 1,
    explain:
      '"rb" opens the file in binary mode, so f.read() hands back a bytes object — b\'OK\' — not the string "OK". Python never treats bytes and str as equal to each other, even when they look identical once printed; comparing two different types with == doesn\'t raise an error, it just quietly returns False. To get a real string back, decode it first — content.decode() — or open the file in text mode ("r") to begin with, which is what you almost always want unless you\'re deliberately handling raw bytes (images, zip files, and the like).',
  },
  {
    filename: 'closed.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>with</span> <span style={syn.fn}>open</span>(
            <span style={syn.str}>"out.txt"</span>, <span style={syn.str}>"w"</span>){' '}
            <span style={syn.kw}>as</span> f:
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}f.write(<span style={syn.str}>"hello"</span>)
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            f.write(<span style={syn.str}>" world"</span>)
          </>
        ),
      },
    ],
    prompt: 'What happens when this runs?',
    options: [
      'It writes "hello world" to out.txt',
      'ValueError — I/O operation on closed file',
      'NameError — f only exists inside the with block',
    ],
    correct: 1,
    explain:
      "with open(...) as f: guarantees the file gets closed the moment the block ends — that's the whole point of a context manager, and it happens whether the block finished normally or raised an exception partway through. f the name is still perfectly valid outside the block (with doesn't create its own scope, so there's no NameError), but the file object it points to is now closed. Calling f.write() on a closed file raises ValueError: I/O operation on closed file. This is exactly why every read or write that touches a file belongs inside its with block, never after it.",
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

/** Stage 3's sixth and final lesson page — four graded predict-the-value questions on file I/O. */
export default function Files() {
  useDocumentTitle('Files')
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
        right={<Tag tone="accent">PYTHON · FILES</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 3 · A FIRST LANGUAGE
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Files
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          open() looks harmless until the mode string quietly deletes something, or a second read
          comes back empty, or a comparison that should be True is False for a reason that has
          nothing to do with the data. Predict what each snippet below does before picking an
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
            slug="files"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
