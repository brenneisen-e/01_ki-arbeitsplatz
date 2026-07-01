---
dokument_id: PH-WP-2026-009
titel: Prozesshandbuch Wertpapierabwicklung (Settlement)
typ: Prozesshandbuch
version: "3.1"
gueltig_ab: 30.06.2026
eigentuemer: Bereichsleitung Securities Operations
methodische_aufsicht: Operational Risk & Compliance (2nd Line of Defense)
klassifizierung: VERTRAULICH — Stufe 2 (Internal Use Only) — synthetische Demo-Daten
prozess_id: wertpapierabwicklung
kategorie: Kapitalmarkt
regulatorik:
  - Verordnung (EU) Nr. 909/2014 (CSDR), Art. 6, 7 (Settlement Discipline)
  - Delegierte Verordnung (EU) 2018/1229 (RTS Settlement Discipline)
  - Verordnung (EU) Nr. 648/2012 (EMIR); Verordnung (EU) Nr. 600/2014 (MiFIR)
  - Richtlinie 2014/65/EU (MiFID II), Aufzeichnungspflichten
  - MaRisk AT 4.3, BTO 2 (Handelsgeschäft)
  - Verordnung (EU) 2022/2554 (DORA)
---

# Prozesshandbuch Wertpapierabwicklung (Settlement)

> Synthetisches Demo-Dokument für Smart ICS — alle Namen, Zahlen und Sachverhalte sind frei erfunden.

Schlüsselprozess WP-01 — Settlement von Kunden- und Eigenhandelsgeschäften im Wertpapiergeschäft.

## Metadaten

| Feld | Wert |
| --- | --- |
| Dokument-ID | PH-WP-2026-009 |
| Version | 3.1 (Anpassung CSDR-Penalty-Regime und T2S) |
| Gültig ab | 30.06.2026 |
| Geltungsdauer | 12 Monate |
| Eigentümer | Bereichsleitung Securities Operations |
| Methodische Aufsicht | Operational Risk & Compliance (2nd Line of Defense) |
| Regulatorischer Rahmen | CSDR (VO 909/2014); RTS 2018/1229; EMIR; MiFIR/MiFID II; MaRisk BTO 2; DORA |
| Klassifizierung | VERTRAULICH — Stufe 2 (Internal Use Only). |
| Genehmigung | Vorstand Kapitalmarkt (Frau Dr. K. Lindner); Gesamtvorstand · Sitzung Q2/2026 |
| Geltungsraum | Konzern (Securities Operations DE/LU); ausgenommen: Verwahrstellen-Geschäft (eigene Anweisung) |

## Versionshistorie

| Version | Datum | Autor | Änderung |
| --- | --- | --- | --- |
| v1.0 | 11.09.2017 | Securities Ops Lead | Erstfassung im Rahmen T2S-Migration |
| v2.0 | 01.02.2019 | R. Albrecht | EMIR-Refit-Reporting eingearbeitet |
| v2.5 | 14.02.2022 | R. Albrecht / Compliance | CSDR Settlement Discipline Regime (SDR) wirksam |
| v3.0 | 30.05.2024 | S. Vogt / OpRisk | DORA-Anforderungen an Custodian-Auslagerung verankert |
| v3.1 | 30.06.2026 | S. Vogt | Penalty-Mechanismus und Buy-in-Prozess fortgeschrieben |

## Inhaltsverzeichnis

1. Geltungsbereich, Zweck und Adressaten
2. Begriffsbestimmungen
3. Rechtsgrundlagen und Bezugsdokumente
4. Organisatorische Rahmenbedingungen
5. Trade-Erfassung im Front-Office
6. Trade-Matching
7. Confirmation und Affirmation
8. Settlement-Instruktion
9. Cash- und Stückeabwicklung (DvP)
10. CSDR Settlement Discipline, Penalties und Buy-in
11. Reconciliation
12. Reporting (EMIR/MiFIR) und Meldewesen
13. Eskalation, Fails-Management und DORA-Bezug
14. Risiko-Kontroll-Sicht (für Smart ICS)
15. Anhänge

## 1. Geltungsbereich, Zweck und Adressaten

Dieses Prozesshandbuch regelt die Nachhandelsbearbeitung (Post-Trade) von Wertpapiergeschäften — vom Trade-Capture über Matching, Confirmation/Affirmation und Settlement-Instruktion bis zur DvP-Abwicklung und Reconciliation. Es gilt für Kunden- und Eigenhandelsgeschäfte in Aktien, Renten und ETFs, die über T2S, Clearstream Banking oder einen externen Global Custodian abgewickelt werden.

Nicht im Geltungsbereich: OTC-Derivate-Collateral-Prozesse (eigene Anweisung PH-DRV-04), Repo-/Wertpapierleihe (PH-SFT-02) und das Verwahrstellengeschäft für Sondervermögen.

> **Achtung — Settlement-Discipline-Regime:** Seit Inkrafttreten des CSDR-SDR unterliegen verspätete oder gescheiterte Lieferungen (Settlement Fails) einem täglichen Penalty-Mechanismus gemäß CSDR Art. 7 und RTS (EU) 2018/1229. Unbearbeitete Fails erhöhen unmittelbar Kosten und Reputationsrisiko.

## 2. Begriffsbestimmungen

| Begriff | Definition |
| --- | --- |
| Trade Date (T) | Handelstag des Geschäftsabschlusses. |
| Settlement Date (SD) | Erfüllungstag; Standard für Kassageschäfte EWR ist T+2. |
| DvP | Delivery versus Payment — Zug-um-Zug-Abwicklung von Stücken gegen Cash. |
| Matching | Abgleich der Trade-Attribute beider Kontrahenten zur Erfüllungsfähigkeit. |
| Affirmation / Confirmation | Bestätigung der Geschäftsdaten (z. B. über CTM/ALERT) gemäß MiFID II. |
| Settlement Instruction (SI) | Erfüllungsanweisung an den (I)CSD / Custodian. |
| Settlement Fail | Nicht termingerechte Erfüllung am vereinbarten Settlement Date. |
| CSDR-Penalty | Tägliche Strafzahlung für Fails gemäß CSDR Art. 7 (siehe auch OH-ZV-2026-007). |
| Buy-in | Ersatzbeschaffung der nicht gelieferten Wertpapiere zulasten der säumigen Partei. |
| Nostro | Eigenes Konto/Depot bei einer dritten (Korrespondenz-)Bank bzw. einem Custodian. |

## 3. Rechtsgrundlagen und Bezugsdokumente

- Verordnung (EU) Nr. 909/2014 (CSDR) — insbesondere Art. 6 (Maßnahmen zur Vermeidung von Fails) und Art. 7 (Settlement Discipline, Penalties, Buy-in).
- Delegierte Verordnung (EU) 2018/1229 — Regulatorische Technische Standards zur Settlement Discipline.
- Verordnung (EU) Nr. 648/2012 (EMIR) und Refit — Meldepflichten für Derivate.
- Verordnung (EU) Nr. 600/2014 (MiFIR) und Richtlinie 2014/65/EU (MiFID II) — Transaktions- und Aufzeichnungspflichten, Zeitstempel-Synchronisation (RTS 25).
- MaRisk AT 4.3 (IKS), BTO 2 (Anforderungen an das Handelsgeschäft).
- Verordnung (EU) 2022/2554 (DORA) — IKT-Risiko und Drittparteienmanagement Custodian/CSD (siehe RL-AUS-2026-005).
- Interne Bezugsdokumente: Marktfolge-Handel-Anweisung (PH-MFH-01), Custodian-SLA-Register (AR-CUST-LIVE), Methodenhandbuch Risiko- & Kontroll-Taxonomie (MH-IKS-2026-001).

## 4. Organisatorische Rahmenbedingungen

Die Trennung von Markt (Handel) und Marktfolge-Handel (Settlement/Operations) ist gemäß MaRisk BTO 2.1 durchgängig sicherzustellen. Eine Personalunion von Händler- und Abwicklungsfunktion ist auch im Vertretungsfall ausgeschlossen.

| Rolle | LoD | Wesentliche Verantwortung |
| --- | --- | --- |
| Händler / Front Office | 1st | Geschäftsabschluss, Trade-Eingabe im Front-Office-System. |
| Settlement-Sachbearbeiter | 1st | Matching, Instruktion, Fails-Bearbeitung, Reconciliation. |
| Teamleiter Securities Ops | 1st | Vier-Augen-Freigabe kritischer Instruktionen, Eskalation. |
| Reconciliation-Team | 1st | Tägliche Nostro-/Depot-Abstimmung. |
| Operational Risk Manager | 2nd | IKS-Steuerung, Fails-/Penalty-Monitoring, Schadensdatenbank. |
| Compliance / Meldewesen | 2nd | EMIR/MiFIR-Reporting-Überwachung, Regulatorik-Monitoring. |
| Auslagerungsbeauftragter | 2nd | Steuerung Custodian/CSD als IKT-Drittdienstleister (DORA). |
| Interne Revision | 3rd | Unabhängige Prüfung; mindestens dreijährliche Zyklusprüfung. |

## 5. Trade-Erfassung im Front-Office

Geschäfte werden unmittelbar nach Abschluss im Front-Office-System (FOS-Trade) mit allen erforderlichen Attributen erfasst: ISIN, Stückzahl/Nominal, Kurs, Währung, Kontrahent, Handelsplatz, Trade Date, vorgesehenes Settlement Date, Geschäftsart (Kunde/Eigenhandel) und MiFIR-Pflichtfelder.

> **Hinweis — Zeitstempel:** Alle Trade-Zeitstempel müssen gemäß MiFID II RTS 25 auf eine referenzierte Zeitquelle (UTC, koordiniert über NTP/PTP) synchronisiert sein. Abweichungen über der zulässigen Toleranz sind als Vorfall zu erfassen.

## 6. Trade-Matching

Das Matching erfolgt möglichst am Handelstag (T+0) über das zentrale Matching-System gegen die Gegenseite. Diskrepanzen (Unmatched/Alleged Trades) werden in der Matching-Queue priorisiert und mit dem Kontrahenten geklärt. Ziel ist ein Pre-Matching vor Settlement Date, um Fails proaktiv zu vermeiden (CSDR Art. 6).

## 7. Confirmation und Affirmation

Geschäftsbestätigungen werden über etablierte Plattformen (z. B. CTM/ALERT) versendet und affirmiert. Für institutionelle Geschäfte ist die Affirmation am Handelstag anzustreben. Standardisierte Settlement-Instruktionen (SSI) werden aus der zentralen SSI-Datenbank gezogen; manuelle SSI-Eingaben unterliegen dem Vier-Augen-Prinzip.

## 8. Settlement-Instruktion

Die Settlement-Instruktion wird an den (I)CSD bzw. Custodian übermittelt (z. B. via SWIFT ISO 15022 MT54x / ISO 20022 sese-Nachrichten). Pflichtprüfungen vor Versand:

1. Vollständigkeit und Konsistenz der SSI (Depot, Cash-Konto, Place of Settlement).
2. Deckungsprüfung Stücke (bei Lieferung) bzw. Cash (bei Empfang gegen Zahlung).
3. Abgleich gegen die affirmierten Geschäftsdaten.
4. Vier-Augen-Freigabe ab definierter Betragsschwelle oder bei manuellen Instruktionen.

## 9. Cash- und Stückeabwicklung (DvP)

Das Settlement erfolgt am Settlement Date Zug um Zug (DvP) über T2S bzw. den Custodian. Partielle Settlements werden gemäß Marktstandard zugelassen, sofern dies das Fail-Risiko und die Penalty-Last reduziert. Cash-Legs in Fremdwährung werden über die jeweiligen Nostro-Konten abgewickelt.

## 10. CSDR Settlement Discipline, Penalties und Buy-in

- **Penalty-Berechnung:** Für jeden Fail wird täglich eine Penalty gemäß RTS (EU) 2018/1229 berechnet (abhängig von Asset-Typ, Liquidität und Referenzpreis). Die vom CSD berechneten Penalties werden monatlich verrechnet.
- **Fails-Reporting:** Fail-Quoten werden täglich überwacht und gegen interne Schwellenwerte gehalten; Überschreitungen lösen eine Root-Cause-Analyse aus.
- **Buy-in:** Bei anhaltenden Fails wird der vertragliche/marktstandardisierte Buy-in-Prozess angestoßen, einschließlich Benennung des Buy-in-Agenten und Ausgleich der Preisdifferenz.

> **Achtung (Risiko) — Penalty-Akkumulation:** Werden Fails nicht binnen der definierten Frist bearbeitet, akkumulieren CSDR-Penalties täglich. Ungeklärte Fails ab einem Marktwert von 1 Mio. EUR sind taggleich an Operational Risk und den Teamleiter zu eskalieren.

## 11. Reconciliation

- Tägliche Abstimmung der Nostro-Konten und Depotbestände gegen die Custodian-/CSD-Auszüge (MT535/MT536/MT940 bzw. ISO-20022-Pendants).
- Abgleich der Pending-Settlements (vorgemerkt vs. settled) und Klärung offener Posten.
- Monatliche Saldenabstimmung gegen die interne Buchhaltung; ungeklärte Differenzen ab 1 TEUR Eskalation an Operational Risk.

## 12. Reporting (EMIR/MiFIR) und Meldewesen

- EMIR-Meldung von Derivategeschäften an ein Transaktionsregister bis T+1.
- MiFIR-Transaktionsmeldung (Transaction Reporting) bis T+1 mit vollständigen Referenzdaten.
- Vollständigkeits- und Plausibilitätskontrollen der Meldungen mit Vier-Augen-Freigabe vor Übermittlung.
- Vorfallsmeldung an die BaFin gemäß DORA Art. 19 bei wesentlichen IKT-Vorfällen.

## 13. Eskalation, Fails-Management und DORA-Bezug

| Vorfall | Kritikalität | Reaktion |
| --- | --- | --- |
| Ausfall Matching-/Settlement-System | S1 | BCM-Alarm; Failover; Vorstand-Info; manueller Notbetrieb. |
| Ausfall Custodian-Connectivity | S1 | Backup-Channel/Custodian aktivieren; Auslagerungsbeauftragten alarmieren. |
| Fail-Quote über Schwellenwert | S2 | Root-Cause-Analyse; Eskalation an OpRisk; CSDR-Reporting. |
| Verspätetes EMIR/MiFIR-Reporting | S2 | Nachmeldung; Ursachenanalyse; Compliance-Info. |
| Vereinzelter Settlement Fail | S3 | Standard-Klärung; Penalty-Erfassung; Pre-Matching verstärken. |

## 14. Risiko-Kontroll-Sicht (für Smart ICS)

### b1 — Trade-Erfassung
- **Risiko (operationelles-risiko / human):** Tippfehler bei Stückzahl, Kurs oder Wertpapierkennnummer (Fat-Finger-Risiko).
  - Kontrolle: Eingabe-Plausibilisierung gegen Stammdaten/Wertebereiche (detektiv, automatisch, je Transaktion).
  - Kontrolle: Vier-Augen bei manuellen Trades über Schwelle (präventiv, manuell, je Transaktion).
- **Risiko (compliance-risiko / regulatorik):** Verstoß gegen MiFID-II-Anforderungen an Trade-Aufzeichnungen und Zeitstempel.
  - Kontrolle: Zeitstempel-Synchronisation und Vollständigkeits-Check der MiFIR-Felder (präventiv, automatisch, je Transaktion).
- **Risiko (operationelles-risiko / system):** Front-Office-System fällt während aktiver Handelsphasen aus.
  - Kontrolle: Hochverfügbarkeits-Cluster mit Failover (präventiv, automatisch, permanent).

### b2 — Trade-Matching
- **Risiko (operationelles-risiko / prozess):** Unmatched Trades werden zu spät erkannt und führen zu Settlement Fails (CSDR-Penalty).
  - Kontrolle: Pre-Matching am Handelstag mit priorisierter Ausnahme-Queue (präventiv, hybrid, je Transaktion).
- **Risiko (operationelles-risiko / system):** Schnittstellenausfall zwischen Front-Office- und Matching-System.
  - Kontrolle: Schnittstellen-Monitoring mit Alerting (detektiv, automatisch, je Transaktion).
- **Risiko (modell-risiko / daten):** Inkonsistente Stammdaten zwischen Kontrahenten führen zu Fehlmatches.
  - Kontrolle: SSI-Stammdaten-QM und CDE-Inventar (detektiv, hybrid, monatlich).

### b3 — Confirmation & Affirmation
- **Risiko (compliance-risiko / regulatorik):** EMIR/MiFIR-Reporting-Pflichten werden nicht innerhalb T+1 erfüllt.
  - Kontrolle: Reporting-Überwachung mit Vier-Augen-Freigabe (detektiv, hybrid, täglich).
- **Risiko (operationelles-risiko / system):** Fehlerhafte XML-Generierung bei Confirmation-Versand.
  - Kontrolle: Schema-Validierung der Nachrichten vor Versand (detektiv, automatisch, je Transaktion).

### b4 — Settlement-Instruktion
- **Risiko (operationelles-risiko / prozess):** Falsche oder verspätete Settlement-Instruktion führt zu Settlement Fail.
  - Kontrolle: SSI-Konsistenz- und Deckungsprüfung mit Vier-Augen ab Schwelle (präventiv, hybrid, je Transaktion).
- **Risiko (auslagerungs-risiko / dienstleister):** Custodian-Dienstleister verarbeitet Instruktionen verspätet oder fehlerhaft.
  - Kontrolle: Custodian-SLA-Monitoring mit Eskalationspfaden (detektiv, automatisch, monatlich).

### b5 — Cash- und Stückeabwicklung
- **Risiko (finanzkriminalitaet / cyber):** Manipulation der Settlement-Instruktion durch Phishing/Account Takeover.
  - Kontrolle: Multifaktor-Authentifizierung und Freigabe-Härtung (präventiv, automatisch, je Transaktion).
- **Risiko (operationelles-risiko / prozess):** Verstoß gegen CSDR durch Settlement-Discipline-Regime und Penalty-Mechanismus.
  - Kontrolle: Tägliches Fails-/Penalty-Monitoring und Buy-in-Trigger (detektiv, hybrid, täglich).

### b6 — Reconciliation
- **Risiko (operationelles-risiko / prozess):** Nicht abgestimmte Positionen verzerren GuV und Bilanz.
  - Kontrolle: Tägliche Nostro-/Depot-Reconciliation mit Klärungs-Workflow (detektiv, automatisch, täglich).
- **Risiko (modell-risiko / daten):** Inkonsistenzen zwischen Nostro- und Custodian-Beständen bleiben unentdeckt.
  - Kontrolle: Abweichungs-Reporting mit Schwellenwert-Eskalation (detektiv, hybrid, täglich).

## 15. Anhänge

- Anhang 1: SSI-Standarddatenmodell und Pflichtfelder
- Anhang 2: Fail-/Penalty-Reporting-Vorlage (CSDR Art. 7)
- Anhang 3: Buy-in-Ablaufdiagramm und Agenten-Liste
- Anhang 4: Mapping ISO 15022 / ISO 20022 Settlement-Nachrichten
- Anhang 5: Custodian-/CSD-Notfall- und Backup-Kontakte
- Anhang 6: Checkliste MiFIR/EMIR-Reporting-Vollständigkeit
