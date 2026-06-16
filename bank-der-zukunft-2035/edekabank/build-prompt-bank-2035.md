# Build-Prompt: „Bank 2035 – Begehbares Strukturbild" (neues Tool im bestehenden Repo)

> Diesen Prompt komplett an Claude Code geben. Er beschreibt ein **neues, eigenständiges Tool**, das **additiv neben dem bestehenden Tool** im selben Repo entsteht. Das bestehende Tool darf nicht verändert oder beeinträchtigt werden.

---

## 0. Auftrag in einem Satz

Baue ein interaktives Workshop-Tool: ein fotorealistischer Gebäude-Querschnitt einer Bank dient als **begehbare Navigationskarte**. Per **GSAP-Kameraflug** zoomt man in **7 Kapitel-Zonen** hinein. Jedes Kapitel zeigt **3 Hypothesen** als Heute-vs-2035-Vergleichsbilder (Labels als CSS-Overlay) und bietet einen **Absprung** in eine Demo (iframe) oder eine eigene interaktive Oberfläche.

---

## 1. ZUERST: Repo verstehen (nicht überspringen)

Bevor du Code schreibst:
1. Verschaffe dir einen Überblick über das Repo (Ordnerstruktur, `package.json`, Vite-Config, vorhandenes Routing, bestehende Komponenten und CSS-Module-Konventionen, Lint-/TS-Konfiguration, Pfad-Aliase).
2. Finde heraus, wie das **bestehende Tool** eingebunden ist (Single-Page mit Router? mehrere Einstiegspunkte?).
3. Integriere das neue Tool **additiv**:
   - Wenn ein Router existiert: neue Route, z. B. `/bank-2035`.
   - Wenn nicht: lege einen sauberen neuen Einstiegspunkt/Bereich an und dokumentiere kurz, wie man ihn erreicht.
   - Lege den neuen Code in einem eigenen Ordner ab (z. B. `src/bank2035/`), damit nichts mit dem bestehenden Tool kollidiert.
4. Übernimm die bestehenden Konventionen (Aliase, CSS-Modules-Muster, Lint-Regeln, Formatierung).

**Erst danach** mit dem Bauen beginnen.

---

## 2. Stack & Constraints (verbindlich)

- **React 19 + Vite + TypeScript**, TS so streng wie im Repo konfiguriert (keine `any`, `strict`, idealerweise `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Sauber typisieren statt casten.
- **CSS Modules** – kein Tailwind, keine UI-Library.
- **GSAP 3.15** für den Kameraflug (bereits Repo-Konvention; sonst als Dependency ergänzen).
- **lucide-react** für Icons – ausschließlich monochrom, dezent.
- **Akzentfarbe Deloitte-Grün `#046A38`** (als CSS-Variable, z. B. `--accent`).
- **Privacy-first:** KEINE externen CDNs, Web-Fonts, Tracker oder Fremd-Requests. Alle Assets/Fonts lokal. (Ausnahme: die Demo-iframes unten – das sind bewusste, konfigurierbare Ziele.)
- Primär **Desktop/Beamer** (Workshop-Setting), aber responsiv und auf Mobile bedienbar.
- Deutschsprachige UI.

---

## 3. Assets

Alle Bilder liegen unter `public/images/` (oder der bestehenden Asset-Konvention). Endung `.webp`. Falls real `.png/.jpg`: Endung im Datenmodell anpassen.

- `00-strukturbild.webp` – der Master-Querschnitt = die Navigationskarte (Seitenverhältnis 3:2).
- `NN-h1.webp`, `NN-h2.webp`, `NN-h3.webp` – die 3 Hypothesen-Vergleichsbilder je Kapitel (`NN` = `01`…`07`), je ein 16:9-Split (links Heute, rechts 2035).
- `NN-demo.webp` (Kapitel 01/02/05) bzw. `NN-aktion.webp` (Kapitel 03/04/06/07) – das Absprung-Bild. Demo-Bilder enthalten einen leeren grauen Screen als iframe-Fläche.

Die Status-Labels („STATUS QUO" / „2035") sind **nicht** in die Bilder gebrannt – sie kommen als CSS-Overlay (siehe §7).

---

## 4. Datenmodell (zentrale Konstante)

Lege eine zentrale, streng typisierte Datendatei an (z. B. `src/bank2035/data.ts`). Koordinaten sind **Prozentwerte bezogen auf das Strukturbild** (0–100), gemessen am finalen Master. Sie sind bewusst justierbar (siehe Debug-Editor §7).

```ts
export type ActionType = 'demo-iframe' | 'cocreation' | 'dilemma';

export interface Hypothesis {
  id: string;          // z.B. "01-h1"
  title: string;       // Kurztitel (Panel-Überschrift)
  text: string;        // Aussage (Heute → 2035)
  image: string;       // /images/01-h1.webp
}

export interface ChapterAction {
  type: ActionType;
  title: string;       // Button-/Screen-Titel
  image: string;       // Absprung-Bild
  iframeEnv?: string;  // Name der ENV-Variable mit der Demo-URL (nur demo-iframe)
}

export interface Zone {
  id: string;
  kapitel: string;     // "01".."07"
  label: string;
  centerX: number; centerY: number;  // % – Zentrum der Zone im Strukturbild
  width: number; height: number;     // % – Ausdehnung der Zone
}

export interface Chapter {
  id: string;
  title: string;
  zoneId: string;
  hypotheses: [Hypothesis, Hypothesis, Hypothesis];
  action: ChapterAction;
}

// Auf das finale Strukturbild ausgemessene Startwerte – im Debug-Editor feinjustierbar.
export const ZONES: Zone[] = [
  { id: 'kunde',          kapitel: '01', label: 'Kundenperspektive', centerX: 27, centerY: 65, width: 34, height: 16 },
  { id: 'vertrieb',       kapitel: '02', label: 'Markt & Vertrieb',  centerX: 27, centerY: 49, width: 34, height: 16 },
  { id: 'marktfolge',     kapitel: '03', label: 'Marktfolge',        centerX: 73, centerY: 65, width: 32, height: 16 },
  { id: 'corporate',      kapitel: '04', label: 'Corporate Services',centerX: 28, centerY: 31, width: 36, height: 16 },
  { id: 'it',             kapitel: '05', label: 'Technologie / IT',  centerX: 30, centerY: 85, width: 38, height: 22 },
  { id: 'compliance',     kapitel: '06', label: 'Compliance & Risk', centerX: 27, centerY: 12, width: 36, height: 18 },
  { id: 'transformation', kapitel: '07', label: 'Transformation',    centerX: 50, centerY: 50, width: 13, height: 94 },
];
```

**Kapitel-Inhalte** (Titel je Hypothese + Aussage + Aktion). Übernimm diese Texte 1:1:

**01 Kundenperspektive** · Aktion: `demo-iframe` „Demo Liquid" (`01-demo`, ENV `VITE_DEMO_LIQUID_URL`)
- h1 „Kunde verschwindet als Moment" — Heute aktives, kanalzentriertes Banking; 2035 begleiten KI-Finanzassistenten kontinuierlich und proaktiv.
- h2 „Optionen verschwinden, Entscheidung wird vorbereitet" — Heute viele Optionen zum Selbstentscheiden; 2035 eine klare KI-Empfehlung mit Simulation und Begründung.
- h3 „Von Reaktion zu trusted autonomy" — Heute Interaktion auf Kundeninitiative; 2035 handeln autonome Agenten früh in Leitplanken.

**02 Markt & Vertrieb** · Aktion: `demo-iframe` „Vertriebscockpit" (`02-demo`, ENV `VITE_DEMO_VERTRIEBSCOCKPIT_URL`)
- h1 „Vom Produktvertrieb zum Lösungsorchestrator" — Vom Produktvertrieb zum kontext-basierten Lösungsorchestrator – der Kunde definiert das Ziel.
- h2 „Vom Berater zum KI-Sparringspartner" — Standardtransaktionen autonom, Mensch bei Komplexität.
- h3 „Permanente hyperpersonalisierte Schnittstelle" — Von punktueller zu permanenter, hyperpersonalisierter Kundenschnittstelle in Echtzeit.

**03 Marktfolge** · Aktion: `cocreation` „Strategy Lab" (`03-aktion`)
- h1 „Autonome Dunkelverarbeitung" — Standardvorfälle (Kredit, KYC, Abwicklung) laufen E2E automatisch.
- h2 „Wertschöpfungskette bricht auf" — Externe Plattformen/Utilities liefern Standardleistungen herein.
- h3 „Skalierbare Serviceplattform" — Marktfolge wird zur Serviceplattform – Banking-Services für Dritte.

**04 Corporate Services** · Aktion: `cocreation` „Co-Creation" (`04-aktion`)
- h1 „Kontinuierlicher Skill-Aufbau" — Vom isolierten Training zum kontinuierlichen, personalisierten Skill-Aufbau.
- h2 „Organisation skills-gesteuert" — AI orchestriert Skills, Rollen, Teams in Echtzeit.
- h3 „Workforce-Steuerung als Vorteil" — Datenbasiert und vorausschauend.

**05 Technologie / IT** · Aktion: `demo-iframe` „SDLC AI-Platform" (`05-demo`, ENV `VITE_DEMO_SDLC_URL`)
- h1 „Selbstoptimierende AI-Delivery" — Software entwickelt, testet, deployt sich selbst.
- h2 „AI entscheidet, IT wird Plattform" — IT als modulare API-Plattform statt Monolith.
- h3 „Fachbereiche steuern direkt" — IT verliert die Gatekeeper-Rolle.

**06 Compliance & Risk** · Aktion: `dilemma` „Kredit-Dilemma" (`06-aktion`)
- h1 „Von ex-post zu Echtzeit" — Prüfung im Moment der Transaktion.
- h2 „Three-Lines-of-Defense verschmilzt" — Ein integrierter Governance-Leitstand.
- h3 „Cyber & Op-Risk im Betriebsmodell" — Resilienz im Betrieb verwoben.

**07 Transformation** · Aktion: `cocreation` „Future Interaction Model" (`07-aktion`)
- h1 „Ökosystem-Plattform mit Governance" — Daten, Partner, Compliance integriert.
- h2 „AI-natives Operating Model" — Journey-Teams, E2E-Ownership, Human-in-the-loop.
- h3 „Decision-first Transformation" — Erst kritische Decision Journeys + Decision Spine, dann AI-Rollout.

---

## 5. Tool-Flow / States

Ein State-Modell (z. B. `'overview' | 'flying' | 'chapter' | 'action'`):

- **overview:** das ganze Strukturbild, 7 Zonen als unsichtbare/dezente Hotspots; Hover → Akzentrahmen + Label.
- **flying:** GSAP-Kameraflug (Übergang, nicht interaktiv).
- **chapter:** in die Zone gezoomt; das Kapitel-Panel mit Hypothesen-Slider (1/2/3) ist offen.
- **action:** der Absprung (Demo-iframe / Strategy Lab / Co-Creation / Kredit-Dilemma) im Vollbild-Overlay.

Navigation: Klick auf Zone → `flying` → `chapter`. Im Kapitel „Aktion starten" → `action`. „Zurück" überall → eine Ebene zurück, am Ende Kameraflug raus → `overview`. ESC schließt Overlays. Tastatur: Pfeile blättern Hypothesen.

---

## 6. Kameraflug (GSAP)

Das Strukturbild liegt in einem `overflow:hidden`-Viewport, das Bild selbst in einem Wrapper, der per `transform` skaliert/verschoben wird.

- Beim Zonen-Klick berechnest du aus `centerX/Y` und `width/height` der Zone das Ziel-`scale` und die Ziel-`translate`, sodass die Zone den Viewport möglichst formatfüllend zentriert (Seitenverhältnis des Viewports berücksichtigen; etwas Padding einplanen).
- GSAP animiert `scale` + `x/y` mit weicher Ease (`power3.inOut`, ~1.0–1.4 s).
- Rückweg: zurück auf `scale: 1`, `x/y: 0`.
- `transform-origin: 0 0` am Wrapper, Berechnung in Prozent des Bildes → robust gegen Viewport-Größe. Bei Resize neu berechnen.
- Kapitel-Panel erst nach Abschluss des Flugs einblenden.

Implementier die Mathematik als reine, getestete Hilfsfunktion (`computeTransform(zone, viewport)`), damit sie unabhängig prüfbar ist.

---

## 7. Overlays & Debug-Zonen-Editor (CSS, nichts ins Bild rendern)

- **Zonen-Hotspots (overview):** absolut positionierte Flächen in % über dem Bild; per Default unsichtbar, Hover/Focus → dezenter Akzentrahmen (`--accent`) + Label. Klickbar, fokussierbar (a11y).
- **Hypothesen-Overlays:** über dem Heute/2035-Split-Bild liegen zwei kleine Labels – links oben „STATUS QUO", rechts oben „2035" – als CSS, plus Kapitel- und Hypothesen-Titel. Saubere Typo, konsistent mit dem Master-Look.
- **Debug-Zonen-Editor (wichtig, hinter Toggle z. B. `?debug` oder Taste `D`):** Blendet alle Zonen-Rechtecke sichtbar ein, zeigt die aktuelle Mausposition in % an und erlaubt, eine Zone per Drag/Resize zu verschieben; die aktualisierten `ZONES`-Werte werden als kopierbarer Code ausgegeben. Damit kann der Nutzer die Koordinaten am echten Bild final justieren, ohne zu raten. Im normalen Modus ist der Editor komplett aus.

---

## 8. Kapitel-Ansicht

- Seitliches/unteres Panel mit Kapitel-Titel.
- **Hypothesen-Slider** 1 → 2 → 3 (Pfeile + Dots). Pro Hypothese: das Split-Bild groß, die zwei Status-Overlays, der Hypothesen-Kurztitel + die Aussage als Text.
- Button **„Aktion starten"** (Label = `action.title`) → öffnet den Absprung (§9).
- „Zurück zur Übersicht" → Kameraflug raus.

---

## 9. Absprünge (3 eigene interaktive Elemente + iframe-Demos)

**a) Demo-iframe (01 Liquid, 02 Vertriebscockpit, 05 SDLC):**
Der graue Screen im Demo-Bild wächst per GSAP auf ein Vollbild-Overlay und lädt dann einen `<iframe>` mit der URL aus der jeweiligen ENV-Variable (`import.meta.env.VITE_DEMO_*`). **Die URLs sind noch nicht final** → als ENV/Prop, mit sichtbarem Platzhalter-Zustand („Demo-URL noch nicht hinterlegt") wenn leer. Schließen → iframe entladen, zurück ins Kapitel.

**b) Strategy Lab (03) – Diskussions-Oberfläche:**
Eigene Komponente: drei Entscheidungs-Fragen (Zukunftsrolle? Intern vs. Ökosystem? Plattformpotenzial?) mit auswählbaren Karten, die der Moderator im Workshop durchgeht. State lokal, keine Persistenz nötig (optional `localStorage` ist im Repo erlaubt? – falls nicht, nur In-Memory).

**c) Co-Creation Canvas (04, 07):**
Eigene Komponente: eine Fläche, auf der man frei Notiz-Karten/Sticky-Notes anlegen, beschriften und anordnen kann (z. B. entlang vorgegebener Dimensionen bei 04 bzw. einer Control-Shift-Matrix bei 07). In-Memory.

**d) Kredit-Dilemma-Tool (06) – eigene Sequenz:**
Szenario „Großkunde will 100 Mio €-Kredit, die KI lehnt autonom ab. Wer haftet?" Drei Balken **Regulatorik / Geschwindigkeit / Zufriedenheit**, die je nach Moderator-Auswahl reagieren. **Videoclips als Platzhalter** (Prop/leerer `<video>`-Slot, klar als TODO markiert).

Alle Absprünge teilen sich ein gemeinsames Vollbild-Overlay-Gerüst (Header mit Titel + Schließen).

---

## 10. Vorgehen in Schritten (bitte iterativ, nicht alles auf einmal)

1. **Gerüst:** neue Route/Ordner, `data.ts`, Strukturbild im Viewport rendern, Zonen-Hotspots, **Debug-Editor**. (Erst hier stoppen und zeigen.)
2. **Kameraflug:** `computeTransform`, GSAP-Flug overview ↔ chapter.
3. **Kapitel-Ansicht:** Hypothesen-Slider + Overlays + Texte.
4. **Absprünge:** Demo-iframe-Mechanik + Strategy Lab + Co-Creation + Kredit-Dilemma.
5. **Politur:** Transitions, Responsive, a11y (Fokus, ESC, Tastatur), Reduced-Motion-Fallback, Build-Check & Lint sauber.

Nach jedem Schritt kurz zeigen, was läuft, bevor es weitergeht.

---

## 11. Offene Platzhalter (klar im Code markieren, z. B. `// TODO`)

- 3 Demo-iframe-URLs: `VITE_DEMO_LIQUID_URL`, `VITE_DEMO_VERTRIEBSCOCKPIT_URL`, `VITE_DEMO_SDLC_URL` (in `.env.example` dokumentieren).
- Videoclips für das Kredit-Dilemma-Tool (06).
- Feinjustierung der `ZONES`-Koordinaten am finalen Bild über den Debug-Editor.

---

## 12. Akzeptanzkriterien

- Bestehendes Tool unverändert und weiterhin erreichbar.
- Neues Tool unter eigener Route, sauberer TS-Build ohne Fehler, Lint clean.
- Strukturbild lädt, 7 Zonen klickbar, weicher Kameraflug rein/raus.
- Je Kapitel 3 Hypothesen-Bilder mit STATUS-QUO/2035-Overlays + Texten, blätterbar.
- Alle Absprünge funktionieren (Demos zeigen Platzhalter, wenn keine URL gesetzt).
- Debug-Editor blendet Zonen ein und gibt justierte Koordinaten als kopierbaren Code aus.
- Keine externen Requests außer den konfigurierten Demo-iframes.
