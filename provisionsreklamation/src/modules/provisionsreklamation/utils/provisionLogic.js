// System-Prompt für die KI-Analyse
export const SYSTEM_PROMPT = `Du bist ein KI-Assistent für Provisionsreklamationen bei einem deutschen Versicherungsunternehmen. Du erhältst Reklamationsdaten und zugehörige Vertragsinformationen.

Deine Aufgabe:
1. Analysiere die Reklamation anhand der Vertragsdaten und Provisionsregeln
2. Berechne SOLL vs. IST der Provisionen
3. Bewerte, ob die Reklamation berechtigt, teilweise berechtigt oder unberechtigt ist
4. Prüfe, ob das Fehlerbild auf einen systemischen Fehler hindeuten könnte
5. Formuliere eine klare Handlungsempfehlung

Antworte AUSSCHLIESSLICH im folgenden JSON-Format:
{
  "provisionsberechnung": {
    "positionen": [
      { "position": "...", "soll": 0.00, "ist": 0.00, "differenz": 0.00 }
    ],
    "gesamt_soll": 0.00,
    "gesamt_ist": 0.00,
    "gesamt_differenz": 0.00
  },
  "bewertung": {
    "ampel": "gruen|gelb|rot|orange",
    "titel": "...",
    "analyse": "... (ausführlicher Analysetext, 3-5 Absätze) ...",
    "handlungsempfehlung": "... (konkreter Handlungsvorschlag) ...",
    "auffaelligkeit": {
      "erkannt": true|false,
      "muster": "...",
      "geschaetzte_betroffene": "..."
    }
  },
  "antwort_entwurf": "... (vollständiger Antwortbrief an den Vermittler) ..."
}

Regulatorischer Kontext:
- §87c HGB: Unabdingbarer Anspruch auf Provisionsabrechnung und Buchauszug
- §49 VAG: Stornohaftungszeit max. 60 Monate für Leben/PKV
- Nachbearbeitungspflicht: Beide Seiten müssen Stornobekämpfung nachweisen
- Stornoreserve: Einzelvertragsbezogene Freigabe nach Ablauf der Haftungszeit (OLG Köln)
- Dynamikprovision: AP auf den Erhöhungsbetrag, berechnet auf Basis der Restlaufzeit

Antworte auf Deutsch. Sei präzise und nenne konkrete Zahlen.`;

// User-Prompt Builder
export function buildUserPrompt(vorgang, vertragsdaten) {
  const reklamation = `Vorgangsnummer: ${vorgang.id}
Vermittler: ${vorgang.vermittler} (${vorgang.vermittlerNr})
VS-Nr: ${vorgang.vsNummer}
Sparte: ${vorgang.sparte}
Reklamationstyp: ${vorgang.typ}
VN: ${vorgang.vnName}
Vertragsbeginn: ${vorgang.vertragsbeginn}
Monatsbeitrag: ${vorgang.monatsbeitrag} EUR
Erwarteter Betrag: ${vorgang.erwartet} EUR
Erhaltener Betrag: ${vorgang.erhalten} EUR
Differenz: ${vorgang.differenz} EUR
Zeitraum: ${vorgang.zeitraumVon} bis ${vorgang.zeitraumBis}
Beschreibung: ${vorgang.beschreibung}`;

  let vertrag = 'Keine Vertragsdaten im System gefunden.';
  if (vertragsdaten) {
    vertrag = Object.entries(vertragsdaten)
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');
  }

  return `Reklamation:\n${reklamation}\n\nVertragsdaten aus dem Bestandssystem:\n${vertrag}\n\nBitte analysiere diesen Vorgang.`;
}

// Hilfsfunktion: EUR formatieren
export function formatEur(val) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
}
