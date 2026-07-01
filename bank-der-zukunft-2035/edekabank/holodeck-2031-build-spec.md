# EDEKABANK Holodeck 2031 — Build-Spezifikation für Claude Code

Diese Datei ist die **Quelle der Wahrheit** für den Bau des Tools. Bitte zuerst vollständig lesen, dann in den unten beschriebenen **gestaffelten Schritten** arbeiten und nach jedem Schritt das Ergebnis zeigen, bevor es weitergeht.

---

## 1. Kontext & Ziel

Wir bauen ein interaktives Workshop-Tool: die **Kommandobrücke der EDEKABANK 2031** als begehbares Strukturbild. Man sieht ein photorealistisches Ankerbild der runden Brücke (zwei Vorstände vorne, fünf Spezialstationen im Bogen dahinter). Per Klick auf eine Station **fliegt die Kamera** in diese Station hinein und zeigt einen Deep-Dive: links das Bild der Person über die Schulter, rechts eine Textspalte mit der Botschaft des Bereichs.

- **Kein** Heute-vs-2035-Vergleichsbild. Eine Zukunftswelt.
- **Keine** Demo-Absprünge, keine iframes. Nur Bild links + Text rechts.
- Sprache der Oberfläche: **Deutsch**.

## 2. Vorgehen (wichtig)

1. **Zuerst das bestehende Repo verstehen** (Struktur, Router, Build, vorhandenes Banking-2035-Tool als Vorbild für Stil und Kameraflug).
2. Das Holodeck **additiv** anlegen: eigene Route, eigener Ordner. **Das bestehende Tool bleibt unverändert und erreichbar.**
3. **Iterativ** bauen (Schritte in Abschnitt 11), nach jedem Schritt zeigen.

## 3. Tech-Stack & Constraints

- React 19 + Vite + TypeScript (streng typisiert), **CSS Modules** (kein Tailwind).
- **GSAP 3.15** für den Kameraflug, **lucide-react** für Icons (nur einfarbige, moderne SVG-Icons).
- **Privacy-first:** keine externen CDNs, keine externen Fonts/Tracker. System-Font-Stack.
- Hosting: Cloudflare Pages (`kiarbeitsplatz.pages.dev`).
- Saubere TS-Build ohne Fehler, Lint clean.
- `prefers-reduced-motion` respektieren (Kameraflug auf Crossfade reduzieren).

## 4. Route & Ablage

- **Route:** eigene Route, z. B. `/holodeck-2031` (an die bestehende Router-Konvention anpassen). Eigener Ordner unter `src/`, z. B. `src/holodeck/`.
- **Bilder:** nach `public/images/holodeck/`. Namensschema (Endung an die echten Downloads anpassen — vermutlich `.png` oder `.webp`):

| Slot | Datei |
|---|---|
| Anker (Brücke) | `00-anker.webp` |
| Vertrieb | `01-vertrieb.webp` |
| Produkt | `02-produkt.webp` |
| Betrieb | `03-betrieb.webp` |
| Risiko & Steuerung | `04-risiko.webp` |
| IT & Daten | `05-it.webp` |

> Falls die Downloads PNG sind: Endung im Datenmodell anpassen, sonst nichts ändern.

## 5. Design-Tokens

- Akzent (EDEKABANK-Blau): `--accent: #005CA9;` · dunkler: `#00427A`. Leicht austauschbar halten (ein Token).
- Neutrale Flächen dunkel/elegant passend zum Bild; Text gut lesbar.
- Schrift in der **Textspalte: 14 px Basis** (die Tool-Texte sind darauf ausgelegt).
- Keine verspielten/bunten Icons; nur einfarbige Lucide-Icons.

## 6. Datenmodell

```ts
// src/holodeck/data.ts
export interface Zone {
  /** Mittelpunkt der Station auf dem Ankerbild, in % der Bildbreite/-höhe (0–100). */
  x: number;
  y: number;
  /** Klick-/Hotspot-Radius in % (für die unsichtbare Trefferfläche). */
  r: number;
}

export interface AreaField {
  label: string; // z.B. "Mandat"
  text: string;
}

export interface Area {
  id: "vertrieb" | "produkt" | "betrieb" | "risiko" | "it";
  label: string;       // "Vertrieb"
  persona: string;     // "Lena Brandt, 34"
  role: string;        // "Relationship Lead"
  screenTitle: string; // "HÄNDLER-RADAR"
  image: string;       // "/images/holodeck/01-vertrieb.webp"
  zone: Zone;          // Position der Station auf dem Ankerbild
  fields: AreaField[]; // Mandat / Skills / Zielbild Automatisierung / Delta zu heute
}

export type View =
  | { kind: "overview" }                 // Anker, Brücke-Text rechts
  | { kind: "deepdive"; areaId: Area["id"] }
  | { kind: "outro" };                   // Führungsfrage
```

## 7. Zonen-Koordinaten (Startwerte — am echten Ankerbild kalibrieren)

Diese Werte sind **Schätzungen** für die Klick-Hotspots auf dem Ankerbild und müssen über den Debug-Editor (Abschnitt 10) am finalen Bild justiert werden. Anordnung: Captains vorne Mitte (kein Hotspot), fünf Stationen im Bogen dahinter.

```ts
const ZONES: Record<Area["id"], Zone> = {
  vertrieb: { x: 22, y: 60, r: 12 }, // vorne links
  it:       { x: 78, y: 60, r: 12 }, // vorne rechts
  produkt:  { x: 31, y: 44, r: 10 }, // hinten links
  risiko:   { x: 69, y: 44, r: 10 }, // hinten rechts
  betrieb:  { x: 50, y: 39, r: 10 }, // hinten Mitte
};
```

## 8. Inhalte (Tool-Texte, McKinsey-Stil)

Diese Texte gehören in die rechte Spalte. Verbatim übernehmen.

### Einstieg — Die Brücke (Overview-Text, rechts)
- **These:** Die KI-native Bank ist kein Technologie-Upgrade der bestehenden Bank, sondern ein anderes Betriebsmodell — Menschen steuern, KI exekutiert.
- **Leitfrage:** Nicht „Welche KI?", sondern „Sind wir bereit, Aufbau-, Rollen- und Steuerungslogik entsprechend umzubauen?"

### Vertrieb — Lena Brandt, 34 · Relationship Lead — `HÄNDLER-RADAR`
- **Mandat:** Steuert Akquise und Bindung im Händlergeschäft; verlagert den eigenen Einsatz von Volumen auf die wenigen wertentscheidenden Interaktionen.
- **Skills:** Relationship- und Verhandlungskompetenz; kritische Bewertung KI-generierter Handlungsempfehlungen; Eskalations- und Abschlusssicherheit in Hochwert-Situationen.
- **Zielbild Automatisierung:** KI antizipiert Bedarfe (Liquidität, Saison, Expansion) und steuert Ansprache, Angebot und Timing autonom; menschlicher Eingriff nur an definierten Vertrauens-Touchpoints.
- **Delta zu heute:** Heute reaktiv, manuell, mit später Signalerkennung. Implikation: Vertriebskapazität verschiebt sich von Breite zu Tiefe — weniger Köpfe, höhere Anforderung pro Kopf; hinzu kommt die Akzeptanz, autonome Vertriebsentscheidungen in der Breite der KI zu überlassen.

### Produkt — Jonas Keller, 29 · Solution Designer — `LÖSUNGS-BAUKASTEN`
- **Mandat:** Verantwortet Passung und Marge des Lösungsangebots; gestaltet den Baukasten und die Leitplanken, nicht das Einzelprodukt.
- **Skills:** Modulares Produktdenken; Ökonomie des Händlergeschäfts; Definition von Leitplanken und Freigabelogik für KI-Konfiguration.
- **Zielbild Automatisierung:** KI konfiguriert je Cluster in Echtzeit die optimale Lösung aus Modulen und re-optimiert kontinuierlich; Time-to-Solution von Monaten auf Minuten.
- **Delta zu heute:** Heute lange Entwicklungszyklen und Standardprodukte mit Streuverlust. Implikation: Der statische Produktkatalog — und die Funktion, die ihn pflegt — verliert seine Existenzberechtigung.

### Betrieb — Aylin Demir, 45 · Operations Steward — `AUTONOME ABWICKLUNG`
- **Mandat:** Sichert Durchlauf und Qualität in Kredit, KYC und Abwicklung; steuert das Ausnahme-Regime statt des Normalbetriebs.
- **Skills:** Prozess- und Kontrollkompetenz; Entscheidungsstärke im Ausnahmefall; Sensorik dafür, welche Fälle bewusst dem Menschen vorbehalten bleiben.
- **Zielbild Automatisierung:** Straight-Through-Processing für das Gros der Fälle; der Mensch bearbeitet nur Ausnahmen. Steuerungsgröße ist die Qualität der Ausnahmeerkennung, nicht das Bearbeitungsvolumen.
- **Delta zu heute:** Heute personalintensive Einzelfallbearbeitung. Implikation: Bei STP-Quoten jenseits 90 % ist nicht Effizienz die Frage, sondern der Kapazitäts- und Rollenumbau im Backoffice.

### Risiko & Steuerung — Robert Hofer, 57 · Risk & Resilience Officer — `FRÜHWARNUNG & SZENARIEN`
- **Mandat:** Verantwortet Früherkennung und Resilienz; verlagert die Funktion von Reporting zu aktiver Vorsteuerung.
- **Skills:** Szenario- und Frühindikatorenkompetenz; präventive statt reaktiver Steuerungslogik; Entscheidungsfähigkeit unter Unsicherheit.
- **Zielbild Automatisierung:** Echtzeit-Signalauswertung, kontinuierliche Szenariosimulation (z. B. Kaufkraft −10 %) und automatisierte Maßnahmenempfehlung vor Eskalation.
- **Delta zu heute:** Heute periodisches, rückblickendes Reporting. Implikation: Verschiebung von Schadensverwaltung zu Schadensvermeidung — mit entsprechend anderem Funktions- und Kompetenzprofil.

### IT & Daten — Priya Nair, 38 · Platform & Data Steward — `DATEN- & KI-PLATTFORM`
- **Mandat:** Verantwortet das Daten- und KI-Betriebssystem als Enabler aller Automatisierung; sichert Vertrauenswürdigkeit der Modelle.
- **Skills:** Daten- und Plattformarchitektur; Modell-Governance und -Sicherheit; Übersetzung zwischen Technik, Fachbereich und Aufsicht.
- **Zielbild Automatisierung:** Integriertes Datenfundament (Händler-, Bank-, Externdaten) speist alle Use Cases; Modelle laufend überwacht, abgesichert und governt.
- **Delta zu heute:** Heute Datensilos und isolierte Pilotierung. Implikation: Der kritische Investitionshebel ist nicht das Modell, sondern das Datenfundament — typischerweise unterinvestiert und aufgeschoben.

### Abschluss — Die Führungsfrage (Outro)
- **Strukturthese:** Weniger Rollen, Schnittstellen und Abstimmungsschleifen; dafür Konzentration von Steuerung und Verantwortung auf wenige Punkte — Führung über Leitplanken und Ausnahmen statt Einzelfallkontrolle.
- **Entscheidung:** Operating-Model-Redesign vs. KI als Aufsatz auf den Status quo. Letzteres erhöht die Kostenbasis, ohne den Strukturvorteil zu heben — teure alte Bank statt neue.

## 9. Layout, Zustände & Interaktion

**Layout (Desktop):** zweispaltig, links ca. **60 %** (Bildbühne), rechts ca. **40 %** (Textspalte). Mobil: Bild oben, Text darunter.

**Zustände (siehe `View`):**

1. **overview** — Ankerbild füllt die linke Bühne. Über den fünf Stationen liegen unsichtbare Klick-Hotspots (per `ZONES`), markiert durch dezente, pulsierende einfarbige Marker (Lucide, z. B. `Plus`/`Circle`) + Tooltip mit Bereichsname. Rechts: Titel „EDEKABANK Holodeck 2031", der **Brücke**-Text und eine Liste der fünf Bereiche (auch klickbar). Irgendwo dezent ein Einstieg in die **Führungsfrage** (Outro).
2. **deepdive** — Kameraflug in die geklickte Station (Abschnitt 10), danach links das Deep-Dive-Bild der Person, rechts die vier Felder (Mandat / Skills / Zielbild Automatisierung / Delta zu heute) plus Kopf „Persona · Rolle · Screen-Titel". Zurück-Button (Lucide `ArrowLeft`) und Prev/Next zwischen den Bereichen.
3. **outro** — Führungsfrage als ruhige Schluss-Slide; Zurück zur Brücke.

**Interaktion:** Klick auf Station-Hotspot **oder** Listeneintrag → `deepdive`. Zurück → `overview`. Tastatur: `Esc` = zurück, `←/→` = Bereich wechseln. Fokusführung & ARIA-Labels für die Hotspots.

## 10. Kameraflug-Mechanik (GSAP)

Der „Flug" ist ein Zoom auf dem Ankerbild zur Station hin, dann Crossfade auf das Deep-Dive-Bild:

1. Setze `transform-origin` des Ankerbild-Containers auf die Zone (`${zone.x}% ${zone.y}%`).
2. GSAP: `scale` von 1 → ~2.4 und gleichzeitig `opacity` 1 → 0 über ~700–900 ms, `ease: "power2.inOut"`.
3. Bei Abschluss: Deep-Dive-Bild einblenden (`opacity` 0 → 1, leichter Scale 1.05 → 1) und Textspalte rechts wechseln.
4. Zurück: umgekehrt (Deep-Dive raus, Anker von Zoom zurück auf `scale: 1`).
5. `prefers-reduced-motion`: kein Zoom, nur Crossfade (200 ms).

Die `scale`-Zielwerte und Dauer als Konstanten oben im Modul, damit leicht justierbar.

## 11. Debug-Zonen-Editor (zum Kalibrieren am echten Ankerbild)

Da das finale Ankerbild noch entsteht, brauchen wir einen Editor, um `ZONES` am echten Bild zu justieren — analog zum Banking-2035-Tool:

- Aktivierung per Taste `D` oder `?debug` in der URL.
- Blendet die fünf Zonen als Kreise/Rechtecke über dem Ankerbild ein, zeigt die Mausposition live in % an, Zonen per Drag verschiebbar, Radius justierbar.
- Gibt die justierten `ZONES` als **kopierbaren TS-Code** aus.
- Nicht im normalen Workshop-Modus sichtbar.

## 12. Gestaffelte Bauschritte (nach jedem Schritt zeigen)

1. **Gerüst:** additive Route, zweispaltiges Layout-Shell, Ankerbild laden, Debug-Zonen-Editor. Ziel: Bild lädt, Zonen lassen sich justieren.
2. **Hotspots + Kameraflug:** Klickbare Stationen, GSAP-Zoom auf die Zone, Crossfade-Platzhalter.
3. **Deep-Dive-View + Inhalte:** Deep-Dive-Bilder, Datenmodell (Abschnitt 6–8) einbinden, Textspalte mit den vier Feldern, Zurück/Prev/Next.
4. **Übergänge & Politur:** Fades, Tastatur, `prefers-reduced-motion`, ARIA/Fokus, Responsiv (mobil Bild oben/Text unten).
5. **Outro & Feinschliff:** Führungsfrage-Slide, Brücke-Liste, Marker-Styling, leere/fehlende Bilder sauber abfangen (Platzhalter).

## 13. Akzeptanzkriterien

- Bestehendes Tool unverändert und weiterhin erreichbar.
- Neues Tool unter eigener Route; sauberer TS-Build ohne Fehler, Lint clean.
- Ankerbild lädt; fünf Stationen klickbar; weicher Kameraflug rein/raus.
- Pro Bereich: Deep-Dive-Bild links + vier Felder (Mandat/Skills/Zielbild/Delta) rechts; Persona/Rolle/Screen-Titel im Kopf.
- Brücke (Einstieg) und Führungsfrage (Outro) vorhanden.
- Debug-Editor blendet Zonen ein und liefert justierte `ZONES` als kopierbaren Code.
- Keine externen Requests (keine CDNs/Fonts/iframes).
- `prefers-reduced-motion` reduziert den Flug auf Crossfade.

## 14. Offene Abhängigkeiten (vor/while Schritt 3)

- **Finale Bilder** (Anker + 5 Deep-Dives) nach `public/images/holodeck/` legen; Endung im Datenmodell prüfen (`.webp` vs `.png`).
- **Logo:** wird nachträglich in Photoshop auf die Konsolenfront des Ankerbilds gesetzt — Tool muss nichts dafür tun.
- **Persona-Namen** ggf. durch echte Bereichsverantwortliche ersetzen (nur `data.ts` anpassen).
- `ZONES` nach Schritt 1 am echten Ankerbild final justieren.
