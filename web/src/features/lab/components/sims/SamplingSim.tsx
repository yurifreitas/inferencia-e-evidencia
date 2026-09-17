import { useCallback, useMemo, useState } from 'react'
import { Slider } from '@/components/molecules/Slider'
import { ChipGroup } from '@/components/molecules/ChipGroup'
import { fmt, int } from '@/lib/format'
import { histogram, normalPdf, rng } from '@/lib/random'
import { SimFrame, Stat } from './SimFrame'
import s from './sims.module.css'

type Shape = 'normal' | 'uniforme' | 'assimetrica' | 'bimodal' | 'bernoulli'

const SHAPES: { value: Shape; label: string }[] = [
  { value: 'assimetrica', label: 'Assimétrica' },
  { value: 'bimodal', label: 'Bimodal' },
  { value: 'uniforme', label: 'Uniforme' },
  { value: 'bernoulli', label: 'Acerto/erro (p = 0,8)' },
  { value: 'normal', label: 'Normal' },
]

// Todas as populações vivem em [0, 1] para o eixo ser o mesmo
const POP: Record<Shape, { draw: (r: ReturnType<typeof rng>) => number; mu: number; sd: number }> = {
  normal: { draw: (r) => Math.min(1, Math.max(0, r.normal(0.5, 0.15))), mu: 0.5, sd: 0.15 },
  uniforme: { draw: (r) => r.next(), mu: 0.5, sd: Math.sqrt(1 / 12) },
  assimetrica: { draw: (r) => Math.min(1, -Math.log(1 - r.next()) * 0.2), mu: 0.2, sd: 0.2 },
  bimodal: { draw: (r) => Math.min(1, Math.max(0, r.next() < 0.5 ? r.normal(0.22, 0.07) : r.normal(0.78, 0.07))), mu: 0.5, sd: Math.sqrt(0.07 ** 2 + 0.28 ** 2) },
  bernoulli: { draw: (r) => (r.next() < 0.8 ? 1 : 0), mu: 0.8, sd: Math.sqrt(0.8 * 0.2) },
}

const W = 640, H = 200, M = { l: 12, r: 12, t: 16, b: 28 }

function Hist({ values, bins, className, curve }: { values: number[]; bins: number; className: string; curve?: { mu: number; sd: number } }) {
  const { counts, width } = histogram(values, 0, 1, bins)
  const total = values.length || 1
  const dens = counts.map((c) => c / total / width)
  const curveMax = curve ? normalPdf(curve.mu, curve.mu, curve.sd) : 0
  const ymax = Math.max(...dens, curveMax, 1e-6) * 1.08
  const x = (v: number) => M.l + v * (W - M.l - M.r)
  const y = (v: number) => H - M.b - (v / ymax) * (H - M.t - M.b)
  const bw = (W - M.l - M.r) / bins
  let path = ''
  if (curve) {
    for (let i = 0; i <= 200; i++) {
      const v = i / 200
      path += `${i ? 'L' : 'M'}${x(v).toFixed(1)},${y(normalPdf(v, curve.mu, curve.sd)).toFixed(1)}`
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} className={s.axis} />
      {dens.map((d, i) => d > 0 && <rect key={i} x={M.l + i * bw + 0.5} width={Math.max(0, bw - 1)} y={y(d)} height={H - M.b - y(d)} className={className} />)}
      {curve && <path d={path} className={s.curve} />}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => <text key={t} x={x(t)} y={H - 10} textAnchor="middle" className={s.tick}>{fmt(t, t % 0.5 === 0 ? 1 : 2)}</text>)}
    </svg>
  )
}

export function SamplingSim() {
  const [shape, setShape] = useState<Shape>('assimetrica')
  const [n, setN] = useState(5)
  const [means, setMeans] = useState<number[]>([])
  const [seed, setSeed] = useState(1)
  const pop = POP[shape]

  const population = useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 5000 }, () => pop.draw(r))
  }, [pop])

  const draw = useCallback((k: number) => {
    const r = rng(seed * 7919 + means.length)
    const add: number[] = []
    for (let j = 0; j < k; j++) {
      let sum = 0
      for (let i = 0; i < n; i++) sum += pop.draw(r)
      add.push(sum / n)
    }
    setSeed((x) => x + 1)
    setMeans((m) => [...m, ...add].slice(-20000))
  }, [n, pop, seed, means.length])

  const reset = (next: () => void) => { setMeans([]); next() }
  const se = pop.sd / Math.sqrt(n)
  const meanOfMeans = means.length ? means.reduce((a, b) => a + b, 0) / means.length : null
  const sdOfMeans = means.length > 1 && meanOfMeans !== null ? Math.sqrt(means.reduce((a, b) => a + (b - meanOfMeans) ** 2, 0) / (means.length - 1)) : null

  return (
    <SimFrame
      title="Simulador · distribuição amostral"
      question="Se eu repetir a mesma amostragem muitas vezes, como se distribuem as médias?"
      controls={
        <>
          <div className={s.select}>
            <span className={s.selectLabel}>População</span>
            <ChipGroup label="Forma da população" options={SHAPES} value={shape} onChange={(v) => v && reset(() => setShape(v))} allowNone={false} />
          </div>
          <Slider label="Tamanho de cada amostra (n)" value={n} min={1} max={100} step={1} display={String(n)} onChange={(v) => reset(() => setN(v))} />
          <div className={s.buttons}>
            <button type="button" className={`${s.button} ${s.primary}`} onClick={() => draw(1)}>Tirar 1 amostra</button>
            <button type="button" className={s.button} onClick={() => draw(1000)}>Tirar 1.000</button>
            <button type="button" className={s.button} onClick={() => setMeans([])}>Limpar</button>
          </div>
        </>
      }
      stats={
        <dl style={{ display: 'contents' }}>
          <Stat label="amostras tiradas" value={int(means.length)} />
          <Stat label="média das médias" value={fmt(meanOfMeans, 3)} />
          <Stat label="desvio das médias (observado)" value={fmt(sdOfMeans, 3)} />
          <Stat label="erro-padrão teórico σ/√n" value={fmt(se, 3)} tone="ok" />
        </dl>
      }
      takeaway={<>Mesmo com população assimétrica ou bimodal, as médias se aproximam de uma normal centrada em μ com desvio σ/√n — o <strong>Teorema Central do Limite</strong>. Com n = 1 você vê a própria população; a partir de n ≈ 30 a curva verde encaixa. Com “acerto/erro”, cada média é a <strong>acurácia</strong> de um conjunto de teste de tamanho n.</>}
    >
      <p style={{ font: '500 12px var(--font-mono)', color: 'var(--text-muted)', marginBottom: 4 }}>POPULAÇÃO (μ = {fmt(pop.mu, 2)}, σ = {fmt(pop.sd, 2)})</p>
      <Hist values={population} bins={shape === 'bernoulli' ? 20 : 40} className={s.barPop} />
      <p style={{ font: '500 12px var(--font-mono)', color: 'var(--text-muted)', margin: '16px 0 4px' }}>MÉDIAS DAS AMOSTRAS · curva: normal(μ, σ/√n)</p>
      <Hist values={means} bins={50} className={s.barMean} curve={{ mu: pop.mu, sd: se }} />
    </SimFrame>
  )
}
