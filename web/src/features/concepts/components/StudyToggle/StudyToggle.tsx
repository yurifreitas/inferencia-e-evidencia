import { useProgress } from '@/lib/progress'
import styles from './StudyToggle.module.css'

export type StudyToggleProps = { id: string }

export function StudyToggle({ id }: StudyToggleProps) {
  const { isStudied, toggleStudied } = useProgress()
  const done = isStudied(id)
  return (
    <button type="button" aria-pressed={done} className={styles.toggle} onClick={() => toggleStudied(id)}>
      <span className={styles.box} aria-hidden="true">{done ? '✓' : ''}</span>
      {done ? 'Estudado' : 'Marcar como estudado'}
    </button>
  )
}
