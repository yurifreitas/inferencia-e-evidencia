import { TextInput } from '@/components/atoms/TextInput'
import { Chip } from '@/components/atoms/Chip'
import { ChipGroup, type ChipOption } from '@/components/molecules/ChipGroup'
import type { Filters, Kind, Theme } from '../../model'
import styles from './FilterBar.module.css'

export type FilterBarProps = {
  filters: Filters
  themes: ChipOption<Theme>[]
  kinds: ChipOption<Kind>[]
  onQuery: (q: string) => void
  onTheme: (t: Theme | null) => void
  onKind: (k: Kind | null) => void
  onEssential: (on: boolean) => void
  onFree: (on: boolean) => void
}

export function FilterBar({ filters, themes, kinds, onQuery, onTheme, onKind, onEssential, onFree }: FilterBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.search}>
        <label htmlFor="ref-search" className={styles.srOnly}>Buscar referências</label>
        <span className={styles.icon} aria-hidden="true">⌕</span>
        <TextInput
          id="ref-search"
          type="search"
          placeholder="Buscar por autor, título, ano ou conceito (ex.: kappa, Swets, AUC)"
          value={filters.q}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.rowLabel}>Tema</span>
        <ChipGroup label="Filtrar por tema" options={themes} value={filters.theme} onChange={onTheme} />
      </div>
      <div className={styles.row}>
        <span className={styles.rowLabel}>Tipo</span>
        <div className={styles.inline}>
          <ChipGroup label="Filtrar por tipo" options={kinds} value={filters.kind} onChange={onKind} />
          <span className={styles.sep} aria-hidden="true" />
          <Chip selected={filters.essential} onClick={() => onEssential(!filters.essential)}>★ Só essenciais</Chip>
          <Chip selected={filters.free} onClick={() => onFree(!filters.free)}>Grátis para ler</Chip>
        </div>
      </div>
    </div>
  )
}
