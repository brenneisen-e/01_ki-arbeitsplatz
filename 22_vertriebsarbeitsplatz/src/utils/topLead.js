// Top-Lead: der belastbarste neue Lead eines Modus. Gemeinsame Regel für den
// KI-Vertriebsassistenten („Neuer Top-Lead“) und das Badge im Reiter Leads
// der Kundenakte, damit beide denselben Lead meinen.
import { getAllPotentiale } from '../data';

const PRIO_RANG = { kritisch: 5, sehr_hoch: 4, hoch: 3, mittel: 2, niedrig: 1 };

// Neue Leads sind die identifizierten Potenziale aus dem letzten Agentenlauf.
export function neueLeads(modeId) {
  return getAllPotentiale(modeId).filter(p => p.status === 'identifiziert');
}

// Die meisten unabhängigen Signale (Quellen) zuerst, dann Priorität, dann
// Volumen. Ein Lead, den Kontoumsätze, Bestand und Kommunikation gleichzeitig
// stützen, ist belastbarer als ein einzelnes Signal.
export function sortiereNachBelastbarkeit(potentiale) {
  return [...potentiale].sort((a, b) =>
    ((b.quellen || []).length - (a.quellen || []).length)
    || (PRIO_RANG[b.prioritaet] || 0) - (PRIO_RANG[a.prioritaet] || 0)
    || (b.volumen || 0) - (a.volumen || 0));
}

export function findeTopLead(modeId) {
  return sortiereNachBelastbarkeit(neueLeads(modeId))[0] || null;
}

// Potenziale der Kundenakte tragen keine kundeId; verglichen wird über Kunde
// und Titel, beide stammen aus denselben Datenobjekten.
export function istTopLead(potential, kundeId, topLead) {
  return !!topLead && topLead.kundeId === kundeId && topLead.titel === potential.titel;
}
