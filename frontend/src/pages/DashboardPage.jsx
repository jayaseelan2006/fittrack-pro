import { Link } from 'react-router-dom';
import { Beef, CalendarCheck, Droplet, Dumbbell, Flame, ListChecks, Scale, Target, Trophy, Wheat, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import Async, { Empty } from '../components/Async';
import TrendChart from '../charts/TrendChart';
import BarsChart from '../charts/BarsChart';
import StrengthChart from '../charts/StrengthChart';
import useFetch from '../hooks/useFetch';
import { dashboardApi } from '../services';
import { useAuth } from '../context/AuthContext';
import { cap, num, signed, toNum } from '../utils/format';

const kg = (v) => (v == null ? '–' : `${num(v, 1)} kg`);
const pct = (v, t) => (toNum(t) > 0 ? (toNum(v) / toNum(t)) * 100 : 0);

function Stats({ s }) {
  const w = s.today_workout;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <StatCard icon={Scale} label="Current Weight" value={kg(s.current_weight)} sub={s.weight_change != null ? `${signed(s.weight_change, 1, 'kg')} vs last entry` : 'No weight logged yet'} />
        <StatCard icon={Target} label="Target Weight" value={kg(s.target_weight)} sub={s.target_weight && s.current_weight != null ? `${num(Math.abs(toNum(s.target_weight) - toNum(s.current_weight)), 1)} kg to go` : <Link to="/weight" className="text-accent">Set a target</Link>} />
        <StatCard icon={TrendingUp} label="Weight Gained" value={s.weight_gained == null ? '–' : signed(s.weight_gained, 1, 'kg')} sub="since your first entry" />
        <StatCard icon={Flame} label="Calories Today" value={`${num(s.calories)} kcal`} sub={`of ${num(s.calorie_target)} kcal target`} progress={pct(s.calories, s.calorie_target)} />
        <StatCard icon={Beef} label="Protein Today" value={`${num(s.protein, 1)} g`} sub={`of ${num(s.protein_target)} g target`} progress={pct(s.protein, s.protein_target)} />
        <StatCard icon={Wheat} label="Carbohydrates" value={`${num(s.carbs, 1)} g`} sub="today" />
        <StatCard icon={Droplet} label="Fat Intake" value={`${num(s.fat, 1)} g`} sub="today" />
        <StatCard icon={Dumbbell} label="Today's Workout"
          value={w ? <Link to={`/workouts/${w.id}`} className="hover:text-accent">{w.name}</Link> : 'Rest day'}
          sub={w ? cap(w.status) : <Link to="/workouts" className="text-accent">Plan a workout</Link>} />
        <StatCard icon={CalendarCheck} label="This Week" value={`${num(s.weekly_workout_count)} workouts`} sub="completed since Monday" />
        <StatCard icon={ListChecks} label="Total Exercises" value={num(s.total_exercises)} sub="in your library" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Current Strength Records" action={<Link to="/progression" className="text-xs text-accent hover:underline">All records</Link>}>
          {s.strength_records?.length ? (
            <ul className="divide-y divide-line">
              {s.strength_records.map((r) => (
                <li key={r.exercise_id ?? r.exercise_name} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-warn" />{r.exercise_name}</span>
                  <span className="font-semibold">{kg(r.max_weight_kg)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty text="Finish a workout to set your first records" height="h-28" />}
        </Card>
        <Card title="Fitness Goal Progress" action={<Link to="/goals" className="text-xs text-accent hover:underline">Manage</Link>}>
          {s.goals?.length ? (
            <ul className="space-y-4">
              {s.goals.map((g) => (
                <li key={g.id}>
                  <div className="mb-1.5 flex justify-between text-sm"><span>{g.title}</span><span className="font-semibold text-accent">{num(g.progress_pct)}%</span></div>
                  <ProgressBar value={g.progress_pct} />
                </li>
              ))}
            </ul>
          ) : <Empty text="No active goals" height="h-28"><Link to="/goals" className="btn-ghost btn-sm">Set a goal</Link></Empty>}
        </Card>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const summary = useFetch(() => dashboardApi.summary());
  const weight = useFetch(() => dashboardApi.weightProgress());
  const nutrition = useFetch(() => dashboardApi.nutritionSummary());
  const workouts = useFetch(() => dashboardApi.workoutSummary());
  const strength = useFetch(() => dashboardApi.strengthProgress());

  const first = (user?.full_name || '').split(' ')[0];

  return (
    <>
      <PageHeader title={`Hey${first ? `, ${first}` : ''} 👋`} subtitle="Here's where you stand today" />
      <Async state={summary} height="h-40">{(s) => <Stats s={s} />}</Async>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Weight Progress">
          <Async state={weight} empty={(d) => !d.length} emptyText="Log your weight to see progress"><TrendChart data={weight.data || []} series={[{ key: 'weight_kg', name: 'Weight', unit: 'kg' }]} unit="kg" referenceY={summary.data?.target_weight} referenceLabel="Target" /></Async>
        </Card>
        <Card title="Calorie Intake (7 days)">
          <Async state={nutrition} empty={(d) => !d.length} emptyText="Log meals to see calories"><BarsChart data={nutrition.data || []} series={[{ key: 'calories', name: 'Calories' }]} unit="kcal" referenceY={summary.data?.calorie_target} referenceLabel="Target" /></Async>
        </Card>
        <Card title="Protein Progress (7 days)">
          <Async state={nutrition} empty={(d) => !d.length} emptyText="Log meals to see protein"><TrendChart data={nutrition.data || []} series={[{ key: 'protein', name: 'Protein', unit: 'g', color: '#38bdf8' }]} unit="g" referenceY={summary.data?.protein_target} referenceLabel="Target" /></Async>
        </Card>
        <Card title="Workout History">
          <Async state={workouts} empty={(d) => !d.length} emptyText="Complete workouts to build your history"><BarsChart data={workouts.data || []} xKey="label" xFormatter={(v) => v} series={[{ key: 'workouts', name: 'Workouts' }]} unit="" /></Async>
        </Card>
        <Card title="Strength Progress" className="lg:col-span-2">
          <Async state={strength} empty={(d) => !d.length} emptyText="Finish a workout to see strength progress">{(d) => <StrengthChart data={d} />}</Async>
        </Card>
      </div>
    </>
  );
}
