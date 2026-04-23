import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Maximize2, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Card from './Card';
import bundeslaenderGeo from '../../pages/cockpit/bundeslaender.geo.json';

/* ── City coordinates + Bundesland mapping ────────────────────── */
// Städte aus allen 16 Bundesländern. Wird auch als Pool für die Deutsch-
// land-weite Scatter-Verteilung genutzt, damit nicht alle Kunden im
// selben Ort sitzen.
export const CITY_COORDS = {
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

  // NRW (weitere Grossstädte)
  'Düsseldorf':           { lat: 51.22, lng: 6.78, bundesland: 'Nordrhein-Westfalen' },
  'Dortmund':             { lat: 51.51, lng: 7.47, bundesland: 'Nordrhein-Westfalen' },
  'Essen':                { lat: 51.45, lng: 7.01, bundesland: 'Nordrhein-Westfalen' },
  'Duisburg':             { lat: 51.43, lng: 6.76, bundesland: 'Nordrhein-Westfalen' },
  'Bochum':               { lat: 51.48, lng: 7.22, bundesland: 'Nordrhein-Westfalen' },
  'Aachen':               { lat: 50.78, lng: 6.08, bundesland: 'Nordrhein-Westfalen' },
  'Münster':              { lat: 51.96, lng: 7.63, bundesland: 'Nordrhein-Westfalen' },
  // Bayern
  'München':              { lat: 48.14, lng: 11.58, bundesland: 'Bayern' },
  'Nürnberg':             { lat: 49.45, lng: 11.08, bundesland: 'Bayern' },
  'Augsburg':             { lat: 48.37, lng: 10.90, bundesland: 'Bayern' },
  'Regensburg':           { lat: 49.02, lng: 12.10, bundesland: 'Bayern' },
  'Würzburg':             { lat: 49.79, lng: 9.93, bundesland: 'Bayern' },
  'Ingolstadt':           { lat: 48.77, lng: 11.42, bundesland: 'Bayern' },
  // Baden-Württemberg
  'Stuttgart':            { lat: 48.78, lng: 9.18, bundesland: 'Baden-Württemberg' },
  'Karlsruhe':            { lat: 49.01, lng: 8.40, bundesland: 'Baden-Württemberg' },
  'Mannheim':             { lat: 49.49, lng: 8.47, bundesland: 'Baden-Württemberg' },
  'Freiburg im Breisgau': { lat: 47.99, lng: 7.85, bundesland: 'Baden-Württemberg' },
  'Heidelberg':           { lat: 49.40, lng: 8.67, bundesland: 'Baden-Württemberg' },
  'Ulm':                  { lat: 48.40, lng: 9.99, bundesland: 'Baden-Württemberg' },
  // Hessen (weitere)
  'Darmstadt':            { lat: 49.87, lng: 8.65, bundesland: 'Hessen' },
  'Kassel':               { lat: 51.31, lng: 9.49, bundesland: 'Hessen' },
  'Fulda':                { lat: 50.55, lng: 9.68, bundesland: 'Hessen' },
  // Niedersachsen
  'Hannover':             { lat: 52.37, lng: 9.73, bundesland: 'Niedersachsen' },
  'Braunschweig':         { lat: 52.27, lng: 10.52, bundesland: 'Niedersachsen' },
  'Osnabrück':            { lat: 52.27, lng: 8.04, bundesland: 'Niedersachsen' },
  'Oldenburg':            { lat: 53.14, lng: 8.21, bundesland: 'Niedersachsen' },
  'Göttingen':            { lat: 51.54, lng: 9.93, bundesland: 'Niedersachsen' },
  // Rheinland-Pfalz
  'Mainz':                { lat: 50.00, lng: 8.27, bundesland: 'Rheinland-Pfalz' },
  'Koblenz':              { lat: 50.36, lng: 7.59, bundesland: 'Rheinland-Pfalz' },
  'Trier':                { lat: 49.76, lng: 6.64, bundesland: 'Rheinland-Pfalz' },
  'Ludwigshafen am Rhein':{ lat: 49.48, lng: 8.43, bundesland: 'Rheinland-Pfalz' },
  // Stadtstaaten
  'Berlin':               { lat: 52.52, lng: 13.40, bundesland: 'Berlin' },
  'Hamburg':              { lat: 53.55, lng: 9.99, bundesland: 'Hamburg' },
  'Bremen':               { lat: 53.08, lng: 8.80, bundesland: 'Bremen' },
  'Bremerhaven':          { lat: 53.54, lng: 8.58, bundesland: 'Bremen' },
  // Schleswig-Holstein
  'Kiel':                 { lat: 54.32, lng: 10.13, bundesland: 'Schleswig-Holstein' },
  'Lübeck':               { lat: 53.87, lng: 10.69, bundesland: 'Schleswig-Holstein' },
  'Flensburg':            { lat: 54.78, lng: 9.44, bundesland: 'Schleswig-Holstein' },
  // Mecklenburg-Vorpommern
  'Rostock':              { lat: 54.09, lng: 12.14, bundesland: 'Mecklenburg-Vorpommern' },
  'Schwerin':             { lat: 53.63, lng: 11.41, bundesland: 'Mecklenburg-Vorpommern' },
  'Greifswald':           { lat: 54.09, lng: 13.39, bundesland: 'Mecklenburg-Vorpommern' },
  // Brandenburg
  'Potsdam':              { lat: 52.40, lng: 13.06, bundesland: 'Brandenburg' },
  'Cottbus':              { lat: 51.76, lng: 14.33, bundesland: 'Brandenburg' },
  // Sachsen
  'Dresden':              { lat: 51.05, lng: 13.74, bundesland: 'Sachsen' },
  'Leipzig':              { lat: 51.34, lng: 12.37, bundesland: 'Sachsen' },
  'Chemnitz':             { lat: 50.83, lng: 12.92, bundesland: 'Sachsen' },
  // Sachsen-Anhalt
  'Magdeburg':            { lat: 52.13, lng: 11.63, bundesland: 'Sachsen-Anhalt' },
  'Halle (Saale)':        { lat: 51.48, lng: 11.97, bundesland: 'Sachsen-Anhalt' },
  // Thüringen
  'Erfurt':               { lat: 50.98, lng: 11.03, bundesland: 'Thüringen' },
  'Jena':                 { lat: 50.93, lng: 11.59, bundesland: 'Thüringen' },
  'Weimar':               { lat: 50.98, lng: 11.33, bundesland: 'Thüringen' },
  // Saarland
  'Saarbrücken':          { lat: 49.24, lng: 6.99, bundesland: 'Saarland' },
};

// Deterministischer Hash → Städte-Scatter. Jeder Kunde bekommt eine Stadt
// aus dem obigen Pool, gewichtet nach Grossstadt-Groesse (viele Kunden in
// Grossstädten, einzelne auf dem Land). Die Verteilung ist stabil, weil
// sie sich nur aus der Kunden-ID ableitet.
const SCATTER_POOL = [
  // Ballung in Grossstädten (mehrfach gelistet = groesseres Gewicht)
  'München','München','München',
  'Hamburg','Hamburg','Hamburg',
  'Berlin','Berlin','Berlin','Berlin',
  'Köln','Köln','Köln',
  'Frankfurt am Main','Frankfurt am Main',
  'Stuttgart','Stuttgart',
  'Düsseldorf','Düsseldorf',
  'Dortmund','Essen','Duisburg','Bochum',
  'Hannover','Hannover',
  'Nürnberg','Nürnberg',
  'Bremen',
  'Leipzig','Leipzig','Dresden',
  'Karlsruhe','Mannheim','Heidelberg','Freiburg im Breisgau','Ulm',
  'Augsburg','Regensburg','Würzburg','Ingolstadt',
  'Münster','Aachen','Bonn',
  'Braunschweig','Osnabrück','Oldenburg','Göttingen',
  'Mainz','Wiesbaden','Darmstadt','Kassel','Fulda',
  'Koblenz','Trier','Ludwigshafen am Rhein','Saarbrücken',
  'Kiel','Lübeck','Flensburg','Rostock','Schwerin',
  'Potsdam','Cottbus','Magdeburg','Halle (Saale)',
  'Erfurt','Jena','Weimar','Chemnitz','Bremerhaven',
];

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function scatterCityForKunde(kundeId) {
  if (!kundeId) return null;
  const h = hashString(String(kundeId));
  return SCATTER_POOL[h % SCATTER_POOL.length];
}

function extractCity(adresse) {
  if (!adresse || typeof adresse !== 'string') return null;
  const parts = adresse.split(',');
  if (parts.length < 2) return null;
  const cityPart = parts[parts.length - 1].trim();
  const match = cityPart.match(/^\d+\s+(.+)$/);
  return match ? match[1].trim() : cityPart;
}

/* ── Contact freshness → colour scale (green → gray) ──────────── */
function getContactStatus(kunde, referenceDate = new Date()) {
  // Find the most recent kommunikation entry with a date
  const komms = Array.isArray(kunde.kommunikation) ? kunde.kommunikation : [];
  let lastContact = null;
  for (const k of komms) {
    if (k?.datum) {
      const d = new Date(k.datum);
      if (!isNaN(d) && (!lastContact || d > lastContact)) lastContact = d;
    }
  }

  // Find upcoming termin
  const termine = Array.isArray(kunde.termine) ? kunde.termine : [];
  let nextTermin = null;
  for (const t of termine) {
    if (t?.datum) {
      const d = new Date(t.datum);
      if (!isNaN(d) && d >= referenceDate && (!nextTermin || d < nextTermin)) nextTermin = d;
    }
  }

  // Upcoming appointment → strong green
  if (nextTermin) {
    const daysAhead = (nextTermin - referenceDate) / 86400000;
    if (daysAhead <= 14) return { color: '#10b981', label: 'Termin bevorsteht', tone: 'vivid' };
    return { color: '#34d399', label: 'Termin geplant', tone: 'vivid' };
  }

  // Based on last contact recency
  if (!lastContact) return { color: '#9ca3af', label: 'Kein Kontakt', tone: 'gray' };
  const daysAgo = (referenceDate - lastContact) / 86400000;
  if (daysAgo <= 14) return { color: '#10b981', label: 'Kürzlich kontaktiert', tone: 'vivid' };
  if (daysAgo <= 45) return { color: '#84cc16', label: 'Vor wenigen Wochen', tone: 'fresh' };
  if (daysAgo <= 90) return { color: '#a3a3a3', label: 'Vor ~2 Monaten', tone: 'fading' };
  if (daysAgo <= 180) return { color: '#737373', label: 'Länger her', tone: 'fading' };
  return { color: '#525252', label: 'Sehr lange her', tone: 'gray' };
}

export function geocodeKundeLeaflet(kunde, index, options = {}) { return geocodeKunde(kunde, index, options); }
function geocodeKunde(kunde, index, options = {}) {
  // scatter=true: erzwingt die Deutschland-weite Verteilung via scatterCity,
  // damit die Gesamtkarte nicht einseitig auf eine Region kippt. Ansonsten
  // bleibt die reale Stadt aus `kunde.adresse` erhalten.
  const { scatter = false } = options;
  let city = null;
  let coord = null;
  if (!scatter) {
    city = extractCity(kunde.adresse);
    if (city) {
      coord = CITY_COORDS[city];
      if (!coord) {
        const found = Object.keys(CITY_COORDS).find((c) => c.startsWith(city) || city.startsWith(c));
        if (found) coord = CITY_COORDS[found];
      }
    }
  }
  if (!coord) {
    const fallbackCity = scatterCityForKunde(kunde.id);
    if (fallbackCity && CITY_COORDS[fallbackCity]) {
      city = fallbackCity;
      coord = CITY_COORDS[fallbackCity];
    }
  }
  if (!coord) return null;
  // Deterministic jitter so customers in the same city don't stack
  const jLat = Math.sin(index * 2.37 + 0.7) * 0.018;
  const jLng = Math.cos(index * 3.11 + 1.3) * 0.024;
  const status = getContactStatus(kunde);
  return {
    id: kunde.id,
    name: kunde.name,
    city,
    bundesland: coord.bundesland,
    lat: coord.lat + jLat,
    lng: coord.lng + jLng,
    status,
  };
}

/* ── Leaflet inner renderer ───────────────────────────────────── */
export function LeafletMap({ geocoded, onKundeClick, mini = false, initialCenter, initialZoom }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;
    // Defaults: zoom to show Germany or the customer cluster
    const center = initialCenter || (geocoded.length > 0
      ? [
          geocoded.reduce((s, k) => s + k.lat, 0) / geocoded.length,
          geocoded.reduce((s, k) => s + k.lng, 0) / geocoded.length,
        ]
      : [51.1, 10.4]);
    const zoom = initialZoom || (geocoded.length > 0 ? 9 : 6);

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: !mini,
      attributionControl: !mini,
      dragging: !mini,
      scrollWheelZoom: !mini,
      doubleClickZoom: !mini,
      touchZoom: !mini,
      boxZoom: !mini,
      keyboard: !mini,
      tap: !mini,
    });

    // CartoDB Positron tiles → minimalist, almost SVG-like map style.
    // Light background, subtle gray streets and municipal boundaries,
    // unobtrusive labels. Looks clean and matches the rest of the UI.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: mini ? '' : '© OpenStreetMap · © CARTO',
    }).addTo(map);

    // Customer markers
    const markers = geocoded.map((k) => {
      const size = mini ? 9 : 14;
      const icon = L.divIcon({
        className: 'kundenkarte-pin',
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${k.status.color};
          border:2px solid #fff;
          box-shadow:0 1px 4px rgba(0,0,0,0.35);
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([k.lat, k.lng], { icon }).addTo(map);
      if (!mini) {
        marker.bindTooltip(
          `<div style="font-family:'DM Sans',sans-serif;font-size:12px;">
             <div style="font-weight:700;color:#0f172a;">${k.name}</div>
             <div style="color:#64748b;">${k.city}</div>
             <div style="color:${k.status.color};font-weight:600;margin-top:2px;">${k.status.label}</div>
           </div>`,
          { direction: 'top', offset: [0, -6] }
        );
        marker.on('click', () => onKundeClick?.(k.id));
      }
      return marker;
    });

    markersRef.current = markers;
    mapRef.current = map;

    // Fit bounds if we have customers (only full map)
    if (!mini && geocoded.length > 1) {
      const bounds = L.latLngBounds(geocoded.map((k) => [k.lat, k.lng]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 11 });
    }

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, [geocoded, onKundeClick, mini, initialCenter, initialZoom]);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: mini ? 100 : 300, background: '#ffffff' }} />;
}

/* ── Full card with modal (inline large version) ──────────────── */
export default function KundenKarteLeaflet({
  kunden = [],
  onKundeClick,
  title = 'Kundenkarte',
  sidebar = null,
  sidebarTitle = null,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const geocoded = useMemo(
    () => kunden.map((k, i) => geocodeKunde(k, i)).filter(Boolean),
    [kunden]
  );

  const statusCounts = useMemo(() => {
    const counts = { vivid: 0, fresh: 0, fading: 0, gray: 0 };
    geocoded.forEach((k) => { counts[k.status.tone] = (counts[k.status.tone] || 0) + 1; });
    return counts;
  }, [geocoded]);

  return (
    <>
      <Card hover={false} className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={18} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800 truncate">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {geocoded.length} Kunden
            </span>
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

        <div className={sidebar ? 'grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 flex-1 min-h-0' : 'flex-1 min-h-0'}>
          <div className="relative rounded-lg overflow-hidden border border-slate-200" style={{ minHeight: 280 }}>
            <LeafletMap geocoded={geocoded} onKundeClick={onKundeClick} />
          </div>
          {sidebar && (
            <div className="min-w-0 flex flex-col">
              {sidebarTitle && (
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                  {sidebarTitle}
                </div>
              )}
              {sidebar}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} /><span>Termin / kürzlich</span></div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#84cc16' }} /><span>Wenige Wochen</span></div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#a3a3a3' }} /><span>Länger her</span></div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#525252' }} /><span>Kein Kontakt</span></div>
        </div>
      </Card>

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
                    {geocoded.length} Kunden · {statusCounts.vivid} aktiv · {statusCounts.gray + statusCounts.fading} inaktiv
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
            <div className="flex-1 min-h-0 relative">
              <LeafletMap
                geocoded={geocoded}
                onKundeClick={(id) => {
                  setIsModalOpen(false);
                  onKundeClick?.(id);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Compact variant for the KPI row ──────────────────────────── */
export function KundenKarteLeafletCompact({ kunden = [], onKundeClick, title = 'Kundenkarte' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const geocoded = useMemo(
    () => kunden.map((k, i) => geocodeKunde(k, i)).filter(Boolean),
    [kunden]
  );

  const statusCounts = useMemo(() => {
    const counts = { vivid: 0, fresh: 0, fading: 0, gray: 0 };
    geocoded.forEach((k) => { counts[k.status.tone] = (counts[k.status.tone] || 0) + 1; });
    return counts;
  }, [geocoded]);

  return (
    <>
      <div
        className="relative rounded-xl border p-4 cursor-pointer overflow-hidden card-base flex flex-col"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--mode-primary-light) 14%, #ffffff) 0%, color-mix(in srgb, var(--mode-primary-light) 6%, #ffffff) 100%)',
          borderColor: 'color-mix(in srgb, var(--mode-primary-light) 22%, #e2e8f0)',
          boxShadow: '0 6px 16px -6px rgba(15, 23, 42, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 kpi-icon-box shrink-0">
              <MapPin size={15} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
            </div>
            <span className="text-xs font-medium text-slate-500 truncate">{title}</span>
          </div>
          <Maximize2 size={12} className="text-slate-400" />
        </div>
        <div className="font-mono text-[1.5rem] leading-tight font-extrabold mb-1 truncate" style={{ color: '#0f172a' }}>
          {geocoded.length}
        </div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-2">
          Kunden regional
        </div>
        <div className="flex-1 min-h-[52px] rounded-md overflow-hidden border border-white/60 pointer-events-none">
          <LeafletMap geocoded={geocoded} mini />
        </div>
      </div>

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
                    {geocoded.length} Kunden · {statusCounts.vivid} aktiv · {statusCounts.gray + statusCounts.fading} inaktiv
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} /><span>Termin/kürzlich</span></div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#84cc16' }} /><span>Wochen</span></div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#a3a3a3' }} /><span>Länger</span></div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#525252' }} /><span>Kein Kontakt</span></div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  aria-label="Schließen"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <LeafletMap
                geocoded={geocoded}
                onKundeClick={(id) => {
                  setIsModalOpen(false);
                  onKundeClick?.(id);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
