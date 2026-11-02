import { useState, useMemo } from 'react';
import geojson from '../../data/bundeslaender.geo.json';

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

/* ── State → RD mapping (insurance) ──────────────────────────────── */
const STATE_TO_RD = {
  'Nordrhein-Westfalen': 'rd_nrw_west',
  'Hamburg': 'rd_nord_west',
  'Bremen': 'rd_nord_west',
  'Schleswig-Holstein': 'rd_nord_west',
  'Niedersachsen': 'rd_nord_mitte',
  'Berlin': 'rd_nord_ost',
  'Brandenburg': 'rd_nord_ost',
  'Mecklenburg-Vorpommern': 'rd_nord_ost',
  'Hessen': 'rd_mitte_west',
  'Rheinland-Pfalz': 'rd_mitte_west',
  'Saarland': 'rd_mitte_west',
  'Thüringen': 'rd_mitte_ost',
  'Sachsen-Anhalt': 'rd_mitte_ost',
  'Sachsen': 'rd_ost',
  'Baden-Württemberg': 'rd_sued_west',
  'Bayern': 'rd_sued_ost',
};

/* ── State → BU mapping (generic / Zukunfts AG) ──────────────────── */
const STATE_TO_BU = {
  'Berlin':                 'bu_tech',
  'Brandenburg':            'bu_tech',
  'Mecklenburg-Vorpommern': 'bu_data',
  'Sachsen':                'bu_data',
  'Sachsen-Anhalt':         'bu_data',
  'Thüringen':              'bu_data',
  'Hamburg':                'bu_hr',
  'Bremen':                 'bu_hr',
  'Schleswig-Holstein':     'bu_hr',
  'Niedersachsen':          'bu_hr',
  'Hessen':                 'bu_finance',
  'Rheinland-Pfalz':        'bu_legal',
  'Saarland':               'bu_legal',
  'Nordrhein-Westfalen':    'bu_operations',
  'Bayern':                 'bu_marketing',
  'Baden-Württemberg':      'bu_procurement',
};

/* ── Tier colors ──────────────────────────────────────────────────── */
function getTierFill(tier) {
  if (tier === 'green') return 'rgba(22,163,74,0.35)';
  if (tier === 'amber') return 'rgba(217,119,6,0.35)';
  return 'rgba(220,38,38,0.35)';
}

function getTierStroke(tier) {
  if (tier === 'green') return '#16A34A';
  if (tier === 'amber') return '#D97706';
  return '#DC2626';
}

/* ── Component ──────────────────────────────────────────────────── */
const SVG_W = 400;
const SVG_H = 540;

export default function GermanyMap({ data, onSelectRD, headcountShort = 'Mitarbeitende' }) {
  const [hoveredState, setHoveredState] = useState(null);

  const isGenericMode = useMemo(() => data.length > 0 && data[0].id.startsWith('bu_'), [data]);
  const stateMap = useMemo(() => isGenericMode ? STATE_TO_BU : STATE_TO_RD, [isGenericMode]);

  const rdMap = useMemo(() => {
    const m = {};
    data.forEach((rd) => { m[rd.id] = rd; });
    return m;
  }, [data]);

  const { paths, project } = useMemo(() => {
    const proj = buildProjection(geojson.features, SVG_W, SVG_H);
    const ps = geojson.features.map((f) => ({
      name: f.properties.name,
      d: featureToPath(f, proj),
    }));
    return { project: proj, paths: ps };
  }, []);

  // Compute centroid for RD/BU markers
  const rdMarkers = useMemo(() => {
    const RD_COORDS = {
      rd_nrw_west:   { lat: 51.23, lng: 6.78  },
      rd_nrw_ost:    { lat: 51.51, lng: 7.47  },
      rd_nrw_sued:   { lat: 50.94, lng: 6.96  },
      rd_nord_west:  { lat: 53.55, lng: 10.0  },
      rd_nord_ost:   { lat: 52.52, lng: 13.41 },
      rd_mitte_west: { lat: 50.11, lng: 8.68  },
      rd_mitte_ost:  { lat: 50.98, lng: 11.03 },
      rd_sued_west:  { lat: 48.78, lng: 9.18  },
      rd_sued_ost:   { lat: 48.14, lng: 11.58 },
      rd_nord_mitte: { lat: 52.37, lng: 9.74  },
      rd_sued_mitte: { lat: 49.45, lng: 11.08 },
      rd_ost:        { lat: 51.05, lng: 13.74 },
    };
    const BU_COORDS = {
      bu_tech:        { lat: 52.52, lng: 13.41 },
      bu_data:        { lat: 52.47, lng: 13.52 },
      bu_finance:     { lat: 50.11, lng: 8.68  },
      bu_legal:       { lat: 50.17, lng: 8.60  },
      bu_hr:          { lat: 53.55, lng: 10.0  },
      bu_marketing:   { lat: 48.14, lng: 11.58 },
      bu_product:     { lat: 48.20, lng: 11.48 },
      bu_operations:  { lat: 51.51, lng: 7.47  },
      bu_logistics:   { lat: 51.46, lng: 7.55  },
      bu_sales:       { lat: 51.23, lng: 6.78  },
      bu_cs:          { lat: 50.94, lng: 6.96  },
      bu_procurement: { lat: 48.78, lng: 9.18  },
    };
    const coords = isGenericMode ? BU_COORDS : RD_COORDS;
    return data.map((rd) => {
      const coord = coords[rd.id];
      if (!coord) return null;
      const [x, y] = project(coord.lng, coord.lat);
      return { ...rd, x, y };
    }).filter(Boolean);
  }, [data, project, isGenericMode]);

  const hoveredRD = hoveredState ? rdMap[stateMap[hoveredState]] : null;

  return (
    <div className="hc-map-container">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="hc-map-svg">
        <rect width={SVG_W} height={SVG_H} fill="#f8fafc" rx="8" />

        {/* State shapes */}
        {paths.map(({ name, d }) => {
          const rdId = stateMap[name];
          const rd = rdId ? rdMap[rdId] : null;
          const isHovered = hoveredState === name;
          return (
            <path
              key={name}
              d={d}
              fill={rd ? getTierFill(rd.tier) : '#e5e7eb'}
              stroke={isHovered ? getTierStroke(rd?.tier || 'amber') : '#94a3b8'}
              strokeWidth={isHovered ? 2.5 : 1}
              className="hc-map-state"
              onClick={() => rd && onSelectRD?.(rd.id)}
              onMouseEnter={() => setHoveredState(name)}
              onMouseLeave={() => setHoveredState(null)}
            />
          );
        })}

        {/* RD markers */}
        {rdMarkers.map((rd) => {
          const r = Math.max(10, Math.min(18, rd.headcount / 30));
          return (
            <g key={rd.id} className="hc-map-marker" onClick={() => onSelectRD?.(rd.id)}>
              <circle
                cx={rd.x} cy={rd.y} r={r}
                fill={getTierStroke(rd.tier)}
                stroke="white" strokeWidth={2}
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}
              />
              <text
                x={rd.x} y={rd.y + 3.5}
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="700"
                fontFamily="'DM Sans', system-ui, sans-serif"
              >
                {rd.composite}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hoveredState && hoveredRD && (
          <foreignObject x="10" y="10" width="220" height="70">
            <div className="hc-map-tooltip-inner">
              <div className="hc-map-tooltip-title">{hoveredRD.name}</div>
              <div className="hc-map-tooltip-subtitle">{isGenericMode ? hoveredRD.region : hoveredState}</div>
              <div className="hc-map-tooltip-metrics">
                <span style={{ color: getTierStroke(hoveredRD.tier), fontWeight: 700 }}>Score: {hoveredRD.composite}</span>
                <span>{hoveredRD.headcount} {headcountShort}</span>
                <span>Flukt. {hoveredRD.turnoverRate}%</span>
              </div>
            </div>
          </foreignObject>
        )}
      </svg>

      {/* Legend */}
      <div className="hc-map-legend">
        <div className="hc-legend-item">
          <div className="hc-legend-dot" style={{ background: '#16A34A' }} />
          <span>Gesund (75+)</span>
        </div>
        <div className="hc-legend-item">
          <div className="hc-legend-dot" style={{ background: '#D97706' }} />
          <span>Gefährdet (40–74)</span>
        </div>
        <div className="hc-legend-item">
          <div className="hc-legend-dot" style={{ background: '#DC2626' }} />
          <span>Kritisch (&lt;40)</span>
        </div>
      </div>
    </div>
  );
}
