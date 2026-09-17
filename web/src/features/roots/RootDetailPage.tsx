import { Badge } from '@/components/atoms/Badge'
import { EmptyState } from '@/components/molecules/EmptyState'
import { href } from '@/lib/router'
import { getConcepts, getRefs } from '@/features/xref'
import { RefRow } from '@/features/references/components/RefRow'
import { RefCite } from '@/features/references/components/RefCite'
import { ROOT_EVENTS } from './data'
import { CERTAINTY_LABEL, REGION_LABEL } from './model'
import { getStudy } from './studies'
import styles from './RootDetailPage.module.css'

export type RootDetailPageProps = { id: string }

const TONE = { estabelecido: 'teal', interpretacao: 'gold', especulativo: 'neutral' } as const

export function RootDetailPage({ id }: RootDetailPageProps) {
  const index = ROOT_EVENTS.findIndex((e) => e.id === id)
  const e = ROOT_EVENTS[index]
  if (!e) {
    return (
      <div className={styles.page}>
        <EmptyState title="Marco não encontrado" description="Esse link não corresponde a nenhum marco." action={<a href={href('raizes')}>Voltar às raízes</a>} />
      </div>
    )
  }
  const study = getStudy(id)
  const prev = ROOT_EVENTS[index - 1]
  const next = ROOT_EVENTS[index + 1]
  const sameRegion = ROOT_EVENTS.filter((x) => x.region === e.region && x.id !== e.id)
  const further = getRefs([...new Set([...e.refIds, ...(study?.furtherRefIds ?? [])])])

  return (
    <article className={styles.page}>
      <nav aria-label="Trilha" className={styles.crumbs}>
        <a href={href('raizes')}>Raízes</a><span aria-hidden="true">/</span>
        <a href={`?regiao=${e.region}${href('raizes')}`}>{REGION_LABEL[e.region]}</a><span aria-hidden="true">/</span>
        <span>{e.yearLabel}</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.badges}>
          <Badge tone="brand">{REGION_LABEL[e.region]}</Badge>
          <Badge tone={TONE[e.certainty]}>{CERTAINTY_LABEL[e.certainty]}</Badge>
        </div>
        <p className={styles.when}>{e.yearLabel} · {e.place}</p>
        <h1 className={styles.title}>{e.title}</h1>
        <p className={styles.lead}>{e.summary}</p>
        {study?.keyNumbers && study.keyNumbers.length > 0 && (
          <dl className={styles.numbers}>
            {study.keyNumbers.map((k) => <div key={k.label}><dt>{k.label}</dt><dd>{k.value}</dd></div>)}
          </dl>
        )}
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.compare} aria-label="Relação com a avaliação moderna">
            <div className={styles.yes}>
              <p className={styles.label}>O que antecipa</p>
              <p>{e.connection}</p>
            </div>
            {study?.notAnticipate && (
              <div className={styles.no}>
                <p className={styles.label}>O que não antecipa</p>
                <p>{study.notAnticipate}</p>
              </div>
            )}
          </section>

          {!study && (
            <p className={styles.pending}>O estudo aprofundado deste marco ainda está em preparação. Por enquanto, veja as fontes ao lado.</p>
          )}

          {study && study.context.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.h2}>Contexto</h2>
              {study.context.map((p, i) => <p key={i} className={styles.prose}>{p}</p>)}
            </section>
          )}

          {study && study.practice.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.h2}>Como funcionava na prática</h2>
              <ol className={styles.steps}>
                {study.practice.map((s, i) => (
                  <li key={i}><span className={styles.stepNum}>{i + 1}</span><p>{s}</p></li>
                ))}
              </ol>
            </section>
          )}

          {study?.sourceExcerpt && (
            <figure className={styles.excerpt}>
              <blockquote>{study.sourceExcerpt.text}</blockquote>
              <figcaption>
                {study.sourceExcerpt.credit}
                {study.sourceExcerpt.refId && <> · <RefCite ids={[study.sourceExcerpt.refId]} /></>}
              </figcaption>
            </figure>
          )}

          {study?.historiography && study.historiography.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.h2}>O que dizem os historiadores</h2>
              {study.historiography.map((p, i) => <p key={i} className={styles.prose}>{p}</p>)}
            </section>
          )}

          {e.caution && (
            <aside className={styles.caution}>
              <p className={styles.label}>Cautela</p>
              <p>{e.caution}</p>
            </aside>
          )}

          <nav className={styles.pager} aria-label="Marcos vizinhos">
            {prev ? (
              <a href={href('raizes', prev.id)} className={styles.pagerLink}>
                <span>← anterior · {prev.yearLabel}</span><strong>{prev.title}</strong>
              </a>
            ) : <span />}
            {next && (
              <a href={href('raizes', next.id)} className={`${styles.pagerLink} ${styles.pagerNext}`}>
                <span>próximo · {next.yearLabel} →</span><strong>{next.title}</strong>
              </a>
            )}
          </nav>
        </div>

        <aside className={styles.aside}>
          {e.conceptIds.length > 0 && (
            <section className={styles.box}>
              <h2 className={styles.boxTitle}>Ideias modernas</h2>
              <ul className={styles.links}>
                {getConcepts(e.conceptIds).map((c) => (
                  <li key={c.id}><a href={href('fundamentos', c.id)}><span>{c.name}</span>{c.formula && <code>{c.formula.split('\n')[0]}</code>}</a></li>
                ))}
              </ul>
            </section>
          )}
          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Fontes e leitura <span>{further.length}</span></h2>
            <div>{further.map((r) => <RefRow key={r.id} reference={r} />)}</div>
          </section>
          {sameRegion.length > 0 && (
            <section className={styles.box}>
              <h2 className={styles.boxTitle}>Mais de {REGION_LABEL[e.region]}</h2>
              <ul className={styles.links}>
                {sameRegion.slice(0, 8).map((x) => (
                  <li key={x.id}><a href={href('raizes', x.id)}><span>{x.title}</span><code>{x.yearLabel}</code></a></li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  )
}
