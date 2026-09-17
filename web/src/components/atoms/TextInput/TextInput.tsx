import { forwardRef, type InputHTMLAttributes } from 'react'
import styles from './TextInput.module.css'

export type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput({ className, ...rest }, ref) {
  return <input ref={ref} className={`${styles.input} ${className ?? ''}`} {...rest} />
})
