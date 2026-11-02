// KI-Scoring, Einflussfaktoren und Handlungsempfehlung eines Falls.
//
// Das Legacy-Tool hatte diesen Block fest auf die Mueller-Akte verdrahtet
// (25 % / 60 %, „3 Lastschriftrückgaben", „Verstärkte Inkasso-Strategie") und
// zeigte ihn fuer jeden geoeffneten Kunden. Hier wird er aus der jeweiligen
// Akte abgeleitet, damit Scoring, Faktoren und Empfehlung zum Fall passen.

import { letzteZahlung } from './customerDetails.js';

const EMPFEHLUNG_JE_SEGMENT = {
  eskalation: {
    titel: 'Verstärkte Inkasso-Strategie',
    begruendung: 'Hohe Zahlungsfähigkeit bei niedriger Zahlungsbereitschaft — der Fall braucht Druck, keine Erleichterung.',
    schritte: [
      'Sofortige Eskalation der Inkasso-Maßnahmen',
      'Gerichtliches Mahnverfahren einleiten (14 Tage Frist)',
      'Parallele Verhandlung über einen Vergleich anbieten',
    ],
    erfolg: 72, zeitrahmen: '30–45 Tage', recoveryQuote: 0.25,
  },
  restrukturierung: {
    titel: 'Ratenplan und Stundung',
    begruendung: 'Hohe Zahlungsbereitschaft bei begrenzter Fähigkeit — eine tragfähige Rate erhält den Rückfluss.',
    schritte: [
      'Ratenplan über 24 Monate anbieten',
      'Zinsstundung für sechs Monate prüfen',
      'Haushaltsrechnung mit dem Kunden gemeinsam aktualisieren',
    ],
    erfolg: 68, zeitrahmen: '60–90 Tage', recoveryQuote: 0.61,
  },
  prioritaet: {
    titel: 'Schnelle Vereinbarung sichern',
    begruendung: 'Bereitschaft und Fähigkeit sind hoch — der Fall lässt sich kurzfristig ohne Eskalation schließen.',
    schritte: [
      'Zahlungszusage telefonisch bestätigen',
      'Flexible Rate anbieten und schriftlich fixieren',
      'Wiedervorlage zum zugesagten Zahlungstermin setzen',
    ],
    erfolg: 88, zeitrahmen: '7–14 Tage', recoveryQuote: 0.92,
  },
  abwicklung: {
    titel: 'Verwertung vorbereiten',
    begruendung: 'Weder Bereitschaft noch Fähigkeit tragen den Rückfluss — weitere Bearbeitungskosten lohnen nicht.',
    schritte: [
      'Sicherheiten bewerten und verwerten',
      'Forderungsverkauf im Paket prüfen',
      'Bei Aussichtslosigkeit Abschreibung zur Freigabe vorlegen',
    ],
    erfolg: 24, zeitrahmen: '90–180 Tage', recoveryQuote: 0.14,
  },
  stabil: {
    titel: 'Monitoring fortführen',
    begruendung: 'Der Fall bedient planmäßig — es besteht kein Handlungsbedarf über die Beobachtung hinaus.',
    schritte: [
      'Vertragsbedienung monatlich überwachen',
      'Frühwarnindikatoren aktiv lassen',
      'Bei Ratenausfall automatisch in die Segmentierung zurückführen',
    ],
    erfolg: 96, zeitrahmen: 'laufend', recoveryQuote: 1,
  },
  abgeschlossen: {
    titel: 'Fall geschlossen',
    begruendung: 'Die Forderung ist vollständig ausgeglichen — der Vorgang kann archiviert werden.',
    schritte: [
      'Vorgang archivieren und Akte schließen',
      'Lastschriftsperre und Mahnkennzeichen aufheben',
      'Bonität für Folgegeschäft im Vertrieb hinterlegen',
    ],
    erfolg: 100, zeitrahmen: 'abgeschlossen', recoveryQuote: 1,
  },
};

const FALLBACK = EMPFEHLUNG_JE_SEGMENT.restrukturierung;

/** Recovery-Score des Falls (dritter Ring neben Willingness und Ability). */
export function recoveryScore(customer) {
  const basis = EMPFEHLUNG_JE_SEGMENT[customer.segment] || FALLBACK;
  return Math.round(basis.recoveryQuote * 100);
}

export function buildScoring(customer) {
  const farbe = w => (w >= 70 ? '#10b981' : w >= 40 ? '#f59e0b' : '#ef4444');
  return [
    { label: 'Willingness', wert: customer.willingness, color: farbe(customer.willingness) },
    { label: 'Ability', wert: customer.ability, color: farbe(customer.ability) },
    { label: 'Recovery', wert: recoveryScore(customer), color: farbe(recoveryScore(customer)) },
  ];
}

/** Einflussfaktoren, abgeleitet aus Verzug, Rueckgaben, Branche und Historie. */
export function buildFaktoren(customer) {
  const faktoren = [];
  const ruecklaeufer = (customer.transaktionen || []).filter(t => t.status === 'rueckgabe').length;

  if (ruecklaeufer > 0) {
    faktoren.push({
      text: `${ruecklaeufer} ${ruecklaeufer === 1 ? 'Lastschriftrückgabe' : 'Lastschriftrückgaben'}`,
      punkte: -25,
    });
  }
  if (customer.dpd > 90) faktoren.push({ text: `${customer.dpd} Tage Verzug (Stage 3)`, punkte: -20 });
  else if (customer.dpd > 30) faktoren.push({ text: `${customer.dpd} Tage Verzug`, punkte: -10 });

  if (['Gastronomie', 'Einzelhandel', 'Baugewerbe'].includes(customer.branche)) {
    faktoren.push({ text: `Branchenrisiko: ${customer.branche}`, punkte: -15 });
  }
  if ((customer.einkommenMonatlich ?? 0) < (customer.ausgabenMonatlich ?? 0)) {
    faktoren.push({ text: 'Ausgaben übersteigen die Einnahmen', punkte: -15 });
  }

  const zahlung = letzteZahlung(customer);
  if (zahlung) {
    faktoren.push({ text: `Zahlungseingang ${zahlung.datum}`, punkte: 5 });
  }
  if (customer.willingness >= 70) faktoren.push({ text: 'Hohe Zahlungsbereitschaft', punkte: 10 });
  if (customer.rueckgabequote >= 70) faktoren.push({ text: 'Gute Rückzahlungsquote', punkte: 10 });
  if (!faktoren.some(f => f.punkte > 0)) {
    faktoren.push({ text: 'Langjährige Kundenbeziehung', punkte: 10 });
  }

  return faktoren;
}

export function buildEmpfehlung(customer) {
  const basis = EMPFEHLUNG_JE_SEGMENT[customer.segment] || FALLBACK;
  const erwartet = Math.round((customer.gesamtforderung || 0) * basis.recoveryQuote);
  // Konfidenz steigt mit der Eindeutigkeit der beiden Scores.
  const eindeutig = Math.abs(customer.willingness - 50) + Math.abs(customer.ability - 50);
  const konfidenz = Math.min(95, 60 + Math.round(eindeutig / 2));

  const fakten = [];
  if (customer.dpd > 0) fakten.push(`${customer.dpd} Tage Verzug`);
  if (customer.gesamtforderung > 0) fakten.push(`${customer.gesamtforderung.toLocaleString('de-DE')} EUR offen`);
  const rueckgaben = (customer.transaktionen || []).filter(t => t.status === 'rueckgabe').length;
  if (rueckgaben) fakten.push(`${rueckgaben} ${rueckgaben === 1 ? 'Lastschriftrückgabe' : 'Lastschriftrückgaben'}`);
  if (customer.mahnstufe > 0) fakten.push(`Mahnstufe ${customer.mahnstufe}`);
  const fallbezug = fakten.length ? ` Im konkreten Fall: ${fakten.join(', ')}.` : '';

  return {
    massnahme: basis.titel,
    konfidenz,
    begruendung: `${basis.begruendung}${fallbezug} (Willingness ${customer.willingness} %, Ability ${customer.ability} %.)`,
    schritte: basis.schritte,
    kennzahlen: [
      { label: 'Erfolgswahrscheinlichkeit', wert: `${basis.erfolg} %` },
      {
        label: 'Erwartete Recovery',
        wert: erwartet.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
      },
      { label: 'Zeitrahmen', wert: basis.zeitrahmen },
    ],
  };
}

/** Naechste Schritte als Kurzliste (Legacy: „Aktuelle Schritte"). */
export function buildSchritte(customer) {
  const basis = EMPFEHLUNG_JE_SEGMENT[customer.segment] || FALLBACK;
  const wann = ['Sofort', 'Diese Woche', 'Danach'];
  return basis.schritte.map((was, i) => ({ wann: wann[i] || 'Danach', was }));
}
