/**
 * Route `/arrays` — Stage 4's first real lesson ("Data Structures & Algorithms"), the first
 * concept on a new stage rather than a continuation of Stage 3: four predict-the-value/
 * predict-the-behavior questions (`QUESTIONS`) on array-specific gotchas Python's `list` hides
 * behind friendly syntax — `[[0] * 3] * 3` building a "2D array" whose three rows are secretly
 * the *same* underlying list repeated by reference, not three independent copies; mutating a
 * list with `.remove()` while a `for` loop is still walking it, which desyncs the loop's internal
 * position counter from the shrinking list and silently skips elements (and, unlike a dict or
 * set, raises no error to warn you); negative indexing being bounded exactly like positive
 * indexing (`arr[-len(arr)-1]` is a real `IndexError`, not an infinite wrap); and a string being
 * an *immutable* array of characters — readable by index, never writable by index, the same
 * distinction `Collections.tsx` drew for tuples but for a type this stage cares about specifically.
 * `Data Structures Visual`'s own array diagram already states the one-line "fast: O(1) index /
 * slow: O(n) insert-at-front" verdict, so this lesson deliberately goes past that summary into
 * mechanisms it doesn't cover, rather than re-testing the same two facts at more length.
 *
 * Same archetype as every Stage 3 lesson on purpose (predict-then-reveal question cards,
 * `CodeListing` snippets, a running score, a "try again" reset, `<ConceptComplete>` at the pass
 * mark): the subject changed, the interaction shape didn't need to. `earned` fires once the
 * learner has scored at or above the pass mark, same rule as every lesson before it.
 *
 * Being Stage 4's first concept — not a continuation of an already-partially-built stage — this
 * page also required `Roadmap.tsx` to gain a real, dedicated stage-4 block (mirroring stage 3's
 * own, which stage 4 had never had before now: it was still rendered through the fully-locked,
 * no-chips `laterStages` path). See that file's own comments for what changed and why.
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
    filename: 'matrix.py',
    code: [
      {
        content: (
          <>
            grid = [[0] * 3] * 3
          </>
        ),
      },
      { content: <>grid[0][0] = 1</> },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(grid)
          </>
        ),
      },
    ],
    prompt: 'What does print(grid) show?',
    options: [
      '[[1, 0, 0], [0, 0, 0], [0, 0, 0]]',
      '[[1, 0, 0], [1, 0, 0], [1, 0, 0]]',
      'TypeError — a list cannot be multiplied by an int',
    ],
    correct: 1,
    explain:
      "[0] * 3 builds one list, [0, 0, 0] — call it L. [L] * 3 doesn't copy L three times; it just repeats the same reference three times, so grid ends up holding three names for the exact same underlying list, not three independent rows. grid[0][0] = 1 mutates that one shared L through grid[0], and since grid[1] and grid[2] point at that identical object, they show the change too — every 'row' is really the same row wearing three different name tags. To get three genuinely independent rows, you need something like [[0] * 3 for _ in range(3)], which calls [0] * 3 three separate times instead of reusing one result.",
  },
  {
    filename: 'skip.py',
    code: [
      { content: <>nums = [2, 4, 6, 8]</> },
      {
        content: (
          <>
            <span style={syn.kw}>for</span> n <span style={syn.kw}>in</span> nums:
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>if</span> n % 2 == 0:
          </>
        ),
      },
      { content: <>{'        '}nums.remove(n)</> },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(nums)
          </>
        ),
      },
    ],
    prompt: 'This is meant to remove every even number. What does print(nums) actually show?',
    options: ['[]', '[4, 8]', 'RuntimeError — list changed size during iteration'],
    correct: 1,
    explain:
      "The for loop walks nums using an internal position counter, not a live re-scan of \"whatever is still even.\" Removing an item shifts every later element one slot left, but the counter still just moves forward by one — so it skips whatever slid into the spot the removed item vacated. Starting from [2, 4, 6, 8]: removing 2 shifts the list to [4, 6, 8] and the counter moves to index 1, which is now 6, not 4 — so 4 quietly survives. The same thing happens again: removing 6 shifts to [4, 8], the counter moves to index 2, which is past the end, so the loop just stops — 8 survives too. Unlike mutating a dict or set mid-loop, which Python actually detects and raises RuntimeError for, mutating a list mid-loop raises nothing at all; it just silently corrupts the traversal. The safe fix is looping over a copy — for n in nums[:]: — or building a new list with a comprehension instead of removing in place.",
  },
  {
    filename: 'negative.py',
    code: [
      { content: <>arr = [10, 20, 30]</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(arr[-4])
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: [
      '30 — negative indices wrap back around to the end',
      '10',
      'IndexError — list index out of range',
    ],
    correct: 2,
    explain:
      "Negative indices count backward from the end — arr[-1] is 30, arr[-2] is 20, arr[-3] is 10 — but that's the whole range; there is no arr[-4]. Just like positive indices stop at arr[len(arr) - 1] and arr[len(arr)] raises IndexError, negative indices stop at arr[-len(arr)] and going one further raises the exact same IndexError: list index out of range. Negative indexing isn't a separate, infinitely-wrapping numbering scheme — it's just another way to spell the same bounded range of valid positions plain indexing already has.",
  },
  {
    filename: 'immutable.py',
    code: [
      {
        content: (
          <>
            word = <span style={syn.str}>"cat"</span>
          </>
        ),
      },
      {
        content: (
          <>
            word[0] = <span style={syn.str}>"b"</span>
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(word)
          </>
        ),
      },
    ],
    prompt: 'What happens when this runs?',
    options: ['bat', 'cat', "TypeError — 'str' object does not support item assignment"],
    correct: 2,
    explain:
      "A string looks like an array of characters — word[0] reads just fine — but it's an immutable one: there is no operation that changes a character in place. word[0] = \"b\" isn't just discouraged, it's disallowed by the type itself, and Python raises TypeError: 'str' object does not support item assignment the instant you try. Contrast that with an actual list — letters = list(word); letters[0] = \"b\" works perfectly, because a list is a genuinely mutable array. If you need to \"edit\" a string, you build a brand new one instead — word = \"b\" + word[1:] — you never modify the original object.",
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

/** Stage 4's first lesson page — four graded predict-the-value questions on array behavior. */
export default function Arrays() {
  useDocumentTitle('Arrays')
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
        note="Page type · Concept lesson · Data structures"
        right={<Tag tone="accent">DATA STRUCTURES · ARRAYS</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 4 · DATA STRUCTURES &amp; ALGORITHMS
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Arrays
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          A Python list looks like a plain row of boxes, but a few of its behaviors only make
          sense once you know it's really a resizable array under the hood: how it's built,
          how it's indexed, and how it reacts to being changed out from under a loop. Predict
          what each snippet below does before picking an answer; you'll see whether you were
          right either way.
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
            slug="arrays"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
