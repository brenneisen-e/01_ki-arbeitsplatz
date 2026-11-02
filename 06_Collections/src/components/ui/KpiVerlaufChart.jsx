import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { zahl } from '../../utils/format';

/** Zeitreihe fuer KPI-Popups und die Portfolio-Entwicklung. */
export default function KpiVerlaufChart({ daten, color, einheit, hoehe = 260 }) {
  const gradientId = `verlauf-${color.replace('#', '')}`;
  const nachkomma = daten.some(d => !Number.isInteger(d.wert)) ? 1 : 0;

  return (
    <div style={{ height: hoehe }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={daten} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="monat" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={56}
            domain={['auto', 'auto']}
            tickFormatter={v => zahl(v, nachkomma)}
          />
          <Tooltip
            formatter={v => [`${zahl(v, nachkomma)} ${einheit}`, '']}
            labelFormatter={l => l}
            contentStyle={{
              borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12,
              boxShadow: '0 6px 18px rgba(15,23,42,0.10)',
            }}
          />
          <Area
            type="monotone" dataKey="wert" stroke={color} strokeWidth={2}
            fill={`url(#${gradientId})`} dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
