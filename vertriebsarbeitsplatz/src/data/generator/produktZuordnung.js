// ============================================
// Produkt-Zuordnung: Eigene + Fremd-Produkte
// ============================================
import { random, randomBetween, weightedRandom, shuffle } from './utils';
import { VERSICHERUNGS_PRODUKTE, BANKING_PRODUKTE, VV_PRODUKTE, FREMD_PROFILE, pickKfzModell } from './produktKatalog';

// ═══ Versicherer-Produkt-Name generieren ═══
function generateProduktName(prod, modus) {
  const institut = modus === 'versicherung' ? 'ERGO'
    : modus === 'banking' ? 'VB Mittelhessen'
    : 'HRK LUNIS';
  if (prod.name) return `${institut} ${prod.name.replace(/versicherung/i, '').trim()}`.trim();
  return prod.name || prod.id;
}

function generateProduktDetails(prod, person) {
  switch (prod.id) {
    case 'bu': return `${Math.round(person.nettoeinkommen * 0.8)}€/mtl. Rente`;
    case 'rlv': return `${randomBetween(100, 400)}k Deckung, bis ${2030 + randomBetween(0, 15)}`;
    case 'kfz': {
      const modell = pickKfzModell(person);
      const deckung = random(['Vollkasko', 'Teilkasko', 'Vollkasko 500€ SB']);
      return `${modell}, ${deckung}, SF-${randomBetween(3, 25)}`;
    }
    case 'haftpflicht': return `${person.kinder.length > 0 ? 'Familie' : 'Single'} ${randomBetween(5, 10)}M€`;
    case 'hausrat': return `${person.wohnflaeche}qm`;
    case 'wohngebaeude': return `${person.wohnflaeche}qm, Baujahr ${randomBetween(1960, 2020)}`;
    case 'pkv': return `${random(['Komfort','Premium','Basis'])}tarif`;
    case 'zahnzusatz': return `${randomBetween(70, 100)}% Erstattung`;
    case 'pflege': return `Pflegetagegeld ${randomBetween(30, 80)}€/Tag`;
    case 'rechtsschutz': return `${random(['Privat','Privat+Beruf','Komplett'])}`;
    case 'unfall': return person.kinder.length > 0 ? 'Familie' : 'Einzel';
    case 'fondspolice': return `${random(['MSCI World','Multi Asset','Nachhaltig'])} Strategie`;
    case 'ruerup': return `${randomBetween(200, 600)}€/mtl.`;
    case 'riester': return `${randomBetween(5, 175)}€/mtl.`;
    case 'kapital_lv': return `Ablauf ${randomBetween(2028, 2040)}`;
    case 'gewerbe_hp': return `${random(['5M€','10M€'])} Deckung`;
    case 'girokonto': return `Gehaltseingang ${person.nettoeinkommen.toLocaleString('de')}€`;
    case 'baufinanzierung': return `${randomBetween(100, 450)}k€, ${randomBetween(1, 3)}.${randomBetween(0, 9)}%`;
    case 'depot': return `${random(['ETF-Sparplan','Fondsdepot','Wertpapierdepot'])}`;
    default: return prod.name || '';
  }
}

function calculatePraemie(prod, person) {
  if (prod.praemieRange) return randomBetween(prod.praemieRange[0], prod.praemieRange[1]);
  if (prod.saldoRange) return randomBetween(prod.saldoRange[0], prod.saldoRange[1]);
  if (prod.rateRange) return randomBetween(prod.rateRange[0], prod.rateRange[1]) * 12;
  if (prod.volumenRange) {
    // For credit products: return annual payment (Annuität), not the full loan volume
    // Store volume separately via calculateVolumen()
    if (prod.kategorie === 'kredit') {
      const volumen = randomBetween(prod.volumenRange[0], prod.volumenRange[1]);
      // Annuität = Zins (~2-4%) + Tilgung (~2-3%) ≈ 4-7% of volume per year
      const annuitaetRate = randomBetween(4, 7) / 100;
      return Math.round(volumen * annuitaetRate);
    }
    return randomBetween(prod.volumenRange[0], prod.volumenRange[1]);
  }
  return randomBetween(100, 2000);
}

function calculateVolumen(prod) {
  if (prod.volumenRange && prod.kategorie === 'kredit') {
    return randomBetween(prod.volumenRange[0], prod.volumenRange[1]);
  }
  return null;
}

function generateVertragsdatum(alter) {
  const jahreSeit = randomBetween(1, Math.min(20, Math.max(1, alter - 20)));
  const jahr = 2026 - jahreSeit;
  const monat = String(randomBetween(1, 12)).padStart(2, '0');
  return `${jahr}-${monat}`;
}

// ═══ Eigene Produkte zuweisen ═══
export function assignEigeneProdukte(person, modus) {
  const produkte = [];

  if (modus === 'versicherung') {
    const dichte = Number(weightedRandom({ 1: 15, 2: 20, 3: 25, 4: 20, 5: 10, 6: 7, 7: 3 }));
    const relevante = VERSICHERUNGS_PRODUKTE.filter(p => p.relevanz(person));
    const shuffled = shuffle(relevante);

    for (let i = 0; i < Math.min(dichte, shuffled.length); i++) {
      const p = shuffled[i];
      produkte.push({
        typ: p.id,
        sparte: p.sparte,
        produkt: `ERGO ${p.name.replace('versicherung', '').replace('Versicherung', '').trim()}`,
        details: generateProduktDetails(p, person),
        praemie: calculatePraemie(p, person),
        seit: generateVertragsdatum(person.alter),
        status: weightedRandom({ aktiv: 70, optimierbar: 20, auslaufend: 10 }),
      });
    }
  }

  if (modus === 'banking') {
    // Jeder Banking-Kunde hat ein Girokonto
    produkte.push({
      typ: 'girokonto', sparte: 'konto',
      produkt: 'VR-Girokonto', details: `Gehaltseingang ${person.nettoeinkommen.toLocaleString('de')}€`,
      praemie: 0, seit: generateVertragsdatum(person.alter), status: 'aktiv',
    });

    const dichte = Number(weightedRandom({ 1: 10, 2: 25, 3: 30, 4: 20, 5: 10, 6: 5 }));
    const extras = shuffle(BANKING_PRODUKTE.filter(p => p.id !== 'girokonto'));

    for (let i = 0; i < Math.min(dichte, extras.length); i++) {
      const p = extras[i];
      const praemie = calculatePraemie(p, person);
      const volumen = calculateVolumen(p);
      const entry = {
        typ: p.id, sparte: p.kategorie,
        produkt: p.name,
        details: generateProduktDetails(p, person),
        praemie,
        seit: generateVertragsdatum(person.alter),
        status: weightedRandom({ aktiv: 80, optimierbar: 15, auslaufend: 5 }),
      };
      if (volumen) entry.volumen = volumen;
      produkte.push(entry);
    }
  }

  if (modus === 'vermoegensverwaltung') {
    // Hauptmandat
    const mandatProd = VV_PRODUKTE.find(p => p.segment && p.relevanz(person));
    if (mandatProd) {
      const aum = randomBetween(
        mandatProd.aumRange[0],
        Math.min(mandatProd.aumRange[1], person._gesamtvermoegen * 0.6)
      );
      produkte.push({
        typ: mandatProd.id, sparte: mandatProd.segment,
        produkt: mandatProd.name,
        details: `AuM ${(aum / 1000000).toFixed(1)}M€, Fee ${randomBetween(mandatProd.feeRange[0] * 100, mandatProd.feeRange[1] * 100) / 100}% p.a.`,
        praemie: aum,
        seit: generateVertragsdatum(Math.min(person.alter, 60)),
        status: 'aktiv',
      });
    }

    // Zusatzprodukte (PE, Immo, Infra)
    VV_PRODUKTE.filter(p => !p.segment && p.relevanz(person) && randomBetween(0, 100) > 50).forEach(p => {
      const vol = randomBetween(p.volumenRange[0], p.volumenRange[1]);
      produkte.push({
        typ: p.id, sparte: 'alternatives',
        produkt: p.name,
        details: `${(vol / 1000000).toFixed(1)}M€ Beteiligung`,
        praemie: vol,
        seit: generateVertragsdatum(Math.min(person.alter, 55)),
        status: 'aktiv',
      });
    });
  }

  return produkte;
}

// ═══ Fremdprodukte zuweisen ═══
export function assignFremdProdukte(person, modus, eigeneProdukte) {
  switch (modus) {
    case 'versicherung': return assignFremdVersicherung(person, eigeneProdukte);
    case 'banking': return assignFremdBanking(person, eigeneProdukte);
    case 'vermoegensverwaltung': return assignFremdVV(person);
    default: return [];
  }
}

function assignFremdVersicherung(person, eigeneProdukte) {
  const fremd = [];
  const profil = FREMD_PROFILE.versicherung;

  // 1. Girokonto (immer)
  fremd.push({
    typ: 'girokonto', institut: profil.pickBank(person),
    details: `Gehaltseingang ${person.nettoeinkommen.toLocaleString('de')}€`,
    volumen: randomBetween(1500, 8000), consent: randomBetween(0, 100) > 30,
  });

  // 2. ETF-Depot
  const depotChance = person.alter < 35 ? 60 : person.alter < 50 ? 40 : 20;
  if (randomBetween(0, 100) < depotChance) {
    const sparrate = randomBetween(100, Math.min(800, Math.round(person.nettoeinkommen * 0.15)));
    fremd.push({
      typ: 'depot', institut: profil.pickDepot(person),
      details: `ETF-Sparplan ${sparrate}€/mtl.`,
      volumen: randomBetween(5000, Math.min(80000, person.nettoeinkommen * 8)),
      consent: randomBetween(0, 100) > 40,
    });
  }

  // 3. Tagesgeld (50%)
  if (randomBetween(0, 100) > 50) {
    fremd.push({
      typ: 'tagesgeld', institut: random(['ING','DKB','Commerzbank','Deutsche Bank']),
      details: `${randomBetween(1, 3)},${randomBetween(0, 9)}% Zins`,
      volumen: randomBetween(3000, Math.min(50000, person.nettoeinkommen * 5)),
      consent: randomBetween(0, 100) > 40,
    });
  }

  // 4. Baufinanzierung (bei Eigentum)
  if (person.wohnsituation === 'Eigentum' && person.alter < 58) {
    const restschuld = randomBetween(80000, 350000);
    const zinsbindungJahr = randomBetween(2026, 2032);
    fremd.push({
      typ: 'baufinanzierung', institut: profil.pickBaufi(),
      details: `${restschuld.toLocaleString('de')}€ Rest, ${randomBetween(1, 3)},${randomBetween(0, 9)}%, Zinsbindung bis ${zinsbindungJahr}`,
      volumen: restschuld, consent: randomBetween(0, 100) > 30,
      _zinsbindungEnde: zinsbindungJahr,
    });
  }

  // 5. Fremd-Versicherungen
  const eigeneTypen = eigeneProdukte.map(p => p.typ);
  VERSICHERUNGS_PRODUKTE
    .filter(p => !eigeneTypen.includes(p.id) && p.relevanz(person) && randomBetween(0, 100) > 50)
    .slice(0, randomBetween(1, 3))
    .forEach(p => {
      fremd.push({
        typ: p.id, institut: random(profil.versicherer),
        details: generateProduktDetails(p, person),
        volumen: calculatePraemie(p, person),
        consent: randomBetween(0, 100) > 40,
      });
    });

  return fremd;
}

function assignFremdBanking(person, eigeneProdukte) {
  const fremd = [];
  const profil = FREMD_PROFILE.banking;

  // 1. Fremd-Depot
  const depotChance = person.alter < 35 ? 70 : person.alter < 50 ? 50 : 25;
  if (randomBetween(0, 100) < depotChance) {
    const sparrate = randomBetween(100, Math.min(1000, Math.round(person.nettoeinkommen * 0.15)));
    fremd.push({
      typ: 'depot', institut: profil.pickDepot(person),
      details: `ETF-Sparplan ${sparrate}€/mtl.`,
      volumen: randomBetween(5000, Math.min(100000, person.nettoeinkommen * 10)),
      consent: randomBetween(0, 100) > 40,
    });
  }

  // 2. Fremd-Tagesgeld
  if (randomBetween(0, 100) > 40) {
    fremd.push({
      typ: 'tagesgeld', institut: random(profil.tagesgeld),
      details: `${randomBetween(2, 3)},${randomBetween(0, 9)}% Zins`,
      volumen: randomBetween(5000, Math.min(60000, person.nettoeinkommen * 6)),
      consent: randomBetween(0, 100) > 30,
    });
  }

  // 3. Fremd-Versicherungen (NICHT R+V!)
  const versicherungen = [
    { typ: 'kfz', chance: 70, institut: () => random(['HUK-Coburg','Allianz','AXA','HDI','DEVK']) },
    { typ: 'bu', chance: 50, institut: () => random(['HDI','Allianz','Alte Leipziger','Zurich']) },
    { typ: 'haftpflicht', chance: 60, institut: () => random(['Allianz','CosmosDirekt','AXA','Gothaer']) },
    { typ: 'hausrat', chance: 40, institut: () => random(['Allianz','AXA','DEVK','Gothaer']) },
    { typ: 'rlv', chance: 30, institut: () => random(['Allianz','HDI','Zurich','Alte Leipziger']) },
  ];

  shuffle(versicherungen).slice(0, randomBetween(1, 3)).forEach(v => {
    if (randomBetween(0, 100) < v.chance) {
      const prod = VERSICHERUNGS_PRODUKTE.find(p => p.id === v.typ);
      fremd.push({
        typ: v.typ, institut: v.institut(),
        details: prod ? generateProduktDetails(prod, person) : v.typ,
        volumen: randomBetween(200, 2000),
        consent: randomBetween(0, 100) > 40,
      });
    }
  });

  return fremd;
}

function assignFremdVV(person) {
  const fremd = [];
  const profil = FREMD_PROFILE.vv;

  // 1. Depot bei Fremdbank (fast immer)
  if (randomBetween(0, 100) > 20) {
    fremd.push({
      typ: 'depot_privat', institut: random(profil.privateBanking),
      details: 'Depot bei Fremdbank',
      volumen: randomBetween(
        Math.round(person._gesamtvermoegen * 0.05),
        Math.round(person._gesamtvermoegen * 0.3)
      ),
      consent: randomBetween(0, 100) > 30,
    });
  }

  // 2. Cash bei Fremdbank
  if (randomBetween(0, 100) > 40) {
    fremd.push({
      typ: 'tagesgeld', institut: random(profil.geschaeftsbanken),
      details: 'Tagesgeld/Cash bei Fremdbank',
      volumen: randomBetween(100000, Math.min(2000000, Math.round(person._gesamtvermoegen * 0.1))),
      consent: randomBetween(0, 100) > 30,
    });
  }

  // 3. Immobilien
  if (person._gesamtvermoegen > 2000000 && randomBetween(0, 100) > 30) {
    fremd.push({
      typ: 'immobilien', institut: null,
      details: random(['Villa + Ferienimmobilie', 'Mehrfamilienhaus (vermietet)',
        'Eigentumswohnung + Gewerbeeinheit', 'Penthouse + Chalet Schweiz',
        '3 Wohneinheiten (vermietet)', 'Stadthaus + Finca Mallorca']),
      volumen: randomBetween(500000, Math.min(5000000, Math.round(person._gesamtvermoegen * 0.3))),
      consent: false,
    });
  }

  // 4. Unternehmensbeteiligung
  if (person._vvTyp === 'unternehmer') {
    fremd.push({
      typ: 'unternehmensbeteiligung', institut: null,
      details: random([
        `GmbH Maschinenbau, ${randomBetween(15, 200)} MA`,
        `GmbH IT-Dienstleistung, ${randomBetween(10, 80)} MA`,
        `GmbH & Co. KG Handel, ${randomBetween(5, 50)} MA`,
        'Familienholding (3. Generation)',
      ]),
      volumen: randomBetween(1000000, 15000000),
      consent: false,
    });
  }

  // 5. LV-Ablauf
  if (person.alter > 50 && randomBetween(0, 100) > 50) {
    fremd.push({
      typ: 'rlv', institut: random(['Alte Leipziger','Allianz','Zurich','Generali']),
      details: `Ablauf ${randomBetween(2026, 2030)}, Rückkaufswert ${randomBetween(150, 500)}k€`,
      volumen: randomBetween(150000, 500000),
      consent: false,
    });
  }

  // 6. Referenzkonto bei Geschäftsbank
  fremd.push({
    typ: 'girokonto', institut: random(profil.geschaeftsbanken),
    details: 'Referenzkonto für Mandat',
    volumen: randomBetween(20000, 200000),
    consent: true,
  });

  // 7. Premium-KFZ
  if (randomBetween(0, 100) > 30) {
    fremd.push({
      typ: 'kfz', institut: random(profil.versicherer),
      details: `${pickKfzModell(person)}, Vollkasko`,
      volumen: randomBetween(800, 3000),
      consent: false,
    });
  }

  return fremd;
}

// ═══ Plausibilitäts-Validierung ═══
export function validateFremdProdukte(person, modus) {
  if (modus === 'vermoegensverwaltung') {
    // Volumen nie > 40% Gesamtvermögen
    person.fremdProdukte.forEach(fp => {
      if (fp.volumen > person._gesamtvermoegen * 0.4 && fp.typ !== 'unternehmensbeteiligung') {
        fp.volumen = Math.round(person._gesamtvermoegen * randomBetween(5, 25) / 100);
      }
    });
  }

  // KFZ-Modell fix
  [...person.eigeneProdukte, ...person.fremdProdukte]
    .filter(p => p.typ === 'kfz' && p.details && !p.details.includes(','))
    .forEach(p => {
      const modell = pickKfzModell(person);
      p.details = `${modell}, ${random(['Vollkasko', 'Teilkasko'])}`;
    });
}
