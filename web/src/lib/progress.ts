import { useCallback, useSyncExternalStore } from 'react'

/**
 * Progresso de estudo local (localStorage): conceitos estudados e caixas de revisão (sistema de Leitner).
 * Nada sai do navegador.
 */
const KEY = 'matriz-progresso-v1'

export type ProgressState = {
  studied: Record<string, number> // id do conceito → timestamp
  review: Record<string, { box: 1 | 2 | 3; seen: number; right: number; last: number }> // "conceito#índice" → estado
}

const empty = (): ProgressState => ({ studied: {}, review: {} })

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty()
  } catch {
    return empty()
  }
}

let state = load()
const listeners = new Set<() => void>()

function commit(next: ProgressState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* armazenamento indisponível: progresso vale só nesta aba */
  }
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) { state = load(); listeners.forEach((l) => l()) }
  })
}

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }
const snapshot = () => state

export function useProgress() {
  const s = useSyncExternalStore(subscribe, snapshot, snapshot)
  const isStudied = useCallback((id: string) => Boolean(s.studied[id]), [s])
  const toggleStudied = useCallback((id: string) => {
    const studied = { ...state.studied }
    if (studied[id]) delete studied[id]
    else studied[id] = Date.now()
    commit({ ...state, studied })
  }, [])
  const grade = useCallback((key: string, correct: boolean) => {
    const prev = state.review[key] ?? { box: 1 as const, seen: 0, right: 0, last: 0 }
    const box = (correct ? Math.min(3, prev.box + 1) : 1) as 1 | 2 | 3
    commit({ ...state, review: { ...state.review, [key]: { box, seen: prev.seen + 1, right: prev.right + (correct ? 1 : 0), last: Date.now() } } })
  }, [])
  const reset = useCallback(() => commit(empty()), [])
  return { state: s, isStudied, toggleStudied, grade, reset, studiedCount: Object.keys(s.studied).length }
}
