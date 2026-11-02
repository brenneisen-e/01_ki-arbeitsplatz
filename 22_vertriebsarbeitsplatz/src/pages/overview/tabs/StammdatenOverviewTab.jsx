import Card from '../../../components/ui/Card';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { STAMMDATEN_DATA } from '../../../data';
import { Building2, GraduationCap, FileText, User, Award, BarChart3, ChevronRight } from 'lucide-react';

export default function StammdatenOverviewTab() {
  const { modeId } = useMode();
  const { t } = useTranslation();
  const data = STAMMDATEN_DATA[modeId] || STAMMDATEN_DATA.versicherung;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User size={20} className="text-(--text-tertiary)" strokeWidth={1.75} />
          <h3 className="font-semibold text-(--text-primary)">{t('basisInformationen')}</h3>
        </div>
        <div className="space-y-3 text-sm">
          {data.basis.map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-(--text-tertiary)" strokeWidth={1.75} />
          <h3 className="font-semibold text-(--text-primary)">{t('organisation')}</h3>
        </div>
        <div className="space-y-3 text-sm">
          {data.organisation.map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={20} className="text-(--text-tertiary)" strokeWidth={1.75} />
          <h3 className="font-semibold text-(--text-primary)">{t('qualifikation')}</h3>
        </div>
        <div className="space-y-3 text-sm">
          {data.qualifikation.map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-(--text-tertiary)" strokeWidth={1.75} />
          <h3 className="font-semibold text-(--text-primary)">
            {modeId === 'vermoegensverwaltung' ? t('anstellungZiele') : t('vertragsinformationen')}
          </h3>
        </div>
        <div className="space-y-3 text-sm">
          {data.vertrag.map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Award size={20} className="text-(--text-tertiary)" strokeWidth={1.75} />
          <h3 className="font-semibold text-(--text-primary)">{t('leistungEntwicklung')}</h3>
        </div>
        <div className="space-y-3 text-sm">
          {(data.leistung || [
            { label: t('rangImVertrieb'), value: t('stammVal.rangTop15') },
            { label: t('kundenzufriedenheit'), value: t('stammVal.kundenzufriedenheit') },
            { label: t('bestandsentwicklung'), value: t('stammVal.bestandsentwicklung') },
            { label: t('durchschnVertragsgroesse'), value: t('stammVal.vertragsgroesse') },
            { label: t('letzteAuszeichnung'), value: t('stammVal.auszeichnung') },
          ]).map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-(--text-tertiary)" strokeWidth={1.75} />
          <h3 className="font-semibold text-(--text-primary)">{t('digitaleKanaele')}</h3>
        </div>
        <div className="space-y-3 text-sm">
          {(data.digital || [
            { label: t('appNutzung'), value: t('stammVal.appNutzung') },
            { label: t('onlineAbschluesse'), value: t('stammVal.onlineAbschluesse') },
            { label: t('videoBeratungen'), value: t('stammVal.videoBeratungen') },
            { label: t('emailResponse'), value: t('stammVal.emailResponse') },
            { label: t('socialMedia'), value: t('stammVal.socialMedia') },
          ]).map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>
    </div>
  );
}

// Pfeile in Werten (z. B. Hierarchie „OD Süd → RD Bayern → VD München")
// werden als Lucide-Chevron gesetzt, nicht als Unicode-Symbol.
function renderWert(value) {
  if (typeof value !== 'string' || !value.includes('→')) return value;
  const teile = value.split('→').map(s => s.trim());
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {teile.map((teil, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-(--text-tertiary) shrink-0" />}
          {teil}
        </span>
      ))}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-4">
      <span className="text-(--text-tertiary) shrink-0 w-36">{label}</span>
      <span className="text-(--text-primary) font-medium">{renderWert(value)}</span>
    </div>
  );
}
