/**
 * immobilienPdf.js
 *
 * Druckt die Demo-Objektunterlagen einer Immobiliensicherheit als echte PDF
 * (jsPDF): Energieausweis, Mieterliste, Objekt-Cashflow,
 * Verkehrswertgutachten und Grundbuchauszug. Grundlage ist das Objektprofil
 * aus `immobilienProfil.js`.
 *
 * Die Dateien laufen beim Demo-Upload durch denselben Leseweg wie eine
 * hochgeladene Datei (pdf.js), die Werte werden also tatsächlich aus dem
 * PDF gelesen. Deshalb stehen Bezeichnung und Wert je Zeile nebeneinander.
 */

import { jsPDF } from 'jspdf';

const TEXT = [15, 23, 42];
const GRAU = [100, 116, 139];
const HELLGRAU = [148, 163, 184];
const LINIE = [203, 213, 225];
const PRIMAER = [27, 43, 75];
const FLAECHE = [241, 245, 249];

const zahl = (n, d = 0) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const euro = (n, d = 0) => `${zahl(n, d)} €`;
const datum = (iso) => {
  if (!iso) return '–';
  const [j, m, t] = iso.slice(0, 10).split('-');
  return `${t}.${m}.${j}`;
};
const heuteIso = () => new Date().toISOString().slice(0, 10);

const dateiTeil = (text) =>
  String(text)
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------

function neuesDokument(titel, orientation = 'portrait') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation });
  doc.setProperties({ title: titel, subject: 'Demo-Unterlage', creator: 'KI-Kreditanalyse' });
  return doc;
}

function kopf(doc, titel, zeile1, zeile2, x = 20) {
  const breite = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...TEXT);
  doc.text(titel, x, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAU);
  if (zeile1) doc.text(zeile1, x, 24);
  doc.setFontSize(8.5);
  if (zeile2) doc.text(zeile2, x, 29);
  doc.setDrawColor(...LINIE);
  doc.setLineWidth(0.4);
  doc.line(x, 32, breite - x, 32);
  return 40;
}

function abschnitt(doc, y, text, x = 20) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...PRIMAER);
  doc.text(text, x, y);
  doc.setDrawColor(...PRIMAER);
  doc.setLineWidth(0.5);
  doc.line(x, y + 1.6, x + 12, y + 1.6);
  return y + 8;
}

function feld(doc, y, label, wert, { x = 20, xWert = 88, fett = false, gross = false } = {}) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAU);
  doc.text(label, x, y);
  doc.setFont('helvetica', fett ? 'bold' : 'normal');
  doc.setFontSize(gross ? 11 : 9.5);
  doc.setTextColor(...TEXT);
  const breite = doc.internal.pageSize.getWidth() - 20 - xWert;
  const zeilen = doc.splitTextToSize(String(wert), breite);
  doc.text(zeilen, xWert, y);
  return y + 6.4 + (zeilen.length - 1) * 4.6;
}

function absatz(doc, y, text, { x = 20, groesse = 8.5, farbe = GRAU } = {}) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(groesse);
  doc.setTextColor(...farbe);
  const breite = doc.internal.pageSize.getWidth() - 2 * x;
  const zeilen = doc.splitTextToSize(text, breite);
  doc.text(zeilen, x, y);
  return y + zeilen.length * 4.2 + 2;
}

/** Fußzeile auf allen Seiten, erst am Ende, weil die Seitenzahl feststehen muss. */
function fusszeilen(doc, text, x = 20) {
  const seiten = doc.getNumberOfPages();
  const breite = doc.internal.pageSize.getWidth();
  const hoehe = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= seiten; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...LINIE);
    doc.setLineWidth(0.3);
    doc.line(x, hoehe - 14, breite - x, hoehe - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...HELLGRAU);
    doc.text(`${text} · Demo-Unterlage mit synthetischen Daten`, x, hoehe - 9);
    doc.text(`Seite ${i} von ${seiten}`, breite - x, hoehe - 9, { align: 'right' });
  }
}

// ---------------------------------------------------------------------------
// Energieausweis
// ---------------------------------------------------------------------------

const KLASSEN = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const KLASSEN_ENDE = [30, 50, 75, 100, 130, 160, 200, 250, 300];

function skala(doc, y, e) {
  const x0 = 20;
  const breite = 170;
  const max = e.gebaeude === 'Wohngebäude' ? 300 : 500;
  const pos = (wert) => x0 + (Math.min(wert, max) / max) * breite;

  // Balken in Graustufen, hell = effizient
  if (e.gebaeude === 'Wohngebäude') {
    let start = 0;
    KLASSEN_ENDE.forEach((ende, i) => {
      const grau = 236 - i * 17;
      doc.setFillColor(grau, grau + 2, grau + 4);
      doc.rect(pos(start), y, pos(ende) - pos(start), 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...(i > 4 ? [255, 255, 255] : TEXT));
      doc.text(KLASSEN[i], (pos(start) + pos(ende)) / 2, y + 4.8, { align: 'center' });
      start = ende;
    });
  } else {
    for (let i = 0; i < 10; i += 1) {
      const grau = 236 - i * 15;
      doc.setFillColor(grau, grau + 2, grau + 4);
      doc.rect(pos(i * 50), y, pos((i + 1) * 50) - pos(i * 50), 7, 'F');
    }
  }
  // Skalenwerte
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GRAU);
  const marken = e.gebaeude === 'Wohngebäude' ? [0, 50, 100, 150, 200, 250, 300] : [0, 100, 200, 300, 400, 500];
  marken.forEach((m) => doc.text(String(m), pos(m), y + 11, { align: 'center' }));
  // Markierung des Gebäudes
  const mx = pos(e.kennwert);
  doc.setFillColor(...PRIMAER);
  doc.triangle(mx - 2, y - 3.2, mx + 2, y - 3.2, mx, y - 0.4, 'F');
  return y + 18;
}

function druckeEnergieausweis(profil) {
  const e = profil.energie;
  const bedarf = e.ausweisart === 'Bedarfsausweis';
  const doc = neuesDokument(`Energieausweis ${profil.adresseText}`);
  let y = kopf(
    doc,
    `ENERGIEAUSWEIS für ${e.gebaeude}`,
    'gemäß den §§ 79 ff. Gebäudeenergiegesetz (GEG)',
    null
  );
  // Registriernummer und Gültigkeit in einer Zeile wie im Formular
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  doc.text(`Registriernummer: ${e.registriernummer}`, 20, 29);
  doc.setFont('helvetica', 'bold');
  doc.text(`Gültig bis: ${datum(e.gueltigBis)}`, 190, 29, { align: 'right' });

  y = abschnitt(doc, y, '1  Gebäude');
  y = feld(doc, y, 'Hauptnutzung / Gebäudekategorie', profil.kategorie);
  y = feld(doc, y, 'Adresse', profil.adresseText);
  y = feld(doc, y, 'Gebäudeteil', 'Gesamtgebäude');
  y = feld(doc, y, 'Baujahr Gebäude', String(profil.baujahr));
  y = feld(doc, y, 'Baujahr Wärmeerzeuger', String(e.baujahrWaerme));
  if (e.gebaeude === 'Wohngebäude') y = feld(doc, y, 'Anzahl der Wohnungen', String(e.wohnungen));
  y = feld(doc, y, e.flaecheLabel, `${zahl(e.flaeche)} m²`);
  y = feld(doc, y, 'Wesentliche Energieträger', e.traeger);
  y = feld(doc, y, 'Art des Ausweises', bedarf ? 'Bedarfsausweis (berechneter Energiebedarf)' : 'Verbrauchsausweis (erfasster Energieverbrauch)');
  y = feld(doc, y, 'Anlass der Ausstellung', 'Vermietung / Verkauf');
  y += 3;

  y = abschnitt(doc, y, '2  Energiekennwerte');
  y = feld(doc, y, `Endenergie${bedarf ? 'bedarf' : 'verbrauch'} dieses Gebäudes`, `${zahl(e.kennwert, 1)} kWh/(m²·a)`, { fett: true });
  y = feld(doc, y, `Primärenergie${bedarf ? 'bedarf' : 'verbrauch'} dieses Gebäudes`, `${zahl(e.primaer, 1)} kWh/(m²·a)`);
  if (e.gebaeude === 'Wohngebäude') y = feld(doc, y, 'Energieeffizienzklasse', e.klasse, { fett: true, gross: true });
  y = feld(doc, y, 'Treibhausgasemissionen', `${zahl(e.co2, 1)} kg CO2-Äquivalent/(m²·a)`);
  y += 6;
  y = skala(doc, y, e);
  if (e.gebaeude !== 'Wohngebäude') {
    y = absatz(doc, y, 'Für Nichtwohngebäude weist der Energieausweis keine Effizienzklasse aus. Die Skala zeigt den Endenergiekennwert des Gebäudes in kWh/(m²·a).');
  }
  y += 3;

  y = abschnitt(doc, y, '3  Aussteller');
  y = feld(doc, y, 'Aussteller', e.aussteller);
  feld(doc, y, 'Ausstellungsdatum', datum(e.ausgestellt));
  fusszeilen(doc, `Energieausweis ${e.registriernummer}`);
  return { doc, name: `Energieausweis_${dateiTeil(profil.lage.strasse)}.pdf` };
}

// ---------------------------------------------------------------------------
// Mieterliste
// ---------------------------------------------------------------------------

const SPALTEN = [
  { key: 'nr', titel: 'Nr.', x: 15 },
  { key: 'mieter', titel: 'Mieter', x: 30, max: 70 },
  { key: 'nutzung', titel: 'Nutzung', x: 104 },
  { key: 'lage', titel: 'Lage', x: 127, max: 26 },
  { key: 'flaeche', titel: 'Fläche m²', x: 172, rechts: true },
  { key: 'mieteMtl', titel: 'Miete mtl. €', x: 200, rechts: true },
  { key: 'mietePa', titel: 'Miete p.a. €', x: 230, rechts: true },
  { key: 'mietende', titel: 'Mietende', x: 238 },
  { key: 'hinweis', titel: 'Hinweis', x: 260, max: 22 },
];

function kuerze(doc, text, max) {
  if (!max || doc.getTextWidth(text) <= max) return text;
  let t = text;
  while (t.length > 3 && doc.getTextWidth(`${t}…`) > max) t = t.slice(0, -1);
  return `${t.trim()}…`;
}

function tabellenKopf(doc, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMAER);
  SPALTEN.forEach((s) => doc.text(s.titel, s.x, y, s.rechts ? { align: 'right' } : undefined));
  doc.setDrawColor(...PRIMAER);
  doc.setLineWidth(0.4);
  doc.line(15, y + 2, 282, y + 2);
  return y + 7.5;
}

function tabellenZeile(doc, y, werte, { fett = false, hinterlegt = false } = {}) {
  if (hinterlegt) {
    doc.setFillColor(...FLAECHE);
    doc.rect(15, y - 3.9, 267, 5.6, 'F');
  }
  doc.setFont('helvetica', fett ? 'bold' : 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT);
  SPALTEN.forEach((s) => {
    const wert = werte[s.key];
    if (wert == null || wert === '') return;
    doc.text(kuerze(doc, String(wert), s.max), s.x, y, s.rechts ? { align: 'right' } : undefined);
  });
  return y + 5.6;
}

function druckeMieterliste(profil) {
  const doc = neuesDokument(`Mieterliste ${profil.adresseText}`, 'landscape');
  const hoehe = doc.internal.pageSize.getHeight();
  const kopfzeilen = [
    `${profil.name} · ${profil.adresseText}`,
    `Stichtag: ${datum(profil.stichtag)} · Eigentümerin: ${profil.eigentuemer} · Verwaltung: ${profil.verwalter} · Beträge netto kalt in EUR`,
  ];
  kopf(doc, 'Mieterliste (Rent Roll)', kopfzeilen[0], kopfzeilen[1], 15);
  let y = tabellenKopf(doc, 38);

  profil.einheiten.forEach((e, i) => {
    if (y > hoehe - 22) {
      doc.addPage();
      kopf(doc, 'Mieterliste (Rent Roll) – Fortsetzung', kopfzeilen[0], kopfzeilen[1], 15);
      y = tabellenKopf(doc, 38);
    }
    y = tabellenZeile(doc, y, {
      nr: e.nr,
      mieter: e.mieter,
      nutzung: e.nutzung,
      lage: e.lage,
      flaeche: zahl(e.flaeche),
      mieteMtl: zahl(e.mieteMtl, 2),
      mietePa: zahl(e.mieteMtl * 12, 2),
      mietende: /^\d{4}-/.test(e.mietende) ? datum(e.mietende) : e.mietende || '–',
      hinweis: e.hinweis,
    }, { hinterlegt: i % 2 === 1 });
  });

  doc.setDrawColor(...LINIE);
  doc.setLineWidth(0.3);
  doc.line(15, y - 3.6, 282, y - 3.6);
  const summeMtl = profil.einheiten.reduce((s, e) => s + e.mieteMtl, 0);
  y = tabellenZeile(doc, y + 1, {
    mieter: 'Summe',
    flaeche: zahl(profil.flaeche),
    mieteMtl: zahl(summeMtl, 2),
    mietePa: zahl(summeMtl * 12, 2),
  }, { fett: true });

  if (y > hoehe - 70) {
    doc.addPage();
    kopf(doc, 'Mieterliste (Rent Roll) – Zusammenfassung', kopfzeilen[0], kopfzeilen[1], 15);
    y = 40;
  } else {
    y += 6;
  }
  y = abschnitt(doc, y, 'Zusammenfassung', 15);
  const leer = profil.einheiten.filter((e) => e.mieter === 'Leerstand').length;
  const opt = { x: 15, xWert: 82 };
  y = feld(doc, y, 'Gesamtmietfläche', `${zahl(profil.flaeche)} m²`, opt);
  y = feld(doc, y, 'Vermietete Fläche', `${zahl(profil.vermieteteFlaeche)} m²`, opt);
  y = feld(doc, y, 'Leerstandsfläche', `${zahl(profil.leerFlaeche)} m²`, opt);
  y = feld(doc, y, 'Leerstandsquote (Fläche)', `${zahl(profil.leerstandsquote, 1)} %`, { ...opt, fett: true });
  y = feld(doc, y, 'Anzahl Mieteinheiten', `${profil.einheiten.length}${leer ? ` (davon ${leer} leer)` : ''}`, opt);
  y = feld(doc, y, 'Jahresnettokaltmiete (Soll)', euro(profil.mieteSollPa, 2), { ...opt, fett: true });
  feld(doc, y, 'WALT (gewichtete Restlaufzeit)',
    profil.walt != null ? `${zahl(profil.walt, 1)} Jahre` : 'entfällt (keine befristeten Mietverträge)', opt);

  fusszeilen(doc, `Mieterliste zum ${datum(profil.stichtag)}`, 15);
  return { doc, name: `Mieterliste_${dateiTeil(profil.lage.strasse)}_Stichtag_${profil.stichtag}.pdf` };
}

// ---------------------------------------------------------------------------
// Objekt-Cashflow
// ---------------------------------------------------------------------------

function druckeCashflow(profil) {
  const cf = profil.cashflow;
  const doc = neuesDokument(`Objekt-Cashflow ${cf.jahr} ${profil.adresseText}`);
  let y = kopf(
    doc,
    `Objekt-Cashflow ${cf.jahr}`,
    `${profil.name} · ${profil.adresseText}`,
    `Bewirtschaftungsrechnung auf Ist-Basis · Geschäftsjahr ${cf.jahr} mit Vorjahr · Verwaltung: ${profil.verwalter}`
  );
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PRIMAER);
  doc.text('Position', 20, y);
  doc.text(`Ist ${cf.jahr}`, 150, y, { align: 'right' });
  doc.text(`Ist ${cf.jahr - 1}`, 188, y, { align: 'right' });
  doc.setDrawColor(...PRIMAER);
  doc.setLineWidth(0.4);
  doc.line(20, y + 2, 190, y + 2);
  y += 8;

  cf.zeilen.forEach((z) => {
    if (z.linie) {
      doc.setDrawColor(...LINIE);
      doc.setLineWidth(0.3);
      doc.line(20, y - 4.2, 190, y - 4.2);
    }
    doc.setFont('helvetica', z.fett ? 'bold' : 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT);
    doc.text(z.label, z.fett ? 20 : 24, y);
    doc.text(euro(z.ist), 150, y, { align: 'right' });
    doc.setTextColor(...GRAU);
    doc.text(euro(z.vj), 188, y, { align: 'right' });
    y += z.linie ? 8 : 6.6;
  });
  y += 4;

  y = abschnitt(doc, y, 'Kennzahlen');
  y = feld(doc, y, 'Bewirtschaftungskostenquote', `${zahl((cf.bewirtschaftung / cf.rohertrag) * 100, 1)} %`);
  y = feld(doc, y, 'Cashflow je m² Mietfläche', euro(cf.reinertrag / profil.flaeche, 2));
  y = feld(doc, y, 'Mietfläche', `${zahl(profil.flaeche)} m²`);
  y = feld(doc, y, `Leerstandsquote zum ${datum(profil.stichtag)}`, `${zahl(profil.leerstandsquote, 1)} %`);
  y += 2;
  absatz(doc, y, 'Der jährliche Cashflow entspricht dem Reinertrag des Objekts vor Kapitaldienst, Abschreibungen und Steuern. Umlagefähige Betriebskosten sind in Erträgen und Kosten nicht enthalten.');
  fusszeilen(doc, `Objekt-Cashflow ${cf.jahr}`);
  return { doc, name: `Objekt-Cashflow_${cf.jahr}_${dateiTeil(profil.lage.strasse)}.pdf` };
}

// ---------------------------------------------------------------------------
// Verkehrswertgutachten
// ---------------------------------------------------------------------------

function druckeGutachten(profil) {
  const g = profil.gutachten;
  const cf = profil.cashflow;
  const doc = neuesDokument(`Verkehrswertgutachten ${profil.adresseText}`);
  let y = kopf(
    doc,
    'Verkehrswertgutachten (Zusammenfassung)',
    'gemäß § 194 BauGB und Immobilienwertermittlungsverordnung (ImmoWertV)',
    `Aktenzeichen ${g.aktenzeichen} · Sachverständiger: ${g.gutachter}`
  );
  y = abschnitt(doc, y, 'Bewertungsobjekt');
  y = feld(doc, y, 'Objekt', profil.name);
  y = feld(doc, y, 'Adresse', profil.adresseText);
  y = feld(doc, y, 'Objektart', profil.kategorie);
  y = feld(doc, y, 'Baujahr', String(profil.baujahr));
  y = feld(doc, y, profil.nutzung === 'Wohnen' ? 'Wohnfläche' : 'Mietfläche', `${zahl(profil.flaeche)} m²`);
  y = feld(doc, y, 'Grundstücksfläche', `${zahl(g.grundstuecksflaeche)} m²`);
  y = feld(doc, y, 'Auftraggeber', profil.eigentuemer);
  y += 3;
  y = abschnitt(doc, y, 'Wertermittlung');
  y = feld(doc, y, 'Wertermittlungsstichtag', datum(g.stichtag));
  y = feld(doc, y, 'Wertermittlungsverfahren', g.verfahren);
  y = feld(doc, y, 'Rohertrag p.a.', euro(cf.rohertrag));
  y = feld(doc, y, 'Bewirtschaftungskosten p.a.', euro(cf.bewirtschaftung));
  y = feld(doc, y, 'Reinertrag p.a.', euro(cf.reinertrag));
  y = feld(doc, y, 'Liegenschaftszins', `${zahl(g.liegenschaftszins, 2)} %`);
  y = feld(doc, y, 'Restnutzungsdauer', `${g.restnutzungsdauer} Jahre`);
  y = feld(doc, y, 'Bodenwert', euro(g.bodenwert));
  y += 3;
  y = abschnitt(doc, y, 'Ergebnis');
  y = feld(doc, y, 'Verkehrswert (Marktwert)', euro(g.verkehrswert), { fett: true, gross: true });
  y += 2;
  y = absatz(doc, y, `Der Verkehrswert wurde zum Wertermittlungsstichtag ${datum(g.stichtag)} im ${g.verfahren} ermittelt und durch den Vergleich mit Kaufpreisen ähnlicher Objekte plausibilisiert. Das Gutachten umfasst 38 Seiten; diese Zusammenfassung gibt die wesentlichen Ergebnisse wieder.`);
  y += 4;
  feld(doc, y, 'Sachverständiger', `${g.gutachter}, öffentlich bestellter und vereidigter Sachverständiger für die Bewertung von bebauten und unbebauten Grundstücken`);
  fusszeilen(doc, `Verkehrswertgutachten ${g.aktenzeichen}`);
  return { doc, name: `Verkehrswertgutachten_${dateiTeil(profil.lage.strasse)}.pdf` };
}

// ---------------------------------------------------------------------------
// Grundbuchauszug
// ---------------------------------------------------------------------------

function druckeGrundbuch(profil) {
  const gb = profil.grundbuch;
  const doc = neuesDokument(`Grundbuch von ${gb.gemarkung} Blatt ${gb.blatt}`);
  let y = kopf(
    doc,
    `Grundbuch von ${gb.gemarkung} – Blatt ${gb.blatt}`,
    `Amtsgericht ${gb.amtsgericht} · unbeglaubigter Ausdruck aus dem maschinell geführten Grundbuch`,
    `Abruf: ${datum(heuteIso())}`
  );
  y = abschnitt(doc, y, 'Bestandsverzeichnis');
  y = feld(doc, y, 'Lfd. Nr. 1', `Gemarkung ${gb.gemarkung}, Flur ${gb.flur}, Flurstück ${gb.flurstueck}`);
  y = feld(doc, y, 'Wirtschaftsart und Lage', `Gebäude- und Freifläche, ${profil.lage.strasse}`);
  y = feld(doc, y, 'Größe', `${zahl(gb.groesse)} m²`);
  y += 3;
  y = abschnitt(doc, y, 'Erste Abteilung – Eigentümer');
  y = feld(doc, y, 'Lfd. Nr. 1', gb.eigentuemer);
  y += 3;
  y = abschnitt(doc, y, 'Zweite Abteilung – Lasten und Beschränkungen');
  y = absatz(doc, y, 'Keine Eintragungen', { groesse: 9, farbe: TEXT });
  y += 3;
  y = abschnitt(doc, y, 'Dritte Abteilung – Hypotheken, Grundschulden, Rentenschulden');
  if (gb.abt3.length === 0) {
    y = absatz(doc, y, 'Keine Eintragungen', { groesse: 9, farbe: TEXT });
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...PRIMAER);
    doc.text('Lfd. Nr.', 20, y);
    doc.text('Betrag', 70, y, { align: 'right' });
    doc.text('Eintragung', 78, y);
    y += 6;
    gb.abt3.forEach((e) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...TEXT);
      doc.text(String(e.nr), 20, y);
      doc.text(`${zahl(e.betrag, 2)} EUR`, 70, y, { align: 'right' });
      const text = doc.splitTextToSize(
        `Grundschuld ohne Brief für ${e.glaeubiger}; 15 % Jahreszinsen; sofort vollstreckbar nach § 800 ZPO.`,
        112
      );
      doc.text(text, 78, y);
      y += 5 + text.length * 4.4;
    });
    y += 1;
    y = feld(doc, y, 'Summe der eingetragenen Grundpfandrechte', `${zahl(gb.summe, 2)} EUR`, { fett: true, xWert: 100 });
  }
  y += 4;
  absatz(doc, y, 'Dieser Ausdruck wurde maschinell erstellt und ist ohne Unterschrift gültig. Er gibt den Stand zum Zeitpunkt des Abrufs wieder.');
  fusszeilen(doc, `Grundbuch von ${gb.gemarkung} Blatt ${gb.blatt}`);
  return { doc, name: `Grundbuchauszug_${dateiTeil(gb.amtsgericht)}_Blatt_${gb.blatt}.pdf` };
}

// ---------------------------------------------------------------------------
// Öffentliche Schnittstelle
// ---------------------------------------------------------------------------

const DRUCKER = {
  energieausweis: druckeEnergieausweis,
  mieterliste: druckeMieterliste,
  cashflow: druckeCashflow,
  gutachten: druckeGutachten,
  grundbuch: druckeGrundbuch,
};

/**
 * Erzeugt eine Demo-Unterlage als PDF im Speicher.
 * @returns {{ name: string, bytes: ArrayBuffer }}
 */
export function erzeugeDemoUnterlage(typ, profil) {
  const { doc, name } = DRUCKER[typ](profil);
  return { name, bytes: doc.output('arraybuffer') };
}

/** Lädt eine Demo-Unterlage als PDF herunter. */
export function ladeDemoUnterlageHerunter(typ, profil) {
  const { doc, name } = DRUCKER[typ](profil);
  doc.save(name);
}
