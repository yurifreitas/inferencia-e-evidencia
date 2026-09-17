import { describe, expect, it } from 'vitest'
import { binormalAuc, computeMetrics, PRESETS, simulate, trivialNegative } from './model'

const finley = PRESETS.find((p) => p.id === 'finley')!.counts

describe('métricas da matriz de confusão', () => {
  it('reproduz o caso Finley (1884)', () => {
    const m = computeMetrics(finley)
    expect(m.acc).toBeCloseTo(0.966, 3)
    expect(computeMetrics(trivialNegative(finley)).acc).toBeCloseTo(0.982, 3)
    expect(m.tpr).toBeCloseTo(28 / 51, 6)
    expect(m.youden).toBeCloseTo(28 / 51 - 72 / 2752, 6)
  })

  it('identidades: F1 = 2J/(1+J), BA = (J+1)/2, MCC² = informedness × markedness', () => {
    const c = { tp: 80, fp: 90, fn: 20, tn: 810 }
    const m = computeMetrics(c)
    expect(m.f1!).toBeCloseTo((2 * m.iou!) / (1 + m.iou!), 10)
    expect(m.ba!).toBeCloseTo((m.youden! + 1) / 2, 10)
    const markedness = m.ppv! + m.npv! - 1
    expect(m.mcc! ** 2).toBeCloseTo(m.youden! * markedness, 10)
    expect(m.mcc).toBeCloseTo(0.559, 3)
    expect(m.kappa).toBeCloseTo(0.534, 3)
  })

  it('métricas indefinidas viram null em vez de NaN', () => {
    const m = computeMetrics({ tp: 0, fp: 0, fn: 10, tn: 90 })
    expect(m.ppv).toBeNull()
    expect(m.mcc).toBeNull()
  })

  it('simulação binormal respeita a prevalência e a AUC teórica', () => {
    const c = simulate({ dprime: 1.5, sigma: 1, prevalence: 0.1, threshold: 1, costRatio: 1, n: 10000 })
    expect(c.tp + c.fn).toBeCloseTo(1000, 6)
    expect(binormalAuc(Math.SQRT2 * 1.96, 1)).toBeCloseTo(0.975, 3)
  })
})
