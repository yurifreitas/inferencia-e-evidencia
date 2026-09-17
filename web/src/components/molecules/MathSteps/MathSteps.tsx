import { Formula } from '@/components/atoms/Formula'
import styles from './MathSteps.module.css'

export type MathStep = { text: string; math?: string }
export type MathStepsProps = { steps: MathStep[] }

export function MathSteps({ steps }: MathStepsProps) {
  return (
    <ol className={styles.steps}>
      {steps.map((s, i) => (
        <li key={i}>
          <span className={styles.num}>{i + 1}</span>
          <div className={styles.body}>
            <p>{s.text}</p>
            {s.math && <Formula>{s.math}</Formula>}
          </div>
        </li>
      ))}
    </ol>
  )
}
