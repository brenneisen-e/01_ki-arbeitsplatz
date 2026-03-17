# README VV-02 – Mockdaten-Logik Vermoegensverwaltung

> **Stand:** 2026-03-13
> **Modul:** VV-02 (Vermoegensverwaltung Berater-Cockpit)
> **Sprache:** Deutsch

---

## 1. Uebersicht

Das VV-02-Modul bildet den Arbeitsplatz eines Senior Advisors bei **HRK LUNIS AG** ab. Die Mockdaten simulieren ein realistisches Wealth-Management-Umfeld mit 5 handkuratierten Showcase-Mandanten (W1–W5), erweiterten Datenstrukturen fuer Performance, Compliance, Familien-/Netzwerkplanung, digitales Engagement sowie einer Lead-Pipeline und Revenue-Tracking.

### Datenquellen-Architektur

```
Primaerdaten (handkuratiert)          Erweiterte Daten                   Generator (dynamisch)
─────────────────────────────         ──────────────────                 ────────────────────
src/data/vv.js                        src/data/vvExtended.js             src/data/generator/
  W1–W5 Mandanten-Objekte               VV_PERFORMANCE                    personGenerator.js
  (Profil, Produkte,                     VV_WPHG                           produktZuordnung.js
   Potentiale, Portfolio)                VV_FAMILIE                        potenzialEngine.js
                                         VV_ENGAGEMENT                     scoresKomm.js
js/mock-personas-vv-w1w2.js              VV_LEADS
js/mock-personas-vv-w3w5.js              VV_REVENUE
  (Transaktionen, LinkedIn,
   erweiterte Potentiale)
```

---

## 2. Die 5 Showcase-Mandanten (W1–W5)

Jeder Mandant repraesentiert ein typisches Wealth-Management-Szenario:

| ID | Name | Alter | Mandatstyp | AuM | Kernthema |
|----|------|-------|------------|-----|-----------|
| W1 | Tim Keller | 62 | FairValue | 12,5M EUR | Unternehmensnachfolge, UBS-Konsolidierung |
| W2 | Familie Lindenberg | 51 | SmartValue | 2,1M EUR | SaaS-Exit, 5,5M Cash bei Commerzbank |
| W3 | Stiftung Weber | – | Spezialmandat | 8,3M EUR | Bildungsstiftung, ESG Art.9 Upgrade |
| W4 | Prof. Dr. Hartmann | 56 | FairValue | 6,8M EUR | Chefarzt, PE Healthcare, Praxisnachfolge |
| W5 | Tim Keller | 29 | SmartValue | 450k EUR | Tech-Gruender, Krypto, WpHG abgelaufen |

### Mandatstyp-Segmentierung

| Segment | Mindestvolumen | Fee (All-in) | Beratungsmodell |
|---------|---------------|--------------|-----------------|
| SmartValue | 250k EUR | 1,05% p.a. | Digital + Hotline, Modellportfolios |
| FairValue | 3M EUR | 0,85% p.a. | Fester Senior Berater, individuell |
| Spezialmandat (Stiftung) | Individuell | 0,75% p.a. | Stiftungsrat-Anbindung, Ausschuettungssteuerung |

---

## 3. Familienstammbaeume (VV_FAMILIE)

Die Familienstrukturen sind das Herzstuck des VV-Moduls. Sie ermoeglichen Cross-Selling ueber Generationen und realistische Nachfolge-/Vermoegensuebertragungsszenarien.

### 3.1 Datenstruktur

```javascript
VV_FAMILIE[mandantId] = {
  mitglieder: [
    {
      name: 'Tim Keller',
      rolle: 'mandant' | 'ehepartner' | 'kind' | 'stiftung',
      alter: 62,
      beruf: 'Unternehmer Maschinenbau 3.Gen',
      mandant: true,      // ist selbst Mandant
      aum: 12500000,       // AuM falls Mandant
      vermoegen: 850000,   // geschaetztes Eigenvermoegen (bei Nicht-Mandanten)
    },
    // ... weitere Familienmitglieder
  ],
  vermoegensUebersicht: {
    gesamt: 24170000,      // aggregiertes Familienvermoegen
    aufgliederung: [
      { typ: 'Eigenes Mandat', volumen: 12500000, anteil: 51.7 },
      { typ: 'Fremdbanken',    volumen: 3200000,  anteil: 13.2 },
      { typ: 'Immobilien',     volumen: 3650000,  anteil: 15.1 },
      { typ: 'Unternehmen',    volumen: 4500000,  anteil: 18.6 },
      { typ: 'Sonstiges',      volumen: 320000,   anteil: 1.4  },
    ],
  },
  generationenPlanung: {
    themen: ['...'],           // priorisierte Beratungsthemen
    zeitrahmen: '3-5 Jahre',   // Planungshorizont
    notizen: '...',            // Freitext-Kontextinformationen
  },
}
```

### 3.2 Stammbaum W1 – Familie Keller (24,17M EUR Gesamtvermoegen)

```
                    Tim Keller (62)
                    Unternehmer Maschinenbau 3.Gen
                    AuM: 12.500.000 EUR (FairValue)
                              |
              ┌───────────────┴───────────────┐
              |                               |
    Elisabeth Keller (59)                  |
    Stiftungsvorstand (ehrenamtl.)            |
    Eigenvermoegen: 850.000 EUR               |
              |                               |
     ┌────────┴────────┐                      |
     |                 |                      |
Charlotte (32)    Friedrich (28)              |
Anwaeltin,        Ingenieur im          Weitere Assets:
Partnerin         Familien-             ┌─ UBS Depot: 2,8M
Wirtschafts-      unternehmen           ├─ DB Cash: 400k
kanzlei (FFM)     Potential.            ├─ Immobilien: 3,65M
Eigenvermoegen:   Nachfolger            ├─ Maschinenbau GmbH: 4,5M
800.000 EUR       250.000 EUR           └─ Alte Leipziger LV: 320k
→ Lead L001       → Lead L002              (Ablauf 2026)
```

**Generationenplanung-Themen:**
1. Unternehmensnachfolge Maschinenbau GmbH – Friedrich als Nachfolger (3–5 Jahre)
2. NextGen Charlotte – eigene Vermoegensverwaltung aufbauen (SmartValue)
3. Familienstiftung Gruendung – Elisabeth als Initiatorin (2M Stiftungskapital)
4. Steueroptimierte Vermoegensuebertragung an Kinder
5. LV-Ablauf 2026 – Wiederanlage ins FairValue Mandat

### 3.3 Stammbaum W2 – Familie Lindenberg (10,43M EUR)

```
          Markus Lindenberg (51)            Julia Lindenberg (48)
          SaaS-Exit 2024 (8M netto)         CTO (eigenes Startup)
          AuM: 2.100.000 EUR               Eigenvermoegen: 450.000 EUR
          (SmartValue + PE Healthcare)
                      |
           ┌──────────┴──────────┐
           |                     |
      Noah (18)             Ella (15)
      Abiturient            Schuelerin
      Studienbeginn 2026    (Gymnasium)
      → Studiendepot 100k

    KRITISCH: 5.500.000 EUR Cash bei Commerzbank (Exit-Erloese!)
    Weitere: 200k Tagesgeld, 1,65M Immobilien, 400k Angel Investments
```

**Generationenplanung-Themen:**
1. Cash-Konsolidierung 5,5M (hoechste Prioritaet) – 3-Phasen-Plan
2. NextGen Noah – Studiendepot 100k
3. Julias Startup – Liquiditaetsbedarf beobachten
4. Angel-Portfolio professionalisieren

### 3.4 Stammbaum W3 – Stiftung Weber (8,8M EUR)

```
          ┌─── Stiftung Weber ───┐
          │ Bildungsstiftung      │
          │ Gegruendet 2008       │
          │ AuM: 8.300.000 EUR    │
          │ (Spezialmandat)       │
          │ Ausschuettung 250k/J. │
          └───────────────────────┘
                    |
     ┌──────────────┼──────────────┐
     |              |              |
Dr. Martin      Claudia        Dr. Thomas
Weber (74)      Weber (71)     Fischer
Stifter,        Stiftungs-     Geschaeftsfuehrer
ehem. Unter-    vorstand       Stiftung,
nehmer                         Vorstandsmitglied
(zieht sich
 zurueck)

    Fremdbank: 500k Sparkasse Festgeld (2% bis 2027)
```

Dies ist kein klassischer Familienstammbaum sondern ein **Stiftungs-Organigramm** mit Governance-Struktur. Dr. Weber (Stifter) uebergibt operativ an Dr. Fischer. Die Stiftung hat eine eigene Satzung und Anlagerichtlinien.

### 3.5 Stammbaum W4 – Familie Hartmann (8,33M EUR)

```
    Prof. Dr. Michael Hartmann (56)       Andrea Hartmann (53)
    Chefarzt Kardiologie + Privatpraxis   Psychologin (eigene Praxis)
    AuM: 6.800.000 EUR (FairValue)        Eigenvermoegen: 380.000 EUR
                   |
        ┌──────────┴──────────┐
        |                     |
   Jan Hartmann (26)     Sophie Hartmann (23)
   Assistenzarzt         Medizinstudentin
   Innere Medizin        (5. Semester)
   Eigenvermoegen:       → Studienfinanzierung
   50.000 EUR
   → Lead L006

    Assets: PE Healthcare 200k, Praxisimmobilie 800k,
    ING Tagesgeld 250k, Commerzbank Praxis 80k
```

**Besonderheit:** Mediziner-Dynastie – alle Familienmitglieder im Gesundheitswesen. PE Healthcare passt als Anlage zur Fachexpertise. Praxisnachfolge (Jan?) in 5–8 Jahren.

### 3.6 W5 – Tim Keller (658k EUR, Single)

```
    Tim Keller (29)
    Tech-Gruender (Seed-Exit 500k)
    AuM: 450.000 EUR (SmartValue)
    │
    ├─ Krypto: 120k (BTC/ETH/SOL, unstrukturiert)
    ├─ Angel Investments: 80k (2 Startups)
    └─ N26: 8k (Girokonto)

    WARNUNG: WpHG-Fragebogen ABGELAUFEN (Dez 2025)
```

Kein Stammbaum – Einzelmandant. Typischer NextGen-Einstieg. Wachstum erwartet bei naechstem Startup-Exit.

---

## 4. Unternehmens-/Organisations-Organigramme

### 4.1 Keller Maschinenbau GmbH & Co. KG

Das Unternehmen ist als **Fremdprodukt** (typ: 'gmbh') mit 4,5M EUR Bewertung hinterlegt:

```javascript
{ typ: 'gmbh', institut: 'Eigene', details: 'Maschinenbau GmbH 3.Gen', volumen: 4500000, consent: false }
```

Die Unternehmensstruktur wird implizit ueber die Familiendaten modelliert:

```
    Keller Maschinenbau GmbH & Co. KG
    3. Generation | Bewertung: ca. 4,5M EUR (EBITDA-Multiple)
    ┌────────────────────────────────────┐
    │ Gesellschafter / GF:               │
    │   Tim Keller (62)      │
    │   → plant Rueckzug mit 65–67       │
    ├────────────────────────────────────┤
    │ Nachfolger (geplant):              │
    │   Friedrich Keller (28)         │
    │   Ingenieur, aktuell im            │
    │   Unternehmen taetig               │
    ├────────────────────────────────────┤
    │ Charlotte Keller (32)           │
    │ → KEIN Interesse am Unternehmen    │
    │   (Karriere als Anwaeltin)         │
    └────────────────────────────────────┘
```

**LinkedIn-Signale:** 75-Jahre-Firmenjubilaeum, ESG-Roadmap 2030, Friedrich als neuer COO (aus `mock-personas-vv-w1w2.js`).

### 4.2 Stiftung Weber – Governance-Organigramm

```
    ┌─────────────────────────────────────────┐
    │          STIFTUNGSRAT                    │
    │  (tagt halbjaehrlich)                   │
    ├─────────────────────────────────────────┤
    │  Stiftungsvorstand:                     │
    │    Claudia Weber (71)                   │
    │                                         │
    │  Geschaeftsfuehrung:                    │
    │    Dr. Thomas Fischer                   │
    │    (uebernimmt operativ)                │
    │                                         │
    │  Stifter (zurueckziehend):              │
    │    Dr. Martin Weber (74)                │
    ├─────────────────────────────────────────┤
    │  Stiftungszweck: Bildungsfoerderung     │
    │  Kapital: 8,3M EUR                      │
    │  Jaehrl. Ausschuettung: 250k (3%)       │
    │  Gegruendet: 2008                       │
    │  Anlagerichtlinie: Stiftungssatzung     │
    │  ESG: Art.8 (Upgrade Art.9 geplant)     │
    └─────────────────────────────────────────┘
```

### 4.3 Julias Startup (W2, Familie Lindenberg)

```javascript
arbeitgeber: { name: 'Keller Ventures GmbH', quelle: 'linkedin', bestaetigt: false }
```

Julia Lindenberg ist CTO eines eigenen Startups in der Seed-Phase. Der Liquiditaetsbedarf des Startups wird als Beobachtungsthema in der Generationenplanung gefuehrt.

---

## 5. Portfolio- und Performance-Daten (VV_PERFORMANCE)

### 5.1 Datenstruktur

Pro Mandant werden folgende Dimensionen gemockt:

```javascript
VV_PERFORMANCE[mandantId] = {
  monthlyReturns: [                    // 12 Monate Portfolio vs. Benchmark
    { name: 'Jan', portfolio: 0.8, benchmark: 0.5 },
    // ...
  ],
  allocation: { aktien, anleihen, alternative, cash, immobilien },   // IST
  targetAllocation: { aktien, anleihen, alternative, cash, immobilien }, // SOLL
  sectors: [ { name, value } ],        // 7-8 Sektoren (Gewichtung in %)
  regions: [ { name, value } ],        // 5 Regionen (Europa, NA, APAC, EM, Sonstige)
  bonds: [ { name, value } ],          // Anleihensegmentierung (IG, HY, Staat, Pfandbrief, EM)
  currencies: [ { name, value } ],     // Waehrungsverteilung (EUR, USD, CHF, GBP, Sonstige)
  riskMetrics: {
    volatilitaet,    // 5.4% (Stiftung) bis 15.8% (Tim Keller)
    sharpe,          // 0.82 bis 1.42
    maxDrawdown,     // -2.1% bis -11.5%
    var95,           // -1.5% bis -4.9%
    trackingError,   // 0.9% bis 5.1%
  },
  ioComment: '...',  // Investment-Officer-Kommentar zum Portfolio
}
```

### 5.2 Mandanten-Performance-Vergleich

| Mandant | YTD | 1 Jahr | Volatilitaet | Sharpe | Max DD | Stil |
|---------|-----|--------|-------------|--------|--------|------|
| W1 Keller | +4,2% | +8,5% | 8,2% | 1,05 | -5,1% | Konservativ-Ausgewogen |
| W2 Lindenberg | +5,8% | +12,1% | 12,5% | 1,35 | -8,7% | Wachstum/Tech-Fokus |
| W3 Stiftung | +2,8% | +5,2% | 5,4% | 0,82 | -2,1% | Defensiv (Kapitalerhalt) |
| W4 Hartmann | +4,8% | +9,1% | 9,8% | 1,18 | -6,3% | Ausgewogen + Healthcare |
| W5 Keller | +7,2% | – | 15,8% | 1,42 | -11,5% | Aggressiv/Tech |

### 5.3 Logik der Performance-Generierung

Die monatlichen Returns sind handkuratiert und spiegeln den jeweiligen Anlagestil wider:
- **Konservative Mandate** (W1, W3): Geringe Schwankung, moderate Outperformance
- **Wachstumsmandate** (W2, W5): Hohe Schwankung, starke Outperformance in guten Monaten
- **Benchmark**: Einheitlich pro Monat, Abweichung modelliert den Tracking Error

---

## 6. WpHG-Compliance (VV_WPHG)

### 6.1 Datenstruktur

```javascript
VV_WPHG[mandantId] = {
  fragebogen: {
    letztesUpdate,          // Datum letzte Aktualisierung
    naechstesPruefung,      // Naechster Review-Termin
    status: 'aktuell' | 'abgelaufen',
    risikoklasse: 2-5,      // Regulatorische Risikoklasse
    anlageziel: '...',
    anlagehorizont: '...',
    erfahrung: {             // Selbsteinschaetzung nach Assetklasse
      aktien: 'gering' | 'mittel' | 'hoch',
      anleihen: '...',
      alternative: '...',
      derivate: '...',
    },
  },
  geeignetheit: {
    status: 'konform' | 'abgelaufen',
    pruefungen: [            // Chronologische Pruefungshistorie
      { datum, typ, ergebnis, details },
    ],
  },
  verlustschwelle: {
    schwelle: -8 bis -20,    // Individuelle Schwelle (%)
    aktuell: -1.5 bis -8.3,  // Aktueller Verluststand
    status: 'ok' | 'warnung' | 'verletzt',
    meldungen: [             // Historische Schwellenverletzungen
      { datum, schwelle, verlust, gemeldet },
    ],
  },
  kosten: {
    exAnte: { managementFee, performanceFee, custodyFee, transaktionskosten, gesamtTER },
    exPost: { jahr, gesamtkosten, renditeNachKosten },
  },
  dokumente: [               // Dokumentenstatus-Tracking
    { typ, datum, status },
  ],
}
```

### 6.2 Compliance-Status pro Mandant

| Mandant | Risikoklasse | Status | Verlustschwelle | Aktuell | Naechste Pruefung |
|---------|-------------|--------|-----------------|---------|-------------------|
| W1 Keller | 3 | aktuell | -10% | -3,2% | 2026-05-15 |
| W2 Lindenberg | 4 | aktuell | -15% | -5,1% | 2026-08-20 |
| W3 Stiftung | 2 | aktuell | -8% | -1,5% | 2026-04-01 |
| W4 Hartmann | 4 | aktuell | -12% | -4,8% | 2026-06-10 |
| W5 Keller | 5 | **ABGELAUFEN** | -20% | -8,3% | **UEBERFAELLIG** |

**W5 Tim Keller ist ein bewusster Alert-Case:** Der WpHG-Fragebogen ist seit Dezember 2025 abgelaufen. Dies generiert einen dringenden Compliance-Hinweis im Dashboard.

### 6.3 Kostenstruktur (Ex-Ante)

| Mandant | Management Fee | Custody | Transaktion | Gesamt-TER |
|---------|---------------|---------|-------------|------------|
| W1 FairValue | 0,85% | 0,05% | 0,12% | 1,02% |
| W2 SmartValue | 1,05% | 0,05% | 0,15% | 1,25% |
| W3 Stiftung | 0,75% | 0,04% | 0,08% | 0,87% |
| W4 FairValue | 0,85% | 0,05% | 0,12% | 1,02% |
| W5 SmartValue | 1,05% | 0,05% | 0,18% | 1,28% |

---

## 7. Digitales Engagement (VV_ENGAGEMENT)

### 7.1 Datenstruktur

```javascript
VV_ENGAGEMENT[mandantId] = {
  linkedin: { profilUrl, aktivitaet, letzterPost, themen: [], kontakte },
  website: {
    besuche: [ { datum, seite, dauer } ],  // Page-Level-Tracking (Dauer in Sek.)
    letzterBesuch,
  },
  newsletter: { abonniert, oeffnungsrate, letzteOeffnung },
  events: [ { name, datum, typ, teilgenommen } ],
  presse: [ { datum, medium, titel, relevant } ],
  digitalScore: 0-100,
}
```

### 7.2 Digital Scores

| Mandant | Score | LinkedIn | Newsletter-Oeffnung | Events | Profil |
|---------|-------|----------|---------------------|--------|--------|
| W1 Keller | 42 | niedrig (480 Kontakte) | 65% | 2/3 | Tradioneller Unternehmer |
| W2 Lindenberg | 78 | hoch (2.850 Kontakte) | 82% | 3/4 | Digital Native, SaaS |
| W3 Stiftung | 22 | niedrig (120 Kontakte) | 45% | 2/2 | Institution, wenig digital |
| W4 Hartmann | 58 | mittel (950 Kontakte) | 72% | 2/3 | Fachlich aktiv |
| W5 Keller | 92 | sehr hoch (3.200 Kontakte) | 95% | 4/4 | Digital-First Generation |

### 7.3 Zweck der Engagement-Daten

Die Engagement-Signale ermoeglichen dem Berater:
- **Gespraechsanknuepfung**: Presseartikel und LinkedIn-Posts als Einstiegsthemen
- **Priorisierung**: Hohe Website-Aktivitaet bei bestimmten Produktseiten = Kaufinteresse
- **Event-Planung**: Welche Formate (Roundtable, Dinner, Webinar) funktionieren bei wem
- **Digital Score**: Aggregierter Indikator fuer kanalgerechte Ansprache

---

## 8. Lead-Pipeline (VV_LEADS)

### 8.1 Datenstruktur

```javascript
VV_LEADS = [
  {
    id: 'L001',
    name: 'Charlotte Keller',
    quelle: 'NextGen' | 'Empfehlung' | 'Event' | 'Liquiditaet' | 'Bestandskunde',
    typ: 'neukunde' | 'bestandskunde',
    status: 'identifiziert' | 'kontaktiert' | 'termin' | 'angebot' | 'onboarding' | 'gewonnen',
    potentialAuM: 800000,
    wahrscheinlichkeit: 60,         // Gewichtung fuer Pipeline-Berechnung
    naechsterSchritt: '...',
    notizen: '...',
    datum: '2026-02-15',
    referenzMandant: 'VV00001',      // Verknuepfung zum Bestandsmandanten
  },
]
```

### 8.2 Pipeline-Uebersicht

| Lead | Quelle | Status | Pot. AuM | Wahrsch. | Gewichtet |
|------|--------|--------|----------|----------|-----------|
| Charlotte Keller | NextGen (W1) | kontaktiert | 800k | 60% | 480k |
| Friedrich Keller | NextGen (W1) | identifiziert | 250k | 40% | 100k |
| Dr. Katharina Bauer | Empfehlung (W4) | termin | 3,5M | 70% | 2,45M |
| Lindenberg Cash | Bestandskunde (W2) | angebot | 5,5M | 80% | 4,4M |
| Stiftung Merian | Event | kontaktiert | 4,2M | 35% | 1,47M |
| Jan Hartmann | NextGen (W4) | identifiziert | 50k | 50% | 25k |
| Dipl.-Ing. Mueller | Empfehlung | termin | 2,8M | 55% | 1,54M |
| (weitere) | ... | ... | ... | ... | ... |

**Gesamt-Pipeline: ~20M EUR Brutto-Potential**

### 8.3 Vernetzung Leads ↔ Mandanten

Die Leads sind bewusst mit den Showcase-Mandanten verknuepft (referenzMandant):
- **W1-Leads**: Charlotte (L001), Friedrich (L002) – NextGen
- **W2-Lead**: Cash-Konsolidierung (L004) – Bestandskunde
- **W4-Leads**: Dr. Bauer (L003, Empfehlung), Jan Hartmann (L006, NextGen)

Dies modelliert den typischen Wealth-Management-Akquise-Trichter: Bestehende Mandantenbeziehungen generieren Empfehlungen und NextGen-Kontakte.

---

## 9. Revenue-Tracking (VV_REVENUE)

### 9.1 Datenstruktur

```javascript
VV_REVENUE = {
  monthlyRevenue: [
    { name: 'Jan', managementFee: 22800, performanceFee: 0, sonstiges: 1200 },
    // ... 12 Monate
  ],
  mandantenRevenue: [
    { name: 'Tim Keller', aum: 12500000, fee: 0.85, ertrag: 106250 },
    // ...
  ],
  feeStruktur: [
    { typ: 'Management Fee', volumen: 232100, anteil: 79.5 },
    { typ: 'Performance Fee', volumen: 21000, anteil: 7.2 },
    // ...
  ],
  forecast: { q1: 78700, q2: 85200, q3: 92500, q4: 105600 },
}
```

### 9.2 Berater-Revenue-Zusammenfassung

| Mandant | AuM | Fee-Satz | Jahresertrag |
|---------|-----|----------|-------------|
| Tim Keller | 12,5M | 0,85% | 106.250 EUR |
| Stiftung Weber | 8,3M | 0,75% | 62.250 EUR |
| Prof. Hartmann | 6,8M | 0,85% | 57.800 EUR |
| Fam. Lindenberg | 2,1M | 1,05% | 22.050 EUR |
| Tim Keller | 450k | 1,05% | 4.725 EUR |
| **Gesamt** | **30,15M** | | **253.075 EUR** |

Fee-Zusammensetzung: 79,5% Management Fees, 7,2% Performance Fees, 5,2% Custody, 4,2% Transaktionskosten, 3,9% Sonstiges.

---

## 10. Transaktions- und Cashflow-Daten

Die erweiterten Persona-Dateien (`mock-personas-vv-w1w2.js`, `mock-personas-vv-w3w5.js`) enthalten monatliche Transaktionsdaten:

### 10.1 Beispiel W1 – Tim Keller (Februar 2026)

| Richtung | Kategorie | Betrag | Quelle/Empfaenger |
|----------|-----------|--------|-------------------|
| Zufluss | Gehalt/Entnahme | 18.000 EUR | Maschinenbau GmbH |
| Zufluss | Gewinnausschuettung | 125.000 EUR | Maschinenbau GmbH |
| Zufluss | Mieteinnahmen | 11.300 EUR | MFH + Gewerbe |
| Zufluss | Dividenden | 6.000 EUR | FairValue Mandat |
| Abfluss | Lifestyle | -6.500 EUR | Haushalt |
| Abfluss | Immobilien-Unterhalt | -2.200 EUR | Instandhaltung |
| Abfluss | Versicherungen | -1.800 EUR | Diverse |
| Abfluss | Steuern | -12.000 EUR | Vorauszahlung |
| **Netto** | | **+123.700 EUR** | **Sparquote 42%** |

### 10.2 Sparquoten-Vergleich

| Mandant | Netto-Cashflow/Monat | Sparquote |
|---------|---------------------|-----------|
| W1 Keller | +123.700 EUR | 42% |
| W2 Lindenberg | +5.600 EUR | 28% |
| W3 Stiftung | +3.400 EUR | 11% (Ueberschuss) |
| W4 Hartmann | -6.200 EUR | negativ (geplant, 200k/J. Entnahme) |
| W5 Keller | +150 EUR | 1% |

---

## 11. Potenzial-Engine (Generator-Logik)

### 11.1 VV-spezifische Regeln

Die Datei `potenzialEngine.js` definiert 9 regelbasierte Potenziale fuer VV-Mandanten:

| Regel-ID | Trigger | Prioritaet | Beschreibung |
|----------|---------|-----------|--------------|
| `fremdbank_konsolidierung` | fremdProdukt typ 'depot_privat' | hoch | Depot bei Fremdbank konsolidieren |
| `cash_konsolidierung` | Tagesgeld > 200k | **kritisch** | Cash in VV-Mandat investieren |
| `nextgen_mandat` | Kind 25+, kein eigenes Mandat | hoch | SmartValue fuer naechste Generation |
| `mandatstyp_upgrade` | Gesamtvermoegen > 4M, noch SmartValue | hoch | Upgrade SmartValue → FairValue |
| `nachfolgeplanung` | Alter 58+, Unternehmensbeteiligung | hoch | Nachfolge + Erloeswiederanlage |
| `stiftungsgruendung` | Alter 55+, Vermoegen > 10M | mittel | Stiftung empfehlen |
| `pe_allokation` | Vermoegen > 5M, kein PE | mittel | 5% PE-Allokation empfehlen |
| `lv_ablauf` | RLV mit "Ablauf" im Detail | hoch | Auszahlung ins Mandat integrieren |
| `family_office` | Gesamtvermoegen > 15M | mittel | Family Office Service anbieten |

### 11.2 Generierungslogik

```
Fuer jeden Mandanten:
  1. Pruefen aller VV_REGELN gegen Mandantenprofil
  2. Passende Regeln generieren Potenzial-Objekte mit:
     - Dynamischem Titel (abhaengig von konkreten Daten)
     - Berechnetem Volumen
     - Detaillierter Herleitung (Datenquelle → Analyse → Empfehlung)
     - Optionalem Vergleich (aktuell vs. empfohlen)
  3. Zufaellige Status-Zuweisung (identifiziert → angeschrieben → termin → abgeschlossen)
```

### 11.3 Showcase vs. generierte Potenziale

Die 5 Showcase-Mandanten (W1–W5) haben **handkuratierte Potenziale** direkt in `vv.js` mit:
- Detaillierten Herleitungen (5–7 Datenpunkte pro Potenzial)
- Vergleichstabellen (aktuell vs. empfohlen, mit Highlight-Feldern)
- Spezifischen Status und empfohlenen Aktionen

Der Generator in `potenzialEngine.js` erzeugt **dynamische Potenziale** fuer zusaetzlich generierte Mandanten nach denselben Regeln, aber mit automatisch berechneten Werten.

---

## 12. Personen-Generator (dynamische Mandanten)

### 12.1 VV-Berufe-Pool

```javascript
const VV_BERUFE = [
  { beruf: 'Unternehmer (Maschinenbau)', einkommen: [200000,800000], typ: 'unternehmer' },
  { beruf: 'Unternehmerin (IT/SaaS)',    einkommen: [150000,500000], typ: 'unternehmer' },
  { beruf: 'Chefarzt Kardiologie',       einkommen: [250000,500000], typ: 'arzt' },
  { beruf: 'Zahnaerztin (3 Praxen)',     einkommen: [200000,600000], typ: 'arzt' },
  // ... weitere Berufe: GF Mittelstand, Rechtsanwaeltin, Ex-Vorstand, Stifterin, Privatier, ...
];
```

### 12.2 Generierungsparameter

| Parameter | Bereich | Bemerkung |
|-----------|---------|-----------|
| Alter | 38–75 | Aelter als Versicherung/Banking |
| Kinder | 0–4 | Gewichtet: 2 Kinder am haeufigsten (40%) |
| Kinder-Alter | 22–40 | Erwachsene Kinder (bei Mandant > 50) |
| Wohnflaeche | 150–350 qm | Immer Eigentum |
| LinkedIn-Kontakte | 300–2.000 | Fuer Engagement-Score |
| Gesamtvermoegen | Berechnet | Netto + Immobilien + Beteiligungen + Fremdbanken |
| Segment | SmartValue / FairValue | Automatisch: < 5M = SmartValue, >= 5M = FairValue |
| ID-Praefix | WM | z.B. WM00100, WM00101, ... |

---

## 13. Modus-Konfiguration

Aus `modeConfig.js`:

```javascript
vermoegensverwaltung: {
  institut: 'HRK LUNIS AG',
  beraterTitel: 'Senior Advisor',
  beraterName: 'Dr. Thomas Richter',
  kundenLabel: 'Mandant',

  colors: {
    primary: '#1a365d',       // Navy-Blau
    primaryLight: '#2b4c7e',
    accent: '#c4a35a',        // Gold
    gradient: 'linear-gradient(135deg, #1a365d, #2b4c7e)',
  },

  kpiConfig: [
    { id: 'aum',     label: 'AuM Gesamt',   format: 'eur' },
    { id: 'nnm',     label: 'Net New Money', format: 'eur' },
    { id: 'ertrag',  label: 'Ertrag YTD',   format: 'eur' },
    { id: 'mandate', label: 'Mandate',       format: 'num' },
  ],

  tabs: ['Mein Tag', 'Mandanten', 'Pipeline & Leads', 'Revenue', 'Compliance', 'Potentiale'],

  detailTabs: [
    'Ueberblick', 'Performance', 'Vermoegen', 'WpHG & Compliance',
    'Familie & Netzwerk', 'Engagement', 'Kontakte'
  ],
}
```

---

## 14. Zusammenfassung: Dateien und ihre Verantwortung

| Datei | Inhalt | Mandanten |
|-------|--------|-----------|
| `src/data/vv.js` | 5 Showcase-Mandanten mit Profil, Produkten, Potentialen, Portfolio | W1–W5 |
| `src/data/vvExtended.js` | Performance, WpHG, Familie, Engagement, Leads, Revenue | W1–W5 + Berater-Ebene |
| `js/mock-personas-vv-w1w2.js` | Erweiterte Transaktionen, LinkedIn, Potentiale | W1, W2 |
| `js/mock-personas-vv-w3w5.js` | Erweiterte Transaktionen, LinkedIn, Potentiale | W3, W4, W5 |
| `src/data/generator/personGenerator.js` | Dynamische VV-Personen generieren | WM001xx+ |
| `src/data/generator/potenzialEngine.js` | Regelbasierte Potenzialerkennung (9 VV-Regeln) | Alle |
| `src/data/generator/produktZuordnung.js` | Eigene + Fremdprodukte zuweisen | Alle |
| `src/data/modeConfig.js` | Tabs, KPIs, Farben, Labels fuer VV-Modus | Konfiguration |
