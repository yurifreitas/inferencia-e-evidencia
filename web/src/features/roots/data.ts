import raw from './events.json'
import type { RootEvent } from './model'

export const ROOT_EVENTS = (raw as RootEvent[]).slice().sort((a, b) => a.year - b.year)

export const THREADS: { conceptId: string; label: string }[] = [
  { conceptId: 'matriz-confusao', label: 'Previsão × desfecho' },
  { conceptId: 'gold-standard', label: 'Referência e gabarito' },
  { conceptId: 'kappa', label: 'Juízes e concordância' },
  { conceptId: 'rotulos-ruidosos', label: 'Confiabilidade das fontes' },
  { conceptId: 'erros-tipo', label: 'Tipos de erro' },
  { conceptId: 'prevalencia-bayes', label: 'Frequência e probabilidade' },
  { conceptId: 'razao-verossimilhanca', label: 'Peso da evidência' },
  { conceptId: 'limiar-custo', label: 'Decisão e custo' },
  { conceptId: 'comparacao-estatistica', label: 'Comparação controlada' },
]
