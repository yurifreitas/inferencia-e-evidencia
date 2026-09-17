#!/usr/bin/env node
/** Gera REFERENCIAS.md (na raiz do repositório) a partir de references.json. */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const refs = JSON.parse(readFileSync(join(ROOT, 'src/features/references/references.json'), 'utf8'))
const THEMES = {
  historia: 'História das ideias', ir: 'Recuperação da informação', sdt: 'Detecção de sinais', decisao: 'Teoria da decisão',
  diagnostico: 'Testes diagnósticos', gold: 'Gold standard & anotação', ml: 'Classificação estatística', metricas: 'Métricas & curvas',
  validacao: 'Validação & comparação', calibracao: 'Probabilidade & calibração',
}
const ACCESS = { livre: 'grátis', parcial: 'parcial', pago: 'pago' }
let md = `# Acervo de referências\n\n${refs.length} referências · ★ = essencial · acesso: grátis / parcial / pago.\n\nGerado por \`npm run export:md\` a partir de \`web/src/features/references/references.json\`. Não edite à mão.\n`
for (const [t, label] of Object.entries(THEMES)) {
  const list = refs.filter((r) => r.themes[0] === t).sort((a, b) => a.year - b.year)
  if (!list.length) continue
  md += `\n## ${label} (${list.length})\n\n`
  for (const r of list) {
    md += `- ${r.essential ? '★ ' : ''}**${r.authors} (${r.year}).** *${r.title}*. ${r.venue}.${r.doi ? ` doi:[${r.doi}](https://doi.org/${r.doi})` : ''} — _${ACCESS[r.access]}_\n  ${r.why}\n`
    for (const l of r.links) md += `  - [${l.label}](${l.url})\n`
  }
}
writeFileSync(join(ROOT, '..', 'REFERENCIAS.md'), md)
console.log(`REFERENCIAS.md: ${refs.length} referências`)
