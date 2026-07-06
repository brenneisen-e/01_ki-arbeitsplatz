# Desk-Research-Prompts — KPI-Zahlen je Kapitel („Banking Horizon 2030")

Prompts für den Claude-Chat (claude.ai, mit Websuche), um pro Kapitel **Quellen
und KPI-Annahmen** zu recherchieren. Aus den Ergebnissen entsteht eine
**Excel-Annahmen-Tabelle**, aus der pro Kapitel ein kleiner **Business Case**
für die KPIs berechnet wird (Rahmen-KPIs der Management Summary:
Kundenzufriedenheit, Betriebskosten, Marge).

**Anwendung:** Pro Kapitel einen neuen Chat öffnen und **Basis-Prompt +
Kapitel-Block** zusammen einfügen. Tabelle B ist so formatiert, dass sie
1:1 nach Excel kopiert werden kann (eine Zeile = eine Annahme).

---

## Basis-Prompt (immer voranstellen)

```
Du bist Research-Analyst in einer Strategieberatung. Ich bereite einen
Vorstands-Workshop „Banking Horizon 2030" für eine mittelgroße deutsche
Universalbank vor. Illustrative Eckwerte der Bank (als Rechenbasis für
Business Cases): ca. 250.000 Privat- und Firmenkund:innen, ca. 2.500
Mitarbeitende, davon ca. 400 Berater:innen, Bilanzsumme ca. 15 Mrd. Euro,
Cost-Income-Ratio ca. 65 %.

Für das unten beschriebene Kapitel brauche ich belastbares Zahlenmaterial
aus Desk Research, um daraus KPI-Annahmen für einen Business Case abzuleiten.

AUFTRAG
1. Recherchiere aktuelle Studien, Benchmarks und Praxisbeispiele (bevorzugt
   2023–2026) zu den unten stehenden Hypothesen. Bevorzugte Quellen:
   Deloitte, McKinsey, BCG, Bain, Accenture, Oliver Wyman, zeb, Celent,
   Forrester, Gartner, EZB / Deutsche Bundesbank / BaFin, EBA, BIS, Statista
   sowie Fachpresse (Handelsblatt, Finanz-Szene, The Banker). Pro Hypothese
   3–5 quantitative Befunde.
2. Leite daraus KPI-Annahmen ab — immer für die drei Rahmen-KPIs des
   Workshops: (a) Kundenzufriedenheit (NPS bzw. CSAT), (b) Betriebskosten
   (bzw. Cost-Income-Ratio), (c) Marge / Ertrag — plus die kapitelspezifischen
   KPIs unten. Je KPI drei Szenarien: konservativ / Basis / ambitioniert,
   jeweils mit kurzer Herleitung und explizit genannten Annahmen.
3. Gib nur belegbare Zahlen mit präziser Quellenangabe (Institution,
   Studientitel, Jahr, Link). Wenn eine Zahl nicht belegbar ist, kennzeichne
   sie ausdrücklich als eigene Annahme. Erfinde keine Studien und keine
   Zahlen. Übertrage internationale Benchmarks nur mit kurzem Hinweis auf
   die Übertragbarkeit auf den deutschen Markt.

OUTPUT (exakt in diesem Format, damit ich es nach Excel kopieren kann)

Tabelle A — Quellen:
| Nr | Quelle (Institution, Titel, Jahr) | Kernaussage | Zahl/Wert | Link |

Tabelle B — KPI-Annahmen:
| KPI | Einheit | Basiswert heute (Annahme) | Effekt 2030 konservativ | Effekt 2030 Basis | Effekt 2030 ambitioniert | Quellen (Nr aus A) | Herleitung / Annahmen |

Danach: 5 Bullet-Points „Was der Vorstand daraus mitnehmen sollte" —
nüchtern, präzise, ohne Superlative.

KAPITEL
[Kapitel-Block hier einfügen]
```

---

## Kapitel-Block 01 — Kundenperspektive

```
Kapitel 01 — Kundenperspektive: Banking wird unsichtbar.

Hypothesen:
1. Banking verschwindet als eigener Moment: Kund:innen „machen" 2030 kein
   Banking mehr aktiv über App oder Filiale — persönliche KI-Finanzassistenten
   begleiten kontinuierlich im Alltag und geben proaktiv Impulse.
2. Optionen verschwinden, Entscheidungen werden vorbereitet: Statt
   Produktoptionen liefert KI klare, simulierte und begründete Empfehlungen
   („AI-prepared decision") — die Kund:in entscheidet auf vorbereiteter Basis.
3. Von Reaktion zu proaktiver, teilautonomer Finanzsteuerung: Autonome
   KI-Agenten erkennen Ereignisse früh und handeln innerhalb vereinbarter
   Leitplanken mit Freigabelogik („trusted autonomy").

Kapitelspezifische KPIs (zusätzlich zu NPS, Betriebskosten, Marge):
- Cross-Selling-Quote (Produkte je Kund:in)
- Abwanderungsquote / Churn
- Servicekosten je Kundenkontakt
- Nutzungsquote digitaler Assistenten / Self-Service-Quote
- Anteil proaktiv (durch die Bank/KI) initiierter Kundenkontakte

Gesucht sind insbesondere: Studien zu KI-Assistenten im Retail Banking
(Adoption, Zahlungsbereitschaft, Vertrauen in autonome Finanz-Agenten),
Effekte von Hyperpersonalisierung auf Cross-Selling und Churn, Kosten je
Servicekontakt nach Kanal (Filiale vs. Telefon vs. Chat vs. KI-Agent).
```

## Kapitel-Block 02 — Markt & Vertrieb

```
Kapitel 02 — Markt & Vertrieb: vom Produktvertrieb zum Lösungsorchestrator.

Hypothesen:
1. Vom Produktvertrieb zum Lösungsorchestrator: Die Bank verkauft keine
   Einzelprodukte mehr, sondern orchestriert Finanz-, Service- und
   Ökosystemleistungen in Echtzeit entlang der Kundenziele.
2. Vom Kundenberater zu KI-augmentierten Strategieberatern: Standardvorgänge
   laufen autonom; Berater:innen konzentrieren sich mit KI-Unterstützung
   (Vertriebscockpit, Gesprächsvorbereitung, Next-Best-Action) auf komplexe
   Entscheidungen.
3. Kundenschnittstelle wird permanent und hyperpersonalisiert: Die Beziehung
   läuft kanalübergreifend und kontinuierlich statt in einzelnen Termin- und
   Kampagnenmomenten.

Kapitelspezifische KPIs (zusätzlich zu NPS, Betriebskosten, Marge):
- Beraterproduktivität (Ertrag je Berater:in, betreute Kund:innen je Berater:in)
- Ertrag je Kund:in
- Abschluss-/Konversionsquote in der Beratung
- Vor- und Nachbereitungszeit je Beratungsgespräch
- Anteil autonom (ohne Berater:in) abgeschlossener Standardvorgänge

Gesucht sind insbesondere: Studien zu KI-Copiloten im Bankvertrieb
(Produktivitätseffekte, Zeitersparnis), Next-Best-Action / Hyper-
personalisierung (Konversions- und Ertragseffekte), Benchmarks zu Ertrag
je Berater in deutschen Retail-/Regionalbanken.
```

## Kapitel-Block 03 — Marktfolge (Operations)

```
Kapitel 03 — Marktfolge: autonome Dunkelverarbeitung und Serviceplattform.

Hypothesen:
1. Marktfolge wird zur autonomen Dunkelverarbeitung: Standardprozesse laufen
   End-to-End ohne manuellen Eingriff (Straight-Through-Processing);
   Mitarbeitende steuern Ausnahmen statt Vorgänge.
2. Interne Wertschöpfungskette bricht auf: Die Bank wird Orchestrator und
   bezieht Prozessmodule von externen Utility-Plattformen (Ökosystem statt
   Fertigungstiefe).
3. Marktfolge wird zur skalierbaren Serviceplattform: Standardisierte
   Servicemodule werden auch Dritten angeboten (Banking-as-a-Service statt
   interner Kostenstelle).
4. Regulatorik & Compliance wandern in den Lifecycle: Kontrollen sind
   „compliant by design" in die automatisierten Prozesse eingebettet statt
   nachgelagert geprüft.

Kapitelspezifische KPIs (zusätzlich zu NPS, Betriebskosten, Marge):
- STP-/Dunkelverarbeitungsquote (je Prozess, z. B. Konsumkredit, Baufinanzierung, KYC)
- Stückkosten je Vorgang
- Durchlaufzeit (z. B. Time-to-Yes / Time-to-Cash im Kredit)
- Fehler-/Nacharbeitsquote
- Anteil an externe Plattformen ausgelagerter Prozessvolumina

Gesucht sind insbesondere: Automatisierungsgrade und STP-Quoten in deutschen
Banken heute vs. Best Practice, Kostensenkungspotenziale durch KI/Agentic
Automation im Backoffice, Benchmarks zu Kreditdurchlaufzeiten, Studien zu
Banking-as-a-Service-/Utility-Modellen (Marktvolumen, Kosteneffekte).
```

## Kapitel-Block 04 — Organisationsentwicklung (HR & Corporate Services)

```
Kapitel 04 — Organisationsentwicklung: Skills statt Strukturen.

Hypothesen:
1. Vom Training zum kontinuierlichen Skill-Aufbau: Lernen ist in den
   Arbeitsalltag integriert und KI-personalisiert statt punktueller Seminare.
2. Organisation wird durch Skills gesteuert, nicht durch Strukturen:
   Staffing und Organisation folgen dynamisch den Fähigkeiten
   (skills-based organization) statt statischen Organigrammen.
3. Workforce-Steuerung wird zum Wettbewerbsvorteil: Datenbasierte,
   prädiktive Personalplanung (Skill-Gaps, Kapazitäten, Fluktuation).
4. Lernen wird immersiv und KI-personalisiert: Individuelle Lernpfade aus
   dem persönlichen Skill-Gap, u. a. mit immersiven Formaten.
5. Demografischer Wandel erzwingt lebenslanges Reskilling: Auch erfahrene,
   ältere Mitarbeitende lernen grundlegend neue Fähigkeiten; Reskilling
   ist Daueraufgabe statt Einmalprogramm.

Kapitelspezifische KPIs (zusätzlich zu NPS, Betriebskosten, Marge):
- Time-to-Competence (Einarbeitung/Umschulung bis Produktivität)
- Weiterbildungskosten und -stunden je FTE (und deren Wirksamkeit)
- Interne Besetzungsquote / Reskilling-Quote
- Fluktuation und Frühfluktuation
- Produktivitätseffekt durch KI-Unterstützung je Mitarbeitendem

Gesucht sind insbesondere: Studien zu skills-based organizations
(Produktivitäts-/Agilitätseffekte), KI-personalisiertem Lernen
(Lernzeit, Transfererfolg), demografischer Lücke im deutschen
Bankensektor (Renteneintritte, Fachkräftemangel), Kosten unbesetzter
Stellen, Benchmarks Weiterbildungsbudgets Banken.
```

## Kapitel-Block 05 — Technologie / IT

```
Kapitel 05 — Technologie / IT: selbstoptimierende AI-Delivery.

Hypothesen:
1. Selbstoptimierende AI-Delivery ersetzt Softwareentwicklung as-is:
   Software wird 2030 weitgehend KI-gestützt entwickelt, getestet und
   deployt; Engineers steuern und überwachen.
2. Entscheidungen verlagern sich zur AI, IT wird zur orchestrierten
   Plattform: KI entscheidet autonom innerhalb gesetzter Guardrails;
   die IT-Landschaft wird modular und API-basiert.
3. Fachbereiche steuern direkt, IT verliert die Gatekeeper-Rolle:
   Business und IT verschmelzen zu integrierten Delivery-Teams; der
   Wettbewerbsvorteil ist die Geschwindigkeit von Anforderung zu Lösung.

Kapitelspezifische KPIs (zusätzlich zu NPS, Betriebskosten, Marge):
- Entwicklungsproduktivität (z. B. Produktivitätsgewinn durch AI-Coding-Tools in %)
- Lead Time / Deployment-Frequenz (DORA-Metriken)
- Time-to-Market für neue Features/Produkte
- Run-vs.-Change-Anteil der IT-Kosten
- Anteil KI-generierten/-geprüften Codes

Gesucht sind insbesondere: Studien zu Produktivitätseffekten von
AI-Coding-Assistenten (kontrollierte Experimente, Felddaten), DORA-/
State-of-DevOps-Benchmarks, IT-Kostenstrukturen von Banken (Run vs.
Change, Legacy-Anteil), Modernisierungseffekte auf Time-to-Market.
```

## Kapitel-Block 06 — Compliance & Risk

```
Kapitel 06 — Compliance & Risk: von ex-post zu Echtzeit.

Hypothesen:
1. Von ex-post-Kontrolle zu kontinuierlicher Echtzeitsteuerung: Kontrollen
   und Risikoüberwachung laufen live im Prozess statt nachgelagert in
   Stichproben.
2. Three-Lines-of-Defense-Modell verändert sich grundlegend: Integriertes,
   KI-überwachtes Governance-Cockpit statt drei getrennter Silos;
   neue Rollen (z. B. CAIO).
3. Cyber- und Operational Risk verschmelzen mit dem Betriebsmodell:
   Resilienz ist in den Betrieb eingebaut statt separater Perimeter-Schutz.
4. Compliance & Innenrevision stellen sich neu auf: Prüfung wird
   kontinuierlich, KI-gestützt und erklärbar (Explainability statt
   Stichprobe im Nachhinein).

Kapitelspezifische KPIs (zusätzlich zu NPS, Betriebskosten, Marge):
- Cost of Compliance (absolut und als Anteil der Betriebskosten)
- False-Positive-Rate in AML-/Fraud-Screening und Bearbeitungszeit je Alert
- Anteil kontinuierlich (statt stichprobenhaft) überwachter Kontrollen
- Aufwand je Prüfung / Prüfungsdurchlaufzeit
- Verluste aus operationellen Risiken und Betrugsschäden

Gesucht sind insbesondere: Studien zu Compliance-Kosten europäischer/
deutscher Banken (z. B. Anteil an Gesamtkosten, FTE), Effekte von KI in
AML/Fraud (False-Positive-Reduktion, Detection-Uplift), RegTech-Benchmarks,
Aufsichtsanforderungen an AI-Governance (EU AI Act, DORA, MaRisk) und
deren Kostenwirkung.
```

## Kapitel-Block 07 — Produkte & Innovation

```
Kapitel 07 — Produkte & Innovation: Segment of One.

Hypothesen:
1. Vom Produktkatalog zum Segment of One: Statt standardisiertem Katalog
   werden Lösungen aus modularen Bausteinen individuell je Kund:in
   komponiert.
2. Produkte werden zu lebenden, adaptiven Services: Produktparameter passen
   sich innerhalb definierter Leitplanken laufend an die Lebenssituation an
   (statt statischem Vertragsabschluss).
3. Produktentwicklung wird kontinuierlich — von Jahren zu Tagen: KI
   simuliert Produktvarianten parallel; Entwicklung, Test und Launch
   verkürzen sich radikal.

Kapitelspezifische KPIs (zusätzlich zu NPS, Betriebskosten, Marge):
- Time-to-Market neuer Produkte (von Idee bis Launch)
- Konversionsrate personalisierter vs. standardisierter Angebote
- Anteil des Ertrags aus Produkten, die jünger als 24 Monate sind
- Personalisierungsgrad (Anteil individuell komponierter Abschlüsse)
- Entwicklungskosten je Produktlaunch

Gesucht sind insbesondere: Studien zu Hyperpersonalisierung im Banking
(Konversions-/Ertragseffekte, „segment of one"), Time-to-Market-Benchmarks
für Bankprodukte, Effekte generativer KI auf Produktentwicklung und
-simulation, Fallbeispiele adaptiver/dynamischer Finanzprodukte.
```

## Kapitel-Block 08 — Vorstand & Governance

```
Kapitel 08 — Vorstand & Governance: Steuern in Echtzeit.

Hypothesen:
1. Vom Quartalsbericht zur Echtzeit-Steuerung: Der Vorstand steuert an einem
   Live-Governance-Cockpit (Kapital, Risiko, Liquidität, Szenarien) statt
   über rückwärtsgewandte Quartalsberichte.
2. AI-Governance wird Chefsache: Der Vorstand verantwortet KI-Leitplanken,
   Risk Appetite und Erklärbarkeit zentral (inkl. neuer Rollen wie CAIO)
   statt sie in Fachbereiche zu delegieren.
3. Von der Jahresstrategie zur kontinuierlichen Steuerung: Kapital- und
   Ressourcenallokation erfolgt dynamisch und KI-gestützt statt im starren
   Jahreszyklus.

Kapitelspezifische KPIs (zusätzlich zu NPS, Betriebskosten, Marge):
- Reporting-Latenz (Tage von Periodenende bis Steuerungsinformation)
- Anteil in Echtzeit verfügbarer Steuerungs-KPIs
- Aufwand im Reporting/Controlling (FTE, Kosten)
- Forecast-Genauigkeit
- Entscheidungsgeschwindigkeit (Zeit von Analyse bis Beschluss)

Gesucht sind insbesondere: Studien zu Real-Time-/Continuous-Steering und
CFO-/CEO-Cockpits in Banken, Kosten und FTE-Aufwand klassischer
Reporting-Strecken, Effekte KI-gestützter Planung und Forecasts
(Genauigkeit, Aufwand), Erwartungen der Aufsicht an Board-Level
AI-Governance (EU AI Act) und Umsetzungsstand in Banken.
```

## Kapitel-Block 09 — Transformation mit Deloitte

```
Kapitel 09 — Transformation: der Weg dorthin (Beratungsansatz).

Dieses Kapitel hat keine Zukunftshypothesen, sondern beschreibt den
Transformationspfad. Für den Business Case brauche ich Zahlen zur Frage:
Was kostet Transformation, was bringt sie, und woran scheitert sie?

Themen:
1. Erfolgs- und Misserfolgsquoten großer (KI-)Transformationen in Banken.
2. Value Realization: Wie viel des geplanten Nutzens wird typischerweise
   realisiert, und welche Faktoren treiben die Quote nach oben (Governance,
   Change, Decision-first-Ansätze, Co-Creation)?
3. Zeit bis zum ersten messbaren Nutzen (Time-to-Value) moderner, iterativer
   Transformationsansätze vs. klassischer Großprogramme.
4. Typische Investitionsvolumina von KI-/Digitaltransformationen
   mittelgroßer Banken (als Kostenseite der Business Cases der Kapitel 1–8).

Kapitelspezifische KPIs:
- Transformations-ROI und Amortisationsdauer
- Value-Realization-Quote (% des Business Case, der realisiert wird)
- Time-to-Value (Monate bis erster messbarer Nutzen)
- Change-Adoption-Quote (Nutzung neuer Tools/Prozesse nach Rollout)
- Anteil Transformationsbudget für Change & Enablement

Gesucht sind insbesondere: Studien zu Erfolgsquoten von Transformationen
(u. a. die häufig zitierten ~70 %-Scheiterquoten kritisch einordnen),
Benchmarks zu KI-Investitionen im Banking und deren ROI, Evidenz zu
Erfolgsfaktoren (Sponsorship, Change-Budget, iterative Methodik).
```

---

## Weiterverarbeitung (Excel-Logik)

Aus jedem Chat-Ergebnis werden übernommen:

1. **Tabelle A (Quellen)** → Blatt `Quellen` (fortlaufende Nummerierung
   je Kapitel, z. B. `K01-1`, `K01-2`, …).
2. **Tabelle B (KPI-Annahmen)** → Blatt `Annahmen`: eine Zeile je KPI und
   Kapitel, Spalten wie in Tabelle B plus Kapitel-Nr.
3. Business-Case-Blätter je Kapitel rechnen aus den Annahmen (Basiswert ×
   Effekt-Szenario × Eckwerte der Bank: 250.000 Kund:innen, 2.500 MA,
   400 Berater:innen, CIR 65 %) die drei Rahmen-KPIs der Management Summary:
   **Kundenzufriedenheit (+ x %) · Betriebskosten (− x %) · Marge (+ x pp)**.
   Diese Werte ersetzen dann die Platzhalter in `ChapterReader.tsx`
   (`KPIS`-Konstante) — künftig pro Kapitel statt global.
