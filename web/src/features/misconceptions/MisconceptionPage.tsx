import { EmptyState } from '@/components/molecules/EmptyState'
import { MathSteps } from '@/components/molecules/MathSteps'
import { href } from '@/lib/router'
import { getConcepts, getRefs } from '@/features/xref'
import { RefRow } from '@/features/references/components/RefRow'
import { RefCite } from '@/features/references/components/RefCite'
import { FrequencyTree } from '@/features/lab/components/FrequencyTree'
import { CATEGORY_LABEL, getMisconception, MISCONCEPTIONS } from './model'
import styles from './MisconceptionPage.module.css'

export type MisconceptionPageProps = { id: string }

export function MisconceptionPage({ id }: MisconceptionPageProps) {
  const m = getMisconception(id)
  if (!m) {
    return <EmptyState title="Equívoco não encontrado" description="Esse link não corresponde a nenhum equívoco." action={<a href={href('equivocos')}>Ver todos</a>} />
  }
  const idx = MISCONCEPTIONS.indexOf(m)
  const next = MISCONCEPTIONS[(idx + 1) % MISCONCEPTIONS.length]
  const refs = getRefs(m.refIds).sort((a, b) => a.year - b.year)
  const concepts = getConcepts(m.conceptIds)

  return (
    <article className={styles.page}>
      <nav aria-label="Trilha" className={styles.crumbs}>
        <a href={href('equivocos')}>Equívocos de hoje</a><span aria-hidden="true">/</span><span>{CATEGORY_LABEL[m.category]}</span>
      </nav>

      <header className={styles.header}>
        <p className={styles.mythLabel}>O que se costuma dizer</p>
        <h1 className={styles.myth}>“{m.myth}”</h1>
        <div className={styles.reality}>
          <p className={styles.realityLabel}>O que é verdade</p>
          <p className={styles.realityText}>{m.reality}</p>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.h2}>Por que o erro acontece</h2>
            <p className={styles.prose}>{m.whyItHappens}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>A explicação</h2>
            {m.explanation.map((p, i) => <p key={i} className={styles.prose}>{p}</p>)}
          </section>

          {m.numbers && (
            <section className={styles.section}>
              <h2 className={styles.h2}>Em números inteiros</h2>
              {m.numbers.prevalence !== undefined && m.numbers.sensitivity !== undefined && m.numbers.specificity !== undefined ? (
                <FrequencyTree {...m.numbers} prevalence={m.numbers.prevalence} sensitivity={m.numbers.sensitivity} specificity={m.numbers.specificity} />
              ) : (
                m.numbers.caption && <p className={styles.numbersCaption}>{m.numbers.caption}</p>
              )}
            </section>
          )}

          {m.worked && m.worked.length > 0 && (
            <section className={`${styles.section} ${styles.worked}`}>
              <h2 className={styles.h2}>A conta, passo a passo</h2>
              <MathSteps steps={m.worked} />
            </section>
          )}

          {m.cases.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.h2}>Casos reais</h2>
              <ol className={styles.cases}>
                {m.cases.map((c) => (
                  <li key={c.title} className={styles.case}>
                    <p className={styles.caseYear}>{c.year}</p>
                    <h3 className={styles.caseTitle}>{c.title}</h3>
                    <p className={styles.caseText}>{c.summary}</p>
                    {c.refIds.length > 0 && <RefCite ids={c.refIds} />}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <a href={href('equivocos', next.id)} className={styles.next}>
            <span>Próximo equívoco →</span><strong>“{next.myth}”</strong>
          </a>
        </div>

        <aside className={styles.aside}>
          <section className={styles.checklist}>
            <h2 className={styles.boxTitle}>Ao ler um número assim, pergunte</h2>
            <ol>
              {m.howToRead.map((q) => <li key={q}>{q}</li>)}
            </ol>
          </section>
          {concepts.length > 0 && (
            <section className={styles.box}>
              <h2 className={styles.boxTitle}>Conceitos para entender</h2>
              <ul className={styles.links}>
                {concepts.map((c) => (
                  <li key={c.id}><a href={href('fundamentos', c.id)}><span>{c.name}</span>{c.formula && <code>{c.formula.split('\n')[0]}</code>}</a></li>
                ))}
              </ul>
            </section>
          )}
          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Fontes <span>{refs.length}</span></h2>
            <div>{refs.map((r) => <RefRow key={r.id} reference={r} />)}</div>
          </section>
        </aside>
      </div>
    </article>
  )
}
