/**
 * Die sechs Schritte der Provisionsreklamation, wie sie in der Prozessübersicht
 * und im Präsentationsmodus stehen. Eine Quelle, damit beide dieselbe
 * Reihenfolge, Titel und Texte zeigen.
 */

import { Send, Database, Calculator, Layers, MailCheck, LayoutDashboard } from 'lucide-react';

export const PROZESS = [
  { id: 'einreichen', nr: 1, Icon: Send, titel: 'Reklamation einreichen', kurz: 'Der Vermittler meldet die Abweichung strukturiert im Portal.' },
  { id: 'abgleich', nr: 2, Icon: Database, titel: 'Datenabgleich', kurz: 'Die KI zieht die Vertragsdaten aus dem Bestandssystem dazu.' },
  { id: 'berechnung', nr: 3, Icon: Calculator, titel: 'SOLL/IST-Berechnung', kurz: 'Jede Provisionsposition wird nachgerechnet.' },
  { id: 'muster', nr: 4, Icon: Layers, titel: 'Mustererkennung', kurz: 'Gleiche Fehlerbilder werden über Vorgänge hinweg erkannt.' },
  { id: 'antwort', nr: 5, Icon: MailCheck, titel: 'Antwort und Abschluss', kurz: 'Die Sachbearbeiterin prüft den Entwurf und gibt ihn frei.' },
  { id: 'gesamtbild', nr: 6, Icon: LayoutDashboard, titel: 'Gesamtbild', kurz: 'Alle Reklamationen priorisiert in einem Backoffice.' },
];

/** Der Vorgang, an dem die Präsentation die Strecke vorführt (Teil des Clusters T-FRV). */
export const DEMO_VORGANG_ID = 'RK-2026-0045';
