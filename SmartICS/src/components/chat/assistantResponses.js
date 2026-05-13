// =============================================================================
// Smart-ICS Chatbot — vorgefertigte, kontextabhängige Demo-Antworten.
// Die Antworten verwenden die HTML-Bausteine des Formatters
// (Tabellen, Charts, Sections, Risk-Cards, Sources, Callouts).
// =============================================================================

import { DEMO_PROZESSE } from '../../data/risikoKatalog';

// ===== Step-spezifische Vorschlagsfragen =====
export const STEP_SUGGESTIONS = {
  0: [
    'Welche Prozessschritte sind im Standard für die Kreditvergabe enthalten?',
    'Wie unterscheidet sich Smart ICS von einer klassischen Risiko- und Kontrollinventarisierung?',
    'Welche regulatorischen Anforderungen muss meine RKM erfüllen?',
  ],
  1: [
    'Welche operationellen Risiken sind in diesem Prozess typisch?',
    'Welche Compliance-Risiken sind besonders kritisch?',
    'Welche Risikoarten werden häufig vergessen?',
  ],
  2: [
    'Wie schreibe ich eine prüffähige Risikobeschreibung?',
    'Welche Eintrittswahrscheinlichkeit ist für dieses Risiko realistisch?',
    'Welche Schadenshöhe ist branchenüblich?',
  ],
  3: [
    'Welche Schlüsselkontrolle eignet sich am besten?',
    'Was sind die W-Fragen einer guten Kontrollbeschreibung?',
    'Wie unterscheide ich präventive von detektivischen Kontrollen?',
  ],
  rkm: [
    'Zeige mir eine Verteilung der Risiken nach Risikoart.',
    'Welche Risiken sind ohne Schlüsselkontrolle?',
    'Wie hoch ist meine Kontrollabdeckung?',
  ],
  methodik: [
    'Welche vier Phasen hat der IKS-Regelkreis?',
    'Wie bewerte ich die Angemessenheit einer Kontrolle?',
    'Welche Rollen gibt es im 3-LoD-Modell?',
  ],
};

// ===== Step-Labels =====
export const STEP_LABELS = {
  0: 'Schritt 1 – Prozessanalyse',
  1: 'Schritt 2 – Risikoidentifikation',
  2: 'Schritt 3 – Risikobeschreibung',
  3: 'Schritt 4 – Kontrollidentifikation',
  rkm: 'Risiko-Kontroll-Matrix',
  methodik: 'Methodik & Regelkreis',
};

// ===== Generische Antworten in HTML-Bausteinen =====
export function buildDefaultResponse({ question, step, session }) {
  const q = (question || '').toLowerCase();
  const ctxName = session?.name || 'dem ausgewählten Prozess';

  // --- spezifische Trigger ---
  if (q.includes('regelkreis') || q.includes('phase')) {
    return phasenIKS();
  }
  if (q.includes('verteil') || q.includes('risikoart')) {
    return verteilungRisikoarten(session);
  }
  if (q.includes('w-fragen') || q.includes('w fragen') || q.includes('kontrollbeschreibung')) {
    return wFragenAntwort();
  }
  if (q.includes('schlüsselkontrolle') || q.includes('schluesselkontrolle')) {
    return schluesselkontrolleAntwort();
  }
  if (q.includes('präventiv') || q.includes('praeventiv') || q.includes('detektiv')) {
    return praeventivVsDetektiv();
  }
  if (q.includes('eintrittswahr') || q.includes('schaden')) {
    return bewertungAntwort();
  }
  if (q.includes('ohne schlüsselkontrolle') || q.includes('ohne kontrolle') || q.includes('lücke') || q.includes('luecke')) {
    return lueckenAnalyse(session);
  }
  if (q.includes('compliance')) {
    return complianceRisiken(ctxName);
  }
  if (q.includes('operationell')) {
    return operationelleRisiken(ctxName);
  }
  if (q.includes('vergessen')) {
    return haeufigVergesseneRisiken();
  }
  if (q.includes('3 lod') || q.includes('drei lod') || q.includes('rollen')) {
    return rollenLoD();
  }
  if (q.includes('marisk') || q.includes('regulator')) {
    return regulatorischerRahmen();
  }
  if (q.includes('prozessschritt') && (q.includes('kredit') || ctxName.toLowerCase().includes('kredit'))) {
    return prozessschritteKredit();
  }
  if (q.includes('smart ics') || q.includes('was ist') || q.includes('unterschied')) {
    return ueberblickSmartIcs();
  }

  // --- Step-spezifische Default-Antwort ---
  if (step === 0) return defaultStep1(ctxName);
  if (step === 1) return defaultStep2(ctxName);
  if (step === 2) return defaultStep3(ctxName);
  if (step === 3) return defaultStep4(ctxName);
  if (step === 'rkm') return defaultRkm(session);
  if (step === 'methodik') return defaultMethodik();

  return defaultStep1(ctxName);
}

// =============================================================================
// Antwort-Bausteine
// =============================================================================

function ueberblickSmartIcs() {
  return `1. Was leistet Smart ICS?
Smart ICS automatisiert die Risiko- und Kontrollinventarisierung entlang Ihrer Prozesse. Der Anwender liefert Prozessdokumente; das System schlägt Aktivitäten, Risikokategorien, Risikobeschreibungen und Kontrollen vor.

2. Vier Schritte im Workflow
- Schritt 1 – Prozessanalyse: Extraktion relevanter Aktivitäten aus Word/PDF/Excel.
- Schritt 2 – Risikoidentifikation: Vorschläge mit First-/Second-/Third-Choice-Confidence.
- Schritt 3 – Risikobeschreibung: Detail-Beschreibungen, Eintrittswahrscheinlichkeit und finanzieller Schaden.
- Schritt 4 – Kontrollidentifikation: Bis zu 4 Kontrollvorschläge je Risiko mit W-Fragen-Detail.

3. Zeitersparnis
Pro Prozess reduziert sich der Aufwand für die Inventarisierung von etwa 9 Stunden auf 3 Stunden — ca. 67 % weniger Zeit für die 1st Line.

Hinweis: Smart ICS ersetzt keine Methodik, sondern beschleunigt deren konsequente Anwendung. Die finale Auswahl trifft immer ein Mensch (Human-in-the-Loop).

Quellen:
- Smart-ICS-Konzept (Deloitte 2026)
- MaRisk AT 4.3 – Interne Kontrollverfahren
- BAIT 4 – Informationsrisikomanagement`;
}

function phasenIKS() {
  return `Der IKS-Regelkreis besteht aus vier Phasen, die jährlich durchlaufen werden:

1. Prozess- und Risikoanalyse
- Aufnahme und Aktualisierung der Prozessmodelle.
- Identifikation der relevanten NFR-Risiken entlang der Aktivitäten.
- Anbindung an die Risikolandkarte (Kategorien, Unterarten, Definitionen).

2. Identifikation und Dokumentation von Kontrollen
- Aufnahme aller Schlüsselkontrollen je Risiko.
- Dokumentation der W-Fragen (wer, was, wann, wo, wie).
- Festlegung von Attributen (präventiv/detektiv, manuell/automatisch, Frequenz).

3. Beurteilung der Angemessenheit und Wirksamkeit
- Design-Assessment: Eignet sich die Kontrolle theoretisch?
- Effectiveness-Test: Hat die Kontrolle in der Praxis funktioniert?
- Findings werden als Maßnahmen abgeleitet.

4. Berichterstattung
- Quartalsweiser Operational-Risk-Report an den Vorstand.
- Konsolidiertes Reporting zur Angemessenheit gegenüber Aufsichtsrat und BaFin.

Quellen:
- MaRisk AT 4.3.1 – Interne Kontrollverfahren
- COSO Internal Control – Integrated Framework`;
}

function verteilungRisikoarten(session) {
  const counts = { 'Operationell': 0, 'Compliance': 0, 'Reputation': 0, 'Finanzkrim.': 0, 'Modell/Daten': 0, 'Auslagerung': 0 };
  if (session?.risikoCandidates) {
    Object.values(session.risikoCandidates).flat().filter(r => r.selected).forEach(r => {
      if (r.kategorie === 'operationelles-risiko') counts['Operationell']++;
      else if (r.kategorie === 'compliance-risiko') counts['Compliance']++;
      else if (r.kategorie === 'reputations-risiko') counts['Reputation']++;
      else if (r.kategorie === 'finanzkriminalitaet') counts['Finanzkrim.']++;
      else if (r.kategorie === 'modell-risiko') counts['Modell/Daten']++;
      else if (r.kategorie === 'auslagerungs-risiko') counts['Auslagerung']++;
    });
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return `Aktuell sind noch keine Risiken ausgewählt. Schließen Sie zunächst Schritt 2 (Risikoidentifikation) ab, dann liefere ich eine vollständige Verteilung.

Hinweis: Sobald Sie Risiken markieren, aktualisiert sich die Verteilung in Echtzeit.

Quellen:
- Smart-ICS-Sessiondaten`;
  }

  const chart = `[chart: ${Object.entries(counts).filter(([,v]) => v > 0).map(([k, v]) => `${k}=${v}`).join(' ')}]`;
  return `Verteilung der ausgewählten Risiken nach Risikoart:
${chart}

| Risikoart | Anzahl | Anteil |
| --- | --- | --- |
${Object.entries(counts).filter(([,v]) => v > 0).map(([k, v]) => `| ${k} | ${v} | ${Math.round(v/total*100)} % |`).join('\n')}

Empfehlung: Achten Sie auf eine ausgewogene Abdeckung — eine Häufung in einer einzigen Risikoart deutet häufig auf eine zu enge Sicht.

Quellen:
- Smart-ICS-Sessiondaten (aktuelle Auswahl)
- Risikolandkarte des Instituts`;
}

function wFragenAntwort() {
  return `Eine prüffähige Kontrollbeschreibung beantwortet die fünf W-Fragen:

1. Wer
Verantwortliche Rolle / Funktion (z. B. „Sachbearbeiter Kredit, Vier-Augen durch Teamleiter")

2. Was
Konkrete Tätigkeit (z. B. „Prüfung der eingereichten Bilanz gegen Handelsregister-Daten")

3. Wann
Zeitpunkt oder Frequenz (z. B. „vor Freigabe der Kreditvorlage")

4. Wo
System / Ort der Kontrolle (z. B. „im Kreditworkflow-Tool")

5. Wie
Methode und Dokumentation (z. B. „Sichtprüfung, dokumentiert durch elektronische Freigabe inklusive Zeitstempel")

Tipp: Vermeiden Sie Beschreibungen wie „regelmäßige Prüfung" — sie sind nicht prüffähig. Eine gute Kontrollbeschreibung erlaubt es einem Prüfer, die Wirksamkeit ohne Rückfrage zu testen.

Quellen:
- MaRisk AT 4.3.1 – Kontroll- und Sicherheitsvorkehrungen
- IDW PS 261 n. F. – Prüfung interner Kontrollsysteme`;
}

function schluesselkontrolleAntwort() {
  return `Eine Schlüsselkontrolle (Key Control) zeichnet sich dadurch aus, dass ihr Ausfall den Eintritt des Risikos materiell wahrscheinlicher macht oder den Schaden materiell erhöht.

Hohe Eignung als Schlüsselkontrolle:
- Direkter Wirkungsbezug auf das Risiko (keine Hilfs- oder Folge-Kontrolle).
- Hohe Wirksamkeit (präventiv > detektiv, automatisiert > manuell).
- Aufgesetzt auf jedem Geschäftsvorfall des Risikos.
- Eindeutige Verantwortlichkeit und Dokumentation.

Mittlere Eignung:
- Stichprobenkontrollen mit hinreichend großer Grundgesamtheit.
- Tagesabschluss-Reconciliations mit Eskalationspfad.

Geringe Eignung:
- Allgemeine Schulungen ohne Wissenstest.
- Reine Awareness-Maßnahmen.

Empfehlung: Vergeben Sie das Attribut „Schlüsselkontrolle" je Risiko sparsam — typischerweise reichen 1–2 Schlüsselkontrollen je wesentlichem Risiko aus.

Quellen:
- MaRisk AT 4.3.1
- COSO 2013 Principle 12
- Smart-ICS-Methodik`;
}

function praeventivVsDetektiv() {
  return `| Kriterium | Präventiv | Detektiv |
| --- | --- | --- |
| Ziel | Verhindert Eintritt | Erkennt Eintritt |
| Zeitpunkt | Vor / während der Aktivität | Nach der Aktivität |
| Beispiel | Vier-Augen-Prinzip vor Freigabe | Tagesabschluss-Abstimmung |
| Stärke | Hohe Risikoreduktion | Schnelle Erkennung |
| Schwäche | Operativer Aufwand | Schaden ist bereits eingetreten |

Hinweis: In der Praxis sollten Sie für wesentliche Risiken mindestens eine präventive Kontrolle hinterlegen und durch detektive Kontrollen ergänzen, um Restrisiken zeitnah zu identifizieren.

Quellen:
- COSO 2013 Internal Control – Integrated Framework
- IDW PS 261`;
}

function bewertungAntwort() {
  return `Die Risiko-Bewertung in Smart ICS arbeitet mit einer zweidimensionalen Matrix:

| Wahrscheinlichkeit | Schaden | Tier |
| --- | --- | --- |
| Hoch (>20 %) | Hoch (>250 TEUR) | Hoch |
| Mittel (5–20 %) | Mittel (50–250 TEUR) | Mittel |
| Gering (<5 %) | Gering (<50 TEUR) | Gering |

Hinweis: Die Werte sind institutsabhängig. Bei größeren Banken werden die Schwellen deutlich höher angesetzt (z. B. >5 Mio. EUR als „Hoch").

Empfehlung: Dokumentieren Sie immer die Grundlage der Bewertung (Schadenshistorie, Benchmark, Expertenschätzung) — andernfalls ist die Einstufung in der Revision schwer verteidigbar.

Quellen:
- MaRisk AT 4.3.2
- Eigene Schadensfalldatenbank
- ORX Reference Tax`;
}

function lueckenAnalyse(session) {
  if (!session) {
    return `Schließen Sie zunächst Schritt 4 (Kontrollidentifikation) ab, dann kann ich eine vollständige Lücken-Analyse liefern.

Quellen:
- Smart-ICS-Sessiondaten`;
  }
  const selectedRisks = Object.values(session.risikoCandidates).flat().filter(r => r.selected);
  const withoutControl = selectedRisks.filter(r => {
    const k = session.kontrollCandidates[r.id] || [];
    return !k.some(c => c.selected && c.isKey);
  });
  if (selectedRisks.length === 0) {
    return `Bisher sind keine Risiken ausgewählt. Bitte zuerst Schritt 2 abschließen.

Quellen:
- Smart-ICS-Sessiondaten`;
  }
  if (withoutControl.length === 0) {
    return `Sehr gut — alle ${selectedRisks.length} ausgewählten Risiken haben mindestens eine Schlüsselkontrolle.

Empfehlung: Prüfen Sie zusätzlich, ob jede Schlüsselkontrolle eindeutig dokumentiert ist (W-Fragen vollständig) und die Wirksamkeit jährlich getestet wird.

Quellen:
- Smart-ICS-Sessiondaten
- MaRisk AT 4.3.1`;
  }
  const tableRows = withoutControl.slice(0, 8).map(r => `| ${r.aktivitaetId.toUpperCase()} | ${r.unterart} | ${(r.finalBeschreibung || r.beschreibung).slice(0, 80)}… |`).join('\n');
  return `Es bestehen ${withoutControl.length} Risiken ohne dokumentierte Schlüsselkontrolle:

| Aktivität | Risikoart | Beschreibung (Auszug) |
| --- | --- | --- |
${tableRows}

Hohes Risiko:
- Ohne Schlüsselkontrolle besteht ein Bruttorisiko, das nicht durch die Bank gesteuert wird.
- In der MaRisk-Prüfung wird das als gravierendes Finding qualifiziert.

Empfehlung: Belegen Sie die Risiken in Schritt 4 mit mindestens einer Schlüsselkontrolle oder dokumentieren Sie die Risikoakzeptanz explizit.

Quellen:
- Smart-ICS-Sessiondaten
- MaRisk AT 4.3.1, AT 4.3.4`;
}

function complianceRisiken(ctxName) {
  return `Wesentliche Compliance-Risiken in "${ctxName}":

Hohes Risiko:
- Verstoß gegen MaRisk-BTO-Vorgaben (Marktfolge-Trennung, Vier-Augen-Prinzip)
- GwG-Verstöße (KYC, UBO, Verdachtsmeldungen)
- DORA-Anforderungen an die IKT-Sicherheit und Drittparteienrisiken

Mittleres Risiko:
- DSGVO-Verstöße bei Auftragsverarbeitung und Auskunftspflichten
- EU AI Act bei Hochrisiko-KI-Systemen (z. B. Rating-Modelle, Schadenmodelle)

Geringes Risiko:
- Formale Reporting-Verzögerungen, die kurzfristig nachgereicht werden können.

Empfehlung: Operationalisieren Sie das Compliance-Risiko über ein dediziertes Compliance-Monitoring-Programm mit jährlichem Self-Assessment je Geschäftsbereich.

Quellen:
- MaRisk
- KWG, GwG
- VO (EU) 2022/2554 (DORA)
- VO (EU) 2024/1689 (AI Act)`;
}

function operationelleRisiken(ctxName) {
  return `Typische operationelle Risiken in "${ctxName}":

1. Prozessrisiken
- Fehlerhafte Datenerfassung, fehlende Pflichtfelder, fehlerhafte Übergaben zwischen Systemen.

2. Personalrisiken
- Wissensverlust durch Personalwechsel, fehlende Stellvertreterregelungen, unzureichende Schulung.

3. IT- & Systemrisiken
- Verfügbarkeit (RTO/RPO), Datenintegrität, Schnittstellenausfälle, fehlerhafte Releases.

4. Externe Ereignisse
- Drittparteien-Ausfall (Custodian, Clearing, Cloud-Provider), Cyber-Angriffe, Naturkatastrophen.

Hinweis: Ein vollständiges operationelles Risikoprofil umfasst auch Reputations- und Modellrisiken — diese werden separat in den jeweiligen Risikoarten erfasst.

Quellen:
- MaRisk AT 4.1 – Risikomanagement
- BCBS 195 – Principles for the Sound Management of Operational Risk`;
}

function haeufigVergesseneRisiken() {
  return `Risiken, die in der Praxis besonders häufig übersehen werden:

Hohes Risiko:
- Auslagerungsrisiken (insb. Sub-Auslagerungen / Cloud)
- Modellrisiken bei KI-Modellen (Bias, fehlende Validierung)
- Cyber-Fraud im Zahlungsverkehr (Account Takeover, CEO-Fraud)

Mittleres Risiko:
- Konzentrationsrisiken bei Dienstleistern (Single-Vendor-Strategien)
- ESG-Reputationsrisiken (Greenwashing)
- Datenqualitäts-Risiken in der Meldewesen-Strecke

Geringes Risiko:
- Internationaler Posten- und Buchungsverkehr (Doppelbuchungen)

Empfehlung: Spielen Sie Ihre RKM gegen die ORX-Loss-Database und das BaFin-Aufsichtsprogramm — viele Banken decken weniger als 60 % der dort genannten Risikofelder ab.

Quellen:
- ORX Reference Tax
- BaFin Aufsichtsmitteilungen
- DORA Schutzziele`;
}

function rollenLoD() {
  return `Das Three-Lines-of-Defense-Modell strukturiert die Verantwortlichkeiten im IKS:

| Linie | Rolle | Verantwortlich für |
| --- | --- | --- |
| 1st LoD | Fachbereich | Operative Durchführung, Eigenkontrolle |
| 2nd LoD | Risiko, Compliance, OpRisk | Methodik, Überwachung, Konsolidierung |
| 3rd LoD | Interne Revision | Unabhängige Prüfung der Wirksamkeit |

Hinweis: Aufsicht und Geschäftsleitung tragen die Gesamtverantwortung — sie sind nicht Teil einer der drei Linien, sondern stehen darüber.

Empfehlung: Smart ICS unterstützt primär die 1st LoD bei der Inventarisierung und liefert der 2nd LoD eine konsistente, methodenkonforme Datenbasis.

Quellen:
- IIA Three Lines Model (2020)
- MaRisk AT 4.4
- BCBS 239 – Risk Data Aggregation`;
}

function regulatorischerRahmen() {
  return `Wesentliche regulatorische Anforderungen an Ihre RKM:

1. MaRisk
- AT 4.3 – Interne Kontrollverfahren
- BTO 1.2 – Kredit- und Handelsgeschäft
- BTR – Risikoarten

2. DORA (VO (EU) 2022/2554)
- IKT-Risikomanagement-Rahmen
- Testanforderungen, inkl. Threat-Led Penetration Testing
- Drittparteienrisikomanagement

3. EU AI Act (VO (EU) 2024/1689)
- Risikoklassifikation von KI-Systemen
- Anforderungen an Hochrisiko-KI (Governance, Bias, Logs)

4. KWG / GwG
- §18 KWG – Offenlegung der wirtschaftlichen Verhältnisse
- GwG §10 – Sorgfaltspflichten
- §25h KWG – Interne Sicherungsmaßnahmen

5. DSGVO
- Art. 30 – Verarbeitungsverzeichnis
- Art. 32 – Technisch-organisatorische Maßnahmen

Quellen:
- BaFin Veröffentlichungen
- EU-Verordnungen
- Bundesbank Rundschreiben`;
}

function prozessschritteKredit() {
  const aktivitaeten = DEMO_PROZESSE[0].aktivitaeten;
  return `Standard-Prozessschritte der Firmenkundenkreditvergabe:

| Nr. | Aktivität | Kurzbeschreibung |
| --- | --- | --- |
${aktivitaeten.map((a, i) => `| ${i+1} | ${a.name} | ${a.beschreibung.slice(0, 90)}… |`).join('\n')}

Hinweis: Smart ICS extrahiert diese Schritte automatisiert aus Ihrer Arbeitsanweisung. Sie können jederzeit Aktivitäten ergänzen, ändern oder löschen, bevor Sie zu Schritt 2 wechseln.

Quellen:
- Smart-ICS-Prozessbibliothek
- MaRisk BTO 1.2 (Kreditgeschäft)`;
}

function defaultStep1(ctxName) {
  return `Sie befinden sich in Schritt 1 – Prozessanalyse für "${ctxName}".

Hier extrahiert Smart ICS die relevanten Aktivitäten aus Ihrem Eingangsdokument (Word, PDF, Excel). Sie können die Aktivitäten:
- bestätigen (Häkchen)
- umbenennen und konkretisieren
- ergänzen, falls die KI eine Aktivität übersehen hat
- entfernen, wenn sie nicht zum Scope gehört

Tipp: Achten Sie auf eine Aktivitäts-Granularität, die zur Risikoidentifikation passt — typischerweise 6 bis 12 Aktivitäten je Prozess. Zu feine Aktivitäten erzeugen Doppel-Risiken, zu grobe übersehen Kontrolllücken.

Quellen:
- Smart-ICS-Workflow
- MaRisk AT 4.3.1`;
}

function defaultStep2(ctxName) {
  return `Sie befinden sich in Schritt 2 – Risikoidentifikation für "${ctxName}".

Pro Aktivität schlägt Smart ICS bis zu drei Risikokategorien vor — mit Confidence-Stufen:
- First Choice (höchste Confidence): Wird in der Regel ausgewählt.
- Second Choice: Häufige Begleitrisiken.
- Third Choice: Eher seltene, aber methodisch erfassbare Risikoarten.

Hinweis: Die Vorschläge basieren auf der Risikolandkarte Ihres Instituts und einer Modellbibliothek branchenüblicher NFR. Sie können jedes Risiko abwählen oder eigene ergänzen, falls die Aktivität institutsspezifische Risiken birgt.

Quellen:
- Smart-ICS-Risikolandkarte
- ORX Reference Taxonomy`;
}

function defaultStep3(ctxName) {
  return `Sie befinden sich in Schritt 3 – Risikobeschreibung für "${ctxName}".

Smart ICS schlägt für jedes ausgewählte Risiko eine prüffähige Beschreibung sowie eine Bewertung von Eintrittswahrscheinlichkeit und finanziellem Schaden vor. Empfohlene Inhalte:

1. Ursache
Was kann den Risikoeintritt auslösen?

2. Ereignis
Was tritt konkret ein?

3. Wirkung
Welche Konsequenz hat es für das Institut?

Beispiel: „Aufgrund unvollständiger KYC-Erhebung (Ursache) wird ein wirtschaftlich Berechtigter nicht erfasst (Ereignis), was eine FIU-Meldung und ein Bußgeld nach GwG nach sich zieht (Wirkung)."

Quellen:
- MaRisk AT 4.3.2
- ISO 31000 – Risk Management`;
}

function defaultStep4(ctxName) {
  return `Sie befinden sich in Schritt 4 – Kontrollidentifikation für "${ctxName}".

Smart ICS schlägt je Risiko bis zu vier Kontrollen vor. Wählen Sie eine als Schlüsselkontrolle aus und ergänzen Sie die W-Fragen.

Kontrolle: Empfohlene Schlüsselkontroll-Eigenschaften
- Präventiv, soweit möglich
- Automatisiert, sofern Risikolage es erlaubt
- Klare Verantwortlichkeit (Wer)
- Frequenz: ideal je Transaktion
- Dokumentation im GRC-Tool verpflichtend

Empfehlung: Stellen Sie sicher, dass jede ausgewählte Schlüsselkontrolle jährlich auf Wirksamkeit getestet wird (Effectiveness-Test) und Findings in die Risikofall-Datenbank zurückfließen.

Quellen:
- MaRisk AT 4.3.1
- IDW PS 261 n. F.`;
}

function defaultRkm(session) {
  const selected = session ? Object.values(session.risikoCandidates).flat().filter(r => r.selected).length : 0;
  const keyControls = session ? Object.values(session.kontrollCandidates).flat().filter(k => k.selected && k.isKey).length : 0;

  return `Aktueller Stand Ihrer Risiko-Kontroll-Matrix:

| Kennzahl | Wert |
| --- | --- |
| Ausgewählte Risiken | ${selected} |
| Schlüsselkontrollen | ${keyControls} |
| Kontroll-Coverage | ${selected ? Math.round((keyControls / selected) * 100) : 0} % |

Empfehlung: Streben Sie eine Coverage von 100 % an — d.h. jedes wesentliche Risiko hat mindestens eine dokumentierte Schlüsselkontrolle. Lücken markieren Sie mit Maßnahmen-Plan.

Quellen:
- Smart-ICS-Sessiondaten
- MaRisk AT 4.3.4`;
}

function defaultMethodik() {
  return phasenIKS();
}
