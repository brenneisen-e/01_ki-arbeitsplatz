import { useState } from 'react';
import { clsx } from 'clsx';
import { BUNDESLAND_DATA, fmtCur } from './cockpitData';

// Simplified SVG paths for German Bundesländer (approximate shapes)
const BUNDESLAENDER_PATHS = {
  'Schleswig-Holstein': 'M175,10 L200,5 L215,15 L225,10 L230,25 L220,40 L210,55 L195,60 L180,55 L170,45 L160,35 L165,20Z',
  'Hamburg': 'M195,60 L210,58 L215,65 L205,70 L195,67Z',
  'Mecklenburg-Vorpommern': 'M225,15 L260,8 L300,12 L330,18 L335,35 L320,50 L290,55 L260,50 L240,55 L220,45 L225,30Z',
  'Bremen': 'M155,70 L165,68 L170,75 L162,80 L155,77Z',
  'Niedersachsen': 'M100,55 L155,50 L170,45 L180,55 L195,67 L205,70 L215,65 L220,55 L240,58 L260,55 L265,70 L255,90 L240,100 L225,110 L210,115 L195,108 L180,115 L165,120 L150,115 L135,105 L120,95 L105,85 L95,75 L100,65Z',
  'Brandenburg': 'M265,70 L290,60 L320,55 L340,60 L350,75 L355,95 L350,115 L340,130 L320,135 L300,130 L285,120 L275,105 L270,90Z',
  'Berlin': 'M305,85 L315,82 L320,90 L312,95 L305,92Z',
  'Sachsen-Anhalt': 'M240,100 L255,92 L270,95 L275,110 L285,125 L280,140 L265,150 L250,145 L235,135 L225,120 L230,110Z',
  'Nordrhein-Westfalen': 'M70,100 L95,85 L120,95 L135,108 L150,118 L155,135 L145,150 L130,160 L115,155 L100,145 L85,140 L75,130 L65,115Z',
  'Hessen': 'M150,120 L165,125 L180,118 L195,112 L210,120 L225,125 L235,140 L230,160 L220,175 L205,180 L190,175 L175,165 L160,155 L150,140Z',
  'Thüringen': 'M225,130 L250,148 L265,155 L275,165 L270,180 L255,185 L240,180 L225,175 L215,165 L220,150Z',
  'Sachsen': 'M275,145 L300,135 L320,140 L340,145 L350,155 L355,170 L345,185 L325,190 L305,185 L285,180 L275,170Z',
  'Rheinland-Pfalz': 'M65,150 L85,145 L100,150 L115,160 L130,165 L145,155 L155,165 L155,180 L145,195 L135,210 L120,215 L105,210 L90,200 L75,190 L65,175Z',
  'Saarland': 'M75,200 L90,200 L95,210 L90,220 L78,218 L72,210Z',
  'Baden-Württemberg': 'M105,215 L120,218 L135,215 L148,200 L160,195 L175,195 L190,200 L200,215 L195,235 L185,255 L170,270 L155,275 L140,270 L125,260 L110,250 L100,235Z',
  'Bayern': 'M175,175 L190,180 L205,185 L220,180 L240,185 L260,190 L280,185 L300,190 L315,200 L325,215 L330,235 L325,260 L310,280 L290,290 L270,295 L250,290 L235,280 L220,265 L205,255 L195,240 L200,220 L195,200 L185,190Z',
};

// Color scale based on neugeschaeft factor
function getColor(factor) {
  if (factor >= 1.3) return '#1e40af';
  if (factor >= 1.1) return '#3b82f6';
  if (factor >= 0.9) return '#93c5fd';
  if (factor >= 0.7) return '#bfdbfe';
  return '#dbeafe';
}

export default function GermanyMap({ selectedStates, onToggleState }) {
  const [hoveredState, setHoveredState] = useState(null);

  const blMap = {};
  BUNDESLAND_DATA.forEach(bl => { blMap[bl.name] = bl; });

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div className="flex-1 min-h-0">
        <svg viewBox="50 0 320 310" className="w-full h-full" style={{ maxHeight: 420 }}>
          <rect x="50" y="0" width="320" height="310" fill="#f8fafc" rx="8" />
          {Object.entries(BUNDESLAENDER_PATHS).map(([name, path]) => {
            const bl = blMap[name];
            const isSelected = selectedStates.has(name);
            const isHovered = hoveredState === name;
            return (
              <g key={name}>
                <path
                  d={path}
                  fill={isSelected ? '#86BC25' : getColor(bl?.factor || 0.5)}
                  stroke={isHovered ? '#1e293b' : 'white'}
                  strokeWidth={isHovered ? 2 : 1}
                  className="cursor-pointer transition-all duration-150"
                  style={{ opacity: isHovered ? 1 : 0.85 }}
                  onClick={() => onToggleState(name)}
                  onMouseEnter={() => setHoveredState(name)}
                  onMouseLeave={() => setHoveredState(null)}
                />
              </g>
            );
          })}
          {/* Tooltip */}
          {hoveredState && blMap[hoveredState] && (
            <foreignObject x="55" y="265" width="200" height="45">
              <div className="bg-white/95 backdrop-blur px-2 py-1 rounded-lg shadow-lg border border-slate-200 text-[10px]">
                <div className="font-semibold text-slate-800">{hoveredState}</div>
                <div className="text-slate-500">NG: {fmtCur(blMap[hoveredState].neugeschaeft)} · {blMap[hoveredState].vermittler} Vermittler</div>
              </div>
            </foreignObject>
          )}
        </svg>
      </div>

      {/* Selected states */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-semibold text-slate-500 mb-2">Ausgewählte Bundesländer</h4>
        {selectedStates.size === 0 ? (
          <span className="text-xs text-slate-400">— keine —</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {[...selectedStates].map(s => (
              <button
                key={s}
                onClick={() => onToggleState(s)}
                className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
              >
                {s} ✕
              </button>
            ))}
          </div>
        )}
        {selectedStates.size > 0 && (
          <button
            onClick={() => [...selectedStates].forEach(s => onToggleState(s))}
            className="mt-2 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            Alle abwählen
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span>Niedrig</span>
          <div className="flex gap-0.5">
            {['#dbeafe', '#bfdbfe', '#93c5fd', '#3b82f6', '#1e40af'].map(c => (
              <div key={c} className="w-5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>Hoch</span>
        </div>
      </div>
    </div>
  );
}
