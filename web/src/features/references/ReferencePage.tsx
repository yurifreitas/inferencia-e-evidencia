import { EmptyState } from '@/components/molecules/EmptyState'
import { href } from '@/lib/router'
import { conceptsForRef, debatesForRef, pathsForRef, refsById, relatedRefs } from '@/features/xref'
import { ReferenceCard } from './components/ReferenceCard'
import { RefRow } from './components/RefRow'
import styles from './ReferencePage.module.css'

export type ReferencePageProps = { id: string }

export function ReferencePage({ id }: ReferencePageProps) {
  const ref = refsById.get(id)
  if (!ref) {
    return (
      <div className={styles.page}>
        <EmptyState title="Referência não encontrada" description="Esse link não corresponde a nenhuma referência do acervo." action={<a href={href('acervo')}>Ver acervo</a>} />
      </div>
    )
  }
  const concepts = conceptsForRef(id)
  const debates = debatesForRef(id)
  const paths = pathsForRef(id)
  const related = relatedRefs(ref, 8)

  return (
    <div className={styles.page}>
      <nav aria-label="Trilha" className={styles.crumbs}>
        <a href={href('acervo')}>Acervo</a>
        <span aria-hidden="true">/</span>
        <span>{ref.year}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.main}>
          <ReferenceCard reference={ref} variant="full" />
          <section className={styles.related}>
            <h2 className={styles.h2}>Leia junto</h2>
            <p className={styles.sub}>Referências citadas nos mesmos conceitos ou que compartilham temas.</p>
            <div className={styles.relatedGrid}>
              {related.map((r) => <RefRow key={r.id} reference={r} />)}
            </div>
          </section>
        </div>

        <aside className={styles.aside}>
          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Fundamenta <span>{concepts.length}</span></h2>
            {concepts.length ? (
              <ul className={styles.links}>
                {concepts.map((c) => (
                  <li key={c.id}>
                    <a href={href('fundamentos', c.id)}>
                      <span>{c.name}</span>
                      {c.formula && <code>{c.formula.split('\n')[0]}</code>}
                    </a>
                  </li>
                ))}
              </ul>
            ) : <p className={styles.muted}>Ainda não ligada a um conceito.</p>}
          </section>

          {debates.length > 0 && (
            <section className={styles.box}>
              <h2 className={styles.boxTitle}>Debates <span>{debates.length}</span></h2>
              <ul className={styles.links}>
                {debates.map((d) => (
                  <li key={d.id}><a href={`${href('debates')}#${d.id}`}><span>{d.title}</span><code>{d.question}</code></a></li>
                ))}
              </ul>
            </section>
          )}

          {paths.length > 0 && (
            <section className={styles.box}>
              <h2 className={styles.boxTitle}>Trilhas <span>{paths.length}</span></h2>
              <ul className={styles.links}>
                {paths.map((p) => {
                  const step = p.steps.findIndex((s) => s.refId === id) + 1
                  return <li key={p.id}><a href={href('trilhas')}><span>{p.title}</span><code>leitura {step} de {p.steps.length}</code></a></li>
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
