---
dokument_id: FH-SCH-2026-021
titel: Fachhandbuch Schadenmanagement Komposit (Sach-/Haftpflicht)
typ: Fachhandbuch
version: "5.0"
gueltig_ab: 30.06.2026
eigentuemer: Bereichsleitung Schaden/Leistung Komposit
methodische_aufsicht: Operational Risk & Compliance (2nd Line of Defense)
klassifizierung: VERTRAULICH — Stufe 2 (Internal Use Only) — synthetische Demo-Daten
prozess_id: antragsmanagement
kategorie: Versicherung
regulatorik:
  - Versicherungsvertragsgesetz (VVG)
  - Versicherungsaufsichtsgesetz (VAG)
  - Richtlinie (EU) 2016/97 (IDD); DVO (EU) 2017/2358 (POG)
  - Verordnung (EU) Nr. 2015/35 (Solvency II); HGB § 341e ff.
  - DSGVO Art. 6, 9, 22
  - GwG (Lebens-/Unfallversicherung mit Sparanteil)
---

# Fachhandbuch Schadenmanagement Komposit (Sach-/Haftpflicht)

> Synthetisches Demo-Dokument für Smart ICS — alle Namen, Zahlen und Sachverhalte sind frei erfunden.

Schlüsselprozess SCH-01 — Bearbeitung von Schadenfällen in der Sach- und Haftpflichtversicherung.

## Metadaten

| Feld | Wert |
| --- | --- |
| Dokument-ID | FH-SCH-2026-021 |
| Version | 5.0 (Überarbeitung Betrugsabwehr und Reservierung) |
| Gültig ab | 30.06.2026 |
| Geltungsdauer | 12 Monate |
| Eigentümer | Bereichsleitung Schaden/Leistung Komposit |
| Methodische Aufsicht | Operational Risk & Compliance (2nd Line of Defense) |
| Regulatorischer Rahmen | VVG; VAG; IDD/POG; Solvency II; HGB § 341e ff.; DSGVO |
| Klassifizierung | VERTRAULICH — Stufe 2 (Internal Use Only). |
| Genehmigung | Vorstand Schaden/Leistung (Herr Dr. P. Hoffmann); Gesamtvorstand · Sitzung Q1/2026 |
| Geltungsraum | Komposit-Sparten (Sach, Haftpflicht, Unfall); ausgenommen: Kranken-/Lebensleistung (eigene Handbücher) |

## Versionshistorie

| Version | Datum | Autor | Änderung |
| --- | --- | --- | --- |
| v1.0 | 03.05.2016 | Schaden-Lead | Erstfassung Schadenprozess Komposit |
| v2.0 | 22.05.2018 | C. Reinhardt | IDD/POG-Anforderungen eingearbeitet |
| v3.0 | 09.11.2020 | C. Reinhardt / Aktuariat | Reservierungslogik an Solvency II angepasst |
| v4.0 | 18.04.2023 | M. Sauer / OpRisk | Frühwarn- und Betrugsindikatoren ergänzt |
| v4.1 | 02.10.2025 | M. Sauer | Auslagerung Gutachter-/Schadensteuerung (DORA-Bezug) |
| v5.0 | 30.06.2026 | M. Sauer | Überarbeitung Betrugsabwehr und Reservierung |

## Inhaltsverzeichnis

1. Geltungsbereich, Zweck und Adressaten
2. Begriffsbestimmungen
3. Rechtsgrundlagen und Bezugsdokumente
4. Organisatorische Rahmenbedingungen
5. Schadenanlage und Erstkontakt
6. Deckungs- und Policenprüfung
7. Schadenermittlung und Gutachter
8. Reservebildung
9. Regulierungsentscheidung
10. Auszahlung
11. Betrugsabwehr (Schadenfraud)
12. Regress und Subrogation
13. Kennzahlen und laufende Überwachung
14. Risiko-Kontroll-Sicht (für Smart ICS)
15. Anhänge

## 1. Geltungsbereich, Zweck und Adressaten

Dieses Fachhandbuch regelt die End-to-End-Bearbeitung von Schadenfällen in den Komposit-Sparten — von der Schadenmeldung über die Deckungsprüfung, Schadenermittlung, Reservierung und Regulierungsentscheidung bis zur Auszahlung sowie Regress. Adressaten sind alle Mitarbeitenden der Schaden-/Leistungsabteilung, die angeschlossene Schadensteuerung sowie eingebundene externe Dienstleister (Gutachter, Sanierer, Werkstätten).

> **Hinweis — Kundeninteresse:** Die Schadenregulierung erfolgt nach dem Grundsatz von Treu und Glauben und unter Beachtung der Wohlverhaltenspflichten gemäß IDD. Berechtigte Ansprüche sind zügig und vollständig zu regulieren; unberechtigte Ansprüche sind nachvollziehbar und kundengerecht abzulehnen.

## 2. Begriffsbestimmungen

| Begriff | Definition |
| --- | --- |
| Police | Versicherungsvertrag mit den vereinbarten Deckungen, Summen und Bedingungen. |
| Deckungsumfang | Versicherte Gefahren, Versicherungssumme, Selbstbehalt und Ausschlüsse gemäß Bedingungswerk. |
| Selbstbehalt (SB) | Vom Versicherungsnehmer im Schadenfall selbst zu tragender Betrag. |
| Einzelschadenreserve | Versicherungstechnische Rückstellung für den erwarteten Aufwand eines gemeldeten Schadens. |
| Spätschadenreserve (IBNR) | Rückstellung für eingetretene, aber noch nicht (vollständig) gemeldete Schäden. |
| Regress / Subrogation | Übergang von Ersatzansprüchen des Versicherungsnehmers auf den Versicherer (§ 86 VVG). |
| Schadenquote | Verhältnis von Schadenaufwand zu verdienten Beiträgen. |
| Schadenfraud | Vorsätzliche Täuschung zur Erlangung einer ungerechtfertigten Versicherungsleistung. |

## 3. Rechtsgrundlagen und Bezugsdokumente

- Versicherungsvertragsgesetz (VVG) — insbesondere Obliegenheiten, Fälligkeit der Leistung (§ 14), Regress (§ 86).
- Versicherungsaufsichtsgesetz (VAG) — Geschäftsorganisation, Outsourcing (§ 32), versicherungstechnische Rückstellungen.
- Richtlinie (EU) 2016/97 (IDD) und DVO (EU) 2017/2358 (Product Oversight and Governance, POG).
- Verordnung (EU) Nr. 2015/35 (Solvency II, Delegierte Verordnung) — Bewertung versicherungstechnischer Rückstellungen; HGB § 341e ff.
- DSGVO Art. 6, 9 (Gesundheitsdaten), 22 (automatisierte Entscheidungen).
- GwG (soweit Sparanteile / Auszahlungen einschlägig).
- Interne Bezugsdokumente: Reservierungsrichtlinie Aktuariat (RR-AKT-2025), Dienstleisterregister Schadensteuerung (AR-SCH-LIVE), Methodenhandbuch Risiko- & Kontroll-Taxonomie (MH-IKS-2026-001).

## 4. Organisatorische Rahmenbedingungen

| Rolle | LoD | Wesentliche Verantwortung |
| --- | --- | --- |
| Schadensachbearbeiter | 1st | Schadenanlage, Deckungs-/Anspruchsprüfung, Korrespondenz, Regulierungsvorschlag. |
| Schadenfachreferent / Teamleiter | 1st | Vier-Augen-Freigabe ab Schwelle, fachliche Eskalation. |
| Aktuariat / Reservierung | 1st | Reservierungsmethodik, IBNR, Plausibilisierung der Einzelreserven. |
| Betrugsabwehr (SIU) | 1st/2nd | Bearbeitung von Betrugsverdachtsfällen, Sonderermittlungen. |
| Operational Risk Manager | 2nd | IKS-Steuerung, Stichproben, Schadensfall-Datenbank. |
| Compliance / Datenschutz | 2nd | IDD-/DSGVO-Überwachung, Beschwerdemanagement-Aufsicht. |
| Auslagerungsbeauftragter | 2nd | Steuerung externer Gutachter/Schadensteuerung (DORA/VAG § 32). |
| Interne Revision | 3rd | Unabhängige Prüfung der Regulierungs- und Reservierungspraxis. |

## 5. Schadenanlage und Erstkontakt

Die Schadenmeldung kann über App, Telefon, Vermittler oder Portal eingehen. Jeder Schaden wird unverzüglich im Schadensystem (SchadOS) mit eindeutiger Schadennummer (Schema: SCH-JJJJMM-#####) angelegt. Pflichtangaben: Vertragsbezug, Schadentag, Schadenort, Schadenhergang, Anspruchsteller, geschätzte Schadenhöhe.

> **Hinweis — Erstinformation:** Dem Anspruchsteller sind gemäß IDD die wesentlichen Informationen zum Bearbeitungsstand zeitnah bereitzustellen. Eingangsbestätigung und Ansprechpartner werden binnen 2 Werktagen kommuniziert.

## 6. Deckungs- und Policenprüfung

Vor jeder Regulierung ist die Deckung zu prüfen: Bestehen und Wirksamkeit der Police am Schadentag, versicherte Gefahr, Versicherungssumme, Selbstbehalt, Ausschlüsse, Obliegenheitsverletzungen und Vorschäden. Bei Unterversicherung ist die anteilige Kürzung gemäß Bedingungswerk zu berücksichtigen.

## 7. Schadenermittlung und Gutachter

Je nach Schadenhöhe und Komplexität erfolgt die Ermittlung durch Foto-Inspektion (App), Werkstattbeurteilung oder Bestellung eines Sachverständigen. Externe Gutachter werden über das Dienstleisterregister gesteuert; Beauftragung, Bearbeitungszeit und Qualität unterliegen SLA-Monitoring.

| Schadenhöhe | Ermittlungsweg | Bearbeitung |
| --- | --- | --- |
| bis 1.500 EUR | Foto-Inspektion / Kostenvoranschlag | Schadensachbearbeiter |
| 1.500 EUR bis 15.000 EUR | Werkstatt-/Sanierer-Beurteilung | Schadensachbearbeiter + Stichprobe |
| 15.000 EUR bis 100.000 EUR | Externer Gutachter | Fachreferent + Vier-Augen |
| über 100.000 EUR | Gutachter + Sonderprüfung | Teamleiter + Aktuariat |

## 8. Reservebildung

Für jeden Schaden ist unverzüglich eine angemessene Einzelschadenreserve zu bilden und bei neuen Erkenntnissen anzupassen. Die Reservierung folgt der Reservierungsrichtlinie RR-AKT-2025 und den Bewertungsgrundsätzen nach Solvency II bzw. HGB § 341e ff.

> **Achtung (Risiko) — Reserve-Adäquanz:** Eine systematische Unter- oder Überdotierung der Reserven verstößt gegen versicherungstechnische Rückstellungspflichten (Solvency II / HGB § 341e). Wesentliche Reservesprünge sind dem Aktuariat zu melden und zu begründen.

## 9. Regulierungsentscheidung

Die Regulierungsentscheidung (volle Regulierung, Teilregulierung, Ablehnung) erfolgt im Vier-Augen-Prinzip ab definierter Schwelle. Ablehnungen und Kürzungen sind schriftlich und nachvollziehbar zu begründen. Kulanzentscheidungen sind gesondert zu kennzeichnen und zu genehmigen.

| Regulierungsbetrag | Freigabe | Anmerkung |
| --- | --- | --- |
| bis 5.000 EUR | Schadensachbearbeiter | im Rahmen der Vollmacht |
| 5.000 EUR bis 50.000 EUR | Fachreferent (4-Augen) | mit dokumentiertem Vorschlag |
| 50.000 EUR bis 250.000 EUR | Teamleiter + Fachreferent | Sondervotum bei Ablehnung |
| über 250.000 EUR | Bereichsleitung Schaden | Aktuariat eingebunden |

## 10. Auszahlung

Die Auszahlung erfolgt nach freigegebener Regulierungsentscheidung an Versicherungsnehmer, Werkstatt oder berechtigte Dritte. Vor Anweisung sind Bankverbindung, Empfänger und Verwendungszweck zu plausibilisieren.

> **Achtung (Risiko) — Auszahlungsbetrug:** Bei neuen oder geänderten Kontoverbindungen ist eine Rückverifikation über einen unabhängigen Kanal verpflichtend. Auszahlungen auf Mitarbeiter- oder verbundene Konten sind technisch zu unterbinden bzw. besonders zu prüfen.

## 11. Betrugsabwehr (Schadenfraud)

Schadenfälle werden regelbasiert und ML-gestützt auf Betrugsindikatoren gescreent (z. B. Häufung, kurz nach Vertragsbeginn, widersprüchliche Angaben, kollusive Beteiligte). Auffällige Fälle werden an die Sonderermittlung (SIU) übergeben. Bei Verdacht auf strafbare Handlungen ist die rechtliche Bewertung einzuholen.

## 12. Regress und Subrogation

Nach Regulierung ist zu prüfen, ob Ersatzansprüche gegen Schädiger, deren Versicherer oder Vorversicherer bestehen (§ 86 VVG). Regressfälle werden fristgerecht geltend gemacht, um Verjährung zu vermeiden; die Regressquote wird gegen Branchen-Benchmarks überwacht.

## 13. Kennzahlen und laufende Überwachung

| Kennzahl | Schwellenwert | Maßnahme |
| --- | --- | --- |
| Durchschnittliche Bearbeitungsdauer | > 21 Tage | Steuerungsgespräch, Ressourcenprüfung. |
| Reserve-Abwicklungsdifferenz (Run-off) | > 10 % | Methodenreview Aktuariat. |
| Betrugsquote (erkannt) | < Zielwert | SIU-Szenarien nachschärfen. |
| Beschwerdequote | > 2 % der Fälle | Root-Cause-Analyse Beschwerdemanagement. |
| Regressquote | < Branchen-Benchmark | Ursachenanalyse, Prozessanpassung. |

## 14. Risiko-Kontroll-Sicht (für Smart ICS)

### d1 — Schadenmeldung
- **Risiko (operationelles-risiko / prozess):** Schadenmeldung wird nicht im richtigen System angelegt oder geht im Postlauf verloren.
  - Kontrolle: Zentrale Schadenanlage mit Pflichtfeldern und Eingangsbestätigung (präventiv, hybrid, je Transaktion).
- **Risiko (compliance-risiko / regulatorik):** Verstoß gegen IDD-Vorgaben zur Erstinformation des Kunden.
  - Kontrolle: Standardisierte Erstinformation mit Fristen-Monitoring (detektiv, hybrid, je Transaktion).

### d2 — Deckungsprüfung
- **Risiko (operationelles-risiko / human):** Falsche Deckungsprüfung führt zu unberechtigten Regulierungen oder Ablehnungen.
  - Kontrolle: Deckungs-Checkliste und Vier-Augen ab Schwelle (präventiv, manuell, je Transaktion).
- **Risiko (reputations-risiko / kunde):** Unklare Kommunikation zur Ablehnung erhöht das Beschwerdeaufkommen.
  - Kontrolle: Beschwerdemanagement mit Quartalsreport (detektiv, hybrid, anlassbezogen).

### d3 — Schadenermittlung
- **Risiko (finanzkriminalitaet / extern):** Versicherungsbetrug durch gefälschte Schadenbelege oder kollusive Gutachter.
  - Kontrolle: Betrugs-Screening (regelbasiert + ML) mit SIU-Übergabe (detektiv, automatisch, je Transaktion).
- **Risiko (auslagerungs-risiko / dienstleister):** Gutachter erfüllt SLA bei Bearbeitungszeit nicht.
  - Kontrolle: SLA-Monitoring der Schadensteuerung (detektiv, automatisch, monatlich).

### d4 — Reservebildung
- **Risiko (modell-risiko / modell):** Unter- oder Überdotierung der Reserven verstößt gegen Solvency II.
  - Kontrolle: Reservierungsmethodik mit aktuarieller Plausibilisierung und Run-off-Analyse (detektiv, hybrid, monatlich).
- **Risiko (compliance-risiko / regulatorik):** Verstoß gegen versicherungstechnische Rückstellungspflichten nach HGB § 341e.
  - Kontrolle: Modellvalidierung der Reservierungsmodelle (detektiv, manuell, jährlich).

### d5 — Regulierungsentscheidung
- **Risiko (finanzkriminalitaet / intern):** Manipulation der Regulierungsentscheidung zugunsten verbundener Personen.
  - Kontrolle: Funktionstrennung und 6-Augen für sensible Fälle (präventiv, manuell, je Transaktion).
- **Risiko (reputations-risiko / kunde):** Inkonsistente Regulierungspraxis führt zu öffentlicher Kritik.
  - Kontrolle: Stichprobenprüfung der Regulierungsqualität (detektiv, manuell, quartalsweise).

### d6 — Auszahlung
- **Risiko (finanzkriminalitaet / intern):** Auszahlung auf falsches Konto durch Manipulation oder Identitätsdiebstahl.
  - Kontrolle: Rückverifikation geänderter Bankverbindungen + Konto-Sperrlogik (präventiv, hybrid, je Transaktion).
- **Risiko (operationelles-risiko / system):** Doppelauszahlung durch Systemfehler.
  - Kontrolle: Duplikatserkennung und Tagesabschluss-Abstimmung (detektiv, automatisch, täglich).

### d7 — Regress & Subrogation
- **Risiko (compliance-risiko / vertrag):** Verjährung der Regressansprüche durch verspätete Geltendmachung.
  - Kontrolle: Fristen-/Wiedervorlage-Management mit Eskalation (präventiv, hybrid, anlassbezogen).
- **Risiko (operationelles-risiko / prozess):** Regressquote unterhalb Branchen-Benchmark, Erlöslücke nicht erklärbar.
  - Kontrolle: Regress-Monitoring und Ursachenanalyse (detektiv, manuell, quartalsweise).

## 15. Anhänge

- Anhang 1: Checkliste Deckungsprüfung Komposit
- Anhang 2: Schwellenwerte Ermittlungsweg und Regulierungsvollmachten
- Anhang 3: Betrugsindikatoren-Katalog (SIU)
- Anhang 4: Reservierungsrichtlinie — Kurzfassung (RR-AKT-2025)
- Anhang 5: Regress-Wiedervorlage- und Fristenraster
- Anhang 6: Schema Operational Loss Reporting Versicherung (Formular OPR-VS-001)
