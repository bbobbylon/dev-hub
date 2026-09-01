import type { ReactNode } from 'react'
import { TopNav } from '../components/TopNav'
import { Tag, type TagTone } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

const mono = 'ui-monospace, Menlo, monospace'

/* ── the numbered callout markers pinned to the wire dump ───────────────── */

function Marker({ n, label, tone }: { n: number; label: string; tone: 'accent' | 'accent-2' }) {
  return (
    <span
      style={{
        background: tone === 'accent' ? 'var(--color-accent-200)' : 'var(--color-accent-2-100)',
        color: tone === 'accent' ? 'var(--color-accent-800)' : 'var(--color-accent-2-800)',
        fontSize: 10.5,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 999,
        marginLeft: 10,
        whiteSpace: 'nowrap',
      }}
    >
      {n} · {label}
    </span>
  )
}

const dim = { color: 'var(--color-neutral-500)' }
const body = { color: 'var(--color-neutral-300)' }
const header = { color: 'var(--color-accent-2-300)' }
const str = { color: 'var(--code-string)' }

/* ── the annotations that pair with each marker ────────────────────────── */

interface Note {
  n: number
  tone: 'accent' | 'accent-2'
  text: ReactNode
}

const NOTES: Note[] = [
  {
    n: 1,
    tone: 'accent',
    text: (
      <>
        <strong>Verb + noun.</strong> POST = "create", the path names what. GET reads, PUT replaces,
        DELETE removes.
      </>
    ),
  },
  {
    n: 2,
    tone: 'accent',
    text: (
      <>
        <strong>The token is your ID card.</strong> No token, no order — the server has no session
        memory (HTTP is stateless).
      </>
    ),
  },
  {
    n: 3,
    tone: 'accent',
    text: (
      <>
        <strong>A promise about the body.</strong> "What follows is JSON." Wrong label → 415
        Unsupported Media Type.
      </>
    ),
  },
  {
    n: 4,
    tone: 'accent',
    text: (
      <>
        <strong>The actual data.</strong> GETs usually have no body; POST/PUT carry one.
      </>
    ),
  },
  {
    n: 5,
    tone: 'accent-2',
    text: (
      <>
        <strong>Three digits, one story.</strong> 2xx worked · 4xx you goofed · 5xx server goofed.
        201 = "created something new."
      </>
    ),
  },
  {
    n: 6,
    tone: 'accent-2',
    text: (
      <>
        <strong>Your receipt.</strong> The new order's permanent address — GET it any time.
      </>
    ),
  },
]

const STATUS_CODES: { code: string; tone: TagTone }[] = [
  { code: '200 OK', tone: 'accent-2' },
  { code: '201 Created', tone: 'accent-2' },
  { code: '204 No Content', tone: 'accent-2' },
  { code: '400 Bad Request', tone: 'accent' },
  { code: '401 Unauthenticated', tone: 'accent' },
  { code: '403 Forbidden', tone: 'accent' },
  { code: '404 Not Found', tone: 'accent' },
  { code: '500 Server Error', tone: 'neutral' },
  { code: '503 Unavailable', tone: 'neutral' },
]

function WireSection({ label, tone, children }: { label: string; tone: 'accent' | 'accent-2'; children: ReactNode }) {
  return (
    <>
      <div
        style={{
          padding: '11px 18px',
          background: 'color-mix(in srgb, var(--color-neutral-100) 6%, transparent)',
          fontSize: 11.5,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: tone === 'accent' ? 'var(--color-accent-200)' : 'var(--color-accent-2-200)',
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          padding: '18px 20px',
          fontFamily: mono,
          fontSize: 13,
          lineHeight: 2,
          overflowX: 'auto',
        }}
      >
        {children}
      </div>
    </>
  )
}

export default function ApiAnatomy() {
  useDocumentTitle('API Anatomy')

  return (
    <div className="page">
      <TopNav
        note="Page type · Annotated anatomy / labeled dissection"
        right={<Tag tone="accent">APIS &amp; HTTP</Tag>}
      />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 48px 110px' }}>
        <h1 style={{ fontSize: 42, margin: '0 0 10px', color: 'var(--color-accent-700)' }}>
          Dissecting one real API call
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
          A request goes out, a response comes back — that's the whole protocol. Every callout on the
          left panel has a matching note; read them in number order.
        </p>

        <div
          className="split-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 24,
            marginBottom: 20,
            alignItems: 'start',
          }}
        >
          <div
            className="elev-md"
            style={{
              background: 'var(--color-neutral-900)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            <WireSection label="The request — what you send" tone="accent">
              <div>
                <span
                  style={{
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg)',
                    padding: '2px 9px',
                    borderRadius: 7,
                    fontWeight: 700,
                  }}
                >
                  POST
                </span>
                <span style={{ color: 'var(--color-bg)' }}> /v1/orders</span>
                <span style={dim}> HTTP/1.1</span>
                <Marker n={1} label="METHOD + PATH" tone="accent" />
              </div>
              <div>
                <span style={header}>Host:</span>
                <span style={body}> api.shop.dev</span>
              </div>
              <div>
                <span style={header}>Authorization:</span>
                <span style={body}> Bearer eyJhbGci…</span>
                <Marker n={2} label="WHO YOU ARE" tone="accent" />
              </div>
              <div>
                <span style={header}>Content-Type:</span>
                <span style={body}> application/json</span>
                <Marker n={3} label="BODY FORMAT" tone="accent" />
              </div>
              <div style={{ color: 'var(--color-neutral-600)' }}>&nbsp;</div>
              <div>
                <span style={body}>{'{ '}</span>
                <span style={str}>"item"</span>
                <span style={body}>: </span>
                <span style={str}>"coffee-beans"</span>
                <span style={body}>, </span>
                <span style={str}>"qty"</span>
                <span style={body}>: 2 {'}'}</span>
                <Marker n={4} label="PAYLOAD" tone="accent" />
              </div>
            </WireSection>

            <WireSection label="The response — what comes back" tone="accent-2">
              <div>
                <span style={dim}>HTTP/1.1</span>
                <span
                  style={{
                    background: 'var(--color-accent-2)',
                    color: 'var(--color-neutral-900)',
                    padding: '2px 9px',
                    borderRadius: 7,
                    fontWeight: 700,
                    marginLeft: 8,
                  }}
                >
                  201 Created
                </span>
                <Marker n={5} label="STATUS" tone="accent-2" />
              </div>
              <div>
                <span style={header}>Location:</span>
                <span style={body}> /v1/orders/8127</span>
                <Marker n={6} label="WHERE IT LIVES" tone="accent-2" />
              </div>
              <div style={{ color: 'var(--color-neutral-600)' }}>&nbsp;</div>
              <div>
                <span style={body}>{'{ '}</span>
                <span style={str}>"id"</span>
                <span style={body}>: 8127, </span>
                <span style={str}>"status"</span>
                <span style={body}>: </span>
                <span style={str}>"pending"</span>
                <span style={body}> {'}'}</span>
              </div>
            </WireSection>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {NOTES.map((note) => (
              <div
                key={note.n}
                className="card"
                style={{
                  borderRadius: 18,
                  padding: '14px 17px',
                  borderLeft:
                    note.tone === 'accent-2' ? '4px solid var(--color-accent-2)' : undefined,
                }}
              >
                <div style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
                  <span
                    style={{
                      flex: 'none',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background:
                        note.tone === 'accent' ? 'var(--color-accent)' : 'var(--color-accent-2)',
                      color: 'var(--color-bg)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {note.n}
                  </span>
                  <div
                    style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}
                  >
                    {note.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 12.5,
              color: 'var(--color-neutral-600)',
              alignSelf: 'center',
              marginRight: 4,
            }}
          >
            Status decoder:
          </span>
          {STATUS_CODES.map((s) => (
            <Tag key={s.code} tone={s.tone}>
              {s.code}
            </Tag>
          ))}
        </div>
      </main>
    </div>
  )
}
