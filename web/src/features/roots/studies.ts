import raw from './studies.json'

export type RootStudy = {
  context: string[]
  practice: string[]
  sourceExcerpt?: { text: string; credit: string; refId?: string }
  notAnticipate?: string
  historiography?: string[]
  keyNumbers?: { label: string; value: string }[]
  furtherRefIds?: string[]
}

const STUDIES = raw as Record<string, RootStudy>

export const getStudy = (id: string): RootStudy | undefined => STUDIES[id]
export const hasStudy = (id: string) => Boolean(STUDIES[id])
