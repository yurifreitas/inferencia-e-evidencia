import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from './components/FilterBar'
import { ReferenceList } from './components/ReferenceList'
import { useReferenceFilters, useReferenceStats } from './hooks'
import styles from './pages.module.css'

export function LibraryPage() {
  const stats = useReferenceStats()
  const f = useReferenceFilters()
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Acervo"
        title="Todas as referências"
        lead={`${stats.total} livros, artigos, relatórios e cursos — ${stats.free} com texto completo grátis e ${stats.links} links conferidos. Os filtros ficam na URL.`}
      />
      <div className={styles.stack}>
        <FilterBar
          filters={f.filters}
          themes={stats.byTheme}
          kinds={stats.byKind}
          onQuery={f.setQuery}
          onTheme={f.setTheme}
          onKind={f.setKind}
          onEssential={f.setEssential}
          onFree={f.setFree}
        />
        <ReferenceList items={f.results} total={f.total} onReset={f.reset} />
      </div>
    </div>
  )
}
