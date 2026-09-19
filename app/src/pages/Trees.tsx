/**
 * Route `/trees` — Stage 4's fourth real lesson ("Data Structures & Algorithms"), continuing
 * straight on from `/stacks-queues`. A bigger conceptual jump than any lesson before it: every
 * prior Stage 3/4 concept was a flat sequence or mapping, and a tree is Python's first genuinely
 * *recursive* structure on this path — there's no built-in tree type, so every question defines
 * its own minimal `Node` class, the same way any two real scripts about trees would. Four
 * predict-the-value/predict-the-behavior questions (`QUESTIONS`): in-order traversal (left, node,
 * right) producing sorted order for a BST, where a differently-ordered traversal on the exact same
 * tree would produce a different sequence entirely (the explanation draws the pre-order contrast
 * rather than spending a second question re-testing the same "order changes the output" mechanism
 * a different way); a recursive height() with no base case for `None` raising `AttributeError` on
 * the simplest possible input, a single leaf — the single most common bug in a first tree-recursion
 * function; inserting already-sorted values into a BST degenerating it into a straight chain, an
 * O(log n) structure silently becoming O(n) with no error to announce it, which is why real-world
 * BSTs rebalance themselves and a plain one doesn't promise to; and a BST search trusting an
 * ordering invariant it never actually checks, so a tree built without maintaining that invariant
 * gives a confidently *wrong* negative — not a crash, not an obviously-broken answer, just a value
 * that's really there, silently unreachable by the one search path that assumes it wouldn't be.
 * Deliberately did not spend a full question on "mutating a node's children mid-traversal" (one of
 * the coordinator's own candidates) — every clean version tried either wasn't actually buggy (both
 * swap-then-recurse and recurse-then-swap invert a tree correctly) or needed enough scaffolding to
 * set up a real bug that it would have taught less per word than the invariant-violation angle
 * above, which reaches a genuinely surprising, verifiable wrong answer in four honest lines.
 *
 * Same archetype as every lesson before it (predict-then-reveal question cards, `CodeListing`
 * snippets, a running score, a "try again" reset, `<ConceptComplete>` at the pass mark) — and, like
 * `HashMaps.tsx`/`StacksQueues.tsx`, this round needed no `Roadmap.tsx` change: Stage 4's dedicated
 * block already covers however many real concepts `conceptsInStage(4)` returns. `earned` fires once
 * the learner has scored at or above the pass mark, same rule as every lesson before it.
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
    filename: 'traverse.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>class</span> Node:
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>def</span> __init__(self, val, left=
            <span style={syn.kw}>None</span>, right=<span style={syn.kw}>None</span>):
          </>
        ),
      },
      { content: <>{'        '}self.val = val</> },
      { content: <>{'        '}self.left = left</> },
      { content: <>{'        '}self.right = right</> },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>def</span> inorder(node):
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>if</span> node <span style={syn.kw}>is</span>{' '}
            <span style={syn.kw}>None</span>:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>return</span> []
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>return</span> inorder(node.left) + [node.val] +
            inorder(node.right)
          </>
        ),
      },
      { content: <></> },
      { content: <>tree = Node(2, Node(1), Node(3))</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(inorder(tree))
          </>
        ),
      },
    ],
    prompt: 'What does print(inorder(tree)) show?',
    options: ['[2, 1, 3]', '[1, 2, 3]', '[1, 3, 2]'],
    correct: 1,
    explain:
      "In-order traversal visits left, then the node itself, then right — for this tree (2, with left child 1 and right child 3), that's 1, then 2, then 3: [1, 2, 3]. That's not a coincidence for a binary search tree specifically — in-order traversal always produces the values in sorted order for a valid BST, which is exactly why it's the traversal you reach for when you need sorted output. Swap it for pre-order (node, then left, then right) on this exact same tree and you'd get [2, 1, 3] instead — the node's own value first, not sandwiched in the middle. Same tree, same three values, a completely different sequence, purely from when you choose to visit the node relative to its children.",
  },
  {
    filename: 'base_case.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>class</span> Node:
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>def</span> __init__(self, val, left=
            <span style={syn.kw}>None</span>, right=<span style={syn.kw}>None</span>):
          </>
        ),
      },
      { content: <>{'        '}self.val = val</> },
      { content: <>{'        '}self.left = left</> },
      { content: <>{'        '}self.right = right</> },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>def</span> height(node):
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>return</span> 1 + <span style={syn.fn}>max</span>(height(node.left),
            height(node.right))
          </>
        ),
      },
      { content: <></> },
      { content: <>leaf = Node(5)</> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(height(leaf))
          </>
        ),
      },
    ],
    prompt: 'What happens when this runs?',
    options: [
      '1',
      'RecursionError: maximum recursion depth exceeded',
      "AttributeError: 'NoneType' object has no attribute 'left'",
    ],
    correct: 2,
    explain:
      "height() never checks for the empty case — every recursive tree function needs a base case for None (an empty subtree), because a leaf node's own children are None, not more nodes. Calling height(leaf) immediately calls height(node.left), which is height(None) — and once inside that call, node.left blows up on the very first line: None has no left attribute at all. It never even gets deep enough to overflow the stack, which is what a RecursionError would need; it fails one level down, on the very next call. The fix is one line at the top: if node is None: return 0, before node.left or node.right is ever touched — the single most common bug in a first tree-recursion function, and often the very first error a beginner sees on this topic.",
  },
  {
    filename: 'degenerate.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>class</span> Node:
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>def</span> __init__(self, val):
          </>
        ),
      },
      { content: <>{'        '}self.val = val</> },
      {
        content: (
          <>
            {'        '}self.left = <span style={syn.kw}>None</span>
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}self.right = <span style={syn.kw}>None</span>
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>def</span> insert(root, val):
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>if</span> root <span style={syn.kw}>is</span>{' '}
            <span style={syn.kw}>None</span>:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>return</span> Node(val)
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>if</span> val &lt; root.val:
          </>
        ),
      },
      { content: <>{'        '}root.left = insert(root.left, val)</> },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>else</span>:
          </>
        ),
      },
      { content: <>{'        '}root.right = insert(root.right, val)</> },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>return</span> root
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            root = <span style={syn.kw}>None</span>
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>for</span> x <span style={syn.kw}>in</span> [1, 2, 3, 4, 5]:
          </>
        ),
      },
      { content: <>{'    '}root = insert(root, x)</> },
    ],
    prompt: 'What shape does this tree end up with after inserting 1 through 5 in order?',
    options: [
      'A balanced tree, minimal depth',
      'A straight right-leaning chain — every node has only a right child, five deep',
      "Python automatically rebalances it, so the shape depends on how it's printed",
    ],
    correct: 1,
    explain:
      "Each new value — 2, then 3, then 4, then 5 — is always greater than everything already in the tree, so insert() always recurses right, never left. Every node ends up with a right child and no left child at all. The result isn't really a tree anymore in any useful sense; it's a straight chain five nodes long wearing a tree's clothing. Searching it now costs O(n), not the O(log n) a balanced tree promises, because there's no branching left to skip half the remaining nodes at each step. This is exactly why real-world BSTs (AVL trees, red-black trees, and the like) rebalance themselves after every insert — a plain BST like this one makes no such promise, and sorted (or nearly sorted) input is the worst case that breaks it.",
  },
  {
    filename: 'invariant.py',
    code: [
      {
        content: (
          <>
            <span style={syn.kw}>class</span> Node:
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>def</span> __init__(self, val, left=
            <span style={syn.kw}>None</span>, right=<span style={syn.kw}>None</span>):
          </>
        ),
      },
      { content: <>{'        '}self.val = val</> },
      { content: <>{'        '}self.left = left</> },
      { content: <>{'        '}self.right = right</> },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}># left child (8) is NOT less than 5 — the BST rule is already broken</span>
        ),
      },
      { content: <>tree = Node(5, Node(8), Node(2))</> },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.kw}>def</span> bst_search(node, target):
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>if</span> node <span style={syn.kw}>is</span>{' '}
            <span style={syn.kw}>None</span>:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>return</span> <span style={syn.kw}>False</span>
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>if</span> node.val == target:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>return</span> <span style={syn.kw}>True</span>
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>if</span> target &lt; node.val:
          </>
        ),
      },
      {
        content: (
          <>
            {'        '}
            <span style={syn.kw}>return</span> bst_search(node.left, target)
          </>
        ),
      },
      {
        content: (
          <>
            {'    '}
            <span style={syn.kw}>return</span> bst_search(node.right, target)
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            <span style={syn.fn}>print</span>(bst_search(tree, 8))
          </>
        ),
      },
    ],
    prompt: 'What does print(bst_search(tree, 8)) show?',
    options: [
      'True — bst_search finds every value in the tree',
      'False — 8 is in the tree, but on the wrong side to ever be found',
      'True, but it takes two extra recursive calls to find it',
    ],
    correct: 1,
    explain:
      "bst_search doesn't check every node — it trusts the BST invariant (everything in a node's left subtree is smaller, everything in its right subtree is larger) and only ever goes one direction at each step. That's what makes a balanced BST search O(log n) instead of O(n): it skips half the remaining tree every time, without ever looking at it. But this tree was built without actually maintaining that invariant — Node(8) was placed as the left child of 5, even though 8 is bigger, not smaller. bst_search(tree, 8) compares 8 to 5, decides \"bigger, go right\" (correctly, by its own rule), and goes right — straight past the 8 sitting on the left, which it will never look at again. The value is really there, in the tree, but bst_search returns False anyway: not a crash, not a wrong-looking answer, just a confidently wrong one. Binary search of any kind — on a tree or a sorted array — only works when the invariant it's trusting actually holds.",
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

/** Stage 4's fourth lesson page — four graded predict-the-value questions on tree behavior. */
export default function Trees() {
  useDocumentTitle('Trees')
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
        right={<Tag tone="accent">DATA STRUCTURES · TREES</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 4 · DATA STRUCTURES &amp; ALGORITHMS
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Trees
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          Every structure so far has been flat — a sequence or a mapping. A tree is recursive: a
          node is just a value plus two more trees, and that one idea is where all four of these
          gotchas come from. Predict what each snippet below does before picking an answer; you'll
          see whether you were right either way.
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
            slug="trees"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
