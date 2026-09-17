import { href } from '@/lib/router'
import { useProgress } from '@/lib/progress'
import { CONCEPTS, GROUP_LABEL, GROUP_ORDER } from '../../data'
import styles from './ProgressSummary.module.css'

export function ProgressSummary() {
  const { isStudied, studiedCount, reset } = useProgress()
  const total = CONCEPTS.length
  const groups = GROUP_ORDER.map((g) => {
    const items = CONCEPTS.filter((c) => c.group === g)
    return { g, total: items.length, done: items.filter((c) => isStudied(c.id)).length }
  }).filter((x) => x.total > 0)
  const next = CONCEPTS.slice().sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)).find((c) => !isStudied(c.id))

  return (
    <section className={styles.panel} aria-labelledby="progress-title">
      <div className={styles.head}>
        <div>
          <h2 id="progress-title" className={styles.title}>Seu progresso</h2>
          <p className={styles.sub}>{studiedCount} de {total} conceitos estudados · salvo só neste navegador</p>
        </div>
        <div className={styles.actions}>
          {next && <a className={styles.primary} href={href('fundamentos', next.id)}>{studiedCount ? 'Continuar' : 'Começar'}: {next.name} →</a>}
          <a className={styles.secondary} href={href('revisao')}>Revisar exercícios</a>
          {studiedCount > 0 && <button type="button" className={styles.reset} onClick={() => { if (window.confirm('Apagar todo o progresso salvo neste navegador?')) reset() }}>Zerar</button>}
        </div>
      </div>
      <div className={styles.bar} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={studiedCount} aria-label="Conceitos estudados">
        <span style={{ width: `${(studiedCount / total) * 100}%` }} />
      </div>
      <ol className={styles.groups}>
        {groups.map((x, i) => (
          <li key={x.g} className={x.done === x.total ? styles.complete : undefined} title={`${GROUP_LABEL[x.g]}: ${x.done}/${x.total}`}>
            <span className={styles.step}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.mini}><span style={{ width: `${(x.done / x.total) * 100}%` }} /></span>
            <span className={styles.count}>{x.done}/{x.total}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
