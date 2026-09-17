import { href } from '@/lib/router'
import { REFERENCES, CHAIN } from '@/features/references/data'
import { CONCEPTS } from '@/features/concepts/data'
import { DEBATES } from '@/features/debates/data'
import { ROOT_EVENTS } from '@/features/roots/data'
import { MISCONCEPTIONS } from '@/features/misconceptions/model'
import { getRefs } from '@/features/xref'
import { THEME_LABEL, type Theme } from '@/features/references/model'
import { RefRow } from '@/features/references/components/RefRow'
import styles from './OverviewPage.module.css'

const ENTRIES = [
  { to: href('raizes'), eyebrow: `${ROOT_EVENTS.length} marcos`, title: 'Raízes', text: 'Da África ao Oriente e ao Ocidente: diagnóstico, gabarito, juízes e evidência muito antes da matriz.' },
  { to: href('equivocos'), eyebrow: `${MISCONCEPTIONS.length} equívocos`, title: 'Equívocos de hoje', text: '“99% de acurácia”, p-valor, detectores de IA, vazamento de dados: o que se entende mal e como ler certo.' },
  { to: href('fundamentos'), eyebrow: `${CONCEPTS.length} conceitos`, title: 'Fundamentos', text: 'Fórmula, intuição, origem e armadilhas de cada métrica — com as referências que sustentam cada afirmação.' },
  { to: href('laboratorio'), eyebrow: 'interativo', title: 'Laboratório', text: 'Arraste o limiar sobre duas distribuições e veja matriz, ROC, PR e 16 métricas mudarem juntas.' },
  { to: href('debates'), eyebrow: `${DEBATES.length} controvérsias`, title: 'Debates', text: 'ROC × PR, AUC coerente?, F1 × MCC, paradoxos do kappa, o gabarito é verdade?' },
  { to: href('acervo'), eyebrow: `${REFERENCES.length} referências`, title: 'Acervo', text: 'Busca e filtros por tema, tipo e acesso, com links verificados para versões legais gratuitas.' },
]

const CELLS = [
  { k: 'TP', tone: 'ok', names: ['hit', 'relevante recuperado', 'verdadeiro positivo'], concept: 'sensibilidade' },
  { k: 'FP', tone: 'fp', names: ['false alarm', 'erro tipo I', 'fallout'], concept: 'fpr' },
  { k: 'FN', tone: 'fn', names: ['miss', 'erro tipo II', 'omissão'], concept: 'erros-tipo' },
  { k: 'TN', tone: 'ok', names: ['correct rejection', 'verdadeiro negativo'], concept: 'especificidade' },
] as const

const COVERAGE = (Object.keys(THEME_LABEL) as Theme[])
  .map((t) => {
    const refs = REFERENCES.filter((r) => r.themes[0] === t)
    return { label: THEME_LABEL[t], total: refs.length, free: refs.filter((r) => r.access === 'livre').length }
  })
  .sort((a, b) => b.total - a.total)
const MAX = Math.max(...COVERAGE.map((c) => c.total))

const START = ['van-rijsbergen-1979', 'green-swets-1966', 'fawcett-2006', 'bishop-2006', 'esl-2009', 'japkowicz-shah-2011']

export function OverviewPage() {
  const free = REFERENCES.filter((r) => r.access === 'livre').length
  const years = REFERENCES.map((r) => r.year)
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Acervo de pesquisa · avaliação de classificadores</p>
          <h1 className={styles.title}>De onde vêm TP, FP, FN e TN — e por que cada métrica decide diferente</h1>
          <p className={styles.lead}>
            Quatro tradições chegaram à mesma tabela 2×2: meteorologia e recuperação da informação, radar e psicofísica, medicina e anotação,
            estatística e machine learning. Este acervo reúne as fontes, explica os conceitos e deixa você experimentar.
          </p>
          <dl className={styles.stats}>
            <div><dt>referências</dt><dd>{REFERENCES.length}</dd></div>
            <div><dt>texto grátis</dt><dd>{free}</dd></div>
            <div><dt>conceitos</dt><dd>{CONCEPTS.length}</dd></div>
            <div><dt>período</dt><dd>{Math.min(...years)}–{Math.max(...years)}</dd></div>
          </dl>
        </div>

        <figure className={styles.matrix} aria-label="Matriz de confusão com os nomes de cada tradição">
          <div className={styles.mGrid}>
            <span />
            <span className={styles.mHead}>referência +</span>
            <span className={styles.mHead}>referência −</span>
            <span className={styles.mSide}>previsto +</span>
            {CELLS.slice(0, 2).map((c) => (
              <a key={c.k} href={href('fundamentos', c.concept)} className={`${styles.mCell} ${styles[c.tone]}`}>
                <b>{c.k}</b>{c.names.map((n) => <small key={n}>{n}</small>)}
              </a>
            ))}
            <span className={styles.mSide}>previsto −</span>
            {CELLS.slice(2).map((c) => (
              <a key={c.k} href={href('fundamentos', c.concept)} className={`${styles.mCell} ${styles[c.tone]}`}>
                <b>{c.k}</b>{c.names.map((n) => <small key={n}>{n}</small>)}
              </a>
            ))}
          </div>
          <figcaption className={styles.mCaption}>Clique numa célula para abrir o conceito.</figcaption>
        </figure>
      </section>

      <ol className={styles.chain} aria-label="Progressão conceitual">
        {CHAIN.map((step, i) => (
          <li key={step}><span>{String(i + 1).padStart(2, '0')}</span>{step}</li>
        ))}
      </ol>

      <section className={styles.entries} aria-label="Seções">
        {ENTRIES.map((e) => (
          <a key={e.title} href={e.to} className={styles.entry}>
            <span className={styles.entryEyebrow}>{e.eyebrow}</span>
            <span className={styles.entryTitle}>{e.title} <span aria-hidden="true">→</span></span>
            <span className={styles.entryText}>{e.text}</span>
          </a>
        ))}
      </section>

      <div className={styles.bottom}>
        <section className={styles.start}>
          <div className={styles.startHead}>
            <h2 className={styles.h2}>Se for ler só seis</h2>
            <a href={href('trilhas')} className={styles.more}>Trilhas →</a>
          </div>
          <div>{getRefs(START).map((r) => <RefRow key={r.id} reference={r} />)}</div>
        </section>

        <section className={styles.start}>
          <div className={styles.startHead}>
            <h2 className={styles.h2}>Em disputa</h2>
            <a href={href('debates')} className={styles.more}>Todos os debates →</a>
          </div>
          <ul className={styles.debates}>
            {DEBATES.slice(0, 4).map((d) => (
              <li key={d.id}>
                <a href={`${href('debates')}#${d.id}`} className={styles.debate}>
                  <span className={styles.debateQ}>{d.question}</span>
                  <span className={styles.debateT}>{d.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={styles.coverage} aria-labelledby="cov-title">
        <div className={styles.startHead}>
          <h2 id="cov-title" className={styles.h2}>O acervo por tradição</h2>
          <a href={href('linha-do-tempo')} className={styles.more}>Linha do tempo →</a>
        </div>
        <p className={styles.covSub}>Referências por tema principal · parte escura = texto completo grátis</p>
        <ul className={styles.bars}>
          {COVERAGE.map((c) => (
            <li key={c.label} className={styles.barRow}>
              <span className={styles.barLabel}>{c.label}</span>
              <span className={styles.barTrack} aria-hidden="true">
                <span className={styles.barTotal} style={{ width: `${(c.total / MAX) * 100}%` }}>
                  <span className={styles.barFree} style={{ width: `${c.total ? (c.free / c.total) * 100 : 0}%` }} />
                </span>
              </span>
              <span className={styles.barValue}>{c.total} <small>· {c.free} grátis</small></span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
