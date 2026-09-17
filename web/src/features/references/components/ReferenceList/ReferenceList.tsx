import { EmptyState } from '@/components/molecules/EmptyState'
import { Chip } from '@/components/atoms/Chip'
import { ReferenceCard } from '../ReferenceCard'
import type { Reference } from '../../model'
import styles from './ReferenceList.module.css'

export type ReferenceListProps = { items: Reference[]; total: number; onReset: () => void }

export function ReferenceList({ items, total, onReset }: ReferenceListProps) {
  return (
    <div className={styles.wrap}>
      <p className={styles.count} aria-live="polite">
        <strong>{items.length}</strong> de {total} referências · ordem cronológica
      </p>
      {items.length === 0 ? (
        <EmptyState
          title="Nenhuma referência com esses filtros"
          description="Tente um termo mais amplo ou remova o filtro de tema ou tipo."
          action={<Chip onClick={onReset}>Limpar filtros</Chip>}
        />
      ) : (
        <div className={styles.list}>
          {items.map((r) => <ReferenceCard key={r.id} reference={r} />)}
        </div>
      )}
    </div>
  )
}
