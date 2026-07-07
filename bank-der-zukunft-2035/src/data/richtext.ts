// ─────────────────────────────────────────────────────────────────────────────
// richtext — sichere Rich-Text-Verarbeitung für den WYSIWYG-Editor und die
// Anzeige. Inhalte werden als eingeschränktes HTML gespeichert (fett, kursiv,
// unterstrichen, Farbe, Schriftgröße). Der alte Markdown-Stil `**fett**` wird
// weiter unterstützt, damit Bestandsinhalte unverändert korrekt erscheinen.
//
// SICHERHEIT: Beim Rendern wird IMMER saniert (Allowlist an Tags/Style-Props),
// da die Inhalte geteilt gespeichert und allen Betrachtern angezeigt werden.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_TAGS = new Set(['STRONG', 'B', 'EM', 'I', 'U', 'SPAN', 'BR', 'P', 'DIV'])
const ALLOWED_STYLE = new Set([
  'color',
  'font-size',
  'font-weight',
  'font-style',
  'text-decoration',
])

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Enthält der Wert bereits (Rich-)HTML-Tags? */
function looksLikeHtml(s: string): boolean {
  return /<(?:strong|b|em|i|u|span|br|p|div)\b|<\/(?:strong|b|em|i|u|span|p|div)>/i.test(s)
}

/** Style-Attribut auf erlaubte, ungefährliche Deklarationen reduzieren. */
function filterStyle(style: string): string {
  const parts: string[] = []
  for (const decl of style.split(';')) {
    const idx = decl.indexOf(':')
    if (idx < 0) continue
    const prop = decl.slice(0, idx).trim().toLowerCase()
    const val = decl.slice(idx + 1).trim()
    if (!ALLOWED_STYLE.has(prop) || val === '') continue
    if (/url\(|expression|javascript:|[<>]/i.test(val)) continue
    parts.push(`${prop}: ${val}`)
  }
  return parts.join('; ')
}

function sanitizeInto(src: Node, dst: Node, doc: Document): void {
  src.childNodes.forEach((child) => {
    if (child.nodeType === 3 /* TEXT_NODE */) {
      dst.appendChild(doc.createTextNode(child.textContent || ''))
      return
    }
    if (child.nodeType !== 1 /* ELEMENT_NODE */) return
    const el = child as HTMLElement
    const tag = el.tagName
    if (tag === 'BR') {
      dst.appendChild(doc.createElement('br'))
      return
    }
    if (ALLOWED_TAGS.has(tag)) {
      const clean = doc.createElement(tag.toLowerCase())
      const style = el.getAttribute('style')
      if (style) {
        const safe = filterStyle(style)
        if (safe) clean.setAttribute('style', safe)
      }
      sanitizeInto(el, clean, doc)
      dst.appendChild(clean)
    } else {
      // Nicht erlaubtes Tag: Inhalt übernehmen (auspacken), Tag verwerfen.
      sanitizeInto(el, dst, doc)
    }
  })
}

/** HTML auf die erlaubte Teilmenge reduzieren. */
export function sanitizeRichHtml(html: string): string {
  if (typeof document === 'undefined') return escapeHtml(html)
  const doc = document.implementation.createHTMLDocument('')
  const container = doc.createElement('div')
  container.innerHTML = html
  const out = doc.createElement('div')
  sanitizeInto(container, out, doc)
  return out.innerHTML
}

/** Wert -> anzeigefertiges, sicheres HTML (Legacy `**fett**` inklusive). */
export function renderRichHtml(value: string): string {
  if (!value) return ''
  if (looksLikeHtml(value)) return sanitizeRichHtml(value)
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

/** Nur-Text-Fassung (für Excel-Export, Aria-Labels, Platzhalter). */
export function stripRich(value: string): string {
  if (!value) return ''
  if (looksLikeHtml(value)) {
    if (typeof document === 'undefined') return value.replace(/<[^>]+>/g, '')
    const div = document.createElement('div')
    div.innerHTML = sanitizeRichHtml(value)
    return (div.textContent || '').replace(/\s+\n/g, '\n')
  }
  return value.replace(/\*\*([^*]+)\*\*/g, '$1')
}
