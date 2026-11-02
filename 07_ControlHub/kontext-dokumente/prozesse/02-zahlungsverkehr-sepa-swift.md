---
dokument_id: OH-ZV-2026-007
titel: Operations-Handbuch SEPA- und SWIFT-Zahlungsverkehr
typ: Operations-Handbuch
version: "6.0"
gueltig_ab: 30.06.2026
eigentuemer: Bereichsleitung Payment Operations
methodische_aufsicht: Operational Risk & Compliance (2nd Line of Defense)
klassifizierung: VERTRAULICH — Stufe 2 (Internal Use Only) — synthetische Demo-Daten
prozess_id: zahlungsverkehr
kategorie: Operations
regulatorik:
  - Richtlinie (EU) 2015/2366 (PSD2); Zahlungsdiensteaufsichtsgesetz (ZAG)
  - Verordnung (EU) 2024/886 (Instant Payments Regulation)
  - EPC Rulebooks SCT/SCT Inst/SDD CORE/SDD B2B
  - Verordnung (EU) 2015/847 (Travel Rule)
  - EU-Sanktionsverordnungen; OFAC SDN; UN-Liste
  - GwG §§ 4–13a, § 43; KWG § 25h
  - MaRisk AT 7.2, AT 7.3, AT 9
  - Verordnung (EU) 2022/2554 (DORA)
  - SWIFT Customer Security Programme (CSCF v2026)
---

# Operations-Handbuch SEPA- und SWIFT-Zahlungsverkehr

> Synthetisches Demo-Dokument für ControlHub — alle Namen, Zahlen und Sachverhalte sind frei erfunden.

Schlüsselprozess ZV-01 — eingehende und ausgehende Massen- und Individualzahlungen.

## Metadaten

| Feld | Wert |
| --- | --- |
| Dokument-ID | OH-ZV-2026-007 |
| Version | 6.0 (Aktualisierung wegen SEPA-Instant-Pflicht 2025) |
| Gültig ab | 30.06.2026 |
| Geltungsdauer | 12 Monate, vorzeitige Aktualisierung bei Schemes-Änderungen verpflichtend |
| Eigentümer | Bereichsleitung Payment Operations |
| Methodische Aufsicht | Operational Risk & Compliance (2nd Line of Defense) |
| Regulatorischer Rahmen | PSD2; ZAG; SEPA-Regelwerk (EPC); SWIFT CSCF v2026; MaRisk AT 7.2; EBA-Leitlinien; EU-Sanktionsverordnungen; § 25h KWG; GwG |
| Klassifizierung | VERTRAULICH — Stufe 2 (Internal Use Only). Verteilung beschränkt. |
| Genehmigung | Vorstand Operations (Herr Dr. T. Eichhorn); Gesamtvorstand · Sitzung Q1/2026 |
| Geltungsraum | Konzern (Hauptniederlassung + Filialen DE/AT/LU); ausgenommen: Konzern-Treasury |

## Versionshistorie

| Version | Datum | Autor | Änderung |
| --- | --- | --- | --- |
| v1.0 | 02.04.2014 | Payment Ops Lead | Erstfassung im Rahmen SEPA-Migration |
| v2.0 | 15.08.2018 | M. Schenk | PSD2-Umsetzung (Strong Customer Authentication) |
| v3.0 | 20.05.2020 | M. Schenk / Compliance | EU 2015/847 Transferverordnung; FATF Travel Rule |
| v4.0 | 18.09.2022 | T. Hoffmann | SWIFT-CSP-Anforderungen (CSCF) eingebaut |
| v5.0 | 22.01.2024 | T. Hoffmann / DSGV | DORA-Vorbereitung: IKT-Risikomanagement |
| v5.1 | 06.06.2024 | T. Hoffmann | Neue Sanktionspakete EU XV; AML-Filter-Konfiguration |
| v6.0 | 30.06.2026 | T. Hoffmann | SEPA-Instant-Pflicht für ausgehende Zahlungen ab 09.10.2025 |

## Inhaltsverzeichnis

1. Geltungsbereich, Zweck und Adressaten
2. Begriffsbestimmungen
3. Rechtsgrundlagen und Bezugsdokumente
4. Organisatorische Rahmenbedingungen
5. Auftragsannahme
6. Plausibilitätsprüfung
7. Embargo- und Sanktionsfilter
8. Limit- und Liquiditätsprüfung
9. Freigabe und Mehraugen-Prinzip
10. Clearing und Settlement
11. Reconciliation und Buchung
12. Reporting an Bundesbank und BaFin
13. Eskalation, Notfall und DORA-Bezug
14. Fraud-Prävention
15. Risiko-Kontroll-Sicht (für ControlHub)
16. Anhänge

## 1. Geltungsbereich, Zweck und Adressaten

Dieses Operations-Handbuch regelt die Bearbeitung eingehender und ausgehender Zahlungen über die Schemata SEPA Credit Transfer (SCT), SEPA Instant Credit Transfer (SCT Inst), SEPA Direct Debit (SDD CORE/B2B) sowie über SWIFT (MT103, MT202, MT202 COV, MX pacs.008, pacs.009). Es gilt für alle Mitarbeitenden der Payment Operations sowie aller angeschlossenen Bereiche im Auftragsworkflow.

> **Achtung — SEPA-Instant-Pflicht:** Gemäß Verordnung (EU) 2024/886 ist die Annahme eingehender SCT-Inst-Zahlungen seit dem 09.01.2025 und das Versenden seit dem 09.10.2025 für alle Zahlungsdienstleister im Euroraum verpflichtend. Eine Umsatzschwelle oder Pricing-Differenz gegenüber dem Standard-SCT ist unzulässig.

Privatkundengeschäft, Geldautomatentransaktionen sowie kartengebundene Zahlungen sind nicht im Geltungsbereich; sie unterliegen den Anweisungen KA-RET-22 (Retail-Karten) und ATM-OPS-04.

## 2. Begriffsbestimmungen

| Begriff | Definition |
| --- | --- |
| IBAN | International Bank Account Number gemäß ISO 13616. |
| BIC | Business Identifier Code gemäß ISO 9362; ab 2026 in SEPA optional. |
| SCT / SCT Inst | SEPA Credit Transfer Scheme bzw. Instant-Variante; Settlement < 10 Sekunden. |
| SDD CORE / B2B | SEPA Direct Debit Schemes für Verbraucher (CORE) bzw. Geschäftskunden (B2B). |
| pacs.008 / pacs.009 | ISO-20022-Nachrichtentypen (Customer Credit Transfer / Financial Institution Credit Transfer). |
| STP | Straight-Through-Processing — vollautomatische Verarbeitung ohne manuelle Eingriffe. |
| Cut-off-Time | Annahmeschluss im jeweiligen Clearing-Zyklus; spätere Aufträge werden auf den nächsten Zyklus geplant. |
| Embargo-Filter | Echtzeit-Screening gegen EU-, OFAC-, UN- und nationale Sanktionslisten. |
| Travel Rule | Pflicht zur Übermittlung vollständiger Auftraggeber- und Empfängerinformationen gemäß VO (EU) 2015/847. |
| CSDR-Penalty | Strafzahlung für Settlement Fails gemäß CSDR Art. 7 (siehe PH-WP-2026-009). |

## 3. Rechtsgrundlagen und Bezugsdokumente

- Richtlinie (EU) 2015/2366 (PSD2) und nationale Umsetzung im ZAG.
- Verordnung (EU) 2024/886 — Instant Payments Regulation.
- EPC Rulebooks SCT 2025, SCT Inst 2025, SDD CORE 2024, SDD B2B 2024.
- Verordnung (EU) 2015/847 — Begleitinformationen bei Geldtransfers (Travel Rule).
- EU-Sanktionsverordnungen (insbesondere VO (EU) 833/2014, 269/2014, 765/2006); OFAC SDN-Liste; UN-Konsolidierte Liste.
- GwG §§ 4–13a sowie § 43; KWG § 25h (siehe RL-AML-2026-003).
- MaRisk AT 7.2 (technisch-organisatorische Ausstattung), AT 7.3 (Notfallmanagement), AT 9 (Auslagerung).
- Verordnung (EU) 2022/2554 (DORA): IKT-Risikomanagement, Vorfallsmeldung, Auslagerung (siehe RL-AUS-2026-005).
- SWIFT Customer Security Programme (CSP) — CSCF v2026; pflichtige Independent Attestation.
- ECB-Leitlinie zu TARGET2 und T2S-Migration; Bundesbank Außenwirtschaftsverordnung (AWV).

## 4. Organisatorische Rahmenbedingungen

Die Funktionstrennung erfolgt entlang der Three-Lines-of-Defense.

| Rolle | LoD | Wesentliche Verantwortung |
| --- | --- | --- |
| Sachbearbeiter Ops | 1st | Annahme, Plausibilität, Erfassung im Payment-Hub PH-2025. |
| Teamleiter Ops | 1st | Vier-Augen-Freigabe ab 100 TEUR; Eskalation an Compliance. |
| Sanktionsanalyst | 2nd | Bearbeitung und Auflösung von Filtertreffern, Doku im Case-Management. |
| AML-Officer | 2nd | Verdachtsmomente, FIU-Meldung, KYC-Klärungen. |
| Operational Risk Manager | 2nd | IKS-Steuerung, Vorfallsmanagement, Schadensdatenbank. |
| CISO / SWIFT-CSP-Officer | 2nd | SWIFT-CSCF-Compliance, Schlüsselverwaltung, Penetrationstests. |
| Interne Revision | 3rd | Unabhängige Prüfung, mindestens dreijährlich Vollumfangsprüfung. |

## 5. Auftragsannahme

### 5.1 Kanäle und unterstützte Schemata
- Online-Banking Privat- und Firmenkunden (Web/App) — SCT, SCT Inst, SDD-Mandatsverwaltung.
- Firmenkundenportal (EBICS T/EBICS BTU) — Massen-SCT, Auslandsüberweisungen (SWIFT MT103/MX).
- API-Zugang (PSD2-AISP/PISP-konform) — autorisierte Drittanbieter mit SCA-Authentifizierung.
- Filiale (Schalter) — Einzelaufträge mit Identifikation gemäß § 13 GwG; Vier-Augen.
- SWIFTNet — Korrespondenzbankgeschäft, FI-to-FI (MT202, MT202 COV, MX pacs.009).

### 5.2 Erforderliche Auftragsdaten
Bei unvollständigen Daten gemäß VO (EU) 2015/847 ist der Auftrag abzulehnen bzw. zur Vervollständigung zurückzugeben.
- Auftraggeber: Name, IBAN, BIC (sofern erforderlich), Anschrift gemäß Travel Rule.
- Empfänger: Name, IBAN; bei Auslandsüberweisungen vollständige Anschrift; bei Drittländern Identifikator (z. B. LEI).
- Betrag und Währung; bei SDD zusätzlich Mandatsreferenz, Mandatsdatum, Creditor Identifier.
- Verwendungszweck (max. 140 Zeichen für SEPA, 4×35 Zeichen für SWIFT MT103).
- Bei SWIFT zusätzlich: Charge Bearer (OUR/SHA/BEN), Spesenklausel, ggf. Korrespondenzbank-Information.

### 5.3 Cut-off-Times

| Scheme | Cut-off (CET) | Settlement | Anmerkung |
| --- | --- | --- | --- |
| SCT Standard | 14:30 | D+0 / D+1 | Wertstellung am gleichen TARGET-Tag bei Eingang vor 14:30. |
| SCT Instant | 24/7 365 | < 10 Sek. | Kein Cut-off; ab 2025 keine Betragsschwelle. |
| SDD CORE Erst-LE | D-5 | D+0 | Pre-Notification 14 Tage; Erstlastschriften 5 TARGET-Tage Vorlauf. |
| SDD CORE Folge | D-2 | D+0 | Folgelastschriften 2 TARGET-Tage Vorlauf. |
| SDD B2B | D-1 | D+0 | B2B-Mandate; keine Rückgaberechte für Schuldner. |
| SWIFT MT103 | 17:00 | Same-day FX | Zeitzonenbezug; höhere Zeitfenster für Asien-/Amerika-Korridor. |
| TARGET2 | 17:45 (DvP) | Real-Time | 18:00 für Kunden; 19:00 EOD; Closing day 19:00. |

## 6. Plausibilitätsprüfung

Die Plausibilitätsprüfung erfolgt vollautomatisch im Payment-Hub PH-2025 bei Auftragsannahme. Verstöße führen zu einem Hard-Stop; Soft-Warnings werden dokumentiert.

1. IBAN-Prüfung: ISO 13616 inklusive länderspezifischer Validierung.
2. BIC-Validierung gegen die SWIFT BIC-Datenbank (täglicher Refresh).
3. Beneficiary-Name-Matching (Confirmation of Payee, ab 09.10.2025 Pflicht für ausgehende SEPA).
4. Plausibilität des Verwendungszwecks: regelbasierte Prüfung auf verbotene Zeichen, Phishing-Muster.
5. Schwellenwerte je Auftraggeber: Tageslimit, Monatslimit, Einzelauftragslimit.
6. Duplikatserkennung: gleicher Betrag + gleicher Empfänger innerhalb 60 Minuten erzeugt Soft-Warning.
7. Quittungserstellung bei Erfolg.

## 7. Embargo- und Sanktionsfilter

### 7.1 Filterkonfiguration und Listen
Der Sanktionsfilter ist als Echtzeit-Stop-Filter zwischen Auftragsannahme und Clearing geschaltet.
- EU-Sanktionsverordnungen — konsolidierte Liste, tägliches Update um 06:00 CET.
- OFAC SDN — Update mehrfach täglich.
- UN-Konsolidierte Sanktionsliste — wöchentliches Update.
- Nationale Listen (BMF / FIU-Verzeichnis, Bundesbank-Beschränkungen).
- Institutsinterne Watchlist (PEPs, hochrisikobehaftete Kunden).

Der Filter arbeitet mit Fuzzy-Matching (Edit-Distance, Soundex, Transliteration). Standard-Match-Schwelle: ≥ 85 % Namensähnlichkeit oder vollständige Identifier-Übereinstimmung.

### 7.2 Treffer-Disposition
Jeder Treffer stoppt den Auftrag und wird im Case-Management binnen 4 Stunden durch einen Sanktionsanalysten geprüft (false positive / Klärung erforderlich / echter Treffer).

> **Achtung (Risiko) — Echter Sanktionstreffer:** Echte Sanktionstreffer dürfen unter keinen Umständen ausgeführt werden. Die Auftragssumme ist zu sperren. Innerhalb von 48 Stunden ist eine Anzeige bei der Deutschen Bundesbank (§ 18 Außenwirtschaftsgesetz) zu erstatten. Eine taggleiche Information an Compliance und Vorstand ist verpflichtend.

### 7.3 FIU-Meldung
Bei Verdacht auf Geldwäsche oder Terrorismusfinanzierung erstellt der AML-Officer eine Verdachtsmeldung an die FIU gemäß § 43 GwG über das Meldeportal goAML; Aufbewahrungsfrist zehn Jahre (Detailprozess siehe RL-AML-2026-003).

## 8. Limit- und Liquiditätsprüfung

Die Limit- und Liquiditätsprüfung erfolgt in Echtzeit unmittelbar vor der finalen Freigabe.

| Limit-Typ | Schwelle | Maßnahme bei Verletzung |
| --- | --- | --- |
| Kunden-Tageslimit | individuell (CRM) | Hard-Stop; Klärung mit FKB. |
| Kontoguthaben + Linie | 0 | Soft-Warn ab −90 %, Hard-Stop ab 0; Eskalation an Kreditbetreuung. |
| Konzern-Tageslimit | gem. Kreditakte | Hard-Stop; Sondergenehmigung Kreditkomitee. |
| Intraday-Liquidität TARGET2 | Reserve > 50 Mio. EUR | Throttling bei < 50 Mio. EUR; Eskalation Treasury. |
| Korrespondenzbank-Nostro | gem. Kontrakt | Routing-Wechsel zur Backup-Korrespondenzbank. |

## 9. Freigabe und Mehraugen-Prinzip

Stellvertretungsregelungen sind im Berechtigungsmanagement-System BMS hinterlegt; ein Sachbearbeiter kann sich nicht selbst freigeben.

| Auftragstyp / Betrag | Freigabestufe | Anmerkung |
| --- | --- | --- |
| SCT bis 25 TEUR | 2-Augen (autom. Workflow) | STP; keine zusätzliche Person. |
| SCT 25 TEUR bis 100 TEUR | 4-Augen (Sachbearbeiter + TL) | Genehmigung in PH-2025. |
| SCT 100 TEUR bis 1 Mio. EUR | 4-Augen (TL + Bereichsleitung) | Mit Begründung. |
| SCT > 1 Mio. EUR oder Sanktionsland | 6-Augen (TL + BL + Compliance-Officer) | Telefon-Rückverifikation Pflicht. |
| SWIFT MT103 bis 500 TEUR | 4-Augen (Specialist + TL) | Charge-Bearer dokumentiert. |
| SWIFT MT103 > 500 TEUR | 6-Augen (Specialist + TL + Vorstand-Stellv.) | Pre-Approval erforderlich. |
| SWIFT MT202 (Korrespondenz) | 4-Augen (Specialist + Treasury-Rep) | Settlement nur über CSCF-konforme Channels. |

## 10. Clearing und Settlement

### 10.1 SEPA Credit Transfer / Instant
SCT-Aufträge werden in Batches an RT1/STEP2 übertragen; SCT-Inst-Aufträge in Einzeltransaktionen über RT1 oder TIPS. Maximale Verarbeitungszeit 10 Sekunden. Verfügbarkeitsanforderung 99,9 % (TIPS) bzw. 99,7 % (RT1); nichtverfügbare Zeiten sind im DORA-Vorfallsmanagement zu erfassen.

### 10.2 SEPA Direct Debit
Erstlastschriften (CORE) mit Pre-Notification 14 Tage vor Fälligkeit. Folgelastschriften 2 TARGET-Tage Vorlauf, B2B 1 TARGET-Tag. Rückgaberechte: CORE 8 Wochen unbegründet, 13 Monate bei fehlendem Mandat; B2B kein Rückgaberecht.

> **Hinweis — Mandatsverwaltung:** Mandate werden im Mandatsmodul MM-22 verwaltet. Bei Mandatsänderungen ist ein Mandatswechsel-Lauf zwingend; bei Annahmeverweigerungen 36 Monate keine erneute Einreichung ohne neue Mandatserteilung.

### 10.3 SWIFT MT103/MT202 und MX
SWIFT-Nachrichten werden über zertifizierte Gateways gesendet; Authentizität über SWIFT-Authentication-Codes (FIN) bzw. Signaturen (ISO 20022 MX). Korrespondenzbanken sind im Register KR-2026 mit Bonität, KYC-Status und Settlement-Capacity hinterlegt.

### 10.4 TARGET2 und CLS
TARGET2 wickelt Großbetrags-Zahlungen in Echtzeit ab (RTGS). Die CLS-Bank wickelt Fremdwährungs-Zahlungen Payment-versus-Payment ab.

## 11. Reconciliation und Buchung

- Tägliche EOD-Abstimmung der Nostro-Konten gegen die SWIFT MT940/MT942.
- Wöchentliche Abstimmung der Sammelkonten gegen ein gleitendes 30-Tage-Reporting.
- Monatliche Saldenabgleichung gegen externe Korrespondenzbankberichte.
- Abweichungs-Klärung innerhalb 5 Werktagen; ungeklärte Differenzen ab 1 TEUR Eskalation an Operational Risk.

## 12. Reporting an Bundesbank und BaFin

- AnaCredit-Reporting — monatlich, Frist 30 Werktage nach Monatsende.
- AWV-Meldung — bei grenzüberschreitenden Zahlungen über 12.500 EUR, monatlich.
- Zahlungsstatistik (Bundesbank ZahlStat) — quartalsweise.
- Vorfallsmeldung an BaFin gemäß DORA Art. 19 — Initial-Notification innerhalb 4 Stunden, Intermediate-Report innerhalb 72 Stunden.
- Erstmeldung Datenpannen DSGVO an LDSB innerhalb 72 Stunden.

## 13. Eskalation, Notfall und DORA-Bezug

Wesentliche Ereignisse sind innerhalb 4 Stunden zu erfassen; Klassifikation S1 (existenzbedrohend) bis S4 (gering).

| Vorfall | Kritikalität | Reaktion |
| --- | --- | --- |
| Ausfall Payment-Hub > 30 Min. | S1 | BCM-Alarm; Failover zu Backup-RZ; Vorstand-Info. |
| Ausfall SWIFT-Connectivity | S1 | Backup-Channel aktivieren; Treasury alarmieren. |
| Hoher Anteil Settlement Fails | S2 | Root-Cause-Analyse; Eskalation EBA-Reporting. |
| Massenhaft False-Positive-Treffer | S2 | Filter-Re-Tuning; Compliance involvieren. |
| Phishing-/Fraud-Welle | S2 | Fraud-Team-Aktivierung; Kundeninformation prüfen. |
| Vereinzelter Settlement Fail | S3 | Standard-Klärung; Penalty-Erfassung CSDR. |

## 14. Fraud-Prävention

- Echtzeit-Scoring jedes Auftrags über Anti-Fraud-Engine; Score > 80 löst Step-up-Auth aus.
- Telefon-Rückruf-Pflicht ab 250 TEUR Einzelauftrag bei kurzfristig geänderten Empfängerkonten.
- Quartalsweise Phishing-Simulationen für interne und externe Mitarbeitende.
- Schulung „Account Takeover" jährlich verpflichtend für alle Ops-Mitarbeitenden.
- CEO-Fraud-Awareness-Briefings für Firmenkundenbetreuer mit Eskalations-Hotline.

## 15. Risiko-Kontroll-Sicht (für ControlHub)

### c1 — Auftragsannahme
- **Risiko (finanzkriminalitaet / extern):** CEO-Fraud / Social Engineering durch manipulierte Zahlungsaufträge.
  - Kontrolle: Telefon-Rückruf bei Großbeträgen ab 250 TEUR (präventiv, manuell, je Transaktion).
  - Kontrolle: Verhaltensanalytik / Anti-Fraud-Scoring (detektiv, automatisch, je Transaktion).
- **Risiko (operationelles-risiko / human):** Falsche Auftragsannahme durch unzureichende Identifikation des Kunden.
  - Kontrolle: SCA-Authentifizierung und Identifikation gemäß § 13 GwG (präventiv, hybrid, je Transaktion).

### c2 — Plausibilitätsprüfung
- **Risiko (operationelles-risiko / prozess):** Fehlende Plausibilitätsprüfung lässt fehlerhafte IBAN oder Beträge passieren.
  - Kontrolle: Automatisierte Plausibilisierung mit Hard-Stop (detektiv, automatisch, je Transaktion).
- **Risiko (finanzkriminalitaet / extern):** Fake-Receiver-IBAN wird nicht erkannt.
  - Kontrolle: Confirmation of Payee / Beneficiary-Name-Matching (präventiv, automatisch, je Transaktion).

### c3 — Embargo-/Sanktionsfilter
- **Risiko (compliance-risiko / gwg):** Verstoß gegen EU-Sanktionsverordnungen bei Trefferunterdrückung oder False-Negatives.
  - Kontrolle: Empfänger-Sanktionscheck in Echtzeit mit Hard-Stop (präventiv, automatisch, je Transaktion).
  - Kontrolle: GwG-Officer-Review der Treffer-Disposition (detektiv, manuell, monatlich).
- **Risiko (compliance-risiko / regulatorik):** Unvollständige Konfiguration der Sanktionslisten im Echtzeit-Filter.
  - Kontrolle: Listen-Update-Protokoll und Konfigurations-Review (detektiv, hybrid, täglich).

### c4 — Limitprüfung
- **Risiko (operationelles-risiko / system):** Limitsystem prüft nicht in Echtzeit, dadurch Überziehung möglich.
  - Kontrolle: Echtzeit-Limitprüfung im Payment-Hub mit Hard-Stop (präventiv, automatisch, je Transaktion).
- **Risiko (modell-risiko / daten):** Veraltete Limit-Stammdaten in Konzernlimiten.
  - Kontrolle: Stammdaten-QM der Limitparameter (detektiv, hybrid, monatlich).

### c5 — Freigabe & Routing
- **Risiko (finanzkriminalitaet / intern):** Umgehung des Vier-Augen-Prinzips durch Sammelbuchung oder Stellvertreterregelung.
  - Kontrolle: Funktionstrennung im BMS und 6-Augen für sensible Transaktionen (präventiv, manuell, je Transaktion).
- **Risiko (operationelles-risiko / system):** Routing-Fehler in SEPA/SWIFT führt zu doppeltem Versand.
  - Kontrolle: Duplikatserkennung und Tagesabschluss-Abstimmung (detektiv, automatisch, täglich).

### c6 — Buchung & Reporting
- **Risiko (compliance-risiko / regulatorik):** Verspätete oder unvollständige Meldungen an die Bundesbank (AWV/AnaCredit).
  - Kontrolle: Reporting an BaFin/Bundesbank mit Vier-Augen-Freigabe (detektiv, hybrid, monatlich).
- **Risiko (operationelles-risiko / prozess):** Bestände im Hauptbuch und Subledger weichen voneinander ab.
  - Kontrolle: Tägliche Nostro-/Subledger-Reconciliation (detektiv, automatisch, täglich).

## 16. Anhänge

- Anhang 1: Cut-off-Times pro Scheme und Korridor (vollständige Matrix)
- Anhang 2: Sanktionslisten-Update-Protokoll (Standard-Form)
- Anhang 3: Eskalationskontakte rund um die Uhr (24×7-Rufbereitschaft)
- Anhang 4: SWIFT-CSCF-Kontrollkatalog Mapping (CSCF v2026)
- Anhang 5: Standard-Vorlage Vorfallsmeldung an BaFin (DORA Art. 19)
- Anhang 6: Glossar ISO-20022-Nachrichtentypen
