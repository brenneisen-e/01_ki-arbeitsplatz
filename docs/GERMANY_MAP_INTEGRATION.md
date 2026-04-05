# Deutschlandkarte – Integrations-Guide

Leichtgewichtige, dependency-freie Deutschlandkarte als React-Komponente. Rendert Bundesländer + optional klickbare Marker auf SVG-Basis mit handgerollter Mercator-Projektion. Keine D3, kein Leaflet, kein react-simple-maps.

## Warum diese Lösung?

- **Zero-Dependencies**: Nur React + ein GeoJSON-File (~200 KB)
- **Klein**: ~230 Zeilen Code, ~15 KB gzipped inkl. GeoJSON
- **Vite-kompatibel**: GeoJSON wird per `import` gebundled (kein Runtime-Fetch)
- **Voll stylebar**: SVG + CSS-Klassen, keine Canvas-Blackbox
- **Responsive**: Über `viewBox` automatisch skalierend
- **Performant**: `useMemo` für Projektion, Pfade, Marker

## Voraussetzungen

- React 18+ (oder 19)
- Vite (oder ein Bundler mit JSON-Import-Support)
- GeoJSON der deutschen Bundesländer

## Setup

### 1. GeoJSON beschaffen

Eine Datei `bundeslaender.geo.json` mit 16 Features (Bundesländer) besorgen. Quellen:
- `https://github.com/isellsoap/deutschlandGeoJSON` (MIT, empfohlen, vereinfachte Varianten verfügbar)
- Natural Earth / GADM
- Eigene Simplification per [mapshaper.org](https://mapshaper.org) (Empfehlung: Douglas-Peucker 2–5 %)

Wichtig: Jedes Feature muss `properties.name` mit dem Bundesland-Namen enthalten (z.B. `"Nordrhein-Westfalen"`).

Datei ablegen unter: `src/data/bundeslaender.geo.json`

### 2. Komponente anlegen

Datei: `src/components/GermanyMap.jsx`

```jsx
import { useState, useMemo } from 'react';
import geojson from '../data/bundeslaender.geo.json';

/* ── Mercator helpers ──────────────────────────────────────────────── */
const DEG2RAD = Math.PI / 180;

function mercator(lon, lat) {
  return [
    lon * DEG2RAD,
    Math.log(Math.tan(Math.PI / 4 + (lat * DEG2RAD) / 2)),
  ];
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
    return [
      (px - minX) * scale + offX,
      (maxY - py) * scale + offY,
    ];
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
    coordinates.forEach((polygon) =>
      polygon.forEach((ring) => parts.push(ringToPath(ring, project)))
    );
  }
  return parts.join(' ');
}

/* ── Component ──────────────────────────────────────────────────── */
const SVG_W = 400;
const SVG_H = 540;

export default function GermanyMap({ stateData = {}, markers = [], onSelectState, onSelectMarker }) {
  const [hovered, setHovered] = useState(null);

  const { paths, project } = useMemo(() => {
    const proj = buildProjection(geojson.features, SVG_W, SVG_H);
    const ps = geojson.features.map((f) => ({
      name: f.properties.name,
      d: featureToPath(f, proj),
    }));
    return { project: proj, paths: ps };
  }, []);

  const projectedMarkers = useMemo(
    () => markers.map((m) => {
      const [x, y] = project(m.lng, m.lat);
      return { ...m, x, y };
    }),
    [markers, project]
  );

  return (
    <div className="de-map-container">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="de-map-svg">
        <rect width={SVG_W} height={SVG_H} fill="#f8fafc" rx="8" />

        {/* Bundesland-Shapes */}
        {paths.map(({ name, d }) => {
          const info = stateData[name];
          const isHovered = hovered === name;
          return (
            <path
              key={name}
              d={d}
              fill={info?.fill ?? '#e5e7eb'}
              stroke={isHovered ? (info?.stroke ?? '#334155') : '#94a3b8'}
              strokeWidth={isHovered ? 2.5 : 1}
              className="de-map-state"
              onClick={() => onSelectState?.(name, info)}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {/* Marker (optional) */}
        {projectedMarkers.map((m) => (
          <g key={m.id} className="de-map-marker" onClick={() => onSelectMarker?.(m)}>
            <circle
              cx={m.x} cy={m.y} r={m.r ?? 12}
              fill={m.color ?? '#2563eb'}
              stroke="white" strokeWidth={2}
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}
            />
            {m.label != null && (
              <text
                x={m.x} y={m.y + 3.5}
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="700"
              >
                {m.label}
              </text>
            )}
          </g>
        ))}

        {/* Tooltip */}
        {hovered && stateData[hovered] && (
          <foreignObject x="10" y="10" width="220" height="70">
            <div className="de-map-tooltip">
              <div className="de-map-tooltip-title">{hovered}</div>
              {stateData[hovered].tooltip}
            </div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
}
```

### 3. Styling (CSS)

```css
.de-map-container { position: relative; width: 100%; }
.de-map-svg { width: 100%; height: auto; display: block; }
.de-map-state { cursor: pointer; transition: fill 120ms ease; }
.de-map-state:hover { filter: brightness(1.05); }
.de-map-marker { cursor: pointer; }
.de-map-tooltip {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.de-map-tooltip-title { font-weight: 700; margin-bottom: 2px; }
```

## Verwendung

### Minimal (nur Bundesländer einfärben)

```jsx
import GermanyMap from './components/GermanyMap';

const stateData = {
  'Bayern':             { fill: 'rgba(22,163,74,0.35)', stroke: '#16A34A' },
  'Baden-Württemberg':  { fill: 'rgba(22,163,74,0.35)', stroke: '#16A34A' },
  'Nordrhein-Westfalen':{ fill: 'rgba(217,119,6,0.35)', stroke: '#D97706' },
  'Sachsen':            { fill: 'rgba(220,38,38,0.35)', stroke: '#DC2626' },
};

<GermanyMap
  stateData={stateData}
  onSelectState={(name) => console.log('clicked', name)}
/>
```

### Mit Markern (z.B. Standorte/Regionaldirektionen)

```jsx
const markers = [
  { id: 'hh', lat: 53.55, lng: 10.00, label: 82, color: '#16A34A' },
  { id: 'b',  lat: 52.52, lng: 13.41, label: 68, color: '#D97706' },
  { id: 'm',  lat: 48.14, lng: 11.58, label: 91, color: '#16A34A', r: 16 },
];

<GermanyMap stateData={stateData} markers={markers} />
```

### Lazy Loading (empfohlen bei großem GeoJSON)

```jsx
import { lazy, Suspense } from 'react';
const GermanyMap = lazy(() => import('./components/GermanyMap'));

<Suspense fallback={<div>Lade Karte …</div>}>
  <GermanyMap stateData={stateData} />
</Suspense>
```

## Bundesland-Namen (Referenz)

Exakte Schreibweise der `properties.name` Werte (wichtig für `stateData`-Keys):

```
Baden-Württemberg        Niedersachsen
Bayern                   Nordrhein-Westfalen
Berlin                   Rheinland-Pfalz
Brandenburg              Saarland
Bremen                   Sachsen
Hamburg                  Sachsen-Anhalt
Hessen                   Schleswig-Holstein
Mecklenburg-Vorpommern   Thüringen
```

## Wie funktioniert's? (Kurz)

1. **Projektion aufbauen**: Bounding-Box aller GeoJSON-Koordinaten per Mercator berechnen, dann skalieren + zentrieren auf `SVG_W × SVG_H` mit Padding.
2. **Pfade erzeugen**: Jedes Feature (`Polygon`/`MultiPolygon`) wird in einen SVG-`d`-String (`M x,y L x,y ... Z`) umgewandelt.
3. **Rendern**: `<path>`-Elemente mit tier-abhängiger Füllfarbe, Marker als `<circle>` + `<text>`, Tooltip via `<foreignObject>`.
4. **Memoisierung**: Projektion und Pfade werden nur einmal berechnet (`useMemo`), State-Updates rerendern nur `fill`/`stroke`.

## Anpassungen

| Ziel | Ort |
|---|---|
| Größere Karte | `SVG_W` / `SVG_H` anpassen |
| Mehr Rand | `padding`-Param in `buildProjection` |
| Andere Länder | GeoJSON austauschen, funktioniert generisch |
| Choropleth-Logik | Über `stateData`-Prop von außen steuern |
| Drill-Down | `onSelectState` + eigener State |

## Bekannte Limitierungen

- Mercator verzerrt in Polrichtung (für Deutschland vernachlässigbar)
- Keine automatische Legende (bewusst, um flexibel zu bleiben)
- `foreignObject`-Tooltip hat in Safari minimale Rendering-Quirks – alternativ HTML-Tooltip außerhalb SVG positionieren

## Beispiel-Implementierungen im Repo

- `HRPipeline/src/components/cockpit/GermanyMap.jsx` (HR Cockpit, mit RD-Markern & Score-Bubbles)
- `vertriebsarbeitsplatz/src/pages/cockpit/GermanyMap.jsx`
- `VSTCockpit/src/pages/cockpit/GermanyMap.jsx`
