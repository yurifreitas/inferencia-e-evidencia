import { REFERENCES, PATHS } from './references/data'
import type { Reference } from './references/model'
import { CONCEPTS } from './concepts/data'
import type { Concept } from './concepts/model'
import { DEBATES } from './debates/data'

export const refsById = new Map(REFERENCES.map((r) => [r.id, r]))
export const conceptsById = new Map(CONCEPTS.map((c) => [c.id, c]))

export const getRefs = (ids: string[]) => ids.map((id) => refsById.get(id)).filter((r): r is Reference => Boolean(r))
export const getConcepts = (ids: string[]) => ids.map((id) => conceptsById.get(id)).filter((c): c is Concept => Boolean(c))

export const conceptsForRef = (id: string) => CONCEPTS.filter((c) => c.refIds.includes(id))
export const debatesForRef = (id: string) => DEBATES.filter((d) => d.positions.some((p) => p.refIds.includes(id)))
export const pathsForRef = (id: string) => PATHS.filter((p) => p.steps.some((s) => s.refId === id))

export function relatedRefs(ref: Reference, limit = 6): Reference[] {
  const citedTogether = new Map<string, number>()
  for (const c of conceptsForRef(ref.id)) {
    for (const other of c.refIds) if (other !== ref.id) citedTogether.set(other, (citedTogether.get(other) ?? 0) + 2)
  }
  for (const r of REFERENCES) {
    if (r.id === ref.id) continue
    const shared = r.themes.filter((t) => ref.themes.includes(t)).length
    if (shared) citedTogether.set(r.id, (citedTogether.get(r.id) ?? 0) + shared)
  }
  return [...citedTogether.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => refsById.get(id))
    .filter((r): r is Reference => Boolean(r))
}
