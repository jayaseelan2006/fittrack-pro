import { useState } from 'react';
import { Beef, CalendarCheck, Dumbbell, Flame, Scale, Weight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Async from '../components/Async';
import StatCard from '../components/StatCard';
import Tabs from '../components/Tabs';
import { Select } from '../components/Field';
import TrendChart from '../charts/TrendChart';
import BarsChart from '../charts/BarsChart';
import StrengthChart from '../charts/StrengthChart';
import { RecordsTable } from './ProgressionPage';
import useFetch from '../hooks/useFetch';
import { analyticsApi, progressionApi } from '../services';
import { cap, fmtDate, num, signed } from '../utils/format';

function Report({ period }) {
  const r = useFetch(() => (period === 'weekly' ? analyticsApi.weekly() : analyticsApi.monthly()), [period]);
  return (
    <Async state={r} height="h-32">
      {(d) => (
        <>
          <p className="mb-3 text-xs text-muted">{fmtDate(d.period_start)} – {fmtDate(d.period_end)} · {d.days_logged} day{d.days_logged === 1 ? '' : 's'} with food logged</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={Flame} label="Avg calories" value={`${num(d.avg_calories)}`} sub="kcal / day" />
            <StatCard icon={Beef} label="Avg protein" value={`${num(d.avg_protein, 1)}`} sub="g / day" />
            <StatCard icon={Dumbbell} label="Workouts" value={num(d.workouts_completed)} sub="completed" />
            <StatCard icon={Weight} label="Volume" value={num(d.total_volume)} sub="kg lifted" />
            <StatCard icon={Scale} label="Weight change" value={d.weight_change == null ? '–' : signed(d.weight_change, 1)} sub="kg" />
            <StatCard icon={CalendarCheck} label="Avg carbs / fat" value={`${num(d.avg_carbs)} / ${num(d.avg_fat)}`} sub="g / day" />
          </div>
        </>
      )}
    </Async>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState('90');
  const [period, setPeriod] = useState('weekly');
  const weight = useFetch(() => analyticsApi.weight({ days }), [days]);
  const nutrition = useFetch(() => analyticsApi.nutrition({ days }), [days]);
  const workouts = useFetch(() => analyticsApi.workouts({ days }), [days]);
  const strength = useFetch(() => analyticsApi.strength({ days }), [days]);
  const records = useFetch(() => progressionApi.personalRecords());

  return (
    <>
      <PageHeader title="Analytics" subtitle="Detailed trends across weight, nutrition and training"
        actions={<div className="w-40"><Select value={days} onChange={(e) => setDays(e.target.value)} options={[{ value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }, { value: '180', label: 'Last 6 months' }, { value: '365', label: 'Last year' }]} /></div>} />

      <Tabs value={period} onChange={setPeriod} className="max-w-xs" tabs={[{ key: 'weekly', label: 'Weekly report' }, { key: 'monthly', label: 'Monthly report' }]} />
      <Report period={period} />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Weight gain history">
          <Async state={weight} empty={(d) => !d.points?.length} emptyText="No weight entries in this period">
            {(w) => (<><p className="mb-2 text-xs text-muted">Change over period: <b className="text-ink">{w.change == null ? '–' : `${signed(w.change, 1)} kg`}</b></p><TrendChart data={w.points} series={[{ key: 'weight_kg', name: 'Weight', unit: 'kg' }]} unit="kg" /></>)}
          </Async>
        </Card>
        <Card title="Daily calorie history">
          <Async state={nutrition} empty={(d) => !d.days?.length} emptyText="No food logged in this period">
            {(n) => <BarsChart data={n.days} series={[{ key: 'calories', name: 'Calories' }]} unit="kcal" referenceY={n.calorie_target} referenceLabel="Target" />}
          </Async>
        </Card>
        <Card title="Protein consumption">
          <Async state={nutrition} empty={(d) => !d.days?.length} emptyText="No food logged in this period">
            {(n) => <TrendChart data={n.days} series={[{ key: 'protein', name: 'Protein', unit: 'g', color: '#38bdf8' }]} unit="g" referenceY={n.protein_target} referenceLabel="Target" />}
          </Async>
        </Card>
        <Card title="Workout consistency">
          <Async state={workouts} empty={(d) => !d.weekly?.length} emptyText="No workouts in this period">
            {(w) => (<><p className="mb-2 text-xs text-muted">Consistency: <b className="text-accent">{num(w.consistency_pct)}%</b> of weeks with your planned sessions</p><BarsChart data={w.weekly} xKey="label" xFormatter={(v) => v} series={[{ key: 'workouts', name: 'Workouts' }]} /></>)}
          </Async>
        </Card>
        <Card title="Muscle group training frequency">
          <Async state={workouts} empty={(d) => !d.muscle_frequency?.length} emptyText="No workouts in this period">
            {(w) => <BarsChart data={w.muscle_frequency.map((m) => ({ ...m, muscle_group: cap(m.muscle_group) }))} xKey="muscle_group" xFormatter={(v) => v} series={[{ key: 'count', name: 'Sessions', color: '#a78bfa' }]} />}
          </Async>
        </Card>
        <Card title="Exercise strength progress">
          <Async state={strength} empty={(d) => !d.length} emptyText="No strength data in this period">{(d) => <StrengthChart data={d} />}</Async>
        </Card>
      </div>

      <Card title="Personal record history" className="mt-4" pad={false}>
        <Async state={records} empty={(d) => !d.length} emptyText="No records yet">{(rows) => <RecordsTable rows={rows} />}</Async>
      </Card>
    </>
  );
}
