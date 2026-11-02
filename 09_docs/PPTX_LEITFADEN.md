# Leitfaden: Saubere PowerPoint-Präsentationen erstellen

Dieses Dokument beschreibt, wie im KI-Arbeitsplatz-Repository PowerPoint-Dateien
entstehen, welche Regeln für Aufbau und Gestaltung gelten und wie eine Datei
geprüft wird, bevor sie an Kunden oder ins Repository geht.

Hintergrund: Präsentationen mit Inhalt (Angebote, Workshops, Zwischenberichte,
Strategie-Decks) werden **nicht** mehr im Repository abgelegt. Sie sind groß,
binär, nicht diff-bar und enthalten häufig Kundendaten. Im Repository bleiben
ausschließlich inhaltsfreie Master-Vorlagen unter `assets/`.

---

## 1. Was ins Repository darf und was nicht

| Dateityp | Im Repository | Ablageort |
|---|---|---|
| Master-Vorlage ohne Inhalt (nur Platzhalter, Layouts, Theme) | Ja | `assets/` |
| Präsentation mit Inhalt (Angebot, Status, Workshop, Strategie) | Nein | SharePoint / Teams / lokal |
| Excel-Arbeitsmappen mit Fachdaten | Nein | SharePoint / Teams / lokal |
| Excel-Template, das eine App zur Laufzeit lädt | Ja | `<app>/src/assets/` |
| Skripte, die Decks oder Excel-Dateien erzeugen | Ja | neben dem jeweiligen Modul |

Aktuell im Repository:

- `assets/2025_CPE_Status_Template.pptx`: Einseitiges Status-Template (Teilprojekt-Status
  mit Fortschritt, Aktivitäten, Risiken, Meilensteinen, Entscheidungen, Ampel).
  Wird von der PMO-Toolbox (`js/modules/pmo-toolbox.esm.js`, Funktion `exportPPT`)
  per JSZip geladen und über Platzhalter-Ersetzung befüllt.
- `14_kreditanalyse/src/assets/template-kreditkontoneuanlage.xlsm`: Excel-Template, das die
  Kreditanalyse-App beim Export der Allgemeinen Angaben befüllt. Kein Fachinhalt.

Ein Master gilt als „ohne Inhalt", wenn alle Textfelder nur Platzhalter tragen
(`Xxx`, `tt.mm.jjjj`, `Titel`, `Untertitel`), keine Kundennamen, Zahlen oder
Screenshots enthalten sind und die Notizen leer sind.

---

## 2. Dateinamen

Schema: `JJJJMMTT_Thema_Zusatz_Vn.pptx`

- Datum vorne, ISO-Reihenfolge, ohne Trennzeichen: `20260903`
- Thema in CamelCase oder mit Unterstrichen, keine Leerzeichen, keine Umlaute (`ae`, `oe`, `ue`, `ss`)
- Versionszähler am Ende: `_V1`, `_V2`, … Für versendete Stände `_vsent`, für den finalen Stand `_vfinal`
- Keine Klammern, keine Sonderzeichen, keine Copy-Suffixe wie `(2)` oder `Kopie von`

Beispiele:

```
20260903_Banking_Strategy_2030_V8.pptx
20260903_Referenzgespraeche_Auswertung_vfinal.pptx
2025_CPE_Status_Template.pptx          (Master ohne Datum, da versionslos)
```

---

## 3. Aufbau einer sauberen Datei

### 3.1 Genau ein Master, wenige Layouts

Eine PowerPoint-Datei besteht aus Folienmaster, Layouts und Folien. Sauber heißt:

- **Ein** Folienmaster pro Datei. Mehrere Master entstehen durch Copy-Paste aus
  fremden Decks und ziehen fremde Farben, Schriften und Layouts mit.
- Nur die Layouts behalten, die tatsächlich genutzt werden. Typischer Satz:
  Titel, Abschnittstrenner, Titel + Inhalt, Zwei Spalten, Nur Titel, Leer.
  Ungenutzte Layouts löschen (Ansicht → Folienmaster → Layout rechtsklick → Löschen).
- Kein Layout darf Inhalt tragen. Layouts definieren Position, Größe und Formatierung,
  nicht Text.

### 3.2 Platzhalter statt freier Textfelder

- Titel, Untertitel und Body immer über die Platzhalter des Layouts setzen.
  Nur so greifen Master-Änderungen (Schrift, Farbe, Position) auf alle Folien.
- Frei platzierte Textfelder nur für Fußnoten, Quellen oder Beschriftungen in Grafiken.
- Platzhalter nicht verschieben oder skalieren. Wenn ein Layout nicht passt, ein
  neues Layout im Master anlegen statt auf der Folie zu improvisieren.
- Beim Einfügen aus anderen Decks immer „Zielformat verwenden" wählen, nie
  „Ursprüngliche Formatierung beibehalten".

### 3.3 Schrift, Farbe, Raster

- Schriften ausschließlich aus dem Theme (`Aptos`, Fallback `Segoe UI`). Keine manuell
  zugewiesenen Schriften auf einzelnen Folien.
- Farben ausschließlich aus der Theme-Palette. Keine RGB-Werte per Hand, keine
  Verläufe, keine Schatten, keine 3D-Effekte.
- Ein Raster mit Rändern verwenden und daran ausrichten. Die Werte aus
  `09_docs/SLIDE_TEMPLATE_SPEC.md` gelten sinngemäß auch für PowerPoint:
  Titelzone oben, Body ab etwa 130 px, Fußzeile unten mit fester Höhe, nichts darunter.
- Schriftgrößen: Titel 24 bis 28 pt, Body 12 bis 14 pt, Fußnoten 8 bis 9 pt.
  Nichts unter 8 pt, Text darf nie automatisch verkleinert werden
  (Textfeld → „Text nicht automatisch anpassen").

### 3.4 Icons und Bilder

- Keine Emojis, nirgends. Weder in Titeln noch in Bullets, Tabellen oder Notizen.
- Icons ausschließlich einfarbig als SVG (Lucide, Heroicons, Tabler). Farbe über
  die Theme-Palette, keine Multi-Color-Icons, keine Verläufe.
- Bilder vor dem Einfügen auf die benötigte Größe skalieren. Screenshots als PNG,
  Fotos als JPG. Vor dem Versand „Bilder komprimieren" ausführen (Dateigröße unter
  10 MB anstreben).
- Keine eingebetteten Excel-Objekte, Videos oder verknüpften Dateien. Diagramme
  als native PowerPoint-Diagramme oder als Bild einfügen.

### 3.5 Deutsche Formate

Wie in allen Apps des Repositories gilt deutsche Lokalisierung:

| Element | Format | Beispiel |
|---|---|---|
| Datum | `TT.MM.JJJJ` | `03.09.2026` |
| Datum lang | `T. Monat JJJJ` | `3. September 2026` |
| Uhrzeit | `HH:MM` | `14:30` |
| Beträge | Punkt tausender, Komma dezimal | `1.234,56 EUR` |
| Prozent | Komma dezimal, Leerzeichen vor `%` | `12,5 %` |

Englische Monatsnamen, `MM/DD/YYYY` oder `1,234.56` sind Fehler.

---

## 4. Inhaltliche Regeln

- **Eine Botschaft pro Folie.** Der Titel formuliert die Aussage als ganzen Satz
  (Action Title), nicht als Thema. „Rücklaufquote steigt seit Juni auf 61 %"
  statt „Rücklaufquote".
- **Maximal sechs Bullets, maximal zwei Ebenen.** Bullets sind Stichpunkte, keine
  Fließtextabsätze. Wer mehr Text braucht, braucht eine zweite Folie.
- **Titel, Untertitel, Body, Fußzeile.** Jede Folie hat diese vier Zonen. Die
  Fußzeile trägt Quelle, Vertraulichkeitsvermerk, Datum und Foliennummer.
- **Zahlen immer mit Quelle und Stand.** In der Fußzeile oder als Fußnote,
  Stand als `TT.MM.JJJJ`.
- **Management Summary vorne.** Ergebnisse zuerst, Herleitung danach, Backup ans Ende.
- **Keine Folien im Anhang, die nicht verlinkt oder erwähnt werden.**

---

## 5. Präsentationen programmatisch erzeugen

Für wiederkehrende Decks (Status, KPI-Berichte, Auswertungen) werden Folien aus
Daten erzeugt statt von Hand gebaut. Zwei Wege sind im Repository etabliert.

### 5.1 Neues Deck mit pptxgenjs (Browser oder Node)

Vorbild: `02_BankenKPI/src/utils/pptExport.js`. Kernprinzipien:

1. Layout auf `LAYOUT_WIDE` (13,33 × 7,5 Zoll, 16:9) setzen.
2. **Einen** Master über `defineSlideMaster` anlegen: Kopfleiste, Fußzeile,
   Foliennummer, Vertraulichkeitsvermerk. Alle Folien entstehen mit diesem Master.
3. Farben und Schriften als Konstanten am Anfang der Datei, kein Hex-Wert inline.
4. Zahlen und Daten über `toLocaleString('de-DE')` formatieren.
5. Dateiname nach Schema aus Abschnitt 2 setzen.

```js
import PptxGenJS from 'pptxgenjs';

const PRIMARY = '003B6E';
const TEXT_DARK = '0F172A';
const TEXT_GRAY = '64748B';
const BORDER = 'E2E8F0';
const FONT = 'Aptos';

export async function exportDeck(rows) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';

  pptx.defineSlideMaster({
    title: 'MASTER',
    background: { color: 'FFFFFF' },
    objects: [
      { rect: { x: 0, y: 0, w: 13.33, h: 0.55, fill: { color: PRIMARY } } },
      { line: { x: 0.5, y: 7.15, w: 12.33, h: 0, line: { color: BORDER, width: 0.5 } } },
      { text: { text: 'Vertraulich', options: { x: 0.5, y: 7.18, w: 6, h: 0.25, fontSize: 9, color: TEXT_GRAY, fontFace: FONT } } },
    ],
    slideNumber: { x: 12.7, y: 7.18, w: 0.5, h: 0.25, fontSize: 9, color: TEXT_GRAY, fontFace: FONT, align: 'right' },
  });

  const slide = pptx.addSlide({ masterName: 'MASTER' });
  slide.addText('Rücklaufquote steigt seit Juni auf 61 %', {
    x: 0.5, y: 0.7, w: 12.33, h: 0.5, fontSize: 24, bold: true, color: TEXT_DARK, fontFace: FONT,
  });
  slide.addTable(
    rows.map(r => [r.name, r.wert.toLocaleString('de-DE', { minimumFractionDigits: 1 }) + ' %']),
    { x: 0.5, y: 1.4, w: 12.33, fontSize: 12, fontFace: FONT, border: { type: 'solid', color: BORDER, pt: 0.5 } },
  );

  const datum = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  await pptx.writeFile({ fileName: `${datum}_Auswertung_V1.pptx` });
}
```

Bullets in pptxgenjs immer als Array mit `bullet: true` übergeben, nie als String mit
`•` oder `-` am Anfang.

### 5.2 Bestehenden Master befüllen (JSZip oder python-pptx)

Vorbild: `exportPPT` in `js/modules/pmo-toolbox.esm.js`. Der Master
`assets/2025_CPE_Status_Template.pptx` wird geladen, die Platzhalter im Slide-XML
werden ersetzt, die Datei wird neu gepackt.

Regeln für diesen Weg:

- Platzhalter im Master eindeutig benennen (`Xxx` reicht nicht, wenn mehrere Felder
  gleich heißen). Besser: `{{TITEL}}`, `{{FORTSCHRITT_1}}`, `{{DATUM}}`.
- Text vor dem Einsetzen XML-escapen (`&`, `<`, `>`, `"`).
- Nie XML-Struktur entfernen, nur Textknoten `<a:t>…</a:t>` ersetzen.
- Für mehrere Folien: `slide1.xml` als Vorlage kopieren, in `presentation.xml` und
  den `_rels` registrieren. Ab drei Folien ist python-pptx die bessere Wahl.

Mit python-pptx:

```python
from pptx import Presentation

prs = Presentation('assets/2025_CPE_Status_Template.pptx')
slide = prs.slides[0]
for shape in slide.shapes:
    if not shape.has_text_frame:
        continue
    for para in shape.text_frame.paragraphs:
        for run in para.runs:
            if run.text == 'CPE – Teilprojekt':
                run.text = 'Prüf-Bot Bestandsübertragung'
prs.save('20260903_Status_PruefBot_V1.pptx')
```

Wichtig: Text nur auf Run-Ebene ersetzen, damit Schrift und Farbe des Masters
erhalten bleiben. `shape.text = …` verwirft die Formatierung.

### 5.3 Neuen Master für das Repository bauen

Wenn ein neuer Master nach `assets/` soll:

1. Neue Datei aus dem Firmen-Theme anlegen, kein bestehendes Deck ausräumen.
2. Layouts auf den benötigten Satz reduzieren.
3. Auf jeder Beispiel-Folie nur Platzhalter-Text lassen (`{{TITEL}}` oder `Xxx`).
4. Notizen leeren, Dokumenteigenschaften prüfen (Datei → Informationen → Eigenschaften):
   Autor, Firma, Titel neutral setzen, Kommentare entfernen.
5. „Dokument prüfen" (Datei → Informationen → Auf Probleme überprüfen) ausführen
   und alles außer Layouts und Theme entfernen lassen.
6. Datei umbenennen nach Schema `JJJJ_Zweck_Template.pptx`, nach `assets/` legen.
7. Im Code über absoluten Pfad `/assets/<datei>.pptx` laden, nie kopieren.

---

## 6. Bestehende Datei aufräumen

Vor dem Versand oder bevor eine Datei zum Master wird:

1. **Master prüfen:** Ansicht → Folienmaster. Mehr als ein Master? Alle Folien auf
   den Ziel-Master umstellen (Start → Layout), übrige Master löschen.
2. **Layouts entrümpeln:** Ungenutzte Layouts löschen. PowerPoint zeigt beim
   Überfahren an, welche Folien ein Layout nutzen.
3. **Folien auf Layout zurücksetzen:** Start → Zurücksetzen. Verschobene
   Platzhalter springen zurück, manuelle Formatierung verschwindet.
4. **Fremde Schriften finden:** Datei → Informationen zeigt eingebettete Schriften.
   Start → Ersetzen → Schriftarten ersetzen, alles auf `Aptos`.
5. **Bilder komprimieren:** Bild markieren → Bildformat → Bilder komprimieren →
   „Auf alle Bilder anwenden", 150 ppi, zugeschnittene Bereiche löschen.
6. **Notizen und Kommentare löschen:** Überprüfen → Kommentare löschen → Alle;
   Notizen über „Dokument prüfen" entfernen.
7. **Dokument prüfen** (Datei → Informationen → Auf Probleme überprüfen):
   Metadaten, Kommentare, Notizen, ausgeblendete Folien, Off-Slide-Inhalte entfernen.
8. **Ausgeblendete Folien** entweder löschen oder in ein separates Backup-Deck verschieben.
9. **Speichern unter** mit neuem Namen nach Schema. Nie über die vorherige Version
   speichern, wenn sie bereits versendet wurde.

---

## 7. Checkliste vor dem Versand

- [ ] Genau ein Folienmaster, nur genutzte Layouts
- [ ] Alle Folien nutzen Platzhalter, keine verschobenen Textfelder
- [ ] Nur Theme-Schriften und Theme-Farben
- [ ] Keine Emojis, Icons einfarbig
- [ ] Jeder Titel ist eine Aussage in einem Satz
- [ ] Maximal sechs Bullets, zwei Ebenen, kein Text unter 8 pt
- [ ] Datum, Zahlen und Beträge im deutschen Format
- [ ] Quelle und Stand auf jeder Folie mit Zahlen
- [ ] Fußzeile mit Vertraulichkeitsvermerk und Foliennummer
- [ ] Bilder komprimiert, keine eingebetteten Objekte oder Verknüpfungen
- [ ] Notizen, Kommentare, ausgeblendete Folien entfernt
- [ ] Dokumenteigenschaften geprüft, Autor und Firma korrekt
- [ ] Dateiname nach Schema `JJJJMMTT_Thema_Vn.pptx`
- [ ] Datei liegt in SharePoint oder Teams, nicht im Repository

---

## 8. Typische Fehler und ihre Ursache

| Symptom | Ursache | Behebung |
|---|---|---|
| Fremde Schrift auf einzelnen Folien | Copy-Paste mit Ursprungsformatierung | Folie zurücksetzen, Schriftart ersetzen |
| Zwei Master in der Datei | Folien aus anderem Deck eingefügt | Folien auf Ziel-Layout umstellen, Master löschen |
| Datei über 30 MB | Unkomprimierte Screenshots, eingebettete Excel-Objekte | Bilder komprimieren, Objekte als Bild einfügen |
| Titel springt zwischen Folien | Platzhalter manuell verschoben | Folie zurücksetzen |
| Text wird automatisch kleiner | Autofit aktiv | Text kürzen oder auf zwei Folien verteilen, Autofit aus |
| `March 2026` statt `März 2026` | Englisches Systemdatum eingefügt | Datum als Text eingeben, deutsches Format |
| Notizen mit Kundendaten im Versand | Dokument nicht geprüft | „Dokument prüfen" vor jedem Versand |
