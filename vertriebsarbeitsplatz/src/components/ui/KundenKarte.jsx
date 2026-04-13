import { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin, ChevronLeft, Maximize2, X } from 'lucide-react';
import geojson from '../../pages/cockpit/bundeslaender.geo.json';
import Card from './Card';
import Avatar from './Avatar';
import { getKundeFoto } from '../../utils/kundenFotos';
import { LeafletMap, geocodeKundeLeaflet } from './KundenKarteLeaflet';

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

/** Compute bounding box of a GeoJSON feature in SVG coordinates via project(). */
function featureBBox(feature, project) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      const [x, y] = project(coords[0], coords[1]);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    } else {
      coords.forEach(visit);
    }
  };
  visit(feature.geometry.coordinates);
  return { minX, maxX, minY, maxY };
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
  const match = cityPart.match(/^\d+\s+(.+)$/);
  return match ? match[1].trim() : cityPart;
}

// Recency colour scale: green = fresh contact / appointment, gray = stale.
function getContactStatus(kunde, now = new Date()) {
  const komms = Array.isArray(kunde?.kommunikation) ? kunde.kommunikation : [];
  let last = null;
  for (const k of komms) {
    if (k?.datum) {
      const d = new Date(k.datum);
      if (!isNaN(d) && (!last || d > last)) last = d;
    }
  }
  // Upcoming termin counts as fresh as well
  const termine = Array.isArray(kunde?.termine) ? kunde.termine : [];
  let upcoming = null;
  for (const t of termine) {
    if (t?.datum) {
      const d = new Date(t.datum);
      if (!isNaN(d) && d >= now && (!upcoming || d < upcoming)) upcoming = d;
    }
  }
  if (upcoming) return { color: '#10b981', label: 'Termin geplant' };
  if (!last) return { color: '#94a3b8', label: 'Kein Kontakt' };
  const daysAgo = (now - last) / 86400000;
  if (daysAgo <= 21) return { color: '#10b981', label: 'Kürzlich kontaktiert' };
  if (daysAgo <= 60) return { color: '#84cc16', label: 'Letzter Kontakt < 2 Monate' };
  if (daysAgo <= 120) return { color: '#a3a3a3', label: 'Länger her' };
  return { color: '#6b7280', label: 'Termin überfällig' };
}

function geocodeKunde(kunde, index) {
  const city = extractCity(kunde.adresse);
  if (!city) return null;
  let coord = CITY_COORDS[city];
  if (!coord) {
    const found = Object.keys(CITY_COORDS).find((c) => c.startsWith(city) || city.startsWith(c));
    if (found) coord = CITY_COORDS[found];
  }
  if (!coord) return null;
  const jLat = Math.sin(index * 2.37 + 0.7) * 0.022;
  const jLng = Math.cos(index * 3.11 + 1.3) * 0.032;
  return {
    id: kunde.id,
    name: kunde.name,
    city,
    bundesland: coord.bundesland,
    lat: coord.lat + jLat,
    lng: coord.lng + jLng,
    status: getContactStatus(kunde),
  };
}

/* ── Map renderer (shared between inline + modal) ─────────────── */
function MapRenderer({
  paths,
  project,
  clusters,
  getStateFill,
  zoomedState,
  onZoomState,
  visibleKunden,
  onKundeClick,
  svgW,
  svgH,
  markerScale = 1,
}) {
  const [hoveredKunde, setHoveredKunde] = useState(null);

  // When a state is selected, zoom directly onto the customer cluster (not the
  // state bounding box). The state outline is still rendered – just clipped
  // by the new viewBox – so users dive right to where the pins actually sit.
  const viewBox = useMemo(() => {
    if (!zoomedState) return `0 0 ${svgW} ${svgH}`;

    // Compute bounding box of the actual customer pins
    if (visibleKunden && visibleKunden.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      visibleKunden.forEach((k) => {
        const [px, py] = project(k.lng, k.lat);
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      });
      // Generous padding so a single point still gets a meaningful frame
      const spanX = Math.max(maxX - minX, 30);
      const spanY = Math.max(maxY - minY, 30);
      const pad = Math.max(spanX, spanY) * 0.6 + 16;
      const x = Math.max(0, minX - pad);
      const y = Math.max(0, minY - pad);
      const w = Math.min(svgW - x, spanX + pad * 2);
      const h = Math.min(svgH - y, spanY + pad * 2);
      return `${x} ${y} ${w} ${h}`;
    }

    // Fallback: state bbox
    const feature = geojson.features.find((f) => f.properties.name === zoomedState);
    if (!feature) return `0 0 ${svgW} ${svgH}`;
    const bb = featureBBox(feature, project);
    const pad = 24;
    const x = Math.max(0, bb.minX - pad);
    const y = Math.max(0, bb.minY - pad);
    const w = Math.min(svgW - x, bb.maxX - bb.minX + pad * 2);
    const h = Math.min(svgH - y, bb.maxY - bb.minY + pad * 2);
    return `${x} ${y} ${w} ${h}`;
  }, [zoomedState, project, svgW, svgH, visibleKunden]);

  // Scale markers inversely to zoom so they stay roughly the same visual size.
  const zoomScale = useMemo(() => {
    if (!zoomedState) return 1;
    const [, , w] = viewBox.split(' ').map(Number);
    return Math.max(0.35, w / svgW);
  }, [viewBox, svgW, zoomedState]);

  return (
    <svg viewBox={viewBox} className="w-full h-full block" preserveAspectRatio="xMidYMid meet" style={{ transition: 'all 400ms ease' }}>
      <defs>
        <linearGradient id="kundenkarte-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#eef2f7" />
        </linearGradient>
        <filter id="kundenkarte-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.3" />
        </filter>
      </defs>

      <rect width={svgW} height={svgH} fill="url(#kundenkarte-bg)" rx="12" />

      {/* State shapes */}
      {paths.map(({ name, d }) => {
        const count = clusters[name]?.length || 0;
        const isZoomed = zoomedState === name;
        const isInactive = zoomedState && zoomedState !== name;
        const fill = isInactive ? '#e2e8f0' : getStateFill(count);
        // Every state is clickable – if it has customers, zoom in; otherwise no-op
        return (
          <path
            key={name}
            d={d}
            fill={fill}
            stroke={isZoomed ? 'var(--mode-primary, #004d26)' : '#cbd5e1'}
            strokeWidth={isZoomed ? 1.5 : 0.7}
            opacity={isInactive ? 0.4 : 1}
            style={{ cursor: count > 0 && !zoomedState ? 'pointer' : 'default' }}
            onClick={(e) => {
              e.stopPropagation();
              if (count > 0 && !zoomedState) onZoomState(name);
            }}
          />
        );
      })}

      {/* Cluster markers (overview mode) */}
      {!zoomedState &&
        Object.entries(clusters).map(([state, kundenInState]) => {
          const centroid = STATE_CENTROIDS[state];
          if (!centroid) return null;
          const [cx, cy] = project(centroid.lng, centroid.lat);
          const radius = (10 + Math.sqrt(kundenInState.length) * 2.2) * markerScale;
          return (
            <g
              key={state}
              onClick={(e) => {
                e.stopPropagation();
                onZoomState(state);
              }}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={cx} cy={cy} r={radius + 3} fill="var(--mode-primary, #004d26)" opacity={0.15} style={{ pointerEvents: 'none' }}>
                <animate attributeName="r" from={radius + 1} to={radius + 8} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.35" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="var(--mode-primary, #004d26)"
                stroke="white"
                strokeWidth={2}
                filter="url(#kundenkarte-shadow)"
              />
              <text
                x={cx}
                y={cy + 3.5 * markerScale}
                textAnchor="middle"
                fontSize={11 * markerScale}
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

      {/* Individual customer pins (zoomed mode) – colour by contact recency */}
      {zoomedState &&
        visibleKunden.map((k) => {
          const [x, y] = project(k.lng, k.lat);
          const isHovered = hoveredKunde === k.id;
          const r = (isHovered ? 6 : 4) * markerScale;
          const fill = k.status?.color || 'var(--mode-primary, #004d26)';
          return (
            <g
              key={k.id}
              onClick={(e) => {
                e.stopPropagation();
                onKundeClick?.(k.id);
              }}
              onMouseEnter={() => setHoveredKunde(k.id)}
              onMouseLeave={() => setHoveredKunde(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y + 1} r={r + 1} fill="rgba(0,0,0,0.25)" style={{ pointerEvents: 'none' }} />
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                stroke="white"
                strokeWidth={1.5}
                filter="url(#kundenkarte-shadow)"
              />
            </g>
          );
        })}

    </svg>
  );
}

/* ── Component ──────────────────────────────────────────────── */
const SVG_W = 360;
const SVG_H = 420;

export default function KundenKarte({
  kunden = [],
  onKundeClick,
  title = 'Kundenkarte',
  sidebar = null,
  sidebarTitle = null,
}) {
  const [zoomedState, setZoomedState] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleZoomState = (state) => setZoomedState(state);
  const handleResetZoom = () => setZoomedState(null);

  return (
    <>
      <Card hover={false}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={18} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800 truncate">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {zoomedState && (
              <button
                onClick={handleResetZoom}
                className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors"
              >
                <ChevronLeft size={12} />
                <span>{zoomedState}</span>
              </button>
            )}
            {!zoomedState && (
              <span className="text-xs text-slate-400 font-medium">
                {geocoded.length} Kunden · {Object.keys(clusters).length} BL
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Vergrößern"
              aria-label="Karte vergrößern"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        {/* Grid layout: map on left, sidebar (Termine) on right */}
        <div className={sidebar ? 'grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4' : ''}>
          <div className="relative" style={{ aspectRatio: `${SVG_W}/${SVG_H}`, maxHeight: 340 }}>
            <MapRenderer
              paths={paths}
              project={project}
              clusters={clusters}
              getStateFill={getStateFill}
              zoomedState={zoomedState}
              onZoomState={handleZoomState}
              visibleKunden={visibleKunden}
              onKundeClick={onKundeClick}
              svgW={SVG_W}
              svgH={SVG_H}
            />
          </div>

          {sidebar && (
            <div className="min-w-0 flex flex-col">
              {sidebarTitle && (
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                  {sidebarTitle}
                </div>
              )}
              {zoomedState ? (
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                    {visibleKunden.length} Kunden in {zoomedState}
                  </div>
                  <div className="space-y-1 overflow-y-auto" style={{ maxHeight: 300 }}>
                    {visibleKunden.slice(0, 12).map((k) => (
                      <div
                        key={k.id}
                        onClick={() => onKundeClick?.(k.id)}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <Avatar name={k.name} foto={getKundeFoto(k.id)} size={24} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-700 truncate">{k.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{k.city}</div>
                        </div>
                      </div>
                    ))}
                    {visibleKunden.length > 12 && (
                      <div className="text-[10px] text-slate-400 text-center py-1">
                        + {visibleKunden.length - 12} weitere
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                sidebar
              )}
            </div>
          )}
        </div>

        {/* Inline zoomed list (when no sidebar is provided) */}
        {!sidebar && zoomedState && visibleKunden.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto">
              {visibleKunden.slice(0, 10).map((k) => (
                <div
                  key={k.id}
                  onClick={() => onKundeClick?.(k.id)}
                  className="flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-slate-50 cursor-pointer transition-colors min-w-0"
                >
                  <Avatar name={k.name} foto={getKundeFoto(k.id)} size={22} />
                  <div className="text-[11px] font-medium text-slate-700 truncate">{k.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <MapPin size={20} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
                <div>
                  <h3 className="font-semibold text-slate-800">{title}</h3>
                  <div className="text-xs text-slate-500">
                    {geocoded.length} Kunden · {Object.keys(clusters).length} Bundesländer
                    {zoomedState && ` · Fokus: ${zoomedState}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {zoomedState && (
                  <button
                    onClick={handleResetZoom}
                    className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <ChevronLeft size={14} />
                    <span>Zurück zur Übersicht</span>
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  aria-label="Schließen"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 min-h-0">
              <div className="w-full h-full flex items-center justify-center">
                <div style={{ aspectRatio: `${SVG_W}/${SVG_H}`, height: '100%', maxWidth: '100%' }}>
                  <MapRenderer
                    paths={paths}
                    project={project}
                    clusters={clusters}
                    getStateFill={getStateFill}
                    zoomedState={zoomedState}
                    onZoomState={handleZoomState}
                    visibleKunden={visibleKunden}
                    onKundeClick={(id) => {
                      setIsModalOpen(false);
                      onKundeClick?.(id);
                    }}
                    svgW={SVG_W}
                    svgH={SVG_H}
                    markerScale={1.4}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Compact portrait variant for the KPI row ─────────────────── */
export function KundenKarteCompact({ kunden = [], onKundeClick, title = 'Kundenkarte', totalCount }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Scale the displayed counts so the sum matches the real KPI-reported customer
  // total (e.g. 248) rather than the demo sample size (e.g. 40). Each state's
  // displayed count is proportionally scaled; any rounding delta is absorbed by
  // the state with the most customers so the total exactly matches totalCount.
  const displayCounts = useMemo(() => {
    const counts = {};
    const base = Object.fromEntries(
      Object.entries(clusters).map(([s, arr]) => [s, arr.length])
    );
    const sampleTotal = Object.values(base).reduce((s, v) => s + v, 0);
    if (!totalCount || !sampleTotal || totalCount === sampleTotal) {
      return base;
    }
    const factor = totalCount / sampleTotal;
    let running = 0;
    const entries = Object.entries(base).sort((a, b) => b[1] - a[1]);
    entries.forEach(([state, v], idx) => {
      if (idx === entries.length - 1) {
        counts[state] = Math.max(1, totalCount - running);
      } else {
        const scaled = Math.max(1, Math.round(v * factor));
        counts[state] = scaled;
        running += scaled;
      }
    });
    return counts;
  }, [clusters, totalCount]);

  const displayTotal = useMemo(
    () => Object.values(displayCounts).reduce((s, v) => s + v, 0),
    [displayCounts]
  );

  const { paths, project } = useMemo(() => {
    const proj = buildProjection(geojson.features, SVG_W, SVG_H);
    const ps = geojson.features.map((f) => ({
      name: f.properties.name,
      d: featureToPath(f, proj),
    }));
    return { paths: ps, project: proj };
  }, []);

  const maxCount = Math.max(1, ...Object.values(displayCounts));
  const getStateFill = (count) => {
    if (count === 0) return '#f1f5f9';
    const intensity = count / maxCount;
    if (intensity >= 0.66) return 'var(--mode-primary, #004d26)';
    if (intensity >= 0.33) return 'var(--mode-primary-light, #00843d)';
    return 'rgba(122, 182, 72, 0.45)';
  };

  return (
    <>
      <div
        className="relative rounded-xl border p-3 cursor-pointer overflow-hidden card-base card-hover flex flex-col"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--mode-primary-light) 14%, #ffffff) 0%, color-mix(in srgb, var(--mode-primary-light) 6%, #ffffff) 100%)',
          borderColor: 'color-mix(in srgb, var(--mode-primary-light) 22%, #e2e8f0)',
          boxShadow: '0 6px 16px -6px rgba(15, 23, 42, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-100 kpi-icon-box shrink-0">
            <MapPin size={13} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
          </div>
          <span className="text-[11px] font-medium text-slate-500 truncate">{title}</span>
          <Maximize2 size={11} className="text-slate-400 ml-auto shrink-0" />
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-full block"
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: 'none' }}
          >
            {paths.map(({ name, d }) => {
              const count = displayCounts[name] || 0;
              return (
                <path
                  key={name}
                  d={d}
                  fill={count === 0 ? '#f1f5f9' : getStateFill(count)}
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                />
              );
            })}
            {Object.entries(clusters).map(([state]) => {
              const centroid = STATE_CENTROIDS[state];
              if (!centroid) return null;
              const [cx, cy] = project(centroid.lng, centroid.lat);
              const count = displayCounts[state] || 0;
              const radius = 8 + Math.sqrt(count) * 1.1;
              return (
                <g key={state}>
                  <circle cx={cx} cy={cy} r={radius + 2} fill="var(--mode-primary, #004d26)" opacity={0.2} />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="var(--mode-primary, #004d26)"
                    stroke="white"
                    strokeWidth={1.5}
                  />
                  <text
                    x={cx}
                    y={cy + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="800"
                    fill="white"
                    fontFamily="'DM Sans', sans-serif"
                  >
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Modal – Leaflet with real OpenStreetMap tiles so the user can
          zoom down to street/city level. The on-map tooltips are native
          Leaflet tooltips (constant pixel size) so they don't blow up
          like the previous foreignObject implementation. */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[88vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <MapPin size={20} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
                <div>
                  <h3 className="font-semibold text-slate-800">{title}</h3>
                  <div className="text-xs text-slate-500">
                    {displayTotal} Kunden · {Object.keys(clusters).length} Bundesländer
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Schließen"
              >
                <X size={18} />
              </button>
            </div>

            {/* Leaflet map – real streets, scrollwheel zoom, drag, etc. */}
            <div className="flex-1 min-h-0 relative">
              <LeafletMap
                geocoded={kunden.map((k, i) => geocodeKundeLeaflet(k, i)).filter(Boolean)}
                onKundeClick={(id) => {
                  setIsModalOpen(false);
                  onKundeClick?.(id);
                }}
              />
            </div>

            {/* Legend */}
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} /><span>Termin / kürzlich kontaktiert</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#84cc16' }} /><span>Wenige Wochen</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#a3a3a3' }} /><span>Länger her</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#6b7280' }} /><span>Termin überfällig</span></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
