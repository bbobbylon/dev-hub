/**
 * Route `/deploy` — Stage 5's sixth and final lesson ("APIs & Databases"), and the last concept in
 * the entire five-stage designed path (item 46). Everything before this taught how to build a
 * correct app; this one is the gap between "it works on my machine" and "it's live for real users,"
 * which is where some of the most expensive mistakes actually happen. Checked for overlap first,
 * the same discipline every Stage 5 round before this one has used: `grep`ped `ApiAnatomy.tsx` for
 * "deploy"/"environment"/"secret"/"runtime"/"container"/"rolling"/"migration" — zero hits, so
 * nothing here repeats it. `Glossary.tsx` already has an `Environment Variable` entry ("A named
 * value set outside your source code… read at runtime so secrets… never get committed to the
 * repo"), and `data/concepts.ts` has an off-path Stage-1 `environment-variables` concept with no
 * lesson page — both are real, but both are the shell-level basics (`export FOO=bar`, "don't commit
 * secrets"), not this lesson's actual ground: what happens to an env var specifically inside a
 * *frontend build tool*, and what actually happens to traffic and data during a deploy. Neither
 * conflicts with this lesson; the first question below turns the Glossary's own "read at runtime"
 * claim into something that's only true for half of what people call an "environment variable" —
 * without contradicting it.
 *
 * **Four predict-the-outcome questions (`QUESTIONS`), each verified by tracing the real mechanism
 * through, not assumed — the standing rule this whole round was built under.** They're a deliberate
 * two-part arc, not four unrelated facts, the same shape every Stage 5 lesson before this one used:
 * **Q1 and Q2 share one mechanism, looked at from two angles.** Q1: a `VITE_`-prefixed variable in
 * this app's own build tool isn't read at runtime the way a shell export is — Vite statically
 * substitutes every `import.meta.env.VITE_*` reference with a literal string *at build time* (the
 * same static-replace idea as webpack's `DefinePlugin`; Vite's own docs say it outright — `.env`
 * values prefixed `VITE_` "will be part of… the client bundle" and must never be treated as secret).
 * So a secret key put there doesn't stay out of the client just because "it's an environment
 * variable, not a git commit" — it ends up as plain text inside `dist/assets/*.js`, shipped to
 * every visitor, openable in dev tools with no login and no breach required. Q2 takes that same
 * static-substitution fact and asks the question a step later: once that value is baked into the
 * built files, does changing the *source* variable and just restarting the server pick it up? No —
 * restarting a static file server re-serves the same bytes; only a fresh `npm run build` re-runs the
 * substitution. This is grounded in the app's own real code, not a hypothetical: `lib/api.ts`
 * (`export const API_BASE = import.meta.env.VITE_API_BASE_URL`) and `.github/workflows/
 * deploy-pages.yml` (which never sets it, which is exactly why `App.tsx`'s own comment says
 * `/sign-in` 404s on the live GitHub Pages build) are the real files this question's scenario is
 * built from. The contrast that makes both questions land: a genuine *runtime* env var — a backend
 * process reading `process.env.DATABASE_URL` — really is re-read fresh whenever that process starts,
 * so restarting *that* (not a static file server) picks up a change with no rebuild at all. "Bakes
 * at build, reads at run" is the one sentence worth keeping.
 *
 * **Q3 and Q4 share a second mechanism, also looked at from two angles.** Q3: a deploy is not an
 * atomic swap. A rolling/blue-green rollout starts the new instance *alongside* the old one, waits
 * for a readiness probe before routing new traffic to it, and gives the old instance a grace period
 * (SIGTERM + a drain window — `terminationGracePeriodSeconds` is the literal Kubernetes name for it)
 * to finish requests it already accepted before it's actually killed — so an in-flight request on the
 * old version keeps running to completion, unaffected by the new version coming up beside it. Q4
 * uses that exact fact directly, the same way Auth's own Q4 reused its Q2's signing fact: if old and
 * new code briefly run *at the same time* against *the same database* during that rollout window,
 * a migration has to work for both versions at once, not just the one shipping it. A hard
 * `RENAME COLUMN` breaks the old version outright the instant it runs — every request routed to an
 * instance still running the old code errors for as long as the rollout takes to finish replacing
 * it. The real fix (expand/contract: add the new column first, ship code that tolerates both, drop
 * the old column only in a *later* deploy once nothing references it) is the direct, constructive
 * answer to the failure Q3 explains the mechanism for.
 *
 * Same archetype as every lesson before it (predict-then-reveal question cards, `CodeListing`
 * snippets, a running score, a "try again" reset, `<ConceptComplete>` at the pass mark), and, like
 * every Stage 5 round since HTTP, needed no `Roadmap.tsx` *logic* change — only its two comments
 * (the file's top-of-file note and the JSX comment above the stage-5 `PartialStage` call), since
 * `PartialStage` is fully derived from `conceptsInStage(5)` and `UPCOMING_STAGES`'s `n: 5` entry:
 * removing `'Deploy'` from that entry's `concepts` array — the array itself, not just the prose
 * describing it — is the entire wiring change that page needs, and it's also what finally empties
 * every stage's `concepts` array on the whole page (stage 3 and 4 already sit at `[]`), so the
 * page's aggregate "not built yet" text goes to true, *permanent* zero: there is no stage 6 in a
 * five-stage path, so nothing can ever add another one back. `filename`s here are `.sh` — a deploy
 * transcript, a new code-listing convention for genuinely new content the same call `/sql-basics`
 * made switching from `.http` to `.sql`; every scenario below really is a terminal/log transcript,
 * not a request or a query. `syn.kw` colors the command itself (`npm`, `kubectl`, `psql`), `syn.fn`
 * colors the subcommand/flag, `syn.str` colors quoted values and file paths, and `syn.cm` carries
 * each scenario's own `#` scene-setting and the log/output lines — the exact role split `/http`'s own
 * build note assigned them, ported to a new file type. `earned` fires once the learner has scored at
 * or above the pass mark, same rule as every lesson before it.
 */
import { useState } from 'react'
import { TopNav } from '../components/TopNav'
import { CodeListing, syn, type ListingLine } from '../components/CodeListing'
import { Icon } from '../components/Icon'
import { Tag } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'
import { ConceptComplete } from '../components/ConceptComplete'

/** One predict-the-outcome question: a deploy transcript, three choices, and the real reasoning either way. */
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
    filename: 'leaked-secret.sh',
    code: [
      {
        content: (
          <span style={syn.cm}>
            # .env — a frontend project, same shape as this one (Vite + React)
          </span>
        ),
      },
      {
        content: (
          <>
            <span style={syn.fn}>VITE_STRIPE_SECRET_KEY</span>=
            <span style={syn.str}>sk_live_REDACTED_FOR_THIS_LESSON</span>
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # "It's an environment variable — never committed to git. That's the whole point, right?"
          </span>
        ),
      },
      { content: <></> },
      {
        content: (
          <>
            $ <span style={syn.kw}>npm</span> <span style={syn.fn}>run build</span>
          </>
        ),
      },
      { content: <span style={syn.cm}>✓ built in 1.4s</span> },
      { content: <></> },
      {
        content: (
          <>
            $ <span style={syn.kw}>grep</span> <span style={syn.fn}>-o</span>{' '}
            <span style={syn.str}>"sk_live_[A-Za-z0-9]*"</span>{' '}
            <span style={syn.str}>dist/assets/index-4f8a2c.js</span>
          </>
        ),
      },
      { content: <span style={syn.cm}>sk_live_REDACTED_FOR_THIS_LESSON</span> },
    ],
    prompt:
      'Since it\'s an environment variable rather than a hardcoded string, and it never gets committed to git, is the key actually kept out of anything a visitor can see once this ships?',
    options: [
      "Yes — an environment variable is read at runtime from the server's environment, never written into any file a visitor could download",
      "No — Vite inlines every VITE_-prefixed variable as a literal string directly into the compiled JavaScript at build time, so the exact key ships inside dist/assets/*.js, readable by any visitor who opens dev tools or views the page source",
      "No, but only because the build wasn't run in production mode — a --mode production build strips every VITE_ variable out of the output automatically",
    ],
    correct: 1,
    explain:
      'Option one applies the wrong mental model: that\'s how a *backend* env var behaves (a Node process reading `process.env.SOMETHING` while it runs, on a server nobody but that server can reach), not how a frontend build tool handles one. Vite\'s whole reason for the `VITE_` prefix is the opposite of hiding a value — it\'s the *opt-in signal that this value should be exposed to client code*. The mechanism is a static text substitution, done once, at build time: everywhere `import.meta.env.VITE_STRIPE_SECRET_KEY` appears in the source, `npm run build` replaces it with the literal string `"sk_live_REDACTED…"` before writing the output file — the same idea as webpack\'s `DefinePlugin`, just Vite\'s own version of it. The result is a compiled `.js` file that contains the key as plain text, and that file is exactly what gets served to every single visitor\'s browser with zero login, zero breach, zero special access required — right-click, View Source, or the Network tab all show it. Vite\'s own documentation says this outright as a security note: `.env` values prefixed `VITE_` "will be part of your git history" *if committed* and, regardless of that, "they will be inlined into the client bundle" — so they should never be treated as secret, full stop. Option three names a real Vite concept (production mode exists) but invents a behavior it doesn\'t have: `--mode production` changes things like minification and dead-code elimination, not secret-scanning — it has no idea which strings in your code happen to look like an API key, so it inlines this one exactly the same way a dev build would, just with shorter variable names around it. Minified isn\'t hidden, either — the exact literal string is still sitting in the output, one `grep` away, whether or not the surrounding code is readable. The actual fix: a real secret never goes in a frontend-prefixed variable at all — not `VITE_*`, not Create React App\'s `REACT_APP_*`, not Next.js\'s `NEXT_PUBLIC_*` — those prefixes all mean "please ship this to the browser." A Stripe secret key belongs on the server, called from a backend endpoint the frontend talks to instead — the client never sees it, because it\'s never anywhere the client\'s code lives.',
  },
  {
    filename: 'rebuild-vs-restart.sh',
    code: [
      {
        content: (
          <span style={syn.cm}>
            # lib/api.ts, this very app:
          </span>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>export const</span> API_BASE ={' '}
            <span style={syn.str}>import.meta.env.VITE_API_BASE_URL</span>
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # The GitHub Pages workflow never sets it — that's the real reason /sign-in 404s on the
          </span>
        ),
      },
      { content: <span style={syn.cm}># live site today: no backend URL was ever baked in.</span> },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # Ops wants the live site to start talking to a real backend at api.devhub.example —
          </span>
        ),
      },
      { content: <span style={syn.cm}># on the box that's already serving the old built files:</span> },
      {
        content: (
          <>
            $ <span style={syn.kw}>export</span>{' '}
            <span style={syn.fn}>VITE_API_BASE_URL</span>=
            <span style={syn.str}>https://api.devhub.example</span>
          </>
        ),
      },
      {
        content: (
          <>
            $ <span style={syn.kw}>systemctl</span> <span style={syn.fn}>restart</span>{' '}
            <span style={syn.str}>nginx</span>
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # nginx comes back up instantly, serving the exact same dist/assets/index-8f2a.js bytes
          </span>
        ),
      },
      { content: <span style={syn.cm}># that npm run build produced hours earlier.</span> },
    ],
    prompt:
      "Ops sets VITE_API_BASE_URL to the new backend's URL on the server, then restarts nginx — which only serves the already-built static files, no npm run build run again. Does the live site start calling the new backend?",
    options: [
      "Yes — restarting the server process re-reads the OS environment, the same way a backend process restarting picks up a new DATABASE_URL",
      "No — VITE_API_BASE_URL was already substituted into a literal string inside dist/assets/index-8f2a.js back when npm run build last ran; restarting nginx just serves those same unchanged bytes. Only running the build again, with the new value set at that build's environment, produces new output files with the new URL baked in",
      "No — VITE_API_BASE_URL isn't a real Vite convention; only variables named exactly VITE_APP_* actually get bundled into anything",
    ],
    correct: 1,
    explain:
      'This is Q1\'s exact fact, looked at one step later: once `import.meta.env.VITE_API_BASE_URL` got statically replaced with a string at build time, the *files on disk* are done changing — they\'re just bytes now, no more aware of "environment variables" than a PNG is. nginx\'s job here is only to serve those bytes over HTTP; restarting it re-reads its own config, not the source code of the files it\'s handing out, so it serves the identical `index-8f2a.js` — still containing whatever URL (or `undefined`, in this app\'s real GitHub Pages build, since the workflow never sets it) was true the moment `npm run build` last ran. Setting a new OS-level `VITE_API_BASE_URL` after that point changes nothing, because nothing ever reads it again — the substitution already happened, once, in the past. Option one is exactly backwards for *why* it\'s backwards: a real backend process — say, an Express server reading `process.env.DATABASE_URL` inside a request handler or once at startup — genuinely does perform a fresh lookup against the live OS environment each time *that process* starts, so changing the value and restarting *it* (not a static file server that never executes any of this app\'s own code) picks up the change immediately, no rebuild required. The dividing line was never "is it called an environment variable" — both of these are, by that name. It\'s *when* the substitution happens: build-time (baked once into frozen output bytes; only a fresh build can change it) versus run-time (read fresh every time the process that uses it starts or handles a request). Option three invents a naming rule that isn\'t real — the actual convention, confirmed by this app\'s own `lib/api.ts`, is the bare `VITE_` prefix, nothing more specific. One sentence worth keeping: bakes at build, reads at run.',
  },
  {
    filename: 'rolling-deploy.sh',
    code: [
      {
        content: (
          <span style={syn.cm}>
            # devhub-api v1.4.2 — Ana starts a 45-second CSV export at 14:02:00
          </span>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /export/orders → streaming… (instance{' '}
            <span style={syn.str}>web-1</span>, v1.4.2)
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}># 14:02:03 — a teammate merges a fix; the rolling deploy starts</span>
        ),
      },
      {
        content: (
          <>
            $ <span style={syn.kw}>kubectl</span> <span style={syn.fn}>rollout status</span>{' '}
            deployment/devhub-api
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # 14:02:04 — a NEW pod starts ALONGSIDE web-1, not in place of it yet
          </span>
        ),
      },
      {
        content: (
          <>
            <span style={syn.str}>web-2</span> v1.4.3 Running — 0/1 ready (waiting on readiness probe)
          </>
        ),
      },
      {
        content: (
          <>
            <span style={syn.str}>web-1</span> v1.4.2 Running — 1/1 ready ← still serving Ana's export
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # 14:02:11 — web-2 passes its probe; the load balancer sends it NEW requests only
          </span>
        ),
      },
      {
        content: (
          <>
            <span style={syn.str}>web-1</span> v1.4.2 — receives SIGTERM, keeps draining Ana's request
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # 14:02:45 — Ana's export finishes normally. Only then does web-1 actually exit.
          </span>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>GET</span> /export/orders → <span style={syn.fn}>200 OK</span> (44.9s,
            web-1, v1.4.2)
          </>
        ),
      },
    ],
    prompt:
      "The deploy started at 14:02:03, right in the middle of Ana's 45-second export on the old version (v1.4.2). Does her request get cut off the moment the new version takes over?",
    options: [
      "Yes — a deploy is an atomic swap; the instant the new version is live, every existing connection to the old one is terminated so two versions are never running at once",
      "No — the new version starts up alongside the old one, not in its place, and only takes over NEW requests once it's healthy; the old instance gets a grace period to finish requests it already accepted before it's actually shut down, so Ana's export completes normally on the old code",
      "No, but only because a CSV export is a special streaming response — an ordinary JSON request on the old version really would get cut off the instant the new one came up",
    ],
    correct: 1,
    explain:
      'A "deploy" is not a single instant where old code disappears and new code appears in its place — that\'s the folk model, and it\'s wrong for essentially every real rolling/blue-green setup. What actually happens: the orchestrator (Kubernetes here, but the same shape applies to a load balancer doing blue-green, or any zero-downtime deploy) starts the NEW instance *alongside* the old one and waits for it to report healthy via a readiness probe before routing any new traffic to it — so for a real stretch of wall-clock time, both versions are simultaneously up and simultaneously capable of serving requests. Once the new one is ready, the load balancer stops sending *new* requests to the old instance, but the old instance isn\'t simply killed — it receives a termination signal (SIGTERM) and is given a grace period (Kubernetes calls this literally `terminationGracePeriodSeconds`, defaulting to 30s, configurable higher for exactly this kind of long-running request) to finish whatever it already accepted. Ana\'s export was already in flight when that signal arrived, so it keeps running to completion on the old code, and only once it (and anything else still draining) finishes does the old instance actually exit. Option one describes a strategy some systems really do use — a hard cutover with zero grace period — but it\'s the exception built for stateless, instant-response services that can tolerate a dropped connection, not the default, and definitely not what a rolling/blue-green deploy with health checks is *for*. Option three\'s distinction is fake: what determines whether a request survives isn\'t its response shape, it\'s whether the platform gives the instance handling it time to drain before termination — a one-line JSON response in flight at the wrong microsecond gets the exact same grace period a 45-second export does, because the grace period applies to the *instance*, not the request.',
  },
  {
    filename: 'migration-during-rollout.sh',
    code: [
      {
        content: (
          <span style={syn.cm}>
            # Same rolling deploy as before — web-1 (v1.4.2, old code) and web-2 (v1.4.3, new code)
          </span>
        ),
      },
      { content: <span style={syn.cm}># briefly run side by side against the SAME database.</span> },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # v1.4.3's deploy also ships a migration, run automatically as the first deploy step:
          </span>
        ),
      },
      {
        content: (
          <>
            $ <span style={syn.kw}>psql</span> <span style={syn.fn}>-c</span>{' '}
            <span style={syn.str}>"ALTER TABLE users RENAME COLUMN name TO full_name;"</span>
          </>
        ),
      },
      { content: <span style={syn.cm}>ALTER TABLE</span> },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # web-2 (v1.4.3) was written against the new column name — works fine:
          </span>
        ),
      },
      {
        content: (
          <>
            <span style={syn.kw}>SELECT</span> full_name{' '}
            <span style={syn.kw}>FROM</span> users <span style={syn.kw}>WHERE</span> id = 42;{' '}
            → <span style={syn.fn}>200 OK</span>
          </>
        ),
      },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # But web-1 (v1.4.2) is STILL RUNNING — the rollout isn't finished — and still queries the
          </span>
        ),
      },
      { content: <span style={syn.cm}># old column name, same as before the migration ran:</span> },
      {
        content: (
          <>
            <span style={syn.kw}>SELECT</span> name <span style={syn.kw}>FROM</span> users{' '}
            <span style={syn.kw}>WHERE</span> id = 42;
          </>
        ),
      },
      { content: <span style={syn.cm}>ERROR: column "name" does not exist</span> },
      { content: <></> },
      {
        content: (
          <span style={syn.cm}>
            # Every request the load balancer still routes to web-1 for the next ~40 seconds hits this.
          </span>
        ),
      },
    ],
    prompt:
      "The migration ran the moment the deploy started, renaming the column outright. web-1 is still handling live traffic on the old code for another ~40 seconds while web-2 finishes rolling out. What happens to the requests web-1 handles in that window?",
    options: [
      'They succeed — PostgreSQL automatically keeps a hidden alias so a renamed column still answers to its old name until nothing references it anymore',
      "They all fail — web-1's queries reference a column that no longer exists the instant the migration runs, so every request routed to the old instance errors for as long as it keeps receiving traffic during the rollout",
      'They fail, but only the very first one — PostgreSQL caches the new schema after that and the old code adapts automatically from then on',
    ],
    correct: 1,
    explain:
      "This is Q3's own fact used directly, not a new one: a rolling deploy means old and new code briefly run at the same time, and this question adds the piece that makes that dangerous — they run against the *same* database at the same time too. `ALTER TABLE … RENAME COLUMN` doesn't create a transition period or leave the old name usable — the instant it commits, `name` simply doesn't exist anymore, full stop, for every connection, old code and new code alike. web-2's queries are fine because it was written against `full_name`. web-1 wasn't rewritten — it's the *previous* deployment, still live, still receiving real traffic from the load balancer for however long its own drain window takes — and every one of its `SELECT name …` queries now errors, because from PostgreSQL's point of view there is no `name` column to find, and there's no grace period or fallback on the database side for that. Options one and three both imagine some kind of compatibility shim (a hidden alias, an auto-adapting cache) that plain SQL simply doesn't have — a rename is an immediate, total rename, and 'the query didn't specify RENAME so it should still work' isn't how any of this is implemented. The actual, real fix is a migration strategy that assumes exactly what Q3 proved is true — that both versions of the code will briefly run against the schema at once — instead of migrating for only the version being deployed: the **expand/contract** (or 'parallel change') pattern. Step one, a migration that only *adds* `full_name` alongside the still-intact `name` column, paired with new code that writes to both (or reads the new column with a fallback to the old); every instance, old and new, keeps working through the whole rollout, because neither column ever disappears yet. Only in a *separate, later* deploy — once every instance in the fleet is confirmed running the new code, so nothing is left that could possibly ask for the old name — does a final migration drop `name` for good. The rule underneath it: during a rolling deploy, a migration has to be backward-compatible with the *previous* version of the code, because for a real window, that previous version is still out there, live, and still asking the database questions.",
  },
]

const PASS_MARK = 3

/** One question card: the deploy transcript, three answer choices, and the reveal once picked. */
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

/** Stage 5's sixth and final lesson page — four graded predict-the-outcome questions on deploy mechanics. */
export default function Deploy() {
  useDocumentTitle('Deploy')
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
        note="Page type · Concept lesson · APIs"
        right={<Tag tone="accent">APIS &amp; DATABASES · DEPLOY</Tag>}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 48px 110px' }}>
        <Tag tone="accent-2" style={{ display: 'inline-flex', marginBottom: 12 }}>
          STAGE 5 · APIS &amp; DATABASES
        </Tag>
        <h1 style={{ fontSize: 40, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Deploy
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            margin: '0 0 14px',
          }}
        >
          HTTP, REST, SQL, joins, auth — that's a real app. But "it works on my machine" and "it's
          live for actual users" are two different claims, and the gap between them is where some of
          the most expensive mistakes happen: a secret that ships to every visitor, a config change
          that silently does nothing, a database caught between two versions of your own code.
          Predict what actually happens in each scenario below, then see why.
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
            slug="deploy"
            earned={earned}
            hint={`Score ${PASS_MARK} of ${QUESTIONS.length} or better and this records itself.`}
          />
        </div>
      </main>
    </div>
  )
}
