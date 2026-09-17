import { describe, expect, it } from 'vitest'
import { passAtK } from './PassKSim'

const comb = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r }

describe('pass@k', () => {
  it('coincide com 1 − C(n−c,k)/C(n,k)', () => {
    for (const [n, c, k] of [[20, 3, 5], [10, 1, 1], [100, 37, 10], [50, 0, 5]]) {
      expect(passAtK(n, c, k)).toBeCloseTo(1 - comb(n - c, k) / comb(n, k), 10)
    }
  })
  it('pass@1 = c/n e vale 1 quando não há como errar todas', () => {
    expect(passAtK(20, 5, 1)).toBeCloseTo(0.25, 12)
    expect(passAtK(10, 8, 3)).toBe(1)
  })
})
