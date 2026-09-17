import { getVerification, verificationDate } from '../../verification'
import styles from './VerifyBadge.module.css'

export type VerifyBadgeProps = { id: string; hasDoi: boolean }

export function VerifyBadge({ id, hasDoi }: VerifyBadgeProps) {
  const v = getVerification(id)
  const date = verificationDate()
  if (!v || !date) return null
  const ok = v.verdict === 'ok'
  const parts = [
    hasDoi ? (v.doi === 'confirmado' ? 'DOI confirmado no Crossref' : 'DOI não confirmado') : null,
    v.linksTotal ? `${v.linksOk} de ${v.linksTotal} links respondendo` : null,
    v.blocked ? `${v.blocked} bloqueado(s) a robôs` : null,
  ].filter(Boolean)
  return (
    <details className={`${styles.badge} ${ok ? styles.ok : styles.review}`}>
      <summary>
        <span className={styles.dot} aria-hidden="true" />
        {ok ? 'Verificado' : 'Pendência na verificação'} · {date}
      </summary>
      <div className={styles.body}>
        {parts.length > 0 && <p>{parts.join(' · ')}</p>}
        {v.issues.length > 0 && <ul>{v.issues.map((i) => <li key={i}>{i}</li>)}</ul>}
        <p className={styles.note}>Checagem automática por <code>npm run verify:refs</code>. Links "bloqueados" costumam abrir normalmente no navegador.</p>
      </div>
    </details>
  )
}
