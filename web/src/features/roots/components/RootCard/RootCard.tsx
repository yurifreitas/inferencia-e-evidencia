import { Badge } from '@/components/atoms/Badge'
import { href } from '@/lib/router'
import { getConcepts } from '@/features/xref'
import { RefCite } from '@/features/references/components/RefCite'
import { hasStudy } from '../../studies'
import { CERTAINTY_LABEL, REGION_LABEL, type RootEvent } from '../../model'
import styles from './RootCard.module.css'

export type RootCardProps = { event: RootEvent; selected: boolean }

const TONE = { estabelecido: 'teal', interpretacao: 'gold', especulativo: 'neutral' } as const

export function RootCard({ event: e, selected }: RootCardProps) {
  return (
    <article id={`raiz-${e.id}`} className={`${styles.card} ${selected ? styles.selected : ''}`}>
      <div className={styles.when}>
        <span className={styles.year}>{e.yearLabel}</span>
        <span className={styles.place}>{e.place}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.badges}>
          <Badge tone="brand">{REGION_LABEL[e.region]}</Badge>
          <Badge tone={TONE[e.certainty]}>{CERTAINTY_LABEL[e.certainty]}</Badge>
        </div>
        <h3 className={styles.title}><a href={href('raizes', e.id)}>{e.title}</a></h3>
        <p className={styles.summary}>{e.summary}</p>
        <div className={styles.connection}>
          <p className={styles.label}>O que antecipa</p>
          <p>{e.connection}</p>
        </div>
        {e.caution && <p className={styles.caution}><strong>Cautela:</strong> {e.caution}</p>}
        <a href={href('raizes', e.id)} className={styles.more}>{hasStudy(e.id) ? 'Estudo completo →' : 'Abrir marco →'}</a>
        <div className={styles.foot}>
          {e.refIds.length > 0 && <div className={styles.sources}><span>Fontes</span><RefCite ids={e.refIds} /></div>}
          {e.conceptIds.length > 0 && (
            <ul className={styles.concepts}>
              {getConcepts(e.conceptIds).map((c) => <li key={c.id}><a href={href('fundamentos', c.id)}>{c.name}</a></li>)}
            </ul>
          )}
        </div>
      </div>
    </article>
  )
}
