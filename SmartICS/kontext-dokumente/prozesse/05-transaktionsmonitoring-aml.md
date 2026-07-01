---
dokument_id: RL-AML-2026-003
titel: Richtlinie Geldwäscheprävention und Transaktionsmonitoring
typ: Richtlinie
version: "7.0"
gueltig_ab: 30.06.2026
eigentuemer: Geldwäschebeauftragter (Money Laundering Reporting Officer)
methodische_aufsicht: Operational Risk & Compliance (2nd Line of Defense)
klassifizierung: VERTRAULICH — Stufe 2 (Internal Use Only) — synthetische Demo-Daten
prozess_id: transaktionsmonitoring
kategorie: Compliance / Financial Crime
regulatorik:
  - Geldwäschegesetz (GwG) §§ 4–15, § 43
  - KWG § 25h (interne Sicherungsmaßnahmen)
  - EU-Sanktionsverordnungen (VO (EU) 833/2014, 269/2014)
  - Verordnung (EU) 2015/847 (Travel Rule)
  - BaFin-Auslegungs- und Anwendungshinweise (AuA) zum GwG
  - MaRisk AT 4.3; DSGVO Art. 6
---

# Richtlinie Geldwäscheprävention und Transaktionsmonitoring

> Synthetisches Demo-Dokument für Smart ICS — alle Namen, Zahlen und Sachverhalte sind frei erfunden.

Schlüsselprozess AML-01 — szenariobasiertes Transaktionsmonitoring, Verdachtsfallbearbeitung und Sanktions-Screening.

## Metadaten

| Feld | Wert |
| --- | --- |
| Dokument-ID | RL-AML-2026-003 |
| Version | 7.0 (Neukalibrierung Monitoring-Szenarien) |
| Gültig ab | 30.06.2026 |
| Geltungsdauer | 12 Monate; anlassbezogene Aktualisierung bei neuen Typologien |
| Eigentümer | Geldwäschebeauftragter (MLRO) |
| Methodische Aufsicht | Operational Risk & Compliance (2nd Line of Defense) |
| Regulatorischer Rahmen | GwG §§ 4–15, § 43; KWG § 25h; EU-Sanktionsverordnungen; VO (EU) 2015/847; BaFin-AuA |
| Klassifizierung | VERTRAULICH — Stufe 2 (Internal Use Only). |
| Genehmigung | Vorstand Compliance (Frau Dr. A. Brenner); Gesamtvorstand · Sitzung Q1/2026 |
| Geltungsraum | Konzern (alle meldepflichtigen Institute) |

## Versionshistorie

| Version | Datum | Autor | Änderung |
| --- | --- | --- | --- |
| v4.0 | 12.06.2019 | MLRO | Umsetzung 5. EU-Geldwäscherichtlinie |
| v5.0 | 03.03.2021 | MLRO / Compliance | goAML-Anbindung und FIU-Prozess fortgeschrieben |
| v6.0 | 26.09.2023 | T. Wagner (Deputy MLRO) | Risikobasierter Ansatz und Szenario-Governance |
| v6.1 | 04.10.2025 | T. Wagner | Neue EU-Sanktionspakete; Travel-Rule-Anpassung |
| v7.0 | 30.06.2026 | T. Wagner | Neukalibrierung Monitoring-Szenarien; Modellgüte |

## Inhaltsverzeichnis

1. Geltungsbereich, Zweck und Adressaten
2. Begriffsbestimmungen
3. Rechtsgrundlagen und Bezugsdokumente
4. Organisatorische Rahmenbedingungen
5. Risikoanalyse und risikobasierter Ansatz
6. Monitoring-Szenarien und Schwellenwerte
7. Alert-Triage (1st Level)
8. Fallbearbeitung und Investigation (EDD)
9. Verdachtsmeldung über goAML
10. Sanktions- und Embargo-Screening
11. Qualitätssicherung und Modellgüte
12. Schulung und Sensibilisierung
13. Risiko-Kontroll-Sicht (für Smart ICS)
14. Anhänge

## 1. Geltungsbereich, Zweck und Adressaten

Diese Richtlinie regelt das laufende Monitoring von Kunden- und Transaktionsdaten zur Erkennung von Geldwäsche, Terrorismusfinanzierung und Sanktionsverstößen sowie die nachgelagerte Fallbearbeitung und Meldung. Sie gilt für alle Mitarbeitenden der 1st-Level- und 2nd-Level-AML-Funktionen sowie für die fachverantwortlichen Bereiche, die Alerts erhalten.

> **Achtung — Tipping-off-Verbot:** Der von einer Verdachtsmeldung betroffene Kunde oder Dritte dürfen über eine erstattete oder beabsichtigte Meldung nicht informiert werden (§ 47 GwG). Verstöße können straf- und aufsichtsrechtliche Folgen haben.

## 2. Begriffsbestimmungen

| Begriff | Definition |
| --- | --- |
| Alert | Vom Monitoring-System erzeugter Hinweis auf eine auffällige Transaktion oder ein auffälliges Verhalten. |
| Szenario | Regel-/Modelllogik, die definierte Auffälligkeitsmuster erkennt (z. B. Structuring, Durchlauf). |
| Triage | Vorqualifizierung eines Alerts mit Entscheidung über Schließung oder Eskalation. |
| EDD | Enhanced Due Diligence — verstärkte Sorgfaltspflichten bei erhöhtem Risiko (§ 15 GwG). |
| PEP | Politisch exponierte Person sowie deren Familienmitglieder und nahestehende Personen. |
| Verdachtsmeldung | Meldung an die FIU gemäß § 43 GwG über das Portal goAML. |
| False Positive | Alert/Treffer ohne tatsächlichen Verdachtsbezug. |
| Travel Rule | Pflicht zur Übermittlung vollständiger Auftraggeber-/Empfängerangaben (VO (EU) 2015/847). |

## 3. Rechtsgrundlagen und Bezugsdokumente

- Geldwäschegesetz (GwG) §§ 4–15 (Sorgfaltspflichten, risikobasierter Ansatz, EDD), § 43 (Meldepflicht), § 47 (Verbot der Informationsweitergabe).
- KWG § 25h — interne Sicherungsmaßnahmen, Datenverarbeitungssysteme zur Erkennung von Auffälligkeiten.
- EU-Sanktionsverordnungen (VO (EU) 833/2014, 269/2014 und Folgeakte); OFAC SDN; UN-Liste.
- Verordnung (EU) 2015/847 (Travel Rule) — Begleitinformationen bei Geldtransfers (siehe OH-ZV-2026-007).
- BaFin-Auslegungs- und Anwendungshinweise (AuA) zum GwG; FATF-Empfehlungen und Typologien.
- MaRisk AT 4.3 (IKS); DSGVO Art. 6 (Rechtmäßigkeit der Verarbeitung).
- Interne Bezugsdokumente: Risikoanalyse GwG (RA-GwG-2026), Szenario-Katalog (SK-AML-LIVE), Methodenhandbuch Risiko- & Kontroll-Taxonomie (MH-IKS-2026-001).

## 4. Organisatorische Rahmenbedingungen

| Rolle | LoD | Wesentliche Verantwortung |
| --- | --- | --- |
| AML-Analyst 1st Level | 1st | Alert-Triage, Vorqualifizierung, Schließung von False Positives. |
| AML-Investigator 2nd Level | 2nd | Vertiefte Fallbearbeitung, EDD, Meldeentscheidung-Vorbereitung. |
| Geldwäschebeauftragter (MLRO) | 2nd | Meldeentscheidung, FIU-Kommunikation, Gesamtsteuerung. |
| Sanktionsanalyst | 2nd | Treffer-Disposition Sanktions-/Embargo-Screening. |
| Modell-/Szenario-Owner | 2nd | Szenario-Design, Schwellenwert-Kalibrierung, Backtesting. |
| Operational Risk Manager | 2nd | IKS-Steuerung, Qualitätssicherung, Reporting. |
| Interne Revision | 3rd | Unabhängige Prüfung der AML-Wirksamkeit. |

## 5. Risikoanalyse und risikobasierter Ansatz

Grundlage des Monitorings ist die jährlich aktualisierte institutsweite Risikoanalyse (RA-GwG-2026). Sie bewertet Kunden-, Produkt-, Transaktions-, Vertriebsweg- und Länderrisiken und steuert die Intensität der Sorgfaltspflichten (SDD/CDD/EDD). Hochrisikokonstellationen (z. B. Drittländer mit hohem Risiko, Korrespondenzbankbeziehungen, Bargeldintensität) lösen verstärkte Maßnahmen aus.

## 6. Monitoring-Szenarien und Schwellenwerte

Das Transaktionsmonitoring-System wertet Buchungen nahezu in Echtzeit sowie im Tages-Batch aus.

| Szenario-ID | Muster | Beispiel-Schwelle | Priorität |
| --- | --- | --- | --- |
| SC-01 | Structuring / Smurfing | mehrere Bareinzahlungen knapp unter 10.000 EUR in 7 Tagen | hoch |
| SC-02 | Durchlaufkonto (Pass-Through) | Eingang und zeitnaher Weitertransfer > 90 % innerhalb 48 Stunden | hoch |
| SC-03 | Hochrisikoland-Korridor | Zahlung von/zu Drittland mit hohem Risiko über Schwellenwert | hoch |
| SC-04 | Untypisches Verhalten (Peer-Group) | Umsatzsprung > 300 % vs. Peer-/Historie | mittel |
| SC-05 | Bargeldintensität | Bargeldquote über Branchen-Benchmark | mittel |
| SC-06 | Travel-Rule-Lücke | unvollständige Auftraggeber-/Empfängerdaten | mittel |

> **Hinweis — Schwellenwert-Governance:** Schwellenwerte und Szenarien werden ausschließlich über das Szenario-Governance-Board geändert. Änderungen sind zu begründen, zu testen und zu dokumentieren; ein „stilles" Nachjustieren ist unzulässig.

## 7. Alert-Triage (1st Level)

Erzeugte Alerts werden in der Alert-Queue priorisiert und vom 1st Level innerhalb der Service-Level-Frist vorqualifiziert. Eindeutige False Positives werden mit dokumentierter Begründung geschlossen; verdachtsbegründende Alerts werden an das 2nd Level eskaliert. Die durchschnittliche Bearbeitungszeit und das Alert-Backlog werden überwacht.

## 8. Fallbearbeitung und Investigation (EDD)

Im 2nd Level erfolgt die vertiefte Analyse: KYC-/UBO-Nachschau, Transaktionshistorie, Netzwerk-/Gegenpartei-Analyse, Abgleich mit offenen Quellen und ggf. Kundenansprache. Bei erhöhtem Risiko werden verstärkte Sorgfaltspflichten gemäß § 15 GwG angewandt. Der gesamte Bearbeitungsweg wird im Case-Management revisionssicher dokumentiert; Aufbewahrungsfrist zehn Jahre.

## 9. Verdachtsmeldung über goAML

Verdichtet sich der Verdacht, bereitet das 2nd Level die Meldung vor; die Meldeentscheidung trifft der MLRO. Die Verdachtsmeldung wird unverzüglich über das Portal goAML an die FIU übermittelt (§ 43 GwG).

> **Achtung (Risiko) — Fristen und Vollzugsverbot:** Bei begründetem Verdacht ist die Meldung unverzüglich zu erstatten. Eine meldepflichtige Transaktion darf grundsätzlich erst durchgeführt werden, wenn die FIU zugestimmt hat oder die Frist verstrichen ist (§ 46 GwG). Das Tipping-off-Verbot (§ 47 GwG) ist strikt zu beachten.

## 10. Sanktions- und Embargo-Screening

Kunden- und Transaktionsdaten werden in Echtzeit und im Batch gegen Sanktions-, Embargo- und PEP-Listen gescreent (siehe Filterkonfiguration in OH-ZV-2026-007). Treffer werden in der Disposition-Queue durch Sanktionsanalysten geprüft. Echte Treffer führen zur Sperrung und ggf. Anzeige bei der Deutschen Bundesbank.

## 11. Qualitätssicherung und Modellgüte

- Above-the-Line/Below-the-Line-Testing zur Bewertung von Schwellenwerten und Trefferquoten.
- Backtesting der Szenarien gegen bestätigte Verdachtsfälle und Typologien.
- Qualitätssicherung der Alert-Entscheidungen durch Stichproben (4-Augen).
- Reporting an MLRO/§-25h-Verantwortlichen und Operational Risk Committee.

## 12. Schulung und Sensibilisierung

Alle relevanten Mitarbeitenden absolvieren mindestens jährlich eine verpflichtende GwG-/Sanktions-Schulung mit Wissenstest. Neue Typologien und Sanktionspakete werden anlassbezogen kommuniziert.

## 13. Risiko-Kontroll-Sicht (für Smart ICS)

### e1 — Alert-Generierung
- **Risiko (modell-risiko / modell):** Lückenhafte oder veraltete Szenarien erzeugen False Negatives (Verdachtsfälle bleiben unentdeckt).
  - Kontrolle: Szenario-Governance mit Backtesting und Above/Below-the-Line-Testing (detektiv, hybrid, quartalsweise).
- **Risiko (operationelles-risiko / system):** Ausfall oder verspäteter Datenfeed des Monitoring-Systems.
  - Kontrolle: Feed-/Job-Monitoring mit Vollständigkeitskontrolle (detektiv, automatisch, täglich).
- **Risiko (modell-risiko / daten):** Unvollständige Transaktions-/Stammdaten führen zu falschen Alerts.
  - Kontrolle: Datenqualitäts-QM auf Critical Data Elements (detektiv, hybrid, monatlich).

### e2 — Alert-Triage (1st Level)
- **Risiko (operationelles-risiko / prozess):** Fehlerhafte Vorqualifizierung schließt echte Verdachtsfälle vorschnell.
  - Kontrolle: Vier-Augen-Stichprobe geschlossener Alerts (detektiv, manuell, monatlich).
- **Risiko (operationelles-risiko / human):** Alert-Backlog durch Unterkapazität verzögert die Bearbeitung über Fristen hinaus.
  - Kontrolle: Backlog-/SLA-Monitoring mit Eskalation (detektiv, automatisch, täglich).

### e3 — Fallbearbeitung / Investigation
- **Risiko (compliance-risiko / gwg):** Unzureichende EDD bei erhöhtem Risiko (§ 15 GwG).
  - Kontrolle: EDD-Checkliste und MLRO-Review (präventiv, manuell, anlassbezogen).
- **Risiko (compliance-risiko / dsgvo):** Unzulässige Verarbeitung personenbezogener Daten in der Investigation.
  - Kontrolle: Verarbeitungsverzeichnis und Zugriffsbeschränkung (präventiv, hybrid, jährlich).

### e4 — Verdachtsmeldung (FIU/goAML)
- **Risiko (compliance-risiko / regulatorik):** Unterlassene oder verspätete Verdachtsmeldung gemäß § 43 GwG.
  - Kontrolle: Melde-Workflow mit Fristenüberwachung und MLRO-Freigabe (präventiv, hybrid, je Fall).
- **Risiko (compliance-risiko / regulatorik):** Verstoß gegen das Tipping-off-Verbot (§ 47 GwG).
  - Kontrolle: Zugriffs-/Vertraulichkeitskontrollen und Schulung (präventiv, hybrid, jährlich).

### e5 — Sanktions- & Embargo-Screening
- **Risiko (compliance-risiko / gwg):** Echter Sanktionstreffer wird nicht erkannt oder unterdrückt (False Negative).
  - Kontrolle: Echtzeit-Screening mit Hard-Stop und unabhängiger Treffer-Disposition (präventiv, automatisch, je Transaktion).
- **Risiko (operationelles-risiko / prozess):** Massenhaft False Positives binden Kapazität und verzögern echte Treffer.
  - Kontrolle: Match-Schwellen-Tuning mit Qualitätsmonitoring (detektiv, hybrid, quartalsweise).

### e6 — Qualitätssicherung & Modellgüte
- **Risiko (modell-risiko / modell):** Schwellenwerte sind nicht validiert/kalibriert; Modell-Drift bleibt unentdeckt.
  - Kontrolle: Modellvalidierung und Out-of-Time-Tests durch unabhängige Stelle (detektiv, hybrid, jährlich).
- **Risiko (compliance-risiko / regulatorik):** Unzureichende Dokumentation der Wirksamkeit gemäß § 25h KWG / MaRisk.
  - Kontrolle: QS-Reporting an MLRO und Operational Risk Committee (detektiv, manuell, quartalsweise).

## 14. Anhänge

- Anhang 1: Szenario-Katalog mit Schwellenwerten (SK-AML-LIVE, Auszug)
- Anhang 2: EDD-Checkliste und Risikofaktoren
- Anhang 3: goAML-Meldeworkflow und Fristenraster
- Anhang 4: Sanktionslisten-Konfiguration und Update-Frequenz
- Anhang 5: Above-/Below-the-Line-Testing-Protokoll
- Anhang 6: Schulungs- und Sensibilisierungsplan
