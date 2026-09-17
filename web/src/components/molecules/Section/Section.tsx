import type { ReactNode } from 'react'
import styles from './Section.module.css'

export type SectionProps = { id: string; eyebrow: string; title: string; lead?: string; children: ReactNode }

export function Section({ id, eyebrow, title, lead, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={styles.section}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={`${id}-title`} className={styles.title}>{title}</h2>
        {lead && <p className={styles.lead}>{lead}</p>}
      </header>
      {children}
    </section>
  )
}
