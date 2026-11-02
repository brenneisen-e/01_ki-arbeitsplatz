---
dokument_id: MH-IKS-2026-001
titel: Methodenhandbuch Risiko- und Kontroll-Taxonomie (NFR / IKS)
typ: Methodenhandbuch
version: "1.0"
gueltig_ab: 30.06.2026
eigentuemer: Operational Risk & Compliance (2nd Line of Defense)
methodische_aufsicht: Operational Risk & Compliance (2nd Line of Defense)
klassifizierung: VERTRAULICH — Stufe 2 (Internal Use Only) — synthetische Demo-Daten
prozess_id: ""
kategorie: Methodik
regulatorik:
  - MaRisk AT 4.3 (Internes Kontrollsystem), AT 4.3.2 (Risikosteuerung)
  - Verordnung (EU) 2022/2554 (DORA)
  - Verordnung (EU) 2024/1689 (EU AI Act)
  - BaFin-Rundschreiben zum Risikomanagement
---

# Methodenhandbuch Risiko- und Kontroll-Taxonomie (NFR / IKS)

> Synthetisches Demo-Dokument für ControlHub — alle Namen, Zahlen und Sachverhalte sind frei erfunden.

Referenz-Taxonomie für nicht-finanzielle Risiken (NFR), Kontrollarten und Bewertungslogik im ControlHub-Regelkreis. Dieses Dokument bildet die methodische Klammer über alle Prozessdokumente des Korpus.

## Metadaten

| Feld | Wert |
| --- | --- |
| Dokument-ID | MH-IKS-2026-001 |
| Version | 1.0 |
| Gültig ab | 30.06.2026 |
| Geltungsdauer | 12 Monate |
| Eigentümer | Operational Risk & Compliance (2nd Line of Defense) |
| Methodische Aufsicht | Operational Risk & Compliance (2nd Line of Defense) |
| Regulatorischer Rahmen | MaRisk AT 4.3; DORA; EU AI Act; BaFin-Rundschreiben Risikomanagement |
| Klassifizierung | VERTRAULICH — Stufe 2 (Internal Use Only). |
| Geltungsraum | Konzern (alle Bereiche, methodische Referenz) |

## Versionshistorie

| Version | Datum | Autor | Änderung |
| --- | --- | --- | --- |
| v0.9 | 12.05.2026 | OpRisk-Methodik | Entwurf zur Konsultation 2nd LoD |
| v1.0 | 30.06.2026 | OpRisk-Methodik | Erstfreigabe als verbindliche Referenz-Taxonomie |

## Inhaltsverzeichnis

1. Zweck und Anwendung
2. Der ControlHub-Regelkreis in vier Schritten
3. Three-Lines-of-Defense
4. Risiko-Taxonomie (NFR-Kategorien und Unterarten)
5. Bewertungslogik (Eintrittswahrscheinlichkeit × Schadenhöhe)
6. Kontrollarten, Kontrolltypen und Frequenzen
7. Schlüsselkontrollen und Wirksamkeit
8. Mapping Dokumente → Prozesse → Risiken → Kontrollen
9. Governance und Pflege der Taxonomie
10. Anhänge

## 1. Zweck und Anwendung

Dieses Methodenhandbuch definiert die einheitliche Taxonomie und Bewertungslogik, mit der ControlHub aus Eingangsdokumenten Prozessschritte, Risiken und Kontrollen ableitet. Es stellt sicher, dass alle Fachdokumente (Leitfäden, Handbücher, Richtlinien) dieselben Risiko-Kategorien, Kontrollarten und Bewertungsskalen verwenden und somit konzernweit vergleichbar sind.

## 2. Der ControlHub-Regelkreis in vier Schritten

| Schritt | Bezeichnung | Inhalt |
| --- | --- | --- |
| 1 | Prozessanalyse | Auslesen des Eingangsdokuments, Erkennung des Prozesses und der Aktivitäten. |
| 2 | Risikoidentifikation | Ableitung der je Aktivität relevanten Risiken anhand der NFR-Taxonomie. |
| 3 | Risikobeschreibung und -bewertung | Konkretisierung und Bewertung nach Eintrittswahrscheinlichkeit × Schadenhöhe. |
| 4 | Kontrollidentifikation | Zuordnung präventiver/detektiver Kontrollen, Kennzeichnung von Schlüsselkontrollen. |

Das Ergebnis wird in der Risiko-Kontroll-Matrix (RKM) dokumentiert und im IKS-Regelkreis fortlaufend überwacht.

## 3. Three-Lines-of-Defense

| Linie | Funktion | Rolle im IKS |
| --- | --- | --- |
| 1st Line of Defense | Markt / Operations / Fachbereiche | Risikoverantwortung, Durchführung der Kontrollen. |
| 2nd Line of Defense | Operational Risk & Compliance | Methodik, Überwachung, unabhängige Bewertung. |
| 3rd Line of Defense | Interne Revision | Unabhängige Prüfung der Wirksamkeit. |

## 4. Risiko-Taxonomie (NFR-Kategorien und Unterarten)

Verbindlich sind ausschließlich die folgenden sechs Kategorien mit ihren Unterarten. Die IDs sind maschinenlesbar im Manifest (`manifest.json`) hinterlegt.

### 4.1 Operationelles Risiko
| Unterart | ID | Beschreibung |
| --- | --- | --- |
| Prozessrisiken | prozess | Fehler in Geschäftsprozessen, Workflows oder Verfahren. |
| Personalrisiken | human | Menschliche Fehler, Schulungslücken, Wissensverlust. |
| IT- & Systemrisiken | system | Systemausfälle, Fehlfunktionen, Datenintegrität. |
| Externe Ereignisse | extern | Lieferanten, Katastrophen, Pandemien. |

### 4.2 Compliance- & Rechtsrisiko
| Unterart | ID | Beschreibung |
| --- | --- | --- |
| Regulatorische Verstöße | regulatorik | Verstoß gegen MaRisk, KWG, MaComp, BAIT, DORA. |
| Geldwäsche & Sanktionen | gwg | GwG, KWG § 25h, EU-Sanktionsverordnungen. |
| Datenschutz | dsgvo | DSGVO, BDSG, Auftragsverarbeitung. |
| Vertragsrechtliche Risiken | vertrag | Unwirksame Klauseln, fehlende Mandate. |

### 4.3 Reputationsrisiko
| Unterart | ID | Beschreibung |
| --- | --- | --- |
| Kundenwahrnehmung | kunde | Falsche Beratung, Servicefehler, Beschwerden. |
| Medien & Öffentlichkeit | medien | Negative Berichterstattung, Social Media. |
| ESG-Reputationsrisiken | esg | Greenwashing, soziale Standards. |

### 4.4 Finanzkriminalität & Betrug
| Unterart | ID | Beschreibung |
| --- | --- | --- |
| Interner Betrug | intern | Unterschlagung, Manipulation durch Mitarbeitende. |
| Externer Betrug | extern | CEO-Fraud, Identitätsbetrug, Kreditbetrug. |
| Cyber-Fraud | cyber | Phishing, Account Takeover, Ransomware. |

### 4.5 Modell- & Daten-Risiko
| Unterart | ID | Beschreibung |
| --- | --- | --- |
| Modellrisiken | modell | Falsche Annahmen, Overfitting, fehlende Validierung. |
| Datenqualität | daten | Inkonsistenzen, Lücken, falsche Stammdaten. |
| KI-/Algorithmus-Risiko | ki | Bias, Black-Box, EU-AI-Act-Compliance. |

### 4.6 Auslagerungs- & Drittparteienrisiko
| Unterart | ID | Beschreibung |
| --- | --- | --- |
| Dienstleistersteuerung | dienstleister | Schlechte SLA-Erfüllung, mangelnde Kontrolle. |
| Konzentrationsrisiko | konzentration | Klumpenrisiken durch wenige Anbieter. |
| Exit-Risiko | exit | Schwierige Rückführung von Leistungen. |

## 5. Bewertungslogik (Eintrittswahrscheinlichkeit × Schadenhöhe)

Risiken werden zweidimensional bewertet. Die Brutto-Bewertung (vor Kontrollen) und die Netto-Bewertung (nach Kontrollwirkung) ergeben gemeinsam die Risikoposition in der Heatmap.

### 5.1 Eintrittswahrscheinlichkeit
| Stufe | Bandbreite |
| --- | --- |
| Gering | < 5 % |
| Mittel | 5–20 % |
| Hoch | > 20 % |

### 5.2 Schadenhöhe
| Stufe | Bandbreite |
| --- | --- |
| Gering | < 50 TEUR |
| Mittel | 50–250 TEUR |
| Hoch | > 250 TEUR |

### 5.3 Risikoklassen (Tier)
| Tier | Bedeutung | Standard-Default (Demo) |
| --- | --- | --- |
| high | Hohes Risiko | Eintrittswahrscheinlichkeit hoch, Schaden hoch |
| mid | Mittleres Risiko | Eintrittswahrscheinlichkeit mittel, Schaden mittel |
| low | Geringes Risiko | Eintrittswahrscheinlichkeit gering, Schaden gering |

> **Hinweis — Confidence-Mapping:** Im ControlHub-Vorschlagsraster werden KI-Vorschläge mit einer Konfidenz versehen (first/second/third). Vorschläge mit hoher Konfidenz (first) werden standardmäßig der höchsten Risikoklasse zugeordnet; die Bewertung ist durch die 1st Line zu bestätigen oder anzupassen.

## 6. Kontrollarten, Kontrolltypen und Frequenzen

### 6.1 Kontrollart (Wirkrichtung)
| Art | Beschreibung |
| --- | --- |
| Präventiv | Verhindert den Risikoeintritt im Vorfeld. |
| Detektiv | Erkennt den Risikoeintritt nachträglich. |

### 6.2 Kontrolltyp (Durchführung)
| Typ | Beschreibung |
| --- | --- |
| Manuell | Manuelle Tätigkeit durch eine Person. |
| Automatisch | IT-gestützt, regelbasiert. |
| Hybrid | Kombination aus manuell und automatisch. |

### 6.3 Kontrollfrequenz
| Frequenz | ID |
| --- | --- |
| Je Transaktion | jede-transaktion |
| Täglich | taeglich |
| Wöchentlich | woechentlich |
| Monatlich | monatlich |
| Quartalsweise | quartalsweise |
| Halbjährlich | halbjaehrlich |
| Jährlich | jaehrlich |
| Anlassbezogen | anlassbezogen |

## 7. Schlüsselkontrollen und Wirksamkeit

Eine Schlüsselkontrolle ist eine Kontrolle, deren Ausfall die Wahrscheinlichkeit oder die Auswirkung eines wesentlichen Risikos materiell erhöht (MaRisk AT 4.3.1). Je wesentlichem Risiko ist mindestens eine Schlüsselkontrolle zu bestimmen. Die Wirksamkeit wird über Design-Effektivität (angemessene Ausgestaltung) und Durchführungs-Effektivität (tatsächliche Anwendung) bewertet und durch die 2nd Line stichprobenartig überprüft.

## 8. Mapping Dokumente → Prozesse → Risiken → Kontrollen

Jedes Eingangsdokument des Korpus enthält einen Abschnitt „Risiko-Kontroll-Sicht (für ControlHub)", der die Aktivitäten eines Prozesses auf Risiken (Kategorie/Unterart) und Kontrollen (Art/Typ/Frequenz) abbildet. Die `manifest.json` aggregiert diese Struktur maschinenlesbar.

| Prozess-ID | Dokument | Aktivitäten |
| --- | --- | --- |
| kreditvergabe | PL-FK-2026-014 | a1–a8 |
| zahlungsverkehr | OH-ZV-2026-007 | c1–c6 |
| wertpapierabwicklung | PH-WP-2026-009 | b1–b6 |
| antragsmanagement | FH-SCH-2026-021 | d1–d7 |
| transaktionsmonitoring | RL-AML-2026-003 | e1–e6 |
| auslagerungsmanagement | RL-AUS-2026-005 | f1–f7 |

## 9. Governance und Pflege der Taxonomie

Änderungen an Kategorien, Unterarten, Skalen oder Kontrollvokabular erfolgen ausschließlich über das Operational Risk Committee. Jede Änderung ist zu begründen, zu versionieren und auf die `manifest.json` sowie alle Prozessdokumente durchzureichen, um die Konsistenz des Korpus zu wahren.

## 10. Anhänge

- Anhang 1: Heatmap-Schema (3×3) Eintrittswahrscheinlichkeit × Schadenhöhe
- Anhang 2: ID-Referenz Kategorien und Unterarten (maschinenlesbar)
- Anhang 3: Kontroll-Bibliothek je Risiko-Unterart (Auszug)
- Anhang 4: Vorlage Risiko-Kontroll-Matrix (RKM)
- Anhang 5: Stichprobenrichtlinie Wirksamkeitsprüfung 2nd LoD
