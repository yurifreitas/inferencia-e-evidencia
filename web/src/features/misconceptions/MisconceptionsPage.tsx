import { useMemo } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { ChipGroup } from '@/components/molecules/ChipGroup'
import { EmptyState } from '@/components/molecules/EmptyState'
import { href } from '@/lib/router'
import { useUrlParams } from '@/lib/useUrlState'
import { FrequencyTree } from '@/features/lab/components/FrequencyTree'
import { CATEGORY_LABEL, MISCONCEPTIONS, type MisconceptionCategory } from './model'
import styles from './MisconceptionsPage.module.css'

const isCategory = (v: string | null): v is MisconceptionCategory => v !== null && v in CATEGORY_LABEL

export function MisconceptionsPage() {
  const [params, update] = useUrlParams()
  const cat = params.get('categoria')
  const category = isCategory(cat) ? cat : null
  const items = useMemo(() => MISCONCEPTIONS.filter((m) => (category ? m.category === category : true))
    .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'alta' ? -1 : 1)), [category])
  const options = (Object.keys(CATEGORY_LABEL) as MisconceptionCategory[])
    .map((c) => ({ value: c, label: CATEGORY_LABEL[c], count: MISCONCEPTIONS.filter((m) => m.category === c).length }))
    .filter((o) => o.count > 0)
  const cases = MISCONCEPTIONS.reduce((n, m) => n + m.cases.length, 0)

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Equívocos de hoje"
        title="O que se entende mal sobre números, testes e IA"
        lead="“99% de acurácia”, “estatisticamente significativo”, “a IA supera os médicos”. Frases corretas no papel viram conclusões erradas na prática. Cada equívoco traz o mecanismo do erro, a conta certa, casos reais documentados e as perguntas que você deve fazer."
      />

      <dl className={styles.stats}>
        <div><dt>equívocos</dt><dd>{MISCONCEPTIONS.length}</dd></div>
        <div><dt>casos reais</dt><dd>{cases}</dd></div>
      </dl>

      <section className={styles.demo} aria-labelledby="demo-title">
        <div className={styles.demoHead}>
          <p className={styles.eyebrow}>O equívoco mais comum</p>
          <h2 id="demo-title" className={styles.h2}>Um teste “99% preciso” e uma condição rara</h2>
          <p className={styles.lead}>Mova a prevalência para baixo e veja quantos positivos são falsos, mesmo com sensibilidade e especificidade de 99%.</p>
        </div>
        <FrequencyTree population={10000} prevalence={0.001} sensitivity={0.99} specificity={0.99} />
      </section>

      {options.length > 0 && (
        <ChipGroup label="Filtrar por categoria" options={options} value={category} onChange={(v) => update({ categoria: v })} allLabel="Todos" />
      )}

      {items.length === 0 ? (
        <EmptyState title="Os equívocos estão sendo pesquisados" description="Cada um terá casos reais verificados e fontes." />
      ) : (
        <ul className={styles.grid}>
          {items.map((m) => (
            <li key={m.id}>
              <a href={href('equivocos', m.id)} className={styles.card}>
                <span className={styles.cardTop}>
                  <span className={styles.category}>{CATEGORY_LABEL[m.category]}</span>
                  {m.severity === 'alta' && <span className={styles.severity}>muito comum</span>}
                </span>
                <span className={styles.myth}><span className={styles.mark} aria-hidden="true">✕</span>{m.myth}</span>
                <span className={styles.reality}><span className={styles.markOk} aria-hidden="true">✓</span>{m.reality}</span>
                <span className={styles.meta}>{m.cases.length} caso{m.cases.length === 1 ? '' : 's'} real{m.cases.length === 1 ? '' : 'is'} · {m.refIds.length} fontes</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
