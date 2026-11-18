import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS, SERIES, tooltipStyle } from './chartTheme';
import { fmtDate, num } from '../utils/format';

/**
 * Area/line chart. series: [{ key, name, color?, unit? }]
 * Values arrive from the API as numbers or decimal strings, so they're coerced here.
 */
export default function TrendChart({ data = [], xKey = 'date', series, height = 260, unit = '', referenceY, referenceLabel, xFormatter = fmtDate, domain }) {
  const uid = useId().replace(/:/g, '');
  const rows = data.map((r) => {
    const o = { ...r };
    series.forEach((s) => { o[s.key] = r[s.key] == null ? null : Number(r[s.key]); });
    return o;
  });

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color || SERIES[i % SERIES.length]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color || SERIES[i % SERIES.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis dataKey={xKey} tickFormatter={xFormatter} stroke={COLORS.axis} fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis stroke={COLORS.axis} fontSize={11} tickLine={false} axisLine={false} domain={domain || ['auto', 'auto']} tickFormatter={(v) => num(v, 1)} width={48} />
          <Tooltip {...tooltipStyle} labelFormatter={xFormatter}
            formatter={(v, name, item) => [`${num(v, 1)}${(series.find((s) => s.key === item.dataKey)?.unit ?? unit) ? ` ${series.find((s) => s.key === item.dataKey)?.unit ?? unit}` : ''}`, name]} />
          {referenceY != null && <ReferenceLine y={Number(referenceY)} stroke={COLORS.amber} strokeDasharray="5 4" label={{ value: referenceLabel, fill: COLORS.amber, fontSize: 11, position: 'insideTopRight' }} />}
          {series.map((s, i) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} connectNulls
              stroke={s.color || SERIES[i % SERIES.length]} strokeWidth={2.5} fill={`url(#${uid}-${s.key})`}
              dot={rows.length <= 31 ? { r: 3, strokeWidth: 0, fill: s.color || SERIES[i % SERIES.length] } : false} activeDot={{ r: 5 }} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
