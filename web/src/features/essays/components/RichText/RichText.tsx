import { Fragment } from 'react'
import { href } from '@/lib/router'
import { shortAuthors } from '@/lib/format'
import { conceptsById, refsById } from '@/features/xref'
import { ROOT_EVENTS } from '@/features/roots/data'
import { DEBATES } from '@/features/debates/data'
import styles from './RichText.module.css'

const TOKEN = /\[\[(ref|conceito|raiz|debate):([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g

/** Texto com marcações [[ref:id]], [[conceito:id|rótulo]], [[raiz:id]], [[debate:id]] transformadas em links. */
export function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(TOKEN)) {
    const [whole, kind, id, label] = m
    if (m.index! > last) parts.push(text.slice(last, m.index))
    last = m.index! + whole.length
    if (kind === 'ref') {
      const r = refsById.get(id)
      parts.push(r
        ? <a key={last} href={href('ref', id)} className={styles.cite} title={r.title}>{label ?? `${shortAuthors(r.authors)}, ${r.year}`}</a>
        : label ?? '')
    } else if (kind === 'conceito') {
      const c = conceptsById.get(id)
      parts.push(c ? <a key={last} href={href('fundamentos', id)} className={styles.concept}>{label ?? c.name}</a> : label ?? '')
    } else if (kind === 'raiz') {
      const e = ROOT_EVENTS.find((x) => x.id === id)
      parts.push(e ? <a key={last} href={href('raizes', id)} className={styles.root}>{label ?? e.title}</a> : label ?? '')
    } else {
      const d = DEBATES.find((x) => x.id === id)
      parts.push(d ? <a key={last} href={`${href('debates')}#${id}`} className={styles.concept}>{label ?? d.title}</a> : label ?? '')
    }
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>
}
