import type { MetricKey } from './model'

export type MetricMeta = { key: MetricKey; label: string; formula: string; range: 'unit' | 'signed' | 'ratio' | 'cost'; conceptId: string; higherIsBetter: boolean }

export const METRIC_GROUPS: { title: string; items: MetricMeta[] }[] = [
  {
    title: 'Taxas',
    items: [
      { key: 'tpr', label: 'Sensibilidade / recall', formula: 'TP/(TP+FN)', range: 'unit', conceptId: 'sensibilidade', higherIsBetter: true },
      { key: 'tnr', label: 'Especificidade', formula: 'TN/(TN+FP)', range: 'unit', conceptId: 'especificidade', higherIsBetter: true },
      { key: 'fpr', label: 'Falso positivo (FPR)', formula: 'FP/(FP+TN)', range: 'unit', conceptId: 'fpr', higherIsBetter: false },
      { key: 'ppv', label: 'Precisão / PPV', formula: 'TP/(TP+FP)', range: 'unit', conceptId: 'precisao', higherIsBetter: true },
      { key: 'npv', label: 'NPV', formula: 'TN/(TN+FN)', range: 'unit', conceptId: 'prevalencia-bayes', higherIsBetter: true },
    ],
  },
  {
    title: 'Resumo',
    items: [
      { key: 'acc', label: 'Acurácia', formula: '(TP+TN)/N', range: 'unit', conceptId: 'acuracia', higherIsBetter: true },
      { key: 'ba', label: 'Acurácia balanceada', formula: '(TPR+TNR)/2', range: 'unit', conceptId: 'acuracia-balanceada', higherIsBetter: true },
      { key: 'f1', label: 'F1', formula: '2TP/(2TP+FP+FN)', range: 'unit', conceptId: 'f-measure', higherIsBetter: true },
      { key: 'iou', label: 'Jaccard / IoU', formula: 'TP/(TP+FP+FN)', range: 'unit', conceptId: 'jaccard', higherIsBetter: true },
      { key: 'youden', label: 'Youden J', formula: 'TPR − FPR', range: 'signed', conceptId: 'youden', higherIsBetter: true },
      { key: 'mcc', label: 'MCC', formula: 'φ da tabela 2×2', range: 'signed', conceptId: 'mcc', higherIsBetter: true },
      { key: 'kappa', label: 'Kappa de Cohen', formula: '(p₀−pₑ)/(1−pₑ)', range: 'signed', conceptId: 'kappa', higherIsBetter: true },
    ],
  },
  {
    title: 'Decisão',
    items: [
      { key: 'lrp', label: 'LR+', formula: 'TPR/FPR', range: 'ratio', conceptId: 'razao-verossimilhanca', higherIsBetter: true },
      { key: 'lrn', label: 'LR−', formula: '(1−TPR)/TNR', range: 'ratio', conceptId: 'razao-verossimilhanca', higherIsBetter: false },
      { key: 'cost', label: 'Custo esperado / caso', formula: '(FP + k·FN)/N', range: 'cost', conceptId: 'limiar-custo', higherIsBetter: false },
      { key: 'nb', label: 'Benefício líquido', formula: 'TP/N − FP/N·pₜ/(1−pₜ)', range: 'signed', conceptId: 'net-benefit', higherIsBetter: true },
    ],
  },
]
