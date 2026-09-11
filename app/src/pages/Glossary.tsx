/**
 * Route `/glossary` — "JARGON DECODER" reference of coding terms (`TERMS`), each structured as
 * a plain-English definition plus either a "heard at work" / "what it's not" contrast pair or a
 * short code sample, never both (see the `Term` comment below). The alphabet strip (`ALPHABET`)
 * and search box are currently static chrome — only the "A" terms are rendered here, with a
 * "Show N more" button that isn't wired up yet. Self-contained; not linked from another page.
 */
import type { ReactNode } from 'react'
import { TopNav } from '../components/TopNav'
import { syn } from '../components/CodeListing'
import { Tag, type TagTone } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const mono = 'ui-monospace, Menlo, monospace'

// Letter/range chips for the A–Z jump strip; only "A" is marked active.
const ALPHABET = ['A', 'B', 'C', 'D', 'E–H', 'I–L', 'M–P', 'Q–T', 'U–Z']

/** One glossary entry: a definition plus either a heard-at-work/isNot pair or a code `sample`, never both. */
interface Term {
  term: string
  pronunciation: string
  tone: TagTone
  category: string
  definition: ReactNode
  /** Either the two contrast panels, or a code sample — never both. */
  heardAtWork?: ReactNode
  isNot?: ReactNode
  sample?: ReactNode[]
}

// The glossary entries rendered as cards under the "A" heading.
const TERMS: Term[] = [
  {
    term: 'API',
    pronunciation: '/ˌeɪ piː ˈaɪ/ · Application Programming Interface',
    tone: 'accent',
    category: 'WEB',
    definition:
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
    heardAtWork: '"That endpoint is slow — make the fetch async so the UI doesn\'t freeze."',
    isNot: 'parallel. One cook can run async; parallel means more cooks.',
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

/** The Glossary page — searchable(-looking) jargon decoder listing `TERMS`. */
export default function Glossary() {
  useDocumentTitle('Glossary')

  return (
    <div className="page">
      <TopNav
        note="Page type · Glossary / jargon decoder"
        right={<Tag tone="accent-2">142 TERMS</Tag>}
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

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <input
            className="input"
            type="search"
            placeholder="Search terms…"
            style={{ flex: 1 }}
            aria-label="Search terms"
          />
          <button type="button" className="btn btn-primary">
            Search
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 36 }}>
          {ALPHABET.map((letter, i) => {
            const active = i === 0
            return (
              <span
                key={letter}
                style={{
                  padding: '6px 13px',
                  borderRadius: 999,
                  background: active ? 'var(--color-accent)' : 'var(--color-neutral-100)',
                  color: active ? 'var(--color-bg)' : 'var(--color-neutral-700)',
                  fontSize: 13,
                  fontWeight: active ? 600 : undefined,
                }}
              >
                {letter}
              </span>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 56,
              color: 'var(--color-accent)',
              lineHeight: 1,
            }}
          >
            A
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-neutral-300)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {TERMS.map((t) => (
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

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
          <button type="button" className="btn btn-secondary">
            Show 11 more "A" terms
          </button>
        </div>
      </main>
    </div>
  )
}
