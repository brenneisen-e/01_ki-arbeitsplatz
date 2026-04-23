import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ArrowLeft, Search } from 'lucide-react';
import bundeslaenderGeo from '../../pages/cockpit/bundeslaender.geo.json';
import { geocodeKundeLeaflet } from './KundenKarteLeaflet';
import { getKundeFoto } from '../../utils/kundenFotos';

// Volle Breite: Leaflet-Karte mit zwei Ebenen.
//
//   Ebene 1 ("deutschland"):  die 16 Bundesländer als Choropleth-Overlay
//                             auf CARTO-Light, keine einzelnen Pins.
//   Ebene 2 ("bundesland"):   Leaflet zoomt auf das gewählte Bundesland
//                             und zeigt gleichzeitig alle Städte dieses
//                             Landes als Kreise (Radius proportional zur
//                             Kundenzahl). CARTO-Light liefert Straßen-
//                             und Stadt-Labels.
// Rechts neben der Karte ist eine Kundenliste mit Foto — Hover auf einem
// Marker markiert den Listeneintrag und umgekehrt.

// Projektionshelfer: Mittelpunkt eines Polygons (lon/lat). Nimmt die
// aussere Ring-Durchschnittsmitte, reicht fuer Label- und Center-Zwecke.
function featureCenter(feature) {
  let sumLat = 0, sumLng = 0, n = 0;
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      sumLng += coords[0];
      sumLat += coords[1];
      n++;
    } else {
      coords.forEach(visit);
    }
  };
  visit(feature.geometry.coordinates);
  return n > 0 ? [sumLat / n, sumLng / n] : [51.1, 10.4];
}

// Farbe fuer die Choropleth je nach relativer Kundenzahl im Bundesland.
function fillColorForCount(count, maxCount) {
  if (!count) return '#e2e8f0';
  const r = Math.max(0, Math.min(1, count / Math.max(1, maxCount)));
  // Slate → Indigo Gradient
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

export default function KundenDeutschlandkarte({ kunden = [], onKundeClick, title = 'Kundenkarte Deutschland' }) {
  const [selectedBundesland, setSelectedBundesland] = useState(null);
  const [hoveredKundeId, setHoveredKundeId] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [listSearch, setListSearch] = useState('');

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const geoLayerRef = useRef(null);
  const pinsLayerRef = useRef(null);
  const cityMarkersRef = useRef(new Map()); // city → Leaflet circle marker
  const kundenMarkersRef = useRef(new Map()); // kundeId → marker

  // Geocode all customers (scatter → Deutschland-weit verteilt).
  const geocoded = useMemo(
    () => kunden.map((k, i) => geocodeKundeLeaflet(k, i, { scatter: true })).filter(Boolean),
    [kunden]
  );

  // Bundesland counts
  const bundeslandCounts = useMemo(() => {
    const c = {};
    for (const k of geocoded) c[k.bundesland] = (c[k.bundesland] || 0) + 1;
    return c;
  }, [geocoded]);
  const maxCount = useMemo(() => Math.max(0, ...Object.values(bundeslandCounts)), [bundeslandCounts]);

  // Kunden im aktuell sichtbaren Scope (fuer die Sidebar)
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

  // Leaflet-Map initialisieren (einmal).
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [51.2, 10.4],
      zoom: 6,
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
    // Initial: Deutschland-Bounds
    map.setView([51.2, 10.4], 6);
  }, []);

  // Choropleth-Layer anlegen + bei Klick Bundesland selektieren.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (geoLayerRef.current) { geoLayerRef.current.remove(); geoLayerRef.current = null; }

    const layer = L.geoJSON(bundeslaenderGeo, {
      style: (feature) => {
        const name = feature.properties.name;
        const isSelected = selectedBundesland === name;
        const fill = fillColorForCount(bundeslandCounts[name] || 0, maxCount);
        return {
          color: isSelected ? '#1e293b' : '#475569',
          weight: isSelected ? 2 : 1,
          fillColor: fill,
          fillOpacity: selectedBundesland ? (isSelected ? 0.28 : 0.08) : 0.68,
        };
      },
      onEachFeature: (feature, lyr) => {
        const name = feature.properties.name;
        const cnt = bundeslandCounts[name] || 0;
        lyr.bindTooltip(
          `<div style="font-family:'DM Sans',sans-serif;"><strong>${name}</strong><br/>${cnt} Kunden</div>`,
          { direction: 'center', className: 'kunden-land-tooltip', sticky: true }
        );
        lyr.on('mouseover', (e) => {
          if (selectedBundesland) return;
          e.target.setStyle({ weight: 2, color: '#1e293b', fillOpacity: 0.82 });
        });
        lyr.on('mouseout', (e) => {
          if (selectedBundesland) return;
          layer.resetStyle(e.target);
        });
        lyr.on('click', () => {
          setSelectedBundesland(name);
          map.flyToBounds(lyr.getBounds(), { padding: [30, 30], duration: 0.8 });
        });
      },
    }).addTo(map);
    geoLayerRef.current = layer;
  }, [bundeslandCounts, maxCount, selectedBundesland]);

  // City-Aggregat-Marker (nur auf Bundesland-Ebene).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (pinsLayerRef.current) { pinsLayerRef.current.remove(); pinsLayerRef.current = null; }
    cityMarkersRef.current.clear();
    kundenMarkersRef.current.clear();

    if (!selectedBundesland) return;

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
      cityMarker.on('click', () => {
        map.flyTo([g.lat, g.lng], 12, { duration: 0.6 });
      });
      cityMarker.addTo(layerGroup);
      cityMarkersRef.current.set(g.city, cityMarker);

      // Einzelne Kunden-Pins pro Stadt — kleiner, farblich je nach Kontaktstatus.
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

  // Hover aus der Sidebar → Marker hervorheben.
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

  // Zuruck zu Deutschland.
  const backToDeutschland = () => {
    setSelectedBundesland(null);
    const map = mapRef.current;
    if (map) map.flyTo([51.2, 10.4], 6, { duration: 0.6 });
  };

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

      <div className="grid grid-cols-[1fr_320px] gap-0" style={{ height: 560 }}>
        <div ref={mapContainerRef} className="w-full h-full bg-slate-50" />

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
