export type Region = 'africa' | 'oriente-proximo' | 'grecia-roma' | 'sul-asia' | 'leste-asia' | 'islamico' | 'europa' | 'americas'
export type Certainty = 'estabelecido' | 'interpretacao' | 'especulativo'

export type RootEvent = {
  id: string
  year: number
  yearLabel: string
  region: Region
  place: string
  title: string
  summary: string
  connection: string
  conceptIds: string[]
  certainty: Certainty
  caution?: string
  refIds: string[]
}

export const REGION_ORDER: Region[] = ['africa', 'oriente-proximo', 'sul-asia', 'leste-asia', 'grecia-roma', 'islamico', 'europa', 'americas']

export const REGION_LABEL: Record<Region, string> = {
  africa: 'África',
  'oriente-proximo': 'Oriente Próximo',
  'sul-asia': 'Sul da Ásia',
  'leste-asia': 'Leste da Ásia',
  'grecia-roma': 'Grécia e Roma',
  islamico: 'Mundo islâmico',
  europa: 'Europa',
  americas: 'Américas',
}

export const REGION_GROUP: Record<Region, 'Sul' | 'Oriente' | 'Ocidente'> = {
  africa: 'Sul',
  'oriente-proximo': 'Oriente',
  'sul-asia': 'Oriente',
  'leste-asia': 'Oriente',
  islamico: 'Oriente',
  'grecia-roma': 'Ocidente',
  europa: 'Ocidente',
  americas: 'Ocidente',
}

export const CERTAINTY_LABEL: Record<Certainty, string> = {
  estabelecido: 'Fato estabelecido',
  interpretacao: 'Interpretação',
  especulativo: 'Especulativo',
}

/** Eras com largura igual no eixo: o tempo profundo fica legível sem esmagar os últimos séculos. */
export const ERAS = [
  { label: 'Pré-história', from: -25000, to: -3000 },
  { label: 'Antiguidade', from: -3000, to: 500 },
  { label: 'Idade média', from: 500, to: 1500 },
  { label: 'Moderna', from: 1500, to: 1850 },
  { label: '1850 →', from: 1850, to: 2030 },
]

export function eraIndex(year: number) {
  const i = ERAS.findIndex((e) => year >= e.from && year < e.to)
  return i === -1 ? (year < ERAS[0].from ? 0 : ERAS.length - 1) : i
}

/** Posição 0..1 no eixo por eras. */
export function timeX(year: number) {
  const i = eraIndex(year)
  const e = ERAS[i]
  const local = Math.max(0, Math.min(1, (year - e.from) / (e.to - e.from)))
  return (i + local) / ERAS.length
}

export type RootFilters = { region: Region | null; concept: string | null; certainty: Certainty | null }

export function filterEvents(events: RootEvent[], f: RootFilters) {
  return events
    .filter((e) => (f.region ? e.region === f.region : true))
    .filter((e) => (f.concept ? e.conceptIds.includes(f.concept) : true))
    .filter((e) => (f.certainty ? e.certainty === f.certainty : true))
    .sort((a, b) => a.year - b.year)
}
