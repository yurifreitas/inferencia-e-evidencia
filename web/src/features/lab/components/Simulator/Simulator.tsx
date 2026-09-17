import { useMemo, useState } from 'react'
import { Slider } from '@/components/molecules/Slider'
import { Chip } from '@/components/atoms/Chip'
import { fmt, pct } from '@/lib/format'
import { argbest, binormalAuc, computeMetrics, curve, ratesAt, simulate, thresholdProbability, trivialNegative, type SimParams } from '../../model'
import { DistributionChart } from '../DistributionChart'
import { CurveChart } from '../CurveChart'
import { ConfusionGrid } from '../ConfusionGrid'
import { MetricsPanel } from '../MetricsPanel'
import styles from './Simulator.module.css'

// Escalas logarítmicas para prevalência e razão de custo
const prevFromSlider = (s: number) => 10 ** s
const costFromSlider = (s: number) => 10 ** s

export function Simulator() {
  const [p, setP] = useState<SimParams>({ dprime: 1.5, sigma: 1, prevalence: 0.1, threshold: 1, costRatio: 1, n: 10000 })
  const [weighted, setWeighted] = useState(true)
  const [compareTrivial, setCompareTrivial] = useState(false)
  const set = (patch: Partial<SimParams>) => setP((prev) => ({ ...prev, ...patch }))

  const counts = useMemo(() => simulate(p), [p])
  const metrics = useMemo(() => computeMetrics(counts, p.costRatio), [counts, p.costRatio])
  const trivial = useMemo(() => computeMetrics(trivialNegative(counts), p.costRatio), [counts, p.costRatio])
  const pts = useMemo(() => curve(p.dprime, p.sigma, p.prevalence), [p.dprime, p.sigma, p.prevalence])
  const { tpr, fpr } = ratesAt(p.threshold, p.dprime, p.sigma)
  const auc = binormalAuc(p.dprime, p.sigma)
  const precision = metrics.ppv ?? 1

  const goto = {
    cost: () => set({ threshold: argbest(p, (m) => m.cost, 'min') }),
    youden: () => set({ threshold: argbest(p, (m) => m.youden, 'max') }),
    f1: () => set({ threshold: argbest(p, (m) => m.f1, 'max') }),
    acc: () => set({ threshold: argbest(p, (m) => m.acc, 'max') }),
  }

  return (
    <div className={styles.sim}>
      <div className={styles.top}>
        <section className={styles.controls} aria-label="Parâmetros">
          <Slider label="Separação d′" value={p.dprime} min={0} max={4} step={0.05} display={fmt(p.dprime, 2)}
            hint={`AUC binormal = ${fmt(auc, 3)}`} onChange={(v) => set({ dprime: v })} />
          <Slider label="Dispersão dos positivos σ" value={p.sigma} min={0.5} max={2.5} step={0.05} display={fmt(p.sigma, 2)}
            hint="σ ≠ 1 torna a ROC assimétrica" onChange={(v) => set({ sigma: v })} />
          <Slider label="Prevalência π" value={Math.log10(p.prevalence)} min={-3} max={Math.log10(0.5)} step={0.01} display={pct(p.prevalence, p.prevalence < 0.01 ? 2 : 1)}
            hint="Escala log — PPV e curva PR mudam; ROC não" onChange={(v) => set({ prevalence: prevFromSlider(v) })} />
          <Slider label="Custo FN / custo FP" value={Math.log10(p.costRatio)} min={-1} max={2} step={0.01} display={`${fmt(p.costRatio, p.costRatio < 10 ? 1 : 0)}×`}
            hint={`limiar de probabilidade pₜ = ${fmt(thresholdProbability(p.costRatio), 3)}`} onChange={(v) => set({ costRatio: costFromSlider(v) })} />
          <div className={styles.jump}>
            <p className={styles.jumpLabel}>Levar o limiar para o ótimo de…</p>
            <div className={styles.jumpButtons}>
              <Chip onClick={goto.cost}>menor custo</Chip>
              <Chip onClick={goto.youden}>Youden</Chip>
              <Chip onClick={goto.f1}>F1</Chip>
              <Chip onClick={goto.acc}>acurácia</Chip>
            </div>
          </div>
        </section>

        <section className={styles.dist} aria-label="Distribuições">
          <div className={styles.distHead}>
            <div>
              <p className={styles.chartTitle}>Scores das duas classes</p>
              <p className={styles.chartSub}>Negativos ~ N(0, 1), positivos ~ N(d′, σ²) · N = 10.000</p>
            </div>
            <Chip selected={weighted} onClick={() => setWeighted((w) => !w)}>ponderar pela prevalência</Chip>
          </div>
          <DistributionChart dprime={p.dprime} sigma={p.sigma} prevalence={p.prevalence} threshold={p.threshold} weighted={weighted}
            onThreshold={(t) => set({ threshold: t })} />
          <Slider label="Limiar t" value={p.threshold} min={Math.min(-4, p.dprime - 4 * p.sigma)} max={Math.max(4, p.dprime + 4 * p.sigma)} step={0.01}
            display={fmt(p.threshold, 2)} onChange={(v) => set({ threshold: v })} />
        </section>
      </div>

      <div className={styles.bottom}>
        <section className={styles.matrix} aria-label="Matriz resultante">
          <ConfusionGrid counts={counts} />
          <div className={styles.curves}>
            <CurveChart kind="roc" points={pts.map((q) => ({ x: q.fpr, y: q.tpr }))} current={{ x: fpr, y: tpr }} baseline={0}
              title={`ROC · AUC ${fmt(auc, 3)}`} subtitle="Não muda com a prevalência. Tracejado verde = Youden J." xLabel="FPR" yLabel="TPR" />
            <CurveChart kind="pr" points={pts.filter((q) => q.precision !== null).map((q) => ({ x: q.tpr, y: q.precision as number }))}
              current={{ x: tpr, y: precision }} baseline={p.prevalence}
              title="Precisão × recall" subtitle="Afunda quando π diminui." xLabel="Recall" yLabel="Precisão" />
          </div>
        </section>

        <section className={styles.metrics} aria-label="Métricas">
          <div className={styles.metricsHead}>
            <p className={styles.chartTitle}>Todas as métricas desta matriz</p>
            <Chip selected={compareTrivial} onClick={() => setCompareTrivial((c) => !c)}>comparar com "sempre negativo"</Chip>
          </div>
          <MetricsPanel metrics={metrics} compare={compareTrivial ? trivial : undefined} compareLabel='classificador "sempre negativo"' />
        </section>
      </div>
    </div>
  )
}
