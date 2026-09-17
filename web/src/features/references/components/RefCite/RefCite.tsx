import { href } from '@/lib/router'
import { shortAuthors } from '@/lib/format'
import { getRefs } from '@/features/xref'
import styles from './RefCite.module.css'

export type RefCiteProps = { ids: string[] }

/** Citações inline "Autor (ano)" que levam à página da referência. */
export function RefCite({ ids }: RefCiteProps) {
  const refs = getRefs(ids)
  return (
    <span className={styles.cites}>
      {refs.map((r) => (
        <a key={r.id} href={href('ref', r.id)} className={styles.cite} title={r.title}>
          {shortAuthors(r.authors)}, {r.year}
        </a>
      ))}
    </span>
  )
}
