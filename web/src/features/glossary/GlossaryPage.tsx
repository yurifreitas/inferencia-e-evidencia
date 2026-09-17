import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { TextInput } from '@/components/atoms/TextInput'
import { href } from '@/lib/router'
import { normalize } from '@/lib/search'
import { CONCEPTS, GROUP_LABEL } from '@/features/concepts/data'
import styles from './GlossaryPage.module.css'

type Entry = { term: string; conceptId: string; conceptName: string; group: string; definition: string; isMain: boolean }

// Cada conceito vira uma entrada principal; cada sinônimo (inclusive os termos em inglês) vira uma remissiva.
const ENTRIES: Entry[] = CONCEPTS.flatMap((c) => [
  { term: c.name, conceptId: c.id, conceptName: c.name, group: GROUP_LABEL[c.group], definition: c.definition, isMain: true },
  ...c.aka.map((a) => ({ term: a, conceptId: c.id, conceptName: c.name, group: GROUP_LABEL[c.group], definition: c.definition, isMain: false })),
]).sort((a, b) => normalize(a.term).localeCompare(normalize(b.term), 'pt-BR'))

const firstLetter = (t: string) => {
  const ch = normalize(t).replace(/^[^a-z0-9]+/, '')[0] ?? '#'
  return /[a-z]/.test(ch) ? ch.toUpperCase() : '#'
}

export function GlossaryPage() {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const nq = normalize(q.trim())
    return nq ? ENTRIES.filter((e) => normalize(`${e.term} ${e.conceptName} ${e.definition}`).includes(nq)) : ENTRIES
  }, [q])
  const letters = useMemo(() => {
    const map = new Map<string, Entry[]>()
    for (const e of list) {
      const l = firstLetter(e.term)
      map.set(l, [...(map.get(l) ?? []), e])
    }
    return [...map.entries()]
  }, [list])

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Glossário"
        title="Termos em português e inglês"
        lead={`${ENTRIES.length} termos: cada conceito e seus sinônimos, incluindo os nomes em inglês usados em artigos e bibliotecas (recall, fall-out, AUROC, confounding…). Remissivas apontam para o conceito principal.`}
      />
      <div className={styles.search}>
        <label htmlFor="glossary-q" className="sr-only">Buscar termo</label>
        <span className={styles.icon} aria-hidden="true">⌕</span>
        <TextInput id="glossary-q" type="search" placeholder="Buscar termo, em português ou inglês" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <nav className={styles.letters} aria-label="Letras">
        {letters.map(([l]) => <a key={l} href={`#letra-${l}`} onClick={(e) => { e.preventDefault(); document.getElementById(`letra-${l}`)?.scrollIntoView({ behavior: 'smooth' }) }}>{l}</a>)}
      </nav>
      {letters.length === 0 && <p className={styles.empty}>Nenhum termo encontrado para “{q}”.</p>}
      <div className={styles.sections}>
        {letters.map(([l, entries]) => (
          <section key={l} id={`letra-${l}`} className={styles.section}>
            <h2 className={styles.letter}>{l}</h2>
            <dl className={styles.list}>
              {entries.map((e) => (
                <div key={`${e.term}-${e.conceptId}`} className={styles.entry}>
                  <dt>
                    <a href={href('fundamentos', e.conceptId)} className={e.isMain ? styles.main : styles.alias}>{e.term}</a>
                    {!e.isMain && <span className={styles.see}> → {e.conceptName}</span>}
                  </dt>
                  {e.isMain && <dd><span className={styles.group}>{e.group}</span> {e.definition}</dd>}
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}
