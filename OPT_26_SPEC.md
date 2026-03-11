# OPT-26: Persona-Baukasten – Realistische Kundenprofile fuer alle drei Modi
## Wer sind meine Kunden, was haben sie, was fehlt ihnen – und was koennen wir ihnen empfehlen?

> **Stand:** 2026-03-11
> **Bezug:** OPT-17 (Impulse), OPT-19 (Quellen-Clustering), OPT-21 (VV-Modus), Deep Research KI-Vertrieb
> **Scope:** Mock-Daten fuer Versicherung (A-02/A-10), Banking (B-02/B-10), VV (VV-02/VV-10)

---

## Grundprinzip: Jede Persona hat 5 Datenschichten

```
Schicht 1: STAMMDATEN          Wer ist der Kunde?
           Name, Alter, Beruf, Familie, Wohnort, Einkommen, LinkedIn

Schicht 2: EIGENE PRODUKTE     Was hat er/sie BEI UNS?
           Versicherungen / Konten / Mandate mit Praemie/Ertrag

Schicht 3: FREMDPRODUKTE       Was hat er/sie WOANDERS?
           (Open Finance / FIDA sichtbar)
           Konten, Depots, Versicherungen, Kredite bei Dritten

Schicht 4: TRANSAKTIONEN       Was tut er/sie mit seinem Geld?
           Gehalt, Miete, Sparraten, Praemien, Konsum, Muster

Schicht 5: POTENTIALE          Was koennen wir ihm/ihr empfehlen?
           Whitespots, Anpassungsbedarfe, Cross-Selling
           Mit Quelle (OPT-19), Prioritaet, geschaetztem Volumen
```

---

# ═══════════════════════════════════════════════════════
# A. VERSICHERUNGS-PERSONAS (A-02 / A-10) – 8 Stueck
# ═══════════════════════════════════════════════════════

---

## V1: Peter Schmidt – Familie mit Absicherungsluecken

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 42 |
| Beruf | IT-Projektleiter, angestellt bei mittelst. Beratung |
| Bruttoeinkommen | 75.000 EUR/J. |
| Nettoeinkommen | 4.200 EUR/mtl. (Steuerklasse 3) |
| Familie | Verheiratet mit Sarah (39, Lehrerin Teilzeit 1.800 netto), 2 Kinder: Lina (7), Max (1) |
| Wohnsituation | EFH in Koeln-Rodenkirchen, gekauft 2021 |
| LinkedIn | 500+ Kontakte, IT & Digitalisierung, postet ueber Projektmanagement |
| Lebenssituation | Konsolidierung – zweites Kind, Eigenheim, stabile Karriere |
| Kunden-ID | KD00001 |
| NPS | 8 (Promoter) |
| Risikoscore | 28 (Niedriges Risiko) |

### Schicht 2: Eigene Produkte (bei ERGO)

| Produkt | Tarif | Details | Praemie/J. | Seit | Status |
|---|---|---|---|---|---|
| BU-Versicherung | ERGO BU Comfort | 1.800 EUR/mtl. Rente | 2.160 EUR | 2018 | Aktiv, aber zu niedrig fuer aktuelles Einkommen |
| KFZ-Versicherung | VW Tiguan | VK mit 500 EUR SB, SF-Klasse 12 | 680 EUR | 2021 | Aktiv |
| Hausratversicherung | ERGO Hausrat Basis | 65 qm Wohnung – FALSCH, lebt in 145 qm EFH! Keine Elementar | 180 EUR | 2016 | Optimierbar (falsche Wohnflaeche!) |
| Haftpflichtversicherung | ERGO Privat Premium | Familie, 10M EUR Deckung | 95 EUR | 2017 | Aktiv |

Summe eigene Praemien: 3.115 EUR/J. = 260 EUR/mtl.

### Schicht 3: Fremdprodukte (Open Finance / FIDA)

| Produkt | Institut | Details | Volumen/Praemie | FIDA-Consent |
|---|---|---|---|---|
| Girokonto | Sparkasse Koeln | Hauptkonto, Gehaltseingang Peter 4.200 EUR | Saldo ~3.500 EUR | Ja |
| Baufinanzierung | Sparkasse Koeln | 285k EUR Restschuld, 1,8% Zins fest, Zinsbindung bis 09/2027 | Rate 1.050 EUR/mtl. | Ja |
| KfW-Studienkredit | KfW | Restschuld 12.000 EUR | Rate 120 EUR/mtl. | Ja |
| ETF-Depot | ING DiBa | MSCI World (70%) + EM (30%), Sparplan 300 EUR/mtl. | 42.000 EUR | Ja |
| Tagesgeld | DKB | 1,5% Zins | 8.500 EUR | Nein |
| Risikolebensversicherung | Allianz | 150.000 EUR Deckung, Laufzeit bis 2035 | 540 EUR/J. (45/mtl.) | Ja |

### Schicht 4: Transaktionsmuster (monatlich)

| Kategorie | Betrag | Empfaenger/Quelle | Auffaelligkeit |
|---|---|---|---|
| Gehalt Peter | +4.200 EUR | Arbeitgeber | Stabil, leichte Steigerung |
| Gehalt Sarah | +1.800 EUR | Land NRW | Teilzeit |
| Kindergeld | +500 EUR | Familienkasse | 2 Kinder |
| Baufi-Rate | -1.050 EUR | Sparkasse | Zinsbindung endet 09/2027! |
| KfW-Rate | -120 EUR | KfW | Restschuld sinkt |
| ERGO Praemien | -260 EUR | ERGO | BU+KFZ+Hausrat+Haftpflicht |
| Allianz RLV | -45 EUR | Allianz | Geht an Fremdversicherer |
| ETF-Sparplan | -300 EUR | ING DiBa | Geht an Fremdbank-Depot! |
| Kita-Gebuehren | -380 EUR | Stadt Koeln | 2 Kinder |
| Lebensmittel/Drogerie | -850 EUR | REWE, dm, Aldi | Familie mit Kindern |
| Konsum/Bekleidung | -350 EUR | Diverse | |
| Streaming/Abos | -65 EUR | Netflix, Spotify, DAZN | |
| Tanken/Mobilitaet | -180 EUR | Shell, ADAC | |
| Reisen-Ruecklage | -200 EUR | Sparkonto | Familienurlaub |
| Frei verfuegbar | ~700 EUR | | |

Haushaltsnetto: 6.500 EUR. Sparquote: 7,7% (500 EUR Sparplan+Ruecklage). Absicherungsquote: 4,7% (305 EUR Praemien / 6.500 Netto).

### Schicht 5: Vertriebspotentiale

| # | Potential | Typ | Quellen (OPT-19) | Prio | Volumen | Herleitung |
|---|---|---|---|---|---|---|
| 1 | BU-Nachversicherung 1.800 auf 2.600 EUR/mtl. | Anpassung | Bestand + Lebensereignis | Hoch | +960 EUR/J. | Zweites Kind geboren, Einkommen gestiegen seit Abschluss 2018. BU deckt nur 69% statt empfohlene 80% des Nettos |
| 2 | Hausrat-Upgrade 65 auf 145 qm + Elementar | Anpassung | Bestand | Hoch | +120 EUR/J. | Wohnflaeche falsch seit Umzug 2021 ins EFH. Keine Elementarschadendeckung trotz Eigenheim. Leistungsfall waere unterversichert |
| 3 | Fondsgebundene Rentenversicherung statt ETF-Depot | Whitespot | Finanztransaktion + Bestand | Mittel | 42.000 EUR Einmalanlage + 300 EUR/mtl. | ING-Depot hat keinen Steuervorteil. ERGO-Fondspolice mit gleichen ETFs aber Halbeinkuenfteverfahren im Alter. 300 EUR/mtl. gehen aktuell an Fremdbank |
| 4 | RLV-Erhoehung 150k auf 300k EUR | Anpassung | Wettbewerb + Lebensereignis | Hoch | +240 EUR/J. | Allianz-RLV deckt nicht einmal die Baufi-Restschuld (285k). Familie mit 2 kleinen Kindern braucht hoehere Absicherung. ERGO-RLV guenstiger als Allianz-Bestand |
| 5 | Unfallversicherung Familie | Whitespot | Bestand | Mittel | 250 EUR/J. | Keine Unfallversicherung vorhanden. 2 Kinder im unfalltraechtigen Alter (1 und 7). ERGO Unfall Smart |
| 6 | Rechtsschutzversicherung | Whitespot | Bestand | Niedrig | 280 EUR/J. | Kein Rechtsschutz vorhanden. Als Angestellter + Eigentuemer sinnvoll (Arbeitsrecht + Mietrecht/Grundstueck) |
| 7 | Pflegezusatz fuer Eltern empfehlen | Cross-Sell | Kommunikation | Mittel | 480 EUR/J. | Chatbot-Anfrage zum Thema Pflege letzten Monat. Peters Eltern sind 68 und 71 |
| 8 | Baufi-Anschlussfinanzierung 2027 vorbereiten | Cross-Sell Bank-Vers. | Finanztransaktion | Hoch | Verweis an Kooperationspartner | Zinsbindung Sparkasse endet 09/2027. Jetzt Forward-Darlehen pruefen. Gleichzeitig Restschuldversicherung (RLV-Erhoehung) |

Geschaetztes Gesamtvolumen eigene Produkte: 1.850 EUR/J. Mehrpraemie + 42.000 EUR Einmalanlage.

---

## V2: Amira Koenig – Junge Berufstaetige, kaum versichert

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 28 |
| Beruf | UX-Designerin bei Digital-Agentur, 52.000 EUR brutto |
| Nettoeinkommen | 2.800 EUR/mtl. |
| Familie | Ledig, Lebenspartner Tim (nicht zusammenlebend) |
| Wohnsituation | Mietwohnung Koeln-Ehrenfeld, 72 qm, 850 EUR kalt |
| LinkedIn | 800+ Kontakte, Design-Community, postet Portfolio-Projekte, Speaker bei Meetups |
| Lebenssituation | Aufbauphase – Karriere laeuft, erste Anschaffungen, keine Vorsorge |
| Kunden-ID | KD00002 |
| NPS | 7 (Passiv) |
| Risikoscore | 42 (Mittleres Risiko – kein Puffer, keine Absicherung) |

### Schicht 2: Eigene Produkte (bei ERGO)

| Produkt | Details | Praemie/J. | Seit | Status |
|---|---|---|---|---|
| KFZ-Versicherung | VW Polo, TK, SF-Klasse 4 | 420 EUR | 2023 | Aktiv |

Summe: 420 EUR/J. = 35 EUR/mtl. EIN einziges Produkt.

### Schicht 3: Fremdprodukte (Open Finance / FIDA)

| Produkt | Institut | Details | Volumen | FIDA-Consent |
|---|---|---|---|---|
| Girokonto | N26 | Gehaltseingang 2.800 EUR, Apple Pay | Saldo ~1.200 EUR | Ja |
| ETF-Depot | Trade Republic | 70% MSCI World, 30% Nasdaq-100 | 8.500 EUR | Ja |
| Tagesgeld | Commerzbank | Altes Konto von den Eltern | 3.200 EUR | Nein |

Kein einziges Versicherungsprodukt ausser unserem KFZ. Keine BU, keine Haftpflicht, kein Hausrat.

### Schicht 4: Transaktionsmuster (monatlich)

| Kategorie | Betrag | Empfaenger | Auffaelligkeit |
|---|---|---|---|
| Gehalt | +2.800 EUR | Agentur XY | Stabil |
| Miete | -850 EUR | Vermieter | |
| Nebenkosten | -180 EUR | Stadtwerke, GEZ | |
| ERGO KFZ | -35 EUR | ERGO | Einzige Versicherung! |
| Trade Republic Sparplan | -150 EUR | Trade Republic | Geht an Fremdbank |
| Lebensmittel | -350 EUR | REWE, Bio Company | |
| Restaurants/Bars | -280 EUR | Diverse | Hoch fuer Alter! |
| Reisen | -320 EUR | Booking, FlixBus, Ryanair | 3-4 Trips/Jahr |
| Shopping/Bekleidung | -200 EUR | Zalando, COS | |
| Streaming/Abos | -45 EUR | Spotify, Netflix, Adobe CC | Adobe CC beruflich |
| Fitnessstudio | -50 EUR | Urban Sports Club | |
| Frei verfuegbar | ~340 EUR | | Kaum Puffer |

Sparquote: 5,4% (150 EUR Sparplan). Absicherungsquote: 1,3% (35 EUR / 2.800 EUR). EXTREM niedrig.

### Schicht 5: Vertriebspotentiale

| # | Potential | Typ | Quellen | Prio | Volumen | Herleitung |
|---|---|---|---|---|---|---|
| 1 | Berufsunfaehigkeitsversicherung | Whitespot | Bestand (fehlt komplett) | KRITISCH | 1.440 EUR/J. | 28 Jahre, Bueroberuf = guenstige Konditionen. Jetzt abschliessen bevor Vorerkrankungen. BU 1.500 EUR/mtl. Rente |
| 2 | Privathaftpflichtversicherung | Whitespot | Bestand (fehlt komplett) | HOCH | 65 EUR/J. | Existenzbedrohende Luecke. Kein Schutz bei verursachten Schaeden |
| 3 | Hausratversicherung | Whitespot | Bestand (fehlt) | Mittel | 120 EUR/J. | 72 qm, MacBook + Kameraausruestung (Designerin) = hoher Hausrat-Wert |
| 4 | Rechtsschutzversicherung | Whitespot | Bestand (fehlt) | Niedrig | 220 EUR/J. | Angestellte in Agentur – Arbeitsrecht-RS sinnvoll. Mieterin – Mietrecht-RS |
| 5 | Fondsgebundene Altersvorsorge statt Trade Republic | Cross-Sell | Finanztransaktion | Mittel | 8.500 EUR Einmal + 150 EUR/mtl. | Trade Republic hat keinen Steuervorteil. ERGO-Fondspolice mit gleichen ETFs aber Halbeinkuenfteverfahren. 150 EUR/mtl. gehen aktuell an Fremdbank |
| 6 | Zahnzusatzversicherung | Whitespot | Lebensereignis (Alter 28) | Niedrig | 180 EUR/J. | Noch jung = guenstige Praemie. Wartezeit 8 Monate beachten |

Geschaetztes Gesamtvolumen: 2.025 EUR/J. Mehrpraemie + 8.500 EUR Einmalanlage.

---

## V3: Thomas Weber – Bestandskunde mit Abwanderungsrisiko

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 55 |
| Beruf | Selbstaendiger Handwerksmeister (Elektro), Gewinn ~90.000 EUR |
| Nettoeinkommen | ~5.500 EUR/mtl. (nach Steuern, schwankend) |
| Familie | Geschieden, 1 Kind: Tobias (24, studiert BWL in Muenchen) |
| Wohnsituation | ETW Bergisch Gladbach, 95 qm, abbezahlt seit 2022 |
| LinkedIn | Nicht aktiv, Handwerkskammer-Mitglied, lokales Netzwerk |
| Lebenssituation | Pre-Retirement – Nachfolge planen, Betrieb ggf. verkaufen, Altersvorsorge pruefen |
| Kunden-ID | KD00003 |
| NPS | 5 (Detractor!) |
| Risikoscore | 35 (Niedriges-Mittleres Risiko) |
| Abwanderungsrisiko | HOCH – NPS 5, kein Kontakt seit 14 Monaten |

### Schicht 2: Eigene Produkte (bei ERGO)

| Produkt | Details | Praemie/J. | Seit | Status |
|---|---|---|---|---|
| BU-Versicherung | ERGO BU Protect, 2.500 EUR/mtl. Rente | 2.640 EUR | 2012 | Aktiv, Tarif veraltet |
| KFZ (Mercedes Vito) | Firmenfahrzeug, VK 300 EUR SB | 920 EUR | 2019 | Nicht optimiert seit 5 Jahren |
| Gewerbe-Haftpflicht | 5M EUR Deckung Elektro-Handwerk | 480 EUR | 2008 | Aktiv |
| Inhaltsversicherung | Werkstatt + Lager, 150k EUR Summe | 360 EUR | 2010 | Summe ggf. zu niedrig (neue Maschinen) |
| Betriebsunterbrechung | 6 Monate, 45k EUR | 240 EUR | 2010 | Aktiv |
| Wohngebaeudeversicherung | ETW 95 qm, inkl. Elementar | 320 EUR | 2005 | Aktiv, Tarif alt |
| Hausratversicherung | 95 qm, ohne Fahrraddiebstahl | 180 EUR | 2005 | Aktiv |

Summe: 5.140 EUR/J. = 428 EUR/mtl. Treuer Bestandskunde – 7 Vertraege seit bis zu 20 Jahren. Aber NPS nur 5!

### Schicht 3: Fremdprodukte (Open Finance / FIDA)

| Produkt | Institut | Details | Volumen | FIDA-Consent |
|---|---|---|---|---|
| Girokonto privat | Volksbank Bergisches Land | Privatentnahmen | Saldo ~8.000 EUR | Ja |
| Firmenkonto | Volksbank Bergisches Land | Betriebsein-/ausgaenge | Saldo ~25.000 EUR | Nein (geschaeftl.) |
| Bausparvertrag | Schwaebisch Hall | Auslaufend, Guthaben 18.000 EUR, keine Einzahlung seit 2 Jahren | 18.000 EUR | Ja |
| Kapital-Lebensversicherung | R+V | Ablauf 12/2028, aktuelle Rueckkaufswert ~95.000 EUR | 380 EUR/mtl. | Ja |
| ETF-Depot | DKB | MSCI World + Dividenden-ETF | 120.000 EUR | Nein |
| Private KFZ-Versicherung | HUK24 | Privat-PKW BMW 3er | 540 EUR/J. | Nein |

### Schicht 4: Transaktionsmuster (monatlich, Privatkonto)

| Kategorie | Betrag | Auffaelligkeit |
|---|---|---|
| Privatentnahme aus GmbH | +5.500 EUR | Schwankend (4.800-6.200) |
| R+V Lebensversicherung | -380 EUR | Geht an Fremdversicherer, laeuft 2028 aus |
| ERGO Praemien | -428 EUR | 7 Vertraege |
| HUK24 KFZ privat | -45 EUR | Fremd-KFZ |
| DKB Sparplan | -400 EUR | Geht an Fremdbank! |
| Unterhalt Sohn Tobias | -800 EUR | Student in Muenchen |
| Konsum/Lebenshaltung | -1.200 EUR | Maessig |
| Restaurant/Freizeit | -400 EUR | Geschieden, soziales Leben |
| Handwerkskammer/Berufsverband | -80 EUR | |
| Frei verfuegbar | ~1.767 EUR | Hoher Puffer |

### Schicht 5: Vertriebspotentiale

| # | Potential | Typ | Quellen | Prio | Volumen | Herleitung |
|---|---|---|---|---|---|---|
| 1 | Bindungsgespraech wegen NPS 5 | Aktion | NPS/Kommunikation | KRITISCH | Bestandssicherung 5.140 EUR/J. | 14 Monate kein Kontakt, NPS 5 (Detractor). Abwanderungsrisiko hoch. Proaktiv Termin vereinbaren |
| 2 | R+V LV Ablauf 2028 – Wiederanlage beraten | Cross-Sell | Finanztransaktion + Markt | Hoch | 95.000 EUR Einmalanlage | Kapitallebensversicherung laeuft in 2 Jahren aus. 95k Auszahlung. Fruehzeitig ERGO Fondspolice oder ETF-Rentenversicherung positionieren |
| 3 | Nachfolgeplanung Betrieb | Cross-Sell | Lebensereignis | Hoch | Vermittlung an Kooperationspartner | 55 Jahre, kein Nachfolger in Sicht. Sohn studiert BWL (keine Handwerks-Nachfolge). Betriebsverkauf und Vermoegensanlage planen |
| 4 | Ruerup-Rente (Basisrente) | Whitespot | Bestand (Selbstaendig!) | Hoch | 6.000 EUR/J. | Als Selbstaendiger kein Zugang zu gesetzl. RV. Steuerlich absetzbar bis 27.566 EUR/J. (2026). Grosse Luecke |
| 5 | KFZ-Optimierung Firmenfahrzeug | Anpassung | Bestand | Mittel | -120 EUR/J. Ersparnis | Tarif seit 5 Jahren nicht geprueft. SF-Klasse moeglicherweise besser |
| 6 | Inhaltsversicherung Summenanpassung | Anpassung | Bestand | Mittel | +80 EUR/J. | Neue Maschinen seit 2020 angeschafft. Versicherungssumme pruefen |
| 7 | DKB-Depot Konsolidierung | Cross-Sell | Finanztransaktion | Niedrig | 120.000 EUR | 400 EUR/mtl. + 120k gehen an Fremdbank. Im Kontext LV-Ablauf 2028 gesamte Vermoegensanlage beraten |

---

## V4: Dr. Anna Hoffmann – Aerztin, hohes Einkommen, wenig versichert

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 35 |
| Beruf | Fachaeerztin Dermatologie, angestellt Uniklinik Koeln, 105.000 EUR brutto |
| Nettoeinkommen | 5.200 EUR/mtl. |
| Familie | Verheiratet mit Jan (37, Architekt, 65k brutto), 1 Kind: Emma (3) |
| Wohnsituation | Mietwohnung Koeln-Lindenthal, 110 qm, 1.450 EUR kalt |
| LinkedIn | 300+ Kontakte, Dermatologie-Netzwerk, publiziert Fachartikel |
| Lebenssituation | Aufstieg – Karriere im Krankenhaus, Eigentumskauf geplant in 2-3 Jahren |
| Kunden-ID | KD00004 |
| NPS | 9 (Promoter) |

### Schicht 2: Eigene Produkte (bei ERGO)

| Produkt | Details | Praemie/J. | Status |
|---|---|---|---|
| Haftpflichtversicherung | Familie, 15M Deckung | 110 EUR | Aktiv |
| Hausratversicherung | 110 qm, inkl. Fahrraddiebstahl | 195 EUR | Aktiv |

Nur 2 Produkte – 305 EUR/J. Bei 5.200 netto = extrem niedrige Absicherungsquote 0,5%.

### Schicht 3: Fremdprodukte

| Produkt | Institut | Details | Volumen |
|---|---|---|---|
| Girokonto | Commerzbank | Gehaltseingang Anna 5.200 + Jan 3.400 | ~6.000 Saldo |
| Tagesgeld | ING | Eigenkapital-Ansparen | 65.000 EUR |
| ETF-Depot | Scalable Capital | MSCI ACWI, Sparplan 800 EUR/mtl. | 38.000 EUR |
| KFZ | Check24/Allianz | BMW X1, VK | 780 EUR/J. |

Keine BU, keine RLV, keine Altersvorsorge. Bei 105k Einkommen eine massive Luecke.

### Schicht 4: Transaktionen (monatlich)

| Kategorie | Betrag | Auffaelligkeit |
|---|---|---|
| Gehalt Anna | +5.200 EUR | |
| Gehalt Jan | +3.400 EUR | |
| Miete | -1.450 EUR | |
| Scalable Sparplan | -800 EUR | Fremdbank! |
| ING Sparrate | -500 EUR | Fremdbank! |
| Allianz KFZ | -65 EUR | Fremdversicherer |
| Kita | -420 EUR | |
| Frei verfuegbar | ~2.200 EUR | Hoher Puffer |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | BU-Versicherung (Aerzte-Tarif!) | KRITISCH | 3.600 EUR/J. | Aerztin mit 105k Einkommen und KEINER BU. Aerzte-Tarif mit abstrakter Verweisung = Premium-Segment. Jetzt abschliessen solange gesund |
| 2 | Risikolebensversicherung | Hoch | 360 EUR/J. | Familie mit Kleinkind, Eigentum geplant. 400k Deckung fuer Baufi-Absicherung + Familienschutz |
| 3 | Fondspolice statt Scalable Capital | Mittel | 38k Einmal + 800/mtl. | 800 EUR/mtl. gehen an Fremdbank. ERGO-Fondspolice mit Steuervorteil |
| 4 | Wohngebaeude + Baufi-Absicherung (vormerken) | Hoch | Folgt bei Kauf | Eigentum geplant in 2-3 Jahren. Heute schon Beratung positionieren |
| 5 | KFZ-Wechsel Allianz auf ERGO | Mittel | 780 EUR/J. | KFZ bei Allianz ueber Check24 = preissensitiv. ERGO Buendel-Rabatt mit Haftpflicht+Hausrat anbieten |

---

## V5: Klaus Meier – Beamter, PKV, Beihilfe-berechtigt

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 48 |
| Beruf | Oberregierungsrat (A14), Bezirksregierung Koeln, Beamter auf Lebenszeit |
| Nettoeinkommen | 4.800 EUR/mtl. (inkl. Familienzuschlag) |
| Familie | Verheiratet mit Petra (46, Beamtin A12, Finanzamt), 3 Kinder: Lena (16), Niklas (13), Finn (10) |
| Wohnsituation | DHH Frechen, Eigentum seit 2012, Baufi abbezahlt 2024 |
| LinkedIn | Nicht vorhanden |
| Lebenssituation | Stabil – Haus abbezahlt, 3 Kinder in Ausbildung/Schule, sichere Einkuenfte |
| Kunden-ID | KD00005 |
| NPS | 6 (Passiv) |

### Schicht 2: Eigene Produkte (bei ERGO)

| Produkt | Details | Praemie/J. | Status |
|---|---|---|---|
| PKV | ERGO Beamten-Tarif, 30% Eigenanteil (70% Beihilfe) | 3.840 EUR | Aktiv, jaehrl. Beitragsanpassung |
| PKV Kinder | 3 Kinder, 20% Eigenanteil (80% Beihilfe) | 1.080 EUR | Aktiv |
| Wohngebaeudeversicherung | DHH 135 qm, inkl. Elementar | 420 EUR | Aktiv |
| Hausratversicherung | 135 qm | 210 EUR | Aktiv |
| KFZ 1 | VW Passat Variant, VK | 720 EUR | Aktiv |
| KFZ 2 | VW T-Cross (Petra), TK | 380 EUR | Aktiv |

6 Vertraege, 6.650 EUR/J. Guter Bestandskunde, aber Luecken in Vorsorge.

### Schicht 3: Fremdprodukte

| Produkt | Institut | Details | Volumen |
|---|---|---|---|
| Girokonto | Sparkasse Koeln | Gehaltseingang Klaus 4.800 | ~5.500 Saldo |
| Sparkonto | Sparkasse Koeln | | 42.000 EUR |
| Bausparvertrag | LBS | Zuteilungsreif | 25.000 EUR |
| Depot | DWS/Sparkasse | Mischfonds, kaum Performance | 35.000 EUR |
| Dienstunfaehigkeitsvers. | DBV/AXA | 2.400 EUR/mtl. Rente | 1.200 EUR/J. |

### Schicht 4: Transaktionen (monatlich)

| Kategorie | Betrag | Auffaelligkeit |
|---|---|---|
| Gehalt Klaus | +4.800 EUR | Stabil |
| Gehalt Petra | +3.600 EUR | Beamtin |
| ERGO PKV Familie | -410 EUR | |
| ERGO Haus+KFZ+Hausrat | -144 EUR | |
| DBV/AXA DU | -100 EUR | Fremdversicherer |
| Sparkasse Sparkonto | -300 EUR | |
| Kinder Sport/Musik | -280 EUR | 3 Kinder |
| Frei verfuegbar | ~3.500 EUR | Hoher Puffer, keine Altersvorsorge! |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | PKV-Tarifoptimierung (interner Wechsel) | Hoch | -600 EUR/J. Ersparnis | Tarif seit 12 Jahren, neuere Tarife mit besserem PLV. Beamtenbeihilfe bleibt gleich |
| 2 | Dienstunfaehigkeitsversicherung auf ERGO wechseln | Hoch | 1.200 EUR/J. Wechsel | DBV/AXA-Tarif pruefen. ERGO-Beamten-DU oft guenstiger bei gleicher Leistung |
| 3 | Pflegezusatzversicherung (Ehepaar) | Hoch | 960 EUR/J. | 48+46 Jahre. Beihilfe deckt nur 70/80% der Pflegekosten. Eigenanteil steigt dramatisch bei Heim. ERGO Pflege-Monatsgeld |
| 4 | Fondsgebundene Altersvorsorge | Mittel | 3.600 EUR/J. | 3.500 EUR frei/mtl. aber keine Altersvorsorge. DWS-Depot kaum Performance. ERGO-Fondspolice mit Steuervorteil |
| 5 | Kinderunfallversicherung | Mittel | 210 EUR/J. | 3 aktive Kinder. Schulunfaelle nur begrenzt durch gesetzl. UV gedeckt |

---

## V6: Lisa Bauer – Freelancerin, fast unversichert

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 31 |
| Beruf | Freelance Grafikdesignerin, 38.000 EUR Umsatz (schwankend) |
| Nettoeinkommen | ~2.400 EUR/mtl. (nach Steuern + KSK) |
| Familie | Ledig, Fernbeziehung |
| Wohnsituation | WG-Zimmer Koeln-Nippes, 18 qm, 480 EUR warm |
| LinkedIn | 1.200+ Kontakte, Kreativ-Szene, sehr aktiv |
| Lebenssituation | Aufbau – unstabile Einnahmen, geringe Ruecklagen |
| Kunden-ID | KD00006 |
| NPS | 8 (Promoter) |

### Schicht 2: Eigene Produkte (bei ERGO)

| Produkt | Details | Praemie/J. | Status |
|---|---|---|---|
| Privathaftpflichtversicherung | Single, 10M Deckung | 55 EUR | Aktiv |

EIN Produkt. 55 EUR/J.

### Schicht 3: Fremdprodukte

| Produkt | Institut | Details | Volumen |
|---|---|---|---|
| Geschaeftskonto | Holvi | Freelancer-Konto | ~3.500 Saldo |
| Girokonto | DKB | Privat | ~1.800 Saldo |
| GKV ueber KSK | Kuenstlersozialkasse | ~210 EUR/mtl. | |

Kein Depot, kein Tagesgeld, kein Sparplan. Lebt von der Hand in den Mund.

### Schicht 4: Transaktionen (monatlich)

| Kategorie | Betrag | Auffaelligkeit |
|---|---|---|
| Kundenzahlungen | +2.400 EUR (schwankend 1.800-3.200) | Unregelmaessig |
| WG-Miete | -480 EUR | |
| KSK (GKV+RV+PV) | -210 EUR | |
| Adobe CC + Tools | -65 EUR | Beruflich |
| ERGO Haftpflicht | -5 EUR | Einzige Versicherung |
| Frei verfuegbar | ~800 EUR | Kein Puffer |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | BU-Versicherung | KRITISCH | 720 EUR/J. | 31, Freelancerin, kein Arbeitgeber-Schutz. KSK zahlt nur Mini-Erwerbsminderungsrente. BU 1.000 EUR/mtl. = Existenzsicherung |
| 2 | Berufshaftpflicht (Vermoegens-HP) | Hoch | 180 EUR/J. | Grafikdesignerin ohne Berufshaftpflicht. Kundenprojekt mit Fehler = Schadensersatz. ERGO Berufshaftpflicht Kreative |
| 3 | Hausratversicherung | Mittel | 85 EUR/J. | MacBook Pro + iPad + Kamera = hoher mobiler Hausrat. WG-Anteil versichern |
| 4 | Ruerup-Rente (KSK-Ergaenzung) | Mittel | 1.200 EUR/J. | KSK-Rente reicht nicht. Als Selbstaendige Ruerup steuerlich absetzbar |
| 5 | Rechtsschutzversicherung | Niedrig | 190 EUR/J. | Freelancer-Vertraege, Honorarstreitigkeiten, Mietrecht |

---

## V7: Michael Braun – Ruhestaendler, vermoegend, bestandstreu

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 62 |
| Beruf | Ruhestand seit 2024 (ex-Ingenieur, BASF, Betriebsrente) |
| Einkommen | Rente 2.800 EUR + Betriebsrente 1.500 EUR + Mieteinkuenfte 950 EUR = 5.250 EUR/mtl. |
| Familie | Verheiratet mit Ingrid (60, Hausfrau), 2 erwachsene Kinder (35, 32), 1 Enkel |
| Wohnsituation | EFH Leverkusen, Baujahr 1998, abbezahlt, + 1 vermietete ETW |
| LinkedIn | Nicht aktiv |
| Lebenssituation | Ruhestand – Vermoegen sichern, Pflege vorbereiten, Erbe regeln |
| Kunden-ID | KD00007 |
| NPS | 9 (Promoter, seit 25 Jahren Kunde) |

### Schicht 2: Eigene Produkte (bei ERGO)

| Produkt | Details | Praemie/J. | Status |
|---|---|---|---|
| Wohngebaeudeversicherung EFH | 165 qm, inkl. Elementar | 520 EUR | Aktiv |
| Wohngebaeudeversicherung ETW | Vermietet, 75 qm | 280 EUR | Aktiv |
| Hausratversicherung | 165 qm, Glasbruch | 240 EUR | Aktiv |
| KFZ Mercedes E-Klasse | VK, SF 25 | 580 EUR | Aktiv |
| Haftpflichtversicherung | Ehepaar | 85 EUR | Aktiv |
| Haus- und Grundbesitzerhaftpflicht | Vermietete ETW | 95 EUR | Aktiv |

6 Vertraege, 1.800 EUR/J. Treuer Langzeit-Bestandskunde.

### Schicht 3: Fremdprodukte

| Produkt | Institut | Details | Volumen |
|---|---|---|---|
| Girokonto | Sparkasse Leverkusen | Renten-Eingaenge | ~8.000 Saldo |
| Festgeld | Sparkasse | 3%, 12 Monate | 80.000 EUR |
| Depot | Deka (Sparkasse) | Mischfonds, konservativ | 145.000 EUR |
| Kapital-LV | Alte Leipziger | Bereits ausgezahlt 2023 | 0 (war 120k) |
| PKV | DKV | Rentner-Tarif, steigend | 680 EUR/mtl. |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | Pflegezusatzversicherung (Ehepaar) | Hoch | 1.440 EUR/J. | 62 + 60 Jahre. Pflegewahrscheinlichkeit steigt stark. Eigenanteil Pflegeheim ~2.500 EUR/mtl. ERGO Pflege-Monatsgeld |
| 2 | Sterbegeldversicherung | Mittel | 360 EUR/J. | Bestattungskosten 8.000-12.000 EUR. Entlastung fuer Angehoerige |
| 3 | Fondspolice/Auszahlplan statt Deka-Depot | Cross-Sell | 145k Einmalanlage | Deka-Mischfonds hat hohe Kosten bei maessiger Performance. ERGO-Rentenpolice mit Steuervorteil fuer Auszahlplan |
| 4 | Wohngebaeudevers. Tarifupdate | Anpassung | -60 EUR/J. | Tarif seit 2005. Neuere ERGO-Tarife haben bessere Elementar-Deckung bei gleichem Preis |
| 5 | Enkelkind-Vorsorge (Ausbildungsvers.) | Cross-Sell | 600 EUR/J. | 1 Enkel. Grosseltern-Ausbildungsversicherung als Geschenk positionieren |

---

## V8: Sandra Yilmaz – Dual Income, Eigentum geplant

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 38 |
| Beruf | Leitende Angestellte, Pharma-Konzern Leverkusen, 95.000 EUR brutto |
| Nettoeinkommen | 4.800 EUR/mtl. |
| Familie | Verheiratet mit Emre (40, Zahnarzt eigene Praxis, ~120k), keine Kinder (Kinderwunsch) |
| Wohnsituation | Mietwohnung Koeln-Bayenthal, 95 qm, 1.350 EUR kalt. Eigenheim-Kauf geplant 2027 |
| LinkedIn | 600+ Kontakte, Pharma-Industrie, Leadership-Posts |
| Lebenssituation | Vorbereitung – Eigenheim, Familiengruendung, Dual Income Hochphase |
| Kunden-ID | KD00008 |
| NPS | 8 (Promoter) |

### Schicht 2: Eigene Produkte (bei ERGO)

| Produkt | Details | Praemie/J. | Status |
|---|---|---|---|
| BU-Versicherung | 2.200 EUR/mtl. Rente, abgeschlossen bei Berufseinstieg | 1.920 EUR | Aktiv, zu niedrig fuer aktuelles Einkommen |
| KFZ Audi A3 | VK, SF 14 | 620 EUR | Aktiv |
| Haftpflichtversicherung | Ehepaar | 95 EUR | Aktiv |

3 Vertraege, 2.635 EUR/J.

### Schicht 3: Fremdprodukte

| Produkt | Institut | Details | Volumen |
|---|---|---|---|
| Girokonto | ING | Gehaltseingang Sandra | ~4.500 Saldo |
| Praxis-Konto Emre | Commerzbank | Praxis-Umsaetze | |
| Tagesgeld | ING | Eigenkapital-Ansparen fuer Hauskauf | 95.000 EUR |
| ETF-Depot | ING | MSCI World + EM, Sparplan 1.200 EUR/mtl. | 85.000 EUR |
| PKV Emre | Signal Iduna | Zahnarzt-Tarif | 750 EUR/mtl. |
| Berufshaftpflicht Emre | HDI | Zahnarzt Praxis-HP | 1.800 EUR/J. |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | BU-Nachversicherung 2.200 auf 3.200 EUR/mtl. | Hoch | +1.080 EUR/J. | Einkommen von 55k auf 95k gestiegen. BU deckt nur 46% statt 80% des Nettos |
| 2 | Risikolebensversicherung (Baufi-Vorbereitung) | Hoch | 480 EUR/J. | Eigenheim 2027 geplant. RLV jetzt abschliessen (38 J. = noch guenstig). 400k Deckung |
| 3 | Wohngebaeudeversicherung (vormerken) | Hoch | Folgt bei Kauf | Vorbereitung: bei Kaufvertrag sofort WGV-Angebot bereithalten |
| 4 | Fondspolice statt ING-Depot | Mittel | 85k Einmal + 1.200/mtl. | 1.200 EUR/mtl. gehen an ING. ERGO-Fondspolice mit gleichen ETFs, Steuervorteil Halbeinkuenfte |
| 5 | Kinderwunsch-Vorsorge (vormerken) | Mittel | Folgt bei Geburt | Kinderwunsch bekannt. Bei Geburt: Kinderunfall, ggf. BU-Nachversicherungsoption nutzen |
| 6 | PKV-Beratung Emre (Zahnarzt) | Cross-Sell | 9.000 EUR/J. | Signal-Iduna-Tarif pruefen. ERGO-PKV fuer Aerzte ggf. besser. Wechsel nur sinnvoll wenn Leistung mindestens gleich |

---

# ═══════════════════════════════════════════════════════
# B. BANKING-PERSONAS (B-02 / B-10) – 6 Stueck
# ═══════════════════════════════════════════════════════

---

## B1: Klaus Fischer – Retail mit Verbundpartner-Potenzial

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 45 |
| Beruf | Vertriebsleiter bei Mittelstaendler (Maschinenbau), 85.000 EUR brutto |
| Nettoeinkommen | 4.500 EUR/mtl. (Steuerklasse 3) |
| Familie | Verheiratet mit Claudia (42, Teilzeit Buchhalterin 1.800 netto), 2 Kinder: Paul (12), Marie (9) |
| Wohnsituation | DHH in Giessen, Baufi ueber uns, Restschuld 185k |
| LinkedIn | 400+ Kontakte, B2B-Vertrieb, postet ueber Sales-Strategien |
| Lebenssituation | Konsolidierung – Eigenheim, Familie, Fokus Vermoegensaufbau |
| Kunden-ID | KDB001 |
| NPS | 7 (Passiv) |

### Schicht 2: Eigene Produkte (bei Volksbank)

| Produkt | Details | Ertrag/Volumen | Seit | Status |
|---|---|---|---|---|
| Girokonto VR-MeinKonto | Gehaltseingang Klaus 4.500 + Claudia 1.800 | Saldo ~4.200 | 2008 | Aktiv, Hauptkonto |
| Sparkonto VR | 0,5% Zins | 15.000 EUR | 2015 | Aktiv, Zins zu niedrig |
| Baufinanzierung | 185k Restschuld, 1,2% fest, ZINSBINDUNG ENDET 04/2026! | Rate 850 EUR/mtl. | 2016 | KRITISCH: Anschlussfinanzierung! |
| Visa Gold Kreditkarte | Umsatz ~800 EUR/mtl. | | 2018 | Aktiv |
| Schwaebisch Hall Bauspar | BSV 50k, Guthaben 30k, zuteilungsreif | 30.000 EUR | 2010 | Zuteilungsreif, keine Einzahlung seit 2J |

KEIN Union Investment Depot. KEIN VR-FinanzPlan. KEIN Wertpapiersparplan.

### Schicht 3: Fremdprodukte (Open Finance / FIDA)

| Produkt | Institut | Details | Volumen | FIDA-Consent |
|---|---|---|---|---|
| ETF-Depot | Trade Republic | DAX-ETF, S&P 500, Einzelaktien (Siemens, BASF) | 28.000 EUR, Sparplan 500/mtl. | Ja |
| Tagesgeld | ING | 2,8% Zins – deutlich hoeher als unser Sparkonto! | 22.000 EUR, monatl. Ueberweisung 1.000 | Ja |
| KFZ-Versicherung | HUK-Coburg | 2 PKW (VW Passat + Ford Fiesta) | 1.200 EUR/J. | Ja |
| BU-Versicherung | HDI | 2.000 EUR/mtl. Rente | 1.680 EUR/J. | Ja |
| Haftpflichtversicherung | Allianz | Familie, 10M | 85 EUR/J. | Ja |
| Kapital-Lebensversicherung | Alte Leipziger | Ablauf 2032, Rueckkaufswert ~45k | 180 EUR/mtl. | Ja |

### Schicht 4: Transaktionsmuster (monatlich)

| Kategorie | Betrag | Empfaenger | Auffaelligkeit |
|---|---|---|---|
| Gehalt Klaus | +4.500 EUR | Arbeitgeber | Stabil |
| Gehalt Claudia | +1.800 EUR | Arbeitgeber | Teilzeit |
| Kindergeld | +500 EUR | Familienkasse | |
| Baufi-Rate | -850 EUR | Volksbank intern | Zinsbindung endet 04/2026! |
| Trade Republic Sparplan | -500 EUR | Trade Republic | GELDABFLUSS AN FREMDBANK |
| ING Ueberweisung | -1.000 EUR | ING DiBa | GELDABFLUSS AN FREMDBANK |
| Alte Leipziger LV | -180 EUR | Alte Leipziger | Geht an Fremdversicherer |
| HUK KFZ | -100 EUR | HUK-Coburg | Fremdversicherer |
| HDI BU | -140 EUR | HDI | Fremdversicherer |
| Allianz Haftpflicht | -7 EUR | Allianz | Fremdversicherer |
| Konsum/Leben | -1.800 EUR | Diverse | Familie |
| Sport/Freizeit Kinder | -250 EUR | Vereine | |
| Frei verfuegbar | ~473 EUR | | Knapp wegen Geldabfluesse |

Kerneinsicht: 1.500 EUR/mtl. fliessen an Trade Republic + ING. Das ist Geld das bei uns sein koennte.

### Schicht 5: Vertriebspotentiale

| # | Potential | Typ | Quellen | Prio | Ertrag/J. | Herleitung |
|---|---|---|---|---|---|---|
| 1 | Anschlussfinanzierung | Anpassung | Bestand + Markt | KRITISCH | 2.775 EUR | Zinsbindung endet 04/2026! Bei 185k Restschuld und aktuellem Zinsniveau (~3,5%) muss JETZT ein Angebot raus. Forward-Darlehen oder Prolongation. Verlieren wir die Baufi, verlieren wir den Kunden |
| 2 | VR-FinanzPlan + Union Investment Sparplan | Whitespot | Finanztransaktion | Hoch | 1.800 EUR | 500 EUR/mtl. gehen an Trade Republic statt an Union Investment. UniGlobal, UniNachhaltig Aktien als Alternative positionieren |
| 3 | VermoegenPlus Depot (Trade Republic Konsolidierung) | Whitespot | Finanztransaktion | Hoch | 675 EUR | 28k bei Trade Republic. Bei naechster Beratung Depot-Umzug zu VR-Bank mit Union-Investment-Fonds vorschlagen |
| 4 | Tagesgeld-Konsolidierung ING auf VR | Anpassung | Finanztransaktion | Mittel | 150 EUR | 22k bei ING (2,8%). VR-Tagesgeld aufwerten oder VR-FinanzPlan mit Tagesgeld-Anteil |
| 5 | R+V KFZ statt HUK-Coburg | Cross-Sell Vers. | Wettbewerb | Mittel | 540 EUR | 2 PKW bei HUK = 1.200/J. R+V-Tarif vergleichen. Buendel-Effekt durch VR-Mitgliedschaft |
| 6 | R+V Risikolebensversicherung | Cross-Sell Vers. | Bestand (Baufi) + Lebensereignis | Hoch | 360 EUR | Baufi 185k, Familie mit 2 Kindern. RLV 250k Deckung ueber R+V. Pflichtberatung bei Anschlussfinanzierung nutzen |
| 7 | Schwaebisch Hall Bauspar NEU (Modernisierung) | Whitespot | Bestand | Niedrig | 500 EUR | Alter BSV zuteilungsreif. DHH Baujahr 2010 – energetische Modernisierung? Neuen BSV fuer KfW-foerderfaehige Massnahmen |
| 8 | FIDA-Consent erweitern | Infrastruktur | Bestand | Mittel | – | DKB und Alte Leipziger noch ohne Consent. Vollstaendiges Finanzbild erst mit allen Konten |

---

## B2: Sandra Mueller – Junge Familie, Eigentumsplanung

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 33 |
| Beruf | Lehrerin (verbeamtet, A13), 3.600 EUR netto |
| Familie | Verheiratet mit Tobias (35, Ingenieur bei Continental, 4.200 netto), 1 Kind: Mia (2), Kind 2 geplant |
| Wohnsituation | Mietwohnung Giessen, 85 qm, 1.100 EUR kalt. Eigentum geplant naechste 2 Jahre |
| LinkedIn | Wenig aktiv, Bildungs-Community |
| Kunden-ID | KDB002 |
| NPS | 8 (Promoter) |

### Schicht 2: Eigene Produkte (bei Volksbank)

| Produkt | Details | Volumen | Status |
|---|---|---|---|
| Girokonto Sandra | Gehaltseingang 3.600 | ~3.000 Saldo | Aktiv |
| Sparkonto | Eigenkapital-Ansparen | 35.000 EUR | Aktiv, waechst mtl. +800 |
| Kreditkarte | Visa Basis, wenig genutzt | ~200/mtl. | Aktiv |

Tobias hat KEIN Konto bei uns. Sein Geld ist komplett woanders.

### Schicht 3: Fremdprodukte

| Produkt | Institut | Details | Volumen | FIDA-Consent |
|---|---|---|---|---|
| Girokonto Tobias | Commerzbank | Gehaltseingang 4.200 | ~5.000 Saldo | Nein |
| Depot Tobias | Commerzbank | ETF-Sparplan 600/mtl. | 45.000 EUR | Nein |
| Tagesgeld Tobias | DKB | | 18.000 EUR | Nein |
| BU Sandra | Allianz | 1.800 EUR/mtl. Rente | 1.440 EUR/J. | Ja |
| BU Tobias | Allianz | 2.500 EUR/mtl. Rente | 2.160 EUR/J. | Nein |
| KFZ Sandra | Allianz | VW Golf, TK | 520 EUR/J. | Ja |
| KFZ Tobias | HUK | Skoda Octavia, VK | 680 EUR/J. | Nein |
| Haftpflicht | Allianz | Familie | 90 EUR/J. | Ja |

Kerneinsicht: Tobias ist KEIN Kunde bei uns. 4.200 netto + 45k Depot + 18k Tagesgeld = massives Potential wenn wir ihn als Kunden gewinnen.

### Schicht 4: Transaktionen (monatlich, Konto Sandra)

| Kategorie | Betrag | Auffaelligkeit |
|---|---|---|
| Gehalt Sandra | +3.600 EUR | |
| Tobias Haushaltsgeld-Ueberweisung | +2.000 EUR | Von Commerzbank! |
| Miete | -1.100 EUR | |
| Sparkonto Eigenkapital | -800 EUR | Ziel: ~80k EK fuer Hauskauf |
| Allianz BU+KFZ+HP Sandra | -165 EUR | Fremdversicherer |
| Kita | -350 EUR | |
| Konsum | -1.400 EUR | |
| Frei verfuegbar | ~785 EUR | |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Ertrag/J. | Herleitung |
|---|---|---|---|---|
| 1 | Baufinanzierung vorbereiten | Hoch | ~4.000 (bei 350k Baufi) | EK waechst, Kinderwunsch = Zeitdruck. Fruehzeitig Baufi-Beratung anbieten. Wenn wir die Baufi machen, bleibt die Familie bei uns |
| 2 | Tobias als Kunden gewinnen (Girokonto + Depot) | Hoch | 2.400 | 4.200 netto + 45k Depot bei Commerzbank. Bei Baufi muessen ohnehin beide Konten zu uns. Jetzt schon Union-Investment-Sparplan anbieten |
| 3 | Schwaebisch Hall Bauspar (Zinssicherung) | Hoch | 500 | Eigenheim geplant. BSV sichert guenstigen Darlehenszins. Riester-Bauspar fuer Sandra (Beamtin) besonders attraktiv |
| 4 | R+V Risikolebensversicherung | Hoch | 360 | Wenn Baufi kommt, brauchen beide RLV. Jetzt abschliessen = guenstigere Praemie (33+35 Jahre) |
| 5 | R+V KFZ statt Allianz/HUK | Mittel | 540 | 2 PKW bei Fremdversicherern. R+V-Buendel-Rabatt bei VR-Mitgliedschaft |
| 6 | FIDA-Consent Tobias (Commerzbank) | Infrastruktur | – | Ohne Tobias' Daten sehen wir nur die halbe Haushaltsbilanz |

---

## B3: Peter Hoffmann – Firmenkunde GmbH-Geschaeftsfuehrer

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 58 |
| Beruf | GF und Inhaber "Hoffmann Metallbau GmbH", 25 Mitarbeiter, 4,2M Umsatz |
| Einkommen | GF-Gehalt 180k + Gewinnausschuettung variabel |
| Familie | Verheiratet, 2 erwachsene Kinder (28, 25) |
| Wohnsituation | Villa Wettenberg, Eigentum, abbezahlt |
| Kunden-ID | FKB001 |
| NPS | 7 |

### Schicht 2: Eigene Produkte (bei Volksbank)

| Produkt | Details | Volumen |
|---|---|---|
| Firmenkonto Hauptkonto | Alle Umsaetze | Saldo ~120k |
| Firmenkonto Steuerkonto | Steuer-Ruecklagen | 45k |
| Firmenkonto Materialkonto | Lieferantenzahlungen | 15k |
| Kontokorrentkredit | 200k Rahmen, ~80k genutzt | 80k genutzt |
| GF-Girokonto privat | Gehalt + Ausschuettungen | ~15k Saldo |
| Sparkonto privat | | 60k |

KEIN Firmendepot. KEIN Unternehmerdepot. KEINE Betriebliche Altersvorsorge.

### Schicht 3: Fremdprodukte

| Produkt | Institut | Volumen |
|---|---|---|
| Privat-Depot | Deutsche Bank | 280k (Einzelaktien + Fonds) |
| Firmendepot | Deutsche Bank | 150k |
| D&O-Versicherung | Allianz | 2M Deckung, 3.600/J. |
| Betriebshaftpflicht | R+V | 5M Deckung (bereits ueber VR-Verbund) |
| KFZ Fuhrpark (5 Fzg.) | Allianz Flottenvertrag | 4.800/J. |
| Privat-PKV | DKV | 850/mtl. |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | Firmendepot Union Investment | Hoch | 150k Umschichtung + 1.500/J. | Deutsche-Bank-Depot zu VR-Unternehmerdepot. Union Investment Institutionell |
| 2 | Betriebliche Altersvorsorge (bAV) | Hoch | 25 MA x ~2.400 = 60k/J. | 25 Mitarbeiter ohne bAV. R+V bAV als Arbeitgeber-Angebot |
| 3 | D&O-Versicherung R+V statt Allianz | Mittel | 3.600/J. | D&O bei Allianz. R+V im Verbund oft guenstiger. Beim naechsten Review ansprechen |
| 4 | Nachfolgeplanung | Hoch | Vermittlung | 58 Jahre, kein Nachfolger erkennbar. Unternehmenswert ~3-4M EUR. Nachfolge-Beratung + Vermoegensanlage nach Verkauf |
| 5 | KfW-Foerderkredit (Digitalisierung/Energieeffizienz) | Mittel | 250k Kredit | Metallbau = energieintensiv. KfW 261/263 fuer Produktionsumstellung |

---

## B4: Markus Wagner – Berufseinsteiger, nur Girokonto

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 29 |
| Beruf | Junior Controller, Mittelstand Giessen, 48.000 EUR brutto, 1. Job nach Master |
| Nettoeinkommen | 2.600 EUR/mtl. |
| Familie | Ledig, Freundin (zusammenlebend) |
| Wohnsituation | Mietwohnung 65 qm, 750 EUR warm |
| LinkedIn | 250+ Kontakte, Finance & Controlling |
| Kunden-ID | KDB004 |
| NPS | 6 (Passiv) |

### Schicht 2: Eigene Produkte (bei Volksbank)

| Produkt | Details | Volumen |
|---|---|---|
| Girokonto VR-MeinKonto | Gehaltseingang 2.600 | ~1.500 Saldo |

EIN Produkt. Childhood-Konto, nie erweitert. Null Bindung.

### Schicht 3: Fremdprodukte

| Produkt | Institut | Volumen |
|---|---|---|
| Depot | Trade Republic | 5.200 (Sparplan 200/mtl.) |
| KFZ | Check24/VHV | 380/J. |
| Haftpflicht | Check24/CosmosDirekt | 45/J. |

Kein Sparprodukt bei uns, kein Depot, keine Versicherung. Alles ueber Check24 / Digital-Anbieter.

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | Union Investment ETF-Sparplan | Hoch | 200/mtl. Sparplan | 200 EUR/mtl. gehen an Trade Republic. UniGlobal Vorsorge oder UniNachhaltig Aktien. Generationsberatung nutzen |
| 2 | R+V BU-Versicherung | KRITISCH | 840/J. | 29, Controller, KEINE BU. Jetzt abschliessen = guenstige Praemie |
| 3 | VR-FinanzPlan | Mittel | 300/J. | Keine Altersvorsorge ausser Trade Republic. VR-FinanzPlan als strukturiertes Gesamtkonzept |
| 4 | Schwaebisch Hall Bauspar | Mittel | 500/J. | 29, erste Wohnung mit Freundin. Eigentum in 5-7 Jahren? BSV jetzt starten |
| 5 | R+V KFZ + Haftpflicht | Niedrig | 425/J. | Beides ueber Check24. Bei naechster Vertragsverlagerung R+V-Buendel anbieten |

---

## B5: Andrea Lang – Firmenkunde Gastronomie

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 41 |
| Beruf | Inhaberin "Cafe Bohne" (3 Standorte Giessen), 18 Mitarbeiter, 1,8M Umsatz |
| Einkommen | GF-Gehalt 72k + Gewinn |
| Familie | Geschieden, 1 Kind (11) |
| Kunden-ID | FKB002 |
| NPS | 9 (Promoter) |

### Schicht 2: Eigene Produkte (bei Volksbank)

| Produkt | Details | Volumen |
|---|---|---|
| 3x Geschaeftskonto | Pro Standort | Saldo gesamt ~35k |
| Kontokorrentkredit | 100k Rahmen, 40k genutzt | |
| KfW-Foerderkredit | Standort 3 Eroeffnung 2023 | Restschuld 65k |
| VR Smart Finanz Praxiskredit | Kaffeemaschinen-Leasing | 12k |
| GF-Girokonto privat | | ~4.000 Saldo |

### Schicht 3: Fremdprodukte

| Produkt | Institut | Details |
|---|---|---|
| Privat-Depot | ING | 22k ETFs |
| Geschaeftsinhaltsvers. | Allianz | 3 Standorte |
| Betriebshaftpflicht | VHV | Gastronomie |
| KFZ privat | HUK | VW T-Roc |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | R+V Gewerbeversicherung (Buendel) | Hoch | 3.600/J. | Inhalts+Betriebshaftpflicht bei Fremdversicherern. R+V Gewerbe-Buendel ueber VR-Verbund deutlich guenstiger |
| 2 | Expansion Standort 4 (Finanzierung) | Hoch | 120k Kredit | Im Gespraech erwaehnt. VR Smart Finanz + KfW ERP Gruenderkredit |
| 3 | bAV fuer 18 Mitarbeiter | Mittel | 43k/J. | Gastronomie = hohe Fluktuation. bAV als Mitarbeiterbindung. R+V bAV-Loesungen |
| 4 | Privat: Union Investment Sparplan | Mittel | 500/mtl. | 22k bei ING. Vermoegensaufbau fuer Unternehmerin = wichtig (kein Arbeitgeber-Schutz) |

---

## B6: Stefan Braun – IT-Freelancer, Digital Native

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 36 |
| Beruf | Freelance Software-Entwickler (DevOps/Cloud), 95k Umsatz |
| Nettoeinkommen | ~5.000 EUR/mtl. (schwankend) |
| Familie | Ledig, keine Kinder |
| Wohnsituation | Mietwohnung Giessen-Zentrum, 55 qm, 680 warm |
| LinkedIn | 2.000+ Kontakte, Tech-Community, Speaker, sehr aktiv |
| Kunden-ID | KDB006 |
| NPS | 4 (Detractor – findet VR-Banking altmodisch) |

### Schicht 2: Eigene Produkte (bei Volksbank)

| Produkt | Details | Volumen |
|---|---|---|
| Girokonto | "Eltern-Konto" seit Kindheit, kaum genutzt | ~800 Saldo |

Ein Girokonto. 800 EUR Saldo. Alles andere ist woanders.

### Schicht 3: Fremdprodukte

| Produkt | Institut | Volumen |
|---|---|---|
| Geschaeftskonto | N26 Business | ~12k Saldo |
| Privat-Girokonto | N26 | ~3k |
| Depot | Trade Republic | 68k (Tech-Aktien + Krypto-ETPs) |
| Tagesgeld | Scalable Capital | 15k |
| BU | Keine! | |
| Haftpflicht | CosmosDirekt (Check24) | 50/J. |
| IT-Berufshaftpflicht | Hiscox | 1.200/J. |
| KFZ | Keins (CarSharing) | |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | R+V BU-Versicherung | KRITISCH | 1.800/J. | 36, Freelancer, 95k Umsatz, KEINE BU! Existenzbedrohend. R+V BU fuer IT-Berufe = guenstige Konditionen |
| 2 | VR-Geschaeftskonto als N26-Alternative | Mittel | 180/J. | N26 Business hat eingeschraenkten DATEV-Export. VR-Geschaeftskonto mit DATEV-Integration |
| 3 | Union Investment Depot | Niedrig | 68k Umschichtung | Tech-lastig + Krypto = hohes Risiko. Diversifikation vorschlagen. Aber: Schwieriger Kunde, preissensitiv, will Self-Service |
| 4 | R+V Ruerup-Rente | Hoch | 6.000/J. | Freelancer ohne Altersvorsorge. Steuerlich absetzbar. Muss aber digital abschliessbar sein |

---

# ═══════════════════════════════════════════════════════
# C. VV-PERSONAS (VV-02 / VV-10) – 5 Stueck
# ═══════════════════════════════════════════════════════

---

## W1: Dr. Heinrich von Trott – HNWI mit Nachfolgebedarf

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 62 |
| Beruf | Unternehmer, Maschinenbau (3. Generation), ~500k Gewinn |
| Familie | Verheiratet mit Elisabeth (58), Sohn Maximilian (34, SmartValue 450k), Tochter Charlotte (31, Aerztin, KEIN Mandat) |
| Wohnsituation | Villa Bad Homburg + Ferienhaus Toskana |
| LinkedIn | 200 Kontakte, Branchenverband, selten aktiv, teilt Wirtschaftsartikel |
| Segment | FairValue |
| Mandatstyp | Individuelle VV |
| Mandat seit | 2015 |
| AuM | 12,5M EUR |

### Schicht 2: Eigene Produkte (bei HRK LUNIS)

| Produkt | Details | Ertrag |
|---|---|---|
| VV-Mandat FairValue Individual | 12,5M, Risikoprofil ausgewogen, ESG Art. 8 | Management Fee 0,85% = ~106k/J. |
| Benchmark | 50% MSCI World + 30% Euro Aggregate + 20% Alternatives | |
| Asset Allocation Ist | Aktien 45%, Renten 28%, Alternatives 12%, PE 8%, Cash 7% | |
| Asset Allocation Soll | Aktien 50%, Renten 30%, Alternatives 12%, PE 5%, Cash 3% | Drift: Aktien -5pp, Cash +4pp |
| Performance YTD | +6,8% (Benchmark: +7,2%) | Leichte Underperformance |

### Schicht 3: Fremdvermoegen

| Produkt | Institut | Details | Volumen |
|---|---|---|---|
| Depot | UBS Zuerich | Konservatives Mandat, historisch gewachsen (Vater) | 2.800.000 EUR |
| Tagesgeld | Deutsche Bank | "Parkposition" nach Immobilienverkauf 2023 | 400.000 EUR |
| Immobilien | Privat | Villa Bad Homburg (geschaetzt 1,8M) + Toskana (650k) + 2 Gewerbeeinheiten (1,2M) | 3.650.000 EUR |
| Unternehmensbeteiligung | Maschinenbau GmbH | 100% Anteile, Jahresumsatz 12M, Gewinn 500k | Geschaetzt 4-5M |
| Lebensversicherung | Alte Leipziger | Kapital, Ablauf 2026 | Rueckkaufswert 320k |

Gesamtvermoegen: ~24M EUR. Davon nur 12,5M bei uns = 52% betreut.

### Schicht 4: Transaktionen (Referenzkonto, quartalsweise)

| Kategorie | Betrag | Auffaelligkeit |
|---|---|---|
| Gewinnausschuettung GmbH | +125.000/Quartal | Regelmaessig |
| Entnahme VV-Mandat | -25.000/Quartal | Lebenshaltung Premium |
| UBS Gebuehren | -8.000/Quartal | Sichtbar! Hohe Fremd-Gebuehren |
| Immobilien-Mieteingaenge | +9.000/Quartal | 2 Gewerbeeinheiten |
| PE Capital Calls | -15.000-50.000 | Unregelmaessig |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | UBS-Konsolidierung | Hoch | 2.800.000 EUR AuM | 2,8M bei UBS mit hoeheren Gebuehren. Vater's Depot, emotional behaftet. Behutsam ansprechen, Performance-Vergleich zeigen |
| 2 | Deutsche Bank Cash konsolidieren | Hoch | 400.000 EUR | 400k "geparkt" seit 2023. Bei aktuellem Zinsniveau Opportunitaetskosten. In VV-Mandat integrieren oder Kurzlaeufer |
| 3 | NextGen-Mandat Charlotte | Hoch | 300-500k Startkapital | 31, Aerztin, hohes Einkommen, KEIN Mandat. Vater als Tueroffner. SmartValue starten |
| 4 | Nachfolgeplanung Maschinenbau | Hoch | Vermittlung | 62 Jahre, 3. Generation. Sohn Maximilian nicht im Unternehmen. Verkauf in 3-5 Jahren? 4-5M Erloeos in VV-Mandat |
| 5 | Stiftungsgruendung | Mittel | 500k-1M Stiftungskapital | Alter 62 + Vermoegen >20M + keine Nachfolge im Betrieb = klassisches Stiftungs-Profil. HRK LUNIS Stiftungsmanagement |
| 6 | LV-Ablauf 2026 Wiederanlage | Hoch | 320.000 EUR | Alte Leipziger laeuft 2026 aus. Auszahlung in VV-Mandat integrieren |
| 7 | ESG-Portfolio-Upgrade Art. 8 auf Art. 9 | Niedrig | – | Charlotte (Aerztin) hat ESG-Affinitaet. Bei NextGen-Gespraech Impact-Portfolio positionieren |
| 8 | WERTIQ Family Office Anbindung | Mittel | 2.000/J. Service-Fee | Gesamtvermoegen 24M = Family-Office-Bedarf. Immobilien, PE, Tax-Planning |

---

## W2: Familie Lindenberg – Unternehmerverkauf, frisches Kapital

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 51 (er, Martin), 49 (sie, Katrin) |
| Beruf | Ex-Unternehmer (SaaS-Firma "DataFlow" 2024 verkauft fuer 8M netto), sie: Architektin (eigenes Buero, 85k) |
| Familie | 2 Kinder: Lukas (22, studiert Informatik TU Muenchen), Sophie (19, Gap Year in Neuseeland) |
| Wohnsituation | Stadtvilla Frankfurt-Westend (Eigentum, 1,2M), Ferienwohnung Sylt (450k) |
| LinkedIn | Martin: 1.500+ Kontakte, Tech/SaaS-Szene, Business Angel aktiv |
| Segment | SmartValue (aktuell), Upgrade auf FairValue geplant |
| AuM | 2,1M EUR |

### Schicht 2: Eigene Produkte (bei HRK LUNIS)

| Produkt | Details | Ertrag |
|---|---|---|
| VV-Mandat SmartValue | 1,8M Standardmandat, Risikoprofil wachstumsorientiert | Fee 0,70% = 12.600/J. |
| PE-Beteiligung (ueber uns) | 300k in HRK LUNIS PE Fund IV | Locked 7 Jahre |

### Schicht 3: Fremdvermoegen

| Produkt | Institut | Volumen | Auffaelligkeit |
|---|---|---|---|
| Girokonto | Commerzbank | 5.500.000 EUR CASH | GEPARKT SEIT VERKAUF 2024! |
| Tagesgeld | Deutsche Bank | 200.000 EUR | |
| Immobilien | Privat | 1.650.000 EUR (Stadtvilla + Sylt) | |
| Business Angel Beteiligungen | Privat | 3 Start-ups, zusammen ~400k invested | Illiquid, Risiko |
| Kapitallebensversicherung | Zurich | Rueckkaufswert 180k, Ablauf 2029 | |

Gesamtvermoegen: ~10,1M EUR. Davon nur 2,1M bei uns = 21% betreut. 5,5M CASH bei Commerzbank = riesiges Potential.

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | Commerzbank-Cash konsolidieren | KRITISCH | 5.500.000 EUR | 5,5M seit 14 Monaten unverzinst/minimal verzinst. Bei 4% Opportunitaetskosten = 220k/J. entgangene Rendite. Sofort-Termin fuer Anlagekonzept |
| 2 | Mandats-Upgrade SmartValue auf FairValue | Hoch | +2.800/J. Fee-Differenz | Mit 5,5M Zufluss waechst AuM auf 7,6M. Ab 5M = FairValue-Berechtigung. Individuelle Anlagestrategie |
| 3 | PE-Allokation erhoehen | Mittel | 500k-1M | Tech-Unternehmer versteht PE. HRK LUNIS PE Fund V in Zeichnung. Matching: SaaS-Background + Growth PE |
| 4 | NextGen-Mandat Lukas | Mittel | 200k Start | 22, studiert Informatik, erbt voraussichtlich. SmartValue mit Tech/ESG-Fokus. Early Relationship Building |
| 5 | NextGen-Mandat Sophie | Niedrig | 100k Start | 19, Gap Year. Nach Rueckkehr ansprechen. Langfristiger Vermoegensuebertrag |
| 6 | WERTIQ Immobilienberatung | Mittel | Service-Fee | 2 Immobilien (1,65M). Sylt-Ferienwohnung = Rendite-Objekt? Optimierung |
| 7 | Zurich LV Ablauf 2029 vorbereiten | Niedrig | 180k | Fruehzeitig Wiederanlage-Konzept. In 3 Jahren akut |

---

## W3: Stiftung Prof. Dr. Weber – Gemeinnuetzige Bildungsstiftung

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Stiftungsname | Prof. Dr. Werner Weber Bildungsstiftung |
| Gruendungsjahr | 2008 |
| Zweck | Foerderung naturwissenschaftlicher Bildung an Schulen |
| Vorstand | Dr. Maria Weber (Tochter, 52), Prof. Dr. Klaus Berger (Unabhaengig) |
| Segment | Stiftung |
| AuM | 8,3M EUR |

### Schicht 2: Eigene Produkte

| Produkt | Details | Ertrag |
|---|---|---|
| Spezialmandat Stiftung | 8,3M, Fokus: Ausschuettungsstabilitaet + Kapitalerhalt + ESG | Fee 0,65% = 53.950/J. |
| Benchmark | 30% Aktien + 50% Renten + 20% Immobilienfonds | |
| Ausschuettungsziel | 250.000 EUR/J. (3% des Kapitals) | |
| Status | Drift bei Renten (-3pp), ESG-Score unter Ziel (72/100 statt >80) | |

### Schicht 3: Fremdvermoegen

| Produkt | Institut | Volumen |
|---|---|---|
| Stiftungskonto | Sparkasse Frankfurt | Operativ, ~120k |
| Festgeld | Sparkasse | 500k (kurzfristige Reserve) |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | ESG-Portfolio auf Art. 9 Impact upgraden | Hoch | – | ESG-Score 72/100 unter Stiftungs-Satzungsziel (>80). Konkrete Umschichtung: Fossil-Renten raus, Green Bonds rein |
| 2 | Ausschuettungsoptimierung | Hoch | +30k/J. | Aktuell 3% Ausschuettung = 250k. Durch hoehere Dividendenstrategie + Covered Call Overlay 3,3-3,5% moeglich |
| 3 | Sparkasse-Festgeld konsolidieren | Mittel | 500k | 500k kurzfristige Reserve bei Sparkasse. In Stiftungs-Mandat als Liquiditaetstranche integrieren |
| 4 | Stiftungsforum/Netzwerk | Niedrig | Bindung | Einladung zu HRK LUNIS Stiftungsforum. Networking + Wissensvermittlung = hohe Bindung |

---

## W4: Prof. Dr. Hartmann – Arzt mit PE-Interesse

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 56 |
| Beruf | Chefarzt Kardiologie + eigene Privatpraxis, Gesamteinkommen ~350k |
| Familie | Verheiratet mit Susanne (54, Psychologin), Sohn Jan (28, Assistenzarzt, kein eigenes Mandat) |
| Wohnsituation | Penthouse Frankfurt-Sachsenhausen, Eigentum |
| LinkedIn | 150 Kontakte, Medizin-Netzwerk |
| Segment | FairValue |
| AuM | 6,8M EUR |

### Schicht 2: Eigene Produkte

| Produkt | Details | Ertrag |
|---|---|---|
| VV-Mandat FairValue Individual | 6,8M, Risikoprofil moderat-wachstum | Fee 0,80% = 54.400/J. |
| PE-Beteiligung | 200k in Healthcare PE | |
| Performance YTD | +8,1% (Benchmark +7,2%) | Outperformance |

### Schicht 3: Fremdvermoegen

| Produkt | Institut | Volumen |
|---|---|---|
| Praxiskonto | Commerzbank | ~80k Saldo |
| Privat-Tagesgeld | ING | 250k |
| Immobilie Praxis | Eigentum | Geschaetzt 800k |
| Aerzteversorgungswerk | Pflichtbeitraege | Anwartschaft ~4k/mtl. |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | PE-Allokation erhoehen (Healthcare + Life Sciences) | Hoch | 500k | Chefarzt versteht Healthcare. PE Fund mit Medtech/BioTech-Fokus = fachliche Naehe |
| 2 | ING-Tagesgeld konsolidieren | Mittel | 250k | 250k bei ING. In VV-Mandat als Liquiditaetstranche |
| 3 | NextGen-Mandat Sohn Jan | Mittel | 200k Start | 28, Assistenzarzt, gutes Einkommen absehbar. SmartValue mit langer Laufzeit |
| 4 | Nachfolgeplanung Praxis | Hoch | Vermittlung | 56, Privatpraxis. Verkauf in 5-10 Jahren? Erloeos ins VV-Mandat |
| 5 | Praxis-Vermoegen strukturieren | Mittel | 800k | Praxis-Immobilie im Privatvermoegen. Steueroptimierung durch Umstrukturierung |

---

## W5: Keller NextGen – Junger Tech-Gruender

### Schicht 1: Stammdaten

| Feld | Wert |
|---|---|
| Alter | 29 |
| Name | Tim Keller |
| Beruf | Tech-Gruender, Seed-Exit 2024 (500k netto), jetzt Co-Founder neues Start-up |
| Familie | Ledig, Freundin |
| Wohnsituation | Mietwohnung Frankfurt-Nordend |
| LinkedIn | 3.000+ Kontakte, Start-up-Szene, Speaker, sehr aktiv |
| Segment | SmartValue |
| AuM | 450.000 EUR |

### Schicht 2: Eigene Produkte

| Produkt | Details | Ertrag |
|---|---|---|
| VV-Mandat SmartValue | 450k, Risikoprofil wachstum, Tech/ESG-uebergewichtet | Fee 0,70% = 3.150/J. |

### Schicht 3: Fremdvermoegen

| Produkt | Institut | Volumen |
|---|---|---|
| Girokonto | N26 | ~8k |
| Krypto-Portfolio | Coinbase/Ledger | ~120k (BTC, ETH, SOL) – NICHT in FIDA |
| Start-up Beteiligung | Eigenes neues Unternehmen | 50k invested, Wert unklar |
| Angel Investments | 2 Start-ups | 80k invested |

### Schicht 5: Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | Mandatstyp-Upgrade bei naechstem Exit | Hoch | 1-5M potentiell | Neues Start-up. Bei erfolgreichem Exit → FairValue. Beziehung JETZT aufbauen |
| 2 | Krypto-Allokation strukturieren | Mittel | 120k | 120k Krypto auf privaten Wallets. In reguliertes Krypto-ETP umschichten? Risk-Management |
| 3 | Angel-Investments dokumentieren | Niedrig | 80k | 2 Angel-Investments ohne Reporting. In Gesamtvermoegensaufstellung aufnehmen fuer vollstaendiges Bild |
| 4 | ESG Impact-Fokus | Mittel | – | Tech-Gruender mit Nachhaltigkeits-Affinitaet. Art. 9 Impact-Beimischung |
| 5 | Versicherungsbedarf (Key-Man) | Cross-Sell | Vermittlung | Start-up-Gruender ohne Key-Man-Insurance. Vermittlung an R+V/Partner |

---

# ═══════════════════════════════════════════════════════
# D. EINHEITLICHES DATENSCHEMA (alle Modi)
# ═══════════════════════════════════════════════════════

```javascript
{
  // ── Schicht 1: Stammdaten ──
  name: String,
  id: String,                    // KD00001 / KDB001 / VV001
  geburtsdatum: String,          // '1984-03-15'
  alter: Number,
  geschlecht: String,            // 'm', 'w', 'd'
  beruf: String,
  arbeitgeber: String,
  bruttoeinkommen: Number,
  nettoeinkommen: Number,
  familienstand: String,         // 'verheiratet', 'ledig', 'geschieden'
  partner: {
    name: String,
    beruf: String,
    einkommen: Number            // Netto
  } | null,
  kinder: [{
    name: String,
    alter: Number,
    eigeneProdukte: Boolean,     // Hat eigenes Mandat/Konto?
    details: String              // 'studiert BWL Muenchen'
  }],
  adresse: String,
  wohnsituation: 'eigentum' | 'miete',
  wohnflaeche: Number,
  linkedin: {
    kontakte: Number,
    aktivitaet: 'hoch' | 'mittel' | 'niedrig' | 'nicht_vorhanden',
    branchen: [String],
    zusammenfassung: String
  },
  lebenssituation: String,       // 'aufbau', 'konsolidierung', 'pre-retirement', 'ruhestand'
  
  // ── Schicht 2: Eigene Produkte ──
  eigeneProdukte: [{
    typ: String,          // 'bu', 'kfz', 'hausrat', 'haftpflicht', 'wohngebaeude',
                          // 'girokonto', 'sparkonto', 'depot', 'baufi', 'kreditkarte', 'bauspar',
                          // 'vv-mandat', 'pe-beteiligung'
    produkt: String,      // 'ERGO BU Comfort', 'VR-MeinKonto', 'FairValue Individual VV'
    details: String,      // '1.800 EUR/mtl. Rente', '285k Restschuld 1,8% bis 09/2027'
    praemieOderErtrag: Number,  // Jaehrlich
    seit: String,
    status: String        // 'aktiv', 'optimierbar', 'auslaufend', 'kuendigungsgefahr'
  }],
  
  // ── Schicht 3: Fremdprodukte ──
  fremdProdukte: [{
    typ: String,
    produkt: String,
    institut: String,     // 'ING', 'Allianz', 'Trade Republic', 'UBS'
    details: String,
    volumenOderPraemie: Number,
    consent: Boolean,     // FIDA-Consent erteilt?
    gueltigBis: String | null
  }],
  
  // ── Schicht 4: Transaktionen ──
  transaktionen: [{
    kategorie: String,    // 'gehalt', 'gehalt_partner', 'kindergeld',
                          // 'miete', 'baufi', 'sparplan', 'versicherung_eigen',
                          // 'versicherung_fremd', 'konsum', 'reisen', 'abos',
                          // 'kinder', 'freizeit', 'mobilitaet', 'sonstiges'
    betrag: Number,       // Positiv = Eingang, Negativ = Ausgang
    empfaenger: String,   // 'ERGO', 'Trade Republic', 'ING DiBa'
    auffaelligkeit: String | null
                          // 'geldabfluss_fremdbank', 'steigend', 'neu',
                          // 'zinsbindung_endet', 'fremdversicherer', null
  }],
  
  // ── Abgeleitete Werte ──
  haushaltsnetto: Number,          // Netto + Partner + Kindergeld etc.
  absicherungsquote: Number,       // Summe Versicherungspraemien / Haushaltsnetto in %
  sparquote: Number,               // Summe Sparraten / Haushaltsnetto in %
  freiVerfuegbar: Number,          // Haushaltsnetto - alle Ausgaben
  fremdProduktAnteil: Number,      // Volumen Fremdprodukte / Gesamtvolumen in %
  
  // ── Schicht 5: Potentiale ──
  potentiale: [{
    titel: String,                 // 'BU-Nachversicherung 1.800 auf 2.600 EUR/mtl.'
    typ: 'whitespot' | 'anpassung' | 'cross_sell' | 'aktion',
    quellen: [String],             // OPT-19: 'bestand', 'finanztransaktion', 'lebensereignis',
                                   // 'wettbewerb', 'kommunikation', 'markt'
    prioritaet: 'kritisch' | 'hoch' | 'mittel' | 'niedrig',
    volumen: Number,
    volumenTyp: 'jaehrlich' | 'einmalig' | 'vermittlung',
    beschreibung: String,          // 2-3 Saetze Herleitung
    empfohleneAktion: String,      // 'angebot_erstellen', 'termin_vereinbaren',
                                   // 'tarifvergleich', 'bindungsgespraech', 'vormerken'
    produktEmpfehlung: String      // 'ERGO BU Comfort Plus', 'Union Investment UniGlobal'
  }],
  
  // ── Scores ──
  nps: Number,                     // 0-10
  risikoscore: Number,             // 0-100
  risikoDetails: {
    bonitaet: Number,              // 0-100
    zahlungsverhalten: Number,
    verschuldungsgrad: Number,
    einkommensstabilitaet: Number
  },
  potentialScore: Number,          // 1-5 Sterne (OPT-20-A)
  clv: Number,                     // Customer Lifetime Value
  abwanderungsrisiko: 'hoch' | 'mittel' | 'niedrig',
  
  // ── Kommunikation (OPT-15) ──
  kommunikation: [{
    datum: String,
    typ: String,                   // 'email', 'telefon', 'termin', 'chatbot', 'brief'
    richtung: 'eingehend' | 'ausgehend',
    betreff: String,
    zusammenfassung: String,
    stimmung: 'positiv' | 'neutral' | 'negativ' | null
  }],
  
  // ── Meta ──
  _modus: 'versicherung' | 'banking' | 'vermoegensverwaltung',
  foto: String | null              // URL oder null (dann Initialen-Avatar)
}
```

---

# ═══════════════════════════════════════════════════════
# E. ZUSAMMENFASSUNG
# ═══════════════════════════════════════════════════════

## 19 Personas ueber 3 Modi

| Modus | # | Personas | Bandbreite |
|---|---|---|---|
| Versicherung | 8 | V1-V8 | 28j. Designerin (1 Produkt) bis 62j. Rentner (6 Vertraege) |
| Banking | 6 | B1-B6 | 29j. Berufseinsteiger (nur Girokonto) bis 58j. GmbH-GF (6 Konten) |
| VV | 5 | W1-W5 | 29j. Tech-Gruender (450k) bis 62j. Unternehmer (12,5M) + Stiftung (8,3M) |
| **Gesamt** | **19** | | Alle mit 5 Datenschichten, plausiblen Zahlen, nachvollziehbaren Potentialen |

## Realismus-Checks die Claude Code machen muss

- Einnahmen minus Ausgaben = frei verfuegbar (MUSS positiv sein)
- Fremdprodukte passen zum Lebensstil (kein Trade Republic fuer 62-Jaehrigen Rentner)
- Potentiale leiten sich aus Daten ab (nicht willkuerlich)
- Cross-Selling-Richtungen stimmen (Bank→Versicherung: Baufi→RLV, Versicherung→Bank: Depot statt Fremd-ETF)
- LinkedIn-Profile passen zum Beruf (IT-Projektleiter 500+, Handwerker nicht aktiv)
- Absicherungsquote realistisch (Durchschnitt DE: ~4-6% des Nettos)
- Sparquote realistisch (Durchschnitt DE: ~10-12% des Nettos)

---

# ═══════════════════════════════════════════════════════
# F. CLAUDE-CODE PROMPT
# ═══════════════════════════════════════════════════════

```
Teile die gesamte Arbeit in einzelne Schritte auf und nutze die TodoList, damit ich jederzeit 
nachvollziehen kann, wo du im Prozess steckst. Erstelle die Todos BEVOR du mit der Arbeit beginnst.
Schreibe Aenderungen SOFORT in die Dateien – nicht erst am Ende gesammelt.

KONTEXT: Die Mock-Daten im Tool brauchen realistische Personas mit 5 Datenschichten:
Stammdaten (inkl. LinkedIn), eigene Produkte, Fremdprodukte (Open Finance), Transaktionen, Potentiale.
19 Personas: 8 Versicherung, 6 Banking, 5 VV. Jede mit plausiblen Zahlen.
Datenschema ist in OPT-26 Abschnitt D definiert – exakt dieses Format verwenden.

Todos:

=== Phase 1: Bestehendes Format verstehen ===

- [ ] js/kunden-detail-data.js lesen: mockKunden Objekt-Struktur dokumentieren
- [ ] js/kunden-detail-banking.js lesen: bankMockKunden Objekt-Struktur dokumentieren
- [ ] js/vv-mock-data.js lesen: vvMockMandanten Objekt-Struktur dokumentieren
- [ ] Delta identifizieren: Was fehlt gegenueber OPT-26 Schema? (linkedin, fremdProdukte, transaktionen, potentiale mit quellen, risikoscore Details)
- [ ] Migrationsstrategie festlegen: Bestehende Felder beibehalten + neue ergaenzen

=== Phase 2: Versicherungs-Personas V1-V8 ===

- [ ] V1 Peter Schmidt: Stammdaten (42, IT-PL, 75k, verh., 2 Kinder, EFH Koeln)
- [ ] V1: eigeneProdukte (BU 2.160/J, KFZ 680/J, Hausrat 180/J FALSCH, Haftpflicht 95/J)
- [ ] V1: fremdProdukte (Sparkasse Baufi 285k Zinsbindung 09/2027, ING Depot 42k, DKB Tagesgeld 8.5k, Allianz RLV 150k, KfW 12k)
- [ ] V1: transaktionen (Gehalt 4.200+1.800, Baufi -1.050, ETF -300 FREMD, Kita -380, Konsum -1.200)
- [ ] V1: potentiale (8 Stueck: BU-Nach, Hausrat-Upgrade, Fondspolice, RLV-Erhoehung, Unfall, Rechtsschutz, Pflege Eltern, Baufi-Anschluss)
- [ ] V1: linkedin, nps=8, risikoscore=28, kommunikation
- [ ] V2 Amira Koenig komplett: 28, Designerin, NUR KFZ, N26+TradeRep+Commerzbank, BU+Haftpflicht FEHLEN
- [ ] V3 Thomas Weber komplett: 55, Handwerker, 7 Vertraege, NPS=5 DETRACTOR, VB+R+V+DKB Fremd, Nachfolge
- [ ] V4 Anna Hoffmann komplett: 35, Aerztin 105k, nur Haftpfl+Hausrat, BU Arzt-Tarif FEHLT
- [ ] V5 Klaus Meier komplett: 48, Beamter A14 PKV, 6 Vertraege, DU+Pflege fehlen
- [ ] V6 Lisa Bauer komplett: 31, Freelancerin, NUR Haftpflicht, ALLES fehlt
- [ ] V7 Michael Braun komplett: 62, Rentner, 6 Vertraege, vermoegend, Pflege+Sterbegeld
- [ ] V8 Sandra Yilmaz komplett: 38, Pharma 95k, Dual Income, Eigentum geplant, BU zu niedrig
- [ ] Alle V-Personas in mockKunden Array integrieren (bestehende ersetzen)
- [ ] Testen: A-10 oeffnen, jeden Kunden durchklicken, individuelle Daten pruefen

=== Phase 3: Banking-Personas B1-B6 ===

- [ ] B1 Klaus Fischer: VR-Konto+Sparkonto 15k+Baufi 185k ZINSBINDUNG 04/2026+Visa+BSV 30k, Fremd: TradeRep 28k+ING 22k+HUK+HDI+Allianz+AltLeipz
- [ ] B1: transaktionen (Gehalt 4.500+1.800, Baufi -850, TradeRep -500 FREMD, ING -1.000 FREMD)
- [ ] B1: potentiale (8: Anschlussfinanzierung KRITISCH, VR-FinanzPlan, VermoegenPlus, Tagesgeld-Konso, R+V KFZ, R+V RLV, BSV Neu, FIDA-Consent)
- [ ] B2 Sandra Mueller komplett: 33, Lehrerin verbeamtet, Ehemann bei Commerzbank, EK 35k, Baufi vorbereiten
- [ ] B3 Peter Hoffmann komplett: 58, FK GmbH-GF, 3 Firmenkonten, DB Depot 280k, D&O+bAV+Nachfolge
- [ ] B4 Markus Wagner komplett: 29, Junior Controller, NUR Girokonto, TradeRep 5.2k, BU FEHLT
- [ ] B5 Andrea Lang komplett: 41, FK 3 Cafes 18MA, VR SmartFinanz+KfW, R+V Gewerbe-Buendel
- [ ] B6 Stefan Braun komplett: 36, IT-Freelancer, NPS=4 DETRACTOR, alles bei N26+TradeRep 68k, BU FEHLT
- [ ] Alle B-Personas in bankMockKunden integrieren
- [ ] Testen: B-10 oeffnen, jeden Kunden durchklicken

=== Phase 4: VV-Personas W1-W5 ===

- [ ] W1 Dr. von Trott: Bestehenden Mandanten ergaenzen um LinkedIn, Transaktionen (Ausschuettung 125k/Q, UBS-Gebuehren sichtbar), erweiterte Fremdprodukte (UBS 2.8M, DB 400k, Immobilien 3.65M, GmbH 4-5M), 8 Potentiale
- [ ] W2 Lindenberg komplett: 51+49, SaaS-Exit 8M, AuM 2.1M, FREMD: 5.5M CASH Commerzbank!, Upgrade SmartValue->FairValue
- [ ] W3 Stiftung Weber komplett: 8.3M Stiftung, ESG-Score 72 unter Ziel, Ausschuettungsoptimierung
- [ ] W4 Prof. Dr. Hartmann komplett: 56, Chefarzt 350k, 6.8M FairValue, PE Healthcare, Sohn Assistenzarzt
- [ ] W5 Keller NextGen komplett: 29, Tech-Gruender, 450k SmartValue, 120k Krypto, Start-up, Upgrade bei Exit
- [ ] Alle W-Personas in vvMockMandanten integrieren
- [ ] Testen: VV-10 oeffnen, jeden Mandanten durchklicken

=== Phase 5: Validierung ===

- [ ] V1-V8: Einnahmen - Ausgaben = frei verfuegbar (positiv?)
- [ ] B1-B6: Einnahmen - Ausgaben = frei verfuegbar (positiv?)
- [ ] W1-W5: AuM + Fremdvermoegen = plausibles Gesamtvermoegen?
- [ ] Alle Personas: Fremdprodukte passen zum Alter/Beruf/Lebensstil?
- [ ] Alle Personas: Potentiale leiten sich nachvollziehbar aus Daten ab?
- [ ] Alle Personas: Cross-Selling-Richtungen korrekt? (Bank->Vers und Vers->Bank)
- [ ] Alle Personas: LinkedIn-Profile passen zum Beruf?
- [ ] Absicherungsquoten realistisch? (DE Durchschnitt ~4-6%)
- [ ] Sparquoten realistisch? (DE Durchschnitt ~10-12%)
- [ ] NPS-Verteilung realistisch? (Mix aus Promoter, Passiv, Detractor)

Einfarbige SVG-Icons (stroke-only). Keine Emojis.
```

---

> **Ende OPT-26 Spezifikation** | Stand: 2026-03-11

---

# ═══════════════════════════════════════════════════════════
# B. BANKING-PERSONAS (B-02 / B-10) – 6 Stueck
# ═══════════════════════════════════════════════════════════

## B1: Klaus Fischer – Retail-Kunde mit Verbundpartner-Potenzial

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Klaus Fischer |
| Alter | 45 |
| Geburtsdatum | 19.06.1980 |
| Beruf | Vertriebsleiter Mittelstand (angestellt) |
| Arbeitgeber | Viessmann Climate Solutions SE |
| Bruttoeinkommen | 85.000 EUR/J. |
| Nettoeinkommen | 4.500 EUR/mtl. |
| Familienstand | Verheiratet mit Nicole (43, Steuerberaterin Teilzeit, 2.200 EUR netto) |
| Kinder | Luisa (12), Paul (9) |
| Adresse | Schillerstr. 8, 35390 Giessen |
| Wohnsituation | Eigentum – DHH, Baufi ueber uns |
| LinkedIn | 400+ Kontakte, B2B-Vertrieb, postet ueber Sales-Methoden |
| Lebenssituation | Konsolidierung – etabliert, Vermoegensaufbau |
| Kundennummer | KDB001 |
| Kunde seit | 2012 |
| NPS | 7 (Passiv) |

### Eigene Produkte (bei Volksbank Mittelhessen)

| # | Produkt | Details | Ertrag fuer Bank |
|---|---|---|---|
| 1 | VR-MeinKonto (Giro) | Gehaltseingang 4.500 EUR + Nicole 2.200 EUR | Kontofuehrung 8,90 EUR/mtl. |
| 2 | Sparkonto | 15.000 EUR, 0,5% Zins | Marge ~0,8% |
| 3 | Baufinanzierung | 185.000 EUR Restschuld, 1,2% Zins, **Zinsbindung endet 04/2026!** | 2.775 EUR/J. Zinsertrag |
| 4 | Visa Gold Kreditkarte | Umsatz ~800 EUR/mtl., Jahresgebuehr 60 EUR | 60 EUR + Interchange |
| 5 | Schwaebisch Hall Bauspar | 30.000 EUR Guthaben, ZUTEILUNGSREIF, keine Einzahlung mehr | Bestandsprovision |
| 6 | KEIN VR-FinanzPlan | – | Fehlt! |
| 7 | KEIN Depot | – | Fehlt! |

**Gesamt Ertrag:** ~4.200 EUR/J. – Baufi dominiert, nach Zinsbindungsende sinkt der Ertrag MASSIV

### Fremdprodukte (Open Finance / FIDA sichtbar)

| # | Produkt | Institut | Details | Volumen | Consent |
|---|---|---|---|---|---|
| 1 | Depot | Trade Republic | 28.000 EUR: DAX-ETF, Nasdaq-100-ETF, 3 Einzelaktien. Sparplan 500 EUR/mtl. | 28.000 EUR | Ja |
| 2 | Tagesgeld | ING | 22.000 EUR, 2,8% Zins (hoeher als VR!) | 22.000 EUR | Ja |
| 3 | KFZ-Versicherung | HUK-Coburg | 2 PKW (VW Passat + Fiat 500), VK + TK | 1.200 EUR/J. | Ja |
| 4 | BU-Versicherung | HDI | 2.000 EUR/mtl. Rente | 1.680 EUR/J. | Ja |
| 5 | Haftpflicht | Allianz | Familie 10M | 95 EUR/J. | Ja |
| 6 | Kapital-Lebensversicherung | Alte Leipziger | Ablauf 2032, 180 EUR/mtl., RKW ~65.000 EUR | 2.160 EUR/J. | Nein |

### Transaktionsmuster (monatlich)

| Kategorie | Betrag | Empfaenger | Auffaelligkeit |
|---|---|---|---|
| Gehalt Klaus | +4.500 EUR | Viessmann | |
| Gehalt Nicole | +2.200 EUR | Steuerbuero | |
| Baufi-Rate | -850 EUR | VR intern | Endet bald! |
| Trade Republic Sparplan | -500 EUR | Trade Republic | **GELD FLIESST AN FREMDBANK** |
| ING Ueberweisung | -1.000 EUR | ING | **GELD FLIESST AN FREMDBANK** |
| Versicherungen (Fremd) | -420 EUR | HUK, HDI, Allianz | Alles bei Fremdversicherern |
| Alte Leipziger LV | -180 EUR | Alte Leipziger | |
| Schwaebisch Hall | 0 EUR | – | Zuteilungsreif, keine Einzahlung |
| Lebensmittel | -900 EUR | | |
| Strom/Gas | -250 EUR | | |
| Kinder (Verein, Musik) | -280 EUR | | |
| Auto (2x) | -350 EUR | | |
| Urlaub (Ruecklage) | -300 EUR | | |
| Restaurant/Freizeit | -250 EUR | | |
| **Frei verfuegbar** | **~620 EUR** | | |

**Kernproblem:** 1.500 EUR/mtl. fliessen an Trade Republic + ING = 18.000 EUR/J. Wertschoepfung bei Fremdinstituten!

### Vertriebspotentiale

| # | Potential | Typ | Quellen | Prio | Volumen | Herleitung |
|---|---|---|---|---|---|---|
| 1 | **Anschlussfinanzierung** | Anpassung | Bestand + Markt | **Kritisch** | 2.775 EUR/J. Zins | Zinsbindung 04/2026 – in wenigen Wochen! Forward-Darlehen JETZT |
| 2 | **Union Investment Sparplan** (statt Trade Republic) | Whitespot | Finanztransaktion | Hoch | 1.800 EUR/J. Provision | 500 EUR/mtl. Sparplan geht an Fremd! VR-FinanzPlan anbieten |
| 3 | **VermoegenPlus Depot** (Trade Republic Depot umschichten) | Whitespot | Finanztransaktion | Hoch | 675 EUR/J. | 28.000 EUR bei Trade Republic ohne Beratung |
| 4 | **Tagesgeld-Konsolidierung** (ING→VR) | Anpassung | Finanztransaktion | Mittel | 150 EUR/J. | 22.000 EUR bei ING zu 2,8%, VR bietet Sonderkonditionen |
| 5 | **R+V KFZ-Versicherung** (statt HUK) | Cross-Sell | Wettbewerb | Mittel | 540 EUR/J. | 2 PKW bei HUK-Coburg, R+V Bundle-Rabatt |
| 6 | **R+V Risikoleben** (Baufi-Absicherung) | Cross-Sell | Bestand + Lebensereignis | Hoch | 360 EUR/J. | 185k Baufi, 2 Kinder, keine RLV vorhanden! |
| 7 | **Schwaebisch Hall Bauspar NEU** (Modernisierung) | Whitespot | Bestand | Niedrig | 500 EUR/J. | Alter BSV zuteilungsreif, DHH 20J alt → Modernisierung |
| 8 | **FIDA-Consent erweitern** | Infra | Bestand | Mittel | – | Alte Leipziger hat keinen Consent → Daten fehlen |

---

## B2: Sandra Mueller – Junge Familie, Vermoegensaufbau, Eigentum geplant

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Sandra Mueller |
| Alter | 33 |
| Beruf | Lehrerin (verbeamtet, A12), Gymnasium |
| Nettoeinkommen | 3.600 EUR/mtl. |
| Partner | Tobias Mueller (35), Maschinenbauingenieur Opel, 4.200 EUR netto |
| Kinder | Mia (2), zweites Kind geplant |
| Wohnsituation | Miete 1.100 EUR kalt, 3-Zi Giessen. **Eigentum geplant in 2-3 Jahren** |
| LinkedIn | Wenig aktiv, Bildungs-Community |
| Kundennummer | KDB002 |
| NPS | 8 |

### Eigene Produkte (bei VR)

| Produkt | Details |
|---|---|
| Girokonto Sandra | Besoldung 3.600 EUR |
| Sparkonto | 35.000 EUR – explizit fuer Eigenkapital! |
| Kreditkarte | Visa Classic, Umsatz 400 EUR/mtl. |

**Kein Depot, kein Bauspar, kein VR-FinanzPlan, KEIN Tobias-Konto bei uns**

### Fremdprodukte

| Produkt | Institut | Details |
|---|---|---|
| Girokonto Tobias | Commerzbank | Gehalt 4.200 EUR → nicht bei uns! |
| Depot Tobias | Commerzbank Depot | 45.000 EUR ETFs |
| Tagesgeld Tobias | DKB | 18.000 EUR |
| BU Sandra | Allianz | 1.800 EUR/mtl. Rente |
| BU Tobias | HDI | 2.000 EUR/mtl. Rente |
| KFZ Sandra | DEVK | Opel Corsa |
| KFZ Tobias | HUK24 | VW Golf |
| Haftpflicht | Allianz | Familie |

### Transaktionsmuster

| Kategorie | Betrag | Auffaelligkeit |
|---|---|---|
| Besoldung Sandra | +3.600 EUR | |
| Tobias Ueberweisung (Haushalt) | +2.000 EUR | Teilbetrag seines Gehalts |
| Miete | -1.100 EUR | |
| Sparkonto Eigenkapital | -500 EUR | Regelmaessig! |
| Versicherungen Fremd | -380 EUR | |
| Kita | -250 EUR | |
| Lebensmittel/Haushalt | -850 EUR | |
| **Frei verfuegbar** | **~520 EUR** | |

### Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | **Baufinanzierung vorbereiten** | **Kritisch** | 300.000+ EUR | EK waechst (35k+18k), Eigentum geplant, Vorab-Beratung JETZT |
| 2 | **Tobias Konto zu VR holen** | Hoch | Gesamtbankverbindung | 4.200 EUR Gehalt geht an Commerzbank! |
| 3 | **Schwaebisch Hall Bauspar** (Zinssicherung) | Hoch | 500 EUR/J. | Steigende Zinsen, EK sichern |
| 4 | **VR-FinanzPlan Familie** | Mittel | 1.200 EUR/J. | Kein ganzheitlicher Finanzplan vorhanden |
| 5 | **R+V RLV** (wenn Immobilie kommt) | Hoch | 360 EUR/J. | Pflicht bei Baufi mit 2 Kindern |
| 6 | **R+V KFZ** (beide PKW) | Cross-Sell | Niedrig | 850 EUR/J. | Bundle mit Baufi/Bauspar |
| 7 | **Union Investment Sparplan Tobias** | Whitespot | Hoch | 1.800 EUR/J. | 45k Depot bei Commerzbank ohne VR-Beratung |

---

## B3: Peter Hoffmann – Firmenkunde GmbH-Geschaeftsfuehrer

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Peter Hoffmann |
| Alter | 58 |
| Beruf | Geschaeftsfuehrer Hoffmann Metallbau GmbH (35 Mitarbeiter) |
| Firmenumsatz | 4,2 Mio. EUR/J. |
| GF-Gehalt | 180.000 EUR brutto, ~8.000 EUR netto |
| Familienstand | Verheiratet, 2 erw. Kinder (30, 27) |
| Wohnsituation | Villa Wetzlar, abbezahlt |
| Kundennummer | FKB001 |
| NPS | 8 |

### Eigene Produkte

| Produkt | Details |
|---|---|
| Firmenkonto 1 | Laufende Geschaefte, Umsatz 350k/mtl. |
| Firmenkonto 2 | Ruecklagen, 180.000 EUR |
| Firmenkonto 3 | Lohn/Gehalt-Konto, 35 MA |
| Privatkonto | GF-Gehalt |
| KfW-Kredit (Firma) | Investitionskredit 2023, 250.000 EUR Restschuld |
| Geschaefts-Kreditkarte | Visa Business, 3.000 EUR/mtl. |

### Fremdprodukte

| Produkt | Institut |
|---|---|
| Privat-Depot | Deutsche Bank, 320.000 EUR |
| Gewerbeversicherung | Zurich (Haftpflicht, Inhalts, BU-Gewerbe) |
| D&O-Versicherung | KEINE → Risiko! |

### Vertriebspotentiale

| # | Potential | Prio | Herleitung |
|---|---|---|---|
| 1 | **VR-Firmendepot** (Firmengelder anlegen) | Hoch | 180k Ruecklagen auf Firmenkonto ohne Rendite |
| 2 | **D&O ueber R+V** | Kritisch | GmbH-GF ohne D&O = persoenliches Haftungsrisiko! |
| 3 | **Nachfolgeberatung** | Hoch | 58J, kein Nachfolger benannt |
| 4 | **Privat-Depot zu VR** | Mittel | 320k bei Deutsche Bank, kein Bezug zum Firmenberater |
| 5 | **R+V Gewerbe-Paket** | Cross-Sell | Gewerbeversicherung komplett bei Zurich |

---

## B4: Markus Wagner – Berufseinsteiger, nur Girokonto

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Markus Wagner |
| Alter | 29 |
| Beruf | Junior Controller, Schunk Group |
| Nettoeinkommen | 2.600 EUR/mtl. |
| Familienstand | Ledig, Freundin |
| Wohnsituation | Miete 680 EUR kalt, 2-Zi Giessen |
| LinkedIn | 200 Kontakte, Finance Community |
| NPS | 7 |

### Eigene Produkte: NUR Girokonto (Gehaltseingang 2.600 EUR)

### Fremdprodukte: Scalable Capital Depot (12.000 EUR), DKB Tagesgeld (4.500 EUR), Eltern haben R+V Haftpflicht (laeuft aus wenn 30!)

### Vertriebspotentiale

| # | Potential | Prio | Herleitung |
|---|---|---|---|
| 1 | **Union Investment ETF-Sparplan** | Hoch | 12k bei Scalable ohne VR-Bindung |
| 2 | **R+V BU-Versicherung** | Kritisch | 29J, KEINE BU! |
| 3 | **Schwaebisch Hall Bauspar** | Mittel | Junger Sparer, VL-faehig |
| 4 | **VR-FinanzPlan** | Mittel | Kein Finanzueberblick |
| 5 | **R+V Haftpflicht** (Eltern-Police endet!) | Hoch | Wird 30, faellt aus Familientarif |

---

## B5: Andrea Lang – Firmenkundin, Inhaberin Cafe-Kette

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Andrea Lang |
| Alter | 41 |
| Beruf | Inhaberin "Kaffeekultur" (3 Cafes in Giessen + Wetzlar) |
| Firmenumsatz | 1,8 Mio. EUR/J. |
| Nettoeinkommen | ~4.500 EUR/mtl. |
| Familienstand | Ledig |
| Kundennummer | FKB002 |
| NPS | 9 |

### Eigene Produkte: 2 Firmenkonten, 1 Privatkonto, VR Smart Finanz (Kontokorrent 50k), Geschaefts-KK

### Fremdprodukte: Gewerbeversicherung ueber Makler (Mannheimer), Privat-Haftpflicht Allianz, Depot ING (25.000 EUR)

### Vertriebspotentiale

| # | Potential | Prio | Herleitung |
|---|---|---|---|
| 1 | **KfW-Kredit Expansion** (4. Cafe geplant) | Hoch | Gespraech ueber Expansion |
| 2 | **R+V Gewerbe-Paket** | Mittel | Mannheimer-Police laeuft aus |
| 3 | **R+V BU** | Kritisch | Selbstaendig ohne BU! |
| 4 | **Union Investment Sparplan** | Mittel | 25k Depot bei ING |
| 5 | **Schwaebisch Hall** (Gewerbeimmobilie?) | Niedrig | Mietet aktuell alle Cafes |

---

## B6: Stefan Braun – Digital Native, kaum VR-Produkte

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Stefan Braun |
| Alter | 36 |
| Beruf | IT-Freelancer (Cloud/DevOps), 95.000 EUR Umsatz |
| Nettoeinkommen | ~5.000 EUR/mtl. (nach Steuern + KV) |
| Familienstand | Ledig |
| Wohnsituation | Miete 950 EUR, Loft Giessen |
| LinkedIn | 1.500 Kontakte, Tech-Community, sehr aktiv |
| NPS | 5 (Detractor – "VR ist zu langsam/analog") |

### Eigene Produkte: NUR Girokonto (Restbestand aus Kindheit, 800 EUR drauf), KAUM Nutzung

### Fremdprodukte: N26 Business (Hauptkonto!), Trade Republic Depot (55.000 EUR), Wise-Konto (int. Kunden), HUK24 KFZ, KEINE BU, KEINE Haftpflicht

### Vertriebspotentiale

| # | Potential | Prio | Herleitung |
|---|---|---|---|
| 1 | **Hauptbankverbindung zurueckgewinnen** | Hoch | N26 ist Hauptkonto, VR nur Karteileiche |
| 2 | **R+V BU** | Kritisch | Freelancer, 95k Umsatz, KEINE BU! |
| 3 | **R+V Berufshaftpflicht IT** | Kritisch | Cloud-Consultant ohne Berufshaftpflicht |
| 4 | **VR Smart Business** (Geschaeftskonto) | Hoch | N26 Business hat keine Kreditlinie |
| 5 | **Union Investment / Depot** | Mittel | 55k bei Trade Republic |
| 6 | **Ruerup-Rente** | Hoch | Freelancer ohne Altersvorsorge |

---

# ═══════════════════════════════════════════════════════════
# C. VERMOEGENSVERWALTUNGS-PERSONAS (VV-02/VV-10) – 5 Stueck
# ═══════════════════════════════════════════════════════════

## W1: Dr. Heinrich von Trott – HNWI mit Nachfolgebedarf

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Dr. Heinrich von Trott |
| Alter | 62 |
| Geburtsdatum | 08.04.1963 |
| Beruf | Geschaeftsfuehrender Gesellschafter, von Trott Maschinenbau GmbH (3. Generation) |
| Firmenumsatz | 45 Mio. EUR, 280 Mitarbeiter |
| Persoenl. Gewinn | ~500.000 EUR/J. (Geschaeftsfuehrergehalt + Ausschuettung) |
| Familienstand | Verheiratet mit Elisabeth (59), Stiftungsraetin |
| Kinder | Maximilian (34, eigenes SmartValue-Mandat 450k), Charlotte (31, Rechtsanwaeltin Frankfurt, KEIN Mandat) |
| Adresse | Taunusblick 1, 61352 Bad Homburg |
| LinkedIn | 200 Kontakte, Branchenverband VDMA, selten aktiv, teilt Wirtschaftsartikel |
| Lebenssituation | Konsolidierung → Uebergang: Nachfolge, Stiftung, Vermoegensstrukturierung |
| Mandantenkennung | VV001 |
| Mandant seit | 2015 |
| NPS | 9 |

### Eigene Produkte (bei HRK LUNIS)

| Produkt | Details |
|---|---|
| Individuelle Vermoegensverwaltung | FairValue-Mandat, AuM 12,5 Mio. EUR |
| Risikoprofil | Ausgewogen (SAA: 45% Aktien, 30% Renten, 15% Alternatives, 10% Cash) |
| ESG-Praeferenz | Art. 8 (Nachhaltigkeitspraeferenz) |
| Benchmark | 40% MSCI World + 30% Bloomberg Agg + 30% HFRI |
| Management Fee | 0,85% p.a. |
| Performance Fee | 10% ueber Benchmark (High Watermark) |
| Ertrag fuer HRK LUNIS | ~106.000 EUR/J. Management Fee + Performance |

### Fremdvermoegen

| Typ | Institut | Volumen | Details |
|---|---|---|---|
| Depot | UBS Zuerich | 2.800.000 EUR | Konservative Renten-Strategie, historisch (Vater eroeffnet) |
| Tagesgeld | Deutsche Bank | 400.000 EUR | Liquiditaetsreserve |
| Immobilien | Privat | 3.200.000 EUR | 2 ETW Frankfurt, 1 Ferienhaus Toskana |
| Unternehmensbeteiligung | von Trott GmbH | geschaetzt 15.000.000 EUR | 100% Gesellschafter |
| PE-Beteiligung | Golding Capital | 500.000 EUR | European Buyout Fund XII, Vintage 2022 |

**Gesamtvermoegen:** ~34.400.000 EUR (davon 12,5M bei uns = 36% betreut)

### Transaktionsmuster (Referenzkonto)

| Kategorie | Betrag | Rhythmus |
|---|---|---|
| GF-Gehalt + Ausschuettung | +35.000 EUR | Monatlich (schwankend) |
| Entnahmen aus Mandat | -25.000 EUR | Quartalsweise |
| Immobilien-Mieteinnahmen | +4.500 EUR | Monatlich |
| PE Capital Calls | -50.000 bis -100.000 EUR | Unregelmaessig |
| Spende (Stiftung) | -5.000 EUR | Quartalsweise |
| Lebenshaltung (Premium) | -8.000 EUR | Monatlich |

### Vertriebspotentiale

| # | Potential | Typ | Prio | Volumen | Herleitung |
|---|---|---|---|---|---|
| 1 | **Fremdbank-Konsolidierung UBS** | Whitespot | **Kritisch** | 2.800.000 EUR AuM | Vater-Depot bei UBS, kein aktives Management, Konsolidierung spart Kosten |
| 2 | **Fremdbank-Konsolidierung DB** | Whitespot | Hoch | 400.000 EUR | Tagesgeld bei DB ohne Mehrwert |
| 3 | **NextGen-Mandat Charlotte** | Whitespot | Hoch | 500.000 EUR Ziel-AuM | Tochter 31, Rechtsanwaeltin, gutes Einkommen, KEIN Mandat |
| 4 | **Stiftungsgruendung** | Cross-Sell | Hoch | 2.000.000 EUR Stiftungskapital | Alter 62 + Vermoegen >30M + Ehefrau Stiftungsraetin |
| 5 | **WERTIQ Family Office** | Cross-Sell | Mittel | Verweis | Immobilien + Unternehmen + PE → ganzheitliche Betreuung |
| 6 | **ESG-Portfolio-Upgrade** Art. 8→9 | Anpassung | Mittel | – | Elisabeth engagiert sich fuer Nachhaltigkeit |
| 7 | **Nachfolgeplanung Maschinenbau** | Cross-Sell | Hoch | – | 62J, Sohn nicht im Unternehmen, Verkauf/MBO? |
| 8 | **PE-Allokation erhoehen** | Anpassung | Niedrig | 500.000 EUR | Nur 1 PE-Fonds, Alternatives untergewichtet vs. SAA |

---

## W2: Familie Lindenberg – Unternehmerverkauf, frisches Kapital

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Markus & Julia Lindenberg |
| Alter | 51 (er), 49 (sie) |
| Beruf er | Ex-Unternehmer (SaaS-Firma "DataSync" verkauft 2024 fuer 12M brutto, ~8M netto) |
| Beruf sie | Architektin, eigenes Buero, 120.000 EUR/J. |
| Kinder | Finn (22, studiert Informatik), Lena (19, FSJ) |
| Wohnsituation | EFH Kronberg im Taunus, Wert ~1.800.000 EUR |
| LinkedIn | Markus: 2.000 Kontakte, Tech-Szene, Business Angel. Julia: 500, Architektur |
| Mandantenkennung | VV002 |
| NPS | 8 |

### Eigene Produkte

| Produkt | Details |
|---|---|
| SmartValue-Mandat | AuM 2.100.000 EUR |
| PE-Beteiligung | 300.000 EUR (Tech Growth Fund via HRK LUNIS) |
| Risikoprofil | Wachstum (55% Aktien, 20% Renten, 15% PE/Alternatives, 10% Cash) |

### Fremdvermoegen

| Typ | Institut | Volumen | Auffaelligkeit |
|---|---|---|---|
| Festgeld/Tagesgeld | Commerzbank | **5.500.000 EUR** | **GEPARKT seit Unternehmensverkauf 2024!** |
| Immobilien | Privat | 2.200.000 EUR | EFH Kronberg + Ferienwohnung Sylt |
| Business Angel Investments | Diverse | ~400.000 EUR | 4 Startups, illiquid |

**Gesamtvermoegen:** ~12.300.000 EUR (davon 2,4M bei uns = nur 20% betreut!)

### Vertriebspotentiale

| # | Potential | Prio | Volumen | Herleitung |
|---|---|---|---|---|
| 1 | **Mandats-Upgrade SmartValue→FairValue** | Hoch | – | Mit Commerzbank-Cash waere AuM 7,6M → FairValue-Qualifikation |
| 2 | **Fremdbank-Cash konsolidieren** | **Kritisch** | **5.500.000 EUR** | 5,5M bei Commerzbank zu 0-1% Zins – brennt! |
| 3 | **PE-Allokation erhoehen** | Hoch | 1.000.000 EUR | Ex-Tech-Unternehmer, PE-affin, Co-Investment-Moeglichkeiten |
| 4 | **WERTIQ Immobilienberatung** | Mittel | Verweis | 2 Immobilien ohne professionelles Management |
| 5 | **NextGen-Mandat Finn** | Mittel | 200.000 EUR Ziel | Studiert Informatik, erbt perspektivisch, frueh binden |
| 6 | **NextGen-Mandat Lena** | Niedrig | 50.000 EUR Start | FSJ, spaeter Studium, Junior-Sparplan |

---

## W3: Stiftung Dr. Werner Weber – Gemeinnuetzige Bildungsstiftung

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Stiftung Dr. Werner Weber |
| Typ | Gemeinnuetzige Stiftung buergerlichen Rechts |
| Gruendungsjahr | 2008 |
| Stiftungszweck | Bildungsfoerderung Naturwissenschaften, Stipendien |
| Vorstand | Dr. Werner Weber (78), Prof. Dr. Sabine Keller (65) |
| Stiftungsvermoegen | 8.300.000 EUR |
| Jaehrliche Ausschuettung | ~250.000 EUR (3% Ziel) |
| Mandantenkennung | VV003 |
| NPS | 7 |

### Eigene Produkte

| Produkt | Details |
|---|---|
| Spezialmandat Stiftung | AuM 8.300.000 EUR, konservativ |
| Risikoprofil | Konservativ (30% Aktien, 50% Renten, 10% Immobilienfonds, 10% Cash) |
| Anlagerichtlinie | Max. 35% Aktien, keine Derivate, ESG-Pflicht (Stiftungssatzung) |

### Vertriebspotentiale

| # | Potential | Prio | Herleitung |
|---|---|---|---|
| 1 | **ESG-Alignment Stiftungssatzung** | Hoch | Satzung fordert ESG, Portfolio nur teilweise konform |
| 2 | **Ausschuettungsoptimierung** | Hoch | 3% Ziel wird knapp bei aktueller Allokation |
| 3 | **Nachfolge Vorstand** | Mittel | Dr. Weber 78J, Nachfolger im Vorstand? |
| 4 | **Stiftungstag-Einladung** | Niedrig | Networking, Bindung |

---

## W4: Prof. Dr. Hartmann – Arzt mit Forschungsprofil

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Prof. Dr. Juergen Hartmann |
| Alter | 57 |
| Beruf | Chefarzt Kardiologie + Privatpraxis + Universitaetsprofessor |
| Einkommen | ~350.000 EUR/J. (Klinik + Praxis + Vortraege) |
| Familienstand | Verheiratet mit Dr. Ursula Hartmann (54, Psychologin, Praxis) |
| Kinder | Sebastian (28, Assistenzarzt), Johanna (25, Medizinstudentin) |
| Mandantenkennung | VV004 |
| NPS | 9 |

### Eigene Produkte

| Produkt | Details |
|---|---|
| Individuelle VV | FairValue-Mandat, AuM 6.800.000 EUR |
| Risikoprofil | Ausgewogen-Wachstum |

### Fremdvermoegen: Immobilie Praxisgebaeude (1.200.000 EUR), Ferienhaus Mallorca (800.000 EUR)

### Vertriebspotentiale

| # | Potential | Prio | Herleitung |
|---|---|---|---|
| 1 | **PE-Zugang** (Healthcare Fund) | Hoch | Arzt versteht Healthcare-Investments |
| 2 | **Nachfolgeplanung Praxis** | Hoch | 57J, Praxis-Wert ~2M |
| 3 | **NextGen Sebastian** | Mittel | 28J Assistenzarzt, eigenes Sparplan-Mandat |
| 4 | **NextGen Johanna** | Niedrig | 25J Studentin, Junior-Mandat |
| 5 | **Praxis-Vermoegen konsolidieren** | Mittel | Praxisgebaeude + Praxis-Konto separat |

---

## W5: Keller NextGen – Junger Tech-Gruender

### Stammdaten

| Feld | Wert |
|---|---|
| Name | Maximilian Keller |
| Alter | 29 |
| Beruf | Co-Founder (2. Startup nach Seed-Exit 2024, 600k netto) |
| Einkommen | 48.000 EUR/J. Gehalt (Startup) + Kapitalertraege |
| Familienstand | Ledig, Freundin |
| Wohnsituation | Miete Frankfurt-Nordend |
| LinkedIn | 3.000 Kontakte, VC-Szene, sehr aktiv |
| Mandantenkennung | VV005 |
| NPS | 8 |

### Eigene Produkte

| Produkt | Details |
|---|---|
| SmartValue-Mandat | AuM 450.000 EUR (aus Seed-Exit) |
| Risikoprofil | Dynamisch (70% Aktien, 15% Alternatives, 10% Crypto, 5% Cash) |

### Fremdvermoegen: Trade Republic Depot (35.000 EUR Krypto + Tech-Aktien), N26 Konto, Startup-Equity geschaetzt 200.000 EUR (illiquid)

### Vertriebspotentiale

| # | Potential | Prio | Herleitung |
|---|---|---|---|
| 1 | **Mandatstyp-Upgrade** wenn AuM >1M | Mittel | Zweites Startup waechst, naechster Exit? |
| 2 | **Krypto-Strategie formalisieren** | Mittel | 10% Crypto-Allokation, aber bei Trade Republic ohne Governance |
| 3 | **Startup-Equity-Bewertung** | Niedrig | 200k illiquid, braucht Liquiditaetsplanung |
| 4 | **Co-Investment-Moeglichkeiten** | Mittel | VC-Netzwerk, Interesse an Co-Invest via HRK LUNIS |

---

# ═══════════════════════════════════════════════════════════
# D. EINHEITLICHES DATENSCHEMA
# ═══════════════════════════════════════════════════════════

```javascript
{
  // Stammdaten
  name: String,
  geburtsdatum: String,       // "14.08.1983"
  alter: Number,
  geschlecht: String,         // "maennlich" | "weiblich" | "divers"
  beruf: String,
  arbeitgeber: String,
  bruttoeinkommen: Number,    // EUR/Jahr
  nettoeinkommen: Number,     // EUR/Monat
  familienstand: String,      // "verheiratet" | "ledig" | "geschieden" | "verwitwet"
  partner: {
    name: String,
    beruf: String,
    einkommen: Number         // Netto/Monat
  } | null,
  kinder: [{
    name: String,
    alter: Number,
    eigeneProdukte: Boolean   // Hat eigenes Mandat/Vertrag?
  }],
  adresse: String,
  wohnsituation: String,      // "eigentum_haus" | "eigentum_etw" | "miete"
  telefon: String,
  email: String,

  // Digitaler Footprint
  linkedin: {
    kontakte: Number,
    aktivitaet: String,       // "hoch" | "mittel" | "niedrig" | "nicht_vorhanden"
    branchen: [String],
    zusammenfassung: String   // 1 Satz
  },

  // Kundenbeziehung
  kundennummer: String,       // "KD00001" | "KDB001" | "VV001"
  kundeSeit: String,          // "2016"
  nps: Number,                // 1-10
  risikoscore: Number,        // 0-100 (nur Banking/Versicherung)
  potentialScore: Number,     // 1-5 Sterne
  clv: Number,                // Customer Lifetime Value EUR
  abwanderungsrisiko: String, // "hoch" | "mittel" | "niedrig"
  lebensphase: String,        // "aufbau" | "konsolidierung" | "uebergang" | "ruhestand"

  // Eigene Produkte (bei uns)
  eigeneProdukte: [{
    typ: String,              // "bu" | "kfz" | "hausrat" | "girokonto" | "depot" | "baufi" | "vv-mandat"
    produkt: String,          // "ERGO BU Comfort" | "VR-MeinKonto" | "FairValue VV"
    details: String,
    praemieOderErtrag: Number,// EUR/Jahr
    seit: String,
    status: String            // "aktiv" | "kuendigungsgefahr" | "auslaufend" | "optimierbar"
  }],

  // Fremdprodukte (Open Finance / FIDA)
  fremdProdukte: [{
    typ: String,
    produkt: String,
    institut: String,
    details: String,
    volumenOderPraemie: Number,
    consent: Boolean,
    gueltigBis: String | null
  }],

  // Transaktionsmuster (monatlich)
  transaktionen: [{
    kategorie: String,        // "gehalt" | "miete" | "baufi" | "sparplan" | "versicherung_eigen" |
                              // "versicherung_fremd" | "konsum" | "reisen" | "abos" | "kinder"
    betrag: Number,           // Positiv = Eingang, Negativ = Ausgang
    empfaenger: String,
    auffaelligkeit: String | null  // "geht_an_fremdbank" | "steigend" | "auslaufend" | null
  }],

  // Abgeleitete Werte
  absicherungsquote: Number,  // Versicherungspraemien / Netto in %
  sparquote: Number,          // Sparraten / Netto in %
  freiVerfuegbar: Number,     // Netto - alle Ausgaben (EUR/mtl.)

  // Vertriebspotentiale
  potentiale: [{
    titel: String,
    typ: String,              // "whitespot" | "anpassung" | "cross_sell" | "retention"
    quellen: [String],        // OPT-19: "bestand" | "finanztransaktion" | "lebensereignis" |
                              //          "wettbewerb" | "kommunikation" | "markt"
    prioritaet: String,       // "kritisch" | "hoch" | "mittel" | "niedrig"
    volumen: Number,
    volumenTyp: String,       // "jaehrlich" | "einmalig"
    beschreibung: String,     // 1-2 Saetze
    empfohleneAktion: String, // "angebot_erstellen" | "termin_vereinbaren" | "tarifvergleich" | "verweis_partner"
    produktEmpfehlung: String // "ERGO BU Comfort" | "Union Investment Sparplan" | "R+V RLV"
  }],

  // Kommunikation (OPT-15 Format)
  kommunikation: [{
    datum: String,
    typ: String,              // "email" | "telefon" | "termin" | "chatbot" | "brief"
    richtung: String,         // "eingehend" | "ausgehend"
    betreff: String,
    zusammenfassung: String,
    stimmung: String          // "positiv" | "neutral" | "negativ"
  }],

  _modus: String              // "versicherung" | "banking" | "vermoegensverwaltung"
}
```

---

# ═══════════════════════════════════════════════════════════
# E. ZUSAMMENFASSUNG
# ═══════════════════════════════════════════════════════════

## 19 Personas ueber 3 Modi

| Modus | ID | Name | Alter | Kernthema | Potentiale |
|---|---|---|---|---|---|
| Versicherung | V1 | Peter Schmidt | 42 | Familie, EFH, BU zu niedrig | 8 |
| Versicherung | V2 | Amira Koenig | 28 | Kaum versichert, Digital Native | 5 |
| Versicherung | V3 | Thomas Weber | 55 | NPS 5, Abwanderung, Nachfolge | 7 |
| Versicherung | V4 | Dr. Anna Hoffmann | 35 | Aerztin, hohes Einkommen, unterversichert | 6 |
| Versicherung | V5 | Klaus Meier | 48 | Beamter, PKV, 3 Kinder | 5 |
| Versicherung | V6 | Lisa Bauer | 31 | Freelancerin, fast unversichert | 6 |
| Versicherung | V7 | Michael Braun | 62 | Ruhestand, vermoegend, Pflegebedarf | 5 |
| Versicherung | V8 | Sandra Yilmaz | 38 | Dual Income, Eigentum geplant | 6 |
| Banking | B1 | Klaus Fischer | 45 | Baufi-Zinsbindung! Geld an Fremdbanken | 8 |
| Banking | B2 | Sandra Mueller | 33 | Eigentum geplant, Partner bei Fremdbank | 7 |
| Banking | B3 | Peter Hoffmann | 58 | FK GmbH-GF, D&O fehlt, Nachfolge | 5 |
| Banking | B4 | Markus Wagner | 29 | Berufseinsteiger, nur Girokonto | 5 |
| Banking | B5 | Andrea Lang | 41 | FK Cafe-Kette, Expansion | 5 |
| Banking | B6 | Stefan Braun | 36 | Digital Native, VR = Karteileiche | 6 |
| VV | W1 | Dr. von Trott | 62 | 12,5M, UBS 2,8M Fremd, Nachfolge | 8 |
| VV | W2 | Familie Lindenberg | 51/49 | SaaS-Exit, 5,5M Cash Fremdbank! | 6 |
| VV | W3 | Stiftung Weber | - | 8,3M Stiftung, ESG-Pflicht | 4 |
| VV | W4 | Prof. Hartmann | 57 | 6,8M Arzt, Praxis-Nachfolge | 5 |
| VV | W5 | Keller NextGen | 29 | 450k, Tech-Gruender, Krypto | 4 |

**Gesamt:** 19 Personas, 109 Vertriebspotentiale, alle mit 5 Datenschichten

---

# ═══════════════════════════════════════════════════════════
# F. CLAUDE-CODE PROMPT
# ═══════════════════════════════════════════════════════════

```
Teile die gesamte Arbeit in einzelne Schritte auf und nutze die TodoList, damit ich jederzeit 
nachvollziehen kann, wo du im Prozess steckst. Erstelle die Todos BEVOR du mit der Arbeit beginnst.
Schreibe Aenderungen SOFORT in die Dateien – nicht erst am Ende gesammelt.

KONTEXT: Die Mock-Daten im Tool brauchen realistische Personas mit 5 Datenschichten:
Stammdaten, eigene Produkte, Fremdprodukte (Open Finance), Transaktionen, Potentiale.
19 Personas ueber 3 Modi. Jede Persona hat plausible Einkommen/Ausgaben, sinnvolle 
Fremdprodukte und nachvollziehbare Potentiale. Details in OPT_26_SPEC.md.

Todos:

=== Versicherungs-Personas (V1-V8) ===

- [ ] kunden-detail-data.js lesen: mockKunden-Format verstehen
- [ ] V1 Peter Schmidt komplett anlegen: Stammdaten + 4 ERGO-Vertraege + 6 Fremdprodukte (Sparkasse Baufi, ING Depot, DKB Tagesgeld, Allianz RLV, KfW) + 12 Transaktionsposten + 8 Potentiale
- [ ] V2 Amira Koenig komplett anlegen: Nur KFZ bei ERGO + N26/Trade Republic/Commerzbank + 5 Potentiale (BU KRITISCH!)
- [ ] V3 Thomas Weber komplett anlegen: 7 Vertraege + VoBa/R+V/DKB Fremd + NPS 5 Detractor + 7 Potentiale
- [ ] V4 Dr. Anna Hoffmann anlegen: 2 Vertraege, Aerztin 95k, Commerzbank/Scalable/DKV + 6 Potentiale
- [ ] V5 Klaus Meier anlegen: Beamter PKV + 5 Vertraege + Sparkasse/Union Investment/DBV + 5 Potentiale
- [ ] V6 Lisa Bauer anlegen: Freelancerin, NUR Haftpflicht + N26/Consorsbank + 6 Potentiale (BU+Berufshaftpflicht KRITISCH!)
- [ ] V7 Michael Braun anlegen: Ruhestand 62, 6 Vertraege + Deutsche Bank 280k Depot + 5 Potentiale
- [ ] V8 Sandra Yilmaz anlegen: 4 Vertraege, Dual Income 110k+Ing + 6 Potentiale
- [ ] Alle V-Personas in mockKunden integrieren (bestehende ersetzen oder ergaenzen)
- [ ] Pro Persona: transaktionen[] Array mit monatlichen Posten
- [ ] Pro Persona: fremdProdukte[] mit institut, volumen, consent
- [ ] Pro Persona: potentiale[] mit quellen[], prioritaet, volumen
- [ ] Testen: A-10 jede Persona oeffnen – individuelle Daten, Fremdprodukte, Potentiale

=== Banking-Personas (B1-B6) ===

- [ ] kunden-detail-banking.js lesen: bankMockKunden-Format verstehen
- [ ] B1 Klaus Fischer komplett: VR-Konto+Sparkonto+Baufi+Kreditkarte+Bauspar + Trade Republic 28k + ING 22k + HUK/HDI/Allianz/Alte Leipziger + 8 Potentiale (Anschlussfinanzierung KRITISCH!)
- [ ] B2 Sandra Mueller komplett: Giro+Sparkonto + Commerzbank-Partner + 7 Potentiale (Baufi vorbereiten!)
- [ ] B3 Peter Hoffmann FK: 3 Firmenkonten + KfW + Deutsche Bank Depot + 5 Potentiale (D&O KRITISCH!)
- [ ] B4 Markus Wagner: Nur Girokonto + Scalable/DKB + 5 Potentiale (BU KRITISCH!)
- [ ] B5 Andrea Lang FK: 2 Firmenkonten + VR Smart Finanz + ING Depot + 5 Potentiale
- [ ] B6 Stefan Braun: Girokonto Karteileiche + N26 Business + Trade Republic 55k + 6 Potentiale
- [ ] Alle B-Personas in bankMockKunden integrieren
- [ ] Pro Persona: Verbundpartner-Potentiale (R+V, Schwaebisch Hall, Union Investment)
- [ ] Testen: B-10 jede Persona oeffnen – individuelle Banking-Daten + Fremdprodukte

=== VV-Personas (W1-W5) ===

- [ ] vv-mock-data.js lesen: vvMockMandanten-Format verstehen
- [ ] W1 Dr. von Trott ergaenzen: LinkedIn, Transaktionen auf Referenzkonto, Fremdvermoegen (UBS 2,8M + DB 400k + Immobilien 3,2M + GmbH 15M + PE 500k), erweiterte Potentiale (8)
- [ ] W2 Lindenberg komplett: SmartValue 2,1M + PE 300k + Commerzbank 5,5M CASH + Immobilien 2,2M + 6 Potentiale
- [ ] W3 Stiftung Weber: Spezialmandat 8,3M + Anlagerichtlinie + 4 Potentiale
- [ ] W4 Prof. Hartmann: FairValue 6,8M + Immobilien 2M + 5 Potentiale
- [ ] W5 Keller NextGen: SmartValue 450k + Trade Republic + Startup-Equity + 4 Potentiale
- [ ] Alle W-Personas in vvMockMandanten integrieren
- [ ] Pro Mandant: Gesamtvermoegen = AuM bei uns + Fremdvermoegen (Immobilien, Unternehmen, PE, Fremdbanken)
- [ ] Pro Mandant: Anteil betreut in % berechnen
- [ ] Testen: VV-10 jede Persona – Client 360, Portfolio, Vermoegensbilanz

=== Validierung ===

- [ ] Pro Persona: Einnahmen - Ausgaben = frei verfuegbar (MUSS positiv sein)
- [ ] Pro Persona: Fremdprodukte passen zum Alter/Beruf/Lebensstil
- [ ] Pro Persona: Potentiale sind aus Daten ableitbar (nicht willkuerlich)
- [ ] Pro Persona: Cross-Selling Bank→Versicherung vorhanden wo sinnvoll
- [ ] Pro Persona: Cross-Selling Versicherung→Bank vorhanden wo sinnvoll
- [ ] Absicherungsquote realistisch (Durchschnitt DE: ~4-6% des Netto)
- [ ] Sparquote realistisch (Durchschnitt DE: ~10-15% des Netto)
- [ ] LinkedIn-Profile passen zum Beruf/Alter

Einfarbige SVG-Icons (stroke-only). Keine Emojis.
```

> Ende OPT-26 Spezifikation | Stand: 2026-03-11
