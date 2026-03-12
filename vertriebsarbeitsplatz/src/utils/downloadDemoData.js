import {
  VERSICHERUNG_KUNDEN,
  BANKING_KUNDEN,
  VV_MANDANTEN,
  NEUGESCHAEFT_DATA,
  BESTAND_DATA,
  STORNO_DATA,
  VERGUETUNG_DATA,
  QUALITAET_DATA,
  STAMMDATEN_DATA,
  TERMINE_BY_MODE,
  AUFGABEN_BY_MODE,
} from '../data';

function buildModeSection(modeId, kunden) {
  return {
    ['kunden (Kunden-Tab)']: kunden,
    ['neugeschaeft (Neugeschäft-Tab)']: NEUGESCHAEFT_DATA[modeId],
    ['bestand (Bestand-Tab)']: BESTAND_DATA[modeId],
    ['storno (Storno-Tab)']: STORNO_DATA[modeId],
    ['verguetung (Vergütung-Tab)']: VERGUETUNG_DATA[modeId],
    ['qualitaet (Qualität-Tab)']: QUALITAET_DATA[modeId],
    ['termine (Übersicht)']: TERMINE_BY_MODE[modeId],
    ['aufgaben (Übersicht)']: AUFGABEN_BY_MODE[modeId],
    ['stammdaten (Stammdaten-Tab)']: STAMMDATEN_DATA[modeId],
  };
}

export function downloadDemoData() {
  const exportData = {
    meta: {
      exportDatum: new Date().toISOString(),
      app: 'KI-Vertriebsarbeitsplatz V02',
    },
    versicherung: buildModeSection('versicherung', VERSICHERUNG_KUNDEN),
    banking: buildModeSection('banking', BANKING_KUNDEN),
    vermoegensverwaltung: buildModeSection('vermoegensverwaltung', VV_MANDANTEN),
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'ki-vertriebsarbeitsplatz-demodaten.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
