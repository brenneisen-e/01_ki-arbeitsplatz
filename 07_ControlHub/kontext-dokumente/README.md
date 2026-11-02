# ControlHub — Kontext-Dokumente

Neuer, eigenständiger **Kontext-Korpus** für den ControlHub-Umbau: realistische, vollständig synthetische
Eingangsdokumente (Banken/Versicherung) plus ein maschinenlesbarer Index. Der Korpus ist bewusst
**stack-unabhängig** gehalten (Markdown + JSON), damit er beim Umbau des Tools frei weiterverwendet werden
kann — als LLM-/RAG-Kontext, zum Parsen oder als Quelle für eine neue Datenschicht.

> Alle Inhalte sind frei erfunden (synthetische Demo-Daten). Es gibt keine realen Personen, Beträge oder
> Sachverhalte. Stand der Dokumente: 30.06.2026.

## Struktur

```
07_ControlHub/kontext-dokumente/
├── README.md                        # diese Datei
├── manifest.json                    # maschinenlesbarer Index (Taxonomie + Prozesse/Risiken/Kontrollen)
├── methodik/
│   └── risiko-und-kontroll-taxonomie.md   # NFR-Taxonomie, Bewertungslogik, 4-Schritte-Regelkreis
└── prozesse/
    ├── 01-kreditvergabe-firmenkunden.md
    ├── 02-zahlungsverkehr-sepa-swift.md
    ├── 03-wertpapierabwicklung-settlement.md
    ├── 04-schadenmanagement-komposit.md
    ├── 05-transaktionsmonitoring-aml.md
    └── 06-auslagerungsmanagement-dora.md
```

## Dokumentübersicht

| # | Dokument | Dok-ID | Prozess-ID | Aktivitäten | Schwerpunkt-Regulatorik |
| --- | --- | --- | --- | --- | --- |
| 01 | Prozessleitfaden Kreditvergabe Firmenkunden | PL-FK-2026-014 | `kreditvergabe` | a1–a8 | KWG § 18, MaRisk BTO 1.2, CRR, EBA/GL/2020/06 |
| 02 | Operations-Handbuch SEPA/SWIFT-Zahlungsverkehr | OH-ZV-2026-007 | `zahlungsverkehr` | c1–c6 | PSD2, Instant Payments, Travel Rule, DORA, CSCF |
| 03 | Prozesshandbuch Wertpapierabwicklung (Settlement) | PH-WP-2026-009 | `wertpapierabwicklung` | b1–b6 | CSDR, EMIR, MiFIR/MiFID II |
| 04 | Fachhandbuch Schadenmanagement Komposit | FH-SCH-2026-021 | `antragsmanagement` | d1–d7 | VVG, VAG, IDD, Solvency II, HGB § 341e |
| 05 | Richtlinie Geldwäscheprävention & Transaktionsmonitoring | RL-AML-2026-003 | `transaktionsmonitoring` | e1–e6 | GwG, § 25h KWG, EU-Sanktionen |
| 06 | Auslagerungs- & IKT-Drittparteienrichtlinie (DORA) | RL-AUS-2026-005 | `auslagerungsmanagement` | f1–f7 | DORA Art. 28–30, MaRisk AT 9, EBA/GL/2019/02 |
| — | Methodenhandbuch Risiko- & Kontroll-Taxonomie | MH-IKS-2026-001 | (Methodik) | — | MaRisk AT 4.3, DORA, EU AI Act |

Die Dokumente **01** und **02** sind inhaltsgleiche Markdown-Portierungen der bereits im Tool vorhandenen
PDF-Generatoren (`src/utils/richDocs/leitfadenKredit.js`, `src/utils/richDocs/handbuchZahlungsverkehr.js`).
**03** und **04** ergänzen die im aktuellen Tool nur als Kurzfassung vorhandenen Prozesse zu vollwertigen
Fachdokumenten. **05** und **06** sind neue Domänen, die direkt auf die bestehende Risiko-Taxonomie
(`compliance-risiko/gwg`, `auslagerungs-risiko/*`) abbilden.

## Aufbau jedes Prozessdokuments

Jedes Dokument folgt derselben Struktur:

1. **YAML-Frontmatter** mit `dokument_id`, `titel`, `typ`, `version`, `prozess_id`, `kategorie`, `regulatorik`.
2. Metadaten-Tabelle, Versionshistorie, Inhaltsverzeichnis.
3. Nummerierte Fachkapitel (Geltungsbereich, Begriffe, Rechtsgrundlagen, Rollen mit Three-Lines-of-Defense,
   Prozessschritte, Eskalation, Reporting).
4. **Abschnitt „Risiko-Kontroll-Sicht (für ControlHub)"** — der strukturierte Nutz-Abschnitt: je Aktivität
   die wesentlichen Risiken (Kategorie/Unterart) und vorgeschlagenen Kontrollen (Art, Typ, Frequenz).
5. Anhänge.

## `manifest.json` — maschinenlesbarer Index

`manifest.json` aggregiert den Korpus für die programmatische Weiterverarbeitung beim Umbau:

- `taxonomie` — die 6 NFR-Risiko-Kategorien mit Unterart-IDs, das Kontroll-Vokabular (Art/Typ/Frequenz) und
  die Bewertungsskalen (Eintrittswahrscheinlichkeit × Schadenhöhe).
- `dokumente[]` — je Dokument: Metadaten, `prozess` und `aktivitaeten[]`; je Aktivität die `risiken[]` mit
  jeweils zugeordneten `kontrollen[]`.

Die IDs sind bewusst kompatibel zur bestehenden Datenschicht des Tools gehalten
(`src/data/risikoKatalog.js`): Prozess-IDs (`kreditvergabe`, `zahlungsverkehr`, `wertpapierabwicklung`,
`antragsmanagement`) und Aktivitäts-IDs (`a1`–`a8`, `c1`–`c6`, `b1`–`b6`, `d1`–`d7`) entsprechen
`DEMO_PROZESSE`/`RISIKO_VORSCHLAEGE`; `transaktionsmonitoring` (`e1`–`e6`) und `auslagerungsmanagement`
(`f1`–`f7`) sind neue, additive Prozesse.

### Beispiel: Zugriff auf die Vorschläge eines Prozesses

```js
import manifest from './manifest.json';

const kredit = manifest.dokumente.find(d => d.prozess.id === 'kreditvergabe');
const a2 = kredit.aktivitaeten.find(a => a.id === 'a2');
// a2.risiken[].{kategorie, unterart, beschreibung, kontrollen[].{name, art, typ, frequenz}}
```

## Konventionen

- **Deutsche Lokalisierung:** Datum `DD.MM.YYYY`, deutsche Monatsnamen, Uhrzeit `HH:MM`, Geldbeträge mit
  Tausenderpunkt und Dezimalkomma (`1.234.567,89 EUR`).
- **Keine Emojis**, nur Text und Markdown-Strukturen.
- **Synthetische Daten** — der Korpus ist eine Demo-/Testgrundlage, keine reale Anweisung.

## Hinweis zum Tool-Umbau

Dieser Ordner ist **nicht** in den aktuellen Vite-Build der ControlHub-App eingebunden und löst keinen Rebuild
aus — er ist reines Quell-/Kontextmaterial. Die Verdrahtung in das (umzubauende) Tool erfolgt separat.
