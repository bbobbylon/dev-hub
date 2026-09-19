# Dev Hub

A React implementation of the **Coding Learning App Redesign** handed off from Claude Design
(see `../README.md`, `../chats/`, and the `.dc.html` prototypes in `../project/`).

All 23 designed pages are implemented, plus the gallery that indexes them — and the progress the
mockups only depicted is now real. Three pages were added afterward, in the app's own style rather
than ported from a prototype:

- **Rebase & History** — the Roadmap mockup already named it as Version Control's fourth concept,
  but no design existed for it.
- **Shell Scripting** — CLI Basics' own concept sidebar listed it as `state: 'open'` (the state the
  component's doc comment defines as "reachable") but with no `to`, which the sidebar renders as a
  plain, unclickable label regardless of that state. It's now a real step-through lesson (walking
  `backup.sh` line by line, terminal output and variable values updating as you go), wired up from
  every place that named it: that sidebar, and the Roadmap's Stage 1 chip.
- **Variables** (`/python-variables`) — the Roadmap named Stage 3's first concept but the stage was
  entirely locked; it's now four graded predict-the-value questions, the first real page on the
  Python stage, with the other five concepts still honestly labelled "not built yet."
- **Control Flow** (`/control-flow`) — Stage 3's second real page, continuing straight on from
  Variables: the same four-question predict-the-value archetype, now on if/elif exclusivity,
  `range()`'s exclusive stop, `while`/`break`, and the truthiness of an empty list.
- **Functions** (`/functions`) — Stage 3's third real page: the same archetype again, now on a
  mutable default argument, keyword-argument reordering, a missing `return` (implicit `None`), and
  a closure that captures a loop's variable rather than its per-iteration value.
- **Collections** (`/collections`) — Stage 3's fourth real page: the same archetype once more, now
  on `b = a` aliasing a list instead of copying it, a tuple refusing the mutation a list would
  allow, a dict literal silently keeping only the last value for a repeated key, and a slice
  tolerating out-of-range bounds that plain indexing never would.
- **Errors** (`/errors`) — Stage 3's fifth real page: the same archetype once more, now on a
  `finally` block's own `return` silently overriding the value `try` already returned, a broad
  `except Exception:` swallowing an unrelated `TypeError` bug alongside the failure it was written
  to catch, a bare `except:` catching `SystemExit` (which `except Exception:` never would, since
  `SystemExit` inherits from `BaseException`), and an `except` clause ordered after a more general
  one that can now never run.
- **Files** (`/files`) — Stage 3's sixth and final real page: the same archetype once more, now on
  mode `"w"` truncating a file to zero bytes the instant it's *opened* rather than when something
  is actually written, a file object being a one-shot cursor (reading it a second time without
  `f.seek(0)` returns nothing rather than the same content again), binary mode handing back `bytes`
  instead of `str` (so `content == "OK"` is quietly `False`, never an error), and a `with` block's
  guaranteed close meaning the file object it named raises a real `ValueError` the instant code
  touches it again from outside the block. **This completes Stage 3** — all six of its originally
  placeholder concepts (Variables, Control Flow, Functions, Collections, Errors, Files) are now
  real, graded lessons; nothing on the Roadmap reads "not built yet" for it anymore.
- **Arrays** (`/arrays`) — Stage 4's first real page, on a new stage ("Data Structures &
  Algorithms") rather than a Stage 3 continuation: the same archetype once more, now on
  `[[0] * 3] * 3` building a "2D array" whose three rows secretly share one underlying list by
  reference rather than being independent copies, `.remove()`ing from a list while a `for` loop is
  still walking it (which desyncs the loop's index cursor from the shrinking list and silently
  skips elements, unlike a dict or set, which would raise `RuntimeError`), negative indexing being
  bounded exactly like positive indexing (`arr[-len(arr) - 1]` is a real `IndexError`, not an
  infinite wrap), and a string being an *immutable* array of characters — readable by index, never
  writable by index. Unlike every Stage 3 round, this one needed a real `Roadmap.tsx` change, not
  just a data change: Stage 4 had never had a dedicated "some built, some not" block the way Stage
  3 did, so it gained one (see that file's own comments for what changed and why).
- **Hash Maps** (`/hash-maps`) — Stage 4's second real page: the same archetype once more, now on
  an unhashable key (a `list`) raising `TypeError` where a tuple would work fine — the flip side of
  `Collections`' own tuple-immutability question, since a tuple's immutability is exactly what
  makes it hashable — `[]` lookup demanding a key exist and raising `KeyError` where `.get()` would
  quietly return `None`, mutating a dict mid-iteration raising a real `RuntimeError` the moment its
  size changes (the direct contrast with Arrays' own list-mutation question, where a list has no
  such guard and just silently desyncs), and the insertion-order guarantee a dict has carried as a
  real language feature since Python 3.7. Needed zero `Roadmap.tsx` changes — Stage 4's dedicated
  block, from Arrays' own round, already handles however many real concepts `conceptsInStage(4)`
  returns.
- **Stacks & Queues** (`/stacks-queues`) — Stage 4's third real page: the same archetype once
  more, now on `list.pop(0)` quietly costing O(n) — every remaining element has to shift left,
  which is why a "queue" built from a plain list silently degrades as it grows, while
  `list.append()`/`list.pop()` at the *other* end stay genuinely O(1) — `collections.deque` fixes
  the front-end cost with `popleft()`; `deque(maxlen=N)` silently dropping the oldest element once
  full instead of growing or raising, the entire point of `maxlen` but a dangerous default if you
  expected an error; `append()` + `pop()` giving a stack (LIFO) where `append()` + `popleft()`
  gives a queue (FIFO) — the classic stack-vs-queue mixup, and neither call raises anything to
  catch it; and popping an empty structure raising a real `IndexError: pop from empty list`,
  contrasted with the safe `while stack:` draining pattern the same snippet demonstrates correctly
  one line earlier. Also needed zero `Roadmap.tsx` changes.
- **Trees** (`/trees`) — Stage 4's fourth real page, and the first genuinely recursive structure
  on the path: the same archetype once more, now on in-order traversal (left, node, right)
  producing sorted output for a BST — the same tree in pre-order gives a completely different
  sequence — a recursive `height()` with no base case for `None` raising `AttributeError` on the
  simplest possible input, a single leaf, rather than overflowing the stack (the single most
  common bug in a first tree-recursion function); inserting already-sorted values into a BST
  degenerating it into a straight right-leaning chain, an O(log n) structure silently becoming
  O(n) with no error to announce it; and a BST search trusting an ordering invariant it never
  checks, so a tree built without maintaining that invariant returns a confidently wrong `False`
  for a value that's really there. Also needed zero `Roadmap.tsx` changes — Stage 4's dedicated
  block keeps proving out generic enough for the rest of the stage.
- **Big-O** (`/big-o`) — Stage 4's fifth real page, and the first one to teach the vocabulary
  every prior lesson was already speaking rather than a structure's own behavior: the same
  archetype once more, but predicting a complexity class instead of a printed value, now on
  `x in a_list` walking element by element (O(n)) versus `x in a_set` computing one hash and
  jumping straight to a bucket (O(1)) — the same hash-table mechanism Hash Maps' own
  unhashable-list question ran into from the opposite side; two nested loops multiplying their
  costs rather than adding them, so a function built from two individually-ordinary-looking `for`
  loops is O(n²), not O(n); string concatenation inside a loop being O(n²) in total because a
  Python `str` is immutable and every `+=` copies everything accumulated so far into a new string,
  contrasted with `''.join()`'s genuinely O(n) single pass — the same string immutability Arrays'
  own indexing question already established, now shown to have a second, costlier consequence; and
  `list.sort()` being O(n log n) as a near-universally memorized rule with a real, narrow exception
  — Timsort's actual best case is O(n) on input that's already one sorted run, which an
  already-sorted list always is. Also needed zero `Roadmap.tsx` changes — the third consecutive
  round confirming it. Not to be confused with `/big-o-performance`, a separate static reference
  page linked from Stage 4's "related" list, not this graded lesson.
- **Sorting** (`/sorting`) — Stage 4's sixth and final real page: the same archetype once more,
  now on `list.sort()` mutating in place and returning `None` — not the sorted list — so the
  classic `x = nums.sort()` bug leaves `x` empty while `nums` really is sorted, contrasted with
  `sorted()`'s genuinely new list; sort *stability* (two elements that tie under the sort key keep
  their original relative order, which is what makes a "sort by A, then stably sort by B"
  multi-key technique work); `key=` transforming what's compared without ever touching the actual
  values, contrasted with the real, surprising default — Python compares strings by raw code
  point, so every capital letter sorts before every lowercase one, not dictionary order; and
  sorting a list with genuinely incomparable types (`int` and `str` together) raising `TypeError`
  outright rather than silently guessing an order. Big-O's own fourth question already covered
  `.sort()`'s O(n log n) bound (and Timsort's O(n) best case on already-sorted input), so this
  round deliberately stayed on behavior, not cost. **This completes Stage 4** — all six of its
  originally placeholder concepts (Arrays, Hash Maps, Stacks & Queues, Trees, Big-O, Sorting) are
  now real, graded lessons; nothing on the Roadmap reads "not built yet" for it anymore, the third
  stage (after Stage 1/2 and Stage 3) to reach that state. Fixed a real staleness bug found while
  wiring this in: `Roadmap.tsx`'s own stage-4 JSX comment had read "one real concept built
  (Arrays, item 35)" through four rounds of "zero Roadmap.tsx changes" — true for the file's logic,
  never true for that comment after item 36. Corrected it the same way Stage 3's analogous comment
  was corrected when it completed at item 34.
- **HTTP** (`/http`) — Stage 5's first real page, on a new stage ("APIs & Databases") and the
  path's first step off pure Python: no snippet to run, just a request (or two) and the real HTTP
  rule that decides the outcome, three of the four questions landing on a status code rather than
  a printed value. `PUT` being idempotent — resending an identical request changes nothing further,
  which is exactly why it's safe to retry automatically and `POST` isn't; `401 Unauthorized` (no
  identity to check at all — log in) vs `403 Forbidden` (a known identity the server still says no
  to) — a mix-up `/api-anatomy`'s own status strip labels but never explains; `PUT` silently
  deleting fields a client didn't resend, because `PUT` replaces the *entire* resource rather than
  merging in what was sent — the real data-loss bug `PATCH` exists to prevent; and HTTP's
  statelessness — a login a few seconds ago buys a follow-up request nothing unless it carries its
  own proof (a cookie, a token), because the protocol has no memory between requests at all.
  Deliberately skipped the bare verb-to-purpose mapping and 2xx/4xx/5xx families — `/api-anatomy`'s
  wire-dump-and-decoder-strip already covers that ground as reference material. This is also the
  round that graduates Stage 5 out of `Roadmap.tsx`'s fully-locked path and into its own dedicated
  block, the same restructuring `Arrays.tsx` did for Stage 4 at item 35 — except this time, since
  Stage 5 was the *last* stage that could ever need the locked-stage machinery (`LockedTag`,
  `NumberNode`'s locked state, `syllabusOf`), that machinery was removed outright rather than left
  in place rendering nothing. Stages 3-5's near-identical block shape was extracted into a real
  `PartialStage` component at the same time — the file's own comment had named "stage 5 needs the
  same shape too" as the exact trigger to do that, back when it was written at item 35.

## Beyond the mockups

The designs showed a learner's progress as fixed numbers: a 4-day streak, 8 of 23 concepts, a
hardcoded minutes chart. Nothing was recorded, so a refresh erased everything. `src/lib/progress.ts`
makes it true — a small localStorage store, shared across tabs via the `storage` event. It has no
notion of a server or an account itself; an *optional* cross-device sync layer sits outside it (see
"Optional account sync" below), so the app is still fully usable, and still a $0 static deploy, with
no backend at all.

- **Quiz scores persist**, accumulating a personal best across attempts; passing a checkpoint marks
  the concept complete.
- **Flashcards run real spaced repetition** (SM-2, trimmed to the three ratings the deck offers).
  A session studies only what's actually due and then *ends*, instead of looping on the last card.
  The "due today" and "mastered" counts are computed, not decorative.
- **Milestones persist** on the capstone brief.
- **Concepts are completed, not assumed** — `src/data/concepts.ts` registers all 33 concepts the
  app teaches, and every lesson page ends with a `<ConceptComplete>` panel that records one. Pages
  with a real finishing moment (a walkthrough stepped to its end, tests run green, the quick quiz
  aced) record it themselves; the static field-guide pages offer a button instead, and any completed
  panel offers "Un-mark complete" so a mis-click costs nothing (it used to take a full progress
  reset). The Roadmap's chips, stage badges and totals are all derived from that record.
- **The Progress Dashboard reads live data** — streak, hours this week, concepts completed, quiz
  accuracy, the 14-day minutes chart and the completion donut all derive from real activity.
- **Time on page is tracked** in coarse ticks while the tab is visible, which is what makes the
  streak and the chart honest.
- **Search works.** The Dev Hub's search box was decorative; it now filters the catalog, and the
  gallery gained a filter across all 35 archetypes. Both have empty states.
- **A global command palette** (Cmd/Ctrl+K, `src/components/CommandPalette.tsx`) jumps straight to
  any page from anywhere — the gallery's own filter only ever helped once you were already there.
  Built on the handoff's own `.dialog`/`.dialog-backdrop` classes, which no page had used until now.
- **Unknown URLs get a 404 page** instead of silently redirecting to the gallery.
- **Progress can be exported, restored, or reset** from the dashboard's "Your data" panel. Export
  hands you a dated `dev-hub-progress-YYYY-MM-DD.json`; import reads one back, validating it field
  by field (`src/lib/progressFile.ts`) and refusing anything malformed by name rather than crashing
  the page. That's a backup/restore path that needs no account and no backend — the same blob
  `progressSync.ts` would move for you, moved by hand.

## Optional account sync

`/sign-in` and `/sign-up` talk to a separate Spring Boot backend (`../server/`) if — and only if —
the app was built with `VITE_API_BASE_URL` set. With no backend configured (the normal case for the
GitHub Pages deploy), **those routes don't exist**: `App.tsx` doesn't register them, so they fall
through to the 404 page, and `TopNav` hides its "Sign in" link. A build with no backend behind it
never offers a form that could only fail on submit. `scripts/routes.mjs` reads the same variable, so
the verification suites expect the two routes only when a build would have them; export
`VITE_API_BASE_URL` for both the build and the verify run, or for neither.

Signed in, `src/lib/progressSync.ts` pulls the account's saved progress once (server's copy wins,
overwriting local — there's no per-field merge) and pushes local changes back, debounced, on every
change after that. `src/lib/auth.tsx` holds the account/token in `localStorage`
(`dev-hub.auth.v1`, separate from the progress key), and `src/lib/api.ts` is the thin fetch layer
both use. See `../server/README.md` for the backend's endpoints, and `../BACKLOG.md` for what's
still open (conflict-free merge on sign-in, actual hosting for the backend, etc.).

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run preview    # serve the build on :4173
```

## Verifying it

Four Playwright suites, all run against a preview server on port 4173:

```bash
npm run build            # verify runs against dist/, not npm run dev
npm run verify           # routes + responsive + interactions + a11y
```

`npm run verify` starts and owns its own preview server (`--strictPort`, so a
stale one left over from an earlier session fails loudly instead of silently
serving from the wrong port) and tears it down when the suites finish. Run an
individual suite on its own — `npm run verify:routes`, `audit:a11y`, etc. —
and you're back to starting `npm run preview &` yourself first.

- `verify:routes` — loads all 39 routes, asserting each renders real content, has an `<h1>`,
  logs no console errors, and doesn't overflow horizontally.
- `verify:responsive` — re-checks every route at 390 / 768 / 1280px for horizontal overflow, and
  names the offending elements when it finds any. The breakpoints in `app.css` were written from
  reasoning about each layout; this is what holds them honest.
- `verify:interactions` — drives every page that carried state in the prototypes (quiz flow and
  scoring, flashcard flip/rate, sort stepping, regex matching, terminal mission, hint reveal,
  decorator cost arithmetic, walkthrough gating, milestone checklist, test runner, the progress
  backup round trip) and asserts the ported behaviour matches.
- `audit:a11y` — contrast, accessible names and focus, checked against a recorded baseline. See
  **Accessibility** below for why it's baselined rather than pass/fail.

They block outbound requests, so the Google Fonts link is not fetched during verification. The
running app still loads Caprasimo and Figtree normally.

There's also a content-fidelity audit — a reviewing aid rather than a test, so it isn't part of
`npm run verify`:

```bash
npm run audit:content    # needs no server
```

It pulls every substantial run of prose out of each `.dc.html` prototype and checks it survived
into the corresponding React source. It currently reports **5 phrases to review, all known
extractor artifacts**, not omissions:

- Two CLI Basics entries are the prototype's flat clipboard payload strings. Here those are derived
  from the `CodeLine` arrays via `commandsOf()`, so the copy exists line by line rather than as one
  blob. The payloads are asserted byte-for-byte against the prototype in `verify:interactions`.
- One Quiz Mode entry is a sentence that's now a template literal (`you only need ${PASS_MARK} of
  ${QUESTIONS.length}`). The rendered wording is asserted in `verify:interactions`.
- One Page Gallery entry is the prototype's original archetype count. The prototype is a frozen
  snapshot that will always say "20"; the gallery's own lede is deliberately kept current as
  archetypes are added on top of the original 23 (21 once Rebase & History shipped, 22 once Shell
  Scripting had too, 23 once Variables had — that one's bump went missing at the time, caught while
  adding Control Flow — 24 once Control Flow shipped, 25 once Functions had, 26 once Collections
  had, 27 once Errors had, 28 once Files had, 29 once Arrays had, 30 once Hash Maps had, 31 once
  Stacks & Queues had, 32 once Trees had, 33 once Big-O had, 34 once Sorting had, 35 now that HTTP
  has) — see `PAGES.length` in `data/pages.ts` for the number that's actually true.
- One Code Playground entry is the prototype's hardcoded "ran the program" output line. Here it's
  the real stdout captured from actually running `SOURCE_JS` in a sandboxed Web Worker (BACKLOG
  item 9), not a copied string — it happens to compute to the exact same text, but a static text
  search can't see that. Asserted byte-for-byte against the prototype in `verify:interactions`,
  same as the CLI Basics entries above.

If that count rises *beyond* this, something was dropped — go read what it flags.

### Accessibility

```bash
npm run audit:a11y       # needs the preview server
```

Checks WCAG text contrast, accessible names on every control, and reports what it finds — then
compares the result against `scripts/a11y-baseline.json` and fails only on a **regression**.

**Passing:** every interactive control has an accessible name (0 unnamed), keyboard focus draws the
design system's 2px accent ring on all of them, and tab order follows the visual order.

**Contrast:** muted body text was promoted from the `-500`/`-600` ramp steps to `-700`, applying
the design system's own rule — *"for paragraph-size text in the accent use a deep ramp step rather
than the accent itself"* — to the neutral ramp, which the prototypes had not done. That took the
audit from 137 failures across 51 colour pairs down to **31 across 18**, with zero new failures
introduced (verified by diffing the failure sets before and after). It reads **39 across 20** today:
the pages added since that pass brought their own inherited pairs with them (Shell Scripting alone
accounts for 7 of the reported lines), and none of them have been through the same treatment.

**Why it's baselined.** Those 39 are inherited and accepted, so a plain pass/fail could only ever
say "fail" — and a check that can never pass is one nobody can gate on. That's precisely how the
count drifted 31 → 39 unnoticed: the script was correct, it just wasn't in `npm run verify` and
couldn't be. `scripts/a11y-baseline.json` records the accepted set, and the audit now fails on:

- a contrast pair that isn't in the baseline,
- a rise in the *total* failure count with no new pair — which is the "new page repeats an
  already-accepted bad pair" case, the one that actually happened, or
- any unnamed interactive control at all (that count is 0 and stays 0).

Fixing something never fails; it prints a nudge to re-record. Re-record deliberately with
`npm run audit:a11y -- --update-baseline`, which leaves a reviewable diff — not to turn a red run
green. The standing content work is to put the newer pages through the same `-700` ramp treatment
the original pass applied, and shrink the baseline as that lands.
Tokens on dark grounds — the
terminal, code panes, gutters — were deliberately left alone, since darkening them would *reduce*
contrast.

Measured against the two light grounds, the ramp splits cleanly at step 700:

| token | on `--color-bg` | on `--color-surface` | body text (4.5:1) |
| --- | --- | --- | --- |
| `neutral-500` | 2.42:1 | 2.15:1 | fails |
| `neutral-600` | 3.61:1 | 3.21:1 | fails |
| `neutral-700` | 5.53:1 | 4.92:1 | passes |
| `accent` | 3.03:1 | 2.69:1 | fails |
| `accent-700` | 5.72:1 | 5.09:1 | passes |
| `accent-2-600` | 3.53:1 | 3.14:1 | fails |
| `accent-2-700` | 5.43:1 | 4.82:1 | passes |

**What remains, and why it wasn't changed:** the surviving pairs (19 now — the Roadmap page's
"Continue" button was later wired up from a dead `<button>` into a real `.btn-primary` link, adding
one more instance of the same tradeoff) are the accent fill itself — cream-on-terracotta primary
buttons, `.btn-ghost` accent text, accent-tinted labels on accent panels, and the terminal's
accent-on-dark. They measure 2.7–3.9:1, which is precisely the ~3:1 the Organic guide says the
accent pair is tuned to ("enough for icons, large text and interface chrome, not for body copy").
Clearing them means changing the accent colour itself — a brand decision, not a porting one.

## How it's organised

```
src/
  styles/organic.css   Verbatim copy of the handoff design system's stylesheet — the
                       source of truth for every colour, font, space, radius and shadow.
  styles/app.css       App layer: page chrome, grids, responsive rules, keyframes.
                       Reads only from the tokens above.
  components/          Shared chrome lifted out of the prototypes (see below).
  data/                Page content extracted from the prototypes as typed data.
  pages/               One component per designed page.
  data/pages.ts        The page registry — drives both the gallery and the route table.
```

### Components

| Component | What it is |
| --- | --- |
| `TopNav` | The sticky bar every page carries; the brand mark routes back to the gallery. |
| `Aside` | The Head First tinted aside — icon, kicker, question, body. Used by six pages. |
| `ConceptSidebar` | The lesson rail with done / current / locked states. |
| `SectionHead` | The kicker + heading pair that opens each concept section. |
| `CodeListing` | Dark editor pane with a filename, line numbers, and `syn` syntax roles. |
| `CopyPanel` | Dark cheat-sheet column with a working copy button. |
| `ImageSlot` | Placeholder for artwork not yet supplied (the video poster frame). |
| `Icon` | Lucide paths at stroke-width 2.75, per the design system. |
| `ui.tsx` | `Tag`, `Code`, `Meter`. |
| `useDocumentTitle` | Names the tab after the page, restores on unmount. |

Every page composes its own chrome directly rather than through a page-shell component. That was
tried and dropped: each design wants a different nav, hero and column layout, so the shell earned
nothing and hid what each page actually does.

### Proving a refactor changed nothing

`scripts/snapshot.mjs` full-page-screenshots every route and compares hashes, so a refactor can be
shown to be visually neutral rather than assumed to be:

```bash
node scripts/snapshot.mjs .snapshots/before
# …refactor…
node scripts/snapshot.mjs .snapshots/after
node scripts/snapshot.mjs --compare .snapshots/before .snapshots/after
```

It disables animations before capturing so frames are comparable. The `Aside` consolidation above
was verified this way: 24/24 pixel-identical.

## Notes on the port

- The prototypes are Claude Design canvas artboards: content wrapped in `<x-dc>`/`<helmet>`, with
  interactivity expressed as a `class Component extends DCLogic` plus `<sc-if>` / `<sc-for>`
  template bindings resolved at runtime by `support.js`. None of that scaffolding survives here —
  each state machine was re-expressed with React hooks, preserving the observable behaviour.
- The three earliest pages (Dev Hub, CLI Basics, Decorator Pattern) inlined their own copy of the
  design tokens under shorter names (`--accent` rather than `--color-accent`). The values were
  identical to the design system's, so everything now reads from `organic.css`.
- Two colours the Organic ramps don't cover — the sand used for string literals and the amber
  terminal traffic light — are defined once in `app.css` as `--code-string` / `--color-amber`.
- Two pages had no `<h1>` in the prototype. Flashcards now promotes its deck name; Terminal
  Simulator carries a visually hidden one. Neither changes the rendered design.
- `CLI Basics` keeps the labelled mount point for the user's existing step-by-step playthrough
  component, as the design intends.
- `Video Lesson`'s poster frame now has a real `src` (`src/assets/recursion-poster.svg`, drawn from
  the app's own design tokens) — it's no longer the empty `ImageSlot` placeholder flagged in the
  design session.
