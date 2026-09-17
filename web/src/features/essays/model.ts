import raw from './essays.json'

export type Essay = {
  id: string
  title: string
  subtitle: string
  readingMinutes: number
  sections: { heading: string; paragraphs: string[] }[]
  refIds: string[]
}

export const ESSAYS = raw as Essay[]
export const getEssay = (id: string) => ESSAYS.find((e) => e.id === id)
