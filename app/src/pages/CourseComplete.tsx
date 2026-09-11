/**
 * Route `/course-complete` — "CELEBRATION" screen shown after finishing a learning path: a
 * confetti-framed headline, a certificate card, and "where to next" recommendation cards. All
 * of `CERT`, `NEXT_PATHS`, and `CONFETTI` below are static placeholder content — this page does
 * not currently call `useProgress()`, so the stats and name on the certificate are not yet
 * pulled from real progress state. The "where to next" cards both link to `/roadmap`.
 */
import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Icon } from '../components/Icon'
import { Tag, type TagTone } from '../components/ui'
import { useDocumentTitle } from '../components/useDocumentTitle'

// Placeholder certificate data (name, path, date, stats) shown on the completion card.
const CERT = {
  name: 'Ada Moreno',
  path: 'Terminal & Shell',
  date: 'August 30, 2026',
  id: 'cert #TS-0231',
  stats: ['23 concepts', '14 checkpoints', '1 capstone shipped'],
}

// The "where to next" recommendation cards below the certificate.
const NEXT_PATHS: { tone: TagTone; label: string; title: string; body: string }[] = [
  {
    tone: 'accent',
    label: 'RECOMMENDED',
    title: 'Version Control',
    body: 'You already script the shell — now put your work under git and collaborate. Starts with the branching visual walkthrough.',
  },
  {
    tone: 'accent-2',
    label: 'ALTERNATIVE',
    title: 'A First Language: Python',
    body: 'Trade shell one-liners for a real language. Your CLI instincts transfer directly to files, pipes, and processes in Python.',
  },
]

/** The confetti dots orbiting the headline. */
const CONFETTI = [
  { top: -14, left: -42, size: 26, background: 'var(--color-accent-2)', opacity: 0.7, duration: '5s', reverse: false },
  { top: 30, right: -48, size: 16, background: 'var(--color-accent)', opacity: 0.7, duration: '6s', reverse: true },
  { bottom: -6, left: -20, size: 12, background: 'var(--color-accent-300)', opacity: 1, duration: '7s', reverse: false },
]

/** The Course Complete celebration page — certificate recap plus "where to next" cards. */
export default function CourseComplete() {
  useDocumentTitle('Course Complete')

  return (
    <div className="page">
      <TopNav note="Page type · Completion / celebration" />

      <main
        style={{ maxWidth: 880, margin: '0 auto', padding: '56px 48px 110px', textAlign: 'center' }}
      >
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 10 }}>
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: c.top,
                left: c.left,
                right: c.right,
                bottom: c.bottom,
                width: c.size,
                height: c.size,
                borderRadius: '50%',
                background: c.background,
                opacity: c.opacity,
                animation: `floatBlob ${c.duration} ease-in-out infinite${c.reverse ? ' reverse' : ''}`,
              }}
            />
          ))}
          <h1
            style={{
              fontSize: 52,
              lineHeight: 1.05,
              margin: 0,
              color: 'var(--color-accent-700)',
            }}
          >
            Path complete.
          </h1>
        </div>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--color-neutral-700)',
            maxWidth: 480,
            margin: '10px auto 40px',
          }}
        >
          Terminal &amp; Shell — every concept, every checkpoint, and the capstone. Here's the paper
          to prove it.
        </p>

        {/* the certificate */}
        <div
          className="elev-lg"
          style={{
            position: 'relative',
            background: 'var(--color-neutral-100)',
            borderRadius: 'var(--radius-lg)',
            padding: '52px 56px',
            marginBottom: 14,
            border: '3px solid var(--color-accent)',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 10,
              background: 'var(--color-accent)',
            }}
          />
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-700)',
              marginBottom: 18,
            }}
          >
            Dev Hub · Certificate of Completion
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 38,
              color: 'var(--color-text)',
              marginBottom: 6,
            }}
          >
            {CERT.name}
          </div>
          <div
            style={{ fontSize: 14.5, color: 'var(--color-neutral-700)', marginBottom: 22 }}
          >
            completed the path
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 26px',
              borderRadius: 999,
              background: 'var(--color-accent-100)',
              marginBottom: 26,
            }}
          >
            <Icon name="terminal" size={20} color="var(--color-accent-700)" />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 21,
                color: 'var(--color-accent-800)',
              }}
            >
              {CERT.path}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 44,
              fontSize: 12.5,
              color: 'var(--color-neutral-700)',
              flexWrap: 'wrap',
            }}
          >
            {CERT.stats.map((s, i) => (
              <span key={s} style={{ display: 'contents' }}>
                {i > 0 ? <span>·</span> : null}
                <span>{s}</span>
              </span>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: 34,
              gap: 16,
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 15,
                  color: 'var(--color-neutral-800)',
                }}
              >
                {CERT.date}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-700)', marginTop: 2 }}>
                date
              </div>
            </div>

            <div
              className="elev-md"
              style={{
                width: 74,
                height: 74,
                borderRadius: '50%',
                background: 'var(--color-accent-2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(-8deg)',
                flex: 'none',
              }}
            >
              <Icon name="check" size={22} color="var(--color-bg)" />
              <span
                style={{
                  fontSize: 8.5,
                  letterSpacing: '0.12em',
                  color: 'var(--color-accent-2-100)',
                  marginTop: 2,
                }}
              >
                VERIFIED
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 15,
                  color: 'var(--color-neutral-800)',
                }}
              >
                {CERT.id}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-700)', marginTop: 2 }}>
                shareable id
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 52, flexWrap: 'wrap' }}
        >
          <button type="button" className="btn btn-primary">
            Download PDF
          </button>
          <button type="button" className="btn btn-secondary">
            Share to LinkedIn
          </button>
        </div>

        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: 24, margin: '0 0 6px' }}>Where to next?</h2>
          <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', margin: '0 0 18px' }}>
            Both paths pick up exactly where this one ended — your streak carries over.
          </p>
          <div className="grid grid-2" style={{ gap: 16 }}>
            {NEXT_PATHS.map((p) => (
              <Link key={p.title} to="/roadmap" className="card elev-sm link-card">
                <div style={{ padding: '6px 8px' }}>
                  <Tag tone={p.tone}>{p.label}</Tag>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 19,
                      color: 'var(--color-text)',
                      marginBottom: 6,
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: 'var(--color-neutral-700)',
                    }}
                  >
                    {p.body}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
