/**
 * Die Prozessschritte der Prüfstrecke, wie sie oben auf der Seite und im
 * Präsentationsmodus stehen. Eine Quelle, damit beide dieselbe Reihenfolge,
 * dieselben Titel und dieselben Icons zeigen.
 */

import { Inbox, Sparkles, FileSpreadsheet, ListChecks, CheckCircle2, Layers } from 'lucide-react'

export const PROZESS = [
  {
    id: 'eingang',
    nr: 1,
    titel: 'E-Mail-Eingang',
    kurz: 'Ein Maklerschreiben kommt als Freitext im Postfach an',
    Icon: Inbox
  },
  {
    id: 'strukturierung',
    nr: 2,
    titel: 'KI-Strukturierung',
    kurz: 'Die KI liest Mail und Anhang und füllt feste Felder',
    Icon: Sparkles
  },
  {
    id: 'deckblatt',
    nr: 3,
    titel: 'KI-Deckblatt',
    kurz: 'Alle Angaben in einem Formular, immer gleich aufgebaut',
    Icon: FileSpreadsheet
  },
  {
    id: 'pruefung',
    nr: 4,
    titel: 'Automatische Prüfung',
    kurz: 'Der Prüfkatalog läuft gegen Bestand und Vermittlerdaten',
    Icon: ListChecks
  },
  {
    id: 'abschluss',
    nr: 5,
    titel: 'Abschluss',
    kurz: 'Dunkelverarbeitung oder Aussteuerung an den Postkorb',
    Icon: CheckCircle2
  },
  {
    id: 'skalierung',
    nr: 6,
    titel: 'Alle Eingänge',
    kurz: 'Derselbe Weg für jeden Vorgang im Postfach',
    Icon: Layers
  }
]

/** Der Eingang, an dem der Präsentationsmodus die Strecke vorführt. */
export const DEMO_VORGANG_ID = 'BUE-2026-1055'
