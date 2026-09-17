import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

export type EmptyStateProps = { title: string; description: string; action?: ReactNode }

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.empty} role="status">
      <div className={styles.glyph} aria-hidden="true"><span /><span /><span /><span /></div>
      <p className={styles.title}>{title}</p>
      <p className={styles.desc}>{description}</p>
      {action}
    </div>
  )
}
