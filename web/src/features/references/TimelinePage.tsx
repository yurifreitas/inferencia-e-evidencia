import { PageHeader } from '@/components/molecules/PageHeader'
import { Timeline } from './components/Timeline'
import styles from './pages.module.css'

export function TimelinePage() {
  return (
    <div className={styles.pageWide}>
      <PageHeader
        eyebrow="1884 → hoje"
        title="Linha do tempo"
        lead="Quatro tradições chegam à mesma tabela 2×2 por caminhos diferentes: meteorologia e recuperação da informação (precision/recall), radar e psicofísica (ROC), medicina e anotação (sensibilidade, kappa) — e só se encontram no machine learning. Livros em negrito."
      />
      <Timeline />
    </div>
  )
}
