import { useEffect, useRef } from 'react'
import { Bold, Italic, Underline, RemoveFormatting } from 'lucide-react'
import styles from './RichEditor.module.css'
import { renderRichHtml, sanitizeRichHtml } from '../data/richtext'

// ─────────────────────────────────────────────────────────────────────────────
// RichEditor — kleiner WYSIWYG-Editor (wie in Word). Text markieren, dann per
// Toolbar Fett/Kursiv/Unterstrichen, Farbe oder Schriftgröße anwenden. Zeigt den
// FORMATIERTEN Text (kein `**` und kein HTML-Quellcode). Speichert saniertes HTML.
//
// contentEditable ist bewusst UNKONTROLLIERT: der Startwert wird einmalig gesetzt
// (Legacy `**fett**` wird dabei in echtes HTML gewandelt); Tastatureingaben lösen
// nur onChange aus, ohne den Cursor zurückzusetzen. Ein Zurücksetzen von außen
// erfolgt über einen Remount (key-Wechsel im Parent).
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = ['#1b1c1a', '#046A38', '#86BC25', '#b3261e', '#b26a00', '#1c6ea4', '#7b3fb3']
const SIZES: { label: string; px: string }[] = [
  { label: 'A', px: '14px' },
  { label: 'A', px: '16px' },
  { label: 'A', px: '20px' },
  { label: 'A', px: '26px' },
]

// Aktuelle Auswahl im Editor mit einem Style-Span umschließen (Farbe/Größe).
function surroundSelection(styleText: string): void {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
  const range = sel.getRangeAt(0)
  const span = document.createElement('span')
  span.setAttribute('style', styleText)
  try {
    range.surroundContents(span)
  } catch {
    const frag = range.extractContents()
    span.appendChild(frag)
    range.insertNode(span)
  }
  sel.removeAllRanges()
  const r = document.createRange()
  r.selectNodeContents(span)
  sel.addRange(r)
}

type Props = { value: string; onChange: (html: string) => void; ariaLabel?: string }

export function RichEditor({ value, onChange, ariaLabel }: Props): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)

  // Startinhalt einmalig setzen (Legacy-Markdown -> HTML, damit formatiert sichtbar).
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = renderRichHtml(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const emit = () => {
    if (ref.current) onChange(sanitizeRichHtml(ref.current.innerHTML))
  }

  const exec = (cmd: string, arg?: string) => {
    try {
      document.execCommand('styleWithCSS', false, 'true')
      document.execCommand(cmd, false, arg)
    } catch {
      /* execCommand nicht verfügbar — dann ohne Formatierung */
    }
    ref.current?.focus()
    emit()
  }

  const size = (px: string) => {
    surroundSelection(`font-size: ${px}`)
    ref.current?.focus()
    emit()
  }

  // preventDefault verhindert, dass der Toolbar-Klick die Auswahl im Editor verliert.
  const hold = (e: React.MouseEvent) => e.preventDefault()

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formatierung">
        <button type="button" className={styles.tbtn} onMouseDown={hold} onClick={() => exec('bold')} title="Fett">
          <Bold size={15} strokeWidth={2.6} aria-hidden />
        </button>
        <button type="button" className={styles.tbtn} onMouseDown={hold} onClick={() => exec('italic')} title="Kursiv">
          <Italic size={15} strokeWidth={2.4} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.tbtn}
          onMouseDown={hold}
          onClick={() => exec('underline')}
          title="Unterstrichen"
        >
          <Underline size={15} strokeWidth={2.4} aria-hidden />
        </button>

        <span className={styles.divider} aria-hidden />

        {SIZES.map((s, i) => (
          <button
            key={s.px}
            type="button"
            className={styles.sizeBtn}
            style={{ fontSize: `${11 + i * 3}px` }}
            onMouseDown={hold}
            onClick={() => size(s.px)}
            title={`Schriftgröße ${s.px}`}
          >
            {s.label}
          </button>
        ))}

        <span className={styles.divider} aria-hidden />

        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={styles.swatch}
            style={{ background: c }}
            onMouseDown={hold}
            onClick={() => exec('foreColor', c)}
            title={`Farbe ${c}`}
            aria-label={`Farbe ${c}`}
          />
        ))}

        <span className={styles.divider} aria-hidden />

        <button
          type="button"
          className={styles.tbtn}
          onMouseDown={hold}
          onClick={() => exec('removeFormat')}
          title="Formatierung entfernen"
        >
          <RemoveFormatting size={15} strokeWidth={2.2} aria-hidden />
        </button>
      </div>

      <div
        ref={ref}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        onInput={emit}
      />
    </div>
  )
}
