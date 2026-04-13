import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Maximize2, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Card from './Card';
import bundeslaenderGeo from '../../pages/cockpit/bundeslaender.geo.json';

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

export function geocodeKundeLeaflet(kunde, index) { return geocodeKunde(kunde, index); }
function geocodeKunde(kunde, index) {
  const city = extractCity(kunde.adresse);
  if (!city) return null;
  let coord = CITY_COORDS[city];
  if (!coord) {
    const found = Object.keys(CITY_COORDS).find((c) => c.startsWith(city) || city.startsWith(c));
    if (found) coord = CITY_COORDS[found];
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
