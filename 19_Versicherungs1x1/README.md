# Versicherungs-1×1

Ein ruhiges, schnelles, tastaturbedienbares Wissensprodukt zum deutschen
Versicherungsmarkt: 13 Kapitel, 73 Lerneinheiten in drei Tiefen (Basis ·
Vertiefung · Experte), 670 Inhaltsblöcke in 24 Blocktypen, 223 Glossarbegriffe,
190 Quizfragen mit Leitner-Wiederholung, Volltextsuche und Umfangssteuerung.
„Nachschlagen in 10 Sekunden, Lernen in 10 Minuten.“ Alle Zahlen kommen aus
`public/data/chapters.json`; `npm run daten-pruefung` schreibt den Stand aus.

Stack: React 19, Vite 6, Tailwind CSS v4, lucide-react, recharts (nur in
Diagrammblöcken, lazy). Kein Router-Paket, keine UI-Bibliothek, keine
externen Abrufe zur Laufzeit außer `public/data/chapters.json`; Schriften
liegen unter `public/schrift/` (DM Sans, JetBrains Mono, SIL OFL).

```bash
npm install
npm run dev                 # Entwicklung
npm run build               # Produktion nach dist/ (wird eingecheckt)
npm run vorschau            # dist/ auf http://127.0.0.1:4173
npm run importpruefung      # statische Importprüfung (siehe „Prüfen“)
npm run daten-pruefung      # Schema, Formate, Quiz, Glossar in chapters.json
npm run rauchtest           # Klickstrecke im Browser (Vorschau muss laufen)
npm run umfang-pruefung     # 74 Prüfungen der Umfangssteuerung
npm run browserpruefung     # Rauchtest + Umfangsprüfung mit eigener Vorschau
npm run bilderbogen <ordner># Screenshots aller Ansichten in vier Breiten
npm run pruefen             # Importprüfung + Datenprüfung + Build + Browserprüfung
```

Die App wird auf der Plattform unter `/19_Versicherungs1x1/dist/` ausgeliefert;
`vite.config.js` setzt deshalb `base: './'` und alle Pfade sind relativ.

## Architektur

```
src/
  main.jsx, App.jsx            Provider, App-Shell, Routen-Switch
  index.css                    Tailwind, Tokens, Basis-Typografie, gemeinsame Klassen
  styles/
    schrift.css                @font-face (selbst gehostet)
    basis.css                  App-Shell, Sidebar, Breadcrumb, Startseite
    kapitel.css bloecke.css suche.css glossar.css quiz.css   Bereichsstile
    umfang.css                 Umfangs-Panel und der Punkt am Monogramm
  lib/
    speicher.js                localStorage mit try/catch und Versionsschlüssel
    text.js                    entferneHtml, woerter, lesezeitMinuten, slug, kuerze, falte, nummer, blockText
    format.js                  zahl, prozent, anteil, euro, kompakt, datum, datumLang, uhrzeit, datumRelativ, minuten, mehrzahl
    bloecke.js                 TIEFEN, alleBloecke, sichtbareBloecke, blockTitel, hatTiefe, tiefeFuerBlock …
    begriffe.js                findeBegriffe, begriffeInEinheit, slugFuerBegriff, vorkommenJeBegriff
  store/
    Wissen.jsx                 WissenProvider + useWissen()
    routen.js                  hashZuRoute, routeZuHash (rein, ohne React)
    tastenkuerzel.js           useTastenkuerzel(), KUERZEL (Liste für die Hilfe)
    umfang.js                  Umfangssteuerung: Zustand, Filter, Adressparameter (rein)
  components/
    ui/                        Primitiven (siehe Komponentenübersicht)
    layout/                    AppShell, Topbar, Sidebar, Breadcrumb, Lesefortschritt
    kapitel/                   Kapitelkopf, Einheitenleiste, Tiefenwahl, Auf dieser Seite …
    glossar/                   Begriff (Marke im Text), BegriffKarte (Hover-Card), BegriffeChips
    suche/SuchePalette.jsx     Suchpalette (⌘K / Strg K / „/“)
    umfang/UmfangPanel.jsx     Panel „Umfang“ (nur per Tastenfolge erreichbar)
    content/                   Inhaltsblöcke (siehe „Inhaltsblöcke“), charts/ für Recharts und Sankey
    quiz/                      Moduswahl, Kapitelwahl, Frage, Ergebnis, Verlauf
  pages/
    Start.jsx Kapitel.jsx Glossar.jsx Wissenscheck.jsx
public/data/chapters.json      Inhalte (nur per Skript ändern)
public/schrift/                Schriften + LIZENZ.txt
scripts/
  importpruefung.mjs           freie Bezeichner in JSX (ohne Browser)
  daten-*.mjs                  Datenkette: bereinigung → anreicherung → deck → feinschliff → pruefung
  rauchtest.mjs                Klickstrecke, Maße, Kontrast, axe-core
  umfang-pruefung.mjs          74 Prüfungen der Umfangssteuerung
  bilderbogen.mjs              Screenshots aller Ansichten
  mit-vorschau.mjs             startet die Vorschau, führt Befehle aus, beendet sie
```

Die Shell rendert sofort (Topbar, Sidebar-Skelett, Inhalts-Skelett); die
JSON wird danach geladen. Daten bleiben unverändert im Store (`daten`), alle
abgeleiteten Größen (sortiertes Glossar mit Slug, Lesezeiten, Kennzahlen,
Einheitenfolge) sind memoisiert.

## Routen (Hash, kein Router-Paket)

| Hash | Route | Bemerkung |
|---|---|---|
| `#/` | `start` | |
| `#/kapitel/:kapitelId` | `kapitel` | Store leitet per `replace` auf die erste Lerneinheit um |
| `#/kapitel/:kapitelId/:einheitId` | `kapitel` | |
| `#/kapitel/:kapitelId/:einheitId/:blockId` | `kapitel` | `blockId` = `b12` (Index über level1 → level2 → level3); die Kapitelseite scrollt hin und schaltet die nötige Tiefe ein |
| `#/glossar` · `#/glossar/:slug` | `glossar` | |
| `#/wissenscheck` · `#/wissenscheck/:kapitelId` | `wissenscheck` | |

Alte Routen werden ohne History-Eintrag umgeschrieben: `#overview` → `#/`,
`#chapter/:k[/:s]` → `#/kapitel/…`, `#wissenscheck` → `#/wissenscheck`.
Unbekannte Routen und unbekannte Kapitel-IDs führen auf die Startseite,
eine unbekannte Einheit auf die erste Einheit des Kapitels. Der
Dokumenttitel folgt der Route („Marktstruktur · Der Markt im Überblick ·
Versicherungs-1×1“). Jeder Routenwechsel scrollt nach oben — außer bei
`blockId` und `#/glossar/:slug` (dort scrollt die Seite selbst zum Ziel).

Links bauen ihre Hashes über `routeZuHash(route)`; damit funktionieren
Mittelklick, „In neuem Tab öffnen“ und Screenreader-Ansagen. Der
Skip-Link („Zum Inhalt“) fokussiert `#inhalt` per Skript, weil ein echter
Hash-Sprung den Router auslösen würde.

## Store — `useWissen()`

```jsx
import { useWissen } from '../store/Wissen.jsx';

const {
  // Daten — IMMER in der Fassung des eingestellten Umfangs (siehe unten)
  daten, laden, fehler, nochmalLaden,
  datenVoll,                          // ungefiltert; nur die Umfangssteuerung selbst nutzt das
  kapitelListe,                       // daten.chapters (nur sichtbare Kapitel, Originalreihenfolge)
  glossar,                            // daten.glossary: sortiert, jeder Eintrag mit slug und tags[]
  kennzahlen,                         // { kapitel, einheiten, begriffe, fragen, quellen, lesezeitMinuten }
  einheitenFolge,                     // [{ kapitel, einheit, kapitelIndex, einheitIndex }] in Lernreihenfolge
  umfang,                             // Umfangssteuerung (siehe „Umfangssteuerung“)

  // Route
  route,                              // { name:'start'|'kapitel'|'glossar'|'wissenscheck', kapitelId, einheitId, blockId, slug }
  kapitel, kapitelIndex, einheit,     // aktuelle Objekte oder null / -1
  navigiere(route), ersetzeRoute(route),   // push bzw. replace
  oeffneKapitel(kapitelId, einheitId?, blockId?),
  oeffneGlossar(slug?), oeffneWissenscheck(kapitelId?), zurStartseite(),
  naechsteEinheit(kapitelId, einheitId), vorherigeEinheit(kapitelId, einheitId),
                                      // → { kapitel, einheit, kapitelIndex, einheitIndex } oder null, über Kapitelgrenzen

  // Fortschritt (localStorage 'v1x1.fortschritt.v2')
  fortschritt,                        // siehe unten
  markiereGelesen(kapitelId, einheitId, wert = true), istGelesen(kapitelId, einheitId),
  toggleLesezeichen(kapitelId, einheitId), istLesezeichen(kapitelId, einheitId),
  setzeTiefe('basis'|'vertiefung'|'experte'), tiefe,
  merkeQuiz(ergebnis), merkeAntwort(frageId, richtig), markiereBestanden(kapitelId, prozent),
  faelligeFragen(),                   // → [frageId]
  fortschrittKapitel(kapitelId),      // → { gelesen, gesamt, anteil, bestanden }
  fortschrittGesamt,                  // { gelesen, gesamt, anteil }   (Wert, keine Funktion)
  lesezeitEinheit(kapitelId, einheitId), lesezeitKapitel(kapitelId),   // Minuten

  // UI
  sucheOffen, sucheVorbelegung, oeffneSuche(vorbelegung?), schliesseSuche(),
  drawerOffen, setzeDrawer(bool),
  hilfeOffen, oeffneHilfe(), schliesseHilfe(),

  // Helfer (auch als benannte Exporte aus store/Wissen.jsx)
  einheitSchluessel(kapitelId, einheitId),   // `${kapitelId}/${einheitId}`
  frageKennung(kapitelId, index),            // `${kapitelId}#${index}`
  routeZuHash(route),
} = useWissen();
```

`fortschritt`:

```js
{
  gelesen:  { [`${kapitelId}/${einheitId}`]: isoZeit },
  besucht:  { [schluessel]: isoZeit },            // automatisch beim Öffnen einer Einheit
  bestanden:{ [kapitelId]: { zeit, prozent } },   // Kapitel-Check ab 80 %
  zuletzt:  { kapitelId, einheitId, zeit } | null, // automatisch beim Öffnen
  lesezeichen: [schluessel],                        // Schlüssel, nicht nur einheitId (die ist nur je Kapitel eindeutig)
  quiz: {
    verlauf: [ { zeit, modus, kapitelIds, richtig, gesamt, falsch: [frageId] } ],  // neueste zuerst, max. 100
    karten:  { [frageId]: { versuche, richtig, box: 0|1|2|3, faellig: isoZeit } },
  },
  einstellungen: { tiefe: 'basis' },
}
```

Leitner light (`merkeAntwort`): richtig → Box + 1 (höchstens 3), fällig nach
1 · 3 · 7 Tagen; falsch → Box 0, sofort fällig. `faelligeFragen()` liefert
alle Karten, deren `faellig` erreicht ist. `merkeQuiz` legt den Verlaufs-
eintrag an und setzt `bestanden`, wenn ein **Kapitel-Check**
(`modus === 'kapitel'`) genau ein Kapitel geprüft hat und
≥ 80 % richtig waren; für andere Fälle gibt es `markiereBestanden`.

Beispiele:

```jsx
// Weiterlernen-Knopf
const { fortschritt, oeffneKapitel } = useWissen();
if (fortschritt.zuletzt) oeffneKapitel(fortschritt.zuletzt.kapitelId, fortschritt.zuletzt.einheitId);

// Link auf einen Block
<a href={routeZuHash({ name: 'kapitel', kapitelId: '01-marktueberblick', einheitId: 'marktstruktur', blockId: 'b9' })}>…</a>

// Quizfrage auswerten
merkeAntwort(frageKennung(kapitel.id, index), gewaehlt === frage.correct);
merkeQuiz({ modus: 'kapitel', kapitelIds: [kapitel.id], richtig: 8, gesamt: 10, falsch: ['06-regulatorik#3', '06-regulatorik#7'] });
```

Invarianten: ist `route.name === 'kapitel'` und `laden === false`, sind
`kapitel` und `einheit` nie null (der Store leitet vorher um). `einheitId`
ist nur je Kapitel eindeutig („ueberblick“ kommt dreimal vor) — deshalb
nehmen alle Fortschrittsfunktionen `(kapitelId, einheitId)`.

### Tastaturkürzel (`useTastenkuerzel`, einmal in der AppShell)

⌘K / Strg K und `/` Suche · `g` Glossar · `w` Wissenscheck · `?` Hilfe ·
`→`/`←` nächste/vorige Lerneinheit (nur auf Kapitelseiten) · `t` Tiefe
wechseln · Esc schließen (jedes Overlay selbst). Kürzel gelten nicht in
Eingabefeldern, nicht mit Modifiern und nicht, solange Suche, Hilfe oder
Schublade offen sind. `1–4` und Enter im Wissenscheck behandelt die
Quizseite lokal. Die Liste für den Hilfedialog steht in
`store/tastenkuerzel.js` (`KUERZEL`); wer ein Kürzel ergänzt, ergänzt beides.
Eine Ausnahme: `⌘`/`Strg`+`Umschalt`+`U` öffnet das Panel „Umfang“ und steht
bewusst NICHT in `KUERZEL` (siehe „Umfangssteuerung“).

## Umfangssteuerung

Der **Umfang** bestimmt, welche Kapitel die App zeigt — ein Vorführ- oder
Freigabestand: Für eine Vorstellung lässt sich der Stoff auf eine Auswahl
begrenzen (etwa nur das erste Kapitel), später wieder vollständig freigeben.
In der Oberfläche heißt die Einstellung „Umfang“; es gibt keinen Hinweistext,
kein Banner und keinen Menüeintrag.

> **Kein Zugriffsschutz.** Die ausgeblendeten Kapitel liegen weiterhin
> vollständig in der ausgelieferten `public/data/chapters.json` und sind mit
> Entwicklerwerkzeugen (Netzwerk-Tab, `localStorage`) auffindbar. Die
> Einstellung räumt die Oberfläche auf, sie hält niemanden ab.

**Zustand** (`src/store/umfang.js`, localStorage `v1x1.umfang.v1`):

```js
{ profil: 'alles'|'auswahl', sichtbar: ['01-marktueberblick'], fortschrittZeigen: true, stand: isoZeit }
```

Standard: `profil: 'alles'`, alles sichtbar, Fortschritt sichtbar. Unbekannte
Kennungen werden übergangen, eine leere Auswahl fällt auf „alles“ zurück — es
gibt nie eine leere App. `stand` ist der Zeitpunkt der letzten Änderung.

**Zentrale Wirkung.** `Wissen.jsx` gibt `daten`, `kapitelListe`, `glossar`,
`kennzahlen`, `einheitenFolge` und `fortschritt` nur noch in der Fassung des
Umfangs heraus; `datenVoll` ist die ungefilterte Datei und gehört allein der
Umfangssteuerung. Damit wirkt die Einstellung überall, ohne dass eine Seite
davon wissen muss — Startseite, Sidebar, Suche (der Index hängt an der
Objekt-Identität von `daten` und wird deshalb neu gebaut), Glossar,
Wissenscheck, Fortschritt, Begriff des Tages, Erste Woche. Das Glossar wird
auf Begriffe beschränkt, die in den sichtbaren Kapiteln vorkommen
(`begriffeInEinheit`, je Umfang einmal gerechnet und gemerkt).

- **Anzeigenummern** zählen die sichtbare Liste neu durch (alle Nummern kommen
  aus dem Listenindex): ist nur das dritte Kapitel sichtbar, heißt es
  „Kapitel 01“. Keine Lücke in der Sidebar, kein Loch in der Nummerierung.
- **Deeplinks** auf ausgeblendete Kapitel, Lerneinheiten, Glossarbegriffe oder
  Wissenscheck-Kapitel verhalten sich wie unbekannte Routen: still per
  `replace` auf die Startseite, ohne Hinweis auf das Ziel. Bei begrenztem
  Umfang gilt das auch für unbekannte Glossar-Slugs (sonst wäre der
  Unterschied zwischen „ausgeblendet“ und „gibt es nicht“ ablesbar).
- **Fortschritt** zählt nur sichtbare Kapitel. Mit `fortschrittZeigen: false`
  beginnen Topbar-Ring, „Dein Stand“ und die Sidebar-Ringe bei 0 %, aus
  „Weiterlernen“ wird „Hier starten“ — verdeckt wird alles, was vor `stand`
  liegt. Gespeichert bleibt der ganze Stand (`v1x1.fortschritt.v2` ist
  unberührt); beim Zurückschalten ist er wieder da, und wer während der
  Vorführung liest, sieht seinen eigenen Haken sofort.
- **Ein laufender oder unterbrochener Wissenscheck** wird verworfen, wenn seine
  Fragen nicht mehr in den Umfang passen (`Wissenscheck.jsx`).

**Bedienung** (unauffällig, ohne Eintrag in Topbar, Sidebar, Fußzeile, Suche
oder Tastaturhilfe):

- `⌘`/`Strg`+`Umschalt`+`U` öffnet und schließt das Panel „Umfang“
  (`components/umfang/UmfangPanel.jsx`): Profilwahl „Alles zeigen · Nur das
  erste Kapitel · Eigene Auswahl“, alle Kapitel mit Kontrollkästchen und ihren
  Lerneinheiten und Fragen, Schalter „Fortschritt anzeigen“, eine Zeile mit der
  Wirkung („Sichtbar: 1 von 9 Kapiteln, 4 Lerneinheiten, 12 Fragen,
  9 Min. Lesezeit“) und die Knöpfe „Link mit diesem Umfang kopieren“,
  „Alles zeigen“, „Schließen“. Änderungen wirken sofort.
- **Adresse mit Parameter** setzt den Umfang beim Laden und wird danach aus der
  Adresszeile entfernt (`history.replaceState`): `?umfang=alles`,
  `?umfang=erstes`, `?umfang=01-marktueberblick,03-produktlandschaft`. Der
  Parameter wirkt auch hinter dem Hash (`#/glossar?umfang=erstes`) und auch
  dann, wenn nur der Hash wechselt (dann lädt die Seite nicht neu).
- Ein einziges Zeichen für den Eingeweihten: bei begrenztem Umfang trägt das
  Monogramm „1×1“ in der Topbar einen 3 px großen Punkt in `--akzent-lime`
  unten rechts (CSS in `styles/umfang.css`, gesteuert über
  `data-umfang="begrenzt"` auf `<html>`; ohne Titel, ohne Beschriftung).

**API** (`const { umfang } = useWissen()`):

| Feld | Bedeutung |
|---|---|
| `profil` | `'alles'` · `'erstes'` · `'auswahl'` (abgeleitet, für die Profilwahl) |
| `sichtbar` | sichtbare Kapitel-Kennungen in Originalreihenfolge |
| `alleKapitelIds` | alle Kennungen (ungefiltert) |
| `fortschrittZeigen`, `stand` | Schalter und Zeitpunkt der letzten Änderung |
| `umfangAktiv` | true, wenn nicht alles sichtbar ist |
| `setzeUmfang(teil)` | Teiländerung, setzt `stand` und speichert |
| `setzeProfil(p)`, `schalteKapitel(id)` | Profil wählen, einzelnes Kapitel umschalten |
| `alleEinschalten()`, `nurErstesKapitel()` | Alles zeigen bzw. nur das erste Kapitel der Reihenfolge |
| `setzeFortschrittZeigen(bool)` | Schalter „Fortschritt anzeigen“ |
| `demoLink()` | Adresse mit `?umfang=…` |
| `panelOffen`, `oeffnePanel()`, `schliessePanel()`, `schaltePanel()` | Panel |

Im Code stehen keine festen Kapitellisten: neue Kapitel erscheinen von selbst
im Panel, und „Nur das erste Kapitel“ nimmt immer das erste der
Datenreihenfolge.

## Tokens (`src/index.css`, `:root`)

Nur die semantischen Rollen in Komponenten verwenden:
`--marke`, `--marke-hover`, `--marke-weich`, `--marke-rand`, `--flaeche`,
`--flaeche-karte`, `--flaeche-erhoben`, `--text`, `--text-2`, `--text-3`,
`--rand`, `--rand-stark`, `--fokus`, `--erfolg[-weich]`, `--warnung[-weich]`,
`--fehler[-weich]`, `--info[-weich]`, `--tiefe-basis|-vertiefung|-experte`.
Diagramme: `--viz-1 … --viz-6` (Reihenfolge nie ändern), `--viz-sequenz-100 …
700`, `--viz-gitter`, `--viz-achse`. Maße: `--mass-text: 72ch`,
`--topbar-hoehe: 56px`, `--sidebar-breite: 280px`, `--leiste-breite: 240px`,
`--seitenrand` (24 px, ab 1280 px 32 px), Radien `--radius-s|m|l|pille`
(8/12/16/999 px), Schatten `--schatten-karte`, `--schatten-erhoben`,
Bewegung `--bewegung` (160 ms) / `--bewegung-lang` (200 ms) mit
`--bewegung-kurve`, Stapelordnung `--z-topbar|schublade|dialog|popover|tooltip`.
`--akzent-lime` nur für kleine Marken auf dunklem Grund — nie als Text auf Weiß.

Typografie: DM Sans 16 px / 1,6, Überschriften 600 (36 · 28 · 22 · 18 px,
ab 22 px −0,01 em), JetBrains Mono nur für `kbd`/`code`, Zahlen mit
`.tabular`. Fokusring global über `:focus-visible` (2 px `--fokus`, Offset
2 px). `prefers-reduced-motion` schaltet alle Animationen und CountUp ab.

Gemeinsame Klassen (`@layer components` in index.css): `.karte`
(`-eng`, `-klickbar`, `-kopf`, `-titel`), `.knopf` (`-primaer`, `-still`,
`-weich`, `-klein`, `-gross`, `-symbol`, `-breit`), `.chip` (`-aktiv`,
`-zahl`), `.pille[data-ton]`, `.kbd`/`.kbd-reihe`, `.segment`/`.segment-option`,
`.eingabe`/`.eingabe-huelle`, `.leerzustand`, `.tooltip-blase`,
`.popover-flaeche`, `.schleier`, `.dialog-*`, `.schublade-*`,
`.fortschrittsring*`, `.skelett`, `.trennzeile`, `.kennzahl*`, `.seite`,
`.mass-text`, `.meta`, `.nebentext`, `.ueberschrift-meta`, `.abschnitt`,
`.seiten-einblendung`, `.begriff`. Tailwind-Utilities bleiben erlaubt;
alles Wiederkehrende als Klasse.

Achtung Namenskollision: Klassennamen dürfen nicht mit Tailwind-Utilities
zusammenfallen (`ring`, `container`, `hidden`, `flex`, …) — Tailwind
erzeugt sonst seine eigene Regel zusätzlich. Deutsche, zusammengesetzte
Namen (`fortschrittsring`, `nav-eintrag`) sind sicher.

## Komponentenübersicht (`src/components/ui`)

| Komponente | Props | Hinweise |
|---|---|---|
| `Knopf` | `variante` primaer·sekundaer·still·weich, `groesse` klein·normal·gross, `symbol`, `symbolRechts`, `nurSymbol` (+ `aria-label`), `href`, `breit`, `type`, …rest | mit `href` ein `<a>` |
| `Chip` | `aktiv`, `symbol`, `zahl`, `href`, `onClick`, …rest | `aria-pressed` bei Knöpfen, `aria-current` bei Links; ≥ 28 px hoch |
| `Pille` | `ton` neutral·marke·erfolg·warnung·fehler·info·basis·vertiefung·experte, `punkt` | nie interaktiv |
| `Kbd`, `Tasten` | `taste` (`mod`, `Esc`, `ArrowRight`, …) bzw. `tasten: []` | `modTaste()` liefert ⌘ oder Strg, `istMac()` |
| `Karte` | `als`, `href`, `onClick`, `eng`, …rest | mit `href`/`onClick` klickbar mit leisem Hover |
| `Eingabe` | `wert`, `onAendern(wert)`, `placeholder`, `symbol`, `label`, `loeschbar`, `gross`, `ref`, …rest | |
| `Leerzustand` | `symbol`, `titel`, `text`, `aktion` | |
| `Fortschrittsring` | `anteil` 0..1, `groesse` 16·24·40·120, `prozent` (Zahl daneben), `zahlInnen` (Zahl in der Mitte, Stufe 120), `fertig` (Haken), `label` | `role="img"` mit aria-label; die Stufe 120 zeichnet den Wert im zweiten Bild (Transition) und trägt das Ergebnis des Wissenschecks |
| `CountUp` | `wert`, `dezimalen` (sonst aus dem Wert), `dauer`, `kennung` | zählt nur beim ersten Erscheinen je `kennung`; reduced-motion → sofort |
| `Tooltip` | `text`, `seite`, `verzoegerung`; Kind = ein Element | Portal, geklemmt, Hover + Fokus, `role="tooltip"`, `aria-describedby` |
| `Popover` | `ausloeser` (Element), `offen`/`onOeffnen`/`onSchliessen` (optional gesteuert), `seite`, `ausrichtung`, `titel`, `fokus` | Portal, geklemmt, Fokus rein/raus, Esc, Klick außerhalb, `aria-expanded`/`aria-controls`; `fokus={false}` öffnet ohne Fokuswechsel (per Zeiger geöffnete Quellen-Popover) |
| `Dialog` | `offen`, `onSchliessen`, `titel`, `beschreibung`, `label` (ohne Titel), `ausrichtung` mitte·oben, `breite`, `schliessenKnopf`, `fuss` | modal, Fokusfalle, Esc, Schleier, Scroll-Sperre, `inert` auf #root, Fokus-Rückgabe; `[data-autofokus]` setzt den Startfokus. **Reihenfolge der Haken beachten:** `useHintergrundInert` steht vor `useFokusfalle`, sonst gibt die Falle den Fokus zurück, während `#root` noch `inert` trägt — er landet dann im `<body>` |
| `Schublade` | `offen`, `onSchliessen`, `titel` | Drawer links, gleiche Mechanik |
| `Segment` | `optionen: [{ wert, label, punktFarbe?, deaktiviert?, hinweis? }]`, `wert`, `onWechsel`, `label`, `klein` | `role="radiogroup"`, Pfeiltasten, Home/Ende |
| `Tastaturhilfe` | `offen`, `onSchliessen` | Dialog mit `KUERZEL` |
| `UeberspringLink` | `ziel`, Kind | Skip-Link |
| `Icons` | `ICON_MAP`, `getIconComponent(name)` (= `ikone`), benannte Re-Exporte | neue Namen nur am Ende der Map anhängen, damit bestehende Kacheln ihr Symbol behalten |

`schweben.js` bündelt die Mechanik: `berechnePosition(anker, groesse, opt)`,
`useFokusfalle(ref, aktiv, { anfang: 'erstes'|'container' })`, `useEscape`,
`useScrollSperre`, `useHintergrundInert`, `fokussierbare(container)`. Die
Fokus-Rückgabe versucht es einen Frame später noch einmal, wenn der erste
Versuch an einem noch gesetzten `inert` gescheitert ist.

Layout (`src/components/layout`): `AppShell` (Raster, `<main id="inhalt">`,
Kürzel, Hilfe, Schublade), `Topbar` (Marke, Breadcrumb ≥ 1024, Suche,
Glossar, Wissenscheck, Fortschrittsring, Plattform), `Sidebar` (Filter,
Kapitelbaum, Fußzeile; `inSchublade`), `Breadcrumb`, `Lesefortschritt`.

**Glossar im Text:** `<Begriff slug>{text}</Begriff>` setzt die Marke (nur
erste Nennung je Absatz, nie in Überschriften, `code` oder Quellen — die
Regeln stehen in `lib/begriffe.js`, gesetzt wird sie in
`content/Inline.jsx`). Die Hover-Card dazu ist `glossar/BegriffKarte.jsx`
(`useBegriffKarte`, Daten aus `glossar/begriffsDaten.js`): öffnet nach 600 ms
Zeigen, bei Fokus nach 120 ms, bei Klick fest; Esc schließt, der Fokus kehrt
zur Marke zurück. `<BegriffeChips einheit />` listet die Begriffe einer
Lerneinheit am Fuß.

**Suche:** `lib/suche.js` baut aus `daten` und `glossar` einen Index
(`indexFuer`) mit Einträgen der Typen `kapitel`, `einheit`, `inhalt` (je Block,
mit `blockId` für den Sprung zur Fundstelle), `glossar` und `werkzeug`;
`suche(index, wort)` bewertet Präfix, Wortanfang und Teiltreffer,
`markiere(text, woerter)` liefert die Teile für die Hervorhebung und
`ladeZuletzt`/`merkeZuletzt` die letzten Suchen (`SCHLUESSEL.zuletztGesucht`).
Verglichen wird über `falte()` (ä→ae, ß→ss, weiche Trennstriche entfernt).

## Konventionen

**Dateibesitz (aus der parallelen Bauphase, als Herkunftsnachweis):** Agent Kapitel: `src/pages/Kapitel.jsx`,
`src/components/kapitel/*`, `src/styles/kapitel.css`. Agent Blöcke:
`src/components/content/*`, `src/components/charts/*`, `src/utils/citeMap.js`,
`src/styles/bloecke.css`. Agent Suche/Glossar: `src/components/suche/*`,
`src/lib/suche.js`, `src/pages/Glossar.jsx`, `src/components/glossar/*`,
`src/styles/suche.css`, `src/styles/glossar.css`. Agent Wissenscheck:
`src/pages/Wissenscheck.jsx`, `src/components/quiz/*`, `src/lib/quiz.js`,
`src/styles/quiz.css`. Agent Daten: `public/data/chapters.json`,
`scripts/daten-*.mjs`. Agent Umfang: `src/store/umfang.js`,
`src/components/umfang/*`, `src/styles/umfang.css`. Die gemeinsamen Dateien (index.css, App.jsx, Store,
ui/*, layout/*) gehören seit der Integration allen; Änderungen daran müssen
`npm run pruefen` grün halten.

**Seiten** sind Default-Exporte ohne Props und lesen alles aus
`useWissen()`; `App.jsx` mountet `pages/Kapitel|Glossar|Wissenscheck|Start`
und `components/suche/SuchePalette` (wenn `sucheOffen`) — die Dateien
werden 1:1 ersetzt, App.jsx bleibt.

**Blöcke:** `alleBloecke(einheit)` liefert `{ block, tiefe, id }` mit ids
`b0`, `b1`, … über level1 → level2 → level3; jeder gerenderte Block trägt
`id={id}`, `data-block` und `data-typ`. Vertrag (einzige Fassung):
`<ContentBlocks bloecke={[{ block, tiefe, id }]} kapitel einheit />`.
Unbekannte Typen werden ausgelassen, nie gerendert; ein Fehler in einem Block
reißt die Seite nicht mit (Fehlergrenze je Block). Recharts nur per
`React.lazy` (vite.config.js hält es aus dem Hauptbündel heraus).

**Inhaltsblöcke:** Die Typ-Map steht in `src/components/content/ContentBlocks.jsx`
(`BLOCK_MAP`), die Klartextnamen für Inhaltsverzeichnis und Suche in
`lib/bloecke.js` (`TYP_NAMEN`), der sichtbare Text für Lesezeit und Suchindex
in `lib/text.js` (`blockText` — neue Felder dort ergänzen, sonst unterschätzen
Lesezeit, „Auf dieser Seite“ und Suche den Block). Bestand: `paragraph`,
`callout`, `table`, `comparisonTable`, `infoKachelGrid`, `timeline`,
`heatmapGrid`, `chartLine`, `chartBar`, `chartDonut`, `sankey`,
`regulatoryPyramid`, `valueChain`, `combinedRatioCalc`, `provisionCalc`,
`trendRadar`, `networkGraph`, `decisionTree`.

Die sieben Grafiken des Sektortrainings (im Hausstil gezeichnet, keine
Bilddateien; `fussnote` nennt die Folie, Glossarmarken sind in Grafiken aus):

| Typ | Zweck | Schema (optionale Felder mit `?`) |
|---|---|---|
| `archetypenKarte` | Landkarte von Gruppen mit Beziehungen (Deck 11) | `spalten:[{ titel, hinweis?, gruppen:[{ titel, text, rolle?:'traeger'\|'kein-traeger'\|'unterstuetzer' }] }]`, `mitte:{ titel, text }`, `beziehungen?:[{ von, nach, art:'deckt'\|'zahlt'\|'unterstuetzt' }]` |
| `stufenTabelle` | Rechenschema mit Zwischen- und Endsummen (Deck 68/69) | `kopf:[zeile, bedeutung]`, `zeilen:[{ zeichen:'+'\|'-'\|'=', text, bedeutung, art?:'posten'\|'zwischensumme'\|'endsumme', formel? }]` |
| `morphologischerKasten` | Einordnung entlang von Dimensionen mit Beispielen (Deck 75–83) | `dimensionen:[{ id, titel, optionen:[{ id, label, gruppe? }] }]`, `beispiele:[{ id, titel, text, auswahl:{ dimensionId: optionId\|optionId[] }, ergebnis?:{ titel, punkte:[…], ausgangslage?, vorgehen? } }]` |
| `formelAufbau` | Formel Glied für Glied (Deck 54) | `glieder:[{ zeichen, name, text, beispiel? }]`, `ergebnis:{ name, text }` |
| `simulationGrosseZahlen` | Regler für den Risikoausgleich (Deck 52/53) | `vorgabe:{ kollektiv, wahrscheinlichkeit, schadenhoehe }`, `erklaerung:[…]` |
| `risikokette` | Stufen der Risikoweitergabe (Deck 56/71) | `stufen:[{ titel, text, traegt?, beispiel?, uebergang? }]` — `uebergang` beschriftet den Pfeil zur nächsten Stufe (Rückfall „reicht Risiko weiter“); die letzte Stufe hat keinen |
| `prozessKette` | Kernfunktionen mit Supportbändern (Deck 58–65) | `kern:[{ id, titel, text, aufgaben?, kennzahlen?:[{ label, wert }], projektfelder? }]`, `support:[{ titel, text }]` — lange Komposita in `kern[].titel` tragen weiche Trennstriche (U+00AD), die `entferneHtml`/`falte` für Suche und Lesezeit wieder entfernen |

Jede Grafik hat eine gleichwertige Zweitfassung (Umschalter „Karte/Liste“,
„Diagramm/Tabelle“) und fällt unter einer Blockbreite von 560 bis 660 px von
selbst darauf zurück — so ist jeder Wert auch ohne Zeigegerät erreichbar.
Erklärender Fließtext in den Grafiken bleibt auf `--mass-text`.

**Lesefortschritt:** Die 2-px-Linie unter der Topbar (nur Kapitelseite)
liest die CSS-Variable `--lesefortschritt` (0..1) auf
`document.documentElement`. Die Kapitelseite setzt sie beim Scrollen:

```js
document.documentElement.style.setProperty('--lesefortschritt', String(anteil));
```

Beim Verlassen der Kapitelseite räumt `Lesefortschritt` die Variable ab.
„Gelesen“ wird still gesetzt, wenn ≥ 80 % gescrollt wurden und die Einheit
mindestens 15 s offen war (`markiereGelesen`), außerdem über den Knopf.

**Weitere Regeln:** keine Emojis; nur einfarbige Lucide-Icons
(`currentColor`, Strichstärke 1,75 via CSS); deutsche Formate über
`lib/format.js` (geschützte Leerzeichen: `6,6 %`, `254 Mrd. €`,
`01.09.2025`); Du-Ansprache; alle Zahlen aus den Daten, nie hart codiert;
Seiten nutzen die volle Breite, Fließtext auf `.mass-text`; Zielgrößen
≥ 24 px; jedes Overlay mit Fokusfalle und Esc; Bewegung ≤ 200 ms.

## Prüfen

```bash
npm run pruefen             # die ganze Kette, grün oder Exit-Code ≠ 0
```

Die Kette ist: **Importprüfung → Datenprüfung → Build → Browserprüfung**
(Rauchtest und Umfangsprüfung gegen eine Vorschau, die
`scripts/mit-vorschau.mjs` selbst startet und danach beendet). Einzeln:

```bash
npm run importpruefung      # freie Bezeichner in JSX (Rollup prüft sie nicht)
npm run daten-pruefung      # chapters.json: Schema, Formate, Quiz, Glossar, Lesezeit
npm run build               # muss ohne Fehler und ohne neue Warnungen laufen
npm run vorschau &          # http://127.0.0.1:4173
npm run rauchtest           # Klickstrecke, Maße, Kontrast, axe-core
npm run umfang-pruefung     # 74 Prüfungen der Umfangssteuerung
```

**Importprüfung** (`scripts/importpruefung.mjs`): vergleicht je Datei die
Importe mit den Bezeichnern, die als JSX-Element gesetzt oder als bekannte
Hilfsfunktion aufgerufen werden. Kommentare, Zeichenketten und Regex-Literale
werden vorher entfernt (ein `<Quelle>` im Kommentar löste sonst Fehlalarm aus).
Ein fehlender Import baut fehlerfrei durch und wirft erst zur Laufzeit — genau
diese Klasse Fehler fängt der Test, auch in Pfaden, die niemand anklickt.

**Rauchtest** (`scripts/rauchtest.mjs`, Playwright/Chromium, Strecke aus
`chapters.json` — er wächst mit dem Inhalt): Startseite leer und mit
Fortschritt, **jede Lerneinheit in allen drei Tiefen**, in der Tiefe Experte
jede Tafel und jedes Diagramm mit der Maus angefahren, **jede Quellen-Nummer
angeklickt** (Soll-Zahl aus den Daten) und Begriffe mit Hover-Card, Glossar mit
A–Z, Filter und Deeplink, Wissenscheck nur mit der Tastatur (1–4, Enter) bis
zum Ergebnis samt Abbruch-Dialog, Suchpalette mit „Solvency“ und Enter auf
einem Inhaltstreffer (muss zur Fundstelle springen und sie hervorheben),
Tastaturhilfe, Umfangs-Panel, Schublade bei 390 px. Er schlägt an bei:
Laufzeit- und Konsolenfehlern, HTTP ab 400, Emojis, Ersatzzeichen und
Geviertstrichen im DOM, „€“ vor der Zahl, Balken-/Liniendiagrammen ohne
Achsenbeschriftung, waagerechtem Überlauf bei 1600/1280/1024/390 px (Dokument,
Karten, Scrollrahmen), starken Kappungen, Fokus ohne sichtbaren Ring
(Tabulatorlauf, weil `:focus-visible` nur auf echte Tastendrücke reagiert),
Overlays ohne Esc oder ohne Fokus-Rückgabe, Textkontrast unter 4,5:1 (200
Textknoten je Ansicht aus den berechneten Farben), Schrift unter 12 px und
axe-core-Befunden der Stufen „serious“ und „critical“.

Der vollständige Lauf dauert rund 15 Minuten (219 Ansichten, 263 Quellen,
axe-core auf zwölf Ansichten). Zum Nacharbeiten einzelner Bereiche:
`NUR=einheiten,masse node scripts/rauchtest.mjs` (Abschnitte: `einheiten`,
`bloecke`, `glossar`, `quiz`, `suche`, `overlays`, `masse`), `AXE=0` überspringt
axe-core, `ALLE=1` kürzt die Befundlisten nicht.

Zwei Ausnahmen sind im Quelltext erklärt, nicht im Test versteckt:
`data-rollen="absicht"` an einem Rahmen, der laut Brief bewusst seitlich rollt
(Einheitenleiste, breite Tabellen, Heatmap — jeweils mit Tastaturzugang und
Namen), und `data-kappung="absicht"` an einem Text, der von sich aus ein Auszug
ist (Suchtreffer-Ausschnitt, zitierter Satz im Quellen-Popover).

**Bilderbogen** (`scripts/bilderbogen.mjs <ordner>`): legt je Breite (1600,
1280, 1024, 390 — `BREITEN=…` für andere) Screenshots aller Ansichten ab, dazu
einen Bogen `12-blocktypen/` mit jedem Blocktyp einzeln. Wer das Aussehen
beurteilt, sieht so jede Ansicht ohne eigenes Klicken.
