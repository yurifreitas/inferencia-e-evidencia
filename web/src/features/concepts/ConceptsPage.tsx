import { PageHeader } from '@/components/molecules/PageHeader'
import { href } from '@/lib/router'
import { conceptsById } from '@/features/xref'
import { CONCEPTS, GROUP_DESC, GROUP_LABEL, GROUP_ORDER } from './data'
import { ConceptIndex } from './components/ConceptIndex'
import { ConceptDetail } from './components/ConceptDetail'
import { ProgressSummary } from './components/ProgressSummary'
import { useProgress } from '@/lib/progress'
import styles from './ConceptsPage.module.css'

export type ConceptsPageProps = { id?: string }

export function ConceptsPage({ id }: ConceptsPageProps) {
  const concept = id ? conceptsById.get(id) : undefined
  const { isStudied } = useProgress()

  return (
    <div className={styles.layout}>
      <aside className={styles.aside}>
        <ConceptIndex activeId={concept?.id} />
      </aside>
      <div className={styles.content}>
        {concept ? (
          <ConceptDetail concept={concept} />
        ) : (
          <>
            <PageHeader
              eyebrow="Fundamentos"
              title="Os conceitos por trás da matriz"
              lead={`${CONCEPTS.length} conceitos em ${GROUP_ORDER.length} etapas, na ordem sugerida de estudo. Cada um tem fórmula, intuição, origem histórica, armadilhas, derivação, exercícios e as referências que o fundamentam.`}
            />
            <ProgressSummary />
            <div className={styles.groups}>
              {GROUP_ORDER.filter((g) => CONCEPTS.some((c) => c.group === g)).map((g, gi) => (
                <section key={g} className={styles.group}>
                  <header className={styles.groupHead}>
                    <span className={styles.step}>{String(gi + 1).padStart(2, '0')}</span>
                    <div><h2 className={styles.groupTitle}>{GROUP_LABEL[g]}</h2><p className={styles.groupDesc}>{GROUP_DESC[g]}</p></div>
                  </header>
                  <ul className={styles.grid}>
                    {CONCEPTS.filter((c) => c.group === g).map((c) => (
                      <li key={c.id}>
                        <a href={href('fundamentos', c.id)} className={styles.card}>
                          <span className={styles.cardName}>{isStudied(c.id) && <span className={styles.done} aria-label="estudado">✓ </span>}{c.name}</span>
                          {c.formula && <code className={styles.cardFormula}>{c.formula.split('\n')[0]}</code>}
                          <span className={styles.cardDef}>{c.definition}</span>
                          <span className={styles.cardMeta}>{c.refIds.length} referências{c.widget ? ' · simulador' : c.lab ? ' · no laboratório' : ''}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
