import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeProps = { tone?: 'neutral' | 'brand' | 'teal' | 'gold'; children: ReactNode }

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>
}
