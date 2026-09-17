import { MathSteps } from '@/components/molecules/MathSteps'
import { RefCite } from '@/features/references/components/RefCite'
import type { ConceptDeep } from '../../deep'
import styles from './ConceptDeepSections.module.css'

export type ConceptDeepSectionsProps = { deep: ConceptDeep }

const Steps = MathSteps

export function ConceptDeepSections({ deep }: ConceptDeepSectionsProps) {
  return (
    <>
      {deep.derivation && deep.derivation.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.h2}>Derivação passo a passo</h2>
          <Steps steps={deep.derivation} />
        </section>
      )}

      {deep.example && (
        <section className={`${styles.section} ${styles.example}`}>
          <h2 className={styles.h2}>Exemplo resolvido</h2>
          <p className={styles.setup}>{deep.example.setup}</p>
          <Steps steps={deep.example.steps} />
          <p className={styles.result}><span>Resultado</span>{deep.example.result}</p>
        </section>
      )}

      {deep.properties && deep.properties.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.h2}>Propriedades</h2>
          <ul className={styles.props}>{deep.properties.map((p) => <li key={p}>{p}</li>)}</ul>
        </section>
      )}

      {deep.originalText && (
        <figure className={styles.original}>
          <blockquote>{deep.originalText.quote}</blockquote>
          {deep.originalText.translation && <p className={styles.translation}>{deep.originalText.translation}</p>}
          <figcaption>
            {deep.originalText.note}
            {deep.originalText.refId && <RefCite ids={[deep.originalText.refId]} />}
          </figcaption>
        </figure>
      )}

      {deep.exercises && deep.exercises.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.h2}>Exercícios</h2>
          <ol className={styles.exercises}>
            {deep.exercises.map((ex, i) => (
              <li key={i} className={styles.exercise}>
                <p className={styles.question}><span>{i + 1}</span>{ex.question}</p>
                <details className={styles.details}>
                  <summary>Ver resposta</summary>
                  <p className={styles.answer}><strong>Resposta:</strong> {ex.answer}</p>
                  <p className={styles.solution}>{ex.solution}</p>
                </details>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
