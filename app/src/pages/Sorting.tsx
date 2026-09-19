/**
 * Route `/sorting` — Stage 4's sixth and final real lesson ("Data Structures & Algorithms"),
 * continuing straight on from `/big-o`. Four predict-the-value/predict-the-behavior questions
 * (`QUESTIONS`) on the gotchas that separate "I called sort() once" from "I understand what it
 * actually does": `list.sort()` mutating the list in place and returning `None` — not the sorted
 * list — so the classic `x = nums.sort()` bug leaves `x` empty while `nums` itself really is
 * sorted, contrasted with `sorted()`, which returns a genuinely new list and leaves the original
 * untouched; sort *stability* — when two elements tie under the sort key, Python's sort keeps them
 * in their original relative order rather than picking arbitrarily, which is exactly what makes a
 * "sort by A, then stably sort by B" multi-key technique work at all; `key=` transforming what's
 * *compared* without ever touching the actual values being sorted, contrasted with the genuinely
 * surprising default — Python compares strings by raw code point, so every capital letter sorts
 * before every lowercase one, not the intuitive dictionary order `key=str.lower` fixes; and sorting
 * a list of genuinely incomparable types (`int` and `str` in the same list) raising `TypeError`
 * outright rather than silently guessing an order — Python 3 refuses to invent an answer to "is 3
 * less than 'two'?". Big-O's own fourth question already covered `.sort()`'s O(n log n) bound (and
 * Timsort's O(n) best case on already-sorted input) — deliberately did not touch complexity again
 * here, since repeating that fact under a new lesson's byline would teach nothing new; all four
 * questions here are about behavior, not cost, which the coordinator's own "extend the
 * predict-the-complexity shape where it fits" note left room for rather than requiring.
 *
 * Same archetype as every lesson before it (predict-then-reveal question cards, `CodeListing`
 * snippets, a running score, a "try again" reset, `<ConceptComplete>` at the pass mark) — and,
 * like every Stage 4 round since Hash Maps, this needed no `Roadmap.tsx` *logic* change: the
 * dedicated block is still fully derived from `conceptsInStage(4)`. It DID need one comment fix
 * inside that file (see `Roadmap.tsx`'s own header and its stage-4 block comment) — a per-block
 * JSX comment that had drifted since item 35 and still read "one real concept built (Arrays)"
 * through four rounds of "zero Roadmap.tsx changes," because that claim was always about behavior,
 * never about prose. `earned` fires once the learner has scored at or above the pass mark, same
 * rule as every lesson before it — and completing it is what finally moves Stage 4 to 6 of 6, the
 * third fully-built stage on the Roadmap after Stage 1/2 and Stage 3.
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
    filename: 'mutate.py',
    code: [
      { content: <>nums = [3, 1, 2]</> },
      { content: <>x = nums.sort()</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(x)
          </>
        ),
      },
    ],
    prompt: 'What does print(x) show?',
    options: [
      '[1, 2, 3] — sort() returns the newly sorted list',
      'None — sort() sorts nums in place and hands back nothing',
      "[3, 1, 2] — sort() doesn't actually change nums, it just returns a copy",
    ],
    correct: 1,
    explain:
      "list.sort() mutates nums in place and always returns None — the same convention list.append() and list.reverse() follow for any method whose whole job is to change the object you called it on. nums really is [1, 2, 3] after this runs; that's just a fact about nums, not about x, and x only ever holds whatever sort() handed back, which is nothing. This is the classic x = my_list.sort() bug: it reads like \"give me the sorted list,\" but it actually sorts the list as a side effect and throws away the (nonexistent) return value into x. The builtin that actually does what the bug-writer wanted is sorted(nums) — it returns a brand-new sorted list and leaves the original completely alone, which is also why sorted() works on tuples and other things that have no .sort() method of their own to mutate.",
  },
  {
    filename: 'stability.py',
    code: [
      {
        content: (
          <>
            people = [(<span style={syn.str}>"Amy"</span>, 30), (<span style={syn.str}>"Bo"</span>,
            25), (<span style={syn.str}>"Cy"</span>, 30)]
          </>
        ),
      },
      {
        content: (
          <>
            people.sort(key=<span style={syn.kw}>lambda</span> p: p[1])
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(people)
          </>
        ),
      },
    ],
    prompt: 'What does print(people) show?',
    options: [
      "[('Bo', 25), ('Amy', 30), ('Cy', 30)] — Amy still comes before Cy, since they tie",
      "[('Bo', 25), ('Cy', 30), ('Amy', 30)] — ties get re-sorted by name once ages match",
      "[('Bo', 25), ('Amy', 30), ('Cy', 30)] happens by luck — Python makes no promise either way",
    ],
    correct: 0,
    explain:
      "Python's sort is stable: when two elements compare equal under the sort key — here, Amy and Cy both have age 30 — it never reorders them relative to each other. They keep whatever relative order they had in the original list, and Amy appeared before Cy there, so Amy still comes before Cy after sorting by age. This isn't a lucky coincidence Python happens to produce; it's a documented guarantee (Python's Timsort is built on it), and it's exactly what makes multi-key sorting work by chaining single-key sorts: sort by the minor key first, then stably sort by the major key, and every minor-key group that ties on the major key stays in its own already-sorted order. An unstable sort would make that technique unreliable — you'd get a correct sort by age, but no guarantee about who comes first within a tied age.",
  },
  {
    filename: 'keyfunc.py',
    code: [
      {
        content: (
          <>
            words = [<span style={syn.str}>"Banana"</span>, <span style={syn.str}>"apple"</span>,{' '}
            <span style={syn.str}>"Cherry"</span>]
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(<span style={syn.fn}>sorted</span>(words,
            key=str.lower))
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: [
      "['apple', 'Banana', 'Cherry'] — compared case-insensitively, but returned in their original casing",
      "['apple', 'banana', 'cherry'] — key=str.lower lowercases every word in the result",
      "['Banana', 'Cherry', 'apple'] — capital letters sort before lowercase ones, and key= doesn't change that",
    ],
    correct: 0,
    explain:
      "key=str.lower doesn't relabel the words themselves — for each element, Python calls str.lower(word) once to get a throwaway comparison key, decides the order using those lowercase keys, and then returns the original elements, casing intact, in that order. So 'apple' sorts before 'Banana' (alphabetically a < b) even though the string 'apple' in the output is still exactly the string that was in the input — it only looked lowercase inside the comparison, never in the list. That matters because option 3 describes the real, surprising default: without key=, sorted(words) compares strings by raw character code, and every uppercase letter sorts before every lowercase one in that scheme — plain sorted(words) here really would give ['Banana', 'Cherry', 'apple'], capital letters first, which reads as nonsense next to a dictionary. key=str.lower is exactly the fix: it doesn't touch your data, it just changes what gets compared.",
  },
  {
    filename: 'incomparable.py',
    code: [
      {
        content: (
          <>
            values = [3, <span style={syn.str}>"two"</span>, 1]
          </>
        ),
      },
      { content: <>values.sort()</> },
    ],
    prompt: 'What happens when this runs?',
    options: [
      "[1, 3, 'two'] — Python sorts the numbers first, then appends the strings",
      "TypeError: '<' not supported between instances of 'str' and 'int' — Python won't guess an order between them",
      "['two', 1, 3] — strings always sort ahead of numbers",
    ],
    correct: 1,
    explain:
      "Sorting works by repeatedly comparing pairs of elements with < to decide which comes first, and at some point sort() has to compare 3 against \"two\" — an int against a str. Python 3 refuses to guess: there's no meaningful answer to \"is 3 less than 'two'?\", so the comparison itself raises TypeError the instant it's attempted, and the whole sort() call crashes rather than quietly producing some arbitrary order. That's a deliberate design choice, not a missing feature — Python 2 used to invent a consistent-but-meaningless cross-type ordering, and Python 3 dropped it because a silently \"working\" sort over mismatched types is far more dangerous than a loud crash. (Equality is different: 3 == \"3\" is a perfectly legal comparison, it's just False — only ordering comparisons between incompatible types are a hard error.) The fix is to make every element comparable the same way, e.g. values.sort(key=str), which forces int and str alike through the same string comparison.",
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

/** Stage 4's sixth and final lesson page — four graded predict-the-value questions on sorting. */
export default function Sorting() {
  useDocumentTitle('Sorting')
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
        right={<Tag tone="accent">ALGORITHMS · SORTING</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 4 · DATA STRUCTURES &amp; ALGORITHMS
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Sorting
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          You already know sort() and sorted() sort things. These four are about the parts that
          bite people who stop there — what each one returns, what happens to ties, what key=
          actually does, and when Python simply refuses to guess. Predict what each snippet below
          does before picking an answer; you'll see whether you were right either way.
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
            slug="sorting"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
