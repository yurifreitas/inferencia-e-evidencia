/** Gerador pseudoaleatório com semente (mulberry32): simulações reproduzíveis e rápidas. */
export function rng(seed = Date.now()) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  let spare: number | null = null
  const normal = (mu = 0, sd = 1) => {
    if (spare !== null) { const v = spare; spare = null; return mu + sd * v }
    let u = 0, v = 0
    while (u === 0) u = next()
    while (v === 0) v = next()
    const r = Math.sqrt(-2 * Math.log(u))
    spare = r * Math.sin(2 * Math.PI * v)
    return mu + sd * r * Math.cos(2 * Math.PI * v)
  }
  const binomial = (n: number, p: number) => {
    let k = 0
    for (let i = 0; i < n; i++) if (next() < p) k++
    return k
  }
  return { next, normal, binomial }
}

export type Rng = ReturnType<typeof rng>

const SQRT2 = Math.SQRT2
function erf(x: number) {
  const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a)
  return s * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a))
}
export const phi = (x: number) => 0.5 * (1 + erf(x / SQRT2))
export const normalPdf = (x: number, mu = 0, sd = 1) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI))

/** Quantil da normal padrão (Acklam). */
export function zQuantile(p: number) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239]
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572]
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416]
  const pl = 0.02425
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1) }
  if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1) }
  const q = p - 0.5, r = q * q
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
}

export function histogram(values: number[], lo: number, hi: number, bins: number) {
  const counts = new Array(bins).fill(0)
  const w = (hi - lo) / bins
  for (const v of values) {
    const i = Math.floor((v - lo) / w)
    if (i >= 0 && i < bins) counts[i]++
  }
  return { counts, width: w }
}
