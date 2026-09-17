import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { href } from '@/lib/router'
import { useProgress } from '@/lib/progress'
import { CONCEPTS, GROUP_LABEL, GROUP_ORDER } from '@/features/concepts/data'
import styles from './ConceptMapPage.module.css'

const COL_W = 168
const ROW_H = 46
const PAD = { t: 64, l: 24, r: 24, b: 24 }
const NODE_W = 148

type Node = { id: string; name: string; col: number; row: number; x: number; y: number }

/**
 * Mapa em colunas pela ordem de estudo: o eixo horizontal é a trilha, e as conexões mostram
 * de onde cada ideia depende. Evita o "novelo" de um grafo de força.
 */
export function ConceptMapPage() {
  const { isStudied } = useProgress()
  const [focus, setFocus] = useState<string | null>(null)
  const groups = GROUP_ORDER.filter((g) => CONCEPTS.some((c) => c.group === g))

  const { nodes, edges, width, height } = useMemo(() => {
    const byId = new Map<string, Node>()
    const cols = groups.map((g) => CONCEPTS.filter((c) => c.group === g))
    // ordena cada coluna pela média da linha dos vizinhos na coluna anterior (heurística de barycenter)
    cols.forEach((col, ci) => {
      const scored = col.map((c, i) => {
        const prev = c.related.map((r) => byId.get(r)).filter((n): n is Node => Boolean(n) && n!.col < ci)
        const bary = prev.length ? prev.reduce((a, n) => a + n.row, 0) / prev.length : i
        return { c, bary }
      }).sort((a, b) => a.bary - b.bary)
      scored.forEach(({ c }, row) => {
        byId.set(c.id, { id: c.id, name: c.name, col: ci, row, x: PAD.l + ci * COL_W, y: PAD.t + row * ROW_H })
      })
    })
    const seen = new Set<string>()
    const edges: [Node, Node][] = []
    for (const c of CONCEPTS) {
      for (const r of c.related) {
        const a = byId.get(c.id), b = byId.get(r)
        if (!a || !b) continue
        const k = [a.id, b.id].sort().join('|')
        if (seen.has(k)) continue
        seen.add(k)
        edges.push(a.x <= b.x ? [a, b] : [b, a])
      }
    }
    const maxRows = Math.max(...cols.map((c) => c.length))
    return { nodes: [...byId.values()], edges, width: PAD.l + groups.length * COL_W + PAD.r, height: PAD.t + maxRows * ROW_H + PAD.b }
  }, [groups])

  const neighbors = useMemo(() => {
    if (!focus) return null
    const set = new Set([focus])
    for (const [a, b] of edges) { if (a.id === focus) set.add(b.id); if (b.id === focus) set.add(a.id) }
    return set
  }, [focus, edges])

  const path = (a: Node, b: Node) => {
    const x1 = a.x + NODE_W, y1 = a.y + 16, x2 = b.x, y2 = b.y + 16
    if (a.col === b.col) {
      const xr = a.x + NODE_W + 10
      return `M${a.x + NODE_W},${y1} C${xr},${y1} ${xr},${y2} ${b.x + NODE_W},${y2}`
    }
    const mx = (x1 + x2) / 2
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
  }

  const studied = CONCEPTS.filter((c) => isStudied(c.id)).length

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Mapa"
        title="Como os conceitos se conectam"
        lead={`${CONCEPTS.length} conceitos em ${groups.length} etapas, da esquerda para a direita na ordem de estudo, e ${edges.length} conexões. Passe o mouse (ou use Tab) num conceito para destacar os vizinhos; clique para abrir.`}
      />
      <p className={styles.legend}>
        <span><i className={styles.swStudied} /> estudado ({studied})</span>
        <span><i className={styles.swTodo} /> a estudar</span>
      </p>
      <div className={styles.scroller}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={styles.svg} role="img"
          aria-label={`Mapa de ${CONCEPTS.length} conceitos em ${groups.length} etapas com ${edges.length} conexões.`}>
          {groups.map((g, i) => (
            <g key={g}>
              {i % 2 === 1 && <rect x={PAD.l + i * COL_W - 8} y={0} width={COL_W} height={height} className={styles.band} />}
              <text x={PAD.l + i * COL_W} y={22} className={styles.colStep}>{String(i + 1).padStart(2, '0')}</text>
              <text x={PAD.l + i * COL_W} y={40} className={styles.colLabel}>{GROUP_LABEL[g].length > 24 ? `${GROUP_LABEL[g].slice(0, 23)}…` : GROUP_LABEL[g]}</text>
            </g>
          ))}
          <g>
            {edges.map(([a, b]) => {
              const on = neighbors ? neighbors.has(a.id) && neighbors.has(b.id) && (a.id === focus || b.id === focus) : false
              return <path key={`${a.id}-${b.id}`} d={path(a, b)} className={`${styles.edge} ${on ? styles.edgeOn : ''} ${neighbors && !on ? styles.edgeDim : ''}`} />
            })}
          </g>
          {nodes.map((n) => {
            const dim = neighbors && !neighbors.has(n.id)
            const done = isStudied(n.id)
            return (
              <a key={n.id} href={href('fundamentos', n.id)} className={`${styles.node} ${dim ? styles.dim : ''} ${n.id === focus ? styles.focus : ''}`}
                onMouseEnter={() => setFocus(n.id)} onMouseLeave={() => setFocus(null)} onFocus={() => setFocus(n.id)} onBlur={() => setFocus(null)}>
                <rect x={n.x} y={n.y} width={NODE_W} height={32} rx={8} className={done ? styles.rectStudied : styles.rect} />
                {done && <text x={n.x + 10} y={n.y + 20} className={styles.check}>✓</text>}
                <text x={n.x + (done ? 24 : 10)} y={n.y + 20} className={styles.label}>{n.name.length > (done ? 18 : 20) ? `${n.name.slice(0, done ? 17 : 19)}…` : n.name}</text>
                <title>{n.name}</title>
              </a>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
