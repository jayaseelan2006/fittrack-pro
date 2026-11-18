import { useState } from 'react';
import Card from '../../components/Card';
import Async from '../../components/Async';
import StatCard from '../../components/StatCard';
import Tabs from '../../components/Tabs';
import BarsChart from '../../charts/BarsChart';
import TrendChart from '../../charts/TrendChart';
import useFetch from '../../hooks/useFetch';
import { analyticsApi, foodLogsApi } from '../../services';
import { fmtDateLong, num, todayISO, toNum } from '../../utils/format';
import { Beef, Droplet, Flame, Wheat } from 'lucide-react';

export default function FoodHistoryTab({ onPickDate }) {
  const [period, setPeriod] = useState('weekly');
  const report = useFetch(() => (period === 'weekly' ? foodLogsApi.weekly(todayISO()) : analyticsApi.nutrition({ days: 30 })), [period]);

  return (
    <>
      <Tabs value={period} onChange={setPeriod} className="max-w-xs" tabs={[{ key: 'weekly', label: 'Weekly (7 days)' }, { key: 'monthly', label: 'Monthly (30 days)' }]} />
      <Async state={report} empty={(d) => !d.days?.length} emptyText="No food logged in this period">
        {(r) => (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard icon={Flame} label="Avg Calories" value={`${num(r.avg_calories)} kcal`} sub="per day" />
              <StatCard icon={Beef} label="Avg Protein" value={`${num(r.avg_protein, 1)} g`} sub="per day" />
              <StatCard icon={Wheat} label="Avg Carbs" value={`${num(r.avg_carbs, 1)} g`} sub="per day" />
              <StatCard icon={Droplet} label="Avg Fat" value={`${num(r.avg_fat, 1)} g`} sub="per day" />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Card title="Calories"><BarsChart data={r.days} series={[{ key: 'calories', name: 'Calories' }]} unit="kcal" referenceY={r.calorie_target} referenceLabel="Target" /></Card>
              <Card title="Protein"><TrendChart data={r.days} series={[{ key: 'protein', name: 'Protein', unit: 'g', color: '#38bdf8' }]} unit="g" referenceY={r.protein_target} referenceLabel="Target" /></Card>
            </div>
            <Card title="Daily history" className="mt-4" pad={false}>
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Date</th><th className="text-right">Kcal</th><th className="text-right">Protein</th><th className="text-right">Carbs</th><th className="text-right">Fat</th><th className="text-right">vs target</th></tr></thead>
                  <tbody>
                    {[...r.days].reverse().map((d) => {
                      const diff = r.calorie_target ? toNum(d.calories) - toNum(r.calorie_target) : null;
                      return (
                        <tr key={d.date} className="cursor-pointer hover:bg-surface2" onClick={() => onPickDate(d.date)}>
                          <td className="font-medium">{fmtDateLong(d.date)}</td>
                          <td className="text-right">{num(d.calories)}</td>
                          <td className="text-right">{num(d.protein, 1)}</td>
                          <td className="text-right">{num(d.carbs, 1)}</td>
                          <td className="text-right">{num(d.fat, 1)}</td>
                          <td className={`text-right ${diff == null ? '' : diff > 0 ? 'text-warn' : 'text-accent'}`}>{diff == null ? '–' : `${diff > 0 ? '+' : ''}${num(diff)}`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="mt-2 text-xs text-muted">Click a day to open it in the food log.</p>
          </>
        )}
      </Async>
    </>
  );
}
