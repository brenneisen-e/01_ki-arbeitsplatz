/**
 * ResultSection.jsx
 *
 * Nimmt die Liste aller Treffer und rendert pro Ziel-Maske eine
 * `MaskenGroupCard`. Sortiert die Masken so, dass die am häufigsten
 * getroffene Maske oben steht.
 */

import { useMemo } from 'react';
import MaskenGroupCard from './MaskenGroupCard';

const MASK_ORDER = ['application', 'collateral', 'contract', 'analysis'];

function groupHitsByMask(hits) {
  const groups = new Map();
  for (const hit of hits) {
    const id = hit.mapping.maskId;
    if (!groups.has(id)) {
      groups.set(id, { maskId: id, maskLabel: hit.mapping.maskLabel, hits: [] });
    }
    groups.get(id).hits.push(hit);
  }
  return Array.from(groups.values());
}

export default function ResultSection({ hits }) {
  const grouped = useMemo(() => {
    const g = groupHitsByMask(hits);
    // Sortiere: zuerst nach fester Reihenfolge, dann nach Anzahl Treffer
    g.sort((a, b) => {
      const ai = MASK_ORDER.indexOf(a.maskId);
      const bi = MASK_ORDER.indexOf(b.maskId);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return b.hits.length - a.hits.length;
    });
    return g;
  }, [hits]);

  if (!hits || hits.length === 0) {
    return (
      <div className="bg-surface-card border border-border rounded-lg p-8 text-center">
        <p className="text-sm text-text-muted font-body">
          Keine bekannten Felder automatisch erkannt. Du kannst den Rohtext unten
          prüfen und die Werte manuell in die passenden Masken übertragen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map((g) => (
        <MaskenGroupCard
          key={g.maskId}
          maskId={g.maskId}
          maskLabel={g.maskLabel}
          hits={g.hits}
        />
      ))}
    </div>
  );
}
