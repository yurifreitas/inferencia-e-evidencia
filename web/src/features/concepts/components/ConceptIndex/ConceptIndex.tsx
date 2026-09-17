import { href } from '@/lib/router'
import { CONCEPTS, GROUP_LABEL, GROUP_ORDER } from '../../data'
import { useProgress } from '@/lib/progress'
import styles from './ConceptIndex.module.css'

export type ConceptIndexProps = { activeId?: string }

export function ConceptIndex({ activeId }: ConceptIndexProps) {
  const { isStudied } = useProgress()
  return (
    <nav aria-label="Conceitos" className={styles.index}>
      {GROUP_ORDER.filter((g) => CONCEPTS.some((c) => c.group === g)).map((g) => (
        <div key={g} className={styles.group}>
          <p className={styles.groupLabel}>{GROUP_LABEL[g]}</p>
          <ul>
            {CONCEPTS.filter((c) => c.group === g).map((c) => (
              <li key={c.id}>
                <a href={href('fundamentos', c.id)} aria-current={c.id === activeId ? 'page' : undefined} className={styles.link}>
                  {c.name}
                  {isStudied(c.id) && <span className={styles.check} aria-label="estudado">✓</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
