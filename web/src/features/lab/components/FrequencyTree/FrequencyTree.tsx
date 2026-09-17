import { useId, useMemo, useState } from 'react'
import { Slider } from '@/components/molecules/Slider'
import { fmt, int, pct } from '@/lib/format'
import styles from './FrequencyTree.module.css'

export type FrequencyLabels = {
  /** unidade no plural: "pessoas", "redações" */
  unit?: string
  /** quem tem a condição: "com câncer", "feitas com IA" */
  yes?: string
  /** quem não tem: "sem câncer", "humanas" */
  no?: string
  /** resultado positivo no plural: "testam positivo", "são acusadas" */
  positive?: string
}

export type FrequencyTreeProps = FrequencyLabels & {
  population?: number
  prevalence?: number
  sensitivity?: number
  specificity?: number
  caption?: string
  /** mostra os controles para mudar prevalência, sensibilidade e especificidade */
  interactive?: boolean
}

const DOTS = 400

/**
 * Árvore de frequências naturais (Gigerenzer & Hoffrage, 1995) + matriz de pontos.
 * Mostra o mesmo cálculo de Bayes em contagens inteiras, que a maioria das pessoas entende sem fórmula.
 */
export function FrequencyTree({ population = 10000, prevalence = 0.01, sensitivity = 0.9, specificity = 0.9, caption, interactive = true,
  unit = 'pessoas', yes = 'com a condição', no = 'sem a condição', positive = 'testam positivo' }: FrequencyTreeProps) {
  const [prev, setPrev] = useState(prevalence)
  const [sens, setSens] = useState(sensitivity)
  const [spec, setSpec] = useState(specificity)
  const titleId = useId()

  const n = useMemo(() => {
    const sick = population * prev
    const healthy = population - sick
    const tp = sick * sens
    const fn = sick - tp
    const fp = healthy * (1 - spec)
    const tn = healthy - fp
    const positives = tp + fp
    return { sick, healthy, tp, fn, fp, tn, positives, ppv: positives ? tp / positives : null, npv: tn + fn ? tn / (tn + fn) : null }
  }, [population, prev, sens, spec])

  // Matriz de 400 pontos proporcional; casos raros ganham pelo menos 1 ponto para não desaparecerem
  const dots = useMemo(() => {
    const share = (x: number) => (x > 0 ? Math.max(1, Math.round((x / population) * DOTS)) : 0)
    let tp = share(n.tp), fn = share(n.fn), fp = share(n.fp)
    let tn = DOTS - tp - fn - fp
    if (tn < 0) { tn = 0; fp = DOTS - tp - fn }
    return [...Array(tp).fill('tp'), ...Array(fn).fill('fn'), ...Array(fp).fill('fp'), ...Array(tn).fill('tn')] as ('tp' | 'fn' | 'fp' | 'tn')[]
  }, [n, population])

  const reset = () => { setPrev(prevalence); setSens(sensitivity); setSpec(specificity) }
  const changed = prev !== prevalence || sens !== sensitivity || spec !== specificity

  return (
    <figure className={styles.figure} aria-labelledby={titleId}>
      <figcaption id={titleId} className={styles.headline}>
        De <strong>{int(population)}</strong> {unit}, <strong>{int(n.positives)}</strong> {positive} —
        e, desses positivos, só <strong className={styles.tpText}>{int(n.tp)}</strong> {yes}.
        {' '}Valor preditivo positivo: <strong>{pct(n.ppv, 1)}</strong>.
      </figcaption>

      <div className={styles.body}>
        <div className={styles.tree} role="img" aria-label={`Árvore: ${int(n.sick)} ${yes} (${int(n.tp)} positivos, ${int(n.fn)} negativos) e ${int(n.healthy)} ${no} (${int(n.fp)} positivos, ${int(n.tn)} negativos).`}>
          <div className={styles.root}><span>{int(population)}</span>{unit}</div>
          <div className={styles.level}>
            <div className={styles.branch}>
              <div className={`${styles.node} ${styles.sick}`}><span>{int(n.sick)}</span>{yes}<small>{pct(prev, prev < 0.01 ? 2 : 1)}</small></div>
              <div className={styles.leaves}>
                <div className={`${styles.leaf} ${styles.tp}`}><span>{int(n.tp)}</span>positivo<small>TP</small></div>
                <div className={`${styles.leaf} ${styles.fn}`}><span>{int(n.fn)}</span>negativo<small>FN</small></div>
              </div>
            </div>
            <div className={styles.branch}>
              <div className={`${styles.node} ${styles.healthy}`}><span>{int(n.healthy)}</span>{no}<small>{pct(1 - prev, 1)}</small></div>
              <div className={styles.leaves}>
                <div className={`${styles.leaf} ${styles.fp}`}><span>{int(n.fp)}</span>positivo<small>FP</small></div>
                <div className={`${styles.leaf} ${styles.tn}`}><span>{int(n.tn)}</span>negativo<small>TN</small></div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.dotsWrap}>
          <div className={styles.dots} aria-hidden="true">
            {dots.map((d, i) => <i key={i} className={styles[d]} />)}
          </div>
          <ul className={styles.legend}>
            <li><i className={styles.tp} /> positivo, {yes} ({int(n.tp)})</li>
            <li><i className={styles.fp} /> positivo, {no} ({int(n.fp)})</li>
            <li><i className={styles.fn} /> negativo, {yes} ({int(n.fn)})</li>
            <li><i className={styles.tn} /> negativo, {no}</li>
          </ul>
          <p className={styles.dotsNote}>{population >= DOTS ? <>Cada ponto ≈ {fmt(population / DOTS, population / DOTS < 10 ? 1 : 0)} {unit}</> : <>Proporções em {DOTS} pontos</>}; casos raros ganham ao menos um ponto.</p>
        </div>
      </div>

      {interactive && (
        <div className={styles.controls}>
          <Slider label="Prevalência" value={Math.log10(prev)} min={-4} max={Math.log10(0.5)} step={0.01}
            display={pct(prev, prev < 0.01 ? 2 : 1)} onChange={(v) => setPrev(Number((10 ** v).toPrecision(3)))} />
          <Slider label="Sensibilidade" value={sens} min={0.5} max={0.999} step={0.001} display={pct(sens, 1)} onChange={setSens} />
          <Slider label="Especificidade" value={spec} min={0.5} max={0.9999} step={0.0001} display={pct(spec, spec > 0.99 ? 2 : 1)} onChange={setSpec} />
          {changed && <button type="button" className={styles.reset} onClick={reset}>Voltar ao exemplo</button>}
        </div>
      )}
      {caption && <p className={styles.caption}>{caption}</p>}
    </figure>
  )
}
