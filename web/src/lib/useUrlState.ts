import { useCallback, useEffect, useState } from 'react'

const read = () => new URLSearchParams(window.location.search)

/** Estado espelhado na query string: sobrevive a refresh e é compartilhável. */
export function useUrlParams() {
  const [params, setParams] = useState(read)

  useEffect(() => {
    const onPop = () => setParams(read())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const update = useCallback((patch: Record<string, string | null>) => {
    const next = read()
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    const qs = next.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`)
    setParams(next)
  }, [])

  return [params, update] as const
}
