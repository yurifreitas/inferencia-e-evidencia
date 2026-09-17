/** Modelo binormal: negativos ~ N(0, 1), positivos ~ N(d′, σ²). */

export type Counts = { tp: number; fp: number; fn: number; tn: number }

export type SimParams = {
  dprime: number
  sigma: number
  prevalence: number
  threshold: number
  costRatio: number // c_FN / c_FP
  n: number
}

export type MetricKey =
  | 'tpr' | 'tnr' | 'fpr' | 'ppv' | 'npv'
  | 'acc' | 'ba' | 'f1' | 'iou' | 'youden' | 'mcc' | 'kappa'
  | 'lrp' | 'lrn' | 'cost' | 'nb'

export type Metrics = Record<MetricKey, number | null>

const SQRT2 = Math.SQRT2

function erf(x: number): number {
  // Abramowitz & Stegun 7.1.26
  const s = Math.sign(x)
  const a = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * a)
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)
  return s * y
}

export const phi = (x: number) => 0.5 * (1 + erf(x / SQRT2))
export const pdf = (x: number, mu = 0, sd = 1) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI))

export function ratesAt(t: number, dprime: number, sigma: number) {
  return { tpr: 1 - phi((t - dprime) / sigma), fpr: 1 - phi(t) }
}

export function simulate(p: SimParams): Counts {
  const { tpr, fpr } = ratesAt(p.threshold, p.dprime, p.sigma)
  const pos = p.n * p.prevalence
  const neg = p.n - pos
  return { tp: pos * tpr, fn: pos * (1 - tpr), fp: neg * fpr, tn: neg * (1 - fpr) }
}

const div = (a: number, b: number) => (b === 0 ? null : a / b)

/** p_t implícito no custo: decida positivo se p ≥ c_FP / (c_FP + c_FN) */
export const thresholdProbability = (costRatio: number) => 1 / (1 + costRatio)

export function computeMetrics(c: Counts, costRatio = 1): Metrics {
  const { tp, fp, fn, tn } = c
  const n = tp + fp + fn + tn
  const tpr = div(tp, tp + fn)
  const tnr = div(tn, tn + fp)
  const fpr = div(fp, fp + tn)
  const ppv = div(tp, tp + fp)
  const npv = div(tn, tn + fn)
  const acc = div(tp + tn, n)
  const po = acc
  const pe = n === 0 ? null : ((tp + fp) * (tp + fn) + (fn + tn) * (fp + tn)) / (n * n)
  const mccDen = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn))
  const pt = thresholdProbability(costRatio)
  return {
    tpr, tnr, fpr, ppv, npv, acc,
    ba: tpr !== null && tnr !== null ? (tpr + tnr) / 2 : null,
    f1: div(2 * tp, 2 * tp + fp + fn),
    iou: div(tp, tp + fp + fn),
    youden: tpr !== null && fpr !== null ? tpr - fpr : null,
    mcc: mccDen === 0 ? null : (tp * tn - fp * fn) / mccDen,
    kappa: po !== null && pe !== null && pe !== 1 ? (po - pe) / (1 - pe) : null,
    lrp: tpr !== null && fpr !== null ? div(tpr, fpr) : null,
    lrn: tpr !== null && tnr !== null ? div(1 - tpr, tnr) : null,
    cost: n === 0 ? null : (fp * 1 + fn * costRatio) / n,
    nb: n === 0 ? null : tp / n - (fp / n) * (pt / (1 - pt)),
  }
}

export type CurvePoint = { t: number; fpr: number; tpr: number; precision: number | null }

export function curve(dprime: number, sigma: number, prevalence: number, steps = 160): CurvePoint[] {
  const lo = Math.min(-5, dprime - 5 * sigma)
  const hi = Math.max(5, dprime + 5 * sigma)
  const pts: CurvePoint[] = []
  for (let i = 0; i <= steps; i++) {
    const t = hi - (i / steps) * (hi - lo)
    const { tpr, fpr } = ratesAt(t, dprime, sigma)
    const den = tpr * prevalence + fpr * (1 - prevalence)
    pts.push({ t, fpr, tpr, precision: den === 0 ? null : (tpr * prevalence) / den })
  }
  return pts
}

export const binormalAuc = (dprime: number, sigma: number) => phi(dprime / Math.sqrt(1 + sigma * sigma))

/** Busca numérica do limiar que otimiza uma função da matriz. */
export function argbest(p: SimParams, score: (m: Metrics) => number | null, mode: 'max' | 'min'): number {
  const lo = Math.min(-4, p.dprime - 4 * p.sigma)
  const hi = Math.max(4, p.dprime + 4 * p.sigma)
  let best = p.threshold
  let bestVal = mode === 'max' ? -Infinity : Infinity
  for (let i = 0; i <= 800; i++) {
    const t = lo + (i / 800) * (hi - lo)
    const v = score(computeMetrics(simulate({ ...p, threshold: t }), p.costRatio))
    if (v === null) continue
    if (mode === 'max' ? v > bestVal : v < bestVal) {
      bestVal = v
      best = t
    }
  }
  return best
}

export const PRESETS: { id: string; label: string; description: string; counts: Counts }[] = [
  {
    id: 'finley',
    label: 'Finley, 1884',
    description: 'Previsões de tornado: 96,6% de acerto. "Nunca haverá tornado" acerta 98,2%.',
    counts: { tp: 28, fp: 72, fn: 23, tn: 2680 },
  },
  {
    id: 'rastreamento',
    label: 'Rastreamento raro',
    description: 'Prevalência 1%, sensibilidade e especificidade 99%: metade dos positivos é falsa.',
    counts: { tp: 99, fp: 99, fn: 1, tn: 9801 },
  },
  {
    id: 'balanceado',
    label: 'Balanceado',
    description: 'Classes iguais: acurácia, F1 e MCC contam histórias parecidas.',
    counts: { tp: 420, fp: 80, fn: 60, tn: 440 },
  },
  {
    id: 'f1-engana',
    label: 'F1 alto, MCC baixo',
    description: 'Positivos são maioria e o modelo quase sempre diz positivo: F1 ≈ 0,95 e MCC ≈ 0,19.',
    counts: { tp: 90, fp: 9, fn: 1, tn: 1 },
  },
]

export function trivialNegative(c: Counts): Counts {
  return { tp: 0, fp: 0, fn: c.tp + c.fn, tn: c.tn + c.fp }
}
