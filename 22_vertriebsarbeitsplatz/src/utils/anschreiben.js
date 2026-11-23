// Kunden-Anschreiben zu einem Lead (Fenster „KI-Anschreiben“, AnschreibenModal).
//
// Der Brief kommt aus dem Lead selbst, nie aus einem Stichwort im Titel
// (früher bekam jeder Lead mit „versicherung“ im Titel denselben Kfz-Brief).
// Drei Stufen, je nachdem, was der Lead in den Demo-Daten mitbringt:
//
//   anschreiben: { betreff, text, begruendung? }
//       der ganze Brieftext des Leads; Anrede und Gruß kommen dazu
//   anschreiben: { betreff, anlass, schluss?, begruendung? }
//       zwei, drei Sätze an den Kunden, worum es geht; den Schluss mit der
//       Terminfrage setzt der Rahmen, außer der Lead bringt einen eigenen mit
//       (ein abgebrochener Online-Antrag braucht kein „was das für Sie bedeutet“)
//   (kein Feld)
//       neutraler Brief ohne Einzelheiten: Titel und Kurztext eines Leads sind
//       für den Berater geschrieben („Bindungsgespräch (NPS Detractor)“) und
//       gehören nicht in einen Kundenbrief
//
// Die KI-Begründung über dem Brief ist für den Berater. Steht sie nicht am
// Lead, entsteht sie aus dessen Quellen, Kurztext und Empfehlung.
//
// Platzhalter ({{versicherungspartner}}, {{institut}}) löst das aktive
// Institut auf. Im Whitelabel laufen alle Texte durch den Namensfilter: das
// Textfeld des Briefs erreicht der Filter der Oberfläche nicht.
import { interpolateDynamicDates } from './dynamicDates';
import { quellenAufzaehlung, quellenNamen } from './quellen';
import { neutral } from './whitelabel';

const RAHMEN = {
  de: {
    neutralEinstieg: 'bei der Durchsicht Ihrer Unterlagen ist mir ein Punkt aufgefallen, den ich gerne persönlich mit Ihnen besprechen möchte.',
    neutralSchluss: 'Gerne erläutere ich Ihnen in einem kurzen Gespräch, worum es geht und welche Möglichkeiten es für Sie gibt. Passt Ihnen diese oder nächste Woche ein Termin, telefonisch oder bei uns vor Ort?',
    schluss: 'Gerne zeige ich Ihnen in einem kurzen Gespräch, was das für Sie bedeutet und welche Möglichkeiten es gibt. Passt Ihnen diese oder nächste Woche ein Termin, telefonisch oder bei uns vor Ort?',
    betreff: { versicherung: 'Ihre Absicherung – Vorschlag für ein kurzes Gespräch', banking: 'Ihre Finanzen – Vorschlag für ein kurzes Gespräch', sonst: 'Vorschlag für ein kurzes Gespräch' },
    gruss: 'Herzliche Grüße',
    signatur: 'Ihre Beraterin',
    zahl: ['', 'Ein', 'Zwei', 'Drei', 'Vier', 'Fünf'],
    signale: (zahl, liste) => `${zahl} unabhängige Signale: ${liste}.`,
    signal: (name) => `Quelle des Signals: ${name}.`,
    empfehlung: 'Empfehlung',
    produkt: 'Empfohlenes Produkt',
  },
  en: {
    neutralEinstieg: 'While reviewing your records, I noticed a point that I would like to discuss with you in person.',
    neutralSchluss: 'I would be glad to explain in a short conversation what it is about and which options you have. Would an appointment this week or next suit you, by phone or at our office?',
    schluss: 'I would be glad to show you in a short conversation what this means for you and which options you have. Would an appointment this week or next suit you, by phone or at our office?',
    betreff: { versicherung: 'Your cover – suggestion for a short conversation', banking: 'Your finances – suggestion for a short conversation', sonst: 'Suggestion for a short conversation' },
    gruss: 'Kind regards',
    signatur: 'Your advisor',
    zahl: ['', 'One', 'Two', 'Three', 'Four', 'Five'],
    signale: (zahl, liste) => `${zahl} independent signals: ${liste}.`,
    signal: (name) => `Source of the signal: ${name}.`,
    empfehlung: 'Recommendation',
    produkt: 'Recommended product',
  },
};

function slug(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
}

/**
 * Anrede des Kunden. Ohne Angabe zum Geschlecht bleibt sie neutral
 * („Guten Tag Anna Hoffmann“), statt aus dem Vornamen zu raten.
 */
export function anredeFuer(kunde, isEn = false) {
  const name = (kunde?.name || '').trim();
  const teile = name.split(/\s+/).filter(Boolean);
  const nachname = teile[teile.length - 1] || (isEn ? 'Customer' : 'Kunde');
  const titel = /^(Dr\.|Prof\.)$/.test(teile[0] || '') ? `${teile[0]} ` : '';
  const weiblich = /frau/i.test(kunde?.anrede || '') || kunde?.geschlecht === 'w';
  const maennlich = /herr/i.test(kunde?.anrede || '') || kunde?.geschlecht === 'm';
  if (isEn) {
    if (weiblich) return `Dear Ms ${titel}${nachname}`;
    if (maennlich) return `Dear Mr ${titel}${nachname}`;
    return name ? `Dear ${name}` : 'Dear customer';
  }
  if (weiblich) return `Sehr geehrte Frau ${titel}${nachname}`;
  if (maennlich) return `Sehr geehrter Herr ${titel}${nachname}`;
  return name ? `Guten Tag ${name}` : 'Guten Tag';
}

function begruendungAus(p, R) {
  const punkte = [];
  const namen = quellenNamen(p?.quellen);
  if (namen.length > 1) punkte.push(R.signale(R.zahl[namen.length] || namen.length, quellenAufzaehlung(p.quellen)));
  else if (namen.length === 1) punkte.push(R.signal(namen[0]));
  if (p?.beschreibung) punkte.push(p.beschreibung);
  const empfehlung = (p?.herleitung || []).find((h) => /^(Empfehlung|Recommendation)/i.test(h.label || ''));
  if (typeof empfehlung?.value === 'string') punkte.push(`${R.empfehlung}: ${empfehlung.value}`);
  else if (p?.produktEmpfehlung) punkte.push(`${R.produkt}: ${p.produktEmpfehlung}`);
  return punkte;
}

/**
 * Baut das Anschreiben zu einem Lead.
 *   signatur  { line1, line2 } aus den Berater-Stammdaten (AnschreibenModal)
 *   liefert   { betreff, text, begruendung, empfaenger, art }
 */
export function baueAnschreiben({ kunde, potential: p, institut = '', modeId = 'versicherung', signatur, isEn = false }) {
  const R = isEn ? RAHMEN.en : RAHMEN.de;
  const a = p?.anschreiben || null;
  const fertig = (text) => neutral(interpolateDynamicDates(text, { institut }), modeId);

  const gruss = [R.gruss, signatur?.line1 || R.signatur, signatur?.line2].filter(Boolean).join('\n');
  const rumpf = a?.text
    ? a.text
    : a?.anlass
      ? `${a.anlass}\n\n${a.schluss || R.schluss}`
      : `${R.neutralEinstieg}\n\n${R.neutralSchluss}`;
  const begruendung = a?.begruendung?.length ? a.begruendung : begruendungAus(p, R);

  return {
    art: a?.text ? 'text' : a?.anlass ? 'anlass' : 'neutral',
    betreff: fertig(a?.betreff || R.betreff[modeId] || R.betreff.sonst),
    text: fertig(`${anredeFuer(kunde, isEn)},\n\n${rumpf}\n\n${gruss}`),
    begruendung: begruendung.map(fertig),
    empfaenger: `${kunde?.name || ''} <${slug(kunde?.name || 'kunde')}@mail-demo.de>`,
  };
}
