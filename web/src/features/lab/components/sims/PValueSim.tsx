import { useMemo, useState } from 'react'
import { Slider } from '@/components/molecules/Slider'
import { fmt, pct } from '@/lib/format'
import { phi, rng } from '@/lib/random'
import { SimFrame, Stat } from './SimFrame'
import s from './sims.module.css'

const REPS = 60
const W = 640, H = 300, M = { l: 44, r: 16, t: 16, b: 34 }

export function PValueSim() {
  const [effect, setEffect] = useState(0.5)
  const [n, setN] = useState(32)
  const [seed, setSeed] = useState(11)

  const reps = useMemo(() => {
    const r = rng(seed)
    const se = Math.sqrt(2 / n)
    return Array.from({ length: REPS }, () => {
      const diff = r.normal(effect, se)
      const zz = diff / se
      return { diff, p: 2 * (1 - phi(Math.abs(zz))) }
    })
  }, [effect, n, seed])

  const power = effect === 0 ? 0.05 : 1 - phi(1.96 - effect / Math.sqrt(2 / n)) + phi(-1.96 - effect / Math.sqrt(2 / n))
  const sig = reps.filter((x) => x.p < 0.05).length
  const pMin = 1e-6
  const y = (p: number) => {
    const lp = Math.log10(Math.max(pMin, p))
    return M.t + (lp / Math.log10(pMin)) * (H - M.t - M.b)
  }
  const colW = (W - M.l - M.r) / REPS
  const ticks = [1, 0.1, 0.05, 0.01, 0.001, 0.0001, 0.000001]

  return (
    <SimFrame
      title="Simulador · a dança do p-valor"
      question="Se o mesmo experimento for repetido 60 vezes, o p-valor se repete?"
      controls={
        <>
          <Slider label="Efeito verdadeiro (d de Cohen)" value={effect} min={0} max={1.2} step={0.05} display={fmt(effect, 2)}
            hint={effect === 0 ? 'Sem efeito: todo resultado significativo é falso positivo' : undefined} onChange={setEffect} />
          <Slider label="Amostra por grupo (n)" value={n} min={5} max={300} step={1} display={String(n)} onChange={setN} />
          <div className={s.buttons}>
            <button type="button" className={`${s.button} ${s.primary}`} onClick={() => setSeed((v) => v + 1)}>Repetir 60 experimentos</button>
          </div>
        </>
      }
      stats={
        <dl style={{ display: 'contents' }}>
          <Stat label="réplicas com p < 0,05" value={`${sig} de ${REPS}`} tone={effect === 0 ? (sig > 5 ? 'warn' : undefined) : undefined} />
          <Stat label={effect === 0 ? 'taxa esperada (α)' : 'poder teórico'} value={pct(power, 0)} tone="ok" />
          <Stat label="menor e maior p" value={`${fmt(Math.min(...reps.map((x) => x.p)), 4)} · ${fmt(Math.max(...reps.map((x) => x.p)), 2)}`} />
        </dl>
      }
      takeaway={<>Com o <strong>mesmo</strong> efeito real e o mesmo n, o p-valor pula de 0,0001 a 0,6 entre réplicas (Cumming, 2014). Um único p &lt; 0,05 diz pouco; a fração de réplicas significativas é o <strong>poder</strong>. Com efeito zero, cerca de 5% dão “significativo” por acaso.</>}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${sig} de ${REPS} réplicas com p menor que 0,05.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} className={t === 0.05 ? s.alphaLine : s.grid} />
            <text x={M.l - 6} y={y(t) + 3} textAnchor="end" className={s.tick}>{t >= 0.01 ? fmt(t, t === 0.05 ? 2 : t === 1 ? 0 : 2) : t.toExponential(0).replace('e-', 'e−')}</text>
          </g>
        ))}
        {reps.map((r, i) => (
          <circle key={i} cx={M.l + i * colW + colW / 2} cy={y(r.p)} r={4} className={r.p < 0.05 ? s.sig : s.ns} />
        ))}
        <text x={M.l} y={H - 8} className={s.label}>réplicas do mesmo experimento →</text>
        <text x={W - M.r} y={y(0.05) - 6} textAnchor="end" className={s.label}>p = 0,05</text>
      </svg>
    </SimFrame>
  )
}
