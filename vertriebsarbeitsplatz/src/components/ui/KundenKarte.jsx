import { useState, useMemo } from 'react';
import { MapPin, ChevronLeft, ZoomIn } from 'lucide-react';
import geojson from '../../pages/cockpit/bundeslaender.geo.json';
import Card from './Card';
import Avatar from './Avatar';
import { getKundeFoto } from '../../utils/kundenFotos';

/* ── Mercator projection helpers ──────────────────────────────── */
const DEG2RAD = Math.PI / 180;

function mercator(lon, lat) {
  return [lon * DEG2RAD, Math.log(Math.tan(Math.PI / 4 + (lat * DEG2RAD) / 2))];
}

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
    return [(px - minX) * scale + offX, (maxY - py) * scale + offY];
  };
}

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
    coordinates.forEach((polygon) => polygon.forEach((ring) => parts.push(ringToPath(ring, project))));
  }
  return parts.join(' ');
}

/* ── State centroids (approximate geographic centers) ─────────── */
const STATE_CENTROIDS = {
  'Baden-Württemberg':       { lat: 48.66, lng: 9.38 },
  'Bayern':                  { lat: 49.01, lng: 11.50 },
  'Berlin':                  { lat: 52.52, lng: 13.41 },
  'Brandenburg':             { lat: 52.41, lng: 12.97 },
  'Bremen':                  { lat: 53.08, lng: 8.80 },
  'Hamburg':                 { lat: 53.55, lng: 10.00 },
  'Hessen':                  { lat: 50.65, lng: 9.16 },
  'Mecklenburg-Vorpommern':  { lat: 53.79, lng: 12.58 },
  'Niedersachsen':           { lat: 52.64, lng: 9.85 },
  'Nordrhein-Westfalen':     { lat: 51.43, lng: 7.66 },
  'Rheinland-Pfalz':         { lat: 49.91, lng: 7.45 },
  'Saarland':                { lat: 49.38, lng: 6.99 },
  'Sachsen':                 { lat: 51.10, lng: 13.20 },
  'Sachsen-Anhalt':          { lat: 51.95, lng: 11.70 },
  'Schleswig-Holstein':      { lat: 54.22, lng: 9.70 },
  'Thüringen':               { lat: 50.90, lng: 11.03 },
};

/* ── City coordinates + Bundesland mapping ────────────────────── */
const CITY_COORDS = {
  // Banking (Mittelhessen)
  'Gießen':               { lat: 50.58, lng: 8.68, bundesland: 'Hessen' },
  'Wetzlar':              { lat: 50.56, lng: 8.50, bundesland: 'Hessen' },
  'Marburg':              { lat: 50.81, lng: 8.77, bundesland: 'Hessen' },
  'Friedberg':            { lat: 50.34, lng: 8.76, bundesland: 'Hessen' },
  'Bad Nauheim':          { lat: 50.36, lng: 8.74, bundesland: 'Hessen' },
  // Versicherung (NRW)
  'Köln':                 { lat: 50.94, lng: 6.96, bundesland: 'Nordrhein-Westfalen' },
  'Bonn':                 { lat: 50.74, lng: 7.10, bundesland: 'Nordrhein-Westfalen' },
  'Leverkusen':           { lat: 51.04, lng: 6.99, bundesland: 'Nordrhein-Westfalen' },
  'Bergisch Gladbach':    { lat: 50.99, lng: 7.13, bundesland: 'Nordrhein-Westfalen' },
  'Troisdorf':            { lat: 50.82, lng: 7.14, bundesland: 'Nordrhein-Westfalen' },
  'Siegburg':             { lat: 50.80, lng: 7.21, bundesland: 'Nordrhein-Westfalen' },
  // Vermögensverwaltung (Rhein-Main)
  'Frankfurt am Main':    { lat: 50.11, lng: 8.68, bundesland: 'Hessen' },
  'Wiesbaden':            { lat: 50.08, lng: 8.24, bundesland: 'Hessen' },
  'Bad Homburg':          { lat: 50.22, lng: 8.62, bundesland: 'Hessen' },
  'Kronberg im Taunus':   { lat: 50.18, lng: 8.52, bundesland: 'Hessen' },
  'Königstein im Taunus': { lat: 50.18, lng: 8.47, bundesland: 'Hessen' },
  'Oberursel':            { lat: 50.20, lng: 8.57, bundesland: 'Hessen' },
  'Oberursel (Taunus)':   { lat: 50.20, lng: 8.57, bundesland: 'Hessen' },
};

function extractCity(adresse) {
  if (!adresse || typeof adresse !== 'string') return null;
  const parts = adresse.split(',');
  if (parts.length < 2) return null;
  const cityPart = parts[parts.length - 1].trim();
  // Format: "PLZ Stadt" or "PLZ Stadt (Suffix)"
  const match = cityPart.match(/^\d+\s+(.+)$/);
  return match ? match[1].trim() : cityPart;
}

function geocodeKunde(kunde, index) {
  const city = extractCity(kunde.adresse);
  if (!city) return null;
  let coord = CITY_COORDS[city];
  // Fuzzy fallback: try to match partial city name
  if (!coord) {
    const found = Object.keys(CITY_COORDS).find((c) => c.startsWith(city) || city.startsWith(c));
    if (found) coord = CITY_COORDS[found];
  }
  if (!coord) return null;
  // Deterministic jitter so multiple customers in the same city don't overlap
  const jLat = Math.sin(index * 2.37 + 0.7) * 0.022;
  const jLng = Math.cos(index * 3.11 + 1.3) * 0.032;
  return {
    id: kunde.id,
    name: kunde.name,
    city,
    bundesland: coord.bundesland,
    lat: coord.lat + jLat,
    lng: coord.lng + jLng,
  };
}

/* ── Component ──────────────────────────────────────────────── */
const SVG_W = 420;
const SVG_H = 520;

export default function KundenKarte({ kunden = [], onKundeClick, title = 'Kundenkarte', subtitle }) {
  const [zoomedState, setZoomedState] = useState(null);
  const [hoveredKunde, setHoveredKunde] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);

  const geocoded = useMemo(
    () => kunden.map((k, i) => geocodeKunde(k, i)).filter(Boolean),
    [kunden]
  );

  const clusters = useMemo(() => {
    const map = {};
    geocoded.forEach((k) => {
      if (!map[k.bundesland]) map[k.bundesland] = [];
      map[k.bundesland].push(k);
    });
    return map;
  }, [geocoded]);

  const { paths, project } = useMemo(() => {
    const proj = buildProjection(geojson.features, SVG_W, SVG_H);
    const ps = geojson.features.map((f) => ({
      name: f.properties.name,
      d: featureToPath(f, proj),
    }));
    return { paths: ps, project: proj };
  }, []);

  const maxCount = Math.max(1, ...Object.values(clusters).map((v) => v.length));
  const getStateFill = (count) => {
    if (count === 0) return '#f1f5f9';
    const intensity = count / maxCount;
    if (intensity >= 0.66) return 'var(--mode-primary, #004d26)';
    if (intensity >= 0.33) return 'var(--mode-primary-light, #00843d)';
    return 'rgba(122, 182, 72, 0.45)';
  };

  const visibleKunden = zoomedState ? clusters[zoomedState] || [] : [];

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--mode-primary-light), var(--mode-primary))',
            }}
          >
            <MapPin size={16} className="text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 truncate">{title}</h3>
            {subtitle && <div className="text-xs text-slate-500 truncate">{subtitle}</div>}
          </div>
        </div>
        {zoomedState ? (
          <button
            onClick={() => {
              setZoomedState(null);
              setHoveredKunde(null);
            }}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
          >
            <ChevronLeft size={14} />
            <span>Übersicht</span>
          </button>
        ) : (
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">
            {geocoded.length} Kunden · {Object.keys(clusters).length} BL
          </span>
        )}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full block">
          <defs>
            <linearGradient id="kundenkarte-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#eef2f7" />
            </linearGradient>
            <filter id="kundenkarte-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.3" />
            </filter>
          </defs>

          <rect width={SVG_W} height={SVG_H} fill="url(#kundenkarte-bg)" rx="12" />

          {/* State shapes */}
          {paths.map(({ name, d }) => {
            const count = clusters[name]?.length || 0;
            const isZoomed = zoomedState === name;
            const isInactive = zoomedState && zoomedState !== name;
            const isHovered = hoveredState === name;
            const fill = isInactive ? '#e2e8f0' : getStateFill(count);
            const hasClusters = count > 0;

            return (
              <path
                key={name}
                d={d}
                fill={fill}
                stroke={isZoomed || isHovered ? 'var(--mode-primary, #004d26)' : '#cbd5e1'}
                strokeWidth={isZoomed || isHovered ? 2 : 0.8}
                opacity={isInactive ? 0.45 : 1}
                style={{
                  cursor: hasClusters && !zoomedState ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => hasClusters && !zoomedState && setZoomedState(name)}
                onMouseEnter={() => hasClusters && !zoomedState && setHoveredState(name)}
                onMouseLeave={() => setHoveredState(null)}
              />
            );
          })}

          {/* Cluster markers (overview mode) */}
          {!zoomedState &&
            Object.entries(clusters).map(([state, kundenInState]) => {
              const centroid = STATE_CENTROIDS[state];
              if (!centroid) return null;
              const [cx, cy] = project(centroid.lng, centroid.lat);
              const radius = 14 + Math.sqrt(kundenInState.length) * 3.5;
              const isHovered = hoveredState === state;
              return (
                <g
                  key={state}
                  onClick={() => setZoomedState(state)}
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Pulse ring */}
                  <circle cx={cx} cy={cy} r={radius + 5} fill="var(--mode-primary, #004d26)" opacity={0.15}>
                    <animate attributeName="r" from={radius + 2} to={radius + 10} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.35" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="var(--mode-primary, #004d26)"
                    stroke="white"
                    strokeWidth={3}
                    filter="url(#kundenkarte-shadow)"
                    style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)', transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.2s ease' }}
                  />
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="800"
                    fill="white"
                    fontFamily="'DM Sans', sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {kundenInState.length}
                  </text>
                </g>
              );
            })}

          {/* Individual customer pins (zoomed mode) */}
          {zoomedState &&
            visibleKunden.map((k) => {
              const [x, y] = project(k.lng, k.lat);
              const isHovered = hoveredKunde === k.id;
              return (
                <g
                  key={k.id}
                  onClick={() => onKundeClick?.(k.id)}
                  onMouseEnter={() => setHoveredKunde(k.id)}
                  onMouseLeave={() => setHoveredKunde(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Shadow */}
                  <ellipse cx={x} cy={y + 4} rx={4} ry={1.5} fill="rgba(0,0,0,0.2)" />
                  {/* Pin teardrop */}
                  <path
                    d={`M${x},${y - 14} C${x - 6},${y - 14} ${x - 6},${y - 6} ${x},${y} C${x + 6},${y - 6} ${x + 6},${y - 14} ${x},${y - 14} Z`}
                    fill="var(--mode-primary, #004d26)"
                    stroke="white"
                    strokeWidth={1.5}
                    filter="url(#kundenkarte-shadow)"
                    style={{
                      transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                      transformOrigin: `${x}px ${y}px`,
                      transition: 'transform 0.15s ease',
                    }}
                  />
                  <circle cx={x} cy={y - 10} r={2.2} fill="white" />
                </g>
              );
            })}

          {/* Hover tooltip */}
          {hoveredState && !zoomedState && clusters[hoveredState] && (
            <foreignObject x="8" y="8" width="240" height="76">
              <div className="bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-slate-200 text-xs">
                <div className="font-bold text-slate-800 text-sm mb-1">{hoveredState}</div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="font-mono font-semibold" style={{ color: 'var(--mode-primary, #004d26)' }}>
                    {clusters[hoveredState].length} Kunden
                  </span>
                  <span className="text-slate-400">·</span>
                  <span>klicken zum Zoomen</span>
                </div>
              </div>
            </foreignObject>
          )}

          {hoveredKunde && zoomedState && (() => {
            const k = visibleKunden.find((x) => x.id === hoveredKunde);
            if (!k) return null;
            const [x, y] = project(k.lng, k.lat);
            const tooltipX = Math.min(Math.max(x - 80, 8), SVG_W - 168);
            const tooltipY = Math.max(y - 60, 8);
            return (
              <foreignObject x={tooltipX} y={tooltipY} width="160" height="56">
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 truncate">{k.name}</div>
                  <div className="text-slate-500 truncate">{k.city}</div>
                </div>
              </foreignObject>
            );
          })()}
        </svg>

        {/* Zoom hint overlay */}
        {!zoomedState && geocoded.length > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full border border-slate-200 shadow-sm text-[10px] font-medium text-slate-500">
            <ZoomIn size={11} />
            <span>Bundesland klicken zum Zoomen</span>
          </div>
        )}
      </div>

      {/* Zoomed customer list (fly-out) */}
      {zoomedState && visibleKunden.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
            {visibleKunden.length} Kunden in {zoomedState}
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto -mx-1 px-1">
            {visibleKunden.slice(0, 8).map((k) => (
              <div
                key={k.id}
                onClick={() => onKundeClick?.(k.id)}
                onMouseEnter={() => setHoveredKunde(k.id)}
                onMouseLeave={() => setHoveredKunde(null)}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Avatar name={k.name} foto={getKundeFoto(k.id)} size={26} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">{k.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{k.city}</div>
                </div>
              </div>
            ))}
            {visibleKunden.length > 8 && (
              <div className="text-[10px] text-slate-400 text-center py-1">
                + {visibleKunden.length - 8} weitere
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      {!zoomedState && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500">
          <span>Wenige</span>
          <div className="flex gap-0.5">
            <div className="w-5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(122, 182, 72, 0.45)' }} />
            <div className="w-5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--mode-primary-light, #00843d)' }} />
            <div className="w-5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--mode-primary, #004d26)' }} />
          </div>
          <span>Viele Kunden</span>
        </div>
      )}
    </Card>
  );
}
