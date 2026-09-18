import { useEffect } from 'react'

/**
 * Metadados por rota. Como o roteamento é por hash, o HTML servido é sempre o mesmo:
 * atualizamos título, descrição, canônica e Open Graph no cliente para que o compartilhamento
 * e os leitores de tela descrevam a página certa.
 */
export const SITE_URL = 'https://yurifreitas.github.io/inferencia-e-evidencia/'
export const SITE_NAME = 'Matriz'

type Meta = { title: string; description: string }

const HOME: Meta = {
  title: 'História e fundamentos da avaliação de classificadores',
  description:
    'Acervo aberto sobre a matriz de confusão, precision, recall, ROC e gold standard: raízes históricas, conceitos com derivação, laboratório interativo e referências verificadas.',
}

const ROUTES: Record<string, Meta> = {
  raizes: {
    title: 'Raízes',
    description:
      'Marcos que antecedem a matriz de confusão: diagnóstico, gabarito, juízes e evidência na África, no Oriente e no Ocidente, cada um com grau de certeza histórica.',
  },
  fundamentos: {
    title: 'Fundamentos',
    description:
      'Cada métrica de avaliação com fórmula, intuição, origem histórica, armadilhas e exercícios — acurácia, precision, recall, F1, MCC, kappa, AUC e calibração.',
  },
  laboratorio: {
    title: 'Laboratório',
    description:
      'Simulador interativo: arraste o limiar sobre duas distribuições e veja matriz de confusão, curva ROC, curva precision–recall e 16 métricas mudarem juntas.',
  },
  debates: {
    title: 'Debates',
    description:
      'Controvérsias abertas na avaliação de modelos: ROC contra precision–recall, coerência da AUC, F1 contra MCC, paradoxos do kappa e a autoridade do gabarito.',
  },
  equivocos: {
    title: 'Equívocos de hoje',
    description:
      'Erros comuns ao ler resultados de modelos: “99% de acurácia”, p-valor mal interpretado, detectores de IA, vazamento de dados e benchmarks contaminados.',
  },
  ensaios: {
    title: 'Ensaios',
    description: 'Textos longos que costuram história, estatística e prática da avaliação de classificadores.',
  },
  trilhas: {
    title: 'Trilhas de leitura',
    description: 'Sequências comentadas de leitura, do primeiro contato à literatura de pesquisa, com fontes gratuitas sempre que existem.',
  },
  'linha-do-tempo': {
    title: 'Linha do tempo',
    description: 'A avaliação de classificadores em ordem cronológica, da antiguidade aos benchmarks de modelos de linguagem.',
  },
  acervo: {
    title: 'Referências',
    description: 'Busca e filtros sobre livros, artigos, relatórios e cursos, com links conferidos e indicação de acesso gratuito.',
  },
  ref: { title: 'Referência', description: 'Ficha de uma referência do acervo, com contexto, links verificados e conceitos relacionados.' },
  revisao: {
    title: 'Revisão',
    description: 'Revisão espaçada por cartões (sistema de Leitner) sobre os conceitos estudados. O progresso fica apenas no seu navegador.',
  },
  mapa: { title: 'Mapa de conceitos', description: 'Como as métricas se conectam: dependências, famílias e caminhos entre os conceitos.' },
  glossario: { title: 'Glossário', description: 'Os termos da avaliação de modelos e seus sinônimos entre tradições: hit, false alarm, erro tipo I, fallout.' },
  sobre: {
    title: 'Método, fontes e como contribuir',
    description: 'Como as referências são verificadas, os graus de certeza histórica, licenças, como citar e como enviar correções.',
  },
}

export function metaFor(section: string): Meta {
  if (!section) return HOME
  return ROUTES[section] ?? { title: 'Página não encontrada', description: HOME.description }
}

function setTag(selector: string, create: () => HTMLElement, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) { el = create(); document.head.appendChild(el) }
  if (el instanceof HTMLMetaElement) el.content = value
  else if (el instanceof HTMLLinkElement) el.href = value
}

const meta = (name: string) => () => Object.assign(document.createElement('meta'), { name })
const prop = (property: string) => () => { const m = document.createElement('meta'); m.setAttribute('property', property); return m }
const link = (rel: string) => () => Object.assign(document.createElement('link'), { rel })

/** Sincroniza título, descrição, canônica e Open Graph com a rota atual. */
export function useDocumentMeta(route: string[]) {
  const section = route[0] ?? ''
  const path = route.map(encodeURIComponent).join('/')
  useEffect(() => {
    const { title, description } = metaFor(section)
    const full = section ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · ${title}`
    const url = `${SITE_URL}${path ? `#/${path}` : ''}`

    document.title = full
    setTag('meta[name="description"]', meta('description'), description)
    setTag('link[rel="canonical"]', link('canonical'), url)
    setTag('meta[property="og:title"]', prop('og:title'), full)
    setTag('meta[property="og:description"]', prop('og:description'), description)
    setTag('meta[property="og:url"]', prop('og:url'), url)
    setTag('meta[name="twitter:title"]', meta('twitter:title'), full)
    setTag('meta[name="twitter:description"]', meta('twitter:description'), description)
  }, [section, path])
}
