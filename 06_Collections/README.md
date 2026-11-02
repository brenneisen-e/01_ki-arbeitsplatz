# Collections Management

Forderungsmanagement der Braunschweiger Sparkasse als eigenständige React-App.
Portierung des früheren Banken-Moduls aus `app.html` / `partials/banken/` /
`js/banken-*.js` in dieselbe Struktur wie die übrigen Sub-Apps
(Vite + React 19 + Tailwind CSS v4).

## Entwickeln und bauen

```bash
cd Collections && npm install && npm run build
```

Der Build landet in `06_Collections/dist/` und wird mit eingecheckt. Die App ist
über die Kachel „Collections Management" im Cluster „Risiko & IKS" der
Startseite (`index.html`) erreichbar.

## Aufbau

```
src/
  components/layout/GlobalHeader.jsx   Header im Stil des Vertriebsarbeitsplatzes
  components/ui/                       Karten, Badges, Modal, Drawer, Charts, Toasts
  views/                               Cockpit, Portfolio, Risiko (NPL + Stage 2)
  features/customer/                   Schnellblick (Peek) und Akte (Vollprofil)
  features/scanner/                    Dokumentenscanner (3 Schritte)
  features/chat/                       Collections Assistent
  features/feedback/                   Feedback-Panel (localStorage)
  data/                                Demo-Daten und Ableitungen
  hooks/useCollections.jsx             Section, Filter, Overlays, Toasts
  utils/                               Deutsche Formatierung, Export
```

### Sichten

| Sicht | Frage | Inhalt |
| --- | --- | --- |
| Cockpit (Start) | Was mache ich heute? | KI-Tagesbriefing, Next-Best-Action-Queue (Wiedervorlagen + Agenten-Freigaben), Agenten-Status, Kompakt-KPIs |
| Portfolio | Wie steht das Buch? | Portfolio-KPIs, Willingness/Ability-Matrix, neue Fälle, Zahlungseingänge, Kundenliste, Drawer „Ehemalige Fälle" |
| Risiko | Wohin bewegt es sich? | Stage-Fluss 1 → 2 → 3, Umschalter zwischen Stage 2 (ECL, Migration, Risikotreiber) und Stage 3 (NPL-Bestand, Trends, Maßnahmen) |

Die Kundenakte ist zweistufig: Klick auf einen Fall öffnet den **Schnellblick**
(Kopf, Kennzahlen, KI-Kurzlage, nächste Aktion), „Akte öffnen" führt in das
**Vollprofil** — dort leben Stammdaten, Konten, Transaktionen & Forderungen,
GuV/Haushalt, Open Finance, Kommunikation, Dokumente, Workflow und das
**KI-Dossier** (Lage, Risiken/Chancen, Gesprächspunkte, Entwürfe). Die
Übersicht der Akte zeigt den **Agenten-Feed** (Zahlungswächter, Mahn-Agent,
Ratenplan-Monitor) mit Freigabe-Schritten; der **Assistent** kennt die offene
Akte und beantwortet Zusammenfassung, Begründung und Entwurfsfragen direkt.

## Datenhaltung

Alle Demo-Daten liegen in `src/data/`. Wichtig für Änderungen:

- **`customerDetails.js`** enthält die elf ausgebauten Kundenakten unverändert
  aus dem Legacy-Tool. `getFullCustomerData()` liefert für Fälle ohne Akte
  (nur im Chat und in den Portfolio-Auswertungen enthalten) eine Kurzakte aus
  `WEITERE_FAELLE`, damit ein Klick nie in einem leeren Datensatz landet.
- **Abgeleitet statt hinterlegt:** Stammdatenfelder (`stammdaten.js`), Scoring,
  Einflussfaktoren und Handlungsempfehlung (`kiAnalyse.js`), Stage, letzte
  Zahlung und Aktivitäten (`customerDetails.js`) werden aus der jeweiligen Akte
  berechnet. Das Legacy-Tool hatte diese Blöcke fest auf die Mueller-Akte
  verdrahtet und zeigte sie bei jedem Kunden; außerdem erzeugte es
  Handelsregister, USt-ID und Umsatz per `Math.random()`, sodass die Werte bei
  jedem Öffnen sprangen. Hier sind sie deterministisch aus der Kundennummer
  abgeleitet.
- **Konsistenz:** Die KPI-Kachel „Meine Aufgaben", die Anzeige im Header und
  die Aufgaben-Section rechnen alle über `AUFGABEN`. Die Textzusammenfassung
  unter „Aktionen → Export" wird ebenfalls aus den Datenmodulen erzeugt.

Rein textgebundene Legacy-Inhalte (Mahnschreiben, Kreditvertrag, Mahnstrecke)
liegen weiterhin als Referenz in `crmProfile.js`.
