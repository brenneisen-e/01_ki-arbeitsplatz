// Schritte der Präsentation: ein geführter Durchlauf durch die echte
// Oberfläche, wie die Präsentationen in Bestandsübertragung und
// Provisionsreklamation, aber ohne eigene Szenen. Jeder Schritt navigiert
// über `betreten` an seine Stelle, `ziel` ist der Wert eines
// data-praes-Attributs, auf das sich das Spotlight legt.
//
// Zahlen und Namen kommen aus denselben Quellen wie die Oberfläche
// (`neueLeads`/`findeTopLead`, dieselbe Regel wie Assistent und Top-Lead-Badge).
import { findeTopLead, neueLeads } from '../../utils/topLead';

// Präsentation sendet „Meine neuen Leads“ nur einmal je Durchlauf, damit
// Vor- und Zurückblättern den Chat nicht mit Wiederholungen füllt.
const ASSISTENT_FRAGE = 'Meine neuen Leads';

function kontext(modeId) {
  return { n: neueLeads(modeId).length, top: findeTopLead(modeId) };
}

// Auf der Kundenakte öffnet sich der Assistent von selbst; in der Präsentation
// würde er die Akte verdecken.
function assistentZu() {
  setTimeout(() => window.dispatchEvent(new CustomEvent('kia-chatbot-close')), 300);
}

export const SCHRITTE = [
  {
    id: 'einstieg',
    titel: 'KI-Chat als Einstieg',
    unterzeile: 'Startseite des Arbeitsplatzes',
    ziel: 'landing-chat',
    betreten: ({ navigateTo }) => navigateTo('landing'),
    problem: () => [
      'Berater springen zwischen CRM, Bestandssystem und Postfach',
      'Wer etwas sucht, muss wissen, in welcher Maske es steht',
    ],
    loesung: () => 'Ein Eingabefeld für alles: Frage stellen oder Vorschlag wählen, der Arbeitsplatz führt direkt in die passende Ansicht.',
  },
  {
    id: 'tagesstart',
    titel: 'Tagesstart: die Agenten haben vorgearbeitet',
    unterzeile: 'Übersicht nach dem Nachtlauf',
    ziel: 'agenten',
    betreten: ({ navigateTo }) => navigateTo('overview', { tab: 'uebersicht' }),
    problem: () => [
      'Der Tag beginnt mit Listen: Termine, Aufgaben, Kampagnen',
      'Signale aus Bestand, Konto und Kommunikation gehen im Alltag unter',
    ],
    loesung: () => 'Über Nacht laufen KI-Agenten über Bestand, Termine und Aufgaben. Die Leiste zeigt, was sie gefunden haben; ein Klick springt zur Kachel.',
  },
  {
    id: 'assistent',
    titel: 'Vertriebsassistent: Meine neuen Leads',
    unterzeile: 'Antwortet aus denselben Daten wie die Oberfläche',
    ziel: 'assistent',
    betreten: ({ navigateTo, einmal }) => {
      navigateTo('overview', { tab: 'uebersicht' });
      // Erst nach dem Wechsel der Ansicht senden, sonst ist der Assistent
      // auf der Landing Page noch ausgeblendet.
      setTimeout(() => {
        if (einmal('assistent-frage')) {
          window.dispatchEvent(new CustomEvent('kia-chatbot-send', { detail: { message: ASSISTENT_FRAGE } }));
        } else {
          window.dispatchEvent(new CustomEvent('kia-chatbot-open'));
        }
        // Der Assistent setzt den Fokus in sein Eingabefeld; die Tastatur soll
        // aber weiter die Präsentation steuern.
        setTimeout(() => {
          if (document.activeElement?.closest?.('[data-praes="assistent"]')) document.activeElement.blur();
        }, 400);
      }, 350);
    },
    verlassen: () => window.dispatchEvent(new CustomEvent('kia-chatbot-close')),
    problem: () => [
      'Neue Leads verteilen sich auf viele Kunden und Quellen',
      'Welcher zuerst? Das entscheidet heute oft das Bauchgefühl',
    ],
    loesung: ({ modeId }) => {
      const { n, top } = kontext(modeId);
      const spitze = top ? ` An der Spitze steht ${top.kundeName}: der Lead mit den meisten unabhängigen Quellen.` : '';
      return `Eine Frage genügt: Der Assistent meldet ${n} neue Leads aus dem letzten Agentenlauf.${spitze}`;
    },
  },
  {
    id: 'akte',
    titel: 'Kundenakte: der Kunde auf einen Blick',
    unterzeile: ({ modeId }) => {
      const { top } = kontext(modeId);
      return top ? `${top.kundeName}, Reiter Stammdaten` : 'Reiter Stammdaten';
    },
    ziel: 'akte-kopf',
    betreten: ({ navigateTo, modeId }) => {
      const { top } = kontext(modeId);
      navigateTo('detail', { kundeId: top?.kundeId, tab: 'stammdaten' });
      assistentZu();
    },
    problem: () => [
      'Stammdaten, Verträge und Kommunikation liegen in getrennten Systemen',
      'Vor jedem Kontakt muss der Berater erst zusammensuchen',
    ],
    loesung: () => 'Die Akte bündelt alles an einer Stelle. Die KI-Zusammenfassung oben fasst Lage, Anlässe und Empfehlung in wenigen Sätzen.',
  },
  {
    id: 'leads',
    titel: 'Leads mit Herleitung',
    unterzeile: 'Reiter Leads, der Top-Lead aufgeklappt',
    ziel: 'top-lead',
    betreten: ({ navigateTo, modeId }) => {
      const { top } = kontext(modeId);
      navigateTo('detail', { kundeId: top?.kundeId, tab: 'impulse' });
      assistentZu();
    },
    // Herleitung aufklappen, sobald die Karte da ist.
    nachZiel: (el) => {
      if (el.dataset.expanded !== 'true') el.querySelector('[data-praes-toggle]')?.click();
    },
    problem: () => [
      'Ein Lead ohne Begründung überzeugt weder Berater noch Kunden',
      'Woher kommt das Signal, und wie belastbar ist es?',
    ],
    loesung: () => 'Jeder Lead nennt seine Quellen, aufgeklappt folgt die Herleitung mit Signalen, Kennzahlen und nächster Aktion. Das goldene Badge markiert den Top-Lead.',
  },
  {
    id: 'vorbereitung',
    titel: 'Gesprächsvorbereitung per Klick',
    unterzeile: 'Anstehende Termine in der Übersicht',
    ziel: 'termine',
    betreten: ({ navigateTo }) => navigateTo('overview', { tab: 'uebersicht' }),
    aktion: {
      label: 'Gesprächsvorbereitung öffnen',
      // Öffnet die Vorbereitung zum ersten Termin der Liste, wie ein Klick darauf.
      ausfuehren: () => document.querySelector('[data-praes="termine"] .row-hover')?.click(),
    },
    problem: () => [
      'Die Vorbereitung kostet vor jedem Termin Zeit',
      'Anlässe, Kennzahlen und offene Punkte stehen verstreut',
    ],
    loesung: () => 'Ein Klick auf einen Termin öffnet die KI-Gesprächsvorbereitung: Ausgangslage, Finanzübersicht, externe Verbindungen und Gesprächsleitfaden.',
  },
];
