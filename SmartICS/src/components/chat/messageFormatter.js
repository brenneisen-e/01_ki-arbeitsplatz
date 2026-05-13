// =============================================================================
// Smart-ICS Chatbot Message Formatter — wandelt Plain-Text-Antworten des
// KI-Assistenten in semantische HTML-Bausteine um.
// Quellinspiration: kreditanalyse/src/components/layout/AIChatPanel.jsx
// =============================================================================

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Inline-Balkendiagramm: [chart: Label=Wert Label=Wert ...]
function renderInlineBarChart(data) {
  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const W = 320;
  const H = 130;
  const padLeft = 26;
  const padBottom = 22;
  const padTop = 8;
  const barArea = W - padLeft - 6;
  const barSlot = barArea / data.length;
  const barW = barSlot * 0.68;
  const barGap = barSlot * 0.32;
  const chartH = H - padBottom - padTop;

  let bars = '';
  data.forEach((d, i) => {
    const h = Math.max(2, (d.value / max) * chartH);
    const x = padLeft + i * barSlot + barGap / 2;
    const y = H - padBottom - h;
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="url(#smartics-bar-grad)" />`;
    bars += `<text x="${(x + barW / 2).toFixed(1)}" y="${(H - padBottom + 12).toFixed(1)}" text-anchor="middle" font-size="9" fill="#64748B">${escapeHtml(d.label)}</text>`;
    bars += `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 3).toFixed(1)}" text-anchor="middle" font-size="9" fill="#0F172A" font-weight="600">${escapeHtml(String(d.value))}</text>`;
  });

  return `<div class="ai-chart">
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">
      <defs>
        <linearGradient id="smartics-bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1D7B3F" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#86BC25" stop-opacity="0.65" />
        </linearGradient>
      </defs>
      <line x1="${padLeft}" y1="${H - padBottom}" x2="${W - 6}" y2="${H - padBottom}" stroke="#CBD5E1" stroke-width="1"/>
      ${bars}
    </svg>
  </div>`;
}

function parseChartLine(raw) {
  const m = raw.match(/^\s*\[chart:\s*(.+?)\s*\]\s*$/i);
  if (!m) return null;
  const pairs = m[1].split(/\s+/).filter(Boolean);
  const data = [];
  for (const p of pairs) {
    const [label, val] = p.split('=');
    const num = parseFloat(val);
    if (label && isFinite(num)) data.push({ label, value: num });
  }
  return data.length ? data : null;
}

function parseMarkdownTable(lines) {
  if (lines.length < 2) return null;
  const header = lines[0].trim();
  const sep = lines[1].trim();
  if (!header.startsWith('|') || !/^\|[\s:\-|]+\|$/.test(sep)) return null;

  const splitRow = (l) => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  const headers = splitRow(header);
  const rows = lines.slice(2).filter(l => l.trim().startsWith('|')).map(splitRow);

  let html = '<div class="ai-table-wrap"><table class="ai-table"><thead><tr>';
  html += headers.map(h => `<th>${escapeHtml(h).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</th>`).join('');
  html += '</tr></thead><tbody>';
  for (const r of rows) {
    html += '<tr>' + r.map(c => `<td>${escapeHtml(c).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</td>`).join('') + '</tr>';
  }
  html += '</tbody></table></div>';
  return html;
}

function formatBlock(lines) {
  let html = '';
  let listBuffer = [];
  const flushList = () => {
    if (listBuffer.length) {
      html += `<ul class="ai-list">${listBuffer.map(l => `<li>${l}</li>`).join('')}</ul>`;
      listBuffer = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.match(/^[\-•*]\s+(.+)$/);
    if (bullet) {
      let item = escapeHtml(bullet[1]);
      item = item.replace(/^([A-Za-zÄÖÜäöüß0-9 .\-/()]+?):\s+(.+)$/, '<span class="ai-label">$1:</span> $2');
      item = item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      listBuffer.push(item);
    } else {
      flushList();
      let p = escapeHtml(line);
      p = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      p = p.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
      html += `<p>${p}</p>`;
    }
  }
  flushList();
  return html;
}

export function formatMessageHtml(text) {
  const rawBlocks = text.split(/\n{2,}/);
  const out = [];

  const riskLevels = {
    'Hohe Risiken': 'risk-high',
    'Mittlere Risiken': 'risk-mid',
    'Geringe Risiken': 'risk-low',
    'Hohes Risiko': 'risk-high',
    'Mittleres Risiko': 'risk-mid',
    'Geringes Risiko': 'risk-low',
  };

  let inQuellen = false;
  let quellenLines = [];

  const flushQuellen = () => {
    if (quellenLines.length) {
      const body = formatBlock(quellenLines);
      out.push(`<div class="ai-sources"><div class="ai-sources-title">Quellen</div><div class="ai-sources-body">${body}</div></div>`);
      quellenLines = [];
    }
    inQuellen = false;
  };

  for (const block of rawBlocks) {
    const lines = block.split('\n');
    const first = lines[0].trim();

    // Inline-Chart
    if (lines.length === 1) {
      const data = parseChartLine(first);
      if (data) { flushQuellen(); out.push(renderInlineBarChart(data)); continue; }
    }

    // Markdown-Tabelle
    if (first.startsWith('|')) {
      const tableHtml = parseMarkdownTable(lines);
      if (tableHtml) { flushQuellen(); out.push(tableHtml); continue; }
    }

    // Überschrift + Chart
    if (lines.length >= 2) {
      const data = parseChartLine(lines[1]);
      if (data && /:$/.test(first)) {
        flushQuellen();
        out.push(`<div class="ai-heading">${escapeHtml(first.replace(/:$/, ''))}</div>${renderInlineBarChart(data)}`);
        continue;
      }
    }

    // Kontrolle: heading
    const ctrlMatch = first.match(/^Kontrolle\s*:?\s*(.+)?$/i);
    if (ctrlMatch && (ctrlMatch[1] || lines.length > 1)) {
      flushQuellen();
      const title = ctrlMatch[1] || lines[1]?.trim() || 'Kontrolle';
      const body = formatBlock(lines.slice(ctrlMatch[1] ? 1 : 2));
      out.push(`<div class="ai-kontrolle"><div class="ai-kontrolle-title">${escapeHtml(title.replace(/:$/, ''))}</div><div class="ai-kontrolle-body">${body}</div></div>`);
      continue;
    }

    // Hinweis-Callout
    const hintMatch = first.match(/^(Hinweis|Tipp|Empfehlung)\s*:?\s*(.+)?$/i);
    if (hintMatch && (hintMatch[2] || lines.length > 1)) {
      flushQuellen();
      const title = hintMatch[1];
      const body = formatBlock(hintMatch[2] ? [hintMatch[2], ...lines.slice(1)] : lines.slice(1));
      out.push(`<div class="ai-callout"><div class="ai-callout-title">${escapeHtml(title)}</div><div class="ai-callout-body">${body}</div></div>`);
      continue;
    }

    // Quellen
    if (/^Quellen\s*:?\s*$/i.test(first)) {
      flushQuellen();
      inQuellen = true;
      quellenLines.push(...lines.slice(1));
      continue;
    }
    if (inQuellen) {
      const hasBullets = lines.some(l => /^\s*[\-•*]\s+/.test(l));
      if (hasBullets || lines.every(l => l.trim() === '')) {
        quellenLines.push(...lines);
        continue;
      }
      flushQuellen();
    }

    // Nummerierter Abschnitt
    const numberedHeading = first.match(/^(\d+)\.\s+(.{2,80})$/);
    if (numberedHeading && lines.length > 1) {
      const idx = numberedHeading[1];
      const title = escapeHtml(numberedHeading[2]);
      const body = formatBlock(lines.slice(1));
      out.push(`<div class="ai-section"><div class="ai-section-title"><span class="ai-section-num">${idx}</span>${title}</div><div class="ai-section-body">${body}</div></div>`);
      continue;
    }

    // Risiko-Level
    const cleanFirst = first.replace(/:$/, '').trim();
    if (riskLevels[cleanFirst] && lines.length > 1) {
      const cls = riskLevels[cleanFirst];
      const body = formatBlock(lines.slice(1));
      out.push(`<div class="ai-risk ${cls}"><div class="ai-risk-title">${escapeHtml(cleanFirst)}</div><div class="ai-risk-body">${body}</div></div>`);
      continue;
    }

    // Generische Überschrift
    if (/^[A-ZÄÖÜ].{1,60}:$/.test(first) && lines.length > 1) {
      const body = formatBlock(lines.slice(1));
      out.push(`<div class="ai-heading">${escapeHtml(first.replace(/:$/, ''))}</div>${body}`);
      continue;
    }

    out.push(formatBlock(lines));
  }

  flushQuellen();
  return out.join('');
}
