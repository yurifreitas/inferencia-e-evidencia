import { useMemo, useState } from 'react'
import { ERAS, REGION_LABEL, REGION_ORDER, timeX, type RootEvent } from '../../model'
import styles from './RootsMap.module.css'

export type RootsMapProps = { events: RootEvent[]; highlighted: Set<string>; selectedId: string | null; onSelect: (id: string) => void }

const LABEL_W = 132
const ROW_H = 44
const W = 1000

export function RootsMap({ events, highlighted, selectedId, onSelect }: RootsMapProps) {
  const [hover, setHover] = useState<RootEvent | null>(null)
  const rows = REGION_ORDER
  const H = rows.length * ROW_H + 40
  const plotW = W - LABEL_W - 16
  const x = (year: number) => LABEL_W + timeX(year) * plotW

  // Evita sobreposição: desloca verticalmente pontos muito próximos na mesma faixa
  const placed = useMemo(() => {
    const byRow = new Map<string, { e: RootEvent; cx: number; dy: number }[]>()
    for (const e of events) {
      const list = byRow.get(e.region) ?? []
      const cx = x(e.year)
      const near = list.filter((p) => Math.abs(p.cx - cx) < 12).length
      list.push({ e, cx, dy: near === 0 ? 0 : (near % 2 ? -1 : 1) * Math.ceil(near / 2) * 9 })
      byRow.set(e.region, list)
    }
    return [...byRow.values()].flat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  const tip = hover ?? events.find((e) => e.id === selectedId) ?? null

  return (
    <figure className={styles.figure}>
      <div className={styles.scroller}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img"
          aria-label={`Mapa do tempo com ${events.length} marcos distribuídos por ${rows.length} regiões, da pré-história a hoje.`}>
          {ERAS.map((era, i) => {
            const x0 = LABEL_W + (i / ERAS.length) * plotW
            return (
              <g key={era.label}>
                {i % 2 === 1 && <rect x={x0} y={0} width={plotW / ERAS.length} height={H - 24} className={styles.band} />}
                <line x1={x0} x2={x0} y1={0} y2={H - 24} className={styles.eraLine} />
                <text x={x0 + 8} y={H - 8} className={styles.eraLabel}>{era.label}</text>
              </g>
            )
          })}
          {rows.map((r, i) => (
            <g key={r}>
              <line x1={LABEL_W} x2={W - 16} y1={i * ROW_H + ROW_H / 2 + 8} y2={i * ROW_H + ROW_H / 2 + 8} className={styles.lane} />
              <text x={LABEL_W - 12} y={i * ROW_H + ROW_H / 2 + 12} textAnchor="end" className={styles.rowLabel}>{REGION_LABEL[r]}</text>
            </g>
          ))}
          {placed.map(({ e, cx, dy }) => {
            const cy = rows.indexOf(e.region) * ROW_H + ROW_H / 2 + 8 + dy
            const dim = highlighted.size > 0 && !highlighted.has(e.id)
            return (
              <g key={e.id} className={`${styles.dotGroup} ${dim ? styles.dim : ''}`}
                tabIndex={dim ? -1 : 0} role="button" aria-label={`${e.yearLabel} — ${e.title}`}
                onMouseEnter={() => setHover(e)} onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(e)} onBlur={() => setHover(null)}
                onClick={() => onSelect(e.id)}
                onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onSelect(e.id) } }}>
                <circle cx={cx} cy={cy} r={14} className={styles.hit} />
                <circle cx={cx} cy={cy} r={selectedId === e.id ? 8 : 6}
                  className={`${styles.dot} ${styles[e.certainty]} ${selectedId === e.id ? styles.selected : ''}`} />
              </g>
            )
          })}
        </svg>
      </div>
      <figcaption className={styles.caption}>
        <div className={styles.tip} aria-live="polite">
          {tip ? (<><strong>{tip.yearLabel}</strong> · {REGION_LABEL[tip.region]} — {tip.title}</>) : 'Passe o mouse ou use Tab nos pontos; clique para abrir o marco.'}
        </div>
        <ul className={styles.legend}>
          <li><i className={`${styles.sw} ${styles.estabelecido}`} /> estabelecido</li>
          <li><i className={`${styles.sw} ${styles.interpretacao}`} /> interpretação</li>
          <li><i className={`${styles.sw} ${styles.especulativo}`} /> especulativo</li>
          <li className={styles.note}>eixo por eras — cada faixa tem a mesma largura</li>
        </ul>
      </figcaption>
    </figure>
  )
}
