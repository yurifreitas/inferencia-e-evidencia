import { useState } from 'react'
import { href } from '@/lib/router'
import { shortAuthors } from '@/lib/format'
import { refsById } from '@/features/xref'
import { PATHS } from '../../data'
import styles from './ReadingPaths.module.css'

export function ReadingPaths() {
  const [active, setActive] = useState(PATHS[0].id)
  const path = PATHS.find((p) => p.id === active) ?? PATHS[0]

  return (
    <div className={styles.wrap}>
      <div role="tablist" aria-label="Trilhas de leitura" className={styles.tabs}>
        {PATHS.map((p) => (
          <button
            key={p.id}
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={p.id === active}
            aria-controls="path-panel"
            className={styles.tab}
            onClick={() => setActive(p.id)}
          >
            <span className={styles.tabTitle}>{p.title}</span>
            <span className={styles.tabCount}>{p.steps.length} leituras</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id="path-panel" aria-labelledby={`tab-${path.id}`} className={styles.panel}>
        <p className={styles.summary}>{path.summary}</p>
        <ol className={styles.steps}>
          {path.steps.map((s, i) => {
            const ref = refsById.get(s.refId)
            if (!ref) return null
            return (
              <li key={s.refId} className={styles.step}>
                <span className={styles.num}>{i + 1}</span>
                <div className={styles.body}>
                  <a href={href('ref', ref.id)} className={styles.refTitle}>{ref.title}</a>
                  <p className={styles.meta}>{shortAuthors(ref.authors)} · {ref.year}</p>
                  <p className={styles.note}>{s.note}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
