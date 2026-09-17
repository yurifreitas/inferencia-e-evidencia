import { useMemo, useState } from 'react'
import { Chip } from '@/components/atoms/Chip'
import { Callout } from '@/components/molecules/Callout'
import { computeMetrics, PRESETS, trivialNegative, type Counts } from '../../model'
import { ConfusionGrid } from '../ConfusionGrid'
import { MetricsPanel } from '../MetricsPanel'
import styles from './Calculator.module.css'

export function Calculator() {
  const [counts, setCounts] = useState<Counts>(PRESETS[0].counts)
  const [presetId, setPresetId] = useState<string | null>(PRESETS[0].id)
  const [compare, setCompare] = useState(true)
  const preset = PRESETS.find((p) => p.id === presetId)

  const metrics = useMemo(() => computeMetrics(counts), [counts])
  const trivial = useMemo(() => computeMetrics(trivialNegative(counts)), [counts])

  return (
    <div className={styles.calc}>
      <section className={styles.left}>
        <div className={styles.presets} role="group" aria-label="Exemplos">
          {PRESETS.map((p) => (
            <Chip key={p.id} selected={p.id === presetId} onClick={() => { setCounts(p.counts); setPresetId(p.id) }}>{p.label}</Chip>
          ))}
        </div>
        {preset && <Callout label={preset.label} tone="gold">{preset.description}</Callout>}
        <ConfusionGrid counts={counts} editable onChange={(c) => { setCounts(c); setPresetId(null) }} />
        <p className={styles.hint}>Edite qualquer célula. As métricas se recalculam na hora; valores "—" são indefinidos (divisão por zero).</p>
      </section>
      <section className={styles.right}>
        <div className={styles.head}>
          <p className={styles.title}>Métricas</p>
          <Chip selected={compare} onClick={() => setCompare((c) => !c)}>comparar com "sempre negativo"</Chip>
        </div>
        <MetricsPanel metrics={metrics} compare={compare ? trivial : undefined} compareLabel='"sempre negativo" (mesma população)' />
      </section>
    </div>
  )
}
