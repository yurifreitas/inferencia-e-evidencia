import type { ReadingPath, Reference } from './model'
import raw from './references.json'
import pathsExtra from './paths-extra.json'

/** Gerado a partir da verificação web (links conferidos, DOIs via Crossref). */
export const REFERENCES = raw as Reference[]

const BASE_PATHS: ReadingPath[] = [
  {
    id: 'essencial',
    title: 'Só três',
    summary: 'O mínimo para entender origem, teoria e prática moderna.',
    steps: [
      { refId: 'van-rijsbergen-1979', note: 'cap. 7 — origem de precision, recall e F' },
      { refId: 'bishop-2006', note: '§1.5 e cap. 4 — por que o classificador erra' },
      { refId: 'esl-2009', note: 'cap. 7 — avaliação e generalização' },
    ],
  },
  {
    id: 'historica',
    title: 'Genealogia',
    summary: 'Do gabarito de relevância à avaliação moderna, em ordem conceitual.',
    steps: [
      { refId: 'cleverdon-1966', note: 'gold set + consultas + métrica' },
      { refId: 'van-rijsbergen-1979', note: 'precision, recall, F' },
      { refId: 'green-swets-1966', note: 'hit, miss, false alarm, ROC' },
      { refId: 'hanley-mcneil-1982', note: 'AUC como probabilidade' },
      { refId: 'bishop-2006', note: 'decisão sob incerteza' },
      { refId: 'esl-2009', note: 'erro de teste e seleção de modelo' },
    ],
  },
  {
    id: 'metricas',
    title: 'Dominar as métricas',
    summary: 'Artigos curtos que resolvem as dúvidas práticas sobre qual métrica usar.',
    steps: [
      { refId: 'fawcett-2006', note: 'ROC do zero' },
      { refId: 'davis-goadrich-2006', note: 'ROC × PR' },
      { refId: 'saito-2015', note: 'desbalanceamento' },
      { refId: 'chicco-jurman-2020', note: 'MCC × F1 × acurácia' },
      { refId: 'japkowicz-shah-2011', note: 'o livro que junta tudo' },
    ],
  },
  {
    id: 'matematica',
    title: 'A base matemática',
    summary: 'Por que TP/FP/FN/TN existem e por que métricas diferentes otimizam decisões diferentes.',
    steps: [
      { refId: 'neyman-pearson-1933', note: 'razão de verossimilhança, erros I e II' },
      { refId: 'wald-1950', note: 'função de perda e risco' },
      { refId: 'duda-hart-stork-2001', note: 'cap. 2 — decisão bayesiana' },
      { refId: 'elkan-2001', note: 'limiar a partir de custos' },
      { refId: 'hand-2009', note: 'o que a AUC realmente assume' },
    ],
  },
  {
    id: 'gold',
    title: 'Confiar no gabarito',
    summary: 'A métrica só vale o que vale a referência.',
    steps: [
      { refId: 'cohen-1960', note: 'concordância corrigida pelo acaso' },
      { refId: 'dawid-skene-1979', note: 'rótulo verdadeiro latente' },
      { refId: 'rutjes-2007', note: 'sem gold standard perfeito' },
      { refId: 'northcutt-2021', note: 'erros em test sets famosos' },
    ],
  },
  {
    id: 'historia-2x2',
    title: 'Antes do ML',
    summary: 'A tabela 2×2 nasceu na meteorologia e na ecologia; o paradoxo da acurácia é de 1884.',
    steps: [
      { refId: 'murphy-1996', note: 'o caso Finley: por que acurácia engana' },
      { refId: 'peirce-1884', note: 'a primeira métrica de habilidade' },
      { refId: 'heidke-1926', note: 'acerto corrigido pelo acaso' },
      { refId: 'jaccard-1912', note: 'IoU na ecologia' },
      { refId: 'dice-1945', note: 'o que hoje chamamos F1' },
      { refId: 'cohen-1960', note: 'kappa, herdeiro de Heidke' },
      { refId: 'murphy-winkler-1987', note: 'a distribuição conjunta como visão completa' },
      { refId: 'van-rijsbergen-1979', note: 'F entra na recuperação da informação' },
    ],
  },
  {
    id: 'decidir',
    title: 'Avaliar para decidir',
    summary: 'Do teste diagnóstico ao benefício líquido: a métrica certa depende da decisão.',
    steps: [
      { refId: 'altman-bland-1994a', note: 'sensibilidade e especificidade em uma página' },
      { refId: 'whiting-2011', note: 'viés do padrão de referência' },
      { refId: 'van-calster-2019', note: 'calibração, não só discriminação' },
      { refId: 'vickers-elkin-2006', note: 'benefício líquido e limiar' },
      { refId: 'hernandez-orallo-2012', note: 'métricas como perda esperada' },
      { refId: 'maier-hein-2024', note: 'escolher a métrica pelo problema' },
    ],
  },
]

/** Trilhas adicionadas depois ficam em paths-extra.json. */
export const PATHS: ReadingPath[] = [...BASE_PATHS, ...(pathsExtra as ReadingPath[])]

export const CHAIN = [
  'gold / reference set',
  'relevância',
  'precision / recall',
  'falso positivo / falso negativo',
  'decisão sob incerteza',
  'ROC',
  'classificação estatística',
  'avaliação moderna',
]
