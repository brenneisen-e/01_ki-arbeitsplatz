// ─────────────────────────────────────────────────────────────────────────────
// FAKTEN: der „Studien-Schritt" je Kapitel. Eine belastbare Zahl aus einer
// aktuellen Deloitte-Studie, gezeigt nach der Einstiegsbühne und vor den
// Hypothesen. Dramaturgie je Kapitel: Bühne (heute) → Fakt (Beleg) →
// Hypothesen (2030) → Aktivität („Was heißt das?").
//
// Kapitel mit Eintrag bekommen im Reader einen zusätzlichen ersten Schritt
// (siehe stepOffsetForChapter in chapters.ts); Deep-Links zählen die
// Hypothesen weiter ab 1, der Fakt ist `#/<kapitel>` bzw. `#/<kapitel>/0`.
//
// Quelle Kapitel 02: Deloitte Insights, „How much do bank customers trust
// gen AI?", Deloitte Center for Financial Services, 27. August 2026;
// Befragung von rund 2.600 Bankkunden in den USA. Alle Werte sind Anteile
// der Befragten in Prozent und wörtlich aus dem Artikel übernommen.
// ─────────────────────────────────────────────────────────────────────────────
import type { Lang } from '../i18n/LanguageContext'

export type Zweisprachig = Record<Lang, string>

export type FaktBalken = {
  label: Zweisprachig
  /** Anteil in Prozent (0..100). */
  wert: number
  /** Der Balken, um den es geht: Akzentfarbe statt Grau. */
  betont?: boolean
}

/** Einfarbiges Lucide-Icon je Bereich, Zuordnung in FaktSlide.tsx. */
export type FaktIcon = 'suche' | 'vertrauen' | 'kontrolle' | 'risiko'

export type FaktKennzahl = {
  /** Kurzes Schlagwort über der Zahl (Nutzung, Vertrauen, ...). */
  kicker: Zweisprachig
  icon: FaktIcon
  /** Die Zahl, groß gesetzt; die Einheit steht kleiner daneben. */
  wert: number
  einheit?: string
  /** Höchstens zwei Zeilen unter der Zahl. */
  label: Zweisprachig
  /** Die Zahl, um die es geht: Akzentlinie und Schlagwort in Akzentfarbe. */
  betont?: boolean
  /** Zeigt unter der Zahl die Hantel: betonter Balken gegen den höchsten (chart.balken). */
  zeigtVergleich?: boolean
}

export type Fakt = {
  kicker: Zweisprachig
  titel: Zweisprachig
  /** Datengrundlage als Kickerzeile: Wer, wie viele, wo, wann. */
  basis: Zweisprachig
  chart: {
    titel: Zweisprachig
    untertitel: Zweisprachig
    balken: FaktBalken[]
  }
  kennzahlen: FaktKennzahl[]
  folgerung: { kicker: Zweisprachig; text: Zweisprachig }
  quelle: Zweisprachig
  quelleUrl: string
  /** Sprechertext für die Vorführung (siehe docs/speakernotes-kapitel-02-markt-vertrieb.md). */
  sprechernotiz: Zweisprachig
}

export const FAKTEN: Record<string, Fakt> = {
  vertrieb: {
    kicker: { de: 'Deloitte-Studie · August 2026', en: 'Deloitte study · August 2026', fr: 'Étude Deloitte · août 2026' },
    titel: {
      de: 'Kunden nutzen KI schon für Bankfragen, vertrauen ihr aber nur zur Hälfte',
      en: 'Customers already use AI for banking questions, but only half of them trust it',
      fr: 'Les clients utilisent déjà l’IA pour leurs questions bancaires, mais seul un sur deux lui fait confiance',
    },
    basis: {
      de: 'Deloitte-Befragung · rund 2.600 Bankkunden · USA · August 2026',
      en: 'Deloitte survey · almost 2,600 banking customers · United States · August 2026',
      fr: 'Enquête Deloitte · environ 2 600 clients bancaires · États-Unis · août 2026',
    },
    chart: {
      titel: {
        de: 'Vertrauen je Quelle',
        en: 'Trust by source',
        fr: 'Confiance par source',
      },
      untertitel: {
        de: 'Anteil der Befragten, die der Quelle bei Bankfragen vertrauen',
        en: 'Share of respondents who trust the source for banking questions',
        fr: 'Part des répondants qui font confiance à la source pour leurs questions bancaires',
      },
      balken: [
        { label: { de: 'Eigene Bank', en: 'Own bank', fr: 'Sa banque' }, wert: 79 },
        { label: { de: 'Suchmaschine', en: 'Search engine', fr: 'Moteur de recherche' }, wert: 67 },
        { label: { de: 'Generative KI', en: 'Generative AI', fr: 'IA générative' }, wert: 49, betont: true },
        { label: { de: 'Soziale Medien', en: 'Social media', fr: 'Réseaux sociaux' }, wert: 28 },
      ],
    },
    kennzahlen: [
      {
        kicker: { de: 'Nutzung', en: 'Usage', fr: 'Usage' },
        icon: 'suche',
        wert: 58,
        einheit: '%',
        label: {
          de: 'der KI-Nutzer recherchieren Bankprodukte schon mit KI',
          en: 'of gen AI users already research banking products with AI',
          fr: 'des utilisateurs d’IA s’en servent déjà pour les produits bancaires',
        },
      },
      {
        kicker: { de: 'Vertrauen', en: 'Trust', fr: 'Confiance' },
        icon: 'vertrauen',
        wert: 49,
        einheit: '%',
        label: {
          de: 'vertrauen generativer KI bei Bankfragen',
          en: 'trust gen AI for banking questions',
          fr: 'se fient à l’IA générative pour leurs questions bancaires',
        },
        betont: true,
        zeigtVergleich: true,
      },
      {
        kicker: { de: 'Kontrolle', en: 'Control', fr: 'Contrôle' },
        icon: 'kontrolle',
        wert: 83,
        einheit: '%',
        label: {
          de: 'wollen jede Aktion eines KI-Agenten selbst freigeben',
          en: 'want to approve every action of an AI agent themselves',
          fr: 'veulent valider eux-mêmes chaque action d’un agent IA',
        },
      },
      {
        kicker: { de: 'Risiko', en: 'Risk', fr: 'Risque' },
        icon: 'risiko',
        wert: 66,
        einheit: '%',
        label: {
          de: 'sehen bei KI-Agenten mehr Fehlerrisiko als Nutzen',
          en: 'see more error risk than benefit in AI agents',
          fr: 'jugent le risque d’erreur des agents IA supérieur au bénéfice',
        },
      },
    ],
    folgerung: {
      kicker: { de: 'Was das für den Vertrieb heißt', en: 'What this means for distribution', fr: 'Ce que cela signifie pour la distribution' },
      text: {
        de: 'Kunden wollen KI und Kontrolle zugleich: Agenten bereiten vor, der Mensch entscheidet.',
        en: 'Customers want AI and control at the same time: agents prepare, people decide.',
        fr: 'Les clients veulent à la fois l’IA et le contrôle : les agents préparent, l’humain décide.',
      },
    },
    quelle: {
      de: 'Quelle: Deloitte Insights, „How much do bank customers trust gen AI?“, Deloitte Center for Financial Services, 27. August 2026; Befragung von rund 2.600 Bankkunden in den USA.',
      en: 'Source: Deloitte Insights, “How much do bank customers trust gen AI?”, Deloitte Center for Financial Services, 27 August 2026; survey of almost 2,600 banking customers in the United States.',
      fr: 'Source : Deloitte Insights, « How much do bank customers trust gen AI? », Deloitte Center for Financial Services, 27 août 2026 ; enquête auprès d’environ 2 600 clients bancaires aux États-Unis.',
    },
    quelleUrl:
      'https://www.deloitte.com/us/en/insights/industry/financial-services/bank-customers-generative-ai-trust.html',
    sprechernotiz: {
      de: 'Bevor wir in die Hypothesen gehen, ein Blick auf die Kunden. Deloitte hat im Sommer 2026 rund 2.600 Bankkunden befragt. Generative KI ist im Alltag angekommen: 58 Prozent der KI-Nutzer haben damit schon Bankprodukte recherchiert. Beim Vertrauen sieht es anders aus. Der eigenen Bank vertrauen 79 Prozent, der KI nur 49 Prozent, und 83 Prozent wollen nicht, dass ein KI-Agent ohne ihre Freigabe in ihren Finanzen handelt. Die Kunden sagen uns also zwei Dinge gleichzeitig: Nutzt KI, aber lasst mich die Kontrolle behalten. Genau das ist die Leitplanke für die drei Hypothesen: Der Wert entsteht nicht durch die KI allein und nicht durch den Berater allein, sondern im Zusammenspiel von Mensch und KI-Agenten. Halten Sie diese Zahlen fest, wenn wir gleich zum Vertriebscockpit kommen.',
      en: 'Before we go into the hypotheses, a look at the customers. In summer 2026 Deloitte surveyed almost 2,600 banking customers. Generative AI has arrived in everyday life: 58 percent of gen AI users have already researched banking products with it. Trust is a different story. 79 percent trust their own bank, only 49 percent trust gen AI, and 83 percent do not want an AI agent acting on their finances without their approval. So customers are telling us two things at once: use AI, but let me keep control. That is exactly the guardrail for the three hypotheses: the value does not come from AI alone, nor from the advisor alone, but from the interplay of people and AI agents. Keep these numbers in mind when we get to the sales cockpit.',
      fr: 'Avant d’entrer dans les hypothèses, un regard sur les clients. À l’été 2026, Deloitte a interrogé environ 2 600 clients bancaires. L’IA générative est entrée dans le quotidien : 58 pour cent des utilisateurs d’IA s’en sont déjà servis pour se renseigner sur des produits bancaires. Côté confiance, le tableau est tout autre. 79 pour cent font confiance à leur propre banque, seulement 49 pour cent à l’IA, et 83 pour cent ne veulent pas qu’un agent IA agisse sur leurs finances sans leur accord. Les clients nous disent donc deux choses à la fois : utilisez l’IA, mais laissez-moi garder le contrôle. C’est précisément le garde-fou des trois hypothèses : la valeur ne naît ni de l’IA seule ni du conseiller seul, mais de l’interaction entre l’humain et les agents IA. Gardez ces chiffres en tête lorsque nous arriverons au cockpit commercial.',
    },
  },
}

/** Hat das Kapitel einen Studien-Schritt vor den Hypothesen? */
export function hasFakt(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(FAKTEN, id)
}

export function getFakt(id: string): Fakt | null {
  return hasFakt(id) ? FAKTEN[id] : null
}
