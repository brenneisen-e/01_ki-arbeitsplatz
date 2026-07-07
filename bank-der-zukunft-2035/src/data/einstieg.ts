// ─────────────────────────────────────────────────────────────────────────────
// EINSTIEG — „Einstiegsbühne" je Raum-Kapitel.
//
// Beim Reinzoomen in einen Raum zeigt die App zunächst das hochauflösende
// Raum-Detailbild groß und EINE Einleitung im McKinsey-Executive-Stil:
//   · `rolle`  — was diese Abteilung HEUTE tut und wofür sie verantwortlich ist
//                (Status quo, KEIN Vorgriff auf 2030 / die Hypothesen).
//   · `frage`  — ein Denkanstoß, der die Transformation nur anteasert.
// Zweisprachig; NUR die 8 raumgebundenen Kapitel (kein `transformation`).
// ─────────────────────────────────────────────────────────────────────────────

import type { ChapterId } from './chapters'
import type { L } from '../i18n/LanguageContext'

export type Einstieg = { rolle: L; frage: L }

export const EINSTIEG: Record<Exclude<ChapterId, 'transformation'>, Einstieg> = {
  kunde: {
    rolle: {
      de: 'Im Zentrum jedes Bankgeschäfts steht die Kund:in — und heute wird Banking aktiv gemacht: Konto prüfen, Angebote vergleichen, Termin buchen, selbst entscheiden. Jede Interaktion ist ein bewusster Moment, den die Kund:in über App, Filiale oder Online-Banking selbst anstößt. Die Bank liefert Produkte und Kanäle, den Takt gibt die Kund:in vor.',
      en: 'The customer sits at the centre of every banking relationship — and today, banking is something you actively do: check the account, compare offers, book an appointment, decide for yourself. Every interaction is a deliberate moment the customer initiates through app, branch or online banking. The bank supplies the products and channels; the customer sets the pace.',
    },
    frage: {
      de: 'Doch was, wenn Banking nicht mehr etwas ist, das man tut — sondern etwas, das einfach geschieht?',
      en: 'But what if banking is no longer something you do — but something that simply happens?',
    },
  },
  vertrieb: {
    rolle: {
      de: 'Der Vertrieb ist der Wachstumsmotor der Bank: Berater:innen führen die Kundenbeziehung, übersetzen Bedarf in Abschlüsse und tragen Ertrag und Marktanteil. Heute ist das Geschäft produkt- und kanalzentriert organisiert — strukturierte Beratungsgespräche, definierte Produktportfolios, klare Vertriebsziele. Aus Kontakten werden Abschlüsse, aus Abschlüssen Erträge.',
      en: 'Distribution is the growth engine of the bank: advisors own the customer relationship, translate needs into deals and carry revenue and market share. Today the business is organised in a product- and channel-centric way — structured advisory conversations, defined product portfolios, clear sales targets. Contacts become deals, and deals become revenue.',
    },
    frage: {
      de: 'Doch wie verändert sich die Beratung, wenn Technologie den Kunden immer besser kennt?',
      en: 'But how does the role of the advisor change as technology comes to know the customer ever better?',
    },
  },
  marktfolge: {
    rolle: {
      de: 'Die Marktfolge ist das Rückgrat des Bankbetriebs: Sie wickelt Kredite, KYC und Zahlungsverkehr zuverlässig ab, sichert Qualität und Kontrolle und hält den Betrieb am Laufen. Heute geschieht das über weitgehend interne Prozesse mit hohem manuellem Anteil und gewachsenen Systemen. Verlässlichkeit ist ihr Markenzeichen, Effizienz ihr täglicher Auftrag.',
      en: 'Operations are the backbone of the bank: they process credit, KYC and payments reliably, safeguard quality and control, and keep the machine running. Today this happens through largely in-house processes with a high manual share and grown systems. Reliability is their hallmark; efficiency, their daily mandate.',
    },
    frage: {
      de: 'Aber wie viel dieser täglichen Bearbeitung braucht in einem Jahrzehnt noch eine menschliche Hand?',
      en: 'But how much of this daily processing will still need a human hand a decade from now?',
    },
  },
  corporate: {
    rolle: {
      de: 'Corporate Services und HR sind die Gestalter der Organisation: Sie gewinnen Talente, entwickeln Kompetenzen, formen Strukturen und halten die Bank personell handlungsfähig. Heute folgt das etablierten Bahnen — funktionale Aufbauorganisation, feste Rollenprofile, Weiterbildung in klar abgegrenzten Formaten. Menschen und Strukturen sind das Fundament, auf dem alles andere steht.',
      en: 'Corporate Services and HR shape the organisation: they win talent, build capabilities, form structures and keep the workforce ready to act. Today this runs along established lines — a functional org design, fixed role profiles, training in clearly bounded formats. People and structures are the foundation on which everything else rests.',
    },
    frage: {
      de: 'Aber wie steuert man eine Organisation, in der sich die gefragten Fähigkeiten schneller wandeln als die Stellenprofile?',
      en: 'But how do you steer an organisation in which the skills that matter change faster than the job profiles?',
    },
  },
  it: {
    rolle: {
      de: 'Die IT ist der Maschinenraum der Bank: Sie entwickelt, betreibt und sichert die Systeme, auf denen jedes Produkt und jeder Prozess läuft. Heute wird Software in geplanten Zyklen von Menschen gebaut, getestet und ausgerollt. Die IT setzt die Anforderungen der Fachbereiche um und wacht über Stabilität, Sicherheit und Kontrolle. Ohne sie steht die Bank still.',
      en: 'IT is the engine room of the bank: it builds, runs and secures the systems on which every product and process depends. Today software is built, tested and rolled out by people in planned cycles. IT implements the requirements of the business and guards stability, security and control. Without it, the bank stands still.',
    },
    frage: {
      de: 'Aber reicht das in einer Welt, in der Code in Minuten statt Monaten entsteht?',
      en: 'But is that enough in a world where code emerges in minutes rather than months?',
    },
  },
  compliance: {
    rolle: {
      de: 'Compliance und Risk sind die Wächter der Bank: Sie sichern die regulatorische Konformität, steuern Risiken und schützen Integrität und Lizenz zum Geschäft. Heute wirkt diese Kontrolle überwiegend nachgelagert — über Prüfungen, Stichproben und klar getrennte Verteidigungslinien. Sie ist die Instanz, die dafür sorgt, dass Wachstum und Vertrauen zusammenpassen.',
      en: 'Compliance and Risk are the guardians of the bank: they secure regulatory conformity, steer risk and protect integrity and the licence to operate. Today this control works largely downstream — through reviews, sample checks and clearly separated lines of defence. They are the function that keeps growth and trust aligned.',
    },
    frage: {
      de: 'Aber kann Kontrolle, die erst hinterher prüft, mit Entscheidungen Schritt halten, die in Millisekunden fallen?',
      en: 'But can control that only checks after the fact keep pace with decisions made in milliseconds?',
    },
  },
  projekt: {
    rolle: {
      de: 'Produkte und Innovation gestalten das Angebot der Bank: Sie entwickeln Produkte, definieren Konditionen und bringen neue Leistungen an den Markt. Heute entsteht das über standardisierte Kataloge für breite Kundensegmente — abgestimmt in Gremien, umgesetzt in der IT, geprüft von der Compliance. Ein einmal aufgesetztes Produkt trägt oft über Jahre.',
      en: 'Products & Innovation design what the bank offers: they develop products, define terms and bring new services to market. Today this happens through standardised catalogues for broad customer segments — aligned in committees, implemented in IT, checked by compliance. A product, once set up, often carries for years.',
    },
    frage: {
      de: 'Doch wie lange trägt ein Produkt, das für Millionen gedacht ist, in einer Welt, die den Einzelnen kennt?',
      en: 'But how far does a product built for millions carry in a world that knows the individual?',
    },
  },
  vorstand: {
    rolle: {
      de: 'Der Vorstand steuert die Bank und trägt die letzte Verantwortung: Er setzt die Strategie, allokiert Kapital, gibt den Risikoappetit vor und steht für die Ergebnisse gerade. Heute entscheidet er auf Basis periodischer Berichte und in einem festen Jahreszyklus — verdichtete Kennzahlen, Quartalsstände, Erfahrung und Urteilskraft. Hier laufen alle Fäden zusammen.',
      en: 'The board steers the bank and carries ultimate accountability: it sets strategy, allocates capital, defines risk appetite and answers for the results. Today it decides on periodic reports and within a fixed annual cycle — condensed metrics, quarter-end figures, experience and judgement. This is where all the threads come together.',
    },
    frage: {
      de: 'Aber wie führt man ein Haus, dessen Kennzahlen sich in Echtzeit bewegen, mit Berichten von gestern?',
      en: 'But how do you lead a house whose numbers move in real time, on reports written yesterday?',
    },
  },
}

/** Raum-Detailbild je Kapitel (public/images/rooms/<id>.png). */
export function einstiegImage(id: ChapterId): string {
  return `./images/rooms/${id}.png`
}

/** Hat dieses Kapitel eine Einstiegsbühne (alle Raum-Kapitel außer Aufzug)? */
export function hasEinstieg(id: ChapterId): id is Exclude<ChapterId, 'transformation'> {
  return id !== 'transformation'
}
