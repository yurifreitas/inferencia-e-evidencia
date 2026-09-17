export type Debate = {
  id: string
  title: string
  question: string
  positions: { claim: string; refIds: string[] }[]
  synthesis: string
  conceptIds: string[]
}

export const DEBATES: Debate[] = [
  {
    id: 'acuracia-serve',
    title: 'O paradoxo da acurácia',
    question: 'Um classificador com 96,6% de acerto é bom?',
    positions: [
      { claim: 'Finley (1884) reportou 96,6% de acerto em previsões de tornado. Gilbert mostrou que prever "nunca haverá tornado" dava 98,2%.', refIds: ['murphy-1996'] },
      { claim: 'Peirce propôs no mesmo ano medir habilidade como taxa de acerto nos positivos menos taxa de alarme falso — o que hoje é o índice de Youden.', refIds: ['peirce-1884', 'youden-1950'] },
      { claim: 'No ML, a acurácia é inadequada para comparar indutores porque ignora custos e distribuição de classes.', refIds: ['provost-1998', 'he-garcia-2009'] },
    ],
    synthesis: 'Acurácia só é informativa com classes balanceadas e custos simétricos. Compare sempre com o classificador trivial (maioria) e reporte a matriz completa.',
    conceptIds: ['acuracia', 'youden', 'acuracia-balanceada'],
  },
  {
    id: 'roc-vs-pr',
    title: 'ROC ou precisão-recall em dados desbalanceados?',
    question: 'Qual curva usar quando os positivos são raros?',
    positions: [
      { claim: 'A curva ROC é invariante à prevalência e pode parecer excelente enquanto a maioria dos alarmes é falsa; a PR expõe isso.', refIds: ['saito-2015'] },
      { claim: 'Num mesmo conjunto de dados (positivos e negativos fixos), uma curva domina em ROC se e somente se domina em PR — as duas contêm a mesma informação sobre ordenação, só a exibem diferente.', refIds: ['davis-goadrich-2006'] },
      { claim: 'A área PR tem defeitos (sem baseline linear, interpolação enganosa); a curva PR-Gain corrige.', refIds: ['flach-kull-2015', 'boyd-2013'] },
    ],
    synthesis: 'ROC descreve o detector independentemente da população; PR descreve o que o usuário vai ver naquela população. Use ROC para comparar discriminação e PR (com a prevalência anotada) quando o custo dos falsos positivos em volume importa.',
    conceptIds: ['roc', 'curva-pr', 'prevalencia-bayes'],
  },
  {
    id: 'auc-coerente',
    title: 'A AUC é uma medida coerente?',
    question: 'Maior AUC significa melhor classificador?',
    positions: [
      { claim: 'AUC é a probabilidade de ordenar corretamente um par positivo-negativo — interpretação clara e independente de limiar.', refIds: ['hanley-mcneil-1982', 'bradley-1997'] },
      { claim: 'Interpretada como perda esperada, a AUC usa uma distribuição de custos que depende do próprio classificador; comparar AUCs é usar réguas diferentes. Proposta: medida H.', refIds: ['hand-2009'] },
      { claim: 'Métricas de limiar, ranking e probabilidade podem ser unificadas como perda esperada sob diferentes suposições de como o limiar será escolhido.', refIds: ['hernandez-orallo-2012', 'ferri-2009'] },
    ],
    synthesis: 'A AUC é ótima como medida de qualidade de ranking. Se o sistema vai operar num limiar específico com custos conhecidos, avalie ali (custo esperado, benefício líquido), não na área inteira.',
    conceptIds: ['auc', 'limiar-custo', 'net-benefit'],
  },
  {
    id: 'f1-ignora-tn',
    title: 'F1 ignora os verdadeiros negativos',
    question: 'F1, MCC ou acurácia balanceada?',
    positions: [
      { claim: 'Em recuperação da informação TN é enorme e indefinido; faz sentido medir só o que foi recuperado e o que era relevante.', refIds: ['van-rijsbergen-1979', 'hripcsak-rothschild-2005'] },
      { claim: 'Fora da IR, ignorar TN é um defeito: F1 é assimétrico e enviesado. Informedness e markedness usam as quatro células.', refIds: ['powers-2011'] },
      { claim: 'MCC só é alto quando todas as células são boas; deveria substituir F1 e acurácia na classificação binária.', refIds: ['chicco-jurman-2020', 'chicco-2021'] },
      { claim: 'F não é uma média de precisão e recall com pesos fixos — os pesos variam com o classificador.', refIds: ['hand-christen-2018'] },
    ],
    synthesis: 'Se só a classe positiva importa e os negativos são mal definidos (busca, extração, detecção de objetos), F1/IoU. Se as duas classes importam, MCC ou acurácia balanceada.',
    conceptIds: ['f-measure', 'mcc', 'acuracia-balanceada', 'jaccard'],
  },
  {
    id: 'kappa-paradoxos',
    title: 'Os paradoxos do kappa',
    question: 'Kappa baixo significa anotadores ruins?',
    positions: [
      { claim: 'Com margens desbalanceadas, κ pode ser baixo mesmo com concordância observada altíssima.', refIds: ['feinstein-cicchetti-1990'] },
      { claim: 'O AC1 de Gwet modela a concordância por acaso de forma menos sensível à prevalência.', refIds: ['gwet-2014'] },
      { claim: 'Como métrica de classificador, κ pode ranquear modelos de forma enganosa em comparação com o MCC.', refIds: ['delgado-tibau-2019'] },
      { claim: 'A escala qualitativa (moderado, substancial…) é convenção, não resultado.', refIds: ['landis-koch-1977'] },
    ],
    synthesis: 'Reporte concordância observada, prevalência e κ juntos. Para anotação com muitas categorias ou dados faltantes, alfa de Krippendorff.',
    conceptIds: ['kappa', 'gold-standard'],
  },
  {
    id: 'gold-verdade',
    title: 'O gold standard é a verdade?',
    question: 'O que medimos quando comparamos com o gabarito?',
    positions: [
      { claim: 'O paradigma Cranfield assume julgamentos de relevância fixos e suficientes para ordenar sistemas.', refIds: ['cleverdon-1966', 'voorhees-harman-2005'] },
      { claim: 'Desacordo entre anotadores é informação sobre ambiguidade, não ruído a ser eliminado.', refIds: ['aroyo-welty-2015'] },
      { claim: 'Test sets famosos têm erros de rótulo suficientes para inverter o ranking de modelos.', refIds: ['northcutt-2021'] },
      { claim: 'Quando não há referência perfeita, estime-a: classe latente, painel, referência composta.', refIds: ['rutjes-2007', 'dawid-skene-1979', 'whiting-2011'] },
    ],
    synthesis: 'Toda métrica mede concordância com o gabarito. Documente como ele foi construído, quanto os anotadores concordaram e qual erro residual se espera.',
    conceptIds: ['gold-standard', 'rotulos-ruidosos', 'kappa'],
  },
  {
    id: 'comparar-modelos',
    title: 'Como afirmar que um modelo é melhor',
    question: 'Qual teste estatístico usar?',
    positions: [
      { claim: 'O t-test pareado sobre folds de CV tem erro tipo I alto; use McNemar ou 5×2cv.', refIds: ['dietterich-1998'] },
      { claim: 'Corrija a variância pela sobreposição dos conjuntos de treino (t corrigido).', refIds: ['nadeau-bengio-2003'] },
      { claim: 'Em vários datasets, use testes não paramétricos (Wilcoxon, Friedman + Nemenyi).', refIds: ['demsar-2006'] },
      { claim: 'Abandone p-valores: análise bayesiana com região de equivalência prática (ROPE).', refIds: ['benavoli-2017'] },
    ],
    synthesis: 'Defina antes qual diferença importa na prática, use um teste que respeite a dependência entre folds e reporte intervalos, não só "significativo".',
    conceptIds: ['comparacao-estatistica', 'validacao-cruzada'],
  },
  {
    id: 'discriminacao-calibracao',
    title: 'Discriminação, calibração ou utilidade?',
    question: 'AUC alta basta para usar um modelo?',
    positions: [
      { claim: 'Calibração é o "calcanhar de Aquiles" da análise preditiva: modelos bem discriminantes podem dar probabilidades erradas.', refIds: ['van-calster-2019', 'guo-2017'] },
      { claim: 'Avalie utilidade para decisão com benefício líquido na faixa de limiares plausível.', refIds: ['vickers-elkin-2006', 'steyerberg-2019'] },
      { claim: 'Regras de pontuação próprias avaliam discriminação e calibração juntas.', refIds: ['gneiting-raftery-2007', 'brier-1950'] },
    ],
    synthesis: 'Reporte os três: discriminação (AUC), calibração (curva, intercepto e inclinação) e utilidade (benefício líquido ou custo esperado).',
    conceptIds: ['calibracao', 'net-benefit', 'auc', 'scoring-rules'],
  },
  {
    id: 'benchmarks-progresso',
    title: 'Benchmarks medem progresso?',
    question: 'Subir no leaderboard significa generalizar melhor?',
    positions: [
      { claim: 'Recriando o test set do ImageNet, a acurácia cai 11–14 pontos, embora o ranking relativo se mantenha.', refIds: ['recht-2019'] },
      { claim: 'Muitas conclusões de benchmark falham em validade interna e externa.', refIds: ['liao-2021'] },
      { claim: 'A escolha de quais benchmarks usar muda qual modelo "vence".', refIds: ['dehghani-2021'] },
      { claim: 'Benchmarks estáticos saturam; benchmarks dinâmicos com humanos no loop tentam resistir.', refIds: ['kiela-2021'] },
    ],
    synthesis: 'Trate o benchmark como uma amostra com erro de rótulo e reuso. Diferenças pequenas exigem intervalos, múltiplos conjuntos e, idealmente, dados novos.',
    conceptIds: ['benchmarks', 'gold-standard', 'validacao-cruzada'],
  },
]
