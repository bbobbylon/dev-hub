import { Icon } from './Icon'

export interface CodeLine {
  /** The command itself. */
  text?: string
  /** Trailing `# …` note, dimmed. Passing only `comment` makes a comment line. */
  comment?: string
}

/**
 * A dark, titled code column with a copy button — the cheat-sheet card. Lines
 * are individual elements so indentation and blank lines survive.
 */
export function CopyPanel({
  title,
  lines,
  copied,
  onCopy,
}: {
  title: string
  lines: CodeLine[]
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div
      style={{ background: 'var(--color-neutral-900)', borderRadius: 20, overflow: 'hidden' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'color-mix(in srgb, var(--color-neutral-100) 6%, transparent)',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: 'var(--color-neutral-100)',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="bare"
          style={{ color: 'var(--color-neutral-100)', padding: 2, cursor: 'pointer' }}
          aria-label={`Copy ${title}`}
        >
          <Icon name="copy" size={14} />
        </button>
      </div>
      {copied ? (
        <div style={{ padding: '4px 14px', fontSize: 11, color: 'var(--color-accent-2)' }}>
          Copied!
        </div>
      ) : null}
      <div
        style={{
          padding: 14,
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: 12,
          lineHeight: 1.7,
          color: 'var(--color-neutral-100)',
          overflowX: 'auto',
        }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ whiteSpace: 'pre' }}>
            {line.text}
            {line.comment ? (
              <span style={{ color: 'var(--color-neutral-400)' }}>
                {line.text ? ' ' : ''}
                {line.comment}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

/** The plain-text payload the copy button puts on the clipboard. */
export const commandsOf = (lines: CodeLine[]) =>
  lines
    .filter((l) => l.text)
    .map((l) => l.text)
    .join('\n')
