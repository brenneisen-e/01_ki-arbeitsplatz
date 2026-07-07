// ─────────────────────────────────────────────────────────────────────────────
// LEITFRAGE_BY_IMAGE — McKinsey-Leitfrage je Hypothese, gekeyt auf die Bildnummer
// ("1_2", "3_4", …). Fallback: Hypothesen ohne inline `leitfrage` in chapters.ts
// erhalten hierüber ihre Leitfrage (siehe localizeHypothesis). Dadurch hat JEDE
// Hypothese eine Leitfrage — sichtbar im Consultant, editierbar im Tool und im
// Excel-Export enthalten.
//
// Muster: „Wenn [2030-Prämisse der Hypothese] – [zugespitzte Vorstandsfrage]?"
// Ohne Semikolon, ohne Doppelpunkt-Gendern, formelles „Sie".
// (Das Transformationskapitel 7_x ist bewusst NICHT enthalten — es zeigt das
//  Deloitte-Offering statt Hypothesen.)
// ─────────────────────────────────────────────────────────────────────────────

import type { L } from '../i18n/LanguageContext'

export const LEITFRAGE_BY_IMAGE: Record<string, L> = {
  '1_2': {
    de: 'Wenn die KI dem Kunden künftig statt einer Auswahl an Optionen nur noch eine klare, simulierte und begründete Empfehlung vorlegt – wer prägt dann eigentlich die Entscheidung, Ihre Bank oder die KI?',
    en: 'If AI presents the customer with one clear, simulated and reasoned recommendation instead of a set of options – who then actually shapes the decision, your bank or the AI?',
  },
  '1_3': {
    de: 'Wenn autonome KI-Agenten Ereignisse früh erkennen und innerhalb Ihrer Leitplanken teilautonom handeln, bevor der Kunde fragt – wie viel Autonomie würden Sie diesen Agenten heute schon zutrauen?',
    en: 'If autonomous AI agents detect events early and act semi-autonomously within your guardrails before the customer even asks – how much autonomy would you already dare to grant them today?',
  },
  '2_2': {
    de: 'Wenn Standardtransaktionen künftig autonom laufen und Ihre Berater nur noch bei komplexen Themen als KI-augmentierte Sparringspartner den Unterschied machen – haben Sie überhaupt die richtigen Berater dafür?',
    en: 'If standard transactions run autonomously and your advisors only make the difference on complex topics as AI-augmented sparring partners – do you even have the right advisors for that?',
  },
  '2_3': {
    de: 'Wenn KI-Agenten Ihre Kunden künftig permanent, kanalübergreifend und hyperpersonalisiert begleiten – an welcher Stelle in dieser lückenlosen Beziehung ist Ihre Bank für den Kunden dann noch spürbar?',
    en: 'If AI agents accompany your customers permanently, across channels and hyper-personalised – at which point in this seamless relationship is your bank still noticeable to the customer at all?',
  },
  '3_1': {
    de: 'Wenn standardisierte Geschäftsvorfälle künftig als vollautonome Dunkelverarbeitung Ende-zu-Ende laufen und Menschen nur noch komplexe Sonderfälle lösen – wofür halten Sie Ihre heutige Marktfolge-Mannschaft dann noch vor?',
    en: 'If standardised cases run as fully autonomous straight-through processing end-to-end and people only resolve complex exceptions – what are you still keeping today’s operations workforce for?',
  },
  '3_2': {
    de: 'Wenn externe Utility-Plattformen künftig große Teile Ihres standardisierten Betriebs übernehmen und Ihre Bank nur noch das Ökosystem orchestriert – welche Wertschöpfung wollen Sie dann bewusst im Haus behalten?',
    en: 'If external utility platforms take over large parts of your standardised operations and your bank only orchestrates the ecosystem – which value creation do you deliberately want to keep in-house?',
  },
  '3_3': {
    de: 'Wenn Ihre Marktfolge künftig vom internen Kostenblock zur Plattform wird, die standardisierte Banking-Services an Dritte verkauft – trauen Sie Ihrem Back-Office diesen Sprung zum eigenständigen Geschäftsmodell zu?',
    en: 'If your operations turn from an internal cost block into a platform that sells standardised banking services to third parties – do you trust your back office to make that leap into a standalone business?',
  },
  '3_4': {
    de: 'Wenn Regulatorik künftig „compliant by design" direkt im automatisierten Prozess mitläuft statt als nachgelagerter Kontrollschritt – was rechtfertigt dann noch Ihre heutige, aufgesetzte Compliance-Schicht?',
    en: 'If regulation runs “compliant by design” directly within the automated process instead of as a downstream control step – what then still justifies your bolted-on compliance layer of today?',
  },
  '4_1': {
    de: 'Wenn Weiterbildung künftig kontinuierlicher Skill-Aufbau für gänzlich neue Profile wie den AI-Translator wird – ist Ihr HR heute Enabler dieses Wandels oder verwaltet es noch Seminarkataloge?',
    en: 'If upskilling becomes continuous skill building for entirely new profiles such as the AI translator – is your HR an enabler of this change today, or does it still administer seminar catalogues?',
  },
  '4_2': {
    de: 'Wenn Ihre Organisation künftig nicht mehr über feste Strukturen, sondern über KI-orchestrierte Skills, Rollen und Teams in Echtzeit gesteuert wird – was bleibt dann von Ihrem Organigramm und Ihren Stellenprofilen?',
    en: 'If your organisation is steered no longer by fixed structures but by AI-orchestrated skills, roles and teams in real time – what then remains of your org chart and your job profiles?',
  },
  '4_3': {
    de: 'Wenn vorausschauende, datenbasierte Workforce-Steuerung künftig über Ihren Transformationserfolg entscheidet – wie datenblind planen Sie Ihre Belegschaft von morgen eigentlich heute noch?',
    en: 'If forward-looking, data-driven workforce management decides your transformation success in future – how data-blind are you actually still planning tomorrow’s workforce today?',
  },
  '4_4': {
    de: 'Wenn die KI künftig aus jeder Skill-Lücke automatisch ein immersives, passgenaues Trainingsprogramm im Arbeitsfluss ableitet – warum schicken Sie Mitarbeiter dann noch in standardisierte Präsenzseminare?',
    en: 'If AI automatically derives an immersive, tailored training programme in the flow of work from every skill gap – why are you still sending employees to standardised classroom seminars?',
  },
  '4_5': {
    de: 'Wenn künftig auch Ihre Mitarbeiter mit 50+ grundlegend neue Fähigkeiten aufbauen müssen und lebenslanges Reskilling zum Normalfall wird – ist Ihre Belegschaft auf diesen Dauerlauf überhaupt vorbereitet?',
    en: 'If even your employees aged 50-plus must build fundamentally new skills and lifelong reskilling becomes the norm – is your workforce prepared for this permanent effort at all?',
  },
  '5_1': {
    de: 'Wenn Software sich künftig selbst entwickelt, testet und deployt und Ihre Teams nicht mehr coden, sondern nur noch die KI überwachen und steuern – haben Sie dafür heute die richtigen Menschen an Bord?',
    en: 'If software develops, tests and deploys itself in future and your teams no longer code but only monitor and govern the AI – do you have the right people on board for that today?',
  },
  '5_2': {
    de: 'Wenn KI-Systeme künftig eigenständig entscheiden und Ihre Bank nur noch Governance und Leitplanken setzt – trauen Sie sich, die Kontrolle über das Ergebnis gegen Geschwindigkeit einzutauschen?',
    en: 'If AI systems decide independently in future and your bank only sets governance and guardrails – do you dare to trade control over the outcome for speed?',
  },
  '5_3': {
    de: 'Wenn Fachbereich und IT künftig zu integrierten Delivery-Teams verschmelzen und die IT als Gatekeeper verschwindet – wer schützt dann noch Standards und Sicherheit, wenn jeder direkt auf die Systeme zugreift?',
    en: 'If business and IT merge into integrated delivery teams and IT disappears as a gatekeeper – who then still safeguards standards and security when everyone accesses the systems directly?',
  },
  '6_1': {
    de: 'Wenn regulatorische Anforderungen künftig direkt in Ihre Systeme und Entscheidungslogiken eingebettet sind statt nachgelagert geprüft zu werden – wagen Sie es, Ihre klassische ex-post-Kontrolle abzuschaffen?',
    en: 'If regulatory requirements are embedded directly into your systems and decision logic instead of checked downstream – do you dare to abolish your classic ex-post control?',
  },
  '6_2': {
    de: 'Wenn aus drei getrennten Verteidigungslinien künftig eine technisch integrierte Echtzeit-Kontrolle mit dem CAIO im Zentrum wird – wer in Ihrem Haus hat heute schon die AI-Kompetenz für diese Rolle?',
    en: 'If three separate lines of defence turn into technically integrated real-time control with the CAIO at the centre – who in your organisation already has the AI competence for that role today?',
  },
  '6_3': {
    de: 'Wenn Cyber- und Operational Risk künftig untrennbarer Teil Ihres Betriebsmodells werden und Sicherheit permanente Resilienzsteuerung statt nachträglicher Schutzwall heißt – ist Ihre Bank auf einen existenzbedrohenden Angriff wirklich vorbereitet?',
    en: 'If cyber and operational risk become an inseparable part of your operating model and security means permanent resilience management rather than a retrofitted wall – is your bank truly prepared for an existential attack?',
  },
  '6_4': {
    de: 'Wenn Ihre Innenrevision künftig nachvollziehbar machen muss, wie und warum eine KI zu ihrem Ergebnis kam – kann Ihre Compliance heute überhaupt schon eine einzige KI-Entscheidung prüftief erklären?',
    en: 'If your internal audit must trace how and why an AI reached its result in future – can your compliance function today even explain a single AI decision with real audit depth?',
  },
  '8_1': {
    de: 'Wenn die KI künftig für jeden Kunden im Moment des Bedarfs ein hyperpersonalisiertes Produkt aus modularen Bausteinen komponiert – was ist Ihr Produktkatalog dann überhaupt noch wert?',
    en: 'If AI composes a hyper-personalised product from modular building blocks for every customer at the moment of need – what is your product catalogue then still worth at all?',
  },
  '8_2': {
    de: 'Wenn sich Konditionen, Limits und Absicherungen Ihrer Produkte künftig innerhalb definierter Leitplanken automatisch an Lebensereignisse anpassen – wer trägt dann die Verantwortung, wenn sich ein lebender Service gegen den Kunden entwickelt?',
    en: 'If the terms, limits and hedges of your products adjust automatically to life events within defined guardrails – who then bears responsibility when a living service turns against the customer?',
  },
  '8_3': {
    de: 'Wenn die KI künftig neue Produkte compliant by design in Tagen statt in Jahren entwirft, simuliert und testet – kann Ihre Governance mit einer Produktinnovation in diesem Tempo überhaupt noch Schritt halten?',
    en: 'If AI designs, simulates and tests new products compliant by design in days rather than years – can your governance even keep pace with product innovation at this speed?',
  },
}
