import Card from '../../../components/ui/Card';
import LebenszeitstrahlCard from '../../../components/ui/LebenszeitstrahlCard';
import TerminPrepModal from '../../../components/ui/TerminPrepModal';
import { getLang } from '../../../utils/langHelper';
import DataTable from '../../../components/ui/DataTable';
import { StatusBadge, SparteBadge } from '../../../components/ui/Badge';
import { formatEur, formatPct, berechneHaushaltsnetto, berechneAbsicherungsquote, berechneSparquote, berechneFrei, potentialSterne } from '../../../utils/formatters';
import { User, Wallet, Linkedin, Star, ChevronDown, ChevronRight, MapPin, Briefcase, Heart, Users, CheckCircle, Building2, PawPrint, Info, Car, Fuel, Sparkles, MessageSquare, Phone, Mail, Calendar, FileText, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getLogoUrl } from '../../../utils/logos';
import { getKundeFoto } from '../../../utils/kundenFotos';
import { useState } from 'react';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { useDayAdvanced, buildKlausFischerAppointmentActivity, formatAppointmentDate, formatAppointmentTime, getSimulatedAppointment } from '../../../utils/demoClock';

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
      {/* Kunden-Profil Header (mit KI-Zusammenfassung rechts daneben für Banking) */}
      <Card hover={false} padding={false} className="px-5 py-3">
        <div className="flex items-center gap-5">
          {/* Foto */}
          {foto && !fotoFailed ? (
            <img
              src={foto}
              alt={kunde.name}
              className="w-20 h-20 rounded-xl object-cover border-2 shadow-sm shrink-0"
              style={{ borderColor: config.colors.primaryLight + '40' }}
              onError={() => setFotoFailed(true)}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-sm shrink-0"
              style={{ background: config.colors.gradient }}
            >
              {initialen}
            </div>
          )}

          {/* Stammdaten-Block */}
          <div className="shrink-0 min-w-0">
            <h2 className="text-xl font-bold text-slate-800">{tn(kunde.name)}</h2>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500 flex-wrap">
              <span className="flex items-center gap-1"><Briefcase size={14} /> {translateBeruf(kunde.beruf, lang)}</span>
              <span className="flex items-center gap-1"><Users size={14} /> {kunde.alter} {t('jahre')}</span>
              {kunde.familienstand && (
                <span className="flex items-center gap-1"><Heart size={14} /> {lang === 'en' ? (FAMILIENSTAND_EN[kunde.familienstand] || kunde.familienstand) : kunde.familienstand?.charAt(0).toUpperCase() + kunde.familienstand?.slice(1)}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
              <span>{kunde.id}</span>
              <span>·</span>
              <span>{t('kundeSeit')} {kunde.eigeneProdukte?.[0]?.seit || '–'}</span>
              {kunde.linkedin && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Linkedin size={12} className="text-blue-500" /> {kunde.linkedin.kontakte}+ {t('kontakte')}</span>
                </>
              )}
            </div>
          </div>

          {/* KI-Zusammenfassung rechts neben den Stammdaten (Banking) */}
          {modeId === 'banking' && (
            <div className="flex-1 min-w-0">
              <KIZusammenfassungInlay kunde={kunde} embedded />
            </div>
          )}
        </div>
      </Card>

      <div className={modeId === 'banking' ? 'grid grid-cols-3 gap-4' : 'grid grid-cols-2 gap-4'}>
        {/* Persoenliche Daten */}
        <Card hover={false}>
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
            <InfoRow label={t('alter')} value={`${kunde.alter} ${t('jahre')}`} />
            {kunde.arbeitgeber ? (
              <ArbeitgeberRow arbeitgeber={kunde.arbeitgeber} beruf={translateBeruf(kunde.beruf, lang)} t={t} />
            ) : (
              <InfoRow label={t('beruf')} value={translateBeruf(kunde.beruf, lang)} />
            )}
            <InfoRow label={t('familienstand')} value={kunde.familienstand ? (lang === 'en' ? (FAMILIENSTAND_EN[kunde.familienstand] || kunde.familienstand) : kunde.familienstand.charAt(0).toUpperCase() + kunde.familienstand.slice(1)) : ''} />
            {kunde.partner && (
              <InfoRow
                label={t('partner')}
                value={kunde.partner.beruf
                  ? `${kunde.partner.name} (${translateBeruf(kunde.partner.beruf, lang)})`
                  : kunde.partner.name}
              />
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
                <span className="text-slate-500">{kunde.linkedin.kontakte}+ {t('kontakte')}</span>
                <span className="text-slate-400">&middot; {kunde.linkedin.branchen?.join(', ')}</span>
              </div>
            )}
            {/* Fahrzeuge / Mobilität (PSD2) */}
            {kunde.fahrzeuge && (kunde.fahrzeuge.liste?.length > 0 || kunde.fahrzeuge.monatlicheAusgaben > 0) && (
              <FahrzeugeSection fahrzeuge={kunde.fahrzeuge} t={t} />
            )}
          </div>
        </Card>

        {/* Finanzuebersicht */}
        <Card hover={false}>
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
                  {kunde.risikoSignale?.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-300 text-blue-600 ml-1" title="Risiko-Signal aus Kontoumsätzen">
                      <ShieldAlert size={12} strokeWidth={2.5} />
                    </span>
                  )}
                </span>
              </div>
              {risikoExpanded && (
                <div className="mt-2 pl-4 space-y-1 text-xs text-slate-500 animate-fade-in">
                  <div>{t('bonitaet')} {kunde.risikoscore < 30 ? t('gut') : t('mittel')}</div>
                  <div>{t('zahlungsverhalten')}</div>
                  <div>{t('abwanderungsrisiko')} {kunde.abwanderungsrisiko}</div>
                </div>
              )}
              {kunde.risikoSignale?.length > 0 && (
                <RisikoSignale signale={kunde.risikoSignale} />
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

        {/* Aktivitäten – Banking only, in derselben Reihe wie Persönliche Daten + Finanzübersicht */}
        {modeId === 'banking' && <AktivitaetenCard kunde={kunde} />}
      </div>

      {/* Lebenszeitstrahl – Banking only (FIDA + Open Finance Kontext) */}
      {modeId === 'banking' && <LebenszeitstrahlCard kunde={kunde} />}

      {/* Produkte/Fremdprodukte sind in den Tabs "Produkte" und "Open Finance" */}
    </div>
  );
}

function ArbeitgeberRow({ arbeitgeber, beruf, t }) {
  // Demo-Datumsangaben für die Datenherkunft
  const today = new Date();
  const lastSalaryDate = new Date(today);
  lastSalaryDate.setDate(28);
  if (lastSalaryDate > today) lastSalaryDate.setMonth(lastSalaryDate.getMonth() - 1);
  const linkedInUpdate = new Date(today);
  linkedInUpdate.setMonth(linkedInUpdate.getMonth() - 1);
  linkedInUpdate.setDate(8);
  const fmt = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <>
      {/* Arbeitgeber + Bestätigung */}
      <div className="flex items-baseline gap-2 text-sm flex-wrap">
        <span className="text-slate-400 shrink-0">{t('arbeitgeberLabel')}:</span>
        <span className="text-slate-700 font-medium">{arbeitgeber.name}</span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <CheckCircle size={11} /> bestätigt durch Kontoumsätze
        </span>
        <span className="text-xs text-slate-400 font-mono">{fmt(lastSalaryDate)}</span>
      </div>

      {/* Position/Abteilung aus LinkedIn — gleiche Spalte wie die anderen InfoRows */}
      {beruf && (
        <div className="flex items-baseline gap-2 text-sm flex-wrap">
          <span className="text-slate-400 shrink-0">Position:</span>
          <span className="text-slate-700 font-medium">{beruf}</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            <Linkedin size={11} /> Durch LinkedIn Abgleich
          </span>
          <span className="text-xs text-slate-400 font-mono">{fmt(linkedInUpdate)}</span>
        </div>
      )}
    </>
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-500 shrink-0 text-sm">
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
              className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <Info size={11} />
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
              <div className="text-xs text-amber-600 pt-1 border-t border-amber-200">
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
          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle size={11} />
            {t('bestaetigt')}
          </span>
        </div>
      )}
    </div>
  );
}

function FahrzeugeSection({ fahrzeuge, t }) {
  return (
    <>
      {fahrzeuge.liste?.length > 0 ? (
        fahrzeuge.liste.map((fz, i) => (
          <div key={i} className="flex items-baseline gap-2 text-sm flex-wrap">
            <span className="text-slate-400 shrink-0">Fahrzeug:</span>
            <span className="text-slate-700 font-medium">{fz.modell}</span>
            {fz.deckung && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                {fz.deckung}{fz.sf ? ` · ${fz.sf}` : ''}
              </span>
            )}
            <span className="text-slate-500">
              · {fz.versicherer || 'Unbekannt'}
              {fz.praemie > 0 && <span className="font-mono"> ({fz.praemie}€/J.)</span>}
            </span>
            {fz.quelle === 'psd2' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100">
                Open Finance
              </span>
            )}
            {fz.fbRating && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                fz.fbRating >= 75 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : fz.fbRating >= 55 ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                F&B {fz.fbRating}
              </span>
            )}
          </div>
        ))
      ) : null}

      {fahrzeuge.monatlicheAusgaben > 0 && (
        <div className="flex items-baseline gap-2 text-sm flex-wrap">
          <span className="text-slate-400 shrink-0">{t('mobilitaetsausgaben')}:</span>
          <span className="font-mono font-medium text-slate-700">{fahrzeuge.monatlicheAusgaben}€{t('proMonat')}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-medium">PSD2</span>
        </div>
      )}
    </>
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

// ─── Risiko-Signale (z.B. Extremsport vs. Unfallversicherungs-Deckung) ───
// Optisch wie der „Haustier erkannt"-Hinweis: blauer/dezenter Info-Stil,
// nicht alarmrot. Die Versicherungslücke wird in einem separaten kleinen
// Block hervorgehoben.
function RisikoSignale({ signale }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="mt-2.5 space-y-2">
      {signale.map((s, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-blue-600 shrink-0 text-sm">
              <ShieldAlert size={14} />
              {s.titel}
            </span>
            <span className="text-sm text-slate-500 italic">Aus Kontoumsätzen erkannt</span>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <Info size={11} />
              Details
            </button>
          </div>
          {expanded === i && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2 animate-fade-in">
              <div className="text-sm text-slate-700 leading-snug">{s.beschreibung}</div>

              {s.transaktionen?.length > 0 && (
                <div className="pt-2 border-t border-blue-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">Erkannte Transaktionen</div>
                  <div className="space-y-0.5">
                    {s.transaktionen.map((t, ti) => (
                      <div key={ti} className="flex items-baseline justify-between text-sm">
                        <span className="text-slate-700">{t.empfaenger}</span>
                        <span className="font-mono text-slate-600 ml-2 shrink-0">{t.betrag}€ ({t.haeufigkeit})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {s.konsequenz && (
                <div className="rounded bg-white border border-amber-200 p-2 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-0.5">Versicherungslücke</div>
                    <div className="text-sm text-slate-700 leading-snug">{s.konsequenz}</div>
                  </div>
                </div>
              )}

              {s.empfehlung && (
                <div className="flex items-start gap-1.5 text-sm pt-1">
                  <Sparkles size={13} className="text-violet-600 mt-0.5 shrink-0" />
                  <span className="text-slate-700"><strong className="text-violet-700">Empfehlung:</strong> {s.empfehlung}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── KI-Zusammenfassung als Inlay-Container ───
export function KIZusammenfassungInlay({ kunde, embedded = false }) {
  const summary = generateKISummary(kunde);
  const wrapperClass = embedded
    ? 'relative rounded-xl border overflow-hidden'
    : 'relative rounded-2xl border overflow-hidden';
  return (
    <div
      className={wrapperClass}
      style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e0e7ff 100%)',
        borderColor: '#d8d4ff',
        boxShadow: embedded ? 'none' : '0 4px 14px -6px rgba(124, 58, 237, 0.18)',
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, transparent 70%)' }}
      />
      <div className="relative px-4 py-3 flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
        >
          <Sparkles size={16} className="text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="font-semibold text-slate-800 text-sm">KI-Zusammenfassung</h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Aktualisiert {new Date().toLocaleDateString('de-DE')}
            </span>
          </div>
          <p className="text-[13px] text-slate-700 leading-snug">{summary.text}</p>
          {summary.recommendation && (
            <div className="mt-1 flex items-start gap-1.5 text-[13px]">
              <Sparkles size={12} className="text-violet-600 mt-0.5 shrink-0" />
              <span className="text-slate-700">
                <strong className="text-violet-700">Empfehlung:</strong> {summary.recommendation}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateKISummary(kunde) {
  // Demo-KI-Zusammenfassung basierend auf vorhandenen Kundendaten
  const name = kunde.name || 'Der Kunde';
  const beruf = kunde.beruf || 'Berufstätig';
  const arbeitgeber = kunde.arbeitgeber?.name || null;
  const jahre = kunde.eigeneProdukte?.[0]?.seit
    ? new Date().getFullYear() - parseInt(kunde.eigeneProdukte[0].seit.slice(0, 4), 10)
    : null;
  const partner = kunde.partner?.name || null;
  const kinder = (kunde.kinder || []).length;
  const abwanderung = kunde.abwanderungsrisiko || 'gering';
  const offenePot = (kunde.potentiale || []).filter(p => p.status === 'identifiziert' || p.status === 'termin').length;

  let text = '';
  text += `${name} ist seit ${jahre || 'mehreren'} Jahren Kunde, ${beruf}`;
  if (arbeitgeber) text += ` bei ${arbeitgeber}`;
  text += '. ';
  if (partner) text += `Verheiratet mit ${partner}`;
  if (kinder > 0) text += `, ${kinder} ${kinder === 1 ? 'Kind' : 'Kinder'}`;
  if (partner || kinder) text += '. ';

  if (abwanderung === 'hoch') {
    text += 'Die FIDA-Daten zeigen erhöhtes Abwanderungsrisiko: Vermögen wandert teilweise zu Fremdbanken ab. ';
  } else if (abwanderung === 'mittel') {
    text += 'Erste Signale für Vermögensverlagerung an Fremdbanken erkennbar. ';
  } else {
    text += 'Stabile Hauptbankbeziehung, keine Abwanderungssignale. ';
  }

  if (offenePot > 0) {
    text += `Aktuell ${offenePot} offene Vertriebspotenziale im Pipeline-Board.`;
  }

  let recommendation = null;
  if (abwanderung === 'hoch' || abwanderung === 'mittel') {
    recommendation = 'Persönliches Bindungsgespräch priorisieren und Depot-Wechsel-Prämie als konkretes Angebot positionieren.';
  } else if (offenePot > 2) {
    recommendation = 'Top-Potenzial aus dem Kanban-Board angehen — kurzfristig Termin vereinbaren.';
  } else {
    recommendation = 'Jahresgespräch zur Bedarfsabklärung terminieren.';
  }

  return { text, recommendation };
}

// ─── Aktivitäten: letzte Gespräche & Notizen ───
function AktivitaetenCard({ kunde }) {
  const dayAdvanced = useDayAdvanced();
  const [showTerminPrep, setShowTerminPrep] = useState(false);

  // Für Klaus Fischer wird nach dem Weiterdrehen der Uhr eine neue
  // Terminzusage-Aktivität vorne angehängt.
  const base = (kunde.kommunikation || []).slice();
  const extra = (dayAdvanced && kunde.id === 'BK00001') ? [buildKlausFischerAppointmentActivity()] : [];
  const komms = [...extra, ...base]
    .sort((a, b) => {
      // Die neu erzeugte Terminzusage bleibt immer ganz oben
      if (a.istNeuZugestimmt) return -1;
      if (b.istNeuZugestimmt) return 1;
      return new Date(b.datum) - new Date(a.datum);
    })
    .slice(0, 6);

  const iconForType = (typ) => {
    switch (typ) {
      case 'termin': return Calendar;
      case 'telefon': case 'anruf': return Phone;
      case 'email': case 'newsletter': case 'mail': return Mail;
      case 'chatbot': case 'chat': return MessageSquare;
      case 'notiz': return FileText;
      default: return MessageSquare;
    }
  };

  const colorForType = (typ) => {
    switch (typ) {
      case 'termin': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
      case 'telefon': case 'anruf': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
      case 'email': case 'mail': return { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' };
      case 'newsletter': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
      case 'chatbot': case 'chat': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
    }
  };

  return (
    <Card hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={20} className="text-slate-500" strokeWidth={1.75} />
        <h3 className="font-semibold text-slate-800">Aktivitäten</h3>
        <span className="text-xs text-slate-400 ml-auto">
          {komms.length === 0 ? 'Keine' : `${komms.length} letzte`}
        </span>
      </div>

      {komms.length === 0 ? (
        <div className="text-sm text-slate-400 italic text-center py-6">
          Noch keine Aktivitäten erfasst.
        </div>
      ) : (
        <div className="space-y-3">
          {komms.map((k, i) => {
            const Icon = iconForType(k.typ);
            const c = colorForType(k.typ);
            const isNeu = k.istNeuZugestimmt;
            const date = new Date(k.datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const appointmentLabel = isNeu
              ? `${formatAppointmentDate(getSimulatedAppointment())} · ${formatAppointmentTime(getSimulatedAppointment())} Uhr`
              : null;
            return (
              <div
                key={k.id || i}
                className={`flex items-start gap-2.5 rounded-lg transition-colors ${
                  isNeu
                    ? 'border border-emerald-200 bg-emerald-50/70 p-2.5 cursor-pointer hover:bg-emerald-50'
                    : ''
                }`}
                onClick={isNeu ? () => setShowTerminPrep(true) : undefined}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${c.bg} ${c.border}`}>
                  <Icon size={13} className={c.text} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800 truncate">{k.betreff || k.typ}</span>
                    <span className="text-xs text-slate-400 font-mono shrink-0">{date}</span>
                    {isNeu && (
                      <span className="rh-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wide">
                        <Sparkles size={9} /> Neu
                      </span>
                    )}
                  </div>
                  {(k.zusammenfassung || k.kiZusammenfassung) && (
                    <div className={`text-xs leading-snug mt-0.5 ${isNeu ? 'text-emerald-800' : 'text-slate-600 line-clamp-2'}`}>
                      {k.zusammenfassung || k.kiZusammenfassung}
                    </div>
                  )}
                  {appointmentLabel && (
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
                        <Calendar size={11} /> {appointmentLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowTerminPrep(true); }}
                        className="text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-full transition-colors inline-flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles size={11} strokeWidth={2.5} /> Gesprächsvorbereitung öffnen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTerminPrep && (
        <TerminPrepModal kunde={kunde} onClose={() => setShowTerminPrep(false)} />
      )}
    </Card>
  );
}
