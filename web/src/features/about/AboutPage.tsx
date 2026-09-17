import { PageHeader } from '@/components/molecules/PageHeader'
import { Callout } from '@/components/molecules/Callout'
import { href } from '@/lib/router'
import { REFERENCES } from '@/features/references/data'
import { VERIFICATION, verificationDate } from '@/features/references/verification'
import { ROOT_EVENTS } from '@/features/roots/data'
import { CONCEPTS } from '@/features/concepts/data'
import { ESSAYS } from '@/features/essays/model'
import { DEBATES } from '@/features/debates/data'
import styles from './AboutPage.module.css'

const REPO_URL = 'https://github.com/yurifreitas/inferencia-e-evidencia'

export function AboutPage() {
  const items = Object.values(VERIFICATION.items)
  const verified = items.filter((i) => i.verdict === 'ok').length
  const date = verificationDate()
  const certainty = ROOT_EVENTS.reduce<Record<string, number>>((m, e) => ((m[e.certainty] = (m[e.certainty] ?? 0) + 1), m), {})
  const year = new Date().getFullYear()

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Sobre"
        title="Método, fontes e como contribuir"
        lead="Matriz é um acervo aberto sobre a história e os fundamentos da avaliação de classificadores: da tabela 2×2 às suas raízes na África, no Oriente e no Ocidente. Tudo aqui é verificável e editável."
      />

      <dl className={styles.stats}>
        <div><dt>referências</dt><dd>{REFERENCES.length}</dd></div>
        <div><dt>marcos históricos</dt><dd>{ROOT_EVENTS.length}</dd></div>
        <div><dt>conceitos</dt><dd>{CONCEPTS.length}</dd></div>
        <div><dt>debates</dt><dd>{DEBATES.length}</dd></div>
        <div><dt>ensaios</dt><dd>{ESSAYS.length}</dd></div>
      </dl>

      <div className={styles.grid}>
        <section className={styles.section}>
          <h2 className={styles.h2}>Como as referências são verificadas</h2>
          <p>Cada referência passa por um verificador automático (<code>npm run verify:refs</code>) que:</p>
          <ol className={styles.list}>
            <li>confere o DOI no Crossref e compara título e ano com o registro do acervo;</li>
            <li>procura um DOI provável para referências que não têm um;</li>
            <li>testa cada link e classifica como funcionando, quebrado ou bloqueado a robôs.</li>
          </ol>
          {date ? (
            <p>Última verificação: <strong>{date}</strong> — {verified} de {items.length} referências sem pendências. As demais mostram o problema encontrado no próprio cartão, e o relatório completo fica em <code>web/verification/REPORT.md</code>.</p>
          ) : (
            <p>O verificador ainda não foi executado nesta cópia.</p>
          )}
          <p>Só entram links legais: páginas de editoras e autores, repositórios institucionais, PubMed Central, arXiv, Internet Archive (domínio público ou empréstimo controlado). Nunca fontes piratas.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Graus de certeza histórica</h2>
          <p>Nenhum marco afirma que povos antigos "inventaram" precision ou recall. Cada um indica um ancestral honesto de uma ideia, com três graus:</p>
          <ul className={styles.levels}>
            <li><span className={`${styles.dot} ${styles.estabelecido}`} /><strong>Fato estabelecido</strong> — documentado em fonte primária e aceito pela historiografia ({certainty.estabelecido ?? 0}).</li>
            <li><span className={`${styles.dot} ${styles.interpretacao}`} /><strong>Interpretação</strong> — leitura defendida por historiadores, com alternativas ({certainty.interpretacao ?? 0}).</li>
            <li><span className={`${styles.dot} ${styles.especulativo}`} /><strong>Especulativo</strong> — hipótese sem consenso ({certainty.especulativo ?? 0}).</li>
          </ul>
          <p>Cada estudo traz também "o que não antecipa", para evitar anacronismo, e uma nota de cautela quando a leitura é disputada.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Como contribuir</h2>
          <p>Os dados ficam em arquivos JSON e TypeScript simples, sem banco de dados:</p>
          <ul className={styles.files}>
            <li><code>references/references.json</code> — referências</li>
            <li><code>roots/events.json</code> e <code>roots/studies.json</code> — marcos e estudos</li>
            <li><code>concepts/data.ts</code> e <code>concepts/deep.json</code> — conceitos e derivações</li>
            <li><code>debates/data.ts</code> e <code>essays/essays.json</code> — debates e ensaios</li>
          </ul>
          <p>Abra um pull request com a mudança e rode <code>npm run verify:refs -- --only=seu-id</code>. O guia completo está em <code>CONTRIBUTING.md</code>.</p>
          <a className={styles.button} href={REPO_URL} target="_blank" rel="noreferrer">Repositório no GitHub ↗</a>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Como citar</h2>
          <pre className={styles.cite}>{`Matriz: história e fundamentos da avaliação de classificadores. ${year}. ${REPO_URL}`}</pre>
          <p>Ao usar um fato específico, cite a fonte original indicada no cartão — o acervo é um mapa, não a fonte.</p>
          <h2 className={styles.h2}>Licenças</h2>
          <p>Código sob <strong>MIT</strong>. Textos, dados e ensaios sob <strong>CC BY 4.0</strong>. Trechos de obras de terceiros são citações curtas com crédito e seguem os direitos de seus titulares.</p>
        </section>
      </div>

      <Callout label="Limites conhecidos" tone="gold">
        Parte dos estudos foi escrita a partir de fontes secundárias; quando um detalhe não pôde ser confirmado no texto original, isso aparece como cautela no próprio marco.
        Correções são muito bem-vindas — especialmente de quem lê as línguas das fontes (acadiano, egípcio, sânscrito, chinês clássico, árabe, quéchua).{' '}
        <a href={href('raizes')}>Ver raízes</a>.
      </Callout>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className={styles.notFound}>
      <p className={styles.code}>404</p>
      <h1 className={styles.nfTitle}>Esta página não está no acervo</h1>
      <p className={styles.nfText}>O link pode ter mudado. Use a busca (<kbd>Ctrl</kbd> <kbd>K</kbd>) ou volte ao início.</p>
      <a className={styles.button} href="#/">Ir para a visão geral</a>
    </div>
  )
}
