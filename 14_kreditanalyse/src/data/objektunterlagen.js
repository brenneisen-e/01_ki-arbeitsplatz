/**
 * Objektunterlagen einer Immobiliensicherheit und die Felder, die die KI
 * daraus ausliest.
 *
 * Reihenfolge der Unterlagen = Reihenfolge in der Checkliste. Die ersten drei
 * sind die Kernunterlagen (Energieausweis, Mieterliste, Objekt-Cashflow),
 * Gutachten und Grundbuchauszug ergänzen Marktwert, Vorlasten und Rang.
 */

export const UNTERLAGEN_TYPEN = [
  {
    id: 'energieausweis',
    label: 'Energieausweis',
    liefert: 'Effizienzklasse, Endenergie, Baujahr, Fläche, Gültigkeit',
    kern: true,
  },
  {
    id: 'mieterliste',
    label: 'Mieterliste',
    liefert: 'Mieteinheiten, Flächen, Leerstandsquote, WALT, Sollmiete',
    kern: true,
  },
  {
    id: 'cashflow',
    label: 'Objekt-Cashflow',
    liefert: 'Mieterträge, Bewirtschaftungskosten, jährlicher Cashflow',
    kern: true,
  },
  {
    id: 'gutachten',
    label: 'Verkehrswertgutachten',
    liefert: 'Marktwert, Bewertungsstichtag, Verfahren',
    kern: false,
  },
  {
    id: 'grundbuch',
    label: 'Grundbuchauszug',
    liefert: 'Vorlasten und Rang aus Abteilung III',
    kern: false,
  },
];

export const UNTERLAGEN_LABEL = Object.fromEntries(UNTERLAGEN_TYPEN.map((t) => [t.id, t.label]));

/**
 * Felder, die aus den Unterlagen befüllt werden.
 *
 * ziel:    'objekt' = Objektdaten der Immobilie, 'sicherheit' = Felder des
 *          Grundpfandrechts (Marktwert, Vorlasten, Rang …)
 * quellen: Unterlagen in der Reihenfolge ihres Vorrangs -- liefert die erste
 *          keinen Wert, kommt die nächste zum Zug.
 * nurWennLeer: bestehende Eingaben werden nicht überschrieben
 */
export const OBJEKT_FELDER = {
  bezeichnung: { label: 'Objekt / Bezeichnung', ziel: 'sicherheit', format: 'text', quellen: ['gutachten', 'energieausweis', 'mieterliste', 'cashflow', 'grundbuch'], nurWennLeer: true },
  wert: { label: 'Marktwert / Verkehrswert', ziel: 'sicherheit', format: 'euro', quellen: ['gutachten'] },
  datum: { label: 'Bewertungsdatum', ziel: 'sicherheit', format: 'datum', quellen: ['gutachten'] },
  bewertung: { label: 'Bewertungsverfahren', ziel: 'sicherheit', format: 'text', quellen: ['gutachten'] },
  vorlasten: { label: 'Vorlasten', ziel: 'sicherheit', format: 'euro', quellen: ['grundbuch'] },
  rang: { label: 'Rang', ziel: 'sicherheit', format: 'rang', quellen: ['grundbuch'] },

  nutzung: { label: 'Nutzungsart', ziel: 'objekt', format: 'text', quellen: ['energieausweis', 'gutachten', 'mieterliste'] },
  baujahr: { label: 'Baujahr', ziel: 'objekt', format: 'jahr', quellen: ['energieausweis', 'gutachten'] },
  flaeche: { label: 'Mietfläche', ziel: 'objekt', format: 'flaeche', quellen: ['mieterliste', 'gutachten', 'energieausweis'] },
  energieklasse: { label: 'Energieeffizienzklasse', ziel: 'objekt', format: 'text', quellen: ['energieausweis'] },
  energiekennwert: { label: 'Endenergie', ziel: 'objekt', format: 'kennwert', quellen: ['energieausweis'] },
  ausweisGueltigBis: { label: 'Energieausweis gültig bis', ziel: 'objekt', format: 'datum', quellen: ['energieausweis'] },

  einheiten: { label: 'Mieteinheiten', ziel: 'objekt', format: 'anzahl', quellen: ['mieterliste'] },
  vermieteteFlaeche: { label: 'Vermietete Fläche', ziel: 'objekt', format: 'flaeche', quellen: ['mieterliste'] },
  leerstandFlaeche: { label: 'Leerstandsfläche', ziel: 'objekt', format: 'flaeche', quellen: ['mieterliste'] },
  leerstandsquote: { label: 'Leerstandsquote', ziel: 'objekt', format: 'prozent', quellen: ['mieterliste', 'cashflow'] },
  walt: { label: 'WALT', ziel: 'objekt', format: 'jahre', quellen: ['mieterliste'] },

  mietertraege: { label: 'Mieterträge p.a.', ziel: 'objekt', format: 'euro', quellen: ['cashflow', 'mieterliste', 'gutachten'] },
  bewirtschaftung: { label: 'Bewirtschaftungskosten', ziel: 'objekt', format: 'euro', quellen: ['cashflow', 'gutachten'] },
  cashflow: { label: 'Jährlicher Cashflow', ziel: 'objekt', format: 'euro', quellen: ['cashflow', 'gutachten'] },
};
