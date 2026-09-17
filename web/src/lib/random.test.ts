import { describe, expect, it } from 'vitest'
import { histogram, normalPdf, phi, rng, zQuantile } from './random'

describe('distribuição normal', () => {
  it('phi e zQuantile são inversas nos valores clássicos', () => {
    expect(phi(1.96)).toBeCloseTo(0.975, 3)
    expect(zQuantile(0.975)).toBeCloseTo(1.96, 2)
    expect(zQuantile(0.995)).toBeCloseTo(2.5758, 3)
    for (const p of [0.001, 0.05, 0.3, 0.5, 0.8, 0.999]) expect(phi(zQuantile(p))).toBeCloseTo(p, 4)
  })

  it('a densidade integra ~1', () => {
    let s = 0
    for (let x = -8; x <= 8; x += 0.001) s += normalPdf(x) * 0.001
    expect(s).toBeCloseTo(1, 3)
  })
})

describe('gerador com semente', () => {
  it('é reproduzível', () => {
    const a = rng(123), b = rng(123)
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()))
  })

  it('normal tem média ~0 e variância ~1', () => {
    const r = rng(7)
    const xs = Array.from({ length: 40000 }, () => r.normal())
    const m = xs.reduce((s, x) => s + x, 0) / xs.length
    const v = xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length
    expect(Math.abs(m)).toBeLessThan(0.02)
    expect(Math.abs(v - 1)).toBeLessThan(0.03)
  })

  it('binomial tem média np', () => {
    const r = rng(9)
    const ks = Array.from({ length: 5000 }, () => r.binomial(30, 0.9))
    expect(ks.reduce((s, k) => s + k, 0) / ks.length).toBeCloseTo(27, 1)
  })

  it('histograma conta todos os valores dentro do intervalo', () => {
    const { counts } = histogram([0.1, 0.2, 0.2, 0.95, 1.5], 0, 1, 10)
    expect(counts.reduce((a, b) => a + b, 0)).toBe(4)
    expect(counts[2]).toBe(2)
  })
})

describe('simulador de cobertura (propriedade conhecida)', () => {
  it('Wald com n=30 e p=0,9 cobre bem menos que 95%; Wilson fica perto', () => {
    const r = rng(1)
    const z = zQuantile(0.975), n = 30, p = 0.9, N = 20000
    let wald = 0, wilson = 0
    for (let i = 0; i < N; i++) {
      const ph = r.binomial(n, p) / n
      const h = z * Math.sqrt((ph * (1 - ph)) / n)
      if (ph - h <= p && p <= ph + h) wald++
      const den = 1 + (z * z) / n
      const c = (ph + (z * z) / (2 * n)) / den
      const hh = (z / den) * Math.sqrt((ph * (1 - ph)) / n + (z * z) / (4 * n * n))
      if (c - hh <= p && p <= c + hh) wilson++
    }
    expect(wald / N).toBeLessThan(0.86)
    expect(wilson / N).toBeGreaterThan(0.93)
  })
})
