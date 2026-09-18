export type Kind = 'livro' | 'artigo' | 'relatorio' | 'curso'

export type Access = 'livre' | 'parcial' | 'pago'

export type RefLink = { label: string; url: string; type: 'texto' | 'preview' | 'material' }

export type Theme =
  | 'ir'
  | 'sdt'
  | 'decisao'
  | 'diagnostico'
  | 'gold'
  | 'ml'
  | 'metricas'
  | 'validacao'
  | 'calibracao'
  | 'historia'
  | 'inferencia'
  | 'justica'
  | 'ia-dados'

export type Layer = 'fundador' | 'moderno'

export type Reference = {
  id: string
  authors: string
  year: number
  title: string
  venue: string
  kind: Kind
  layer: Layer
  themes: Theme[]
  essential?: boolean
  why: string
  doi?: string
  /** quando o DOI é de outra edição/reimpressão */
  doiEdition?: string
  /** sugestões de DOI já revisadas e rejeitadas pelo verificador */
  doiIgnore?: string[]
  access: Access
  links: RefLink[]
  notes?: string
}

export type ReadingPath = {
  id: string
  title: string
  summary: string
  steps: { refId: string; note: string }[]
}

export type Filters = {
  q: string
  theme: Theme | null
  kind: Kind | null
  essential: boolean
  free: boolean
}

export const THEME_LABEL: Record<Theme, string> = {
  ir: 'Recuperação da informação',
  sdt: 'Detecção de sinais',
  decisao: 'Teoria da decisão',
  diagnostico: 'Testes diagnósticos',
  gold: 'Gold standard & anotação',
  ml: 'Classificação estatística',
  metricas: 'Métricas & curvas',
  validacao: 'Validação & comparação',
  calibracao: 'Probabilidade & calibração',
  historia: 'História das ideias',
  inferencia: 'Significância & inferência',
  justica: 'Justiça algorítmica',
  'ia-dados': 'IA moderna & dados',
}

/** Rótulo do tema; nunca devolve vazio, mesmo se os dados trouxerem um tema fora da taxonomia. */
export const themeLabel = (t: Theme): string => THEME_LABEL[t] ?? String(t)

export const ACCESS_LABEL: Record<Access, string> = {
  livre: 'Texto completo grátis',
  parcial: 'Acesso parcial',
  pago: 'Pago / biblioteca',
}

export const KIND_LABEL: Record<Kind, string> = {
  livro: 'Livro',
  artigo: 'Artigo',
  relatorio: 'Relatório',
  curso: 'Curso / guia',
}

const normalize = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function filterReferences(refs: Reference[], f: Filters): Reference[] {
  const q = normalize(f.q.trim())
  return refs
    .filter((r) => (f.theme ? r.themes.includes(f.theme) : true))
    .filter((r) => (f.kind ? r.kind === f.kind : true))
    .filter((r) => (f.essential ? r.essential : true))
    .filter((r) => (f.free ? r.access === 'livre' : true))
    .filter((r) =>
      q ? normalize(`${r.authors} ${r.title} ${r.venue} ${r.why} ${r.year} ${r.notes ?? ''}`).includes(q) : true,
    )
    .sort((a, b) => a.year - b.year)
}

export const scholarUrl = (r: Reference) =>
  `https://scholar.google.com/scholar?q=${encodeURIComponent(`${r.title} ${r.authors.split(/[,&]/)[0]}`)}`

export const citation = (r: Reference) => `${r.authors} (${r.year}). ${r.title}. ${r.venue}.`
