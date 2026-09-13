/**
 * The Git Basics checkpoint's question bank — the one thing `pages/QuizMode.tsx` and
 * `pages/ProgressDashboard.tsx` both need. `QuizMode` renders it and grades attempts against it;
 * the dashboard's "up next" queue reads `QUIZ_ID` and `PASS_MARK` to say whether the checkpoint
 * still needs taking, retaking, or is just worth revisiting, without a second copy of either
 * literal drifting from the one `QuizMode` actually grades against.
 *
 * Not shared with any other quiz — the app has exactly one built checkpoint (`TOTAL_CHECKPOINTS`
 * in `data/curriculum.ts` documents why the other thirteen the design names aren't built here).
 */

/** One multiple-choice quiz question, its options, and the explanation shown after checking. */
export interface Question {
  topic: string
  text: string
  options: string[]
  correct: number
  why: string
}

// Key this attempt is recorded and looked up under in progress state, and in `state.concepts`.
export const QUIZ_ID = 'git-basics'

// Minimum correct answers (out of QUESTIONS.length) to pass the checkpoint.
export const PASS_MARK = 4

// The Git Basics question bank, rendered one at a time in the question card.
export const QUESTIONS: Question[] = [
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
