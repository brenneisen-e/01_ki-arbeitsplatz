// Rendert das Inline-Markup aus aiAnalyse.js:
//   **fett**          → <strong>
//   [color:Text]      → pastellfarbiges Highlight (Pille)
//
// Erlaubte Farben: red, amber, yellow, green, blue, violet, rose, slate
// Pastell-Töne sind bewusst weich, Lese-Kontrast bleibt erhalten.

const PASTEL = {
  red:    { bg: '#fee2e2', text: '#991b1b' },
  amber:  { bg: '#fef3c7', text: '#92400e' },
  yellow: { bg: '#fef9c3', text: '#854d0e' },
  green:  { bg: '#dcfce7', text: '#166534' },
  blue:   { bg: '#dbeafe', text: '#1e3a8a' },
  violet: { bg: '#ede9fe', text: '#5b21b6' },
  rose:   { bg: '#ffe4e6', text: '#9f1239' },
  slate:  { bg: '#e2e8f0', text: '#334155' },
};

// Tokenizer: findet sowohl **bold** als auch [color:text] Segmente.
const TOKEN_RE = /\*\*([^*]+?)\*\*|\[(red|amber|yellow|green|blue|violet|rose|slate):([^\]]+?)\]/g;

export default function RichText({ children, className }) {
  const text = String(children || '');
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      // **bold**
      parts.push(
        <strong key={'b-' + key++} className="font-bold text-slate-900">
          {match[1]}
        </strong>,
      );
    } else {
      // [color:text] – Pastellfarben deaktiviert, nur als normaler Text rendern.
      parts.push(match[3]);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <span className={className}>{parts}</span>;
}
