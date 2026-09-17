import { useState } from 'react'
import styles from './CopyButton.module.css'

export type CopyButtonProps = { text: string; label?: string }

export function CopyButton({ text, label = 'Copiar citação' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button type="button" className={styles.btn} onClick={copy}>
      <span aria-live="polite">{copied ? 'Copiado ✓' : label}</span>
    </button>
  )
}
