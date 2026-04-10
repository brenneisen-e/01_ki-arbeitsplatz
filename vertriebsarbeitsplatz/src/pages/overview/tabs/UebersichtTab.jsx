import { useState, useMemo } from 'react';
import { Sun, Clock, Zap, CheckSquare, Calendar, Phone, AlertTriangle, CheckCircle, FileText, Heart, Car, Home, ShieldAlert, Cake, Euro, Download, Landmark, BarChart3, PiggyBank, Wallet, Sparkles, Star, Megaphone, ChevronDown, ChevronRight, Users, TrendingUp } from 'lucide-react';

const CAMPAIGN_ICONS = { Home, Users, TrendingUp, Heart, Sparkles };
import Card from '../../../components/ui/Card';
import Avatar from '../../../components/ui/Avatar';
import { SparteBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { KUNDEN_BY_MODE, TERMINE_BY_MODE, AUFGABEN_BY_MODE, getAllPotentiale } from '../../../data';
import { VV_LEADS } from '../../../data/vvExtended';
import { formatEur } from '../../../utils/formatters';
import { getKundeFoto } from '../../../utils/kundenFotos';

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
  banking: { text: tx('Klaus Fischer - Anschlussfinanzierung 09/2026', 'Klaus Fischer - Refinancing 09/2026'), next: '14:00 Klaus Fischer' },
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
    { kunde: 'Klaus Fischer', kundeId: 'KDB001', produkt: 'Anschlussfinanzierung', sparte: 'kredit', betrag: 185000, datum: '10.03.2026' },
    { kunde: 'Sandra Müller', kundeId: 'KDB002', produkt: 'VR-FinanzPlan', sparte: 'wertpapier', betrag: 25000, datum: '09.03.2026' },
    { kunde: 'Peter Hoffmann', kundeId: 'KDB005', produkt: 'VermögenPlus Depot', sparte: 'wertpapier', betrag: 50000, datum: '08.03.2026' },
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
        { kundeId: 'BK00001', name: 'Klaus Fischer', match: 97, begruendung: `Zinsbindung läuft 04/2026 aus, ${b.bausparPartner}-Bausparer zuteilungsreif`, begruendungEn: `Interest lock expires 04/2026, ${b.bausparPartner} building loan ready` },
        { kundeId: 'BK00002', name: 'Sandra Müller', match: 92, begruendung: 'Immobilienkauf vorbereiten, Ehemann als Neukunde gewinnen', begruendungEn: 'Preparing home purchase, onboard spouse as new client' },
        { kundeId: 'BK00004', name: 'Markus Wagner', match: 78, begruendung: 'Junges Alter, erstes Eigenheim-Interesse erkannt', begruendungEn: 'Young age, first home interest detected' },
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
        { kundeId: 'BK00004', name: 'Markus Wagner', match: 87, begruendung: '29 Jahre, keine BU – optimaler Einstiegszeitpunkt', begruendungEn: '29 years, no disability cover – optimal entry age' },
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
  // Marketingkampagnen are derived from the active institut so the campaign
  // titles always reflect the current bank's brand (no Volksbank-only names
  // leaking into Zukunftsbank, Sparkasse, Deutsche Bank etc.).
  const marketingKampagnen = useMemo(
    () => buildBankingKampagnen(config.institut),
    [config.institut]
  );
  const potentiale = useMemo(() => getAllPotentiale(modeId).sort((a, b) => {
    const prio = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };
    return (prio[a.prioritaet] || 3) - (prio[b.prioritaet] || 3);
  }).slice(0, 5), [modeId]);

  // Group potentials by customer for Versicherung/Banking
  const kundenPotentiale = useMemo(() => {
    if (modeId === 'vermoegensverwaltung') return [];
    const allPots = getAllPotentiale(modeId);
    const grouped = {};
    const kundenMap = {};
    (KUNDEN_BY_MODE[modeId] || []).forEach(k => { kundenMap[k.id] = k; });
    allPots.forEach(p => {
      if (!grouped[p.kundeId]) {
        const k = kundenMap[p.kundeId];
        const abgebrochen = (k?.produktabschluss || []).filter(a => a.status === 'abgebrochen').length;
        const clv = (k?.eigeneProdukte?.reduce((s, p2) => s + (p2.praemie || 0), 0) || 0) * 10 || Math.round((k?.nettoeinkommen || 5000) * 12 * 0.03 * 10);
        grouped[p.kundeId] = { kundeId: p.kundeId, kundeName: p.kundeName, nps: k?.nps, abgebrochenCount: abgebrochen, clv, potentiale: [], gesamtPraemie: 0, gesamtProvision: 0 };
      }
      grouped[p.kundeId].potentiale.push(p);
      if (p.volumen > 0) {
        grouped[p.kundeId].gesamtPraemie += p.volumen;
        grouped[p.kundeId].gesamtProvision += Math.round(p.volumen * 0.75);
      }
    });
    // Sort by total premium descending, then by number of potentials
    return Object.values(grouped).sort((a, b) => b.gesamtPraemie - a.gesamtPraemie || b.potentiale.length - a.potentiale.length);
  }, [modeId]);

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

  const termine = (TERMINE_BY_MODE[modeId] || TERMINE_BY_MODE.versicherung).slice(0, 4);
  const aufgaben = AUFGABEN_BY_MODE[modeId] || AUFGABEN_BY_MODE.versicherung;
  const miniKpis = MINI_KPIS[modeId] || MINI_KPIS.versicherung;
  const tagesItems = TAGESSTART_ITEMS[modeId] || TAGESSTART_ITEMS.versicherung;
  const abschluesse = LETZTE_ABSCHLUESSE[modeId] || LETZTE_ABSCHLUESSE.versicherung;
  const geburtstage = GEBURTSTAGE[modeId] || GEBURTSTAGE.versicherung;
  const schnellzugriff = SCHNELLZUGRIFF[modeId] || SCHNELLZUGRIFF.versicherung;
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
        {/* Vertriebspotenziale / Mandate & Potenziale (skipped for banking) */}
        {modeId === 'banking' ? null : modeId === 'vermoegensverwaltung' ? (
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
        ) : (
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={20} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
                <h3 className="font-semibold text-slate-800">{t('vertriebspotenziale')}</h3>
              </div>
              <span className="text-sm text-slate-400">{t('kundenPotenzialeSummary', { kunden: kundenPotentiale.length, potenziale: getAllPotentiale(modeId).length })}</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid py-2.5 px-3 items-center text-[10px] uppercase text-slate-500 font-bold bg-slate-50 border-b border-slate-200 divide-x divide-slate-200" style={{ gridTemplateColumns: '220px 80px 80px minmax(0, 1fr)' }}>
                <span className="pr-2">{t('kunde')}</span>
                <span className="text-center px-2">NPS</span>
                <span className="text-center px-2">Leads</span>
                <span className="pl-2">{t('topPotenziale')}</span>
              </div>
              {kundenPotentiale.slice(0, modeId === 'banking' ? 5 : 8).map((kp, i, arr) => {
                const isLast = i === arr.length - 1;
                return (
                  <div
                    key={kp.kundeId}
                    className={`grid py-3 px-3 hover:bg-slate-50 cursor-pointer items-center transition-colors divide-x divide-slate-100 ${isLast ? '' : 'border-b border-slate-100'}`}
                    style={{ gridTemplateColumns: '220px 80px 80px minmax(0, 1fr)' }}
                    onClick={() => navigateTo('detail', { kundeId: kp.kundeId, tab: 'stammdaten' })}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Avatar name={kp.kundeName} foto={getKundeFoto(kp.kundeId)} size={30} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--_fg, #334155)' }}>
                          {tn(kp.kundeName)}
                        </div>
                      </div>
                    </div>
                    <div className="text-center flex justify-center px-2">
                      {kp.nps != null ? (
                        <div className="flex items-center gap-px">
                          {[1,2,3,4,5].map(s => {
                            const filled = kp.nps >= s * 2;
                            const half = !filled && kp.nps >= s * 2 - 1;
                            return <Star key={s} size={11} className={filled ? 'text-amber-400 fill-amber-400' : half ? 'text-amber-400 fill-amber-400/50' : 'text-slate-200'} />;
                          })}
                        </div>
                      ) : <span className="text-slate-300 text-xs">–</span>}
                    </div>
                    <div className="text-center px-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--_fg, #334155)' }}>
                        {kp.potentiale.length}
                        {kp.abgebrochenCount > 0 && (
                          <span className="rh-badge text-[9px] px-1.5 py-0.5 rounded-full bg-red-500 text-white font-bold">{kp.abgebrochenCount} Neu</span>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 min-w-0 pl-2">
                      {kp.potentiale.slice(0, 3).map((p, pi) => (
                        <span key={pi} className="rh-badge text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 whitespace-nowrap">{p.titel}</span>
                      ))}
                      {kp.potentiale.length > 3 && (
                        <span className="rh-badge text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-400">+{kp.potentiale.length - 3}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {kundenPotentiale.length > (modeId === 'banking' ? 5 : 8) && (
              <button
                className="mt-3 text-sm font-medium hover:underline"
                style={{ color: 'var(--mode-primary-light)' }}
                onClick={() => setActiveTab('potentiale')}
              >
                {t('weitereKundenAnzeigen', { count: kundenPotentiale.length - (modeId === 'banking' ? 5 : 8) })}
              </button>
            )}
          </Card>
        )}

        {/* Marketingkampagnen (Banking only) – 4 photo boxes, hover fades the
            image so the campaign details + click action come forward */}
        {modeId === 'banking' && (
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
            <div className="grid grid-cols-4 gap-4">
              {marketingKampagnen.map((kampagne) => {
                const istAktiv = kampagne.status === 'aktiv';
                const titel = lang === 'en' ? kampagne.titelEn : kampagne.titel;
                const zielgruppe = lang === 'en' ? kampagne.zielgruppeEn : kampagne.zielgruppe;
                const isExpanded = expandedKampagne === kampagne.id;
                const PhotoIcon = CAMPAIGN_ICONS[kampagne.photoIcon] || Megaphone;
                return (
                  <div
                    key={kampagne.id}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5 bg-white flex flex-col"
                    onClick={() => setExpandedKampagne(isExpanded ? null : kampagne.id)}
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
                      {/* Icon */}
                      <PhotoIcon size={48} className="text-white relative z-10 transition-transform group-hover:scale-110" strokeWidth={1.5} />

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {kampagne.passendeKunden.map((k) => (
                      <div
                        key={k.kundeId}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('detail', { kundeId: k.kundeId, tab: 'stammdaten' });
                        }}
                      >
                        <Avatar name={k.name} foto={getKundeFoto(k.kundeId)} size={32} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-800 truncate">{k.name}</span>
                            <span className={`rh-badge text-[9px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap ${
                              k.match >= 90 ? 'bg-emerald-100 text-emerald-800'
                              : k.match >= 80 ? 'bg-lime-100 text-lime-800'
                              : 'bg-amber-100 text-amber-800'
                            }`}>{k.match}%</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
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
                  className="group relative flex items-center gap-3 p-3 pl-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer transition-all overflow-hidden"
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
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: urgentBg }}
                  >
                    <TaskIcon size={16} style={{ color: urgentColor }} strokeWidth={2} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{text}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {a.kundeId ? (lang === 'en' ? 'Open client file' : 'Kundenakte öffnen') : (lang === 'en' ? 'Internal task' : 'Interne Aufgabe')}
                    </div>
                  </div>

                  {/* Date badge */}
                  <span
                    className="rh-badge text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap uppercase tracking-wide shrink-0"
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
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer row-hover -mx-2 px-2 rounded-lg"
                  onClick={() => navigateTo('detail', { kundeId: termin.kundeId })}
                >
                  <div className="text-center shrink-0 w-14">
                    <div className="text-[10px] font-semibold uppercase" style={{ color: isToday ? 'var(--_fg, #ef4444)' : 'var(--_fg, #94a3b8)' }}>{dayLabel}</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--_fg, #334155)' }}>{termin.zeit}</div>
                  </div>
                  <Avatar name={termin.kunde} foto={termin.foto} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--_fg, #334155)' }}>{termin.kunde}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--_fg, #64748b)' }}>{termin.betreff}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

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
