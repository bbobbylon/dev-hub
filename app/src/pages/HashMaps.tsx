/**
 * Route `/hash-maps` — Stage 4's second real lesson ("Data Structures & Algorithms"), continuing
 * straight on from `/arrays`: four predict-the-value/predict-the-behavior questions (`QUESTIONS`)
 * on dict-specific gotchas Python's friendly `{}` syntax hides — a mutable key (a `list`) raising a
 * real `TypeError` because dict keys must be hashable, which is exactly the flip side of
 * `Collections.tsx`'s own tuple-immutability question (immutability isn't just "protected from
 * change," it's what *makes* a tuple usable as a dict key at all); `[]` lookup demanding the key
 * exist and raising `KeyError` the instant it doesn't, where `.get()` would have quietly returned
 * `None`; mutating a dict mid-iteration raising a real `RuntimeError` the moment its size changes —
 * the direct, deliberate contrast with `Arrays.tsx`'s own `.remove()`-during-a-`for`-loop question,
 * where a *list* has no such guard and just silently desyncs instead; and the insertion-order
 * guarantee Python's dict has carried as a real language feature since 3.7, not the "unordered bag"
 * a lot of people still assume it is. The design's own six-item Stage 4 syllabus spelled this one
 * lower-case, "Hash maps", as one placeholder string; the built page titles it "Hash Maps", Title
 * Case, like every other multi-word built label on the site (`Control Flow` drew the exact same
 * distinction — see `data/curriculum.ts`'s own doc comment for both).
 *
 * Same archetype as every Stage 3 lesson and `Arrays.tsx` on purpose (predict-then-reveal question
 * cards, `CodeListing` snippets, a running score, a "try again" reset, `<ConceptComplete>` at the
 * pass mark) — this round needed no `Roadmap.tsx` change at all, unlike `Arrays.tsx`: Stage 4's own
 * dedicated block, the widened `Concept.stage` type, and `nextUp`'s extended search are all already
 * in place from item 35, so adding a second Stage 4 concept is exactly as mechanical as a Stage 3
 * round was. `earned` fires once the learner has scored at or above the pass mark, same rule as
 * every lesson before it.
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
    filename: 'unhashable.py',
    code: [
      { content: <>key = [1, 2]</> },
      { content: <>cache = {'{}'}</> },
      {
        content: (
          <>
            cache[key] = <span style={syn.str}>"result"</span>
          </>
        ),
      },
    ],
    prompt: 'What happens when this runs?',
    options: [
      "{[1, 2]: 'result'}",
      "TypeError: unhashable type: 'list'",
      'cache[str([1, 2])] is created instead',
    ],
    correct: 1,
    explain:
      "Dict keys have to be hashable — Python needs a stable hash value to know which bucket a key lives in, and something that can change after the fact (like a list) can't safely provide one: mutate the list later and its hash would change, and the dict would never be able to find it again. Lists are mutable, so they're explicitly unhashable, and Python refuses the assignment outright with TypeError: unhashable type: 'list' rather than quietly accepting a key that could go stale. A tuple, though — cache[(1, 2)] = \"result\" — works perfectly, because the same immutability Collections' point[0] = 5 question tested (a tuple can't change after it's created) is exactly what makes a tuple safe to hash.",
  },
  {
    filename: 'missing.py',
    code: [
      {
        content: (
          <>
            scores = {'{'}
            <span style={syn.str}>"alice"</span>: 90, <span style={syn.str}>"bob"</span>: 85
            {'}'}
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(scores[<span style={syn.str}>"carol"</span>])
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: ['None', "KeyError: 'carol'", '0'],
    correct: 1,
    explain:
      "Square-bracket access demands the key exist — scores[\"carol\"] doesn't quietly hand back None or a default, it raises KeyError: 'carol' the instant the key isn't found. If you want a fallback instead of a crash, reach for scores.get(\"carol\") (returns None, or a second argument you supply, like scores.get(\"carol\", 0)), or check \"carol\" in scores first. [] is for when you're sure the key is there; .get() is for when you're not — mixing them up is how a lookup that should degrade gracefully instead takes the whole page down.",
  },
  {
    filename: 'shrink.py',
    code: [
      {
        content: (
          <>
            scores = {'{'}
            <span style={syn.str}>"a"</span>: 1, <span style={syn.str}>"b"</span>: 2,{' '}
            <span style={syn.str}>"c"</span>: 3{'}'}
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>for</span> key <span style={syn.kw}>in</span> scores:
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>if</span> scores[key] == 2:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>del</span> scores[key]
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(scores)
          </>
        ),
      },
    ],
    prompt: 'What does this actually do?',
    options: [
      "{'a': 1, 'c': 3}",
      'RuntimeError: dictionary changed size during iteration',
      "{'a': 1, 'b': 2, 'c': 3} — del silently fails inside a loop",
    ],
    correct: 1,
    explain:
      "Python actively tracks a dict's size while you're iterating over it, and the moment del scores[key] shrinks it mid-loop, the very next step of iteration notices the mismatch and raises RuntimeError: dictionary changed size during iteration — loud and immediate. That's the opposite of what a plain list does in the exact same situation (Arrays' own for n in nums: nums.remove(n) question): a list has no such guard, so it just silently desyncs and skips elements instead of ever complaining. A dict fails loud, a list fails quiet — which, ironically, makes the dict version the easier bug to actually catch. The safe fix is the same either way: loop over a copy — for key in list(scores): — or collect the keys to delete first and remove them after the loop ends.",
  },
  {
    filename: 'insertion.py',
    code: [
      { content: <>d = {'{}'}</> },
      {
        content: (
          <>
            d[<span style={syn.str}>"z"</span>] = 1
          </>
        ),
      },
      {
        content: (
          <>
            d[<span style={syn.str}>"a"</span>] = 2
          </>
        ),
      },
      {
        content: (
          <>
            d[<span style={syn.str}>"m"</span>] = 3
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(<span style={syn.fn}>list</span>(d.keys()))
          </>
        ),
      },
    ],
    prompt: 'What does this print?',
    options: [
      "['z', 'a', 'm'] — insertion order, unchanged",
      "['a', 'm', 'z'] — dicts sort their keys alphabetically",
      'Some unpredictable order — dicts never guarantee an order',
    ],
    correct: 0,
    explain:
      "Since Python 3.7, a dict is guaranteed to remember insertion order — a real language feature, not an implementation quirk you're not supposed to rely on. The keys come back exactly in the order they were first added: \"z\", then \"a\", then \"m\", never re-sorted and never scrambled. This trips up anyone who learned that hash maps have no defined order (true of many other languages, and true of Python's own dict before 3.6/3.7) — modern Python's dict behaves closer to \"an ordered mapping that also hashes\" than a bag of pairs in arbitrary order. If you genuinely need sorted keys, you still have to ask for that explicitly — sorted(d.keys()) — insertion order and sorted order are not the same guarantee.",
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

/** Stage 4's second lesson page — four graded predict-the-value questions on dict behavior. */
export default function HashMaps() {
  useDocumentTitle('Hash Maps')
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
        right={<Tag tone="accent">DATA STRUCTURES · HASH MAPS</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 4 · DATA STRUCTURES &amp; ALGORITHMS
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Hash Maps
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          A Python dict looks like a friendly set of labeled boxes, but a few of its behaviors
          only make sense once you know it's really a hash table underneath: what's allowed as a
          key, what happens when a lookup misses, and how it reacts to being changed out from
          under a loop. Predict what each snippet below does before picking an answer; you'll see
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
            slug="hash-maps"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
