import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { Callout } from '@/components/molecules/Callout'
import { href } from '@/lib/router'
import { getConcepts } from '@/features/xref'
import { RefCite } from '@/features/references/components/RefCite'
import { DEBATES } from './data'
import styles from './DebatesPage.module.css'

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

export function DebatesPage() {
  const [current, setCurrent] = useState(DEBATES[0].id)

  useEffect(() => {
    const anchor = window.location.hash.split('#')[2]
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ block: 'start' })
  }, [])

  // Scrollspy: destaca no índice o debate que está na faixa superior da tela
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setCurrent(visible[0].target.id)
      },
      { rootMargin: '-10% 0px -70% 0px' },
    )
    DEBATES.forEach((d) => { const el = document.getElementById(d.id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Controvérsias"
        title="Onde a literatura discorda"
        lead="Métricas discordam porque respondem perguntas diferentes. Cada debate mostra as posições, quem as defende e uma síntese prática."
      />
      <div className={styles.layout}>
        <div className={styles.list}>
          {DEBATES.map((d, i) => (
            <article key={d.id} id={d.id} className={styles.debate}>
              <header className={styles.head}>
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.headText}>
                  <h2 className={styles.title}>{d.title}</h2>
                  <p className={styles.question}>{d.question}</p>
                </div>
              </header>
              <ol className={styles.positions}>
                {d.positions.map((p, j) => (
                  <li key={j} className={styles.position}>
                    <span className={styles.letter}>{String.fromCharCode(65 + j)}</span>
                    <div className={styles.claim}>
                      <p>{p.claim}</p>
                      <RefCite ids={p.refIds} />
                    </div>
                  </li>
                ))}
              </ol>
              <Callout label="Síntese" tone="gold">{d.synthesis}</Callout>
              <ul className={styles.concepts} aria-label="Conceitos relacionados">
                {getConcepts(d.conceptIds).map((c) => (
                  <li key={c.id}><a href={href('fundamentos', c.id)}>{c.name}</a></li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <nav className={styles.toc} aria-label="Debates">
          <p className={styles.tocTitle}>Nesta página</p>
          <ol>
            {DEBATES.map((d, i) => (
              <li key={d.id}>
                <a
                  href={`${href('debates')}#${d.id}`}
                  aria-current={current === d.id ? 'true' : undefined}
                  onClick={(e) => { e.preventDefault(); scrollTo(d.id) }}
                >
                  <span>{String(i + 1).padStart(2, '0')}</span>{d.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}
