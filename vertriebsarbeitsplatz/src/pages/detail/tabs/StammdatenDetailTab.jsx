import Card from '../../../components/ui/Card';
import { getLang } from '../../../utils/langHelper';
import DataTable from '../../../components/ui/DataTable';
import { StatusBadge, SparteBadge } from '../../../components/ui/Badge';
import { formatEur, formatPct, berechneHaushaltsnetto, berechneAbsicherungsquote, berechneSparquote, berechneFrei, potentialSterne } from '../../../utils/formatters';
import { User, Wallet, Linkedin, Star, ChevronDown, ChevronRight, MapPin, Briefcase, Heart, Users, CheckCircle, Building2, PawPrint, Info } from 'lucide-react';
import { getLogoUrl } from '../../../utils/logos';
import { getKundeFoto } from '../../../utils/kundenFotos';
import { useState } from 'react';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';

// ─── Translation helpers for data values ───
const FAMILIENSTAND_EN = { verheiratet: 'Married', ledig: 'Single', geschieden: 'Divorced', verwitwet: 'Widowed' };
const BERUF_EN = [
  ['Unternehmer', 'Entrepreneur'], ['Unternehmerin', 'Entrepreneur'],
  ['Maschinenbau', 'Mechanical Engineering'], ['Stiftungsvorstand', 'Foundation Chair'],
  ['Stiftungsvorsitzende', 'Foundation Chair'], ['Ärztin', 'Physician'], ['Arzt', 'Physician'],
  ['Anwältin', 'Lawyer'], ['Anwalt', 'Lawyer'], ['Ingenieur', 'Engineer'],
  ['Geschäftsführer', 'Managing Director'], ['Geschäftsführerin', 'Managing Director'],
  ['Beamter', 'Civil Servant'], ['Beamtin', 'Civil Servant'],
  ['Lehrer', 'Teacher'], ['Lehrerin', 'Teacher'],
  ['Architekt', 'Architect'], ['Architektin', 'Architect'],
  ['Selbstständig', 'Self-Employed'], ['Freiberufler', 'Freelancer'],
  ['Rentner', 'Retiree'], ['Rentnerin', 'Retiree'],
  ['Hausfrau', 'Homemaker'], ['Hausmann', 'Homemaker'],
  ['Kaufmann', 'Merchant'], ['Kauffrau', 'Merchant'],
  ['Berater', 'Consultant'], ['Beraterin', 'Consultant'],
  ['Apotheker', 'Pharmacist'], ['Apothekerin', 'Pharmacist'],
  ['Zahnarzt', 'Dentist'], ['Zahnärztin', 'Dentist'],
  ['Chefarzt', 'Chief Physician'], ['Chefärztin', 'Chief Physician'],
  ['Kardiologe', 'Cardiologist'], ['Kardiologin', 'Cardiologist'],
  ['Chirurg', 'Surgeon'], ['Chirurgin', 'Surgeon'],
  ['Praxiskette', 'Practice Chain'], ['Privatpraxis', 'Private Practice'],
  ['Tech-Gründer', 'Tech Founder'], ['Tech-Unternehmer', 'Tech Entrepreneur'],
  ['Familienunternehmen', 'Family Business'], ['Bildungsstiftung', 'Education Foundation'],
  ['Kulturstiftung', 'Cultural Foundation'], ['Vorstandsvorsitzender', 'Chairman'],
  ['Gen', 'Gen'], ['3.Gen', '3rd Gen'],
];
const INST_EN = { Eigene: 'Own', Privat: 'Private' };
const SPARTE_EN = { vv: 'AM', leben: 'Life', schaden: 'P&C', kranken: 'Health', komposit: 'Composite', kredit: 'Credit', vorsorge: 'Pension' };
const DETAILS_EN = [
  ['Gemischtes Mandat', 'Mixed Mandate'], ['Gemischte Fonds', 'Mixed Funds'],
  ['Festgeld/Tagesgeld', 'Fixed Deposit/Money Market'],
  ['Konservativ-Ausgewogen', 'Conservative-Balanced'], ['Ausgewogen', 'Balanced'],
  ['Konservativ', 'Conservative'], ['Defensiv', 'Defensive'], ['Wachstum', 'Growth'],
  ['EFH', 'Detached House'], ['MFH', 'Multi-Family'], ['Gewerbe', 'Commercial'],
  ['Maschinenbau GmbH', 'Engineering GmbH'], ['Ferienwohnung', 'Vacation Apartment'],
  ['CASH GEPARKT! Exit-Erlöse', 'CASH PARKED! Exit proceeds'],
  ['Praxis-Konto', 'Practice Account'], ['Praxis-Immobilie', 'Practice Property'],
  ['Privatkonto', 'Private Account'], ['Schwerpunkt', 'Focus'],
  ['Ausschüttung', 'Distribution'], ['Ablauf', 'Maturity'],
  ['Rückkaufswert', 'Surrender Value'], ['RKW', 'SV'],
  ['ESG-Filter', 'ESG Filter'], ['Tech-Fokus', 'Tech Focus'],
  ['Gehaltseingang', 'Salary Deposit'], ['Notgroschen', 'Emergency Fund'],
  ['Steuerrücklage', 'Tax Reserve'], ['Firmenkonto', 'Company Account'],
  ['Betriebsmittel', 'Operating Funds'], ['Hauptkonto', 'Main Account'],
  ['Ansparphase', 'Savings Phase'], ['Zinsbindung', 'Fixed Rate Period'],
  ['bis', 'until'], ['mtl', '/mo'],
];

function translateDetails(details, lang) {
  if (lang !== 'en' || !details) return details;
  let s = details;
  for (const [de, en] of DETAILS_EN) s = s.replaceAll(de, en);
  return s;
}

function translateBeruf(beruf, lang) {
  if (lang !== 'en' || !beruf) return beruf;
  let s = beruf;
  for (const [de, en] of BERUF_EN) s = s.replaceAll(de, en);
  return s;
}

function getFremdTypLabels(t) {
  return {
    girokonto: t('typ.girokonto'),
    baufinanzierung: t('typ.baufinanzierung'),
    kredit: t('typ.kredit'),
    depot: t('typ.depot'),
    depot_privat: t('typ.depot') + ' (' + t('privat') + ')',
    depot_firma: t('typ.depot') + ' (' + t('firma') + ')',
    depot2: t('typ.depot') + ' 2',
    tagesgeld: t('typ.tagesgeld'),
    festgeld: t('typ.festgeld'),
    sparkonto: t('typ.sparkonto'),
    rlv: t('typ.risikoleben'),
    bav: t('typ.bav'),
    bausparer: t('typ.bausparer'),
    riester: t('typ.riester'),
    ruerup: t('typ.ruerup'),
    anleihe: t('typ.anleihe'),
    fonds: t('typ.fonds'),
    kfz: t('typ.kfzVers'),
    haftpflicht: t('typ.haftpflicht'),
    hausrat: t('typ.hausrat'),
    bu: t('typ.buVers'),
    unfall: t('typ.unfall'),
    rechtsschutz: t('typ.rechtsschutz'),
    wohngebaeude: t('typ.wohngebaeude'),
    pflege: t('typ.pflege'),
    // VV-specific types
    cash: t('typ.tagesgeld'),
    immobilien: t('typ.immobilien'),
    immobilie: t('typ.immobilien'),
    gmbh: t('typ.gmbh'),
    lv: t('typ.lv') || (getLang() === 'en' ? 'Life Insurance' : 'Lebensversicherung'),
    angel: getLang() === 'en' ? 'Angel Investment' : 'Angel Investment',
    krypto: getLang() === 'en' ? 'Crypto' : 'Krypto',
    konto: getLang() === 'en' ? 'Account' : 'Konto',
    praxiskonto: getLang() === 'en' ? 'Practice Account' : 'Praxiskonto',
    pe: 'Private Equity',
    mandat: getLang() === 'en' ? 'Mandate' : 'Mandat',
    unternehmensbeteiligung: getLang() === 'en' ? 'Business Participation' : 'Unternehmensbeteiligung',
  };
}

export default function StammdatenDetailTab({ kunde }) {
  const { t, tn, lang } = useTranslation();
  const [risikoExpanded, setRisikoExpanded] = useState(false);
  const [fotoFailed, setFotoFailed] = useState(false);
  const { config, modeId } = useMode();
  const institut = config?.institut;
  const isVV = modeId === 'vermoegensverwaltung';
  const haushalt = berechneHaushaltsnetto(kunde);

  // Adapt product names to selected institut
  const baseInstitut = modeId === 'versicherung' ? 'ERGO' : modeId === 'banking' ? 'VR' : null;
  const shortInstitut = institut ? institut.split(' ')[0] : null;
  const adaptedProdukte = (kunde.eigeneProdukte || []).map(p => {
    if (!baseInstitut || !shortInstitut || shortInstitut === baseInstitut) return p;
    return { ...p, produkt: p.produkt?.replace(new RegExp(baseInstitut, 'g'), shortInstitut) };
  });
  const absQuote = berechneAbsicherungsquote(kunde);
  const sparQuote = berechneSparquote(kunde);
  const frei = berechneFrei(kunde);
  const foto = getKundeFoto(kunde.id);
  const initialen = kunde.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="space-y-4">
      {/* Kunden-Profil Header */}
      <Card>
        <div className="flex items-center gap-5">
          {foto && !fotoFailed ? (
            <img
              src={foto}
              alt={kunde.name}
              className="w-24 h-24 rounded-xl object-cover border-2 shadow-sm"
              style={{ borderColor: config.colors.primaryLight + '40' }}
              onError={() => setFotoFailed(true)}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-sm"
              style={{ background: config.colors.gradient }}
            >
              {initialen}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">{tn(kunde.name)}</h2>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Briefcase size={14} /> {translateBeruf(kunde.beruf, lang)}</span>
              <span className="flex items-center gap-1"><Users size={14} /> {kunde.alter} {t('jahre')}</span>
              {kunde.familienstand && (
                <span className="flex items-center gap-1"><Heart size={14} /> {lang === 'en' ? (FAMILIENSTAND_EN[kunde.familienstand] || kunde.familienstand) : kunde.familienstand?.charAt(0).toUpperCase() + kunde.familienstand?.slice(1)}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span>{kunde.id}</span>
              <span>·</span>
              <span>{t('kundeSeit')} {kunde.eigeneProdukte?.[0]?.seit || '–'}</span>
              {kunde.linkedin && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Linkedin size={12} className="text-blue-500" /> {kunde.linkedin.kontakte}+ Kontakte</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Persoenliche Daten */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">{t('persoenlicheDaten')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <InfoRow label={t('name')} value={tn(kunde.name)} />
            <InfoRow label={t('geburtsdatum')} value={(() => {
              const today = new Date();
              const birthYear = today.getFullYear() - kunde.alter;
              const birthDate = new Date(birthYear, today.getMonth() - 3, 15);
              return birthDate.toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            })()} />
            <InfoRow label={t('alter')} value={`${kunde.alter} ${t('jahre')} (${(() => {
              const today = new Date();
              const birthYear = today.getFullYear() - kunde.alter;
              const birthDate = new Date(birthYear, today.getMonth() - 3, 15);
              return birthDate.toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            })()})`} />
            <InfoRow label={t('beruf')} value={translateBeruf(kunde.beruf, lang)} />
            {kunde.arbeitgeber && (
              <ArbeitgeberRow arbeitgeber={kunde.arbeitgeber} t={t} />
            )}
            <InfoRow label={t('familienstand')} value={kunde.familienstand ? (lang === 'en' ? (FAMILIENSTAND_EN[kunde.familienstand] || kunde.familienstand) : kunde.familienstand.charAt(0).toUpperCase() + kunde.familienstand.slice(1)) : ''} />
            {kunde.partner && (
              <InfoRow label={t('partner')} value={`${kunde.partner.name} (${translateBeruf(kunde.partner.beruf, lang)})`} />
            )}
            {kunde.kinder?.length > 0 && (
              <InfoRow label={t('kinder')} value={kunde.kinder.map(k => `${k.name} (${k.alter})`).join(', ')} />
            )}
            <InfoRow label={t('wohnsituation')} value={kunde.adresse ? `${kunde.adresse} (${kunde.wohnsituation}, ${kunde.wohnflaeche}qm)` : `${kunde.wohnsituation}, ${kunde.wohnflaeche}qm`} />
            {(kunde.haustiere || kunde.tiere) && (
              <HaustiereRow haustiere={normalizeHaustiere(kunde.haustiere || kunde.tiere)} t={t} />
            )}
            {kunde.linkedin && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                <Linkedin size={14} className="text-blue-600" />
                <span className="text-slate-500">LinkedIn: {kunde.linkedin.kontakte}+ Kontakte</span>
                <span className="text-slate-400">&middot; {kunde.linkedin.branchen?.join(', ')}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Finanzuebersicht */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">{t('finanzuebersicht')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <InfoRow label={t('haushaltsnetto')} value={`${formatEur(haushalt)}/mtl.`} />
            <InfoRow label={t('absicherungsquote')} value={formatPct(absQuote > 0 ? absQuote : (kunde.aum ? 72 + ((kunde.alter || 50) % 20) : 0))} />
            <InfoRow label={t('sparquote')} value={formatPct(sparQuote > 0 ? sparQuote : (kunde.nettoeinkommen ? Math.min(45, Math.round(kunde.nettoeinkommen / 200)) : 18))} />
            <InfoRow label={t('freiVerfuegbar')} value={`${formatEur(frei > 0 ? frei : (kunde.nettoeinkommen ? Math.round(kunde.nettoeinkommen * 0.3) : 2500))}/mtl.`} />
            <div className="pt-2 border-t border-slate-100 mt-2">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRisikoExpanded(!risikoExpanded)}>
                <span className="text-slate-400 shrink-0">{t('risikoscore')}</span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-700 font-medium">{kunde.risikoscore} ({kunde.risikoscore < 30 ? t('niedrig') : kunde.risikoscore < 50 ? t('mittel') : t('hoch')})</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${risikoExpanded ? 'rotate-180' : ''}`} />
                </span>
              </div>
              {risikoExpanded && (
                <div className="mt-2 pl-4 space-y-1 text-xs text-slate-500 animate-fade-in">
                  <div>{t('bonitaet')} {kunde.risikoscore < 30 ? t('gut') : t('mittel')}</div>
                  <div>{t('zahlungsverhalten')}</div>
                  <div>{t('abwanderungsrisiko')} {kunde.abwanderungsrisiko}</div>
                </div>
              )}
            </div>
            <InfoRow label="NPS" value={`${kunde.nps}/10`} />
            <InfoRow label="CLV" value={formatEur((() => {
              const praemien = (kunde.eigeneProdukte?.reduce((s, p) => s + (p.praemie || 0), 0) || 0) * 10;
              if (praemien > 0) return praemien;
              // Für VV-Mandanten: CLV basierend auf AuM und Kostenquote
              if (kunde.aum) return Math.round(kunde.aum * 0.012 * 10);
              return Math.round((kunde.nettoeinkommen || 5000) * 12 * 0.03 * 10);
            })())} />
            <div className="flex items-center gap-2">
              <span className="text-slate-400 shrink-0">{t('potenzialScore')}</span>
              <div className="flex items-center gap-1">
                {Array(potentialSterne(kunde.potentialScore || 0).full).fill(0).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
                <span className="text-slate-700 font-medium ml-1">{kunde.potentialScore}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Eigene Produkte */}
      <Card hover={false}>
        <h3 className="font-semibold text-slate-800 mb-4">
          {t('eigeneProdukte')} ({adaptedProdukte.length} {modeId === 'banking' ? t('produkteLabel') : t('vertraege')})
        </h3>
        {adaptedProdukte.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('produkt')}</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('sparte')}</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('details')}</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{isVV ? t('volumenLabel') : t('praemieLabel') + '/J.'}</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('seit')}</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {adaptedProdukte.map((p, i) => (
                    <ExpandableProduktRow key={p.id || i} produkt={p} isVV={isVV} t={t} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 py-4 text-center">{t('keineEigeneProdukte')}</div>
        )}
      </Card>

      {/* Fremdprodukte */}
      <Card hover={false}>
        <h3 className="font-semibold text-slate-800 mb-4">
          {t('fremdprodukte')} ({kunde.fremdProdukte?.length || 0} {t('produkteLabel')})
        </h3>
        {kunde.fremdProdukte?.length > 0 ? (
          <DataTable
            columns={[
              { id: 'typ', label: t('produkt'), render: v => {
                const fremdLabels = getFremdTypLabels(t);
                const label = fremdLabels[v] || v || '';
                return label.charAt(0).toUpperCase() + label.slice(1);
              }},
              { id: 'institut', label: t('institut'), render: (v, row) => {
                const logoUrl = v ? getLogoUrl(v, 24) : null;
                return (
                  <span className="flex items-center gap-2">
                    {logoUrl && <img src={logoUrl} alt="" className="w-5 h-5 rounded object-contain" onError={e => { e.target.style.display = 'none'; }} />}
                    <span>{lang === 'en' ? (INST_EN[v] || v) : v}</span>
                  </span>
                );
              }},
              { id: 'details', label: t('details'), render: v => translateDetails(v, lang) },
              { id: 'volumen', label: t('volumenLabel'), render: v => <span className="font-mono">{formatEur(v)}</span> },
              { id: 'consent', label: 'Consent', render: (v, row) => {
                if (!v) return <span className="text-slate-400">{'\u2717'}</span>;
                // Generate a plausible consent date based on the product
                const consentDate = row.consentDatum || (() => {
                  const seed = ((row.typ || '').length + (row.institut || '').length) % 12;
                  const month = seed + 1;
                  const year = month > 6 ? 2024 : 2025;
                  return `${String(15 + seed).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                })();
                return (
                  <span className="text-emerald-600 flex items-center gap-1">
                    {'\u2713'} <span className="text-slate-400 text-xs">{consentDate}</span>
                  </span>
                );
              }},
            ]}
            data={kunde.fremdProdukte}
          />
        ) : (
          <div className="text-sm text-slate-400 py-4 text-center">{t('keineFremdprodukte')}</div>
        )}
      </Card>
    </div>
  );
}

function ArbeitgeberRow({ arbeitgeber, t }) {
  const [bestaetigt, setBestaetigt] = useState(arbeitgeber.bestaetigt);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 shrink-0">{t('arbeitgeberLabel')}:</span>
      <span className="flex items-center gap-2 text-slate-700 font-medium">
        <Building2 size={14} className="text-slate-400" />
        {arbeitgeber.name}
        <span
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Linkedin size={14} className="text-blue-600 cursor-help" />
          {showTooltip && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50 shadow-lg">
              {t('datenAusLinkedin')}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </span>
          )}
        </span>
        {bestaetigt ? (
          <span className="flex items-center gap-1 text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle size={12} /> {t('bestaetigt')}
          </span>
        ) : (
          <button
            onClick={() => setBestaetigt(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-0.5 rounded-full border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
          >
            <CheckCircle size={12} /> {t('bestaetigen')}
          </button>
        )}
      </span>
    </div>
  );
}

function normalizeHaustiere(raw) {
  if (!raw) return null;
  return {
    art: raw.art || raw.typ || (raw.vermutet ? null : 'Haustier'),
    vermutet: raw.vermutet || false,
    name: raw.name || null,
    rasse: raw.rasse || null,
    alter: raw.alter || null,
    quelle: raw.quelle || 'kontoumsaetze',
    erkannteTransaktionen: raw.erkannteTransaktionen || (raw.umsaetze || []).map(u => ({
      haendler: u.empfaenger || u.haendler || 'Unbekannt',
      betrag: Math.abs(u.betrag),
      haeufigkeit: u.haeufigkeit || 'monatlich',
    })),
  };
}

function HaustiereRow({ haustiere, t }) {
  const [showDetail, setShowDetail] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [tierArt, setTierArt] = useState('');
  const [tierName, setTierName] = useState('');

  return (
    <div className="pt-2 border-t border-slate-100 mt-2">
      {!confirmed ? (
        <>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-amber-500 shrink-0">
              <PawPrint size={14} />
              {haustiere.vermutet ? t('haustierVermutet') : t('haustierHinweis')}
            </span>
            <span className="text-sm text-slate-500 italic">
              {haustiere.vermutet
                ? t('haustierAusKonto')
                : `${haustiere.art}${haustiere.name ? ` "${haustiere.name}"` : ''} — ${t('ausKontoumsaetzenErkannt')}`}
            </span>
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="flex items-center gap-1 text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <Info size={10} />
              {t('details')}
            </button>
          </div>
          {showDetail && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2 animate-fade-in">
              <div className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                <PawPrint size={12} />
                {t('erkannteTransaktionen')}
              </div>
              {haustiere.erkannteTransaktionen?.map((t, i) => (
                <div key={i} className="flex justify-between text-xs text-amber-800">
                  <span>{t.haendler}</span>
                  <span className="font-mono">{t.betrag}€ ({t.haeufigkeit})</span>
                </div>
              ))}
              <div className="text-[10px] text-amber-600 pt-1 border-t border-amber-200">
                {t('quellePsd2')}
              </div>
              <div className="pt-2 border-t border-amber-200 space-y-2">
                <div className="text-xs font-semibold text-amber-700">{t('haustierBestaetigen')}</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('artPlaceholder')}
                    value={tierArt}
                    onChange={e => setTierArt(e.target.value)}
                    className="text-xs border border-amber-300 rounded px-2 py-1 flex-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={tierName}
                    onChange={e => setTierName(e.target.value)}
                    className="text-xs border border-amber-300 rounded px-2 py-1 flex-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    onClick={() => { if (tierArt.trim()) setConfirmed(true); }}
                    className="text-xs px-3 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
                  >
                    {t('bestaetigen')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <PawPrint size={14} className="text-amber-500" />
            {t('haustierLabel')}:
          </span>
          <span className="text-slate-700 font-medium">
            {tierArt}{tierName ? ` (${tierName})` : ''}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle size={10} />
            {t('bestaetigt')}
          </span>
        </div>
      )}
    </div>
  );
}

function ExpandableProduktRow({ produkt, isVV, t }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const lang = getLang();

  return (
    <>
      <tr
        className="border-t border-slate-100 cursor-pointer transition-colors"
        style={hovered && !expanded ? { backgroundColor: 'var(--mode-primary-light)', color: '#ffffff' } : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className={hovered && !expanded ? 'text-white' : 'text-slate-400'}>
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            <span className={`font-medium ${hovered && !expanded ? 'text-white' : 'text-slate-700'}`}>{produkt.produkt}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          {hovered && !expanded
            ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white">{(lang === 'en' ? SPARTE_EN[produkt.sparte] : null) || produkt.sparte || '-'}</span>
            : (produkt.sparte ? <SparteBadge sparte={produkt.sparte} /> : '-')
          }
        </td>
        <td className={`px-4 py-3 text-sm ${hovered && !expanded ? 'text-white/90' : 'text-slate-700'}`}>{translateDetails(produkt.details, lang)}</td>
        <td className={`px-4 py-3 text-sm ${hovered && !expanded ? 'text-white' : ''}`}>
          <span className={`font-mono font-medium ${hovered && !expanded ? 'text-white' : ''}`}>
            {formatEur(isVV ? produkt.volumen : produkt.praemie)}
          </span>
        </td>
        <td className={`px-4 py-3 text-sm ${hovered && !expanded ? 'text-white/80' : ''}`}>{produkt.seit}</td>
        <td className="px-4 py-3 text-sm">
          {hovered && !expanded
            ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white">{produkt.status}</span>
            : <StatusBadge status={produkt.status} />
          }
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/80">
          <td colSpan={6} className="px-4 py-3">
            <div className="pl-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider">{t('vertragsbeginn')}</span>
                <div className="font-medium text-slate-700 mt-0.5">{produkt.seit}</div>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider">Status</span>
                <div className="mt-0.5"><StatusBadge status={produkt.status} /></div>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider">Sparte</span>
                <div className="font-medium text-slate-700 mt-0.5">{(lang === 'en' ? SPARTE_EN[produkt.sparte] : null) || produkt.sparte || '-'}</div>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider">Details</span>
                <div className="font-medium text-slate-700 mt-0.5">{translateDetails(produkt.details, lang)}</div>
              </div>
              {produkt.status === 'optimierbar' && (
                <div className="col-span-2 md:col-span-4 mt-1">
                  <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-amber-800 text-xs">
                    {t('optimierungspotenzial')}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-slate-400 shrink-0">{label}:</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}
