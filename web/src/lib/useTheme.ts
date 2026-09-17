import { useCallback, useEffect, useState } from 'react'

export type ThemeChoice = 'system' | 'light' | 'dark'
const KEY = 'matriz-theme'

const read = (): ThemeChoice => {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function applyStoredTheme() {
  const t = read()
  if (t !== 'system') document.documentElement.dataset.theme = t
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeChoice>(read)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
    try {
      if (theme === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, theme)
    } catch {
      /* armazenamento indisponível: tema vale só nesta sessão */
    }
  }, [theme])
  const setTheme = useCallback((t: ThemeChoice) => setThemeState(t), [])
  return { theme, setTheme }
}
