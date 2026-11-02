// ===========================================================================
// BegriffeChips — die Glossarbegriffe, die im Text einer Lerneinheit
// vorkommen (begriffeInEinheit), als Chips in Lesereihenfolge. Jeder Chip
// ist ein Link ins Glossar und öffnet dieselbe Hover-Card wie ein Begriff im
// Fließtext. Props wie beim Stub des Fundaments: { einheit, titel? }.
// ===========================================================================
import { useMemo } from 'react';
import { useWissen } from '../../store/Wissen.jsx';
import { begriffeInEinheit } from '../../lib/begriffe.js';
import Chip from '../ui/Chip.jsx';
import { useBegriffKarte } from './BegriffKarte.jsx';

function BegriffChip({ slug, term }) {
  const { routeZuHash } = useWissen();
  const { eintrag, ankerProps, karte } = useBegriffKarte(slug);
  if (!eintrag) return null;
  return (
    <>
      <Chip href={routeZuHash({ name: 'glossar', slug: eintrag.slug })} {...ankerProps}>{term}</Chip>
      {karte}
    </>
  );
}

export default function BegriffeChips({ einheit, titel = 'Begriffe in dieser Einheit' }) {
  const { glossar } = useWissen();
  const begriffe = useMemo(() => begriffeInEinheit(einheit, glossar), [einheit, glossar]);
  if (begriffe.length === 0) return null;
  return (
    <section className="begriffe-chips" aria-label={titel}>
      <h3 className="begriffe-chips-titel">
        {titel}
        <span className="begriffe-chips-zahl" aria-hidden="true">{begriffe.length}</span>
      </h3>
      <ul className="begriffe-chips-liste">
        {begriffe.map((b) => (
          <li key={b.slug}><BegriffChip slug={b.slug} term={b.term} /></li>
        ))}
      </ul>
    </section>
  );
}
