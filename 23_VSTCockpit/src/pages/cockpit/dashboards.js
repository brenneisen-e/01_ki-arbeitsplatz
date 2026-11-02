// ═══════════════════════════════════════════════════════════════
// VST Cockpit – KI-Dashboards
// Jede Frage des Assistenten baut ein Dashboard aus denselben Daten wie das
// Cockpit (Monatsdaten inkl. Live-Abschlüssen, Bundesländer, Vermittler) und
// dem Live-Strom. Nichts ist fest eingetragen: Zahlen, Rangfolgen und die
// KI-Einschätzung werden bei jedem Aufruf neu gerechnet, angeheftete
// Dashboards laufen deshalb live mit.
// ═══════════════════════════════════════════════════════════════
import { BUNDESLAND_DATA, ALL_VERMITTLER, VERTRIEBSWEG_VERTEILUNG } from './cockpitData';
import { euroKompakt, prozent, zahl, KATEGORIE_FARBE, FARBE } from './format';

export const FRAGEN = [
  { id: 'plan', gruppe: 'Steuerung', icon: 'Target', frage: 'Wie liegen wir beim Neugeschäft gegen Plan?', stichworte: ['plan', 'ziel', 'soll', 'hochrechnung', 'neugeschäft', 'neugeschaeft'] },
  { id: 'wege', gruppe: 'Steuerung', icon: 'GitBranch', frage: 'Wie schneiden die Vertriebswege ab?', stichworte: ['vertriebsweg', 'kanal', 'makler', 'ausschließlichkeit', 'banken', 'direkt'] },
  { id: 'top', gruppe: 'Steuerung', icon: 'Trophy', frage: 'Wer sind unsere Top 10 Agenturen?', stichworte: ['top', 'beste', 'ranking', 'rangliste', 'stärkste'] },
  { id: 'storno', gruppe: 'Risiko', icon: 'TrendingDown', frage: 'Wo steigt das Storno, und bei wem?', stichworte: ['storno', 'kündig', 'abwander', 'verlust'] },
  { id: 'aufmerksamkeit', gruppe: 'Risiko', icon: 'AlertTriangle', frage: 'Welche Agenturen brauchen diese Woche Aufmerksamkeit?', stichworte: ['aufmerksam', 'kümmern', 'ansprechen', 'woche', 'auffällig', 'handlungsbedarf', 'problem'] },
  { id: 'heute', gruppe: 'Live', icon: 'Radio', frage: 'Was ist heute bisher reingekommen?', stichworte: ['heute', 'live', 'reingekommen', 'eingang', 'eingänge', 'tag', 'aktuell', 'gerade'] },
  { id: 'profit', gruppe: 'Ergebnis', icon: 'Percent', frage: 'Wie entwickelt sich die Profitabilität?', stichworte: ['profit', 'ergebnis', 'combined', 'deckungsbeitrag', 'marge', 'rentab', 'kosten'] },
  { id: 'regionen', gruppe: 'Ergebnis', icon: 'Map', frage: 'In welchen Regionen wachsen wir am stärksten?', stichworte: ['region', 'bundesland', 'wachs', 'länder', 'karte', 'regional'] },
];

export const FRAGE_NACH_ID = Object.fromEntries(FRAGEN.map(f => [f.id, f]));

/** Freitext auf eine Frage abbilden (meiste Stichwort-Treffer gewinnt). */
export function erkenneFrage(text) {
  const t = text.toLowerCase();
  let beste = null;
  let treffer = 0;
  for (const f of FRAGEN) {
    const n = f.stichworte.filter(w => t.includes(w)).length;
    if (n > treffer) { beste = f; treffer = n; }
  }
  return beste;
}

const summe = (liste, f) => liste.reduce((s, x) => s + (typeof f === 'function' ? f(x) : x[f] || 0), 0);
const schnitt = (liste, f) => (liste.length ? summe(liste, f) / liste.length : 0);
const vorzeichen = (v, fmt) => `${v >= 0 ? '+' : '−'}${fmt(Math.abs(v))}`;

// ── Dashboards ───────────────────────────────────────────────

function plan({ monate, live }) {
  const reihe = monate.map(m => ({ name: m.month, Ist: m.neugeschaeft, Plan: m.planNeugeschaeft, abw: m.neugeschaeft - m.planNeugeschaeft }));
  const ist = summe(reihe, 'Ist');
  const soll = summe(reihe, 'Plan');
  const quote = (ist / soll) * 100;
  const lauf = reihe[reihe.length - 1];
  const laufQuote = (lauf.Ist / lauf.Plan) * 100;
  const mitQuote = reihe.map(r => ({ ...r, q: (r.Ist / r.Plan - 1) * 100 }));
  const bester = [...mitQuote].sort((a, b) => b.q - a.q)[0];
  const schwaechster = [...mitQuote].sort((a, b) => a.q - b.q)[0];
  const ueber = mitQuote.filter(r => r.q >= 0).length;

  return {
    titel: 'Neugeschäft gegen Plan',
    untertitel: 'Letzte 12 Monate, laufender Monat inklusive Live-Abschlüssen',
    schritte: [
      `Neugeschäft der letzten ${reihe.length} Monate lesen`,
      'Plan je Monat aus der Saisonkurve ableiten',
      'Abweichungen je Monat bewerten',
      'Live-Abschlüsse des laufenden Monats einrechnen',
    ],
    widgets: [
      { typ: 'kpi', breite: 3, titel: 'Neugeschäft 12 Monate', wert: ist, format: 'euro', unter: `Plan ${euroKompakt(soll)}` },
      { typ: 'kpi', breite: 3, titel: 'Zielerreichung', wert: quote, format: 'prozent', unter: `${vorzeichen(ist - soll, euroKompakt)} gegen Plan`, ton: quote >= 100 ? 'gut' : 'schlecht' },
      { typ: 'kpi', breite: 3, titel: `Laufender Monat (${lauf.name})`, wert: lauf.Ist, format: 'euro', unter: `${prozent(laufQuote)} des Monatsplans`, ton: laufQuote >= 100 ? 'gut' : 'schlecht', live: true },
      { typ: 'kpi', breite: 3, titel: 'Live seit Öffnen', wert: live.seitStart.ng, format: 'euro', unter: `${zahl(live.seitStart.abschluesse)} Abschlüsse`, live: true },
      { typ: 'verlauf', breite: 8, titel: 'Ist gegen Plan je Monat', daten: reihe, reihen: [
        { key: 'Ist', farbe: FARBE.modusHell, flaeche: true },
        { key: 'Plan', farbe: FARBE.gold, gestrichelt: true },
      ], format: 'euro' },
      { typ: 'einschaetzung', breite: 4, titel: 'KI-Einschätzung', punkte: [
        `Zielerreichung über 12 Monate: **${prozent(quote)}** (${vorzeichen(ist - soll, euroKompakt)}).`,
        `In ${ueber} von ${reihe.length} Monaten lag das Neugeschäft über Plan.`,
        `Stärkster Monat **${bester.name}** (${vorzeichen(bester.q, v => prozent(v))}), schwächster **${schwaechster.name}** (${vorzeichen(schwaechster.q, v => prozent(v))}).`,
        `Der laufende Monat steht bei **${prozent(laufQuote)}** des Plans; seit dem Öffnen kamen ${euroKompakt(live.seitStart.ng)} live dazu.`,
      ] },
      { typ: 'abweichung', breite: 12, titel: 'Abweichung zum Plan je Monat', daten: reihe.map(r => ({ name: r.name, wert: r.abw })), format: 'euro' },
    ],
    zusammenfassung: `Über die letzten 12 Monate erreichen wir ${prozent(quote)} des Plans (${vorzeichen(ist - soll, euroKompakt)}). Der laufende Monat ${lauf.name} steht bei ${prozent(laufQuote)}, die Live-Abschlüsse laufen mit ein.`,
    folgefragen: ['wege', 'storno', 'heute'],
  };
}

function wege({ monate, live }) {
  const ng12 = summe(monate, 'neugeschaeft');
  const heute = Object.fromEntries(live.jeVertriebsweg.map(w => [w.name, w]));
  const zeilen = VERTRIEBSWEG_VERTEILUNG.map(w => ({
    name: w.name,
    anteil: w.value,
    ng: Math.round(ng12 * w.value / 100),
    heuteNg: heute[w.name]?.ng || 0,
    heuteAbschl: heute[w.name]?.abschluesse || 0,
    heuteStorni: heute[w.name]?.storni || 0,
  }));
  const heuteGesamt = summe(zeilen, 'heuteNg') || 1;
  const mitHeute = zeilen.map(z => ({ ...z, heuteAnteil: (z.heuteNg / heuteGesamt) * 100 }));
  const fuehrend = [...mitHeute].sort((a, b) => b.heuteNg - a.heuteNg)[0];
  const ueberAnteil = [...mitHeute].sort((a, b) => (b.heuteAnteil - b.anteil) - (a.heuteAnteil - a.anteil))[0];

  return {
    titel: 'Vertriebswege im Vergleich',
    untertitel: 'Anteil am Neugeschäft der letzten 12 Monate und heute live',
    schritte: ['Neugeschäft je Vertriebsweg zuordnen', 'Heutige Abschlüsse nach Weg gruppieren', 'Anteile vergleichen', 'Dashboard aufbauen'],
    widgets: [
      ...mitHeute.map(z => ({ typ: 'kpi', breite: 3, titel: z.name, wert: z.ng, format: 'euro', unter: `${prozent(z.anteil, 0)} Anteil · heute ${zahl(z.heuteAbschl)} Abschlüsse`, farbe: KATEGORIE_FARBE[z.name] })),
      { typ: 'donut', breite: 4, titel: 'Anteil Neugeschäft 12 Monate', daten: mitHeute.map(z => ({ name: z.name, wert: z.ng, farbe: KATEGORIE_FARBE[z.name] })), format: 'euro' },
      { typ: 'rangliste', breite: 4, titel: 'Neugeschäft heute je Weg', daten: [...mitHeute].sort((a, b) => b.heuteNg - a.heuteNg).map(z => ({ name: z.name, wert: z.heuteNg, zusatz: `${zahl(z.heuteAbschl)} Abschl.`, farbe: KATEGORIE_FARBE[z.name] })), format: 'euro', live: true },
      { typ: 'einschaetzung', breite: 4, titel: 'KI-Einschätzung', punkte: [
        `Die Ausschließlichkeit trägt **${prozent(zeilen[0].anteil, 0)}** des Neugeschäfts (${euroKompakt(zeilen[0].ng)} in 12 Monaten).`,
        `Heute führt **${fuehrend.name}** mit ${euroKompakt(fuehrend.heuteNg)} aus ${zahl(fuehrend.heuteAbschl)} Abschlüssen.`,
        `Über seinem Jahresanteil liegt heute **${ueberAnteil.name}**: ${prozent(ueberAnteil.heuteAnteil, 0)} statt ${prozent(ueberAnteil.anteil, 0)}.`,
      ] },
    ],
    zusammenfassung: `Die Ausschließlichkeit bleibt mit ${prozent(zeilen[0].anteil, 0)} der größte Weg. Heute liegt ${fuehrend.name} vorn, ${ueberAnteil.name} schneidet über seinem üblichen Anteil ab.`,
    folgefragen: ['top', 'heute', 'plan'],
  };
}

function top({ live }) {
  const alle = ALL_VERMITTLER;
  const zehn = alle.slice(0, 10);
  const anteil = (summe(zehn, 'neugeschaeft') / summe(alle, 'neugeschaeft')) * 100;
  const heute = Object.fromEntries(live.jeVermittler.map(v => [v.name, v]));
  const stornoTop = schnitt(zehn, 'storno');
  const stornoAlle = schnitt(alle, 'storno');
  const auffaellig = zehn.filter(v => v.storno > 4.5);

  return {
    titel: 'Top 10 Agenturen',
    untertitel: `Nach Neugeschäft, ${zahl(alle.length)} Agenturen im Vergleich`,
    schritte: [`${zahl(alle.length)} Agenturen nach Neugeschäft sortieren`, 'Bestand, Storno und NPS zuordnen', 'Heutige Abschlüsse je Agentur ergänzen', 'Dashboard aufbauen'],
    widgets: [
      { typ: 'kpi', breite: 3, titel: 'Anteil Top 10 am Neugeschäft', wert: anteil, format: 'prozent', unter: `${euroKompakt(summe(zehn, 'neugeschaeft'))} von ${euroKompakt(summe(alle, 'neugeschaeft'))}` },
      { typ: 'kpi', breite: 3, titel: 'Ø Stornoquote Top 10', wert: stornoTop, format: 'prozent', unter: `alle Agenturen ${prozent(stornoAlle)}`, ton: stornoTop <= stornoAlle ? 'gut' : 'schlecht' },
      { typ: 'kpi', breite: 3, titel: 'Ø NPS Top 10', wert: schnitt(zehn, 'nps'), format: 'zahl1', unter: `alle Agenturen ${schnitt(alle, 'nps').toLocaleString('de-DE', { maximumFractionDigits: 1 })}` },
      { typ: 'kpi', breite: 3, titel: 'Heute live (Top 10)', wert: summe(zehn, v => heute[v.name]?.ng || 0), format: 'euro', unter: `${zahl(summe(zehn, v => heute[v.name]?.abschluesse || 0))} Abschlüsse`, live: true },
      { typ: 'rangliste', breite: 5, titel: 'Neugeschäft 12 Monate', daten: zehn.map(v => ({ name: v.name, wert: v.neugeschaeft, zusatz: v.bundesland })), format: 'euro' },
      { typ: 'tabelle', breite: 7, titel: 'Kennzahlen je Agentur', spalten: [
        { key: 'name', label: 'Agentur' }, { key: 'region', label: 'Region' },
        { key: 'bestand', label: 'Bestand', format: 'euro', rechts: true },
        { key: 'storno', label: 'Storno', format: 'prozent', rechts: true, warnAb: 4.5 },
        { key: 'nps', label: 'NPS', rechts: true },
        { key: 'heute', label: 'Heute', rechts: true, live: true },
      ], zeilen: zehn.map(v => ({ ...v, heute: heute[v.name]?.abschluesse || 0 })) },
      { typ: 'einschaetzung', breite: 12, titel: 'KI-Einschätzung', punkte: [
        `Die Top 10 bringen **${prozent(anteil)}** des Neugeschäfts, bei einer Stornoquote von ${prozent(stornoTop)} (alle: ${prozent(stornoAlle)}).`,
        auffaellig.length
          ? `Storno über 4,5 % bei ${auffaellig.map(v => `**${v.name}**`).join(', ')}: Bestandsgespräch einplanen.`
          : 'Keine der Top 10 liegt beim Storno über 4,5 %.',
        `Spitzenreiter ist **${zehn[0].name}** (${zehn[0].bundesland}) mit ${euroKompakt(zehn[0].neugeschaeft)} Neugeschäft.`,
      ] },
    ],
    zusammenfassung: `Die Top 10 Agenturen tragen ${prozent(anteil)} des Neugeschäfts. ${auffaellig.length ? `${auffaellig.length} davon liegen beim Storno über 4,5 %.` : 'Beim Storno ist keine auffällig.'}`,
    folgefragen: ['aufmerksamkeit', 'regionen', 'storno'],
  };
}

function storno({ monate, live }) {
  const reihe = monate.map(m => ({ name: m.month, Stornoquote: m.storno }));
  const aktuell = reihe[reihe.length - 1].Stornoquote;
  const vormonat = reihe[reihe.length - 2].Stornoquote;
  const mittel = schnitt(reihe, 'Stornoquote');
  const laender = [...BUNDESLAND_DATA].sort((a, b) => b.storno - a.storno);
  const landSchnitt = schnitt(laender, 'storno');
  const ueber = laender.filter(l => l.storno > landSchnitt);
  const vm = [...ALL_VERMITTLER].sort((a, b) => b.storno - a.storno).slice(0, 8)
    .map(v => ({ ...v, gefaehrdet: Math.round(v.bestand * v.storno / 100) }));
  const pp = (v) => `${v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Pp.`;

  return {
    titel: 'Storno: Entwicklung und Brennpunkte',
    untertitel: 'Stornoquote 12 Monate, Bundesländer und Agenturen',
    schritte: ['Stornoquote der letzten 12 Monate lesen', '16 Bundesländer gegen den Länderschnitt stellen', `${zahl(ALL_VERMITTLER.length)} Agenturen nach Storno sortieren`, 'Gefährdeten Bestand schätzen'],
    widgets: [
      { typ: 'kpi', breite: 3, titel: `Stornoquote ${reihe[reihe.length - 1].name}`, wert: aktuell, format: 'prozent', unter: `${vorzeichen(aktuell - vormonat, pp)} zum Vormonat`, ton: aktuell <= vormonat ? 'gut' : 'schlecht' },
      { typ: 'kpi', breite: 3, titel: 'Ø 12 Monate', wert: mittel, format: 'prozent', unter: `Schwelle 5,0 %, ${reihe.filter(r => r.Stornoquote > 5).length} Monate darüber` },
      { typ: 'kpi', breite: 3, titel: 'Länder über dem Schnitt', wert: ueber.length, format: 'zahl', unter: `Länderschnitt ${prozent(landSchnitt)}`, ton: 'schlecht' },
      { typ: 'kpi', breite: 3, titel: 'Storni heute', wert: live.heute.storni, format: 'zahl', unter: `${euroKompakt(live.heute.stornoBeitrag)} Jahresbeitrag`, live: true, ton: 'schlecht' },
      { typ: 'verlauf', breite: 7, titel: 'Stornoquote je Monat', daten: reihe, reihen: [{ key: 'Stornoquote', farbe: FARBE.schlecht, flaeche: true }], format: 'prozent', referenz: { wert: 5, label: 'Schwelle 5,0 %' } },
      { typ: 'rangliste', breite: 5, titel: 'Bundesländer nach Stornoquote', basis: Math.floor((laender[laender.length - 1].storno - 0.3) * 10) / 10, daten: laender.slice(0, 8).map(l => ({ name: l.name, wert: l.storno, farbe: l.storno > landSchnitt ? FARBE.schlecht : FARBE.modusHell })), format: 'prozent' },
      { typ: 'tabelle', breite: 8, titel: 'Agenturen mit der höchsten Stornoquote', spalten: [
        { key: 'name', label: 'Agentur' }, { key: 'bundesland', label: 'Bundesland' },
        { key: 'storno', label: 'Storno', format: 'prozent', rechts: true, warnAb: 4.5 },
        { key: 'bestand', label: 'Bestand', format: 'euro', rechts: true },
        { key: 'gefaehrdet', label: 'Gefährdet p. a.', format: 'euro', rechts: true },
      ], zeilen: vm },
      { typ: 'einschaetzung', breite: 4, titel: 'KI-Einschätzung', punkte: [
        `Die Quote steht bei **${prozent(aktuell)}**, ${aktuell > vormonat ? 'steigend' : 'fallend'} zum Vormonat (Ø 12 Monate ${prozent(mittel)}).`,
        `Über dem Länderschnitt von ${prozent(landSchnitt)} liegen **${ueber.slice(0, 3).map(l => l.name).join(', ')}**${ueber.length > 3 ? ` und ${ueber.length - 3} weitere` : ''}.`,
        `Höchste Quote bei **${vm[0].name}** (${vm[0].bundesland}, ${prozent(vm[0].storno)}); gefährdet sind rund ${euroKompakt(vm[0].gefaehrdet)} Bestand im Jahr.`,
      ] },
    ],
    zusammenfassung: `Die Stornoquote liegt bei ${prozent(aktuell)} und ${aktuell > vormonat ? 'steigt' : 'fällt'} gegenüber dem Vormonat. Brennpunkte sind ${ueber.slice(0, 2).map(l => l.name).join(' und ')}; die Agenturen mit der höchsten Quote stehen in der Tabelle.`,
    folgefragen: ['aufmerksamkeit', 'regionen', 'profit'],
  };
}

const SIGNALE = {
  storno: { label: 'Storno hoch', empfehlung: 'Bestandsgespräch zu Stornogründen' },
  nps: { label: 'NPS niedrig', empfehlung: 'Service-Feedback auswerten' },
  aktivitaet: { label: 'Wenig Abschlüsse', empfehlung: 'Aktivitätsplan vereinbaren' },
};

function aufmerksamkeit() {
  const mitSignalen = ALL_VERMITTLER.map(v => {
    const s = [];
    if (v.storno > 4.5) s.push('storno');
    if (v.nps < 40) s.push('nps');
    if (v.abschluesse < 15) s.push('aktivitaet');
    return { ...v, signale: s };
  }).filter(v => v.signale.length)
    .sort((a, b) => b.signale.length - a.signale.length || b.bestand - a.bestand);
  const mehrfach = mitSignalen.filter(v => v.signale.length >= 2);
  const zaehl = Object.keys(SIGNALE).map(k => ({ name: SIGNALE[k].label, wert: mitSignalen.filter(v => v.signale.includes(k)).length, farbe: k === 'storno' ? FARBE.schlecht : k === 'nps' ? FARBE.warn : FARBE.gold }));

  return {
    titel: 'Agenturen mit Handlungsbedarf',
    untertitel: 'Signale aus Storno, NPS und Abschlussaktivität',
    schritte: [`${zahl(ALL_VERMITTLER.length)} Agenturen auf Storno über 4,5 % prüfen`, 'NPS unter 40 markieren', 'Abschlussaktivität bewerten', 'Nach Signalen und Bestand priorisieren'],
    widgets: [
      { typ: 'kpi', breite: 4, titel: 'Agenturen mit Signal', wert: mitSignalen.length, format: 'zahl', unter: `von ${zahl(ALL_VERMITTLER.length)} Agenturen`, ton: 'schlecht' },
      { typ: 'kpi', breite: 4, titel: 'Davon mit mehreren Signalen', wert: mehrfach.length, format: 'zahl', unter: 'zuerst ansprechen', ton: mehrfach.length ? 'schlecht' : 'gut' },
      { typ: 'kpi', breite: 4, titel: 'Bestand dieser Agenturen', wert: summe(mitSignalen, 'bestand'), format: 'euro', unter: `${prozent(summe(mitSignalen, 'bestand') / summe(ALL_VERMITTLER, 'bestand') * 100)} des Bestands` },
      { typ: 'tabelle', breite: 8, titel: 'Priorisierte Liste für diese Woche', spalten: [
        { key: 'name', label: 'Agentur' }, { key: 'bundesland', label: 'Bundesland' },
        { key: 'signale', label: 'Signale', art: 'signale' },
        { key: 'empfehlung', label: 'Nächster Schritt' },
      ], zeilen: mitSignalen.slice(0, 8).map(v => ({ ...v, signale: v.signale.map(k => SIGNALE[k].label), empfehlung: SIGNALE[v.signale[0]].empfehlung })) },
      { typ: 'rangliste', breite: 4, titel: 'Signale nach Art', daten: zaehl, format: 'zahl' },
      { typ: 'einschaetzung', breite: 12, titel: 'KI-Einschätzung', punkte: [
        `**${zahl(mitSignalen.length)}** Agenturen zeigen mindestens ein Signal, **${zahl(mehrfach.length)}** mehrere gleichzeitig.`,
        mitSignalen[0] ? `Zuerst: **${mitSignalen[0].name}** (${mitSignalen[0].bundesland}), ${mitSignalen[0].signale.map(k => SIGNALE[k].label).join(' und ')}.` : 'Keine Agentur zeigt ein Signal.',
        `Häufigstes Signal: **${[...zaehl].sort((a, b) => b.wert - a.wert)[0].name}**.`,
      ] },
    ],
    zusammenfassung: `${zahl(mitSignalen.length)} Agenturen zeigen ein Signal, ${zahl(mehrfach.length)} davon mehrere. Die Liste ist nach Signalen und Bestand priorisiert, mit dem nächsten Schritt je Agentur.`,
    folgefragen: ['storno', 'top', 'heute'],
  };
}

function heute({ live }) {
  const h = live.heute;
  const sparten = live.jeSparte.filter(s => s.ng > 0);
  const stunden = live.jeStunde.map(s => ({ name: s.name, Neugeschäft: s.ng }));
  const topVm = live.jeVermittler.slice(0, 6);
  const staerkste = sparten[0];

  return {
    titel: 'Heute live',
    untertitel: 'Alle Eingänge des Geschäftstags, aktualisiert sich laufend',
    schritte: ['Eingänge seit 08:00 Uhr lesen', 'Abschlüsse und Storni trennen', 'Nach Stunde, Sparte und Agentur gruppieren', 'Live-Strom anschließen'],
    widgets: [
      { typ: 'kpi', breite: 3, titel: 'Abschlüsse heute', wert: h.abschluesse, format: 'zahl', unter: `${zahl(live.seitStart.abschluesse)} seit dem Öffnen`, live: true },
      { typ: 'kpi', breite: 3, titel: 'Neugeschäft heute', wert: h.ng, format: 'euro', unter: `Ø ${euroKompakt(h.abschluesse ? h.ng / h.abschluesse : 0)} je Abschluss`, live: true },
      { typ: 'kpi', breite: 3, titel: 'Provision heute', wert: h.provision, format: 'euro', unter: `${euroKompakt(h.beitrag)} Jahresbeitrag`, live: true },
      { typ: 'kpi', breite: 3, titel: 'Storni heute', wert: h.storni, format: 'zahl', unter: `${euroKompakt(h.stornoBeitrag)} Jahresbeitrag`, live: true, ton: 'schlecht' },
      { typ: 'saeulen', breite: 6, titel: 'Neugeschäft je Stunde', daten: stunden, key: 'Neugeschäft', farbe: FARBE.modusHell, format: 'euro', live: true },
      { typ: 'donut', breite: 3, titel: 'Sparten heute', daten: sparten.map(s => ({ name: s.name, wert: s.ng, farbe: KATEGORIE_FARBE[s.name] })), format: 'euro', live: true },
      { typ: 'rangliste', breite: 3, titel: 'Stärkste Agenturen heute', daten: topVm.map(v => ({ name: v.name, wert: v.ng, zusatz: `${zahl(v.abschluesse)} Abschl.` })), format: 'euro', live: true },
      { typ: 'feed', breite: 8, titel: 'Eingänge in Echtzeit', live: true },
      { typ: 'einschaetzung', breite: 4, titel: 'KI-Einschätzung', punkte: [
        `Bis jetzt **${zahl(h.abschluesse)} Abschlüsse** mit ${euroKompakt(h.ng)} Neugeschäft.`,
        staerkste ? `Stärkste Sparte ist **${staerkste.name}** mit ${euroKompakt(staerkste.ng)}.` : 'Noch keine Sparte vorn.',
        topVm[0] ? `Vorn liegt **${topVm[0].name}** mit ${zahl(topVm[0].abschluesse)} Abschlüssen.` : '',
        h.storni === 0 ? 'Bisher **kein Storno** heute.' : h.storni === 1 ? `**1 Storno** heute über ${euroKompakt(h.stornoBeitrag)} Jahresbeitrag.` : `**${zahl(h.storni)} Storni** heute, zusammen ${euroKompakt(h.stornoBeitrag)} Jahresbeitrag.`,
      ].filter(Boolean) },
    ],
    zusammenfassung: `Heute sind bisher ${zahl(h.abschluesse)} Abschlüsse mit ${euroKompakt(h.ng)} Neugeschäft eingegangen, dazu ${zahl(h.storni)} Storni. Das Dashboard bleibt am Live-Strom und zählt weiter mit.`,
    folgefragen: ['wege', 'plan', 'aufmerksamkeit'],
  };
}

function profit({ monate }) {
  const reihe = monate.map(m => ({ name: m.month, 'Combined Ratio': m.combined, Ergebnis: m.ergebnis, Deckungsbeitrag: m.deckungsbeitrag }));
  const erst = reihe[0];
  const letzt = reihe[reihe.length - 1];
  const erg12 = summe(reihe, 'Ergebnis');
  const db12 = summe(reihe, 'Deckungsbeitrag');
  const ng12 = summe(monate, 'neugeschaeft');
  const besterCr = [...reihe].sort((a, b) => a['Combined Ratio'] - b['Combined Ratio'])[0];

  return {
    titel: 'Profitabilität',
    untertitel: 'Combined Ratio, Ergebnis und Deckungsbeitrag der letzten 12 Monate',
    schritte: ['Combined Ratio je Monat lesen', 'Ergebnis und Deckungsbeitrag summieren', 'Marge auf das Neugeschäft beziehen', 'Dashboard aufbauen'],
    widgets: [
      { typ: 'kpi', breite: 3, titel: `Combined Ratio ${letzt.name}`, wert: letzt['Combined Ratio'], format: 'prozent', unter: `${vorzeichen(letzt['Combined Ratio'] - erst['Combined Ratio'], v => `${v.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Pp.`)} seit ${erst.name}`, ton: letzt['Combined Ratio'] <= erst['Combined Ratio'] ? 'gut' : 'schlecht' },
      { typ: 'kpi', breite: 3, titel: 'Ergebnis 12 Monate', wert: erg12, format: 'euro', unter: `${euroKompakt(letzt.Ergebnis)} im ${letzt.name}`, live: true },
      { typ: 'kpi', breite: 3, titel: 'Deckungsbeitrag 12 Monate', wert: db12, format: 'euro', unter: `${euroKompakt(letzt.Deckungsbeitrag)} im ${letzt.name}`, live: true },
      { typ: 'kpi', breite: 3, titel: 'DB-Marge auf Neugeschäft', wert: (db12 / ng12) * 100, format: 'prozent', unter: `${euroKompakt(ng12)} Neugeschäft` },
      { typ: 'verlauf', breite: 6, titel: 'Combined Ratio je Monat', daten: reihe, reihen: [{ key: 'Combined Ratio', farbe: FARBE.modusHell, flaeche: true }], format: 'prozent', referenz: { wert: 100, label: '100 %' } },
      { typ: 'saeulen', breite: 6, titel: 'Ergebnis und Deckungsbeitrag je Monat', daten: reihe, reihen: [{ key: 'Ergebnis', farbe: FARBE.modusHell }, { key: 'Deckungsbeitrag', farbe: FARBE.gold }], format: 'euro' },
      { typ: 'einschaetzung', breite: 12, titel: 'KI-Einschätzung', punkte: [
        `Die Combined Ratio liegt bei **${prozent(letzt['Combined Ratio'])}**, ${letzt['Combined Ratio'] <= erst['Combined Ratio'] ? 'besser' : 'schlechter'} als vor 12 Monaten (${prozent(erst['Combined Ratio'])}).`,
        `Bester Monat: **${besterCr.name}** mit ${prozent(besterCr['Combined Ratio'])}.`,
        `Ergebnis 12 Monate **${euroKompakt(erg12)}**, Deckungsbeitrag ${euroKompakt(db12)} (${prozent((db12 / ng12) * 100)} vom Neugeschäft).`,
      ] },
    ],
    zusammenfassung: `Die Combined Ratio steht bei ${prozent(letzt['Combined Ratio'])} und hat sich seit ${erst.name} ${letzt['Combined Ratio'] <= erst['Combined Ratio'] ? 'verbessert' : 'verschlechtert'}. Ergebnis und Deckungsbeitrag wachsen mit den Live-Abschlüssen des laufenden Monats.`,
    folgefragen: ['plan', 'storno', 'regionen'],
  };
}

function regionen({ live }) {
  const laender = [...BUNDESLAND_DATA].sort((a, b) => b.neugeschaeft - a.neugeschaeft)
    .map(l => ({ ...l, jeVermittler: Math.round(l.neugeschaeft / l.vermittler) }));
  const heute = Object.fromEntries(live.jeBundesland.map(b => [b.name, b]));
  const effizient = [...laender].sort((a, b) => b.jeVermittler - a.jeVermittler)[0];
  const heuteVorn = live.jeBundesland[0];
  const top3 = laender.slice(0, 3);
  const anteilTop3 = (summe(top3, 'neugeschaeft') / summe(laender, 'neugeschaeft')) * 100;

  return {
    titel: 'Regionen im Vergleich',
    untertitel: 'Neugeschäft, Produktivität und Storno je Bundesland',
    schritte: ['16 Bundesländer nach Neugeschäft sortieren', 'Neugeschäft je Vermittler rechnen', 'Heutige Abschlüsse je Land ergänzen', 'Dashboard aufbauen'],
    widgets: [
      { typ: 'kpi', breite: 4, titel: 'Stärkstes Bundesland', text: laender[0].name, unter: `${euroKompakt(laender[0].neugeschaeft)} Neugeschäft` },
      { typ: 'kpi', breite: 4, titel: 'Höchste Produktivität', text: effizient.name, unter: `${euroKompakt(effizient.jeVermittler)} je Vermittler` },
      { typ: 'kpi', breite: 4, titel: 'Heute vorn', text: heuteVorn?.name || '–', unter: heuteVorn ? `${zahl(heuteVorn.abschluesse)} Abschlüsse, ${euroKompakt(heuteVorn.ng)}` : '', live: true },
      { typ: 'rangliste', breite: 5, titel: 'Neugeschäft je Bundesland', daten: laender.slice(0, 10).map(l => ({ name: l.name, wert: l.neugeschaeft })), format: 'euro' },
      { typ: 'tabelle', breite: 7, titel: 'Kennzahlen je Bundesland', spalten: [
        { key: 'name', label: 'Bundesland' },
        { key: 'jeVermittler', label: 'NG je Vermittler', format: 'euro', rechts: true },
        { key: 'storno', label: 'Storno', format: 'prozent', rechts: true, warnAb: 5 },
        { key: 'vermittler', label: 'Vermittler', rechts: true },
        { key: 'heute', label: 'Heute', rechts: true, live: true },
      ], zeilen: laender.slice(0, 10).map(l => ({ ...l, heute: heute[l.name]?.abschluesse || 0 })) },
      { typ: 'einschaetzung', breite: 12, titel: 'KI-Einschätzung', punkte: [
        `${top3.map(l => `**${l.name}**`).join(', ')} bringen zusammen **${prozent(anteilTop3)}** des Neugeschäfts.`,
        `Am produktivsten ist **${effizient.name}** mit ${euroKompakt(effizient.jeVermittler)} je Vermittler.`,
        heuteVorn ? `Heute liegt **${heuteVorn.name}** vorn (${zahl(heuteVorn.abschluesse)} Abschlüsse).` : '',
      ].filter(Boolean) },
    ],
    zusammenfassung: `${laender[0].name} ist das stärkste Bundesland, ${effizient.name} das produktivste je Vermittler. Die drei stärksten Länder bringen ${prozent(anteilTop3)} des Neugeschäfts.`,
    folgefragen: ['storno', 'top', 'wege'],
  };
}

const BAUER = { plan, wege, top, storno, aufmerksamkeit, heute, profit, regionen };

/** Dashboard zur Frage `id` aus dem aktuellen Daten- und Live-Stand. */
export function baueDashboard(id, kontext) {
  const bauer = BAUER[id];
  if (!bauer) return null;
  return { id, frage: FRAGE_NACH_ID[id].frage, ...bauer(kontext) };
}
