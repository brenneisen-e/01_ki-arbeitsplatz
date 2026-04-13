import { useState } from 'react';
import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import LogoImg from '../../../components/ui/LogoImg';
import { formatEur } from '../../../utils/formatters';
import { CheckCircle, XCircle, Link2, Briefcase, PiggyBank, Shield, Home, TrendingUp, AlertTriangle, ChevronDown } from 'lucide-react';
import useTranslation from '../../../i18n/useTranslation';
import { useMode } from '../../../hooks/useMode';

const TYP_EN = {
  depot: 'Securities Account', depot2: 'Securities Account 2', depot_firma: 'Company Securities',
  depot_privat: 'Private Securities', cash: 'Cash', festgeld: 'Fixed Deposit',
  tagesgeld: 'Money Market', immobilien: 'Real Estate', immobilie: 'Real Estate',
  gmbh: 'Company Ownership', lv: 'Life Insurance', bu: 'Disability Insurance',
  du: 'Civil Service Disability', dno: 'D&O Insurance', haftpflicht: 'Liability Insurance',
  hausrat: 'Household Insurance', kfz: 'Auto Insurance', kfz2: 'Auto Insurance 2',
  kfz_fremd: 'Auto Insurance (External)', pkv: 'Private Health Insurance',
  pkv_ehemann: 'Private Health (Spouse)', rlv: 'Term Life Insurance',
  unfall: 'Accident Insurance', it_hp: 'IT Liability', praxis_hp: 'Practice Liability',
  betriebshaftpflicht: 'Business Liability', kuenstlersozialkasse: 'Artist Social Fund',
  rechtsschutz: 'Legal Protection', versicherung: 'Insurance',
  wohngebaeude: 'Building Insurance', inhaltsversicherung: 'Contents Insurance',
  baufinanzierung: 'Mortgage', bausparvertrag: 'Home Savings Plan',
  business_konto: 'Business Account', geschaeftskonto: 'Business Account',
  geschaeftskonto1: 'Business Account 1', geschaeftskonto2: 'Business Account 2',
  geschaeftskonto3: 'Business Account 3', girokonto: 'Checking Account',
  konsumkredit: 'Consumer Credit', konto: 'Account', kffw: 'KfW Loan',
  privatkredit: 'Personal Loan', privat_konto: 'Private Account',
  privatkonto: 'Private Account', praxiskonto: 'Practice Account',
  smartfinanz: 'Smart Finance', sparkonto: 'Savings Account',
  angel: 'Angel Investment', unternehmensbeteiligung: 'Business Participation',
  telefon: 'Phone', visa: 'Visa', lebensversicherung: 'Life Insurance',
};

const INST_EN = { Eigene: 'Own', Privat: 'Private' };

const DETAILS_EN = [
  ['Gemischtes Mandat', 'Mixed Mandate'], ['Gemischte Fonds', 'Mixed Funds'],
  ['Gemischtes Depot', 'Mixed Portfolio'], ['Festgeld/Tagesgeld', 'Fixed Deposit/Money Market'],
  ['Gehaltseingang', 'Salary Deposit'], ['Ablauf', 'Maturity'],
  ['Rückkaufswert', 'Surrender Value'], ['RKW', 'SV'],
  ['Zuteilungsreif', 'Maturing'], ['ZINSBINDUNG', 'FIXED RATE PERIOD'],
  ['Zinsbindung', 'Fixed Rate Period'], ['Privathaftpflicht', 'Personal Liability'],
  ['Privatversicherung', 'Private Insurance'], ['Ehepaar', 'Couple'],
  ['Familie', 'Family'], ['Notgroschen', 'Emergency Fund'],
  ['Steuerrücklage', 'Tax Reserve'], ['Lohnkonto', 'Payroll Account'],
  ['Renteneingang', 'Pension Deposit'], ['Hauptkonto', 'Main Account'],
  ['Ansparphase', 'Savings Phase'], ['Firmenkonto', 'Company Account'],
  ['Ausgewogen', 'Balanced'], ['Konservativ', 'Conservative'],
  ['Konservativ-Ausgewogen', 'Conservative-Balanced'],
  ['Defensiv', 'Defensive'], ['Wachstum', 'Growth'],
  ['Zweitwagen Frau', 'Second Car (Spouse)'],
  ['Dienstunfähigkeit', 'Civil Service Disability'],
  ['Pflichtversichert', 'Statutory Insured'], ['Deckung', 'Coverage'],
  ['Baujahr', 'Built'], ['Privat-Depot Aktien', 'Private Stock Portfolio'],
  ['Privat-Girokonto', 'Private Checking Account'],
  ['Betriebsmittel', 'Operating Funds'],
  ['Studienkredit Rest', 'Student Loan Remaining'],
  ['Inventar', 'Inventory'], ['Innenstadt', 'Downtown'],
  ['Bahnhof', 'Station'], ['Rest', 'Remaining'],
  ['bis', 'until'], ['mtl', '/mo'], ['Zins', 'Interest'], ['netto', 'net'],
  ['EFH', 'Detached House'], ['MFH', 'Multi-Family'], ['Gewerbe', 'Commercial'],
  ['Maschinenbau GmbH', 'Engineering GmbH'], ['Ferienwohnung', 'Vacation Apartment'],
  ['CASH GEPARKT! Exit-Erlöse', 'CASH PARKED! Exit proceeds'],
  ['Praxis-Konto', 'Practice Account'], ['Praxis-Immobilie', 'Practice Property'],
  ['Privatkonto', 'Private Account'], ['Schwerpunkt', 'Focus'],
  ['Ausschüttung', 'Distribution'], ['Co-Investment', 'Co-Investment'],
  ['ESG-Filter', 'ESG Filter'], ['Tech-Fokus', 'Tech Focus'],
];

function translateDetails(details, lang) {
  if (lang !== 'en' || !details) return details;
  let s = details;
  for (const [de, en] of DETAILS_EN) s = s.replaceAll(de, en);
  return s;
}

// ─── Bewertung (score) for a Fremd-Versicherung ───────────────────────────
// Deterministic 55–95 score based on kundeId + product + how many Leistungen
// the tariff lists and whether a Deckungssumme is known. Used as demo score
// in the "Absichern" table.
function scoreVersicherung(kundeId, v) {
  const seedStr = `${kundeId || ''}|${v.produkt || ''}|${v.institut || ''}`;
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  let score = 55 + (h % 30); // 55–84 baseline
  if (Array.isArray(v.leistungen) && v.leistungen.length >= 2) score += 5;
  if (v.deckungssumme) score += 4;
  if (v.praemie && v.praemie > 1500) score -= 3; // high premium → worse value
  return Math.max(40, Math.min(96, score));
}

function InsuranceScore({ score }) {
  const color = score >= 85 ? { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: '#10b981' }
             : score >= 70 ? { bg: 'bg-lime-50', text: 'text-lime-700', bar: '#84cc16' }
             : score >= 55 ? { bg: 'bg-amber-50', text: 'text-amber-700', bar: '#f59e0b' }
             : { bg: 'bg-red-50', text: 'text-red-700', bar: '#ef4444' };
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color.bar }} />
      </div>
      <span className={`rh-badge text-[11px] font-bold px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>{score}</span>
    </div>
  );
}

// ─── Deterministic consent dates (grant + expiry) per (kundeId, product) ───
// Consents under PSD2/FIDA-Style are valid for 180 days. We derive a stable
// seed from kunde.id + product type/institut so the same row always shows the
// same dates and a subset of rows is "expiring soon" for demo purposes.
function consentDates(kundeId, row) {
  const seedStr = `${kundeId || ''}|${row.typ || ''}|${row.institut || ''}`;
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  // Grant date: 1–170 days ago
  const daysAgo = 1 + (h % 170);
  const grant = new Date();
  grant.setDate(grant.getDate() - daysAgo);
  // Expiry: 180 days after grant
  const expiry = new Date(grant);
  expiry.setDate(expiry.getDate() + 180);
  const today = new Date();
  const daysLeft = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
  const fmt = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return { erteilt: fmt(grant), bis: fmt(expiry), daysLeft };
}

// ─── Generate extended Open Finance data from fremdProdukte ───
function generateBedarfsfelder(kunde, modeId) {
  const fremd = kunde.fremdProdukte || [];
  const eigen = kunde.eigeneProdukte || [];

  // Use explicit openFinance data if available, otherwise derive from fremdProdukte
  if (kunde.openFinance) return kunde.openFinance;

  const geldmarkt = [];
  const kapitalmarkt = [];
  const versicherungenFremd = [];
  const finanzierungen = [];

  fremd.forEach(p => {
    const t = p.typ;
    if (t === 'tagesgeld' || t === 'festgeld' || t === 'sparkonto') {
      geldmarkt.push({
        produkt: p.produktart || (t === 'tagesgeld' ? 'Tagesgeldkonto' : t === 'festgeld' ? 'Festgeld' : 'Sparkonto'),
        institut: p.institut, volumen: p.volumen,
        zinssatz: p.zinssatz || (t === 'tagesgeld' ? '2,0% p.a.' : t === 'festgeld' ? '3,0% p.a.' : '0,5% p.a.'),
        laufzeit: p.laufzeit || (t === 'festgeld' ? 'bis 2027' : 'Flexibel'),
      });
    } else if (t === 'depot' || t === 'depot_privat' || t === 'depot_firma') {
      // Parse details for sparrate
      const sparMatch = (p.details || '').match(/(\d+)\s*\/?\s*(?:mtl|Mon)/i);
      const sparrate = sparMatch ? `${sparMatch[1]}\u20ac/Mon.` : null;
      kapitalmarkt.push({
        produkt: p.fondName || p.produktart || 'Wertpapierdepot',
        institut: p.institut, volumen: p.volumen,
        sparrate: p.sparrate || sparrate,
        performanceYtd: p.performanceYtd || null,
        positionen: p.positionen || null,
      });
    } else if (['versicherung', 'kfz', 'kfz_fremd', 'hausrat', 'haftpflicht', 'rechtsschutz',
                 'rlv', 'bu', 'du', 'pkv', 'pkv_ehemann', 'unfall', 'lebensversicherung',
                 'praxis_hp', 'betriebshaftpflicht', 'inhaltsversicherung', 'wohngebaeude'].includes(t)) {
      versicherungenFremd.push({
        produkt: p.produktart || p.typ.replace(/_/g, ' '),
        institut: p.institut, praemie: p.volumen > 0 && p.volumen < 10000 ? p.volumen : null,
        deckungssumme: p.deckungssumme || null,
        tarifart: p.tarifart || null,
        leistungen: p.leistungen || null,
        selbstbehalt: p.selbstbehalt || null,
        kuendigungsfrist: p.kuendigungsfrist || null,
        details: p.details,
      });
    } else if (['baufinanzierung', 'kredit', 'konsumkredit', 'privatkredit', 'kffw'].includes(t)) {
      finanzierungen.push({
        produkt: p.produktart || (t === 'baufinanzierung' ? 'Baufinanzierung' : t === 'kffw' ? 'KfW-Darlehen' : 'Ratenkredit'),
        institut: p.institut, restschuld: p.volumen,
        zinssatz: p.zinssatz || null,
        rate: p.rate || null,
        laufzeit: p.laufzeit || null,
        absicherung: p.absicherung || null,
        details: p.details,
      });
    }
  });

  return { geldmarkt, kapitalmarkt, versicherungenFremd, finanzierungen };
}

// ─── Section header with colored icon ───
function BedarfsfeldHeader({ icon: Icon, title, source, color, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <h3 className="font-semibold text-slate-800">
          {title}
          {count != null && <span className="text-slate-400 font-normal ml-1">({count})</span>}
        </h3>
      </div>
      {source && <span className="text-xs text-slate-400">{source}</span>}
    </div>
  );
}

// ─── Performance badge ───
function PerfBadge({ value }) {
  if (value == null) return <span className="text-slate-300">–</span>;
  const positive = typeof value === 'string' ? value.startsWith('+') : value > 0;
  const display = typeof value === 'string' ? value : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  return <span className={`font-mono font-semibold ${positive ? 'text-emerald-600' : 'text-red-600'}`}>{display}</span>;
}

export default function OpenFinanceTab({ kunde }) {
  const { t, lang } = useTranslation();
  const { config, modeId } = useMode();
  const fremd = kunde.fremdProdukte || [];
  const eigen = kunde.eigeneProdukte || [];
  const consented = fremd.filter(f => f.consent).length;
  const total = fremd.length;

  const bf = generateBedarfsfelder(kunde, modeId);
  const hasExtended = bf.geldmarkt?.length > 0 || bf.kapitalmarkt?.length > 0 || bf.versicherungenFremd?.length > 0 || bf.finanzierungen?.length > 0;

  return (
    <div className="space-y-4">
      {/* Consent Status */}
      <Card hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">{t('fidaConsentStatus')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('gesamt')}</div>
            <div className="font-mono text-2xl font-bold text-slate-800">{total}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('consentErteilt')}</div>
            <div className="font-mono text-2xl font-bold text-emerald-600">{consented}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('ausstehend')}</div>
            <div className="font-mono text-2xl font-bold text-amber-600">{total - consented}</div>
          </div>
        </div>
      </Card>

      {/* Externe Verknuepfungen */}
      <Card hover={false}>
        <h3 className="font-semibold text-slate-800 mb-4">{t('externeVerknuepfungen')}</h3>
        <DataTable
          columns={[
            { id: 'institut', label: lang === 'en' ? 'Company' : 'Unternehmen', render: (v) => (
              <div className="flex items-center gap-2">
                <LogoImg name={v} size={18} />
                <span className="font-medium">{lang === 'en' ? (INST_EN[v] || v) : v}</span>
              </div>
            )},
            { id: 'consentErteilt', label: lang === 'en' ? 'Consent granted' : 'Consent erteilt', render: (_, row) => {
              if (!row.consent) return <span className="flex items-center gap-1 text-slate-400"><XCircle size={14} /> {t('ausstehend')}</span>;
              const d = consentDates(kunde.id, row).erteilt;
              return <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={14} /> {d}</span>;
            }},
            { id: 'consentBis', label: lang === 'en' ? 'Consent expires' : 'Läuft aus am', render: (_, row) => {
              if (!row.consent) return <span className="text-slate-300">–</span>;
              const d = consentDates(kunde.id, row);
              const isExpiring = d.daysLeft <= 30;
              return <span className={`font-mono ${isExpiring ? 'text-amber-600 font-semibold' : 'text-slate-600'}`}>{d.bis}</span>;
            }},
          ]}
          data={fremd}
        />
      </Card>

      {/* ═══ Bedarfsfeld: Sparen & Vorsorgen ═══ */}
      {(bf.geldmarkt?.length > 0 || bf.kapitalmarkt?.length > 0) && (
        <Card hover={false}>
          <BedarfsfeldHeader
            icon={PiggyBank}
            title="Sparen & Vorsorgen"
            color="bg-emerald-500"
            count={(bf.geldmarkt?.length || 0) + (bf.kapitalmarkt?.flatMap(k => k.positionen || [k]).length || 0)}
          />

          {/* Geldmarkt */}
          {bf.geldmarkt.length > 0 && (
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Geldmarkt</h4>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Produkt</th>
                      <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Anbieter</th>
                      <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider font-semibold text-slate-400">Volumen</th>
                      <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider font-semibold text-slate-400">Zinssatz</th>
                      <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Laufzeit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bf.geldmarkt.map((g, i) => (
                      <tr key={i} className="border-t border-slate-100 row-hover">
                        <td className="px-4 py-2.5 font-medium">{g.produkt}</td>
                        <td className="px-4 py-2.5"><div className="flex items-center gap-2"><LogoImg name={g.institut} size={18} />{g.institut}</div></td>
                        <td className="px-4 py-2.5 text-right font-mono">{formatEur(g.volumen)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-emerald-600">{g.zinssatz}</td>
                        <td className="px-4 py-2.5 text-slate-500">{g.laufzeit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Kapitalmarkt */}
          {bf.kapitalmarkt.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kapitalmarkt</h4>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Produkt</th>
                      <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Anbieter</th>
                      <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider font-semibold text-slate-400">Volumen</th>
                      <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider font-semibold text-slate-400">Sparrate</th>
                      <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider font-semibold text-slate-400">Performance YTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bf.kapitalmarkt.map((k, i) => {
                      // Show individual positions if available
                      if (k.positionen) {
                        return k.positionen.map((pos, j) => (
                          <tr key={`${i}-${j}`} className="border-t border-slate-100 row-hover">
                            <td className="px-4 py-2.5 font-medium">{pos.name}</td>
                            <td className="px-4 py-2.5"><div className="flex items-center gap-2"><LogoImg name={pos.institut || k.institut} size={18} />{pos.institut || k.institut}</div></td>
                            <td className="px-4 py-2.5 text-right font-mono">{formatEur(pos.volumen)}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-slate-500">{pos.sparrate || '–'}</td>
                            <td className="px-4 py-2.5 text-right"><PerfBadge value={pos.performanceYtd} /></td>
                          </tr>
                        ));
                      }
                      return (
                        <tr key={i} className="border-t border-slate-100 row-hover">
                          <td className="px-4 py-2.5 font-medium">{k.produkt}</td>
                          <td className="px-4 py-2.5"><div className="flex items-center gap-2"><LogoImg name={k.institut} size={18} />{k.institut}</div></td>
                          <td className="px-4 py-2.5 text-right font-mono">{formatEur(k.volumen)}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-slate-500">{k.sparrate || '–'}</td>
                          <td className="px-4 py-2.5 text-right"><PerfBadge value={k.performanceYtd} /></td>
                        </tr>
                      );
                    })}
                    {/* Summenzeile */}
                    {bf.kapitalmarkt.length > 0 && (() => {
                      const items = bf.kapitalmarkt.flatMap(k => k.positionen || [k]);
                      if (items.length <= 1) return null;
                      const totalVol = items.reduce((s, k) => s + (k.volumen || 0), 0);
                      return (
                        <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-semibold">
                          <td className="px-4 py-2.5">Gesamt Depot</td>
                          <td className="px-4 py-2.5"></td>
                          <td className="px-4 py-2.5 text-right font-mono">{formatEur(totalVol)}</td>
                          <td className="px-4 py-2.5"></td>
                          <td className="px-4 py-2.5"></td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ═══ Bedarfsfeld: Absichern (Fremd) ═══ */}
      {bf.versicherungenFremd?.length > 0 && (
        <Card hover={false}>
          <BedarfsfeldHeader
            icon={Shield}
            title="Absichern"
            source="Wettbewerber-Versicherungen"
            color="bg-blue-500"
            count={bf.versicherungenFremd.length}
          />
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Versicherung</th>
                  <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Anbieter</th>
                  <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Details</th>
                  {bf.versicherungenFremd.some(v => v.deckungssumme) && (
                    <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Deckungssumme</th>
                  )}
                  {bf.versicherungenFremd.some(v => v.leistungen) && (
                    <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Leistungen</th>
                  )}
                  <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider font-semibold text-slate-400">Prämie</th>
                  <th className="px-4 py-2.5 text-center text-xs uppercase tracking-wider font-semibold text-slate-400">Bewertung</th>
                </tr>
              </thead>
              <tbody>
                {bf.versicherungenFremd.map((v, i) => (
                  <tr key={i} className="border-t border-slate-100 row-hover">
                    <td className="px-4 py-2.5 font-medium capitalize">{v.produkt}</td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><LogoImg name={v.institut} size={18} />{v.institut}</div></td>
                    <td className="px-4 py-2.5 text-slate-500">{v.details}</td>
                    {bf.versicherungenFremd.some(x => x.deckungssumme) && (
                      <td className="px-4 py-2.5 text-slate-600">{v.deckungssumme || '–'}</td>
                    )}
                    {bf.versicherungenFremd.some(x => x.leistungen) && (
                      <td className="px-4 py-2.5">
                        {v.leistungen ? (
                          <div className="flex flex-wrap gap-1">
                            {v.leistungen.map((l, j) => (
                              <span key={j} className="rh-badge text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{l}</span>
                            ))}
                          </div>
                        ) : '–'}
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-right font-mono">{v.praemie ? `${formatEur(v.praemie)}/J.` : '–'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <InsuranceScore score={scoreVersicherung(kunde.id, v)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ═══ Bedarfsfeld: Finanzieren ═══ */}
      {bf.finanzierungen?.length > 0 && (
        <Card hover={false}>
          <BedarfsfeldHeader
            icon={Home}
            title="Finanzieren"
            color="bg-violet-500"
            count={bf.finanzierungen.length}
          />
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Kredit</th>
                  <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Kreditgeber</th>
                  <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider font-semibold text-slate-400">Restschuld</th>
                  <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider font-semibold text-slate-400">Zinssatz</th>
                  <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider font-semibold text-slate-400">Rate</th>
                  <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Details</th>
                </tr>
              </thead>
              <tbody>
                {bf.finanzierungen.map((f, i) => (
                  <tr key={i} className="border-t border-slate-100 row-hover">
                    <td className="px-4 py-2.5 font-medium">{f.produkt}</td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><LogoImg name={f.institut} size={18} />{f.institut}</div></td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatEur(f.restschuld)}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{f.zinssatz || '–'}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{f.rate || '–'}</td>
                    <td className="px-4 py-2.5 text-slate-500">{f.details}</td>
                  </tr>
                ))}
                {bf.finanzierungen.length > 1 && (
                  <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-semibold">
                    <td className="px-4 py-2.5">Gesamt Verbindlichkeiten</td>
                    <td className="px-4 py-2.5"></td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatEur(bf.finanzierungen.reduce((s, f) => s + (f.restschuld || 0), 0))}</td>
                    <td className="px-4 py-2.5"></td>
                    <td className="px-4 py-2.5"></td>
                    <td className="px-4 py-2.5"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Warning for uninsured mortgage */}
          {bf.finanzierungen.some(f => f.produkt === 'Baufinanzierung' && !f.absicherung) && (
            <div className="flex items-center gap-2 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle size={16} className="text-amber-500 shrink-0" />
              <span className="text-sm text-amber-800">
                <strong>Risiko:</strong> Baufinanzierung ohne Risikolebensversicherung! Bei Todesfall: Familie kann Kredit nicht bedienen.
              </span>
            </div>
          )}
        </Card>
      )}

    </div>
  );
}
