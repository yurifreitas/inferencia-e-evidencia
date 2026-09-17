import { Chip } from '@/components/atoms/Chip'
import styles from './ChipGroup.module.css'

export type ChipOption<T extends string> = { value: T; label: string; count?: number }

export type ChipGroupProps<T extends string> = {
  label: string
  options: ChipOption<T>[]
  value: T | null
  onChange: (value: T | null) => void
  allLabel?: string
  /** false = seleção obrigatória, sem o chip "Todos" */
  allowNone?: boolean
}

export function ChipGroup<T extends string>({ label, options, value, onChange, allLabel = 'Todos', allowNone = true }: ChipGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className={styles.group}>
      {allowNone && <Chip selected={value === null} onClick={() => onChange(null)}>{allLabel}</Chip>}
      {options.map((o) => (
        <Chip key={o.value} selected={value === o.value} count={o.count} onClick={() => onChange(allowNone && value === o.value ? null : o.value)}>
          {o.label}
        </Chip>
      ))}
    </div>
  )
}
