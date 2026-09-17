import { lazy, Suspense, useCallback, useEffect, useState, type ComponentType } from 'react'
import { AppShell } from '@/components/templates/AppShell'
import { useRoute } from '@/lib/router'
import { useTheme } from '@/lib/useTheme'
import { ErrorBoundary } from './ErrorBoundary'
import { Brand, Nav, SearchTrigger, ThemeSwitch } from './Nav'
import { CommandPalette } from './CommandPalette'
import { DelayedFallback } from './DelayedFallback'
import styles from './App.module.css'

// Cada seção é um chunk próprio; todos são pré-carregados quando o navegador fica ocioso,
// então a navegação continua instantânea sem carregar tudo no primeiro acesso.
function page<T extends Record<string, ComponentType<never>>>(loader: () => Promise<T>, name: keyof T) {
  const Component = lazy(() => loader().then((m) => ({ default: m[name] as ComponentType<Record<string, unknown>> })))
  return { Component, preload: loader }
}

const Pages = {
  overview: page(() => import('@/features/overview'), 'OverviewPage'),
  roots: page(() => import('@/features/roots'), 'RootsPage'),
  root: page(() => import('@/features/roots'), 'RootDetailPage'),
  concepts: page(() => import('@/features/concepts'), 'ConceptsPage'),
  lab: page(() => import('@/features/lab'), 'LabPage'),
  debates: page(() => import('@/features/debates'), 'DebatesPage'),
  essays: page(() => import('@/features/essays'), 'EssaysPage'),
  essay: page(() => import('@/features/essays'), 'EssayPage'),
  paths: page(() => import('@/features/references'), 'PathsPage'),
  timeline: page(() => import('@/features/references'), 'TimelinePage'),
  library: page(() => import('@/features/references'), 'LibraryPage'),
  reference: page(() => import('@/features/references'), 'ReferencePage'),
  about: page(() => import('@/features/about'), 'AboutPage'),
  myths: page(() => import('@/features/misconceptions'), 'MisconceptionsPage'),
  review: page(() => import('@/features/review'), 'ReviewPage'),
  map: page(() => import('@/features/map'), 'ConceptMapPage'),
  glossary: page(() => import('@/features/glossary'), 'GlossaryPage'),
  myth: page(() => import('@/features/misconceptions'), 'MisconceptionPage'),
  notFound: page(() => import('@/features/about'), 'NotFoundPage'),
}

function Page({ route }: { route: string[] }) {
  const [section = '', id] = route
  const P = (() => {
    switch (section) {
      case '': return { C: Pages.overview.Component, props: {} }
      case 'raizes': return id ? { C: Pages.root.Component, props: { id } } : { C: Pages.roots.Component, props: {} }
      case 'ensaios': return id ? { C: Pages.essay.Component, props: { id } } : { C: Pages.essays.Component, props: {} }
      case 'fundamentos': return { C: Pages.concepts.Component, props: { id } }
      case 'laboratorio': return { C: Pages.lab.Component, props: {} }
      case 'debates': return { C: Pages.debates.Component, props: {} }
      case 'trilhas': return { C: Pages.paths.Component, props: {} }
      case 'linha-do-tempo': return { C: Pages.timeline.Component, props: {} }
      case 'acervo': return { C: Pages.library.Component, props: {} }
      case 'ref': return { C: Pages.reference.Component, props: { id: id ?? '' } }
      case 'sobre': return { C: Pages.about.Component, props: {} }
      case 'revisao': return { C: Pages.review.Component, props: {} }
      case 'mapa': return { C: Pages.map.Component, props: {} }
      case 'glossario': return { C: Pages.glossary.Component, props: {} }
      case 'equivocos': return id ? { C: Pages.myth.Component, props: { id } } : { C: Pages.myths.Component, props: {} }
      default: return { C: Pages.notFound.Component, props: {} }
    }
  })()
  return <P.C {...P.props} />
}

const TITLES: Record<string, string> = {
  '': 'Visão geral', raizes: 'Raízes', ensaios: 'Ensaios', fundamentos: 'Fundamentos', laboratorio: 'Laboratório', debates: 'Debates',
  trilhas: 'Trilhas', 'linha-do-tempo': 'Linha do tempo', acervo: 'Referências', equivocos: 'Equívocos de hoje', revisao: 'Revisão', mapa: 'Mapa de conceitos', glossario: 'Glossário', ref: 'Referência', sobre: 'Sobre',
}

export function App() {
  const route = useRoute()
  const { theme, setTheme } = useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const openPalette = useCallback(() => setPaletteOpen(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.closest('input, textarea, [contenteditable="true"]')
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen((o) => !o) }
      else if (e.key === '/' && !typing) { e.preventDefault(); setPaletteOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const idle = (cb: () => void) => (typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(cb) : setTimeout(cb, 800))
    idle(() => Object.values(Pages).forEach((p) => p.preload()))
  }, [])

  useEffect(() => {
    document.title = `${TITLES[route[0] ?? ''] ?? 'Página não encontrada'} · Matriz`
  }, [route])

  const pageKey = route.join('/')

  return (
    <>
      <AppShell
        pageKey={pageKey}
        brand={<Brand />}
        search={<SearchTrigger onOpen={openPalette} />}
        nav={<Nav section={route[0] ?? ''} />}
        footer={
          <>
            <ThemeSwitch theme={theme} onChange={setTheme} />
            <p className={styles.note}>
              Projeto aberto. Código MIT, textos e dados CC BY 4.0. <a href="#/sobre">Método e como contribuir</a>.
            </p>
          </>
        }
      >
        <ErrorBoundary key={pageKey}>
          <Suspense fallback={<DelayedFallback />}>
            <Page route={route} />
          </Suspense>
        </ErrorBoundary>
      </AppShell>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}
