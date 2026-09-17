import { useState } from 'react'
import { Slider } from '@/components/molecules/Slider'
import { ChipGroup } from '@/components/molecules/ChipGroup'
import { fmt, pct } from '@/lib/format'
import { phi, zQuantile } from '@/lib/random'
import { SimFrame, Stat } from './SimFrame'
import s from './sims.module.css'

const W = 640, H = 280, M = { l: 44, r: 16, t: 16, b: 36 }
const NMAX = 400
const EFFECTS = [{ d: 0.2, cls: s.p1, color: 'var(--class-neg)', label: 'pequeno (0,2)' }, { d: 0.5, cls: s.p2, color: 'var(--gold)', label: 'médio (0,5)' }, { d: 0.8, cls: s.p3, color: 'var(--teal)', label: 'grande (0,8)' }]

const powerOf = (d: number, n: number, alpha: number) => {
  const z = zQuantile(1 - alpha / 2)
  const ncp = d / Math.sqrt(2 / n)
  return 1 - phi(z - ncp) + phi(-z - ncp)
}
const nFor = (d: number, target: number, alpha: number) => {
  for (let n = 2; n <= 5000; n++) if (powerOf(d, n, alpha) >= target) return n
  return null
}

export function PowerSim() {
  const [d, setD] = useState(0.5)
  const [n, setN] = useState(40)
  const [alpha, setAlpha] = useState<'0.05' | '0.01' | '0.005'>('0.05')
  const a = Number(alpha)
  const x = (v: number) => M.l + (v / NMAX) * (W - M.l - M.r)
  const y = (v: number) => H - M.b - v * (H - M.t - M.b)
  const line = (dd: number) => Array.from({ length: NMAX - 1 }, (_, i) => i + 2).map((nn, i) => `${i ? 'L' : 'M'}${x(nn).toFixed(1)},${y(powerOf(dd, nn, a)).toFixed(1)}`).join('')
  const pw = powerOf(d, n, a)
  const need = nFor(d, 0.8, a)

  return (
    <SimFrame
      title="Simulador · poder estatístico"
      question="Quantos exemplos preciso para detectar uma diferença real?"
      controls={
        <>
          <Slider label="Efeito (d de Cohen)" value={d} min={0.05} max={1.2} step={0.05} display={fmt(d, 2)} onChange={setD} />
          <Slider label="Amostra por grupo (n)" value={n} min={2} max={NMAX} step={1} display={String(n)} onChange={setN} />
          <div className={s.select}>
            <span className={s.selectLabel}>Nível de significância α</span>
            <ChipGroup label="alfa" options={[{ value: '0.05', label: '0,05' }, { value: '0.01', label: '0,01' }, { value: '0.005', label: '0,005' }]} value={alpha} onChange={(v) => v && setAlpha(v)} allowNone={false} />
          </div>
        </>
      }
      stats={
        <dl style={{ display: 'contents' }}>
          <Stat label="poder com este n" value={pct(pw, 0)} tone={pw >= 0.8 ? 'ok' : 'warn'} />
          <Stat label="n por grupo para 80% de poder" value={need ? String(need) : '> 5.000'} />
          <Stat label="chance de perder o efeito (β)" value={pct(1 - pw, 0)} />
        </dl>
      }
      takeaway={<>Poder é a probabilidade de detectar um efeito que existe. Com efeito pequeno, estudos de dezenas de exemplos quase sempre “não encontram nada” — e o que passa no filtro tende a ter o efeito <strong>superestimado</strong>. Baixar α para 0,005 exige amostras maiores. Planeje n antes, não depois.</>}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Poder de ${pct(pw, 0)} com efeito ${fmt(d, 2)} e n ${n} por grupo.`}>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} className={t === 0.8 ? s.eighty : s.grid} />
            <text x={M.l - 6} y={y(t) + 3} textAnchor="end" className={s.tick}>{pct(t, 0)}</text>
          </g>
        ))}
        {[0, 100, 200, 300, 400].map((t) => <text key={t} x={x(t)} y={H - 16} textAnchor="middle" className={s.tick}>{t}</text>)}
        <text x={W - M.r} y={H - 2} textAnchor="end" className={s.label}>n por grupo</text>
        {EFFECTS.map((e) => <path key={e.d} d={line(e.d)} className={`${s.powerLine} ${e.cls}`} />)}
        <path d={line(d)} className={s.powerLine} style={{ stroke: 'var(--brand)', strokeWidth: 3 }} />
        <circle cx={x(n)} cy={y(pw)} r={6} className={s.current} />
      </svg>
      <p className={s.legend}>
        {EFFECTS.map((e) => <span key={e.d}><i style={{ background: e.color }} />{e.label}</span>)}
        <span><i style={{ background: 'var(--brand)' }} />efeito escolhido</span>
      </p>
    </SimFrame>
  )
}
