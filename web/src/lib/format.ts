const nf = (digits: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const fmt = (v: number | null, digits = 3) => (v === null || !Number.isFinite(v) ? '—' : nf(digits).format(v))
export const pct = (v: number | null, digits = 1) => (v === null || !Number.isFinite(v) ? '—' : `${nf(digits).format(v * 100)}%`)
export const int = (v: number) => nf(0).format(Math.round(v))

export function shortAuthors(authors: string): string {
  const clean = authors.replace(/\(eds?\.\)/, '').replace(/et al\.?/, '').replace(/,\s*$/, '').trim()
  // Junta "Sobrenome, I." (formato invertido) antes de separar a lista por vírgulas
  const initials = /^(?:[A-ZÀ-Ý][a-zà-ÿ]?\.\s*-?\s*)+$/
  const chunks = clean.split(/\s+(?:&|and|e)\s+|,\s*/)
  const people: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i].trim()
    if (!c) continue
    if (initials.test(c) && people.length) continue // iniciais pertencem ao sobrenome anterior
    if (initials.test(chunks[i + 1]?.trim() ?? '') && !/\s/.test(c)) { people.push(c); continue }
    const words = c.replace(/\s+(Jr|Sr)\.?$|\s+I{2,3}$/, '').split(/\s+/)
    const last = words.pop() ?? c
    const particle = words.length && /^(van|von|de|der|da|del|di|du|le|la|al|el|ibn|bin)$/i.test(words[words.length - 1]) ? `${words.pop()} ` : ''
    people.push(particle + last)
  }
  const surnames = people.filter(Boolean)
  const etal = /et al/.test(authors)
  if (surnames.length === 0) return authors
  if (surnames.length === 1) return etal ? `${surnames[0]} et al.` : surnames[0]
  if (surnames.length === 2 && !etal) return `${surnames[0]} & ${surnames[1]}`
  return `${surnames[0]} et al.`
}
