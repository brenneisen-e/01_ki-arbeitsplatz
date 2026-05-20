import { useEffect, useRef, useState } from 'react'
import styles from './Terminal.module.css'
import { TERMINAL_TEMPLATE } from '../../data/modules'
import { useReducedMotion } from '../../hooks/useReducedMotion'

type LogLine = {
  id: number
  tag: 'ok' | 'warn'
  text: string
  /** HH:MM:SS */
  ts: string
}

const pad2 = (n: number): string => n.toString().padStart(2, '0')

const stamp = (): string => {
  const d = new Date()
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

type TerminalProps = {
  live: boolean
}

export function Terminal({ live }: TerminalProps): React.ReactElement {
  const reduced = useReducedMotion()
  const enabled = live && !reduced
  const wrapRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef(0)

  const [lines, setLines] = useState<LogLine[]>(() =>
    TERMINAL_TEMPLATE.slice(0, 6).map((tpl) => ({
      id: counterRef.current++,
      tag: tpl.tag,
      text: tpl.text,
      ts: stamp(),
    })),
  )

  useEffect(() => {
    if (!enabled) return
    let i = 6
    const id = window.setInterval(() => {
      const tpl = TERMINAL_TEMPLATE[i % TERMINAL_TEMPLATE.length]!
      const next: LogLine = {
        id: counterRef.current++,
        tag: tpl.tag,
        text: tpl.text,
        ts: stamp(),
      }
      i += 1
      setLines((prev) => {
        const arr = [...prev, next]
        return arr.length > 14 ? arr.slice(arr.length - 14) : arr
      })
    }, 1500)
    return () => window.clearInterval(id)
  }, [enabled])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [lines])

  return (
    <div className={styles.terminal} role="log" aria-live="polite">
      <div className={styles.bar}>
        <span className={styles.dot} data-color="r" />
        <span className={styles.dot} data-color="y" />
        <span className={styles.dot} data-color="g" />
        <span className={styles.barTitle}>platform-stream · tail -f</span>
        <span className={styles.barRight}>{enabled ? 'streaming' : 'paused'}</span>
      </div>
      <div className={styles.body} ref={wrapRef}>
        {lines.map((l) => (
          <div className={styles.line} key={l.id} data-tag={l.tag}>
            <span className={styles.ts}>{l.ts}</span>
            <span className={styles.tag}>[{l.tag}]</span>
            <span className={styles.text}>{l.text}</span>
          </div>
        ))}
        <span className={styles.cursor} aria-hidden />
      </div>
    </div>
  )
}
