import { useState, useMemo } from 'react';
import { Sun, Clock, Zap, CheckSquare, Calendar, Phone, AlertTriangle, CheckCircle, FileText, Heart, Car, Home, ShieldAlert, Cake, Euro, Download, Landmark, BarChart3, PiggyBank, Wallet, Sparkles, Star, Megaphone, ChevronDown, ChevronRight, Users, TrendingUp, X, Mail, Target, ListChecks, Send, BarChart, PlayCircle, Copy } from 'lucide-react';

const CAMPAIGN_ICONS = { Home, Users, TrendingUp, Heart, Sparkles };
import Card from '../../../components/ui/Card';
import Avatar from '../../../components/ui/Avatar';
import { SparteBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { KUNDEN_BY_MODE, TERMINE_BY_MODE, AUFGABEN_BY_MODE } from '../../../data';
import { VV_LEADS } from '../../../data/vvExtended';
import { formatEur } from '../../../utils/formatters';
import { getKundeFoto } from '../../../utils/kundenFotos';
import TerminPrepModal from '../../../components/ui/TerminPrepModal';
import { useDayAdvanced, getSimulatedAppointment, formatAppointmentTime } from '../../../utils/demoClock';

import { getLang, tx } from '../../../utils/langHelper';

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
  versicherung: { text: tx('Peter Schmidt - BU-Nachversicherung', 'Peter Schmidt - Disability Re-Insurance'), next: '17:30 Amira König' },
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
    { kunde: 'Peter Schmidt', kundeId: 'KD00001', produkt: 'ERGO BU-Nachversicherung', sparte: 'leben', betrag: 1680, datum: '07.03.2026' },
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
    { name: 'Amira König', kundeId: 'KD00002', datum: 'Mi, 12.03.', alter: 29, foto: './images/AdobeStock_252262042.jpeg' },
    { name: 'Thomas Weber', kundeId: 'KD00003', datum: 'Do, 13.03.', alter: 56, foto: './images/AdobeStock_361342769.jpeg' },
    { name: 'Sandra Yilmaz', kundeId: 'KD00008', datum: 'Sa, 15.03.', alter: 45, foto: './images/AdobeStock_612932760.jpeg' },
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
    { labelKey: 'lebensversicherung', icon: Heart, color: '#ef4444' },
    { labelKey: 'kfzVersicherung', icon: Car, color: '#3b82f6' },
    { labelKey: 'sachversicherung', icon: Home, color: '#8b5cf6' },
    { labelKey: 'schadenmeldung', icon: ShieldAlert, color: '#f59e0b' },
  ],
  banking: [
    { labelKey: 'vrFinanzPlan', icon: BarChart3, color: '#10b981' },
    { labelKey: 'kreditAntrag', icon: Landmark, color: '#3b82f6' },
    { labelKey: 'depotEroeffnen', icon: PiggyBank, color: '#8b5cf6' },
    { labelKey: 'weroAktivieren', icon: Wallet, color: '#f59e0b' },
  ],
  vermoegensverwaltung: [
    { labelKey: 'neuesMandat', icon: FileText, color: '#1a365d' },
    { labelKey: 'wphgFragebogen', icon: FileText, color: '#3b82f6' },
    { labelKey: 'investmentvorschlag', icon: BarChart3, color: '#10b981' },
    { labelKey: 'complianceCheck', icon: ShieldAlert, color: '#f59e0b' },
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
    prefix: 'ZV',
    buBrand: 'ZV BU-Schutz',
    rlvBrand: 'ZV Risikoleben',
    hausratBrand: 'ZV HausratPlus',
    krankenBrand: 'ZV Zahn Digital',
    altersvorsorge: 'ZV FuturePension',
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
      titel: 'Frühlings-Baufi-Aktion',
      titelEn: 'Spring Mortgage Campaign',
      status: 'aktiv',
      zeitraum: '01.03.–30.04.2026',
      zielgruppe: 'Kunden mit Immo-Signalen',
      zielgruppeEn: 'Clients with property signals',
      photoGradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%)',
      photoIcon: 'Home',
      photoAccent: '#a7f3d0',
      passendeKunden: [
        { kundeId: 'BK00001', name: 'Klaus Fischer', match: 97, begruendung: `Commerzbank-Ratenkredit läuft 06/2026 aus (840€ frei), ${b.bausparPartner}-BSV zuteilungsreif, Immo-Newsletter seit 2 Jahren`, begruendungEn: `Commerzbank loan expires 06/2026 (€840 free), ${b.bausparPartner} building loan ready, property newsletter for 2 years` },
        { kundeId: 'BK00002', name: 'Sandra Müller', match: 92, begruendung: 'Immobilienkauf vorbereiten, Ehemann als Neukunde gewinnen', begruendungEn: 'Preparing home purchase, onboard spouse as new client' },
        { kundeId: 'BK00004', name: 'Markus Wagner', match: 78, begruendung: 'Junge Familie mit Neugeborenem – passender Zeitpunkt für ein erstes Eigenheim', begruendungEn: 'Young family with newborn – right time for first own home' },
      ],
    },
    {
      id: 'vorsorgeplus-bundle',
      titel: `${b.vorsorgeBrand} Bundle`,
      titelEn: `${b.vorsorgeBrand} Bundle`,
      status: 'aktiv',
      zeitraum: '15.03.–31.05.2026',
      zielgruppe: 'Junge Familien ohne Absicherung',
      zielgruppeEn: 'Young families without protection',
      photoGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
      photoIcon: 'Users',
      photoAccent: '#bfdbfe',
      passendeKunden: [
        { kundeId: 'BK00002', name: 'Sandra Müller', match: 94, begruendung: 'Junge Familie, keine BU/Risikoleben vorhanden', begruendungEn: 'Young family, no disability/term life coverage' },
        { kundeId: 'BK00004', name: 'Markus Wagner', match: 87, begruendung: '29 Jahre, frischgebackener Vater – RLV/BU jetzt dringend', begruendungEn: '29 years, brand-new father – RLV/BU urgently needed' },
        { kundeId: 'BK00005', name: 'Andrea Lang', match: 79, begruendung: 'Praxiskredit ohne Absicherung, keine BU', begruendungEn: 'Practice loan without coverage, no disability insurance' },
      ],
    },
    {
      id: 'depot-wechsel',
      titel: 'Depot-Wechsel-Prämie',
      titelEn: 'Custody Transfer Bonus',
      status: 'aktiv',
      zeitraum: '01.04.–30.06.2026',
      zielgruppe: 'Kunden mit Fremdbank-Depots',
      zielgruppeEn: 'Clients with third-party custody accounts',
      photoGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4338ca 100%)',
      photoIcon: 'TrendingUp',
      photoAccent: '#ddd6fe',
      passendeKunden: [
        { kundeId: 'BK00001', name: 'Klaus Fischer', match: 91, begruendung: 'Trade Republic Depot (28k), ING Tagesgeld (22k) – konsolidieren', begruendungEn: 'Trade Republic portfolio (28k), ING call money (22k) – consolidate' },
        { kundeId: 'BK00003', name: 'Peter Hoffmann', match: 88, begruendung: `Firmendepot-Optimierung, ${b.fundsPartner} als Alternative`, begruendungEn: `Corporate portfolio optimisation, ${b.fundsPartner} as alternative` },
        { kundeId: 'BK00006', name: 'Stefan Braun', match: 82, begruendung: `ETF-Sparplan bei Online-Broker, Wechsel zu ${b.depotProduct}`, begruendungEn: `ETF savings plan with online broker, switch to ${b.depotProduct}` },
      ],
    },
    {
      id: 'tierschutz',
      titel: `${b.insurer} TierSchutz Aktion`,
      titelEn: `${b.insurer} Pet Protection Campaign`,
      status: 'geplant',
      zeitraum: 'Ab 01.05.2026',
      zielgruppe: 'Tierhalter ohne Haftpflicht/KV',
      zielgruppeEn: 'Pet owners without liability/health cover',
      photoGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #9a3412 100%)',
      photoIcon: 'Heart',
      photoAccent: '#fde68a',
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
      titel: `${b.buBrand} Upgrade-Aktion`,
      titelEn: `${b.buBrand} Upgrade Campaign`,
      status: 'aktiv',
      zeitraum: '01.03.–30.04.2026',
      zielgruppe: 'Kunden mit BU unter 1.500€/Mon. Rente',
      zielgruppeEn: 'Clients with disability cover below €1,500/mo',
      photoGradient: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)',
      photoIcon: 'TrendingUp',
      photoAccent: '#fecaca',
      passendeKunden: [
        { kundeId: 'KD00001', name: 'Peter Schmidt', match: 96, begruendung: `BU-Rente 1.800€/mtl. – unter dem 60%-Netto-Bedarf, ${b.buBrand}-Upgrade sinnvoll`, begruendungEn: `DI pension €1,800/mo – below 60% net-income need, ${b.buBrand} upgrade recommended` },
        { kundeId: 'KD00004', name: 'Anna Hoffmann', match: 92, begruendung: 'Ärztin ohne BU, Einkommen 5.500€ – hohes Ausfallrisiko', begruendungEn: 'Physician without DI cover, €5,500 income – high risk' },
        { kundeId: 'KD00002', name: 'Amira König', match: 84, begruendung: 'Designerin, keine BU, Altersneuabschluss lohnt sich', begruendungEn: 'Designer, no DI, new policy worthwhile at this age' },
      ],
    },
    {
      id: 'familien-bundle',
      titel: `${b.rlvBrand} + ${b.hausratBrand} Familien-Bundle`,
      titelEn: `${b.rlvBrand} + ${b.hausratBrand} Family Bundle`,
      status: 'aktiv',
      zeitraum: '15.03.–31.05.2026',
      zielgruppe: 'Familien mit Kindern ohne Absicherung',
      zielgruppeEn: 'Families with children without protection',
      photoGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
      photoIcon: 'Users',
      photoAccent: '#bfdbfe',
      passendeKunden: [
        { kundeId: 'KD00001', name: 'Peter Schmidt', match: 94, begruendung: '2 Kinder, Hausrat unterversichert (65qm auf 145qm EFH)', begruendungEn: '2 kids, hausrat underinsured (65sqm on 145sqm house)' },
        { kundeId: 'KD00004', name: 'Anna Hoffmann', match: 88, begruendung: 'Junge Familie, RLV-Deckung zu gering', begruendungEn: 'Young family, insufficient term life coverage' },
        { kundeId: 'KD00005', name: 'Klaus Meier', match: 79, begruendung: 'Drei Kinder, RLV-Altbestand 150k€ aktualisieren', begruendungEn: 'Three children, term-life legacy 150k€ to refresh' },
      ],
    },
    {
      id: 'altersvorsorge-check',
      titel: `${b.altersvorsorge} Check`,
      titelEn: `${b.altersvorsorge} Check`,
      status: 'aktiv',
      zeitraum: '01.04.–30.06.2026',
      zielgruppe: 'Kunden 45+ mit Versorgungslücke',
      zielgruppeEn: 'Clients 45+ with pension gap',
      photoGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4338ca 100%)',
      photoIcon: 'TrendingUp',
      photoAccent: '#ddd6fe',
      passendeKunden: [
        { kundeId: 'KD00007', name: 'Michael Braun', match: 91, begruendung: 'Lehrer 62, in 3 Jahren Pension – Sofortrente prüfen', begruendungEn: 'Teacher 62, retirement in 3 years – immediate annuity worth checking' },
        { kundeId: 'KD00005', name: 'Klaus Meier', match: 86, begruendung: 'Beamter A14, Versorgungslücke bei PKV-Beiträgen im Ruhestand', begruendungEn: 'Civil servant A14, pension gap with PKV premiums in retirement' },
        { kundeId: 'KD00003', name: 'Thomas Weber', match: 81, begruendung: 'Handwerksmeister 55, Betriebsübergabe – private Altersvorsorge aufbauen', begruendungEn: 'Master craftsman 55, business transfer – build private pension' },
      ],
    },
    {
      id: 'zahnzusatz',
      titel: `${b.krankenBrand} Frühbucher`,
      titelEn: `${b.krankenBrand} Early-Bird`,
      status: 'geplant',
      zeitraum: 'Ab 01.05.2026',
      zielgruppe: 'GKV-Versicherte ohne Zahnzusatz',
      zielgruppeEn: 'Statutory health members without dental supplement',
      photoGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #9a3412 100%)',
      photoIcon: 'Heart',
      photoAccent: '#fde68a',
      passendeKunden: [
        { kundeId: 'KD00002', name: 'Amira König', match: 87, begruendung: 'GKV-versichert, Wunsch nach ästhetischer Zahnbehandlung', begruendungEn: 'Statutory health, demand for aesthetic dental treatment' },
        { kundeId: 'KD00006', name: 'Lisa Bauer', match: 82, begruendung: 'Jung, keine Zahnzusatz – günstiger Frühbucher-Tarif', begruendungEn: 'Young, no dental supplement – favourable early-bird tariff' },
      ],
    },
  ];
}

/* ── Lebenslagen-Radar (banking) ──────────────────────────────── */
const LEBENSLAGEN_KATEGORIE_FARBEN = {
  immobilie: '#22c55e',
  familie:   '#3b82f6',
  beruf:     '#f59e0b',
  trennung:  '#3b82f6',
  ruhestand: '#8b5cf6',
  erbschaft: '#64748b',
};

const LEBENSLAGEN_RADAR_BANKING = [
  {
    kundeId: 'BK00004',
    customerName: 'Markus Wagner',
    initials: 'MW',
    event: 'Kind bekommen',
    signals: [
      'Regelmäßige Transaktionen bei DM / Babymarkt seit 2 Mon.',
      'Kindergeld-Eingang Familienkasse neu erkannt',
      'Ausgaben für Kinderarzt + Hebamme in Kontoumsätzen',
      'Recherche: „Riester für Familien" (Newsletter-Klick)',
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
    signals: [
      'Gewerbeanmeldung Zweitstandort erkannt',
      'Umsatzsteuer-Vorauszahlungen seit 2 Mon. erhöht',
      'Recherche: Gewerbeversicherungen (Newsletter-Klicks)',
      'Kontoumsätze: Praxisausstattung, Webhosting',
    ],
    signalCount: 4,
    confidence: 89,
    revenue: 2800,
    category: 'beruf',
    isNew: true,
  },
  {
    kundeId: 'BK00003',
    customerName: 'Peter Hoffmann',
    initials: 'PH',
    event: 'Ruhestand / Nachfolge',
    signals: [
      'Recherche „GmbH-Nachfolge" über das Online-Banking',
      'Erste Steuerberater-Termine in den Kontoumsätzen',
      'M&A-Beratungs-Anfrage erkannt',
      'Newsletter „Vermögen & Übergabe" aktiviert',
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
    summary: 'Dauerauftrag 500€ → N26 · Tagesgeld ING neu',
    signals: [
      'Neuer Dauerauftrag 500 €/Mon. an N26-Konto seit 6 Wochen',
      'Tagesgeldkonto bei ING eröffnet, 15.000 € übertragen',
      'Lastschriften für Strom/Internet auf Fremdkonto umgestellt',
      'Geschäftskonto: Aktivität -40% in 3 Monaten',
      'Kreditanfrage bei Smava erkannt (SCHUFA-Abfrage)',
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
    summary: 'Trade Republic Sparplan ↑ · Hauptdepot ↓',
    signals: [
      'Trade Republic Sparplan um 200 €/Mon. erhöht',
      'Hauptdepot-Sparplan um 100 €/Mon. reduziert',
      '3 Wertpapierverkäufe im Hauptdepot in 4 Wochen',
      'Newsletter-Tracking: Suche nach „Depotübertrag Trade Republic"',
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
    signals: [
      'Wiederkehrende Umsätze bei Babymarkt + DM seit 2 Mon.',
      'Newsletter „Familienabsicherung" angeklickt',
      'Hebammen-Rechnungen in den Kontoumsätzen erkannt',
      'Termin beim Gynäkologen ohne Reise-Muster (Vorsorge)',
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
    signals: [
      'Sohn Jan (25) tritt ins Unternehmen ein (LinkedIn)',
      'Recherche „Betriebsnachfolge Handwerk" über die Webseite',
      'Neuer Steuerberater-Dauerauftrag sichtbar',
      'Anfrage Betriebshaftpflicht-Anpassung',
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
    signals: [
      'Pension in 36 Monaten fällig (Beamter Gymnasium)',
      'Recherche „Sofortrente vs. Auszahlplan" im Portal',
      'Sparplan-Erhöhung um 200 €/Mon.',
      'Newsletter „Ruhestandsplanung" aktiviert',
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
    summary: 'FiDA-Datenanfrage von HUK24 · Portal-Kündigungsassistent geöffnet',
    signals: [
      'FiDA-Datenübermittlungsanfrage von „HUK24 Versicherung AG" (Consent via SCA am 08.04.) — Umfang: Kfz-Vertragsdaten, Schadenhistorie, aktuelle Prämie',
      'Kündigungsassistent im eigenen Kundenportal für Kfz-Vertrag 2× gestartet (keine Absendung)',
      'Kein Portal-Login seit 11 Wochen, E-Mail-Öffnungsrate auf 0 % gefallen',
      'Jahresgespräch 2× abgesagt, keine Reaktion auf letzte 3 Servicemails',
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
    summary: 'FiDA-Anfrage eines Maklers · negatives NPS · offener Großschaden',
    signals: [
      'FiDA-Datenübermittlungsanfrage eines unabhängigen Maklers (FISP „AssekuranzFinder GmbH") — Umfang: Gewerbehaftpflicht, Prämienhistorie 3 Jahre',
      'NPS-Score von 8 auf 3 gefallen, Kommentar: „Beitrag unverhältnismäßig"',
      'Offener Betriebsschaden seit 6 Wochen nicht abschließend reguliert',
      'Beitragsrückerstattungsanfrage für Jahresprämie 2025 eingegangen',
    ],
    clvAtRisk: 8900,
    trend: 'stabil',
  },
];

const RISK_LEVEL_FARBEN = {
  high:   { stripe: '#dc2626', bg: '#fef2f2', text: '#991b1b', label: 'Hoch' },
  medium: { stripe: '#d97706', bg: '#fffbeb', text: '#92400e', label: 'Mittel' },
  low:    { stripe: '#64748b', bg: '#f1f5f9', text: '#475569', label: 'Niedrig' },
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

export default function UebersichtTab() {
  const { modeId, config, navigateTo, setActiveTab } = useMode();
  const { t, tn, lang } = useTranslation();
  const [mandatFilter, setMandatFilter] = useState('alle');
  const [expandedKampagne, setExpandedKampagne] = useState('fruehlings-baufi');
  const [kampagneModal, setKampagneModal] = useState(null);
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
  // Peter Schmidt (BU-Nachversicherung).
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
        betreff: 'Kreditgespräch Immobilienfinanzierung',
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
        betreff: 'BU-Nachversicherung & Familien-Check',
        istNeuZugestimmt: true,
      };
    }
    return null;
  }, [dayAdvanced, modeId, modeKunden]);
  const termine = (heroTermin
    ? [heroTermin, ...baseTermine]
    : baseTermine).slice(0, 5);
  const [terminPrep, setTerminPrep] = useState(null); // { kunde, termin }
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

  return (
    <div className="grid grid-cols-3 gap-4">
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
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={20} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
                <h3 className="font-semibold text-slate-800">{t('mandatePotenziale')}</h3>
              </div>
              <div className="flex gap-1.5">
                {[
                  { key: 'alle', label: t('alle') },
                  { key: 'bestand', label: t('bestandsmandate') },
                  { key: 'neu', label: t('neueMandate') },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setMandatFilter(f.key)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      mandatFilter === f.key
                        ? 'text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    style={mandatFilter === f.key ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-0">
              <div className="grid py-1.5 px-3 items-center text-[10px] uppercase text-slate-400 font-semibold" style={{ gridTemplateColumns: '2fr 90px 100px 70px 60px 90px' }}>
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
                      <div className="w-[34px] h-[34px] rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Sparkles size={16} style={{ color: 'var(--_fg, #94a3b8)' }} />
                      </div>
                    ) : (
                      <Avatar name={tn(k.name)} foto={getKundeFoto(k.id)} size={34} />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--_fg, #334155)' }}>{tn(k.name)}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--_fg, #94a3b8)' }}>{k.mandat ? k.mandat.produkt : k.mandatsTyp || '–'}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm font-mono font-medium flex items-center justify-end gap-2" style={{ color: 'var(--_fg, #334155)' }}>
                    {k.id === 'VV00001' && VV_LEADS.some(l => l.isNeuerLead && l.referenzMandant === 'VV00001') && (
                      <span className="rh-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white whitespace-nowrap">
                        {t('neuerLead')}
                      </span>
                    )}
                    {k.aum ? `${(k.aum / 1000000).toFixed(1)}M` : '–'}
                  </div>
                  <div className="text-right text-xs" style={{ color: 'var(--_fg, #64748b)' }}>
                    {k.letzteKomm ? new Date(k.letzteKomm.datum).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '–'}
                  </div>
                  <div className="text-center">
                    {k.leadsCount > 0 ? (
                      <span className="rh-badge inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                        {k.leadsCount}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--_fg, #cbd5e1)' }}>–</span>
                    )}
                  </div>
                  <div className="text-center">
                    <span className={`rh-badge text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      k.istNeu
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {k.istNeu ? t('neu') : t('bestand')}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className={`rh-badge text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${
                      k.mandatsTyp === 'FairValue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      k.mandatsTyp === 'SmartValue' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {k.mandatsTyp === 'Spezialmandat' ? t('spezial') : k.mandatsTyp || '–'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-3 text-sm font-medium hover:underline"
              style={{ color: 'var(--mode-primary-light)' }}
              onClick={() => setActiveTab('mandatsliste')}
            >
              {t('alleMandantenAnzeigen', { count: vvKunden.length })}
            </button>
          </Card>
        ) : null}

        {/* Marketingkampagnen (Banking + Versicherung) – 4 photo boxes, hover
            fades the image so the campaign details + click action come
            forward. Der Content stammt aus buildBankingKampagnen /
            buildVersicherungsKampagnen und passt sich an das Institut an. */}
        {showRadarUndKampagnen && (
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone size={20} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
                <h3 className="font-semibold text-slate-800">{lang === 'en' ? 'Marketing Campaigns' : 'Marketingkampagnen'}</h3>
              </div>
              <span className="text-sm text-slate-400">
                {marketingKampagnen.filter(k => k.status === 'aktiv').length} {lang === 'en' ? 'active' : 'aktiv'} · {marketingKampagnen.filter(k => k.status === 'geplant').length} {lang === 'en' ? 'planned' : 'geplant'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 pointer-events-auto">
              {marketingKampagnen.map((kampagne) => {
                const istAktiv = kampagne.status === 'aktiv';
                const titel = lang === 'en' ? kampagne.titelEn : kampagne.titel;
                const zielgruppe = lang === 'en' ? kampagne.zielgruppeEn : kampagne.zielgruppe;
                const isExpanded = expandedKampagne === kampagne.id;
                const PhotoIcon = CAMPAIGN_ICONS[kampagne.photoIcon] || Megaphone;
                return (
                  <div
                    key={kampagne.id}
                    role="button"
                    tabIndex={0}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5 bg-white flex flex-col pointer-events-auto"
                    onClick={() => setKampagneModal(kampagne)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKampagneModal(kampagne); }}
                  >
                    {/* Photo-style hero (gradient + icon) */}
                    <div
                      className="relative h-28 flex items-center justify-center overflow-hidden"
                      style={{ background: kampagne.photoGradient }}
                    >
                      {/* Decorative overlay circles */}
                      <div
                        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-30"
                        style={{ background: kampagne.photoAccent }}
                      />
                      <div
                        className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-20"
                        style={{ background: kampagne.photoAccent }}
                      />
                      {/* Icon — versteckt sich, sobald das CTA "Kampagne öffnen" eingeblendet wird */}
                      <PhotoIcon size={48} className="text-white relative z-10 transition-opacity duration-200 group-hover:opacity-0" strokeWidth={1.5} />

                      {/* Hover overlay — fades in, dims the gradient so the CTA surfaces */}
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          <span>{lang === 'en' ? 'Open campaign' : 'Kampagne öffnen'}</span>
                          <ChevronRight size={14} strokeWidth={2.5} />
                        </span>
                      </div>

                      {/* Status pill */}
                      <span
                        className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          istAktiv ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}
                      >
                        {istAktiv ? (lang === 'en' ? 'Active' : 'Aktiv') : (lang === 'en' ? 'Planned' : 'Geplant')}
                      </span>

                      {/* Matches count */}
                      <span
                        className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold text-slate-800 bg-white shadow-sm"
                        title={`${kampagne.passendeKunden.length} passende Kunden`}
                      >
                        {kampagne.passendeKunden.length}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-3 flex-1 flex flex-col">
                      <div className="text-sm font-bold text-slate-800 mb-1 line-clamp-2">{titel}</div>
                      <div className="text-[11px] text-slate-500 mb-2 line-clamp-2">{zielgruppe}</div>
                      <div className="mt-auto text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                        {kampagne.zeitraum}
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
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {lang === 'en' ? 'Matches for' : 'Treffer für'}: <span className="text-slate-800">{titel}</span>
                    </div>
                    <button
                      className="text-xs text-slate-400 hover:text-slate-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedKampagne(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {kampagne.passendeKunden.map((k) => (
                      <div
                        key={k.kundeId}
                        className="row-hover flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('detail', { kundeId: k.kundeId, tab: 'stammdaten' });
                        }}
                      >
                        <Avatar name={k.name} foto={getKundeFoto(k.kundeId)} size={42} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-800 truncate">{k.name}</span>
                            <span className={`rh-badge text-[11px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                              k.match >= 90 ? 'bg-emerald-100 text-emerald-800'
                              : k.match >= 80 ? 'bg-lime-100 text-lime-800'
                              : 'bg-amber-100 text-amber-800'
                            }`}>{k.match}%</span>
                          </div>
                          <div className="text-xs text-slate-600 leading-snug line-clamp-2">
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
        )}

        {/* Lebenslagen-Radar + Abwanderungsradar (Banking + Versicherung) –
            just below Marketingkampagnen. Datenquellen pro Modus sind
            lebenslagenRadar / abwanderungsRadar. */}
        {showRadarUndKampagnen && (
          <div className="grid grid-cols-2 gap-4">
            {/* Lebenslagen-Radar */}
            <Card hover={false}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                    <Sparkles size={16} className="text-emerald-600" strokeWidth={2} />
                    {lebenslagenRadar.some((l) => l.isNew) && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800">Lebenslagen-Radar</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                  {lebenslagenRadar.filter((l) => l.isNew).length} neue Signale
                </span>
              </div>
              <div className="space-y-2">
                {lebenslagenRadar.slice(0, 3).map((l) => {
                  const stripe = LEBENSLAGEN_KATEGORIE_FARBEN[l.category] || '#64748b';
                  return (
                    <div
                      key={l.kundeId + l.event}
                      className="row-hover relative flex items-start gap-3 p-3 pl-4 rounded-xl border border-slate-200 cursor-pointer transition-all bg-white"
                      onClick={() => navigateTo('detail', { kundeId: l.kundeId, tab: 'stammdaten' })}
                    >
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r" style={{ background: stripe }} />
                      <Avatar name={l.customerName} foto={getKundeFoto(l.kundeId)} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-sm font-bold text-slate-800 truncate">{l.customerName}</span>
                          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: stripe }}>
                            {l.event}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {l.signals.slice(0, 1).join(' · ')} <span className="text-slate-400">→ {l.signalCount} Quellen</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <span className="text-xs text-slate-500">Potenzial: <span className="font-bold text-slate-800">{l.revenue.toLocaleString('de-DE')}€</span></span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${l.confidence}%`, background: stripe }} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{l.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{lebenslagenRadar.length} erkannt</span>
                <span className="font-bold text-slate-800">
                  {lebenslagenRadar.reduce((s, l) => s + l.revenue, 0).toLocaleString('de-DE')}€ Gesamtpotenzial
                </span>
              </div>
            </Card>

            {/* Abwanderungsradar */}
            <Card hover={false}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
                    <AlertTriangle size={16} className="text-red-600" strokeWidth={2} />
                  </div>
                  <h3 className="font-semibold text-slate-800">Abwanderungsradar</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-semibold border border-red-100">
                  {abwanderungsRadar.length} Risikokunden
                </span>
              </div>
              <div className="space-y-2">
                {abwanderungsRadar.map((r) => {
                  const risk = RISK_LEVEL_FARBEN[r.riskLevel] || RISK_LEVEL_FARBEN.medium;
                  const trendArrow = r.trend === 'steigend' ? '↑' : r.trend === 'fallend' ? '↓' : '→';
                  const trendColor = r.trend === 'steigend' ? '#dc2626' : r.trend === 'fallend' ? '#059669' : '#d97706';
                  return (
                    <div
                      key={r.kundeId}
                      className="row-hover relative flex items-start gap-3 p-3 pl-4 rounded-xl border border-slate-200 cursor-pointer transition-all bg-white"
                      onClick={() => navigateTo('detail', { kundeId: r.kundeId, tab: 'stammdaten' })}
                    >
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r" style={{ background: risk.stripe }} />
                      <Avatar name={r.customerName} foto={getKundeFoto(r.kundeId)} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-sm font-bold text-slate-800 truncate">{r.customerName}</span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap flex items-center gap-1"
                            style={{ background: risk.bg, color: risk.text }}
                          >
                            <span style={{ color: trendColor }}>{trendArrow}</span> {risk.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{r.summary}</div>
                        <div className="text-[11px] text-slate-400 italic truncate">{r.riskType} wahrscheinlich</div>
                        <div className="text-xs mt-1.5">
                          <span className="text-slate-500">CLV at risk: </span>
                          <span className="font-bold" style={{ color: risk.stripe }}>{r.clvAtRisk.toLocaleString('de-DE')}€</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{abwanderungsRadar.length} Kunden</span>
                <span className="font-bold text-red-700">
                  {abwanderungsRadar.reduce((s, r) => s + r.clvAtRisk, 0).toLocaleString('de-DE')}€ CLV at risk
                </span>
              </div>
            </Card>
          </div>
        )}
        </div>
        {/* /Potenziale + Marketingkampagnen wrapper */}

        {/* Aufgaben – modern card list */}
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--mode-primary-light), var(--mode-primary))' }}>
                <CheckSquare size={16} className="text-white" strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-slate-800">{t('aktuelleAufgaben')}</h3>
            </div>
            <span className="rh-badge text-xs px-2.5 py-1 rounded-full font-semibold bg-red-50 text-red-600 border border-red-100">
              {aufgaben.length} {lang === 'en' ? 'open' : 'offen'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {aufgaben.map((a, i) => {
              const fSlug = String(a.faellig || '').toLowerCase();
              const isToday = fSlug === 'heute' || fSlug === 'today';
              const isTomorrow = fSlug === 'morgen' || fSlug === 'tomorrow';
              const urgentColor = isToday ? '#ef4444' : isTomorrow ? '#f97316' : '#3b82f6';
              const urgentBg = isToday ? '#fef2f2' : isTomorrow ? '#fff7ed' : '#eff6ff';
              const text = a.text || '';
              const TaskIcon = /fida|consent|dokument|unterlage|formular|vertrag|plan|analyse/i.test(text) ? FileText
                : /anruf|call|nachfass|kontakt|ruf/i.test(text) ? Phone
                : /termin|meeting|gespraech|gespräch/i.test(text) ? Calendar
                : /vorbereit|erstellen|prep/i.test(text) ? Sparkles
                : CheckSquare;
              return (
                <div
                  key={i}
                  className="row-hover group aufgabe-tile relative flex items-center gap-3 p-3 pl-4 rounded-xl bg-white border border-slate-200 cursor-pointer transition-all overflow-hidden"
                  onClick={() => a.kundeId && navigateTo('detail', { kundeId: a.kundeId })}
                >
                  {/* Priority stripe */}
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: urgentColor }} />

                  {/* Checkbox */}
                  <button
                    className="w-5 h-5 rounded-md border-2 border-slate-300 flex items-center justify-center group-hover:border-emerald-500 transition-colors shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Erledigen"
                  >
                    <div className="w-2 h-2 rounded-sm bg-emerald-500 scale-0 group-hover:scale-100 transition-transform" />
                  </button>

                  {/* Icon tile */}
                  <div
                    className="aufgabe-icon-tile w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: urgentBg }}
                  >
                    <TaskIcon size={16} className="aufgabe-icon" style={{ color: urgentColor }} strokeWidth={2} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate group-hover:text-slate-900">{text}</div>
                    <div className="text-xs text-slate-400 mt-0.5 group-hover:text-slate-500">
                      {a.kundeId ? (lang === 'en' ? 'Open client file' : 'Kundenakte öffnen') : (lang === 'en' ? 'Internal task' : 'Interne Aufgabe')}
                    </div>
                  </div>

                  {/* Date badge */}
                  <span
                    className="aufgabe-date-badge text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap uppercase tracking-wide shrink-0"
                    style={{ backgroundColor: urgentColor, color: 'white' }}
                  >
                    {a.faellig}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Letzte Abschluesse */}
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-500" strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">{t('letzteAbschluesse')}</h3>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">{t('dieseWoche')}</span>
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
                    <span className="text-sm font-medium" style={{ color: 'var(--_fg, #334155)' }}>{a.kunde}</span>
                    <div className="text-xs" style={{ color: 'var(--_fg, #64748b)' }}>{a.produkt}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium" style={{ color: 'var(--_fg, #1e293b)' }}>{formatEur(a.betrag)}</div>
                  <div className="text-xs" style={{ color: 'var(--_fg, #94a3b8)' }}>{a.datum}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: 'var(--mode-primary-light)' }}
            onClick={() => setActiveTab('neugeschaeft')}
          >
            {t('alleAbschluesseAnzeigen')}
          </button>
        </Card>
      </div>

      {/* Rechte Spalte 1/3 */}
      <div className="col-span-1 space-y-4 min-w-0">
        {/* Anstehende Termine */}
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">{t('anstehendeTermine')}</h3>
          </div>
          <div className="space-y-3">
            {termine.map((termin, i) => {
              const tDate = new Date(termin.datum);
              const todayStr = heute.toISOString().split('T')[0];
              const isToday = termin.datum === todayStr;
              const dayLabel = isToday ? t('heute') : tDate.toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
              const isNeu = !!termin.istNeuZugestimmt;
              const handleClick = () => {
                // Alle Termine öffnen die KI-Gesprächsvorbereitung als Popup.
                // Falls der Kunde nicht im aktuell geladenen Mode-Bestand zu
                // finden ist (z. B. VV-Pipeline-Stubs, KDB-Stubs), springen
                // wir direkt auf die Detailseite — dann kümmert sich die
                // Suspense-Logik um das Laden.
                const k = modeKunden.find(k => k.id === termin.kundeId);
                if (k) {
                  setTerminPrep({ kunde: k, termin });
                } else {
                  navigateTo('detail', { kundeId: termin.kundeId });
                }
              };
              return (
                <div
                  key={i}
                  className={`row-hover flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer -mx-2 px-2 rounded-lg ${
                    isNeu ? 'bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-50' : ''
                  }`}
                  onClick={handleClick}
                >
                  <div className="text-center shrink-0 w-14">
                    <div className="text-[10px] font-semibold uppercase" style={{ color: isToday ? 'var(--_fg, #ef4444)' : 'var(--_fg, #94a3b8)' }}>{dayLabel}</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--_fg, #334155)' }}>{termin.zeit}</div>
                  </div>
                  <Avatar name={termin.kunde} foto={termin.foto} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--_fg, #334155)' }}>{termin.kunde}</span>
                      {isNeu && (
                        <span className="rh-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wide">
                          <Sparkles size={9} /> +1 Neu
                        </span>
                      )}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--_fg, #64748b)' }}>{termin.betreff}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        {terminPrep && (
          <TerminPrepModal
            kunde={terminPrep.kunde}
            termin={terminPrep.termin}
            onClose={() => setTerminPrep(null)}
          />
        )}

        {/* Schnellzugriff Formulare */}
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">{t('schnellzugriffFormulare')}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {schnellzugriff.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 row-hover cursor-pointer text-center"
                >
                  <Icon size={24} style={{ color: 'var(--_fg, ' + item.color + ')' }} strokeWidth={1.5} />
                  <span className="text-xs font-medium" style={{ color: 'var(--_fg, #475569)' }}>{t(item.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Provisionsabrechnungen */}
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Euro size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">
              {modeId === 'vermoegensverwaltung' ? t('ertragsabrechnungen') : t('provisionsabrechnungen')}
            </h3>
          </div>
          <div className="space-y-2">
            {abrechnungen.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-2 rounded-lg row-hover cursor-pointer">
                <div className="flex items-center gap-3">
                  <Download size={16} style={{ color: 'var(--_fg, #94a3b8)' }} />
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--_fg, #334155)' }}>{a.monat}</div>
                    <div className="text-xs" style={{ color: 'var(--_fg, #94a3b8)' }}>{a.datum}</div>
                  </div>
                </div>
                <span className="text-sm font-mono font-semibold" style={{ color: 'var(--_fg, #1e293b)' }}>{formatEur(a.betrag)}</span>
              </div>
            ))}
          </div>
          <button
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: 'var(--mode-primary-light)' }}
            onClick={() => setActiveTab('verguetung')}
          >
            {t('alleAbrechnungenAnzeigen')}
          </button>
        </Card>

        {/* Geburtstage diese Woche */}
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Cake size={20} className="text-pink-400" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">{t('geburtstagsWoche')}</h3>
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
                  <div className="text-sm font-medium" style={{ color: 'var(--_fg, #334155)' }}>{tn(g.name)}</div>
                  <div className="text-xs" style={{ color: 'var(--_fg, #94a3b8)' }}>{g.datum} · {t('wird')} {g.alter}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setKampagneModal(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero */}
              <div
                className="relative h-44 flex items-center gap-4 px-8 overflow-hidden"
                style={{ background: k.photoGradient }}
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30" style={{ background: k.photoAccent }} />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-20" style={{ background: k.photoAccent }} />
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <PhotoIcon size={40} className="text-white" strokeWidth={1.5} />
                </div>
                <div className="relative z-10 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${istAktiv ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {istAktiv ? (lang === 'en' ? 'Active' : 'Aktiv') : (lang === 'en' ? 'Planned' : 'Geplant')}
                    </span>
                    <span className="text-[11px] font-mono text-white/80">{k.zeitraum}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white truncate">{titel}</h2>
                  <p className="text-sm text-white/80 mt-1 truncate">{zielgruppe}</p>
                </div>
                <button
                  onClick={() => setKampagneModal(null)}
                  className="relative z-10 w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  aria-label="Schließen"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* KPI Strip */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">{lang === 'en' ? 'Matches' : 'Treffer'}</div>
                    <div className="text-xl font-bold text-slate-800">{totalMatches}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">{lang === 'en' ? 'Avg. Match' : 'Ø Match'}</div>
                    <div className="text-xl font-bold text-emerald-600">{avgMatch}%</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">{lang === 'en' ? 'Expected revenue' : 'Erw. Umsatz'}</div>
                    <div className="text-xl font-bold text-slate-800">{erwarteterUmsatz.toLocaleString('de-DE')}€</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">{lang === 'en' ? 'Channel' : 'Kanal'}</div>
                    <div className="text-xl font-bold text-slate-800">3</div>
                  </div>
                </div>

                {/* Beschreibung */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Target size={12} /> {lang === 'en' ? 'Campaign briefing' : 'Kampagnen-Briefing'}
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {lang === 'en'
                      ? `This campaign targets ${zielgruppe.toLowerCase()} who have shown relevant signals in their financial behavior. The matching engine scored ${totalMatches} clients above the 75% threshold and proposes a personalised approach via email, phone and online banking inbox.`
                      : `Diese Kampagne richtet sich an ${zielgruppe.toLowerCase()}, bei denen relevante Signale im Finanzverhalten erkannt wurden. Die Matching-Engine hat ${totalMatches} Kunden oberhalb der 75 %-Schwelle gescored und schlägt eine personalisierte Ansprache über E-Mail, Telefon und Online-Banking-Postfach vor.`}
                  </p>
                </div>

                {/* Maßnahmen-Sequenz */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ListChecks size={12} /> {lang === 'en' ? 'Action sequence' : 'Maßnahmen-Sequenz'}
                  </h4>
                  <ol className="space-y-2 text-sm">
                    {[
                      lang === 'en' ? 'Day 1: Personalised email with campaign offer' : 'Tag 1: Personalisierte E-Mail mit Kampagnen-Angebot',
                      lang === 'en' ? 'Day 4: Online-banking inbox message + push notification' : 'Tag 4: Online-Banking-Postfach + Push-Benachrichtigung',
                      lang === 'en' ? 'Day 8: Advisor call to clients with > 80% match' : 'Tag 8: Beraterkontakt für Kunden mit > 80 % Match',
                      lang === 'en' ? 'Day 14: Reminder email + retargeting via banner' : 'Tag 14: Erinnerungs-Mail + Retargeting via Banner',
                    ].map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                        <span className="text-slate-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Passende Kunden */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users size={12} /> {lang === 'en' ? 'Top matches' : 'Top-Treffer'}
                  </h4>
                  <div className="space-y-2">
                    {k.passendeKunden.slice(0, 3).map((kd) => (
                      <div key={kd.kundeId} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                        <Avatar name={kd.name} foto={getKundeFoto(kd.kundeId)} size={36} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">{kd.name}</div>
                          <div className="text-xs text-slate-600 truncate">{lang === 'en' ? kd.begruendungEn : kd.begruendung}</div>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                          kd.match >= 90 ? 'bg-emerald-100 text-emerald-800'
                          : kd.match >= 80 ? 'bg-lime-100 text-lime-800'
                          : 'bg-amber-100 text-amber-800'
                        }`}>{kd.match}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-end gap-2 rounded-b-2xl">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  <Copy size={14} /> {lang === 'en' ? 'Duplicate' : 'Duplizieren'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  <BarChart size={14} /> {lang === 'en' ? 'View report' : 'Auswertung'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                  <Mail size={14} /> {lang === 'en' ? 'Send test mail' : 'Test-Mail senden'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors">
                  <ListChecks size={14} /> {lang === 'en' ? 'Generate client list' : 'Kundenliste generieren'}
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors"
                  style={{ background: 'var(--mode-primary)' }}
                >
                  <PlayCircle size={14} /> {lang === 'en' ? 'Launch campaign' : 'Kampagne starten'}
                </button>
              </div>
            </div>
          </div>
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
      <div className="font-mono text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{displayLabel}</div>
      <div className={`text-xs mt-0.5 font-medium ${isPositive ? 'text-emerald-500' : isNegative ? 'text-red-500' : 'text-slate-400'}`}>
        {displaySubtext}
      </div>
    </div>
  );
}
