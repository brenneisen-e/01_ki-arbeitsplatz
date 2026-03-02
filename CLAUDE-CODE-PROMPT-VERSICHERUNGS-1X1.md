# CLAUDE CODE MEGA-PROMPT: Versicherungs-1×1 — Deep Research & Full Build

## MISSION

Du bist verantwortlich für den vollständigen Aufbau des **Versicherungs-1×1** innerhalb der bestehenden Vue.js-Anwendung unter `https://kiarbeitsplatz.pages.dev/#/versicherungs-1x1`. Das Projekt hat **9 Module** plus Glossar und Wissenscheck. Deine Aufgabe besteht aus **zwei Phasen**: Erst tiefgehende Recherche für jedes Modul, dann der vollständige UI-Build mit Kachelsystem, Grafiken, Klickstrecken und interaktiven Elementen.

**Zeitrahmen:** Das wird Stunden dauern. Das ist gewollt. Qualität vor Geschwindigkeit. Jedes Modul muss ein eigenständiges, umfassendes Wissenskapitel sein — kein Überblick, sondern ein echtes Nachschlagewerk.

**Zielgruppe:** Neue Strategie-Berater bei Monitor Deloitte, die aus anderen Industrien kommen und den deutschen Versicherungsmarkt von Grund auf verstehen müssen. Das Wissen muss so tiefgehend sein, dass sie nach dem Durcharbeiten souverän mit Versicherungs-Vorständen sprechen können.

---

## PHASE 1: DEEP RESEARCH (für jedes der 9 Module)

### Recherche-Methodik

Für **jedes** der 9 Module gehst du wie folgt vor:

1. **Web-Recherche mit mindestens 10-15 verschiedenen Suchanfragen pro Modul** — nutze deutsche UND englische Suchbegriffe
2. **Primärquellen bevorzugen**: GDV-Statistiken, BaFin-Berichte, Solvency-II-Daten, Geschäftsberichte der Top-Versicherer, Assekurata-Rankings, McKinsey/BCG/Oliver Wyman Insurance Reports
3. **Aktualität**: Fokus auf 2024/2025-Daten. Bei Zeitreihen mindestens 5-10 Jahre zurück
4. **Tiefe statt Breite**: Lieber 5 Aspekte wirklich durchdringen als 20 oberflächlich anreißen
5. **Praxisbezug**: Für jeden theoretischen Punkt ein konkretes Beispiel aus dem deutschen Markt

### Recherche-Output pro Modul

Speichere die Recherche-Ergebnisse als strukturierte JSON-Dateien unter `/src/data/versicherungs-1x1/`, damit die Vue-Komponenten sie direkt konsumieren können:

```
/src/data/versicherungs-1x1/
├── modul-01-marktueberblick.json
├── modul-02-marktteilnehmer.json
├── modul-03-produktlandschaft.json
├── modul-04-vertriebswege.json
├── modul-05-verguetung.json
├── modul-06-regulatorik.json
├── modul-07-wertschoepfungskette.json
├── modul-08-zukunftsthemen.json
├── modul-09-verbaende.json
├── glossar.json
└── quiz.json
```

### JSON-Schema pro Modul

```json
{
  "moduleId": "01",
  "title": "Der Markt im Überblick",
  "subtitle": "Zahlen, Größenordnungen und Trends",
  "icon": "bar-chart-2",
  "lastUpdated": "2025-03-01",
  "keyStats": [
    {
      "value": "253",
      "unit": "Mrd. €",
      "label": "Gesamtbeitragsvolumen",
      "trend": "+3.2%",
      "trendDirection": "up",
      "source": "GDV Statistik 2024"
    }
  ],
  "sections": [
    {
      "id": "1-1",
      "title": "Marktgröße & Kennzahlen",
      "level": 1,
      "content": "...",
      "subsections": [
        {
          "id": "1-1-1",
          "title": "Beitragsvolumen nach Sparten",
          "level": 2,
          "content": "...",
          "chart": { "type": "treemap", "data": [] }
        }
      ]
    }
  ],
  "charts": [],
  "quiz": [
    {
      "question": "Wie hoch ist das Gesamtbeitragsvolumen...?",
      "type": "single_choice",
      "options": ["..."],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ],
  "glossaryTerms": ["Beitragsvolumen", "Versicherungsdurchdringung"]
}
```

---

## DIE 9 MODULE IM DETAIL

---

### MODUL 01 — DER MARKT IM ÜBERBLICK

**Recherche-Tiefe: MAXIMAL. Das ist das Einstiegskapitel — es muss sofort Kompetenz vermitteln.**

**1.1 Marktgröße & Kennzahlen**
- Gesamtbeitragsvolumen Deutschland (aktuellste Zahl, ca. 253-254 Mrd. €)
- Aufschlüsselung: Leben vs. Kranken vs. Schaden/Unfall (absolute Zahlen + prozentuale Anteile)
- Zeitreihe der Beitragsentwicklung (mindestens 2015-2024)
- Anzahl der Versicherungsunternehmen (Trend: Konsolidierung von ~600 auf ~500)
- Beschäftigte in der Branche (Innen- vs. Außendienst, Trend)
- Kapitalanlagen der Versicherer (Gesamtvolumen ~1,8 Bio. €)
- Versicherungsdurchdringung (Prämien/BIP) im Vergleich

**1.2 Internationale Einordnung**
- Deutschland als 6. größter Versicherungsmarkt weltweit (nach USA, China, UK, Japan, Frankreich)
- Vergleich Prämienvolumen Top-10-Märkte
- Versicherungsdichte (Prämien pro Kopf) im internationalen Vergleich
- Besonderheiten des deutschen Markts: duales Gesundheitssystem, starke bAV-Tradition, Spartentrennungsgrundsatz, föderale Struktur mit Sparkassen/VGH

**1.3 Historische Entwicklung**
- Meilensteine: Deregulierung 1994, Euro-Einführung, Finanzkrise 2008, Niedrigzinsphase, Zinswende 2022
- Strukturelle Veränderungen: Konsolidierungswelle, Run-off-Markt, Digitalisierung

**1.4 Zentrale Markttrends**
- Konsolidierung & M&A (Run-off, Bestandsverkäufe, Fusionen)
- Niedrigzins-Nachwirkungen & Zinswende-Effekte auf Leben/Kranken
- Digitalisierung & Automatisierung (Dunkelverarbeitung, KI-Einsatz)
- Demografischer Wandel (alternde Gesellschaft → Pflege, Rente)
- Klimarisiken & Elementarschaden-Debatte
- ESG & Nachhaltigkeitsregulierung (SFDR, EU-Taxonomie)

**UI-Elemente für dieses Modul:**
- Hero-Kachel: Animierte Kennzahl "253 Mrd. €" mit CountUp-Animation
- Treemap-Chart: Marktanteile Leben/Kranken/Schaden-Unfall
- Zeitreihen-Liniendiagramm: Beitragsentwicklung 2015-2024
- Balkendiagramm: Top-10-Versicherungsmärkte international
- Timeline: Historische Meilensteine (horizontal scrollbar)
- Trend-Kacheln: 6 Kacheln mit Lucide-Icon + Kurzbeschreibung der Megatrends

---

### MODUL 02 — MARKTTEILNEHMER

**Recherche-Tiefe: HOCH. Berater müssen die Player kennen — nicht nur Namen, sondern Geschäftsmodelle.**

**2.1 Erstversicherer — Top-20-Ranking**
- Top 20 nach Beitragseinnahmen (mit Zahlen)
- Aufschlüsselung nach Sparten: Wer ist #1 in Leben? In Kfz? In Kranken?
- Geschäftsmodell-Typologie: Allspartenversicherer vs. Spezialisten vs. Direktversicherer
- Allianz-Gruppe: Sonderstellung als globaler Champion
- ERGO/Munich Re-Konzern: Erst- und Rückversicherung unter einem Dach
- Generali Deutschland, HUK-COBURG, R+V, Debeka, AXA, Zurich, HDI/Talanx, Gothaer, Württembergische, Provinzial, Signal Iduna

**2.2 Rückversicherer**
- Munich Re: größter Rückversicherer der Welt, Geschäftsmodell erklärt
- Hannover Rück: #3 weltweit, Talanx-Konzern
- Was macht ein Rückversicherer? Proportionale vs. nicht-proportionale Rückversicherung
- Retrozession, ILS/Cat Bonds als Markt-Besonderheit

**2.3 Öffentlich-Rechtliche Versicherer**
- Sparkassen-Versicherungen: Provinzial, SV SparkassenVersicherung, VGH
- Besonderheiten: regionaler Fokus, Sparkassen-Exklusivvertrieb, Anstalten des öffentlichen Rechts

**2.4 Versicherungsvereine auf Gegenseitigkeit (VVaG)**
- Rechtsform erklärt (kein Aktionär, Versicherungsnehmer = Mitglied)
- Wichtige VVaGs: HUK-COBURG, Debeka, DEVK, LVM, Alte Leipziger

**2.5 InsurTechs & Neue Player**
- Wefox, Clark, Getsafe, Neodigital, Element, Coya
- Geschäftsmodelle: Vollversicherer vs. MGAs vs. Plattformen vs. Vergleicher
- Wefox-Krise als Case Study
- Check24, Verivox: Vergleichsportale als mächtige Vertriebsplayer

**2.6 Marktkonzentration**
- Herfindahl-Index nach Sparten
- Top-5-Konzentration: Leben (~45%), Kfz (~40%), Kranken (~55%)

**UI-Elemente:**
- Kachelraster: Top-20-Versicherer als Karten mit Logo-Platzhalter, Beitragsvolumen, Sparten-Tags
- Filterbares Ranking: Sortierbar nach Gesamtbeitrag, nach Sparte, nach Rechtsform
- Marktanteils-Donut-Chart: Interaktiv nach Sparte filterbar
- Organigramm/Netzwerkgraph: Konzernstrukturen (z.B. Allianz-Gruppe, Talanx-Konzern)
- InsurTech-Landscape-Map: Kategorisierte Darstellung der InsurTech-Szene

---

### MODUL 03 — PRODUKTLANDSCHAFT

**Recherche-Tiefe: EXTREM HOCH. Das ist das technischste und umfangreichste Kapitel.**

**3.1 Systematik der Versicherungssparten**
- Spartentrennungsgrundsatz (§8 VAG): Leben und Kranken müssen getrennte Gesellschaften sein
- Drei Hauptsäulen: Lebensversicherung, Krankenversicherung, Schaden-/Unfallversicherung
- Versicherungszweige vs. Versicherungsarten vs. Versicherungssparten — Begriffsklärung

**3.2 Lebensversicherung & Altersvorsorge**
- Kapitallebensversicherung (klassisch mit Garantiezins — Auslaufmodell)
- Fondsgebundene Lebensversicherung (FLV), Hybridprodukte (Drei-Topf-Hybrid, iCPPI)
- Risikolebensversicherung
- Rentenversicherung (privat, Basis/Rürup, Riester)
- Drei-Schichten-Modell der Altersvorsorge detailliert:
  - Schicht 1: Gesetzliche Rente + Basisrente (Rürup)
  - Schicht 2: Riester-Rente + bAV
  - Schicht 3: Private Vorsorge (ungefördert)
- Höchstrechnungszins-Entwicklung (4% → 0,25% → 1,0% ab 2025)
- Sicherungsvermögen, Solvabilitätsanforderungen, Überschussbeteiligung

**3.3 Berufsunfähigkeitsversicherung (BU) & Arbeitskraftabsicherung**
- BU: Funktionsweise, abstrakte vs. konkrete Verweisung, Nachversicherungsgarantie
- Alternativen: EU, Grundfähigkeit, Dread Disease, Multi-Risk
- BU-Leistungsquoten, Ablehnungsgründe, Rechtsprechung

**3.4 Betriebliche Altersversorgung (bAV) — Alle 5 Durchführungswege**
1. Direktversicherung (§3 Nr. 63 EStG) — häufigster Weg
2. Pensionskasse — Regulierung verschärft
3. Pensionsfonds — flexibelste Form
4. Unterstützungskasse — rückgedeckt, für Besserverdiener
5. Direktzusage/Pensionszusage — Bilanzierung HGB/IFRS
- Entgeltumwandlung, Arbeitgeberzuschuss (15%), BRSG I+II
- Portabilität, bAV-Marktvolumen

**3.5 Private Krankenversicherung (PKV)**
- GKV vs. PKV: Umlageverfahren vs. Kapitaldeckung
- Versicherungspflichtgrenze (2025: 73.800 €)
- Basistarif, Standardtarif, Notlagentarif
- Alterungsrückstellungen, BAP (§203 VVG, Treuhänderverfahren)
- Vollversicherung vs. Zusatzversicherung, Krankentagegeld, Pflegezusatz
- ~8,7 Mio. Vollversicherte, Debatte Bürgerversicherung

**3.6 Schaden- und Unfallversicherung (Komposit)**
- Kfz: Haftpflicht, Teil-/Vollkasko, Typklassen, Regionalklassen, SF-Klassen, Telematik
- Privathaftpflicht, Hausrat, Wohngebäude (inkl. Elementarschaden-Pflichtversicherung 2025)
- Rechtsschutz, Unfall (Gliedertaxe, Progression)
- Gewerbe/Industrie: Betriebshaftpflicht, D&O, Sach-Industrie, Transport, Technische

**3.7 Cyberversicherung**
- Marktvolumen: ~85 Mio. € (2019) → ca. 1 Mrd. € (2024)
- Deckungskonzepte, Kumulrisiko, Rückversicherungsproblematik

**3.8 Emerging Products**
- Parametrische Versicherung, Embedded Insurance, On-Demand, Microinsurance

**UI-Elemente:**
- Produktkatalog als Kachelraster (jede Sparte klickbar)
- Klickstrecke "Welche Versicherung brauche ich?" (Decision Tree, 5-7 Fragen)
- bAV-Durchführungswege-Vergleich (5-Spalten-Tabelle)
- GKV vs. PKV Entscheidungsbaum
- Drei-Schichten-Modell (visuelles Schaubild)
- Cyber-Markt-Wachstumschart

---

### MODUL 04 — VERTRIEBSWEGE

**Recherche-Tiefe: HOCH. Vertriebsverständnis ist für Berater essenziell.**

**4.1 Ausschließlichkeitsorganisation (AO)**
- §84 HGB, §92 HGB: Rechtliche Grundlage
- Hierarchie: Organisationsleiter → Bezirksdirektor → Vertreter
- Größte AOs: Allianz (~10.000), ERGO, Generali, Zurich
- Rückgang: ~240.000 (2010) → ~175.000 (2024)

**4.2 Makler**
- §59 VVG: Sachwalter des Kunden
- Einzelmakler vs. Pools vs. Verbünde
- Große Pools: Fonds Finanz, Blau Direkt, Hypoport/Qualitypool, vfm
- MVPs: AMEISE, AMS, Keasy
- BiPRO-Schnittstellen

**4.3 Mehrfachagenten**
- Abgrenzung zum Makler, §34d GewO, Hybridmodelle

**4.4 Bancassurance**
- Sparkassen + Provinzial/SV, Volksbanken + R+V, Deutsche Bank + Zurich
- Marktanteil: ~25% Leben, ~10% Komposit

**4.5 Direktvertrieb & Online**
- HUK24, CosmosDirekt, ERGO Direkt
- Check24 (>15 Mio. Kunden), Verivox
- Digitale Abschlussstrecken, Chatbots

**4.6 Marktanteile nach Vertriebsweg und Sparte**
- Matrix Vertriebsweg × Sparte → Marktanteil
- Trend: AO schrumpft, Online wächst, Makler stabil

**4.7 Omnichannel & hybride Modelle**
- "Phygitaler" Vertrieb, Robo-Advisory + Mensch
- Customer Journey im Versicherungsvertrieb

**UI-Elemente:**
- Sankey-Diagramm: Vertragsfluss durch Vertriebskanäle
- Vertriebskanal-Vergleichskacheln (6 Kacheln)
- Marktanteils-Heatmap (Vertriebsweg × Sparte)
- Customer Journey Map (interaktive Klickstrecke)
- Zeitreihe: Verschiebung Vertriebsweganteile 2010-2024

---

### MODUL 05 — VERGÜTUNG UND PROVISION

**Recherche-Tiefe: HOCH. Geldflüsse verstehen = Markt verstehen.**

**5.1 Grundstruktur**
- Abschlussprovision (AP) vs. Bestandsprovision (BP)
- Dynamikprovision, Superprovisionen, Bonifikationen
- Provision (Vertreter) vs. Courtage (Makler)

**5.2 Typische Provisionssätze nach Sparte**
- Leben: AP 40-50‰ Beitragssumme
- BU: AP 30-40‰
- PKV: 6-8 Monatsbeiträge
- Kfz: 8-12% Jahresbeitrag
- Haftpflicht/Hausrat/RS: 15-25%
- Wohngebäude: 15-20%
- Gewerbe: individuell verhandelt

**5.3 Stornohaftung**
- Rückforderung bei Kundenkündigung
- Haftungszeit: 60 Monate bei Leben
- Linear vs. zeitanteilig

**5.4 Regulatorische Eingriffe**
- LVRG I (2015): Deckelung 25‰ bei Leben
- §48a VAG: Provisionsdeckeldebatte
- EU-RIS: Provisionsverbotsdebatte (aktueller Stand recherchieren!)
- IDD-Vergütungsregeln (§48b VAG)

**5.5 Alternative Vergütungsmodelle**
- Honorarberatung (§34h GewO), Nettotarife (<2% Marktdurchdringung)
- Servicegebühren im Maklermarkt
- Internationaler Vergleich: UK, NL (Provisionsverbot)

**UI-Elemente:**
- Provisionsrechner (Sparte + Beitragssumme → AP, BP, Stornohaftung)
- Provisions-Vergleichstabelle aller Sparten
- Geldfluss-Sankey (Kunde → Versicherer → Vertrieb)
- Regulatorik-Timeline (LVRG I → IDD → RIS)
- Vergleichs-Kacheln: Provision vs. Courtage vs. Honorar

---

*Fortsetzung in den folgenden Modulen 06-09 plus UI-Build-Spezifikation...*

---

### MODUL 06 — REGULATORIK

**Recherche-Tiefe: SEHR HOCH. Regulatorik definiert die Spielregeln.**

**6.1 Versicherungsvertragsgesetz (VVG)**
- Grundstruktur: Allgemeiner Teil + Einzelne Zweige
- Schlüssel-§§: §6 (Beratungspflicht), §19 (Anzeigepflicht), §28 (Obliegenheit), §37 (Verzug), §168 (Kündigung LV)
- VVG-Reform 2008, Widerrufsrecht, Dokumentationspflicht

**6.2 Versicherungsaufsichtsgesetz (VAG)**
- Erlaubnispflicht (§8), Spartentrennungsgrundsatz (§8 Abs. 4)
- Geschäftsorganisation (§23), Fit & Proper
- §48a: Provisionsdeckel-Ermächtigung

**6.3 Solvency II — Das europäische Aufsichtsregime**
- Säule 1 — Quantitative Anforderungen:
  - SCR, MCR, Standardformel vs. Internes Modell
  - Best Estimate Liabilities + Risikomarge
  - Eigenmittel Tier 1/2/3
- Säule 2 — Governance:
  - ORSA, Schlüsselfunktionen (Aktuariat, Risiko, Compliance, Revision)
  - MaGo, MaRisk VA
- Säule 3 — Berichterstattung:
  - SFCR (öffentlich), RSR (BaFin), QRT
- Solvency-II-Review 2024/2025: Was ändert sich?

**6.4 Insurance Distribution Directive (IDD)**
- GewO §34d, VersVermV
- POG (Product Oversight and Governance), Zielmarktbestimmung
- Weiterbildungspflicht 15h/Jahr, Cross-Selling-Regeln

**6.5 BaFin-Aufsicht in der Praxis**
- Organisation, Instrumente, aktuelle Fokusthemen
- BaFin-Journal, Rundschreiben, Merkblätter

**6.6 Vermittlerrecht**
- §34d GewO (Vermittler), §34e (Berater), IHK-Registrierung
- Vermittlerregister, Tippgeber, produktakzessorische Vermittlung

**6.7 Verbraucherschutz**
- PIB, DL-InfoV, §7 VVG, Widerrufsrecht (14/30 Tage)

**6.8 Europäischer Rahmen**
- EIOPA, PEPP, DORA, SFDR, EU-Taxonomie, FIDA

**UI-Elemente:**
- Regulatorik-Pyramide (EU → Bund → Unternehmen, klickbar)
- Solvency-II-Drei-Säulen-Schaubild mit Drill-Down
- Gesetzes-Navigator (VVG, VAG, IDD als Kacheln mit Key-§§)
- Timeline: Regulatorische Meilensteine 1994-2025
- BaFin-Organigramm (vereinfacht, interaktiv)
- Quiz: "Welche Aufsichtsregel greift?" (Praxis-Szenarien)

---

### MODUL 07 — WERTSCHÖPFUNGSKETTE

**Recherche-Tiefe: HOCH. Prozessverständnis = Beratungskompetenz.**

**7.1 Produktentwicklung & Aktuariat**
- Produktentwicklungsprozess, aktuarielle Kalkulation
- DAV, Sterbetafeln, Unisex-Tarife (EuGH 2012), POG

**7.2 Underwriting & Risikoprüfung**
- Medizinisches UW (Leben/Kranken), gewerbliches UW
- Automatisiertes UW (regelbasiert, KI), RV-Underwriting

**7.3 Vertragsverwaltung (Bestandsführung)**
- Policierung, Nachträge, Bestandsmigration
- Kernsysteme: msg, adesso, Guidewire, SAP Insurance
- Dunkelverarbeitung / STP: Automatisierungsquoten

**7.4 Schadenmanagement**
- Prozess: Meldung → Prüfung → Regulierung → Auszahlung
- Fraud Detection, Schadensteuerung, Assistance
- Combined Ratio: Schaden- + Kostenquote
- Großschäden vs. Kumulschäden

**7.5 Kapitalanlage (Asset Management)**
- Sicherungsvermögen, ALM, Anlageverordnung
- Anlagestruktur: Renten ~80%, Aktien, Immobilien, Alternatives
- Zinswende-Effekte

**7.6 Rückversicherung**
- Proportional (Quote, Summenexzedent) vs. nicht-proportional (XL, Stop Loss)
- Retrozession, Cat Bonds, ILS, Sidecars

**7.7 IT & Digitalisierung**
- Legacy vs. Modern, BiPRO, GDV-Datensatz
- API-Ökonomie, Cloud-Migration (DORA)

**7.8 Run-off & Bestandsübertragung**
- Viridium, Athora, Frankfurter Leben
- §13 VAG, Run-off als Geschäftsmodell

**UI-Elemente:**
- Wertschöpfungsketten-Flussdiagramm (horizontal, jeder Schritt klickbar)
- Combined-Ratio-Rechner
- IT-Systemlandkarte (interaktiv)
- Dunkelverarbeitungs-Wasserfall
- Run-off-Timeline der letzten 10 Jahre

---

### MODUL 08 — ZUKUNFTSTHEMEN

**Recherche-Tiefe: MAXIMAL. Zukunftsthemen sind der Grund, warum Versicherer Berater beauftragen.**

**8.1 KI & Automatisierung**
- KI in Underwriting, Schadenbearbeitung, Produktentwicklung
- Generative AI: Kundenservice, Dokumentation
- AI Act, Diskriminierungsverbot, Erklärbarkeit

**8.2 Embedded Insurance & Plattformökonomie**
- Point-of-Sale-Integration, White-Label, B2B2C
- API-first: Element, Neodigital

**8.3 Open Insurance / FIDA**
- FIDA-Verordnungsentwurf, Pflicht zum Datenaustausch
- Parallelen zu PSD2/Open Banking
- Auswirkungen auf Wechselbereitschaft und Maklergeschäft

**8.4 Parametrische Versicherung**
- Index-Events, Wetter-Trigger, Smart Contracts

**8.5 ESG & Nachhaltigkeit**
- SFDR (Artikel 6/8/9), EU-Taxonomie
- Nachhaltigkeitspräferenzen in Beratung (IDD-Ergänzung)
- ESG in Kapitalanlage und Underwriting

**8.6 Klimarisiken & Elementarschaden**
- Naturkatastrophen-Trends, Pflichtversicherung (Koalitionsvertrag 2025)
- Nat-Cat-Modelle, Prävention vs. Versicherung

**8.7 Demografischer Wandel**
- Auswirkungen auf LV/KV/Pflege, Rentenlücke
- Fachkräftemangel in der Branche, Gen Z als Kunden

**8.8 Konsolidierung & M&A**
- Run-off, PE-Übernahmen, größte Transaktionen
- InsurTech-Exits und -Pleiten

**8.9 Cyber & neue Risikolandschaft**
- Systemisches Cyberrisiko, Kumulproblematik
- Pandemie-Lessons, neue Kategorien (Space, AI Liability)

**UI-Elemente:**
- Trend-Radar (à la ThoughtWorks Tech Radar: Adopt/Trial/Assess/Hold)
- Impact-Assessment-Klickstrecke (Impact × Zeithorizont pro Trend)
- FIDA-Flowchart
- ESG-Kompass (interaktiv)
- Klimarisiko-Heatmap Deutschland
- M&A-Timeline

---

### MODUL 09 — VERBÄNDE UND INSTITUTIONEN

**Recherche-Tiefe: MITTEL-HOCH. Kontextwissen für Orientierung.**

**9.1 Branchenverbände**
- GDV: Rolle, Organisation, Statistik, Brancheninitiativen
- PKV-Verband, AGV, AfW, BVK, VDVM

**9.2 Aufsichtsbehörden**
- BaFin: Geschäftsbereich VA, Instrumente
- EIOPA: Standards, Peer Reviews, Stresstests (Sitz: Frankfurt)
- IAIS

**9.3 Selbstregulierung & Schlichtung**
- Versicherungsombudsmann: kostenlos, bis 100.000 € bindend
- IHK/DIHK: Vermittlererlaubnis, Sachkundeprüfung

**9.4 Aktuariat & Wissenschaft**
- DAV, DVfVW, Universitäre Forschung (Köln, München, Hannover, Leipzig)

**9.5 Ratingagenturen**
- Assekurata, Franke & Bornberg, MORGEN & MORGEN
- S&P, Moody's, Fitch, AM Best
- Unternehmens- vs. Produkt- vs. Finanzstärkerating

**9.6 Verbraucherorganisationen**
- Verbraucherzentralen, BdV, Stiftung Warentest/Finanztest

**UI-Elemente:**
- Ökosystem-Map (Netzwerkgraph mit Verbindungslinien)
- Institutionen-Kacheln (Card + Kurzprofil + Relevanz-Tag)
- "Wer macht was?"-Quiz (Szenario-basiert)
- BaFin-Dashboard (vereinfachte Aufsichtsstruktur)

---

## ZUSATZMODULE

### GLOSSAR
- Mindestens 150 Fachbegriffe mit klarer Definition
- Verknüpfung zu den Kapiteln, Suchfunktion
- Alphabetisch + thematische Cluster

### WISSENSCHECK / QUIZ
- Mindestens 10 Fragen pro Modul = 90 Fragen gesamt
- Single Choice, Multiple Choice, Zuordnung
- Erklärung bei richtiger UND falscher Antwort
- Fortschrittsanzeige, Abschluss-Assessment

---

## PHASE 2: UI-BUILD — DESIGN-SYSTEM & ARCHITEKTUR

### Farbpalette

| Rolle | Farbe | Hex |
|---|---|---|
| Primär | Fast-Schwarz | `#111827` |
| Primär 2 | Dunkelgrau | `#1F2937` |
| Primär 3 | Grau | `#374151` |
| Akzent | Blau | `#2563EB` |
| Erfolg | Grün | `#059669` |
| Warnung | Amber | `#D97706` |
| Fehler | Rot | `#DC2626` |
| Hintergrund | Weiß | `#FFFFFF` |
| Kachel-BG | Light Gray | `#F9FAFB` |
| Borders | Hellgrau | `#E5E7EB` |
| Text Secondary | Mittelgrau | `#6B7280` |

### Typografie
- Headlines: Inter/System-Font, Bold, 24-32px
- Body: Regular, 16px, Line-Height 1.6, max 70 Zeichen/Zeile
- Captions: 12-14px, `#6B7280`
- Monospace für Zahlen: JetBrains Mono / System Monospace

### Icons
- **Ausschließlich Lucide Icons** (monochrom, einfarbig, Strichstärke 2px)
- Keine bunten Icons, keine Emojis

### Komponenten-Bibliothek (15 Komponenten)

1. **KeyStatCard** — Große Kennzahl + Label + Trend-Indikator (↑/↓) + Quelle
2. **InfoKachel** — Lucide-Icon + Titel + 2-3 Zeilen Text + Hover (subtle shadow lift)
3. **AccordionBlock** — Level-2-Vertiefung, smooth open/close
4. **ChartContainer** — Wrapper mit Titel, Legende, Source-Footer
5. **ComparisonTable** — Spaltenvergleich, farbcodierte Zellen
6. **TimelineComponent** — Horizontal scrollbar, Punkte + Popup-Details
7. **QuizCard** — Frage + Optionen + Feedback-Animation
8. **GlossarPopover** — Inline-Tooltip bei Hover über Fachbegriff (gepunktet unterstrichen)
9. **ProgressBar** — Kapitelfortschritt, persistent in Sidebar
10. **BreadcrumbNav** — Modul → Unterkapitel → Abschnitt
11. **SearchOverlay** — Cmd+K / Ctrl+K Suche über alle Module
12. **DecisionTree** — Klickstrecken (Welche Versicherung brauche ich?)
13. **SankeyDiagram** — Geldfluss/Vertriebsfluss (D3-basiert)
14. **HeatmapGrid** — Matrix (Vertriebsweg × Sparte)
15. **TrendRadar** — Kreisförmige Trend-Einordnung

### Layout-Architektur

```
┌──────────────────────────────────────────────────────────────────┐
│  Versicherungs-1×1               [Suche]      [Fortschritt 34%] │
├───────────────┬──────────────────────────────────────────────────┤
│               │                                                  │
│  SIDEBAR      │  CONTENT AREA                                    │
│  (260px)      │  (max-width: 820px, centered)                    │
│               │                                                  │
│  Übersicht    │  Hero / KeyStat Section                          │
│               │  Info-Kacheln (Grid)                              │
│  01 Markt ●   │  Chart / Interaktives Element                    │
│  02 Player    │  Level 1: Grundlagentext                         │
│  03 Produkte  │  Level 2: Accordion-Vertiefung                   │
│  04 Vertrieb  │  Level 3: Experten-Deep-Dive (Link)              │
│  05 Vergüt.   │  Quiz-Section (2-3 Fragen)                       │
│  06 Regulat.  │  Kapitel-Navigation (← Vorher | Nächstes →)      │
│  07 Wertsch.  │                                                  │
│  08 Zukunft   │                                                  │
│  09 Verbände  │                                                  │
│               │                                                  │
│  ─────────    │                                                  │
│  Wissensch.   │                                                  │
│  Glossar      │                                                  │
│               │                                                  │
│  ● aktiv      │                                                  │
│  ○ offen      │                                                  │
│  ✓ fertig     │                                                  │
└───────────────┴──────────────────────────────────────────────────┘
```

Mobile: Sidebar → Hamburger-Drawer, Content volle Breite, Charts responsive.

### Übersichtsseite (Landing)

9 Module als 3×3-Kachelraster (1-spaltig auf Mobile). Jede Kachel: Modulnummer, Lucide-Icon, Titel, 1-Satz-Beschreibung, Fortschrittsbalken. Darunter: Wissenscheck + Glossar als zusätzliche Kacheln.

### Chart-Typen (Recharts oder vue-chartjs)

1. Bar Chart → Rankings, Vergleiche
2. Line Chart → Zeitreihen
3. Treemap → Marktstruktur
4. Donut/Pie → Verteilungen
5. Stacked Bar → Aufschlüsselungen
6. Radar Chart → Versicherer-/Produktvergleich
7. Sankey (D3) → Geldflüsse
8. Heatmap (Custom) → Matrix-Darstellungen

### Klickstrecken (3 Decision Trees)

1. **"Welche Versicherung brauche ich?"** — 5-7 Fragen → Produktempfehlung
2. **"GKV oder PKV?"** — Einkommen, Alter, Familie → Empfehlung + Begründung
3. **"Welcher Vertriebsweg passt?"** — Produkttyp, Zielgruppe → Kanalempfehlung

---

## QUALITÄTSANFORDERUNGEN

### Inhalt
- **Mindestens 3.000-5.000 Wörter Fließtext pro Modul** (Level 1-3)
- **Mindestens 5 konkrete Datenpunkte pro Modul** mit Quellenangabe
- **Mindestens 3 Praxisbeispiele pro Modul** aus dem realen deutschen Markt
- **Jeder Fachbegriff** im Glossar definiert UND beim ersten Auftreten als Popover verlinkt
- **Keine generischen Aussagen** — alles belegbar und spezifisch

### Technik
- Vue 3 Composition API (`<script setup>`) + TypeScript
- Responsive (Mobile-first), Lazy Loading für Charts
- LocalStorage für Fortschritts-Tracking
- Smooth Animations (CSS-only wo möglich)
- Lighthouse Score >90

### UX
- Max 70 Zeichen pro Zeile, Key Facts am Anfang jedes Abschnitts
- Level 1 reicht für Überblick, Level 2+3 für Experten
- Breadcrumb + Sidebar-Highlight + Progress = Orientierung
- Mindestens 2 interaktive Elemente pro Modul

---

## WORKFLOW

1. Projekt-Repo klonen, Codebase analysieren, Routing verstehen
2. Deep Research für ALLE 9 Module (Web-Recherche, Daten sammeln)
3. JSON-Datenstruktur erstellen und mit recherchierten Inhalten befüllen
4. Basis-Komponenten bauen (KeyStatCard, InfoKachel, ChartContainer, etc.)
5. Übersichtsseite (Kachelraster) bauen
6. Module 01-09 als vollständige Unterseiten implementieren
7. Glossar mit Suchfunktion
8. Wissenscheck / Quiz-System
9. Klickstrecken (Decision Trees)
10. Polish: Animationen, Responsive, Cross-Browser

**Nach jedem Modul committen. Aussagekräftige Commit-Messages auf Deutsch.**

---

## TECHNISCHER KONTEXT

- **Framework**: Vue 3 + TypeScript (bestehendes Projekt)
- **Styling**: Tailwind CSS
- **Charts**: Prüfe was im Projekt existiert, sonst vue-chartjs oder Recharts
- **Icons**: `lucide-vue-next` — monochrom, einfarbig
- **Router**: Vue Router (Route `/versicherungs-1x1` existiert)
- **State**: Pinia oder Composables
- **Build**: Vite
- **Hosting**: Cloudflare Pages

---

## ZUSAMMENFASSUNG

Dieses Projekt kombiniert:
- **Deep Research**: 9 Module × 10-15 Suchanfragen = 100+ Recherche-Durchgänge
- **Content Creation**: 9 × 3.000-5.000 Wörter = 27.000-45.000 Wörter Fachtext
- **Data Visualization**: 20+ interaktive Charts
- **UI Engineering**: 15 wiederverwendbare Komponenten
- **UX Design**: 3 Klickstrecken, Quiz-System, Glossar mit 150+ Begriffen

Das Ergebnis: Eine vollständige, interaktive Wissensplattform, die neue Berater innerhalb weniger Tage zu kompetenten Gesprächspartnern für Versicherungsvorstände macht.

**Nimm dir die Zeit. Qualität vor Geschwindigkeit. Jedes Modul zählt.**
