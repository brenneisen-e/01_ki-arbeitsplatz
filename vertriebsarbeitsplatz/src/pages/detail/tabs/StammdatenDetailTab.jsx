import Card from '../../../components/ui/Card';
import LogoImg from '../../../components/ui/LogoImg';
import LebenszeitstrahlCard from '../../../components/ui/LebenszeitstrahlCard';
import TerminPrepModal from '../../../components/ui/TerminPrepModal';
import { getLang } from '../../../utils/langHelper';
import DataTable from '../../../components/ui/DataTable';
import { StatusBadge, SparteBadge } from '../../../components/ui/Badge';
import { formatEur, formatPct, berechneHaushaltsnetto, berechneAbsicherungsquote, berechneSparquote, berechneFrei, potentialSterne, berechneAnlagevolumen, berechneKreditvolumen } from '../../../utils/formatters';
import { User, Wallet, Linkedin, Star, ChevronDown, ChevronRight, MapPin, Briefcase, Heart, Users, CheckCircle, Building2, PawPrint, Info, Car, Fuel, Sparkles, MessageSquare, Phone, Mail, Calendar, FileText, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getLogoUrl } from '../../../utils/logos';
import { getKundeFoto } from '../../../utils/kundenFotos';
import { useState, useEffect, useRef } from 'react';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { useDayAdvanced, buildKlausFischerAppointmentActivity, formatAppointmentDate, formatAppointmentTime, getSimulatedAppointment } from '../../../utils/demoClock';
import { interpolateDynamicDates, resolveVersicherungspartner } from '../../../utils/dynamicDates';
import { getHaustierConfirmation, setHaustierConfirmation } from '../../../utils/haustierConfirmation';

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
  const { config, modeId, setActiveTab } = useMode();
  const institut = config?.institut;
  const isVV = modeId === 'vermoegensverwaltung';
  const haushalt = berechneHaushaltsnetto(kunde);

  // Adapt product names + details to selected institut (inkl. Versicherungspartner:
  // R+V → Zukunftsversicherung / Provinzial / … je nach Bank-Whitelabel).
  const baseInstitut = modeId === 'versicherung' ? 'ERGO' : modeId === 'banking' ? 'VR' : null;
  const shortInstitut = institut ? institut.split(' ')[0] : null;
  const baseVersicherer = modeId === 'banking' ? 'R+V' : null;
  const versicherungspartner = modeId === 'banking' ? resolveVersicherungspartner(institut) : null;
  const replaceBrand = (s) => {
    if (!s || typeof s !== 'string') return s;
    let out = s;
    if (baseInstitut && shortInstitut && shortInstitut !== baseInstitut) {
      out = out.replace(new RegExp(baseInstitut, 'g'), shortInstitut);
    }
    if (baseVersicherer && versicherungspartner && versicherungspartner !== baseVersicherer) {
      out = out.replace(new RegExp(baseVersicherer.replace(/[+]/g, '\\+'), 'g'), versicherungspartner);
    }
    return out;
  };
  const adaptedProdukte = (kunde.eigeneProdukte || []).map(p => ({
    ...p,
    produkt: replaceBrand(p.produkt),
    details: replaceBrand(p.details),
  }));
  const absQuote = berechneAbsicherungsquote(kunde);
  const sparQuote = berechneSparquote(kunde);
  const frei = berechneFrei(kunde);
  const foto = getKundeFoto(kunde.id);
  const initialen = kunde.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="space-y-4">
      {/* Kunden-Profil Header — gleicher Look wie die KPI-Cards in der Übersicht */}
      <div
        className="relative rounded-xl border p-4 card-base overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--mode-primary-light) 14%, #ffffff) 0%, color-mix(in srgb, var(--mode-primary-light) 6%, #ffffff) 100%)',
          borderColor: 'color-mix(in srgb, var(--mode-primary-light) 22%, #e2e8f0)',
          boxShadow: '0 6px 16px -6px rgba(15, 23, 42, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
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
                  <span className="flex items-center gap-1"><Linkedin size={12} className="text-slate-400" /> {kunde.linkedin.kontakte}+ {t('kontakte')}</span>
                </>
              )}
            </div>
          </div>

          {/* KI-Zusammenfassung rechts neben den Stammdaten (Banking + Versicherung) */}
          {(modeId === 'banking' || modeId === 'versicherung') && (
            <div className="flex-1 min-w-0">
              <KIZusammenfassungInlay kunde={kunde} embedded />
            </div>
          )}
        </div>
      </div>

      <div className={(modeId === 'banking' || modeId === 'versicherung') ? 'grid grid-cols-3 gap-4 items-stretch' : 'grid grid-cols-2 gap-4 items-stretch'}>
        {/* Persoenliche Daten */}
        <Card hover={false} className="flex flex-col h-full">
          <div className="-mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl border-b border-blue-100 flex items-center gap-2 bg-blue-50/70">
            <User size={18} className="text-blue-600" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-700 text-sm tracking-wide">{t('persoenlicheDaten')}</h3>
          </div>
          <div className="text-sm [&>*]:py-1.5 [&>*]:border-t [&>*]:border-slate-100 [&>:first-child]:border-t-0 [&>:first-child]:pt-0">
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
                value={
                  <>
                    <PersonLink
                      name={kunde.partner.name}
                      role={`Partner${kunde.partner.beruf ? ' · ' + translateBeruf(kunde.partner.beruf, lang) : ''}`}
                    />
                    {kunde.partner.beruf ? ` (${translateBeruf(kunde.partner.beruf, lang)})` : ''}
                  </>
                }
              />
            )}
            {kunde.kinder?.length > 0 && (
              <InfoRow
                label={t('kinder')}
                value={
                  <span>
                    {kunde.kinder.map((k, i) => (
                      <span key={i}>
                        <PersonLink name={k.name} role={`Kind · ${k.alter} Jahre`} />
                        {` (${k.alter})`}
                        {i < kunde.kinder.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                }
              />
            )}
            <InfoRow
              label={t('wohnsituation')}
              value={(() => {
                const base = kunde.adresse
                  ? `${kunde.adresse} (${kunde.wohnsituation}, ${kunde.wohnflaeche}qm)`
                  : `${kunde.wohnsituation}, ${kunde.wohnflaeche}qm`;
                const hausrat = (kunde.fremdProdukte || []).find(
                  p => /hausrat/i.test(p.produktart || '') && p.consent
                );
                if (!hausrat) return base;
                return (
                  <span className="inline-flex items-center gap-2 flex-wrap">
                    <span>{base}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                      Open Finance · Hausrat
                    </span>
                  </span>
                );
              })()}
            />
            {(kunde.haustiere || kunde.tiere) && (
              <HaustiereRow
                haustiere={normalizeHaustiere(kunde.haustiere || kunde.tiere)}
                t={t}
                kundeId={kunde.id}
              />
            )}
            {kunde.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin size={14} className="text-slate-500" />
                <span className="text-slate-500">{kunde.linkedin.kontakte}+ {t('kontakte')}</span>
                <span className="text-slate-400">&middot; {kunde.linkedin.branchen?.join(', ')}</span>
              </div>
            )}
            {/* Fahrzeuge / Mobilität (PSD2) */}
            {kunde.fahrzeuge && (kunde.fahrzeuge.liste?.length > 0 || kunde.fahrzeuge.monatlicheAusgaben > 0) && (
              <FahrzeugeSection
                fahrzeuge={kunde.fahrzeuge}
                t={t}
                onJumpToKfz={() => {
                  setActiveTab('openfinance');
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('kia:highlight-finanzuebersicht', { detail: { key: 'kfz' } }));
                  }, 80);
                }}
              />
            )}
          </div>
        </Card>

        {/* Finanzuebersicht */}
        <Card hover={false} className="flex flex-col h-full">
          <div className="-mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl border-b border-emerald-100 flex items-center gap-2 bg-emerald-50/70">
            <Wallet size={18} className="text-emerald-600" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-700 text-sm tracking-wide">{t('finanzuebersicht')}</h3>
          </div>
          <div className="text-sm [&>*]:py-1.5 [&>*]:border-t [&>*]:border-slate-100 [&>:first-child]:border-t-0 [&>:first-child]:pt-0">
            <InfoRow label={t('haushaltsnetto')} value={`${formatEur(haushalt)}/mtl.`} />
            <InfoRow label={t('absicherungsquote')} value={formatPct(absQuote > 0 ? absQuote : (kunde.aum ? 72 + ((kunde.alter || 50) % 20) : 0))} />
            <InfoRow label={t('sparquote')} value={formatPct(sparQuote > 0 ? sparQuote : (kunde.nettoeinkommen ? Math.min(45, Math.round(kunde.nettoeinkommen / 200)) : 18))} />
            <InfoRow label={t('freiVerfuegbar')} value={`${formatEur(frei > 0 ? frei : (kunde.nettoeinkommen ? Math.round(kunde.nettoeinkommen * 0.3) : 2500))}/mtl.`} />
            {(() => {
              // Werte identisch zur Finanzübersicht-Tab (OpenFinanceTab):
              // zentrale Helper, keine doppelten Quellen, keine Doppelzählung
              // zwischen fremdProdukte und openFinance.finanzierungen.
              const anlageVol = berechneAnlagevolumen(kunde);
              const kreditVol = berechneKreditvolumen(kunde);
              const jumpToFinanzuebersicht = (highlightKey) => {
                setActiveTab('openfinance');
                // Kleine Verzögerung, damit der Tab gemountet ist, bevor das
                // Highlight-Event gefeuert wird.
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('kia:highlight-finanzuebersicht', { detail: { key: highlightKey } }));
                }, 80);
              };
              return (
                <>
                  {anlageVol > 0 && (
                    <button
                      type="button"
                      onClick={() => jumpToFinanzuebersicht('anlage')}
                      className="w-full flex items-baseline gap-2 text-sm text-left rounded-md px-1 -mx-1 py-0.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                      title="Zur Finanzübersicht – relevante Verträge anzeigen"
                    >
                      <span className="text-slate-400 shrink-0">{t('anlagevolumen') !== 'anlagevolumen' ? t('anlagevolumen') : 'Anlagevolumen'}:</span>
                      <span className="text-slate-700 font-medium group-hover:underline">{formatEur(anlageVol)}</span>
                      <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500 ml-auto" />
                    </button>
                  )}
                  {kreditVol > 0 && (
                    <button
                      type="button"
                      onClick={() => jumpToFinanzuebersicht('kredit')}
                      className="w-full flex items-baseline gap-2 text-sm text-left rounded-md px-1 -mx-1 py-0.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                      title="Zur Finanzübersicht – relevante Finanzierungen anzeigen"
                    >
                      <span className="text-slate-400 shrink-0">{t('kreditvolumen') !== 'kreditvolumen' ? t('kreditvolumen') : 'Kreditvolumen'}:</span>
                      <span className="text-slate-700 font-medium group-hover:underline">{formatEur(kreditVol)}</span>
                      <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500 ml-auto" />
                    </button>
                  )}
                </>
              );
            })()}
            {(() => {
              // Absicherungsscore: Mittelwert aus eigenen + Open-Finance-Versicherungen.
              // Demo-Berechnung: Anzahl vorhandener Sparten (von 8 relevanten) × 12,5
              // ergibt 0–100, plus kleiner Bonus je Open-Finance-Datensatz.
              const eigen = kunde.eigeneProdukte || [];
              const ofVers = kunde.openFinance?.versicherungenFremd || [];
              const alle = [...eigen, ...ofVers];
              const sparten = ['kfz', 'haftpflicht', 'hausrat', 'rlv', 'bu', 'unfall', 'rechtsschutz', 'wohngebaeude'];
              const abgedeckt = sparten.filter(s => alle.some(p => {
                const t = (p.typ || p.produkt || p.produktart || '').toLowerCase();
                if (s === 'haftpflicht') return /haftpflicht/.test(t);
                if (s === 'rlv') return /rlv|risikoleben/.test(t);
                if (s === 'bu') return /\bbu\b|berufsunf/.test(t);
                return t.includes(s);
              })).length;
              const score = Math.min(100, Math.round((abgedeckt / sparten.length) * 100));
              const color = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
              const label = score >= 75 ? 'gut' : score >= 50 ? 'mittel' : 'ausbaufähig';
              return (
                <div className="flex items-baseline gap-2 text-sm" title="Basiert auf Open-Finance-Daten: Anzahl abgedeckter Versicherungssparten">
                  <span className="text-slate-400 shrink-0">Absicherungsscore:</span>
                  <span className={`font-medium ${color}`}>{score}/100</span>
                  <span className="text-xs text-slate-400">({label}, {abgedeckt}/{sparten.length} Sparten)</span>
                </div>
              );
            })()}
            {(() => {
              const seit = kunde.eigeneProdukte?.[0]?.seit;
              if (!seit) return null;
              const jahre = new Date().getFullYear() - parseInt(seit.slice(0, 4), 10);
              return <InfoRow label={t('kundeSeit')} value={`${seit} (${jahre} Jahre)`} />;
            })()}
            {(() => {
              // Bonitätsscore (Schufa-Score nach dem im März 2026 reformierten Modell).
              // Wert deterministisch aus Risikoscore abgeleitet, damit keine
              // Zufallswerte beim Re-Render entstehen.
              const risiko = Number(kunde.risikoscore) || 30;
              // Niedriger Risikoscore → hoher Schufa-Score.
              // Skala des neuen Schufa-Modells (gültig seit 03/2026): 0–999.
              const schufa = Math.max(250, Math.min(999, Math.round(975 - risiko * 6)));
              const klasse = schufa >= 950 ? { label: 'sehr gut', color: 'text-emerald-600', dot: 'bg-emerald-500' }
                          : schufa >= 850 ? { label: 'gut', color: 'text-lime-600', dot: 'bg-lime-500' }
                          : schufa >= 700 ? { label: 'mittel', color: 'text-amber-600', dot: 'bg-amber-500' }
                          : { label: 'erhöhtes Risiko', color: 'text-red-600', dot: 'bg-red-500' };
              return (
                <div className="flex items-center gap-2 text-sm" title="Schufa-Score (neues Modell, gültig seit März 2026)">
                  <span className="text-slate-400 shrink-0">Bonitätsscore:</span>
                  <span className="flex items-center gap-2">
                    {/*
                      Schufa-Logo via logo.dev. Primärdomain der SCHUFA Holding AG
                      ist schufa.de (Unternehmensauftritt). Verbraucherportal ist
                      meineschufa.de; als zusätzlicher Fallback probieren wir die
                      Domain schufa-api.de (Schufa B2B API-Portal).
                    */}
                    <img
                      src="https://img.logo.dev/schufa.de?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=128&format=png&retina=true"
                      alt="Schufa"
                      className="h-8 w-auto object-contain rounded"
                      data-step="0"
                      onError={(e) => {
                        const el = e.currentTarget;
                        const step = parseInt(el.dataset.step || '0', 10);
                        const fallbacks = [
                          'https://img.logo.dev/meineschufa.de?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=128&format=png&retina=true',
                          'https://img.logo.dev/schufa-api.de?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=128&format=png&retina=true',
                        ];
                        if (step < fallbacks.length) {
                          el.dataset.step = String(step + 1);
                          el.src = fallbacks[step];
                        } else {
                          el.style.display = 'none';
                        }
                      }}
                    />
                    <span className={`font-semibold ${klasse.color}`}>{schufa}/999</span>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${klasse.dot}`} />
                    <span className="text-xs text-slate-400">({klasse.label}, neues Schufa-Modell 03/2026)</span>
                  </span>
                </div>
              );
            })()}
            <div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRisikoExpanded(!risikoExpanded)}>
                <span className="text-slate-400 shrink-0">{t('risikoscore')}</span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-700 font-medium">{kunde.risikoscore} ({kunde.risikoscore < 30 ? t('niedrig') : kunde.risikoscore < 50 ? t('mittel') : t('hoch')})</span>
                  {kunde.risikoSignale?.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 ml-1" title="Risiko-Signal aus Kontoumsätzen">
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
                <RisikoSignale signale={kunde.risikoSignale} institut={institut} />
              )}
            </div>
            {(() => {
              // Deterministisches NPS-Erhebungsdatum aus der Kunden-ID ableiten,
              // damit der Stand nicht bei jedem Render springt.
              const seed = (kunde.id || kunde.name || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
              const daysAgo = 14 + (seed % 90);
              const d = new Date();
              d.setDate(d.getDate() - daysAgo);
              const datum = d.toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
              const nps = Number(kunde.nps) || 0;
              // Kritikpunkt + KI-Handlungsimpuls abhaengig vom NPS-Wert.
              let schmerz = null;
              let impuls = null;
              if (nps <= 6) {
                schmerz = 'Kritikpunkt: „Ich habe das Gefühl, dass sich nie jemand proaktiv bei mir meldet."';
                impuls = 'Kontaktfrequenz auf Quartalsrhythmus erhöhen, proaktiven Check-In-Termin anbieten.';
              } else if (nps <= 8) {
                schmerz = 'Kritikpunkt: „Kontakt passt grundsätzlich, aber zu wenig proaktiv."';
                impuls = 'Kontaktfrequenz leicht erhöhen (z. B. halbjährlicher Review-Termin), Gesprächsimpulse senden.';
              } else {
                schmerz = 'Promotor — äußerte: „Fühle mich gut betreut, bitte so weitermachen."';
                impuls = 'Als Empfehlungsgeber aktivieren (Next-Gen / Bekanntenkreis einladen).';
              }
              return (
                <>
                  <InfoRow label="NPS" value={`${nps}/10 (erhoben ${datum})`} />
                  <div className="pl-1 -mt-1 flex items-start gap-1.5 text-[11px] leading-snug">
                    <Sparkles size={11} className="text-violet-600 mt-0.5 shrink-0" />
                    <span className="text-slate-600">
                      <span className="italic">{schmerz}</span>
                      <br />
                      <strong className="text-slate-800">KI-Empfehlung:</strong> {impuls}
                    </span>
                  </div>
                </>
              );
            })()}
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

        {/* Aktivitäten – Banking + Versicherung, in derselben Reihe wie Persönliche Daten + Finanzübersicht */}
        {(modeId === 'banking' || modeId === 'versicherung') && <AktivitaetenCard kunde={kunde} />}
      </div>

      {/* Lebenszeitstrahl – Banking + Versicherung (FIDA + Open Finance Kontext) */}
      {(modeId === 'banking' || modeId === 'versicherung') && <LebenszeitstrahlCard kunde={kunde} />}

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
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className="text-slate-400 shrink-0">{t('arbeitgeberLabel')}:</span>
        <LogoImg name={arbeitgeber.name} size={16} />
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
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
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

const TIER_ARTEN = ['Hund', 'Katze', 'Kaninchen', 'Vogel', 'Fisch', 'Reptil', 'Sonstiges'];

// Custom Dropdown ohne natives <select> — das native Element wollte sich
// in manchen Browserkonstellationen nicht oeffnen. Diese Implementierung
// ist ein reines Button + absolutes Popup, klappt zuverlaessig auf und
// schliesst bei Klick ausserhalb.
function TierArtDropdown({ value, onChange, placeholder, options }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null); // { top, left, width }
  const ref = useRef(null);
  const buttonRef = useRef(null);

  const updateCoords = () => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: r.left, width: r.width });
  };

  useEffect(() => {
    if (!open) return;
    updateCoords();
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onScrollOrResize = () => updateCoords();
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-1">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-xs border border-amber-300 rounded pl-2 pr-7 py-1 w-full bg-white text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 flex items-center justify-between"
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <ChevronDown size={12} className="text-amber-700 shrink-0" />
      </button>
      {open && coords && (
        <ul
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 60,
          }}
          className="bg-white border border-amber-300 rounded shadow-lg max-h-56 overflow-y-auto py-0.5"
        >
          {options.map(opt => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 transition-colors ${value === opt ? 'bg-amber-50 font-semibold text-amber-800' : 'text-slate-700'}`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HaustiereRow({ haustiere, t, kundeId }) {
  const initial = getHaustierConfirmation(kundeId);
  const [showDetail, setShowDetail] = useState(false);
  const [confirmed, setConfirmed] = useState(!!initial);
  const [tierArt, setTierArt] = useState(initial?.typ || '');
  const [tierName, setTierName] = useState(initial?.name || '');
  const [bestaetigtAm, setBestaetigtAm] = useState(initial?.bestaetigtAm || null);

  const handleConfirm = () => {
    if (!tierArt.trim()) return;
    const now = new Date().toISOString();
    const data = { typ: tierArt.trim(), name: tierName.trim(), bestaetigtAm: now };
    setHaustierConfirmation(kundeId, data);
    setBestaetigtAm(now);
    setConfirmed(true);
    setShowDetail(false);
  };

  const bestaetigtDatum = bestaetigtAm
    ? new Date(bestaetigtAm).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  return (
    <div>
      {!confirmed ? (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-700 shrink-0 text-sm">
              <PawPrint size={14} />
              {haustiere.vermutet ? 'Haustier' : t('haustierHinweis')}
            </span>
            <span className="text-sm text-slate-500 italic">
              {haustiere.vermutet
                ? t('haustierAusKonto')
                : `${haustiere.art}${haustiere.name ? ` "${haustiere.name}"` : ''} — ${t('ausKontoumsaetzenErkannt')}`}
            </span>
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
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
              {haustiere.erkannteTransaktionen?.map((tx, i) => (
                <div key={i} className="flex justify-between text-xs text-amber-800">
                  <span>{tx.haendler}</span>
                  <span className="font-mono">{tx.betrag}€ ({tx.haeufigkeit})</span>
                </div>
              ))}
              <div className="text-xs text-amber-600 pt-1 border-t border-amber-200">
                {t('quellePsd2')}
              </div>
              <div className="pt-2 border-t border-amber-200 space-y-2">
                <div className="text-xs font-semibold text-amber-700">{t('haustierBestaetigen')}</div>
                <div className="flex gap-2">
                  <TierArtDropdown
                    value={tierArt}
                    onChange={setTierArt}
                    placeholder={t('artPlaceholder')}
                    options={TIER_ARTEN}
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={tierName}
                    onChange={e => setTierName(e.target.value)}
                    className="text-xs border border-amber-300 rounded px-2 py-1 flex-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    onClick={handleConfirm}
                    disabled={!tierArt.trim()}
                    className="text-xs px-3 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('bestaetigen')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <PawPrint size={14} className="text-amber-500" />
            {t('haustierLabel')}:
          </span>
          <span className="text-slate-700 font-medium">
            {tierArt}{tierName ? ` „${tierName}"` : ''}
          </span>
          <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle size={11} />
            {bestaetigtDatum ? `Bestätigt am ${bestaetigtDatum}` : t('bestaetigt')}
          </span>
        </div>
      )}
    </div>
  );
}

function FahrzeugeSection({ fahrzeuge, t, onJumpToKfz }) {
  return (
    <>
      {fahrzeuge.liste?.length > 0 ? (
        fahrzeuge.liste.map((fz, i) => (
          <button
            key={i}
            type="button"
            onClick={onJumpToKfz}
            className="w-full flex items-center gap-2 text-sm text-left rounded-md px-1 -mx-1 py-0.5 hover:bg-slate-50 transition-colors group cursor-pointer flex-wrap"
            title="Zur Finanzübersicht — KFZ-Versicherung anzeigen"
          >
            <span className="text-slate-400 shrink-0">Fahrzeug:</span>
            {(() => {
              const parts = (fz.modell || '').split(' ');
              const brand = parts[0] || '';
              const rest = parts.slice(1).join(' ');
              return (
                <>
                  {brand && <LogoImg name={brand} size={16} />}
                  <span className="text-slate-700 font-medium group-hover:underline">
                    {rest || fz.modell}
                  </span>
                </>
              );
            })()}
            {(fz.deckung || fz.sf) && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                {[fz.deckung, fz.sf].filter(Boolean).join(' · ')}
              </span>
            )}
            <span className="text-slate-500">
              · {fz.versicherer || 'Unbekannt'}
              {fz.praemie > 0 && <span className="font-mono"> ({fz.praemie}€/J.)</span>}
            </span>
            {fz.quelle === 'psd2' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
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
          </button>
        ))
      ) : null}

      {fahrzeuge.monatlicheAusgaben > 0 && (
        <div className="flex items-baseline gap-2 text-sm flex-wrap">
          <span className="text-slate-400 shrink-0">{t('mobilitaetsausgaben')}:</span>
          <span className="font-mono font-medium text-slate-700">{fahrzeuge.monatlicheAusgaben}€{t('proMonat')}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 font-medium">PSD2</span>
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

// Angehörige (Partner/Kinder) als klickbarer Link mit Hover-Popover.
// Das Popover zeigt eine synthetische Kunden-ID, "Kunde seit" und einen
// "Zum Kunden"-Button mit Foto bzw. Initialen. Die Navigation ist noch
// nicht verdrahtet, weil die Angehoerigen aktuell keine eigenen
// Kundendatensaetze haben.
function personHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h;
}
function PersonLink({ name, role }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Synthetische Metadaten, deterministisch aus dem Namen.
  const h = personHash(name || '');
  const syntheticId = `BK${(90000 + (h % 9999)).toString().padStart(5, '0')}`;
  const yearNow = new Date().getFullYear();
  const kundeSeitJahr = 2015 + (h % 11); // 2015..2025
  const kundeSeitMonat = 1 + (h % 12);
  const kundeSeit = `${String(kundeSeitMonat).padStart(2, '0')}.${kundeSeitJahr}`;
  const initials = (name || '').split(' ').map(n => n[0]).join('').slice(0, 2);
  const avatarBg = `hsl(${h % 360}, 60%, 45%)`;

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block pointer-events-auto"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className="cursor-pointer underline decoration-dotted decoration-slate-400 underline-offset-2 hover:text-slate-900 hover:decoration-slate-700 transition-colors"
        role="link"
      >
        {name}
      </span>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-30 rounded-xl border border-slate-200 bg-white shadow-lg px-3 py-2.5 w-64 animate-fade-in pointer-events-auto"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: avatarBg }}
            >
              {initials || '?'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{name}</div>
              {role && <div className="text-[11px] text-slate-500 truncate">{role}</div>}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5 text-[11px]">
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Kunden-ID</span>
              <span className="font-mono text-slate-700">{syntheticId}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Kunde seit</span>
              <span className="font-mono text-slate-700">{kundeSeit}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { /* Navigation wird ergaenzt sobald eigener Datensatz existiert */ }}
            className="mt-2 w-full text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg px-2 py-1.5 transition-colors"
          >
            Zum Kunden
          </button>
        </div>
      )}
    </span>
  );
}

// ─── Risiko-Signale (z.B. Extremsport vs. Unfallversicherungs-Deckung) ───
// Optisch wie der „Haustier erkannt"-Hinweis: blauer/dezenter Info-Stil,
// nicht alarmrot. Die Versicherungslücke wird in einem separaten kleinen
// Block hervorgehoben.
function RisikoSignale({ signale, institut }) {
  const [expanded, setExpanded] = useState(null);
  const ctx = { institut };
  return (
    <div className="mt-2.5 space-y-2">
      {signale.map((s, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-700 shrink-0 text-sm">
              <ShieldAlert size={14} />
              {interpolateDynamicDates(s.titel, ctx)}
            </span>
            <span className="text-sm text-slate-500 italic">Aus Kontoumsätzen erkannt</span>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <Info size={11} />
              Details
            </button>
          </div>
          {expanded === i && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2 animate-fade-in">
              <div className="text-sm text-slate-700 leading-snug">{interpolateDynamicDates(s.beschreibung, ctx)}</div>

              {s.transaktionen?.length > 0 && (
                <div className="pt-2 border-t border-amber-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Erkannte Transaktionen</div>
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
                    <div className="text-sm text-slate-700 leading-snug">{interpolateDynamicDates(s.konsequenz, ctx)}</div>
                  </div>
                </div>
              )}

              {s.empfehlung && (
                <div className="flex items-start gap-1.5 text-sm pt-1">
                  <Sparkles size={13} className="text-violet-600 mt-0.5 shrink-0" />
                  <span className="text-slate-700"><strong className="text-violet-700">Empfehlung:</strong> {interpolateDynamicDates(s.empfehlung, ctx)}</span>
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
// `variant` steuert, welcher Blickwinkel zusammengefasst wird.
//   - 'stammdaten' (default): persönlicher Überblick / CRM-Sicht
//   - 'finanzuebersicht': Fokus auf Bilanz, Liquidität, Open-Finance-Sicht
export function KIZusammenfassungInlay({ kunde, embedded = false, variant = 'stammdaten' }) {
  const summary = variant === 'finanzuebersicht'
    ? generateFinanzKISummary(kunde)
    : generateKISummary(kunde);
  const wrapperClass = embedded
    ? 'relative rounded-xl border border-slate-200 bg-white overflow-hidden'
    : 'relative rounded-2xl border border-slate-200 bg-white overflow-hidden';
  return (
    <div className={wrapperClass}>
      {/* Schmaler Violett-Akzent als einziges Signal "das ist KI" */}
      <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-violet-500" />
      <div className="relative pl-4 pr-4 py-3 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-violet-600" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5 gap-2">
            <h3 className="font-semibold text-slate-700 text-sm tracking-wide">KI-Zusammenfassung</h3>
            <span className="text-[11px] text-slate-400 font-mono shrink-0">
              Aktualisiert {new Date().toLocaleDateString('de-DE')}
            </span>
          </div>
          <p className="text-[13px] text-slate-700 leading-snug">{summary.text}</p>
          {summary.recommendation && (
            <div className="mt-1 flex items-start gap-1.5 text-[13px]">
              <Sparkles size={12} className="text-violet-600 mt-0.5 shrink-0" />
              <span className="text-slate-700">
                <strong className="text-slate-800">Empfehlung:</strong> {summary.recommendation}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Finanz-fokussierte KI-Zusammenfassung: nutzt Open-Finance-/Bestands-Daten
// statt des CRM-Blicks der Stammdaten-Variante. Anlage- und Kreditvolumen
// kommen aus den gleichen Helpern, die auch die Stammdaten-Finanzübersicht
// nutzt — damit sind die Zahlen über alle Sichten hinweg konsistent.
function generateFinanzKISummary(kunde) {
  const name = (kunde.name || 'Der Kunde').split(' ')[0];
  const fremd = kunde.fremdProdukte || [];
  const of = kunde.openFinance || {};

  const anlageVol = berechneAnlagevolumen(kunde);
  const kreditVol = berechneKreditvolumen(kunde);
  const fremdInstitute = Array.from(new Set(fremd.map(f => f.institut).filter(Boolean)));
  const versicherungenFremdCount = (of.versicherungenFremd || []).length || fremd.filter(p => /vers/i.test(p.typ)).length;
  const haushalt = berechneHaushaltsnetto(kunde);
  const frei = berechneFrei(kunde);

  let text = `Finanzielle Lage von ${name}: `;
  if (haushalt > 0) text += `Haushaltsnetto ${formatEur(haushalt)}/mtl., davon ${frei > 0 ? `${formatEur(frei)} frei verfügbar` : 'aktuell nichts frei verfügbar'}. `;
  if (anlageVol > 0) text += `Gesamt-Anlagevolumen ca. ${formatEur(anlageVol)} (eigene Bestände und Open-Finance-Depots kombiniert). `;
  if (kreditVol > 0) text += `Offene Finanzierungen ${formatEur(kreditVol)}. `;
  if (fremdInstitute.length > 0) text += `Verbindungen zu ${fremdInstitute.length} Fremdinstituten (${fremdInstitute.slice(0, 3).join(', ')}${fremdInstitute.length > 3 ? ', …' : ''}). `;
  if (versicherungenFremdCount > 0) text += `${versicherungenFremdCount} Fremdversicherungen sichtbar — daraus leitet sich der Absicherungsscore ab. `;

  let recommendation = null;
  if (kreditVol > 0 && frei > 0 && anlageVol > 0) {
    recommendation = 'Finanzierung, Liquidität und Geldanlage in einem Jahresgespräch gemeinsam betrachten — Konsolidierungspotenzial sichtbar.';
  } else if (fremdInstitute.length >= 2) {
    recommendation = 'Open-Finance-Daten für konkretes Konsolidierungsangebot nutzen — Cross-Sell-Potenzial hoch.';
  } else {
    recommendation = 'Open-Finance-Bestand nutzen, um Absicherungsscore und Cross-Sell-Impulse zu priorisieren.';
  }

  return { text: text.trim(), recommendation };
}

function generateKISummary(kunde) {
  // Die KI-Zusammenfassung zieht ihre Zahlen aus exakt denselben Quellen
  // wie Finanzübersicht + Leads-Tab, damit beide Sichten dieselbe Realität
  // erzählen. Das Top-Potenzial stammt aus `kunde.potentiale` (identische
  // Liste wie im Kanban/Leads), die Finanzzahlen aus den gemeinsamen
  // Helpern.
  const vorname = (kunde.name || 'Der Kunde').split(' ')[0];
  const beruf = kunde.beruf || '';
  const arbeitgeber = kunde.arbeitgeber?.name || null;
  const jahre = kunde.eigeneProdukte?.[0]?.seit
    ? new Date().getFullYear() - parseInt(kunde.eigeneProdukte[0].seit.slice(0, 4), 10)
    : null;
  const partner = kunde.partner?.name || null;
  const kinder = (kunde.kinder || []).length;
  const abwanderung = kunde.abwanderungsrisiko || 'gering';

  // Finanzkennzahlen — dieselben Helper, die auch die Finanzübersicht nutzt.
  const haushalt = berechneHaushaltsnetto(kunde);
  const frei = berechneFrei(kunde);
  const anlageVol = berechneAnlagevolumen(kunde);
  const kreditVol = berechneKreditvolumen(kunde);

  // Offene Potenziale = alles außer „nicht_sinnvoll"/„abgeschlossen" —
  // exakt wie der Leads-Tab sie merged.
  const offenePot = (kunde.potentiale || []).filter(
    p => p.status !== 'nicht_sinnvoll' && p.status !== 'abgeschlossen'
  );
  const prioRank = { sehr_hoch: 4, kritisch: 4, hoch: 3, mittel: 2, niedrig: 1 };
  const sortedPot = [...offenePot].sort(
    (a, b) => (prioRank[b.prioritaet] || 0) - (prioRank[a.prioritaet] || 0)
  );
  const topPot = sortedPot[0] || null;

  const fmtVol = (p) => {
    if (!p?.volumen) return '';
    return ` (${formatEur(p.volumen)}${p.volumenTyp === 'jaehrlich' ? '/J.' : ''})`;
  };

  let text = '';
  text += `${vorname} ist seit ${jahre || 'mehreren'} Jahren Kunde`;
  if (beruf) text += `, ${beruf}`;
  if (arbeitgeber) text += ` bei ${arbeitgeber}`;
  text += '. ';

  if (partner) text += `Verheiratet mit ${partner}`;
  if (kinder > 0) text += `${partner ? ', ' : ''}${kinder} ${kinder === 1 ? 'Kind' : 'Kinder'}`;
  if (partner || kinder) text += '. ';

  if (haushalt > 0) {
    text += `Haushaltsnetto ${formatEur(haushalt)}/mtl.`;
    if (frei > 0) text += `, davon ${formatEur(frei)} frei verfügbar`;
    text += '. ';
  }
  if (anlageVol > 0 || kreditVol > 0) {
    const parts = [];
    if (anlageVol > 0) parts.push(`Anlagevolumen ${formatEur(anlageVol)}`);
    if (kreditVol > 0) parts.push(`offene Finanzierungen ${formatEur(kreditVol)}`);
    text += parts.join(', ') + '. ';
  }

  if (abwanderung === 'hoch') {
    text += 'FIDA-Signal: erhöhtes Abwanderungsrisiko, Vermögen wandert teilweise zu Fremdbanken ab. ';
  } else if (abwanderung === 'mittel') {
    text += 'Erste FIDA-Signale für Vermögensverlagerung an Fremdbanken erkennbar. ';
  }

  if (topPot) {
    text += `Top-Lead aktuell: „${topPot.titel}"${fmtVol(topPot)}`;
    if (offenePot.length > 1) text += ` — plus ${offenePot.length - 1} weitere offene Potenziale im Pipeline-Board.`;
    else text += '.';
  } else if (offenePot.length > 0) {
    text += `Aktuell ${offenePot.length} offene Vertriebspotenziale im Pipeline-Board.`;
  }

  // Empfehlung kommt direkt aus dem Top-Potenzial (Aktion + Produkt), damit
  // sie 1:1 zu dem passt, was der Leads-Tab als „nächsten Schritt" anzeigt.
  let recommendation = null;
  if (topPot) {
    const produkt = topPot.produktEmpfehlung;
    const titel = topPot.titel;
    if (topPot.empfohleneAktion === 'termin_vereinbaren') {
      recommendation = produkt
        ? `Termin zu „${titel}" vereinbaren — passendes Produkt: ${produkt}.`
        : `Termin zu „${titel}" vereinbaren.`;
    } else if (topPot.empfohleneAktion === 'angebot_erstellen') {
      recommendation = produkt
        ? `Angebot zu „${titel}" erstellen (${produkt}).`
        : `Angebot zu „${titel}" erstellen.`;
    } else if (topPot.empfohleneAktion === 'tarifvergleich') {
      recommendation = `Tarifvergleich zu „${titel}" aufbereiten${produkt ? ` — Zielprodukt ${produkt}.` : '.'}`;
    } else {
      recommendation = `Top-Potenzial „${titel}" aktiv angehen.`;
    }
  } else {
    recommendation = 'Jahresgespräch zur Bedarfsabklärung terminieren.';
  }

  return { text: text.trim(), recommendation };
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

  // Einheitlich neutrale Icon-Boxen — Aktivitätstyp wird über Icon-Form
  // kommuniziert, nicht über Farbe. Nur die "Neu"-Terminzusage wird
  // weiterhin grün hervorgehoben (eigener Branch unten).
  const colorForType = () => ({ bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' });

  return (
    <Card hover={false} className="flex flex-col h-full">
      <div className="-mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl border-b border-amber-100 flex items-center gap-2 bg-amber-50/70">
        <MessageSquare size={18} className="text-amber-600" strokeWidth={1.75} />
        <h3 className="font-semibold text-slate-700 text-sm tracking-wide">Aktivitäten</h3>
        <span className="text-xs text-slate-500 ml-auto">
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
            const c = colorForType();
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
