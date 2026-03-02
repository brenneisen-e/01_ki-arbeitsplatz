# Anleitung: Modus-Toggle "Privatkunde (AO) vs. Makler (B2B)"

## Was ist das?

Ein Toggle-Switch oben rechts im Header der Agentursicht (A-02), der die gesamte Anwendung zwischen zwei Vertriebswelten umschaltet:

- **Privatkunde (AO)** -- Ausschließlichkeitsorganisation, klassischer Agenturvertrieb an Endkunden (Privatpersonen)
- **Makler B2B** -- Industriemakler-Modus (inspiriert von Ecclesia), institutionelle Kunden (Kliniken, Kirchen, Sozialeinrichtungen, Industriebetriebe)

## Wo finde ich den Toggle?

Ganz rechts im Header-Bereich der A-02-Seite. Er zeigt den aktuellen Modus als Label an und speichert die Auswahl im Browser (localStorage).

---

## Was ändert sich auf A-02 (Agentursicht)?

| Bereich | Privatkunde (AO) | Makler (B2B) |
|---|---|---|
| **Header** | "Agentur: Maria Musterfrau" / VM00001 | "GS NRW" / Ecclesia Gruppe |
| **Foto** | Personen-Avatar | Gebäude-Icon |
| **KPIs** | Gesamtbestand, Neugeschäft YTD, Storno-Quote, Zielerreichung | Bestandsprämie 68,5 Mio., Neugeschäft, Courtage, Retention, Schadenquote |
| **Tabs** | Übersicht, Stammdaten, Neugeschäft, Bestand, **Storno, Vergütung, Qualität** \| Kunden, Potentiale | Übersicht, Stammdaten, Neugeschäft, Bestand, **Versicherer-Mix, Renewals, Schäden, Deckungslücken** \| Kunden, Potentiale |
| **Kundenliste** | Privatpersonen (Peter Schmidt, Amira König...) | Institutionen (Klinikum Lippetal, Ev. Landeskirche...) mit Segment-Icons |
| **Übersicht** | Agentur-Dashboard | Vertriebskennzahlen, Top-5-Kunden, Aufgaben, Renewals, Segmentverteilung |
| **Chat-Assistent** | Antworten zu Ablauf, Cross-Selling LV, Privatkundenthemen | Antworten zu Renewals, Deckungslücken, Schadenquoten, B2B-Potentiale |

---

## Was ändert sich auf A-10 (Kundendetail)?

| Bereich | Privatkunde (AO) | Makler (B2B) |
|---|---|---|
| **Kunden-Dropdown** | Privatpersonen | Institutionen (Klinikum, Kirche, etc.) |
| **Foto** | Kunden-Foto/Placeholder | Gebäude-Icon |
| **Stammdaten** | Name, Adresse, Geburtsdatum, Familienstand | Branche, Segment, Mitarbeitende, Jahresumsatz, Betten, Standorte, Träger, Key Contact, Risikoklasse |
| **Inner Tabs** | Stammdaten, Verträge, FIDA/Wettbewerber, Schaden, Vertriebsbericht | Stammdaten, Verträge, **Schadenhistorie, Deckungslücken, Renewal-Ampel, Ansprechpartner, Potentiale** |
| **Verträge-Tabelle** | Einfache Vertragsliste | Sparte, Versicherer, Prämie/a, Deckungssumme, Selbstbehalt, Ablauf, Schadenquote |

---

## Technische Umsetzung

### Dateien

| Datei | Rolle |
|---|---|
| `js/makler.js` | Hauptlogik: Toggle, KPIs, Mock-Daten, Tab-Rendering, A-10 Makler-Detail |
| `css/makler.css` | Styles für B2B-Modus (Tabs, Stammdaten, KPI-Boxen, Tabellen) |
| `index.html` | HTML-Struktur für Toggle, Makler-KPIs, Makler-Tabs, Makler-Kundenliste |
| `js/agentur-overview.js` | Chat-Assistent: B2B- vs. AO-Antworten |
| `js/kunden-detail.js` | A-10 Grundlogik, Restore-AO-Funktion bei Moduswechsel |

### Funktionen

| Funktion | Beschreibung |
|---|---|
| `toggleMaklerModus()` | Toggle-Klick: schaltet `maklerModus` um, ruft `applyMaklerModus()` auf, speichert in localStorage |
| `applyMaklerModus()` | A-02: tauscht KPIs, Tabs, Kundenliste, Header-Titel und -Foto |
| `showMaklerTab(tabName)` | A-02: zeigt einen B2B-Tab an (Übersicht, Stammdaten, Neugeschäft, Bestand, etc.) |
| `openMaklerKundenDetail(kundeId)` | A-10: öffnet Kundendetail im B2B-Modus |
| `fillMaklerDetail(kunde)` | A-10: ersetzt Header, Tabs, Stammdaten, Verträge mit B2B-Daten |
| `restoreMaklerKundenDetail()` | A-10: stellt AO-Ansicht wieder her beim Zurückwechseln |

### State

- **`maklerModus`** (Boolean): globale Variable, `true` = B2B, `false` = AO
- **localStorage-Key:** `maklerModus` (`'1'` oder `'0'`)
- Beim Wechsel des Toggles auf A-10 wird automatisch auf A-02 zurücknavigiert

### Mock-Daten (B2B)

10+ institutionelle Kunden aus 5 Segmenten:

| Segment | Beispiel-Kunden | Icon |
|---|---|---|
| Gesundheitswesen | Klinikum Lippetal, Reha-Klinik Teutoburg | Kreuz/Gebäude |
| Kirche | Ev. Landeskirche Teutoburg, Kirchenkreis Auental | Kirchensymbol |
| Sozialwirtschaft | Diakonisches Werk Ostwestfalen, AWO Kreisverband | Personengruppe |
| Industrie & Gewerbe | Nordlicht Automatisierung, Teutoburger Maschinenbau | Fabrik |
| Transport & Logistik | Weserland Spedition, Lippeland Fracht | LKW |

Jeder Kunde hat vollständige Daten: Vertragslisten mit Deckungssummen/SB, Schadenhistorien (5 Jahre), Deckungslücken-Analyse und Renewal-Status.
