import { useState } from 'react';
import { Check, Pencil, Plus, Trash2, Trophy, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Async, { Empty } from '../components/Async';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import { Field, FormError, Input, Select, Textarea } from '../components/Field';
import useConfirm from '../components/useConfirm';
import useFetch from '../hooks/useFetch';
import { dashboardApi, goalsApi } from '../services';
import { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cap, fmtDate, num, todayISO, toNum } from '../utils/format';

const TYPES = [
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'protein', label: 'Protein', unit: 'g' },
  { value: 'calories', label: 'Calories', unit: 'kcal' },
  { value: 'workout', label: 'Workouts', unit: 'workouts' },
];
const unitFor = (t) => TYPES.find((x) => x.value === t)?.unit || '';

function GoalModal({ goal, preset, onClose, onSaved }) {
  const toast = useToast();
  const init = goal || preset || {};
  const [form, setForm] = useState({
    goal_type: init.goal_type ?? 'weight', title: init.title ?? '', start_value: init.start_value ?? 0,
    current_value: init.current_value ?? 0, target_value: init.target_value ?? '',
    start_date: init.start_date ?? todayISO(), end_date: init.end_date ?? '', is_weekly_challenge: init.is_weekly_challenge ?? false, notes: init.notes ?? '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setError('');
    if (!form.title.trim()) return setError('Give the goal a title.');
    const target = Number(form.target_value);
    if (!(target > 0)) return setError('The target must be greater than 0.');
    if (Number(form.start_value) === target) return setError('Start value and target must be different.');
    if (form.end_date && form.end_date < form.start_date) return setError('The end date must be after the start date.');
    const body = {
      goal_type: form.goal_type, title: form.title.trim(), unit: unitFor(form.goal_type),
      start_value: Number(form.start_value) || 0, current_value: Number(form.current_value) || 0, target_value: target,
      start_date: form.start_date, end_date: form.end_date || null, is_weekly_challenge: form.is_weekly_challenge, notes: form.notes.trim() || null,
    };
    setBusy(true);
    try {
      if (goal) await goalsApi.update(goal.id, body); else await goalsApi.create(body);
      toast.success(goal ? 'Goal updated' : 'Goal created');
      onSaved();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <Modal title={goal ? 'Edit goal' : 'New goal'} onClose={onClose} onSubmit={submit} busy={busy}>
      <div className="space-y-4">
        <FormError message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type"><Select value={form.goal_type} onChange={set('goal_type')} options={TYPES.map((t) => ({ value: t.value, label: t.label }))} /></Field>
          <Field label="Title"><Input required maxLength={150} value={form.title} onChange={set('title')} placeholder="e.g. Reach 75 kg" /></Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label={`Start (${unitFor(form.goal_type)})`}><Input type="number" step="0.1" min="0" value={form.start_value} onChange={set('start_value')} /></Field>
          <Field label={`Current (${unitFor(form.goal_type)})`}><Input type="number" step="0.1" min="0" value={form.current_value} onChange={set('current_value')} /></Field>
          <Field label={`Target (${unitFor(form.goal_type)})`}><Input type="number" step="0.1" min="0" required value={form.target_value} onChange={set('target_value')} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date"><Input type="date" required value={form.start_date} onChange={set('start_date')} /></Field>
          <Field label="End date (optional)"><Input type="date" value={form.end_date} onChange={set('end_date')} /></Field>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={form.is_weekly_challenge} onChange={(e) => setForm({ ...form, is_weekly_challenge: e.target.checked })} /> This is a weekly challenge</label>
        <Field label="Notes"><Textarea rows={2} maxLength={500} value={form.notes} onChange={set('notes')} /></Field>
      </div>
    </Modal>
  );
}

function GoalCard({ g, onEdit, onStatus, onDelete }) {
  const done = g.status === 'completed';
  return (
    <Card className={g.status === 'cancelled' ? 'opacity-60' : ''}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold">{done && <Trophy className="h-4 w-4 text-warn" />}{g.title}</h3>
          <p className="mt-0.5 text-xs text-muted">{cap(g.goal_type)} · {fmtDate(g.start_date)}{g.end_date ? ` → ${fmtDate(g.end_date)}` : ''} · {cap(g.status)}</p>
        </div>
        <div className="flex shrink-0">
          <button className="icon-btn" aria-label="Edit goal" onClick={() => onEdit(g)}><Pencil className="h-4 w-4" /></button>
          <button className="icon-btn hover:text-danger" aria-label="Delete goal" onClick={() => onDelete(g)}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between text-sm">
        <span className="text-muted">{num(g.current_value, 1)} / {num(g.target_value, 1)} {g.unit}</span>
        <span className="text-xl font-bold text-accent">{num(g.progress_pct)}%</span>
      </div>
      <ProgressBar value={g.progress_pct} className="mt-2" />
      {g.status === 'active' && (
        <div className="mt-4 flex gap-2">
          <button className="btn-ghost btn-sm" onClick={() => onStatus(g, 'completed')}><Check className="h-3.5 w-3.5" /> Mark complete</button>
          <button className="btn-ghost btn-sm" onClick={() => onStatus(g, 'cancelled')}><X className="h-3.5 w-3.5" /> Cancel</button>
        </div>
      )}
    </Card>
  );
}

export default function GoalsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [confirm, dialog] = useConfirm();
  const goals = useFetch(() => goalsApi.list());
  const summary = useFetch(() => dashboardApi.summary());
  const [modal, setModal] = useState(null);

  const templates = [
    { label: '4 workouts this week', preset: { goal_type: 'workout', title: 'Complete 4 workouts this week', start_value: 0, target_value: 4, is_weekly_challenge: true, end_date: '' } },
    { label: 'Hit protein target', preset: { goal_type: 'protein', title: 'Hit my daily protein target', start_value: 0, target_value: user?.daily_protein_target || 150, is_weekly_challenge: true } },
    { label: 'Calorie target', preset: { goal_type: 'calories', title: 'Reach my daily calorie target', start_value: 0, target_value: user?.daily_calorie_target || 2500, is_weekly_challenge: true } },
  ];

  const setStatus = async (g, status) => {
    try { await goalsApi.update(g.id, { status }); toast.success(status === 'completed' ? 'Goal completed 🎉' : 'Goal cancelled'); goals.reload(); } catch (e) { toast.error(errorMessage(e)); }
  };
  const remove = async (g) => {
    if (!(await confirm(`Delete the goal "${g.title}"?`))) return;
    try { await goalsApi.remove(g.id); toast.success('Goal deleted'); goals.reload(); } catch (e) { toast.error(errorMessage(e)); }
  };

  const daily = summary.data && [
    { label: 'Calories', cur: toNum(summary.data.calories), tgt: toNum(summary.data.calorie_target), unit: 'kcal' },
    { label: 'Protein', cur: toNum(summary.data.protein), tgt: toNum(summary.data.protein_target), unit: 'g' },
    { label: 'Workout', cur: summary.data.today_workout?.status === 'completed' ? 1 : 0, tgt: 1, unit: '' },
  ];

  return (
    <>
      <PageHeader title="Goals & Challenges" subtitle="Set targets and watch your progress"
        actions={<button className="btn-primary" onClick={() => setModal({})}><Plus className="h-4 w-4" /> New goal</button>} />

      <Card title="Today's goal completion" className="mb-6">
        <Async state={summary} height="h-20">
          {() => (
            <div className="grid gap-5 sm:grid-cols-3">
              {daily.map((d) => {
                const pct = d.tgt ? Math.min(100, (d.cur / d.tgt) * 100) : 0;
                return (
                  <div key={d.label}>
                    <div className="mb-1.5 flex justify-between text-sm"><span>{d.label}</span><span className="font-semibold">{d.label === 'Workout' ? (d.cur ? 'Done ✓' : 'Not yet') : `${num(d.cur)} / ${num(d.tgt)} ${d.unit}`}</span></div>
                    <ProgressBar value={pct} tone={pct >= 100 ? 'accent' : 'info'} />
                  </div>
                );
              })}
            </div>
          )}
        </Async>
      </Card>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted">Quick challenges</span>
        {templates.map((t) => <button key={t.label} className="btn-ghost btn-sm" onClick={() => setModal({ preset: t.preset })}><Plus className="h-3 w-3" />{t.label}</button>)}
      </div>

      <Async state={goals} empty={(d) => !d.length} emptyText="No goals yet — create your first one">
        {(rows) => {
          const challenges = rows.filter((g) => g.is_weekly_challenge);
          const regular = rows.filter((g) => !g.is_weekly_challenge);
          const Section = ({ title, items }) => (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-bold">{title}</h2>
              {items.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((g) => <GoalCard key={g.id} g={g} onEdit={(x) => setModal({ goal: x })} onStatus={setStatus} onDelete={remove} />)}</div> : <Card><Empty text="Nothing here yet" height="h-20" /></Card>}
            </section>
          );
          return <><Section title="Weekly challenges" items={challenges} /><Section title="Goals" items={regular} /></>;
        }}
      </Async>

      {modal && <GoalModal goal={modal.goal} preset={modal.preset} onClose={() => setModal(null)} onSaved={() => { setModal(null); goals.reload(); summary.reload(); }} />}
      {dialog}
    </>
  );
}
