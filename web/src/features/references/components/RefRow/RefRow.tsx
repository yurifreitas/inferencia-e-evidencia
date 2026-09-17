import { href } from '@/lib/router'
import { shortAuthors } from '@/lib/format'
import type { Reference } from '../../model'
import styles from './RefRow.module.css'

export type RefRowProps = { reference: Reference; note?: string }

const ACCESS_DOT = { livre: styles.free, parcial: styles.partial, pago: styles.paid }
const ACCESS_TITLE = { livre: 'Texto completo grátis', parcial: 'Acesso parcial', pago: 'Pago / biblioteca' }

export function RefRow({ reference: r, note }: RefRowProps) {
  return (
    <a href={href('ref', r.id)} className={styles.row}>
      <span className={styles.year}>{r.year}</span>
      <span className={styles.body}>
        <span className={styles.title}>{r.title}</span>
        <span className={styles.meta}>
          {shortAuthors(r.authors)}
          {note && <> · <em>{note}</em></>}
        </span>
      </span>
      <span className={`${styles.dot} ${ACCESS_DOT[r.access]}`} title={ACCESS_TITLE[r.access]} aria-label={ACCESS_TITLE[r.access]} />
    </a>
  )
}
