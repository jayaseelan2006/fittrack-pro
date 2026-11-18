import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Card from '../../components/Card';
import Async from '../../components/Async';
import Modal from '../../components/Modal';
import { Field, FormError, Input, Select } from '../../components/Field';
import useConfirm from '../../components/useConfirm';
import TrendChart from '../../charts/TrendChart';
import useFetch from '../../hooks/useFetch';
import { measurementsApi } from '../../services';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { fmtDateLong, num, todayISO } from '../../utils/format';

const FIELDS = [
  ['chest_cm', 'Chest'], ['waist_cm', 'Waist'], ['arms_cm', 'Arms'],
  ['shoulders_cm', 'Shoulders'], ['thighs_cm', 'Thighs'], ['hips_cm', 'Hips'],
];

function MeasurementModal({ entry, onClose, onSaved }) {
  const toast = useToast();
  const [date, setDate] = useState(entry?.measured_date ?? todayISO());
  const [vals, setVals] = useState(Object.fromEntries(FIELDS.map(([k]) => [k, entry?.[k] ?? ''])));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    const body = { measured_date: date };
    let any = false;
    for (const [k, label] of FIELDS) {
      if (vals[k] === '') { body[k] = null; continue; }
      const n = Number(vals[k]);
      if (!(n > 0 && n <= 300)) return setError(`${label} must be between 0 and 300 cm.`);
      body[k] = n; any = true;
    }
    if (!any) return setError('Enter at least one measurement.');
    setBusy(true);
    try {
      if (entry) await measurementsApi.update(entry.id, body); else await measurementsApi.create(body);
      toast.success('Measurements saved');
      onSaved();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <Modal title={entry ? 'Edit measurements' : 'Add measurements'} onClose={onClose} onSubmit={submit} busy={busy}>
      <div className="space-y-4">
        <FormError message={error} />
        <Field label="Date"><Input type="date" required max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {FIELDS.map(([k, label]) => (
            <Field key={k} label={`${label} (cm)`}><Input type="number" step="0.1" min="0" max="300" value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} /></Field>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function MeasurementsTab() {
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const list = useFetch(() => measurementsApi.list());
  const [metric, setMetric] = useState('chest_cm');
  const [modal, setModal] = useState(null);

  const remove = async (m) => {
    if (!(await confirm(`Delete the measurements from ${fmtDateLong(m.measured_date)}?`))) return;
    try { await measurementsApi.remove(m.id); toast.success('Deleted'); list.reload(); } catch (e) { toast.error(errorMessage(e)); }
  };

  return (
    <>
      <div className="mb-5 flex justify-end"><button className="btn-primary" onClick={() => setModal({})}><Plus className="h-4 w-4" /> Add measurements</button></div>
      <Async state={list} empty={(d) => !d.length} emptyText="No measurements yet — add your first set">
        {(rows) => {
          const sorted = [...rows].sort((a, b) => a.measured_date.localeCompare(b.measured_date));
          const label = FIELDS.find(([k]) => k === metric)[1];
          return (
            <>
              <Card title="Trend" action={<div className="w-36"><Select value={metric} onChange={(e) => setMetric(e.target.value)} options={FIELDS.map(([k, l]) => ({ value: k, label: l }))} /></div>}>
                <TrendChart data={sorted.filter((r) => r[metric] != null)} xKey="measured_date" series={[{ key: metric, name: label, unit: 'cm' }]} unit="cm" />
              </Card>
              <Card title="History" className="mt-4" pad={false}>
                <div className="overflow-x-auto">
                  <table className="tbl">
                    <thead><tr><th>Date</th>{FIELDS.map(([k, l]) => <th key={k} className="text-right">{l}</th>)}<th /></tr></thead>
                    <tbody>
                      {[...sorted].reverse().map((r) => (
                        <tr key={r.id}>
                          <td className="whitespace-nowrap font-medium">{fmtDateLong(r.measured_date)}</td>
                          {FIELDS.map(([k]) => <td key={k} className="text-right">{num(r[k], 1)}</td>)}
                          <td className="whitespace-nowrap text-right">
                            <button className="icon-btn" aria-label="Edit" onClick={() => setModal({ entry: r })}><Pencil className="h-4 w-4" /></button>
                            <button className="icon-btn hover:text-danger" aria-label="Delete" onClick={() => remove(r)}><Trash2 className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          );
        }}
      </Async>
      {modal && <MeasurementModal entry={modal.entry} onClose={() => setModal(null)} onSaved={() => { setModal(null); list.reload(); }} />}
      {dialog}
    </>
  );
}
