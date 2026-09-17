import styles from './Formula.module.css'

export type FormulaProps = { children: string; size?: 'md' | 'lg' }

export function Formula({ children, size = 'md' }: FormulaProps) {
  return (
    <pre className={`${styles.formula} ${styles[size]}`}>
      <code>{children}</code>
    </pre>
  )
}
