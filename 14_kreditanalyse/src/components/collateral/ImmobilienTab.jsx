/**
 * ImmobilienTab -- Reiter "Immobiliensicherheiten erfassen".
 *
 * Grundpfandrechte auf Wohn- und Gewerbeimmobilien mit ihren
 * Objektunterlagen. Jede Immobilie ist eine eigene Karte; Bewertung und
 * Blankoanteil rechnen mit denselben Einträgen wie die sonstigen
 * Sicherheiten.
 */

import { useCallback } from 'react';
import { Building2, Plus } from 'lucide-react';
import { erstelleObjektprofil } from '../../utils/immobilienProfil';
import ImmobilienKarte from './ImmobilienKarte';
import { istImmobilie, neueSicherheit } from './sicherheitenArten';

export default function ImmobilienTab({ items, setItems, company }) {
  const immobilien = items.filter((item) => istImmobilie(item.art));

  const aktualisiere = useCallback(
    (id) => (fn) => setItems((prev) => prev.map((it) => (it.id === id ? fn(it) : it))),
    [setItems]
  );

  const hinzufuegen = () => setItems((prev) => [...prev, neueSicherheit('Grundschuld/Hypothek (Gewerbeimmobilie)')]);
  const entfernen = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  // Anschriften der übrigen Objekte, damit ein neues Demo-Objekt nicht dieselbe bekommt
  const andereAdressen = (id) => () =>
    immobilien
      .filter((it) => it.id !== id)
      .map((it) => (it.demoProfil || erstelleObjektprofil(it, company)).lage.strasse);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold font-headline text-text-primary mb-1">
          Immobiliensicherheiten erfassen
        </h3>
        <p className="text-sm text-text-secondary font-body">
          Grundschulden und Hypotheken auf Wohn- und Gewerbeimmobilien. Lade je Objekt Energieausweis, Mieterliste
          und Objekt-Cashflow hoch – die KI übernimmt jährlichen Cashflow, Mieterträge, Leerstandsquote und
          Energiekennwerte in die Felder. Die Bewertung erfolgt automatisch im Reiter „Bewertung &amp; Haircuts“.
        </p>
      </div>

      {immobilien.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-xl border border-dashed border-border bg-surface">
          <Building2 size={36} strokeWidth={1.5} className="text-text-muted mb-3" />
          <p className="text-sm font-medium text-text-primary">Noch keine Immobiliensicherheit erfasst.</p>
          <p className="text-xs text-text-secondary mt-1 max-w-md">
            Lege ein Objekt an und lade seine Unterlagen hoch. Bezeichnung, Flächen, Mieten und Cashflow liest die KI
            aus den Dokumenten.
          </p>
        </div>
      )}

      {immobilien.map((item, i) => (
        <ImmobilienKarte
          key={item.id}
          item={item}
          nummer={i + 1}
          company={company}
          andereAdressen={andereAdressen(item.id)}
          aktualisiere={aktualisiere(item.id)}
          onEntfernen={() => entfernen(item.id)}
        />
      ))}

      <button
        type="button"
        onClick={hinzufuegen}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-border text-sm font-medium font-body text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors w-full justify-center"
      >
        <Plus size={18} strokeWidth={1.5} />
        Immobilie hinzufügen
      </button>
    </div>
  );
}
