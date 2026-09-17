import { REFERENCES } from '@/features/references/data'
import { CONCEPTS } from '@/features/concepts/data'
import { DEBATES } from '@/features/debates/data'
import { ROOT_EVENTS } from '@/features/roots/data'
import { ESSAYS } from '@/features/essays/model'
import { MISCONCEPTIONS } from '@/features/misconceptions/model'
import { REGION_LABEL } from '@/features/roots/model'
import { shortAuthors } from './format'
import { href } from './router'

export type SearchKind = 'pagina' | 'equivoco' | 'ensaio' | 'conceito' | 'raiz' | 'debate' | 'referencia'
export type SearchItem = { id: string; kind: SearchKind; title: string; subtitle: string; to: string; haystack: string }

export const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const PAGES: SearchItem[] = [
  ['Visão geral', '#/'], ['Raízes: África, Oriente e Ocidente', href('raizes')], ['Fundamentos', href('fundamentos')], ['Laboratório', href('laboratorio')],
  ['Calculadora de matriz', `?modo=calculadora${href('laboratorio')}`], ['Debates', href('debates')], ['Ensaios', href('ensaios')], ['Mapa de conceitos', href('mapa')], ['Revisão de exercícios', href('revisao')], ['Glossário português–inglês', href('glossario')], ['Equívocos de hoje', href('equivocos')], ['Árvore de frequências', `?modo=frequencias${href('laboratorio')}`], ['Simulador: distribuição amostral e TCL', `?modo=estatistica&sim=amostragem${href('laboratorio')}`], ['Simulador: cobertura de intervalos de confiança', `?modo=estatistica&sim=cobertura${href('laboratorio')}`], ['Simulador: dança do p-valor', `?modo=estatistica&sim=p-valor${href('laboratorio')}`], ['Simulador: poder estatístico', `?modo=estatistica&sim=poder${href('laboratorio')}`], ['Simulador: barras de erro em benchmark de IA', `?modo=estatistica&sim=benchmark${href('laboratorio')}`], ['Simulador: pass@k', `?modo=estatistica&sim=pass-k${href('laboratorio')}`],
  ['Trilhas de leitura', href('trilhas')], ['Linha do tempo', href('linha-do-tempo')], ['Acervo', href('acervo')],
].map(([title, to]) => ({ id: `p-${title}`, kind: 'pagina' as const, title, subtitle: 'Página', to, haystack: normalize(title) }))

const INDEX: SearchItem[] = [
  ...PAGES,
  ...CONCEPTS.map((c) => ({
    id: `c-${c.id}`, kind: 'conceito' as const, title: c.name, subtitle: c.formula?.split('\n')[0] ?? c.aka.slice(0, 2).join(' · '),
    to: href('fundamentos', c.id), haystack: normalize(`${c.name} ${c.aka.join(' ')} ${c.definition}`),
  })),
  ...MISCONCEPTIONS.map((m) => ({
    id: `m-${m.id}`, kind: 'equivoco' as const, title: m.myth, subtitle: m.reality,
    to: href('equivocos', m.id), haystack: normalize(`${m.myth} ${m.reality} ${m.cases.map((c) => c.title).join(' ')}`),
  })),
  ...ESSAYS.map((e) => ({
    id: `e-${e.id}`, kind: 'ensaio' as const, title: e.title, subtitle: e.subtitle,
    to: href('ensaios', e.id), haystack: normalize(`${e.title} ${e.subtitle}`),
  })),
  ...ROOT_EVENTS.map((e) => ({
    id: `h-${e.id}`, kind: 'raiz' as const, title: e.title, subtitle: `${e.yearLabel} · ${REGION_LABEL[e.region]}`,
    to: href('raizes', e.id), haystack: normalize(`${e.title} ${e.place} ${e.summary} ${REGION_LABEL[e.region]} ${e.yearLabel}`),
  })),
  ...DEBATES.map((d) => ({
    id: `d-${d.id}`, kind: 'debate' as const, title: d.title, subtitle: d.question,
    to: `${href('debates')}#${d.id}`, haystack: normalize(`${d.title} ${d.question} ${d.synthesis}`),
  })),
  ...REFERENCES.map((r) => ({
    id: `r-${r.id}`, kind: 'referencia' as const, title: r.title, subtitle: `${shortAuthors(r.authors)} · ${r.year}`,
    to: href('ref', r.id), haystack: normalize(`${r.title} ${r.authors} ${r.year} ${r.venue}`),
  })),
]

const KIND_WEIGHT: Record<SearchKind, number> = { pagina: 6, equivoco: 5, ensaio: 4, conceito: 3, raiz: 2, debate: 1, referencia: 0 }

export function search(query: string, limit = 24): SearchItem[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return INDEX.filter((i) => i.kind !== 'referencia').slice(0, limit)
  return INDEX
    .map((item) => {
      if (!terms.every((t) => item.haystack.includes(t))) return null
      const title = normalize(item.title)
      const score = (title.startsWith(terms[0]) ? 10 : title.includes(terms[0]) ? 5 : 0) + KIND_WEIGHT[item.kind]
      return { item, score }
    })
    .filter((x): x is { item: SearchItem; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item)
}
