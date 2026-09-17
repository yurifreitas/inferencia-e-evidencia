import type { ReactNode } from 'react'
import styles from './Callout.module.css'

export type CalloutProps = { label: string; tone?: 'teal' | 'gold' | 'brand'; children: ReactNode }

export function Callout({ label, tone = 'teal', children }: CalloutProps) {
  return (
    <aside className={`${styles.callout} ${styles[tone]}`}>
      <p className={styles.label}>{label}</p>
      <div className={styles.body}>{children}</div>
    </aside>
  )
}
