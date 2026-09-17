import { useMemo } from 'react'
import { useUrlParams } from '@/lib/useUrlState'
import { ROOT_EVENTS } from './data'
import { CERTAINTY_LABEL, filterEvents, REGION_LABEL, type Certainty, type Region, type RootFilters } from './model'

const isRegion = (v: string | null): v is Region => v !== null && v in REGION_LABEL
const isCertainty = (v: string | null): v is Certainty => v !== null && v in CERTAINTY_LABEL

export function useRootFilters() {
  const [params, update] = useUrlParams()
  const r = params.get('regiao')
  const c = params.get('certeza')
  const filters: RootFilters = {
    region: isRegion(r) ? r : null,
    concept: params.get('ideia'),
    certainty: isCertainty(c) ? c : null,
  }
  const results = useMemo(() => filterEvents(ROOT_EVENTS, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.region, filters.concept, filters.certainty])
  return {
    filters,
    results,
    setRegion: (v: Region | null) => update({ regiao: v }),
    setConcept: (v: string | null) => update({ ideia: v }),
    setCertainty: (v: Certainty | null) => update({ certeza: v }),
    reset: () => update({ regiao: null, ideia: null, certeza: null }),
  }
}
