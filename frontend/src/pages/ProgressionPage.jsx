import { useState } from 'react';
import { ArrowDown, ArrowUp, Info, Minus, Trophy } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Async, { Empty } from '../components/Async';
import StatCard from '../components/StatCard';
import { Select } from '../components/Field';
import TrendChart from '../charts/TrendChart';
import useFetch from '../hooks/useFetch';
import { exercisesApi, progressionApi } from '../services';
import { cap, fmtDate, fmtDateLong, num, signed, toNum } from '../utils/format';

export const STATUS = {
  improved: { label: 'Improved', cls: 'border-accent/40 bg-accent/10 text-accent', Icon: ArrowUp },
  no_change: { label: 'No change', cls: 'border-warn/40 bg-warn/10 text-warn', Icon: Minus },
  decreased: { label: 'Decreased', cls: 'border-danger/40 bg-danger/10 text-danger', Icon: ArrowDown },
  first_session: { label: 'First session', cls: 'border-info/40 bg-info/10 text-info', Icon: Info },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.first_session;
  return <span className={`badge gap-1 ${s.cls}`}><s.Icon className="h-3 w-3" />{s.label}</span>;
}

const recordUnit = { max_weight: 'kg', max_reps: 'reps', max_volume: 'kg volume' };

export function RecordsTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead><tr><th>Exercise</th><th>Record</th><th className="text-right">Value</th><th className="text-right">Achieved</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.exercise_id}-${r.record_type}`}>
              <td className="font-medium"><Trophy className="mr-2 inline h-4 w-4 text-warn" />{r.exercise_name}</td>
              <td className="text-muted">{cap(r.record_type)}</td>
              <td className="text-right font-semibold">{num(r.value, 1)} <span className="text-xs font-normal text-muted">{recordUnit[r.record_type]}</span></td>
              <td className="text-right text-muted">{fmtDateLong(r.achieved_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Delta = ({ v, unit = '', digits = 1 }) => {
  const n = toNum(v);
  return <span className={n > 0 ? 'text-accent' : n < 0 ? 'text-danger' : 'text-muted'}>{signed(n, digits, unit)}</span>;
};

function ExerciseProgression({ exerciseId }) {
  const info = useFetch(() => progressionApi.get(exerciseId), [exerciseId]);
  const history = useFetch(() => progressionApi.history(exerciseId), [exerciseId]);
  const compare = useFetch(() => progressionApi.compare(exerciseId), [exerciseId]);

  return (
    <div className="space-y-4">
      <Async state={info} height="h-28">
        {(p) => (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="card p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted">Status</div>
                <div className="mt-3"><StatusBadge status={p.status} /></div>
                <div className="mt-2 text-xs text-muted">vs previous session</div>
              </div>
              <StatCard label="Weight change" value={<Delta v={p.weight_change} unit="kg" />} sub="max set weight" />
              <StatCard label="Rep change" value={<Delta v={p.rep_change} digits={0} />} sub="total reps" />
              <StatCard label="Strength progress" value={p.strength_progress_pct == null ? '–' : <Delta v={p.strength_progress_pct} unit="%" />} sub="since first session" />
            </div>
            {p.suggestion && (
              <div className="mt-4 flex gap-3 rounded-2xl border border-info/30 bg-info/5 p-4 text-sm">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" />
                <div>
                  <p className="font-semibold">Suggestion for next time</p>
                  <p className="mt-1 text-muted">{p.suggestion}</p>
                  <p className="mt-2 text-xs text-muted">This is only a guideline — your weights are never changed automatically. Increase gradually and keep good form.</p>
                </div>
              </div>
            )}
          </>
        )}
      </Async>

      <Card title="Previous vs current session" pad={false}>
        <Async state={compare} empty={(d) => !d.current} emptyText="Log at least one session to compare" height="h-32">
          {(c) => (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th /><th>Date</th><th className="text-right">Sets</th><th className="text-right">Reps</th><th className="text-right">Max kg</th><th className="text-right">Volume</th></tr></thead>
                <tbody>
                  {c.previous && (
                    <tr><td className="text-muted">Previous</td><td>{fmtDateLong(c.previous.date)}</td><td className="text-right">{c.previous.total_sets}</td><td className="text-right">{c.previous.total_reps}</td><td className="text-right">{num(c.previous.max_weight_kg, 1)}</td><td className="text-right">{num(c.previous.total_volume)}</td></tr>
                  )}
                  <tr className="bg-accent/5"><td className="font-semibold text-accent">Current</td><td>{fmtDateLong(c.current.date)}</td><td className="text-right">{c.current.total_sets}</td><td className="text-right">{c.current.total_reps}</td><td className="text-right">{num(c.current.max_weight_kg, 1)}</td><td className="text-right">{num(c.current.total_volume)}</td></tr>
                  {c.previous && (
                    <tr><td className="text-muted">Change</td><td /><td className="text-right"><Delta v={toNum(c.current.total_sets) - toNum(c.previous.total_sets)} digits={0} /></td><td className="text-right"><Delta v={c.rep_change ?? toNum(c.current.total_reps) - toNum(c.previous.total_reps)} digits={0} /></td><td className="text-right"><Delta v={c.weight_change} /></td><td className="text-right"><Delta v={c.volume_change} digits={0} /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Async>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Max weight over time"><Async state={history} empty={(d) => !d.length} emptyText="No sessions logged yet"><TrendChart data={history.data || []} series={[{ key: 'max_weight_kg', name: 'Max weight', unit: 'kg' }]} unit="kg" /></Async></Card>
        <Card title="Total volume per session"><Async state={history} empty={(d) => !d.length} emptyText="No sessions logged yet"><TrendChart data={history.data || []} series={[{ key: 'total_volume', name: 'Volume', unit: 'kg', color: '#38bdf8' }]} unit="kg" /></Async></Card>
      </div>

      <Card title="Exercise history" pad={false}>
        <Async state={history} empty={(d) => !d.length} emptyText="No sessions logged yet" height="h-32">
          {(rows) => (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Date</th><th className="text-right">Sets</th><th className="text-right">Reps</th><th className="text-right">Max kg</th><th className="text-right">Volume</th></tr></thead>
                <tbody>
                  {[...rows].reverse().map((r) => (
                    <tr key={r.date + r.total_volume}><td>{fmtDateLong(r.date)}</td><td className="text-right">{r.total_sets}</td><td className="text-right">{r.total_reps}</td><td className="text-right">{num(r.max_weight_kg, 1)}</td><td className="text-right font-semibold">{num(r.total_volume)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Async>
      </Card>
    </div>
  );
}

export default function ProgressionPage() {
  const exercises = useFetch(() => exercisesApi.list());
  const records = useFetch(() => progressionApi.personalRecords());
  const volume = useFetch(() => progressionApi.volumeHistory());
  const [exerciseId, setExerciseId] = useState('');

  return (
    <>
      <PageHeader title="Progressive Overload" subtitle="Compare sessions, track volume and beat your records" />

      <Card className="mb-4">
        <Async state={exercises} height="h-16">
          {(rows) => (
            <div className="max-w-md">
              <span className="label">Exercise</span>
              <Select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} placeholder="Choose an exercise…"
                options={[...rows].sort((a, b) => a.name.localeCompare(b.name)).map((x) => ({ value: x.id, label: `${x.name} (${cap(x.muscle_group)})` }))} />
            </div>
          )}
        </Async>
      </Card>

      {exerciseId ? <ExerciseProgression key={exerciseId} exerciseId={exerciseId} /> : <Card><Empty text="Select an exercise to see its progression" /></Card>}

      <h2 className="mb-3 mt-10 text-lg font-bold">All exercises</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Total training volume"><Async state={volume} empty={(d) => !d.length} emptyText="Finish a workout to build volume history"><TrendChart data={volume.data || []} series={[{ key: 'total_volume', name: 'Volume', unit: 'kg' }]} unit="kg" /></Async></Card>
        <Card title="Personal records" pad={false}><Async state={records} empty={(d) => !d.length} emptyText="No records yet — finish a workout!">{(rows) => <RecordsTable rows={rows} />}</Async></Card>
      </div>
    </>
  );
}
