import { useState, useMemo } from 'react';
import { Sun, Clock, Zap, CheckSquare, Calendar, Phone, AlertTriangle, CheckCircle, FileText, Heart, Car, Home, ShieldAlert, Cake, Euro, Download, Landmark, BarChart3, PiggyBank, Wallet, Sparkles } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Avatar from '../../../components/ui/Avatar';
import { PrioBadge, SparteBadge } from '../../../components/ui/Badge';
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
    { name: 'Klaus Fischer', kundeId: 'KDB001', datum: 'Mi, 12.03.', alter: 52 },
    { name: 'Andrea Lang', kundeId: 'KDB006', datum: 'Fr, 14.03.', alter: 41 },
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
  const potentiale = useMemo(() => getAllPotentiale(modeId).sort((a, b) => {
    const prio = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };
    return (prio[a.prioritaet] || 3) - (prio[b.prioritaet] || 3);
  }).slice(0, 5), [modeId]);

  // Group potentials by customer for Versicherung/Banking
  const kundenPotentiale = useMemo(() => {
    if (modeId === 'vermoegensverwaltung') return [];
    const allPots = getAllPotentiale(modeId);
    const grouped = {};
    allPots.forEach(p => {
      if (!grouped[p.kundeId]) {
        grouped[p.kundeId] = { kundeId: p.kundeId, kundeName: p.kundeName, potentiale: [], gesamtPraemie: 0, gesamtProvision: 0 };
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
        {/* Vertriebspotenziale / Mandate & Potenziale - moved up, greeting removed */}

        {/* Vertriebspotenziale / Mandate & Potenziale */}
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
                        <Sparkles size={16} className="text-slate-400" />
                      </div>
                    ) : (
                      <Avatar name={tn(k.name)} foto={getKundeFoto(k.id)} size={34} />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">{tn(k.name)}</div>
                      <div className="text-xs text-slate-400 truncate">{k.mandat ? k.mandat.produkt : k.mandatsTyp || '–'}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm font-mono font-medium text-slate-700 flex items-center justify-end gap-2">
                    {k.id === 'VV00001' && VV_LEADS.some(l => l.isNeuerLead && l.referenzMandant === 'VV00001') && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white whitespace-nowrap animate-pulse">
                        {t('neuerLead')}
                      </span>
                    )}
                    {k.aum ? `${(k.aum / 1000000).toFixed(1)}M` : '–'}
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    {k.letzteKomm ? new Date(k.letzteKomm.datum).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '–'}
                  </div>
                  <div className="text-center">
                    {k.leadsCount > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                        {k.leadsCount}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">–</span>
                    )}
                  </div>
                  <div className="text-center">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      k.istNeu
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {k.istNeu ? t('neu') : t('bestand')}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${
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
            <div className="space-y-0">
              <div className="grid py-1.5 px-3 items-center text-[10px] uppercase text-slate-400 font-semibold" style={{ gridTemplateColumns: '1fr 1fr 80px 100px 100px' }}>
                <span>{t('kunde')}</span>
                <span>{t('topPotenziale')}</span>
                <span className="text-right">{t('anzahl')}</span>
                <span className="text-right">{modeId === 'banking' ? t('volumen') : t('praemie')}</span>
                <span className="text-right">{t('provision')}</span>
              </div>
              {kundenPotentiale.slice(0, 8).map((kp, i) => {
                const topPrio = kp.potentiale.reduce((best, p) => {
                  const prio = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };
                  return (prio[p.prioritaet] ?? 3) < (prio[best] ?? 3) ? p.prioritaet : best;
                }, 'niedrig');
                return (
                  <div
                    key={kp.kundeId}
                    className="grid py-2.5 px-3 rounded-lg row-hover cursor-pointer items-center"
                    style={{ gridTemplateColumns: '1fr 1fr 80px 100px 100px' }}
                    onClick={() => navigateTo('detail', { kundeId: kp.kundeId, tab: 'impulse' })}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={kp.kundeName} foto={getKundeFoto(kp.kundeId)} size={30} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-700 truncate flex items-center gap-1.5">
                          {tn(kp.kundeName)}
                          <PrioBadge prioritaet={topPrio} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {kp.potentiale.slice(0, 3).map((p, pi) => (
                        <span key={pi} className="rh-badge text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 whitespace-nowrap">{p.titel}</span>
                      ))}
                      {kp.potentiale.length > 3 && (
                        <span className="rh-badge text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-400">+{kp.potentiale.length - 3}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-0.5 text-sm font-semibold" style={{ color: 'var(--mode-primary-light)' }}>
                        {kp.potentiale.length}
                      </span>
                    </div>
                    <div className="text-right text-sm font-mono font-medium text-slate-700">
                      {kp.gesamtPraemie > 0 ? `${kp.gesamtPraemie.toLocaleString(lang === 'en' ? 'en-US' : 'de-DE')}€` : '-'}
                    </div>
                    <div className="text-right text-sm font-mono font-medium" style={{ color: 'var(--mode-primary-light)' }}>
                      {kp.gesamtProvision > 0 ? `${kp.gesamtProvision.toLocaleString(lang === 'en' ? 'en-US' : 'de-DE')}€` : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
            {kundenPotentiale.length > 8 && (
              <button
                className="mt-3 text-sm font-medium hover:underline"
                style={{ color: 'var(--mode-primary-light)' }}
                onClick={() => setActiveTab('potentiale')}
              >
                {t('weitereKundenAnzeigen', { count: kundenPotentiale.length - 8 })}
              </button>
            )}
          </Card>
        )}

        {/* Aufgaben */}
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare size={20} className="text-slate-500" strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">{t('aktuelleAufgaben')}</h3>
            </div>
            <span className="text-sm text-slate-400">{t('offen', { count: aufgaben.length })}</span>
          </div>
          <div className="space-y-2">
            {aufgaben.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 cursor-pointer row-hover -mx-2 px-2 rounded-lg"
                onClick={() => a.kundeId && navigateTo('detail', { kundeId: a.kundeId })}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300" readOnly />
                  <span className="text-sm text-slate-700">{a.text}</span>
                </div>
                <span className="text-xs text-slate-400">{a.faellig}</span>
              </div>
            ))}
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
                    <span className="text-sm font-medium text-slate-700">{a.kunde}</span>
                    <div className="text-xs text-slate-500">{a.produkt}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium text-slate-800">{formatEur(a.betrag)}</div>
                  <div className="text-xs text-slate-400">{a.datum}</div>
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
                    <div className={`text-[10px] font-semibold uppercase ${isToday ? 'text-red-500' : 'text-slate-400'}`}>{dayLabel}</div>
                    <div className="text-sm font-bold text-slate-700">{termin.zeit}</div>
                  </div>
                  <Avatar name={termin.kunde} foto={termin.foto} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-700 truncate">{termin.kunde}</div>
                    <div className="text-xs text-slate-500 truncate">{termin.betreff}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Schnellzugriff Formulare */}
        <Card >
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
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-slate-300 row-hover transition-all text-center"
                >
                  <Icon size={24} style={{ color: item.color }} strokeWidth={1.5} />
                  <span className="text-xs font-medium text-slate-600">{t(item.labelKey)}</span>
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
                  <Download size={16} className="text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-700">{a.monat}</div>
                    <div className="text-xs text-slate-400">{a.datum}</div>
                  </div>
                </div>
                <span className="text-sm font-mono font-semibold text-slate-800">{formatEur(a.betrag)}</span>
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
                  <div className="text-sm font-medium text-slate-700">{tn(g.name)}</div>
                  <div className="text-xs text-slate-400">{g.datum} · {t('wird')} {g.alter}</div>
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
