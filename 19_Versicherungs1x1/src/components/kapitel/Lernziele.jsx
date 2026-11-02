// Lernziele — „Danach kannst du …“ aus einheit.lernziele (Tätigkeitswörter-
// Sätze nach DIHK/BWV-Rahmenplan), nur wenn vorhanden.
import { Target, Check } from 'lucide-react';

export default function Lernziele({ ziele }) {
  if (!Array.isArray(ziele) || ziele.length === 0) return null;
  return (
    <section className="lernziele" aria-labelledby="lernziele-titel">
      <h3 id="lernziele-titel" className="lernziele-titel"><Target size={13} aria-hidden="true" />Danach kannst du …</h3>
      <ul>
        {ziele.map((z, i) => (
          <li key={i}><Check size={14} aria-hidden="true" /><span>{z}</span></li>
        ))}
      </ul>
    </section>
  );
}
