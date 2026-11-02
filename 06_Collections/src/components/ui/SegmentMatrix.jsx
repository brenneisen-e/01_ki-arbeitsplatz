import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { SEGMENTE } from '../../data/portfolio';

// Ein Punkt der Wolke steht fuer diese Anzahl Faelle.
export const FAELLE_PRO_PUNKT = 40;

// Deterministischer Zufall, damit die Punktwolke bei jedem Render gleich bleibt.
function streuung(seed, anzahl) {
  let s = seed;
  const next = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  return Array.from({ length: anzahl }, () => ({ x: next(), y: next() }));
}

const RASTER = {
  'top-left': 'col-start-1 row-start-1',
  'top-right': 'col-start-2 row-start-1',
  'bottom-left': 'col-start-1 row-start-2',
  'bottom-right': 'col-start-2 row-start-2',
};

function Quadrant({ segment, onSegment }) {
  // Punktzahl aus der Fallzahl des Segments — die Dichte der Wolke zeigt so,
  // wie stark das Segment besetzt ist.
  const punkte = useMemo(
    () => streuung(segment.count, Math.round(segment.count / FAELLE_PRO_PUNKT)),
    [segment.count],
  );

  return (
    <button
      onClick={() => onSegment(segment)}
      className={`${RASTER[segment.position]} relative overflow-hidden rounded-xl p-4 text-left transition-all hover:shadow-md group`}
      style={{ background: segment.bg, border: `1px solid ${segment.border}` }}
    >
      {/*
        Punktwolke, die erst beim Ueberfahren erscheint — im Ruhezustand bleibt
        die Kachel ruhig. Bewusst positionierte Elemente statt eines SVG mit
        preserveAspectRatio="none": Ein gestrecktes viewBox macht aus den
        Kreisen auf breiten Kacheln waagerechte Striche.
      */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      >
        {punkte.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${4 + p.x * 92}%`,
              top: `${6 + p.y * 88}%`,
              width: 5,
              height: 5,
              background: segment.color,
              opacity: 0.3,
            }}
          />
        ))}
      </div>

      {/* Weicher Verlauf, damit die Punkte nicht in der Beschriftung liegen. */}
      <div
        className="absolute inset-y-0 left-0 w-[85%] pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
        style={{ background: `linear-gradient(to right, ${segment.bg} 0%, ${segment.bg} 60%, transparent 100%)` }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{segment.subtitle}</div>
            <h4 className="text-base font-semibold mt-0.5" style={{ color: segment.color }}>{segment.title}</h4>
          </div>
          <span className="text-xl font-semibold text-slate-800 tabular-nums shrink-0">{segment.countLabel}</span>
        </div>
        <p className="text-xs text-slate-600 mt-1.5">{segment.volumen} • {segment.schnitt}</p>
        <div className="flex items-center gap-1.5 mt-3 text-[11px] font-medium" style={{ color: segment.color }}>
          <ArrowRight size={12} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5" />
          {segment.strategie}
        </div>
      </div>
    </button>
  );
}

export default function SegmentMatrix({ onSegment }) {
  return (
    <div className="flex gap-3">
      {/* Y-Achse */}
      <div className="flex flex-col justify-between items-center py-2 shrink-0">
        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          Hohe Ability →
        </span>
        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          ← Geringe Ability
        </span>
      </div>

      <div className="flex-1 min-w-0">
        {/*
          Ohne Hoehenbindung laufen die Quadranten auf breiten Bildschirmen zu
          flachen Baendern auseinander (bei 2.000 px waren es 822 x 164 px).
          Die Hoehe waechst deshalb mit der Fensterbreite mit. Bewusst ueber
          clamp() und nicht ueber aspect-ratio: bei gedeckelter Hoehe wuerde
          aspect-ratio die Breite mitschrumpfen und die Karte halb leer lassen.
        */}
        <div
          className="grid grid-cols-2 grid-rows-2 gap-3"
          style={{ height: 'clamp(340px, 26vw, 500px)' }}
        >
          {SEGMENTE.map(s => <Quadrant key={s.id} segment={s} onSegment={onSegment} />)}
        </div>
        {/* X-Achse */}
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] font-medium text-slate-400">← Geringe Willingness</span>
          <span className="text-[10px] font-medium text-slate-400">Hohe Willingness →</span>
        </div>
      </div>
    </div>
  );
}
