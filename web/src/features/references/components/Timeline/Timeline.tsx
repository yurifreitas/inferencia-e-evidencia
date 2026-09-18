import { href } from '@/lib/router'
import { shortAuthors } from '@/lib/format'
import { REFERENCES } from '../../data'
import { themeLabel, type Theme } from '../../model'
import styles from './Timeline.module.css'

const decadeOf = (y: number) => Math.floor(y / 10) * 10
const DECADES = Array.from(new Set(REFERENCES.map((r) => decadeOf(r.year)))).sort((a, b) => a - b)

export const TRADITIONS: { label: string; themes: Theme[]; className: string }[] = [
  { label: 'Recuperação da informação', themes: ['ir'], className: styles.tIr },
  { label: 'Detecção de sinais e decisão', themes: ['sdt', 'decisao'], className: styles.tSdt },
  { label: 'Medicina e anotação', themes: ['diagnostico', 'gold'], className: styles.tMed },
  { label: 'Estatística e ML', themes: ['ml', 'metricas', 'validacao', 'calibracao', 'inferencia'], className: styles.tMl },
  { label: 'IA moderna e justiça', themes: ['ia-dados', 'justica'], className: styles.tIa },
  { label: 'História das ideias', themes: ['historia'], className: styles.tHist },
]

const traditionOf = (t: Theme) => TRADITIONS.find((x) => x.themes.includes(t)) ?? TRADITIONS[3]

export function Timeline() {
  return (
    <div className={styles.wrap}>
      <ul className={styles.legend} aria-label="Tradições">
        {TRADITIONS.map((t) => <li key={t.label}><span className={`${styles.swatch} ${t.className}`} />{t.label}</li>)}
      </ul>
      <div className={styles.scroller}>
        <ol className={styles.track}>
          {DECADES.map((d) => {
            const items = REFERENCES.filter((r) => decadeOf(r.year) === d).sort((a, b) => a.year - b.year)
            return (
              <li key={d} className={styles.decade}>
                <p className={styles.label}>{d}s <span>{items.length}</span></p>
                <ul className={styles.items}>
                  {items.map((r) => (
                    <li key={r.id}>
                      <a
                        href={href('ref', r.id)}
                        className={`${styles.item} ${r.kind === 'livro' ? styles.book : ''}`}
                        title={`${r.title} — ${themeLabel(r.themes[0])}`}
                      >
                        <span className={`${styles.swatch} ${traditionOf(r.themes[0]).className}`} />
                        <span className={styles.year}>{r.year}</span>
                        <span className={styles.who}>{shortAuthors(r.authors)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
