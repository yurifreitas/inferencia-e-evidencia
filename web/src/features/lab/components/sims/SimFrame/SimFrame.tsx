import type { ReactNode } from 'react'
import styles from './SimFrame.module.css'

export type SimFrameProps = { title: string; question: string; controls: ReactNode; stats?: ReactNode; children: ReactNode; takeaway?: ReactNode }

/** Moldura comum dos simuladores: pergunta, controles, gráfico, números e a lição. */
export function SimFrame({ title, question, controls, stats, children, takeaway }: SimFrameProps) {
  return (
    <figure className={styles.frame}>
      <figcaption className={styles.head}>
        <p className={styles.title}>{title}</p>
        <p className={styles.question}>{question}</p>
      </figcaption>
      <div className={styles.body}>
        <div className={styles.controls}>{controls}</div>
        <div className={styles.chart}>{children}</div>
      </div>
      {stats && <div className={styles.stats}>{stats}</div>}
      {takeaway && <p className={styles.takeaway}>{takeaway}</p>}
    </figure>
  )
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div className={`${styles.stat} ${tone ? styles[tone] : ''}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
