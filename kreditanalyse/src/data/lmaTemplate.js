// =============================================================================
// LMA-Kreditvertrag Template (basierend auf vdp Standard Loan Agreement)
// Deutsche Version fuer gewerbliche Kreditvertraege
// =============================================================================

/**
 * Template-Struktur mit Platzhaltern fuer die KI-gesteuerte Vertragserstellung.
 * Platzhalter im Format {{VARIABLE}} werden durch tatsaechliche Daten ersetzt.
 *
 * Basiert auf: STANDARD LOAN AGREEMENT - INVESTMENT PORTFOLIO LOAN SPV
 * (vdp-Bankstandard, Version 11.03.2025)
 */

export const LMA_TEMPLATE_STRUCTURE = `
KREDITVERTRAG
(Standardisierter Kreditvertrag nach vdp/LMA-Standard)

Zwischen

{{KREDITNEHMER_FIRMA}}
{{KREDITNEHMER_RECHTSFORM}}, eingetragen im Handelsregister des {{KREDITNEHMER_AMTSGERICHT}} unter {{KREDITNEHMER_HRB}}
{{KREDITNEHMER_ADRESSE}}

– nachfolgend „Kreditnehmer" genannt –

und

{{KREDITGEBER_NAME}}
{{KREDITGEBER_ADRESSE}}
vertreten durch den Vorstand: {{KREDITGEBER_VORSTAND}}

– nachfolgend „Bank" genannt –


Inhaltsverzeichnis

§ 1  Präambel
§ 2  Definitionen
§ 3  Darlehensnennbetrag
§ 4  Zweckbindung
§ 5  Laufzeit
§ 6  Bereitstellungszeitraum
§ 7  Auszahlung
§ 8  Zinsen
§ 9  Zahlung und Verzug
§ 10 Ordentliche Tilgung und Sondertilgung
§ 11 Gebühren und Kosten
§ 12 Sicherheiten
§ 13 Auszahlungsvoraussetzungen
§ 14 Zusicherungen und Gewährleistungen
§ 15 Informationspflichten
§ 16 Financial Covenants
§ 17 Allgemeine Auflagen
§ 18 Kündigung
§ 19 Abtretung und Bankgeheimnis
§ 20 Gerichtsstand und anwendbares Recht
§ 21 Schriftform
§ 22 Salvatorische Klausel
§ 23 Unterschriften
Anlage 1: Sicherheitenverzeichnis
Anlage 2: Auszahlungsvoraussetzungen
Anlage 3: Tilgungsplan


§ 1 PRÄAMBEL

1.1 Kreditnehmer
Der Kreditnehmer ist eine {{KREDITNEHMER_RECHTSFORM}} mit Sitz in {{KREDITNEHMER_ORT}}, eingetragen im Handelsregister des {{KREDITNEHMER_AMTSGERICHT}} unter {{KREDITNEHMER_HRB}}, gegründet {{KREDITNEHMER_GRUENDUNG}}.

Die Geschäftsführung besteht aus:
{{KREDITNEHMER_GF}}

1.2 Sicherungsgut
{{SICHERHEITEN_BESCHREIBUNG}}
(das „Sicherungsgut").

1.3 Gesamtkosten
Die Gesamtinvestitionskosten belaufen sich auf {{INVESTITIONSSUMME}}, wovon der Kreditnehmer einen Eigenanteil von {{EIGENANTEIL}} einbringt.

1.4 Finanzierungsstruktur
Investitionskredit: {{KREDITBETRAG}}
Eigenanteil: {{EIGENANTEIL}}

1.5 Finanzdokumente
„Finanzdokumente" im Sinne dieses Vertrags sind dieser Vertrag, alle Sicherungsverträge und alle weiteren Dokumente, die Bank und Kreditnehmer gemeinsam als Finanzdokumente bestimmen.


§ 2 DEFINITIONEN

Die nachfolgenden Begriffe haben in diesem Kreditvertrag folgende Bedeutung:

„Auszahlungstag" bezeichnet den Tag der erstmaligen Auszahlung des Darlehens.
„Bereitstellungszeitraum" bezeichnet den Zeitraum vom Datum dieses Vertrags bis zum {{AUSZAHLUNGSDATUM}}.
„Darlehensnennbetrag" bezeichnet den Betrag von {{KREDITBETRAG}} (in Worten: {{KREDITBETRAG_WORT}} Euro).
„Effektiver Jahreszins" bezeichnet den effektiven Jahreszins in Höhe von {{EFFEKTIVZINS}}% p.a.
„Endgültiger Rückzahlungstag" bezeichnet den Tag, an dem das Darlehen vollständig zurückzuzahlen ist.
„Financial Covenants" bezeichnet die in § 16 vereinbarten Finanzkennzahlen.
„Kreditnehmer" bezeichnet {{KREDITNEHMER_FIRMA}}.
„Ordentliche Rückzahlung" bezeichnet die in § 10 vereinbarten Tilgungsraten.
„Sicherheiten" bezeichnet die in § 12 und Anlage 1 aufgeführten Sicherheiten.
„Sollzinssatz" bezeichnet den vereinbarten Sollzinssatz in Höhe von {{SOLLZINS}}% p.a.
„Zinszahlungstag" bezeichnet jeweils den letzten Geschäftstag eines Kalendermonats.


§ 3 DARLEHENSNENNBETRAG

Die Bank gewährt dem Kreditnehmer ein Darlehen (nachfolgend „Darlehen") in Höhe von

{{KREDITBETRAG}}
(in Worten: {{KREDITBETRAG_WORT}} Euro)

(dieser Betrag wird nachfolgend als „Darlehensnennbetrag" bezeichnet).


§ 4 ZWECKBINDUNG

Das Darlehen dient ausschließlich der Finanzierung von: {{VERWENDUNGSZWECK}}.

Der Kreditnehmer hat auf Verlangen der Bank jederzeit unverzüglich die zweckentsprechende Verwendung der Darlehensmittel nachzuweisen. Im Falle einer zweckwidrigen Verwendung der Darlehensmittel ist die Bank zur außerordentlichen Kündigung gemäß § 18 berechtigt.


§ 5 LAUFZEIT

Das Darlehen hat eine Laufzeit von {{LAUFZEIT}} Monaten und ist am {{ENDDATUM}} vollständig an die Bank zurückzuzahlen (der „Endgültige Rückzahlungstag").


§ 6 BEREITSTELLUNGSZEITRAUM

Die Bank stellt dem Kreditnehmer das Darlehen bis zum {{AUSZAHLUNGSDATUM}} zur Abrufung bereit (der „Bereitstellungszeitraum"). Der Kreditnehmer hat das Darlehen innerhalb des Bereitstellungszeitraums in einer Summe abzurufen.

Wird das Darlehen innerhalb des Bereitstellungszeitraums nicht oder nicht vollständig abgerufen, erlischt der Anspruch des Kreditnehmers auf Auszahlung des nicht abgerufenen Teilbetrags automatisch am Ende des Bereitstellungszeitraums.


§ 7 AUSZAHLUNG

7.1 Die Bank zahlt das Darlehen nach Erfüllung sämtlicher Auszahlungsvoraussetzungen gemäß § 13 auf das vom Kreditnehmer benannte Konto aus.

7.2 Die Auszahlung erfolgt zum Kurs von 100% (einhundert Prozent) des Darlehensnennbetrags.

7.3 Sollte der Kreditnehmer eine Auszahlung zu einem vereinbarten Termin nicht abrufen, trägt er die der Bank dadurch entstehenden Kosten und Schäden.


§ 8 ZINSEN

8.1 Zinsperioden
Die Zinsperiode beträgt jeweils einen Kalendermonat. Die erste Zinsperiode beginnt am Tag der Auszahlung.

8.2 Sollzinssatz
Der Kreditnehmer zahlt der Bank für das Darlehen einen festen Sollzinssatz in Höhe von {{SOLLZINS}}% p.a. ({{SOLLZINS}} Prozent per annum).

8.3 Effektiver Jahreszins
Der effektive Jahreszins beträgt {{EFFEKTIVZINS}}% p.a.

8.4 Zinszahlungstermine
Die Zinsen sind monatlich nachträglich jeweils am letzten Geschäftstag eines jeden Kalendermonats fällig und zahlbar (die „Zinszahlungstage").

8.5 Zinsberechnung
Die Zinsberechnung erfolgt auf der Grundlage actual/360 (tatsächliche Tage / 360).


§ 9 ZAHLUNG UND VERZUG

9.1 Zahlungspünktlichkeit
Für die Rechtzeitigkeit der Zahlungen des Kreditnehmers ist der Tag des Eingangs der jeweiligen Beträge auf dem Konto der Bank maßgebend.

9.2 Verzugsbeginn
Der Kreditnehmer gerät auch ohne vorherige Mahnung in Verzug, wenn eine fällige Zahlung nicht am Fälligkeitstag eingeht.

9.3 Verzugszinsen
Im Falle des Verzugs hat der Kreditnehmer der Bank Verzugszinsen in Höhe von 5 Prozentpunkten über dem jeweils geltenden Basiszinssatz der Europäischen Zentralbank zu zahlen. Die Geltendmachung eines weitergehenden Verzugsschadens bleibt vorbehalten.


§ 10 ORDENTLICHE TILGUNG UND SONDERTILGUNG

10.1 Ordentliche Tilgung
Das Darlehen wird in gleichen monatlichen Raten in Höhe von {{MONATLICHE_RATE}} zurückgezahlt (Annuität).

Die erste Tilgungsrate wird am {{ERSTE_RATE}} fällig. {{TILGUNGSFREI_TEXT}}

Die ordentlichen Tilgungsraten sind jeweils am letzten Geschäftstag eines jeden Kalendermonats fällig (die „Rückzahlungstage").

10.2 Freiwillige Sondertilgungen
Der Kreditnehmer kann ganz oder teilweise freiwillige Sondertilgungen vornehmen, sofern er der Bank die beabsichtigte Sondertilgung mindestens 10 Bankarbeitstage im Voraus schriftlich anzeigt. Bei Sondertilgungen kann die Bank eine Vorfälligkeitsentschädigung gemäß § 502 BGB berechnen.


§ 11 GEBÜHREN UND KOSTEN

11.1 Bereitstellungsprovision
Der Kreditnehmer zahlt der Bank ab dem {{BEREITSTELLUNG_AB}} eine laufende Bereitstellungsprovision in Höhe von {{BEREITSTELLUNGSPROVISION}}% p.a. auf den nicht in Anspruch genommenen Teil des Darlehens.

11.2 Sonstige Kosten
Sämtliche Kosten, Gebühren und Auslagen, die im Zusammenhang mit der Vorbereitung, dem Abschluss und der Durchführung dieses Vertrags sowie der Bestellung, Änderung und Freigabe von Sicherheiten entstehen, trägt der Kreditnehmer.


§ 12 SICHERHEITEN

Der Kreditnehmer stellt der Bank die in Anlage 1 („Sicherheitenverzeichnis") aufgeführten Sicherheiten durch gesonderte Vereinbarungen (die „Sicherungsverträge") bzw. lässt diese bestellen.

Zusammenfassung der vereinbarten Sicherheiten:
{{SICHERHEITEN_TABELLE}}

Bei mehreren Sicherheiten hat die Bank die Wahl, welche Sicherheit sie in Anspruch nimmt. Die Bank ist berechtigt, die Sicherheiten in beliebiger Reihenfolge und in beliebigem Umfang zu verwerten.


§ 13 AUSZAHLUNGSVORAUSSETZUNGEN

Die Bank ist nur dann zur Auszahlung des Darlehens verpflichtet, wenn sämtliche nachfolgenden Voraussetzungen erfüllt sind:

a) Einreichung aller nach § 18 KWG erforderlichen Unterlagen
b) Bestellung sämtlicher vereinbarter Sicherheiten gemäß § 12
c) Abgabe der Zusicherungen und Gewährleistungen gemäß § 14
d) Nachweis der Einhaltung der Financial Covenants gemäß § 16
e) Nachweis des Eigenanteils in Höhe von {{EIGENANTEIL}}
f) Vorlage eines aktuellen Handelsregisterauszugs (nicht älter als 4 Wochen)
g) Vorlage des letzten testierten Jahresabschlusses
h) Keine wesentliche nachteilige Änderung der wirtschaftlichen Verhältnisse des Kreditnehmers seit Datum dieses Vertrags


§ 14 ZUSICHERUNGEN UND GEWÄHRLEISTUNGEN

Der Kreditnehmer gibt gegenüber der Bank bei Unterzeichnung dieses Vertrags folgende Zusicherungen und Gewährleistungen ab:

14.1 Status
Der Kreditnehmer ist eine ordnungsgemäß errichtete und wirksam bestehende Gesellschaft.

14.2 Gültigkeit der Finanzdokumente
Die Finanzdokumente begründen rechtsgültige und verbindliche Verpflichtungen des Kreditnehmers.

14.3 Keine Pflichtverletzung
Die Eingehung der Verpflichtungen aus den Finanzdokumenten verstößt gegen keine gesetzlichen oder vertraglichen Regelungen.

14.4 Keine Kündigungsgründe
Zum Zeitpunkt des Vertragsschlusses liegt kein Kündigungsgrund und kein Ereignis vor, das mit Zeitablauf oder Benachrichtigung einen Kündigungsgrund darstellen würde.

14.5 Insolvenz
Es liegen keine Insolvenzgründe vor.

14.6 Steuern und Abgaben
Alle Steuer- und Abgabenpflichten werden ordnungsgemäß erfüllt.

14.7 Sorgfältige Erstellung der Jahresabschlüsse
Die dem Kreditgeber vorgelegten Jahresabschlüsse wurden nach den Grundsätzen ordnungsgemäßer Buchführung erstellt und vermitteln ein den tatsächlichen Verhältnissen entsprechendes Bild der Vermögens-, Finanz- und Ertragslage.

14.8 Versicherungsschutz
Das Sicherungsgut ist in angemessenem und branchenüblichem Umfang versichert.

14.9 Wiederholung
Der Kreditnehmer verpflichtet sich, die vorstehenden Zusicherungen vor jeder Auszahlung und an jedem Zinszahlungstag zu wiederholen.


§ 15 INFORMATIONSPFLICHTEN

15.1 Offenlegung der wirtschaftlichen Verhältnisse
Der Kreditnehmer legt der Bank innerhalb von 6 Monaten nach Ablauf eines jeden Geschäftsjahres den testierten Jahresabschluss nebst Lagebericht vor.

15.2 Laufende Berichterstattung
Der Kreditnehmer reicht der Bank quartalsweise eine betriebswirtschaftliche Auswertung (BWA) mit Summen- und Saldenliste ein.

15.3 Mitteilungspflichten
Der Kreditnehmer informiert die Bank unverzüglich über:
a) Wesentliche Veränderungen der Gesellschafterstruktur oder Geschäftsführung
b) Rechtsstreitigkeiten oder behördliche Verfahren von wesentlicher Bedeutung
c) Jedes Ereignis, das einen Kündigungsgrund gemäß § 18 darstellen könnte
d) Wesentliche Veränderungen der wirtschaftlichen Verhältnisse


§ 16 FINANCIAL COVENANTS

Der Kreditnehmer verpflichtet sich, während der gesamten Laufzeit dieses Vertrags folgende Finanzkennzahlen einzuhalten:

16.1 Eigenkapitalquote
Die Eigenkapitalquote (Eigenkapital / Bilanzsumme × 100) darf zu keinem Zeitpunkt {{COVENANT_EK_QUOTE}}% unterschreiten.

16.2 Dynamischer Verschuldungsgrad
Der dynamische Verschuldungsgrad (Nettofinanzverbindlichkeiten / EBITDA) darf zu keinem Zeitpunkt {{COVENANT_VERSCHULDUNG}} Jahre überschreiten.

16.3 Kapitaldienstdeckungsgrad
Der Kapitaldienstdeckungsgrad (Cashflow nach Steuern / Kapitaldienst) muss zu jedem Berechnungsstichtag mindestens 1,2x betragen.

16.4 Compliance Certificate
Der Kreditnehmer legt der Bank halbjährlich innerhalb von 30 Tagen nach dem jeweiligen Berechnungsstichtag eine von der Geschäftsführung unterzeichnete Bestätigung über die Einhaltung der Financial Covenants vor.

16.5 Covenant-Verletzung
Bei Verletzung eines Financial Covenants ist die Bank berechtigt, erhöhte Zinsen zu verlangen, zusätzliche Sicherheiten anzufordern oder den Kredit gemäß § 18 zu kündigen.


§ 17 ALLGEMEINE AUFLAGEN

17.1 Negativerklärung
Der Kreditnehmer wird ohne vorherige schriftliche Zustimmung der Bank keine dinglichen Sicherheiten zugunsten Dritter bestellen oder bestellen lassen.

17.2 Zweckgebundene Mittelverwendung
Die ausgezahlten Darlehensmittel sind ausschließlich für den in § 4 genannten Zweck zu verwenden.

17.3 Kontenführung
Der Kreditnehmer führt seinen wesentlichen Zahlungsverkehr über die Bank.

17.4 Versicherungen
Der Kreditnehmer ist verpflichtet, das Sicherungsgut angemessen zu versichern und die Versicherungsansprüche an die Bank abzutreten.


§ 18 KÜNDIGUNG

18.1 Ordentliches Kündigungsrecht des Kreditnehmers
Der Kreditnehmer kann das Darlehen unter Einhaltung einer Frist von 3 Monaten zum Ende einer Zinsperiode ordentlich kündigen.

18.2 Außerordentliches Kündigungsrecht der Bank
Die Bank kann den Kredit ganz oder teilweise aus wichtigem Grund fristlos kündigen, wenn die Fortsetzung des Kreditverhältnisses der Bank unter Berücksichtigung der berechtigten Interessen des Kreditnehmers unzumutbar ist. Wichtige Gründe sind insbesondere:

a) Verzug mit Zins- oder Tilgungszahlungen von mehr als 14 Tagen
b) Verletzung von Financial Covenants gemäß § 16 ohne Heilung innerhalb von 30 Tagen
c) Wesentlich unrichtige oder unvollständige Zusicherungen gemäß § 14
d) Verletzung wesentlicher Vertragspflichten
e) Wesentliche Verschlechterung der wirtschaftlichen Verhältnisse des Kreditnehmers
f) Insolvenzantrag oder Eröffnung eines Insolvenzverfahrens
g) Zweckwidrige Verwendung der Darlehensmittel
h) Kündigung oder Wegfall von Sicherheiten ohne gleichwertigen Ersatz

18.3 Vorfälligkeitsentschädigung
Im Falle einer vorzeitigen Rückzahlung kann die Bank eine Vorfälligkeitsentschädigung gemäß § 502 BGB verlangen.


§ 19 ABTRETUNG UND BANKGEHEIMNIS

19.1 Abtretung durch die Bank
Die Bank ist berechtigt, ihre Rechte und Pflichten aus diesem Vertrag ganz oder teilweise an Dritte abzutreten oder zu übertragen. Die Bank wird den Kreditnehmer über eine Abtretung informieren.

19.2 Befreiung vom Bankgeheimnis
Der Kreditnehmer befreit die Bank im gesetzlich zulässigen Umfang vom Bankgeheimnis, soweit dies für eine Abtretung, Syndizierung oder Refinanzierung erforderlich ist.


§ 20 GERICHTSSTAND UND ANWENDBARES RECHT

Für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag sind ausschließlich die Gerichte in {{GERICHTSSTAND}} zuständig. Erfüllungsort ist {{GERICHTSSTAND}}.

Dieser Vertrag unterliegt dem Recht der Bundesrepublik Deutschland.


§ 21 SCHRIFTFORM

Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Dies gilt auch für die Aufhebung des Schriftformerfordernisses.


§ 22 SALVATORISCHE KLAUSEL

Sollte eine Bestimmung dieses Vertrages unwirksam oder undurchführbar sein oder werden, so wird die Wirksamkeit der übrigen Bestimmungen hierdurch nicht berührt. Die Parteien verpflichten sich, die unwirksame Bestimmung durch eine wirksame Regelung zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.


§ 23 UNTERSCHRIFTEN


{{ORT}}, den {{DATUM}}


_________________________________          _________________________________
{{KREDITGEBER_NAME}}                       {{KREDITNEHMER_FIRMA}}
(Bank)                                     (Kreditnehmer)

_________________________________          _________________________________
{{KREDITGEBER_VORSTAND}}                   {{KREDITNEHMER_GF_NAMEN}}


ANLAGE 1: SICHERHEITENVERZEICHNIS

{{SICHERHEITEN_ANLAGE}}


ANLAGE 2: AUSZAHLUNGSVORAUSSETZUNGEN

1. Einreichung des aktuellen Handelsregisterauszugs
2. Vorlage des letzten testierten Jahresabschlusses
3. Nachweis des Eigenanteils
4. Bestellung sämtlicher Sicherheiten gemäß § 12
5. Vorlage aller nach § 18 KWG erforderlichen Unterlagen
6. Nachweis des Versicherungsschutzes für das Sicherungsgut
7. Vorlage des von der Geschäftsführung unterzeichneten Compliance Certificate


ANLAGE 3: TILGUNGSPLAN

(wird bei Auszahlung erstellt)
`;

/**
 * Platzhalter-Mapping: Ordnet den Template-Variablen die Datenpfade zu
 */
export const TEMPLATE_PLACEHOLDERS = {
  KREDITNEHMER_FIRMA: 'firma',
  KREDITNEHMER_RECHTSFORM: 'rechtsform',
  KREDITNEHMER_AMTSGERICHT: 'amtsgericht',
  KREDITNEHMER_HRB: 'hrb',
  KREDITNEHMER_ADRESSE: 'adresse',
  KREDITNEHMER_ORT: 'adresse.ort',
  KREDITNEHMER_GRUENDUNG: 'gruendung',
  KREDITNEHMER_GF: 'gf',
  KREDITNEHMER_GF_NAMEN: 'gf_namen',
  KREDITGEBER_NAME: 'kreditgeber.name',
  KREDITGEBER_ADRESSE: 'kreditgeber.adresse',
  KREDITGEBER_VORSTAND: 'kreditgeber.vorstand',
  KREDITBETRAG: 'kredit.betrag',
  KREDITBETRAG_WORT: 'kredit.betragWort',
  VERWENDUNGSZWECK: 'kredit.verwendung',
  LAUFZEIT: 'kredit.laufzeit',
  SOLLZINS: 'zinsen.sollzins',
  EFFEKTIVZINS: 'zinsen.effektivzins',
  MONATLICHE_RATE: 'zinsen.monatlicheRate',
  AUSZAHLUNGSDATUM: 'kredit.auszahlung',
  COVENANT_EK_QUOTE: 'covenants.ekQuote',
  COVENANT_VERSCHULDUNG: 'covenants.dynVerschuldung',
};
