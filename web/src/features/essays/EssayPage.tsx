import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/molecules/EmptyState'
import { href } from '@/lib/router'
import { getRefs } from '@/features/xref'
import { RefRow } from '@/features/references/components/RefRow'
import { getEssay, ESSAYS } from './model'
import { RichText } from './components/RichText'
import styles from './EssayPage.module.css'

export type EssayPageProps = { id: string }

export function EssayPage({ id }: EssayPageProps) {
  const essay = getEssay(id)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!essay) return
    const obs = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis[0]) setCurrent(Number((vis[0].target as HTMLElement).dataset.index))
    }, { rootMargin: '-10% 0px -70% 0px' })
    document.querySelectorAll('[data-essay-section]').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [essay])

  if (!essay) {
    return <EmptyState title="Ensaio não encontrado" description="Esse link não corresponde a nenhum ensaio." action={<a href={href('ensaios')}>Ver ensaios</a>} />
  }
  const idx = ESSAYS.findIndex((e) => e.id === id)
  const next = ESSAYS[idx + 1]

  return (
    <div className={styles.page}>
      <div className={styles.progress} style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <nav aria-label="Trilha" className={styles.crumbs}><a href={href('ensaios')}>Ensaios</a></nav>
      <header className={styles.header}>
        <h1 className={styles.title}>{essay.title}</h1>
        <p className={styles.subtitle}>{essay.subtitle}</p>
        <p className={styles.meta}>{essay.readingMinutes} min de leitura · {essay.refIds.length} fontes</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.body}>
          {essay.sections.map((s, i) => (
            <section key={s.heading} id={`secao-${i}`} data-essay-section data-index={i} className={styles.section}>
              <h2 className={styles.h2}>{s.heading}</h2>
              {s.paragraphs.map((p, j) => <p key={j} className={styles.p}><RichText text={p} /></p>)}
            </section>
          ))}
          <section className={styles.sources}>
            <h2 className={styles.h2}>Fontes citadas</h2>
            <div className={styles.sourceGrid}>{getRefs(essay.refIds).sort((a, b) => a.year - b.year).map((r) => <RefRow key={r.id} reference={r} />)}</div>
          </section>
          {next && (
            <a href={href('ensaios', next.id)} className={styles.next}>
              <span>Próximo ensaio →</span><strong>{next.title}</strong>
            </a>
          )}
        </div>
        <nav className={styles.toc} aria-label="Seções do ensaio">
          <p className={styles.tocTitle}>Neste ensaio</p>
          <ol>
            {essay.sections.map((s, i) => (
              <li key={s.heading}>
                <a href={`#secao-${i}`} aria-current={current === i ? 'true' : undefined}
                  onClick={(ev) => { ev.preventDefault(); document.getElementById(`secao-${i}`)?.scrollIntoView({ behavior: 'smooth' }) }}>
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}
