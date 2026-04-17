// Rich formatter for KI-Assistant replies.
// Supports: **bold**, numbered sections "1. Titel", bullet lists (- / • / *),
// "Label: Wert" inside bullets, "Quellen:" block as a distinct card, and
// generic section headings ending with ":".

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatBlock(lines) {
  let html = '';
  let buf = [];
  const flush = () => {
    if (buf.length) {
      html += `<ul class="hp-ai-list">${buf.map(l => `<li>${l}</li>`).join('')}</ul>`;
      buf = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.match(/^[-•*]\s+(.+)$/);
    if (bullet) {
      let item = escapeHtml(bullet[1]);
      item = item.replace(/^([A-Za-zÄÖÜäöüß0-9 .\-/()]+?):\s+(.+)$/, '<span class="hp-ai-label">$1:</span> $2');
      item = item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      buf.push(item);
    } else {
      flush();
      let p = escapeHtml(line);
      p = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html += `<p>${p}</p>`;
    }
  }
  flush();
  return html;
}

export function formatAssistantHtml(text) {
  if (!text) return '';
  const rawBlocks = text.split(/\n{2,}/);
  const out = [];
  let inSources = false;
  let sourceLines = [];
  const flushSources = () => {
    if (sourceLines.length) {
      out.push(`<div class="hp-ai-sources"><div class="hp-ai-sources-title">Quellen</div><div class="hp-ai-sources-body">${formatBlock(sourceLines)}</div></div>`);
      sourceLines = [];
    }
    inSources = false;
  };

  for (const block of rawBlocks) {
    const lines = block.split('\n');
    const first = lines[0].trim();

    if (/^Quellen\s*:?\s*$/i.test(first)) {
      flushSources();
      inSources = true;
      sourceLines.push(...lines.slice(1));
      continue;
    }
    if (inSources) {
      const hasBullets = lines.some(l => /^\s*[-•*]\s+/.test(l));
      if (hasBullets || lines.every(l => l.trim() === '')) {
        sourceLines.push(...lines);
        continue;
      }
      flushSources();
    }

    const numbered = first.match(/^(\d+)\.\s+(.{2,80})$/);
    if (numbered && lines.length > 1) {
      const body = formatBlock(lines.slice(1));
      out.push(`<div class="hp-ai-section"><div class="hp-ai-section-title"><span class="hp-ai-section-num">${numbered[1]}</span>${escapeHtml(numbered[2])}</div><div class="hp-ai-section-body">${body}</div></div>`);
      continue;
    }

    if (/^[A-ZÄÖÜ].{1,60}:$/.test(first) && lines.length > 1) {
      out.push(`<div class="hp-ai-heading">${escapeHtml(first.replace(/:$/, ''))}</div>${formatBlock(lines.slice(1))}`);
      continue;
    }

    out.push(formatBlock(lines));
  }
  flushSources();
  return out.join('');
}
