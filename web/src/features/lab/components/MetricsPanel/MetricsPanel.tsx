import { href } from '@/lib/router'
import { fmt } from '@/lib/format'
import { METRIC_GROUPS, type MetricMeta } from '../../metricsMeta'
import type { Metrics } from '../../model'
import styles from './MetricsPanel.module.css'

export type MetricsPanelProps = { metrics: Metrics; compare?: Metrics; compareLabel?: string }

function barGeometry(meta: MetricMeta, v: number | null) {
  if (v === null || !Number.isFinite(v)) return null
  if (meta.range === 'unit') return { left: 0, width: Math.max(0, Math.min(1, v)) * 100 }
  if (meta.range === 'signed') {
    const c = Math.max(-1, Math.min(1, v))
    return c >= 0 ? { left: 50, width: c * 50 } : { left: 50 + c * 50, width: -c * 50 }
  }
  return null
}

export function MetricsPanel({ metrics, compare, compareLabel }: MetricsPanelProps) {
  return (
    <div className={styles.panel}>
      {compare && (
        <p className={styles.legend}>
          <span className={styles.legendMain} /> este classificador
          <span className={styles.legendCompare} /> {compareLabel}
        </p>
      )}
      {METRIC_GROUPS.map((g) => (
        <section key={g.title} className={styles.group}>
          <h3 className={styles.groupTitle}>{g.title}</h3>
          <table className={styles.table}>
            <tbody>
              {g.items.map((m) => {
                const v = metrics[m.key]
                const cv = compare?.[m.key] ?? null
                const bar = barGeometry(m, v)
                const cbar = compare ? barGeometry(m, cv) : null
                const digits = m.range === 'ratio' || m.range === 'cost' ? 2 : 3
                return (
                  <tr key={m.key}>
                    <th scope="row" className={styles.name}>
                      <a href={href('fundamentos', m.conceptId)}>{m.label}</a>
                      <code>{m.formula}</code>
                    </th>
                    <td className={styles.barCell} aria-hidden="true">
                      {(m.range === 'unit' || m.range === 'signed') && (
                        <div className={`${styles.track} ${m.range === 'signed' ? styles.signed : ''}`}>
                          {bar && <span className={styles.bar} style={{ left: `${bar.left}%`, width: `${bar.width}%` }} />}
                          {cbar && <span className={styles.marker} style={{ left: `${cbar.left + (cv !== null && cv < 0 ? 0 : cbar.width)}%` }} />}
                        </div>
                      )}
                    </td>
                    <td className={styles.value}>
                      {fmt(v, digits)}
                      {compare && <span className={styles.compareValue}>{fmt(cv, digits)}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}
