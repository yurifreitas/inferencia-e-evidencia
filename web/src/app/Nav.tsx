import { href } from '@/lib/router'
import type { ThemeChoice } from '@/lib/useTheme'
import styles from './Nav.module.css'

const GROUPS: { label: string; items: { id: string; label: string; icon: string }[] }[] = [
  { label: 'Começar', items: [
    { id: '', label: 'Visão geral', icon: '◇' },
    { id: 'ensaios', label: 'Ensaios', icon: '¶' },
    { id: 'trilhas', label: 'Trilhas', icon: '≡' },
  ] },
  { label: 'História', items: [
    { id: 'raizes', label: 'Raízes', icon: '◎' },
    { id: 'linha-do-tempo', label: 'Linha do tempo', icon: '⋯' },
  ] },
  { label: 'Conceitos', items: [
    { id: 'fundamentos', label: 'Fundamentos', icon: 'ƒ' },
    { id: 'mapa', label: 'Mapa de conceitos', icon: '⌘' },
    { id: 'revisao', label: 'Revisão', icon: '↻' },
    { id: 'laboratorio', label: 'Laboratório', icon: '⊿' },
    { id: 'debates', label: 'Debates', icon: '⇄' },
    { id: 'equivocos', label: 'Equívocos de hoje', icon: '!' },
  ] },
  { label: 'Acervo', items: [
    { id: 'acervo', label: 'Referências', icon: '▤' },
    { id: 'glossario', label: 'Glossário', icon: 'Aa' },
    { id: 'sobre', label: 'Sobre e método', icon: 'i' },
  ] },
]

export type NavProps = { section: string }

export function Nav({ section }: NavProps) {
  const active = section === 'ref' ? 'acervo' : section
  return (
    <nav aria-label="Principal" className={styles.nav}>
      {GROUPS.map((g) => (
        <div key={g.label} className={styles.group}>
          <p className={styles.groupLabel}>{g.label}</p>
          <ul className={styles.list}>
            {g.items.map((i) => (
              <li key={i.id}>
                <a href={i.id ? href(i.id) : '#/'} aria-current={active === i.id ? 'page' : undefined} className={styles.item}>
                  <span className={styles.icon} aria-hidden="true">{i.icon}</span>
                  {i.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function Brand() {
  return (
    <a href="#/" className={styles.brand}>
      <span className={styles.logo} aria-hidden="true"><i /><i /><i /><i /></span>
      <span className={styles.brandText}>
        <span>Matriz</span>
        <small>história e fundamentos da avaliação</small>
      </span>
    </a>
  )
}

export function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className={styles.search} onClick={onOpen} aria-label="Buscar (Ctrl+K)">
      <span aria-hidden="true" className={styles.searchIcon}>⌕</span>
      <span className={styles.searchLabel}>Buscar…</span>
      <span className={styles.searchKeys} aria-hidden="true"><kbd>Ctrl</kbd><kbd>K</kbd></span>
    </button>
  )
}

const THEMES: { value: ThemeChoice; label: string; icon: string }[] = [
  { value: 'light', label: 'Claro', icon: '☀' },
  { value: 'system', label: 'Sistema', icon: '◐' },
  { value: 'dark', label: 'Escuro', icon: '☾' },
]

export function ThemeSwitch({ theme, onChange }: { theme: ThemeChoice; onChange: (t: ThemeChoice) => void }) {
  return (
    <div role="radiogroup" aria-label="Tema" className={styles.theme}>
      {THEMES.map((t) => (
        <button key={t.value} type="button" role="radio" aria-checked={theme === t.value} title={t.label} aria-label={t.label}
          className={styles.themeBtn} onClick={() => onChange(t.value)}>
          {t.icon}
        </button>
      ))}
    </div>
  )
}
