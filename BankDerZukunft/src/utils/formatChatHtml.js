// Light-weight Markdown→HTML Renderer für Chatbot-Antworten.
// Unterstützt: ## Headings, **fett**, *kursiv*, Bullet-Listen, Markdown-
// Tabellen, "[chart: a=1 b=2 ...]" inline Bar-Charts und einen
// "Quellen:"-Block am Ende.

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function applyInline(s) {
  let out = escapeHtml(s)
  out = out.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
  return out
}

function parseChartLine(line) {
  const m = /^\[chart:\s*(.+?)\]\s*$/.exec(line.trim())
  if (!m) return null
  const items = []
  for (const seg of m[1].split(/\s+/)) {
    const eq = seg.indexOf('=')
    if (eq < 0) continue
    const label = seg.slice(0, eq).trim()
    const value = parseFloat(seg.slice(eq + 1))
    if (!label || isNaN(value)) continue
    items.push({ label, value })
  }
  return items.length ? items : null
}

function renderBarChart(items) {
  const max = Math.max(...items.map((i) => i.value), 1)
  const palette = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#fb7185', '#22d3ee']
  const bars = items
    .map((it, i) => {
      const pct = Math.round((it.value / max) * 100)
      const c = palette[i % palette.length]
      return `<div class="bdz-chat-bar-row">
        <div class="bdz-chat-bar-label">${escapeHtml(it.label)}</div>
        <div class="bdz-chat-bar-track"><div class="bdz-chat-bar-fill" style="width:${pct}%;background:${c}"></div></div>
        <div class="bdz-chat-bar-value">${it.value}</div>
      </div>`
    })
    .join('')
  return `<div class="bdz-chat-chart">${bars}</div>`
}

function parseTable(lines) {
  const rows = lines.filter((l) => l.trim().startsWith('|'))
  if (rows.length < 2) return null
  const split = (row) =>
    row
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim())
  const header = split(rows[0])
  const sep = rows[1]
  if (!/^\|?\s*[:\-]+/.test(sep)) return null
  const body = rows.slice(2).map(split)
  const head = `<thead><tr>${header.map((h) => `<th>${applyInline(h)}</th>`).join('')}</tr></thead>`
  const tbody = `<tbody>${body
    .map((r) => `<tr>${r.map((c) => `<td>${applyInline(c)}</td>`).join('')}</tr>`)
    .join('')}</tbody>`
  return `<table class="bdz-chat-table">${head}${tbody}</table>`
}

export function formatChatHtml(text) {
  const blocks = text.split(/\n{2,}/)
  const out = []
  let inSources = false
  let sourceLines = []

  const flushSources = () => {
    if (!sourceLines.length) return
    const items = sourceLines
      .filter((l) => /^\s*[-•*]/.test(l))
      .map((l) => l.replace(/^\s*[-•*]\s*/, ''))
      .map((l) => `<li>${applyInline(l)}</li>`)
      .join('')
    out.push(`<div class="bdz-chat-sources"><div class="bdz-chat-sources-title">Quellen</div><ul>${items}</ul></div>`)
    sourceLines = []
    inSources = false
  }

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l !== '')
    if (!lines.length) continue
    const first = lines[0].trim()

    // chart-only block
    if (lines.length === 1) {
      const c = parseChartLine(first)
      if (c) { out.push(renderBarChart(c)); continue }
    }
    // heading + chart
    if (lines.length >= 2) {
      const c = parseChartLine(lines[1])
      if (c && /:$/.test(first)) {
        out.push(`<div class="bdz-chat-heading">${applyInline(first.replace(/:$/, ''))}</div>${renderBarChart(c)}`)
        continue
      }
    }
    // tables
    if (first.startsWith('|')) {
      const t = parseTable(lines)
      if (t) { out.push(t); continue }
    }
    // ## heading
    if (/^##\s+/.test(first) && lines.length === 1) {
      out.push(`<h3 class="bdz-chat-h3">${applyInline(first.replace(/^##\s+/, ''))}</h3>`)
      continue
    }
    // Quellen-Block
    if (/^Quellen\s*:?\s*$/i.test(first)) {
      flushSources()
      inSources = true
      sourceLines.push(...lines.slice(1))
      continue
    }
    if (inSources) { sourceLines.push(...lines); continue }
    // Bullet-Liste
    if (lines.every((l) => /^\s*[-•*]\s+/.test(l))) {
      const items = lines.map((l) => `<li>${applyInline(l.replace(/^\s*[-•*]\s+/, ''))}</li>`).join('')
      out.push(`<ul class="bdz-chat-list">${items}</ul>`)
      continue
    }
    // Default: paragraph
    out.push(`<p>${lines.map(applyInline).join('<br/>')}</p>`)
  }

  flushSources()
  return out.join('')
}
