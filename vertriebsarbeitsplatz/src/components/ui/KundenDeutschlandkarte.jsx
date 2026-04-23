import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ArrowLeft, Search } from 'lucide-react';
import bundeslaenderGeo from '../../pages/cockpit/bundeslaender.geo.json';
import { geocodeKundeLeaflet } from './KundenKarteLeaflet';
import { getKundeFoto } from '../../utils/kundenFotos';

// Zwei Ebenen:
//   Ebene 1 ("deutschland"): Reine SVG-Choropleth (1:1 VSTCockpit-Stil).
//     Nur Deutschland, keine Labels, keine Nachbarlaender, keine Strassen.
//     Bundeslaender eingefaerbt nach Kundenzahl. Klick waehlt Bundesland.
//   Ebene 2 ("bundesland"): Leaflet + CARTO-Light-Tiles mit Straessen,
//     Staedten, Labels. Kunden als aggregierte Stadt-Kreise + einzelne Pins.
//
// Rechts immer eine Kunden-Sidebar mit Foto, die mit Map via Hover verlinkt.

/* ────── SVG helpers (Mercator-Projektion auf Viewport) ────── */
const DEG2RAD = Math.PI / 180;
function mercator(lon, lat) {
  return [lon * DEG2RAD, Math.log(Math.tan(Math.PI / 4 + (lat * DEG2RAD) / 2))];
}
function buildProjection(features, width, height, padding = 12) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      const [px, py] = mercator(coords[0], coords[1]);
      if (px < minX) minX = px; if (px > maxX) maxX = px;
      if (py < minY) minY = py; if (py > maxY) maxY = py;
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

// Schwerpunkt (visuelles Zentrum) eines Features in SVG-Koordinaten.
// Fuer Polygone nehmen wir die Mitte der Bounding-Box des groessten Rings,
// fuer MultiPolygons die Mitte der grossen Polygon-Komponente. Das legt
// das Zahlen-Bubble stabil in die Flaeche der Landflaeche.
function featureCenterSvg(feature, project) {
  const ringsToBBox = (rings) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rings.forEach((pt) => {
      const [x, y] = project(pt[0], pt[1]);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    });
    return { minX, maxX, minY, maxY, area: (maxX - minX) * (maxY - minY) };
  };
  const { type, coordinates } = feature.geometry;
  let best = null;
  if (type === 'Polygon') {
    const outer = coordinates[0];
    best = ringsToBBox(outer);
  } else if (type === 'MultiPolygon') {
    for (const poly of coordinates) {
      const bbox = ringsToBBox(poly[0]);
      if (!best || bbox.area > best.area) best = bbox;
    }
  }
  if (!best) return [0, 0];
  return [(best.minX + best.maxX) / 2, (best.minY + best.maxY) / 2];
}

// Slate → Indigo Skala fuer die Choropleth (abhaengig vom relativen Anteil).
function fillColorForCount(count, maxCount) {
  if (!count) return '#e2e8f0';
  const r = Math.max(0, Math.min(1, count / Math.max(1, maxCount)));
  if (r >= 0.85) return '#4338ca';
  if (r >= 0.65) return '#6366f1';
  if (r >= 0.45) return '#818cf8';
  if (r >= 0.25) return '#a5b4fc';
  if (r >= 0.1)  return '#c7d2fe';
  return '#e0e7ff';
}

function groupByCity(kunden) {
  const map = new Map();
  for (const k of kunden) {
    const key = k.city;
    if (!map.has(key)) {
      map.set(key, { city: key, lat: k.lat, lng: k.lng, bundesland: k.bundesland, kunden: [] });
    }
    map.get(key).kunden.push(k);
  }
  return Array.from(map.values());
}

/* ────── Level 1: SVG-Choropleth (VSTCockpit-Stil) ────── */
function DeutschlandSvgChoropleth({
  bundeslandCounts,
  maxCount,
  hoveredBundesland,
  onHover,
  onSelect,
}) {
  const SVG_W = 900;
  const SVG_H = 900;
  const { paths, centers } = useMemo(() => {
    const proj = buildProjection(bundeslaenderGeo.features, SVG_W, SVG_H, 20);
    const ps = bundeslaenderGeo.features.map((f) => ({
      name: f.properties.name,
      d: featureToPath(f, proj),
    }));
    const cs = bundeslaenderGeo.features.map((f) => ({
      name: f.properties.name,
      c: featureCenterSvg(f, proj),
    }));
    return { paths: ps, centers: cs };
  }, []);

  // Handlupe: Radius der Zahlen-Bubble proportional zum Maximum.
  const bubbleRadius = (count) => {
    if (!count) return 0;
    const r = Math.max(0, Math.min(1, count / Math.max(1, maxCount)));
    return 20 + r * 22; // 20 … 42 px
  };

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      <defs>
        <filter id="kk-bubble-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.28" />
        </filter>
      </defs>

      {paths.map(({ name, d }) => {
        const cnt = bundeslandCounts[name] || 0;
        const isHovered = hoveredBundesland === name;
        return (
          <path
            key={name}
            d={d}
            fill={fillColorForCount(cnt, maxCount)}
            stroke={isHovered ? '#1e293b' : '#ffffff'}
            strokeWidth={isHovered ? 2.5 : 1.5}
            className="cursor-pointer transition-all duration-150"
            style={{ opacity: isHovered ? 1 : 0.92 }}
            onMouseEnter={() => onHover(name)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(name)}
          >
            <title>{`${name} — ${cnt} Kunde${cnt === 1 ? '' : 'n'}`}</title>
          </path>
        );
      })}

      {/* Moderne Zahlen-Bubbles je Bundesland */}
      {centers.map(({ name, c }) => {
        const cnt = bundeslandCounts[name] || 0;
        if (!cnt) return null;
        const [cx, cy] = c;
        const r = bubbleRadius(cnt);
        const isHovered = hoveredBundesland === name;
        return (
          <g
            key={`bubble-${name}`}
            className="cursor-pointer"
            onMouseEnter={() => onHover(name)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(name)}
            style={{ pointerEvents: 'auto' }}
          >
            {/* Weisser Ring als subtile Trennung zur Flaeche */}
            <circle cx={cx} cy={cy} r={r + 2} fill="#ffffff" opacity={0.55} />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="#0f172a"
              stroke={isHovered ? '#6366f1' : '#1e293b'}
              strokeWidth={isHovered ? 3 : 1.5}
              filter="url(#kk-bubble-shadow)"
              style={{ transition: 'all 150ms' }}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontFamily="DM Sans, sans-serif"
              fontWeight="800"
              fontSize={cnt >= 100 ? r * 0.62 : r * 0.78}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {cnt}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ────── Hauptkomponente ────── */
export default function KundenDeutschlandkarte({ kunden = [], onKundeClick, title = 'Kundenkarte Deutschland' }) {
  const [selectedBundesland, setSelectedBundesland] = useState(null);
  const [hoveredBundesland, setHoveredBundesland] = useState(null);
  const [hoveredKundeId, setHoveredKundeId] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [listSearch, setListSearch] = useState('');

  const leafletContainerRef = useRef(null);
  const mapRef = useRef(null);
  const pinsLayerRef = useRef(null);
  const cityMarkersRef = useRef(new Map());
  const kundenMarkersRef = useRef(new Map());

  const geocoded = useMemo(
    () => kunden.map((k, i) => geocodeKundeLeaflet(k, i, { scatter: true })).filter(Boolean),
    [kunden]
  );

  const bundeslandCounts = useMemo(() => {
    const c = {};
    for (const k of geocoded) c[k.bundesland] = (c[k.bundesland] || 0) + 1;
    return c;
  }, [geocoded]);
  const maxCount = useMemo(() => Math.max(0, ...Object.values(bundeslandCounts)), [bundeslandCounts]);

  const visibleKunden = useMemo(() => {
    if (selectedBundesland) return geocoded.filter(k => k.bundesland === selectedBundesland);
    return geocoded;
  }, [geocoded, selectedBundesland]);

  const filteredListKunden = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return visibleKunden;
    return visibleKunden.filter(k =>
      (k.name || '').toLowerCase().includes(q) ||
      (k.city || '').toLowerCase().includes(q)
    );
  }, [visibleKunden, listSearch]);

  // Leaflet-Map nur auf Bundesland-Ebene initialisieren/entfernen.
  useEffect(() => {
    if (!selectedBundesland) {
      // Karte abbauen, falls eine existiert.
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        pinsLayerRef.current = null;
        cityMarkersRef.current.clear();
        kundenMarkersRef.current.clear();
      }
      return;
    }
    if (!leafletContainerRef.current) return;
    if (mapRef.current) return; // schon initialisiert

    const map = L.map(leafletContainerRef.current, {
      center: [51.2, 10.4],
      zoom: 7,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '© OpenStreetMap · © CARTO',
    }).addTo(map);
    mapRef.current = map;

    // Bounds der Ziel-Bundesland-Feature berechnen und hinfliegen.
    const feature = bundeslaenderGeo.features.find(f => f.properties.name === selectedBundesland);
    if (feature) {
      const layer = L.geoJSON(feature);
      const bounds = layer.getBounds();
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [selectedBundesland]);

  // City-Aggregat-Marker + einzelne Kunden-Pins im aktuellen Bundesland.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedBundesland) return;
    if (pinsLayerRef.current) { pinsLayerRef.current.remove(); pinsLayerRef.current = null; }
    cityMarkersRef.current.clear();
    kundenMarkersRef.current.clear();

    const layerGroup = L.layerGroup();
    const cityGroups = groupByCity(geocoded.filter(k => k.bundesland === selectedBundesland));

    for (const g of cityGroups) {
      const radius = 8 + Math.min(18, Math.sqrt(g.kunden.length) * 5);
      const cityMarker = L.circleMarker([g.lat, g.lng], {
        radius,
        color: '#4338ca',
        weight: 2,
        fillColor: '#6366f1',
        fillOpacity: 0.55,
      });
      cityMarker.bindTooltip(
        `<div style="font-family:'DM Sans',sans-serif;"><strong>${g.city}</strong><br/>${g.kunden.length} Kunde${g.kunden.length === 1 ? '' : 'n'}</div>`,
        { direction: 'top', offset: [0, -4] }
      );
      cityMarker.on('mouseover', () => setHoveredCity(g.city));
      cityMarker.on('mouseout', () => setHoveredCity(null));
      cityMarker.on('click', () => { map.flyTo([g.lat, g.lng], 12, { duration: 0.6 }); });
      cityMarker.addTo(layerGroup);
      cityMarkersRef.current.set(g.city, cityMarker);

      for (const k of g.kunden) {
        const pin = L.circleMarker([k.lat, k.lng], {
          radius: 5,
          color: '#ffffff',
          weight: 1.5,
          fillColor: k.status.color,
          fillOpacity: 0.95,
        });
        pin.bindTooltip(
          `<div style="font-family:'DM Sans',sans-serif;">
            <div style="font-weight:700;color:#0f172a;">${k.name}</div>
            <div style="color:#64748b;">${k.city}</div>
            <div style="color:${k.status.color};font-weight:600;margin-top:2px;">${k.status.label}</div>
          </div>`,
          { direction: 'top', offset: [0, -4] }
        );
        pin.on('mouseover', () => setHoveredKundeId(k.id));
        pin.on('mouseout', () => setHoveredKundeId(null));
        pin.on('click', () => onKundeClick?.(k.id));
        pin.addTo(layerGroup);
        kundenMarkersRef.current.set(k.id, pin);
      }
    }

    layerGroup.addTo(map);
    pinsLayerRef.current = layerGroup;
  }, [selectedBundesland, geocoded, onKundeClick]);

  useEffect(() => {
    for (const [id, marker] of kundenMarkersRef.current.entries()) {
      if (id === hoveredKundeId) {
        marker.setStyle({ radius: 9, weight: 3, color: '#4338ca', fillOpacity: 1 });
        marker.bringToFront();
      } else {
        marker.setStyle({ radius: 5, weight: 1.5, color: '#ffffff', fillOpacity: 0.95 });
      }
    }
  }, [hoveredKundeId]);

  useEffect(() => {
    for (const [city, marker] of cityMarkersRef.current.entries()) {
      if (city === hoveredCity) {
        marker.setStyle({ weight: 3, color: '#1e293b', fillOpacity: 0.8 });
      } else {
        marker.setStyle({ weight: 2, color: '#4338ca', fillOpacity: 0.55 });
      }
    }
  }, [hoveredCity]);

  const backToDeutschland = () => setSelectedBundesland(null);

  const hoveredBlCount = hoveredBundesland ? (bundeslandCounts[hoveredBundesland] || 0) : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          {selectedBundesland && (
            <button
              onClick={backToDeutschland}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 transition-colors"
            >
              <ArrowLeft size={12} /> Deutschland
            </button>
          )}
          <MapPin size={18} className="text-indigo-600" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">
            {title}
            {selectedBundesland && <span className="ml-2 text-slate-500 font-normal text-sm">· {selectedBundesland}</span>}
          </h3>
        </div>
        <div className="text-xs text-slate-500">
          {visibleKunden.length} Kunden
          {selectedBundesland ? ` in ${selectedBundesland}` : ' bundesweit'}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-0" style={{ height: 620 }}>
        {/* Linke Seite: Map (SVG Level 1 oder Leaflet Level 2) */}
        <div className="relative bg-slate-50 min-h-0">
          {selectedBundesland ? (
            <div ref={leafletContainerRef} className="absolute inset-0" />
          ) : (
            <>
              <DeutschlandSvgChoropleth
                bundeslandCounts={bundeslandCounts}
                maxCount={maxCount}
                hoveredBundesland={hoveredBundesland}
                onHover={setHoveredBundesland}
                onSelect={setSelectedBundesland}
              />
              {/* Hover-Tooltip unten links */}
              {hoveredBundesland && (
                <div className="absolute left-4 bottom-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg px-3 py-2 pointer-events-none">
                  <div className="text-xs font-bold text-slate-800">{hoveredBundesland}</div>
                  <div className="text-[11px] text-slate-500">
                    {hoveredBlCount} Kunde{hoveredBlCount === 1 ? '' : 'n'}
                  </div>
                </div>
              )}
              {/* Legende unten rechts */}
              <div className="absolute right-4 bottom-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] text-slate-500">
                <span>Wenige</span>
                <div className="flex gap-0.5">
                  {['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4338ca'].map((c) => (
                    <div key={c} className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span>Viele</span>
              </div>
            </>
          )}
        </div>

        {/* Rechts: Kundenliste */}
        <div className="flex flex-col border-l border-slate-200 bg-white min-h-0">
          <div className="p-3 border-b border-slate-200 shrink-0">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Kunde, Stadt…"
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
              />
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {selectedBundesland ? `Kunden in ${selectedBundesland}` : 'Alle Kunden'}
              <span className="ml-1 text-slate-400 normal-case">· {filteredListKunden.length}</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {filteredListKunden.length === 0 ? (
              <div className="p-4 text-xs text-slate-400 italic text-center">
                Keine Kunden in dieser Auswahl.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredListKunden.map((k) => {
                  const isHovered = hoveredKundeId === k.id;
                  const foto = getKundeFoto(k.id);
                  const initials = (k.name || '').split(' ').map(n => n[0]).join('').slice(0, 2);
                  return (
                    <li
                      key={k.id}
                      className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${isHovered ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                      onMouseEnter={() => setHoveredKundeId(k.id)}
                      onMouseLeave={() => setHoveredKundeId(null)}
                      onClick={() => onKundeClick?.(k.id)}
                    >
                      {foto ? (
                        <img
                          src={foto}
                          alt={k.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: k.status.color }}
                        >
                          {initials || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">{k.name}</div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: k.status.color }} />
                          {k.city}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
