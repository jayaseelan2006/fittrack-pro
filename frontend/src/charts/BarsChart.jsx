import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS, SERIES, tooltipStyle } from './chartTheme';
import { fmtDate, num } from '../utils/format';

/** Bar chart. series: [{ key, name, color? }] */
export default function BarsChart({ data = [], xKey = 'date', series, height = 260, unit = '', referenceY, referenceLabel, xFormatter = fmtDate }) {
  const rows = data.map((r) => {
    const o = { ...r };
    series.forEach((s) => { o[s.key] = r[s.key] == null ? 0 : Number(r[s.key]); });
    return o;
  });
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis dataKey={xKey} tickFormatter={xFormatter} stroke={COLORS.axis} fontSize={11} tickLine={false} axisLine={false} minTickGap={16} />
          <YAxis stroke={COLORS.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => num(v)} width={48} allowDecimals={false} />
          <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(128,128,128,0.12)' }} labelFormatter={xFormatter}
            formatter={(v, name) => [`${num(v, 1)}${unit ? ` ${unit}` : ''}`, name]} />
          {referenceY != null && <ReferenceLine y={Number(referenceY)} stroke={COLORS.amber} strokeDasharray="5 4" label={{ value: referenceLabel, fill: COLORS.amber, fontSize: 11, position: 'insideTopRight' }} />}
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || SERIES[i % SERIES.length]} radius={[6, 6, 0, 0]} maxBarSize={36} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
