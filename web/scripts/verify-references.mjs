#!/usr/bin/env node
/**
 * Verifica o acervo de referências:
 *  1. DOI → metadados no Crossref (título, ano) comparados com o registro local.
 *  2. Sem DOI → busca bibliográfica no Crossref e sugere um DOI quando o título bate.
 *  3. Cada link → requisição HTTP (status final após redirecionamentos).
 *
 * Uso: node scripts/verify-references.mjs [--only=id1,id2] [--no-links] [--no-crossref]
 * Saída: verification/report.json e verification/REPORT.md
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REFS = join(ROOT, 'src/features/references/references.json')
const OUT = join(ROOT, 'verification')
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]))
const only = args.only ? new Set(String(args.only).split(',')) : null
const UA = 'matriz-acervo-verifier/1.0 (open-source reference checker)'
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const TIMEOUT = 20000
const CONCURRENCY = 6

const refs = JSON.parse(readFileSync(REFS, 'utf8')).filter((r) => !only || only.has(r.id))

const norm = (s = '') => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
const STOP = new Set(['the', 'of', 'and', 'a', 'an', 'in', 'on', 'for', 'to', 'with', 'de', 'da', 'do', 'e', 'o', 'a', 'em', 'ed', 'edition'])
function similarity(a, b) {
  const ta = new Set(norm(a).split(' ').filter((w) => w.length > 2 && !STOP.has(w)))
  const tb = new Set(norm(b).split(' ').filter((w) => w.length > 2 && !STOP.has(w)))
  if (!ta.size || !tb.size) return 0
  let inter = 0
  for (const w of ta) if (tb.has(w)) inter++
  return inter / Math.min(ta.size, tb.size)
}

async function fetchWithTimeout(url, init = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT)
  try {
    return await fetch(url, { redirect: 'follow', ...init, signal: ctrl.signal, headers: { 'User-Agent': UA, Accept: '*/*', ...(init.headers ?? {}) } })
  } finally {
    clearTimeout(t)
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function crossrefWork(doi) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetchWithTimeout(`https://api.crossref.org/works/${encodeURIComponent(doi)}`)
      if (res.status === 404) {
        // DOIs de outras agências (DataCite, mEDRA…) não estão no Crossref: confere no registro de handles
        try {
          const h = await fetchWithTimeout(`https://doi.org/api/handles/${encodeURIComponent(doi)}`)
          if (h.ok && (await h.json()).responseCode === 1) return { status: 'ok-outra-agencia' }
        } catch { /* sem resposta do registro */ }
        return { status: 'doi-inexistente' }
      }
      if (res.status === 429) { await sleep(2000 * (attempt + 1)); continue }
      if (!res.ok) return { status: `erro-${res.status}` }
      const m = (await res.json()).message
      return {
        status: 'ok',
        title: [m.title?.[0], m.subtitle?.[0]].filter(Boolean).join(': '),
        year: m.issued?.['date-parts']?.[0]?.[0] ?? m.published?.['date-parts']?.[0]?.[0],
        container: m['container-title']?.[0] ?? m.publisher,
        authors: (m.author ?? []).map((a) => a.family).filter(Boolean),
      }
    } catch (e) {
      if (attempt === 2) return { status: 'falha-rede', error: String(e.message ?? e) }
      await sleep(1500)
    }
  }
  return { status: 'limite-de-taxa' }
}

async function crossrefSearch(ref) {
  const q = `${ref.title} ${ref.authors}`.slice(0, 300)
  try {
    const res = await fetchWithTimeout(`https://api.crossref.org/works?rows=3&query.bibliographic=${encodeURIComponent(q)}`)
    if (!res.ok) return null
    const items = (await res.json()).message.items ?? []
    const best = items
      .map((m) => ({ doi: m.DOI, title: m.title?.[0] ?? '', year: m.issued?.['date-parts']?.[0]?.[0], sim: similarity(ref.title, m.title?.[0] ?? '') }))
      .sort((a, b) => b.sim - a.sim)[0]
    return best && best.sim >= 0.85 && best.year && Math.abs(best.year - ref.year) <= 1 ? best : null
  } catch {
    return null
  }
}

async function checkLink(url) {
  const tryOnce = async (method, browser = false) => {
    const res = await fetchWithTimeout(url, { method, headers: browser ? { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/pdf,*/*' } : {} })
    return { status: res.status, finalUrl: res.url, type: res.headers.get('content-type') ?? '' }
  }
  try {
    let r = await tryOnce('HEAD')
    if (r.status === 405 || r.status === 403 || r.status === 400 || r.status >= 500) r = await tryOnce('GET')
    // alguns servidores respondem 404/403 a HEAD ou a clientes sem cara de navegador
    if (r.status >= 400) { try { const g = await tryOnce('GET', true); if (g.status < r.status || g.status < 400) r = g } catch { /* mantém o primeiro resultado */ } }
    const verdict = r.status < 400 ? 'ok' : r.status === 401 || r.status === 403 || r.status === 429 || r.status === 503 ? 'bloqueado' : r.status === 404 || r.status === 410 ? 'quebrado' : 'erro'
    return { url, ...r, verdict }
  } catch (first) {
    // segunda tentativa como navegador: muitos servidores recusam clientes sem cabeçalhos típicos
    try {
      const r = await tryOnce('GET', true)
      const verdict = r.status < 400 ? 'ok' : r.status === 401 || r.status === 403 || r.status === 429 || r.status === 503 ? 'bloqueado' : r.status === 404 || r.status === 410 ? 'quebrado' : 'erro'
      return { url, ...r, verdict, retried: true }
    } catch (e) {
      const msg = String(e.cause?.message ?? e.message ?? e)
      if (/redirect/i.test(msg)) return { url, verdict: 'bloqueado', error: 'laço de redirecionamento (proteção anti-robô)' }
      // cadeia de certificado incompleta no servidor: navegadores completam a cadeia, o Node não
      if (/certificate|UNABLE_TO_VERIFY|self.signed/i.test(msg)) return { url, verdict: 'bloqueado', error: 'certificado incompleto no servidor (abre no navegador)' }
      return { url, verdict: 'falha-rede', error: e.name === 'AbortError' ? 'timeout' : msg }
    }
  }
}

/**
 * Falha passageira (5xx, conexão derrubada, timeout) não é link quebrado: servidores como o
 * GitHub limitam a taxa quando o acervo inteiro é checado de uma vez. Repete com espera
 * crescente antes de condenar a referência.
 */
const transient = (r) => r.verdict === 'falha-rede' || (r.verdict === 'erro' && r.status >= 500)

async function checkLinkResilient(url) {
  let last
  for (let attempt = 0; attempt < 3; attempt++) {
    last = await checkLink(url)
    if (!transient(last)) return last
    if (attempt < 2) await sleep(3000 * (attempt + 1))
  }
  return last
}

async function verify(ref) {
  const out = { id: ref.id, title: ref.title, year: ref.year, issues: [] }
  if (!args['no-crossref']) {
    if (ref.doi) {
      const cr = await crossrefWork(ref.doi)
      out.crossref = cr
      if (cr.status === 'ok') {
        const sim = similarity(ref.title, cr.title)
        out.titleSimilarity = Number(sim.toFixed(2))
        if (sim < 0.5) out.issues.push(`título diverge do Crossref: "${cr.title}"`)
        if (cr.year && Math.abs(cr.year - ref.year) > 1 && !ref.doiEdition) out.issues.push(`ano diverge do Crossref: ${cr.year}`)
      } else if (cr.status === 'doi-inexistente') out.issues.push('DOI não existe no Crossref')
    } else {
      const s = await crossrefSearch(ref)
      // doiIgnore: sugestões já revisadas e rejeitadas (resenhas, capítulos, outras edições)
      if (s && !(ref.doiIgnore ?? []).includes(s.doi)) out.suggestedDoi = s
    }
  }
  if (!args['no-links']) {
    out.links = []
    for (const l of ref.links ?? []) out.links.push({ label: l.label, type: l.type, ...(await checkLinkResilient(l.url)) })
    if (ref.doi) out.doiLink = await checkLinkResilient(`https://doi.org/${ref.doi}`)
    for (const l of out.links) if (l.verdict === 'quebrado') out.issues.push(`link quebrado (${l.status}): ${l.url}`)
    for (const l of out.links) if (l.verdict === 'falha-rede' || l.verdict === 'erro') out.issues.push(`link sem resposta (${l.status ?? l.error}): ${l.url}`)
  }
  out.verdict = out.issues.length ? 'revisar' : 'ok'
  return out
}

async function main() {
  const results = []
  let i = 0
  const worker = async () => {
    while (i < refs.length) {
      const ref = refs[i++]
      const r = await verify(ref)
      results.push(r)
      process.stdout.write(`${String(results.length).padStart(3)}/${refs.length} ${r.verdict === 'ok' ? '✓' : '!'} ${ref.id}\n`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  results.sort((a, b) => a.id.localeCompare(b.id))

  mkdirSync(OUT, { recursive: true })
  const stamp = new Date().toISOString()
  // rodadas parciais (--only, --no-links, --no-crossref) não sobrescrevem o relatório oficial nem os selos
  const partial = Boolean(only) || Boolean(args['no-links']) || Boolean(args['no-crossref'])
  const suffix = partial ? '-parcial' : ''
  writeFileSync(join(OUT, `report${suffix}.json`), JSON.stringify({ generatedAt: stamp, results }, null, 2))

  // resumo compacto consumido pela interface (selo "Verificado" em cada referência)
  if (!partial) {
    const items = Object.fromEntries(results.map((r) => [r.id, {
      verdict: r.verdict,
      doi: r.crossref ? (r.crossref.status === 'ok' || r.crossref.status === 'ok-outra-agencia' ? 'confirmado' : r.crossref.status === 'doi-inexistente' ? 'inexistente' : 'nao-checado') : 'sem-doi',
      linksOk: (r.links ?? []).filter((l) => l.verdict === 'ok').length,
      linksTotal: (r.links ?? []).length,
      blocked: (r.links ?? []).filter((l) => l.verdict === 'bloqueado').length,
      issues: r.issues,
    }]))
    writeFileSync(join(ROOT, 'src/features/references/verification.json'), JSON.stringify({ generatedAt: stamp, items }, null, 1))
  }

  const count = (f) => results.filter(f).length
  const links = results.flatMap((r) => r.links ?? [])
  const md = [
    '# Verificação do acervo',
    '',
    `Gerado em ${stamp} por \`scripts/verify-references.mjs\`.`,
    '',
    '| | |',
    '|---|---|',
    `| Referências verificadas | ${results.length} |`,
    `| Sem pendências | ${count((r) => r.verdict === 'ok')} |`,
    `| A revisar | ${count((r) => r.verdict === 'revisar')} |`,
    `| DOIs confirmados no Crossref | ${count((r) => r.crossref?.status === 'ok')} |`,
    `| DOIs sugeridos (referências sem DOI) | ${count((r) => r.suggestedDoi)} |`,
    `| Links OK | ${links.filter((l) => l.verdict === 'ok').length} de ${links.length} |`,
    `| Links bloqueados a robôs (abrir no navegador) | ${links.filter((l) => l.verdict === 'bloqueado').length} |`,
    `| Links quebrados | ${links.filter((l) => l.verdict === 'quebrado').length} |`,
    '',
    '## A revisar',
    '',
    ...results.filter((r) => r.verdict === 'revisar').flatMap((r) => [`### \`${r.id}\` — ${r.title} (${r.year})`, ...r.issues.map((x) => `- ${x}`), '']),
    '## DOIs sugeridos',
    '',
    ...results.filter((r) => r.suggestedDoi).map((r) => `- \`${r.id}\` → ${r.suggestedDoi.doi} (“${r.suggestedDoi.title}”, ${r.suggestedDoi.year})`),
    '',
    '## Links bloqueados a verificadores automáticos',
    '',
    ...results.flatMap((r) => (r.links ?? []).filter((l) => l.verdict === 'bloqueado').map((l) => `- \`${r.id}\` ${l.status} ${l.url}`)),
    '',
  ].join('\n')
  writeFileSync(join(OUT, `REPORT${suffix}.md`), md)
  console.log(`\n${count((r) => r.verdict === 'ok')} ok · ${count((r) => r.verdict === 'revisar')} a revisar → verification/REPORT${suffix}.md`)
}

main()
