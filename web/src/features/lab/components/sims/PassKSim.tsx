import { useState } from 'react'
import { Slider } from '@/components/molecules/Slider'
import { fmt, pct } from '@/lib/format'
import { SimFrame, Stat } from './SimFrame'
import s from './sims.module.css'

const W = 640, H = 260, M = { l: 44, r: 16, t: 16, b: 36 }

/** Estimador não enviesado de Chen et al. (2021): 1 − C(n−c, k) / C(n, k), em produto estável. */
export function passAtK(n: number, c: number, k: number) {
  if (n - c < k) return 1
  let prod = 1
  for (let i = n - c + 1; i <= n; i++) prod *= 1 - k / i
  return 1 - prod
}

export function PassKSim() {
  const [n, setN] = useState(20)
  const [c, setC] = useState(3)
  const [k, setK] = useState(5)
  const cc = Math.min(c, n)
  const kk = Math.min(k, n)
  const unbiased = passAtK(n, cc, kk)
  const naive = 1 - (1 - cc / n) ** kk
  const x = (v: number) => M.l + ((v - 1) / Math.max(1, n - 1)) * (W - M.l - M.r)
  const y = (v: number) => H - M.b - v * (H - M.t - M.b)
  const ks = Array.from({ length: n }, (_, i) => i + 1)
  const line = (f: (kv: number) => number) => ks.map((kv, i) => `${i ? 'L' : 'M'}${x(kv).toFixed(1)},${y(f(kv)).toFixed(1)}`).join('')

  return (
    <SimFrame
      title="Simulador · pass@k"
      question="Se o modelo gera n soluções e c passam nos testes, qual a chance de acertar em k tentativas?"
      controls={
        <>
          <Slider label="Amostras geradas por problema (n)" value={n} min={1} max={200} step={1} display={String(n)} onChange={(v) => { setN(v); if (c > v) setC(v); if (k > v) setK(v) }} />
          <Slider label="Amostras corretas (c)" value={cc} min={0} max={n} step={1} display={String(cc)} onChange={setC} />
          <Slider label="Tentativas permitidas (k)" value={kk} min={1} max={n} step={1} display={String(kk)} onChange={setK} />
        </>
      }
      stats={
        <dl style={{ display: 'contents' }}>
          <Stat label={`pass@${kk} (não enviesado)`} value={pct(unbiased, 1)} tone="ok" />
          <Stat label={`1 − (1 − c/n)^k (ingênuo)`} value={pct(naive, 1)} />
          <Stat label="pass@1 = c/n" value={pct(cc / n, 1)} />
          <Stat label="diferença" value={`${fmt((naive - unbiased) * 100, 1)} p.p.`} tone={Math.abs(naive - unbiased) > 0.02 ? 'warn' : undefined} />
        </dl>
      }
      takeaway={<>pass@k estima a chance de pelo menos uma de k amostras passar. A fórmula de Chen et al. (2021) sorteia k das n geradas <strong>sem reposição</strong>; a versão ingênua trata cada tentativa como independente e erra quando n é pequeno perto de k. Para comparar modelos, fixe n, k e a temperatura, e reporte a incerteza entre problemas.</>}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`pass@${kk} = ${pct(unbiased, 1)} com n = ${n} e c = ${cc}.`}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} className={s.grid} />
            <text x={M.l - 6} y={y(t) + 3} textAnchor="end" className={s.tick}>{pct(t, 0)}</text>
          </g>
        ))}
        <text x={W - M.r} y={H - 4} textAnchor="end" className={s.label}>k (tentativas)</text>
        <text x={M.l} y={H - 16} className={s.tick}>1</text>
        <text x={W - M.r} y={H - 16} textAnchor="end" className={s.tick}>{n}</text>
        {n > 1 && <path d={line((kv) => 1 - (1 - cc / n) ** kv)} className={`${s.powerLine} ${s.p1}`} />}
        {n > 1 && <path d={line((kv) => passAtK(n, cc, kv))} className={s.powerLine} style={{ stroke: 'var(--brand)', strokeWidth: 3 }} />}
        <circle cx={x(kk)} cy={y(unbiased)} r={6} className={s.current} />
      </svg>
      <p className={s.legend}>
        <span><i style={{ background: 'var(--brand)' }} />não enviesado (Chen et al., 2021)</span>
        <span><i style={{ background: 'var(--class-neg)' }} />ingênuo</span>
      </p>
    </SimFrame>
  )
}
