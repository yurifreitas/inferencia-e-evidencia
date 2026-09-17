import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

export type PageHeaderProps = { eyebrow: string; title: string; lead?: ReactNode; aside?: ReactNode }

export function PageHeader({ eyebrow, title, lead, aside }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
      </div>
      {aside && <div className={styles.aside}>{aside}</div>}
    </header>
  )
}
