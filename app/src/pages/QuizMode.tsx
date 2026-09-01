import { useState, type CSSProperties } from 'react'
import { TopNav } from '../components/TopNav'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

interface Question {
  topic: string
  text: string
  options: string[]
  correct: number
  why: string
}

const QUESTIONS: Question[] = [
  {
    topic: 'MENTAL MODEL',
    text: 'What does a git commit actually store?',
    options: [
      'A diff of the lines you changed',
      'A full snapshot of the tracked files at that moment',
      'Only the files you staged, forever detached from history',
      'A zip of your working directory',
    ],
    correct: 1,
    why: 'Git stores snapshots, not diffs. Each commit points to a complete tree; diffs are computed on demand.',
  },
  {
    topic: 'STAGING',
    text: 'You edited a file but git commit ignores it. Most likely cause?',
    options: [
      'The file is corrupt',
      'You never ran git add to stage the change',
      'The branch is locked',
      'Git only commits once per day',
    ],
    correct: 1,
    why: 'Commits record the staging area, not the working directory. Unstaged edits stay behind.',
  },
  {
    topic: 'BRANCHES',
    text: 'A branch in git is best described as…',
    options: [
      'A copy of the whole repository',
      'A movable pointer to a commit',
      'A separate folder on disk',
      'A backup created by GitHub',
    ],
    correct: 1,
    why: 'A branch is just a 41-byte pointer file. Creating one is instant because nothing is copied.',
  },
  {
    topic: 'UNDO',
    text: 'Which command un-stages a file without losing your edits?',
    options: [
      'git restore --staged file.txt',
      'git reset --hard',
      'git rm file.txt',
      'git checkout -- file.txt',
    ],
    correct: 0,
    why: 'restore --staged only pulls the file out of the index. reset --hard would destroy the edits.',
  },
  {
    topic: 'COLLABORATION',
    text: 'git pull is equivalent to…',
    options: [
      'git fetch then git merge',
      'git clone but faster',
      'git push in reverse, deleting remote commits',
      'git stash then git pop',
    ],
    correct: 0,
    why: 'pull = fetch (download new commits) + merge (weave them into your branch).',
  },
]

const LETTERS = ['A', 'B', 'C', 'D']
const PASS_MARK = 4

export default function QuizMode() {
  useDocumentTitle('Quiz Mode')

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<boolean[]>([])

  const done = index >= QUESTIONS.length
  const question = QUESTIONS[Math.min(index, QUESTIONS.length - 1)]
  const isCorrect = checked && selected === question.correct
  const score = results.filter(Boolean).length

  const check = () => {
    if (selected === null) return
    setChecked(true)
    setResults((r) => [...r, selected === question.correct])
  }

  const advance = (recordSkip: boolean) => {
    if (recordSkip) setResults((r) => [...r, false])
    setIndex((i) => i + 1)
    setSelected(null)
    setChecked(false)
  }

  const restart = () => {
    setIndex(0)
    setSelected(null)
    setChecked(false)
    setResults([])
  }

  /** Option colouring: green marks the right answer once checked, terracotta
   *  marks the one you picked, everything else dims out. */
  const optionStyles = (oi: number): { box: CSSProperties; badge: CSSProperties } => {
    let box: CSSProperties = {
      background: 'var(--color-neutral-100)',
      color: 'var(--color-text)',
      border: '2px solid var(--color-neutral-300)',
    }
    let badge: CSSProperties = {
      background: 'var(--color-neutral-300)',
      color: 'var(--color-neutral-700)',
    }

    if (!checked && selected === oi) {
      box = {
        background: 'var(--color-accent-100)',
        color: 'var(--color-accent-800)',
        border: '2px solid var(--color-accent)',
      }
      badge = { background: 'var(--color-accent)', color: 'var(--color-bg)' }
    }

    if (checked && oi === question.correct) {
      box = {
        background: 'var(--color-accent-2-100)',
        color: 'var(--color-accent-2-800)',
        border: '2px solid var(--color-accent-2-600)',
      }
      badge = { background: 'var(--color-accent-2-600)', color: 'var(--color-bg)' }
    } else if (checked && oi === selected) {
      box = {
        background: 'var(--color-accent-100)',
        color: 'var(--color-accent-800)',
        border: '2px solid var(--color-accent-600)',
        opacity: 0.85,
      }
      badge = { background: 'var(--color-accent-600)', color: 'var(--color-bg)' }
    } else if (checked) {
      box = { ...box, opacity: 0.5 }
    }

    return { box, badge }
  }

  const paletteColor = (pi: number) => {
    if (pi < results.length) return results[pi] ? 'var(--color-accent-2)' : 'var(--color-accent-600)'
    return pi === index ? 'var(--color-accent-300)' : 'var(--color-neutral-300)'
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
      <TopNav
        note="Page type · Quiz / checkpoint"
        right={
          <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }}>
            Exit quiz
          </button>
        }
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '44px 32px 80px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 15,
                color: 'var(--color-accent-700)',
              }}
            >
              Git Basics — Checkpoint
            </span>
            <span
              style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--color-neutral-700)' }}
            >
              Question {Math.min(index + 1, QUESTIONS.length)} of {QUESTIONS.length}
            </span>
          </div>

          {/* the answer palette doubles as the progress bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 34 }}>
            {QUESTIONS.map((q, pi) => (
              <div
                key={q.topic}
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 999,
                  background: paletteColor(pi),
                }}
              />
            ))}
          </div>

          {!done ? (
            <div
              className="card elev-md"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '30px 32px',
                animation: 'pop 0.25s ease',
              }}
            >
              <Tag tone="accent" style={{ marginBottom: 14, display: 'inline-flex', alignSelf: 'flex-start' }}>
                {question.topic}
              </Tag>
              <h1 style={{ fontSize: 26, lineHeight: 1.3, margin: '8px 0 22px' }}>
                {question.text}
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {question.options.map((text, oi) => {
                  const { box, badge } = optionStyles(oi)
                  return (
                    <button
                      key={text}
                      type="button"
                      onClick={() => !checked && setSelected(oi)}
                      aria-pressed={selected === oi}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        textAlign: 'left',
                        cursor: checked ? 'default' : 'pointer',
                        padding: '14px 16px',
                        borderRadius: 16,
                        fontFamily: 'var(--font-body)',
                        fontSize: 15,
                        lineHeight: 1.4,
                        ...box,
                      }}
                    >
                      <span
                        style={{
                          flex: 'none',
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12.5,
                          fontWeight: 700,
                          ...badge,
                        }}
                      >
                        {LETTERS[oi]}
                      </span>
                      <span>{text}</span>
                    </button>
                  )
                })}
              </div>

              {checked ? (
                <div
                  style={{
                    marginTop: 18,
                    padding: '14px 18px',
                    borderRadius: 16,
                    background: isCorrect
                      ? 'var(--color-accent-2-100)'
                      : 'var(--color-accent-100)',
                    animation: 'pop 0.25s ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: isCorrect
                        ? 'var(--color-accent-2-700)'
                        : 'var(--color-accent-700)',
                      marginBottom: 3,
                    }}
                  >
                    {isCorrect
                      ? 'Correct.'
                      : `Not quite — the answer is ${LETTERS[question.correct]}.`}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      color: 'var(--color-neutral-800)',
                    }}
                  >
                    {question.why}
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
                <button type="button" className="btn btn-ghost" onClick={() => advance(true)}>
                  Skip
                </button>
                {!checked ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={check}
                    disabled={selected === null}
                  >
                    Check answer
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={() => advance(false)}>
                    {index === QUESTIONS.length - 1 ? 'See results' : 'Next question'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className="card elev-lg"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '44px 40px',
                textAlign: 'center',
                animation: 'pop 0.3s ease',
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: 'var(--color-accent-2-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 26,
                    color: 'var(--color-accent-2-700)',
                  }}
                >
                  {score}/{QUESTIONS.length}
                </span>
              </div>
              <h1 style={{ fontSize: 30, margin: '0 0 10px', color: 'var(--color-accent-700)' }}>
                {score >= PASS_MARK ? 'Checkpoint passed!' : 'Worth another pass'}
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: 'var(--color-neutral-700)',
                  margin: '0 0 26px',
                  lineHeight: 1.6,
                }}
              >
                {score >= PASS_MARK
                  ? 'You have the git mental model down. Branching & Merging is unlocked.'
                  : `Review the snapshot model and staging area, then retry — you only need ${PASS_MARK} of ${QUESTIONS.length}.`}
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button type="button" className="btn btn-secondary" onClick={restart}>
                  Retry missed questions
                </button>
                <button type="button" className="btn btn-primary">
                  Next concept
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
