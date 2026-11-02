// ===========================================================================
// Hinweis.jsx — Blocktyp `callout` in vier Varianten: Info (Info), Hinweis
// (AlertTriangle), Tipp (Lightbulb), Wichtig (CircleAlert) — linker
// Farbbalken, weicher Grund, optionaler `title`. Variante aus `icon`
// (Vorrang) oder `variant`; beginnt der Text mit „Tipp:“ / „Wichtig:“ /
// „Hinweis:“, entscheidet das Wort (Daten bleiben unverändert).
// ===========================================================================
import { Info, AlertTriangle, Lightbulb, CircleAlert } from 'lucide-react';
import InlineHtml from './Inline.jsx';
import { entferneHtml } from '../../lib/text.js';

const VARIANTEN = {
  info: { Symbol: Info, name: 'Info' },
  hinweis: { Symbol: AlertTriangle, name: 'Hinweis' },
  tipp: { Symbol: Lightbulb, name: 'Tipp' },
  wichtig: { Symbol: CircleAlert, name: 'Wichtig' },
};

const ALIAS = {
  info: 'info', hinweis: 'hinweis', warning: 'hinweis', warn: 'hinweis', 'alert-triangle': 'hinweis',
  tip: 'tipp', tipp: 'tipp', lightbulb: 'tipp', success: 'tipp',
  wichtig: 'wichtig', important: 'wichtig', 'alert-circle': 'wichtig', 'circle-alert': 'wichtig', danger: 'wichtig', error: 'wichtig',
};

function varianteAus(block, klartext) {
  const wort = klartext.match(/^\s*(Tipp|Wichtig|Hinweis|Achtung)\s*:/i);
  if (wort) {
    const w = wort[1].toLowerCase();
    return w === 'achtung' ? 'hinweis' : w;
  }
  const roh = String(block.icon || block.variant || 'info').toLowerCase();
  return ALIAS[roh] || 'info';
}

export default function Hinweis({ block }) {
  const html = block.text || block.content || '';
  const klartext = entferneHtml(html);
  const variante = varianteAus(block, klartext);
  const { Symbol, name } = VARIANTEN[variante];
  return (
    <aside className={`bl-hinweis bl-hinweis-${variante}`} role="note" aria-label={block.title || name}>
      <span className="bl-hinweis-symbol" aria-hidden="true"><Symbol size={18} /></span>
      <div className="bl-hinweis-koerper">
        {block.title && <div className="bl-hinweis-titel">{block.title}</div>}
        <div className="bl-hinweis-text"><InlineHtml html={html} /></div>
      </div>
    </aside>
  );
}
