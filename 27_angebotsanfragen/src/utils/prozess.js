/**
 * Die Schritte der Angebotsstrecke, wie sie oben auf der Seite und im
 * Präsentationsmodus stehen. Eine Quelle, damit beide dieselbe Reihenfolge,
 * dieselben Titel und dieselben Icons zeigen.
 */

import { Inbox, TextSearch, FileSpreadsheet, ListChecks, UserCheck, Layers } from 'lucide-react'
import { begriffe } from './branding'

const B = begriffe()

export const PROZESS = [
  {
    id: 'eingang', nr: 1, titel: 'E-Mail-Eingang',
    kurz: 'Eine Angebotsanfrage kommt als Freitext, Verlauf oder Formular im Postfach an',
    Icon: Inbox
  },
  {
    id: 'lesen', nr: 2, titel: 'KI liest',
    kurz: 'Mail und Anhänge werden gelesen; für jeden Wert ist die Fundstelle zu sehen',
    Icon: TextSearch
  },
  {
    id: 'deckblatt', nr: 3, titel: 'KI-Deckblatt',
    kurz: `Alle Angaben in der Reihenfolge, in der ${B.imSystem} erfasst wird`,
    Icon: FileSpreadsheet
  },
  {
    id: 'pruefung', nr: 4, titel: 'Prüfung',
    kurz: 'Was fehlt, was im eigenen Haus nachzuschlagen ist, was auffällt',
    Icon: ListChecks
  },
  {
    id: 'schritt', nr: 5, titel: 'Nächster Schritt',
    kurz: 'Rückfrage, Erfassung oder Fachspezialist, immer mit Freigabe',
    Icon: UserCheck
  },
  {
    id: 'alle', nr: 6, titel: 'Alle Eingänge',
    kurz: 'Derselbe Weg für jede Anfrage im Postfach',
    Icon: Layers
  }
]
