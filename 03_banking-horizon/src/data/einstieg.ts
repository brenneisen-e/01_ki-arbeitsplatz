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
      de: 'Im Zentrum jedes Bankgeschäfts steht der Kunde, und heute wird Banking aktiv gemacht: Konto prüfen, Angebote vergleichen, Termin buchen, selbst entscheiden. Jede Interaktion ist ein bewusster Moment, den der Kunde über App, Filiale oder Online-Banking selbst anstößt. Die Bank liefert Produkte und Kanäle, den Takt gibt der Kunde vor.',
      en: 'The customer sits at the centre of every banking relationship, and today, banking is something you actively do: check the account, compare offers, book an appointment, decide for yourself. Every interaction is a deliberate moment the customer initiates through app, branch or online banking. The bank supplies the products and channels; the customer sets the pace.',
      fr: 'Le client est au cœur de toute activité bancaire, et aujourd’hui la banque se pratique activement : consulter son compte, comparer des offres, prendre rendez-vous, décider soi-même. Chaque interaction est un moment délibéré que le client déclenche lui-même via l’app, l’agence ou la banque en ligne. La banque fournit les produits et les canaux ; c’est le client qui donne le rythme.',
    },
    frage: {
      de: 'Die eigentliche Frage ist nicht, wie gut Ihre Bank ihre Kunden bedient, sondern ob der Kunde sie im Alltag überhaupt noch bemerkt.',
      en: 'The real question is no longer how well your bank serves its customers, but whether the customer still notices it at all.',
      fr: 'La vraie question n’est pas de savoir avec quelle qualité votre banque sert ses clients, mais si ceux-ci la remarquent encore au quotidien.',
    },
  },
  vertrieb: {
    rolle: {
      de: 'Der Vertrieb ist der Wachstumsmotor der Bank: Berater führen die Kundenbeziehung, übersetzen Bedarf in Abschlüsse und tragen Ertrag und Marktanteil. Heute ist das Geschäft produkt- und kanalzentriert organisiert: strukturierte Beratungsgespräche, definierte Produktportfolios, klare Vertriebsziele. Aus Kontakten werden Abschlüsse, aus Abschlüssen Erträge.',
      en: 'Distribution is the growth engine of the bank: advisors own the customer relationship, translate needs into deals and carry revenue and market share. Today the business is organised in a product- and channel-centric way: structured advisory conversations, defined product portfolios, clear sales targets. Contacts become deals, and deals become revenue.',
      fr: 'La fonction commerciale est le moteur de croissance de la banque : les conseillers pilotent la relation client, traduisent les besoins en ventes et portent les revenus et la part de marché. Aujourd’hui, l’activité est organisée autour des produits et des canaux : entretiens de conseil structurés, gammes de produits définies, objectifs commerciaux clairs. Les contacts deviennent des ventes, les ventes des revenus.',
    },
    frage: {
      de: 'Wenn die KI den Kunden besser kennt als jeder Berater, worin liegt dann der Wert des Gesprächs?',
      en: 'When AI knows the customer better than any advisor, where then does the value of the conversation lie?',
      fr: 'Si l’IA connaît le client mieux que n’importe quel conseiller, où réside alors la valeur de l’entretien ?',
    },
  },
  marktfolge: {
    rolle: {
      de: 'Die Marktfolge ist das Rückgrat des Bankbetriebs: Sie wickelt Kredite, KYC und Zahlungsverkehr zuverlässig ab, sichert Qualität und Kontrolle und hält den Betrieb am Laufen. Heute geschieht das über weitgehend interne Prozesse mit hohem manuellem Anteil und gewachsenen Systemen. Verlässlichkeit ist ihr Markenzeichen, Effizienz ihr täglicher Auftrag.',
      en: 'Operations are the backbone of the bank: they process credit, KYC and payments reliably, safeguard quality and control, and keep the machine running. Today this happens through largely in-house processes with a high manual share and grown systems. Reliability is their hallmark; efficiency, their daily mandate.',
      fr: 'Le back-office est la colonne vertébrale de l’exploitation bancaire : il traite de manière fiable les crédits, le KYC et les paiements, garantit la qualité et le contrôle et assure la continuité de l’activité. Aujourd’hui, cela passe par des processus largement internes, une forte part de travail manuel et des systèmes construits par strates. La fiabilité est sa marque de fabrique, l’efficacité sa mission quotidienne.',
    },
    frage: {
      de: 'Die Frage ist nicht mehr, wie effizient Sie jeden Fall bearbeiten, sondern wie viele davon 2030 überhaupt noch eine menschliche Hand berühren.',
      en: 'The question is no longer how efficiently you process each case, but how many of them will still touch a human hand at all in 2030.',
      fr: 'La question n’est plus de savoir avec quelle efficacité vous traitez chaque dossier, mais combien d’entre eux passeront encore entre des mains humaines en 2030.',
    },
  },
  corporate: {
    rolle: {
      de: 'Corporate Services und HR sind die Gestalter der Organisation: Sie gewinnen Talente, entwickeln Kompetenzen, formen Strukturen und halten die Bank personell handlungsfähig. Heute folgt das etablierten Bahnen: funktionale Aufbauorganisation, feste Rollenprofile, Weiterbildung in klar abgegrenzten Formaten. Menschen und Strukturen sind das Fundament, auf dem alles andere steht.',
      en: 'Corporate Services and HR shape the organisation: they win talent, build capabilities, form structures and keep the workforce ready to act. Today this runs along established lines: a functional org design, fixed role profiles, training in clearly bounded formats. People and structures are the foundation on which everything else rests.',
      fr: 'Corporate Services et RH sont les architectes de l’organisation : ils attirent les talents, développent les compétences, façonnent les structures et maintiennent la banque en capacité d’agir sur le plan humain. Aujourd’hui, cela suit des voies établies : organisation fonctionnelle, profils de poste figés, formation dans des formats clairement délimités. Les personnes et les structures sont le socle sur lequel repose tout le reste.',
    },
    frage: {
      de: 'Was, wenn die wichtigste Kompetenz Ihrer Bank 2030 eine ist, für die es heute noch kein Stellenprofil gibt?',
      en: 'What if your bank’s most important capability in 2030 is one for which no job profile exists today?',
      fr: 'Et si la compétence la plus importante de votre banque en 2030 était une compétence pour laquelle aucune fiche de poste n’existe encore aujourd’hui ?',
    },
  },
  it: {
    rolle: {
      de: 'Die IT ist der Maschinenraum der Bank: Sie entwickelt, betreibt und sichert die Systeme, auf denen jedes Produkt und jeder Prozess läuft. Heute wird Software in geplanten Zyklen von Menschen gebaut, getestet und ausgerollt. Die IT setzt die Anforderungen der Fachbereiche um und wacht über Stabilität, Sicherheit und Kontrolle. Ohne sie steht die Bank still.',
      en: 'IT is the engine room of the bank: it builds, runs and secures the systems on which every product and process depends. Today software is built, tested and rolled out by people in planned cycles. IT implements the requirements of the business and guards stability, security and control. Without it, the bank stands still.',
      fr: 'L’IT est la salle des machines de la banque : elle développe, exploite et sécurise les systèmes sur lesquels reposent chaque produit et chaque processus. Aujourd’hui, le logiciel est conçu, testé et déployé par des humains selon des cycles planifiés. L’IT met en œuvre les besoins des métiers et veille à la stabilité, à la sécurité et au contrôle. Sans elle, la banque s’arrête.',
    },
    frage: {
      de: 'Wenn Software in Minuten entsteht statt in Monaten, wird die IT dann zum Engpass oder zum Taktgeber der Bank?',
      en: 'When software emerges in minutes rather than months, does IT become the bottleneck or the pacemaker of the bank?',
      fr: 'Si le logiciel naît en quelques minutes au lieu de plusieurs mois, l’IT devient-elle le goulet d’étranglement de la banque, ou celle qui lui donne le tempo ?',
    },
  },
  compliance: {
    rolle: {
      de: 'Compliance und Risk sind die Wächter der Bank: Sie sichern die regulatorische Konformität, steuern Risiken und schützen Integrität und Lizenz zum Geschäft. Heute wirkt diese Kontrolle überwiegend nachgelagert: über Prüfungen, Stichproben und klar getrennte Verteidigungslinien. Sie ist die Instanz, die dafür sorgt, dass Wachstum und Vertrauen zusammenpassen.',
      en: 'Compliance and Risk are the guardians of the bank: they secure regulatory conformity, steer risk and protect integrity and the licence to operate. Today this control works largely downstream: through reviews, sample checks and clearly separated lines of defence. They are the function that keeps growth and trust aligned.',
      fr: 'La fonction Conformité & Risques est la gardienne de la banque : elle garantit le respect de la réglementation, pilote les risques et protège l’intégrité ainsi que la licence d’exercer. Aujourd’hui, ce contrôle intervient surtout en aval : revues, contrôles par échantillonnage et lignes de défense clairement séparées. Elle est l’instance qui veille à ce que croissance et confiance aillent de pair.',
    },
    frage: {
      de: 'Wenn Entscheidungen in Millisekunden fallen, kann eine Kontrolle, die erst hinterher prüft, dann überhaupt noch schützen?',
      en: 'When decisions fall in milliseconds, can control that only checks after the fact still protect anything at all?',
      fr: 'Quand les décisions se prennent en quelques millisecondes, un contrôle qui ne vérifie qu’après coup peut-il encore protéger quoi que ce soit ?',
    },
  },
  projekt: {
    rolle: {
      de: 'Produkte und Innovation gestalten das Angebot der Bank: Sie entwickeln Produkte, definieren Konditionen und bringen neue Leistungen an den Markt. Heute entsteht das über standardisierte Kataloge für breite Kundensegmente: abgestimmt in Gremien, umgesetzt in der IT, geprüft von der Compliance. Ein einmal aufgesetztes Produkt trägt oft über Jahre.',
      en: 'Products & Innovation design what the bank offers: they develop products, define terms and bring new services to market. Today this happens through standardised catalogues for broad customer segments: aligned in committees, implemented in IT, checked by compliance. A product, once set up, often carries for years.',
      fr: 'La fonction Produits & Innovation façonne l’offre de la banque : elle développe les produits, fixe les conditions et lance de nouveaux services sur le marché. Aujourd’hui, cela passe par des catalogues standardisés destinés à de larges segments de clientèle : arbitrés en comités, mis en œuvre par l’IT, validés par la conformité. Un produit, une fois lancé, vit souvent des années.',
    },
    frage: {
      de: 'Was ist ein Produktkatalog noch wert, wenn die Bank für jeden Kunden ein eigenes Produkt bauen kann?',
      en: 'What is a product catalogue still worth once the bank can build a distinct product for every single customer?',
      fr: 'Que vaut encore un catalogue de produits quand la banque peut concevoir un produit propre à chaque client ?',
    },
  },
  vorstand: {
    rolle: {
      de: 'Der Vorstand steuert die Bank und trägt die letzte Verantwortung: Er setzt die Strategie, allokiert Kapital, gibt den Risikoappetit vor und steht für die Ergebnisse gerade. Heute entscheidet er auf Basis periodischer Berichte und in einem festen Jahreszyklus: verdichtete Kennzahlen, Quartalsstände, Erfahrung und Urteilskraft. Hier laufen alle Fäden zusammen.',
      en: 'The board steers the bank and carries ultimate accountability: it sets strategy, allocates capital, defines risk appetite and answers for the results. Today it decides on periodic reports and within a fixed annual cycle: condensed metrics, quarter-end figures, experience and judgement. This is where all the threads come together.',
      fr: 'La direction générale pilote la banque et en porte la responsabilité ultime : elle fixe la stratégie, alloue le capital, définit l’appétit au risque et répond des résultats. Aujourd’hui, elle décide sur la base de rapports périodiques et selon un cycle annuel fixe : indicateurs consolidés, arrêtés trimestriels, expérience et discernement. C’est ici que tous les fils se rejoignent.',
    },
    frage: {
      de: 'Wie steuert man ein Haus, das sich in Echtzeit bewegt, mit Zahlen von gestern?',
      en: 'How do you steer an institution that moves in real time with numbers from yesterday?',
      fr: 'Comment piloter un établissement qui bouge en temps réel avec les chiffres d’hier ?',
    },
  },
}

/** Raum-Detailbild je Kapitel (public/images/rooms/<id>.jpg) — ein 16:9-Aus-
 *  schnitt aus dem Strukturbild, erzeugt von produktion/strukturbild/raumbilder.py. */
export function einstiegImage(id: ChapterId): string {
  return `./images/rooms/${id}.jpg`
}

/** Hat dieses Kapitel eine Einstiegsbühne (alle Raum-Kapitel außer Aufzug)? */
export function hasEinstieg(id: ChapterId): id is Exclude<ChapterId, 'transformation'> {
  return id !== 'transformation'
}
