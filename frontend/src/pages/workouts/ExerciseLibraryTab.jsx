import { useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Card from '../../components/Card';
import Async from '../../components/Async';
import Modal from '../../components/Modal';
import { Field, FormError, Input, Select } from '../../components/Field';
import useConfirm from '../../components/useConfirm';
import useFetch from '../../hooks/useFetch';
import { exercisesApi } from '../../services';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { EQUIPMENT, MUSCLE_GROUPS, cap } from '../../utils/format';

function ExerciseModal({ exercise, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: exercise?.name ?? '', muscle_group: exercise?.muscle_group ?? 'chest', equipment: exercise?.equipment ?? 'Barbell' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!form.name.trim()) return setError('Name is required.');
    setBusy(true);
    try {
      const body = { ...form, name: form.name.trim() };
      if (exercise) await exercisesApi.update(exercise.id, body); else await exercisesApi.create(body);
      toast.success('Exercise saved');
      onSaved();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <Modal title={exercise ? 'Edit exercise' : 'New exercise'} onClose={onClose} onSubmit={submit} busy={busy} size="sm">
      <div className="space-y-4">
        <FormError message={error} />
        <Field label="Name"><Input required autoFocus maxLength={150} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Muscle group"><Select value={form.muscle_group} onChange={(e) => setForm({ ...form, muscle_group: e.target.value })} options={MUSCLE_GROUPS.map((m) => ({ value: m, label: cap(m) }))} /></Field>
        <Field label="Equipment"><Select value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} options={EQUIPMENT} /></Field>
      </div>
    </Modal>
  );
}

export default function ExerciseLibraryTab() {
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const [group, setGroup] = useState('');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const exercises = useFetch(() => exercisesApi.list(group ? { muscle_group: group } : undefined), [group]);

  const remove = async (ex) => {
    if (!(await confirm(`Delete "${ex.name}"? Exercises that are used in workouts can't be deleted.`))) return;
    try { await exercisesApi.remove(ex.id); toast.success('Exercise deleted'); exercises.reload(); } catch (e) { toast.error(errorMessage(e)); }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search exercises…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="sm:w-48"><Select value={group} onChange={(e) => setGroup(e.target.value)} placeholder="All muscle groups" options={MUSCLE_GROUPS.map((m) => ({ value: m, label: cap(m) }))} /></div>
        <button className="btn-primary" onClick={() => setModal({})}><Plus className="h-4 w-4" /> New exercise</button>
      </div>
      <Card pad={false}>
        <Async state={exercises} empty={(d) => !d.length} emptyText="No exercises found">
          {(rows) => {
            const shown = rows.filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase()));
            return shown.length === 0 ? <p className="p-8 text-center text-sm text-muted">No exercises match “{q}”.</p> : (
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Exercise</th><th>Muscle group</th><th>Equipment</th><th /></tr></thead>
                  <tbody>
                    {shown.map((r) => (
                      <tr key={r.id}>
                        <td className="font-medium">{r.name} {r.is_custom && <span className="badge ml-1 border-accent/40 text-accent">Custom</span>}</td>
                        <td><span className="badge border-line text-muted">{cap(r.muscle_group)}</span></td>
                        <td className="text-muted">{r.equipment}</td>
                        <td className="whitespace-nowrap text-right">
                          {r.is_custom && (
                            <>
                              <button className="icon-btn" aria-label="Edit" onClick={() => setModal({ exercise: r })}><Pencil className="h-4 w-4" /></button>
                              <button className="icon-btn hover:text-danger" aria-label="Delete" onClick={() => remove(r)}><Trash2 className="h-4 w-4" /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }}
        </Async>
      </Card>
      {modal && <ExerciseModal exercise={modal.exercise} onClose={() => setModal(null)} onSaved={() => { setModal(null); exercises.reload(); }} />}
      {dialog}
    </>
  );
}
