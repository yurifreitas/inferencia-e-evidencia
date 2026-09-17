import raw from './deep.json'

export type MathStep = { text: string; math?: string }
export type ConceptDeep = {
  derivation?: MathStep[]
  example?: { setup: string; steps: MathStep[]; result: string }
  properties?: string[]
  originalText?: { quote: string; translation?: string; refId?: string; note?: string }
  exercises?: { question: string; answer: string; solution: string }[]
}

const DEEP = raw as Record<string, ConceptDeep>
export const getDeep = (id: string): ConceptDeep | undefined => DEEP[id]
