import { int, pct } from '@/lib/format'
import type { Counts } from '../../model'
import styles from './ConfusionGrid.module.css'

export type ConfusionGridProps = { counts: Counts; editable?: boolean; onChange?: (c: Counts) => void }

const CELLS: { key: keyof Counts; label: string; sub: string; tone: 'ok' | 'fp' | 'fn' }[] = [
  { key: 'tp', label: 'TP', sub: 'acerto', tone: 'ok' },
  { key: 'fp', label: 'FP', sub: 'alarme falso · tipo I', tone: 'fp' },
  { key: 'fn', label: 'FN', sub: 'omissão · tipo II', tone: 'fn' },
  { key: 'tn', label: 'TN', sub: 'rejeição correta', tone: 'ok' },
]

export function ConfusionGrid({ counts, editable = false, onChange }: ConfusionGridProps) {
  const n = counts.tp + counts.fp + counts.fn + counts.tn
  const cell = (key: keyof Counts) => CELLS.find((c) => c.key === key)!
  const render = (key: keyof Counts) => {
    const c = cell(key)
    return (
      <div className={`${styles.cell} ${styles[c.tone]}`}>
        <span className={styles.cellLabel}>{c.label}</span>
        {editable ? (
          <input
            type="number"
            min={0}
            inputMode="numeric"
            aria-label={`${c.label} — ${c.sub}`}
            className={styles.input}
            value={Math.round(counts[key])}
            onChange={(e) => onChange?.({ ...counts, [key]: Math.max(0, Number(e.target.value) || 0) })}
          />
        ) : (
          <span className={styles.count}>{int(counts[key])}</span>
        )}
        <span className={styles.sub}>{c.sub} · {pct(n ? counts[key] / n : null)}</span>
      </div>
    )
  }
  return (
    <figure className={styles.figure} aria-label="Matriz de confusão">
      <div className={styles.grid}>
        <span />
        <span className={styles.colHead}>Referência +</span>
        <span className={styles.colHead}>Referência −</span>
        <span />
        <span className={styles.rowHead}>Previsto +</span>
        {render('tp')}
        {render('fp')}
        <span className={styles.margin}>{int(counts.tp + counts.fp)}</span>
        <span className={styles.rowHead}>Previsto −</span>
        {render('fn')}
        {render('tn')}
        <span className={styles.margin}>{int(counts.fn + counts.tn)}</span>
        <span />
        <span className={styles.margin}>{int(counts.tp + counts.fn)}</span>
        <span className={styles.margin}>{int(counts.fp + counts.tn)}</span>
        <span className={`${styles.margin} ${styles.total}`}>N {int(n)}</span>
      </div>
    </figure>
  )
}
