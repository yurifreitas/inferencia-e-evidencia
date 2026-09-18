/**
 * Integridade do acervo: todo id citado precisa existir.
 * Rode antes de abrir um pull request com mudanças nos dados (npm test).
 */
import { describe, expect, it } from 'vitest'
import { REFERENCES, PATHS } from '@/features/references/data'
import { THEME_LABEL } from '@/features/references/model'
import { TRADITIONS } from '@/features/references/components/Timeline/Timeline'
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

describe('taxonomia das referências', () => {
  it('todo tema usado existe em THEME_LABEL', () => {
    const bad = REFERENCES.flatMap((r) => r.themes.filter((t) => !(t in THEME_LABEL)).map((t) => `${r.id}: ${t}`))
    expect(bad).toEqual([])
  })

  it('o gráfico por tema principal cobre o acervo inteiro', () => {
    // A Visão geral agrupa por themes[0]; um tema fora da taxonomia sumiria do gráfico em silêncio.
    const somaDasBarras = Object.keys(THEME_LABEL).reduce((n, t) => n + REFERENCES.filter((r) => r.themes[0] === t).length, 0)
    expect(somaDasBarras).toBe(REFERENCES.length)
  })

  it('toda referência tem ao menos um tema, sem repetição', () => {
    const bad = REFERENCES.filter((r) => r.themes.length === 0 || new Set(r.themes).size !== r.themes.length)
    expect(bad.map((r) => r.id)).toEqual([])
  })

  it('referência marcada como grátis aponta para algum lugar', () => {
    const bad = REFERENCES.filter((r) => r.access === 'livre' && r.links.length === 0)
    expect(bad.map((r) => r.id)).toEqual([])
  })

  it('não há duas referências com o mesmo título e autores', () => {
    const chave = (r: (typeof REFERENCES)[number]) =>
      `${r.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}`
    const vistos = new Map<string, string>()
    const bad: string[] = []
    for (const r of REFERENCES) {
      const k = chave(r)
      if (vistos.has(k)) bad.push(`${vistos.get(k)} = ${r.id}`)
      else vistos.set(k, r.id)
    }
    expect(bad).toEqual([])
  })

  it('todo tema pertence a alguma tradição da linha do tempo', () => {
    const cobertos = new Set(TRADITIONS.flatMap((t) => t.themes))
    expect(Object.keys(THEME_LABEL).filter((t) => !cobertos.has(t as never))).toEqual([])
  })
})
