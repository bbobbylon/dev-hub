/**
 * Route `/stacks-queues` — Stage 4's third real lesson ("Data Structures & Algorithms"),
 * continuing straight on from `/hash-maps`: four predict-the-value/predict-the-behavior questions
 * (`QUESTIONS`) on the gotchas that separate "a list can do this too" from "a list can do this
 * *safely*" — `list.pop(0)` quietly costing O(n) because every remaining element has to shift left
 * to close the gap, the exact reason a "queue" built from a plain list silently degrades as it
 * grows (the explanation draws the contrast with `list.append()`/`list.pop()`'s genuine O(1) at the
 * *other* end, and with `collections.deque.popleft()`'s O(1) at *this* end, rather than spending a
 * whole separate question restating the same fact positively); `deque(maxlen=N)` silently dropping
 * the oldest element once full instead of growing or raising, which is the entire point of `maxlen`
 * but a dangerous default if you expected an error; `append()` + `pop()` giving a stack (LIFO)
 * while `append()` + `popleft()` gives a queue (FIFO) — the single most common stack-vs-queue mixup,
 * and neither call raises anything to catch it; and popping an empty structure raising a real
 * `IndexError: pop from empty list` rather than `None`, contrasted with the safe `while stack:`
 * draining pattern the same snippet demonstrates correctly one line earlier. Deliberately did not
 * spend a full question on "append/pop() is O(1)" as its own separate fact — see above — since it's
 * already load-bearing inside the first question's explanation and repeating it as a fifth
 * question would teach the same idea twice rather than a genuinely different one.
 *
 * Same archetype as every Stage 3 lesson and Stage 4's own `Arrays.tsx`/`HashMaps.tsx` on purpose
 * (predict-then-reveal question cards, `CodeListing` snippets, a running score, a "try again"
 * reset, `<ConceptComplete>` at the pass mark) — and, like `HashMaps.tsx`, this round needed no
 * `Roadmap.tsx` change at all: Stage 4's dedicated block already covers however many real concepts
 * `conceptsInStage(4)` returns. `earned` fires once the learner has scored at or above the pass
 * mark, same rule as every lesson before it.
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
    filename: 'queue.py',
    code: [
      {
        content: (
          <>
            queue = <span style={syn.fn}>list</span>(<span style={syn.fn}>range</span>(100_000))
          </>
        ),
      },
      { content: <>queue.pop(0)</> },
    ],
    prompt: "What's the time complexity of queue.pop(0) here?",
    options: [
      'O(1) — pop always removes instantly, regardless of position',
      'O(n) — every remaining element shifts left by one',
      'O(log n) — Python binary-searches for the front',
    ],
    correct: 1,
    explain:
      "pop(0) doesn't just remove the front element — under the hood, every one of the other 99,999 elements has to shift one slot to the left to close the gap, because a Python list is a contiguous array, not a linked structure. That's O(n) work for what looks like a single, cheap call. A \"queue\" built by repeatedly calling list.pop(0) doesn't fail loudly — it just gets slower and slower as it grows, exactly the kind of bug that passes every test against a small list and only falls over in production. Contrast that with list.append(x) and list.pop() (no argument), which both operate at the *other* end and are genuinely O(1) — that pairing makes a plain list a perfectly good stack, just a bad queue. collections.deque exists specifically to fix the queue side: deque.popleft() is O(1), because a deque is built to be fast at both ends, not just one.",
  },
  {
    filename: 'deque_maxlen.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>from</span> collections <span style={syn.kw}>import</span> deque
          </>
        ),
      },
      { content: <></> },
      { content: <>recent = deque(maxlen=3)</> },
      { content: <>recent.append(1)</> },
      { content: <>recent.append(2)</> },
      { content: <>recent.append(3)</> },
      { content: <>recent.append(4)</> },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(recent)
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: [
      'deque([1, 2, 3, 4], maxlen=3) — it just grows past the limit',
      'deque([2, 3, 4], maxlen=3) — 1 is silently dropped',
      'IndexError — the deque is already full',
    ],
    correct: 1,
    explain:
      "A deque created with maxlen=3 isn't a suggestion — it's a hard cap Python enforces automatically. Once the deque is full (holding [1, 2, 3]) and a fourth item is appended, it doesn't grow, and it doesn't raise an error either: it silently drops the item at the opposite end from where you're adding — the oldest one, 1, since you appended on the right — to make room, leaving [2, 3, 4]. This isn't a bug; it's the entire reason maxlen exists, built specifically for a fixed-size \"last N items\" buffer like a recent-activity log or a rolling window. But it's a genuinely dangerous default if you expected an error, or expected the structure to just keep growing — you'd have silently lost data with no exception anywhere to catch.",
  },
  {
    filename: 'deque_pop.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>from</span> collections <span style={syn.kw}>import</span> deque
          </>
        ),
      },
      { content: <></> },
      { content: <>orders = deque()</> },
      {
        content: (
          <>
            orders.append(<span style={syn.str}>"first"</span>)
          </>
        ),
      },
      {
        content: (
          <>
            orders.append(<span style={syn.str}>"second"</span>)
          </>
        ),
      },
      {
        content: (
          <>
            orders.append(<span style={syn.str}>"third"</span>)
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(orders.pop())
          </>
        ),
      },
    ],
    prompt:
      'This is meant to process orders in the order they arrived (first come, first served). What does print(orders.pop()) actually show?',
    options: ['first', 'third', "TypeError — pop() needs an index for a deque"],
    correct: 1,
    explain:
      "orders.append() always adds to the right end, and orders.pop() (no arguments) always removes from that same right end — that pairing gives you a stack, last-in-first-out, not a queue. \"third\" was the most recently appended order, so it's the first one back out. To actually process orders in arrival order — first-in-first-out — you need orders.popleft() instead, which pulls from the left end, where \"first\" is still waiting. append() + pop() is a stack; append() + popleft() is a queue. Mixing them up is the single most common stack-vs-queue bug there is, and Python's error messages won't catch it for you — both calls are perfectly legal, they just do the wrong thing.",
  },
  {
    filename: 'drain.py',
    code: [
      {
        content: (
          <>
            history = [<span style={syn.str}>"home"</span>, <span style={syn.str}>"profile"</span>]
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>while</span> history:
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.fn}>print</span>(history.pop())
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(history.pop())
          </>
        ),
      },
    ],
    prompt: 'What happens when this runs?',
    options: [
      '"profile" then "home", then history.pop() outside the loop returns None',
      '"profile" then "home", then IndexError: pop from empty list',
      '"profile", "home", then the loop keeps running forever popping None',
    ],
    correct: 1,
    explain:
      "The while history: loop is the safe pattern — it keeps popping and printing for as long as there's still something in the list, so it correctly drains history down to empty: \"profile\", then \"home\". But the print(history.pop()) sitting outside that loop doesn't check anything first — it just assumes there's still something there. By that point history is [], and popping from an empty list doesn't return None or quietly do nothing: it raises IndexError: pop from empty list, immediately and loudly. This is exactly why real stack/queue code guards every pop with a truthiness check — if stack: or while stack: — rather than trusting there'll always be something left. An unchecked .pop() is a landmine waiting for the one input that empties the structure first.",
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

/** Stage 4's third lesson page — four graded predict-the-value questions on stack/queue behavior. */
export default function StacksQueues() {
  useDocumentTitle('Stacks & Queues')
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
        right={<Tag tone="accent">DATA STRUCTURES · STACKS &amp; QUEUES</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 4 · DATA STRUCTURES &amp; ALGORITHMS
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Stacks &amp; Queues
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          A plain Python list can play stack or queue, but only one of those roles is actually
          cheap — and Python's own deque exists because the other one quietly isn't. Predict what
          each snippet below does before picking an answer; you'll see whether you were right
          either way.
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
            slug="stacks-queues"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
