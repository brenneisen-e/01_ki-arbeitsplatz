import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import LogoImg from '../../../components/ui/LogoImg';
import { formatEur } from '../../../utils/formatters';
import { CheckCircle, XCircle, Link2, Briefcase } from 'lucide-react';
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
  // VV-specific details
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

export default function OpenFinanceTab({ kunde }) {
  const { t, lang } = useTranslation();
  const { config } = useMode();
  const fremd = kunde.fremdProdukte || [];
  const eigen = kunde.eigeneProdukte || [];
  const consented = fremd.filter(f => f.consent).length;
  const total = fremd.length;

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
            { id: 'typ', label: t('produkt'), render: v => <span className="font-medium capitalize">{lang === 'en' ? (TYP_EN[v] || v.replace(/_/g, ' ')) : v.replace(/_/g, ' ')}</span> },
            { id: 'produktart', label: t('produktart') || 'Produktart', render: v => v ? <span className="text-slate-600">{v}</span> : <span className="text-slate-300">–</span> },
            { id: 'institut', label: t('institut'), render: (v) => (
              <div className="flex items-center gap-2">
                <LogoImg name={v} size={18} />
                <span>{lang === 'en' ? (INST_EN[v] || v) : v}</span>
              </div>
            )},
            { id: 'details', label: t('details'), render: v => translateDetails(v, lang) },
            { id: 'volumen', label: t('volumenLabel'), render: v => v > 0 ? <span className="font-mono">{formatEur(v)}</span> : <span className="text-slate-300">–</span> },
            { id: 'consent', label: 'Consent', render: v => (
              v ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle size={14} /> {t('erteilt')}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400">
                  <XCircle size={14} /> {t('ausstehend')}
                </span>
              )
            )},
          ]}
          data={fremd}
        />
      </Card>

      {/* Eigene Produkte */}
      {eigen.length > 0 && (
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">{t('eigeneProdukte')} ({eigen.length})</h3>
          </div>
          <DataTable
            columns={[
              { id: 'produkt', label: t('produkt'), render: v => <span className="font-medium">{v}</span> },
              { id: 'sparte', label: t('sparte') || 'Sparte', render: v => <span className="capitalize">{v}</span> },
              { id: 'details', label: t('details'), render: v => translateDetails(v, lang) },
              { id: 'praemie', label: t('praemieLabel') || 'Prämie/J.', render: v => v > 0 ? <span className="font-mono">{formatEur(v)}</span> : <span className="text-slate-300">–</span> },
              { id: 'seit', label: t('seit') || 'Seit' },
              { id: 'status', label: 'Status', render: v => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v === 'aktiv' ? 'bg-emerald-50 text-emerald-700' : v === 'optimierbar' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  {v}
                </span>
              )},
            ]}
            data={eigen}
          />
        </Card>
      )}
    </div>
  );
}
