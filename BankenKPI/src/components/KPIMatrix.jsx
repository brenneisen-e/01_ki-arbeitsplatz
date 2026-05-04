import { Fragment } from 'react';
import { clsx } from 'clsx';
import { SEGMENTS, KPI_GROUPS, KPI_VALUES, deviationPct, ampelColor, AMPEL_COLORS } from '../data/kpiData';

function fmtCellValue(value, unit) {
  if (value === null || value === undefined) return '–';
  if (unit === '%') {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  }
  return value.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

export default function KPIMatrix({ activeSegment, onSelectSegment }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Konzern-Matrix</h3>
          <p className="text-xs text-slate-400 mt-0.5">Ist vs. Plan – Klick auf Segment für Detailansicht</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: AMPEL_COLORS.green.dot }} />
            ≥ 100 %
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: AMPEL_COLORS.yellow.dot }} />
            95 – 99 %
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: AMPEL_COLORS.red.dot }} />
            &lt; 95 %
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs">
              <th className="text-left px-4 py-2 font-semibold">Zielgröße</th>
              <th className="text-left px-2 py-2 font-semibold">Einheit</th>
              {SEGMENTS.map((s) => (
                <th
                  key={s.id}
                  className={clsx(
                    'text-center px-2 py-2 font-semibold cursor-pointer transition-colors hover:text-slate-700 hover:bg-slate-100',
                    s.id === activeSegment && 'text-slate-800 bg-slate-100',
                  )}
                  onClick={() => onSelectSegment(s.id)}
                  colSpan={2}
                >
                  {s.label}
                </th>
              ))}
            </tr>
            <tr className="bg-slate-50/60 text-slate-400 text-[10px] uppercase tracking-wider">
              <th></th>
              <th></th>
              {SEGMENTS.map((s) => (
                <Fragment key={s.id + '-h'}>
                  <th className="text-right px-2 py-1 font-medium">Ist</th>
                  <th className="text-right px-2 py-1 font-medium">Plan</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {KPI_GROUPS.map((group) => (
              <Fragment key={group.id}>
                <tr className="bg-slate-50/50">
                  <td colSpan={2 + SEGMENTS.length * 2} className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {group.label}
                  </td>
                </tr>
                {group.kpis.map((k) => (
                  <tr key={k.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{k.label}</td>
                    <td className="px-2 py-2.5 text-slate-400 text-xs">{k.unit}</td>
                    {SEGMENTS.map((s) => {
                      const cell = KPI_VALUES[k.id]?.[s.id];
                      if (!cell) {
                        return (
                          <Fragment key={s.id}>
                            <td className="px-2 py-2.5 text-right text-slate-300 font-mono text-xs">–</td>
                            <td className="px-2 py-2.5 text-right text-slate-300 font-mono text-xs">–</td>
                          </Fragment>
                        );
                      }
                      const ampel = ampelColor(cell.ist, cell.plan, k.invertTrend);
                      const cfg = AMPEL_COLORS[ampel];
                      const dev = deviationPct(cell.ist, cell.plan, k.invertTrend);
                      return (
                        <Fragment key={s.id}>
                          <td
                            className="px-2 py-2.5 text-right font-mono text-xs"
                            title={dev !== null ? `Abweichung: ${dev >= 0 ? '+' : ''}${dev.toFixed(1)} %` : ''}
                          >
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold"
                              style={{ background: cfg.bg, color: cfg.text }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                              {fmtCellValue(cell.ist, k.unit)}
                            </span>
                          </td>
                          <td className="px-2 py-2.5 text-right text-slate-500 font-mono text-xs">
                            {fmtCellValue(cell.plan, k.unit)}
                          </td>
                        </Fragment>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
