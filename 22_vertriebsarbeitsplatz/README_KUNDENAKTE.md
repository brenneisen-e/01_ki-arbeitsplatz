# Kundenakte – Vertriebsarbeitsplatz V02

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Versicherung – Reiter im Detail](#versicherung--reiter-im-detail)
   - [Stammdaten](#1-stammdaten-versicherung)
   - [Verträge](#2-verträge)
   - [Open Finance](#3-open-finance-versicherung)
   - [Impulse](#4-impulse-versicherung)
   - [Finanzprofil](#5-finanzprofil-versicherung)
   - [Kommunikation](#6-kommunikation-versicherung)
3. [Banking – Reiter im Detail](#banking--reiter-im-detail)
   - [Stammdaten](#1-stammdaten-banking)
   - [Produkte](#2-produkte)
   - [Open Finance](#3-open-finance-banking)
   - [Impulse](#4-impulse-banking)
   - [Finanzprofil](#5-finanzprofil-banking)
   - [Kommunikation](#6-kommunikation-banking)
4. [Datenstruktur & Quellen](#datenstruktur--quellen)
5. [Berechnete KPIs](#berechnete-kpis)

---

## Übersicht

Die Kundenakte ist die zentrale Detailansicht eines Kunden im Vertriebsarbeitsplatz V02. Sie wird über die `DetailPage.jsx` gesteuert und zeigt je nach Modus (Versicherung, Banking, Vermögensverwaltung) unterschiedliche Reiter an.

| Modus | Reiter |
|-------|--------|
| **Versicherung** | Stammdaten · Verträge · Open Finance · Impulse · Finanzprofil · Kommunikation |
| **Banking** | Stammdaten · Produkte · Open Finance · Impulse · Finanzprofil · Kommunikation |

Die Reiter teilen sich dieselben Basis-Komponenten, passen Labels und Spalten aber dynamisch an den aktiven Modus an (z. B. "Prämie/J." vs. "Jahreskosten", "Verträge" vs. "Produkte").

### Farbschema

| Modus | Primary | Primary Light | Accent |
|-------|---------|---------------|--------|
| Versicherung (ERGO) | `#86181d` (Dunkelrot) | `#C8102E` (Rot) | `#e8c547` (Gold) |
| Banking (Volksbank) | `#004d26` (Dunkelgrün) | `#00843d` (Grün) | `#7ab648` (Hellgrün) |

---

## Versicherung – Reiter im Detail

### 1. Stammdaten (Versicherung)

**Komponente:** `StammdatenDetailTab.jsx`

Der Stammdaten-Reiter ist die umfangreichste Einzelansicht und dient als 360°-Kundenprofil.

#### A. Kunden-Profil Header

| Feld | Beschreibung | Beispiel |
|------|-------------|---------|
| Foto / Initialen | Kundenfoto aus `KUNDEN_FOTOS`-Mapping oder farbiger Initialen-Avatar | – |
| Name | Vor- und Nachname | Peter Schmidt |
| Beruf | Aktuelle Berufsbezeichnung | Maschinenbauingenieur |
| Alter | Alter in Jahren | 42 |
| Kunden-ID | Eindeutige Kennung | KD00001 |
| Kunde seit | Datum der Erstregistrierung | 2015 |
| LinkedIn-Kontakte | Anzahl LinkedIn-Verbindungen | 312 Kontakte |

#### B. Persönliche Daten (Card)

| Feld | Detailgrad | Beispiel |
|------|-----------|---------|
| Name & Alter | Vollständig | Peter Schmidt, 42 |
| Beruf | Freitext | Maschinenbauingenieur |
| Arbeitgeber | Name + LinkedIn-Verifizierungsstatus (bestätigt/unbestätigt) | Siemens AG ✓ |
| Familienstand | Auswahl | verheiratet |
| Partner | Name + Beruf | Maria Schmidt, Lehrerin |
| Kinder | Liste mit Name + Alter | Lena (14), Tim (11) |
| Wohnsituation | Eigenheim / Miete | Eigenheim |
| Wohnfläche | Quadratmeter | 145 m² |
| Haustiere | Art, Name, Rasse, Alter + erkannte Transaktionen (FIDA-Quelle) | Hund "Bello", Golden Retriever, 5 J. – Fressnapf €85/mtl. |

#### C. Finanzübersicht (Card)

| KPI | Berechnung | Format |
|-----|-----------|--------|
| **Haushaltsnetto** | Nettoeinkommen + Partner-Einkommen + (Kinder × 250 € Kindergeld) | EUR/Monat |
| **Absicherungsquote** | Versicherungsausgaben ÷ Haushaltsnetto × 100 | Prozent |
| **Sparquote** | Sparausgaben ÷ Haushaltsnetto × 100 | Prozent |
| **Frei verfügbar** | Haushaltsnetto − Gesamtausgaben | EUR/Monat |
| **Risikoscore** | Aufklappbar: Bonität, Zahlungsverhalten, Abwanderungsrisiko | Skala |
| **NPS** | Net Promoter Score | 0–10 |
| **CLV** | Summe aller Jahresprämien × 10 | EUR |
| **Potenzial-Score** | Sterne-Rating | 0–5 ★ |

#### D. Eigene Produkte (Tabelle)

| Spalte | Beschreibung |
|--------|-------------|
| Produkt | Produktname mit optionalem Versicherer-Logo |
| Sparte | Farbcodierter Badge: `leben` (blau), `kranken` (grün), `schaden` (orange), `kfz` (rot) |
| Tarif/Details | Tarifbezeichnung und Deckungssummen |
| Prämie/J. | Jahresprämie in EUR (Monospace, fett) |
| Seit | Vertragsbeginn-Datum |
| Status | Badge: `aktiv` (grün), `optimierbar` (gelb), `policiert` (blau) |

**Beispielprodukte Versicherung:** BU, KFZ-Vollkasko, Hausrat, Privathaftpflicht, Risikoleben, Wohngebäude

#### E. Fremdprodukte (Tabelle – Open-Finance-Daten)

| Spalte | Beschreibung |
|--------|-------------|
| Produkt | Produkttyp (z. B. Girokonto, Baufinanzierung, Depot) |
| Institut | Name der Fremdbank/-versicherung |
| Details | Produktbeschreibung |
| Volumen | Summe in EUR |
| Consent | FIDA-Status: ✓ Erteilt (grün) / ✗ Ausstehend (grau) |

**Mögliche Fremdprodukt-Typen:** girokonto, baufinanzierung, kredit, depot, tagesgeld, festgeld, sparkonto, rlv, bav, bausparer, riester, rürup, anleihe, fonds, kfz, haftpflicht, hausrat, bu, unfall, rechtsschutz, wohngebäude, pflege

---

### 2. Verträge

**Komponente:** `VertraegeTab.jsx`

Der Verträge-Reiter zeigt eine konsolidierte Vertragsübersicht mit Zusammenfassung.

#### Eigene Produkte (Tabelle)

Identische Tabellenstruktur wie in Stammdaten, inklusive:
- Produkt (mit Versicherer-Logo)
- Sparte (farbiger Badge)
- Tarif/Details
- **Prämie/J.** (Versicherungs-spezifisches Label)
- Seit
- Status

#### Vertragszusammenfassung (3-Spalten-Grid)

| KPI | Beschreibung | Beispiel |
|-----|-------------|---------|
| **Gesamtprämie/J.** | Summe aller Jahresprämien | 4.850 € |
| **Anzahl Verträge** | Gesamtzahl eigene Produkte | 6 |
| **Optimierbar** | Anzahl Verträge mit Status `optimierbar` (gelb hervorgehoben wenn > 0) | 2 |

---

### 3. Open Finance (Versicherung)

**Komponente:** `OpenFinanceTab.jsx`

#### FIDA Consent-Status (3-KPI-Grid)

| KPI | Beschreibung | Farbe |
|-----|-------------|-------|
| **Gesamt** | Gesamtanzahl Fremdprodukte | Standard |
| **Consent erteilt** | Produkte mit erteiltem FIDA-Consent | Grün |
| **Ausstehend** | Produkte ohne Consent | Amber/Gelb |

#### Externe Verknüpfungen (Tabelle)

| Spalte | Beschreibung |
|--------|-------------|
| Produkt | Produkttyp (Großschreibung, Underscores → Leerzeichen) |
| Institut | Logo + Name der externen Institution |
| Details | Produktbeschreibung |
| Volumen | EUR-Betrag (Monospace, rechtsbündig) |
| Consent | Badge: "✓ Erteilt" (grün) oder "✗ Ausstehend" (grau) |

---

### 4. Impulse (Versicherung)

**Komponente:** `ImpulseTab.jsx`

Der Impulse-Reiter ist das zentrale Vertriebssteuerungsinstrument mit KI-gestützten Handlungsempfehlungen.

#### A. Absicherungsstatus (Card)

Visuelle Darstellung der Versicherungsabdeckung über **9 Absicherungstypen**:

| Typ | Label | Status |
|-----|-------|--------|
| bu | BU | ✓ vorhanden (grün) / ✗ fehlend (rot) |
| kfz | KFZ | ✓ / ✗ |
| hausrat | Hausrat | ✓ / ✗ |
| haftpflicht | Haftpfl. | ✓ / ✗ |
| rlv | RLV | ✓ / ✗ |
| pflege | Pflege | ✓ / ✗ |
| unfall | Unfall | ✓ / ✗ |
| rechtsschutz | Rechtsch. | ✓ / ✗ |
| wohngebäude | Wohngeb. | ✓ / ✗ |

Header zeigt: **"X Lücken erkannt"**

#### B. Potenzial-Karten (aufklappbar)

Die Potenziale werden in **3 Sektionen** gruppiert:

| Sektion | Potenzial-Typen |
|---------|----------------|
| **Whitespots (Neugeschäft)** | `whitespot` |
| **Anpassungsbedarfe** | `anpassung` |
| **Weitere Potentiale** | `cross_sell`, `konsolidierung`, `nextgen`, `beratung` |

##### Potenzial-Karte – Eingeklappte Ansicht

| Feld | Beschreibung |
|------|-------------|
| Titel | Potenzialbezeichnung (z. B. "BU-Absicherung fehlt") |
| Quellen-Badges | Datenquellen: `Bestandsanalyse`, `Open Finance/FIDA`, `Lebensereignis`, `Wettbewerbsanalyse`, `Kommunikationsanalyse` |
| Priorität | Badge: `kritisch` (rot), `hoch` (orange), `mittel` (gelb), `niedrig` (grau) |
| Volumen | EUR-Betrag oder "–" |
| Volumen-Typ | `jährlich`, `einmalig`, `vermittlung` |
| Beschreibung | Kurztext zur Begründung |

##### Potenzial-Karte – Aufgeklappte Ansicht (zusätzlich)

**Herleitung des Impulses:**
2-Spalten-Grid mit Label-Wert-Paaren, z. B.:
- Datenquelle → "Bestandsanalyse + Open Finance"
- Kunde → "Peter Schmidt, 42, Maschinenbauingenieur"
- Erkannte Situation → "Keine BU-Absicherung vorhanden"
- Empfohlenes Produkt → "ERGO BU Premium"

**Deckungslücke-Visualisierung** (wenn vorhanden):
- 3 Metrik-Boxen: Nettoeinkommen | Aktuelle Absicherung | Empfehlung
- Visueller Fortschrittsbalken mit Prozentanzeige ("X% abgesichert")
- Gestrichelte Ziellinie
- Amber-Box mit: "Deckungslücke: XXX €/mtl."

**Vergleichstabelle** (wenn vorhanden):

| Spalte | Beschreibung |
|--------|-------------|
| Merkmal | Vergleichskriterium (z. B. "Rente", "Absicherungsgrad") |
| Aktuell | Aktueller Wert/Status |
| Angebot | Neues Angebot (grün hervorgehoben wenn `highlight=true`) |

**Aktionen:**
- "Kunde öffnen" – Button in Primärfarbe
- Empfohlene Aktion: "Termin vereinbaren" / "Angebot erstellen" / "Tarifvergleich starten"
- Produktempfehlung als Link

---

### 5. Finanzprofil (Versicherung)

**Komponente:** `FinanzprofilTab.jsx`

#### A. Einnahmen & Ausgaben (Card, linke Spalte)

**Einnahmen-Kategorien:**

| Kategorie | Label | Beispiel |
|-----------|-------|---------|
| gehalt | Gehalt | 4.500 €/mtl. |
| gehalt_partner | Partner-Gehalt | 3.200 €/mtl. |
| kindergeld | Kindergeld | 500 €/mtl. |
| rente | Rente | – |
| einkommen | Sonstiges Einkommen | – |

**Ausgaben-Kategorien:**

| Kategorie | Label | Beispiel |
|-----------|-------|---------|
| baufi | Baufinanzierung | −1.200 €/mtl. |
| miete | Miete | – |
| kredit | Kredit | −350 €/mtl. |
| versicherung_eigen | Eigene Versicherungen | −420 €/mtl. |
| versicherung_fremd | Fremdversicherungen | −180 €/mtl. |
| sparplan | Sparplan | −500 €/mtl. |
| konsum | Konsum | −800 €/mtl. |
| mobilitaet | Mobilität | −250 €/mtl. |
| haus | Haus/Nebenkosten | −300 €/mtl. |
| abos | Abos | −45 €/mtl. |
| kinder | Kinder | −200 €/mtl. |
| tierbedarf | Tierbedarf | −85 €/mtl. |
| tierarzt | Tierarzt | −40 €/mtl. |

**Frei verfügbar:** Einnahmen − Ausgaben (grün wenn positiv, rot wenn negativ)

#### B. Ausgaben-Verteilung (Card, rechte Spalte)

- **Donut-Chart** (260px Höhe)
  - Zentrum: Gesamtausgaben in EUR
  - Farbcodierte Segmente je Kategorie
  - Legende mit Prozentangaben unterhalb

#### C. Kontotransaktionen (Card, volle Breite)

**Header:** "Kontotransaktionen · Open Banking (PSD2/FIDA) · X Transaktionen erkannt"

**Filter-Chips:** "Alle" + je eine Chip pro Transaktionskategorie

**7 Transaktionskategorien (aufklappbar):**

| Kategorie | Farbe | Enthält | Besonderheiten |
|-----------|-------|---------|---------------|
| **Wohnen** | Blau `#93b8e8` | Hypothek, Miete, Nebenkosten | – |
| **Versicherungen** | Grün `#7ecba1` | Eigene (Badge "Betreut", grün) + Fremd (Badge "Fremd", grau) | Unterscheidung eigen/fremd |
| **Kredit & Finanzierung** | Lila `#b8a9e2` | Kredite | Badge "Restschuld offen" (rot) |
| **Lebensmittel & Alltag** | Gold `#f0c78a` | REWE, EDEKA, dm | 🐾 Haustier-Erkennung bei Fressnapf |
| **Mobilität** | Rot `#f0a0a0` | Tankstelle, ADAC, Parkhaus | – |
| **Sparen & Investment** | Grün `#10b981` | Sparpläne | Badge "Bekannt" (grün) |
| **Freizeit & Hobbies** | Cyan `#8fd4e6` | Netflix, Spotify, Restaurants | Risikosport-Erkennung (Badge amber) |

**Jede Transaktion zeigt:**
- Name (Empfänger) | Badge (wenn vorhanden) | Wiederkehrend-Symbol (↻)
- Datum | Betrag in EUR
- Insight-Zeile (wenn vorhanden, amber Hintergrund)

#### D. KI-Erkenntnisse aus Kontoumsätzen (Card)

| Erkenntnis | Icon | Priorität | Potenzial |
|------------|------|----------|----------|
| Haustier erkannt | 🐾 | mittel | 120–250 €/Jahr |
| Risikosport erkannt | ⚠️ | hoch | Risikominimierung |
| Fremdversicherung erkannt | 🔍 | mittel | Bestandskonsolidierung |
| Freie Liquidität erkannt | 💰 | niedrig | Empfohlene Sparrate |

---

### 6. Kommunikation (Versicherung)

**Komponente:** `KommunikationTab.jsx`

#### Filter-Buttons

| Filter | Beschreibung |
|--------|-------------|
| Alle | Zeigt alle Kommunikationseinträge |
| E-Mail | Nur E-Mail-Korrespondenz |
| Telefon | Nur Telefonate |
| Termin | Nur Termine/Meetings |
| Chatbot | Nur Chatbot-Interaktionen |

#### Kommunikations-Timeline

Vertikale Timeline mit verbindenden Linien zwischen Einträgen.

**Jeder Eintrag zeigt:**

| Feld | Beschreibung |
|------|-------------|
| Icon | Typ-basiert: ✉️ Mail, 📞 Phone, 📅 Calendar, 💬 MessageCircle |
| Icon-Farbe | Blau (eingehend) / Grau (ausgehend) |
| Richtungspfeil | ↙ Blau (eingehend) / ↗ Grau (ausgehend) |
| Betreff | Betreffzeile der Kommunikation |
| Meta-Zeile | Datum · Typ · Richtung (z. B. "15.02.2026 · E-Mail · eingehend") |
| Zusammenfassung | Freitext-Zusammenfassung des Inhalts |

---

## Banking – Reiter im Detail

### 1. Stammdaten (Banking)

**Komponente:** `StammdatenDetailTab.jsx` (identisch mit Versicherung)

Die Stammdaten-Ansicht ist strukturell identisch mit der Versicherungsansicht. Unterschiede:

- **Eigene Produkte** zeigen Banking-typische Produkte:
  - Girokonto, Sparkonto, Baufinanzierung, Visa-Karte, Bausparvertrag
  - Sparten: `konto` (blau), `kredit` (lila), `anlage` (grün), `karte` (orange)
  - Zusätzliche **Volumen-Spalte** für Kredit-/Anlagevolumen

- **Fremdprodukte** zeigen externe Finanzprodukte:
  - Depot (Trade Republic, ING), Tagesgeld, Lebensversicherung
  - Institute: Trade Republic, ING, Deutsche Bank, HUK, Allianz

**Alle anderen Felder sind identisch:** Persönliche Daten, Finanzübersicht, KPIs.

---

### 2. Produkte

**Komponente:** `VertraegeTab.jsx` (gleiche Komponente wie Verträge)

Identische Struktur, aber mit Banking-spezifischen Labels:

| Versicherung | Banking |
|-------------|---------|
| Prämie/J. | **Jahreskosten** |
| Gesamtprämie/J. | **Gesamtkosten/J.** |
| Verträge | **Produkte** |

#### Zusätzliche Spalte im Banking-Modus

| Spalte | Beschreibung | Beispiel |
|--------|-------------|---------|
| **Volumen** | Kredit-/Anlagevolumen (rechtsbündig, EUR) | 285.000 € |

#### Produktzusammenfassung (3-Spalten-Grid)

| KPI | Beschreibung |
|-----|-------------|
| **Gesamtkosten/J.** | Summe aller Jahreskosten |
| **Anzahl Produkte** | Gesamtzahl Banking-Produkte |
| **Optimierbar** | Produkte mit Status `optimierbar` |

---

### 3. Open Finance (Banking)

**Komponente:** `OpenFinanceTab.jsx` (identisch mit Versicherung)

Gleiche Struktur wie Versicherung. Typische Banking-Fremdprodukte:

| Typ | Institut | Beispiel-Details |
|-----|----------|-----------------|
| Depot | Trade Republic | ETF-Sparplan, 450 €/mtl. |
| Depot privat | ING | Aktien + Fonds |
| Tagesgeld | ING | 2,1% Zinssatz |
| Baufinanzierung | Deutsche Bank | 1,8% Zins, Zinsbindung bis 04/2026 |
| Lebensversicherung | Allianz | Kapital-LV, Ablauf 2038 |

---

### 4. Impulse (Banking)

**Komponente:** `ImpulseTab.jsx` (identisch mit Versicherung)

Gleiche Komponentenstruktur. Banking-spezifische Impulse:

#### Typische Banking-Potenziale

| Potenzial | Typ | Priorität | Beispiel-Volumen |
|-----------|-----|----------|-----------------|
| Anschlussfinanzierung KRITISCH | anpassung | kritisch | 285.000 € (einmalig) |
| Depot-Konsolidierung | konsolidierung | hoch | 12.000 €/J. |
| BSV Zuteilung verwenden | anpassung | mittel | 45.000 € (einmalig) |
| KFZ + Haftpflicht Bündel | cross_sell | mittel | 380 €/J. |
| Tagesgeld konsolidieren | konsolidierung | niedrig | – |
| BU-Wechsel | anpassung | hoch | 1.200 €/J. |
| FinanzPlan Familie | beratung | mittel | – |

#### Herleitung-Beispiel (Banking)

Für "Anschlussfinanzierung KRITISCH":

| Label | Wert |
|-------|------|
| Datenquelle | Open Finance (PSD2/FIDA) |
| Restschuld | 285.000 € |
| Aktueller Zins | 1,8% (2016 abgeschlossen) |
| Zinsbindungsende | 04/2026 |
| Aktuelles Zinsniveau | 3,4% (10J) |
| Forward-Aufschlag | +0,15% |
| Empfehlung | Forward-Darlehen 3,55%, 15J Zinsbindung |

---

### 5. Finanzprofil (Banking)

**Komponente:** `FinanzprofilTab.jsx` (identisch mit Versicherung)

Gleiche Struktur. Banking-typische Transaktionsmuster:

- Stärkerer Fokus auf Kredit- und Finanzierungstransaktionen
- Sparplan-Transaktionen mit Depot-Bezug
- Gleiche KI-Erkenntnisse (Haustier, Risikosport, Fremdversicherung, Liquidität)

---

### 6. Kommunikation (Banking)

**Komponente:** `KommunikationTab.jsx` (identisch mit Versicherung)

Gleiche Struktur. Banking-typische Kommunikationsinhalte:

| Beispiel | Typ | Richtung |
|----------|-----|----------|
| Anschlussfinanzierung | Termin | ausgehend |
| Depot-Konsolidierung | E-Mail | eingehend |
| BSV Zuteilungsreife | Telefon | ausgehend |
| Chatbot-Anfrage Kontostand | Chatbot | eingehend |

---

## Datenstruktur & Quellen

### Kundendaten-Schema (alle Modi)

```javascript
{
  // Identifikation
  name: String,              // "Peter Schmidt"
  id: String,                // "KD00001" / "BK00001"
  alter: Number,             // 42

  // Persönlich
  beruf: String,             // "Maschinenbauingenieur"
  arbeitgeber: {
    name: String,            // "Siemens AG"
    bestaetigt: Boolean      // LinkedIn-Verifizierung
  },
  familienstand: String,     // "verheiratet"
  partner: {
    name: String,
    beruf: String,
    einkommen: Number
  },
  kinder: [{ name: String, alter: Number }],

  // Wohnen
  wohnsituation: String,     // "Eigenheim" / "Miete"
  wohnflaeche: Number,       // m²

  // Finanziell
  nettoeinkommen: Number,    // monatlich in EUR

  // Scoring
  nps: Number,               // 0-10
  risikoscore: String,       // z.B. "mittel"
  potentialScore: Number,    // 0-5
  abwanderungsrisiko: String,// "niedrig" / "mittel" / "hoch"

  // LinkedIn
  linkedin: {
    kontakte: Number,
    aktivitaet: String,
    branchen: [String]
  },

  // Haustiere (FIDA-erkannt)
  tiere: [{
    typ: String,             // "Hund" / "Katze"
    rasse: String,           // "Golden Retriever"
    name: String,            // "Bello"
    quelle: String,          // "FIDA"
    umsaetze: [{
      empfaenger: String,    // "Fressnapf"
      betrag: Number,
      turnus: String         // "monatlich"
    }]
  }],

  // Produkte
  eigeneProdukte: [{
    typ: String,             // "bu", "kfz", "girokonto"
    sparte: String,          // "leben", "schaden", "konto"
    produkt: String,         // "ERGO BU Premium"
    details: String,         // "2.000€/mtl. bis 67"
    praemie: Number,         // Jahresprämie/-kosten
    seit: String,            // "2019"
    status: String,          // "aktiv" / "optimierbar"
    volumen: Number          // nur Banking: Kredit-/Anlagevolumen
  }],

  fremdProdukte: [{
    typ: String,             // "depot", "baufinanzierung"
    institut: String,        // "Trade Republic"
    details: String,         // "ETF-Sparplan 450€/mtl."
    volumen: Number,         // EUR
    consent: Boolean         // FIDA-Consent erteilt?
  }],

  // Transaktionen (Open Banking)
  transaktionen: [{
    kategorie: String,       // "gehalt", "baufi", "konsum", ...
    betrag: Number,          // positiv = Einnahme, negativ = Ausgabe
    empfaenger: String       // Transaktionspartner
  }],

  // Absicherungsstatus
  absicherung: {
    vorhanden: [String],     // ["bu", "kfz", "hausrat"]
    fehlend: [String]        // ["pflege", "unfall"]
  },

  // Potenziale (KI-generiert)
  potentiale: [{
    titel: String,
    typ: String,             // "whitespot" | "anpassung" | "cross_sell" |
                             // "konsolidierung" | "nextgen" | "beratung"
    quellen: [String],       // ["bestand", "finanztransaktion", ...]
    prioritaet: String,      // "kritisch" | "hoch" | "mittel" | "niedrig"
    volumen: Number,
    volumenTyp: String,      // "jaehrlich" | "einmalig" | "vermittlung"
    beschreibung: String,
    empfohleneAktion: String,// "termin" | "angebot" | "tarifvergleich"
    produktEmpfehlung: String,
    status: String,
    herleitung: [{ label: String, value: String }],
    deckungsluecke: {
      gehalt: Number,
      aktuelleAbsicherung: Number,
      empfohleneAbsicherung: Number,
      einheit: String,
      gehaltLabel: String,
      absicherungLabel: String
    },
    vergleich: {
      titel: String,
      spalten: [String],
      zeilen: [{
        merkmal: String,
        aktuell: String,
        angebot: String,
        highlight: Boolean
      }]
    }
  }],

  // Kommunikation
  kommunikation: [{
    datum: String,           // "2026-03-01"
    typ: String,             // "email" | "telefon" | "termin" | "chatbot"
    richtung: String,        // "eingehend" | "ausgehend"
    betreff: String,         // Betreffzeile
    zusammenfassung: String  // Inhaltszusammenfassung
  }]
}
```

### Datenquellen-Badges (Quellen der Impulse)

| Quelle | Badge-Label | Beschreibung |
|--------|-----------|-------------|
| `bestand` | Bestandsanalyse | Analyse der eigenen Produkte |
| `finanztransaktion` | Open Finance/FIDA | Kontotransaktionen via PSD2/FIDA |
| `lebensereignis` | Lebensereignis | Erkannte Lebensereignisse (Geburt, Umzug, etc.) |
| `wettbewerb` | Wettbewerbsanalyse | Markt- und Wettbewerbsdaten |
| `kommunikation` | Kommunikationsanalyse | Auswertung der Kundenkommunikation |
| `markt` | Marktdaten | Aktuelle Marktkonditionen |

### Musterkunden

**Versicherung (ERGO):**

| ID | Name | Profil |
|----|------|--------|
| KD00001 | Peter Schmidt | Familie, 2 Kinder, Hund, kompletter Bestand |
| KD00002 | Amira König | Young Professional, Single, Katze |
| KD00005 | Klaus Meier | Beamter A14, 3 Kinder, Hund |
| KD00006 | Lisa Bauer | Freelancerin, Single |
| KD00007 | Michael Braun | Lehrer im Ruhestand, Katze |

**Banking (Volksbank Mittelhessen):**

| ID | Name | Profil |
|----|------|--------|
| BK00001 | Klaus Fischer | Familie, Baufinanzierung, Depot |
| BK00002 | Sandra Müller | Angestellte, Sparerin |
| BK00003 | Peter Hoffmann | Selbstständig, mehrere Konten |
| BK00004 | Andrea Lang | Beamtin, konservative Anlegerin |
| BK00005 | Markus Wagner | Gutverdiener, aktiver Investor |
| BK00006 | Julia Becker | Berufseinsteigerin |

---

## Berechnete KPIs

| KPI | Formel | Verwendung |
|-----|--------|-----------|
| Haushaltsnetto | `nettoeinkommen + partner.einkommen + (kinder.length × 250)` | Stammdaten, Finanzprofil |
| Absicherungsquote | `(Versicherungsausgaben ÷ Haushaltsnetto) × 100` | Stammdaten |
| Sparquote | `(Sparausgaben ÷ Haushaltsnetto) × 100` | Stammdaten |
| Frei verfügbar | `Haushaltsnetto − Gesamtausgaben` | Stammdaten, Finanzprofil |
| CLV | `Σ eigeneProdukte.praemie × 10` | Stammdaten |
| Potenzial-Sterne | `potentialScore` → 0–5 ★ | Stammdaten |
| Gesamtprämie/-kosten | `Σ eigeneProdukte.praemie` | Verträge/Produkte |
| Optimierbar-Anzahl | `count(status === 'optimierbar')` | Verträge/Produkte |
| Consent-Quote | `count(consent === true) ÷ fremdProdukte.length` | Open Finance |

---

## Datei-Referenz

| Datei | Beschreibung |
|-------|-------------|
| `src/pages/detail/DetailPage.jsx` | Tab-Routing und -Rendering |
| `src/pages/detail/tabs/StammdatenDetailTab.jsx` | Stammdaten-Komponente |
| `src/pages/detail/tabs/VertraegeTab.jsx` | Verträge/Produkte-Komponente |
| `src/pages/detail/tabs/OpenFinanceTab.jsx` | Open Finance-Komponente |
| `src/pages/detail/tabs/ImpulseTab.jsx` | Impulse-Komponente |
| `src/pages/detail/tabs/FinanzprofilTab.jsx` | Finanzprofil-Komponente |
| `src/pages/detail/tabs/KommunikationTab.jsx` | Kommunikation-Komponente |
| `src/data/modeConfig.js` | Modus-Konfiguration & Tab-Definitionen |
| `src/data/versicherung-v1-v4.js` | Versicherungs-Kundendaten (V1–V4) |
| `src/data/versicherung-v5-v8.js` | Versicherungs-Kundendaten (V5–V8) |
| `src/data/banking.js` | Banking-Kundendaten (B1–B6) |
| `src/utils/formatters.js` | Formatierungsfunktionen (EUR, Datum) |
| `src/components/charts/DonutChart.jsx` | Donut-Chart-Komponente |
| `src/components/ui/Badge.jsx` | Badge-Komponenten |
