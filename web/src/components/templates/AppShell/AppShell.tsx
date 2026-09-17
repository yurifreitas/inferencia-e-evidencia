import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

export type AppShellProps = { brand: ReactNode; search: ReactNode; nav: ReactNode; footer: ReactNode; children: ReactNode; pageKey: string }

export function AppShell({ brand, search, nav, footer, children, pageKey }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <a href="#conteudo" className={styles.skip}>Pular para o conteúdo</a>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>{brand}</div>
        <div className={styles.search}>{search}</div>
        <div className={styles.nav}>{nav}</div>
        <div className={styles.sideFooter}>{footer}</div>
      </aside>
      <main id="conteudo" className={styles.main}>
        <div key={pageKey} className={styles.page}>{children}</div>
      </main>
    </div>
  )
}
