import { useEffect, useMemo, useRef, useState } from 'react'
import { search, type SearchKind } from '@/lib/search'
import { navigate } from '@/lib/router'
import styles from './CommandPalette.module.css'

export type CommandPaletteProps = { open: boolean; onClose: () => void }

const KIND_LABEL: Record<SearchKind, string> = { pagina: 'Páginas', equivoco: 'Equívocos', ensaio: 'Ensaios', conceito: 'Conceitos', raiz: 'Raízes', debate: 'Debates', referencia: 'Referências' }
const KIND_ICON: Record<SearchKind, string> = { pagina: '↗', equivoco: '!', ensaio: '¶', conceito: 'ƒ', raiz: '◎', debate: '⇄', referencia: '▤' }

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const results = useMemo(() => search(query), [query])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      setQuery('')
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    } else if (!open && d.open) d.close()
  }, [open])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (i: number) => {
    const r = results[i]
    if (!r) return
    navigate(r.to)
    onClose()
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(active) }
  }

  let lastKind: SearchKind | null = null

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Buscar no acervo"
      onClose={onClose}
      onClick={(e) => { if (e.target === dialogRef.current) onClose() }}
    >
      <div className={styles.panel}>
        <div className={styles.searchRow}>
          <span className={styles.icon} aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Buscar conceitos, debates, autores, títulos…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[active] ? `opt-${results[active].id}` : undefined}
          />
          <kbd>Esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" ref={listRef} className={styles.list}>
          {results.length === 0 && <li className={styles.empty}>Nada encontrado para “{query}”. Tente um autor, um ano ou uma métrica.</li>}
          {results.map((r, i) => {
            const header = r.kind !== lastKind ? KIND_LABEL[r.kind] : null
            lastKind = r.kind
            return (
              <li key={r.id} role="presentation">
                {header && <p className={styles.group}>{header}</p>}
                <div
                  id={`opt-${r.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  className={styles.option}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(i)}
                >
                  <span className={styles.kind} aria-hidden="true">{KIND_ICON[r.kind]}</span>
                  <span className={styles.text}>
                    <span className={styles.title}>{r.title}</span>
                    <span className={styles.subtitle}>{r.subtitle}</span>
                  </span>
                  <span className={styles.enter} aria-hidden="true">↵</span>
                </div>
              </li>
            )
          })}
        </ul>
        <footer className={styles.footer}>
          <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
          <span><kbd>↵</kbd> abrir</span>
          <span className={styles.count}>{results.length} resultados</span>
        </footer>
      </div>
    </dialog>
  )
}
