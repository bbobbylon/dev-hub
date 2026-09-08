/**
 * Route `/framework-comparison` — the same click-counter widget implemented
 * three ways (React/Vue/Svelte-style syntax highlighted with `syn` from
 * `CodeListing`), followed by a dimension-by-dimension comparison table and a
 * "pick X if…" verdict row. Fully static: no shared data file, no interactive
 * state beyond the page itself.
 */
import type { ReactNode } from 'react'
import { TopNav } from '../components/TopNav'
import { syn } from '../components/CodeListing'
import { Tag, type TagTone } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const mono = 'ui-monospace, Menlo, monospace'

/** One framework's code sample card: name, tagline, and the highlighted source lines. */
interface Sample {
  name: string
  tagline: string
  /** Header fill — each framework gets its own voice from the ramps. */
  headerBg: string
  taglineColor: string
  lines: ReactNode[]
}

// the three code sample cards rendered side by side
const SAMPLES: Sample[] = [
  {
    name: 'React',
    tagline: 'state is explicit',
    headerBg: 'var(--color-accent)',
    taglineColor: 'var(--color-accent-100)',
    lines: [
      <>
        <span style={syn.kw}>import</span> {'{ useState }'} <span style={syn.kw}>from</span>{' '}
        <span style={syn.str}>'react'</span>;
      </>,
      '',
      <>
        <span style={syn.kw}>function</span> <span style={syn.fn}>Counter</span>() {'{'}
      </>,
      <>
        {'  '}
        <span style={syn.kw}>const</span> [n, setN] = <span style={syn.fn}>useState</span>(0);
      </>,
      <>
        {'  '}
        <span style={syn.kw}>return</span> (
      </>,
      <>{'    <button onClick={() => '}<span style={syn.fn}>setN</span>{'(n + 1)}>'}</>,
      '      Clicked {n} times',
      '    </button>',
      '  );',
      '}',
    ],
  },
  {
    name: 'Vue',
    tagline: 'template + reactivity',
    headerBg: 'var(--color-accent-2)',
    taglineColor: 'var(--color-accent-2-100)',
    lines: [
      <>
        {'<'}
        <span style={syn.fn}>script setup</span>
        {'>'}
      </>,
      <>
        <span style={syn.kw}>import</span> {'{ ref }'} <span style={syn.kw}>from</span>{' '}
        <span style={syn.str}>'vue'</span>;
      </>,
      <>
        <span style={syn.kw}>const</span> n = <span style={syn.fn}>ref</span>(0);
      </>,
      <>
        {'</'}
        <span style={syn.fn}>script</span>
        {'>'}
      </>,
      '',
      <>
        {'<'}
        <span style={syn.fn}>template</span>
        {'>'}
      </>,
      <>
        {'  <button @click='}
        <span style={syn.str}>"n++"</span>
        {'>'}
      </>,
      '    Clicked {{ n }} times',
      '  </button>',
      <>
        {'</'}
        <span style={syn.fn}>template</span>
        {'>'}
      </>,
    ],
  },
  {
    name: 'Svelte',
    tagline: 'compiler does the work',
    headerBg: 'var(--color-accent-700)',
    taglineColor: 'var(--color-accent-200)',
    lines: [
      <>
        {'<'}
        <span style={syn.fn}>script</span>
        {'>'}
      </>,
      <>
        {'  '}
        <span style={syn.kw}>let</span> n = 0;
      </>,
      <>
        {'</'}
        <span style={syn.fn}>script</span>
        {'>'}
      </>,
      '',
      '<button on:click={() => n += 1}>',
      '  Clicked {n} times',
      '</button>',
    ],
  },
]

// rows of the "what actually differs" comparison table
const DIMENSIONS: { label: string; react: ReactNode; vue: ReactNode; svelte: ReactNode }[] = [
  {
    label: 'How updates happen',
    react: 'Re-render + virtual DOM diff',
    vue: 'Proxy-based reactive tracking',
    svelte: 'Compiled — updates written at build time',
  },
  {
    label: 'State declaration',
    react: <code>useState</code>,
    vue: (
      <>
        <code>ref()</code> / <code>reactive()</code>
      </>
    ),
    svelte: (
      <>
        Plain <code>let</code> variable
      </>
    ),
  },
  {
    label: 'Markup lives in',
    react: 'JSX inside JS',
    vue: (
      <>
        Separate <code>&lt;template&gt;</code>
      </>
    ),
    svelte: 'Top-level HTML in the file',
  },
  { label: 'Runtime shipped', react: '~44 kB', vue: '~34 kB', svelte: '~2 kB' },
  { label: 'Job-market demand', react: 'Highest', vue: 'Strong', svelte: 'Growing' },
]

// the three "pick X if…" verdict cards
const VERDICTS: { tone: TagTone; label: string; body: string }[] = [
  {
    tone: 'accent',
    label: 'PICK REACT IF…',
    body: 'You want the biggest ecosystem and job market, and you\'re comfortable with "everything is JavaScript."',
  },
  {
    tone: 'accent-2',
    label: 'PICK VUE IF…',
    body: 'You like HTML-first templates, gentle learning curves, and batteries-included official routers/stores.',
  },
  {
    tone: 'neutral',
    label: 'PICK SVELTE IF…',
    body: "You want the least code and smallest bundles, and don't need the largest hiring pool — yet.",
  },
]

/** The Framework Comparison page mounted at `/framework-comparison` (see file header). */
export default function FrameworkComparison() {
  useDocumentTitle('Framework Comparison')

  return (
    <div className="page">
      <TopNav note="Page type · Side-by-side comparison" right={<Tag tone="accent">FRONTEND</Tag>} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '52px 48px 110px' }}>
        <h1 style={{ fontSize: 44, margin: '0 0 12px', color: 'var(--color-accent-700)' }}>
          Same counter, three frameworks
        </h1>
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.65,
            color: 'var(--color-neutral-700)',
            maxWidth: 640,
            margin: '0 0 40px',
          }}
        >
          The fastest way to understand a framework is to read the same tiny app in each. Here is a
          click-counter in React, Vue, and Svelte — spot what each one makes you write, and what it
          writes for you.
        </p>

        <div className="grid grid-3" style={{ gap: 18, marginBottom: 44 }}>
          {SAMPLES.map((s) => (
            <div key={s.name} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  background: s.headerBg,
                  borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 18,
                    color: 'var(--color-bg)',
                  }}
                >
                  {s.name}
                </span>
                <span style={{ fontSize: 11.5, color: s.taglineColor }}>{s.tagline}</span>
              </div>
              <div
                style={{
                  background: 'var(--color-neutral-900)',
                  borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                  padding: '16px 18px',
                  fontFamily: mono,
                  fontSize: 12,
                  lineHeight: 1.75,
                  color: 'var(--color-neutral-100)',
                  flex: 1,
                  overflowX: 'auto',
                }}
              >
                {s.lines.map((line, i) => (
                  <div key={i} style={{ whiteSpace: 'pre' }}>
                    {line === '' ? ' ' : line}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 24, margin: '0 0 16px' }}>What actually differs</h2>
        <div style={{ overflowX: 'auto', marginBottom: 40 }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Dimension</th>
                <th>React</th>
                <th>Vue</th>
                <th>Svelte</th>
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((d) => (
                <tr key={d.label}>
                  <td style={{ fontWeight: 600 }}>{d.label}</td>
                  <td>{d.react}</td>
                  <td>{d.vue}</td>
                  <td>{d.svelte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-3" style={{ gap: 16 }}>
          {VERDICTS.map((v) => (
            <div key={v.label} className="card" style={{ borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
              <Tag
                tone={v.tone}
                style={{ marginBottom: 10, display: 'inline-flex', alignSelf: 'flex-start' }}
              >
                {v.label}
              </Tag>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: 'var(--color-neutral-800)',
                  margin: '8px 0 0',
                }}
              >
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
