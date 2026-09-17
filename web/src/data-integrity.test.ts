/**
 * Integridade do acervo: todo id citado precisa existir.
 * Rode antes de abrir um pull request com mudanças nos dados (npm test).
 */
import { describe, expect, it } from 'vitest'
import { REFERENCES, PATHS } from '@/features/references/data'
import { CONCEPTS } from '@/features/concepts/data'
import deep from '@/features/concepts/deep.json'
import { DEBATES } from '@/features/debates/data'
import { ROOT_EVENTS } from '@/features/roots/data'
import studies from '@/features/roots/studies.json'
import { MISCONCEPTIONS } from '@/features/misconceptions/model'
import { ESSAYS } from '@/features/essays/model'

const refIds = new Set(REFERENCES.map((r) => r.id))
const conceptIds = new Set(CONCEPTS.map((c) => c.id))
const eventIds = new Set(ROOT_EVENTS.map((e) => e.id))
const debateIds = new Set(DEBATES.map((d) => d.id))
const missing = (ids: string[], set: Set<string>) => ids.filter((id) => !set.has(id))
const dupes = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i)

describe('ids únicos', () => {
  it.each([
    ['referências', REFERENCES.map((r) => r.id)],
    ['conceitos', CONCEPTS.map((c) => c.id)],
    ['marcos', ROOT_EVENTS.map((e) => e.id)],
    ['debates', DEBATES.map((d) => d.id)],
    ['equívocos', MISCONCEPTIONS.map((m) => m.id)],
    ['ensaios', ESSAYS.map((e) => e.id)],
  ])('%s', (_, ids) => expect(dupes(ids)).toEqual([]))
})

describe('referências citadas existem', () => {
  it('conceitos', () => expect(CONCEPTS.flatMap((c) => missing(c.refIds, refIds))).toEqual([]))
  it('debates', () => expect(DEBATES.flatMap((d) => d.positions.flatMap((p) => missing(p.refIds, refIds)))).toEqual([]))
  it('marcos', () => expect(ROOT_EVENTS.flatMap((e) => missing(e.refIds, refIds))).toEqual([]))
  it('estudos', () => {
    const s = studies as Record<string, { furtherRefIds?: string[]; sourceExcerpt?: { refId?: string } }>
    expect(Object.values(s).flatMap((x) => missing([...(x.furtherRefIds ?? []), ...(x.sourceExcerpt?.refId ? [x.sourceExcerpt.refId] : [])], refIds))).toEqual([])
  })
  it('equívocos', () => expect(MISCONCEPTIONS.flatMap((m) => missing([...m.refIds, ...m.cases.flatMap((c) => c.refIds)], refIds))).toEqual([]))
  it('trilhas', () => expect(PATHS.flatMap((p) => missing(p.steps.map((s) => s.refId), refIds))).toEqual([]))
})

describe('ligações entre conteúdos', () => {
  it('conceitos relacionados existem', () => expect(CONCEPTS.flatMap((c) => missing(c.related, conceptIds))).toEqual([]))
  it('estudos pertencem a marcos existentes', () => expect(missing(Object.keys(studies), eventIds)).toEqual([]))
  it('derivações pertencem a conceitos existentes', () => expect(missing(Object.keys(deep), conceptIds)).toEqual([]))
  it('conceitos citados em marcos, debates e equívocos existem', () => {
    expect([
      ...ROOT_EVENTS.flatMap((e) => missing(e.conceptIds, conceptIds)),
      ...DEBATES.flatMap((d) => missing(d.conceptIds, conceptIds)),
      ...MISCONCEPTIONS.flatMap((m) => missing(m.conceptIds, conceptIds)),
    ]).toEqual([])
  })
  it('marcações dos ensaios apontam para ids existentes', () => {
    const sets: Record<string, Set<string>> = { ref: refIds, conceito: conceptIds, raiz: eventIds, debate: debateIds }
    const bad: string[] = []
    for (const e of ESSAYS) {
      const text = e.sections.flatMap((s) => s.paragraphs).join(' ')
      for (const m of text.matchAll(/\[\[(ref|conceito|raiz|debate):([a-z0-9-]+)/g)) if (!sets[m[1]].has(m[2])) bad.push(`${e.id}: ${m[1]}:${m[2]}`)
    }
    expect(bad).toEqual([])
  })
})

describe('sanidade dos dados numéricos', () => {
  it('taxas das árvores de frequência estão entre 0 e 1', () => {
    const bad = MISCONCEPTIONS.filter((m) => m.numbers).filter((m) => {
      const { prevalence, sensitivity, specificity } = m.numbers!
      return [prevalence, sensitivity, specificity].some((v) => v !== undefined && (v < 0 || v > 1))
    })
    expect(bad.map((m) => m.id)).toEqual([])
  })
  it('todo conceito tem definição, origem e ao menos uma referência', () => {
    expect(CONCEPTS.filter((c) => !c.definition || !c.origin || c.refIds.length === 0).map((c) => c.id)).toEqual([])
  })
  it('anos das referências são plausíveis (obras antigas usam ano negativo ou datação aproximada)', () => {
    expect(REFERENCES.filter((r) => r.year < -3000 || r.year > new Date().getFullYear() + 1).map((r) => r.id)).toEqual([])
  })
})
