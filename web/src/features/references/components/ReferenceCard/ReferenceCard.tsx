import { Badge } from '@/components/atoms/Badge'
import { ExternalLink } from '@/components/atoms/ExternalLink'
import { CopyButton } from '@/components/molecules/CopyButton'
import { VerifyBadge } from '../VerifyBadge'
import { href } from '@/lib/router'
import { ACCESS_LABEL, citation, KIND_LABEL, scholarUrl, themeLabel, type Reference, type RefLink } from '../../model'
import styles from './ReferenceCard.module.css'

export type ReferenceCardProps = { reference: Reference; variant?: 'list' | 'full' }

const GROUPS: { type: RefLink['type']; label: string }[] = [
  { type: 'texto', label: 'Ler' },
  { type: 'preview', label: 'Prévia' },
  { type: 'material', label: 'Apoio' },
]

const ACCESS_TONE = { livre: 'teal', parcial: 'gold', pago: 'neutral' } as const

export function ReferenceCard({ reference: r, variant = 'list' }: ReferenceCardProps) {
  const TitleTag = variant === 'full' ? 'h1' : 'h3'
  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.year}>
        <span>{r.year}</span>
        {r.essential && <span className={styles.star} title="Essencial">★</span>}
      </div>
      <div className={styles.main}>
        <div className={styles.badges}>
          <Badge tone={r.kind === 'livro' ? 'brand' : 'neutral'}>{KIND_LABEL[r.kind]}</Badge>
          <Badge tone="neutral">{r.layer === 'fundador' ? 'Fundador' : 'Moderno'}</Badge>
          <Badge tone={ACCESS_TONE[r.access]}>{ACCESS_LABEL[r.access]}</Badge>
        </div>
        <TitleTag className={styles.title}>
          {variant === 'list' ? <a href={href('ref', r.id)}>{r.title}</a> : r.title}
        </TitleTag>
        <p className={styles.authors}>{r.authors}</p>
        <p className={styles.venue}>{r.venue}</p>
        <p className={styles.why}>{r.why}</p>
        {r.notes && <p className={styles.notes}>{r.notes}</p>}
        <ul className={styles.themes} aria-label="Temas">
          {r.themes.map((t) => <li key={t}>{themeLabel(t)}</li>)}
        </ul>
        {r.links.length > 0 && (
          <div className={styles.links}>
            {GROUPS.map((g) => {
              const items = r.links.filter((l) => l.type === g.type)
              if (items.length === 0) return null
              return (
                <div key={g.type} className={styles.linkRow}>
                  <span className={styles.linkLabel}>{g.label}</span>
                  <div className={styles.linkList}>
                    {items.map((l) => <ExternalLink key={l.url} href={l.url}>{l.label}</ExternalLink>)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className={styles.actions}>
          {r.doi && <ExternalLink href={`https://doi.org/${r.doi}`} title={r.doiEdition}>DOI{r.doiEdition ? ' (outra edição)' : ''}</ExternalLink>}
          <ExternalLink href={scholarUrl(r)}>Google Scholar</ExternalLink>
          <CopyButton text={citation(r)} />
          {variant === 'list' && <a href={href('ref', r.id)} className={styles.more}>Conexões →</a>}
        </div>
        <VerifyBadge id={r.id} hasDoi={Boolean(r.doi)} />
      </div>
    </article>
  )
}
