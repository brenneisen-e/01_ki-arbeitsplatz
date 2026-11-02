# Banking Horizon 2030 — Änderungsübersicht (Workshop-Feedback umgesetzt)

Dieses Dokument fasst alle konkreten Änderungen zusammen, die auf Basis des
Workshop-Feedbacks (rote Markierungen und gelbe Kommentarfelder in
`Banking-Horizon-2035_Hypothesen_DE.xlsx`) im interaktiven Strukturbild
umgesetzt wurden. Gegliedert in **Streichungen/Umbenennungen**, **Anpassungen**
und **Neu**. Alle Texte sind zweisprachig (DE/EN) gepflegt.

---

## 0. Global

- **Zeithorizont geändert: 2035 → 2030.** Alle im UI sichtbaren Jahresangaben,
  Titel, Labels, Vergleichsspalten („2035" → „2030"), der Produktname
  („Banking Horizon 2030"), der Seitentitel sowie das interne Datenfeld
  (`in2035` → `in2030`) wurden umgestellt. (Der Auslieferungs-Pfad
  `…/bank-der-zukunft-2035/…` bleibt technisch unverändert.)

## 1. Struktur / Technik

- **Variable Hypothesen-Anzahl je Kapitel.** Bisher waren exakt 3 Hypothesen je
  Kapitel fest verdrahtet. Kapitel können jetzt zusätzliche Hypothesen tragen
  (Reader-Pager, Deep-Links, Excel-Export und Navigation zählen dynamisch mit —
  „Hypothese X von N").

## 2. Neu je Kapitel: Management Summary & Business Case

- **In jedem Kapitel** ist jetzt ein aufklappbarer Block **„Management Summary &
  Business Case"** direkt im Kapitel verfügbar:
  - **Management Summary** = das Zielbild/Vision-Statement des Bereichs.
  - **Business Case (exemplarisch)** = grobe, **illustrative**
    Financial-Impact-Schätzung der Änderungen (Annahmen: mittelgroße Bank;
    Kernzahlen fett). Beispiele: Kundenperspektive ~8–12 Mio € Mehrertrag p.a.,
    Marktfolge ~10–14 Mio € Einsparung p.a., IT ~16–28 Mio € p.a.
  > Hinweis: Die Zahlen sind bewusst als Beispielrechnung markiert und vor
  > externer Nutzung mit realen Annahmen zu hinterlegen.

## 3. Anpassungen an bestehenden Hypothesen (aus rotem/gelbem Feedback)

**02 Markt & Vertrieb**
- H1 (Lösungsorchestrator): „Der Kunde definiert das Ziel" → **„Ziel und
  Ausgangssituation"**.
- H2 (KI-augmentierte Beratung): Kernaussage **„menschliche Beratung … bei
  komplexen Themen"** jetzt fett hervorgehoben.

**05 Technologie / IT**
- H1 (AI-Delivery): Ergänzt — die verbleibenden Teams **coden nicht mehr,
  sondern überwachen/steuern die KI** (Rollenwandel).
- H2 (Entscheidungen zur AI): zweiter Satz größer gedacht — IT wird zur
  **datengetriebenen, sich kontinuierlich selbst verbessernden Plattform**
  (Loop, Geschwindigkeit/Timing).
- H3 (Gatekeeper-Rolle): reframt — statt „Interaktion steigt" jetzt
  **integrierte, vertikale Delivery-Teams** (Fachbereich ist Teil des Teams).

**06 Compliance & Risk**
- H1: Status Quo um **hohe Kostenintensität / niedrige regulatorische
  Geschwindigkeit** ergänzt; 2030 um **„schneller und effizienter"** ergänzt.
- H2: **Titel entschärft** — „verliert seine heutige Form" → **„verändert sich
  grundlegend"**; 2030 um **„AI-Kompetenz als Schlüsselfähigkeit"** ergänzt.
- H3: Status Quo um **sich verschärfende Bedrohungslage** ergänzt; 2030 um
  **„überlebenswichtig / robuste Cyber- und Operational-Risk-Fähigkeiten"**.

**07 Transformation**
- H1: um **„AI als Fixstern"** (Plattform = Geschäfts- und Betriebsmodell, Fokus
  HR/Change) ergänzt.
- H2: **Titel** um „Transformation" ergänzt.
- H3: Status Quo um **Reparaturmodus / 2–4 Deployments p.a.**; 2030 um
  **Idee→Ausführung verkürzt / 100+ Deployments p.a.**

## 4. Neue Hypothesen (aus „Neue Hypothese"-Notizen)

- **03 Marktfolge → H4:** „Regulatorik & Compliance wandern in den Lifecycle"
  (compliant by design; aufgesetzte Compliance-Schicht bricht auf).
- **04 Organisationsentwicklung → H4:** „Lernen wird immersiv und
  KI-personalisiert" (VR-Training; KI leitet aus der Skill-Veränderung ein
  Trainingsprogramm ab).
- **04 Organisationsentwicklung → H5:** „Demografischer Wandel erzwingt
  lebenslanges Reskilling" (auch 50+ lernen grundlegend neue Skills).
- **06 Compliance & Risk → H4:** „Compliance & Innenrevision stellen sich neu
  auf" (Enabler der KI-Transformation; Explainability der KI-Outputs).
- **07 Transformation → H4:** „Change ist im Target Operating Model verankert".
- **07 Transformation → H5:** „Neue Projektmethodik & klarer Transformationspfad"
  (Artefakte, Reifegrad → nächste Schritte → Zielbild).

> Die neuen Hypothesen sind bilingual im Deck-Duktus formuliert. Bilder sind als
> Platzhalter angelegt (`Kapitel N_4.png` / `N_5.png`) — bis zur Bildlieferung
> zeigt die App einen sauberen Platzhalter.

## 5. Kredit-Dilemma (Kapitel 06, Demo)

- Betrag **100 Mio € → 50.000 €**. Die autonome Entscheidungsgrenze ist jetzt
  **gestuft** (5.000 · 50.000 · 500.000 · 5 Mio · 50 Mio €) und richtet sich nach
  der **Risikoklasse des Kunden** und den KI-Hintergrundinformationen
  (Briefing-Text und Kapitel-Beschreibung angepasst).

---

## 6. In Arbeit / nächste Schritte (bereitgestellt, aber noch offen)

Diese vom Workshop gewünschten Punkte hängen an einem **neuen Strukturbild** bzw.
sind größere Interaktions-Bausteine und folgen als nächster Schritt:

1. **Neues Gebäude-Layout** (erfordert neu erzeugtes Master-Bild):
   - Erdgeschoss: **Filiale links**, **Markt & Vertrieb (Beratungsgespräch)
     rechts**.
   - **Organisationsentwicklung** rückt eine Etage nach unten.
   - **Compliance & Risk** rückt an die frei werdende Stelle (2. OG links) —
     **neue Darstellung: Risikocontroller vor Bildschirmen** (nicht Boardroom).
   - **Neues Kapitel „Boardroom"** oben links (Vorstand, ähnlich dem heutigen
     Governance-Cockpit-Bild).
   > Die passenden Bild-Prompts wurden separat bereitgestellt; nach Bildlieferung
   > werden Zonen-Koordinaten und Kapitel-Zuordnung im Code nachgezogen.
2. **Szenario-Matrix als Intro** („bevor das Haus öffnet") — 2×2-Matrix mit
   sinnvollen Achsen (inkl. geopolitischer Komponente) und vier Szenarien, wie
   sich Banken bis 2030 entwickeln; Darstellung im Stil des `/holodeck`-Vorspanns.
3. **Dynamische Leitfragen als Overlay-Chatbot** (statt statischer Sprechblase),
   orientiert am „KI-Vertriebsassistent"-Chatbot (unten rechts) aus dem
   Vertriebsarbeitsplatz.

---

## 7. KPIs: Zielkorridore statt Punktwerte, Modell und Quellen raus

Aus dem Feedback zum Strukturbild („bei den KPIs müssen wir im Modell noch
etwas abstrakter werden, das Modell dahinter rausnehmen, mit Ranges arbeiten
und nicht auf Quellen anderer Beratungen verweisen"):

- **Ranges statt Circa-Punktwerte.** Die vier Potenzial-Kacheln je Kapitel
  („Management Summary | Kapitel") zeigen nicht mehr den gerundeten Wert des
  Szenarios „Basis", sondern die **Spanne zwischen dem vorsichtigen und dem
  ambitionierten Eckwert** — z. B. Marktfolge: `50–60 %` statt `ca. 55 %`
  (Betriebskosten/CIR), `70–95 %` (STP-Quote Konsumkredit), `−20 bis −60 %`
  (Stückkosten je Vorgang), `1–3 Tage` (Durchlaufzeit). Index-, Euro- und
  Stück-KPIs erscheinen weiterhin als relative Veränderung, jetzt ebenfalls
  als Spanne.
- **Kein Szenario-Etikett mehr.** Die Kennzeichnung „Szenario Basis" entfällt
  vollständig (Text und Styling) — die Spanne ist die Aussage.
- **Modell dahinter entfernt.** Der Button **„KPI-Modell"** (Excel-Download)
  in der Kopfzeile der Übersicht ist raus, die Datei
  `Banking_Horizon_2030_KPI-Modell.xlsx` wird nicht mehr ausgeliefert. Die
  Zielkorridore stehen ausschließlich in `src/data/kpis.ts`; es gibt nichts
  mehr zum Nachrechnen. (Der Excel-Export aller **Kapitelinhalte** bleibt
  unverändert bestehen.)
- **Keine Quellenverweise.** Die Fußnote „… Illustrative Eckwerte,
  quellenbasiert." ist ersetzt durch „Illustrative Zielkorridore bei Erfüllung
  der Hypothesen — gerundete Spannen als Diskussionsgrundlage, keine Ist-Werte
  und keine Prognose." (DE und EN). Damit verweist das Tool an keiner Stelle
  mehr auf Studien oder Benchmarks Dritter.
- **Rundung.** Eckwerte werden ab 20 auf Fünferschritte gerundet, darunter auf
  ganze Zahlen; ein Eckwert, der dabei auf dem heutigen Wert landen würde, wird
  fein gerundet, damit ein Korridor nie optisch beim Status quo beginnt.
- **Auch die Kennzahlen selbst sind generisch.** Nicht nur die Werte, auch die
  KPI-Bezeichnungen liegen jetzt auf Vorstandsniveau: keine Kennzahlen mehr auf
  Produkt-, System- oder Verfahrensebene, die ein Rechenmodell dahinter
  behaupten würden.

  | Kapitel | vorher | jetzt |
  | --- | --- | --- |
  | Kunde | NPS · Cost-Income-Ratio · Marge/Ertrag je Kunde · Churn/Abwanderung | **Kundenzufriedenheit** · Cost-Income-Ratio · **Ertrag je Kunde** · **Kundenabwanderung** |
  | Vertrieb | NPS · Betriebskosten Vertrieb · Ertrag je Berater · Abschluss-/Konversionsquote | **Kundenzufriedenheit** · **Betriebskosten** · Ertrag je Berater · **Abschlussquote** |
  | Marktfolge | Betriebskosten/CIR · STP-Quote Konsumkredit · Stückkosten je Vorgang · Durchlaufzeit (Time-to-Yes) | **Cost-Income-Ratio** · **Dunkelverarbeitungsquote** · **Stückkosten** · **Durchlaufzeit** |
  | Organisation | Produktivität je MA durch KI · Betriebskosten (Personal) · Interne Besetzungs-/Reskilling-Quote · Fluktuation | **Produktivität** · **Betriebskosten** · **Interne Besetzungsquote** · Fluktuation |
  | IT | Entwicklungsproduktivität · Time-to-Market Features · Betriebskosten/CIR (IT) · Anteil KI-generierter/-geprüfter Code | **Produktivität** · **Time-to-Market** · **Cost-Income-Ratio** · **Automatisierungsgrad** |
  | Compliance | Cost of Compliance (% Betriebskosten) · False-Positive-Rate AML · Anteil kontinuierlich überwachter Kontrollen · Prüfungsdurchlaufzeit | **Compliance-Kosten** · **Fehlalarmquote** · **Automatisierte Kontrollen** · **Durchlaufzeit** |
  | Produkt/Projekt | Time-to-Market neue Produkte · Marge/Ertrag · Personalisierungsgrad · Ertragsanteil Produkte <24 Monate | **Time-to-Market** · **Ertrag** · Personalisierungsgrad · **Ertragsanteil neuer Produkte** |
  | Vorstand | Reporting-Latenz · Anteil Echtzeit-KPIs · Entscheidungsgeschwindigkeit · Betriebskosten (Reporting/Controlling) | Reporting-Latenz · **Echtzeit-Kennzahlen** · **Entscheidungsdauer** · **Betriebskosten** |

- **Zwei Kennzahlen sind dabei inhaltlich mitgezogen**, damit Label und Zahl
  zusammenpassen:
  - **Dunkelverarbeitungsquote** (Marktfolge) gilt jetzt für die Marktfolge
    insgesamt statt nur für den Konsumkredit. Der Korridor umspannt deshalb
    beide früheren Produktstrecken (Konsumkredit und Baufinanzierung):
    `65–90 %` statt `70–95 %`. Die separate, nie angezeigte Kennzahl
    „STP-Quote Baufinanzierung" ist darin aufgegangen.
  - **Compliance-Kosten** werden als relative Kostenveränderung geführt
    (`−10 bis −40 %`) statt als Anteil an den Betriebskosten (`ca. 7,5 %`) —
    der Anteilsnenner wäre wieder ein Stück Modell. Die alte Sicht bleibt als
    nicht angezeigte Reserve erhalten.
- **„Entscheidungsdauer" statt „Entscheidungsgeschwindigkeit"** (Vorstand): Der
  Wert fällt, der Pfeil zeigt nach unten — an „Geschwindigkeit" hätte das genau
  das Gegenteil ausgesagt.
- **Zugewinn-KPIs als Differenz.** Kennzahlen, deren Absolutwert ohne
  Bezugspunkt nichts sagt, zeigen jetzt den Zuwachs gegenüber heute:
  Kundenzufriedenheit `+3 bis +20 Pkt.` (statt `8–25`), Produktivität
  `+15 bis +50 %`.
- **Englische Einheiten.** Die Einheiten-Kürzel waren in der EN-Fassung deutsch
  (`1–3 Tage`, `4–10 Mon.`) und sind jetzt übersetzt (`1–3 days`, `4–10 mths`,
  `+3 to +20 pts`).

---

## 8. „Screenshot speichern" je Kapitel — das Stockwerk als quadratisches Bild

Im Kopf jedes Kapitels steht rechts neben „Bearbeiten" der Button **„Screenshot
speichern"**, ebenso oben rechts auf der **Einstiegsbühne** neben
„Überspringen". Ein Klick lädt das Stockwerk des Kapitels als **quadratisches
PNG (1:1)** herunter — reines Bild, ohne Rahmen, Beschriftung und
Bedienelemente.

- **Ausgeschnitten wird aus dem Master-Strukturbild** (6144×4096), kein
  Browser-Screenshot. Die Kantenlänge ist die **volle Höhe des Stockwerks**
  (Decke bis Boden), ausgegeben in Original-Pixeln — rund 700–820 px. Es wird
  bewusst nicht hochgerechnet, das würde nur Schärfe vortäuschen.
- **Ein Stockwerk ist rund 3:1 breit.** Quadratisch heißt deshalb zwangsläufig:
  volle Etagenhöhe und ein Ausschnitt des Raums, nicht die ganze Etagenbreite.
- **Bildausschnitt je Kapitel gesetzt** (`FRAMING` in `data/stockwerkDownload.ts`).
  Die geometrische Raummitte trifft in mehreren Etagen genau zwischen die
  Szenen — bei der Organisationsentwicklung z. B. Bücherregal und Pflanze statt
  der Menschen am Tisch. Stattdessen sitzt der Ausschnitt jetzt auf der
  tragenden Szene: Schalter mit Beratung (01), Beratungsgespräch am runden Tisch
  (02), Arbeitsplatzgruppe (03), Gespräch vor dem Regal (04), Laptop vor den
  Serverschränken (05), Weltkarten-Screen mit Risikocontrollern (06), Whiteboard
  mit Klebezetteln (07). Ohne Eintrag steht das Quadrat mittig über der Zone.
- **Schnittkorrektur nach unten:** Die Zoom-Zonen sind für den Kameraflug
  kalibriert und greifen oben ein Stück in die Etage darüber (angeschnittene
  Beine und Stühle). Für den Export rutscht der Ausschnitt 1,6 Prozentpunkte
  nach unten. Die Zonen selbst bleiben unverändert, der Kameraflug ändert sich
  nicht.
- **Dateiname:** `Stockwerk-03-Marktfolge.png` (englisch `Floor-03-…`), Titel in
  der aktiven Sprache.
- Beim schmalen, hohen Aufzug-Kapitel gibt die Breite das Maß vor, sonst stünde
  links und rechts die halbe Nachbaretage im Bild.
- **Zwei Etagen brauchen zusätzlich Höhe und Ausschnittgröße** (`y` und `zoom`
  in `FRAMING`):
  - **Vorstand (08):** Der Boardroom ist die höchste Etage und sein Deckenraum
    entsprechend leer — über die volle Etagenhöhe säße der Tisch am unteren Rand
    und die Stühle wären angeschnitten. Jetzt enger (90 % der Etagenhöhe) und
    tiefer gefasst: Tisch, Dreierrunde und Dashboard vollständig im Bild.
  - **Transformation (09):** Auf Höhe der Etagenmitte war die Kabine oben
    angeschnitten (Kabine liegt bei 33,5–52 % der Bildhöhe, der Ausschnitt
    begann erst bei 40 % — der Kopf fehlte). Der Ausschnitt sitzt jetzt auf der
    Kabine selbst, die Person steht vollständig darin.
