import { useEffect, useState } from 'react'

/** Só mostra o esqueleto se o carregamento passar de 200 ms — evita piscar em conexões rápidas. */
export function DelayedFallback() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 200)
    return () => window.clearTimeout(t)
  }, [])
  if (!show) return null
  return (
    <div aria-busy="true" aria-label="Carregando" style={{ display: 'grid', gap: 16, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ height: 14, width: 120, borderRadius: 6, background: 'var(--surface-2)' }} />
      <div style={{ height: 44, width: '60%', borderRadius: 8, background: 'var(--surface-2)' }} />
      <div style={{ height: 280, borderRadius: 16, background: 'var(--surface-2)' }} />
    </div>
  )
}
