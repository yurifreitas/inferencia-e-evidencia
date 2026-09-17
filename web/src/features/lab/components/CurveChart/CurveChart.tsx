import { fmt } from '@/lib/format'
import styles from './CurveChart.module.css'

export type CurveChartProps = {
  kind: 'roc' | 'pr'
  points: { x: number; y: number }[]
  current: { x: number; y: number }
  baseline: number // ROC: diagonal; PR: prevalência
  title: string
  subtitle: string
  xLabel: string
  yLabel: string
}

const S = 280
const M = { top: 12, right: 12, bottom: 36, left: 40 }
const inner = S - M.left - M.right

export function CurveChart({ kind, points, current, baseline, title, subtitle, xLabel, yLabel }: CurveChartProps) {
  const sx = (v: number) => M.left + v * inner
  const sy = (v: number) => M.top + (1 - v) * (S - M.top - M.bottom)
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join('')
  const areaD = kind === 'roc' ? `${d}L${sx(1)},${sy(0)}L${sx(0)},${sy(0)}Z` : ''
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.head}>
        <p className={styles.title}>{title}</p>
        <p className={styles.subtitle}>{subtitle}</p>
      </figcaption>
      <svg viewBox={`0 0 ${S} ${S}`} className={styles.svg} role="img" aria-label={`${title}. ${subtitle}. Ponto atual: ${xLabel} ${fmt(current.x, 2)}, ${yLabel} ${fmt(current.y, 2)}.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={sx(0)} x2={sx(1)} y1={sy(t)} y2={sy(t)} className={styles.grid} />
            <text x={M.left - 8} y={sy(t) + 4} textAnchor="end" className={styles.tick}>{fmt(t, t % 0.5 === 0 ? 1 : 2)}</text>
            <text x={sx(t)} y={S - M.bottom + 16} textAnchor="middle" className={styles.tick}>{fmt(t, t % 0.5 === 0 ? 1 : 2)}</text>
          </g>
        ))}
        {kind === 'roc' ? (
          <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} className={styles.baseline} />
        ) : (
          <line x1={sx(0)} y1={sy(baseline)} x2={sx(1)} y2={sy(baseline)} className={styles.baseline} />
        )}
        {areaD && <path d={areaD} className={styles.area} />}
        <path d={d} className={styles.curve} />
        {kind === 'roc' && (
          <line x1={sx(current.x)} x2={sx(current.x)} y1={sy(current.x)} y2={sy(current.y)} className={styles.youden} />
        )}
        <circle cx={sx(current.x)} cy={sy(current.y)} r={7} className={styles.halo} />
        <circle cx={sx(current.x)} cy={sy(current.y)} r={4.5} className={styles.point} />
        <text x={sx(0.5)} y={S - 4} textAnchor="middle" className={styles.axisLabel}>{xLabel}</text>
        <text x={12} y={sy(0.5)} textAnchor="middle" className={styles.axisLabel} transform={`rotate(-90 12 ${sy(0.5)})`}>{yLabel}</text>
        {kind === 'pr' && <text x={sx(0) + 6} y={sy(baseline) - 6} textAnchor="start" className={styles.baselineLabel}>prevalência {fmt(baseline, 3)}</text>}
      </svg>
    </figure>
  )
}
