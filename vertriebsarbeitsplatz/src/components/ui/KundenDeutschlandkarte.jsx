import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, ArrowLeft, Search, Maximize2, X, Users, TrendingUp } from 'lucide-react';
import bundeslaenderGeo from '../../pages/cockpit/bundeslaender.geo.json';
import { geocodeKundeLeaflet } from './KundenKarteLeaflet';
import { getKundeFoto } from '../../utils/kundenFotos';

// Provider-Konfiguration. User kann zwischen MapTiler (Vector) und Mapbox
// (Raster-Fallback via Static-Tiles-API) umschalten.
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || '';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
function buildMapStyle(provider) {
  if (provider === 'mapbox' && MAPBOX_TOKEN) {
    return {
      version: 8,
      sources: {
        'mbx': {
          type: 'raster',
          tiles: [`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`],
          tileSize: 256,
          attribution: '© Mapbox · © OpenStreetMap',
        },
      },
      layers: [{ id: 'mbx', type: 'raster', source: 'mbx' }],
    };
  }
  if (provider === 'osm') {
    return {
      version: 8,
      sources: {
        'osm': {
          type: 'raster',
          // OSM.org empfiehlt inzwischen den Single-Host (HTTP/2).
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          maxzoom: 19,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
    };
  }
  if (provider === 'maptiler' && MAPTILER_KEY) {
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
  }
  // Fallback: OSM ohne Key
  return buildMapStyle('osm');
}

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

// Blau-Skala passend zu den KPI-Charts (Tailwind blue-100 … blue-700).
function fillColorForCount(count, maxCount) {
  if (!count) return '#e2e8f0';
  const r = Math.max(0, Math.min(1, count / Math.max(1, maxCount)));
  if (r >= 0.85) return '#1e40af'; // blue-800
  if (r >= 0.65) return '#2563eb'; // blue-600
  if (r >= 0.45) return '#3b82f6'; // blue-500
  if (r >= 0.25) return '#60a5fa'; // blue-400
  if (r >= 0.1)  return '#93c5fd'; // blue-300
  return '#dbeafe';                // blue-100
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
  showBubbles = true,
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
      {showBubbles && centers.map(({ name, c }) => {
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
              fill="#1e3a8a"
              stroke={isHovered ? '#3b82f6' : '#1e40af'}
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

/* ────── Synthetische "Ghost"-Kunden, um totalCount auf der Karte
    sauber zu verteilen (echte Demodaten sind nur ~12, Bank meldet aber
    248 im KPI). Ghosts bekommen einen deterministischen deutschen Namen
    und werden per scatterCityForKunde auf die Städte gestreut. ────── */
const GHOST_FIRST = ['Anna','Bernd','Carla','Dieter','Elena','Felix','Gabi','Hans','Iris','Jan','Katrin','Lars','Mila','Nils','Olivia','Paul','Quirin','Rita','Stefan','Tina','Uwe','Vera','Wolf','Xenia','Yvonne','Zoe','Lena','Max','Julia','Tom','Sophie','Niklas','Emilia','Leon','Mia','Lukas','Hannah','Finn','Lea','Ben','Clara','Jonas','Alina','David','Laura','Luca','Nina','Tim','Pia','Sebastian'];
const GHOST_LAST = ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Schäfer','Koch','Bauer','Richter','Klein','Wolf','Neumann','Schwarz','Zimmermann','Braun','Krüger','Hofmann','Hartmann','Lange','Schmitt','Werner','Schmitz','Krause','Meier','Lehmann','Walter','Schulze','Fuchs','Günther','Peters','Jung','Hahn','Vogel','Friedrich','Keller'];
function ghostHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function makeGhost(i) {
  const id = `ghost-${i}`;
  const h = ghostHash(id);
  const fn = GHOST_FIRST[h % GHOST_FIRST.length];
  const ln = GHOST_LAST[(h >>> 5) % GHOST_LAST.length];
  // Deterministischer "letzter Kontakt": 0–360 Tage zurück, manche (20%) haben
  // noch einen anstehenden Termin, damit die Farbstreuung nicht komplett grau ist.
  const daysBack = h % 360;
  const now = new Date();
  const last = new Date(now.getTime() - daysBack * 86400000);
  const hasUpcoming = (h % 100) < 20;
  const upcoming = hasUpcoming ? new Date(now.getTime() + ((h % 40) + 1) * 86400000) : null;
  return {
    id,
    name: `${fn} ${ln}`,
    kommunikation: [{ datum: last.toISOString() }],
    termine: upcoming ? [{ datum: upcoming.toISOString() }] : [],
  };
}

/* ────── Hauptkomponente ────── */
export default function KundenDeutschlandkarte({ kunden = [], totalCount, onKundeClick, title = 'Kundenkarte Deutschland' }) {
  const [selectedBundesland, setSelectedBundesland] = useState(null);
  const [hoveredBundesland, setHoveredBundesland] = useState(null);
  const [hoveredKundeId, setHoveredKundeId] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [listSearch, setListSearch] = useState('');

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const cityMarkersRef = useRef(new Map()); // city → { marker, el }
  const kundenMarkersRef = useRef(new Map()); // kundeId → { marker, el }

  // Provider-Switcher. Default: maptiler. User kann via Toggle oben rechts
  // umschalten (falls entsprechender Key/Token in .env vorhanden).
  // Default auf OSM, weil MapTiler/Mapbox eine Origin-Allowlist im Provider-
  // Dashboard brauchen; OSM funktioniert immer. User kann live umschalten.
  const [mapProvider, setMapProvider] = useState('osm');

  // Masken-GeoJSON fuer MapLibre: grosse Box ueber Europa mit Loechern
  // an der Stelle Deutschlands bzw. des selektierten Bundeslands.
  // GeoJSON/MapLibre erwartet: Outer-Ring counter-clockwise, Holes
  // clockwise. Die Bundeslaender im geo.json sind CCW gespeichert, also
  // werden sie hier fuer die Hole-Rolle gespiegelt.
  const maskGeoJSON = useMemo(() => {
    const outer = [[-25, 30], [45, 30], [45, 72], [-25, 72], [-25, 30]];
    const holes = [];
    const features = selectedBundesland
      ? bundeslaenderGeo.features.filter(f => f.properties.name === selectedBundesland)
      : bundeslaenderGeo.features;
    // Die Bundeslaender im geo.json sind bereits CW gespeichert (shoelace
    // test NRW => +8.85, also CW). Fuer Holes braucht MapLibre genau das,
    // also direkt uebernehmen ohne reverse.
    for (const feature of features) {
      const { type, coordinates } = feature.geometry;
      if (type === 'Polygon') holes.push(coordinates[0]);
      else if (type === 'MultiPolygon') for (const poly of coordinates) holes.push(poly[0]);
    }
    return {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [outer, ...holes] },
    };
  }, [selectedBundesland]);

  // Wenn totalCount > kunden.length, fuellen wir mit synthetischen Ghost-
  // Kunden auf, damit die Choropleth und die Markerverteilung der tatsaech-
  // lichen KPI-Zahl entspricht (Bank: 248, Demo: nur ~12).
  const paddedKunden = useMemo(() => {
    if (!totalCount || totalCount <= kunden.length) return kunden;
    const extras = [];
    for (let i = kunden.length; i < totalCount; i++) extras.push(makeGhost(i));
    return [...kunden, ...extras];
  }, [kunden, totalCount]);

  const geocoded = useMemo(
    () => paddedKunden.map((k, i) => geocodeKundeLeaflet(k, i, { scatter: true })).filter(Boolean),
    [paddedKunden]
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

  // Map (MapLibre GL) initialisieren sobald ein Bundesland ausgewaehlt ist.
  // Reagiert auf Provider-Wechsel: Karte wird abgerissen und mit neuem
  // Style neu erzeugt.
  useEffect(() => {
    if (!selectedBundesland) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        cityMarkersRef.current.clear();
        kundenMarkersRef.current.clear();
      }
      return;
    }
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: buildMapStyle(mapProvider),
      center: [10.4, 51.2],
      zoom: 5.5,
      attributionControl: true,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    // Modal/Container-Resize-Bug in MapLibre: nach dem Mount einmal explizit
    // resize + ResizeObserver fuer spaetere Layout-Aenderungen.
    const triggerResize = () => { try { map.resize(); } catch {} };
    requestAnimationFrame(triggerResize);
    setTimeout(triggerResize, 120);
    const resizeObs = new ResizeObserver(() => triggerResize());
    if (mapContainerRef.current) resizeObs.observe(mapContainerRef.current);

    const onStyleLoad = () => {
      if (!map.getSource('de-mask')) {
        map.addSource('de-mask', { type: 'geojson', data: maskGeoJSON });
        map.addLayer({
          id: 'de-mask-fill',
          type: 'fill',
          source: 'de-mask',
          paint: { 'fill-color': '#ffffff', 'fill-opacity': 1 },
        });
      }
      if (!map.getSource('de-outline')) {
        const outlineData = selectedBundesland
          ? {
              type: 'FeatureCollection',
              features: bundeslaenderGeo.features.filter(f => f.properties.name === selectedBundesland),
            }
          : bundeslaenderGeo;
        map.addSource('de-outline', { type: 'geojson', data: outlineData });
        map.addLayer({
          id: 'de-outline-line',
          type: 'line',
          source: 'de-outline',
          paint: { 'line-color': '#1e40af', 'line-width': 1.5, 'line-opacity': 0.9 },
        });
      }
    };
    map.on('load', onStyleLoad);
    // Bei Style-Wechsel (setStyle) wird 'load' nicht nochmal gefeuert —
    // dann greift 'styledata'. Im aktuellen Pfad wird aber immer die Karte
    // komplett neu gebaut, deshalb reicht 'load'.

    // Auf das gewaehlte Bundesland fliegen und MaxBounds setzen, damit
    // der User nicht ins maskierte Ausland pannen kann.
    const feature = bundeslaenderGeo.features.find(f => f.properties.name === selectedBundesland);
    if (feature) {
      const bounds = new maplibregl.LngLatBounds();
      const walk = (c) => { if (typeof c[0] === 'number') bounds.extend(c); else c.forEach(walk); };
      walk(feature.geometry.coordinates);
      // etwas Spielraum um die Bundesland-Bounds:
      const pad = 0.8;
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const paddedBounds = [
        [sw.lng - pad, sw.lat - pad],
        [ne.lng + pad, ne.lat + pad],
      ];
      map.setMaxBounds(paddedBounds);
      map.once('load', () => map.fitBounds(bounds, { padding: 40, duration: 700 }));
    }

    return () => {
      try { resizeObs.disconnect(); } catch {}
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        cityMarkersRef.current.clear();
        kundenMarkersRef.current.clear();
      }
    };
  }, [selectedBundesland, mapProvider, maskGeoJSON]);

  // Marker (Custom-HTML via maplibregl.Marker) fuer City-Aggregate und
  // einzelne Kunden.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedBundesland) return;
    // Alte Marker entfernen
    for (const { marker } of cityMarkersRef.current.values()) marker.remove();
    for (const { marker } of kundenMarkersRef.current.values()) marker.remove();
    cityMarkersRef.current.clear();
    kundenMarkersRef.current.clear();

    const render = () => {
      const cityGroups = groupByCity(geocoded.filter(k => k.bundesland === selectedBundesland));
      for (const g of cityGroups) {
        const size = 28 + Math.min(36, Math.sqrt(g.kunden.length) * 6);
        const cityEl = document.createElement('div');
        cityEl.style.cssText =
          `width:${size}px;height:${size}px;border-radius:50%;` +
          `background:rgba(59,130,246,0.55);border:2px solid #1e40af;` +
          `display:flex;align-items:center;justify-content:center;` +
          `font-family:DM Sans,sans-serif;font-weight:700;font-size:${Math.round(size*0.38)}px;` +
          `color:#0f172a;cursor:pointer;transition:all 150ms;` +
          `box-shadow:0 4px 12px rgba(30,64,175,0.30);`;
        cityEl.textContent = g.kunden.length;
        cityEl.title = `${g.city} — ${g.kunden.length} Kunde${g.kunden.length===1?'':'n'}`;
        cityEl.addEventListener('mouseenter', () => setHoveredCity(g.city));
        cityEl.addEventListener('mouseleave', () => setHoveredCity(null));
        cityEl.addEventListener('click', () => map.flyTo({ center: [g.lng, g.lat], zoom: 11, duration: 600 }));
        const cityMarker = new maplibregl.Marker({ element: cityEl, anchor: 'center' })
          .setLngLat([g.lng, g.lat]).addTo(map);
        cityMarkersRef.current.set(g.city, { marker: cityMarker, el: cityEl });

        for (const k of g.kunden) {
          const pinEl = document.createElement('div');
          pinEl.style.cssText =
            `width:12px;height:12px;border-radius:50%;` +
            `background:${k.status.color};border:2px solid #fff;` +
            `cursor:pointer;transition:all 150ms;` +
            `box-shadow:0 1px 4px rgba(15,23,42,0.35);`;
          const fmtDE = (iso) => new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const kontakt = k.status.nextTerminDate
            ? `Termin ${fmtDE(k.status.nextTerminDate)}`
            : k.status.lastContactDate
              ? `Letzter Kontakt ${fmtDE(k.status.lastContactDate)}`
              : 'Noch kein Kontakt';
          pinEl.title = `${k.name} · ${k.city} · ${kontakt}`;
          pinEl.addEventListener('mouseenter', () => setHoveredKundeId(k.id));
          pinEl.addEventListener('mouseleave', () => setHoveredKundeId(null));
          pinEl.addEventListener('click', () => onKundeClick?.(k.id));
          const pinMarker = new maplibregl.Marker({ element: pinEl, anchor: 'center' })
            .setLngLat([k.lng, k.lat]).addTo(map);
          kundenMarkersRef.current.set(k.id, { marker: pinMarker, el: pinEl });
        }
      }
    };

    if (map.loaded()) render();
    else map.once('load', render);
  }, [selectedBundesland, geocoded, onKundeClick, mapProvider]);

  // Hover-Sync: DOM-Style der Marker aktualisieren.
  useEffect(() => {
    for (const [id, m] of kundenMarkersRef.current.entries()) {
      if (id === hoveredKundeId) {
        m.el.style.width = '18px';
        m.el.style.height = '18px';
        m.el.style.borderColor = '#1e40af';
        m.el.style.borderWidth = '3px';
        m.el.style.zIndex = '10';
      } else {
        m.el.style.width = '12px';
        m.el.style.height = '12px';
        m.el.style.borderColor = '#ffffff';
        m.el.style.borderWidth = '2px';
        m.el.style.zIndex = '1';
      }
    }
  }, [hoveredKundeId]);

  useEffect(() => {
    for (const [city, m] of cityMarkersRef.current.entries()) {
      if (city === hoveredCity) {
        m.el.style.borderColor = '#0f172a';
        m.el.style.borderWidth = '3px';
        m.el.style.background = 'rgba(59,130,246,0.75)';
      } else {
        m.el.style.borderColor = '#1e40af';
        m.el.style.borderWidth = '2px';
        m.el.style.background = 'rgba(59,130,246,0.55)';
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
          <MapPin size={18} className="text-blue-600" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">
            {title}
            {selectedBundesland && <span className="ml-2 text-slate-500 font-normal text-sm">· {selectedBundesland}</span>}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {selectedBundesland && (
            <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setMapProvider('osm')}
                className={`px-2 py-1 transition-colors ${mapProvider === 'osm' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                title="OpenStreetMap (keine Anmeldung)"
              >
                OSM
              </button>
              <button
                type="button"
                onClick={() => setMapProvider('maptiler')}
                disabled={!MAPTILER_KEY}
                className={`px-2 py-1 transition-colors ${mapProvider === 'maptiler' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'} disabled:opacity-40`}
                title="MapTiler Streets (Key in .env noetig, Origin-Allowlist im Dashboard setzen)"
              >
                MapTiler
              </button>
              <button
                type="button"
                onClick={() => setMapProvider('mapbox')}
                disabled={!MAPBOX_TOKEN}
                className={`px-2 py-1 transition-colors ${mapProvider === 'mapbox' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'} disabled:opacity-40`}
                title="Mapbox Light (Token in .env noetig, URL-Restrictions im Account setzen)"
              >
                Mapbox
              </button>
            </div>
          )}
          <div className="text-xs text-slate-500">
            {visibleKunden.length} Kunden
            {selectedBundesland ? ` in ${selectedBundesland}` : ' bundesweit'}
          </div>
        </div>
      </div>

      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: '1fr 320px', gridTemplateRows: '620px', height: 620 }}
      >
        {/* Linke Seite: Map (SVG Level 1 oder MapLibre Level 2) */}
        <div className="relative bg-slate-50 h-full min-h-0 overflow-hidden">
          {selectedBundesland ? (
            <div ref={mapContainerRef} className="w-full h-full" />
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
                  {['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1e40af'].map((c) => (
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
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
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
                  // Exaktes Datum des letzten Kontakts / des nächsten Termins.
                  const nextTermin = k.status?.nextTerminDate ? new Date(k.status.nextTerminDate) : null;
                  const lastContact = k.status?.lastContactDate ? new Date(k.status.lastContactDate) : null;
                  const fmt = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const contactLabel = nextTermin
                    ? `Termin ${fmt(nextTermin)}`
                    : lastContact
                      ? `Letzter Kontakt ${fmt(lastContact)}`
                      : 'Noch kein Kontakt';
                  return (
                    <li
                      key={k.id}
                      className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${isHovered ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      onMouseEnter={() => setHoveredKundeId(k.id)}
                      onMouseLeave={() => setHoveredKundeId(null)}
                      onClick={() => onKundeClick?.(k.id)}
                    >
                      {foto ? (
                        <img
                          src={foto}
                          alt={k.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: k.status.color }}
                        >
                          {initials || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">{k.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{k.city}</div>
                        <div
                          className="text-[10px] truncate font-medium flex items-center gap-1 mt-0.5"
                          style={{ color: k.status.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: k.status.color }} />
                          {contactLabel}
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

/* ──────────────────────────────────────────────────────────────
   Kunden-KPI-Kachel mit integrierter Deutschlandkarte statt
   Sparkline. Matcht die Optik der uebrigen KPIBox-Kacheln
   (Icon oben links, Label, grosse Zahl, Trend-Pfeil oben rechts)
   und ersetzt den Sparkline-Chart durch die SVG-Choropleth.
   Klick oeffnet das volle Deutschlandkarten-Modal.
   ────────────────────────────────────────────────────────────── */
export function KundenDeutschlandkarteCompact({
  kunden = [],
  totalCount,
  onKundeClick,
  title = 'Kunden',
  trend,
}) {
  const [open, setOpen] = useState(false);

  const paddedKunden = useMemo(() => {
    if (!totalCount || totalCount <= kunden.length) return kunden;
    const extras = [];
    for (let i = kunden.length; i < totalCount; i++) extras.push(makeGhost(i));
    return [...kunden, ...extras];
  }, [kunden, totalCount]);
  const geocoded = useMemo(
    () => paddedKunden.map((k, i) => geocodeKundeLeaflet(k, i, { scatter: true })).filter(Boolean),
    [paddedKunden]
  );
  const bundeslandCounts = useMemo(() => {
    const c = {};
    for (const k of geocoded) c[k.bundesland] = (c[k.bundesland] || 0) + 1;
    return c;
  }, [geocoded]);
  const maxCount = useMemo(() => Math.max(0, ...Object.values(bundeslandCounts)), [bundeslandCounts]);
  return (
    <>
      <div
        className="relative rounded-xl border p-3 cursor-pointer overflow-hidden card-base card-hover h-full flex flex-col"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--mode-primary-light) 14%, #ffffff) 0%, color-mix(in srgb, var(--mode-primary-light) 6%, #ffffff) 100%)',
          borderColor: 'color-mix(in srgb, var(--mode-primary-light) 22%, #e2e8f0)',
          boxShadow: '0 6px 16px -6px rgba(15, 23, 42, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
        }}
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-100 kpi-icon-box shrink-0">
            <MapPin size={13} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
          </div>
          <span className="text-[11px] font-medium text-slate-500 truncate">{title}</span>
          <Maximize2 size={11} className="text-slate-400 ml-auto shrink-0" />
        </div>
        <div className="flex-1 min-h-0 rounded-md overflow-hidden pointer-events-none">
          <DeutschlandSvgChoropleth
            bundeslandCounts={bundeslandCounts}
            maxCount={maxCount}
            hoveredBundesland={null}
            onHover={() => {}}
            onSelect={() => {}}
            showBubbles={false}
          />
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-7xl h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/95 border border-slate-200 shadow-sm text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
              aria-label="Schließen"
            >
              <X size={18} />
            </button>
            <div className="flex-1 min-h-0 overflow-hidden">
              <KundenDeutschlandkarte
                kunden={kunden}
                totalCount={totalCount}
                onKundeClick={(id) => { setOpen(false); onKundeClick?.(id); }}
                title={title}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
