// ============================================
// Produkt-Zuordnung: Eigene + Fremd-Produkte
// ============================================
import { random, randomBetween, weightedRandom, shuffle } from './utils';
import { VERSICHERUNGS_PRODUKTE, BANKING_PRODUKTE, VV_PRODUKTE, FREMD_PROFILE, pickKfzModell } from './produktKatalog';

// ═══ i18n helpers ═══
function getLang() { try { return localStorage.getItem('kia_language') || 'de'; } catch { return 'de'; } }
function tx(de, en) { return getLang() === 'en' ? en : de; }

// ═══ Versicherer-Produkt-Name generieren ═══
function generateProduktName(prod, modus) {
  const institut = modus === 'versicherung' ? 'ERGO'
    : modus === 'banking' ? 'VB Mittelhessen'
    : 'HRK LUNIS';
  if (prod.name) return `${institut} ${prod.name.replace(/versicherung/i, '').replace(/insurance/i, '').trim()}`.trim();
  return prod.name || prod.id;
}

function generateProduktDetails(prod, person) {
  switch (prod.id) {
    case 'bu': return `${Math.round(person.nettoeinkommen * 0.8)}€/${tx('mtl.', 'mo.')} ${tx('Rente', 'pension')}`;
    case 'rlv': return `${randomBetween(100, 400)}k ${tx('Deckung', 'coverage')}, ${tx('bis', 'until')} ${2030 + randomBetween(0, 15)}`;
    case 'kfz': {
      const modell = pickKfzModell(person);
      const deckung = random([tx('Vollkasko', 'Comprehensive'), tx('Teilkasko', 'Partial'), tx('Vollkasko 500€ SB', 'Comprehensive 500€ deductible')]);
      return `${modell}, ${deckung}, SF-${randomBetween(3, 25)}`;
    }
    case 'haftpflicht': return `${person.kinder.length > 0 ? tx('Familie', 'Family') : 'Single'} ${randomBetween(5, 10)}M€`;
    case 'hausrat': return `${person.wohnflaeche}qm`;
    case 'wohngebaeude': return `${person.wohnflaeche}qm, ${tx('Baujahr', 'built')} ${randomBetween(1960, 2020)}`;
    case 'pkv': return `${random([tx('Komfort', 'Comfort'), 'Premium', tx('Basis', 'Basic')])}${tx('tarif', ' plan')}`;
    case 'zahnzusatz': return `${randomBetween(70, 100)}% ${tx('Erstattung', 'reimbursement')}`;
    case 'pflege': return `${tx('Pflegetagegeld', 'Daily care allowance')} ${randomBetween(30, 80)}€/${tx('Tag', 'day')}`;
    case 'rechtsschutz': return `${random([tx('Privat', 'Private'), tx('Privat+Beruf', 'Private+Professional'), tx('Komplett', 'Complete')])}`;
    case 'unfall': return person.kinder.length > 0 ? tx('Familie', 'Family') : tx('Einzel', 'Individual');
    case 'fondspolice': return `${random(['MSCI World', 'Multi Asset', tx('Nachhaltig', 'Sustainable')])} ${tx('Strategie', 'Strategy')}`;
    case 'ruerup': return `${randomBetween(200, 600)}€/${tx('mtl.', 'mo.')}`;
    case 'riester': return `${randomBetween(5, 175)}€/${tx('mtl.', 'mo.')}`;
    case 'kapital_lv': return `${tx('Ablauf', 'Maturity')} ${randomBetween(2028, 2040)}`;
    case 'gewerbe_hp': return `${random(['5M€', '10M€'])} ${tx('Deckung', 'coverage')}`;
    case 'girokonto': return `${tx('Gehaltseingang', 'Salary deposit')} ${person.nettoeinkommen.toLocaleString('de')}€`;
    case 'baufinanzierung': return `${randomBetween(100, 450)}k€, ${randomBetween(1, 3)}.${randomBetween(0, 9)}%`;
    case 'depot': return `${random([tx('ETF-Sparplan', 'ETF Savings Plan'), tx('Fondsdepot', 'Fund Portfolio'), tx('Wertpapierdepot', 'Securities Portfolio')])}`;
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
        produkt: `ERGO ${p.name.replace(/versicherung/i, '').replace(/insurance/i, '').trim()}`,
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
      produkt: tx('VR-Girokonto', 'VR Checking Account'), details: `${tx('Gehaltseingang', 'Salary deposit')} ${person.nettoeinkommen.toLocaleString('de')}€`,
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
        details: `${(vol / 1000000).toFixed(1)}M€ ${tx('Beteiligung', 'participation')}`,
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
    details: `${tx('Gehaltseingang', 'Salary deposit')} ${person.nettoeinkommen.toLocaleString('de')}€`,
    volumen: randomBetween(1500, 8000), consent: randomBetween(0, 100) > 30,
  });

  // 2. ETF-Depot
  const depotChance = person.alter < 35 ? 60 : person.alter < 50 ? 40 : 20;
  if (randomBetween(0, 100) < depotChance) {
    const sparrate = randomBetween(100, Math.min(800, Math.round(person.nettoeinkommen * 0.15)));
    fremd.push({
      typ: 'depot', institut: profil.pickDepot(person),
      details: `${tx('ETF-Sparplan', 'ETF Savings Plan')} ${sparrate}€/${tx('mtl.', 'mo.')}`,
      volumen: randomBetween(5000, Math.min(80000, person.nettoeinkommen * 8)),
      consent: randomBetween(0, 100) > 40,
    });
  }

  // 3. Tagesgeld (50%)
  if (randomBetween(0, 100) > 50) {
    fremd.push({
      typ: 'tagesgeld', institut: random(['ING','DKB','Commerzbank','Deutsche Bank']),
      details: `${randomBetween(1, 3)},${randomBetween(0, 9)}% ${tx('Zins', 'interest')}`,
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
      details: `${restschuld.toLocaleString('de')}€ ${tx('Rest', 'remaining')}, ${randomBetween(1, 3)},${randomBetween(0, 9)}%, ${tx('Zinsbindung bis', 'fixed rate until')} ${zinsbindungJahr}`,
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
      details: `${tx('ETF-Sparplan', 'ETF Savings Plan')} ${sparrate}€/${tx('mtl.', 'mo.')}`,
      volumen: randomBetween(5000, Math.min(100000, person.nettoeinkommen * 10)),
      consent: randomBetween(0, 100) > 40,
    });
  }

  // 2. Fremd-Tagesgeld
  if (randomBetween(0, 100) > 40) {
    fremd.push({
      typ: 'tagesgeld', institut: random(profil.tagesgeld),
      details: `${randomBetween(2, 3)},${randomBetween(0, 9)}% ${tx('Zins', 'interest')}`,
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
      details: tx('Depot bei Fremdbank', 'Portfolio at external bank'),
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
      details: tx('Tagesgeld/Cash bei Fremdbank', 'Money market/cash at external bank'),
      volumen: randomBetween(100000, Math.min(2000000, Math.round(person._gesamtvermoegen * 0.1))),
      consent: randomBetween(0, 100) > 30,
    });
  }

  // 3. Immobilien
  if (person._gesamtvermoegen > 2000000 && randomBetween(0, 100) > 30) {
    fremd.push({
      typ: 'immobilien', institut: null,
      details: random([
        tx('Villa + Ferienimmobilie', 'Villa + vacation property'),
        tx('Mehrfamilienhaus (vermietet)', 'Multi-family house (rented)'),
        tx('Eigentumswohnung + Gewerbeeinheit', 'Condominium + commercial unit'),
        tx('Penthouse + Chalet Schweiz', 'Penthouse + Swiss chalet'),
        tx('3 Wohneinheiten (vermietet)', '3 residential units (rented)'),
        tx('Stadthaus + Finca Mallorca', 'Townhouse + Finca Mallorca'),
      ]),
      volumen: randomBetween(500000, Math.min(5000000, Math.round(person._gesamtvermoegen * 0.3))),
      consent: false,
    });
  }

  // 4. Unternehmensbeteiligung
  if (person._vvTyp === 'unternehmer') {
    fremd.push({
      typ: 'unternehmensbeteiligung', institut: null,
      details: random([
        `${tx('GmbH Maschinenbau', 'GmbH Mechanical Engineering')}, ${randomBetween(15, 200)} ${tx('MA', 'employees')}`,
        `${tx('GmbH IT-Dienstleistung', 'GmbH IT Services')}, ${randomBetween(10, 80)} ${tx('MA', 'employees')}`,
        `${tx('GmbH & Co. KG Handel', 'GmbH & Co. KG Trade')}, ${randomBetween(5, 50)} ${tx('MA', 'employees')}`,
        tx('Familienholding (3. Generation)', 'Family holding (3rd generation)'),
      ]),
      volumen: randomBetween(1000000, 15000000),
      consent: false,
    });
  }

  // 5. LV-Ablauf
  if (person.alter > 50 && randomBetween(0, 100) > 50) {
    fremd.push({
      typ: 'rlv', institut: random(['Alte Leipziger','Allianz','Zurich','Generali']),
      details: `${tx('Ablauf', 'Maturity')} ${randomBetween(2026, 2030)}, ${tx('Rückkaufswert', 'surrender value')} ${randomBetween(150, 500)}k€`,
      volumen: randomBetween(150000, 500000),
      consent: false,
    });
  }

  // 6. Referenzkonto bei Geschäftsbank
  fremd.push({
    typ: 'girokonto', institut: random(profil.geschaeftsbanken),
    details: tx('Referenzkonto für Mandat', 'Reference account for mandate'),
    volumen: randomBetween(20000, 200000),
    consent: true,
  });

  // 7. Premium-KFZ
  if (randomBetween(0, 100) > 30) {
    fremd.push({
      typ: 'kfz', institut: random(profil.versicherer),
      details: `${pickKfzModell(person)}, ${tx('Vollkasko', 'Comprehensive')}`,
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
      p.details = `${modell}, ${random([tx('Vollkasko', 'Comprehensive'), tx('Teilkasko', 'Partial')])}`;
    });
}
