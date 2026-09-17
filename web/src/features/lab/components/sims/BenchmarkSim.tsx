import { useMemo, useState } from 'react'
import { Slider } from '@/components/molecules/Slider'
import { fmt, int, pct } from '@/lib/format'
import { phi, rng, zQuantile } from '@/lib/random'
import { SimFrame, Stat } from './SimFrame'
import s from './sims.module.css'

const W = 640, H = 220, M = { l: 120, r: 24, t: 20, b: 36 }
const Z = zQuantile(0.975)

function wilson(k: number, n: number): [number, number] {
  const p = k / n, den = 1 + (Z * Z) / n
  const c = (p + (Z * Z) / (2 * n)) / den
  const h = (Z / den) * Math.sqrt((p * (1 - p)) / n + (Z * Z) / (4 * n * n))
  return [c - h, c + h]
}

/**
 * Dois modelos no mesmo benchmark. O que importa para a diferença é quantas questões
 * eles DISCORDAM: a variância pareada depende de b + c, não das acurácias isoladas (Miller, 2024).
 */
export function BenchmarkSim() {
  const [n, setN] = useState(500)
  const [accA, setAccA] = useState(0.82)
  const [accB, setAccB] = useState(0.79)
  const [disagree, setDisagree] = useState(0.15)
  const [seed, setSeed] = useState(3)

  const minDis = Math.abs(accA - accB)
  const maxDis = Math.min(accA + accB, 2 - accA - accB)
  const dis = Math.min(maxDis, Math.max(minDis, disagree))
  const b = (dis + (accA - accB)) / 2 // A acerta, B erra
  const c = (dis - (accA - accB)) / 2 // A erra, B acerta

  const run = useMemo(() => {
    const r = rng(seed)
    let kA = 0, kB = 0, nb = 0, nc = 0
    const both = (accA + accB - dis) / 2
    for (let i = 0; i < n; i++) {
      const u = r.next()
      if (u < both) { kA++; kB++ } else if (u < both + b) { kA++; nb++ } else if (u < both + b + c) { kB++; nc++ }
    }
    const diff = (kA - kB) / n
    const sePaired = Math.sqrt(Math.max(0, ((nb + nc) / n - diff * diff) / n))
    const seUnpaired = Math.sqrt(((kA / n) * (1 - kA / n) + (kB / n) * (1 - kB / n)) / n)
    const mcnemar = nb + nc ? ((nb - nc) ** 2) / (nb + nc) : 0
    const pValue = nb + nc ? 2 * (1 - phi(Math.sqrt(mcnemar))) : 1
    return { kA, kB, nb, nc, diff, sePaired, seUnpaired, pValue }
  }, [seed, n, accA, accB, b, c, dis])

  // n por modelo para 80% de poder no teste pareado, com as taxas verdadeiras
  const needN = useMemo(() => {
    const d = accA - accB
    if (Math.abs(d) < 1e-9) return null
    const v = dis - d * d
    return Math.ceil(((Z + zQuantile(0.8)) ** 2 * v) / (d * d))
  }, [accA, accB, dis])

  const ciA = wilson(run.kA, n), ciB = wilson(run.kB, n)
  const lo = Math.max(0, Math.min(ciA[0], ciB[0]) - 0.03), hi = Math.min(1, Math.max(ciA[1], ciB[1]) + 0.03)
  const x = (v: number) => M.l + ((v - lo) / (hi - lo)) * (W - M.l - M.r)
  const dLo = run.diff - Z * run.sePaired, dHi = run.diff + Z * run.sePaired
  const span = Math.max(0.05, Math.abs(dLo), Math.abs(dHi)) * 1.15
  const xd = (v: number) => M.l + ((v + span) / (2 * span)) * (W - M.l - M.r)
  const significant = dLo > 0 || dHi < 0
  const ticks = Array.from({ length: 6 }, (_, i) => lo + (i * (hi - lo)) / 5)

  return (
    <SimFrame
      title="Simulador · barras de erro em benchmark"
      question="O modelo A é mesmo melhor que o B, ou é ruído do benchmark?"
      controls={
        <>
          <Slider label="Questões no benchmark (n)" value={Math.log10(n)} min={Math.log10(50)} max={Math.log10(20000)} step={0.01} display={int(n)} onChange={(v) => setN(Math.round(10 ** v))} />
          <Slider label="Acurácia real de A" value={accA} min={0.3} max={0.98} step={0.005} display={pct(accA, 1)} onChange={setAccA} />
          <Slider label="Acurácia real de B" value={accB} min={0.3} max={0.98} step={0.005} display={pct(accB, 1)} onChange={setAccB} />
          <Slider label="Questões em que discordam" value={dis} min={minDis} max={maxDis} step={0.005} display={pct(dis, 1)}
            hint="Modelos parecidos discordam pouco: a diferença fica mais precisa" onChange={setDisagree} />
          <div className={s.buttons}>
            <button type="button" className={`${s.button} ${s.primary}`} onClick={() => setSeed((v) => v + 1)}>Rodar o benchmark de novo</button>
          </div>
        </>
      }
      stats={
        <dl style={{ display: 'contents' }}>
          <Stat label="diferença observada (A − B)" value={`${fmt(run.diff * 100, 1)} p.p.`} />
          <Stat label="IC 95% pareado da diferença" value={`${fmt(dLo * 100, 1)} a ${fmt(dHi * 100, 1)} p.p.`} tone={significant ? 'ok' : 'warn'} />
          <Stat label="erro-padrão pareado × não pareado" value={`${fmt(run.sePaired * 100, 2)} × ${fmt(run.seUnpaired * 100, 2)}`} />
          <Stat label="McNemar (b, c, p)" value={`${run.nb}, ${run.nc}, p = ${fmt(run.pValue, 3)}`} />
          <Stat label="n para 80% de poder" value={needN ? int(needN) : '—'} />
        </dl>
      }
      takeaway={<>Barras de cada modelo que se sobrepõem <strong>não</strong> provam empate: o que decide é o intervalo da <strong>diferença pareada</strong>, que depende de quantas questões os modelos discordam (b + c). Rode de novo algumas vezes: com n pequeno, o “vencedor” troca de lugar. Reporte n, o intervalo e, se as questões vêm em grupos, erros-padrão agrupados (Miller, 2024).</>}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`A: ${pct(run.kA / n, 1)}; B: ${pct(run.kB / n, 1)}; diferença ${fmt(run.diff * 100, 1)} pontos percentuais.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={M.t} y2={110} className={s.grid} />
            <text x={x(t)} y={122} textAnchor="middle" className={s.tick}>{pct(t, 0)}</text>
          </g>
        ))}
        {[{ label: 'Modelo A', k: run.kA, ci: ciA, y: 42 }, { label: 'Modelo B', k: run.kB, ci: ciB, y: 82 }].map((m) => (
          <g key={m.label}>
            <text x={M.l - 12} y={m.y + 4} textAnchor="end" className={s.label}>{m.label}</text>
            <line x1={x(m.ci[0])} x2={x(m.ci[1])} y1={m.y} y2={m.y} className={s.hit} />
            <circle cx={x(m.k / n)} cy={m.y} r={6} className={s.current} />
          </g>
        ))}
        <line x1={xd(0)} x2={xd(0)} y1={148} y2={196} className={s.truth} />
        <text x={M.l - 12} y={176} textAnchor="end" className={s.label}>Diferença A − B</text>
        <line x1={xd(dLo)} x2={xd(dHi)} y1={172} y2={172} className={significant ? s.hit : s.miss} />
        <circle cx={xd(run.diff)} cy={172} r={6} className={s.current} />
        <text x={xd(0)} y={H - 6} textAnchor="middle" className={s.tick}>0</text>
        <text x={xd(-span)} y={H - 6} className={s.tick}>{fmt(-span * 100, 1)} p.p.</text>
        <text x={xd(span)} y={H - 6} textAnchor="end" className={s.tick}>+{fmt(span * 100, 1)} p.p.</text>
      </svg>
    </SimFrame>
  )
}
