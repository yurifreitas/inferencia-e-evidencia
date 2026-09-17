import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { ChipGroup } from '@/components/molecules/ChipGroup'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Callout } from '@/components/molecules/Callout'
import { Chip } from '@/components/atoms/Chip'
import { ROOT_EVENTS, THREADS } from './data'
import { CERTAINTY_LABEL, ERAS, eraIndex, REGION_GROUP, REGION_LABEL, REGION_ORDER, type Certainty } from './model'
import { useRootFilters } from './hooks'
import { RootsMap } from './components/RootsMap'
import { RootCard } from './components/RootCard'
import styles from './RootsPage.module.css'

export function RootsPage() {
  const f = useRootFilters()
  const [selected, setSelected] = useState<string | null>(null)
  const highlighted = useMemo(() => new Set(f.results.map((e) => e.id)), [f.results])
  const anyFilter = Boolean(f.filters.region || f.filters.concept || f.filters.certainty)

  const regionOptions = REGION_ORDER.map((r) => ({ value: r, label: REGION_LABEL[r], count: ROOT_EVENTS.filter((e) => e.region === r).length }))
    .filter((o) => o.count > 0)
  const threadOptions = THREADS.map((t) => ({ value: t.conceptId, label: t.label, count: ROOT_EVENTS.filter((e) => e.conceptIds.includes(t.conceptId)).length }))
    .filter((o) => o.count > 0)
  const certaintyOptions = (Object.keys(CERTAINTY_LABEL) as Certainty[]).map((c) => ({ value: c, label: CERTAINTY_LABEL[c], count: ROOT_EVENTS.filter((e) => e.certainty === c).length }))

  const groups = { Sul: 0, Oriente: 0, Ocidente: 0 }
  ROOT_EVENTS.forEach((e) => { groups[REGION_GROUP[e.region]]++ })

  const select = (id: string) => {
    setSelected(id)
    document.getElementById(`raiz-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Raízes"
        title="Antes da matriz: África, Oriente e Ocidente"
        lead="Muito antes de TP e FP, tradições em todo o mundo já registravam diagnósticos contra desfechos, classificavam, graduavam a confiabilidade de testemunhas, avaliavam às cegas e pesavam evidências. Esta é a genealogia longa das ideias que a avaliação de classificadores formalizou."
      />

      <dl className={styles.stats}>
        <div><dt>marcos</dt><dd>{ROOT_EVENTS.length}</dd></div>
        <div><dt>África</dt><dd>{groups.Sul}</dd></div>
        <div><dt>Oriente</dt><dd>{groups.Oriente}</dd></div>
        <div><dt>Ocidente</dt><dd>{groups.Ocidente}</dd></div>
      </dl>

      <Callout label="Como ler" tone="gold">
        Nada aqui afirma que povos antigos "inventaram" precision ou recall. Cada marco mostra um ancestral honesto de uma ideia — e diz quando
        a ligação é fato estabelecido, interpretação de historiadores ou especulação.
      </Callout>

      <section className={styles.mapSection} aria-label="Mapa do tempo">
        <RootsMap events={ROOT_EVENTS} highlighted={anyFilter ? highlighted : new Set()} selectedId={selected} onSelect={select} />
      </section>

      <section className={styles.filters} aria-label="Filtros">
        <div className={styles.row}><span className={styles.rowLabel}>Região</span>
          <ChipGroup label="Filtrar por região" options={regionOptions} value={f.filters.region} onChange={f.setRegion} allLabel="Todas" /></div>
        <div className={styles.row}><span className={styles.rowLabel}>Ideia</span>
          <ChipGroup label="Filtrar por ideia" options={threadOptions} value={f.filters.concept} onChange={f.setConcept} allLabel="Todas" /></div>
        <div className={styles.row}><span className={styles.rowLabel}>Certeza</span>
          <ChipGroup label="Filtrar por grau de certeza" options={certaintyOptions} value={f.filters.certainty} onChange={f.setCertainty} allLabel="Todas" /></div>
      </section>

      {f.results.length === 0 ? (
        <EmptyState title="Nenhum marco com esses filtros" description="Combine menos filtros ou escolha outra região." action={<Chip onClick={f.reset}>Limpar filtros</Chip>} />
      ) : (
        <div className={styles.eras}>
          {ERAS.map((era, i) => {
            const items = f.results.filter((e) => eraIndex(e.year) === i)
            if (items.length === 0) return null
            return (
              <section key={era.label} className={styles.era} aria-labelledby={`era-${i}`}>
                <header className={styles.eraHead}>
                  <h2 id={`era-${i}`} className={styles.eraTitle}>{era.label}</h2>
                  <span className={styles.eraCount}>{items.length} marcos</span>
                </header>
                <div className={styles.cards}>
                  {items.map((e) => <RootCard key={e.id} event={e} selected={selected === e.id} />)}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
