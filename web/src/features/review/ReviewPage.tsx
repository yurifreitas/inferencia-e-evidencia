import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { ChipGroup } from '@/components/molecules/ChipGroup'
import { EmptyState } from '@/components/molecules/EmptyState'
import { href } from '@/lib/router'
import { useProgress } from '@/lib/progress'
import { CONCEPTS, GROUP_LABEL, GROUP_ORDER } from '@/features/concepts/data'
import { getDeep } from '@/features/concepts/deep'
import type { ConceptGroup } from '@/features/concepts/model'
import styles from './ReviewPage.module.css'

type Card = { key: string; conceptId: string; conceptName: string; group: ConceptGroup; question: string; answer: string; solution: string }

const ALL_CARDS: Card[] = CONCEPTS.flatMap((c) =>
  (getDeep(c.id)?.exercises ?? []).map((ex, i) => ({
    key: `${c.id}#${i}`, conceptId: c.id, conceptName: c.name, group: c.group, question: ex.question, answer: ex.answer, solution: ex.solution,
  })),
)

type Scope = 'estudados' | 'todos'

/** Revisão espaçada simples (Leitner): caixa 1 aparece mais, caixa 3 menos; errou volta para a caixa 1. */
export function ReviewPage() {
  const { state, grade, isStudied } = useProgress()
  const [scope, setScope] = useState<Scope>(Object.keys(state.studied).length ? 'estudados' : 'todos')
  const [group, setGroup] = useState<ConceptGroup | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [skip, setSkip] = useState<string[]>([])

  const pool = useMemo(() => ALL_CARDS
    .filter((c) => (scope === 'estudados' ? isStudied(c.conceptId) : true))
    .filter((c) => (group ? c.group === group : true)), [scope, group, isStudied])

  const current = useMemo(() => {
    const candidates = pool.filter((c) => !skip.includes(c.key))
    if (!candidates.length) return null
    // prioriza caixa mais baixa e depois o visto há mais tempo
    return candidates.slice().sort((a, b) => {
      const ra = state.review[a.key], rb = state.review[b.key]
      const ba = ra?.box ?? 0, bb = rb?.box ?? 0
      return ba - bb || (ra?.last ?? 0) - (rb?.last ?? 0)
    })[0]
  }, [pool, skip, state.review])

  const boxes = [1, 2, 3].map((b) => pool.filter((c) => (state.review[c.key]?.box ?? 0) === b).length)
  const unseen = pool.filter((c) => !state.review[c.key]).length

  const answer = (correct: boolean) => {
    if (!current) return
    grade(current.key, correct)
    setSkip((s) => [...s, current.key].slice(-Math.max(1, Math.floor(pool.length / 2))))
    setRevealed(false)
  }

  const groupOptions = GROUP_ORDER.map((g) => ({ value: g, label: GROUP_LABEL[g], count: ALL_CARDS.filter((c) => c.group === g && (scope === 'todos' || isStudied(c.conceptId))).length }))
    .filter((o) => o.count > 0)

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Revisão"
        title="Pratique com os exercícios"
        lead={`${ALL_CARDS.length} exercícios dos conceitos. Responda de cabeça (ou no papel), revele a resposta e diga se acertou: o que você erra volta mais vezes. O histórico fica só neste navegador.`}
      />

      <div className={styles.filters}>
        <ChipGroup label="Escopo" allowNone={false} value={scope} onChange={(v) => { if (v) { setScope(v); setSkip([]) } }}
          options={[{ value: 'estudados', label: 'Conceitos que estudei', count: ALL_CARDS.filter((c) => isStudied(c.conceptId)).length }, { value: 'todos', label: 'Todos', count: ALL_CARDS.length }]} />
        <ChipGroup label="Etapa" value={group} onChange={(v) => { setGroup(v); setSkip([]) }} options={groupOptions} allLabel="Todas as etapas" />
      </div>

      <dl className={styles.stats}>
        <div><dt>nunca vistos</dt><dd>{unseen}</dd></div>
        <div><dt>caixa 1 · revisar sempre</dt><dd>{boxes[0]}</dd></div>
        <div><dt>caixa 2</dt><dd>{boxes[1]}</dd></div>
        <div><dt>caixa 3 · dominados</dt><dd>{boxes[2]}</dd></div>
      </dl>

      {!current ? (
        <EmptyState
          title={pool.length ? 'Rodada concluída' : 'Nenhum exercício neste recorte'}
          description={pool.length ? 'Você passou por todos os exercícios deste recorte. Comece outra rodada.' : 'Marque conceitos como estudados ou escolha "Todos".'}
          action={pool.length ? <button type="button" className={styles.button} onClick={() => setSkip([])}>Nova rodada</button> : <a href={href('fundamentos')}>Ir para Fundamentos</a>}
        />
      ) : (
        <article className={styles.card} aria-live="polite">
          <header className={styles.cardHead}>
            <a href={href('fundamentos', current.conceptId)} className={styles.concept}>{current.conceptName}</a>
            <span className={styles.box}>{state.review[current.key] ? `caixa ${state.review[current.key].box} · ${state.review[current.key].right}/${state.review[current.key].seen} acertos` : 'novo'}</span>
          </header>
          <p className={styles.question}>{current.question}</p>
          {!revealed ? (
            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => setRevealed(true)}>Mostrar resposta</button>
          ) : (
            <>
              <div className={styles.answer}>
                <p className={styles.answerLabel}>Resposta</p>
                <p className={styles.answerText}>{current.answer}</p>
                <p className={styles.solution}>{current.solution}</p>
              </div>
              <div className={styles.grade}>
                <span>Você acertou?</span>
                <button type="button" className={`${styles.button} ${styles.wrong}`} onClick={() => answer(false)}>Errei</button>
                <button type="button" className={`${styles.button} ${styles.right}`} onClick={() => answer(true)}>Acertei</button>
              </div>
            </>
          )}
        </article>
      )}
    </div>
  )
}
