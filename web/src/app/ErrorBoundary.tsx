import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" style={{ padding: 'var(--space-12)', maxWidth: '60ch', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)' }}>Algo deu errado ao carregar o acervo</h1>
        <p style={{ color: 'var(--text-muted)', margin: 'var(--space-4) 0' }}>{this.state.error.message}</p>
        <button type="button" onClick={() => window.location.reload()}>Recarregar</button>
      </div>
    )
  }
}
