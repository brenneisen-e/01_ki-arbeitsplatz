import { memo, Fragment } from 'react';
import KPIBox from './KPIBox';
import useTranslation from '../../i18n/useTranslation';

export default memo(function KPIGrid({ kpiConfig, kpiValues, leadingSlot = null, overrides }) {
  const { lang } = useTranslation();
  // When the optional leading slot is present (Kundenkarte), give it a
  // narrower fixed-width column in portrait format and let the 4 KPI tiles
  // share the remaining width equally.
  const gridStyle = leadingSlot
    ? { gridTemplateColumns: '180px repeat(4, minmax(0, 1fr))' }
    : undefined;
  return (
    <div className="grid grid-cols-4 gap-4 mb-6 items-stretch" style={gridStyle}>
      {leadingSlot}
      {kpiConfig.map((kpi, i) => {
        const val = kpiValues[kpi.id] || { wert: 0, trend: 0 };
        // overrides[kpi.id] ersetzt das Default-KPI komplett — sodass
        // z. B. die Kunden-KPI statt des Sparkline-Charts die Deutschland-
        // Karte inline darstellt. Rest-Layout (Breite, Ordnung) bleibt.
        if (overrides && overrides[kpi.id]) {
          return <Fragment key={kpi.id}>{overrides[kpi.id]}</Fragment>;
        }
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
