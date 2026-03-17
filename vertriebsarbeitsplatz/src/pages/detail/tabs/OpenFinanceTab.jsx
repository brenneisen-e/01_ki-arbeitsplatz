import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import LogoImg from '../../../components/ui/LogoImg';
import { formatEur } from '../../../utils/formatters';
import { CheckCircle, XCircle, Link2 } from 'lucide-react';
import useTranslation from '../../../i18n/useTranslation';

export default function OpenFinanceTab({ kunde }) {
  const { t } = useTranslation();
  const fremd = kunde.fremdProdukte || [];
  const consented = fremd.filter(f => f.consent).length;
  const total = fremd.length;

  return (
    <div className="space-y-4">
      {/* Consent Status */}
      <Card>
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
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">{t('externeVerknuepfungen')}</h3>
        <DataTable
          columns={[
            { id: 'typ', label: t('produkt'), render: v => <span className="font-medium capitalize">{v.replace(/_/g, ' ')}</span> },
            { id: 'institut', label: t('institut'), render: (v) => (
              <div className="flex items-center gap-2">
                <LogoImg name={v} size={18} />
                <span>{v}</span>
              </div>
            )},
            { id: 'details', label: t('details') },
            { id: 'volumen', label: t('volumenLabel'), render: v => <span className="font-mono">{formatEur(v)}</span> },
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
    </div>
  );
}
