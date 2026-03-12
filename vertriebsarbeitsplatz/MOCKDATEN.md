# Mock-Daten Konzept & Rationale

## Überblick

Das Mock-Daten-System des KI-Vertriebsarbeitsplatzes erzeugt **realistische Kundendaten** für drei Vertriebsmodi:

| Modus | Institut (Default) | Zielgruppe | Showcase | Generiert | Gesamt |
|---|---|---|---|---|---|
| **Versicherung** | ERGO | Privatkunden, alle Altersgruppen | 8 (V1–V8) | 37 | 45 |
| **Banking** | Volksbank Mittelhessen | Retail-/Firmenkunden | 6 (B1–B6) | 34 | 40 |
| **Vermögensverwaltung** | HRK LUNIS | HNWI / Stiftungen | 5 (W1–W5) | 7 | 12 |

**Seed-basiert**: Alle generierten Kunden nutzen `seed = 42` mit Modus-Offset, sodass die Daten bei jedem App-Start identisch sind (Reproduzierbarkeit für Demos).

---

## Architektur

```
data/
├── generator/
│   ├── index.js              # Haupt-Orchestrierung (generateAllKunden)
│   ├── personGenerator.js    # Demografische Erzeugung
│   ├── produktKatalog.js     # Produktdefinitionen (Versicherung/Banking/VV)
│   ├── produktZuordnung.js   # Produktzuordnung (eigen + fremd)
│   ├── potenzialEngine.js    # Regelbasierte Vertriebsimpulse
│   ├── scoresKomm.js         # NPS, Risiko, Kommunikationshistorie
│   └── utils.js              # Seeded Random, Hilfsfunktionen
├── versicherung-v1-v4.js     # Showcase-Personas Versicherung (Teil 1)
├── versicherung-v5-v8.js     # Showcase-Personas Versicherung (Teil 2)
├── banking.js                # Showcase-Personas Banking
├── vv.js                     # Showcase-Personas Vermögensverwaltung
├── modeConfig.js             # Modus-Konfiguration (Farben, Tabs, KPIs)
└── index.js                  # Statische KPIs, Vergütungsdaten, Exports
```

### Generierungs-Pipeline

Jeder Kunde durchläuft diese Schritte:

1. **Person generieren** – Name, Alter, Beruf, Einkommen, Familie, Wohnsituation
2. **Eigene Produkte** – Verträge beim Institut (nach Relevanz + Zufall)
3. **Fremdprodukte** – Verträge bei Wettbewerbern (PSD2/FIDA-Daten)
4. **Validierung** – Plausibilitätschecks (z.B. Volumen ≤ 40% Gesamtvermögen bei VV)
5. **Transaktionen** – Kontoumsätze aus Gehalt, Miete, Versicherungen etc.
6. **NPS berechnen** – Basierend auf Produktanzahl + Zufallsvariation
7. **Potenziale ableiten** – Regelbasiert aus Bestand + Fremd + Lebenssituation
8. **Scores berechnen** – Risiko, Potenzial, Abwanderungsrisiko
9. **Absicherung** – Welche Produkttypen vorhanden/fehlend
10. **Kommunikation** – Historische Kontakte (Termine, E-Mails, Chatbot)

---

## Personas – Showcase-Kunden

### Versicherung (V1–V8)

| ID | Name | Alter | Beruf | Netto/mtl. | Lebenssituation | Schwerpunkt |
|---|---|---|---|---|---|---|
| V1 | Peter Schmidt | 42 | IT-Projektleiter (Dt. Telekom) | 4.200€ | Verheiratet, 2 Kinder, Eigentum, Hund | Vollkunde mit allen Sparten, Baufi-Potenzial bei Fremdbank |
| V2 | Amira König | 28 | Designerin (Publicis Sapient) | 2.800€ | Ledig, Miete, Katze | Jung, wenig Verträge, hohe Cross-Sell-Potenziale |
| V3 | Thomas Weber | 55 | Handwerksmeister Sanitär (selbst.) | 4.800€ | Verheiratet, 2 erwachsene Kinder, Eigentum | Selbständiger, Gewerbeversicherung, Pre-Retirement |
| V4 | Anna Hoffmann | 35 | Ärztin Allgemeinmedizin (Uniklinik) | 5.500€ | Verheiratet, 1 Kind, Eigentum | Hohe Einkommen, PKV-Potenzial, BU-Spezial Arzt |
| V5 | Klaus Meier | 48 | Beamter A14 (Bezirksregierung) | 4.600€ | Verheiratet, 3 Kinder, Eigentum, Hund | Beamter mit PKV, stabile Einkommenslage |
| V6 | Lisa Bauer | 31 | Marketing-Managerin (SAP) | 2.800€ | Ledig, Miete | Aufbauphase, viel Digital-Affinität |
| V7 | Michael Braun | 62 | Lehrer Gymnasium | 3.200€ | Verheiratet, erwachsene Kinder | Pre-Retirement, LV-Ablauf, Bestandsoptimierung |
| V8 | Sandra Yilmaz | 38 | Pharma-Referentin (Boehringer) | 5.200€ | Verheiratet, 2 Kinder | Hohes Einkommen, Cross-Selling-Chancen |

**Rationale**: Die 8 Versicherungs-Personas decken bewusst das gesamte Spektrum ab:
- **Altersgruppen**: Jung (28) bis Pre-Retirement (62)
- **Berufsgruppen**: Angestellt, selbständig, beamtet, Arzt
- **Familienstände**: Ledig, verheiratet, mit/ohne Kinder
- **Einkommensspannen**: 2.800€ bis 5.500€ netto
- **Wohnsituationen**: Miete und Eigentum

### Banking (B1–B6)

| ID | Name | Alter | Beruf | Netto/mtl. | Schwerpunkt |
|---|---|---|---|---|---|
| B1 | Klaus Fischer | 45 | Vertriebsleiter (Continental) | 4.500€ | Baufi mit kritischer Zinsbindung 04/2026, Forward-Darlehen dringend |
| B2 | Sandra Müller | 33 | Café-Inhaberin (verbeamtet) | 3.200€ | Gewerbekunden-Potenzial, Partner bei Fremdbank |
| B3 | Peter Hoffmann | 58 | GmbH-Geschäftsführer | 8.500€ | Firmenkunde, hohe Volumina, Nachfolgeplanung |
| B4 | Markus Wagner | 29 | Junior Controller (VB Mittelhessen) | 2.600€ | Interner Mitarbeiter, Aufbauphase, ETF-Affinität |
| B5 | Andrea Lang | 41 | Inhaberin 3 Cafés (18 MA) | 5.500€ | Gewerbekunden, Fördermittel, Wachstumsfinanzierung |
| B6 | Stefan Braun | 36 | IT-Freelancer | 6.800€ | Selbständig, schwankende Einkommen, Fremdbank-Depot |

**Rationale**: Typischer Volksbank-Kundenstamm:
- **B1**: Dringender Handlungsbedarf (Zinsbindungsende) – zeigt kritische Vertriebsimpulse
- **B2/B5**: Gewerbetreibende – Verbund-Potenzial (R+V, Schwäbisch Hall)
- **B3**: Premium-Segment – Nachfolge + Vermögens-Management
- **B4**: Interner MA – Know-Your-Employee, zeigt Grundausstattung
- **B6**: Digital-Native Freelancer – Neobank-Abwanderungsrisiko

### Vermögensverwaltung (W1–W5)

| ID | Name | Alter | Beruf | Netto/mtl. | AuM-Segment |
|---|---|---|---|---|---|
| W1 | Dr. Heinrich von Trott | 62 | Unternehmer Maschinenbau (3. Gen.) | 25.000€ | FairValue (>5M) |
| W2 | Familie Lindenberg | 51 | SaaS-Exit 2024 (8M netto) | 15.000€ | FairValue |
| W3 | Stiftung Weber | — | Bildungsstiftung (seit 2008) | 0€ | Stiftungs-Spezialmandat |
| W4 | Prof. Dr. Hartmann | 56 | Chefarzt Kardiologie + Privatpraxis | 18.000€ | FairValue |
| W5 | Tim Keller | 29 | Tech-Gründer (Seed-Exit 500k) | 4.500€ | SmartValue (<5M) |

**Rationale**: HNWI-Segmentierung:
- **W1**: Multi-Generationen-Unternehmer – Nachfolgeplanung, Stiftungsgründung
- **W2**: Liquidity-Event – Post-Exit-Anlage, komplexe Steuerplanung
- **W3**: Institutioneller Mandant – zeigt Stiftungsfähigkeit des Systems
- **W4**: Freiberufler-Premium – Hohe laufende Einkommen + Altersvorsorge
- **W5**: NextGen – Junger Tech-Gründer, Einstieg in Vermögensverwaltung

---

## Generierte Kunden – Logik & Rationale

### Demografische Verteilung

Die Altersverteilung folgt einer gewichteten Verteilung, die einen typischen Bestand abbildet:

| Altersgruppe | Spanne | Gewichtung | Rationale |
|---|---|---|---|
| Jung | 22–29 | 15% | Berufseinsteiger, wenig Verträge |
| Aufbau | 30–39 | 25% | Familiengründung, starkes Cross-Selling |
| Mitte | 40–49 | 25% | Konsolidierung, höchstes Potenzial |
| Pre-Retirement | 50–59 | 20% | Optimierung, Altersvorsorge |
| Senior | 60–70 | 15% | Ruhestand, Bestandspflege |

### Berufe & Einkommensspannen

**28 Berufe** sind definiert mit:
- **Bruttoeinkommen-Range** (z.B. IT-Projektleiter: 65.000–90.000€)
- **Beschäftigungssegment**: angestellt, beamtet, selbständig, Rente
- **BU-Risikoklasse**: büro, handwerk, körperlich, arzt, keine

Netto-Berechnung mit realistischen Steuer-/Abgabensätzen:

| Brutto | Netto-Quote | Typisches Netto/mtl. |
|---|---|---|
| ≤ 30.000€ | 72% | ~1.800€ |
| 30.001–60.000€ | 65% | ~2.700€ |
| 60.001–100.000€ | 58% | ~3.900€ |
| > 100.000€ | 54% | ~4.500+ |

**VV-Modus** nutzt eigene Berufe mit höheren Einkommensspannen:
- Unternehmer: 200k–800k
- Chefärzte: 250k–500k
- Anwälte (Partner): 200k–800k
- Privatiers/Erben: Vermögenseinkommen

### Familiensituation

Familienstand ist altersabhängig gewichtet:

| Alter | Ledig | Verheiratet | Geschieden | Verwitwet |
|---|---|---|---|---|
| <28 | 70% | 25% | 5% | — |
| 28–44 | 20% | 65% | 15% | — |
| 45–59 | 10% | 60% | 30% | — |
| 60+ | 5% | 60% | 25% | 10% |

Kinderanzahl ebenfalls altersabhängig (0–4 Kinder, gewichtet).

### Wohnsituation

| Alter | Miete | Eigentum |
|---|---|---|
| <30 | 90% | 10% |
| 30–44 | 50% | 50% |
| 45+ | 30% | 70% |

**Wohnfläche**: Miete 45–110 qm, Eigentum 100–180 qm.

---

## Produktzuordnung

### Versicherungsprodukte (22 Produkte)

Jedes Produkt hat eine **Relevanzfunktion**, die bestimmt, ob es für einen Kunden infrage kommt:

| Sparte | Produkt | Prämie/J. | Relevanz |
|---|---|---|---|
| Leben | Berufsunfähigkeit | 600–3.600€ | Alter <60, BU-Risiko ≠ keine |
| Leben | Risikoleben | 180–960€ | Kinder oder Eigentum |
| Leben | Fondsgebundene Rente | 1.200–7.200€ | 25–55 Jahre |
| Leben | Rürup-Rente | 1.200–7.200€ | Selbständige |
| Leben | Riester-Rente | 600–2.100€ | Angestellt + Kinder |
| Kranken | PKV | 3.600–9.600€ | Brutto >69.300€ / Selbständig / Beamtet |
| Kranken | Zahnzusatz | 120–480€ | Alter >25 |
| Kranken | Pflegezusatz | 240–1.440€ | Alter >40 |
| Schaden | Haftpflicht (Pflicht) | 50–120€ | Alle |
| Schaden | Hausrat | 80–350€ | Alle |
| Schaden | Wohngebäude | 250–800€ | Eigentümer |
| Schaden | Rechtsschutz | 150–450€ | Alter >25 |
| KFZ | Kfz-Versicherung | 300–1.200€ | Alter ≥18 |
| Gewerbe | Gewerbe-Haftpflicht | 300–1.200€ | Selbständige |
| Gewerbe | Cyber-Versicherung | 200–800€ | Selbständige |

**Vertragsdichte** (gewichtet): 1–7 Verträge pro Kunde, Schwerpunkt bei 3–4.

### Banking-Produkte (18 Produkte)

| Kategorie | Produkt | Werte-Range | Besonderheit |
|---|---|---|---|
| Konto | VR-Girokonto | — | Jeder Kunde (Pflicht) |
| Konto | VR-Kreditkarte | — | — |
| Sparen | VR-Sparkonto | 2k–80k Saldo | — |
| Sparen | VR-Tagesgeld | 5k–100k Saldo | — |
| Sparen | VR-Festgeld | 10k–200k Saldo | — |
| Anlage | VR-MeinDepot | 5k–200k Saldo | — |
| Anlage | Union Investment Sparplan | 50–1.500€/mtl. | — |
| **Kredit** | **VR-Baufinanzierung** | **100k–500k Vol.** | **Annuität = 4–7% des Volumens/J.** |
| **Kredit** | **VR-Ratenkredit** | **5k–50k Vol.** | **Annuität = 4–7% des Volumens/J.** |
| Sparen | Schwäbisch Hall Bauspar | 5k–50k Saldo | Verbundpartner |
| Beratung | VR-FinanzPlan | — | — |
| Verbund | R+V Kfz/BU/RLV/Haftpflicht/Hausrat/WG/Pflege | Prämie lt. Versicherung | R+V als Verbundpartner |

**Wichtig bei Kreditprodukten**: Die `praemie` enthält die **jährliche Annuität** (Zins + Tilgung, ca. 4–7% des Darlehensvolumens), nicht das Kreditvolumen selbst. Das Darlehensvolumen wird separat im `volumen`-Feld gespeichert.

Beispiel Baufinanzierung 250.000€:
- `volumen`: 250.000€ (Darlehenssumme)
- `praemie`: ~12.500€/J. (Annuität bei ca. 5%)

### VV-Produkte (6 Produkte)

| Segment | Produkt | AuM-Range | Fee |
|---|---|---|---|
| SmartValue | SmartValue Mandat | 250k–3M | 0,6–0,8% p.a. |
| FairValue | FairValue Individual | 3M–30M | 0,7–1,0% p.a. |
| Stiftung | Stiftungs-Spezialmandat | 2M–20M | 0,5–0,7% p.a. |
| — | Private Equity Beteiligung | 100k–2M | — |
| — | Offener Immobilienfonds | 50k–500k | — |
| — | Infrastruktur-Fonds | 200k–1M | — |

---

## Fremdprodukte (Open Finance / PSD2 / FIDA)

Fremdprodukte simulieren Daten, die über **PSD2-Kontoinformationen** oder zukünftig **FIDA** (Financial Data Access) von Wettbewerbern erkennbar wären.

### Versicherungsmodus – Fremdprodukte

| Typ | Quelle | Institute |
|---|---|---|
| Girokonto | PSD2 | N26, DKB, ING, Sparkasse, Volksbank |
| ETF-Depot | PSD2/FIDA | Trade Republic, Scalable Capital, comdirect, ING |
| Tagesgeld | PSD2 | ING, DKB, Commerzbank |
| Baufinanzierung | FIDA | Sparkasse, ING, Commerzbank, Deutsche Bank |
| Fremd-Versicherungen | FIDA | Allianz, AXA, HDI, HUK, Zurich, Generali ... |

**Consent-Modell**: Jedes Fremdprodukt hat ein `consent`-Flag (30–60% Zustimmungsrate), das simuliert, ob der Kunde der Datenfreigabe zugestimmt hat.

### Banking-Modus – Fremdprodukte

| Typ | Institute |
|---|---|
| Fremd-Depot | Trade Republic, Scalable Capital, comdirect, ING |
| Fremd-Tagesgeld | ING, DKB, Commerzbank, Deutsche Bank, N26 |
| Fremd-Versicherungen (nicht R+V) | HUK, Allianz, AXA, HDI, Alte Leipziger, CosmosDirekt |

### VV-Modus – Fremdprodukte

| Typ | Institute |
|---|---|
| Depot bei Fremdbank | UBS, Deutsche Bank WM, Berenberg, Bethmann, Julius Bär |
| Cash bei Geschäftsbank | Deutsche Bank, Commerzbank, UniCredit |
| Immobilien | — (erkannt aus Versicherungsdaten) |
| Unternehmensbeteiligung | — (bei Unternehmern) |
| LV-Ablauf | Alte Leipziger, Allianz, Zurich, Generali |

---

## Potenzial-Engine

Die Potenzial-Engine evaluiert **regelbasiert** Vertriebsimpulse aus dem Gesamtbild des Kunden. Potenziale entstehen aus der Kombination von:

1. **Bestandsanalyse** – Welche Produkte fehlen? (Whitespots)
2. **Fremdprodukt-Analyse** – Was hat der Kunde woanders? (Rückgewinnungspotenziale)
3. **Lebensereignisse** – Alter, Familienstand, Berufswechsel
4. **Transaktionsanalyse** – Erkannte Muster in Kontoumsätzen

### Prioritäten

| Priorität | Bedeutung | Beispiel |
|---|---|---|
| Kritisch | Sofortiger Handlungsbedarf | Zinsbindungsende in <6 Monaten |
| Hoch | Wichtiges Vertriebspotenzial | BU fehlt bei körperlichem Beruf |
| Mittel | Sinnvolle Ergänzung | Cross-Selling Zahnzusatz |
| Niedrig | Nice-to-have | Tierhalterhaftpflicht |

### Beispiele für Regeln (Versicherung)

| Regel | Bedingung | Produkt-Empfehlung |
|---|---|---|
| BU fehlt | Kein BU-Vertrag, Alter <60 | ERGO BU Comfort |
| Haftpflicht fehlt | Keine Haftpflicht | ERGO Haftpflicht |
| KFZ bei Fremdversicherer | KFZ bei HUK/Allianz etc. | ERGO Kfz |
| Depot ohne RLV | Depot erkannt, kein RLV | ERGO Risikoleben |
| Baufi-Absicherung | Baufi erkannt, kein WG/Elementar | ERGO Wohngebäude |

### Beispiele für Regeln (Banking)

| Regel | Bedingung | Produkt-Empfehlung |
|---|---|---|
| Anschlussfinanzierung | Zinsbindung endet bald | VR-Baufinanzierung Forward |
| Depot bei Fremdbank | Trade Republic etc. erkannt | Union Investment Sparplan |
| Tagesgeld-Abfluss | Hoher Tagesgeld-Saldo extern | VR-Tagesgeld |
| R+V Cross-Selling | Fremdversicherung erkannt | R+V Verbundprodukt |
| Baufinanzierung vorbereiten | Lebensereignis "Hausbau" | VR-Baufinanzierung |

---

## Scores & Bewertungen

### NPS (Net Promoter Score, 1–10)

Basiert auf Produktanzahl:
- ≥5 Verträge: Basis 8
- ≥3 Verträge: Basis 7
- ≥2 Verträge: Basis 6
- <2 Verträge: Basis 5
- Zufallsvariation: ±2

### Risikoscore (0–100, niedrig = gut)

Zwei Komponenten:
- **Verschuldung**: Baufinanzierung vorhanden → 30–60, sonst 10–30
- **Einkommensstabilität**: Beamtet → 5, Selbständig → 25–50, Angestellt → 10–30
- Risikoscore = Durchschnitt beider Werte

### Potenzial-Score (1.0–5.0)

Berechnet aus:
- Anzahl identifizierter Potenziale × 0,5
- Gesamtes Potenzialvolumen / 5.000

### Abwanderungsrisiko

| NPS | Risiko |
|---|---|
| ≤5 | Hoch |
| 6–7 | Mittel |
| ≥8 | Niedrig |

---

## KFZ-Modelle nach Vermögensklasse

Die KFZ-Versicherung enthält realistische Fahrzeugmodelle, gestaffelt nach Einkommen:

| Segment | Einkommensschwelle | Beispiele |
|---|---|---|
| Retail | Standard | VW Golf, Opel Corsa, Toyota Corolla |
| Gehoben | >60k Brutto | BMW 3er, Audi A3, Mercedes A-Klasse |
| Premium | >100k Brutto | BMW 5er, Mercedes E-Klasse, Tesla Model S |
| Luxus | >5M Vermögen | Porsche 911, Mercedes S-Klasse, Bentley |

---

## Haustiere (aus Kontoumsätzen)

~20–45% der Kunden haben ein erkanntes Haustier (basierend auf Fressnapf/Tierarzt-Umsätzen):

| Art | Gewichtung | Erkennungsmethode |
|---|---|---|
| Hund | 45% | Fressnapf, Tierarzt, Hundeschule |
| Katze | 40% | Fressnapf, Zooplus, Tierklinik |
| Hamster | 5% | Fressnapf |
| Kaninchen | 5% | Fressnapf |
| Fische | 3% | Zoo & Co |
| Vogel | 2% | Fressnapf |

**Vertriebsrelevanz**: Hundehalter → Tierhalterhaftpflicht-Potenzial.

---

## Modus-Konfiguration

### Institutsfarben

| Modus | Primary | Gradient |
|---|---|---|
| Versicherung (ERGO) | `#86181d` | Dunkelrot → Rot |
| Banking (VB Mittelhessen) | `#004d26` | Dunkelgrün → Grün |
| Vermögensverwaltung (HRK LUNIS) | `#1a2744` | Dunkelblau → Marine |

### Institutsvarianten (White-Label)

Das System unterstützt **White-Labeling** – ein Klick wechselt das dargestellte Institut:

**Versicherung**: ERGO, Allianz, AXA, Generali, Zurich
**Banking**: Volksbank Mittelhessen, Sparkasse, DKB, Commerzbank
**VV**: HRK LUNIS, Berenberg, Deutsche Bank WM, UBS

---

## Designentscheidungen & Rationale

### Warum Showcase + Generator?

- **Showcase-Kunden** (V1–V8, B1–B6, W1–W5) sind handgefertigt mit detaillierten Potenzial-Herleitungen, Vergleichstabellen und realistischen Fremdprodukten. Sie dienen als **Demo-Goldstandard** für Kundengespräche und Präsentationen.
- **Generierte Kunden** füllen den Bestand auf realistische Größen auf und demonstrieren die **Skalierbarkeit** des Systems. Sie nutzen die gleiche Potenzial-Engine wie Showcase-Kunden.

### Warum Seeded Random?

Demo-Stabilität: Bei jeder Vorführung sieht der Zuschauer die gleichen Kunden mit den gleichen Werten. Kein "das war vorhin noch anders" in Demos.

### Warum Fremdprodukte?

Open Finance (PSD2/FIDA) ist der **Kern-Differenziator** des Systems. Die Fremdprodukte zeigen:
1. Welche Produkte der Kunde **woanders** hat (Rückgewinnungspotenzial)
2. Welche Daten mit **Consent** geteilt wurden
3. Wie daraus automatisch **Vertriebsimpulse** abgeleitet werden

### Warum regelbasierte Potenziale?

Die Potenzial-Engine bildet die **Logik eines erfahrenen Beraters** ab:
- "Kunde hat Baufi aber kein Wohngebäude → Potenzial"
- "Zinsbindung läuft aus → kritischer Impuls"
- "Depot bei Fremdbank → Rückgewinnung"

Diese Regeln sind **transparent und erklärbar** (Herleitung mit Datenquellen), was für regulierte Finanzberatung essentiell ist.

### Realismus der Werte

Alle Werte orientieren sich an **deutschen Marktrealitäten 2025/2026**:
- Bruttoeinkommen: Destatis-orientierte Spannen
- Versicherungsprämien: Marktübliche Ranges
- Baufinanzierung: 2–4% Zins + 2–3% Tilgung = 4–7% Annuität
- PKV-Grenze: 69.300€ (JAEG 2025)
- Kindergeld: 250€/Kind
- Steuersätze: Vereinfachte Progressive
