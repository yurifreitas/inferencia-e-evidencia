import { useEffect, useState } from 'react'

const parse = () =>
  window.location.hash.replace(/^#\/?/, '').split('#')[0].split('/').filter(Boolean).map(decodeURIComponent)

/** Rotas por hash: funcionam em qualquer hospedagem estática, sem configuração de servidor. */
export function useRoute(): string[] {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const onChange = () => {
      setRoute(parse())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const href = (...parts: string[]) => `#/${parts.map(encodeURIComponent).join('/')}`

/** Navega para destinos com query + hash (ex.: "?regiao=africa#/raizes") sem recarregar. */
export function navigate(to: string) {
  const [search, hash = ''] = to.startsWith('?') ? [to.slice(0, to.indexOf('#')), to.slice(to.indexOf('#'))] : ['', to]
  const url = `${window.location.pathname}${search}${hash.startsWith('#') ? hash : `#${hash}`}`
  const hashChanged = hash !== window.location.hash
  window.history.pushState(null, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
  if (hashChanged) window.dispatchEvent(new HashChangeEvent('hashchange'))
}
