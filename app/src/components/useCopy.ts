import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copy-to-clipboard with a transient "Copied!" acknowledgement, keyed so one
 * hook can serve several panels on a page (the CLI cheat-sheet columns).
 */
export function useCopy(resetAfterMs = 1500) {
  // The key of whichever panel is currently showing "Copied!", or null if none is.
  const [copied, setCopied] = useState<string | null>(null)
  // Holds the pending "clear the acknowledgement" timeout so a second copy can cancel it.
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Unmounting mid-acknowledgement shouldn't leak the pending timeout.
  useEffect(() => () => clearTimeout(timer.current), [])

  /** Writes `text` to the clipboard and flags `key` as copied for `resetAfterMs`. */
  const copy = useCallback(
    (text: string, key: string) => {
      navigator.clipboard?.writeText(text).catch(() => {})
      setCopied(key)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(null), resetAfterMs)
    },
    [resetAfterMs],
  )

  return { copied, copy }
}
