import { describe, expect, it } from 'vitest'
import { shortAuthors } from './format'

describe('shortAuthors', () => {
  it.each([
    ['T. Fawcett', 'Fawcett'],
    ['W. P. Tanner Jr. & J. A. Swets', 'Tanner & Swets'],
    ['T. Hastie, R. Tibshirani & J. Friedman', 'Hastie et al.'],
    ['P. M. Bossuyt et al.', 'Bossuyt et al.'],
    ['E. M. Voorhees & D. K. Harman (eds.)', 'Voorhees & Harman'],
    ['Gillon, B.', 'Gillon'],
    ['Urton, G. & Brezine, C. J.', 'Urton & Brezine'],
    ['C. J. van Rijsbergen', 'van Rijsbergen'],
    ['A. de Moivre', 'de Moivre'],
  ])('%s → %s', (input, expected) => {
    expect(shortAuthors(input)).toBe(expected)
  })
})
