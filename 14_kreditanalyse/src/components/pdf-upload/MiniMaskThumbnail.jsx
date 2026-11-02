/**
 * MiniMaskThumbnail.jsx
 *
 * Sehr kleine, stilisierte Vorschau einer SAP-Maske – als Thumbnail-Icon
 * in der Ergebnistabelle. Zeigt:
 *   - dunkle SAP-Titelzeile
 *   - eine Reihe Registerkarten-Striche, eine davon aktiv (blau)
 *   - ein paar Feld-Striche, einer davon gelb hervorgehoben
 * Die Position der Hervorhebung ergibt sich aus dem Index des markierten
 * Felds im Schritt.
 */

export default function MiniMaskThumbnail({ step, active = false, onClick }) {
  if (!step) return null;

  const activeTabIdx = step.tabs?.findIndex((t) => t.active) ?? 0;
  const fieldCount = Math.min(step.fields?.length || 4, 6);
  const highlightIdx = step.fields?.findIndex((f) => f.highlight) ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      title={active ? 'Vorschau ausblenden' : 'SAP-Maske als Vorschau einblenden'}
      className={
        'group block w-[88px] h-[58px] rounded-md border overflow-hidden transition-all shrink-0 ' +
        (active
          ? 'border-primary ring-2 ring-primary/30 shadow-sm'
          : 'border-border hover:border-primary-light hover:shadow-sm')
      }
    >
      {/* SAP-Titelzeile */}
      <div className="h-[10px] bg-[#354a5f] flex items-center px-1 gap-0.5">
        <span className="w-1 h-1 rounded-full bg-white/60" />
        <span className="w-1 h-1 rounded-full bg-white/40" />
      </div>

      {/* Registerkarten-Andeutung */}
      <div className="h-[8px] bg-slate-50 border-b border-slate-200 flex items-end gap-[2px] px-1">
        {(step.tabs || []).slice(0, 5).map((_, i) => (
          <span
            key={i}
            className={
              'h-[3px] w-[10px] rounded-t-sm ' +
              (i === activeTabIdx ? 'bg-[#0a6ed1]' : 'bg-slate-300')
            }
          />
        ))}
      </div>

      {/* Felder-Andeutung */}
      <div className="bg-slate-50/40 px-1.5 py-1 grid grid-cols-2 gap-[3px]">
        {Array.from({ length: fieldCount }).map((_, i) => (
          <span
            key={i}
            className={
              'h-[5px] rounded-sm ' +
              (i === highlightIdx
                ? 'bg-amber-300 ring-1 ring-amber-500/60'
                : 'bg-slate-200')
            }
          />
        ))}
      </div>
    </button>
  );
}
