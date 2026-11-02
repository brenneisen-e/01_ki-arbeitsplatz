# Zusammenfassung Blindpool -- BarmeniaGothaer

*Stand: Februar 2026 | Basierend auf: Taskforce Blindpool (13.02.2026), Update Provision (02/2026), Deloitte Kurzangebot (19.02.2026)*

---

## 1. Fachliche Zusammenfassung

### 1.1 Ausgangslage und Kontext

Die BarmeniaGothaer (BG) entstand aus der Fusion der ehemaligen Barmenia und der ehemaligen Gothaer. Im Zuge der Integration wurde das Projekt **ICM2026** umgesetzt, das die ex-Barmenia-Vermittler (Selbststaendige, Angestellte, Azubis) in das angeglichene Provisionsmodell **BGAV** ueberfuehrt hat. Dazu gehoerten u.a.:

- Einfuehrung von AP/FP (Abschluss-/Folgeprovision) fuer SHUK in SAP FS-ICM
- Angleichung der Provisionslogik in LV und KV
- Einheitliche Reverse- und Karrierestufen (Fahrstuhllogik)
- Einfuehrung von Mitverdienerstrukturen inkl. Untervermittlerlogik
- Anbindung von FS-ICM an die bestehende Blindpool-Loesung

### 1.2 Was ist der Blindpool?

Der **Blindpool** ist eine zentrale Datendrehscheibe, die als Integrationsschicht zwischen den beiden getrennten Provisionssystemwelten fungiert:

- **Ex-Barmenia-Welt**: SAP FS-ICM (adesso Partner, SAP Business Partner)
- **Ex-Gothaer-Welt**: 3P/Allis (3PAllis, VPT, VD-AGT, GL-Bestand)

Da die Vermittler in der jeweils anderen Systemwelt nicht individuell bekannt sind, wird eine **Sammelvermittlernummer** in Kombination mit einem **Fremdordnungsmerkmal** (Freitext) verwendet. Der Blindpool nimmt die Provisionsdaten auf und wandelt sie konsistent in die Datenlogik der jeweils anderen Systemwelt um. Diese Loesung wird als **"maskierter Blindpool"** bezeichnet.

### 1.3 Die "Blindpool-Krise" -- Vertriebliche Herausforderungen

Die aktuelle Sammelvermittlernummer-Loesung fuehrt zu erheblichen vertrieblichen Einschraenkungen:

**Neugeschaeftssteuerung:**
- Ex-Barmenia-Vermittler sind von Vertragsaktionen ausgeschlossen (Rabattsystem K-Fit, Gewerbebonus, Umdeckeraktionen, Kampagnen)
- Individuelle Berechtigungen, Antragsbuchungen und Kundenzuordnung eingeschraenkt

**Bestandsmanagement:**
- Keine vermittlerindividuellen Bestandsaktionen (Scoring, Wenigfahrer, OK-Verfahren, Agentursanierung)
- Bestandsuebertragungen und GI-Eintraege nur eingeschraenkt verfuegbar

**Vertriebskommunikation:**
- Agenturinformationen, Kopien, Anschreiben, Spezialmails und Antragserinnerungsverfahren koennen nicht automatisch versendet werden

**Weitere offene Herausforderungen (FACH):**
- Keine identische vertragliche Grundlage fuer ex-B. und ex-G. Vermittler
- Keine Mitverdienerkonstrukte zwischen den ex-Vertrieben
- Keine Provision nach Bestandsuebertragungen
- Keine gemeinsame, einheitliche Abrechnung (2 getrennte Abrechnungen)
- Keine einheitlichen Rabatte

### 1.4 Optionenraum und Empfehlung

Es wurden vier Optionen bewertet:

| Option | Beschreibung | Bewertung |
|--------|-------------|-----------|
| **1** | Blindpool unveraendert, Rabattvolumen erhoeht | Produktkalkulation nicht haltbar; wirtschaftliche Vorgaben verletzt |
| **2** | Ex-B. Produktportfolio bleibt verkaufsoffen | Verstoesst gegen BaFin-Vorgaben; Uneinheitlichkeit in Vermittlerbehandlung |
| **3** | Ex-B. Partnersystem fuehrend fuer beide Vertriebe | Sehr hoher technischer und organisatorischer Aufwand; extrem komplex |
| **4** | **Gegenseitige Stammdatenanlage und Demaskierung Blindpool** | **Empfohlen (kurz-/mittelfristig)**: Erfordert doppelte Datenpflege, aber kurzfristig realisierbar |

**Option 4 ist die pragmatische Empfehlung** -- sie ist ein Zwischenschritt zum langfristigen Zielbild (Option 3) mit schnellerer Umsetzbarkeit. Ambitioniertes Ziel: Umsetzung bis **30.06.2026**, da das alte ex-B. Produktportfolio zu diesem Zeitpunkt eingestellt wird.

### 1.5 Loesungshypothese: Demaskierung Blindpool

Die Kernidee: **EV-Vermittler werden jeweils gegenseitig, gespiegelt in beiden Systemwelten angelegt** und mit Vermittlernummern der jeweiligen Welt versehen.

Beispiel:
- Ein ex-Barmenia-Vermittler erhaelt in der ex-Gothaer-Welt: 1x Allis-Nr., 1x VDAGT-Nr., 1x GLBK-Nr.
- Ein ex-Gothaer-Vermittler erhaelt in der ex-Barmenia-Welt: 1x BD-VM-Nummer je Allis-Nr.

**Erwartete Aktivitaeten:**
- Gegenseitige Anlage der Vermittler und Hierarchien in beiden Systemwelten
- Anpassung der SST und des Servicelayers zur Versorgung der Umsysteme
- Umstellung etablierter Blindpoolregeln auf individuelle Vermittler-Nr.
- Definition und Anpassung der Provisionsprozesse
- Anlage der Rabattkonten fuer neuangelegte Vermittler
- Laufende Pflege der Stammdaten (manuell / Synchronisation im Aufbau)

### 1.6 Uebergeordnete Provisions-Roadmap 2026 ff.

Die Taskforce Blindpool (Thema I) ist eingebettet in eine groessere Roadmap mit acht Themenbloecken:

**Fachliche und vertriebliche Anforderungen:**
1. Aufloesen vertrieblicher Defizite der Sammelvermittlernr.-Loesung *(Taskforce Blindpool)*
2. Silo-uebergreifende Bestandsuebertragung *(abhaengig von I)*
3. Eine Verguetung -- fachliche Konzeption und Roadmap *(Zielbild FS-ICM als gesamthafte BG-Loesung)*
4. Vereinheitlichung Abrechnung und Note *(optional, abhaengig von II)*

**Technische Grundlagen:**
5. Systemupdates FS-ICM *(NetWeaver-Update, EHP 8, ILM)*
6. Technische Performance-Optimierung *(Code-Ebene, Archivierung)*
7. Anpassung Vertriebsreporting *(optional, Absatzeinheiten nach SAS)*
8. S/4HANA und Journey-to-Cloud *(Upgrade bis Ende 2027)*

---

## 2. Technische Zusammenfassung

### 2.1 Systemlandschaft

Die BarmeniaGothaer betreibt zwei parallele Provisionssystemwelten:

**Ex-Barmenia-Systemwelt:**
- **adesso Partner**: Fuehrendes Partnersystem (Stammdaten)
- **SAP FS-ICM**: Provisionsberechnung und -abrechnung (on premise, R/3)
- **SAP FS-CD**: Abrechnungssystem
- **SAP FI**: Finanzwesen / Geldfluss
- Identifikation: ADMNR8 (8-stellig num.), BP-ID (10-stellig num.), BD-Vermittlernummer (8-stellig, xxxx/xxxx)

**Ex-Gothaer-Systemwelt:**
- **3P/Allis (3PAllis)**: Provisionsberechnung und -abrechnung
- Identifikation: VPT-Nr. (10-stellig alphanum.), Allis-Nr. (7-stellig num.), VD-AGT-Nr., GL-Bestandskennzeichen

### 2.2 Datenmodelle

**Ex-Barmenia:**
- Vermittler = 1x ADM-Nummer (adesso) + 1x BP-ID (SAP BP)
- Pro Vermittlerrolle (84er, Ausbilder etc.) ein Provisionsvertrag
- Pro Provisionsvertrag eine eindeutige BD-Vermittlernummer
- Abschluesse ueber BD-Vermittlernummer in Barmenia TAA-Strecken

**Ex-Gothaer:**
- Vermittler = 1x VPT-Nummer (eindeutig)
- Ein Vermittler kann mehrere Allis-Nummern fuehren (1:n)
- Jede Allis-Nr. hat genau eine VD-AGT-Nr. und bis zu ein GL-Bestandskennzeichen (1:1)
- Abschluesse bestandssystemabhaengig ueber Allis-Nr., VD-AGT-Nr. oder GL-Bestandskennz.

### 2.3 Mapping-Loesung fuer Stammdaten-Synchronisation

Ein eindeutiges Mapping zwischen beiden Welten ist moeglich:

- **BP-ID <-> VPT-Nr.**: Beide sind je Person eindeutig -> Zuordnung FS-ICM (BP) zu 3PAllis (VPT)
- **BD-VM-Nr. <-> Allis-Nr.**: Zentraler Schluessel fuer die Zuordnung von Vermittlerinformationen

Bei der gegenseitigen Anlage werden **keine Dubletten erzeugt**, da silofremde Vermittler mit neuen Nummern aus eigenen Nummernkreisen angelegt werden.

### 2.4 AS-IS Integration via Blindpool (aktueller Zustand)

**Prozess ex-Barmenia-Vermittler (verkauft ex-G. Produkt):**
1. VM nutzt Sammelvermittler-Nr. + BD-VM-Nr. als Fremdordnungsmerkmal
2. Blindpool mappt auf SST Provision
3. 3P/Allis berechnet Provision Generalvertreter
4. Geldfluss ueber CSV/EUR zurueck nach FS-ICM

**Prozess ex-Gothaer-Vermittler (verkauft ex-B. Produkt):**
1. VM nutzt Sammelvermittler-Nr. + Allis-VM-Nr. als Fremdordnungsmerkmal
2. FS-ICM berechnet Provision Generalvertreter
3. Export via CSV/PDF/EUR ueber Blindpool an 3P/Allis

### 2.5 TO-BE: Demaskierung -- Technische Umsetzung

**Ex-B. Vermittler-Perspektive (in ex-G. System):**
1. Fuer jede BD-VM-Nr. wird 1x Allis-Nr., 1x VDAGT-Nr., 1x GLBK-Nr. (eigener Nummernblock) angelegt
2. Neuangelegte VM werden als UVM der vorhandenen BK-Allis-Nummer angelegt
3. Laufende manuelle Pflege / optionaler Aufbau Synchronisation
4. VM gibt neue Allis-VM-Nr./VDAGT-Nr./GLBK in TAA an, BD-VM-Nr. im Fremdordnungsmerkmal
5. SST und Servicelayer zur Versorgung von Umsystemen anpassen
6. Individuelle Allis-VM-Nr. erhaelt 0% Provision; BK-Allis-VM-Nr. erhaelt Differenzprovision (Generalvertreter)
7. Erkennung ex-B. VM anhand eigener Nummernblock-Logik der GLBK -> GeVo via Blindpool nach FS-ICM
8. Erweiterung um Vermittler-Auskunftsservice im Servicelayer

**Ex-G. Vermittler-Perspektive (in ex-B. System):**
1. Fuer jede VP-Nummer wird eine BD-VM-Nr. mit Provisionsvertrag (Generalvertreterprovision) angelegt
2. Laufende manuelle Pflege / optionaler Aufbau Synchronisation
3. VM gibt neue BD-VM-Nr. in TAA an, VP-Nummer im Fremdordnungsmerkmal
4. SST und Servicelayer anpassen
5. BD-VM-Nr. erhaelt Provision fuer Generalvertreter
6. Mapping-basierte Erkennung ex-G. VM -> GeVo via Blindpool an 3PA
7. Erweiterung um Vermittler-Auskunftsservice im Servicelayer

### 2.6 Technische Herausforderungen (IT)

- **Zwei parallele Provisionssysteme**: Jede Aenderung (insb. Regulatorik) muss in beiden Systemen umgesetzt werden
- **Veraltete Infrastruktur**: FS-ICM (R/3) basiert auf veralteter NetWeaver-Version, weicht vom SAP-Standard ab, Non-HANA
- **Keine direkte Anbindung**: FS-ICM-Instanz hat keine direkte Verbindung zu ex-Gothaer Bestandssystemen (nur via Blindpool und 3PA) -- widerspricht Ziel-Architektur
- **Performance**: Historisch gewachsene Eigenentwicklungen erfordern Optimierung

### 2.7 Technische Roadmap

| Zeitraum | Massnahme |
|----------|-----------|
| 2026 H1 | Gegenseitige VM-Anlage, Anpassung SST/Servicelayer/Umsysteme |
| 2026 | Update NetWeaver und EHP 8, Aktivierung ILM |
| 2026 | Performance-Analyse und -Optimierung |
| 2026 | Konzeption Journey-to-Cloud, Vorbereitung S/4HANA |
| 2027 | S/4HANA-Upgrade und Journey-to-Cloud (RISE) |
| 2027 ff. | Umstellung "echtes Neugeschaeft" aller Sparten nach BGAV via FS-ICM |

---

## 3. Governance und Organisation

### 3.1 Taskforce-Struktur

**SteerCo:** Heindl, Thomsen, Nordhues, Dornhof, Baechli, Moll

**Taskforceleitung:**
- Fach: Bitter (ex-B.), Richter (ex-G.)
- IT: Langensiepen (ex-B. und ex-G.)
- Steuerung/PMO: Vogel

**Workstreams:**
1. **Stammdaten und Hierarchie** -- Fach: Bitter/Bauer (ex-B.), Feuser/Frauendorf (ex-G.); IT: Weber (ex-B.), Stauf (ex-G.)
2. **Segment und Bestand** -- Ex-G.: Wittstock, Bolzmann, Bernards u.a.; Ex-B.: n.n.
3. **KMP (Vertriebs-IT, CRM und TAA)** -- Buerger, Ferger, Langensiepen, Stiehl
4. **Provision und Abrechnung** -- Fach: Aurand, Borsz, Duehr (ex-B.), Feuser, Frauenhofer (ex-G.); IT: Baumann (ex-B.), Ross (ex-G.)
5. **Blindpool und Querschnitt-IT** -- IT: Schneider, Weber (ex-B.), Naebars, Stauf, Kotte (ex-G.); ARC: Werner

**Querschnittsfunktionen:**
- Test und Release: n.n.
- EFM und Kommunikation: Eppenstein (ex-B.), Richter (ex-G.)

### 3.2 Externe Unterstuetzung (Deloitte)

Deloitte Consulting bietet Unterstuetzung in drei Modulen:

**A. Anforderungsbeschreibung:** Operative Gesamtprojektsteuerung, Meilensteinplanung (Back-2-Front), Abhaengigkeitsmanagement, Entscheidungsvorbereitung, Qualitaetssicherung

**B. Steuerung und Test:** Datenerhebung, toolbasiertes Simulationsmodell, Simulation AP/FP Komposit, Kalibrierung Ueberleitungssaetze, segmentspezifische Sonderanalysen, Gremienunterlagen

**C. Umsetzung (ICM und Stammdaten):** Konzeption Verguetungselemente AP/FP SHU, Mapping verkaufsoffener Produkte, Anpassung Verguetungsabrechnungsdokumente, Anforderungsdefinition in JIRA, fachliche Tests

**Kommerzielles Volumen (maximal abrufbar):**
- Fach: bis zu 1.149 PT
- IT: bis zu 1.902 PT
- Gesamthonorarnetto: ca. 4,53 Mio. EUR (zzgl. Onsite-Nebenkosten ca. 92 TEUR)
- Abrechnung nach Time and Material
- Geschaetzter Gesamtaufwand (inkl. BG-intern): bis zu 5.065 PT Fach und IT

---

## 4. Kritische Erfolgsfaktoren und Risiken

### Erfolgsfaktoren:
- Schnelle Entscheidungsfindung und konsequente Umsetzung
- Priorisierung als Prio-0-Vorhaben mit Vorfahrt bei Ressourcenkonflikten
- Kurzfristiger Start der konzeptionellen Arbeit
- Management der E2E-Abhaengigkeiten (Antrag bis Vertriebssteuerung)
- Umfassende Simulation und Kalibrierung der Verguetungsangleichung
- Test von mindestens 2-3 Abrechnungszyklen vor Go-Live

### Offene Klaerungspunkte:
- Bestaetigung von Option 4 durch alle Beteiligten
- Vollstaendige Besetzung des Taskforce-Teams
- Vertragliche Anpassungen (u.a. Rabatte)
- Auswirkungen auf Bestandssichten, CRM und weitere Prozesse
- Technisches Konzept fuer Stammdatenspiegelung in beiden Systemwelten
- Detaillierter Zeitplan inkl. MVP-Schnitt zum 30.06.2026
