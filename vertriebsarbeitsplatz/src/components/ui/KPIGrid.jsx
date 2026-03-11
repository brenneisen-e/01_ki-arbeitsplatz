import KPIBox from './KPIBox';

export default function KPIGrid({ kpiConfig, kpiValues }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {kpiConfig.map((kpi, i) => {
        const val = kpiValues[kpi.id] || { wert: 0, trend: 0 };
        return (
          <KPIBox
            key={kpi.id}
            icon={kpi.icon}
            label={kpi.label}
            wert={val.wert}
            format={kpi.format}
            trend={val.trend}
            delay={i * 50}
          />
        );
      })}
    </div>
  );
}
