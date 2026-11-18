import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Flag, Loader2, Play, Plus, Save, Timer, Trash2, X } from 'lucide-react';
import Card from '../../components/Card';
import Async from '../../components/Async';
import { Field, Input, Textarea } from '../../components/Field';
import useConfirm from '../../components/useConfirm';
import ExercisePicker from './ExercisePicker';
import useFetch from '../../hooks/useFetch';
import { progressionApi, workoutsApi } from '../../services';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { cap, fmtClock, fmtDate, num, parseServerDate, toNum, uid } from '../../utils/format';

const STATUS_STYLE = { planned: 'border-info/40 text-info', in_progress: 'border-warn/50 text-warn', completed: 'border-accent/40 text-accent' };

const toDraft = (w) => ({
  name: w.name, category: w.category, workout_date: w.workout_date, notes: w.notes || '',
  status: w.status, started_at: w.started_at,
  exercises: (w.exercises || []).map((e) => ({
    key: uid(), exercise_id: e.exercise_id, exercise_name: e.exercise_name, muscle_group: e.muscle_group, equipment: e.equipment,
    notes: e.notes || '',
    sets: (e.sets || []).map((s) => ({ key: uid(), reps: s.reps, weight_kg: s.weight_kg, rest_seconds: s.rest_seconds ?? '', is_completed: !!s.is_completed })),
  })),
});

/** Validates the draft and builds the PUT body. Throws Error with a readable message. */
function buildPayload(d, status) {
  if (!d.name.trim()) throw new Error('The workout needs a name.');
  return {
    name: d.name.trim(), category: d.category, workout_date: d.workout_date, notes: d.notes.trim() || null, status,
    exercises: d.exercises.map((e) => ({
      exercise_id: e.exercise_id, notes: e.notes.trim() || null,
      sets: e.sets.map((s, i) => {
        const reps = Number(s.reps); const w = Number(s.weight_kg);
        if (!Number.isInteger(reps) || reps < 1 || reps > 200) throw new Error(`${e.exercise_name}, set ${i + 1}: reps must be a whole number from 1 to 200.`);
        if (!(w >= 0 && w <= 1000)) throw new Error(`${e.exercise_name}, set ${i + 1}: weight must be between 0 and 1000 kg.`);
        const rest = s.rest_seconds === '' ? null : Number(s.rest_seconds);
        if (rest != null && !(Number.isInteger(rest) && rest >= 0 && rest <= 3600)) throw new Error(`${e.exercise_name}, set ${i + 1}: rest must be 0–3600 seconds.`);
        return { set_number: i + 1, reps, weight_kg: w, rest_seconds: rest, is_completed: s.is_completed };
      }),
    })),
  };
}

const exVolume = (e) => e.sets.reduce((a, s) => a + toNum(s.reps) * toNum(s.weight_kg), 0);

function useElapsed(startedAt, active) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  const start = parseServerDate(startedAt);
  return active && start ? Math.max(0, Math.floor((now - start.getTime()) / 1000)) : 0;
}

function LastSession({ exerciseId, beforeDate }) {
  const h = useFetch(() => progressionApi.history(exerciseId), [exerciseId]);
  if (h.loading && !h.data) return <span className="text-xs text-muted">Loading history…</span>;
  const prev = (h.data || []).filter((x) => x.date.slice(0, 10) < beforeDate).slice(-1)[0];
  if (!prev) return <span className="text-xs text-muted">No previous session</span>;
  return <span className="text-xs text-muted">Last ({fmtDate(prev.date)}): {num(prev.max_weight_kg, 1)} kg · {prev.total_sets} sets · {prev.total_reps} reps · vol {num(prev.total_volume)}</span>;
}

function Editor({ workout, reload }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const [d, setD] = useState(() => toDraft(workout));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState('');
  const [picker, setPicker] = useState(false);

  const elapsed = useElapsed(workout.started_at, workout.status === 'in_progress');
  const edit = (fn) => { setD((cur) => fn(cur)); setDirty(true); };
  const patchEx = (key, patch) => edit((c) => ({ ...c, exercises: c.exercises.map((e) => (e.key === key ? { ...e, ...patch } : e)) }));
  const patchSet = (ek, sk, patch) => edit((c) => ({ ...c, exercises: c.exercises.map((e) => (e.key !== ek ? e : { ...e, sets: e.sets.map((s) => (s.key === sk ? { ...s, ...patch } : s)) })) }));

  const addExercise = (ex) => {
    edit((c) => ({ ...c, exercises: [...c.exercises, { key: uid(), exercise_id: ex.id, exercise_name: ex.name, muscle_group: ex.muscle_group, equipment: ex.equipment, notes: '', sets: [{ key: uid(), reps: 10, weight_kg: 0, rest_seconds: 60, is_completed: false }] }] }));
    setPicker(false);
  };
  // New sets copy the previous set's values. Weight is never auto-increased.
  const addSet = (ek) => edit((c) => ({ ...c, exercises: c.exercises.map((e) => {
    if (e.key !== ek) return e;
    const last = e.sets[e.sets.length - 1];
    return { ...e, sets: [...e.sets, { key: uid(), reps: last?.reps ?? 10, weight_kg: last?.weight_kg ?? 0, rest_seconds: last?.rest_seconds ?? 60, is_completed: false }] };
  }) }));
  const removeSet = (ek, sk) => edit((c) => ({ ...c, exercises: c.exercises.map((e) => (e.key === ek ? { ...e, sets: e.sets.filter((s) => s.key !== sk) } : e)) }));
  const removeExercise = async (e) => {
    if (!(await confirm({ message: `Remove ${e.exercise_name} from this workout?`, confirmText: 'Remove' }))) return;
    edit((c) => ({ ...c, exercises: c.exercises.filter((x) => x.key !== e.key) }));
  };

  const persist = async (status) => {
    const body = buildPayload(d, status);
    await workoutsApi.update(workout.id, body);
  };

  const run = async (label, fn) => {
    setBusy(label);
    try { await fn(); } catch (e) { toast.error(e instanceof Error && !e.response ? e.message : errorMessage(e)); } finally { setBusy(''); }
  };

  const save = () => run('save', async () => { await persist(d.status); toast.success('Workout saved'); setDirty(false); reload(); });
  const start = () => run('start', async () => { await persist('in_progress'); toast.success('Workout started — good luck!'); setDirty(false); reload(); });
  const finish = () => run('finish', async () => {
    if (!d.exercises.some((e) => e.sets.length)) throw new Error('Add at least one exercise with a set before finishing.');
    if (!(await confirm({ title: 'Finish workout?', message: 'Your sets will be logged to your progression history.', confirmText: 'Finish workout', danger: false }))) return;
    await persist('in_progress');
    const res = await workoutsApi.finish(workout.id);
    (res?.new_personal_records || []).forEach((r) => toast.success(`🏆 New PR: ${r.exercise_name} – ${r.record_type.replace('_', ' ')} ${num(r.value, 1)}`));
    toast.success('Workout finished 💪');
    setDirty(false); reload();
  });

  const totalVolume = d.exercises.reduce((a, e) => a + exVolume(e), 0);
  const totalSets = d.exercises.reduce((a, e) => a + e.sets.length, 0);

  return (
    <>
      <Link to="/workouts" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> All workouts</Link>

      <Card className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <input className="w-full bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-muted" maxLength={120} value={d.name} onChange={(e) => edit((c) => ({ ...c, name: e.target.value }))} aria-label="Workout name" />
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="badge border-line text-muted">{cap(d.category)}</span>
              <span className={`badge ${STATUS_STYLE[workout.status]}`}>{cap(workout.status)}</span>
              <span className="text-muted">{fmtDate(d.workout_date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex gap-6 text-right">
            {workout.status === 'in_progress' && <div><div className="flex items-center justify-end gap-1 text-xs uppercase text-muted"><Timer className="h-3.5 w-3.5" />Elapsed</div><div className="font-mono text-2xl font-bold text-warn">{fmtClock(elapsed)}</div></div>}
            <div><div className="text-xs uppercase text-muted">Sets</div><div className="text-2xl font-bold">{totalSets}</div></div>
            <div><div className="text-xs uppercase text-muted">Volume</div><div className="text-2xl font-bold text-accent">{num(totalVolume)}<span className="ml-1 text-xs font-medium text-muted">kg</span></div></div>
          </div>
        </div>
        <Field label="Notes" className="mt-4"><Textarea rows={2} maxLength={1000} value={d.notes} onChange={(e) => edit((c) => ({ ...c, notes: e.target.value }))} placeholder="How are you feeling? Any cues for next time?" /></Field>
      </Card>

      <div className="space-y-4">
        {d.exercises.length === 0 && <Card><p className="py-8 text-center text-sm text-muted">No exercises yet. Add your first exercise to build the workout.</p></Card>}

        {d.exercises.map((e) => (
          <Card key={e.key} pad={false}>
            <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-4">
              <div className="min-w-0">
                <h3 className="font-semibold">{e.exercise_name}</h3>
                <p className="text-xs text-muted">{cap(e.muscle_group)} · {e.equipment}</p>
                <div className="mt-1"><LastSession exerciseId={e.exercise_id} beforeDate={d.workout_date} /></div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="mr-2 text-xs text-muted">Vol <b className="text-ink">{num(exVolume(e))}</b></span>
                <button className="icon-btn hover:text-danger" aria-label="Remove exercise" onClick={() => removeExercise(e)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="overflow-x-auto px-3">
              <table className="tbl">
                <thead><tr><th className="w-12">Set</th><th>Weight (kg)</th><th>Reps</th><th>Rest (s)</th><th className="text-center">Done</th><th /></tr></thead>
                <tbody>
                  {e.sets.map((s, i) => (
                    <tr key={s.key} className={s.is_completed ? 'bg-accent/5' : ''}>
                      <td className="font-semibold text-muted">{i + 1}</td>
                      <td><Input className="input !w-24 !py-1.5" type="number" step="0.25" min="0" max="1000" value={s.weight_kg} onChange={(ev) => patchSet(e.key, s.key, { weight_kg: ev.target.value })} aria-label={`Set ${i + 1} weight`} /></td>
                      <td><Input className="input !w-20 !py-1.5" type="number" step="1" min="1" max="200" value={s.reps} onChange={(ev) => patchSet(e.key, s.key, { reps: ev.target.value })} aria-label={`Set ${i + 1} reps`} /></td>
                      <td><Input className="input !w-20 !py-1.5" type="number" step="5" min="0" max="3600" value={s.rest_seconds} onChange={(ev) => patchSet(e.key, s.key, { rest_seconds: ev.target.value })} aria-label={`Set ${i + 1} rest`} /></td>
                      <td className="text-center">
                        <button type="button" onClick={() => patchSet(e.key, s.key, { is_completed: !s.is_completed })} aria-pressed={s.is_completed} aria-label="Mark set done"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${s.is_completed ? 'border-accent bg-accent text-accent-ink' : 'border-line text-muted hover:border-accent'}`}><Check className="h-4 w-4" /></button>
                      </td>
                      <td><button className="icon-btn hover:text-danger" aria-label="Remove set" onClick={() => removeSet(e.key, s.key)}><X className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-3 px-5 pb-4 pt-2">
              <button className="btn-ghost btn-sm" onClick={() => addSet(e.key)}><Plus className="h-3.5 w-3.5" /> Add set</button>
              <input className="input !w-auto min-w-0 flex-1 !py-1.5 text-xs" placeholder="Exercise notes (optional)" maxLength={500} value={e.notes} onChange={(ev) => patchEx(e.key, { notes: ev.target.value })} />
            </div>
          </Card>
        ))}

        <button className="btn-ghost w-full border-dashed" onClick={() => setPicker(true)}><Plus className="h-4 w-4" /> Add exercise</button>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-line bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" disabled={!!busy || !dirty} onClick={save}>{busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
            {workout.status === 'planned' && <button className="btn-primary" disabled={!!busy} onClick={start}>{busy === 'start' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Start workout</button>}
            {workout.status === 'in_progress' && <button className="btn-primary" disabled={!!busy} onClick={finish}>{busy === 'finish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />} Finish workout</button>}
            {workout.status === 'completed' && <button className="btn-ghost" onClick={() => navigate('/progression')}>View progression</button>}
          </div>
        </div>
      </div>

      {picker && <ExercisePicker defaultGroup={d.category} excludeIds={d.exercises.map((e) => e.exercise_id)} onPick={addExercise} onClose={() => setPicker(false)} />}
      {dialog}
    </>
  );
}

export default function WorkoutSessionPage() {
  const { id } = useParams();
  const wk = useFetch(() => workoutsApi.get(id), [id]);
  return (
    <Async state={wk} height="h-64">
      {/* key forces a fresh draft whenever the server copy is reloaded */}
      {(w) => <Editor key={`${w.id}-${w.updated_at ?? ''}-${w.status}`} workout={w} reload={wk.reload} />}
    </Async>
  );
}
