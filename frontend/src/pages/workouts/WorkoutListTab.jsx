import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, Plus, Trash2, Weight } from 'lucide-react';
import Card from '../../components/Card';
import Async from '../../components/Async';
import Modal from '../../components/Modal';
import { Field, FormError, Input, Select, Textarea } from '../../components/Field';
import useConfirm from '../../components/useConfirm';
import useFetch from '../../hooks/useFetch';
import { workoutsApi } from '../../services';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { MUSCLE_GROUPS, cap, fmtDate, fmtDuration, num, todayISO } from '../../utils/format';

const STATUS_STYLE = {
  planned: 'border-info/40 text-info',
  in_progress: 'border-warn/50 text-warn',
  completed: 'border-accent/40 text-accent',
};

function NewWorkoutModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', category: 'chest', workout_date: todayISO(), notes: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!form.name.trim()) return setError('Give the workout a name.');
    setBusy(true);
    try {
      onCreated(await workoutsApi.create({ ...form, name: form.name.trim(), notes: form.notes.trim() || null }));
    } catch (e) { setError(errorMessage(e)); setBusy(false); }
  };

  return (
    <Modal title="New workout" onClose={onClose} onSubmit={submit} busy={busy} submitText="Create & add exercises">
      <div className="space-y-4">
        <FormError message={error} />
        <Field label="Name"><Input required autoFocus maxLength={120} placeholder="e.g. Push Day A" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={MUSCLE_GROUPS.map((m) => ({ value: m, label: cap(m) }))} /></Field>
          <Field label="Date"><Input type="date" required value={form.workout_date} onChange={(e) => setForm({ ...form, workout_date: e.target.value })} /></Field>
        </div>
        <Field label="Notes"><Textarea maxLength={1000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" /></Field>
      </div>
    </Modal>
  );
}

export default function WorkoutListTab() {
  const toast = useToast();
  const navigate = useNavigate();
  const [confirm, dialog] = useConfirm();
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const workouts = useFetch(() => workoutsApi.list({ ...(category && { category }), ...(status && { status }) }), [category, status]);

  const remove = async (w) => {
    if (!(await confirm(`Delete "${w.name}" and all its sets?`))) return;
    try { await workoutsApi.remove(w.id); toast.success('Workout deleted'); workouts.reload(); } catch (e) { toast.error(errorMessage(e)); }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="w-44"><Select value={category} onChange={(e) => setCategory(e.target.value)} placeholder="All categories" options={MUSCLE_GROUPS.map((m) => ({ value: m, label: cap(m) }))} /></div>
          <div className="w-40"><Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Any status" options={[{ value: 'planned', label: 'Planned' }, { value: 'in_progress', label: 'In progress' }, { value: 'completed', label: 'Completed' }]} /></div>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New workout</button>
      </div>

      <Async state={workouts} empty={(d) => !d.length} emptyText="No workouts yet. Create your first one!">
        {(rows) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((w) => (
              <Card key={w.id} className="transition hover:border-accent/40">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/workouts/${w.id}`} className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold hover:text-accent">{w.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="badge border-line text-muted">{cap(w.category)}</span>
                      <span className={`badge ${STATUS_STYLE[w.status]}`}>{cap(w.status)}</span>
                    </div>
                  </Link>
                  <button className="icon-btn hover:text-danger" aria-label="Delete workout" onClick={() => remove(w)}><Trash2 className="h-4 w-4" /></button>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted">
                  <div><dt className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Date</dt><dd className="mt-0.5 text-sm font-semibold text-ink">{fmtDate(w.workout_date)}</dd></div>
                  <div><dt className="flex items-center gap-1"><Weight className="h-3.5 w-3.5" />Volume</dt><dd className="mt-0.5 text-sm font-semibold text-ink">{num(w.total_volume)} kg</dd></div>
                  <div><dt className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Time</dt><dd className="mt-0.5 text-sm font-semibold text-ink">{fmtDuration(w.duration_seconds)}</dd></div>
                </dl>
                <Link to={`/workouts/${w.id}`} className="btn-ghost btn-sm mt-4 w-full">{w.status === 'planned' ? 'Open & start' : w.status === 'in_progress' ? 'Continue' : 'View'}</Link>
              </Card>
            ))}
          </div>
        )}
      </Async>

      {creating && <NewWorkoutModal onClose={() => setCreating(false)} onCreated={(w) => { toast.success('Workout created'); navigate(`/workouts/${w.id}`); }} />}
      {dialog}
    </>
  );
}
