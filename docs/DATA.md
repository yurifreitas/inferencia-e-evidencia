# Esquema dos dados

Todos os arquivos ficam em `web/src/features/`. Não há banco de dados: o build embute os JSON.

## `references/references.json` — referências

```jsonc
{
  "id": "fawcett-2006",                 // kebab-case sobrenome-ano, único
  "authors": "T. Fawcett",
  "year": 2006,
  "title": "An Introduction to ROC Analysis",
  "venue": "Pattern Recognition Letters, 27(8), 861–874",
  "kind": "artigo",                     // livro | artigo | relatorio | curso
  "layer": "moderno",                   // fundador | moderno
  "themes": ["metricas", "sdt"],        // o primeiro é o tema principal
  "essential": true,                    // opcional
  "why": "Por que importa (1–2 frases).",
  "doi": "10.1016/j.patrec.2005.10.010",// opcional
  "doiEdition": "…",                    // opcional: DOI é de outra edição/reimpressão
  "doiIgnore": ["10.xxxx/…"],           // opcional: sugestões do verificador já rejeitadas
  "access": "parcial",                  // livre | parcial | pago
  "links": [{ "label": "PDF do autor", "url": "https://…", "type": "texto" }], // texto | preview | material
  "notes": "Observação da verificação." // opcional
}
```

Temas: `historia`, `ir`, `sdt`, `decisao`, `diagnostico`, `gold`, `ml`, `metricas`, `validacao`, `calibracao`.

## `roots/events.json` — marcos históricos

```jsonc
{
  "id": "papiro-edwin-smith",
  "year": -1600,                        // número para ordenar (negativo = a.C.)
  "yearLabel": "c. 1600 a.C.",
  "region": "africa",                   // africa | oriente-proximo | sul-asia | leste-asia | grecia-roma | islamico | europa | americas
  "place": "Egito (Tebas)",
  "title": "…",
  "summary": "2–4 frases factuais.",
  "connection": "O que antecipa da avaliação moderna, sem anacronismo.",
  "conceptIds": ["matriz-confusao"],    // ids de concepts/data.ts
  "certainty": "estabelecido",          // estabelecido | interpretacao | especulativo
  "caution": "…",                       // opcional
  "refIds": ["breasted-1930"]
}
```

## `roots/studies.json` — estudos aprofundados (chave = id do marco)

```jsonc
{
  "papiro-edwin-smith": {
    "context": ["parágrafo", "…"],
    "practice": ["passo 1", "passo 2"],
    "sourceExcerpt": { "text": "…", "credit": "trad. livre a partir de …", "refId": "breasted-1930" },
    "notAnticipate": "…",
    "historiography": ["parágrafo"],
    "keyNumbers": [{ "label": "casos", "value": "48" }],
    "furtherRefIds": ["nunn-1996"]
  }
}
```

## `concepts/data.ts` e `concepts/deep.json`

`data.ts`: `id`, `name`, `aka`, `group`, `formula`, `definition`, `intuition`, `origin`, `pitfalls`, `related`, `refIds`, `lab`.

`deep.json` (chave = id do conceito):

```jsonc
{
  "mcc": {
    "derivation": [{ "text": "…", "math": "MCC = …" }],
    "example": { "setup": "…", "steps": [{ "text": "…", "math": "…" }], "result": "…" },
    "properties": ["…"],
    "originalText": { "quote": "…", "translation": "…", "refId": "matthews-1975", "note": "…" },
    "exercises": [{ "question": "…", "answer": "…", "solution": "…" }]
  }
}
```

## `debates/data.ts`

`id`, `title`, `question`, `positions: [{ claim, refIds }]`, `synthesis`, `conceptIds`.

## `essays/essays.json`

```jsonc
[{
  "id": "do-oraculo-ao-benchmark",
  "title": "…", "subtitle": "…", "readingMinutes": 13,
  "sections": [{ "heading": "…", "paragraphs": ["Texto com [[raiz:papiro-edwin-smith]] e [[ref:breasted-1930]]."] }],
  "refIds": ["breasted-1930"]
}]
```

Marcações: `[[ref:id]]`, `[[conceito:id]]`, `[[raiz:id]]`, `[[debate:id]]`, cada uma aceita `|rótulo`.

## `references/verification.json`

Gerado por `npm run verify:refs`. Não edite à mão.
