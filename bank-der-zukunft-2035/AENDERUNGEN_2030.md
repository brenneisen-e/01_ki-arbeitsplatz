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

## 6. Neu: Szenario-Matrix als Intro („bevor das Haus öffnet")

- Vor dem Strukturbild erscheint jetzt eine **interaktive 2×2-Szenario-Matrix**
  im Stil des `/holodeck`-Vorspanns: Quadranten per Klick auf das Plus
  freischalten, danach per Hover wechseln; Detailpanel rechts, CTA „Weiter zum
  Strukturbild".
- **Achsen:** *Geopolitik & Regulierung* (fragmentiert ↔ offen) ×
  *KI-Reife & Kundenakzeptanz* (zögerlich ↔ Durchbruch).
- **Vier Szenarien bis 2030** (DE/EN): Souveräne KI-Inseln · Grenzenlose
  KI-Ökonomie · Festung Bank · Offen, aber vorsichtig.
- Deep-Links (z. B. `#/vertrieb`) überspringen die Matrix und landen direkt am
  Ziel. Inhalte sind als **Platzhalter für den Workshop** markiert — vor Einsatz
  schärfen.

## 7. Neu: Leitfragen als Overlay-Chatbot

- Die **statische Leitfrage-Sprechblase** ist durch einen **Overlay-Chatbot**
  (unten rechts, Stil des „KI-Vertriebsassistenten" aus dem
  Vertriebsarbeitsplatz) ergänzt: Buttons „Diskutieren" / „Mit KI-Assistent
  diskutieren" öffnen den Dialog, geseedet mit der Leitfrage des Kapitels.
- Moderations-Impulse mit Kapitel-Kontext (Pro & Contra · Implikationen ·
  Konkretisierung · Nächster Schritt) plus Freitext mit wechselnden Rückfragen.
- **Privacy-first:** kein externer KI-Call, keine Speicherung (regelbasierte
  Moderations-Impulse) — konsistent zur App-Vorgabe „keine externen Dienste".

## 8. In Arbeit / nächste Schritte

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
