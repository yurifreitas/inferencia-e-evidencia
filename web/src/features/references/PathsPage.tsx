import { PageHeader } from '@/components/molecules/PageHeader'
import { ReadingPaths } from './components/ReadingPaths'
import styles from './pages.module.css'

export function PathsPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Por onde começar"
        title="Trilhas de leitura"
        lead="Sequências curtas conforme o objetivo: o mínimo essencial, a genealogia histórica, as métricas, a base matemática, o gabarito, a pré-história da tabela 2×2 e a avaliação voltada à decisão."
      />
      <ReadingPaths />
    </div>
  )
}
