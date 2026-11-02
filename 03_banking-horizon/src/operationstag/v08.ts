// ─────────────────────────────────────────────────────────────────────────────
// Achte Fassung — „Ein Tag in Banking Operations 2030"
//
// v07 bleibt unangetastet daneben stehen (Bilder, Wege, Texte, Kommentare).
// Diese Datei traegt AUSSCHLIESSLICH das, was das Review vom 25.08.2026
// geaendert hat: die Kommentare aus der Review-Datenbank und das
// Besprechungstranskript.
//
// Die drei grossen Aenderungen:
//
//  1. Der Dreiklang heisst nicht mehr „What changed / Evidence / So what".
//     Statt dessen fuehrt jede Szene in derselben Reihenfolge durch:
//       Setting        — was man hier ueberhaupt sieht, deskriptiv
//       On the screen  — was die Zahlen auf dem Schirm bedeuten
//       Business impact— was das fuer Autonomie und Human-in-the-Loop heisst
//     Dazu, NUR wo Kunden wirklich betroffen sind, eine vierte Marke:
//       Client impact  — was der Kunde davon merkt
//     („So what" war missverstaendlich, „Evidence" erklaerungsbeduerftig;
//      die Kundensicht sollte nicht ueberall stehen, sondern dort, wo sie
//      etwas aussagt — Felix' Einwand gegen zu breite Zielgruppe.)
//
//  2. Alles, was im Overnight Report um 07:00 steht, kommt spaeter im Tag
//     nachweislich wieder vor. Die Zahlen sind einmal gesetzt und gelten
//     durchgehend — siehe ZAHLEN unten.
//
//  3. Die Storyline haengt zusammen: das um 08:15 geoeffnete eskalierte
//     Pattern ist das Thema des Team-Meetings um 09:00; um 10:30 prueft Mara
//     den Weg, den ein Agent selbst dafuer gefunden hat; um 11:15 laufen die
//     drei Verteidigungslinien in Echtzeit mit, waehrend sie die
//     Garnishment-Logik anpasst; um 14:00 zertifiziert sie die neue Fassung.
//     11:15 und 14:00 sind gegenueber v07 also GETAUSCHT.
// ─────────────────────────────────────────────────────────────────────────────

import type { OpsStation } from './data'

/**
 * Die Zahlen der Fassung — einmal gesetzt, ueberall gleich.
 *
 * Der schwerste Befund des Reviews war, dass der Overnight Report Zahlen
 * nennt, die in keiner spaeteren Szene wieder auftauchen (128 Patterns, von
 * denen 96 geloest und 3 eskaliert wurden — was mit den restlichen 29
 * passiert, stand nirgends). Deshalb steht hier die einzige Quelle:
 * jede Zahl im Handy, in den Bildschirmen und in den Belegen kommt von hier.
 */
export const ZAHLEN = {
  /** Ueber Nacht autonom abgeschlossene Faelle. */
  faelleNacht: 5284,
  /** Anteil der Faelle, die kein Mensch angefasst hat. */
  autonom: '99.4 %',
  /** Erkannte Muster — und ihre vollstaendige Aufteilung. */
  patternErkannt: 7,
  patternGeloest: 4,
  patternEskaliert: 3,
  /** Kunden, fuer die eine Wiedergutmachung vorbereitet ist. */
  kundenRemedy: 370,
  /** Vorgeschlagene Summe fuer diese Wiedergutmachungen. */
  remedySumme: '2,450 EUR',
  /** Tagesrahmen, den das Haus dafuer eingeplant hat. */
  remedyBudget: '3,000 EUR',
  /** Spanne je Einzelfall. */
  remedySpanne: '2 to 25 EUR',
  /** Anteil vermiedener Kundenkontakte. */
  vermeidung: '98.6 %',
  /** Belegschaft der Einheit: Menschen und Agenten. */
  menschen: 2,
  agenten: 120,
  /** Agenten ohne offene Aufgabe — Anlass fuer Kapazitaetsplanung. */
  agentenLeer: 2,
} as const

/** Marken des Dreiklangs (plus die vierte, optionale Kundenmarke). */
export type V08Marke = 'context' | 'automation' | 'hitl' | 'kunde'

/**
 * Ein Beleg der v08: anders als in v07 traegt er seine Marke selbst mit.
 * In v07 ergab sich die Marke aus der Position (erster Punkt = „What
 * changed"); das zwang jede Station in denselben Dreiklang, auch wo er nicht
 * passte — um 07:45 gibt es nichts zu belegen, dort spricht die Szene fuer
 * sich.
 */
export type V08Beleg = { marke: V08Marke; text: string }

/** Beschriftung und Reihenfolge der Marken. */
export const V08_MARKEN: Record<V08Marke, string> = {
  context: 'Context',
  automation: 'Automation',
  hitl: 'Human in the loop',
  kunde: 'Client impact',
}

/**
 * Belege je Station — der Dreiklang der achten Fassung.
 *
 *   Context           was fuer eine Szene das ist und was auf dem Schirm steht
 *   Automation        was der Agent allein gemacht hat
 *   Human in the loop welche Rolle Mara als Mensch noch hat
 *
 * Dazu, NUR wo es wirklich einen Kundenbezug gibt, eine vierte Marke:
 *   Client impact     was der Kunde davon merkt
 *
 * Je Beleg EIN kurzer Satz. Die Karten stehen neben der Szene und die Schrift
 * soll aus zehn Metern lesbar sein — das laesst rund hundert Zeichen zu. Der
 * laengere Gedanke gehoert auf die Tonspur.
 */
export const V08_BELEGE: Record<string, V08Beleg[]> = {
  // 07:45 traegt keine Marke: die Aussage steht als Ueberschrift ueber dem
  // Bild, und was sie sagt, steht ohnehin auf dem Telefon daneben. Eine
  // Context-Box haette es ein drittes Mal gesagt.
  s0: [],

  s1: [
    { marke: 'context', text: 'Complaints Management at 08:00: the record of a night, not a queue of complaints.' },
    { marke: 'automation', text: 'Agents found 7 patterns, fixed 4 at the root and closed 370 cases without her.' },
    { marke: 'hitl', text: 'Three fell below the confidence threshold. Those three are hers to decide.' },
    { marke: 'kunde', text: '98.6 % of these customers never notice anything: nothing to complain about.' },
  ],

  s2: [
    { marke: 'context', text: 'One approval screen for every remedy the agents prepared overnight.' },
    { marke: 'automation', text: 'The agent priced each gesture itself: 370 customers, 2 to 25 EUR per case.' },
    { marke: 'hitl', text: 'Mara checks the reasoning and releases 2,450 EUR against a 3,000 EUR budget.' },
    { marke: 'kunde', text: 'The customer is compensated for trouble they never had to report.' },
  ],

  s2b: [
    { marke: 'context', text: 'The moment of release: 370 customers hear about it at the same time.' },
    { marke: 'automation', text: 'Each message is written and sent by the agent, in that customer\'s own situation.' },
    { marke: 'hitl', text: 'One judgement of hers reaches all 370. She speaks to none of them.' },
    { marke: 'kunde', text: 'A silent fix becomes a visible moment: the bank noticed, acted and said so.' },
  ],

  s3: [
    { marke: 'context', text: 'The first of three escalated patterns: garnishment exemptions calculated too low.' },
    { marke: 'automation', text: 'The evidence pack was assembled before she opened it, every item traceable.' },
    { marke: 'hitl', text: 'Two questions are left, and both are decisions, not lookups.' },
  ],

  s4: [
    { marke: 'context', text: 'She brings the escalated pattern into the review - 34 exemptions calculated too low.' },
    { marke: 'automation', text: '370 cases overnight; the roles report their own calibration and capacity.' },
    { marke: 'hitl', text: 'The room decides who owns the fix and what it costs the fleet.' },
  ],

  s5: [
    { marke: 'context', text: 'In the phone booth with T. Brandt (second line): the route one agent found through the pattern.' },
    { marke: 'automation', text: 'It queried the population register mid-case and recalculated: 660 become 130 EUR.' },
    { marke: 'hitl', text: 'Mara judges whether the route stayed inside the guardrails, then makes it the rule.' },
  ],

  s6: [
    { marke: 'context', text: 'Back at the desk with T. Brandt: she edits the logic, second and third line check along.' },
    { marke: 'automation', text: 'Risk, affordability, conduct and fairness are tested live against every keystroke.' },
    { marke: 'hitl', text: 'Five of six controls clear themselves. The sixth is a decision only she can take.' },
  ],

  s7: [
    { marke: 'context', text: 'Mara follows the business results of her decision.' },
    { marke: 'automation', text: 'Her guardrail changes went into production within minutes - no roadmap slot required.' },
    { marke: 'hitl', text: 'She certified the logic once, and from that moment it governs every agent in the fleet.' },
  ],

  s8: [
    { marke: 'context', text: 'A tax-authority letter, scanned from the post, landed with the regulatory agent.' },
    { marke: 'automation', text: 'It read the letter, verified the sender and collected Finance and Legal sign-off.' },
    { marke: 'hitl', text: 'Two questions come back to her, and hers is the last approval in the chain.' },
  ],

  s9: [
    { marke: 'context', text: 'Her workforce as a portfolio: two people and 120 agents in one view.' },
    { marke: 'automation', text: 'Two agent roles ran out of work this morning: the fix removed their cause.' },
    { marke: 'hitl', text: 'She decides what happens to them: retasked, constrained or retired.' },
  ],

  s10: [
    { marke: 'context', text: 'The end of an ordinary Monday, counted in the numbers she started with at seven.' },
    { marke: 'automation', text: '370 cases, 7 patterns, 370 remedies: none of it processed by her hand.' },
    { marke: 'hitl', text: 'She certified logic, judged exceptions and recalibrated agents. That was the work.' },
  ],
}

/**
 * Aenderungen an den Stationstexten gegenueber v07.
 *
 * Nur was wirklich anders ist — alles Uebrige kommt unveraendert aus
 * OPS_STATIONS. `zeit` und `klick` stehen hier, wo das Review die Reihenfolge
 * getauscht hat.
 */
type V08Aenderung = Partial<Pick<
  OpsStation,
  'zeit' | 'klick' | 'dimension' | 'hypothese' | 'statusQuo' | 'future' | 'impact'
  | 'leitfrage' | 'szene' | 'script' | 'punkte'
>> & { personaText?: string; personaKopfzeile?: string }

export const V08_TEXTE: Record<string, V08Aenderung> = {
  home: {
    // Aus der Abnahme: Hypothese, Profil, Umfang und „This morning" fallen
    // weg — der eine Absatz traegt alles. Der Satz vom Overnight Briefing
    // steht jetzt darin, und sie faehrt nicht mehr Rad ins Buero, sondern
    // macht sich auf den Weg zur Arbeit.
    personaText:
      'This is Mara Vogel. She is 38, lives in Frankfurt am Main and has been with the bank '
      + 'for twelve years. She started in case processing and today owns Complaints '
      + 'Management and Garnishment end to end. Her overnight briefing was on her phone '
      + 'before she got up: the first hour of her old day is gone. In a moment she sets off '
      + 'for work, **and the work waiting for her there would be barely recognizable next '
      + 'to the one she started in 2018.**',
    // Leer: die Hypothese steht in dieser Szene nicht ueber dem Bild.
    personaKopfzeile: '',
    // Keine Stichpunkte — der Absatz sagt alles, was sie sagten.
    punkte: [],
    szene:
      'Mara at home at the kitchen table. The overnight report is already on her phone: 370 '
      + 'cases resolved autonomously, the agent workforce operating normally, three patterns '
      + 'escalated for her review, 370 remedies prepared and waiting for her budget approval, '
      + 'and a briefing for the nine o\'clock team meeting. Every one of those lines comes back '
      + 'later in the day.',
  },

  s0: {
    // Aus der Abnahme: die Aussage soll die Szene ueberschreiben, nicht das
    // Gebaeude kommentieren — sie kommt vorbereitet an, und die Termine, an
    // denen sie gebraucht wird, stehen schon.
    hypothese:
      'Mara arrives ready for the day - every alignment and approval she owns already has '
      + 'its slot.',
    // Kein Markenband: die Aussage steht als Ueberschrift ueber dem Bild, und
    // die Termine stehen daneben auf dem Telefon.
    punkte: [],
  },

  s1: {
    szene:
      'Mara opens Complaints Management. Instead of a queue of complaints she sees the night: '
      + 'seven patterns detected, four resolved at the root cause and documented, three held '
      + 'back because policy confidence fell below threshold. Those three are the ones her '
      + 'phone announced at seven.',
    impact:
      '**98.6 % contact avoidance**: the patterns behind recurring fee disputes and failed '
      + 'payments are fixed before a customer notices. **Cost per complaint case reduced by '
      + '70-90 %**; the same operational capacity supports **5-10x higher volume** without '
      + 'linear cost growth. Proactive resolution increases trust and retention, creating '
      + 'measurable CLV uplift and reducing churn.',
  },

  s2: {
    dimension: 'Customer Perspective',
    hypothese:
      'The customer doesn\'t just avoid friction - they\'re rewarded for the trouble the bank '
      + 'caused in the first place.',
    future:
      'The agent prepares the remedy for **every affected customer at once** and prices each '
      + 'gesture individually - a small credit, a cinema or fuel voucher - **turning an '
      + 'invisible save into a visible, positive moment**. Mara does not work the cases; she '
      + 'reviews the reasoning and releases the batch **within a budget the bank set in advance**.',
    impact:
      'Illustrative: **2,450 EUR of goodwill against a 3,000 EUR daily allowance**, set against '
      + 'the complaint-handling cost avoided, plus potential NPS and loyalty uplift, to be '
      + 'validated with real unit economics.',
    leitfrage:
      'Does your goodwill budget exist as a framework an agent can work inside - or as a '
      + 'decision someone has to make case by case?',
    szene:
      'One screen, all remedies: 370 customers affected by the four patterns resolved '
      + 'overnight, nine of them shown by name with what went wrong and what the agent proposes '
      + 'to put it right, between 2 and 25 EUR each. Bottom right, the total of 2,450 EUR '
      + 'against the 3,000 EUR the bank has budgeted for goodwill today.',
    script:
      'Prevention only creates trust if the customer can feel it. What is new here is not the '
      + 'voucher. It is that the agent arrives with a priced, reasoned remedy for every affected '
      + 'customer at once, inside a budget the bank set in advance, and that the human act is '
      + 'to review and release, not to work the cases.',
  },

  s2b: {
    // „thousands" stammte aus der v07, wo die Zahl nirgends belegt war. Es
    // sind 370 — dieselbe Zahl, die um 07:00 im Report und um 08:05 auf dem
    // Freigabeschirm steht.
    hypothese: 'One approval, and 370 customers hear about it at once.',
    szene:
      'Mara releases the batch. In the same moment 370 customers are informed: at the kitchen '
      + 'table, on the tram, in the supermarket, in the workshop. Nine of them are shown here. '
      + 'She never speaks to any of them.',
    leitfrage: 'How many of the problems you solve does your customer ever find out about?',
  },

  s3: {
    szene:
      'Mara opens the first of the three escalated patterns: garnishment exemptions calculated '
      + 'too low, because dependants were read from the case file instead of the population '
      + 'register. She searches for nothing. The evidence agent has already assembled the '
      + 'affected cases, the exemption calculations, the legal basis, comparable prior decisions '
      + 'and the data-sharing constraints, and has marked what it does not know. What she takes '
      + 'from here goes into the nine o\'clock meeting.',
    script:
      'Expertise used to mean knowing where to search. Here the search has already happened: '
      + 'Mara starts with a built evidence package and one question: is this reading '
      + 'defensible, complete and proportionate? Human value moves from finding information to '
      + 'interrogating it.',
  },

  s4: {
    szene:
      'The daily operating review. On the wall is the pattern Mara opened forty-five minutes '
      + 'ago, alongside the six agent roles of the unit: 370 cases handled overnight, '
      + 'calibration and health per role, and the capacity each will need once the root cause is '
      + 'closed. Behind each person at the table stands the agent team they lead.',
    script:
      'Mara still leads a team, and so does everyone else at this table. Each of them runs '
      + 'agents of their own. The meeting is not about who takes which queue. It is about how a '
      + 'root cause gets closed, which agent role carries it, and what that does to the capacity '
      + 'of the fleet.',
  },

  s5: {
    szene:
      'The meeting handed the pattern to one agent, and it found its own way through: the '
      + 'execution trace does not resemble the official BPMN map. Where the documented flow '
      + 'reads dependants from the case file, it went to the population register mid-case, '
      + 'recalculated the exemption, skipped two steps that no longer applied and resequenced '
      + 'creditor notification, and still reached a compliant outcome with full evidence. Mara '
      + 'reviews the route, not the map.',
    script:
      'The process was once the control object. Here the route varies while the obligation '
      + 'stays fixed. The agent was not handed a better flowchart; it worked out a path. What '
      + 'Mara has to judge is whether that path stayed inside the legal, operational and '
      + 'fairness guardrails, and whether it should become the rule.',
  },

  // ── Getauscht: die drei Verteidigungslinien laufen mit, WAEHREND sie die
  //    Logik anpasst — und erst danach zertifiziert sie. In v07 lag die
  //    Zertifizierung um 11:15 und die Kontrolle um 14:00.
  s6: {
    zeit: '11:15',
    dimension: 'Risk, Compliance & Controls',
    hypothese:
      'Control will become part of the decision itself - the three lines of defense work in '
      + 'real-time.',
    statusQuo:
      'A change to garnishment logic is drafted by the first line, then handed to a second-line '
      + 'risk function and later to internal audit - **three organizationally separate steps, '
      + 'days apart**.',
    future:
      'As Mara edits the garnishment logic, second- and third-line agents evaluate the draft '
      + 'against risk appetite, regulatory constraints and fairness rules **in the same moment '
      + 'she types**. There is no separate downstream act left to perform; the lines still '
      + 'exist, but they run **in real time** rather than in sequence.',
    impact:
      '**100% of decisions carry real-time control evidence** vs. a 3-5 day second-line review '
      + 'backlog in 2025. Embedded controls reduce policy breaches and **operational-risk '
      + 'incidents by 50-80%** through continuous validation. New regulatory requirements are '
      + 'implemented as policy updates rather than transformation programmes.',
    leitfrage:
      'If the second line checks the change while it is being written, what is the value of '
      + 'checking it again afterwards - and what does \'independence\' mean at that speed?',
    szene:
      'Mara adapts the garnishment logic to the route the agent found. While she works, second- '
      + 'and third-line agents test every edit against risk appetite, affordability, conduct '
      + 'obligations, fairness constraints and the applicable regulation: live, line by line, '
      + 'each finding named to the rule it comes from. Nothing is handed over; nothing waits.',
    script:
      'Control no longer waits downstream. It travels with the decision, and here with the '
      + 'decision logic while it is still being written. That changes what independence means: '
      + 'the second line is strongest not when it rechecks afterwards, but when it challenges '
      + 'in the moment and monitors continuously.',
  },

  s7: {
    zeit: '14:00',
    dimension: 'Governance & Operating Model',
    hypothese:
      'Humans will no longer approve individual decisions - only the decision logic behind them.',
    statusQuo:
      'In Garnishment, a caseworker reviews and signs off on each individual garnishment order - '
      + 'checking exemption amounts, creditor priority, and account holds - **case by case, '
      + 'against a delegation-of-authority matrix** built for that purpose.',
    future:
      'A human **certifies the garnishment decision logic once** (exemption calculation rules, '
      + 'priority hierarchy, hold triggers) as a tested, version-controlled policy. Every agent '
      + 'in the fleet then works under that certified logic **without case-by-case sign-off**; '
      + 'the human only recertifies when the logic itself changes.',
    impact:
      '**0.4 seconds per decision vs. ~20 minutes of manual review** in 2025 - the same '
      + 'headcount can cover **roughly 15x the volume**.',
    leitfrage:
      'If you can no longer verify individual garnishment decisions, what exactly are you '
      + 'accountable for when you certify the logic - and does your delegation-of-authority '
      + 'framework have a category for that?',
    szene:
      'The change from this morning is ready to be certified. Mara compares version 4.2 with '
      + '4.3 of the garnishment logic: the diff, the real-time control findings from 11:15, the '
      + 'test results, the observed drift and the rollback path. She certifies once, and from '
      + 'that moment every agent in the fleet works under the new version.',
    script:
      'Approval moves upstream. In 2025 Mara approved decisions one by one because the bank '
      + 'trusted human review more than system logic. Here the accountable act is certifying the '
      + 'logic that will govern thousands of decisions. That makes governance both more powerful '
      + 'and more dangerous: one certified rule can scale trust, but one flawed rule can scale '
      + 'failure.',
  },

  s8: {
    statusQuo:
      'An information request from a tax authority arrives **by post, with a stamp**, is scanned '
      + 'into the mailroom and then travels through Operations, Finance and Legal by hand - each '
      + 'department finding out separately what is expected of it.',
    future:
      'However the request arrives - scanned letter today, a verified digital channel tomorrow - '
      + 'it lands with a **regulatory agent** that reads it, checks that the requester is '
      + 'authenticated and has a legitimate interest, works out **who has to be involved**, '
      + 'collects their approvals and comes back to Mara with a plan, open questions and dates.',
    impact:
      'Preparation time **reduced from days to minutes**, and the approval chain assembles '
      + 'itself: the agent reads the obligation, derives the RACI and collects sign-off in '
      + 'parallel rather than in sequence.',
    leitfrage:
      'Who in your house today works out which departments a regulatory request touches - and '
      + 'how long does that take before anyone has answered anything?',
    szene:
      'A tax-authority request has arrived, scanned from the post, the original page visible '
      + 'alongside its verification seal. The regulatory agent has read it, confirmed the '
      + 'authority and its legitimate interest, summarised what is being asked, listed the steps '
      + 'it would take and by when, and asked Mara two clarifying questions. Finance confirmed '
      + 'three hours ago, Legal an hour ago; the request now sits with her.',
    script:
      'For years, banks optimized front ends. The primary interface here is not a screen: it is '
      + 'an institutional agent that understands intent, negotiates scope and executes across '
      + 'systems, including across departments. It does not only answer the authority. It works '
      + 'out who inside the bank has to sign, and gets them there first.',
  },

  s9: {
    szene:
      'Mara reviews her workforce portfolio: two human specialists and 120 agent instances in '
      + 'one view. Utilisation per agent role, two agents with no open work left since this '
      + 'morning\'s root-cause fix, the seven patterns of the night with their four-and-three '
      + 'split, and contact avoidance at 98.6 %. The question on the screen is not who is busy, '
      + 'but which agents should be retasked, constrained or retired.',
    script:
      'Leadership becomes portfolio management. Managing eight people scaled through coaching '
      + 'and staffing. Managing 120 agents scales through objectives, telemetry, calibration and '
      + 'governance, and an agent that has run out of work is a planning signal that arrives '
      + 'within hours, not at the next budget round.',
  },

  s10: {
    // Aus der Review-Datenbank: sie hat Casework gemacht - aber kein
    // standardisiertes.
    hypothese: 'Not one task today was standardized case work.',
    szene:
      'Mara reviews the day. 370 cases were resolved overnight, seven patterns found, four '
      + 'closed at the root and three judged by her; 370 customers were made whole for 2,450 '
      + 'EUR; one authority request was answered; one version of the garnishment logic was '
      + 'certified. She did not personally process a single standardized case.',
  },
}

/** Belege einer Station in dieser Fassung — leer, wenn die Szene ohne auskommt. */
export function v08Belege(stationId: string): V08Beleg[] {
  return V08_BELEGE[stationId] ?? []
}

/**
 * Wohin die Blasen im Bild zeigen. Wie in v05, aber mit einem vierten Platz:
 * die Kundenmarke haengt unten rechts. Stationen ohne eigenen Eintrag erben
 * die Anker der v05 (PUNKT_ANKER) — dort gibt es nur drei Belege.
 */
export const V08_ANKER: Record<string, { x: number; y: number; slot: 'lo' | 'ro' | 'lu' | 'ru' }[]> = {
  // Vier Blasen an den Schreibtisch-Szenen: Monitor, Schirmkante, Raum links,
  // und die Kundenmarke unten rechts neben ihrer Hand.
  s1: [
    { x: 0.44, y: 0.55, slot: 'lo' },
    { x: 0.63, y: 0.37, slot: 'ro' },
    { x: 0.14, y: 0.4, slot: 'lu' },
    { x: 0.72, y: 0.66, slot: 'ru' },
  ],
  s2: [
    { x: 0.44, y: 0.55, slot: 'lo' },
    { x: 0.63, y: 0.37, slot: 'ro' },
    { x: 0.14, y: 0.4, slot: 'lu' },
    { x: 0.72, y: 0.66, slot: 'ru' },
  ],
  s2b: [
    { x: 0.3, y: 0.42, slot: 'lo' },
    { x: 0.74, y: 0.45, slot: 'ro' },
    { x: 0.12, y: 0.58, slot: 'lu' },
    { x: 0.78, y: 0.7, slot: 'ru' },
  ],
  // Ankunft: eine einzige Blase, links oben.
  s0: [{ x: 0.13, y: 0.52, slot: 'lo' }],
}

/**
 * Die bearbeitbaren Texte einer Station im Review-Panel.
 *
 * In v07 waren es immer vier feste Felder (Hypothese plus What changed /
 * Evidence / So what). In v08 haengt die Liste an der Station: 07:45 hat nur
 * eine Blase, die Kundenszenen haben vier. Wer im Panel ein Feld sieht, das
 * auf der Buehne gar nicht steht, bearbeitet ins Leere.
 */
export function v08Felder(stationId: string): { id: string; titel: string }[] {
  return [
    { id: 'hypothese', titel: 'Hypothesis' },
    ...v08Belege(stationId).map((b, n) => ({ id: `punkt${n}`, titel: V08_MARKEN[b.marke] })),
  ]
}

/**
 * Was auf jedem Standbild senkrecht sichtbar bleiben MUSS, als Anteil der
 * Bildhoehe.
 *
 * Die Szene laeuft in v08 ueber die volle Breite. Das Material ist 16:9, die
 * Buehne unter Hero-Band und Marken-Band ist breiter — `cover` fuellt deshalb
 * die Breite und schneidet oben und unten ab. Wo geschnitten wird, darf nicht
 * geraten werden: hier steht je Station, welcher Streifen den Bildschirm (oder
 * die Kacheln, oder die Handytafel) enthaelt. Passt der Streifen nicht in die
 * Buehne, wird nicht geschnitten, sondern eingepasst.
 */
export const V08_BILDFELD: Record<string, [number, number] | null> = {
  home: [0.16, 0.88],   // das Telefon mit dem Overnight Report
  s0: [0.16, 0.88],     // das Telefon mit der Tagesuebersicht
  s1: [0.173, 0.769],
  s2: [0.173, 0.769],
  s2b: [0.08, 0.78],    // Ueberschrift und alle neun Kacheln (Ende bei 74 %)
  s3: [0.173, 0.769],
  s4: [0.0, 0.35],      // Wandanzeige mit Rahmen und Luft daruber, dazu die Koepfe
  s5: [0.175, 0.765],
  s6: [0.175, 0.765],
  s7: [0.16, 0.88],    // das Telefon mit dem Recovery-Vorschlag
  s8: [0.173, 0.769],
  s9: [0.173, 0.769],
  s10: null,            // Dachgarten, kein Pflichtfeld
}

/**
 * Bildausschnitt fuer eine Station: wie das Bild in die Buehne gelegt wird.
 * `contain`, wenn das Pflichtfeld hoeher ist als die Buehne — dann geht
 * lieber Breite verloren als Inhalt.
 */
export function v08Ausschnitt(
  stationId: string, breite: number, hoehe: number,
): { fit: 'cover' | 'contain'; position: string } {
  const feld = V08_BILDFELD[stationId]
  const bildHoehe = breite * 9 / 16
  if (!feld || bildHoehe <= hoehe) return { fit: 'cover', position: 'center center' }
  const schnitt = bildHoehe - hoehe
  const mitte = ((feld[0] + feld[1]) / 2) * bildHoehe
  const oben = Math.max(0, Math.min(schnitt, mitte - hoehe / 2))
  // Passt das Pflichtfeld gar nicht, wird eingepasst statt geschnitten.
  if ((feld[1] - feld[0]) * bildHoehe > hoehe) return { fit: 'contain', position: 'center center' }
  return { fit: 'cover', position: `center ${((oben / schnitt) * 100).toFixed(1)}%` }
}
