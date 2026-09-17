import { useMemo, useState } from 'react'
import { Slider } from '@/components/molecules/Slider'
import { ChipGroup } from '@/components/molecules/ChipGroup'
import { fmt, pct } from '@/lib/format'
import { rng, zQuantile } from '@/lib/random'
import { SimFrame, Stat } from './SimFrame'
import s from './sims.module.css'

type Method = 'wald' | 'wilson'
const K = 100
const W = 640, ROW = 5, M = { l: 12, r: 12, t: 12, b: 28 }

function interval(k: number, n: number, z: number, method: Method): [number, number] {
  const p = k / n
  if (method === 'wald') {
    const h = z * Math.sqrt((p * (1 - p)) / n)
    return [Math.max(0, p - h), Math.min(1, p + h)]
  }
  const den = 1 + (z * z) / n
  const center = (p + (z * z) / (2 * n)) / den
  const h = (z / den) * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))
  return [Math.max(0, center - h), Math.min(1, center + h)]
}

export function CoverageSim() {
  const [truth, setTruth] = useState(0.9)
  const [n, setN] = useState(30)
  const [level, setLevel] = useState<'90' | '95' | '99'>('95')
  const [method, setMethod] = useState<Method>('wald')
  const [seed, setSeed] = useState(7)

  const z = zQuantile(1 - (1 - Number(level) / 100) / 2)
  const rows = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: K }, () => {
      const k = r.binomial(n, truth)
      const [lo, hi] = interval(k, n, z, method)
      return { p: k / n, lo, hi, hit: lo <= truth && truth <= hi }
    })
  }, [seed, n, truth, z, method])

  const hits = rows.filter((r) => r.hit).length
  const H = M.t + K * ROW + M.b
  const lo = Math.max(0, Math.min(...rows.map((r) => r.lo), truth) - 0.05)
  const hi = Math.min(1, Math.max(...rows.map((r) => r.hi), truth) + 0.02)
  const x = (v: number) => M.l + ((v - lo) / (hi - lo)) * (W - M.l - M.r)
  const ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].filter((t) => t >= lo - 1e-9 && t <= hi + 1e-9)

  return (
    <SimFrame
      title="Simulador · cobertura de intervalos"
      question={`Se eu repetir o estudo 100 vezes, quantos intervalos de ${level}% contêm a sensibilidade verdadeira?`}
      controls={
        <>
          <Slider label="Sensibilidade verdadeira" value={truth} min={0.5} max={0.99} step={0.01} display={pct(truth, 0)} onChange={setTruth} />
          <Slider label="Positivos no teste (n)" value={n} min={10} max={500} step={5} display={String(n)} onChange={setN} />
          <div className={s.select}>
            <span className={s.selectLabel}>Nível de confiança</span>
            <ChipGroup label="Nível" options={[{ value: '90', label: '90%' }, { value: '95', label: '95%' }, { value: '99', label: '99%' }]} value={level} onChange={(v) => v && setLevel(v)} allowNone={false} />
          </div>
          <div className={s.select}>
            <span className={s.selectLabel}>Método</span>
            <ChipGroup label="Método" options={[{ value: 'wald', label: 'Wald (p ± z·EP)' }, { value: 'wilson', label: 'Wilson' }]} value={method} onChange={(v) => v && setMethod(v)} allowNone={false} />
          </div>
          <div className={s.buttons}>
            <button type="button" className={`${s.button} ${s.primary}`} onClick={() => setSeed((v) => v + 1)}>Repetir 100 estudos</button>
          </div>
        </>
      }
      stats={
        <dl style={{ display: 'contents' }}>
          <Stat label="intervalos que cobrem o valor real" value={`${hits} de ${K}`} tone={hits >= Number(level) - 3 ? 'ok' : 'warn'} />
          <Stat label="cobertura prometida" value={`${level}%`} />
          <Stat label="largura média" value={fmt(rows.reduce((a, r) => a + (r.hi - r.lo), 0) / K, 3)} />
        </dl>
      }
      takeaway={<>“95% de confiança” descreve o <strong>método</strong>: em muitas repetições, cerca de 95 de 100 intervalos cobrem o valor real — não a chance de <em>este</em> intervalo estar certo. Com n pequeno e sensibilidade alta, o intervalo de Wald cobre bem menos do que promete; o de Wilson fica perto do nominal.</>}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${hits} de ${K} intervalos cobrem o valor verdadeiro ${pct(truth, 0)}.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={M.t} y2={H - M.b} className={s.grid} />
            <text x={x(t)} y={H - 10} textAnchor="middle" className={s.tick}>{fmt(t, 1)}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const yy = M.t + i * ROW + ROW / 2
          return (
            <g key={i}>
              <line x1={x(r.lo)} x2={x(r.hi)} y1={yy} y2={yy} className={r.hit ? s.hit : s.miss} />
              <circle cx={x(r.p)} cy={yy} r={1.6} className={r.hit ? s.dotHit : s.dotMiss} />
            </g>
          )
        })}
        <line x1={x(truth)} x2={x(truth)} y1={M.t - 6} y2={H - M.b} className={s.truth} />
        <text x={x(truth) + 4} y={M.t - 2} className={s.label}>valor real</text>
      </svg>
    </SimFrame>
  )
}
