import raw from './verification.json'

export type VerificationItem = {
  verdict: 'ok' | 'revisar'
  doi: 'confirmado' | 'inexistente' | 'sem-doi' | 'nao-checado'
  linksOk: number
  linksTotal: number
  blocked: number
  issues: string[]
}

type VerificationFile = { generatedAt: string | null; items: Record<string, VerificationItem> }

export const VERIFICATION = raw as VerificationFile
export const getVerification = (id: string): VerificationItem | undefined => VERIFICATION.items[id]

export function verificationDate() {
  if (!VERIFICATION.generatedAt) return null
  return new Date(VERIFICATION.generatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
