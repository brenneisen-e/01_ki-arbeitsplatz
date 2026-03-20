import { useState, useMemo } from 'react';
import { BUNDESLAND_DATA, fmtCur } from './cockpitData';
import geojson from './bundeslaender.geo.json';

/* ── Mercator helpers (mirrors legacy A-03 D3 geoMercator) ──────────── */
const DEG2RAD = Math.PI / 180;

function mercator(lon, lat) {
  return [
    lon * DEG2RAD,
    Math.log(Math.tan(Math.PI / 4 + (lat * DEG2RAD) / 2)),
  ];
}

/** Build a fitSize-style projection that maps GeoJSON bbox → SVG rect */
function buildProjection(features, width, height, padding = 12) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      const [px, py] = mercator(coords[0], coords[1]);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    } else {
      coords.forEach(visit);
    }
  };
  features.forEach((f) => visit(f.geometry.coordinates));

  const geoW = maxX - minX;
  const geoH = maxY - minY;
  const usable = { w: width - padding * 2, h: height - padding * 2 };
  const scale = Math.min(usable.w / geoW, usable.h / geoH);
  const offX = padding + (usable.w - geoW * scale) / 2;
  const offY = padding + (usable.h - geoH * scale) / 2;

  return (lon, lat) => {
    const [px, py] = mercator(lon, lat);
    return [
      (px - minX) * scale + offX,
      (maxY - py) * scale + offY, // flip Y
    ];
  };
}

/** Convert GeoJSON ring → SVG path "d" string */
function ringToPath(ring, project) {
  return ring
    .map((pt, i) => {
      const [x, y] = project(pt[0], pt[1]);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join('') + 'Z';
}

function featureToPath(feature, project) {
  const { type, coordinates } = feature.geometry;
  const parts = [];
  if (type === 'Polygon') {
    coordinates.forEach((ring) => parts.push(ringToPath(ring, project)));
  } else if (type === 'MultiPolygon') {
    coordinates.forEach((polygon) =>
      polygon.forEach((ring) => parts.push(ringToPath(ring, project)))
    );
  }
  return parts.join(' ');
}

/* ── Farben: hell = unselektiert, dunkel = gefiltert ──────────────── */
const COLOR_DEFAULT = '#dbeafe';   // helles Blau (alle Bundesländer)
const COLOR_SELECTED = '#1e40af';  // dunkles Blau (gefiltert/ausgewählt)

/* ── Component ──────────────────────────────────────────────────────── */
const SVG_W = 400;
const SVG_H = 500;

export default function GermanyMap({ selectedStates, onToggleState }) {
  const [hoveredState, setHoveredState] = useState(null);

  const blMap = useMemo(() => {
    const m = {};
    BUNDESLAND_DATA.forEach((bl) => { m[bl.name] = bl; });
    return m;
  }, []);

  const { project, paths } = useMemo(() => {
    const proj = buildProjection(geojson.features, SVG_W, SVG_H);
    const ps = geojson.features.map((f) => ({
      name: f.properties.name,
      d: featureToPath(f, proj),
    }));
    return { project: proj, paths: ps };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-full"
          style={{ maxHeight: 460 }}
        >
          <rect width={SVG_W} height={SVG_H} fill="#f8fafc" rx="8" />
          {paths.map(({ name, d }) => {
            const bl = blMap[name];
            const isSelected = selectedStates.has(name);
            const isHovered = hoveredState === name;
            return (
              <path
                key={name}
                d={d}
                fill={isSelected ? COLOR_SELECTED : isHovered ? '#93c5fd' : COLOR_DEFAULT}
                stroke="white"
                strokeWidth={isHovered || isSelected ? 2 : 1}
                className="cursor-pointer transition-all duration-150"
                style={{ opacity: selectedStates.size > 0 && !isSelected && !isHovered ? 0.6 : 1 }}
                onClick={() => onToggleState(name)}
                onMouseEnter={() => setHoveredState(name)}
                onMouseLeave={() => setHoveredState(null)}
              />
            );
          })}

          {/* Tooltip */}
          {hoveredState && blMap[hoveredState] && (
            <foreignObject x="10" y={SVG_H - 50} width="220" height="48">
              <div className="bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-200 text-[10px]">
                <div className="font-semibold text-slate-800">{hoveredState}</div>
                <div className="text-slate-500">
                  NG: {fmtCur(blMap[hoveredState].neugeschaeft)} ·{' '}
                  {blMap[hoveredState].vermittler} Vermittler
                </div>
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
            {[...selectedStates].map((s) => (
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
            onClick={() => [...selectedStates].forEach((s) => onToggleState(s))}
            className="mt-2 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            Alle abwählen
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: COLOR_DEFAULT }} />
            Alle Bundesländer
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: COLOR_SELECTED }} />
            Ausgewählt
          </span>
        </div>
      </div>
    </div>
  );
}
