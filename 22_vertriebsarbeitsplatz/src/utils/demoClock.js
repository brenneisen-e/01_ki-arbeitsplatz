// Kleiner Demo-„Zeitmaschinen"-Helfer.
// Wenn die Uhr im Header angeklickt wurde, simulieren wir den nächsten Tag:
// Für Klaus Fischer wird eine zugesagte Termin-Aktivität für die kommende
// Woche erzeugt. Der Zustand wird in localStorage persistiert und per
// CustomEvent gebroadcastet, damit alle sichtbaren Komponenten re-rendern.

const FLAG_KEY = 'kia_demo_day_advanced';
export const DAY_ADVANCED_EVENT = 'kia:demo-day-advanced';

export function isDayAdvanced() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDayAdvanced(on) {
  if (typeof window === 'undefined') return;
  try {
    if (on) localStorage.setItem(FLAG_KEY, 'true');
    else localStorage.removeItem(FLAG_KEY);
  } catch {}
  window.dispatchEvent(new CustomEvent(DAY_ADVANCED_EVENT, { detail: { advanced: !!on } }));
}

export function resetDemoClock() {
  setDayAdvanced(false);
}

// Ermittelt ein Termin-Datum für "nächste Woche, Dienstag 10:30",
// basierend auf dem aktuellen Datum.
export function getSimulatedAppointment() {
  const now = new Date();
  // Nächster Dienstag (bevorzugt in 4–8 Tagen)
  const d = new Date(now);
  const daysUntilTuesday = ((2 - d.getDay() + 7) % 7) || 7; // Dienstag = 2
  d.setDate(d.getDate() + daysUntilTuesday + 7); // nächste Woche Dienstag
  d.setHours(10, 30, 0, 0);
  return d;
}

// Formatiertes Datum (de-DE) für die UI
export function formatAppointmentDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatAppointmentTime(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

// Die zusätzliche „Terminzusage"-Aktivität, die nach Weiterdrehen der Uhr
// oben in Klaus Fischers Aktivitätenliste einfließt.
export function buildKlausFischerAppointmentActivity() {
  const appointment = getSimulatedAppointment();
  return {
    id: 'demo-terminzusage-klaus-fischer',
    datum: new Date().toISOString().slice(0, 10),
    typ: 'termin',
    richtung: 'eingehend',
    betreff: 'Kunde hat Beratungstermin bestätigt',
    zusammenfassung: `Klaus Fischer hat für ${formatAppointmentDate(appointment)} um ${formatAppointmentTime(appointment)} Uhr dem Kreditgespräch zur Immobilienfinanzierung zugestimmt.`,
    appointmentAt: appointment.toISOString(),
    potentialTitel: 'Kreditgespräch Immobilienfinanzierung',
    istNeuZugestimmt: true,
  };
}

// Hook, der das Demo-Clock-Event abonniert und einen einfachen Boolean
// zurückgibt. Benutzung: const advanced = useDayAdvanced();
import { useEffect, useState } from 'react';

export function useDayAdvanced() {
  const [advanced, setAdvanced] = useState(() => isDayAdvanced());
  useEffect(() => {
    const handler = (e) => setAdvanced(!!e.detail?.advanced);
    window.addEventListener(DAY_ADVANCED_EVENT, handler);
    // Falls sich der Zustand im storage ändert (anderer Tab)
    const storageHandler = (e) => {
      if (e.key === FLAG_KEY) setAdvanced(e.newValue === 'true');
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(DAY_ADVANCED_EVENT, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);
  return advanced;
}
