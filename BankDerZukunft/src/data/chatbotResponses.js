// Demo-Antworten des Workshop-Chatbots. Jede Antwort ist Markdown-light:
// '##' Headings, '|...|' Tabellen, '[chart: a=1 b=2]' inline Bar-Charts,
// Listen mit '- ' und 'Quellen:'-Block. Wird von formatChatHtml.js gerendert.

export const QUICK_PROMPTS = [
  { key: 'bank-der-zukunft', label: 'Was ist die Bank der Zukunft?' },
  { key: 'kunde',            label: 'Was erwarten Kunden 2035?' },
  { key: 'betriebsmodell',   label: 'Wie sieht das Betriebsmodell aus?' },
  { key: 'transformation',   label: 'Wie kommt eine Bank dort hin?' },
  { key: 'angebote',         label: 'Welche Angebote bietet Deloitte?' },
]

// Mapping User-Eingabe → Antwort-Key. Erst exakter Quick-Prompt-Treffer,
// dann Keyword-Matching, sonst Default.
export function matchPromptKey(text) {
  const t = (text || '').toLowerCase()
  if (/(bank.{0,4}zukunft|zielbild|öko|ecosystem|ökosystem|geschäftsmodell)/.test(t)) return 'bank-der-zukunft'
  if (/(kunde|retail|corporate|capital|markets|avatar)/.test(t))                       return 'kunde'
  if (/(betrieb|operations|automa|vertriebsarbeitsplatz|arbeitsplatz|prozess)/.test(t)) return 'betriebsmodell'
  if (/(transform|pfad|wellen|roadmap|migration)/.test(t))                              return 'transformation'
  if (/(angebot|deloitte|paket|offering|leistung)/.test(t))                             return 'angebote'
  return 'default'
}

export const DEMO_RESPONSES = {
  'bank-der-zukunft': {
    badge: 'Bank der Zukunft',
    text: `## Bank der Zukunft 2035

Vom produktzentrierten Bankhaus zum **Ökosystem-Anbieter** mit KI als Mitarbeitendem. Drei Treiber:

- **Ökosystem-Geschäftsmodell:** Embedded Finance, BaaS, Plattform-Integrationen
- **KI-First-Prinzip:** agentische KI in jedem Prozess (nicht Tool, sondern Kollege)
- **Neue Erlösmodelle:** Subscription, API-Monetarisierung, Daten-Monetarisierung (DSGVO-konform)

Erlös-Verschiebung Heute → 2035 (in % der Erträge):
[chart: Zins=68 Provision=28 Plattform=4]
[chart: Zins=44 Provision=24 Plattform=22 Subscription=10]

Kennzahlen-Sprung im Zielbild:

| Dimension | Heute | 2035 |
| --- | --- | --- |
| KI-Durchdringung | Pilotinseln | **End-to-End** |
| Time-to-Decision (Kredit) | 7 Tage | **< 5 Min** |
| Plattform-Erlöse | < 5 % | **20-30 %** |
| C-Level Verantwortung | CIO | **CAIDO + Board** |

Quellen:
- Workshop-Deck "Banking im KI-Zeitalter" (24.04.2026), Folie 5–6
- Modul "Bank der Zukunft" — Verantwortlich: Holger`,
  },

  kunde: {
    badge: 'Kundenperspektive',
    text: `## Was Kunden 2035 erwarten

Hyper-personalisierte Interaktion über alle Segmente — getrieben durch KI-Avatare, Echtzeit-Insights und Embedded-Convenience.

Erwartungs-Treiber je Segment:

| Segment | Wichtigster Treiber 2035 | Hebel |
| --- | --- | --- |
| Retail | 24/7-Erlebnis | KI-Avatare + Embedded Finance |
| Corporate | Proaktive Insights | API-Integration in ERP/Treasury |
| Capital Markets | Zugang zu neuen Asset-Klassen | Tokenisierte Realwerte |

Kanäle 2035 (Anteil der Erstkontakte):
[chart: KI-Avatar=42 Mensch=28 App=18 Filiale=12]

Was der Mensch leistet — und was nicht:

- Mensch macht: komplexe Lebensentscheidungen, Vertrauensaufbau, Eskalation
- KI macht: Routinefragen, Recherche, Vertragsdraft, Cashflow-Prognose
- Beide gemeinsam: hyper-personalisierte Beratung mit Erklärungs-Pflicht

Quellen:
- Modul "Kundenperspektive" — Verantwortlich: Andreas R. / Andreas P. (Cap. Markets)
- Workshop-Deck Folie 5: "Hyper-personalisierte Interaktion: KI-Avatare und Bots bieten ein 24/7-Kundenerlebnis"`,
  },

  betriebsmodell: {
    badge: 'Betriebsmodell der Zukunft',
    text: `## Betriebsmodell 2035 — The art of the possible

Dunkelverarbeitung End-to-End, Composable Architecture, KI-Vertriebsarbeitsplatz als Co-Pilot.

Vier Säulen im Zielbild:

- **KI-Vertriebsarbeitsplatz:** 360°-Kundensicht, Next-Best-Action, Voice-First
- **Operations:** Hyperautomation (RPA + KI + Process Mining), Realtime Banking
- **IT-Architektur:** Composable Banking + BaaS, Strangler-Fig-Migration der Legacy-Systeme
- **Corporate Services:** HR Upskilling, CFO als Predictive-Forecasting-Partner, GRC mit Tech-Tools

Effizienzhebel im Realtime-Operations-Modell:
[chart: STP=82 Manual=12 Exception=6]

Wo die Sprünge passieren:

| Funktion | Heute (2026) | Morgen (2035) |
| --- | --- | --- |
| Kreditentscheidung | 7 Tage manuell | **< 5 Min STP** |
| Antrags-Backoffice | 60 % manuell | **90 % Dunkelverarbeitung** |
| HR-Profile | klassisch | **AI-Translator-Rollen** |
| GRC | reaktiv | **proaktiv, KI-gestützt** |

Quellen:
- Modul "Betriebsmodell der Zukunft" — Verantwortlich: Georg / Thorsten / Lars (Demo & Deep Dive)
- Workshop-Deck Folie 5–6: Dunkelverarbeitung, Composable Banking, Strangler-Fig`,
  },

  transformation: {
    badge: 'Transformationspfad',
    text: `## Wie kommt eine Bank dorthin?

Drei bis fünf Wellen mit klaren MVPs. Capital Markets und Retail laufen mit unterschiedlichen Geschwindigkeiten — auf demselben Zielbild.

Wellen-Roadmap (Investitions-Anteil je Welle):
[chart: Foundation=35 Scale=40 Reinvent=25]

Pflichtbausteine pro Welle:

| Welle | Fokus | Pflicht-MVPs |
| --- | --- | --- |
| 1 — Foundation | Daten, Plattform, Skills | Data-Mesh, LLM-Gateway, AI-Governance v1 |
| 2 — Scale & Embed | KI in Kernprozesse | Vertriebsarbeitsplatz, Hyperautomation, KI-Avatare |
| 3 — Reinvent | Neue Geschäftsmodelle | BaaS, Tokenized-Assets-Marktplatz, Embedded Finance |

Was Capital Markets vs. Retail unterscheidet:

- **Retail:** schnelle Customer-facing-Wellen, Lifelong-Customer-Modell, Embedded Finance zuerst
- **Capital Markets:** KI-Trading + Tokenisierung first, Compliance als Treiber, höheres Tempo bei Modellbetrieb

Quellen:
- Modul "Transitions-/Transformationspfad" — Verantwortlich: Andreas Reuß / Andreas Pfeil
- Workshop-Deck Folie 7: Heutige Leistungsangebote als Inspiration`,
  },

  angebote: {
    badge: 'Angebotsbausteine',
    text: `## Sieben modulare Pakete

Eigenständige Bausteine oder als Programm-Bundle — passgenau zum Transformationspfad des Kunden.

| Paket | Kern-Outcome |
| --- | --- |
| Strategie · AI-Ready & Ecosystem Banking 2035 | Zielbild + adaptives Operating Model |
| Implementation · Intelligenter Vertrieb & Service | KI-Vertriebsarbeitsplatz, Avatare, Conversational AI |
| Operations · Road to Hyperautomation | Process Mining + RPA + KI mit Business Case |
| Infrastruktur · Composable Architecture | Composable Blueprint + Strangler-Fig-Migration |
| Change · Future Workforce & Culture | Upskilling, AI-Translator-Curriculum |
| GRC · AI Governance, Risk & Compliance | EU-AI-Act-Compliance + Risk-Framework |
| Capital Markets · Next-Gen Asset Management | KI-Trading + Tokenisierung |

Typische Programm-Bundle-Pfade:
[chart: Quick-Start=25 Full-Programm=55 Scale-Up=20]

Was wir nicht anbieten:

- "KI-Strategy-Slidewares" ohne Umsetzung
- Reine Tool-Selektion ohne Operating-Model-Bezug
- Big-Bang-Migrationen

Quellen:
- Modul "Offering & Angebotsbausteine" — Verantwortlich: Holger
- Workshop-Deck Folie 7`,
  },

  default: {
    badge: 'Workshop-Format',
    text: `## Banking im KI-Zeitalter — Kickoff & Operationalisierung

Der Workshop hat **fünf Module**, ich kann zu jedem Hintergründe geben:

- **Kundenperspektive** — Was Kunden 2035 erwarten
- **Bank der Zukunft** — Geschäftsmodelle 2035
- **Betriebsmodell der Zukunft** — Vertrieb, Operations, IT, GRC
- **Transformationspfad** — Wellen vom Heute zum Zielbild
- **Angebotsbausteine** — Was Deloitte konkret liefert

Probier eine der Schnellfragen unten — oder formuliere frei. Wenn du das **Bank-Haus** sehen willst (animierte Etagen-Ansicht), klick rechts oben auf "Haus-Ansicht".

Quellen:
- Workshop-Deck "Banking im KI-Zeitalter" vom 24.04.2026`,
  },
}
