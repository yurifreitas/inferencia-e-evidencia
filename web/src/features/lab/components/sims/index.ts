import type { ComponentType } from 'react'
import { SamplingSim } from './SamplingSim'
import { CoverageSim } from './CoverageSim'
import { PValueSim } from './PValueSim'
import { PowerSim } from './PowerSim'
import { BenchmarkSim } from './BenchmarkSim'
import { PassKSim } from './PassKSim'

export type WidgetId = 'amostragem' | 'cobertura' | 'p-valor' | 'poder' | 'benchmark' | 'pass-k'

export const WIDGETS: Record<WidgetId, { label: string; Component: ComponentType }> = {
  amostragem: { label: 'Distribuição amostral', Component: SamplingSim },
  cobertura: { label: 'Cobertura de intervalos', Component: CoverageSim },
  'p-valor': { label: 'Dança do p-valor', Component: PValueSim },
  poder: { label: 'Poder estatístico', Component: PowerSim },
  benchmark: { label: 'Barras de erro em benchmark', Component: BenchmarkSim },
  'pass-k': { label: 'pass@k', Component: PassKSim },
}

export { SamplingSim, CoverageSim, PValueSim, PowerSim, BenchmarkSim, PassKSim }
