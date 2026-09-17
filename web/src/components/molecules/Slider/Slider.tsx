import { useId, type CSSProperties } from 'react'
import styles from './Slider.module.css'

export type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  hint?: string
  onChange: (v: number) => void
}

export function Slider({ label, value, min, max, step, display, hint, onChange }: SliderProps) {
  const id = useId()
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div className={styles.slider}>
      <div className={styles.head}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        <output htmlFor={id} className={styles.value}>{display}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill': `${fill}%` } as CSSProperties}
        className={styles.input}
      />
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
