/**
 * Route `/glossary` — "JARGON DECODER" reference of coding terms (`TERMS`), each structured as
 * a plain-English definition plus either a "heard at work" / "what it's not" contrast pair or a
 * short code sample, never both (see the `Term` comment below). The alphabet strip (`GROUPS`) and
 * search box are real filters over `TERMS` — not a mock-up of one letter with the rest as
 * placeholder chrome. The term count badge and "showing N of M" line always reflect `TERMS.length`
 * rather than a fixed, aspirational number. Self-contained; not linked from another page.
 */
import { useState, type ReactNode } from 'react'
import { TopNav } from '../components/TopNav'
import { syn } from '../components/CodeListing'
import { Tag, type TagTone } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const mono = 'ui-monospace, Menlo, monospace'

/** One letter chip, or a compressed range chip, for the jump strip — and the real filter it applies. */
const GROUPS: { label: string; letters: string[] }[] = [
  { label: 'A', letters: ['A'] },
  { label: 'B', letters: ['B'] },
  { label: 'C', letters: ['C'] },
  { label: 'D', letters: ['D'] },
  { label: 'E–H', letters: ['E', 'F', 'G', 'H'] },
  { label: 'I–L', letters: ['I', 'J', 'K', 'L'] },
  { label: 'M–P', letters: ['M', 'N', 'O', 'P'] },
  { label: 'Q–T', letters: ['Q', 'R', 'S', 'T'] },
  { label: 'U–Z', letters: ['U', 'V', 'W', 'X', 'Y', 'Z'] },
]

/** One glossary entry: a definition plus either a heard-at-work/isNot pair or a code `sample`, never both. */
interface Term {
  term: string
  pronunciation: string
  tone: TagTone
  category: string
  definition: ReactNode
  /** Plain-text mirror of `definition`, for search — `definition` may carry JSX emphasis. */
  definitionText: string
  /** Either the two contrast panels, or a code sample — never both. */
  heardAtWork?: ReactNode
  isNot?: ReactNode
  sample?: ReactNode[]
}

// All 36 glossary entries, authored in alphabetical order so group/search filters need no re-sort.
const TERMS: Term[] = [
  {
    term: 'Algorithm',
    pronunciation: '/ˈæl.ɡə.rɪ.ðəm/',
    tone: 'neutral',
    category: 'COMPUTER SCIENCE',
    definition:
      "A precise, step-by-step recipe for turning an input into an output — sort this list, find the shortest path, check if this password matches. The code is one way of writing an algorithm down; the algorithm is the idea underneath it.",
    definitionText:
      "A precise, step-by-step recipe for turning an input into an output — sort this list, find the shortest path, check if this password matches. The code is one way of writing an algorithm down; the algorithm is the idea underneath it.",
    heardAtWork: '"That sort is O(n²) — there\'s a faster algorithm for this."',
    isNot: 'the code itself. The same algorithm can be written in any language, or even in plain English.',
  },
  {
    term: 'API',
    pronunciation: '/ˌeɪ piː ˈaɪ/ · Application Programming Interface',
    tone: 'accent',
    category: 'WEB',
    definition:
      'A menu of things one program lets other programs ask it to do. The menu says what you can order (endpoints), how to ask (requests), and what comes back (responses) — without showing you the kitchen.',
    definitionText:
      'A menu of things one program lets other programs ask it to do. The menu says what you can order (endpoints), how to ask (requests), and what comes back (responses) — without showing you the kitchen.',
    heardAtWork: '"Does the payments API have an endpoint for refunds?"',
    isNot: (
      <>
        a database, a server, or a website — those may sit <em>behind</em> an API.
      </>
    ),
  },
  {
    term: 'Argument',
    pronunciation: 'vs. parameter — the classic mix-up',
    tone: 'accent-2',
    category: 'LANGUAGE BASICS',
    definition: (
      <>
        The actual value you pass into a function when calling it. The <em>parameter</em> is the
        named slot in the function's definition; the <em>argument</em> is what fills it.
      </>
    ),
    definitionText:
      "The actual value you pass into a function when calling it. The parameter is the named slot in the function's definition; the argument is what fills it.",
    sample: [
      <>
        <span style={syn.kw}>def</span> <span style={syn.fn}>greet</span>(name):{'  '}
        <span style={syn.cm}># name = parameter</span>
      </>,
      <>
        <span style={syn.fn}>greet</span>(<span style={syn.str}>"Ada"</span>){'       '}
        <span style={syn.cm}># "Ada" = argument</span>
      </>,
    ],
  },
  {
    term: 'Async',
    pronunciation: 'asynchronous execution',
    tone: 'neutral',
    category: 'EXECUTION MODEL',
    definition:
      "Starting a slow job (network call, file read) and doing other work while it finishes, instead of standing still. Like ordering at a food truck and sitting down — the buzzer (callback/promise) tells you when it's ready.",
    definitionText:
      "Starting a slow job (network call, file read) and doing other work while it finishes, instead of standing still. Like ordering at a food truck and sitting down — the buzzer (callback/promise) tells you when it's ready.",
    heardAtWork: '"That endpoint is slow — make the fetch async so the UI doesn\'t freeze."',
    isNot: 'parallel. One cook can run async; parallel means more cooks.',
  },
  {
    term: 'Backend',
    pronunciation: "the server side of the app",
    tone: 'accent',
    category: 'ARCHITECTURE',
    definition:
      "The part of an app that runs on a server instead of in the user's browser — databases, business logic, authentication. The frontend is what you see; the backend is what decides what you're allowed to see.",
    definitionText:
      "The part of an app that runs on a server instead of in the user's browser — databases, business logic, authentication. The frontend is what you see; the backend is what decides what you're allowed to see.",
    heardAtWork: '"That validation needs to happen on the backend too — the frontend check alone isn\'t safe."',
    isNot: 'the database. A backend usually talks to a database, but the two are separate pieces.',
  },
  {
    term: 'Boolean',
    pronunciation: '/ˈbuːli.ən/ · named after George Boole',
    tone: 'neutral',
    category: 'LANGUAGE BASICS',
    definition:
      "A value that's only ever true or false — nothing in between. Used constantly for flags and conditions (isLoggedIn, hasError).",
    definitionText:
      "A value that's only ever true or false — nothing in between. Used constantly for flags and conditions (isLoggedIn, hasError).",
    sample: [
      <>
        <span style={syn.kw}>const</span> isLoggedIn = <span style={syn.kw}>true</span>
      </>,
      <>
        <span style={syn.kw}>if</span> (isLoggedIn) {'{ ... }'}
      </>,
    ],
  },
  {
    term: 'Branch',
    pronunciation: 'as in git branch',
    tone: 'accent-2',
    category: 'VERSION CONTROL',
    definition:
      "An independent line of work off the main history — you can experiment, commit, and even break things on a branch without touching main until you're ready to merge it back.",
    definitionText:
      "An independent line of work off the main history — you can experiment, commit, and even break things on a branch without touching main until you're ready to merge it back.",
    heardAtWork: '"Cut a branch for that fix so main stays deployable."',
    isNot: 'a copy of the repo. A branch is just a movable pointer at a commit — creating one is instant, not a file copy.',
  },
  {
    term: 'Callback',
    pronunciation: 'a function passed to run later',
    tone: 'accent',
    category: 'EXECUTION MODEL',
    definition:
      'A function you hand to another function so it can call it back once some work finishes — a click, a timer, a network response. The classic building block async code used before promises.',
    definitionText:
      'A function you hand to another function so it can call it back once some work finishes — a click, a timer, a network response. The classic building block async code used before promises.',
    sample: [
      <>
        button.<span style={syn.fn}>addEventListener</span>(<span style={syn.str}>'click'</span>,
        onClick)
      </>,
      <>
        <span style={syn.cm}>// onClick is the callback</span>
      </>,
    ],
  },
  {
    term: 'CLI',
    pronunciation: '/siː el aɪ/ · Command Line Interface',
    tone: 'neutral',
    category: 'TOOLING',
    definition:
      'A program you interact with by typing text commands into a terminal instead of clicking buttons — git, npm, and the terminal simulator on this site are all CLIs.',
    definitionText:
      'A program you interact with by typing text commands into a terminal instead of clicking buttons — git, npm, and the terminal simulator on this site are all CLIs.',
    heardAtWork: '"Is there a CLI flag for that, or do I have to click through the settings every time?"',
    isNot: 'the terminal itself. The terminal is the window; the CLI is the program running inside it.',
  },
  {
    term: 'Commit',
    pronunciation: 'a saved snapshot',
    tone: 'accent-2',
    category: 'VERSION CONTROL',
    definition:
      "A named, permanent snapshot of your project at one point in time, plus a message explaining why. Git's whole history is just a chain of commits, each pointing at the one before it.",
    definitionText:
      "A named, permanent snapshot of your project at one point in time, plus a message explaining why. Git's whole history is just a chain of commits, each pointing at the one before it.",
    heardAtWork: '"Commit early and often — small commits are easier to review and revert."',
    isNot: 'a save. Saving a file changes it on disk; committing records that exact state in history, with a message and an author.',
  },
  {
    term: 'Debugging',
    pronunciation: "finding out why it's wrong",
    tone: 'accent',
    category: 'TOOLING',
    definition:
      "The process of figuring out why code isn't doing what you expected — reading error messages, adding logging, stepping through line by line — as opposed to guessing and re-running.",
    definitionText:
      "The process of figuring out why code isn't doing what you expected — reading error messages, adding logging, stepping through line by line — as opposed to guessing and re-running.",
    heardAtWork: '"I spent an hour debugging before I noticed the typo in the variable name."',
    isNot: "just fixing typos. Most debugging time goes into figuring out *where* the bug is; fixing it is often the fast part.",
  },
  {
    term: 'Decorator Pattern',
    pronunciation: 'wrapping, not inheriting',
    tone: 'neutral',
    category: 'PATTERNS',
    definition:
      'A design pattern that adds behavior to an object by wrapping it in another object with the same interface, instead of subclassing it. Order toppings on a coffee without needing a new class for every combination.',
    definitionText:
      'A design pattern that adds behavior to an object by wrapping it in another object with the same interface, instead of subclassing it. Order toppings on a coffee without needing a new class for every combination.',
    sample: [
      <>
        <span style={syn.kw}>function</span> <span style={syn.fn}>withMilk</span>(coffee) {'{'}
      </>,
      <>
        {'  '}
        <span style={syn.kw}>return</span> {'{ ...coffee, price: coffee.price + 0.5 }'}
      </>,
      <>{'}'}</>,
    ],
  },
  {
    term: 'Dependency',
    pronunciation: "code you didn't write but rely on",
    tone: 'accent-2',
    category: 'TOOLING',
    definition:
      "A library or package your project needs to run — listed in package.json (or pom.xml, requirements.txt) so anyone else can install the exact same versions.",
    definitionText:
      "A library or package your project needs to run — listed in package.json (or pom.xml, requirements.txt) so anyone else can install the exact same versions.",
    heardAtWork: '"That dependency hasn\'t been updated in three years — worth checking for a replacement."',
    isNot: "a devDependency. Both are installed, but a devDependency (like a test runner) is only needed while building, not while running.",
  },
  {
    term: 'Endpoint',
    pronunciation: 'one specific thing an API can do',
    tone: 'accent',
    category: 'WEB',
    definition:
      'One specific URL-and-method combination an API exposes — GET /users/42 and POST /users are two different endpoints on the same API.',
    definitionText:
      'One specific URL-and-method combination an API exposes — GET /users/42 and POST /users are two different endpoints on the same API.',
    heardAtWork: '"Which endpoint returns the refund status?"',
    isNot: 'the whole API. An API is the full menu; an endpoint is one item on it.',
  },
  {
    term: 'Environment Variable',
    pronunciation: 'config that lives outside the code',
    tone: 'neutral',
    category: 'TOOLING',
    definition:
      'A named value set outside your source code — in the shell, a .env file, or a hosting dashboard — read at runtime so secrets and per-environment settings (API keys, database URLs) never get committed to the repo.',
    definitionText:
      'A named value set outside your source code — in the shell, a .env file, or a hosting dashboard — read at runtime so secrets and per-environment settings (API keys, database URLs) never get committed to the repo.',
    sample: [
      <>
        DATABASE_URL=<span style={syn.str}>postgres://localhost/dev</span>
      </>,
      <>
        <span style={syn.cm}>// read in code as process.env.DATABASE_URL</span>
      </>,
    ],
  },
  {
    term: 'Framework',
    pronunciation: 'vs. a library — who calls whom',
    tone: 'accent-2',
    category: 'ARCHITECTURE',
    definition:
      'A set of tools and rules that calls *your* code, rather than the other way around — React, Spring, and Vue are frameworks; you fit your code into the shape they expect.',
    definitionText:
      'A set of tools and rules that calls your code, rather than the other way around — React, Spring, and Vue are frameworks; you fit your code into the shape they expect.',
    heardAtWork: '"That\'s not really JavaScript\'s fault, it\'s how the framework expects components to be structured."',
    isNot: "a library. You call a library's functions when you need them; a framework calls your code on its own schedule (a lifecycle method, a route handler).",
  },
  {
    term: 'Git',
    pronunciation: '/ɡɪt/ · the tool, lowercase — GitHub is a hosted service for it',
    tone: 'accent',
    category: 'VERSION CONTROL',
    definition:
      'The version control system that tracks every change to a project as a chain of commits, so you can branch, merge, and go back to any earlier state. GitHub, GitLab, and Bitbucket all host Git repositories — they aren\'t Git itself.',
    definitionText:
      "The version control system that tracks every change to a project as a chain of commits, so you can branch, merge, and go back to any earlier state. GitHub, GitLab, and Bitbucket all host Git repositories — they aren't Git itself.",
    heardAtWork: '"Push your branch and open a PR — GitHub will run the checks."',
    isNot: "GitHub. Git works entirely offline on your machine; GitHub is one of several places to host a Git repo remotely.",
  },
  {
    term: 'HTTP',
    pronunciation: '/eɪtʃ tiː tiː piː/ · Hypertext Transfer Protocol',
    tone: 'neutral',
    category: 'WEB',
    definition:
      "The request/response protocol the web runs on — a client sends a method (GET, POST…) and a URL, a server sends back a status code and a body. HTTPS is the same protocol wrapped in TLS encryption.",
    definitionText:
      "The request/response protocol the web runs on — a client sends a method (GET, POST…) and a URL, a server sends back a status code and a body. HTTPS is the same protocol wrapped in TLS encryption.",
    sample: [
      <>
        GET <span style={syn.str}>/users/42</span> HTTP/1.1
      </>,
      <>
        <span style={syn.cm}>{'// → 200 OK, { "id": 42, "name": "Ada" }'}</span>
      </>,
    ],
  },
  {
    term: 'IDE',
    pronunciation: '/aɪ diː iː/ · Integrated Development Environment',
    tone: 'accent-2',
    category: 'TOOLING',
    definition:
      "An editor with the rest of the toolchain built in — a debugger, a compiler/interpreter hookup, refactoring tools, not just syntax highlighting. VS Code, IntelliJ, and PyCharm are all IDEs (or IDE-adjacent, depending who you ask).",
    definitionText:
      "An editor with the rest of the toolchain built in — a debugger, a compiler/interpreter hookup, refactoring tools, not just syntax highlighting. VS Code, IntelliJ, and PyCharm are all IDEs (or IDE-adjacent, depending who you ask).",
    heardAtWork: '"Just use the IDE\'s rename-symbol tool instead of find-and-replace — it won\'t touch unrelated matches."',
    isNot: "a text editor. A plain text editor shows you characters; an IDE understands the code well enough to jump to a definition or catch an error before you run it.",
  },
  {
    term: 'JSON',
    pronunciation: '/ˈdʒeɪ.sɒn/ · JavaScript Object Notation',
    tone: 'accent',
    category: 'DATA FORMAT',
    definition:
      "A lightweight, text-based way to represent structured data — objects, arrays, strings, numbers, booleans, null — that most languages can read and write, which is why it's the default format APIs send back.",
    definitionText:
      "A lightweight, text-based way to represent structured data — objects, arrays, strings, numbers, booleans, null — that most languages can read and write, which is why it's the default format APIs send back.",
    sample: [
      <>{'{'}</>,
      <>
        {'  '}
        <span style={syn.str}>"name"</span>: <span style={syn.str}>"Ada"</span>,{' '}
        <span style={syn.str}>"active"</span>: <span style={syn.kw}>true</span>
      </>,
      <>{'}'}</>,
    ],
  },
  {
    term: 'JWT',
    pronunciation: '/dʒɒt/ · JSON Web Token',
    tone: 'neutral',
    category: 'SECURITY',
    definition:
      "A signed, self-contained token that proves who a user is without the server needing to look anything up — the server checks the signature, not a session table. This app's backend issues one on sign-in and expects it on every request after.",
    definitionText:
      "A signed, self-contained token that proves who a user is without the server needing to look anything up — the server checks the signature, not a session table. This app's backend issues one on sign-in and expects it on every request after.",
    heardAtWork: '"The JWT expired — that\'s why every request is coming back 401 now."',
    isNot: "encrypted, by default. A JWT's payload is only base64-encoded, not encrypted — anyone can read it, they just can't forge a valid signature for it.",
  },
  {
    term: 'Key',
    pronunciation: 'as in a React list key, or an object key',
    tone: 'accent-2',
    category: 'LANGUAGE BASICS',
    definition:
      "In React, the stable identifier you give each item in a rendered list so React can track which DOM node belongs to which data across re-renders, instead of guessing by position.",
    definitionText:
      "In React, the stable identifier you give each item in a rendered list so React can track which DOM node belongs to which data across re-renders, instead of guessing by position.",
    sample: [
      <>
        items.<span style={syn.fn}>map</span>((item) {'=>'}
      </>,
      <>
        {'  '}
        {'<'}Item key={'{item.id}'} {'{...item}'} /{'>'}
      </>,
      <>)</>,
    ],
  },
  {
    term: 'Loop',
    pronunciation: 'for, while, do-while',
    tone: 'accent',
    category: 'LANGUAGE BASICS',
    definition:
      "Code that repeats a block of instructions until some condition stops it — over a fixed count (for), while a condition holds (while), or over every item in a collection (for...of/forEach).",
    definitionText:
      "Code that repeats a block of instructions until some condition stops it — over a fixed count (for), while a condition holds (while), or over every item in a collection (for...of/forEach).",
    heardAtWork: '"Don\'t nest three loops there — that\'s O(n³), a map would do it in one pass."',
    isNot: 'recursion, though the two often solve the same problems. A loop repeats in place; recursion has a function call itself.',
  },
  {
    term: 'Merge',
    pronunciation: "combining two branches' histories",
    tone: 'neutral',
    category: 'VERSION CONTROL',
    definition:
      "Bringing one branch's commits into another — usually a feature branch back into main once it's reviewed. Git tries to combine the changes automatically; a merge conflict is what happens when two branches touched the same lines and it can't guess which should win.",
    definitionText:
      "Bringing one branch's commits into another — usually a feature branch back into main once it's reviewed. Git tries to combine the changes automatically; a merge conflict is what happens when two branches touched the same lines and it can't guess which should win.",
    heardAtWork: '"Rebase your branch on main before merging — it\'ll keep the history linear."',
    isNot: "a rebase. A merge keeps both branches' commit history intact and adds a merge commit; a rebase rewrites your branch's commits to sit on top of the other one instead.",
  },
  {
    term: 'Object',
    pronunciation: 'a bundle of key/value pairs',
    tone: 'accent-2',
    category: 'LANGUAGE BASICS',
    definition:
      'A collection of named properties bundled together — user.name, user.email — as opposed to an array, which is an ordered list with no names, just positions.',
    definitionText:
      'A collection of named properties bundled together — user.name, user.email — as opposed to an array, which is an ordered list with no names, just positions.',
    sample: [
      <>
        <span style={syn.kw}>const</span> user = {'{ name: '}
        <span style={syn.str}>'Ada'</span>
        {', active: true }'}
      </>,
      <>
        user.name <span style={syn.cm}>// → "Ada"</span>
      </>,
    ],
  },
  {
    term: 'Parameter',
    pronunciation: 'vs. argument — the classic mix-up, see Argument',
    tone: 'accent',
    category: 'LANGUAGE BASICS',
    definition:
      'The named placeholder in a function\'s own definition — name in function greet(name) — that gets filled in by whatever argument the caller passes.',
    definitionText:
      "The named placeholder in a function's own definition — name in function greet(name) — that gets filled in by whatever argument the caller passes.",
    heardAtWork: '"That function takes three parameters now, might be time for an options object instead."',
    isNot: 'interchangeable with argument in careful usage, even though most people say them interchangeably in conversation. The parameter is the slot; the argument is what fills it — see Argument.',
  },
  {
    term: 'Promise',
    pronunciation: 'a placeholder for a future value',
    tone: 'neutral',
    category: 'EXECUTION MODEL',
    definition:
      "An object representing a value that isn't ready yet but will be — or will fail trying. .then() runs once it resolves, .catch() runs if it rejects; async/await is syntax sugar over exactly this.",
    definitionText:
      "An object representing a value that isn't ready yet but will be — or will fail trying. .then() runs once it resolves, .catch() runs if it rejects; async/await is syntax sugar over exactly this.",
    sample: [
      <>
        <span style={syn.fn}>fetch</span>(<span style={syn.str}>'/api/users'</span>)
      </>,
      <>
        {'  '}.<span style={syn.fn}>then</span>((res) {'=>'} res.<span style={syn.fn}>json</span>
        ())
      </>,
    ],
  },
  {
    term: 'Pull Request',
    pronunciation: 'PR, for short',
    tone: 'accent-2',
    category: 'VERSION CONTROL',
    definition:
      "A request to merge one branch into another, opened on GitHub/GitLab/etc. so someone can review the diff, leave comments, and run automated checks before it lands — the changes themselves already exist on the branch; the PR is the conversation about them.",
    definitionText:
      "A request to merge one branch into another, opened on GitHub/GitLab/etc. so someone can review the diff, leave comments, and run automated checks before it lands — the changes themselves already exist on the branch; the PR is the conversation about them.",
    heardAtWork: '"Open a PR once it\'s green locally — don\'t wait for it to be perfect, that\'s what review is for."',
    isNot: 'the same thing as a commit or a branch. A PR is a wrapper around a branch\'s commits, requesting they be merged — nothing about your code changes by opening one.',
  },
  {
    term: 'Query',
    pronunciation: 'asking a database (or an API) a question',
    tone: 'accent',
    category: 'DATA',
    definition:
      "A request for specific data — SELECT * FROM users WHERE active = true is a database query; ?sort=name in a URL is a query string doing something similar for an API.",
    definitionText:
      "A request for specific data — SELECT * FROM users WHERE active = true is a database query; ?sort=name in a URL is a query string doing something similar for an API.",
    sample: [
      <>
        <span style={syn.kw}>SELECT</span> * <span style={syn.kw}>FROM</span> users{' '}
        <span style={syn.kw}>WHERE</span> active = <span style={syn.kw}>true</span>
      </>,
    ],
  },
  {
    term: 'Regex',
    pronunciation: '/ˈreɪ.dʒɛks/ · regular expression',
    tone: 'neutral',
    category: 'SEARCH & TEXT',
    definition:
      String.raw`A pattern language for matching text — \d+ matches one or more digits, ^https?:// matches the start of a URL. Powerful and famously easy to write something that matches more, or less, than you meant.`,
    definitionText:
      String.raw`A pattern language for matching text — \d+ matches one or more digits, ^https?:// matches the start of a URL. Powerful and famously easy to write something that matches more, or less, than you meant.`,
    heardAtWork: '"Don\'t reinvent email validation with a regex — the edge cases are a career."',
    isNot: 'a full parser. Regex is good at finding patterns in text; it struggles badly with anything that needs to track nesting, like matching balanced parentheses or parsing HTML.',
  },
  {
    term: 'REST',
    pronunciation: '/rɛst/ · REpresentational State Transfer',
    tone: 'accent-2',
    category: 'WEB',
    definition:
      'A style for designing APIs around resources and HTTP verbs — GET /orders/9 reads order 9, DELETE /orders/9 removes it — rather than one endpoint per action. Most APIs called "REST" only follow some of the original rules, which is normal.',
    definitionText:
      'A style for designing APIs around resources and HTTP verbs — GET /orders/9 reads order 9, DELETE /orders/9 removes it — rather than one endpoint per action. Most APIs called "REST" only follow some of the original rules, which is normal.',
    heardAtWork: '"Let\'s keep this endpoint RESTful — a POST to /orders/9/cancel instead of a new /cancelOrder action."',
    isNot: "a protocol or a format. REST is a set of conventions on top of HTTP; it doesn't dictate JSON either, though that's the common pairing.",
  },
  {
    term: 'State',
    pronunciation: "data that changes over the app's lifetime",
    tone: 'accent',
    category: 'EXECUTION MODEL',
    definition:
      "Data a component or app remembers between renders — a form's current input, whether a modal is open, this app's own localStorage progress. Change the state, and whatever depends on it re-renders.",
    definitionText:
      "Data a component or app remembers between renders — a form's current input, whether a modal is open, this app's own localStorage progress. Change the state, and whatever depends on it re-renders.",
    sample: [
      <>
        <span style={syn.kw}>const</span> [count, setCount] = <span style={syn.fn}>useState</span>
        (0)
      </>,
      <>
        <span style={syn.fn}>setCount</span>(count + 1){' '}
        <span style={syn.cm}>// triggers a re-render</span>
      </>,
    ],
  },
  {
    term: 'Terminal',
    pronunciation: 'the window a CLI runs inside',
    tone: 'neutral',
    category: 'TOOLING',
    definition:
      'A text-based window for running commands and reading their output — the app you open (Terminal.app, Windows Terminal, a VS Code panel) that then runs a shell like bash or zsh inside it.',
    definitionText:
      'A text-based window for running commands and reading their output — the app you open (Terminal.app, Windows Terminal, a VS Code panel) that then runs a shell like bash or zsh inside it.',
    heardAtWork: '"Just run it from the terminal, it\'s faster than clicking through the GUI."',
    isNot: 'the shell. The terminal is the window; the shell (bash, zsh, PowerShell) is the program actually interpreting your commands inside it — see the CLI entry for a related distinction.',
  },
  {
    term: 'Unit Test',
    pronunciation: 'testing one small piece in isolation',
    tone: 'accent-2',
    category: 'TESTING',
    definition:
      'An automated test that checks one function or component in isolation, with everything around it faked or stubbed out, so a failure points at exactly one place instead of a vague "something broke."',
    definitionText:
      'An automated test that checks one function or component in isolation, with everything around it faked or stubbed out, so a failure points at exactly one place instead of a vague "something broke."',
    sample: [
      <>
        <span style={syn.fn}>test</span>(<span style={syn.str}>'add(2, 3) is 5'</span>, () {'=>'}{' '}
        {'{'}
      </>,
      <>
        {'  '}
        <span style={syn.fn}>expect</span>(<span style={syn.fn}>add</span>(2, 3)).
        <span style={syn.fn}>toBe</span>(5)
      </>,
      <>{'})'}</>,
    ],
  },
  {
    term: 'Variable',
    pronunciation: 'a named, reusable value',
    tone: 'accent',
    category: 'LANGUAGE BASICS',
    definition:
      "A named place to store a value so you can refer to it again — let and const declare one in JavaScript; const locks the binding so it can't be reassigned (though an object it points to can still be mutated).",
    definitionText:
      "A named place to store a value so you can refer to it again — let and const declare one in JavaScript; const locks the binding so it can't be reassigned (though an object it points to can still be mutated).",
    heardAtWork: '"That should be a const, not a let — nothing ever reassigns it."',
    isNot: "a constant in the mathematical sense. A JavaScript const variable can't be reassigned, but if it holds an object or array, that object's contents can still change.",
  },
  {
    term: 'Webhook',
    pronunciation: 'a callback, but over HTTP, between two servers',
    tone: 'neutral',
    category: 'WEB',
    definition:
      "A URL one service calls automatically when something happens on its end — a payment provider hitting your server's /webhooks/payment-succeeded the moment a charge clears, instead of you polling to ask.",
    definitionText:
      "A URL one service calls automatically when something happens on its end — a payment provider hitting your server's /webhooks/payment-succeeded the moment a charge clears, instead of you polling to ask.",
    heardAtWork: '"Register a webhook for that event instead of polling the API every minute."',
    isNot: 'a regular API endpoint you call. A webhook is the reverse — the other service initiates the request, into your server.',
  },
]

/** One "Heard at work" / "Not" tinted box inside a term card. */
function ContrastPanel({
  tone,
  label,
  children,
}: {
  tone: 'accent' | 'accent-2'
  label: string
  children: ReactNode
}) {
  return (
    <div
      style={{
        background: `var(--color-${tone}-100)`,
        borderRadius: 14,
        padding: '11px 14px',
        fontSize: 13,
        lineHeight: 1.5,
        color: `var(--color-${tone}-800)`,
      }}
    >
      <strong>{label}</strong> {children}
    </div>
  )
}

/** The Glossary page — a real search box and A–Z jump strip filtering `TERMS`. */
export default function Glossary() {
  useDocumentTitle('Glossary')
  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState(GROUPS[0].label)

  const q = query.trim().toLowerCase()
  const searching = q.length > 0
  const shown = searching
    ? TERMS.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definitionText.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.pronunciation.toLowerCase().includes(q),
      )
    : TERMS.filter((t) => GROUPS.find((g) => g.label === activeGroup)!.letters.includes(t.term[0].toUpperCase()))

  return (
    <div className="page">
      <TopNav
        note="Page type · Glossary / jargon decoder"
        right={<Tag tone="accent-2">{TERMS.length} TERMS</Tag>}
      />

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '48px 48px 110px' }}>
        <h1 style={{ fontSize: 42, margin: '0 0 10px', color: 'var(--color-accent-700)' }}>
          The jargon decoder
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--color-neutral-700)',
            maxWidth: 560,
            margin: '0 0 24px',
          }}
        >
          Every term gets three things: a plain-English definition, the sentence you'll actually hear
          at work, and what it is <em>not</em>.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: 'flex', gap: 12, marginBottom: 14 }}
        >
          <input
            className="input"
            type="search"
            placeholder="Search terms…"
            style={{ flex: 1 }}
            aria-label="Search terms"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 36 }}>
          {GROUPS.map((group) => {
            const active = !searching && group.label === activeGroup
            return (
              <button
                key={group.label}
                type="button"
                onClick={() => {
                  setActiveGroup(group.label)
                  setQuery('')
                }}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 13px',
                  borderRadius: 999,
                  background: active ? 'var(--color-accent)' : 'var(--color-neutral-100)',
                  color: active ? 'var(--color-bg)' : 'var(--color-neutral-700)',
                  fontSize: 13,
                  fontWeight: active ? 600 : undefined,
                  fontFamily: 'inherit',
                }}
              >
                {group.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: searching ? 28 : 56,
              color: 'var(--color-accent)',
              lineHeight: 1,
            }}
          >
            {searching ? 'Search results' : activeGroup}
          </span>
          <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }} aria-live="polite">
            {shown.length} of {TERMS.length} terms
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-neutral-300)' }} />
        </div>

        {shown.length === 0 ? (
          <p style={{ color: 'var(--color-neutral-700)', fontSize: 14.5 }}>
            No terms match "{query}".
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {shown.map((t) => (
              <div
                key={t.term}
                className="card"
                style={{ borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 10,
                    flexWrap: 'wrap',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 21 }}>{t.term}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
                    {t.pronunciation}
                  </span>
                  <Tag tone={t.tone} style={{ marginLeft: 'auto' }}>
                    {t.category}
                  </Tag>
                </div>

                <p
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.65,
                    color: 'var(--color-neutral-800)',
                    margin: '0 0 12px',
                  }}
                >
                  {t.definition}
                </p>

                {t.sample ? (
                  <div
                    style={{
                      background: 'var(--color-neutral-900)',
                      // The prototype set no colour here, so unstyled runs like
                      // "(name):" inherited body ink and vanished into the panel.
                      color: 'var(--color-neutral-100)',
                      borderRadius: 14,
                      padding: '12px 16px',
                      fontFamily: mono,
                      fontSize: 12.5,
                      lineHeight: 1.7,
                      overflowX: 'auto',
                    }}
                  >
                    {t.sample.map((line, i) => (
                      <div key={i} style={{ whiteSpace: 'pre' }}>
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-2" style={{ gap: 10 }}>
                    <ContrastPanel tone="accent-2" label="Heard at work:">
                      {t.heardAtWork}
                    </ContrastPanel>
                    <ContrastPanel tone="accent" label="Not:">
                      {t.isNot}
                    </ContrastPanel>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
