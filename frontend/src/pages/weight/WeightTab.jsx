import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, CalendarRange, Pencil, Plus, Scale, Target, Trash2, TrendingUp } from 'lucide-react';
import Card from '../../components/Card';
import Async from '../../components/Async';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import { Field, FormError, Input, Textarea } from '../../components/Field';
import useConfirm from '../../components/useConfirm';
import TrendChart from '../../charts/TrendChart';
import useFetch from '../../hooks/useFetch';
import { weightApi } from '../../services';
import { errorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { cap, fmtDateLong, num, signed, todayISO } from '../../utils/format';

function WeightModal({ entry, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ log_date: entry?.log_date ?? todayISO(), weight_kg: entry?.weight_kg ?? '', notes: entry?.notes ?? '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    const kg = Number(form.weight_kg);
    if (!(kg >= 20 && kg <= 400)) return setError('Enter a weight between 20 and 400 kg.');
    if (form.log_date > todayISO()) return setError('The date cannot be in the future.');
    setBusy(true);
    try {
      const body = { log_date: form.log_date, weight_kg: kg, notes: form.notes.trim() || null };
      if (entry) await weightApi.update(entry.id, body); else await weightApi.create(body);
      toast.success(entry ? 'Weight updated' : 'Weight saved');
      onSaved();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <Modal title={entry ? 'Edit weight entry' : 'Add weight'} onClose={onClose} onSubmit={submit} busy={busy} size="sm">
      <div className="space-y-4">
        <FormError message={error} />
        <Field label="Date"><Input type="date" required max={todayISO()} value={form.log_date} onChange={(e) => setForm({ ...form, log_date: e.target.value })} /></Field>
        <Field label="Weight (kg)"><Input type="number" step="0.1" min="20" max="400" required autoFocus value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></Field>
        <Field label="Notes"><Textarea maxLength={500} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" /></Field>
      </div>
    </Modal>
  );
}

function TargetEditor({ current, onSaved }) {
  const { saveProfile } = useAuth();
  const toast = useToast();
  const [val, setVal] = useState(current ?? '');
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const kg = Number(val);
    if (!(kg >= 20 && kg <= 400)) return toast.error('Target weight must be between 20 and 400 kg.');
    setBusy(true);
    try { await saveProfile({ target_weight_kg: kg }); toast.success('Target weight updated'); onSaved(); }
    catch (ex) { toast.error(errorMessage(ex)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="flex items-end gap-2">
      <Field label="Target weight (kg)" className="w-40"><Input type="number" step="0.1" min="20" max="400" value={val} onChange={(e) => setVal(e.target.value)} /></Field>
      <button className="btn-ghost" disabled={busy}>Set target</button>
    </form>
  );
}

export default function WeightTab() {
  const toast = useToast();
  const { user } = useAuth();
  const [confirm, dialog] = useConfirm();
  const progress = useFetch(() => weightApi.progress());
  const list = useFetch(() => weightApi.list());
  const [modal, setModal] = useState(null);

  const reload = () => { progress.reload(); list.reload(); };
  const remove = async (e) => {
    if (!(await confirm(`Delete the ${fmtDateLong(e.log_date)} entry (${num(e.weight_kg, 1)} kg)?`))) return;
    try { await weightApi.remove(e.id); toast.success('Entry deleted'); reload(); } catch (ex) { toast.error(errorMessage(ex)); }
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <TargetEditor key={user?.target_weight_kg} current={user?.target_weight_kg} onSaved={reload} />
        <button className="btn-primary" onClick={() => setModal({})}><Plus className="h-4 w-4" /> Add weight</button>
      </div>

      <Async state={progress} height="h-32">
        {(p) => (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatCard icon={Scale} label="Current" value={p.current_weight == null ? '–' : `${num(p.current_weight, 1)} kg`} />
              <StatCard icon={Target} label="Target" value={p.target_weight == null ? '–' : `${num(p.target_weight, 1)} kg`} />
              <StatCard icon={TrendingUp} label="Change" value={p.weight_change == null ? '–' : signed(p.weight_change, 1, 'kg')} sub="vs previous entry" />
              <StatCard icon={Activity} label="BMI" value={p.bmi == null ? '–' : num(p.bmi, 1)}
                sub={p.bmi == null ? <Link to="/settings" className="text-accent">Set your height</Link> : cap(p.bmi_category)} />
              <StatCard icon={CalendarRange} label="7-day avg" value={p.weekly_average == null ? '–' : `${num(p.weekly_average, 1)} kg`} />
              <StatCard icon={CalendarRange} label="30-day avg" value={p.monthly_average == null ? '–' : `${num(p.monthly_average, 1)} kg`} />
            </div>
            <Card title="Weight progression" className="mt-4">
              {p.points?.length
                ? <TrendChart data={p.points} series={[{ key: 'weight_kg', name: 'Weight', unit: 'kg' }]} unit="kg" referenceY={p.target_weight} referenceLabel="Target" />
                : <p className="py-10 text-center text-sm text-muted">Add your first weight entry to see the chart.</p>}
            </Card>
          </>
        )}
      </Async>

      <Card title="History" className="mt-4" pad={false}>
        <Async state={list} empty={(d) => !d.length} emptyText="No entries yet">
          {(rows) => (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Date</th><th className="text-right">Weight</th><th>Notes</th><th /></tr></thead>
                <tbody>
                  {[...rows].sort((a, b) => b.log_date.localeCompare(a.log_date)).map((r) => (
                    <tr key={r.id}>
                      <td className="font-medium">{fmtDateLong(r.log_date)}</td>
                      <td className="text-right font-semibold">{num(r.weight_kg, 1)} kg</td>
                      <td className="max-w-[16rem] truncate text-muted">{r.notes}</td>
                      <td className="whitespace-nowrap text-right">
                        <button className="icon-btn" aria-label="Edit" onClick={() => setModal({ entry: r })}><Pencil className="h-4 w-4" /></button>
                        <button className="icon-btn hover:text-danger" aria-label="Delete" onClick={() => remove(r)}><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Async>
      </Card>

      {modal && <WeightModal entry={modal.entry} onClose={() => setModal(null)} onSaved={() => { setModal(null); reload(); }} />}
      {dialog}
    </>
  );
}
