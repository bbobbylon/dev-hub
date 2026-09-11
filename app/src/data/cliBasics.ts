/**
 * Content data for `pages/CliBasics.tsx` only — the flagship lesson page,
 * extracted out of the component so the JSX stays about layout. Nothing
 * here is shared with other pages; `ShellScripting.tsx` (which sits in the
 * same sidebar group) keeps its own local copies of similarly-shaped data
 * instead of importing from here.
 */
import type { CodeLine } from '../components/CopyPanel'
import type { SidebarGroup } from '../components/ConceptSidebar'

// This page's lesson rail. Shell Scripting renders the same three groups (it
// sits in "Terminal & Shell" too) from its own local copy rather than this
// one, so the two must be kept in sync by hand if a group/item changes.
export const SIDEBAR: SidebarGroup[] = [
  {
    title: 'Terminal & Shell',
    items: [
      { label: 'CLI Basics', state: 'current' },
      { label: 'Shell Scripting', state: 'open', to: '/shell-scripting' },
      { label: 'Environment Variables', state: 'locked' },
    ],
  },
  {
    title: 'Version Control',
    items: [
      { label: 'Git Basics', state: 'locked' },
      { label: 'Branching & Merging', state: 'locked' },
    ],
  },
  {
    title: 'Data Structures',
    items: [
      { label: 'Arrays & Lists', state: 'locked' },
      { label: 'Hash Maps', state: 'locked' },
    ],
  },
]

/** The three parts of `ls -la /var/log` the anatomy clicker lets you inspect. */
export type AnatomyKey = 'command' | 'flags' | 'args'

/** Explanation shown when a given token of the sample command is clicked. */
export const ANATOMY: Record<AnatomyKey, { token: string; label: string; text: string }> = {
  command: {
    token: 'ls',
    label: 'Command',
    text: "ls is the command — it tells the shell which program to run. Here, 'list directory contents'.",
  },
  flags: {
    token: '-la',
    label: 'Flags',
    text: '-la are flags that modify behavior: -l = long format (permissions, size, date), -a = include hidden files.',
  },
  args: {
    token: '/var/log',
    label: 'Argument',
    text: '/var/log is the argument — the thing the command acts on. Here, which directory to list.',
  },
}

/** Left-to-right click order the anatomy clicker steps through. */
export const ANATOMY_ORDER: AnatomyKey[] = ['command', 'flags', 'args']

/** The four numbered "why bother with a CLI" cards. */
export const WHY_CLI = [
  {
    n: '01',
    title: 'Many tools are CLI-only',
    body: 'Most CI/CD pipelines, Docker, Kubernetes, cloud CLIs (az, aws, gcloud), and deployment scripts are CLI-based.',
  },
  {
    n: '02',
    title: 'Automation',
    body: "If you can do something in the CLI, you can script it. Click-based UIs can't be scripted.",
  },
  {
    n: '03',
    title: 'Remote access',
    body: "When you SSH into a server, there's no GUI — you only have a CLI.",
  },
  {
    n: '04',
    title: 'Speed',
    body: 'Experienced developers navigate and manipulate files faster in the CLI than in any file browser.',
  },
]

/** The "essential commands" reference table, grouped by category. */
export const COMMAND_GROUPS: { title: string; commands: { name: string; blurb: string }[] }[] = [
  {
    title: 'Navigation',
    commands: [
      { name: 'pwd', blurb: 'Where am I?' },
      { name: 'ls / dir', blurb: "What's here?" },
      { name: 'cd', blurb: 'Change directory' },
    ],
  },
  {
    title: 'File operations',
    commands: [
      { name: 'cat / type', blurb: 'Show file contents' },
      { name: 'mkdir', blurb: 'Create directory' },
      { name: 'rm / del', blurb: 'Delete' },
      { name: 'cp / copy', blurb: 'Copy' },
      { name: 'mv / move', blurb: 'Rename / move' },
    ],
  },
  {
    title: 'Power tools',
    commands: [
      { name: 'grep', blurb: 'Search in files' },
      { name: 'find', blurb: 'Find files' },
      { name: '| and man', blurb: 'Chain commands · read the manual' },
    ],
  },
]

/** First cheat-sheet `CopyPanel`: Bash commands. */
export const BASH_LINES: CodeLine[] = [
  { text: 'pwd', comment: '# print working directory' },
  { text: 'ls -la', comment: '# -l=long, -a=all (hidden too)' },
  { text: 'cd /var/log', comment: '# absolute path' },
  { text: 'cd ..', comment: '# up one level' },
  { text: 'cd ~/projects', comment: '# ~ = home directory' },
  { comment: '# create / delete:' },
  { text: 'mkdir -p a/b/c', comment: '# -p = parents, no error if exists' },
  { text: 'rm -rf ./build', comment: '# DANGER: no undo!' },
  { text: 'touch file.txt', comment: '# create / touch a file' },
  { text: 'cp -r src/ dest/', comment: '# -r = recursive' },
  { text: 'mv old.txt new.txt', comment: '# rename / move' },
  { comment: '# view contents:' },
  { text: 'cat file.txt', comment: '# whole file' },
  { text: 'less file.txt', comment: '# page through (q to quit)' },
  { text: 'head -20 file.txt', comment: '# first 20 lines' },
]

/** Second cheat-sheet `CopyPanel`: the same operations in PowerShell. */
export const PS_LINES: CodeLine[] = [
  { text: 'Get-Location', comment: '# = pwd' },
  { text: 'Get-ChildItem -la', comment: '# = ls -la' },
  { text: 'Set-Location path', comment: '# = cd' },
  { comment: '# create / delete:' },
  { text: 'New-Item -ItemType Directory -Force a/b/c', comment: '# mkdir -p' },
  { text: 'Remove-Item -Recurse -Force ./build', comment: '# rm -rf' },
  { text: 'New-Item -ItemType File file.txt', comment: '# touch' },
  { text: 'Copy-Item -Recurse src/ dest/', comment: '# cp -r' },
  { text: 'Move-Item old.txt new.txt', comment: '# mv' },
  { comment: '# view contents:' },
  { text: 'Get-Content file.txt', comment: '# cat' },
  { text: 'Get-Content file.txt -Head 20', comment: '# head -20' },
  { text: 'Get-Content app.log -Wait', comment: '# tail -f' },
  { text: '(Get-Content file.txt).Count', comment: '# wc -l' },
  { comment: '# find / search:' },
  { text: 'Get-ChildItem -Recurse -Filter "*.java"', comment: '# find' },
  { text: 'Select-String "spring" app.log', comment: '# grep' },
]

/** Third cheat-sheet `CopyPanel`: pipes, redirection, and exit codes in both shells. */
export const PIPES_LINES: CodeLine[] = [
  { comment: "# pipes: one command's output → next's input" },
  { text: 'ls -l | grep ".java"', comment: '# only .java files' },
  { text: 'cat app.log | grep ERROR | head -10', comment: '# first 10 errors' },
  { text: 'ps aux | grep "spring" | wc -l', comment: '# count matches' },
  { comment: '# redirection:' },
  { text: 'echo "hello" > file.txt', comment: '# overwrite' },
  { text: 'echo "world" >> file.txt', comment: '# append' },
  { text: 'mvn test 2>errors.txt', comment: '# stderr to file' },
  { text: 'mvn test >out.txt 2>&1', comment: '# both streams' },
  { comment: '# exit codes (critical for CI/CD):' },
  { text: 'ls /var/log; echo "exit: $?"', comment: '# $? in Bash' },
  // Quoted for contrast with Bash's $? — not part of the copyable snippet.
  { text: '$LASTEXITCODE', comment: '# in PowerShell', displayOnly: true },
  { text: 'mvn clean install && docker build .', comment: '# docker only if mvn succeeded' },
]

export interface QuizQuestion {
  question: string
  options: string[]
  /** Index into `options` of the right answer. */
  correct: number
  /** Shown after answering, right or wrong. */
  explanation: string
}

/** The three-question checkpoint quiz at the end of CLI Basics. */
export const QUIZ: QuizQuestion[] = [
  {
    question: 'Which command shows your current directory?',
    options: ['pwd', 'ls', 'cd', 'cat'],
    correct: 0,
    explanation: 'pwd — "print working directory" — always answers "where am I?"',
  },
  {
    question: 'You run a command and get exit code 2. What does that mean?',
    options: [
      'It succeeded',
      'It failed — 2 identifies the kind of error',
      "It's still running",
      'Nothing, exit codes are cosmetic',
    ],
    correct: 1,
    explanation:
      '0 is the only success code. Any non-zero code signals failure, and CI/CD pipelines watch for it.',
  },
  {
    question: 'What does ls -l | grep ".java" do?',
    options: [
      'Lists files, then filters to ones matching ".java"',
      'Deletes all .java files',
      'Renames .java files',
      'Counts folders',
    ],
    correct: 0,
    explanation:
      "The pipe (|) sends ls -l's output into grep, which filters it down to matching lines.",
  },
]

export interface WalkStep {
  /** The task the learner is asked to accomplish before revealing the command. */
  instruction: string
  command: string
  /** The terminal output shown once the step is revealed. */
  output: string
  /** One-line explanation of why the command works. */
  explain: string
}

/** The four-step guided walkthrough that closes out the concept section. */
export const WALKTHROUGH: WalkStep[] = [
  {
    instruction: 'Where am I?',
    command: 'pwd',
    output: '/home/dev',
    explain: 'Always start by getting your bearings.',
  },
  {
    instruction: "What's in here?",
    command: 'ls -la',
    output: 'drwxr-xr-x  app  logs  README.md  .env',
    explain: 'ls -la shows everything, including hidden files like .env.',
  },
  {
    instruction: 'Find every .log file on the system',
    command: 'find / -name "*.log"',
    output: '/var/log/syslog\n/var/log/app/error.log\n/var/log/nginx/access.log',
    explain: 'find searches the whole tree for anything matching the pattern.',
  },
  {
    instruction: 'Now filter to files over 10MB and count them',
    command: 'find /var -name "*.log" -size +10M | wc -l',
    output: '3',
    explain:
      "The pipe chains find's matches straight into wc -l, which counts lines instead of printing them.",
  },
]
