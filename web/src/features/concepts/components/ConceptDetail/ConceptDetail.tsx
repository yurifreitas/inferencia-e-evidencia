import { Formula } from '@/components/atoms/Formula'
import { Callout } from '@/components/molecules/Callout'
import { href } from '@/lib/router'
import { getConcepts, getRefs } from '@/features/xref'
import { RefRow } from '@/features/references/components/RefRow'
import { DEBATES } from '@/features/debates/data'
import { GROUP_LABEL } from '../../data'
import { getDeep } from '../../deep'
import { misconceptionsForConcept } from '@/features/misconceptions/model'
import { WIDGETS } from '@/features/lab/components/sims'
import { ConceptDeepSections } from '../ConceptDeepSections'
import { StudyToggle } from '../StudyToggle'
import type { Concept } from '../../model'
import styles from './ConceptDetail.module.css'

export type ConceptDetailProps = { concept: Concept }

export function ConceptDetail({ concept: c }: ConceptDetailProps) {
  const refs = getRefs(c.refIds).sort((a, b) => a.year - b.year)
  const related = getConcepts(c.related)
  const debates = DEBATES.filter((d) => d.conceptIds.includes(c.id))
  const deep = getDeep(c.id)
  const myths = misconceptionsForConcept(c.id)

  return (
    <article className={styles.detail}>
      <header className={styles.header}>
        <p className={styles.group}>{GROUP_LABEL[c.group]}</p>
        <h1 className={styles.name}>{c.name}</h1>
        {c.aka.length > 0 && <p className={styles.aka}>também: {c.aka.join(' · ')}</p>}
        <div className={styles.headActions}><StudyToggle id={c.id} /></div>
      </header>

      {c.formula && <Formula size="lg">{c.formula}</Formula>}

      <p className={styles.definition}>{c.definition}</p>

      <Callout label="Intuição">{c.intuition}</Callout>

      <section className={styles.section}>
        <h2 className={styles.h2}>Origem</h2>
        <p className={styles.prose}>{c.origin}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Armadilhas</h2>
        <ul className={styles.pitfalls}>
          {c.pitfalls.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </section>

      {myths.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.h2}>Equívocos comuns</h2>
          <ul className={styles.myths}>
            {myths.map((m) => (
              <li key={m.id}><a href={href('equivocos', m.id)}><s>{m.myth}</s><span>{m.reality}</span></a></li>
            ))}
          </ul>
        </section>
      )}

      {c.widget && (() => { const W = WIDGETS[c.widget].Component; return <section className={styles.section}><h2 className={styles.h2}>Experimente</h2><W /></section> })()}

      {deep && <ConceptDeepSections deep={deep} />}

      {(c.lab || debates.length > 0) && (
        <div className={styles.actions}>
          {c.lab && <a href={href('laboratorio')} className={styles.primary}>Experimentar no laboratório →</a>}
          {debates.map((d) => <a key={d.id} href={`${href('debates')}#${d.id}`} className={styles.secondary}>Debate: {d.title}</a>)}
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.h2}>Fundamentação <span>{refs.length} referências</span></h2>
        <div>{refs.map((r) => <RefRow key={r.id} reference={r} />)}</div>
      </section>

      {related.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.h2}>Conceitos relacionados</h2>
          <ul className={styles.related}>
            {related.map((r) => (
              <li key={r.id}>
                <a href={href('fundamentos', r.id)} className={styles.relatedCard}>
                  <span className={styles.relatedName}>{r.name}</span>
                  {r.formula && <code className={styles.relatedFormula}>{r.formula.split('\n')[0]}</code>}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
