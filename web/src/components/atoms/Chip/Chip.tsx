import { forwardRef, type ButtonHTMLAttributes } from 'react'
import styles from './Chip.module.css'

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; count?: number }

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected = false, count, children, className, ...rest },
  ref,
) {
  return (
    <button ref={ref} type="button" aria-pressed={selected} className={`${styles.chip} ${className ?? ''}`} {...rest}>
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  )
})
