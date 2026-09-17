import raw from './misconceptions.json'

export type MisconceptionCategory = 'probabilidade' | 'metricas' | 'inferencia' | 'ia-dados' | 'comunicacao'

export type Misconception = {
  id: string
  myth: string
  reality: string
  category: MisconceptionCategory
  whyItHappens: string
  explanation: string[]
  numbers?: {
    population: number
    /** as três taxas juntas habilitam a árvore interativa; sem elas, só a legenda aparece */
    prevalence?: number
    sensitivity?: number
    specificity?: number
    caption?: string
    unit?: string
    yes?: string
    no?: string
    positive?: string
  }
  worked?: { text: string; math?: string }[]
  cases: { title: string; year: string; summary: string; refIds: string[] }[]
  howToRead: string[]
  conceptIds: string[]
  refIds: string[]
  severity: 'alta' | 'media'
}

export const CATEGORY_LABEL: Record<MisconceptionCategory, string> = {
  probabilidade: 'Probabilidade e taxa-base',
  metricas: 'Métricas',
  inferencia: 'Inferência estatística',
  'ia-dados': 'IA e dados',
  comunicacao: 'Comunicação e mídia',
}

export const MISCONCEPTIONS = raw as Misconception[]
export const getMisconception = (id: string) => MISCONCEPTIONS.find((m) => m.id === id)
export const misconceptionsForConcept = (conceptId: string) => MISCONCEPTIONS.filter((m) => m.conceptIds.includes(conceptId))
