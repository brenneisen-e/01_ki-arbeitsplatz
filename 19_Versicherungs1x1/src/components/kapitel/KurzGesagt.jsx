// KurzGesagt — die Kernaussagen einer Lerneinheit (einheit.kurzgesagt),
// nur wenn die Daten sie liefern; nie selbst erfunden.
import { Sparkles } from 'lucide-react';

export default function KurzGesagt({ saetze }) {
  if (!Array.isArray(saetze) || saetze.length === 0) return null;
  return (
    <section className="kurzgesagt" aria-labelledby="kurzgesagt-titel">
      <h3 id="kurzgesagt-titel" className="kurzgesagt-titel"><Sparkles size={13} aria-hidden="true" />Kurz gesagt</h3>
      <ul>
        {saetze.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </section>
  );
}
