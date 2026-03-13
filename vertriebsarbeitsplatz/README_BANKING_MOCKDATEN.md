# Banking-Mockdaten: Generierung & Datenmodell

## Uebersicht

Der Banking-Modus (V02 Vertriebsarbeitsplatz) simuliert eine **Volksbank Mittelhessen eG** mit 40 Kunden:
- **6 Showcase-Personas** (B1-B6): Handgefertigte Kunden mit detaillierten Produkten, Potenzialen und Herleitungen
- **34 generierte Kunden**: Algorithmisch erzeugt ueber die Generator-Pipeline mit Seeded PRNG (Seed 42)

Alle Daten sind **deterministisch** -- bei jedem App-Start identische Werte fuer Demo-Stabilitaet.

---

## Architektur & Datenpipeline

```
data/
├── generator/
│   ├── index.js              # Orchestrierung: generateAllKunden('banking', 34, seed)
│   ├── personGenerator.js    # Demografische Erzeugung (Name, Alter, Beruf, Einkommen)
│   ├── produktKatalog.js     # 15 Banking-Produkte + Fremdprodukt-Profile
│   ├── produktZuordnung.js   # Eigene + Fremd-Produkte zuweisen
│   ├── potenzialEngine.js    # 10 Banking-Potenzialregeln
│   ├── scoresKomm.js         # NPS, Risiko, Potenzial-Scores, Kommunikation
│   └── utils.js              # Mulberry32 PRNG, random(), shuffle(), pick()
├── banking.js                # 6 Showcase-Personas (B1-B6)
├── modeConfig.js             # Banking-Modus Konfiguration (Farben, Tabs, KPIs)
└── index.js                  # Statische KPIs, Verguetung, Stammdaten, Termine
```

### Pipeline pro generiertem Kunden

```
1. personGenerator     → Name, Alter, Beruf, Einkommen, Familie, Wohnsituation
2. produktZuordnung    → Eigene Bankprodukte (VR-Girokonto, Depot, Baufi, ...)
3. produktZuordnung    → Fremdprodukte (Trade Republic, ING, HUK, ...)
4. Plausibilitaet      → Validierung (z.B. Annuitaet realistisch?)
5. Transaktionen       → Kontoumsaetze (Gehalt, Miete, Versicherungen)
6. scoresKomm (NPS)    → Net Promoter Score basierend auf Produktanzahl
7. potenzialEngine     → Regelbasierte Vertriebsimpulse (10 Regeln)
8. scoresKomm (Scores) → Risiko, Potenzial, Abwanderungsrisiko
9. Absicherung         → Produkttyp-Abdeckung (fehlend/vorhanden)
10. Kommunikation      → Historische Kontakte (Termine, Mails, Chatbot)
```

### Seeded PRNG

Mulberry32-Algorithmus mit deterministischem Seed:

```javascript
// Seed-Berechnung pro Kunde:
seed = 42 + modeOffset + kundenIndex
// modeOffset: versicherung=0, banking=1000, vv=2000

// Garantiert: Gleicher Seed → gleiche Daten bei jedem App-Start
```

---

## Showcase-Personas (B1-B6)

| ID | Name | Alter | Beruf | Netto/mtl. | Schwerpunkt |
|---|---|---|---|---|---|
| B1 | Klaus Fischer | 45 | Vertriebsleiter (Continental) | 4.500 EUR | Baufi Zinsbindung endet 04/2026 → Forward-Darlehen kritisch |
| B2 | Sandra Mueller | 33 | Cafe-Inhaberin (verbeamtet) | 3.200 EUR | Gewerbe-Potenzial, Partner bei Fremdbank |
| B3 | Peter Hoffmann | 58 | GmbH-Geschaeftsfuehrer | 8.500 EUR | Firmenkunde, hohe Volumina, Nachfolgeplanung |
| B4 | Markus Wagner | 29 | Junior Controller (VB Mittelhessen) | 2.600 EUR | Interner MA, Aufbauphase, ETF-Affinitaet |
| B5 | Andrea Lang | 41 | Inhaberin 3 Cafes (18 MA) | 5.500 EUR | Gewerbe, Foerdermittel, Wachstumsfinanzierung |
| B6 | Stefan Braun | 36 | IT-Freelancer | 6.800 EUR | Selbstaendig, schwankendes Einkommen, Fremdbank-Depot |

### Design-Rationale der Personas

- **B1**: Dringender Handlungsbedarf (Zinsbindungsende) → zeigt kritische Vertriebsimpulse
- **B2/B5**: Gewerbetreibende → Verbund-Potenzial (R+V, Schwaebisch Hall)
- **B3**: Premium-Segment → Nachfolge + Vermoegens-Management
- **B4**: Interner MA → Know-Your-Employee, zeigt Grundausstattung
- **B6**: Digital-Native Freelancer → Neobank-Abwanderungsrisiko

---

## Stammdaten (Berater-Profil)

Die Stammdaten beschreiben die **Beraterin** (nicht den Kunden). Statisch in `index.js`:

### Basis
| Feld | Wert |
|---|---|
| Name | Maria Musterfrau |
| Titel | Beraterin |
| ID | VB-40210 |
| Institut | Volksbank Mittelhessen eG |
| Beratungscenter | BC Giessen-Sued |
| Telefon | +49 641 7006-240 |
| E-Mail | maria.musterfrau@vb-mittelhessen.de |

### Organisation
| Feld | Wert |
|---|---|
| Hierarchie | RD Mittelhessen → VD Giessen → BC Giessen-Sued |
| Vorgesetzter | Markus Schneider (Filialleiter) |
| Plattform | agree21, OKP, BankingWorkspace |
| KI-Tools | genoGPT, Truuco, Wissensmanagement-Bot |
| Digitale Kanaele | VR Banking App, Wero, VideoBeratung |

### Qualifikationen
| Feld | Wert |
|---|---|
| IHK-Registrierung | D-F-156-PQ89-12 |
| Zulassungen | WpHG §34d, KWG §25a, Immobiliar §34i |
| Weiterbildung | 42/40 Std. (105%) |
| WpHG-Status | Konform |
| MiFID II | Zertifiziert |

### Vertragsverhaeltnis
| Feld | Wert |
|---|---|
| Beschaeftigt seit | 01.04.2012 |
| Verguetungsmodell | Festgehalt + Leistungszulage |
| Zielvereinbarung | 300.000 EUR Ertrag (83% erreicht) |
| Segment-Betreuung | Retail + Premium |

---

## Verguetungsdaten & Provisionsmodell

### Ertrags-KPIs (Banking-Berater)

| KPI | Wert | Trend |
|---|---|---|
| **Deckungsbeitrag YTD** | 248.500 EUR | +8,2% |
| **Zinsertrag** | 95.000 EUR | +5,4% |
| **Provision WP (Union Inv.)** | 68.000 EUR | +12,0% |
| **Provision Verbund (R+V)** | 42.000 EUR | +6,8% |

### Spartenverteilung Ertraege

| Sparte | Ertrag | Anteil |
|---|---|---|
| Zinsmarge (Bank) | 95.000 EUR | 38,2% |
| WP-Provision (Union Inv.) | 68.000 EUR | 27,4% |
| Verbund-Provision (R+V) | 42.000 EUR | 16,9% |
| Zahlungsverkehr (Wero) | 28.000 EUR | 11,3% |
| Bausparen (Schw. Hall) | 15.500 EUR | 6,2% |

### Monatliche Ertraege (Verlauf)

| Monat | Ertrag |
|---|---|
| Jan | 18.200 EUR |
| Feb | 21.400 EUR |
| Maer | 19.800 EUR |
| Apr | 22.600 EUR |
| Mai | 24.100 EUR |
| Jun | 20.500 EUR |
| Jul | 23.800 EUR |
| Aug | 25.200 EUR |
| Sep | 21.900 EUR |
| Okt | 26.400 EUR |
| Nov | 24.800 EUR |

---

## Provisionshoehe & Provisionsmodell

### Abschlussprovisionen (Verbund)

Der Berater erhaelt **keine direkte Provision auf Bankprodukte** (Kredit, Konto), nur auf Verbund-Produkte:

| Produkt | Verbundpartner | Provisionsmodell | Beispiel |
|---|---|---|---|
| **Wertpapier-Sparplan** | Union Investment | **1,5% Ausgabeaufschlag** | 10.000 EUR Anlage → 150 EUR Provision |
| **Versicherung** | R+V | **8x Monatsbeitrag** | 50 EUR/mtl. BU → 400 EUR Provision |
| **Bausparvertrag** | Schwaebisch Hall | **1% der Bausparsumme** | 50.000 EUR BSS → 500 EUR Provision |
| **Kredit / Baufinanzierung** | VB Mittelhessen (Bank) | **Kein Berater-Anteil** | Ertrag bleibt bei der Bank |

### Bestandsverguetung

| Typ | Modell |
|---|---|
| Grundverguetung | Festgehalt (TVoeD/Haustarif) |
| Verbund-Provision | WP, R+V, Schw. Hall (laufend) |
| Kredit/Konto | Nur Bankertrag, kein Berateranteil |
| Zinsmarge | Kein Anteil fuer Berater |

### Bonusmodell

| Kriterium | Bonus |
|---|---|
| Ziel 100% (300k EUR Ertrag) | Leistungszulage |
| Ziel 120% (360k EUR Ertrag) | Praemie + Sonderzahlung |
| NPS >= 8,0 | +5% Bonus |
| Weiterbildung 100% | +2% Bonus |

### Wichtig: Unterschied Bank- vs. Versicherungs-Provision

Im Banking-Modus wird **zwischen Bankertrag und Berater-Provision unterschieden**:
- **Zinsmarge** (95k EUR): Geht an die Bank, nicht an den Berater
- **WP-Provision** (68k EUR): Geht an den Berater (Union Investment Abschluss + Bestand)
- **Verbund-Provision** (42k EUR): Geht an den Berater (R+V Versicherungen)
- **Zahlungsverkehr** (28k EUR): Bankertrag, kein Berateranteil
- **Bausparen** (15,5k EUR): Geht an den Berater (Schw. Hall)

---

## Banking-Produkte (Eigene)

### 15 Bankprodukte im Katalog

| Kategorie | Produkt | Werte-Range | Besonderheit |
|---|---|---|---|
| **Konto** | VR-Girokonto | -- | Pflichtprodukt (jeder Kunde) |
| **Konto** | VR-Kreditkarte | -- | -- |
| **Sparen** | VR-Sparkonto | 2k-80k Saldo | -- |
| **Sparen** | VR-Tagesgeld | 5k-100k Saldo | -- |
| **Sparen** | VR-Festgeld | 10k-200k Saldo | -- |
| **Anlage** | VR-MeinDepot | 5k-200k Saldo | -- |
| **Anlage** | Union Investment Sparplan | 50-1.500 EUR/mtl. | Provision: 1,5% AA |
| **Kredit** | VR-Baufinanzierung | 100k-500k Vol. | Annuitaet = 4-7% p.a. |
| **Kredit** | VR-Ratenkredit | 5k-50k Vol. | Annuitaet = 4-7% p.a. |
| **Sparen** | Schwaebisch Hall Bauspar | 5k-50k BSS | Provision: 1% BSS |
| **Beratung** | VR-FinanzPlan | -- | Ganzheitliches Beratungskonzept |
| **Verbund** | R+V Kfz | Praemie lt. Vers. | Verbundpartner |
| **Verbund** | R+V BU | Praemie lt. Vers. | Provision: 8x Monatsbeitrag |
| **Verbund** | R+V RLV/Haftpflicht/Hausrat/WG/Pflege | je nach Produkt | Verbundpartner |

### Kreditprodukte: Annuitaet vs. Volumen

Bei Kreditprodukten wird die `praemie` als **jaehrliche Annuitaet** gespeichert (nicht das Kreditvolumen):

```
Beispiel Baufinanzierung 250.000 EUR:
  volumen:  250.000 EUR  (Darlehenssumme)
  praemie:  ~12.500 EUR  (Annuitaet bei ca. 5%)

Annuitaet = Zins (~2-4%) + Tilgung (~2-3%) = 4-7% p.a. des Volumens
```

Dies stellt sicher, dass in Bestands-Uebersichten die jaehrliche Belastung und nicht das Gesamtvolumen angezeigt wird.

---

## Fremdprodukte (Open Finance / PSD2 / FIDA)

Simulieren Daten, die ueber **PSD2-Kontoinformationen** oder zukuenftig **FIDA** erkennbar waeren:

| Typ | Institute | Volumen-Range |
|---|---|---|
| Fremd-Depot | Trade Republic, Scalable Capital, comdirect, ING | 10k-200k |
| Fremd-Tagesgeld | ING, DKB, Commerzbank, Deutsche Bank, N26 | 10k-100k |
| Fremd-Kfz | HUK, Allianz, AXA, HDI | 400-1.200 EUR/J. |
| Fremd-BU | Alte Leipziger, HDI, Allianz, CosmosDirekt | 800-3.600 EUR/J. |
| Fremd-Haftpflicht | HUK, Allianz, AXA, Generali | 45-120 EUR/J. |
| Fremd-Baufinanzierung | Sparkasse, ING, Commerzbank, Deutsche Bank | 100k-500k |

Jedes Fremdprodukt hat ein `consent`-Flag (30-60% Zustimmungsrate), das simuliert, ob der Kunde der Datenfreigabe zugestimmt hat.

---

## Vertriebspotenziale (Banking-Regeln)

Die Potenzial-Engine evaluiert **10 Banking-spezifische Regeln**. Jede Regel prueft Bedingungen und erzeugt einen Vertriebsimpuls mit Herleitung und ggf. Vergleichstabelle.

### Regel-Uebersicht

| # | Regel-ID | Titel | Prioritaet | Bedingung | Produkt-Empfehlung |
|---|---|---|---|---|---|
| 1 | `rv_bu_fehlt` | R+V Berufsunfaehigkeit | Hoch | Keine BU erkennbar, Alter < 55 | R+V BU |
| 2 | `rv_kfz_statt_fremd` | R+V Kfz statt Fremd | Mittel | Kfz bei Fremdversicherer erkannt | R+V Kfz-Versicherung |
| 3 | `depot_umschichtung` | Union Inv. statt Fremd-Depot | Hoch | Depot >10k bei Fremdbank (z.B. Trade Republic) | Union Investment UniGlobal Vorsorge |
| 4 | `tagesgeld_konsolidierung` | Tagesgeld-Konsolidierung | Mittel | Tagesgeld >10k bei Fremdbank | VR-Tagesgeld / VR-FinanzPlan |
| 5 | `bauspar_eigentum` | Schw. Hall Bauspar | Mittel | Mieter, unter 40, kein Bauspar | Schwaebisch Hall Fuchs |
| 6 | `vr_finanzplan` | VR-FinanzPlan erstellen | Mittel | >= 2 eigene Produkte, kein FinanzPlan | VR-FinanzPlan |
| 7 | `rv_haftpflicht` | R+V Haftpflicht | Hoch | Keine Haftpflicht erkennbar | R+V Haftpflicht |
| 8 | `bindungsgespraech` | Bindungsgespraech | Kritisch | NPS <= 5 (Detractor) | Proaktiver Termin |
| 9 | `tierkranken_rv` | R+V Tierkrankenversicherung | Niedrig | Hund/Katze aus Kontoumsaetzen erkannt | R+V Tierkranken |
| 10 | *(Versicherungs-Regeln 3+4)* | Baufi-Zinsbindung / Fondspolice | Kritisch/Mittel | Zinsbindungsende <= 2027 / Depot ohne Steuervorteil | Forward-Darlehen / ERGO Fondspolice |

### Prioritaeten

| Prioritaet | Bedeutung | Beispiel |
|---|---|---|
| **Kritisch** | Sofortiger Handlungsbedarf | Zinsbindungsende in <6 Monaten, NPS Detractor |
| **Hoch** | Wichtiges Vertriebspotenzial | BU fehlt, Fremd-Depot >10k |
| **Mittel** | Sinnvolle Ergaenzung | Tagesgeld-Konsolidierung, Bauspar |
| **Niedrig** | Nice-to-have | Tierkrankenversicherung |

### Potenzial-Volumen Berechnung

Jede Regel definiert ein Volumen als Jahres-Provision/Praemie:

| Regel | Volumen-Logik |
|---|---|
| `rv_bu_fehlt` | 800-2.400 EUR/J. (random) |
| `rv_kfz_statt_fremd` | 400-900 EUR/J. (random) |
| `depot_umschichtung` | = Fremd-Depot-Volumen (z.B. 50.000 EUR) |
| `tagesgeld_konsolidierung` | = Fremd-Tagesgeld-Volumen |
| `bauspar_eigentum` | 10.000-40.000 EUR (Bausparsumme) |
| `rv_haftpflicht` | 60-110 EUR/J. |

### Herleitung & Vergleichstabellen

Jedes Potenzial enthaelt eine **Herleitung** (Datenquelle, erkannte Situation, Empfehlung) und ggf. eine **Vergleichstabelle** (aktueller Anbieter vs. VR-Empfehlung):

```
Beispiel: depot_umschichtung
─────────────────────────────────────────
Datenquelle:      Open Finance – Depotdaten (Trade Republic)
Depot-Volumen:    50.000 EUR
Aktueller Anbieter: Trade Republic
Empfehlung:       Union Investment UniGlobal Vorsorge (TER 0,98%)

Vergleich:
                     Trade Republic    Union Investment
Depotgebuehr         25 EUR/J.         0 EUR bei VR-Konto
Sparplan ab          50 EUR/mtl.       25 EUR/mtl.
Beratung             Online-only       Persoenlich in Filiale
VL-faehig            Teilweise         Ja
```

---

## Neugeschaeft-Daten

Statisch definierte KPIs fuer die Banking-Uebersichtsseite:

| KPI | Wert | Trend |
|---|---|---|
| Antraege | 34 | +8,2% |
| Policiert (Volumen) | 2.850.000 EUR | +12,1% |
| APE | 248.500 EUR | +6,5% |
| Abschlussquote | 72,0% | +4,0% |

### Spartenverteilung Neugeschaeft

| Sparte | Anzahl |
|---|---|
| Kredit | 12 |
| Wertpapier | 9 |
| Vorsorge | 6 |
| Einlage | 4 |
| Versicherung | 3 |

### Top-5 Kunden (Neugeschaeft)

| Kunde | Betrag |
|---|---|
| Klaus Fischer | 42.000 EUR |
| Peter Hoffmann | 28.500 EUR |
| Sandra Mueller | 18.200 EUR |
| Andrea Lang | 12.400 EUR |
| Markus Wagner | 8.600 EUR |

### Neugeschaeft-Vertraege (Beispiele)

| ID | Kunde | Sparte | Produkt | Betrag | Status |
|---|---|---|---|---|---|
| BNG-2026-001 | Klaus Fischer | Kredit | Anschlussfinanzierung | 185.000 EUR | policiert |
| BNG-2026-002 | Klaus Fischer | Wertpapier | VR-MeinDepot ETF | 300 EUR/mtl. | aktiv |
| BNG-2026-003 | Sandra Mueller | Vorsorge | UniProfiRente | 175 EUR/mtl. | aktiv |
| BNG-2026-006 | Andrea Lang | Kredit | Praxiskredit | 85.000 EUR | policiert |

---

## Bestandsdaten

| KPI | Wert | Trend |
|---|---|---|
| Vertraege | 86 | +5,4% |
| Praemienvolumen | 8.920.000 EUR | +2,4% |
| Durchschnittspraemie | 14.867 EUR | +1,2% |
| Vertragsdichte | 3,5 | +0,3 |

---

## Storno-Daten

| KPI | Wert | Trend |
|---|---|---|
| Storno-Anzahl | 6 | -14,3% |
| Storno-Quote | 2,4% | -0,2% |
| Storno-Volumen | 125.000 EUR | -8,5% |
| Fruehstorno | 2 | 0,0% |

### Storno-Gruende

| Grund | Anteil |
|---|---|
| Konditionen | 30% |
| Bankenwechsel | 25% |
| Online-Bank | 20% |
| Service | 15% |
| Sonstiges | 10% |

---

## Qualitaetsdaten

| KPI | Wert | Trend |
|---|---|---|
| NPS Durchschnitt | 8,4 | +3,7% |
| Compliance-Quote | 95,0% | +2,1% |
| Schulungsstunden YTD | 42 | +5,0% |
| Beschwerde-Quote | 0,8% | -27,3% |

### Compliance-Checks

| Pruefung | Status |
|---|---|
| WpHG-Compliance | OK |
| MaRisk-Konformitaet | OK |
| Geldwaesche (GwG) | OK |
| Datenschutz (DSGVO) | OK |
| BaFin-Meldepflichten | OK |
| Open Finance (FIDA) | Ausstehend |
| ESG-Transparenz | Ausstehend |

### Schulungen

| Schulung | Stunden | Status |
|---|---|---|
| WpHG Pflichtschulung | 12 | OK |
| MiFID II Update | 8 | OK |
| Geldwaesche-Praevention | 4 | Ausstehend |
| Open Finance / FIDA | 6 | OK |
| ESG-Beratung (Taxonomie) | 3 | Ausstehend |
| genoGPT / Truuco Impulsmanager | 4 | OK |
| Wero / Digitale girocard | 2 | OK |

---

## Scores & Bewertungen

### NPS (Net Promoter Score, 1-10)

Basiert auf Produktanzahl beim Institut:
- >= 5 Vertraege: Basis 8
- >= 3 Vertraege: Basis 7
- >= 2 Vertraege: Basis 6
- < 2 Vertraege: Basis 5
- Zufallsvariation: +/- 2

### Risikoscore (0-100, niedrig = gut)

Zwei Komponenten:
- **Verschuldung**: Baufinanzierung vorhanden → 30-60, sonst 10-30
- **Einkommensstabilitaet**: Beamtet → 5, Selbstaendig → 25-50, Angestellt → 10-30
- Risikoscore = Durchschnitt beider Werte

### Potenzial-Score (1.0-5.0)

```
score = min(5.0, max(1.0, anzahlPotenziale * 0.5 + gesamtVolumen / 5000))
```

### Abwanderungsrisiko

| NPS | Risiko |
|---|---|
| <= 5 | Hoch |
| 6-7 | Mittel |
| >= 8 | Niedrig |

---

## Generierung: Demografische Verteilung

### Altersgruppen (gewichtet)

| Gruppe | Spanne | Gewichtung |
|---|---|---|
| Jung | 22-29 | 15% |
| Aufbau | 30-39 | 25% |
| Mitte | 40-49 | 25% |
| Pre-Retirement | 50-59 | 20% |
| Senior | 60-70 | 15% |

### Berufe & Einkommensspannen (Banking-Modus)

28 Berufe mit Bruttoeinkommen-Ranges, z.B.:
- IT-Projektleiter: 65.000-90.000 EUR
- Handwerksmeister: 40.000-65.000 EUR
- Arzt: 70.000-120.000 EUR
- Geschaeftsfuehrer: 80.000-200.000 EUR
- Beamter: 45.000-70.000 EUR

Netto-Berechnung mit vereinfachter Steuerprogression:

| Brutto | Netto-Quote |
|---|---|
| <= 30.000 EUR | 72% |
| 30.001-60.000 EUR | 65% |
| 60.001-100.000 EUR | 58% |
| > 100.000 EUR | 54% |

### Familienstand (altersabhaengig gewichtet)

| Alter | Ledig | Verheiratet | Geschieden |
|---|---|---|---|
| < 28 | 70% | 25% | 5% |
| 28-44 | 20% | 65% | 15% |
| 45-59 | 10% | 60% | 30% |
| 60+ | 5% | 60% | 25% |

### Wohnsituation

| Alter | Miete | Eigentum |
|---|---|---|
| < 30 | 90% | 10% |
| 30-44 | 50% | 50% |
| 45+ | 30% | 70% |

---

## Kommunikationshistorie

Pro generiertem Kunden werden 2-5 Kontakteintraege erzeugt:

| Typ | Gewichtung | Beispiel |
|---|---|---|
| Termin | 30% | "Jahresgespraech", "VR-FinanzPlan Erstberatung" |
| E-Mail | 25% | "Kontoauszug digital", "Depotbericht Q4" |
| Telefon | 20% | "Rueckruf Zinsanpassung" |
| Chatbot | 15% | "Frage zu Wero-Aktivierung" |
| VideoBeratung | 10% | "Online-Beratung Baufinanzierung" |

---

## Termine & Aufgaben

### Termine (statisch)

| Datum | Kunde | Betreff |
|---|---|---|
| 11.03.2026 | Klaus Fischer | Anschlussfinanzierung Beratung |
| 12.03.2026 | Peter Hoffmann | VermoegenPlus Depot Review |
| 13.03.2026 | Sandra Mueller | VR-FinanzPlan Erstgespraech |
| 14.03.2026 | Andrea Lang | Praxiskredit Auszahlung |

### Aufgaben (statisch)

| Aufgabe | Faellig |
|---|---|
| Anschlussfinanzierung Fischer vorbereiten | Heute |
| FIDA-Consent Julia Becker einholen | Morgen |
| Wero-Aktivierung Stefan Braun nachfassen | Mi |
| VR-FinanzPlan Sandra Mueller erstellen | Fr |

---

## Modus-Konfiguration

### Farben

| Element | Wert |
|---|---|
| Primary | `#004d26` (Dunkelgruen) |
| Gradient | Dunkelgruen → Gruen |

### White-Label Varianten

Das System unterstuetzt Institutswechsel per Klick:
- Volksbank Mittelhessen (Default)
- Sparkasse
- DKB
- Commerzbank

---

## Datei-Referenzen

| Datei | Inhalt |
|---|---|
| `src/data/banking.js` | 6 Showcase-Personas (B1-B6) mit Produkten, Potenzialen, Scores |
| `src/data/index.js` | Statische KPIs (Neugeschaeft, Bestand, Storno, Verguetung, Qualitaet, Stammdaten, Termine, Aufgaben) |
| `src/data/modeConfig.js` | Banking-spezifische Tabs, Farben, Labels, KPI-Konfiguration |
| `src/data/generator/index.js` | Orchestrierung: `generateAllKunden('banking', 34, seed)` |
| `src/data/generator/personGenerator.js` | 333 Zeilen: Name, Alter, Beruf, Einkommen, Familie, Wohnung |
| `src/data/generator/produktKatalog.js` | Produktdefinitionen (15 Banking-Produkte + Fremdprofile) |
| `src/data/generator/produktZuordnung.js` | Eigene + Fremd-Produktzuweisung mit Praemie/Volumen-Berechnung |
| `src/data/generator/potenzialEngine.js` | 873 Zeilen: 10 Banking-Regeln (+ Versicherung/VV-Regeln) |
| `src/data/generator/scoresKomm.js` | 175 Zeilen: NPS, Risiko, Potenzial-Scores, Kommunikation |
| `src/data/generator/utils.js` | Mulberry32 PRNG, random(), shuffle(), pick(), clamp() |
