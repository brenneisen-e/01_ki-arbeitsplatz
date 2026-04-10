import { memo } from 'react';
import KPIBox from './KPIBox';
import useTranslation from '../../i18n/useTranslation';

export default memo(function KPIGrid({ kpiConfig, kpiValues, leadingSlot = null }) {
  const { lang } = useTranslation();
  const cols = leadingSlot ? 'grid-cols-5' : 'grid-cols-4';
  return (
    <div className={`grid ${cols} gap-4 mb-6 items-stretch`}>
      {leadingSlot}
      {kpiConfig.map((kpi, i) => {
        const val = kpiValues[kpi.id] || { wert: 0, trend: 0 };
        return (
          <KPIBox
            key={kpi.id}
            icon={kpi.icon}
            label={lang === 'en' && kpi.labelEn ? kpi.labelEn : kpi.label}
            wert={val.wert}
            format={kpi.format}
            trend={val.trend}
            delay={i * 50}
          />
        );
      })}
    </div>
  );
});
