import { memo } from 'react';
import KPIBox from './KPIBox';
import useTranslation from '../../i18n/useTranslation';

export default memo(function KPIGrid({ kpiConfig, kpiValues }) {
  const { lang } = useTranslation();
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
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
