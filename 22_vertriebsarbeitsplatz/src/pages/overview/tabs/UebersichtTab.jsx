import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Zap, CheckSquare, Calendar, Phone, AlertTriangle, AlertCircle, CheckCircle, Check, FileText, Heart, Car, Home, ShieldAlert, Cake, Euro, Download, Landmark, BarChart3, PiggyBank, Wallet, Sparkles, Megaphone, ChevronRight, Users, TrendingUp, X, Mail, Target, ListChecks, BarChart, PlayCircle, Copy, Rocket, Shield, Gem, Plane, GitMerge, Hourglass, Layers, Briefcase, Activity, Radar, CalendarCheck, FileCheck, Bot, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

const CAMPAIGN_ICONS = { Home, Users, TrendingUp, Heart, Sparkles };
import Card from '../../../components/ui/Card';
import Avatar from '../../../components/ui/Avatar';
import { SparteBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { KUNDEN_BY_MODE, TERMINE_BY_MODE, AUFGABEN_BY_MODE } from '../../../data';
import { VV_LEADS } from '../../../data/vvExtended';
import { getTerminStubKunde } from '../../../data/banking-termin-stubs';
import { formatEur } from '../../../utils/formatters';
import { getKundeFoto } from '../../../utils/kundenFotos';
import TerminPrepModal from '../../../components/ui/TerminPrepModal';
import RadarExplanationModal from '../../../components/ui/RadarExplanationModal';
import { useDayAdvanced, getSimulatedAppointment, formatAppointmentTime } from '../../../utils/demoClock';

import { getLang, tx } from '../../../utils/langHelper';

// Portal-Ziel für Modals: der Modus-Wrapper (data-mode), damit die
// Modus-Tokens (Bordeaux, Oliv, Petrol) auch im Modal gelten. Er liegt
// oberhalb der transformierten Tab-Fläche, die sonst zum Bezugsrahmen der
// fixed-Positionierung würde. Fallback: document.body.
function portalRoot() {
  if (typeof document === 'undefined') return null;
  return document.querySelector('[data-mode]') || document.body;
}

const MINI_KPIS = {
  versicherung: [
    { labelKey: 'abschluesse', value: '12', subtextKey: 'plusVsVorwoche' },
    { labelKey: 'neugeschaeft', value: '€18.450', subtext: '+12%' },
    { labelKey: 'termine', value: '28', subtext: '±0' },
    { labelKey: 'abschlussquote', value: '68%', subtext: '+5%' },
  ],
  banking: [
    { labelKey: 'abschluesse', value: '8', subtextKey: 'dieseWoche' },
    { labelKey: 'ertrag', value: '24,8k', subtextKey: 'dieserMonat' },
    { labelKey: 'termine', value: '18', subtextKey: 'diesenMonat' },
    { label: 'NPS', value: '8,4', subtextKey: 'durchschnitt' },
  ],
  vermoegensverwaltung: [
    { label: 'AuM', value: '78M', subtextKey: 'gesamt' },
    { label: 'NNM', value: '+5,8M', subtext: 'YTD' },
    { label: 'Performance', value: '+5,6%', subtext: 'YTD \u00d8' },
    { label: 'Pipeline', value: '45M', subtext: '12 Leads' },
  ],
};

const FOKUS = {
  versicherung: { text: tx('Klaus Fischer - BU-Nachversicherung', 'Klaus Fischer - Disability Re-Insurance'), next: '17:30 Amira König' },
  banking: { text: tx('Klaus Fischer - Kreditgespräch Immobilienfinanzierung', 'Klaus Fischer - Property Financing Talk'), next: '14:00 Klaus Fischer' },
  vermoegensverwaltung: { text: tx('Keller NextGen - WpHG-Fragebogen + Geeignetheitsbericht', 'Keller NextGen - WpHG Questionnaire + Suitability Report'), next: tx('10:00 Dr. Anna Fischer (Onboarding)', '10:00 Dr. Anna Fischer (Onboarding)') },
};

const TAGESSTART_ITEMS = {
  versicherung: [
    { icon: Calendar, textKey: 'termineHeute', textPrefix: '4 ', size: 14 },
    { icon: Zap, textKey: 'offenePotenziale', textPrefix: '8 ', size: 14 },
    { icon: Phone, textKey: 'followupsFaellig', textPrefix: '3 ', size: 14 },
  ],
  banking: [
    { icon: Calendar, textKey: 'termine', textPrefix: '4 ', size: 14 },
    { icon: Phone, textKey: 'rueckruf', textPrefix: '1 ', size: 14 },
    { icon: AlertTriangle, textKey: 'fidaConsentsOffen', textPrefix: '2 ', size: 14, className: 'text-amber-500' },
  ],
  vermoegensverwaltung: [
    { icon: Calendar, textKey: 'mandateMeetings', textPrefix: '2 ', size: 14 },
    { icon: AlertTriangle, textKey: 'followupsFaellig', textPrefix: '2 ', size: 14, className: 'text-amber-500' },
    { icon: AlertTriangle, textKey: 'wphgAbgelaufen', textPrefix: '1 ', size: 14, className: 'text-red-500' },
  ],
};

const LETZTE_ABSCHLUESSE = {
  versicherung: [
    { kunde: 'Sabine Danzig', kundeId: 'KD00008', produkt: 'ERGO Risikoleben', sparte: 'leben', betrag: 480, datum: '10.03.2026' },
    { kunde: 'Michael Braun', kundeId: 'KD00005', produkt: 'ERGO Kfz-Komfort', sparte: 'kfz', betrag: 890, datum: '09.03.2026' },
    { kunde: 'Anna Hoffmann', kundeId: 'KD00004', produkt: 'DKV Zahnzusatz', sparte: 'kranken', betrag: 35, datum: '08.03.2026' },
    { kunde: 'Klaus Fischer', kundeId: 'KD00001', produkt: 'ERGO BU-Nachversicherung', sparte: 'leben', betrag: 1680, datum: '07.03.2026' },
  ],
  banking: [
    { kunde: 'Andrea Lang', kundeId: 'BK00005', produkt: 'Praxiskredit', sparte: 'kredit', betrag: 85000, datum: '10.03.2026' },
    { kunde: 'Sandra Müller', kundeId: 'BK00002', produkt: 'VR-FinanzPlan', sparte: 'wertpapier', betrag: 25000, datum: '09.03.2026' },
    { kunde: 'Peter Hoffmann', kundeId: 'BK00003', produkt: 'VermögenPlus Depot', sparte: 'wertpapier', betrag: 50000, datum: '08.03.2026' },
  ],
  vermoegensverwaltung: [
    { kunde: 'Dr. Stefan Meier', kundeId: 'VV001', produkt: 'Spezialmandat Dividende', sparte: 'mandat', betrag: 5000000, datum: '10.03.2026' },
    { kunde: tx('Familie Keller', 'Family Keller'), kundeId: 'VV002', produkt: 'ESG Impact Fund', sparte: 'mandat', betrag: 2500000, datum: '08.03.2026' },
  ],
};

const GEBURTSTAGE = {
  versicherung: [
    { name: 'Amira König', kundeId: 'KD00002', datum: 'Mi, 12.03.', alter: 29, foto: 'images/AdobeStock_252262042.jpeg' },
    { name: 'Thomas Weber', kundeId: 'KD00003', datum: 'Do, 13.03.', alter: 56, foto: 'images/AdobeStock_361342769.jpeg' },
    { name: 'Sandra Yilmaz', kundeId: 'KD00008', datum: 'Sa, 15.03.', alter: 45 },
  ],
  banking: [
    { name: 'Sandra Müller', kundeId: 'BK00002', datum: 'Mi, 19.03.', alter: 34 },
    { name: 'Andrea Lang', kundeId: 'BK00005', datum: 'Fr, 21.03.', alter: 41 },
  ],
  vermoegensverwaltung: [
    { name: 'Dr. Stefan Meier', kundeId: 'VV001', datum: 'Do, 13.03.', alter: 58 },
  ],
};

const SCHNELLZUGRIFF = {
  versicherung: [
    { labelKey: 'lebensversicherung', icon: Heart },
    { labelKey: 'kfzVersicherung', icon: Car },
    { labelKey: 'sachversicherung', icon: Home },
    { labelKey: 'schadenmeldung', icon: ShieldAlert },
  ],
  banking: [
    { labelKey: 'vrFinanzPlan', icon: BarChart3 },
    { labelKey: 'kreditAntrag', icon: Landmark },
    { labelKey: 'depotEroeffnen', icon: PiggyBank },
    { labelKey: 'weroAktivieren', icon: Wallet },
  ],
  vermoegensverwaltung: [
    { labelKey: 'neuesMandat', icon: FileText },
    { labelKey: 'wphgFragebogen', icon: FileText },
    { labelKey: 'investmentvorschlag', icon: BarChart3 },
    { labelKey: 'complianceCheck', icon: ShieldAlert },
  ],
};

// Marketing campaigns for banking Übersicht
// Brand profile per banking institut. The Marketingkampagnen titles
// (and a few brand-specific begründungen) are derived from this so that
// the campaigns always show the right product names for whichever bank
// the user has currently picked – no Volksbank-specific names leak into
// Zukunftsbank, Sparkasse, Deutsche Bank etc.
const BANKING_BRANDS = {
  'Volksbank Mittelhessen': {
    prefix: 'VR',
    vorsorgeBrand: 'VR-VorsorgePlus',
    depotProduct: 'VR-MeinDepot',
    insurer: 'R+V',
    bausparPartner: 'Schwäbisch-Hall',
    fundsPartner: 'Union Investment',
  },
  'Sparkasse': {
    prefix: 'S',
    vorsorgeBrand: 'S-VorsorgePlus',
    depotProduct: 'S-Broker Depot',
    insurer: 'Sparkassen-Versicherung',
    bausparPartner: 'LBS',
    fundsPartner: 'DekaBank',
  },
  'Commerzbank': {
    prefix: 'Commerz',
    vorsorgeBrand: 'CB VorsorgePlus',
    depotProduct: 'comdirect Depot',
    insurer: 'Allianz',
    bausparPartner: 'BHW',
    fundsPartner: 'Allianz Global Investors',
  },
  'Deutsche Bank': {
    prefix: 'DB',
    vorsorgeBrand: 'db VorsorgePlus',
    depotProduct: 'maxblue Depot',
    insurer: 'Zurich',
    bausparPartner: 'BHW',
    fundsPartner: 'DWS',
  },
  'ING': {
    prefix: 'ING',
    vorsorgeBrand: 'ING VorsorgePlus',
    depotProduct: 'ING Direkt-Depot',
    insurer: 'NN',
    bausparPartner: 'Interhyp',
    fundsPartner: 'ING Investments',
  },
  'Zukunftsbank': {
    prefix: 'ZB',
    vorsorgeBrand: 'Zukunfts VorsorgePlus',
    depotProduct: 'Zukunfts Depot',
    insurer: 'Zukunfts Versicherung',
    bausparPartner: 'Zukunfts Bausparen',
    fundsPartner: 'Zukunfts Invest',
  },
};

function getBankingBrand(institut) {
  return BANKING_BRANDS[institut] || BANKING_BRANDS['Volksbank Mittelhessen'];
}

// Brand profile per insurance institut. Die Versicherungs-Marketingkampagnen-
// Titel (und ein paar branded begründungen) werden daraus abgeleitet, damit
// die Kampagnen immer die richtigen Produktnamen für die aktuell aktive
// Gesellschaft zeigen – keine ERGO-Produktnamen leaken in Allianz/AXA etc.
const INSURANCE_BRANDS = {
  'ERGO': {
    prefix: 'ERGO',
    buBrand: 'ERGO BU Comfort',
    rlvBrand: 'ERGO Risikoleben',
    hausratBrand: 'ERGO Hausrat Premium',
    krankenBrand: 'DKV Zahnzusatz',
    altersvorsorge: 'ERGO Rente Garantie',
  },
  'Allianz': {
    prefix: 'Allianz',
    buBrand: 'Allianz SBU Privat',
    rlvBrand: 'Allianz Risikoleben',
    hausratBrand: 'Allianz Meine Sachen',
    krankenBrand: 'Allianz Zahn Best',
    altersvorsorge: 'Allianz PrivatRente',
  },
  'AXA': {
    prefix: 'AXA',
    buBrand: 'AXA Berufsunfähigkeit Premium',
    rlvBrand: 'AXA Risikoleben',
    hausratBrand: 'AXA Hausrat Komfort',
    krankenBrand: 'DBV Zahnschutz',
    altersvorsorge: 'AXA Relax Rente',
  },
  'Generali': {
    prefix: 'Generali',
    buBrand: 'Generali BU Protect',
    rlvBrand: 'Generali Risikoleben',
    hausratBrand: 'Generali DomusClassic',
    krankenBrand: 'CosmosDirekt Zahn',
    altersvorsorge: 'Generali Privatrente',
  },
  'Zurich': {
    prefix: 'Zurich',
    buBrand: 'Zurich BU Top-Schutz',
    rlvBrand: 'Zurich Risikoleben',
    hausratBrand: 'Zurich Hausrat Premium',
    krankenBrand: 'Zurich Zahn Plus',
    altersvorsorge: 'Zurich Garantie Rente',
  },
  'Zukunftsversicherung': {
    prefix: '',
    // Bewusst ohne vorangestelltes Marken-Kürzel (kein "ZV"). Die
    // Tarifnamen stehen für sich, das Institut ist über Header/Logo klar.
    buBrand: 'BU-Schutz',
    rlvBrand: 'Risikoleben',
    hausratBrand: 'HausratPlus',
    krankenBrand: 'Zahn Digital',
    altersvorsorge: 'FuturePension',
  },
};

function getInsuranceBrand(institut) {
  return INSURANCE_BRANDS[institut] || INSURANCE_BRANDS['ERGO'];
}

function buildBankingKampagnen(institut) {
  const b = getBankingBrand(institut);
  return [
    {
      id: 'fruehlings-baufi',
      kategorie: 'immobilie',
      titel: 'Frühlings-Baufi-Aktion',
      titelEn: 'Spring Mortgage Campaign',
      status: 'aktiv',
      zeitraum: '01.03.–30.04.2026',
      zielgruppe: 'Kunden mit Immo-Signalen',
      zielgruppeEn: 'Clients with property signals',
      photoIcon: 'Home',
      passendeKunden: [
        { kundeId: 'BK00001', name: 'Klaus Fischer', match: 97, begruendung: `Commerzbank-Ratenkredit läuft 06/2026 aus (840€ frei), ${b.bausparPartner}-BSV zuteilungsreif, Immo-Newsletter seit 2 Jahren`, begruendungEn: `Commerzbank loan expires 06/2026 (€840 free), ${b.bausparPartner} building loan ready, property newsletter for 2 years` },
        { kundeId: 'BK00002', name: 'Sandra Müller', match: 92, begruendung: 'Immobilienkauf vorbereiten, Ehemann als Neukunde gewinnen', begruendungEn: 'Preparing home purchase, onboard spouse as new client' },
        { kundeId: 'BK00004', name: 'Markus Wagner', match: 78, begruendung: 'Junge Familie mit Neugeborenem – passender Zeitpunkt für ein erstes Eigenheim', begruendungEn: 'Young family with newborn – right time for first own home' },
      ],
    },
    {
      id: 'vorsorgeplus-bundle',
      kategorie: 'familie',
      titel: `${b.vorsorgeBrand} Bundle`,
      titelEn: `${b.vorsorgeBrand} Bundle`,
      status: 'aktiv',
      zeitraum: '15.03.–31.05.2026',
      zielgruppe: 'Junge Familien ohne Absicherung',
      zielgruppeEn: 'Young families without protection',
      photoIcon: 'Users',
      passendeKunden: [
        { kundeId: 'BK00002', name: 'Sandra Müller', match: 94, begruendung: 'Junge Familie, keine BU/Risikoleben vorhanden', begruendungEn: 'Young family, no disability/term life coverage' },
        { kundeId: 'BK00004', name: 'Markus Wagner', match: 87, begruendung: '29 Jahre, frischgebackener Vater – RLV/BU jetzt dringend', begruendungEn: '29 years, brand-new father – RLV/BU urgently needed' },
        { kundeId: 'BK00005', name: 'Andrea Lang', match: 79, begruendung: 'Praxiskredit ohne Absicherung, keine BU', begruendungEn: 'Practice loan without coverage, no disability insurance' },
      ],
    },
    {
      id: 'depot-wechsel',
      kategorie: 'depot',
      titel: 'Depot-Wechsel-Prämie',
      titelEn: 'Custody Transfer Bonus',
      status: 'aktiv',
      zeitraum: '01.04.–30.06.2026',
      zielgruppe: 'Kunden mit Fremdbank-Depots',
      zielgruppeEn: 'Clients with third-party custody accounts',
      photoIcon: 'TrendingUp',
      passendeKunden: [
        { kundeId: 'BK00001', name: 'Klaus Fischer', match: 91, begruendung: 'Trade Republic Depot (28k), ING Tagesgeld (22k) – konsolidieren', begruendungEn: 'Trade Republic portfolio (28k), ING call money (22k) – consolidate' },
        { kundeId: 'BK00003', name: 'Peter Hoffmann', match: 88, begruendung: `Firmendepot-Optimierung, ${b.fundsPartner} als Alternative`, begruendungEn: `Corporate portfolio optimisation, ${b.fundsPartner} as alternative` },
        { kundeId: 'BK00006', name: 'Stefan Braun', match: 82, begruendung: `ETF-Sparplan bei Online-Broker, Wechsel zu ${b.depotProduct}`, begruendungEn: `ETF savings plan with online broker, switch to ${b.depotProduct}` },
      ],
    },
    {
      id: 'tierschutz',
      kategorie: 'gesundheit',
      titel: `${b.insurer} TierSchutz Aktion`,
      titelEn: `${b.insurer} Pet Protection Campaign`,
      status: 'geplant',
      zeitraum: 'Ab 01.05.2026',
      zielgruppe: 'Tierhalter ohne Haftpflicht/KV',
      zielgruppeEn: 'Pet owners without liability/health cover',
      photoIcon: 'Heart',
      passendeKunden: [
        { kundeId: 'BK00002', name: 'Sandra Müller', match: 85, begruendung: 'Fressnapf-Umsätze erkannt, keine Tierhalterhaftpflicht', begruendungEn: 'Pet store purchases detected, no pet liability insurance' },
      ],
    },
  ];
}

function buildVersicherungsKampagnen(institut) {
  const b = getInsuranceBrand(institut);
  return [
    {
      id: 'bu-upgrade',
      kategorie: 'absicherung',
      titel: `${b.buBrand} Upgrade-Aktion`,
      titelEn: `${b.buBrand} Upgrade Campaign`,
      status: 'aktiv',
      zeitraum: '01.03.–30.04.2026',
      zielgruppe: 'Kunden mit BU unter 1.500€/Mon. Rente',
      zielgruppeEn: 'Clients with disability cover below €1,500/mo',
      photoIcon: 'TrendingUp',
      passendeKunden: [
        { kundeId: 'KD00001', name: 'Klaus Fischer', match: 96, begruendung: `BU-Rente 1.800€/mtl. – unter dem 60%-Netto-Bedarf, ${b.buBrand}-Upgrade sinnvoll`, begruendungEn: `DI pension €1,800/mo – below 60% net-income need, ${b.buBrand} upgrade recommended` },
        { kundeId: 'KD00004', name: 'Anna Hoffmann', match: 92, begruendung: 'Ärztin ohne BU, Einkommen 5.500€ – hohes Ausfallrisiko', begruendungEn: 'Physician without DI cover, €5,500 income – high risk' },
        { kundeId: 'KD00002', name: 'Amira König', match: 84, begruendung: 'Designerin, keine BU, Altersneuabschluss lohnt sich', begruendungEn: 'Designer, no DI, new policy worthwhile at this age' },
      ],
    },
    {
      id: 'familien-bundle',
      kategorie: 'familie',
      titel: `${b.rlvBrand} + ${b.hausratBrand} Familien-Bundle`,
      titelEn: `${b.rlvBrand} + ${b.hausratBrand} Family Bundle`,
      status: 'aktiv',
      zeitraum: '15.03.–31.05.2026',
      zielgruppe: 'Familien mit Kindern ohne Absicherung',
      zielgruppeEn: 'Families with children without protection',
      photoIcon: 'Users',
      passendeKunden: [
        { kundeId: 'KD00001', name: 'Klaus Fischer', match: 94, begruendung: '2 Kinder, Hausrat unterversichert (65qm auf 145qm EFH)', begruendungEn: '2 kids, hausrat underinsured (65sqm on 145sqm house)' },
        { kundeId: 'KD00004', name: 'Anna Hoffmann', match: 88, begruendung: 'Junge Familie, RLV-Deckung zu gering', begruendungEn: 'Young family, insufficient term life coverage' },
        { kundeId: 'KD00005', name: 'Klaus Meier', match: 79, begruendung: 'Drei Kinder, RLV-Altbestand 150k€ aktualisieren', begruendungEn: 'Three children, term-life legacy 150k€ to refresh' },
      ],
    },
    {
      id: 'altersvorsorge-check',
      kategorie: 'vorsorge',
      titel: `${b.altersvorsorge} Check`,
      titelEn: `${b.altersvorsorge} Check`,
      status: 'aktiv',
      zeitraum: '01.04.–30.06.2026',
      zielgruppe: 'Kunden 45+ mit Versorgungslücke',
      zielgruppeEn: 'Clients 45+ with pension gap',
      photoIcon: 'TrendingUp',
      passendeKunden: [
        { kundeId: 'KD00007', name: 'Michael Braun', match: 91, begruendung: 'Lehrer 62, in 3 Jahren Pension – Sofortrente prüfen', begruendungEn: 'Teacher 62, retirement in 3 years – immediate annuity worth checking' },
        { kundeId: 'KD00005', name: 'Klaus Meier', match: 86, begruendung: 'Beamter A14, Versorgungslücke bei PKV-Beiträgen im Ruhestand', begruendungEn: 'Civil servant A14, pension gap with PKV premiums in retirement' },
        { kundeId: 'KD00003', name: 'Thomas Weber', match: 81, begruendung: 'Handwerksmeister 55, Betriebsübergabe – private Altersvorsorge aufbauen', begruendungEn: 'Master craftsman 55, business transfer – build private pension' },
      ],
    },
    {
      id: 'zahnzusatz',
      kategorie: 'gesundheit',
      titel: `${b.krankenBrand} Frühbucher`,
      titelEn: `${b.krankenBrand} Early-Bird`,
      status: 'geplant',
      zeitraum: 'Ab 01.05.2026',
      zielgruppe: 'GKV-Versicherte ohne Zahnzusatz',
      zielgruppeEn: 'Statutory health members without dental supplement',
      photoIcon: 'Heart',
      passendeKunden: [
        { kundeId: 'KD00002', name: 'Amira König', match: 87, begruendung: 'GKV-versichert, Wunsch nach ästhetischer Zahnbehandlung', begruendungEn: 'Statutory health, demand for aesthetic dental treatment' },
        { kundeId: 'KD00006', name: 'Lisa Bauer', match: 82, begruendung: 'Jung, keine Zahnzusatz – günstiger Frühbucher-Tarif', begruendungEn: 'Young, no dental supplement – favourable early-bird tariff' },
      ],
    },
  ];
}

/* ── Lebenslagen-Radar (banking) ──────────────────────────────── */
// Kategoriefarben: gedämpft, nur als schmaler Streifen und Punkt (Tokens).
const LEBENSLAGEN_KATEGORIE_FARBEN = {
  immobilie: 'var(--color-success)',
  familie:   'var(--color-info)',
  beruf:     'var(--color-warning)',
  trennung:  'var(--color-info)',
  ruhestand: 'var(--quelle-kommunikation)',
  erbschaft: 'var(--text-tertiary)',
};

const LEBENSLAGEN_RADAR_BANKING = [
  {
    kundeId: 'BK00004',
    customerName: 'Markus Wagner',
    initials: 'MW',
    event: 'Kind bekommen',
    eventEn: 'New baby',
    signals: [
      'Regelmäßige Transaktionen bei DM / Babymarkt seit 2 Mon.',
      'Kindergeld-Eingang Familienkasse neu erkannt',
      'Ausgaben für Kinderarzt + Hebamme in Kontoumsätzen',
      'Recherche: „Riester für Familien" (Newsletter-Klick)',
    ],
    signalsEn: [
      'Regular transactions at DM / baby store for 2 months',
      'New child-benefit credit from family fund detected',
      'Pediatrician + midwife expenses in account activity',
      'Research: "Riester for families" (newsletter click)',
    ],
    signalCount: 4,
    confidence: 96,
    revenue: 3800,
    category: 'familie',
    isNew: true,
  },
  {
    kundeId: 'BK00005',
    customerName: 'Andrea Lang',
    initials: 'AL',
    event: 'Praxis-Erweiterung',
    eventEn: 'Practice expansion',
    signals: [
      'Gewerbeanmeldung Zweitstandort erkannt',
      'Umsatzsteuer-Vorauszahlungen seit 2 Mon. erhöht',
      'Recherche: Gewerbeversicherungen (Newsletter-Klicks)',
      'Kontoumsätze: Praxisausstattung, Webhosting',
    ],
    signalsEn: [
      'Business registration for second location detected',
      'VAT prepayments increased for 2 months',
      'Research: commercial insurance (newsletter clicks)',
      'Account activity: practice equipment, web hosting',
    ],
    signalCount: 4,
    confidence: 89,
    revenue: 2800,
    category: 'beruf',
    isNew: true,
  },
  {
    kundeId: 'BK00002',
    customerName: 'Sandra Müller',
    initials: 'SM',
    event: 'Selbstständigkeit',
    eventEn: 'Self-employment',
    signals: [
      'Wegfall regelmäßiger Gehaltseingang seit 3 Monaten',
      'Stattdessen 4 unterschiedliche Rechnungseingänge / Monat',
      'Gewerbeanmeldung beim Finanzamt erkannt (USt-ID-Nutzung)',
      'Recherche: „Gewerbe-Girokonto", „Steuerrücklage" (Newsletter-Klicks)',
    ],
    signalsEn: [
      'No regular salary credit for 3 months',
      'Instead 4 different invoice payments per month',
      'Business registration with tax office detected (VAT-ID usage)',
      'Research: "business current account", "tax reserve" (newsletter clicks)',
    ],
    signalCount: 4,
    confidence: 92,
    revenue: 2400,
    category: 'beruf',
    isNew: true,
  },
  {
    kundeId: 'BK00003',
    customerName: 'Peter Hoffmann',
    initials: 'PH',
    event: 'Ruhestand / Nachfolge',
    eventEn: 'Retirement / succession',
    signals: [
      'Recherche „GmbH-Nachfolge" über das Online-Banking',
      'Erste Steuerberater-Termine in den Kontoumsätzen',
      'M&A-Beratungs-Anfrage erkannt',
      'Newsletter „Vermögen & Übergabe" aktiviert',
    ],
    signalsEn: [
      'Research "GmbH succession" via online banking',
      'First tax-advisor appointments in account activity',
      'M&A advisory inquiry detected',
      'Newsletter "Wealth & handover" activated',
    ],
    signalCount: 4,
    confidence: 82,
    revenue: 2100,
    category: 'ruhestand',
    isNew: false,
  },
];

/* ── Abwanderungsradar (banking) ──────────────────────────────── */
const ABWANDERUNGS_RADAR_BANKING = [
  {
    kundeId: 'BK00006',
    customerName: 'Stefan Braun',
    initials: 'SB',
    riskLevel: 'high',
    riskScore: 87,
    riskType: 'Gehaltskonto-Wechsel',
    riskTypeEn: 'Salary account switch',
    summary: 'Dauerauftrag 500 € an N26 · Tagesgeld ING neu',
    summaryEn: 'Standing order €500 to N26 · new ING call money',
    signals: [
      'Neuer Dauerauftrag 500 €/Mon. an N26-Konto seit 6 Wochen',
      'Tagesgeldkonto bei ING eröffnet, 15.000 € übertragen',
      'Lastschriften für Strom/Internet auf Fremdkonto umgestellt',
      'Geschäftskonto: Aktivität -40% in 3 Monaten',
      'Kreditanfrage bei Smava erkannt (SCHUFA-Abfrage)',
    ],
    signalsEn: [
      'New standing order €500/mo to N26 account for 6 weeks',
      'Call-money account opened at ING, €15,000 transferred',
      'Direct debits for electricity/internet moved to third-party account',
      'Business account: activity -40% in 3 months',
      'Loan inquiry at Smava detected (SCHUFA query)',
    ],
    clvAtRisk: 24480,
    trend: 'steigend',
  },
  {
    kundeId: 'BK00003',
    customerName: 'Peter Hoffmann',
    initials: 'PH',
    riskLevel: 'medium',
    riskScore: 64,
    riskType: 'Depot-Abwanderung',
    riskTypeEn: 'Portfolio churn',
    summary: 'Trade Republic Sparplan erhöht · Hauptdepot reduziert',
    summaryEn: 'Trade Republic savings plan up · main portfolio down',
    signals: [
      'Trade Republic Sparplan um 200 €/Mon. erhöht',
      'Hauptdepot-Sparplan um 100 €/Mon. reduziert',
      '3 Wertpapierverkäufe im Hauptdepot in 4 Wochen',
      'Newsletter-Tracking: Suche nach „Depotübertrag Trade Republic"',
    ],
    signalsEn: [
      'Trade Republic savings plan increased by €200/mo',
      'Main-portfolio savings plan reduced by €100/mo',
      '3 securities sales in main portfolio within 4 weeks',
      'Newsletter tracking: search for "portfolio transfer Trade Republic"',
    ],
    clvAtRisk: 14210,
    trend: 'stabil',
  },
];

/* ── Lebenslagen-Radar (versicherung) ──────────────────────────── */
const LEBENSLAGEN_RADAR_VERSICHERUNG = [
  {
    kundeId: 'KD00004',
    customerName: 'Anna Hoffmann',
    initials: 'AH',
    event: 'Zweites Kind erwartet',
    eventEn: 'Second child expected',
    signals: [
      'Wiederkehrende Umsätze bei Babymarkt + DM seit 2 Mon.',
      'Newsletter „Familienabsicherung" angeklickt',
      'Hebammen-Rechnungen in den Kontoumsätzen erkannt',
      'Termin beim Gynäkologen ohne Reise-Muster (Vorsorge)',
    ],
    signalsEn: [
      'Recurring purchases at baby store + DM for 2 months',
      'Newsletter "family protection" clicked',
      'Midwife invoices detected in account activity',
      'Gynecologist appointment without travel pattern (check-up)',
    ],
    signalCount: 4,
    confidence: 93,
    revenue: 2400,
    category: 'familie',
    isNew: true,
  },
  {
    kundeId: 'KD00003',
    customerName: 'Thomas Weber',
    initials: 'TW',
    event: 'Betriebsübergabe Handwerk',
    eventEn: 'Trade business handover',
    signals: [
      'Sohn Jan (25) tritt ins Unternehmen ein (LinkedIn)',
      'Recherche „Betriebsnachfolge Handwerk" über die Webseite',
      'Neuer Steuerberater-Dauerauftrag sichtbar',
      'Anfrage Betriebshaftpflicht-Anpassung',
    ],
    signalsEn: [
      'Son Jan (25) joins the company (LinkedIn)',
      'Research "trade business succession" via website',
      'New tax-advisor standing order visible',
      'Request to adjust commercial liability cover',
    ],
    signalCount: 4,
    confidence: 87,
    revenue: 3200,
    category: 'beruf',
    isNew: true,
  },
  {
    kundeId: 'KD00007',
    customerName: 'Michael Braun',
    initials: 'MB',
    event: 'Näherrückender Ruhestand',
    eventEn: 'Approaching retirement',
    signals: [
      'Pension in 36 Monaten fällig (Beamter Gymnasium)',
      'Recherche „Sofortrente vs. Auszahlplan" im Portal',
      'Sparplan-Erhöhung um 200 €/Mon.',
      'Newsletter „Ruhestandsplanung" aktiviert',
    ],
    signalsEn: [
      'Pension due in 36 months (civil-servant teacher)',
      'Research "immediate annuity vs. payout plan" in portal',
      'Savings plan increased by €200/mo',
      'Newsletter "retirement planning" activated',
    ],
    signalCount: 4,
    confidence: 82,
    revenue: 1800,
    category: 'ruhestand',
    isNew: false,
  },
];

/* ── Abwanderungsradar (versicherung) ──────────────────────────── */
// Wichtig: Nur Signale aus Datenquellen, auf die der Versicherer tatsächlich
// Zugriff hat. Stärkstes öffentliches Signal ist eine FiDA-Datenanfrage
// (Financial Data Access-Verordnung, EU 2024/..., Anwendung ab 2026): Wenn
// ein Kunde einem konkurrierenden Versicherer oder einem FISP (Financial
// Information Service Provider) per SCA Consent gibt, seine Vertrags-,
// Schaden- und Prämiendaten abzurufen, sieht der haltende Versicherer diese
// Datenübermittlungsanfrage mit Empfänger, Zweck und Umfang — ein deutlich
// stärkeres Churn-Signal als Browser-/Vergleichsportal-Tracking
// (Check24 etc., was für Versicherer gar nicht beobachtbar ist).
const ABWANDERUNGS_RADAR_VERSICHERUNG = [
  {
    kundeId: 'KD00006',
    customerName: 'Lisa Bauer',
    initials: 'LB',
    riskLevel: 'high',
    riskScore: 84,
    riskType: 'KFZ-Wechsel zum Online-Versicherer',
    riskTypeEn: 'Switch of motor cover to online insurer',
    summary: 'FiDA-Datenanfrage von HUK24 · Portal-Kündigungsassistent geöffnet',
    summaryEn: 'FiDA data request from HUK24 · portal cancellation assistant opened',
    signals: [
      'FiDA-Datenübermittlungsanfrage von „HUK24 Versicherung AG" (Consent via SCA am 08.04.). Umfang: Kfz-Vertragsdaten, Schadenhistorie, aktuelle Prämie',
      'Kündigungsassistent im eigenen Kundenportal für Kfz-Vertrag 2× gestartet (keine Absendung)',
      'Kein Portal-Login seit 11 Wochen, E-Mail-Öffnungsrate auf 0 % gefallen',
      'Jahresgespräch 2× abgesagt, keine Reaktion auf letzte 3 Servicemails',
    ],
    signalsEn: [
      'FiDA data-transfer request from "HUK24 Versicherung AG" (consent via SCA on 08.04.). Scope: motor policy data, claims history, current premium',
      'Cancellation assistant for motor policy started 2× in own customer portal (not submitted)',
      'No portal login for 11 weeks, email open rate dropped to 0%',
      'Annual review cancelled 2×, no response to last 3 service emails',
    ],
    clvAtRisk: 14600,
    trend: 'steigend',
  },
  {
    kundeId: 'KD00003',
    customerName: 'Thomas Weber',
    initials: 'TW',
    riskLevel: 'medium',
    riskScore: 58,
    riskType: 'Betriebshaftpflicht-Verlagerung',
    riskTypeEn: 'Commercial liability migration',
    summary: 'FiDA-Anfrage eines Maklers · negatives NPS · offener Großschaden',
    summaryEn: 'FiDA request from a broker · negative NPS · open major claim',
    signals: [
      'FiDA-Datenübermittlungsanfrage eines unabhängigen Maklers (FISP „AssekuranzFinder GmbH"). Umfang: Gewerbehaftpflicht, Prämienhistorie 3 Jahre',
      'NPS-Score von 8 auf 3 gefallen, Kommentar: „Beitrag unverhältnismäßig"',
      'Offener Betriebsschaden seit 6 Wochen nicht abschließend reguliert',
      'Beitragsrückerstattungsanfrage für Jahresprämie 2025 eingegangen',
    ],
    signalsEn: [
      'FiDA data-transfer request from an independent broker (FISP "AssekuranzFinder GmbH"). Scope: commercial liability, 3-year premium history',
      'NPS score dropped from 8 to 3, comment: "premium disproportionate"',
      'Open business claim not fully settled for 6 weeks',
      'Premium-refund request received for 2025 annual premium',
    ],
    clvAtRisk: 8900,
    trend: 'stabil',
  },
];

const RISK_LEVEL_FARBEN = {
  high:   { stripe: 'var(--color-danger)',  bg: 'var(--tint-danger)',  text: 'var(--color-danger)',   labelKey: 'risikoHoch' },
  medium: { stripe: 'var(--color-warning)', bg: 'var(--tint-warning)', text: 'var(--color-warning)',  labelKey: 'risikoMittel' },
  low:    { stripe: 'var(--text-tertiary)', bg: 'var(--bg-inset)',     text: 'var(--text-secondary)', labelKey: 'risikoNiedrig' },
};

const PROVISIONSABRECHNUNGEN = {
  versicherung: [
    { monat: tx('Februar 2026', 'February 2026'), betrag: 8420, datum: '01.03.2026' },
    { monat: tx('Januar 2026', 'January 2026'), betrag: 7890, datum: '01.02.2026' },
    { monat: tx('Dezember 2025', 'December 2025'), betrag: 9150, datum: '02.01.2026' },
  ],
  banking: [
    { monat: tx('Februar 2026', 'February 2026'), betrag: 24800, datum: '01.03.2026' },
    { monat: tx('Januar 2026', 'January 2026'), betrag: 21400, datum: '01.02.2026' },
    { monat: tx('Dezember 2025', 'December 2025'), betrag: 26400, datum: '02.01.2026' },
  ],
  vermoegensverwaltung: [
    { monat: 'Q4/2025', betrag: 285000, datum: '15.01.2026' },
    { monat: 'Q3/2025', betrag: 248000, datum: '15.10.2025' },
    { monat: 'Q2/2025', betrag: 221000, datum: '15.07.2025' },
  ],
};

// Hyperpersonalisierte Produkte – extrem kurze Release-Zyklen, Time-to-Market
// in Tagen statt Monaten. Pro Modus zwei Beispielprodukte mit jeweils einem
// USP-Baustein (extra-Baustein), passendem Match-Score und einer Liste
// gemappter Bestandskunden, die das Produkt aufgrund ihres Profils brauchen
// (Beruf, Einkommen, Familie, Lebenslage). Die Kundennamen/IDs spiegeln
// reale Datensätze aus KUNDEN_BY_MODE wider, damit der Klick auf eine Karte
// den Berater direkt in die Detail-Stammdaten führen kann.
const HYPERPERSONALISIERTE_PRODUKTE = {
  versicherung: [
    {
      id: 'hnw-unfall',
      titel: 'Unfallschutz Plus',
      titelEn: 'Accident Cover Plus',
      tagline: 'Unfallpolice mit Reha- und Wohnumbau-Baustein',
      taglineEn: 'Accident policy with a rehab and home-modification module',
      zielgruppe: 'Berufstätige und Familien mit erhöhter Unfallexposition',
      zielgruppeEn: 'Working professionals and families with higher accident exposure',
      timeToMarket: 18,
      releaseZyklus: '6 Wochen',
      releaseZyklusEn: '6 weeks',
      versionsLabel: 'v2026.03 · Live seit 02.05.2026',
      versionsLabelEn: 'v2026.03 · Live since 02 May 2026',
      monatsBeitrag: '12–48 EUR',
      monatsBeitragEn: '€12–48',
      icon: 'Shield',
      bausteinIcon: 'Activity',
      bausteinTitel: 'Reha-Management und Wohnumbau-Hilfe',
      bausteinTitelEn: 'Rehab management and home-modification support',
      bausteinBeschreibung:
        'Progressive Invaliditätsleistung mit hoher Gliedertaxe. Nach einem versicherten Unfall organisiert ein persönliches Reha-Fallmanagement die Anschlussbehandlung und Therapieplätze. Zusätzlich gibt es einen Einmalzuschuss für einen notwendigen barrierefreien Wohnumbau (z. B. bodengleiche Dusche, Treppenlift). Optional sind die Kosten einer kosmetischen Operation nach einem Unfall mitversichert.',
      bausteinBeschreibungEn:
        'Progressive disability benefit with a high dismemberment scale. After a covered accident a personal rehab case manager organises follow-up treatment and therapy slots. There is also a one-off grant towards a necessary barrier-free home modification (e.g. a level-access shower or a stairlift). The cost of cosmetic surgery following an accident can optionally be included.',
      bausteinHighlights: [
        'Progressive Invaliditätsleistung',
        'Reha-Fallmanagement nach Unfall',
        'Einmalzuschuss barrierefreier Umbau',
        'Kosmetische OP nach Unfall (optional)',
      ],
      bausteinHighlightsEn: [
        'Progressive disability benefit',
        'Rehab case management after an accident',
        'One-off grant for barrier-free conversion',
        'Cosmetic surgery after an accident (optional)',
      ],
      passendeKunden: [
        {
          kundeId: 'KD00003', name: 'Thomas Weber', match: 96,
          begruendung: 'Handwerksmeister (Weber Sanitär) mit körperlicher Tätigkeit und Montageeinsätzen: erhöhtes Unfallrisiko, bisher keine Unfallpolice.',
          begruendungEn: 'Master craftsman (Weber Sanitär) doing physical work and on-site installations: elevated accident risk, no accident policy so far.',
        },
        {
          kundeId: 'KD00004', name: 'Anna Hoffmann', match: 88,
          begruendung: 'Ärztin mit Eigenheim und Kind Emma (3 J.). Wohnumbau- und Reha-Baustein passt zur Familiensituation, keine bestehende Unfallabsicherung.',
          begruendungEn: 'Physician with her own home and child Emma (3 yrs). The home-modification and rehab module fits the family situation; no existing accident cover.',
        },
        {
          kundeId: 'KD00008', name: 'Sandra Yilmaz', match: 84,
          begruendung: 'Pharma-Referentin mit hoher Reisetätigkeit (Außendienst). Erhöhte Wege-Unfallexposition, progressive Invaliditätsleistung sinnvoll.',
          begruendungEn: 'Pharma rep with frequent travel (field sales). Higher commuting-accident exposure; a progressive disability benefit makes sense.',
        },
      ],
    },
    {
      id: 'flexcare-pflege',
      titel: 'Pflegeschutz Eltern-Kind',
      titelEn: 'Care Cover Parent-Child',
      tagline: 'Pflegezusatz mit optionalem Eltern-Modul',
      taglineEn: 'Supplementary care cover with an optional parent module',
      zielgruppe: 'Berufstätige 35–55 J. mit pflegerelevanten Eltern',
      zielgruppeEn: 'Working professionals aged 35–55 with care-relevant parents',
      timeToMarket: 21,
      releaseZyklus: '8 Wochen',
      releaseZyklusEn: '8 weeks',
      versionsLabel: 'v2026.02 · Live seit 14.04.2026',
      versionsLabelEn: 'v2026.02 · Live since 14 Apr 2026',
      monatsBeitrag: '19–69 EUR',
      monatsBeitragEn: '€19–69',
      icon: 'Heart',
      bausteinIcon: 'Users',
      bausteinTitel: 'Eltern-Modul und Pflegeantrag-Assistent',
      bausteinTitelEn: 'Parent module and care-application assistant',
      bausteinBeschreibung:
        'Pflegetagegeld mit frei wählbarer Leistungshöhe. Optional lassen sich ein oder beide Elternteile gegen vereinfachte Gesundheitsfragen mitversichern. Ein digitaler Assistent unterstützt im Pflegefall beim Antrag auf einen Pflegegrad bei der Pflegekasse. Einmal jährlich erstellt ein Steuerbeleg-Service eine Übersicht der absetzbaren Pflegekosten für die Steuererklärung.',
      bausteinBeschreibungEn:
        'Care per-diem benefit with a freely selectable benefit level. One or both parents can optionally be co-insured subject to simplified health questions. In a care event a digital assistant helps file the care-level application with the statutory care fund. Once a year a tax-statement service produces an overview of deductible care costs for the tax return.',
      bausteinHighlights: [
        'Optionales Eltern-Modul (Gesundheitsfragen)',
        'Digitaler Pflegegrad-Antrag',
        'Jahres-Steuerbeleg Pflegekosten',
        'Leistungshöhe flexibel wählbar',
      ],
      bausteinHighlightsEn: [
        'Optional parent module (health questions)',
        'Digital care-level application',
        'Annual tax statement for care costs',
        'Flexible, selectable benefit level',
      ],
      passendeKunden: [
        {
          kundeId: 'KD00001', name: 'Klaus Fischer', match: 92,
          begruendung: 'Sandwich-Generation: 42 J., 2 kleine Kinder, Eltern Mitte 70 ohne Pflegeabsicherung. Eltern-Modul besonders relevant.',
          begruendungEn: 'Sandwich generation: 42 yrs, 2 young children, parents in their mid-70s with no care cover. The parent module is especially relevant.',
        },
        {
          kundeId: 'KD00003', name: 'Thomas Weber', match: 88,
          begruendung: 'Mutter Renate (79) mit steigendem Pflegerisiko (regelmäßige Apothekenausgaben). Eigene Police bisher ohne Eltern-Modul.',
          begruendungEn: 'Mother Renate (79) with rising care risk (regular pharmacy spending). His own policy has no parent module so far.',
        },
        {
          kundeId: 'KD00007', name: 'Michael Braun', match: 84,
          begruendung: 'Lehrer (62) kurz vor der Pension. Pflegezusatz als Eigenabsicherung mit flexibler Leistungshöhe sinnvoll.',
          begruendungEn: 'Teacher (62) close to retirement. Supplementary care cover as self-protection with a flexible benefit level makes sense.',
        },
      ],
    },
  ],
  banking: [
    {
      id: 'family-office-liquidity',
      titel: 'Liquiditäts-Sweep Privatvermögen',
      titelEn: 'Private-Wealth Liquidity Sweep',
      tagline: 'Automatischer Tagesgeld-Sweep mit Festgeld-Treppe',
      taglineEn: 'Automated call-money sweep with a fixed-deposit ladder',
      zielgruppe: 'Einlagen ≥ 250.000 EUR mit schwankender Liquidität',
      zielgruppeEn: 'Deposits ≥ €250,000 with fluctuating liquidity',
      timeToMarket: 12,
      releaseZyklus: '4 Wochen',
      releaseZyklusEn: '4 weeks',
      versionsLabel: 'v2026.04 · Live seit 22.04.2026',
      versionsLabelEn: 'v2026.04 · Live since 22 Apr 2026',
      monatsBeitrag: '0 EUR (Konditionsmodell)',
      monatsBeitragEn: '€0 (conditions-based)',
      icon: 'Layers',
      bausteinIcon: 'GitMerge',
      bausteinTitel: 'Auto-Sweep und Festgeld-Treppe',
      bausteinTitelEn: 'Auto-sweep and fixed-deposit ladder',
      bausteinBeschreibung:
        'Liegt der Saldo auf dem Girokonto über einem frei wählbaren Schwellenwert, wird der Überschuss automatisch über Nacht auf ein höher verzinstes Tagesgeldkonto gebucht. Mittel, die kurzfristig nicht gebraucht werden, verteilt das System auf eine Festgeld-Treppe über 3, 6 und 12 Monate, so bleibt Liquidität gestaffelt verfügbar. Ein konsolidiertes Monatsreporting zeigt alle Konten auf einen Blick.',
      bausteinBeschreibungEn:
        'When the current-account balance exceeds a freely chosen threshold, the surplus is automatically swept overnight into a higher-yield call-money account. Funds not needed in the short term are spread across a fixed-deposit ladder over 3, 6 and 12 months, so liquidity stays available in stages. A consolidated monthly report shows all accounts at a glance.',
      bausteinHighlights: [
        'Auto-Sweep vom Giro aufs Tagesgeld ab Schwellenwert',
        'Festgeld-Treppe 3 / 6 / 12 Monate',
        'Jederzeit anpassbarer Schwellenwert',
        'Konsolidiertes Monatsreporting',
      ],
      bausteinHighlightsEn: [
        'Auto-sweep from current to call money above threshold',
        'Fixed-deposit ladder 3 / 6 / 12 months',
        'Threshold adjustable at any time',
        'Consolidated monthly reporting',
      ],
      passendeKunden: [
        {
          kundeId: 'BK00003', name: 'Peter Hoffmann', match: 95,
          begruendung: 'GmbH-Geschäftsführer mit hohen Bonus-Tranchen; Liquidität schwankt zwischen 280k und 1,2 Mio EUR, aktuell überwiegend unverzinst auf dem Girokonto.',
          begruendungEn: 'Managing director with large bonus tranches; liquidity fluctuates between €280k and €1.2m, currently mostly uninvested in the current account.',
        },
        {
          kundeId: 'BK00005', name: 'Andrea Lang', match: 90,
          begruendung: 'Ärztin mit eigener Praxis. Liquiditätspuffer Praxis und privat ≈ 620.000 EUR auf zwei Konten; Sweep und Staffelung sparen Zinsverlust.',
          begruendungEn: 'Physician with her own practice. Liquidity buffer (practice and private) ≈ €620,000 across two accounts; sweep and laddering avoid lost interest.',
        },
        {
          kundeId: 'BK00001', name: 'Klaus Fischer', match: 78,
          begruendung: 'Erbschaftsantritt 2025 (≈ 480.000 EUR) liegt bisher nur auf Tagesgeld mit 0,5 %; Festgeld-Treppe erhöht den Ertrag bei planbarer Verfügbarkeit.',
          begruendungEn: 'Inheritance received in 2025 (≈ €480,000) currently sits only in call money at 0.5%; a fixed-deposit ladder raises the yield with predictable availability.',
        },
      ],
    },
    {
      id: 'nextgen-erbe',
      titel: 'Erbschafts-Starterpaket',
      titelEn: 'Inheritance Starter Package',
      tagline: 'Tagesgeld + ETF-Sparplan + Steuer-Erstberatung',
      taglineEn: 'Call money + ETF savings plan + initial tax advice',
      zielgruppe: '25–40 J., Erbschaft/Schenkung ≥ 50.000 EUR',
      zielgruppeEn: 'Aged 25–40, inheritance/gift ≥ €50,000',
      timeToMarket: 9,
      releaseZyklus: '3 Wochen',
      releaseZyklusEn: '3 weeks',
      versionsLabel: 'v2026.05 · Live seit 28.04.2026',
      versionsLabelEn: 'v2026.05 · Live since 28 Apr 2026',
      monatsBeitrag: '9,90 EUR (Paketpreis)',
      monatsBeitragEn: '€9.90 (package price)',
      icon: 'Rocket',
      bausteinIcon: 'Briefcase',
      bausteinTitel: 'Erbschaftsteuer-Check und Auszahlplan',
      bausteinTitelEn: 'Inheritance-tax check and payout plan',
      bausteinBeschreibung:
        'Paket aus einem Tagesgeldkonto für die Reserve und einem ETF-Sparplan über einen Robo-Advisor mit drei Risikoprofilen. Dazu kommt eine einmalige Beratung zu Erbschaft- und Schenkungsteuer (Freibeträge, Fristen) sowie ein strukturierter Auszahlplan, der das geerbte Vermögen über einen frei wählbaren Zeitraum verteilt.',
      bausteinBeschreibungEn:
        'A package combining a call-money account for the reserve and an ETF savings plan via a robo-advisor with three risk profiles. It is rounded off by a one-off advisory session on inheritance and gift tax (allowances, deadlines) and a structured payout plan that spreads the inherited assets over a freely chosen period.',
      bausteinHighlights: [
        'ETF-Sparplan (Robo, 3 Risikoprofile)',
        'Tagesgeld für die Reserve',
        'Einmal-Beratung Erbschaft-/Schenkungsteuer',
        'Strukturierter Auszahlplan',
      ],
      bausteinHighlightsEn: [
        'ETF savings plan (robo, 3 risk profiles)',
        'Call money for the reserve',
        'One-off inheritance / gift-tax advice',
        'Structured payout plan',
      ],
      passendeKunden: [
        {
          kundeId: 'BK00004', name: 'Markus Wagner', match: 93,
          begruendung: '29 J., junge Familie, Schenkung der Eltern 180.000 EUR (Kontoeingang 03/2026) bisher ungenutzt auf dem Girokonto. Sucht Anlagestrategie und Steuerberatung.',
          begruendungEn: '29 yrs, young family, gift from parents of €180,000 (account credit 03/2026) so far unused in the current account. Looking for an investment strategy and tax advice.',
        },
        {
          kundeId: 'BK00006', name: 'Stefan Braun', match: 89,
          begruendung: '36 J., Erbschaft der Großmutter 240.000 EUR (Q4/2025) unverändert auf dem Girokonto. Hohe Affinität für digitale Tools und Sparpläne.',
          begruendungEn: '36 yrs, inheritance from his grandmother of €240,000 (Q4/2025) untouched in the current account. High affinity for digital tools and savings plans.',
        },
        {
          kundeId: 'BK00002', name: 'Sandra Müller', match: 84,
          begruendung: '33 J., Schenkung der Eltern für einen Hauskauf in Vorbereitung. Wunsch nach Beratung zur Schenkungsteuer und einer planbaren Auszahlung.',
          begruendungEn: '33 yrs, a gift from her parents for a home purchase is in preparation. Wants advice on gift tax and a predictable payout.',
        },
      ],
    },
  ],
};

const PRODUKT_ICONS = { Gem, Heart, Layers, Rocket, Plane, Hourglass, GitMerge, Users, Shield, Briefcase, Activity, Sparkles };

// Kategoriefarbe der Marketingkampagnen: ein Farbband oben mit dem Icon,
// darunter eine zart getönte Fläche in derselben Farbe, damit die vier
// Kacheln als Farbtupfer im hellen Cockpit stehen (keine Verläufe).
const KAMPAGNEN_KATEGORIE_FARBEN = {
  immobilie:   'var(--color-success)',
  familie:     'var(--color-info)',
  depot:       'var(--quelle-kommunikation)',
  vorsorge:    'var(--quelle-kommunikation)',
  absicherung: 'var(--quelle-lebensereignis)',
  gesundheit:  'var(--color-warning)',
};

// Uhrzeit des nächtlichen Agentenlaufs (Demo). demoClock liefert nur den
// „Nacht simulieren"-Zustand und keinen Zeitstempel, deshalb steht die
// Uhrzeit hier; das Datum kommt aus dem aktuellen Tag.
const AGENTEN_NACHTLAUF_UHRZEIT = '05:30';

// Status-Punkt der Agenten-Chips: Erfolg, Hinweis, Handlungsbedarf.
const AGENT_TONE = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger:  'var(--color-danger)',
};

/* ── kleine Bausteine der Übersicht ───────────────────────────── */

// Trefferquote als zart getönter Badge: ab 90 % grün, ab 80 % oliv, sonst gelb.
function matchBadgeStyle(match) {
  if (match >= 90) return { background: 'var(--tint-success)', color: 'var(--color-success)' };
  if (match >= 80) return { background: 'var(--color-lime-100)', color: 'var(--color-lime-700)' };
  return { background: 'var(--tint-warning)', color: 'var(--color-warning)' };
}

function MatchBadge({ match, suffix }) {
  return (
    <span
      className="rh-badge text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold whitespace-nowrap"
      style={matchBadgeStyle(match)}
    >
      {match}%{suffix ? ` ${suffix}` : ''}
    </span>
  );
}

// Status „Aktiv/Geplant": getönte Fläche mit Punkt; auf dem dunklen Hero als
// helles Glas.
function StatusChip({ aktiv, label, glass = false }) {
  const style = glass
    ? { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: 'var(--text-on-dark)' }
    : aktiv
      ? { background: 'var(--tint-success)', color: 'var(--color-success)' }
      : { background: 'var(--tint-warning)', color: 'var(--color-warning)' };
  const dot = glass ? (aktiv ? 'var(--color-emerald-400)' : 'var(--color-amber-400)') : 'currentColor';
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
      style={style}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
      {label}
    </span>
  );
}

// Zart getönter Badge: Fläche aus --tint-*, Text in der Statusfarbe, kein
// Rahmen in Signalfarbe.
const TINT_TONES = {
  success: ['var(--tint-success)', 'var(--color-success)'],
  warning: ['var(--tint-warning)', 'var(--color-warning)'],
  danger:  ['var(--tint-danger)', 'var(--color-danger)'],
  info:    ['var(--tint-info)', 'var(--color-info)'],
  neutral: ['var(--bg-inset)', 'var(--text-secondary)'],
  mode:    ['var(--mode-primary-soft)', 'var(--mode-primary)'],
};

function TintBadge({ tone = 'info', icon: Icon, children, className = '', small = false }) {
  const [bg, fg] = TINT_TONES[tone] || TINT_TONES.info;
  return (
    <span
      className={`rh-badge inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${small ? 'text-[10px] px-2 py-0.5 uppercase tracking-wider' : 'text-xs px-2.5 py-1'} ${className}`}
      style={{ background: bg, color: fg }}
    >
      {Icon && <Icon size={small ? 10 : 12} strokeWidth={2.25} />}
      {children}
    </span>
  );
}

// Kartenkopf: einfarbiges Icon in zart getönter Modusfläche + Titel.
function CardTitle({ icon: Icon, children, badge, dot }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'var(--mode-primary-soft)' }}
      >
        <Icon size={16} style={{ color: 'var(--mode-primary)' }} strokeWidth={1.75} />
        {dot}
      </div>
      <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{children}</h3>
      {badge}
    </div>
  );
}

// Modal-Hülle: heller Backdrop mit Unschärfe, Fläche surface-elevated.
// Modals werden per Portal in den Modus-Wrapper gehängt (portalRoot): Vorfahren mit
// transform (z. B. die Einblend-Animation der Tab-Fläche) würden sonst zum
// Bezugsrahmen der fixed-Positionierung und das Modal in der Seitenmitte
// statt im Sichtfenster zentrieren.
function ModalShell({ onClose, children, className = 'max-w-3xl' }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(28, 26, 23, 0.45)' }}
      onClick={onClose}
    >
      <div
        className={`surface-elevated rounded-2xl w-full ${className} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    portalRoot()
  );
}

// Hero der Modals: die einzige dunkle Fläche (Modus-Verlauf, weiße Schrift).
function ModalHero({ icon: Icon, chips, title, subtitle, onClose, closeLabel }) {
  return (
    <div className="relative flex items-center gap-4 px-7 py-6 overflow-hidden" style={{ background: 'var(--mode-gradient)' }}>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}
      >
        <Icon size={30} className="text-white" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">{chips}</div>
        <h2 className="text-xl font-semibold text-white truncate">{title}</h2>
        <p className="text-sm mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.72)' }}>{subtitle}</p>
      </div>
      <button
        onClick={onClose}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white transition-colors shrink-0 hover:bg-white/20"
        style={{ background: 'rgba(255,255,255,0.12)' }}
        aria-label={closeLabel}
      >
        <X size={18} strokeWidth={2} />
      </button>
    </div>
  );
}

function GlassChip({ children }) {
  return (
    <span
      className="text-[11px] font-mono px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)' }}
    >
      {children}
    </span>
  );
}

function KpiTile({ label, value, accent }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-light)' }}>
      <div className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
      <div className="text-xl font-semibold font-mono" style={{ color: accent || 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function Kicker({ icon: Icon, children }) {
  return (
    <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
      <Icon size={12} /> {children}
    </h4>
  );
}

const BTN_GHOST = 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-(--text-secondary) hover:bg-(--bg-inset)';
const BTN_SECONDARY = 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors surface-inset text-(--text-primary) hover:bg-(--bg-card)';
const BTN_PRIMARY = 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors bg-(--mode-primary) hover:bg-(--mode-primary-light)';

function scrollToCard(id) {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function UebersichtTab() {
  const { modeId, config, navigateTo, setActiveTab } = useMode();
  const { t, tn, lang } = useTranslation();
  // Picks the English variant of a demo-data field when the UI is in English,
  // otherwise falls back to the German original. Keeps the long marketing
  // strings (radar signals, USP-Bausteine, Begründungen) reactive to the
  // language switch without restructuring every data object.
  const L = (de, en) => (lang === 'en' && en != null ? en : de);
  const numberLocale = lang === 'en' ? 'en-GB' : 'de-DE';
  const [mandatFilter, setMandatFilter] = useState('alle');
  const [expandedKampagne, setExpandedKampagne] = useState('fruehlings-baufi');
  const [kampagneModal, setKampagneModal] = useState(null);
  const [produktModal, setProduktModal] = useState(null);
  const hyperPersonalisierteProdukte = HYPERPERSONALISIERTE_PRODUKTE[modeId] || [];
  const showHyperProdukte = (modeId === 'banking' || modeId === 'versicherung') && hyperPersonalisierteProdukte.length > 0;
  // Marketingkampagnen are derived from the active institut so the campaign
  // titles always reflect the current institut's brand (no Volksbank-only
  // names leaking into Zukunftsbank, Sparkasse etc. — and no ERGO-only names
  // leaking into Allianz, AXA, Zurich etc. on the insurance side).
  const marketingKampagnen = useMemo(
    () => modeId === 'versicherung'
      ? buildVersicherungsKampagnen(config.institut)
      : buildBankingKampagnen(config.institut),
    [modeId, config.institut]
  );
  // Radar-Daten (Lebenslagen + Abwanderung) sind pro Modus gepflegt, damit
  // Versicherung und Banking jeweils ihre eigenen Signale und Risikokunden
  // oben auf der Übersicht sehen.
  const lebenslagenRadar = modeId === 'versicherung'
    ? LEBENSLAGEN_RADAR_VERSICHERUNG
    : LEBENSLAGEN_RADAR_BANKING;
  const abwanderungsRadar = modeId === 'versicherung'
    ? ABWANDERUNGS_RADAR_VERSICHERUNG
    : ABWANDERUNGS_RADAR_BANKING;
  const showRadarUndKampagnen = modeId === 'banking' || modeId === 'versicherung';

  // VV: Kunden mit Mandatsinformationen
  const vvKunden = useMemo(() => modeId === 'vermoegensverwaltung' ? (KUNDEN_BY_MODE.vermoegensverwaltung || []).map(k => {
    const mandat = (k.eigeneProdukte || []).find(p => p.typ === 'mandat');
    const letzteKomm = (k.kommunikation || []).sort((a, b) => b.datum.localeCompare(a.datum))[0];
    const leadsCount = (k.potentiale || []).length;
    const istNeu = mandat && (mandat.status === 'onboarding' || (mandat.seit && mandat.seit >= '2025-06'));
    return { ...k, mandat, letzteKomm, leadsCount, istNeu };
  }) : [], [modeId]);
  const filteredVVKunden = useMemo(() => vvKunden.filter(k => {
    if (mandatFilter === 'neu') return k.istNeu;
    if (mandatFilter === 'bestand') return !k.istNeu;
    return true;
  }), [vvKunden, mandatFilter]);

  // Demo-Zeitmaschine: nach „Nacht simulieren" wird der Beratungstermin der
  // Hero-Demo-Kundin bzw. des Hero-Demo-Kunden oben mit „+1"-Badge in die
  // Liste injiziert. Banking: Klaus Fischer (Kreditgespräch). Versicherung:
  // Klaus Fischer (BU-Nachversicherung).
  const dayAdvanced = useDayAdvanced();
  const baseTermine = TERMINE_BY_MODE[modeId] || TERMINE_BY_MODE.versicherung;
  // Kunden des aktiven Modus frühzeitig dereferenzieren, damit die Daten
  // geladen sind, wenn der „+1 Neu"-Termin angeklickt wird (Suspense-Promise).
  const modeKunden = (modeId === 'banking' || modeId === 'versicherung')
    ? (KUNDEN_BY_MODE[modeId] || [])
    : [];
  const heroTermin = useMemo(() => {
    if (!dayAdvanced) return null;
    if (modeId === 'banking') {
      const klaus = modeKunden.find(k => k.id === 'BK00001');
      if (!klaus) return null;
      const appt = getSimulatedAppointment();
      return {
        kundeId: klaus.id,
        kunde: klaus.name,
        foto: getKundeFoto(klaus.id),
        datum: appt.toISOString().slice(0, 10),
        zeit: formatAppointmentTime(appt),
        betreff: t('kreditgespraechImmoFinanzierung'),
        istNeuZugestimmt: true,
      };
    }
    if (modeId === 'versicherung') {
      const peter = modeKunden.find(k => k.id === 'KD00001');
      if (!peter) return null;
      const appt = getSimulatedAppointment();
      return {
        kundeId: peter.id,
        kunde: peter.name,
        foto: getKundeFoto(peter.id),
        datum: appt.toISOString().slice(0, 10),
        zeit: formatAppointmentTime(appt),
        betreff: t('versicherungsOptimierungstermin'),
        istNeuZugestimmt: true,
      };
    }
    return null;
  }, [dayAdvanced, modeId, modeKunden]);
  const termine = (heroTermin
    ? [heroTermin, ...baseTermine]
    : baseTermine).slice(0, 5);
  const [terminPrep, setTerminPrep] = useState(null); // { kunde, termin }
  // Radar-Modal: Klick auf Lebenslagen-/Abwanderungs-Eintrag oeffnet erst
  // eine HTML-aufbereitete Erklaerung mit Signalen und KPIs, nicht direkt
  // den Kunden.
  const [radarModal, setRadarModal] = useState(null); // { type, entry }
  const allAufgaben = AUFGABEN_BY_MODE[modeId] || AUFGABEN_BY_MODE.versicherung;
  // Bei Zukunftsbank gibt es kein „VR-FinanzPlan" — diese VR-spezifische
  // Aufgabe filtern wir hier aus, damit das Branding stimmt.
  const isZukunftsbank = config.institut === 'Zukunftsbank';
  const aufgaben = isZukunftsbank
    ? allAufgaben.filter(a => !/VR-?FinanzPlan/i.test(a.text || ''))
    : allAufgaben;
  const miniKpis = MINI_KPIS[modeId] || MINI_KPIS.versicherung;
  const tagesItems = TAGESSTART_ITEMS[modeId] || TAGESSTART_ITEMS.versicherung;
  const abschluesse = LETZTE_ABSCHLUESSE[modeId] || LETZTE_ABSCHLUESSE.versicherung;
  const geburtstage = GEBURTSTAGE[modeId] || GEBURTSTAGE.versicherung;
  const allSchnellzugriff = SCHNELLZUGRIFF[modeId] || SCHNELLZUGRIFF.versicherung;
  const schnellzugriff = isZukunftsbank
    ? allSchnellzugriff.filter(s => !/VR-?FinanzPlan|finanzplan/i.test(s.labelKey || s.label || ''))
    : allSchnellzugriff;
  const abrechnungen = PROVISIONSABRECHNUNGEN[modeId] || PROVISIONSABRECHNUNGEN.versicherung;

  const heute = new Date();
  const datumStr = heute.toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const nachtlaufDatum = heute.toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // ── KI-Agenten-Leiste ────────────────────────────────────────────
  // Datenkonsistenz: jede Zahl kommt aus genau dem Array, das die zugehörige
  // Kachel weiter unten rendert (Radare, Kampagnen, Termine, Aufgaben,
  // Mandate, Abschlüsse). Keine eigenen Konstanten.
  const neueLebenslagen = lebenslagenRadar.filter((l) => l.isNew).length;
  const kampagnenTreffer = marketingKampagnen.reduce((s, k) => s + k.passendeKunden.length, 0);
  const kampagnenAktiv = marketingKampagnen.filter((k) => k.status === 'aktiv').length;
  const aufgabenHeute = aufgaben.filter((a) => /^(heute|today)$/i.test(String(a.faellig || '').trim())).length;
  const vvLeads = vvKunden.reduce((s, k) => s + k.leadsCount, 0);
  const agenten = [
    ...(showRadarUndKampagnen ? [
      {
        id: 'signal', icon: Radar, target: 'ueb-lebenslagen', tone: 'success',
        name: L('Signal-Agent', 'Signal agent'),
        value: lebenslagenRadar.length,
        text: L('Lebenslagen erkannt', 'life events detected'),
        sub: neueLebenslagen > 0 ? L(`${neueLebenslagen} neu`, `${neueLebenslagen} new`) : null,
      },
      {
        id: 'abwanderung', icon: ShieldAlert, target: 'ueb-abwanderung',
        tone: abwanderungsRadar.length > 0 ? 'danger' : 'success',
        name: L('Abwanderungs-Agent', 'Churn agent'),
        value: abwanderungsRadar.length,
        text: L('Risikokunden', 'at-risk clients'),
        sub: null,
      },
      {
        id: 'kampagnen', icon: Megaphone, target: 'ueb-kampagnen', tone: 'success',
        name: L('Kampagnen-Agent', 'Campaign agent'),
        value: kampagnenTreffer,
        text: L('Treffer', 'matches'),
        sub: L(`${kampagnenAktiv} Kampagnen aktiv`, `${kampagnenAktiv} campaigns active`),
      },
    ] : [
      {
        id: 'mandate', icon: Briefcase, target: 'ueb-mandate', tone: 'success',
        name: L('Mandats-Agent', 'Mandate agent'),
        value: vvKunden.length,
        text: L('Mandate geprüft', 'mandates reviewed'),
        sub: L(`${vvLeads} Leads`, `${vvLeads} leads`),
      },
    ]),
    {
      id: 'termine', icon: CalendarCheck, target: 'ueb-termine', tone: 'success',
      name: L('Termin-Agent', 'Meeting agent'),
      value: termine.length,
      text: L('Termine vorbereitet', 'meetings prepared'),
      sub: heroTermin ? L('+1 neu zugesagt', '+1 newly confirmed') : null,
    },
    {
      id: 'aufgaben', icon: ListChecks, target: 'ueb-aufgaben',
      tone: aufgabenHeute > 0 ? 'warning' : 'success',
      name: L('Aufgaben-Agent', 'Task agent'),
      value: aufgaben.length,
      text: L('Aufgaben offen', 'tasks open'),
      sub: aufgabenHeute > 0 ? L(`${aufgabenHeute} heute fällig`, `${aufgabenHeute} due today`) : null,
    },
    ...(!showRadarUndKampagnen ? [{
      id: 'abschluesse', icon: FileCheck, target: 'ueb-abschluesse', tone: 'success',
      name: L('Reporting-Agent', 'Reporting agent'),
      value: abschluesse.length,
      text: L('Abschlüsse dokumentiert', 'deals documented'),
      sub: null,
    }] : []),
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* KI-Agenten-Leiste: kompakt, über die volle Breite, unter den
          KPI-Kacheln und über den Kampagnen. */}
      <section data-praes="agenten" className="col-span-3 surface-card px-4 py-3" aria-label={L('KI-Agenten', 'AI agents')}>
        <div className="flex items-center gap-4">
          <div className="shrink-0 pr-4 border-r" style={{ borderColor: 'var(--border-light)', minWidth: 196 }}>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              <Bot size={14} style={{ color: 'var(--mode-primary)' }} strokeWidth={2} />
              {L('Agenten heute Nacht', 'Agents last night')}
            </div>
            <div className="text-sm mt-0.5 font-mono" style={{ color: 'var(--text-secondary)' }}>
              {nachtlaufDatum} · {AGENTEN_NACHTLAUF_UHRZEIT}
            </div>
          </div>
          <div className="flex-1 grid gap-2 min-w-0" style={{ gridTemplateColumns: `repeat(${agenten.length}, minmax(0, 1fr))` }}>
            {agenten.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => scrollToCard(a.target)}
                  className="row-hover flex items-center gap-3 rounded-xl px-3.5 py-2.5 min-w-0 text-left transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                  title={`${a.name}: ${a.value} ${a.text}${a.sub ? ` · ${a.sub}` : ''}`}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--mode-primary-soft)' }}>
                    <Icon size={17} style={{ color: 'var(--mode-primary)' }} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium leading-tight" style={{ color: 'var(--text-secondary)' }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: AGENT_TONE[a.tone] || AGENT_TONE.success }} />
                      <span>{a.name}</span>
                    </div>
                    {/* Zahl und Text auf einer Grundlinie; der Text darf umbrechen,
                        damit bei 1280 px nichts abgeschnitten wird. */}
                    <div className="flex items-baseline gap-1.5 min-w-0">
                      <span className="font-mono text-[22px] font-semibold leading-tight shrink-0" style={{ color: 'var(--text-primary)' }}>{a.value}</span>
                      <span className="text-[13px] leading-snug" style={{ color: 'var(--text-tertiary)' }}>
                        {a.text}{a.sub ? ` · ${a.sub}` : ''}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Linke Spalte 2/3 */}
      <div className="col-span-2 space-y-4 min-w-0">
        {/* Potenziale (+ Marketingkampagnen as own full-width row below in banking).
            For banking the Potenziale already live in their own tab + can be
            opened from there, so no separate Vertriebspotenziale card on the
            Übersicht itself. */}
        <div className="space-y-4">
        {/* Vertriebspotenziale / Mandate & Potenziale
            Im Banking- und Versicherungs-View liegen die Potenziale in ihrem
            eigenen Tab (Potenziale-Kanban-Board + kann dort direkt geöffnet
            werden) – dort stehen ausführlichere Spalten, Filter und das
            Kanban-Layout zur Verfügung. Auf der Übersicht sparen wir den
            Platz und zeigen stattdessen Marketingkampagnen + Radare.
            Nur Vermögensverwaltung behält die kompakte Mandanten-Kachel,
            weil es dort kein Kanban-Board gibt. */}
        {modeId === 'vermoegensverwaltung' ? (
          <div id="ueb-mandate">
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <CardTitle icon={Zap}>{t('mandatePotenziale')}</CardTitle>
              <div className="flex gap-1.5">
                {[
                  { key: 'alle', label: t('alle') },
                  { key: 'bestand', label: t('bestandsmandate') },
                  { key: 'neu', label: t('neueMandate') },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setMandatFilter(f.key)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${mandatFilter === f.key ? 'text-white' : 'row-hover'}`}
                    style={mandatFilter === f.key
                      ? { backgroundColor: 'var(--mode-primary)' }
                      : { backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-0">
              <div
                className="grid py-1.5 px-3 items-center text-[10px] uppercase tracking-wider font-semibold"
                style={{ gridTemplateColumns: '2fr 90px 100px 70px 60px 90px', color: 'var(--text-tertiary)' }}
              >
                <span>{t('mandant')}</span>
                <span className="text-right">{t('aum')}</span>
                <span className="text-right">{t('letztesGespraech')}</span>
                <span className="text-center">{t('tab.leads')}</span>
                <span className="text-center">{t('typ')}</span>
                <span className="text-center">{t('strategie')}</span>
              </div>
              {filteredVVKunden.slice(0, 8).map((k, i) => (
                <div
                  key={k.id || i}
                  className="grid py-2.5 px-3 rounded-lg row-hover cursor-pointer items-center"
                  style={{ gridTemplateColumns: '2fr 90px 100px 70px 60px 90px' }}
                  onClick={() => navigateTo('detail', { kundeId: k.id })}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {k.istNeu ? (
                      <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--mode-primary-soft)' }}>
                        <Sparkles size={16} style={{ color: 'var(--mode-primary)' }} />
                      </div>
                    ) : (
                      <Avatar name={tn(k.name)} foto={getKundeFoto(k.id)} size={34} />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{tn(k.name)}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{k.mandat ? k.mandat.produkt : k.mandatsTyp || '–'}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm font-mono font-medium flex items-center justify-end gap-2" style={{ color: 'var(--text-primary)' }}>
                    {k.id === 'VV00001' && VV_LEADS.some(l => l.isNeuerLead && l.referenzMandant === 'VV00001') && (
                      <TintBadge tone="success" small>{t('neuerLead')}</TintBadge>
                    )}
                    {k.aum ? `${(k.aum / 1000000).toFixed(1)}M` : '–'}
                  </div>
                  <div className="text-right text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {k.letzteKomm ? new Date(k.letzteKomm.datum).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '–'}
                  </div>
                  <div className="text-center">
                    {k.leadsCount > 0 ? (
                      <span className="rh-badge inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-semibold text-white" style={{ backgroundColor: 'var(--mode-primary)' }}>
                        {k.leadsCount}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>–</span>
                    )}
                  </div>
                  <div className="text-center">
                    <TintBadge tone={k.istNeu ? 'mode' : 'neutral'} small className="!normal-case !tracking-normal">
                      {k.istNeu ? t('neu') : t('bestand')}
                    </TintBadge>
                  </div>
                  <div className="text-center">
                    <span
                      className="rh-badge text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={
                        k.mandatsTyp === 'FairValue' ? { background: 'var(--tint-info)', color: 'var(--color-info)' }
                        : k.mandatsTyp === 'SmartValue' ? { background: 'var(--tint-success)', color: 'var(--color-success)' }
                        : { background: 'var(--color-violet-100)', color: 'var(--color-violet-700)' }
                      }
                    >
                      {k.mandatsTyp === 'Spezialmandat' ? t('spezial') : k.mandatsTyp || '–'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-3 text-sm font-medium hover:underline"
              style={{ color: 'var(--mode-primary)' }}
              onClick={() => setActiveTab('mandatsliste')}
            >
              {t('alleMandantenAnzeigen', { count: vvKunden.length })}
            </button>
          </Card>
          </div>
        ) : null}

        {/* Marketingkampagnen (Banking + Versicherung): vier farbige Kacheln,
            Farbband mit Icon oben, getönte Fläche darunter, Status-Chip.
            Der Content stammt aus buildBankingKampagnen /
            buildVersicherungsKampagnen und passt sich an das Institut an. */}
        {showRadarUndKampagnen && (
          <div id="ueb-kampagnen">
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <CardTitle icon={Megaphone}>{t('marketingkampagnen')}</CardTitle>
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {kampagnenAktiv} {t('aktivLabel')} · {marketingKampagnen.filter(k => k.status === 'geplant').length} {t('geplantLabel')}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 pointer-events-auto">
              {marketingKampagnen.map((kampagne) => {
                const istAktiv = kampagne.status === 'aktiv';
                const titel = lang === 'en' ? kampagne.titelEn : kampagne.titel;
                const zielgruppe = lang === 'en' ? kampagne.zielgruppeEn : kampagne.zielgruppe;
                const farbe = KAMPAGNEN_KATEGORIE_FARBEN[kampagne.kategorie] || 'var(--text-tertiary)';
                const PhotoIcon = CAMPAIGN_ICONS[kampagne.photoIcon] || Megaphone;
                return (
                  <div
                    key={kampagne.id}
                    role="button"
                    tabIndex={0}
                    className="group relative rounded-(--card-radius) card-hover overflow-hidden cursor-pointer flex flex-col pointer-events-auto border"
                    style={{
                      background: `color-mix(in oklab, ${farbe} 7%, var(--bg-card))`,
                      borderColor: `color-mix(in oklab, ${farbe} 30%, transparent)`,
                      boxShadow: 'var(--card-shadow)',
                    }}
                    onClick={() => setKampagneModal(kampagne)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKampagneModal(kampagne); }}
                    title={t('kampagneOeffnen')}
                  >
                    {/* Farbband mit Icon und Status */}
                    <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 shrink-0" style={{ background: farbe }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                        <PhotoIcon size={18} className="text-white" strokeWidth={1.75} />
                      </div>
                      <span
                        className="rh-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white"
                        style={{ background: 'rgba(255, 255, 255, 0.22)' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        {istAktiv ? t('aktivBadge') : t('geplantBadge')}
                      </span>
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col">
                      <div className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>{titel}</div>
                      <div className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{zielgruppe}</div>
                      <div className="mt-auto pt-2.5 flex items-center justify-between gap-2 border-t" style={{ borderColor: `color-mix(in oklab, ${farbe} 22%, transparent)` }}>
                        <span className="font-mono text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>{kampagne.zeitraum}</span>
                        <span
                          className="font-mono text-xs font-semibold inline-flex items-center gap-1 shrink-0"
                          style={{ color: 'var(--text-primary)' }}
                          title={t('passendeKundenTitle', { count: kampagne.passendeKunden.length })}
                        >
                          <Users size={11} style={{ color: 'var(--text-tertiary)' }} strokeWidth={2} />
                          {kampagne.passendeKunden.length}
                          <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--mode-primary)' }} strokeWidth={2.5} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expanded matches list for the selected campaign */}
            {expandedKampagne && (() => {
              const kampagne = marketingKampagnen.find((k) => k.id === expandedKampagne);
              if (!kampagne) return null;
              const titel = lang === 'en' ? kampagne.titelEn : kampagne.titel;
              return (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      {t('trefferFuer')}: <span style={{ color: 'var(--text-primary)' }}>{titel}</span>
                    </div>
                    <button
                      className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-(--bg-inset)"
                      style={{ color: 'var(--text-tertiary)' }}
                      aria-label={t('schliessen')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedKampagne(null);
                      }}
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {kampagne.passendeKunden.map((k) => (
                      <div
                        key={k.kundeId}
                        className="row-hover flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('detail', { kundeId: k.kundeId, tab: 'stammdaten' });
                        }}
                      >
                        <Avatar name={k.name} foto={getKundeFoto(k.kundeId)} size={42} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{k.name}</span>
                            <MatchBadge match={k.match} />
                          </div>
                          <div className="text-xs leading-snug line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {lang === 'en' ? k.begruendungEn : k.begruendung}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </Card>
          </div>
        )}

        {/* Lebenslagen-Radar + Abwanderungsradar (Banking + Versicherung) –
            just below Marketingkampagnen. Datenquellen pro Modus sind
            lebenslagenRadar / abwanderungsRadar. */}
        {showRadarUndKampagnen && (
          <div className="grid grid-cols-2 gap-4">
            {/* Lebenslagen-Radar */}
            <div id="ueb-lebenslagen" className="min-w-0">
            <Card hover={false}>
              <div className="flex items-center justify-between mb-3">
                <CardTitle
                  icon={Radar}
                  dot={lebenslagenRadar.some((l) => l.isNew) && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: 'var(--color-success)' }} />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: 'var(--color-success)', boxShadow: '0 0 0 2px var(--bg-card)' }} />
                    </span>
                  )}
                >
                  {t('lebenslagenRadar')}
                </CardTitle>
                <TintBadge tone="success" icon={Sparkles}>
                  {t('neueSignale', { count: neueLebenslagen })}
                </TintBadge>
              </div>
              <div className="space-y-2">
                {lebenslagenRadar.slice(0, 3).map((l) => {
                  const stripe = LEBENSLAGEN_KATEGORIE_FARBEN[l.category] || 'var(--text-tertiary)';
                  return (
                    <div
                      key={l.kundeId + l.event}
                      className="row-hover relative flex items-start gap-3 p-3 pl-4 rounded-xl cursor-pointer transition-all"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                      onClick={() => setRadarModal({ type: 'lebenslage', entry: l })}
                    >
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r" style={{ background: stripe }} />
                      <Avatar name={l.customerName} foto={getKundeFoto(l.kundeId)} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{l.customerName}</span>
                          <span className="text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5" style={{ color: stripe }}>
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'currentColor' }} />
                            {L(l.event, l.eventEn)}
                          </span>
                        </div>
                        <div className="text-[11px] flex items-center gap-1 min-w-0" style={{ color: 'var(--text-secondary)' }}>
                          <span className="truncate">{L(l.signals, l.signalsEn)[0]}</span>
                          <ArrowRight size={10} className="shrink-0" style={{ color: 'var(--text-tertiary)' }} strokeWidth={2.5} />
                          <span className="shrink-0" style={{ color: 'var(--text-tertiary)' }}>{t('quellenAnzahl', { count: l.signalCount })}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {t('potenzialLabel')}: <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{l.revenue.toLocaleString(numberLocale)}€</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="progress-track w-16 h-1.5 rounded-full overflow-hidden">
                              <div className="progress-fill h-full rounded-full" style={{ width: `${l.confidence}%` }} />
                            </div>
                            <span className="text-[10px] font-mono font-semibold" style={{ color: 'var(--text-secondary)' }}>{l.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border-light)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{lebenslagenRadar.length} {t('erkannt')}</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  <span className="font-mono">{lebenslagenRadar.reduce((s, l) => s + l.revenue, 0).toLocaleString(numberLocale)}€</span> {t('gesamtpotenzial')}
                </span>
              </div>
            </Card>
            </div>

            {/* Abwanderungsradar */}
            <div id="ueb-abwanderung" className="min-w-0">
            <Card hover={false}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--tint-danger)' }}>
                    <ShieldAlert size={16} style={{ color: 'var(--color-danger)' }} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t('abwanderungsradar')}</h3>
                </div>
                <TintBadge tone="danger" icon={AlertTriangle}>
                  {t('risikokunden', { count: abwanderungsRadar.length })}
                </TintBadge>
              </div>
              <div className="space-y-2">
                {abwanderungsRadar.map((r) => {
                  const risk = RISK_LEVEL_FARBEN[r.riskLevel] || RISK_LEVEL_FARBEN.medium;
                  const RiskIcon = r.riskLevel === 'high' ? AlertTriangle : AlertCircle;
                  const TrendIcon = r.trend === 'steigend' ? ArrowUpRight : r.trend === 'fallend' ? ArrowDownRight : ArrowRight;
                  const trendColor = r.trend === 'steigend' ? 'var(--color-danger)' : r.trend === 'fallend' ? 'var(--color-success)' : 'var(--color-warning)';
                  const trendLabel = r.trend === 'steigend' ? t('radar.trendSteigend') : r.trend === 'fallend' ? t('radar.trendFallend') : t('radar.trendStabil');
                  return (
                    <div
                      key={r.kundeId}
                      className="row-hover relative flex items-start gap-3 p-3 pl-4 rounded-xl cursor-pointer transition-all"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                      onClick={() => setRadarModal({ type: 'abwanderung', entry: r })}
                    >
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r" style={{ background: risk.stripe }} />
                      <Avatar name={r.customerName} foto={getKundeFoto(r.kundeId)} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{r.customerName}</span>
                          <span
                            className="rh-badge text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1"
                            style={{ background: risk.bg, color: risk.text }}
                          >
                            <RiskIcon size={11} strokeWidth={2.25} />
                            {t(risk.labelKey)}
                            <span title={trendLabel} className="inline-flex" style={{ color: trendColor }}>
                              <TrendIcon size={11} strokeWidth={2.5} />
                            </span>
                          </span>
                        </div>
                        <div className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>{L(r.summary, r.summaryEn)}</div>
                        <div className="text-[11px] italic truncate" style={{ color: 'var(--text-tertiary)' }}>{L(r.riskType, r.riskTypeEn)} {t('wahrscheinlich')}</div>
                        <div className="text-xs mt-1.5">
                          <span style={{ color: 'var(--text-secondary)' }}>{t('clvAtRisk')}: </span>
                          <span className="font-mono font-semibold" style={{ color: 'var(--color-danger)' }}>{r.clvAtRisk.toLocaleString(numberLocale)}€</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border-light)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{abwanderungsRadar.length} {t('kundenWort')}</span>
                <span className="font-semibold" style={{ color: 'var(--color-danger)' }}>
                  <span className="font-mono">{abwanderungsRadar.reduce((s, r) => s + r.clvAtRisk, 0).toLocaleString(numberLocale)}€</span> {t('clvAtRisk')}
                </span>
              </div>
            </Card>
            </div>
          </div>
        )}

        {/* Individuelle Produktbausteine (Hyperpersonalisierte Produkte mit
            extrem kurzen Release-Zyklen). Steht bewusst unterhalb der
            Lebenslagen-/Abwanderungsradare, weil die Radarsignale erst die
            Bedarfslage liefern, aus der heraus die hyperpersonalisierten
            Produkte zugeschnitten werden. */}
        {showHyperProdukte && (
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <CardTitle
                icon={Rocket}
                badge={<TintBadge tone="mode" small className="ml-1">{t('hyperpersonalisiert')}</TintBadge>}
              >
                {t('individuelleProduktbausteine')}
              </CardTitle>
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {t('produktbausteineHeader', { count: hyperPersonalisierteProdukte.length })}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hyperPersonalisierteProdukte.map((produkt) => {
                const Icon = PRODUKT_ICONS[produkt.icon] || Sparkles;
                const BausteinIcon = PRODUKT_ICONS[produkt.bausteinIcon] || Sparkles;
                return (
                  <div
                    key={produkt.id}
                    role="button"
                    tabIndex={0}
                    className="group relative surface-card card-hover overflow-hidden cursor-pointer flex flex-col"
                    onClick={() => setProduktModal(produkt)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setProduktModal(produkt); }}
                  >
                    <div className="h-[3px] w-full shrink-0" style={{ background: 'var(--mode-chart)' }} />
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--mode-primary-soft)' }}>
                            <Icon size={22} style={{ color: 'var(--mode-primary)' }} strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                              {t('timeToMarketLabel')}
                            </div>
                            <div className="font-mono text-base font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                              {produkt.timeToMarket} <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'Uniform, sans-serif' }}>{t('tage')}</span>
                            </div>
                            <div className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                              {t('releaseZyklusLabel')}: {L(produkt.releaseZyklus, produkt.releaseZyklusEn)}
                            </div>
                          </div>
                        </div>
                        <span
                          className="font-mono text-xs font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-full shrink-0"
                          style={{ background: 'var(--bg-inset)', color: 'var(--text-primary)' }}
                          title={t('passendeKundenTitle', { count: produkt.passendeKunden.length })}
                        >
                          <Users size={11} style={{ color: 'var(--text-tertiary)' }} strokeWidth={2} /> {produkt.passendeKunden.length}
                        </span>
                      </div>

                      <div className="text-base font-semibold mb-0.5 line-clamp-1" style={{ color: 'var(--text-primary)' }}>{L(produkt.titel, produkt.titelEn)}</div>
                      <div className="text-xs mb-3 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{L(produkt.tagline, produkt.taglineEn)}</div>

                      <div className="rounded-lg p-2.5 mb-3" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-light)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <BausteinIcon size={13} style={{ color: 'var(--mode-primary)' }} strokeWidth={2} />
                          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mode-primary)' }}>{t('uspBaustein')}</span>
                        </div>
                        <div className="text-xs font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>{L(produkt.bausteinTitel, produkt.bausteinTitelEn)}</div>
                      </div>

                      <div className="mt-auto flex items-center justify-between text-[11px] pt-2 border-t" style={{ borderColor: 'var(--border-light)', color: 'var(--text-tertiary)' }}>
                        <span className="font-mono truncate">{L(produkt.versionsLabel, produkt.versionsLabelEn)}</span>
                        <span className="font-semibold flex items-center gap-0.5 whitespace-nowrap" style={{ color: 'var(--mode-primary)' }}>
                          {t('detailsLabel')} <ChevronRight size={12} strokeWidth={2.5} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
        </div>
        {/* /Potenziale + Marketingkampagnen wrapper */}

        {/* Aufgaben – modern card list */}
        <div id="ueb-aufgaben">
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <CardTitle icon={CheckSquare}>{t('aktuelleAufgaben')}</CardTitle>
            <TintBadge tone={aufgabenHeute > 0 ? 'danger' : 'neutral'}>
              {aufgaben.length} {t('aufgabeOpen')}
            </TintBadge>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {aufgaben.map((a, i) => {
              const fSlug = String(a.faellig || '').toLowerCase();
              const isToday = fSlug === 'heute' || fSlug === 'today';
              const isTomorrow = fSlug === 'morgen' || fSlug === 'tomorrow';
              const urgency = isToday
                ? { color: 'var(--color-danger)', bg: 'var(--tint-danger)' }
                : isTomorrow
                  ? { color: 'var(--color-warning)', bg: 'var(--tint-warning)' }
                  : { color: 'var(--color-info)', bg: 'var(--tint-info)' };
              const text = a.text || '';
              const TaskIcon = /fida|consent|dokument|unterlage|formular|vertrag|plan|analyse/i.test(text) ? FileText
                : /anruf|call|nachfass|kontakt|ruf/i.test(text) ? Phone
                : /termin|meeting|gespraech|gespräch/i.test(text) ? Calendar
                : /vorbereit|erstellen|prep/i.test(text) ? Sparkles
                : CheckSquare;
              return (
                <div
                  key={i}
                  className="row-hover group aufgabe-tile relative flex items-center gap-3 p-3 pl-4 rounded-xl cursor-pointer transition-all overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                  onClick={() => a.kundeId && navigateTo('detail', { kundeId: a.kundeId })}
                >
                  {/* Priority stripe */}
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: urgency.color }} />

                  {/* Checkbox */}
                  <button
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0"
                    style={{ borderColor: 'var(--border-strong)', background: 'var(--bg-card)' }}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t('erledigen')}
                  >
                    <Check size={12} strokeWidth={3} className="scale-0 group-hover:scale-100 transition-transform" style={{ color: 'var(--color-success)' }} />
                  </button>

                  {/* Icon tile */}
                  <div className="aufgabe-icon-tile w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: urgency.bg }}>
                    <TaskIcon size={16} className="aufgabe-icon" style={{ color: urgency.color }} strokeWidth={2} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{text}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {a.kundeId ? t('kundenakteOeffnen') : t('interneAufgabe')}
                    </div>
                  </div>

                  {/* Date badge */}
                  <span
                    className="aufgabe-date-badge text-[10px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap uppercase tracking-wider shrink-0 inline-flex items-center gap-1"
                    style={{ backgroundColor: urgency.bg, color: urgency.color }}
                  >
                    <Clock size={10} strokeWidth={2.5} /> {a.faellig}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        </div>

        {/* Letzte Abschluesse */}
        <div id="ueb-abschluesse">
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <CardTitle icon={CheckCircle}>{t('letzteAbschluesse')}</CardTitle>
            <TintBadge tone="neutral">{t('dieseWoche')}</TintBadge>
          </div>
          <div className="space-y-2">
            {abschluesse.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg row-hover cursor-pointer"
                onClick={() => navigateTo('detail', { kundeId: a.kundeId, tab: 'vertraege' })}
              >
                <div className="flex items-center gap-3">
                  <SparteBadge sparte={a.sparte} />
                  <div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.kunde}</span>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.produkt}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{formatEur(a.betrag)}</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{a.datum}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: 'var(--mode-primary)' }}
            onClick={() => setActiveTab('neugeschaeft')}
          >
            {t('alleAbschluesseAnzeigen')}
          </button>
        </Card>
        </div>
      </div>

      {/* Rechte Spalte 1/3 */}
      <div className="col-span-1 space-y-4 min-w-0">
        {/* Anstehende Termine */}
        <div id="ueb-termine" data-praes="termine">
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <CardTitle icon={Clock}>{t('anstehendeTermine')}</CardTitle>
          </div>
          <div className="space-y-1">
            {termine.map((termin, i) => {
              const tDate = new Date(termin.datum);
              const todayStr = heute.toISOString().split('T')[0];
              const isToday = termin.datum === todayStr;
              const dayLabel = isToday ? t('heute') : tDate.toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
              const isNeu = !!termin.istNeuZugestimmt;
              const handleClick = () => {
                // Alle Termine öffnen die KI-Gesprächsvorbereitung als Popup.
                // Reihenfolge der Quellen:
                //   1. realer Kunde im Mode-Bestand
                //   2. Termin-Stub-Demo-Datensatz (banking-termin-stubs.js)
                //   3. Minimal-Fallback aus den Termin-Feldern
                const k = modeKunden.find(k => k.id === termin.kundeId)
                  || getTerminStubKunde(termin.kundeId)
                  || { id: termin.kundeId, name: termin.kunde, foto: termin.foto };
                setTerminPrep({ kunde: k, termin });
              };
              return (
                <div
                  key={i}
                  className="row-hover flex items-center gap-3 py-2.5 border-b last:border-0 cursor-pointer -mx-2 px-2 rounded-lg"
                  style={{ borderColor: 'var(--border-light)', ...(isNeu ? { background: 'var(--tint-success)' } : {}) }}
                  onClick={handleClick}
                >
                  <div className="text-center shrink-0 w-14">
                    <div className="text-[10px] font-semibold uppercase whitespace-nowrap" style={{ color: isToday ? 'var(--mode-primary)' : 'var(--text-tertiary)' }}>{dayLabel}</div>
                    <div className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{termin.zeit}</div>
                  </div>
                  <Avatar name={termin.kunde} foto={termin.foto} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{termin.kunde}</span>
                      {isNeu && (
                        <TintBadge tone="success" icon={Sparkles} small>{t('plusEinsNeu')}</TintBadge>
                      )}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{termin.betreff}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        </div>
        {terminPrep && (
          <TerminPrepModal
            kunde={terminPrep.kunde}
            termin={terminPrep.termin}
            onClose={() => setTerminPrep(null)}
          />
        )}

        {radarModal && (
          <RadarExplanationModal
            type={radarModal.type}
            entry={radarModal.entry}
            onClose={() => setRadarModal(null)}
            onOpenKunde={(kundeId) => {
              setRadarModal(null);
              navigateTo('detail', { kundeId, tab: 'stammdaten' });
            }}
          />
        )}

        {/* Schnellzugriff Formulare */}
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <CardTitle icon={FileText}>{t('schnellzugriffFormulare')}</CardTitle>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {schnellzugriff.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl row-hover cursor-pointer text-center transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                >
                  <Icon size={22} style={{ color: 'var(--mode-primary)' }} strokeWidth={1.5} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t(item.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Provisionsabrechnungen */}
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <CardTitle icon={Euro}>
              {modeId === 'vermoegensverwaltung' ? t('ertragsabrechnungen') : t('provisionsabrechnungen')}
            </CardTitle>
          </div>
          <div className="space-y-2">
            {abrechnungen.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-2 rounded-lg row-hover cursor-pointer">
                <div className="flex items-center gap-3">
                  <Download size={16} style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.monat}</div>
                    <div className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{a.datum}</div>
                  </div>
                </div>
                <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{formatEur(a.betrag)}</span>
              </div>
            ))}
          </div>
          <button
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: 'var(--mode-primary)' }}
            onClick={() => setActiveTab('verguetung')}
          >
            {t('alleAbrechnungenAnzeigen')}
          </button>
        </Card>

        {/* Geburtstage diese Woche */}
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <CardTitle icon={Cake}>{t('geburtstagsWoche')}</CardTitle>
          </div>
          <div className="space-y-3">
            {geburtstage.map((g, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 cursor-pointer row-hover -mx-2 px-2 rounded-lg"
                onClick={() => navigateTo('detail', { kundeId: g.kundeId })}
              >
                <Avatar name={g.name} foto={g.foto} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tn(g.name)}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{g.datum} · {t('wird')} {g.alter}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Hyperpersonalisiertes Produkt – Detail-Modal mit USP-Baustein und
          gemappten Bestandskunden. Klick auf einen Kunden navigiert in die
          Detail-Stammdaten. */}
      {produktModal && (() => {
        const p = produktModal;
        const Icon = PRODUKT_ICONS[p.icon] || Sparkles;
        const BausteinIcon = PRODUKT_ICONS[p.bausteinIcon] || Sparkles;
        const total = p.passendeKunden.length;
        const avg = Math.round(p.passendeKunden.reduce((s, k) => s + k.match, 0) / Math.max(total, 1));
        return (
          <ModalShell onClose={() => setProduktModal(null)}>
            <ModalHero
              icon={Icon}
              chips={(
                <>
                  <GlassChip>{t('hyperpersonalisiert')}</GlassChip>
                  <GlassChip>{L(p.versionsLabel, p.versionsLabelEn)}</GlassChip>
                </>
              )}
              title={L(p.titel, p.titelEn)}
              subtitle={L(p.tagline, p.taglineEn)}
              onClose={() => setProduktModal(null)}
              closeLabel={t('schliessen')}
            />

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-4 gap-3">
                <KpiTile label={t('timeToMarketLabel')} value={`${p.timeToMarket} ${t('tage')}`} accent="var(--mode-primary)" />
                <KpiTile label={t('releaseZyklusLabel')} value={L(p.releaseZyklus, p.releaseZyklusEn)} />
                <KpiTile label={t('oeMatch')} value={`${avg}%`} accent="var(--color-success)" />
                <KpiTile label={t('beitragLabel')} value={L(p.monatsBeitrag, p.monatsBeitragEn)} />
              </div>

              <div>
                <Kicker icon={Target}>{t('zielgruppeLabel')}</Kicker>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{L(p.zielgruppe, p.zielgruppeEn)}</p>
              </div>

              <div className="rounded-xl p-4" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-light)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--mode-primary-soft)' }}>
                    <BausteinIcon size={16} style={{ color: 'var(--mode-primary)' }} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mode-primary)' }}>{t('uspBaustein')}</div>
                    <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{L(p.bausteinTitel, p.bausteinTitelEn)}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{L(p.bausteinBeschreibung, p.bausteinBeschreibungEn)}</p>
                <div className="grid grid-cols-2 gap-2">
                  {L(p.bausteinHighlights, p.bausteinHighlightsEn).map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-primary)' }}>
                      <CheckCircle size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} strokeWidth={2.25} />
                      <span className="leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Kicker icon={Users}>{t('gemappteBestandskunden')} ({total})</Kicker>
                <div className="space-y-2">
                  {p.passendeKunden.map((kd) => (
                    <div
                      key={kd.kundeId}
                      className="row-hover flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                      onClick={() => {
                        setProduktModal(null);
                        navigateTo('detail', { kundeId: kd.kundeId, tab: 'stammdaten' });
                      }}
                    >
                      <Avatar name={kd.name} foto={getKundeFoto(kd.kundeId)} size={42} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{kd.name}</span>
                          <MatchBadge match={kd.match} suffix={t('matchLabel')} />
                        </div>
                        <div className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>{L(kd.begruendung, kd.begruendungEn)}</div>
                      </div>
                      <ChevronRight size={16} className="shrink-0" style={{ color: 'var(--text-tertiary)' }} strokeWidth={2} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex flex-wrap items-center justify-end gap-2 rounded-b-2xl" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-inset)' }}>
              <button className={BTN_GHOST}>
                <Copy size={14} /> {t('produktblatt')}
              </button>
              <button className={BTN_SECONDARY}>
                <Mail size={14} /> {t('anPassendeKunden')}
              </button>
              <button className={BTN_PRIMARY}>
                <PlayCircle size={14} /> {t('angebotStarten')}
              </button>
            </div>
          </ModalShell>
        );
      })()}

      {/* Marketingkampagne Detail Modal */}
      {kampagneModal && (() => {
        const k = kampagneModal;
        const titel = lang === 'en' ? k.titelEn : k.titel;
        const zielgruppe = lang === 'en' ? k.zielgruppeEn : k.zielgruppe;
        const PhotoIcon = CAMPAIGN_ICONS[k.photoIcon] || Megaphone;
        const istAktiv = k.status === 'aktiv';
        const totalMatches = k.passendeKunden.length;
        const avgMatch = Math.round(k.passendeKunden.reduce((s, p) => s + p.match, 0) / Math.max(totalMatches, 1));
        const erwarteterUmsatz = totalMatches * 1850;
        return (
          <ModalShell onClose={() => setKampagneModal(null)}>
            <ModalHero
              icon={PhotoIcon}
              chips={(
                <>
                  <StatusChip glass aktiv={istAktiv} label={istAktiv ? t('aktivBadge') : t('geplantBadge')} />
                  <GlassChip>{k.zeitraum}</GlassChip>
                </>
              )}
              title={titel}
              subtitle={zielgruppe}
              onClose={() => setKampagneModal(null)}
              closeLabel={t('schliessen')}
            />

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* KPI Strip */}
              <div className="grid grid-cols-4 gap-3">
                <KpiTile label={t('treffer')} value={totalMatches} />
                <KpiTile label={t('avgMatch')} value={`${avgMatch}%`} accent="var(--color-success)" />
                <KpiTile label={t('erwarteterUmsatz')} value={`${erwarteterUmsatz.toLocaleString(numberLocale)}€`} />
                <KpiTile label={t('kanal')} value={3} />
              </div>

              {/* Beschreibung */}
              <div>
                <Kicker icon={Target}>{t('kampagnenBriefing')}</Kicker>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {t('kampagneBriefingTextDe', { zielgruppe: zielgruppe.toLowerCase(), total: totalMatches })}
                </p>
              </div>

              {/* Maßnahmen-Sequenz */}
              <div>
                <Kicker icon={ListChecks}>{t('massnahmenSequenz')}</Kicker>
                <ol className="space-y-2 text-sm">
                  {[
                    t('massnahmeTag1'),
                    t('massnahmeTag4'),
                    t('massnahmeTag8'),
                    t('massnahmeTag14'),
                  ].map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full text-[10px] font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'var(--mode-primary-soft)', color: 'var(--mode-primary)' }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Passende Kunden */}
              <div>
                <Kicker icon={Users}>{t('topTreffer')}</Kicker>
                <div className="space-y-2">
                  {k.passendeKunden.slice(0, 3).map((kd) => (
                    <div key={kd.kundeId} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-light)' }}>
                      <Avatar name={kd.name} foto={getKundeFoto(kd.kundeId)} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{kd.name}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? kd.begruendungEn : kd.begruendung}</div>
                      </div>
                      <MatchBadge match={kd.match} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t flex flex-wrap items-center justify-end gap-2 rounded-b-2xl" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-inset)' }}>
              <button className={BTN_GHOST}>
                <Copy size={14} /> {t('duplizieren')}
              </button>
              <button className={BTN_GHOST}>
                <BarChart size={14} /> {t('auswertung')}
              </button>
              <button className={BTN_SECONDARY}>
                <Mail size={14} /> {t('testMailSenden')}
              </button>
              <button className={BTN_SECONDARY}>
                <ListChecks size={14} /> {t('kundenlisteGenerieren')}
              </button>
              <button className={BTN_PRIMARY}>
                <PlayCircle size={14} /> {t('kampagneStarten')}
              </button>
            </div>
          </ModalShell>
        );
      })()}
    </div>
  );
}

function MiniKPI({ label, labelKey, value, subtext, subtextKey }) {
  const { t } = useTranslation();
  const displayLabel = labelKey ? t(labelKey) : label;
  const displaySubtext = subtextKey ? t(subtextKey) : subtext;
  const isPositive = displaySubtext?.startsWith('+');
  const isNegative = displaySubtext?.startsWith('-');
  return (
    <div className="text-center py-2">
      <div className="font-mono text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{displayLabel}</div>
      <div
        className="text-xs mt-0.5 font-medium"
        style={{ color: isPositive ? 'var(--color-success)' : isNegative ? 'var(--color-danger)' : 'var(--text-tertiary)' }}
      >
        {displaySubtext}
      </div>
    </div>
  );
}
