import type { AnchorHTMLAttributes } from 'react'
import styles from './ExternalLink.module.css'

export type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export function ExternalLink({ children, className, ...rest }: ExternalLinkProps) {
  return (
    <a target="_blank" rel="noreferrer" className={`${styles.link} ${className ?? ''}`} {...rest}>
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  )
}
