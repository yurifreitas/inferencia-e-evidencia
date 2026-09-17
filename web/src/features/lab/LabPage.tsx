import { PageHeader } from '@/components/molecules/PageHeader'
import { useUrlParams } from '@/lib/useUrlState'
import { Simulator } from './components/Simulator'
import { Calculator } from './components/Calculator'
import { FrequencyTree } from './components/FrequencyTree'
import { WIDGETS, type WidgetId } from './components/sims'
import { ChipGroup } from '@/components/molecules/ChipGroup'
import styles from './LabPage.module.css'

type Mode = 'simulacao' | 'calculadora' | 'frequencias' | 'estatistica'

export function LabPage() {
  const [params, update] = useUrlParams()
  const raw = params.get('modo')
  const mode: Mode = raw === 'calculadora' || raw === 'frequencias' || raw === 'estatistica' ? raw : 'simulacao'
  const simRaw = params.get('sim')
  const sim: WidgetId = simRaw && simRaw in WIDGETS ? (simRaw as WidgetId) : 'amostragem'
  const Sim = WIDGETS[sim].Component

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Laboratório"
        title="Mova o limiar, veja a matriz mudar"
        lead="Na simulação, dois grupos de scores (modelo binormal da teoria de detecção de sinais) geram a matriz, as curvas e todas as métricas ao vivo. Na calculadora, você digita uma matriz real — comece pelo caso Finley de 1884."
        aside={
          <div role="tablist" aria-label="Modo" className={styles.tabs}>
            <button role="tab" aria-selected={mode === 'simulacao'} className={styles.tab} onClick={() => update({ modo: null })}>Simulação</button>
            <button role="tab" aria-selected={mode === 'calculadora'} className={styles.tab} onClick={() => update({ modo: 'calculadora' })}>Calculadora</button>
            <button role="tab" aria-selected={mode === 'frequencias'} className={styles.tab} onClick={() => update({ modo: 'frequencias' })}>Frequências</button>
            <button role="tab" aria-selected={mode === 'estatistica'} className={styles.tab} onClick={() => update({ modo: 'estatistica' })}>Estatística</button>
          </div>
        }
      />
      <div role="tabpanel">{mode === 'simulacao' ? <Simulator /> : mode === 'calculadora' ? <Calculator /> : mode === 'frequencias' ? <FrequencyTree population={10000} prevalence={0.01} sensitivity={0.9} specificity={0.91} /> : (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <ChipGroup label="Simulador" allowNone={false} value={sim} onChange={(v) => v && update({ sim: v })}
            options={(Object.keys(WIDGETS) as WidgetId[]).map((k) => ({ value: k, label: WIDGETS[k].label }))} />
          <Sim />
        </div>
      )}</div>
    </div>
  )
}
