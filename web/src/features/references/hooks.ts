import { useMemo } from 'react'
import { useUrlParams } from '@/lib/useUrlState'
import { REFERENCES } from './data'
import { filterReferences, KIND_LABEL, THEME_LABEL, type Filters, type Kind, type Theme } from './model'

const isTheme = (v: string | null): v is Theme => v !== null && v in THEME_LABEL
const isKind = (v: string | null): v is Kind => v !== null && v in KIND_LABEL

export function useReferenceFilters() {
  const [params, update] = useUrlParams()

  const filters: Filters = {
    q: params.get('q') ?? '',
    theme: isTheme(params.get('tema')) ? (params.get('tema') as Theme) : null,
    kind: isKind(params.get('tipo')) ? (params.get('tipo') as Kind) : null,
    essential: params.get('essenciais') === '1',
    free: params.get('gratis') === '1',
  }

  const results = useMemo(
    () => filterReferences(REFERENCES, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.q, filters.theme, filters.kind, filters.essential, filters.free],
  )

  return {
    filters,
    results,
    total: REFERENCES.length,
    setQuery: (q: string) => update({ q }),
    setTheme: (t: Theme | null) => update({ tema: t }),
    setKind: (k: Kind | null) => update({ tipo: k }),
    setEssential: (on: boolean) => update({ essenciais: on ? '1' : null }),
    setFree: (on: boolean) => update({ gratis: on ? '1' : null }),
    reset: () => update({ q: null, tema: null, tipo: null, essenciais: null, gratis: null }),
  }
}

export function useReferenceStats() {
  return useMemo(() => {
    const byTheme = Object.keys(THEME_LABEL).map((t) => ({
      value: t as Theme,
      label: THEME_LABEL[t as Theme],
      count: REFERENCES.filter((r) => r.themes.includes(t as Theme)).length,
    }))
    const byKind = (Object.keys(KIND_LABEL) as Kind[]).map((k) => ({
      value: k,
      label: KIND_LABEL[k],
      count: REFERENCES.filter((r) => r.kind === k).length,
    }))
    const years = REFERENCES.map((r) => r.year)
    return {
      byTheme,
      byKind,
      total: REFERENCES.length,
      free: REFERENCES.filter((r) => r.access === 'livre').length,
      links: REFERENCES.reduce((n, r) => n + r.links.length, 0),
      span: [Math.min(...years), Math.max(...years)] as const,
    }
  }, [])
}
