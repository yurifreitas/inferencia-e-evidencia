import { useMemo, useRef } from 'react'
import { fmt } from '@/lib/format'
import { pdf } from '../../model'
import styles from './DistributionChart.module.css'

export type DistributionChartProps = {
  dprime: number
  sigma: number
  prevalence: number
  threshold: number
  weighted: boolean
  onThreshold: (t: number) => void
}

const W = 640
const H = 240
const M = { top: 24, right: 16, bottom: 32, left: 16 }

export function DistributionChart({ dprime, sigma, prevalence, threshold, weighted, onThreshold }: DistributionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  const lo = Math.min(-4, dprime - 4 * sigma)
  const hi = Math.max(4, dprime + 4 * sigma)
  const x = (v: number) => M.left + ((v - lo) / (hi - lo)) * (W - M.left - M.right)
  const invX = (px: number) => lo + ((px - M.left) / (W - M.left - M.right)) * (hi - lo)

  const { neg, pos, ymax } = useMemo(() => {
    const steps = 240
    const wn = weighted ? 1 - prevalence : 1
    const wp = weighted ? prevalence : 1
    const neg: [number, number][] = []
    const pos: [number, number][] = []
    for (let i = 0; i <= steps; i++) {
      const v = lo + (i / steps) * (hi - lo)
      neg.push([v, wn * pdf(v)])
      pos.push([v, wp * pdf(v, dprime, sigma)])
    }
    const ymax = Math.max(...neg.map((p) => p[1]), ...pos.map((p) => p[1]))
    return { neg, pos, ymax }
  }, [dprime, sigma, prevalence, weighted, lo, hi])

  const y = (v: number) => H - M.bottom - (v / (ymax * 1.08)) * (H - M.top - M.bottom)
  const line = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join('')
  const area = (pts: [number, number][], from: number, to: number) => {
    const seg = pts.filter((p) => p[0] >= from && p[0] <= to)
    if (seg.length < 2) return ''
    return `M${x(seg[0][0])},${y(0)}` + seg.map((p) => `L${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join('') + `L${x(seg[seg.length - 1][0])},${y(0)}Z`
  }

  const setFromEvent = (clientX: number) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const px = ((clientX - rect.left) / rect.width) * W
    onThreshold(Math.max(lo, Math.min(hi, invX(px))))
  }

  const tx = x(threshold)
  const ticks = Array.from({ length: Math.floor(hi) - Math.ceil(lo) + 1 }, (_, i) => Math.ceil(lo) + i).filter((t) => t % 2 === 0)

  return (
    <figure className={styles.figure}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={styles.svg}
        role="img"
        aria-label={`Distribuições de score: negativos centrados em 0, positivos em ${fmt(dprime, 1)}. Limiar em ${fmt(threshold, 2)}. Arraste para mover o limiar.`}
        onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); setFromEvent(e.clientX) }}
        onPointerMove={(e) => { if (dragging.current) setFromEvent(e.clientX) }}
        onPointerUp={() => { dragging.current = false }}
        onPointerCancel={() => { dragging.current = false }}
      >
        <line x1={M.left} x2={W - M.right} y1={y(0)} y2={y(0)} className={styles.axis} />
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={H - 10} className={styles.tick} textAnchor="middle">{t}</text>
        ))}
        <path d={area(neg, threshold, hi)} className={styles.areaFp} />
        <path d={area(pos, lo, threshold)} className={styles.areaFn} />
        <path d={line(neg)} className={styles.neg} />
        <path d={line(pos)} className={styles.pos} />
        <text x={x(0)} y={y(neg[Math.round(neg.length / 2)]?.[1] ?? 0) - 8} className={styles.labelNeg} textAnchor="middle">negativos</text>
        <text x={x(dprime)} y={Math.max(M.top + 4, y(pdf(0, 0, sigma) * (weighted ? prevalence : 1)) - 8)} className={styles.labelPos} textAnchor="middle">positivos</text>
        <g className={styles.handle}>
          <line x1={tx} x2={tx} y1={M.top - 8} y2={y(0)} className={styles.thresholdLine} />
          <rect x={tx - 22} y={M.top - 20} width={44} height={20} rx={6} className={styles.thresholdPill} />
          <text x={tx} y={M.top - 6} textAnchor="middle" className={styles.thresholdText}>{fmt(threshold, 2)}</text>
          <rect x={tx - 16} y={M.top} width={32} height={y(0) - M.top} className={styles.hit} />
        </g>
      </svg>
      <figcaption className={styles.caption}>
        <span><i className={styles.swPos} /> positivos</span>
        <span><i className={styles.swNeg} /> negativos</span>
        <span><i className={styles.swFn} /> FN (positivo abaixo do limiar)</span>
        <span><i className={styles.swFp} /> FP (negativo acima do limiar)</span>
        <span className={styles.drag}>↔ arraste o limiar</span>
      </figcaption>
    </figure>
  )
}
