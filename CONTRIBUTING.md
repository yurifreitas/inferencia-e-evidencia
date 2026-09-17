# Como contribuir

Obrigado por ajudar a tornar o Matriz mais correto e mais completo.

## Princípios

1. **Toda afirmação tem fonte.** Marcos, estudos, conceitos e ensaios apontam para ids de `references.json`.
2. **Sem anacronismo.** Ninguém antigo "inventou" precision ou recall. Mostre o ancestral real da ideia e escreva o que ele *não* antecipa.
3. **Certeza explícita.** Use `certainty: "estabelecido" | "interpretacao" | "especulativo"` e explique disputas em `caution`.
4. **Só fontes legais.** Editoras, autores, repositórios institucionais, PubMed Central, arXiv, Internet Archive (domínio público ou empréstimo controlado). Nunca Sci-Hub, LibGen, Anna's Archive ou uploads não autorizados.
5. **Citações curtas.** Até ~40 palavras de obras com copyright; textos em domínio público podem ter trechos maiores. Sempre com crédito.

## Tipos de contribuição

### Corrigir um dado
Edite o arquivo correspondente (veja [docs/DATA.md](docs/DATA.md)) e descreva no pull request a fonte que confirma a correção.

### Adicionar uma referência
1. Acrescente um objeto em `web/src/features/references/references.json` (id `sobrenome-ano`, sufixo se colidir).
2. Rode `npm run verify:refs -- --only=seu-id`.
3. Se o verificador sugerir um DOI errado (resenha, capítulo, outra edição), registre-o em `doiIgnore`. Se o DOI for de outra edição, explique em `doiEdition`.
4. Rode `npm run export:md` para atualizar `REFERENCIAS.md`.

### Adicionar um marco histórico
1. Acrescente o evento em `web/src/features/roots/events.json`.
2. Se possível, acrescente o estudo em `web/src/features/roots/studies.json` (contexto, prática passo a passo, trecho da fonte, o que não antecipa, historiografia).
3. Use apenas `conceptIds` existentes em `concepts/data.ts`.

### Aprofundar um conceito
Edite `web/src/features/concepts/deep.json`. **Todo número de exemplo ou exercício deve ser calculado por script**, não à mão.

### Escrever ou revisar um ensaio
`web/src/features/essays/essays.json`. Links usam marcações:
`[[ref:id]]`, `[[ref:id|rótulo]]`, `[[conceito:id]]`, `[[raiz:id]]`, `[[debate:id]]`. Ids inexistentes são descartados na renderização.

## Antes de abrir o pull request

```bash
cd web
npm run typecheck
npm test            # matemática + integridade: todo id citado precisa existir
npm run build
npm run verify:refs -- --only=<ids que você mexeu>
```

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat(raizes): adiciona khipus de Santa`, `fix(refs): corrige DOI de Hand 2009`, `docs: ...`.
