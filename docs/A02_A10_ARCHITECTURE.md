# Architektur-Dokumentation: A-02 Agenturansicht & A-10 Kundendetail

> Technische Referenz fuer KI-Agenten und Entwickler.
> Beschreibt Datenfluss, Funktionen, HTML-Struktur und Interaktionen.

---

## Inhaltsverzeichnis

1. [A-02 Agenturansicht (Vermittler-Overview)](#a-02-agenturansicht)
2. [A-10 Kundendetail (Customer Detail)](#a-10-kundendetail)
3. [Navigation zwischen den Seiten](#navigation-zwischen-den-seiten)
4. [Datenfluss-Diagramm](#datenfluss-diagramm)

---

## A-02 Agenturansicht

**Page ID:** `A-02`
**Datei-Referenzen:**
- HTML: `index.html` (Zeilen 393-2663, Container `#agenturOverview`)
- JS Hauptlogik: `js/agentur-overview.js` (1182 Zeilen)
- JS Navigation: `js/landing.js` (Funktion `openAgenturView`, Zeilen 2018-2046)
- JS Daten: `js/data.js` (Funktionen `getAgenturen()`, `getAgenturData()`, Zeilen 171-246)

### Zweck

Die Agenturansicht ist das Cockpit eines einzelnen Versicherungsvermittlers. Sie zeigt alle relevanten KPIs, Vertriebspotenziale, Aufgaben und Kundendaten eines Vermittlers auf einer Seite mit 8 Tabs.

### Wie die Seite geoeffnet wird

**Einstiegspunkt:** Button "Agenturansicht" auf der Landing Page (nur im Modus "Vertrieb").

```
Ablauf:
1. User klickt "Agenturansicht" auf M-01 (Landing Page)
2. openAgenturView() wird aufgerufen (landing.js:2018)
3. Prueft ob CSV-Daten geladen sind (window.dailyRawData)
4. Falls ja: getAgenturen() liefert Liste aller Vermittler
5. Erster Vermittler wird ausgewaehlt
6. showAgenturOverview(vermittlerId) wird aufgerufen (agentur-overview.js:18)
7. Alle anderen Seiten werden versteckt
8. #agenturOverview wird sichtbar (display: block)
9. Chat-Widget wird automatisch geoeffnet
10. loadAgenturData(vermittlerId) fuellt alle Felder
```

**Funktion `showAgenturOverview(vermittlerId)`** (agentur-overview.js:18-56):
- Versteckt: `landingPage`, `mainApp`, `billingCheckPage`, `potentialAnalysePage`, `kundenDetailPage`
- Zeigt: `agenturOverview`
- Oeffnet: Agentur-Chat-Widget automatisch
- Versteckt: Chat-Toggle-Button
- Ruft auf: `loadAgenturData(vermittlerId)`
- Dispatcht Event: `viewChanged` mit `{ view: 'agentursicht' }`

### Datenfluss

```
CSV-Upload durch User
       |
       v
window.dailyRawData (globale Variable, Array mit Tagesdaten)
       |
       v
state.filters (Jahr, Silo, Segmente, Produkte)
       |
       v
getAgenturen() --> Array von {id: 'VM00001', name: 'Max Mustermann'}
       |
       v
getAgenturData(vermittlerId) --> aggregiertes Datenobjekt
       |
       v
fillCockpitKPIs()     -- 4 grosse KPI-Karten
fillStammdaten()      -- 21 Stammdaten-Felder
fillNeugeschaeftTab() -- 6 KPI-Karten + Spartenverteilung
fillBestandTab()      -- 5 KPI-Karten
fillStornoTab()       -- 3 KPI-Karten + Storno-Gruende
fillProvisionTab()    -- 4 KPI-Karten
fillQualitaetTab()    -- 6 KPI-Karten
```

**Datenquelle `getAgenturData(agenturId)`** (data.js:202-247):
```
Input:  agenturId (z.B. 'VM00001')
Source: dailyRawData (CSV-Daten)

Verarbeitung:
1. Filtern nach vermittler_id == agenturId
2. Jahr-Filter anwenden (state.filters.year)
3. Silo-Filter anwenden (state.filters.silo)
4. Segment-Filter anwenden (state.filters.segments)
5. Produkt-Filter anwenden (state.filters.products)
6. Tagesdaten zu Monatsdaten aggregieren (aggregateDailyToMonthly)
7. KPIs ueber alle Monate summieren
8. Prozent-KPIs (Storno, NPS etc.) als Durchschnitt berechnen

Output: {
    agentur: 'VM00001',
    agentur_name: 'Max Mustermann',
    neugeschaeft: 1234567,    // EUR
    bestand: 9876543,         // EUR
    storno: 8.5,              // Prozent
    bundesland: 'Bayern',
    silo: 'Ausschliesslichkeit',
    nps: 42,
    underwriting: 86,
    deckungsbeitrag: 7500,
    ergebnis: 12000,
    ...
}
```

### HTML-Struktur

```
#agenturOverview
  .agentur-page-new
    .agentur-header-new
      .back-button              --> backFromAgentur()
      .agentur-photo-small      --> Klickbar fuer Foto-Upload
      #agenturPageTitle          --> Vermittler-Name (h1)
      .agentur-subtitle          --> Vermittler-ID + Status

    .cockpit-kpis               --> 4 grosse KPI-Karten
      Karte 1: Gesamtbestand    --> #cockpitBestand, #cockpitBestandTrend
      Karte 2: Neugeschaeft YTD --> #cockpitNeugeschaeft, #cockpitNeugeschaeftTrend
      Karte 3: Storno-Quote     --> #cockpitStorno, #cockpitStornoTrend
      Karte 4: Zielerfullung    --> #cockpitZiel, #cockpitZielGauge

    .agentur-main-content
      .agentur-tabs             --> 8 Tabs (onclick: showAgenturTab)
        Tab: Uebersicht (Standard aktiv)
        Tab: Stammdaten
        Tab: Neugeschaeft
        Tab: Bestand
        Tab: Storno
        Tab: Verguetung
        Tab: Qualitaet
        Tab: Potentiale

      Tab-Inhalte:
        #tab-uebersicht
          .agentur-uebersicht-grid (2 Spalten)
            Links:
              - Vertriebskennzahlen (Woche/Monat Toggle)
              - Vertriebspotentiale (11 aufklappbare Items)
              - Aktuelle Aufgaben (3 Tasks)
              - Letzte Abschluesse (4 Eintraege)
            Rechts (Sidebar):
              - Anstehende Termine (4 Eintraege)
              - Schnellzugriff Formulare (4 Buttons)
              - Provisionsabrechnungen (3 Eintraege)

        #tab-stammdaten    --> 21 Felder in 4 Sektionen
        #tab-neugeschaeft  --> 6 KPI-Karten + Spartenverteilung-Balken
        #tab-bestand       --> 5 KPI-Karten
        #tab-storno        --> 3 KPI-Karten + Storno-Gruende-Liste
        #tab-provision     --> 4 KPI-Karten
        #tab-qualitaet     --> 6 KPI-Karten
        #tab-potential     --> FIDA-Tabelle + Potentiale-Liste

#agenturChatToggle              --> Schwebendes Chat-Icon (fixiert)
#agenturChatWidget              --> Chat-Fenster (fixiert)
  .agentur-chat-header          --> "Vertriebs-Assistent"
  #agenturChatBody              --> Chat-Nachrichten
  .agentur-chat-input-area      --> Textarea + Senden-Button
```

### Tab-Inhalte im Detail

| Tab | Inhalte | Datenfunktion |
|-----|---------|---------------|
| Uebersicht | Vertriebskennzahlen, Potentiale, Aufgaben, Abschluesse, Termine | Statisch + dynamisch |
| Stammdaten | Name, Adresse, Tel, E-Mail, IHK, Agenturstufe (21 Felder) | `fillStammdaten()` |
| Neugeschaeft | Antraege, Policiertes NG, APE, Abschlussquote, Avg. Beitrag, Cross-Selling + Spartenverteilung (Leben/Kranken/Schaden/Kfz) | `fillNeugeschaeftTab()` |
| Bestand | GWP, Vertraege, Wachstum, Kunden, Vertragsdichte | `fillBestandTab()` |
| Storno | Fruehstorno, Spaetstorno, Netto-Entwicklung + Storno-Gruende | `fillStornoTab()` |
| Verguetung | Provisionsanspruch, Haftung, Bonus, Deckungsbeitrag | `fillProvisionTab()` |
| Qualitaet | NPS, Beschwerden, IDD-Konformitaet, Weiterbildung, Doku-Quote, Underwriting | `fillQualitaetTab()` |
| Potentiale | FIDA-Faelle (filterbar), Vertriebspotentiale-Liste | Statisch im HTML |

### User-Interaktionen

| Interaktion | Funktion | Beschreibung |
|-------------|----------|-------------|
| Zurueck-Button | `backFromAgentur()` | Zurueck zur Landing Page |
| Tab wechseln | `showAgenturTab(tabName)` | 8 Tabs verfuegbar |
| Foto hochladen | `triggerAgenturPhotoUpload()` | Speichert in localStorage |
| Zeitraum Woche/Monat | `toggleVertriebsPeriod(period)` | Vertriebskennzahlen umschalten |
| FIDA-Filter | `filterFidaCases(status)` | alle/neu/angeschrieben/termin/abgeschlossen |
| Potential aufklappen | `togglePotentialDetails(item)` | Details ein-/ausblenden |
| Weitere Potentiale | `toggleWeiterePotentiale()` | 10 weitere Items zeigen |
| Formular oeffnen | `openFormular(formularId)` | Demo: Alert anzeigen |
| Abrechnung oeffnen | `openAbrechnung(period)` | Demo: Alert anzeigen |
| Kunde oeffnen | `openKundenDetail(name, id)` | Navigiert zu A-10 |

### Chat-Integration (Vertriebs-Assistent)

**Verhalten:**
- Chat oeffnet sich automatisch beim Betreten von A-02
- Toggle-Button wird versteckt (Chat ist direkt sichtbar)
- Chat wird geschlossen beim Verlassen der Seite

**Chat-Funktionen:**

| Funktion | Datei:Zeile | Beschreibung |
|----------|-------------|-------------|
| `toggleAgenturChat()` | agentur-overview.js:899 | Widget ein-/ausblenden |
| `sendAgenturChat()` | agentur-overview.js:654 | Nachricht senden |
| `askAgenturQuestion(q)` | agentur-overview.js:690 | Vorgefertigte Frage stellen |
| `getAgenturChatResponse(q)` | agentur-overview.js:701 | Pattern-Matching Antwort |
| `openKundenDetailFromChat(id, tab, type)` | agentur-overview.js:822 | Aus Chat zu Kundendetail |
| `highlightContractRow(type)` | agentur-overview.js:859 | Vertrag in Tabelle hervorheben |
| `showNeuePotentiale()` | agentur-overview.js:943 | Animierte Potentiale laden |
| `goToSalesReport()` | agentur-overview.js:1093 | Zum Vertriebsbericht navigieren |

**Unterstuetzte Fragen (Pattern-Matching):**

| Stichwort | Antwort |
|-----------|---------|
| ablaufend / 30 tag / vertrag lauf | Ablaufende Vertraege (1 eigene, 2 Wettbewerber) |
| cross-selling / lebensversicherung / potential | LV Cross-Selling Potentiale |
| fida | Offene FIDA-Anfragen |
| abschlussquote / vergleich / quote | Abschlussquote im Vergleich |
| (sonstiges) | Follow-up-Vorschlaege |

**Follow-up-Buttons (immer sichtbar):**
1. "Welche Vertraege laufen bald aus?"
2. "Wer hat Cross-Selling-Potential?"
3. "Neue Potentiale?" --> `showNeuePotentiale()`
4. "Vertriebsbericht" --> `goToSalesReport()`

**Smart Navigation aus dem Chat:**
- Chat-Antworten enthalten klickbare Kunden-Buttons
- Button-Klick oeffnet A-10 (Kundendetail) mit spezifischem Tab und Vertrags-Highlighting
- Beispiel: "Peter Schmidt" -> oeffnet A-10 -> Tab "Vertraege" -> Kfz-Vertrag wird hervorgehoben

---

## A-10 Kundendetail

**Page ID:** `A-10`
**Datei-Referenzen:**
- HTML: `index.html` (Zeilen 2714-4600+, Container `#kundenDetailPage`)
- JS Hauptlogik: `js/landing.js` (Funktionen ab Zeile 3774)
- CSS: `css/styles.css` + `css/finanzplanung.css`

### Zweck

Die Kundendetailansicht ist eine 360-Grad-Sicht auf einen einzelnen Kunden. Sie zeigt Stammdaten, Vertraege, Open-Finance-Daten (FIDA), Vertriebsimpulse, Finanzplanung und Kommunikationshistorie in 6 Tabs.

### Wie die Seite geoeffnet wird

**Einstiegspunkte:**
1. Aus A-02 (Agenturansicht): Klick auf Kunden in "Letzte Abschluesse" oder Potentiale
2. Aus A-05 (Potentialanalyse): Klick auf Impulse-Karten
3. Aus dem Chat (A-02): Klick auf Kunden-Button in Chat-Antwort

**Funktion `openKundenDetail(kundenName, vermittlerId)`** (landing.js:3774-3836):

```
Ablauf:
1. currentKundenVermittlerId = vermittlerId || 'VM00001'
2. Prueft ob FIDA in Potentialanalyse aktiv war (fidaActiveInPotentialAnalyse)
3. Bestimmt Herkunftsseite:
   - agenturOverview sichtbar? --> previousViewBeforeKundenDetail = 'agentursicht'
   - sonst --> previousViewBeforeKundenDetail = 'potentialanalyse'
4. Versteckt: landingPage, mainApp, potentialAnalysePage, agenturOverview
5. Zeigt: kundenDetailPage (display: block)
6. Setzt CSS-Klasse: makler-view oder ao-view
7. Ruft fillKundenDetail(kundenName, vermittlerId)
8. Ruft initKundenFidaState()
9. Dispatcht Event: viewChanged { module: 'versicherung', view: 'kundendetail' }
```

### Datenfluss

```
openKundenDetail('Peter Schmidt', 'KD00001')
       |
       v
fillKundenDetail(kundenName, vermittlerId) (landing.js:3989)
       |
       v
mockKunden[kundenName] --> Kundendaten-Objekt
       |                   (Fallback: 'Peter Schmidt' wenn nicht gefunden)
       v
DOM-Elemente werden befuellt:
  - Stammdaten (Name, Adresse, Beruf etc.)
  - Vertraege-Tabelle
  - FIDA/Open-Finance-Daten
  - Impulse
  - CLV-Berechnung
  - Finanzplanung
  - Kommunikationshistorie
```

**Demo-Daten: `mockKunden` Objekt** (landing.js:3998-4193):

11 vorgefertigte Kunden:
1. Peter Schmidt
2. Sabine Koenig
3. Thomas Weber
4. Anna Hoffmann
5. Michael Braun
6. Lisa Mueller
7. Klaus Meier
8. Matthias Engel
9. Christian Bauer
10. Martin Wolf
11. Eva Hartmann

**Datenstruktur pro Kunde:**
```
{
    geburtsdatum: '15.03.1978',
    adresse: 'Musterstr. 12, 40215 Duesseldorf',
    telefon: '+49 211 ...',
    email: 'peter.schmidt@...',
    beruf: 'Diplom-Ingenieur',
    familienstand: 'verheiratet',
    kinder: [
        { name: 'Lena', alter: 12 },
        { name: 'Paul', alter: 8 }
    ],
    vertraege: [
        {
            typ: 'BU-Versicherung',
            versicherer: 'ERGO',
            details: 'BU-Rente 1.500 EUR/Monat, Laufzeit bis 67',
            praemie: '89,90 EUR/Monat',
            beginn: '01.03.2019',
            status: 'aktiv'
        },
        // ... weitere Vertraege
    ],
    fidaVertraege: [
        {
            anbieter: 'Allianz',
            typ: 'Kfz-Haftpflicht + Teilkasko',
            info: 'VW Golf, SF-Klasse 12'
        },
        // ... weitere externe Vertraege
    ]
}
```

### HTML-Struktur

```
#kundenDetailPage
  .kunden-header
    .back-button                    --> closeKundenDetail()
    .kunden-page-title              --> "Kundendetails"
    .vermittler-toggle-container    --> Makler/AO Umschalter
      toggle-option[data-mode="makler"]
      toggle-option[data-mode="ao"]

  .kunden-tabs                     --> 6 Tabs
    Tab: Stammdaten (Standard aktiv)
    Tab: Betreute Vertraege
    Tab: Open Finance (FIDA)
    Tab: Impulse
    Tab: Finanzplanung
    Tab: Kommunikation

  .kunden-content                  --> Tab-Inhalte
    #tabStammdaten
      Kundenprofil (Name, Foto, CLV-Badge)
      Basis-Daten (Geburtsdatum, Adresse, Telefon, E-Mail, Beruf, Familie)
      CLV-Detail-Karte (aufklappbar)

    #tabVertraege
      Vertraege-Tabelle (#kundenVertraege)
        Spalten: Typ | Versicherer* | Details | Praemie | Beginn | Status
        (* Versicherer-Spalte nur im Makler-Modus sichtbar)

    #tabFida
      Consent-Status-Karte (Aktiv/Inaktiv)
      Externe Verbindungen-Tabelle
      4 Bedarfsfelder:
        1. Bezahlen: Gehalt, Ausgaben, freies Einkommen
        2. Sparen & Vorsorgen: Tagesgeld, Festgeld, Depot, Fonds
        3. Absichern: Wettbewerber-Versicherungen
        4. Finanzieren: Kredite, Hypotheken

    #tabImpulse
      3 Kategorien:
        1. Whitespots (Neugeschaeft): Fehlende Produkte
        2. Anpassungsbedarfe (Aenderungsgeschaeft): Deckungsluecken
        3. Optimierungsgeschaeft: Bessere Konditionen
      Jeder Impuls: Icon + Titel + Quelle-Badge + Prioritaet + aufklappbare Details

    #tabFinanzplanung
      Liquiditaets-Dashboard
      Rentenluecken-Analyse
      Interaktiver Renten-Simulator (3 Slider)
      Produktempfehlung
      Szenario-Vergleichs-Chart (Canvas)
      Vertriebsimpuls aus Liquiditaetsanalyse

    #tabKommunikation
      Timeline mit: E-Mails, Angebote, Anrufe, Termine
      Status-Tracking: Gesendet, Geoeffnet, Geklickt, Beantwortet
```

### Tab-Inhalte im Detail

#### Tab 1: Stammdaten

**Kundenprofil-Kopf:**
- Name, Vermittler-ID
- Klickbares Profilfoto (Upload moeglich)
- CLV-Badge im Header: Wert + Segment + Trend

**Basis-Informationen (7 Felder):**
| Feld | Element-ID | Beispiel |
|------|-----------|---------|
| Geburtsdatum | `#kundenGeburtsdatum` | 15.03.1978 |
| Adresse | `#kundenAdresse` | Musterstr. 12, 40215 Duesseldorf |
| Telefon | `#kundenTelefon` | +49 211 12345678 |
| E-Mail | `#kundenEmail` | peter.schmidt@example.de |
| Beruf | `#kundenBeruf` | Diplom-Ingenieur |
| Familienstand | `#kundenFamilienstand` | verheiratet |
| Kinder | `#kundenKinder` | Lena (12), Paul (8) |

**CLV-Detail-Karte (aufklappbar):**
- Gesamt-CLV mit Vorjahrestrend
- Kundensegment (Premium/Wachstum/Entwicklung)
- Prognostizierte Haltedauer
- Stornorisiko in Prozent
- Detaillierte Herleitung (Bestandswert + Cross-Selling + Empfehlungswert - Stornoabzug)

#### Tab 2: Betreute Vertraege

Tabelle mit allen Vertraegen des Kunden:

| Spalte | Beschreibung | Sichtbarkeit |
|--------|-------------|-------------|
| Typ | Art der Versicherung | Immer |
| Versicherer | Name des Versicherers | Nur Makler-Modus |
| Details | Deckung, Leistungen | Immer |
| Praemie | Monatsbeitrag | Immer |
| Beginn | Vertragsbeginn | Immer |
| Status | aktiv/gekuendigt (Badge) | Immer |

#### Tab 3: Open Finance (FIDA)

**Bedingte Anzeige:** FIDA-Daten nur sichtbar wenn `fidaActiveInPotentialAnalyse === true`

**4 Bedarfsfelder:**

| Bedarfsfeld | Inhalte |
|-------------|---------|
| Bezahlen | Netto-Gehalt (fix + variabel), Arbeitgeber, monatliche Ausgaben (fix + variabel), freies Einkommen, Sparquote |
| Sparen & Vorsorgen | Tagesgeld-Konten, Festgeld, Fonds-Depot (DWS, iShares etc.), Depot-Volumen, Sparrate, YTD-Performance |
| Absichern | Wettbewerber-Policen (Allianz, HUK24, ARAG etc.), Typ, Praemie, Laufzeit |
| Finanzieren | Hypotheken, Kredite, Darlehensgeber, Betrag, Monatsrate, Restlaufzeit, Zinssatz |

**Makler/AO-Modus Auswirkung:**
- AO-Modus: ERGO-Eintraege werden aus Wettbewerber-Tabelle ausgeblendet
- Makler-Modus: Alle Versicherer sichtbar (vollstaendiger Vergleich)

#### Tab 4: Impulse

3 Kategorien von Vertriebsimpulsen:

| Kategorie | Beschreibung | Beispiel |
|-----------|-------------|---------|
| Whitespots | Fehlende Produkte | Risikolebensversicherung fehlt trotz Hypothek |
| Anpassungsbedarfe | Deckungsluecken | BU deckt nur 41% des Einkommens |
| Optimierungsgeschaeft | Bessere Konditionen | Kfz-Wechsel spart 180 EUR/Jahr |

**Jeder Impuls enthält:**
- Icon + Titel + Beschreibung
- Datenquelle-Badge (PSD2 / Open Finance / Eigene Daten)
- Prioritaet-Badge (hoch / mittel / niedrig)
- Aufklappbare Details mit:
  - Herleitung (Datenquelle, Situation, Familiensituation)
  - Empfehlung mit Preisangabe
  - Action-Buttons: "Angebot erstellen", "Termin vereinbaren"

#### Tab 5: Finanzplanung

**Interaktiver Renten-Simulator:**
- 3 Slider:
  - Wunsch-Renteneintrittsalter (60-67)
  - Wunsch-Nettoeinkommen (1.500 - 4.000 EUR)
  - Erwartete Rendite p.a. (2% - 8%)
- Echtzeit-Berechnung bei Slider-Aenderung via `updateRentenSimulator()`
- Visuelle Balken: Gesetzliche Rente vs. Rentenluecke vs. Wunscheinkommen
- Ergebnisse: Benoetigtes Kapital, bereits gespart, monatliche Sparrate

**Szenario-Vergleich:**
- Canvas-Chart mit 3 Szenarien (konservativ 3%, moderat 5%, optimistisch 7%)
- 20-Jahre-Projektion
- Endwerte im Diagramm

#### Tab 6: Kommunikation

Timeline aller Interaktionen:

| Typ | Details |
|-----|---------|
| E-Mail | Betreff, Vorschautext, Status (geoeffnet/geklickt) |
| Angebot | Produkt, Datum, Status |
| Anruf | Thema, Dauer, Ergebnis |
| Termin | Ort, Datum, Agenda |

### Customer Lifetime Value (CLV) Berechnung

**Funktion `calculateCLV(vertraege, kundenName)`** (landing.js:4358):

```
Berechnungsformel:

1. Jahres-Deckungsbeitrag = Summe(Vertragspraemie * Deckungsbeitragsrate)
   Deckungsbeitragsraten pro Versicherungstyp:
     BU-Versicherung:    25%
     Risikoleben:         20%
     Wohngebaeude:        15%
     Privathaftpflicht:   18%
     Unfall:              20%
     Rechtsschutz:        15%
     Betriebshaftpflicht: 18%

2. Bestandswert = Jahres-DB * Haltedauer (Jahre)

3. Cross-Selling-DB = Cross-Selling-Jahrespraemie * 0.20 * min(Haltedauer, 5)

4. Empfehlungswert = Anzahl Empfehlungen * 400 EUR

5. Stornoabzug = (Bestandswert + Cross-Selling-DB) * Stornorisiko

6. Gesamt-CLV = Bestandswert + Cross-Selling-DB + Empfehlungswert - Stornoabzug
```

**CLV-Parameter pro Kunde** (`clvKundenParameter`, landing.js:4256):
```
{
    haltedauerJahre:           12,          // Prognostizierte Kundenbindung
    stornoRisiko:              0.08,        // Kuendigungswahrscheinlichkeit (0-1)
    crossSellingJahresPraemie: 1200,        // Jaehrliches Cross-Selling-Potenzial EUR
    crossSellingDetails:       'Risikoleben + Rechtsschutz',
    empfehlungsPotenzial:      3,           // Anzahl erwarteter Weiterempfehlungen
    trendVorjahr:              8.5          // Veraenderung zum Vorjahr in %
}
```

**Segment-Klassifikation:**
| Segment | Bedingung | Farbe |
|---------|-----------|-------|
| Premium | CLV >= 8.000 EUR | Gruen |
| Wachstum | CLV >= 5.000 EUR | Blau |
| Entwicklung | CLV < 5.000 EUR | Orange |

### Makler/AO-Toggle

**Funktion `switchVermittlerMode(mode)`** (landing.js:3865):

| Aspekt | Makler-Modus | AO-Modus |
|--------|-------------|----------|
| Produktempfehlung Label | "Top-Produktvorschlaege (Makler-Vergleich)" | "ERGO Produktempfehlung (Ausschliesslichkeit)" |
| Produktanzeige | Zeigt `#maklerProdukte` | Zeigt `#aoProdukte` |
| Open Finance Tabelle | Alle Versicherer sichtbar | ERGO-Eintraege ausgeblendet |
| Vertraege-Tabelle | Spalte "Versicherer" sichtbar | Spalte "Versicherer" versteckt |
| CSS-Klasse | `.makler-view` | `.ao-view` |

### User-Interaktionen

| Interaktion | Funktion | Beschreibung |
|-------------|----------|-------------|
| Zurueck-Button | `closeKundenDetail()` | Zurueck zur Herkunftsseite (A-02 oder A-05) |
| Tab wechseln | `switchKundenTab(tabName)` | 6 Tabs: stammdaten, vertraege, fida, impulse, finanzplanung, kommunikation |
| Makler/AO Toggle | `switchVermittlerMode(mode)` | Ansicht umschalten |
| Impuls aufklappen | `toggleImpulsDetail(impulsId)` | Details ein-/ausblenden |
| Renten-Simulator | `updateRentenSimulator()` | Echtzeit-Neuberechnung bei Slider-Aenderung |
| Foto hochladen | `triggerProfileUpload('kunde')` | Profilfoto aendern |
| Angebot erstellen | `createAngebot(type)` | Demo-Platzhalter |
| Termin vereinbaren | `scheduleTermin(type)` | Demo-Platzhalter |
| Zum Vertriebsbericht | `goToSalesReportFromKundenDetail()` | Navigiert zu A-03 |

### Zurueck-Navigation

**Funktion `closeKundenDetail()`** (landing.js:3940):

```
1. Versteckt #kundenDetailPage
2. Prueft previousViewBeforeKundenDetail:
   - 'agentursicht' --> Zeigt #agenturOverview, dispatcht viewChanged 'agentursicht'
   - sonst          --> Zeigt #potentialAnalysePage, dispatcht viewChanged 'potentialanalyse'
```

---

## Navigation zwischen den Seiten

```
M-01 Landing Page
  |
  +--> [Agenturansicht]
  |       |
  |       v
  |    A-02 Agenturansicht
  |       |
  |       +--> [Kunde klicken] --> A-10 Kundendetail
  |       |                           |
  |       |                           +--> [Zurueck] --> A-02
  |       |                           +--> [Vertriebsbericht] --> A-03
  |       |
  |       +--> [Chat: Kunde oeffnen] --> A-10 (mit Tab + Highlighting)
  |       +--> [Chat: Vertriebsbericht] --> A-03
  |       +--> [Zurueck] --> M-01
  |
  +--> [Potentialanalyse]
          |
          v
       A-05 Potentialanalyse
          |
          +--> [Kunde klicken] --> A-10 Kundendetail
                                      |
                                      +--> [Zurueck] --> A-05
```

### Globale Variablen fuer Navigation

| Variable | Typ | Beschreibung |
|----------|-----|-------------|
| `currentAgenturIdInOverview` | string | Aktuell angezeigte Agentur-ID |
| `currentKundenVermittlerId` | string | Vermittler-ID des aktuellen Kunden |
| `previousViewBeforeKundenDetail` | string | Herkunftsseite ('agentursicht' oder 'potentialanalyse') |
| `fidaActiveInPotentialAnalyse` | boolean | Ob FIDA/Open Finance aktiviert ist |
| `currentVermittlerMode` | string | Aktueller Modus ('makler' oder 'ao'), Standard: 'ao' |

---

## Datenfluss-Diagramm

```
                    CSV-Datei (26 MB)
                         |
                         v
                  window.dailyRawData
                         |
            +------------+------------+
            |                         |
            v                         v
    getAgenturen()            state.filters
    Array [{id, name}]       {year, silo, segments, products}
            |                         |
            v                         v
    getAgenturData(id) <----- Filter anwenden
            |
            v
    Aggregiertes Daten-Objekt
    {neugeschaeft, bestand, storno, nps, ...}
            |
    +-------+-------+-------+-------+
    |       |       |       |       |
    v       v       v       v       v
  Cockpit  Stamm  Neuge   Bestand  ...
  KPIs     daten  schaeft         (7 weitere
                                   fill-Funktionen)


    openKundenDetail(name, id)
            |
            v
    mockKunden[name]
    {geburtsdatum, adresse, vertraege, fidaVertraege, ...}
            |
    +-------+-------+-------+-------+-------+
    |       |       |       |       |       |
    v       v       v       v       v       v
  Stamm   Vertr   FIDA   Impulse  Finanz  Komm.
  daten   aege           (3 Kat.) planung  hist.
    |
    v
  calculateCLV(vertraege, name)
    |
    v
  renderCLV(clvResult)
  {gesamtCLV, segment, bestandswert, crossSelling, empfehlungswert, stornoAbzug}
```
