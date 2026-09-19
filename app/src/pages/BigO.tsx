/**
 * Route `/big-o` — Stage 4's fifth real lesson ("Data Structures & Algorithms"), continuing
 * straight on from `/trees`. Where every prior Stage 4 lesson taught the behavior of one
 * structure, this one teaches the *vocabulary* those lessons were already speaking in — Big-O
 * shorthand for "how does the cost grow" — by asking the learner to name a complexity class
 * instead of predicting a printed value, the same multiple-choice-of-growth-rates shape
 * `StacksQueues.tsx`'s first question already used once for `list.pop(0)`. Four
 * predict-the-complexity questions (`QUESTIONS`), each a genuinely different mechanism rather
 * than four flavors of "loops are slow": `x in a_list` walking the list element by element (O(n),
 * worst case every element) versus `x in a_set` computing one hash and jumping straight to a
 * bucket (O(1)) — the same hash-table mechanism Hash Maps' own unhashable-list question ran into
 * from the opposite direction, now named explicitly in complexity terms rather than left implicit;
 * two nested loops multiplying their costs rather than adding them, so a function built from two
 * individually-ordinary-looking `for` loops is O(n²), not O(n) — the "each loop looks small" trap
 * named directly in the prompt; string concatenation inside a loop being O(n²) in total because a
 * Python `str` is immutable and every `+=` copies everything accumulated so far into a brand-new
 * string, contrasted with `''.join()`'s genuinely O(n) single-pass-and-copy — the same string
 * immutability Arrays' own indexing question already established, now shown to have a second,
 * costlier consequence; and `list.sort()` being O(n log n) as a memorized, near-universal rule that
 * has a real, narrow exception — Timsort's actual best case is O(n) on input that's already one
 * sorted run, which an already-sorted list always is. Deliberately did not spend a question on
 * `list.pop(0)`'s O(n) cost or `deque.popleft()`'s O(1) fix — `StacksQueues.tsx` already taught
 * that exact contrast in exactly this vocabulary; repeating it here would teach the same fact a
 * second time wearing a Big-O label instead of a fourth genuinely new one.
 *
 * Same archetype as every lesson before it (predict-then-reveal question cards, `CodeListing`
 * snippets, a running score, a "try again" reset, `<ConceptComplete>` at the pass mark) — and,
 * like `HashMaps.tsx`/`StacksQueues.tsx`/`Trees.tsx`, this round needed no `Roadmap.tsx` change:
 * Stage 4's dedicated block already covers however many real concepts `conceptsInStage(4)`
 * returns. Not to be confused with `BigOPerformance.tsx` (`/big-o-performance`) — a separate,
 * static, off-path chart-and-table reference page linked from Stage 4's `related` list, not a
 * graded lesson, and not part of `conceptsInStage(4)`'s count. `earned` fires once the learner has
 * scored at or above the pass mark, same rule as every lesson before it.
 */
import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { CodeListing, syn, type ListingLine } from '../components/CodeListing'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { ConceptComplete } from '../components/ConceptComplete'

/** One predict-the-complexity question: a snippet, three choices, and the real reasoning either way. */
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
    filename: 'membership.py',
    code: [
      {
        content: (
          <>
            values = <span style={syn.fn}>list</span>(<span style={syn.fn}>range</span>(1_000_000))
          </>
        ),
      },
      {
        content: (
          <>
            lookup = <span style={syn.fn}>set</span>(values)
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>def</span> in_list(x):
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>return</span> x <span style={syn.kw}>in</span> values
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>def</span> in_set(x):
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>return</span> x <span style={syn.kw}>in</span> lookup
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(in_list(999_999), in_set(999_999))
          </>
        ),
      },
    ],
    prompt: 'As values grows, what happens to the time complexity of in_list(x) versus in_set(x)?',
    options: [
      'Both stay O(1) — in checks membership the same way no matter what container calls it',
      "in_list is O(n) — Python may have to check every element before it can say no; in_set is O(1) — one hash computation jumps straight to a bucket",
      "in_list is O(log n) because Python keeps a list's elements sorted internally; in_set is O(1)",
    ],
    correct: 1,
    explain:
      "in isn't one operation with one fixed cost — it's implemented differently per container, and this is where that difference actually shows up. A list has no structure beyond order, so in_list(x) has to walk from the front, comparing each element, until it finds a match or runs out; checking for the very last element (999_999, exactly what this call does) is the worst case, touching all one million entries: O(n). A set is backed by a hash table — the same mechanism Hash Maps' own unhashable-list question ran into from the opposite side, where a list couldn't be a dict key precisely because it's unhashable — so in_set(x) computes one hash, jumps straight to that bucket, and checks maybe one or two candidates: O(1), whether the set holds a hundred items or a hundred million. Same question, 'is x in here?', two completely different growth curves, purely from which container you asked.",
  },
  {
    filename: 'duplicates.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>def</span> has_duplicate(nums):
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>for</span> i <span style={syn.kw}>in</span>{' '}
            <span style={syn.fn}>range</span>(<span style={syn.fn}>len</span>(nums)):
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>for</span> j <span style={syn.kw}>in</span>{' '}
            <span style={syn.fn}>range</span>(<span style={syn.fn}>len</span>(nums)):
          </>
        ),
      },
      {
        content: (
          <>
            {'            '}
            <span style={syn.kw}>if</span> i != j <span style={syn.kw}>and</span> nums[i] ==
            nums[j]:
          </>
        ),
      },
      {
        content: (
          <>
            {'                '}
            <span style={syn.kw}>return</span> <span style={syn.kw}>True</span>
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>return</span> <span style={syn.kw}>False</span>
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            nums = <span style={syn.fn}>list</span>(<span style={syn.fn}>range</span>(2_000))
          </>
        ),
      },
      { content: <>has_duplicate(nums)</> },
    ],
    prompt: 'What happens to the time complexity of has_duplicate as nums grows?',
    options: [
      "It's still O(n) — it's just two for loops, and loops are linear",
      'It becomes O(n²) — the inner loop runs all the way through once for every single pass of the outer loop',
      'It becomes O(2n), which simplifies back down to O(n)',
    ],
    correct: 1,
    explain:
      "Each loop, read on its own, looks perfectly ordinary — for i in range(len(nums)) is a plain linear scan, and so is the one nested inside it. But the inner loop doesn't run once total; it runs once in full for every single iteration of the outer loop. n outer passes, each doing a complete n-step inner pass, is n × n comparisons, not n + n. At 2,000 items that's up to 4,000,000 comparisons, from a function whose source is two loops that each individually 'look small.' Nesting multiplies the costs; it never just adds them. (There's a genuinely O(n) way to spot a duplicate — dump every value into a set and compare its length against the list's, the exact O(1)-membership trick the previous question just covered — but that's a different function, not a faster version of this one.)",
  },
  {
    filename: 'build_csv.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>def</span> build_csv(words):
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            result = <span style={syn.str}>""</span>
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>for</span> w <span style={syn.kw}>in</span> words:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            result += w + <span style={syn.str}>","</span>
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>return</span> result
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            words = [<span style={syn.str}>"row"</span>] * 50_000
          </>
        ),
      },
      { content: <>build_csv(words)</> },
    ],
    prompt: 'What happens to the time complexity of build_csv as words grows?',
    options: [
      'It stays O(n) — the loop runs once per word, and each += is a cheap constant-time append',
      "It becomes O(n²) — strings are immutable, so every += builds an entirely new string and copies everything accumulated so far into it",
      "It stays O(1) — Python's interpreter detects the pattern and concatenates in place automatically",
    ],
    correct: 1,
    explain:
      "A Python str can't be mutated in place — Arrays' own indexing question already established that you can't write into a string by index, and that same immutability is what makes += expensive here too. result += w + \",\" doesn't append to result; it builds a brand-new string holding result's old contents plus the new piece, then copies the whole thing into memory and rebinds result to point at it. The first iteration copies a handful of characters, the second copies more than that, and so on — the total characters copied across all n iterations sums to roughly 1 + 2 + 3 + ... + n, which is O(n²), even though the code reads like an ordinary O(n) loop. ''.join(pieces) sidesteps this entirely: it scans the list once to compute the final length, allocates exactly one string of that size, and copies each piece into it once — genuinely O(n), and the idiomatic fix any time a string is being built up across a loop.",
  },
  {
    filename: 'resort.py',
    code: [
      {
        content: (
          <span style={syn.cm}># nums is already sorted, ascending, before this call</span>
        ),
      },
      {
        content: (
          <>
            nums = <span style={syn.fn}>list</span>(<span style={syn.fn}>range</span>(500_000))
          </>
        ),
      },
      { content: <>nums.sort()</> },
    ],
    prompt: 'nums is already sorted before .sort() is called. What is the time complexity of this call?',
    options: [
      "O(n log n) — that's sorting's guaranteed bound, no matter how the input already looks",
      "O(n) — Python's Timsort detects the list is already one sorted run and confirms it in a single linear pass, which is its actual best case",
      'O(n²) — re-sorting an already-sorted list is exactly the case that triggers a bad worst case',
    ],
    correct: 1,
    explain:
      "\"Sorting is O(n log n)\" is one of the most confidently memorized facts in this whole topic — and it's the average and worst case, not a universal law. Python's list.sort()/sorted() run Timsort, a hybrid built specifically to notice existing order: it scans for naturally-occurring sorted 'runs' before doing any real merging work, and a fully-sorted list is exactly one run covering the entire input. Confirming that takes a single linear pass — O(n) — with no merging and none of the log n splitting a genuinely unordered list would need. It's also the opposite of what option 3 assumes: sorting's real worst case is input shapes a naive algorithm can't exploit at all, not this one. The lesson isn't 'sorting is secretly cheap' — it's that even a bound as widely memorized as O(n log n) has a real, narrow exception, and already-sorted input is it.",
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

/** Stage 4's fifth lesson page — four graded predict-the-complexity questions. */
export default function BigO() {
  useDocumentTitle('Big-O')
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
        note="Page type · Concept lesson · Algorithms"
        right={<Tag tone="accent">ALGORITHMS · BIG-O</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 4 · DATA STRUCTURES &amp; ALGORITHMS
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Big-O
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          Every lesson so far has already been speaking Big-O — O(n) here, O(log n) there — without
          stopping to name it. This one asks you to name it directly: given a snippet, predict how
          its cost grows as the input does, not what it prints. Same rules as always — pick an
          answer, then see whether you were right.
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
            slug="big-o"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
