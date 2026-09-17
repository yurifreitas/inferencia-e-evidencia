# Inferência e evidência

> Acervo **Matriz** · [site](https://yurifreitas.github.io/inferencia-e-evidencia/) · [repositório](https://github.com/yurifreitas/inferencia-e-evidencia)

**História e fundamentos da avaliação de classificadores** — da tabela 2×2 às suas raízes na África, no Oriente e no Ocidente.

Matriz é um acervo aberto e navegável sobre a matriz de confusão, *gold standard*, precision/recall, F1, ROC/AUC, concordância entre juízes e peso da evidência. Cada afirmação aponta para uma fonte, e cada fonte é verificada automaticamente.

| | |
|---|---|
| **593** referências | DOIs conferidos no Crossref e links testados |
| **107** marcos históricos | do osso de Ishango a TREC, cada um com estudo aprofundado |
| **133** conceitos | em 19 etapas de estudo — da tabela 2×2 à avaliação de imagem e áudio gerados —, com derivação, exemplo resolvido, exercícios e 6 simuladores |
| **34** equívocos de hoje | "99% de acurácia", p-valor, amostras enviesadas, correlação ≠ causa, detectores de IA — com 58 casos reais |
| **9** debates | ROC × PR, AUC é coerente?, F1 × MCC, paradoxos do kappa… |
| **4** ensaios | textos longos que ligam história, conceitos e fontes |
| **1** laboratório | arraste o limiar e veja matriz, ROC, PR e 16 métricas mudarem |

## Seções

- **Raízes** — mapa do tempo por região: diagnósticos do Egito e da Mesopotâmia, triangulação de espiões no Arthaśāstra, correção cega nos exames imperiais chineses, graduação de transmissores do hadith, khipus andinos, Graunt, Condorcet, Peirce & Jastrow, Fisher, Turing & Good. Cada marco indica o grau de certeza (fato estabelecido, interpretação, especulativo), o que antecipa e o que **não** antecipa.
- **Fundamentos** — 93 conceitos em ordem de estudo: fundação, probabilidade, taxas, métricas-resumo, estimação e testes, inferência, curvas, decisão, causalidade, validação, dados e generalização, e três etapas de IA: métricas por tarefa (regressão, ranking/RAG, mAP, segmentação, WER, multirrótulo, agrupamento), IA generativa e LLMs (perplexidade, BLEU/ROUGE, BERTScore, pass@k, LLM como juiz, Elo/Bradley–Terry, FID, fidelidade em RAG, alucinação) informação e incerteza (entropia cruzada, KL, predição conformal, drift, barras de erro em avaliações, robustez) e fine-tuning, alinhamento e treino (transferência, LoRA/QLoRA, instruction tuning, esquecimento catastrófico, destilação, contaminação, RLHF, modelo de recompensa e superotimização, DPO, anotação de preferências, win rate controlado, curvas de aprendizado, busca de hiperparâmetros, leis de escala, harnesses de avaliação, deduplicação e "habilidades emergentes"); e quatro etapas de mídia: difusão e ajuste de modelos de imagem (difusão latente, CFG, LoRA para difusão, DreamBooth e textual inversion, ControlNet/IP-Adapter, memorização), avaliar imagens geradas (KID/CMMD, precisão e recall gerativos, PSNR/SSIM/LPIPS, preferência humana, alinhamento texto–imagem), áudio e fala gerados (MOS/MUSHRA, FAD/CLAP, PESQ/STOI/SI-SDR, similaridade de locutor, MOS previsto, codecs neurais) e autenticidade e riscos da mídia sintética (EER e curvas DET, detectores, marca d’água, proveniência C2PA, vieses de representação).
- **Equívocos de hoje** — o que se entende mal sobre números, testes e IA: o mecanismo do erro, a conta certa em frequências naturais, casos reais documentados e as perguntas a fazer.
- **Laboratório** — simulação binormal com limiar arrastável, calculadora de matriz (caso Finley, 1884), árvore de frequências naturais e seis simuladores: distribuição amostral/TCL, cobertura de intervalos, dança do p-valor, poder, barras de erro em benchmark de IA e pass@k.
- **Debates** e **Ensaios** — onde a literatura discorda e leituras de síntese.
- **Estudo** — marque conceitos como estudados, acompanhe o progresso por etapa, revise os exercícios (repetição espaçada) e navegue pelo mapa de conceitos. Tudo salvo só no seu navegador.
- **Glossário** — termos em português e inglês com remissivas para os conceitos.
- **Trilhas de leitura** — sequências curtas por objetivo, incluindo fine-tuning, alinhamento, avaliação rigorosa de LLMs, imagens geradas, áudio e mídia sintética.
- **Referências** — busca, filtros por tema, tipo e acesso, com links legais gratuitos quando existem.

## Rodando localmente

Requer Node 20+.

```bash
cd web
npm install
npm run dev          # http://localhost:5173
npm test             # testes da matemática e da integridade dos dados
npm run build        # gera web/dist (estático, funciona em qualquer subpasta)
```

## Verificando as referências

```bash
cd web
npm run verify:refs                       # todas as referências
npm run verify:refs -- --only=fawcett-2006  # uma ou mais (ids separados por vírgula)
```

O verificador confere cada DOI no Crossref (título e ano), sugere DOIs para referências sem DOI e testa todos os links. O relatório fica em [`web/verification/REPORT.md`](web/verification/REPORT.md) e o resumo alimenta o selo "Verificado" em cada referência da interface.

Links "bloqueados" são servidores que recusam clientes automáticos (JSTOR, editoras, alguns museus) — abrem normalmente no navegador.

## Estrutura

```
web/
  src/
    app/                 shell, navegação, busca (Ctrl+K), rotas
    components/          atoms, molecules, templates (design system próprio, sem dependências de UI)
    design/              tokens OKLCH, tema claro/escuro, estilos globais e de impressão
    features/
      roots/             events.json (marcos) · studies.json (estudos aprofundados)
      concepts/          data.ts + extra.json (conceitos) · deep.json (derivações, exemplos, exercícios)
      debates/           data.ts
      misconceptions/    misconceptions.json (equívocos de hoje, casos reais)
      essays/            essays.json (texto com links [[ref:id]], [[conceito:id]], [[raiz:id]])
      references/        references.json · verification.json
      lab/               modelo binormal e gráficos em SVG
  scripts/
    verify-references.mjs
    export-markdown.mjs  gera REFERENCIAS.md
docs/DATA.md             esquema de cada arquivo de dados
```

Stack: React 18, TypeScript, Vite, CSS Modules. Sem backend, sem banco de dados, sem bibliotecas de gráficos.

## Contribuindo

Correções históricas, novas referências e traduções são muito bem-vindas — especialmente de quem lê as línguas das fontes. Veja [CONTRIBUTING.md](CONTRIBUTING.md) e o esquema dos dados em [docs/DATA.md](docs/DATA.md).

## Licenças

- **Código**: [MIT](LICENSE)
- **Textos, dados, estudos e ensaios**: [CC BY 4.0](LICENSE-CONTENT.md)

Trechos de obras de terceiros são citações curtas, com crédito, e continuam sob os direitos de seus titulares. Ao usar um fato específico, cite a fonte original indicada no acervo.

## Como citar

Veja [CITATION.cff](CITATION.cff).
