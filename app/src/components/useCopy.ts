import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copy-to-clipboard with a transient "Copied!" acknowledgement, keyed so one
 * hook can serve several panels on a page (the CLI cheat-sheet columns).
 */
export function useCopy(resetAfterMs = 1500) {
  const [copied, setCopied] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timer.current), [])

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
