export type ConceptGroup = 'fundacao' | 'probabilidade' | 'taxas' | 'resumo' | 'estimacao' | 'inferencia' | 'curvas' | 'decisao' | 'causalidade' | 'validacao' | 'dados' | 'ia-tarefas' | 'ia-generativa' | 'ia-incerteza' | 'ia-treino' | 'imagem-treino' | 'imagem-avaliacao' | 'audio-geracao' | 'midia-sintetica'

export type Concept = {
  id: string
  name: string
  aka: string[]
  group: ConceptGroup
  formula?: string
  definition: string
  intuition: string
  origin: string
  pitfalls: string[]
  related: string[]
  refIds: string[]
  /** existe demonstração no laboratório */
  lab?: boolean
  /** simulador embutido na página do conceito */
  widget?: 'amostragem' | 'cobertura' | 'p-valor' | 'poder' | 'benchmark' | 'pass-k'
}
