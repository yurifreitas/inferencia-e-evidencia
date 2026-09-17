import { PageHeader } from '@/components/molecules/PageHeader'
import { EmptyState } from '@/components/molecules/EmptyState'
import { href } from '@/lib/router'
import { ESSAYS } from './model'
import styles from './EssaysPage.module.css'

export function EssaysPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Ensaios"
        title="Leituras que ligam tudo"
        lead="Textos longos que atravessam raízes, conceitos, debates e referências — cada afirmação aponta para a fonte."
      />
      {ESSAYS.length === 0 ? (
        <EmptyState title="Os ensaios estão sendo escritos" description="Volte em breve: eles serão gerados a partir do acervo já verificado." />
      ) : (
        <ul className={styles.list}>
          {ESSAYS.map((e, i) => (
            <li key={e.id}>
              <a href={href('ensaios', e.id)} className={styles.card}>
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.body}>
                  <span className={styles.title}>{e.title}</span>
                  <span className={styles.subtitle}>{e.subtitle}</span>
                  <span className={styles.meta}>{e.readingMinutes} min de leitura · {e.sections.length} seções · {e.refIds.length} fontes</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
